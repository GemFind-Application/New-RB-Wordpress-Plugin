<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WordPress admin menu + React bundle (Diamond Link–aligned UI).
 */
final class GEMFINDRB_Admin {

	private const MENU_SLUG      = 'ringbuilder-settings';
	private const CAPABILITY     = 'manage_options';
	private const ADMIN_HANDLE   = 'gemfindrb-admin';

	public function add_menu_pages(): void {
		add_menu_page(
			__( 'GemFind Ring Builder', 'gemfind-ring-builder' ),
			__( 'GemFind Ring Builder', 'gemfind-ring-builder' ),
			self::CAPABILITY,
			self::MENU_SLUG,
			[ $this, 'render_settings_page' ],
			'dashicons-admin-generic',
			59
		);

		add_submenu_page(
			self::MENU_SLUG,
			__( 'Settings', 'gemfind-ring-builder' ),
			__( 'Settings', 'gemfind-ring-builder' ),
			self::CAPABILITY,
			self::MENU_SLUG,
			[ $this, 'render_settings_page' ]
		);

		add_submenu_page(
			self::MENU_SLUG,
			__( 'CSS Configurator', 'gemfind-ring-builder' ),
			__( 'CSS Configurator', 'gemfind-ring-builder' ),
			self::CAPABILITY,
			'ringbuilder-css',
			[ $this, 'render_css_page' ]
		);

		add_submenu_page(
			self::MENU_SLUG,
			__( 'About', 'gemfind-ring-builder' ),
			__( 'About', 'gemfind-ring-builder' ),
			self::CAPABILITY,
			'ringbuilder-about',
			[ $this, 'render_about_page' ]
		);
	}

	public function render_settings_page(): void {
		echo '<div id="gemfindrb-admin-root" class="gemfind-ring-builder-scope" data-page="settings"></div>';
	}

	public function render_css_page(): void {
		echo '<div id="gemfindrb-admin-root" class="gemfind-ring-builder-scope" data-page="css"></div>';
	}

	public function render_about_page(): void {
		$tool_url = GEMFINDRB_Shortcode::storefront_tool_url();
		$shop     = gemfindRB_shop_key();
		$cfg_row  = GEMFINDRB_DB::get_config( $shop );
		$fe_badge = self::format_frontend_experience_badge(
			is_object( $cfg_row ) ? (string) ( $cfg_row->tool_version ?? '2.0' ) : '2.0'
		);

		$logo_url = GEMFINDRB_URL . 'assets/images/wpdl/gemfind-diamondlink-logo.png';
		$mark_url = GEMFINDRB_URL . 'assets/images/wpdl2/gemfind-mark.svg';
		$help_url = 'https://gemfind.com/free-consultation/';
		?>
		<div class="wpdl2-admin-wrapper wpdl2-admin-wrapper--full">
			<header class="wpdl2-topbar" role="banner">
				<div class="wpdl2-topbar__inner">
					<div class="wpdl2-topbar__left">
						<img
							src="<?php echo esc_url( $logo_url ); ?>"
							alt="<?php echo esc_attr__( 'GemFind Ring Builder', 'gemfind-ring-builder' ); ?>"
							class="wpdl2-topbar__logo"
							width="1000"
							height="144"
							onerror="this.onerror=null;this.src='<?php echo esc_url( $mark_url ); ?>';this.className='wpdl2-topbar__logo wpdl2-topbar__logo--fallback';"
						/>
						<div class="wpdl2-topbar__brand">
							<div class="wpdl2-topbar__brandPrimary"><?php echo esc_html__( 'GEMFIND DIGITAL', 'gemfind-ring-builder' ); ?></div>
							<div class="wpdl2-topbar__brandSecondary"><?php echo esc_html__( 'SOLUTIONS', 'gemfind-ring-builder' ); ?></div>
						</div>
					</div>
					<div class="wpdl2-topbar__right">
						<?php echo esc_html__( 'GemFind Ring Builder', 'gemfind-ring-builder' ); ?>
					</div>
				</div>
			</header>

			<div class="wpdl2-about-shell">
				<?php self::render_view_frontend_banner_markup( $tool_url, $fe_badge ); ?>

				<div class="wpdl2-import-box" style="border-style: solid; background: #f8fafc; margin-bottom: 18px;">
					<p style="margin: 0; line-height: 1.55;">
						<?php
						echo wp_kses_post(
							__(
								'On install, the plugin creates a <strong>Ring Builder</strong> page (<code>/ringbuilder/</code>) with the <strong>GemFind Ring Builder (full width)</strong> template and the <code>[gemfindRB_ring_builder]</code> shortcode. Shoppers browse mountings at <code>/ringbuilder/settings/</code> and diamonds at <code>/ringbuilder/diamondlink/</code>.',
								'gemfind-ring-builder'
							)
						);
						?>
					</p>
				</div>

				<div class="wpdl2-import-box" style="border-style: solid;">
					<h2 style="margin-top:0;"><?php echo esc_html__( 'Next Steps for Getting Started with GemFind Ring Builder', 'gemfind-ring-builder' ); ?></h2>
					<ul style="margin: 0 0 16px 18px;">
						<li><?php echo esc_html__( 'Thank you for installing GemFind Ring Builder. Contact GemFind support if you need a JewelCloud Account ID (Dealer ID).', 'gemfind-ring-builder' ); ?></li>
						<li style="margin-top: 10px;">
							<?php echo esc_html__( 'After you enter your dealer ID under Settings, the storefront loads live inventory from JewelCloud through this site\'s REST API.', 'gemfind-ring-builder' ); ?>
						</li>
						<li style="margin-top: 10px;">
							<?php echo esc_html__( 'WooCommerce must be active for add-to-cart and complete-purchase flows.', 'gemfind-ring-builder' ); ?>
						</li>
					</ul>
					<div style="font-weight:700;">
						<?php echo esc_html__( 'Got a question? Contact us at support@gemfind.com or 1-949-752-7710.', 'gemfind-ring-builder' ); ?>
					</div>
				</div>

				<div class="wpdl2-import-box" style="border-style: solid; background: #eaf6ff;">
					<h2 style="margin-top:0;"><?php echo esc_html__( 'Need help? Field descriptions', 'gemfind-ring-builder' ); ?></h2>
					<ul style="margin: 0 0 0 18px;">
						<li><strong><?php echo esc_html__( 'JewelCloud Account ID', 'gemfind-ring-builder' ); ?></strong><br /><?php echo esc_html__( 'Mandatory. GemFind Support will help you obtain your JewelCloud Account ID.', 'gemfind-ring-builder' ); ?></li>
						<li style="margin-top: 10px;"><strong><?php echo esc_html__( 'Frontend experience', 'gemfind-ring-builder' ); ?></strong><br /><?php echo esc_html__( 'Version 2 is the modern Ring Builder UI (default). Version 1 is the classic layout for legacy sites.', 'gemfind-ring-builder' ); ?></li>
						<li style="margin-top: 10px;"><strong><?php echo esc_html__( 'Admin Email Address', 'gemfind-ring-builder' ); ?></strong><br /><?php echo esc_html__( 'Used as the notification inbox for shopper inquiry forms.', 'gemfind-ring-builder' ); ?></li>
						<li style="margin-top: 10px;"><strong><?php echo esc_html__( 'CSS Configurator', 'gemfind-ring-builder' ); ?></strong><br /><?php echo esc_html__( 'Customize link, button, and navigation colours shown on the storefront.', 'gemfind-ring-builder' ); ?></li>
					</ul>
				</div>

				<div class="wpdl2-import-box" style="border-style: solid; background: #eaf6ff;">
					<h2 style="margin-top:0;"><?php echo esc_html__( 'Help Center', 'gemfind-ring-builder' ); ?></h2>
					<div style="display:flex; align-items:center; justify-content:space-between; gap: 12px; flex-wrap:wrap;">
						<div>
							<div style="font-weight:700; margin-bottom: 6px;"><?php echo esc_html__( "We'd love to hear from you", 'gemfind-ring-builder' ); ?></div>
							<div><?php echo esc_html__( 'Need help? Schedule a Free Consultation by clicking the link below.', 'gemfind-ring-builder' ); ?></div>
						</div>
						<a class="wpdl2-btn wpdl2-btn--primary" href="<?php echo esc_url( $help_url ); ?>" target="_blank" rel="noopener noreferrer">
							<?php echo esc_html__( 'Free Consultation', 'gemfind-ring-builder' ); ?>
						</a>
					</div>
				</div>
			</div>
		</div>
		<?php
	}

	private static function format_frontend_experience_badge( string $tool_version ): string {
		return GEMFINDRB_Frontend_Version::format_admin_badge( $tool_version ) === 'v1' ? 'v1.0' : 'v2.0';
	}

	private static function render_view_frontend_banner_markup( string $tool_url, string $experience_badge ): void {
		?>
		<div class="wpdl-view-frontend-banner" role="region" aria-label="<?php echo esc_attr__( 'Storefront link', 'gemfind-ring-builder' ); ?>">
			<div class="wpdl-view-frontend-banner__inner">
				<div class="wpdl-view-frontend-banner__copy">
					<p class="wpdl-view-frontend-banner__message">
						<?php echo esc_html__( "To view your store in frontend please click on 'View In Frontend' button.", 'gemfind-ring-builder' ); ?>
					</p>
					<p class="wpdl-view-frontend-banner__version">
						<?php echo esc_html__( 'Current Version:', 'gemfind-ring-builder' ); ?>
						<span class="wpdl-view-frontend-banner__version-tag"><?php echo esc_html( $experience_badge ); ?></span>
					</p>
				</div>
				<a class="wpdl-view-frontend-banner__btn" href="<?php echo esc_url( $tool_url ); ?>" target="_blank" rel="noopener noreferrer">
					<?php echo esc_html__( 'View In Frontend', 'gemfind-ring-builder' ); ?>
				</a>
			</div>
		</div>
		<?php
	}

	public function enqueue_assets( string $hook ): void {
		if ( strpos( $hook, 'ringbuilder' ) === false ) {
			return;
		}

		$build_dir  = GEMFINDRB_PATH . 'assets/build/';
		$build_url  = GEMFINDRB_URL . 'assets/build/';
		$static_css = GEMFINDRB_PATH . 'admin/css/gemfindrb-admin.css';
		$asset_ver  = GEMFINDRB_VERSION . '.' . gemfindRB_get_asset_revision();
		$admin_js   = $build_dir . 'admin.js';
		$admin_css  = $build_dir . 'admin.css';

		if ( ! file_exists( $admin_js ) ) {
			add_action(
				'admin_notices',
				static function (): void {
					if ( ! current_user_can( 'manage_options' ) ) {
						return;
					}
					echo '<div class="notice notice-error"><p>';
					echo esc_html__( 'GemFind Ring Builder: admin UI bundle missing. Run ', 'gemfind-ring-builder' );
					echo '<code>npm run build:admin</code>';
					echo esc_html__( ' in the plugin folder.', 'gemfind-ring-builder' );
					echo '</p></div>';
				}
			);
			return;
		}

		if ( file_exists( $admin_css ) ) {
			wp_enqueue_style( self::ADMIN_HANDLE, $build_url . 'admin.css', [], $asset_ver );
		}

		if ( file_exists( $static_css ) ) {
			wp_enqueue_style(
				'gemfindrb-admin-static',
				GEMFINDRB_URL . 'admin/css/gemfindrb-admin.css',
				[],
				$asset_ver . '.' . (string) filemtime( $static_css )
			);
		}

		$ver = $asset_ver . '.' . (string) filemtime( $admin_js );
		wp_enqueue_script( self::ADMIN_HANDLE, $build_url . 'admin.js', [], $ver, true );

		$shop = gemfindRB_shop_key();
		$cfg  = GEMFINDRB_DB::get_config( $shop );
		$css  = GEMFINDRB_DB::get_css( $shop );

		$require_registration = (bool) apply_filters( 'gemfindRB_admin_require_merchant_registration', false );

		wp_localize_script(
			self::ADMIN_HANDLE,
			'gemfindRBAdminConfig',
			[
				'restUrl'                   => rest_url( 'gemfind-ring-builder/v1' ),
				'nonce'                     => wp_create_nonce( 'wp_rest' ),
				'shop'                      => $shop,
				'siteUrl'                   => home_url(),
				'adminUrl'                  => admin_url(),
				'pluginUrl'                 => GEMFINDRB_URL,
				'version'                   => GEMFINDRB_VERSION,
				'frontendToolUrl'           => GEMFINDRB_Shortcode::storefront_tool_url(),
				'settings'                  => $cfg ? (array) $cfg : [],
				'cssConfig'                 => $css ? (array) $css : [],
				'customerRegistered'        => GEMFINDRB_Settings::is_customer_registered_for_shop( $shop ),
				'requireRegistration'       => $require_registration,
				'cssConfiguratorExperience' => GEMFINDRB_Frontend_Version::is_version_one( '', $cfg ) ? 'v1' : 'v2',
			]
		);
	}
}
