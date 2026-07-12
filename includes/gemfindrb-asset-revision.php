<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function gemfindRB_bump_asset_revision(): void {
	update_option( 'gemfindRB_asset_revision', (string) time(), false );
}

/**
 * @return non-empty-string
 */
function gemfindRB_get_asset_revision(): string {
	$v = get_option( 'gemfindRB_asset_revision', '1' );
	return is_string( $v ) && $v !== '' ? $v : '1';
}

function gemfindRB_http_sslverify(): bool {
	return (bool) apply_filters( 'gemfindRB_http_sslverify', true );
}

function gemfindRB_shop_key(): string {
	$host = wp_parse_url( home_url(), PHP_URL_HOST );
	return is_string( $host ) && $host !== '' ? $host : 'localhost';
}

/**
 * Register printable diamond summary stylesheet (used by print HTML + Dompdf).
 */
function gemfindRB_register_diamond_print_styles(): void {
	$path = GEMFINDRB_PATH . 'assets/css/gemfindrb-diamond-print.css';
	$ver  = file_exists( $path ) ? (string) filemtime( $path ) : GEMFINDRB_VERSION;

	wp_register_style(
		'gemfindrb-diamond-print',
		GEMFINDRB_URL . 'assets/css/gemfindrb-diamond-print.css',
		[],
		$ver
	);
}

/**
 * Enqueue print stylesheet for standalone print/PDF HTML output.
 */
function gemfindRB_enqueue_diamond_print_styles(): void {
	gemfindRB_register_diamond_print_styles();
	wp_enqueue_style( 'gemfindrb-diamond-print' );
}
