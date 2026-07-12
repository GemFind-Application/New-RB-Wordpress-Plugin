<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * [gemfindRB_ring_builder] shortcode and frontend asset enqueue.
 *
 * Version 2 (default) → React RB 2.0 in public/frontpublic/build/assets/
 * Version 1 (classic) → legacy React bundle in public/static/ (Shopify version-one parity)
 */
final class GEMFINDRB_Shortcode {

	public function register(): void {
		add_shortcode( 'gemfindRB_ring_builder', [ $this, 'render' ] );
		add_filter( 'the_content', [ $this, 'inject_mount_fallback' ], 99 );
		add_action( 'send_headers', [ $this, 'send_tryon_headers' ] );
		add_filter( 'woocommerce_coming_soon_exclude', [ $this, 'exclude_from_woocommerce_coming_soon' ] );
	}

	/** Whether the current request is a Ring Builder storefront URL (/ringbuilder/*). */
	public static function is_storefront_request(): bool {
		return self::request_path_is_canonical_ringbuilder();
	}

	/**
	 * WooCommerce "Coming soon" hides page content for guests but our scripts still load.
	 * Allow Ring Builder storefront URLs through so #gemfindrb-root is rendered.
	 */
	public function exclude_from_woocommerce_coming_soon( bool $is_excluded ): bool {
		if ( $is_excluded ) {
			return true;
		}
		return self::is_storefront_request();
	}

	private static bool $mount_output_done = false;

	/**
	 * Allow camera for Camweara try-on iframe on Ring Builder storefront pages.
	 */
	public function send_tryon_headers(): void {
		if ( is_admin() || ! self::is_storefront_request() ) {
			return;
		}
		if ( headers_sent() ) {
			return;
		}
		// Allow Camweara iframe camera access.
		header( 'Permissions-Policy: camera=(self "https://cdn.camweara.com"), microphone=(self "https://cdn.camweara.com")', true );
	}

	public function inject_mount_fallback( string $content ): string {
		static $applied = false;
		if ( $applied || is_admin() || ! self::is_storefront_request() || self::$mount_output_done ) {
			return $content;
		}
		if (
			str_contains( $content, 'id="GemFind"' )
			|| str_contains( $content, 'id="gemfindrb-root"' )
			|| str_contains( $content, 'id="ringbuilder-root"' )
		) {
			return $content;
		}
		$applied = true;
		return $content . $this->render( [] );
	}

	public function enqueue_assets(): void {
		global $post;
		$post_content = is_a( $post, 'WP_Post' ) ? (string) $post->post_content : '';
		$has_sc       = $post_content !== '' && has_shortcode( $post_content, 'gemfindRB_ring_builder' );
		if ( ! $has_sc && ! self::is_storefront_request() ) {
			return;
		}
		$this->do_enqueue( self::shortcode_version_override_from_post( $post_content ) );
	}

	public function render( array|string $atts ): string {
		if ( self::$mount_output_done ) {
			return '';
		}

		$atts = shortcode_atts( [ 'version' => '' ], is_array( $atts ) ? $atts : [] );

		global $post;
		$effective_version = (string) $atts['version'];
		if ( $effective_version === '' && is_a( $post, 'WP_Post' ) ) {
			$effective_version = self::shortcode_version_override_from_post( $post->post_content );
		}

		$this->do_enqueue( $effective_version );

		self::$mount_output_done = true;

		$shop     = gemfindRB_shop_key();
		$cfg      = GEMFINDRB_DB::get_config( $shop );
		$version  = $atts['version'] !== ''
			? (string) $atts['version']
			: ( is_object( $cfg ) ? (string) ( $cfg->tool_version ?? GEMFINDRB_Frontend_Version::DEFAULT ) : GEMFINDRB_Frontend_Version::DEFAULT );
		$use_v1   = GEMFINDRB_Frontend_Version::is_version_one( $effective_version, $cfg );
		$rest_url = esc_url( rest_url( 'gemfind-ring-builder/v1' ) );
		$nonce    = wp_create_nonce( 'wp_rest' );
		$basename = self::canonical_ringbuilder_basename();

		ob_start();
		?>
		<div class="gemfind-app-wrapper gemfind-ring-builder-scope<?php echo $use_v1 ? ' gemfind-app-wrapper--v1' : ''; ?>">
			<?php if ( $use_v1 ) : ?>
				<input type="hidden" id="shop_domain" value="<?php echo esc_attr( $shop ); ?>" />
			<?php endif; ?>
			<?php if ( ! $use_v1 ) : ?>
			<div id="GemFind" class="gemfind-ring-builder-scope">
			<?php endif; ?>
				<div id="<?php echo $use_v1 ? 'ringbuilder-root' : 'gemfindrb-root'; ?>"
					 class="gemfind-root"
					 data-shop="<?php echo esc_attr( $shop ); ?>"
					 data-version="<?php echo esc_attr( $version ); ?>"
					 data-rest-url="<?php echo esc_attr( $rest_url ); ?>"
					 data-nonce="<?php echo esc_attr( $nonce ); ?>"
					 data-router-basename="<?php echo esc_attr( $basename ); ?>"
				></div>
			<?php if ( ! $use_v1 ) : ?>
			</div>
			<?php endif; ?>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	public static function canonical_ringbuilder_basename(): string {
		$home_path = wp_parse_url( home_url(), PHP_URL_PATH );
		$prefix    = is_string( $home_path ) ? rtrim( $home_path, '/' ) : '';
		$tail      = '/ringbuilder';
		if ( $prefix === '' || $prefix === '/' ) {
			return $tail;
		}
		return $prefix . $tail;
	}

	public static function storefront_tool_url(): string {
		return trailingslashit( home_url( '/ringbuilder' ) );
	}

	private static function request_path_is_canonical_ringbuilder(): bool {
		$uri = isset( $_SERVER['REQUEST_URI'] )
			? sanitize_text_field( wp_unslash( (string) $_SERVER['REQUEST_URI'] ) )
			: '';
		$path = trim( (string) wp_parse_url( $uri, PHP_URL_PATH ), '/' );
		$home = trim( (string) ( wp_parse_url( home_url(), PHP_URL_PATH ) ?? '' ), '/' );
		if ( $home !== '' && $path !== '' && str_starts_with( $path, $home ) ) {
			$path = trim( substr( $path, strlen( $home ) ), '/' );
		}
		return $path === 'ringbuilder' || str_starts_with( $path, 'ringbuilder/' );
	}

	private static function shortcode_version_override_from_post( string $content ): string {
		if ( ! has_shortcode( $content, 'gemfindRB_ring_builder' ) ) {
			return '';
		}
		if ( preg_match( '/\[gemfindRB_ring_builder[^\]]*\bversion\s*=\s*["\']?([^"\'\s\]]+)/i', $content, $m ) ) {
			return trim( $m[1] );
		}
		return '';
	}

	private function do_enqueue( string $shortcode_version_attr = '' ): void {
		static $done = false;
		if ( $done ) {
			return;
		}
		$done = true;

		$shop      = gemfindRB_shop_key();
		$asset_ver = GEMFINDRB_VERSION . '.' . gemfindRB_get_asset_revision();
		$cfg       = GEMFINDRB_DB::get_config( $shop );
		$use_v1    = GEMFINDRB_Frontend_Version::is_version_one( $shortcode_version_attr, $cfg );

		$rest_base = rtrim( rest_url( 'gemfind-ring-builder/v1' ), '/' );
		$nonce     = wp_create_nonce( 'wp_rest' );

		$config = [
			'restUrl'        => $rest_base,
			'nonce'          => $nonce,
			'shop'           => $shop,
			'siteUrl'        => home_url(),
			'dealerId'       => is_object( $cfg ) ? (string) ( $cfg->dealerid ?? '' ) : '',
			'routerBasename' => self::canonical_ringbuilder_basename(),
			'jcProxyUrl'     => $rest_base . '/jcProxy',
			'imageBaseUrl'   => GEMFINDRB_URL . 'public/frontpublic/build',
			'shapeIconBaseUrl' => GEMFINDRB_URL . 'public/frontpublic/build',
			'tryOnOverrideCssUrl' => GEMFINDRB_URL . 'public/frontpublic/build/tryon-overrides.css',
			'formApiUrl'     => $rest_base,
			'jcApiUrl'       => $rest_base . '/jcProxy',
			'jcVideoUrl'     => $rest_base . '/jcVideoProxy',
			'shopExtension'  => '/ringbuilder',
			'toolVersion'    => is_object( $cfg ) ? (string) ( $cfg->tool_version ?? GEMFINDRB_Frontend_Version::DEFAULT ) : GEMFINDRB_Frontend_Version::DEFAULT,
		];

		$shopify_shaped = [
			'api_url'      => $rest_base,
			'jc_api_url'   => $rest_base . '/jcProxy',
			'jc_video_url' => $rest_base . '/jcVideoProxy',
			'form_api_url' => $rest_base,
		];

		$fetch_patch = "(function(){if(window.__gemfindrbFetchPatched||typeof window.fetch!=='function')return;window.__gemfindrbFetchPatched=true;var o=window.fetch.bind(window);function rw(u){var c=window.gemfindRBConfig||{};if(!u||!c.jcProxyUrl)return u;var p=c.jcProxyUrl.replace(/\\/$/,''),v=(c.jcVideoUrl||'').replace(/\\?$/,'').replace(/\\/$/,'');var m=u.match(/api\\.jewelcloud\\.com\\/api\\/RingBuilder\\/([A-Za-z]+)(\\?.*)?$/i);if(m)return p+'/'+m[1]+(m[2]||'');var vm=u.match(/api\\.jewelcloud\\.com\\/api\\/jewelry\\/GetVideoUrl(\\?.*)?$/i);if(vm&&v)return v+(vm[1]||'');return u;}window.fetch=function(i,n){n=n||{};var u=typeof i==='string'?i:(i&&i.url?i.url:'');var ru=rw(u);if(ru&&ru!==u){if(typeof i==='string')i=ru;else if(i instanceof Request)i=new Request(ru,i);else i=Object.assign({},i,{url:ru});u=ru;}var c=window.gemfindRBConfig||{},x=c.nonce||'';if(x&&u&&(u.indexOf('/wp-json/gemfind-ring-builder/v1')!==-1||(c.restUrl&&u.indexOf(c.restUrl)!==-1))){var h=new Headers(n.headers||(i instanceof Request?i.headers:undefined));if(!h.has('X-WP-Nonce'))h.set('X-WP-Nonce',x);n.headers=h;}return o(i,n);};})();";

		$xhr_nonce_patch = "(function(){if(window.__gemfindrbXhrPatched||typeof XMLHttpRequest==='undefined')return;window.__gemfindrbXhrPatched=true;var oOpen=XMLHttpRequest.prototype.open,oSet=XMLHttpRequest.prototype.setRequestHeader,oSend=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.open=function(m,u){this.__gfrbUrl=String(u||'');this.__gfrbHdrs={};return oOpen.apply(this,arguments);};XMLHttpRequest.prototype.setRequestHeader=function(n,v){this.__gfrbHdrs=Object.assign({},this.__gfrbHdrs);this.__gfrbHdrs[String(n).toLowerCase()]=true;return oSet.apply(this,arguments);};XMLHttpRequest.prototype.send=function(b){var u=this.__gfrbUrl||'',c=window.gemfindRBConfig||{},n=c.nonce||'';if(n&&(u.indexOf('/wp-json/gemfind-ring-builder/v1')!==-1||(c.restUrl&&u.indexOf(c.restUrl)!==-1))){if(!this.__gfrbHdrs||!this.__gfrbHdrs['x-wp-nonce'])oSet.call(this,'X-WP-Nonce',n);}return oSend.apply(this,arguments);};})();";

		$v1_toast_dedup_patch = "(function(){if(window.__gemfindrbToastDeduped)return;window.__gemfindrbToastDeduped=true;function pruneContainers(){var all=[].slice.call(document.querySelectorAll('.Toastify__toast-container'));if(all.length<2)return;var pref=all.filter(function(el){return el.className.indexOf('bottom-center')>=0;});var keep=pref.length?pref[pref.length-1]:all[all.length-1];all.forEach(function(el){if(el!==keep&&el.parentNode)el.parentNode.removeChild(el);});}function pruneToasts(){var all=[].slice.call(document.querySelectorAll('.Toastify__toast'));for(var i=1;i<all.length;i++){if(all[i].parentNode)all[i].parentNode.removeChild(all[i]);}}function run(){pruneContainers();pruneToasts();}run();if(document.body){try{new MutationObserver(run).observe(document.body,{childList:true,subtree:true});}catch(e){}}})();";

		$v1_mount_patch = "(function(){if(window.__gemfindrbV1MountPatched)return;window.__gemfindrbV1MountPatched=true;var rb=document.getElementById('ringbuilder-root');if(rb&&!document.getElementById('root')){var m=document.createElement('div');m.id='root';m.className='gemfind-v1-root';rb.appendChild(m);}window.__gemfindRbV1ApiBase=function(){var c=window.gemfindRBConfig||{};return c.restUrl?String(c.restUrl).replace(/\\/$/,''):'https://ringbuilderdev.gemfind.us/api/ringbuilder';};window.__gemfindRbV1JcBase=function(){var c=window.gemfindRBConfig||{};return c.jcProxyUrl?String(c.jcProxyUrl).replace(/\\/$/,''):'https://api.jewelcloud.com/api/RingBuilder';};window.__gemfindRbV1ShapeIcon=function(f){var c=window.gemfindRBConfig||{},b=String(c.shapeIconBaseUrl||c.imageBaseUrl||'').replace(/\\/$/,'');return b&&f?b+'/'+f:'';};window.__gemfindRbV1Asset=function(f){var c=window.gemfindRBConfig||{},b=String(c.imageBaseUrl||'').replace(/\\/$/,'');return b&&f?b+'/'+f:'';};})();";

		// Hide diamond spec rows whose value is empty or '-' (matches v2 hide-empty-spec behavior).
		$v1_empty_spec_patch = "(function(){if(window.__gemfindrbEmptySpecHidden)return;window.__gemfindrbEmptySpecHidden=true;var busy=false;function isEmpty(t){var s=(t||'').replace(/\\s+/g,' ').trim();return s===''||s==='-';}function run(){if(busy)return;busy=true;try{var lists=document.querySelectorAll('.diamond-spacification-list');for(var i=0;i<lists.length;i++){var items=lists[i].children;for(var j=0;j<items.length;j++){var li=items[j];if(!li||li.tagName!=='LI')continue;var info=li.querySelector('.diamonds-info');if(!info)continue;var want=isEmpty(info.textContent)?'none':'';if(li.style.display!==want)li.style.display=want;}}}finally{busy=false;}}run();if(document.body){try{new MutationObserver(run).observe(document.body,{childList:true,subtree:true,characterData:true});}catch(e){}}})();";

		if ( $use_v1 ) {
			$build_dir = GEMFINDRB_PATH . 'public/static/';
			$build_url = GEMFINDRB_URL . 'public/static/';
			$js_file   = $build_dir . 'js/frontend-v1.js';
			$css_file  = $build_dir . 'css/frontend-v1.css';

			if ( file_exists( $css_file ) ) {
				$ver = $asset_ver . '.' . (string) filemtime( $css_file );
				$v1_deps = [];
				$override_css = GEMFINDRB_PATH . 'assets/css/gemfindrb-wp-overrides.css';
				if ( is_readable( $override_css ) ) {
					wp_enqueue_style(
						'gemfindrb-wp-overrides-v1',
						GEMFINDRB_URL . 'assets/css/gemfindrb-wp-overrides.css',
						[],
						$asset_ver . '.' . (string) filemtime( $override_css )
					);
					$v1_deps[] = 'gemfindrb-wp-overrides-v1';
				}
				wp_enqueue_style( 'gemfindrb-frontend-v1', $build_url . 'css/frontend-v1.css', $v1_deps, $ver );
			}

			if ( file_exists( $js_file ) ) {
				$ver = $asset_ver . '.' . (string) filemtime( $js_file );
				$deps = [];
				$slider = $build_dir . 'js/nouislider.min.js';
				if ( file_exists( $slider ) ) {
					wp_enqueue_script( 'gemfindrb-nouislider', $build_url . 'js/nouislider.min.js', [], $asset_ver, true );
					$deps[] = 'gemfindrb-nouislider';
				}
				wp_enqueue_script( 'gemfindrb-frontend-v1', $build_url . 'js/frontend-v1.js', $deps, $ver, true );
				wp_localize_script( 'gemfindrb-frontend-v1', 'gemfindRBConfig', $config );
				wp_localize_script( 'gemfindrb-frontend-v1', 'gemfindRBShopify', $shopify_shaped );
				wp_add_inline_script( 'gemfindrb-frontend-v1', $v1_mount_patch, 'before' );
				wp_add_inline_script( 'gemfindrb-frontend-v1', $xhr_nonce_patch, 'before' );
				wp_add_inline_script( 'gemfindrb-frontend-v1', $fetch_patch, 'before' );
				wp_add_inline_script( 'gemfindrb-frontend-v1', $v1_toast_dedup_patch, 'after' );
				wp_add_inline_script( 'gemfindrb-frontend-v1', $v1_empty_spec_patch, 'after' );
			} else {
				add_action(
					'wp_footer',
					static function (): void {
						if ( current_user_can( 'manage_options' ) ) {
							echo '<!-- GemFind Ring Builder: frontend-v1.js missing. Copy the Version 1 bundle into public/static/js/frontend-v1.js -->';
						}
					},
					99
				);
			}
		} else {
			// Build outputs (aligned with GemFind Diamond Link layout):
			// - Version 2 → public/frontpublic/build/assets/
			$build_dir    = GEMFINDRB_PATH . 'public/frontpublic/build/assets/';
			$build_url    = GEMFINDRB_URL . 'public/frontpublic/build/assets/';
			$js_file      = $build_dir . 'frontend.js';
			$css_file     = $build_dir . 'frontend.css';
			$override_css = GEMFINDRB_PATH . 'assets/css/gemfindrb-wp-overrides.css';
			$ver          = file_exists( $js_file ) ? $asset_ver . '.' . (string) filemtime( $js_file ) : $asset_ver;

			if ( is_readable( $override_css ) ) {
				wp_enqueue_style(
					'gemfindrb-wp-overrides',
					GEMFINDRB_URL . 'assets/css/gemfindrb-wp-overrides.css',
					[],
					$asset_ver . '.' . (string) filemtime( $override_css )
				);
			}

			if ( file_exists( $css_file ) ) {
				$frontend_deps = is_readable( $override_css ) ? [ 'gemfindrb-wp-overrides' ] : [];
				wp_enqueue_style( 'gemfindrb-frontend', $build_url . 'frontend.css', $frontend_deps, $ver );
			}

			if ( file_exists( $js_file ) ) {
				wp_enqueue_script( 'gemfindrb-frontend', $build_url . 'frontend.js', [], $ver, true );
				wp_localize_script( 'gemfindrb-frontend', 'gemfindRBConfig', $config );
				wp_localize_script( 'gemfindrb-frontend', 'gemfindRBShopify', $shopify_shaped );
				wp_add_inline_script( 'gemfindrb-frontend', $fetch_patch, 'before' );
			} else {
				add_action(
					'wp_footer',
					static function (): void {
						if ( current_user_can( 'manage_options' ) ) {
							echo '<!-- GemFind Ring Builder: frontend bundle missing. Build React assets into public/frontpublic/build/assets/. -->';
						}
					},
					99
				);
			}
		}

		$dynamic_css = GEMFINDRB_CSS::get_dynamic_styles( $shop );
		if ( $dynamic_css !== '' ) {
			wp_register_style( 'gemfindrb-dynamic', false );
			wp_enqueue_style( 'gemfindrb-dynamic' );
			wp_add_inline_style( 'gemfindrb-dynamic', wp_strip_all_tags( $dynamic_css ) );
		}
	}
}
