<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * [gemfindRB_ring_builder] shortcode and frontend asset enqueue.
 *
 * Version 2 (default) → React RB 2.0 in public/frontpublic/build/assets/
 * Version 1 (classic) → React bundle in public/static/, built from src/rb-version-1-frontend/
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

	/**
	 * Only the main loop's content, and not a run-once guard: themes and plugins run the_content early
	 * (excerpts, widgets) and discard the result. A one-shot fallback spent itself on that early pass,
	 * which also made the real shortcode render return '' on every /ringbuilder/* URL.
	 */
	public function inject_mount_fallback( string $content ): string {
		if ( is_admin() || ! self::is_storefront_request() || ! in_the_loop() || ! is_main_query() ) {
			return $content;
		}
		if (
			str_contains( $content, 'id="GemFind"' )
			|| str_contains( $content, 'id="gemfindrb-root"' )
			|| str_contains( $content, 'id="ringbuilder-root"' )
		) {
			return $content;
		}
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

	/**
	 * Returns the mount on every call. A run-once guard here left the page empty whenever something
	 * rendered the content first and threw it away. The React entry mounts the first
	 * #ringbuilder-root / #gemfindrb-root, so a repeated render is harmless.
	 */
	public function render( array|string $atts ): string {
		$atts = shortcode_atts( [ 'version' => '' ], is_array( $atts ) ? $atts : [] );

		global $post;
		$effective_version = (string) $atts['version'];
		if ( $effective_version === '' && is_a( $post, 'WP_Post' ) ) {
			$effective_version = self::shortcode_version_override_from_post( $post->post_content );
		}

		$this->do_enqueue( $effective_version );

		$shop     = gemfindRB_shop_key();
		$cfg      = GEMFINDRB_DB::get_config( $shop );
		$version  = $atts['version'] !== ''
			? (string) $atts['version']
			: ( is_object( $cfg ) ? (string) ( $cfg->tool_version ?? GEMFINDRB_Frontend_Version::DEFAULT ) : GEMFINDRB_Frontend_Version::DEFAULT );
		$use_v1   = GEMFINDRB_Frontend_Version::is_version_one( $effective_version, $cfg );
		$rest_url = esc_url( rest_url( 'gemfind-ring-builder/v1' ) );
		$nonce    = wp_create_nonce( 'wp_rest' );
		$basename = self::canonical_ringbuilder_basename();

		$root_id = $use_v1 ? 'ringbuilder-root' : 'gemfindrb-root';
		ob_start();
		echo '<div class="gemfind-app-wrapper gemfind-ring-builder-scope' . ( $use_v1 ? ' gemfind-app-wrapper--v1' : '' ) . '">';
		if ( $use_v1 ) {
			echo '<input type="hidden" id="shop_domain" value="' . esc_attr( $shop ) . '" />';
		} else {
			echo '<div id="GemFind" class="gemfind-ring-builder-scope">';
		}
		echo '<div id="' . esc_attr( $root_id ) . '" class="gemfind-root"';
		echo ' data-shop="' . esc_attr( $shop ) . '"';
		echo ' data-version="' . esc_attr( $version ) . '"';
		echo ' data-rest-url="' . esc_attr( $rest_url ) . '"';
		echo ' data-nonce="' . esc_attr( $nonce ) . '"';
		echo ' data-router-basename="' . esc_attr( $basename ) . '"></div>';
		if ( $use_v1 ) {
			$show_powered = is_object( $cfg ) && ( (string) ( $cfg->show_powered_by ?? '0' ) === '1' || (int) ( $cfg->show_powered_by ?? 0 ) === 1 );
			if ( $show_powered ) {
				// V1 only unhides #gemfind_diamondtool_powered_by — markup/classes must match the classic CRA shell
				// (gf-powered_by + inline right alignment). Wrong class left bare left-aligned text above the theme footer.
				echo '<div class="gf-tool-container gemfind-powered-by-wrap">';
				echo '<span id="gemfind_diamondtool_powered_by" class="gf-powered_by gemfind-powered-by"'
					. ' style="text-align:right;display:none;margin-right:7%;margin-bottom:15px;color:#000;">';
				echo '<a href="' . esc_url( 'https://gemfind.com/' ) . '" target="_blank" rel="nofollow noopener noreferrer"'
					. ' style="color:inherit;text-decoration:none;font-family:Lato,sans-serif;">';
				echo esc_html__( 'Powered by GemFind', 'gemfind-ring-builder' );
				echo '</a></span></div>';
			}
		} else {
			echo '</div>';
		}
		echo '</div>';
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
			// v1: webpack public path for bundled images (public/static/media/) and the WooCommerce cart page.
			'v1AssetUrl'     => GEMFINDRB_URL . 'public/static/',
			'cartUrl'        => function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : '',
			'toolVersion'    => is_object( $cfg ) ? (string) ( $cfg->tool_version ?? GEMFINDRB_Frontend_Version::DEFAULT ) : GEMFINDRB_Frontend_Version::DEFAULT,
		];

		$shopify_shaped = [
			'api_url'      => $rest_base,
			'jc_api_url'   => $rest_base . '/jcProxy',
			'jc_video_url' => $rest_base . '/jcVideoProxy',
			'form_api_url' => $rest_base,
		];

		if ( $use_v1 ) {
			$build_dir = GEMFINDRB_PATH . 'public/static/';
			$build_url = GEMFINDRB_URL . 'public/static/';
			$js_file   = $build_dir . 'js/frontend-v1.js';
			$css_file  = $build_dir . 'css/frontend-v1.css';

			if ( file_exists( $css_file ) ) {
				$ver = $asset_ver . '.' . (string) filemtime( $css_file );
				$v1_deps = [];
				self::enqueue_google_font(
					'gemfindrb-font-lato',
					'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap',
					$asset_ver
				);
				$v1_deps[] = 'gemfindrb-font-lato';
				if ( self::enqueue_v1_fontawesome( $asset_ver ) ) {
					$v1_deps[] = 'gemfindrb-fontawesome-v1';
				}
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
				if ( in_array( 'gemfindrb-fontawesome-v1', $v1_deps, true ) ) {
					wp_add_inline_style(
						'gemfindrb-frontend-v1',
						'#root .fa,#root .fas,#root .far,#root .fal,#root [class*="fa-"],#ringbuilder-root .fa,#ringbuilder-root .fas,#ringbuilder-root .far,#ringbuilder-root .fal,#ringbuilder-root [class*="fa-"]{font-family:"Font Awesome 5 Free"!important;font-style:normal}#root .fab,#ringbuilder-root .fab{font-family:"Font Awesome 5 Brands"!important;font-weight:400!important}#root .fas,#root .fa,#root .table-sort::before,#root .table-sort::after,#ringbuilder-root .fas,#ringbuilder-root .fa{font-weight:900!important}#root .far,#ringbuilder-root .far{font-weight:400!important}'
					);
				}
			}

			if ( file_exists( $js_file ) ) {
				$ver = $asset_ver . '.' . (string) filemtime( $js_file );
				wp_enqueue_script( 'gemfindrb-frontend-v1', $build_url . 'js/frontend-v1.js', [], $ver, true );
				wp_localize_script( 'gemfindrb-frontend-v1', 'gemfindRBConfig', $config );
				wp_localize_script( 'gemfindrb-frontend-v1', 'gemfindRBShopify', $shopify_shaped );
			} else {
				add_action(
					'wp_footer',
					static function (): void {
						if ( current_user_can( 'manage_options' ) ) {
							echo '<!-- GemFind Ring Builder: frontend-v1.js missing. Run npm run build:v1 (src/rb-version-1-frontend). -->';
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

			self::enqueue_v2_google_fonts( $asset_ver );
			$frontend_deps = [
				'gemfindrb-font-manrope',
				'gemfindrb-font-libre-baskerville',
				'gemfindrb-font-inter',
			];

			if ( is_readable( $override_css ) ) {
				wp_enqueue_style(
					'gemfindrb-wp-overrides',
					GEMFINDRB_URL . 'assets/css/gemfindrb-wp-overrides.css',
					[],
					$asset_ver . '.' . (string) filemtime( $override_css )
				);
				$frontend_deps[] = 'gemfindrb-wp-overrides';
			}

			if ( file_exists( $css_file ) ) {
				wp_enqueue_style( 'gemfindrb-frontend', $build_url . 'frontend.css', $frontend_deps, $ver );
			}

			if ( file_exists( $js_file ) ) {
				wp_enqueue_script( 'gemfindrb-frontend', $build_url . 'frontend.js', [], $ver, true );
				wp_localize_script( 'gemfindrb-frontend', 'gemfindRBConfig', $config );
				wp_localize_script( 'gemfindrb-frontend', 'gemfindRBShopify', $shopify_shaped );
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
			wp_register_style( 'gemfindrb-dynamic', false, [], GEMFINDRB_VERSION );
			wp_enqueue_style( 'gemfindrb-dynamic' );
			wp_add_inline_style( 'gemfindrb-dynamic', wp_strip_all_tags( $dynamic_css ) );
		}
	}

	/**
	 * Google Fonts stylesheet (Guideline 10 exception: GPL-compatible webfont CDNs).
	 */
	private static function enqueue_google_font( string $handle, string $url, string $asset_ver ): void {
		wp_enqueue_style( $handle, $url, [], $asset_ver );
	}

	/**
	 * Default v2 storefront families previously imported from CSS.
	 */
	private static function enqueue_v2_google_fonts( string $asset_ver ): void {
		self::enqueue_google_font(
			'gemfindrb-font-manrope',
			'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap',
			$asset_ver
		);
		self::enqueue_google_font(
			'gemfindrb-font-libre-baskerville',
			'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&display=swap',
			$asset_ver
		);
		self::enqueue_google_font(
			'gemfindrb-font-inter',
			'https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap',
			$asset_ver
		);
	}

	/**
	 * Bundled Font Awesome for classic v1 (no CDN).
	 */
	private static function enqueue_v1_fontawesome( string $asset_ver ): bool {
		$css = GEMFINDRB_PATH . 'assets/vendor/fontawesome/all.min.css';
		if ( ! is_readable( $css ) ) {
			return false;
		}

		wp_enqueue_style(
			'gemfindrb-fontawesome-v1',
			GEMFINDRB_URL . 'assets/vendor/fontawesome/all.min.css',
			[],
			$asset_ver . '.' . (string) filemtime( $css )
		);
		return true;
	}
}
