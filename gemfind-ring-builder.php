<?php
/**
 * Plugin Name:  GemFind Ring Builder
 * Plugin URI:   https://gemfind.com/
 * Description:  Full-featured Ring Builder tool powered by GemFind. React frontend, REST API backend, admin settings, emails, and WooCommerce cart integration.
 * Version:      1.0.0
 * Requires at least: 6.3
 * Requires PHP: 8.1
 * Author:       GemFind
 * Author URI:   https://gemfind.com
 * License:      GPL-2.0-or-later
 * License URI:  https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:  gemfind-ring-builder
 * Domain Path:  /languages
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'GEMFINDRB_VERSION', '1.0.0' );
define( 'GEMFINDRB_PATH', plugin_dir_path( __FILE__ ) );
define( 'GEMFINDRB_URL', plugin_dir_url( __FILE__ ) );
define( 'GEMFINDRB_BASENAME', plugin_basename( __FILE__ ) );
define( 'GEMFINDRB_FILE', __FILE__ );

require_once GEMFINDRB_PATH . 'includes/gemfindrb-composer.php';

require_once GEMFINDRB_PATH . 'includes/gemfindrb-legacy-compat.php';

$gemfindrb_includes = [
	'includes/gemfindrb-asset-revision.php',
	'includes/gemfindrb-css-defaults.php',
	'includes/class-gemfindrb-frontend-version.php',
	'includes/class-gemfindrb-loader.php',
	'includes/class-gemfindrb-activator.php',
	'includes/class-gemfindrb-deactivator.php',
	'includes/services/class-gemfindrb-db.php',
	'includes/services/class-gemfindrb-settings.php',
	'includes/services/class-gemfindrb-jewelcloud.php',
	'includes/services/class-gemfindrb-form-payload.php',
	'includes/services/class-gemfindrb-smtp.php',
	'includes/services/class-gemfindrb-mail.php',
	'includes/services/class-gemfindrb-email.php',
	'includes/services/class-gemfindrb-print.php',
	'includes/services/class-gemfindrb-woo-cart.php',
	'includes/services/class-gemfindrb-css.php',
	'includes/class-gemfindrb-api.php',
	'includes/class-gemfindrb-shortcode.php',
	'includes/class-gemfindrb-full-width-template.php',
	'includes/class-gemfindrb-public-routes.php',
	'admin/class-gemfindrb-admin.php',
];

foreach ( $gemfindrb_includes as $gemfindrb_include_path ) {
	require_once GEMFINDRB_PATH . $gemfindrb_include_path;
}

register_activation_hook( __FILE__, [ 'GEMFINDRB_Activator', 'activate' ] );
register_deactivation_hook( __FILE__, [ 'GEMFINDRB_Deactivator', 'deactivate' ] );

/**
 * Idempotent runtime DB migration (schema-only at plugins_loaded; page CRUD on init).
 */
function gemfindRB_maybe_migrate(): void {
	// Always run — idempotent column/API backfills for existing installs.
	GEMFINDRB_Activator::migrate_schema();
	GEMFINDRB_DB::runtime_migrate();

	$ver_key = 'gemfindRB_db_ver';
	$current = '1.0.1';
	if ( get_option( $ver_key ) === $current ) {
		return;
	}

	GEMFINDRB_migrate_legacy_option_to_tables();

	if ( ! has_action( 'init', 'gemfindRB_finish_migrate' ) ) {
		add_action( 'init', 'gemfindRB_finish_migrate', 1 );
	}
}
add_action( 'plugins_loaded', 'gemfindRB_maybe_migrate', 5 );

/**
 * Page creation / repair half of the migration. Runs on `init`.
 */
function gemfindRB_finish_migrate(): void {
	$ver_key = 'gemfindRB_db_ver';
	$current = '1.0.1';
	if ( get_option( $ver_key ) === $current ) {
		return;
	}
	if ( ! class_exists( 'GEMFINDRB_Activator' ) ) {
		return;
	}
	GEMFINDRB_Activator::ensure_ringbuilder_pages();
	update_option( $ver_key, $current );
}

add_action(
	'plugins_loaded',
	static function (): void {
		GEMFINDRB_Public_Routes::register();
	},
	6
);

/**
 * Bootstrap the plugin: REST API, admin UI, shortcode + assets.
 */
function gemfindRB_run(): void {
	$loader = new GEMFINDRB_Loader();

	$api = new GEMFINDRB_API();
	$loader->add_action( 'rest_api_init', $api, 'register_routes', 10 );

	if ( is_admin() ) {
		$admin = new GEMFINDRB_Admin();
		$loader->add_action( 'admin_menu', $admin, 'add_menu_pages', 10 );
		$loader->add_action( 'admin_enqueue_scripts', $admin, 'enqueue_assets', 10 );
	}

	$shortcode = new GEMFINDRB_Shortcode();
	$loader->add_action( 'init', $shortcode, 'register', 10 );
	$loader->add_action( 'wp_enqueue_scripts', $shortcode, 'enqueue_assets', 10 );

	GEMFINDRB_Full_Width_Template::register();

	$loader->run();
}
gemfindRB_run();

add_action(
	'plugins_loaded',
	static function (): void {
		if ( class_exists( 'WooCommerce' ) ) {
			GEMFINDRB_Woo_Cart::register_hooks();
		}
	},
	20
);
