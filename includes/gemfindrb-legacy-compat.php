<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Migrate legacy `gemfind_ring_builder` WP option into ringbuilder_* tables (once).
 */
function GEMFINDRB_migrate_legacy_option_to_tables(): void {
	if ( get_option( 'gemfindRB_legacy_option_migrated', false ) ) {
		return;
	}

	$legacy = get_option( 'gemfind_ring_builder', null );
	if ( ! is_array( $legacy ) || $legacy === [] ) {
		update_option( 'gemfindRB_legacy_option_migrated', true, false );
		return;
	}

	if ( ! class_exists( 'GEMFINDRB_DB' ) ) {
		return;
	}

	$shop = gemfindRB_shop_key();

	$bool_to_int = static function ( mixed $v ): int {
		if ( $v === true || $v === 'true' || $v === '1' || $v === 1 ) {
			return 1;
		}
		return 0;
	};

	$map = [
		'dealerid'                => $legacy['dealerid'] ?? '',
		'dealerauthapi'           => $legacy['dealerauthapi'] ?? '',
		'ringfiltersapi'          => $legacy['ringfiltersapi'] ?? '',
		'mountinglistapi'         => $legacy['mountinglistapi'] ?? '',
		'mountingdetailapi'       => $legacy['mountingdetailapi'] ?? '',
		'ringstylesettingsapi'    => $legacy['ringstylesettingsapi'] ?? $legacy['stylesettingapi'] ?? '',
		'navigationapi'           => $legacy['navigationapi'] ?? '',
		'navigationapirb'         => $legacy['navigationapirb'] ?? '',
		'filterapi'               => $legacy['filterapi'] ?? '',
		'filterapifancy'          => $legacy['filterapifancy'] ?? '',
		'diamondlistapi'          => $legacy['diamondlistapi'] ?? '',
		'diamondlistapifancy'     => $legacy['diamondlistapifancy'] ?? '',
		'diamondshapeapi'         => $legacy['diamondshapeapi'] ?? '',
		'diamonddetailapi'        => $legacy['diamonddetailapi'] ?? '',
		'stylesettingapi'         => $legacy['stylesettingapi'] ?? '',
		'diamondsoptionapi'       => $legacy['diamondsoptionapi'] ?? '',
		'admin_email_address'     => $legacy['admin_email_address'] ?? '',
		'from_email_address'      => $legacy['from_email_address'] ?? '',
		'shop_logo'               => $legacy['shop_logo'] ?? '',
		'default_view'            => $legacy['default_view'] ?? 'list',
		'settings_carat_ranges'   => $legacy['carat_ranges'] ?? $legacy['settings_carat_ranges'] ?? '',
		'load_from_woocommerce'   => (int) ( $legacy['load_from_woocommerce'] ?? 0 ),
		'enable_hint'             => $bool_to_int( $legacy['enable_hint'] ?? 1 ),
		'enable_email_friend'     => $bool_to_int( $legacy['enable_email_friend'] ?? 1 ),
		'enable_schedule_viewing' => $bool_to_int( $legacy['enable_schedule_viewing'] ?? 1 ),
		'enable_more_info'        => $bool_to_int( $legacy['enable_more_info'] ?? 1 ),
		'enable_print'            => $bool_to_int( $legacy['enable_print'] ?? 1 ),
		'show_copyright'          => $bool_to_int( $legacy['show_copyright'] ?? 0 ),
	];

	foreach ( $map as $key => $val ) {
		if ( is_string( $val ) ) {
			$map[ $key ] = $val;
		}
	}

	$existing = GEMFINDRB_DB::get_config( $shop );
	if ( $existing ) {
		GEMFINDRB_DB::update_config( array_filter( $map, static fn( $v ) => $v !== '' && $v !== null ), $shop );
	} else {
		GEMFINDRB_DB::upsert_config( $map, $shop );
	}

	if ( function_exists( 'gemfindRB_ensure_default_css_for_shop' ) ) {
		gemfindRB_ensure_default_css_for_shop( $shop );
	}

	update_option( 'gemfindRB_legacy_option_migrated', true, false );
}

add_action( 'plugins_loaded', 'GEMFINDRB_migrate_legacy_option_to_tables', 4 );

/**
 * Legacy shortcode alias [gemfind_ring_builder].
 */
function gemfindRB_register_legacy_shortcode(): void {
	if ( shortcode_exists( 'gemfindRB_ring_builder' ) && ! shortcode_exists( 'gemfind_ring_builder' ) ) {
		add_shortcode(
			'gemfind_ring_builder',
			static function ( $atts = [] ) {
				$atts = is_array( $atts ) ? $atts : [];
				$parts = [];
				foreach ( $atts as $k => $v ) {
					$parts[] = sanitize_key( (string) $k ) . '="' . esc_attr( (string) $v ) . '"';
				}
				$attr_str = implode( ' ', $parts );
				return do_shortcode( '[gemfindRB_ring_builder' . ( $attr_str !== '' ? ' ' . $attr_str : '' ) . ']' );
			}
		);
	}
}
add_action( 'init', 'gemfindRB_register_legacy_shortcode', 11 );

/**
 * Map legacy page option keys to gemfindRB_* keys.
 */
function gemfindRB_migrate_legacy_page_options(): void {
	$map = [
		'ring_builder_page_id'   => 'gemfindRB_tool_page_id',
		'diamondlink_rb_page_id' => 'gemfindRB_diamondlink_page_id',
		'settings_page_id'       => 'gemfindRB_settings_page_id',
	];
	foreach ( $map as $old => $new ) {
		$val = get_option( $old, null );
		if ( null !== $val && null === get_option( $new, null ) ) {
			update_option( $new, $val, false );
		}
	}
}
add_action( 'plugins_loaded', 'gemfindRB_migrate_legacy_page_options', 1 );
