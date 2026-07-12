<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Load Dompdf via Composer without colliding with gemfind-diamond-link's vendor copy.
 *
 * Both plugins may ship dompdf; copied vendor trees share the same ComposerAutoloaderInit*
 * class name and cause a fatal if both autoload.php files are required.
 */
function gemfindRB_load_dompdf_autoload(): bool {
	if ( class_exists( '\\Dompdf\\Dompdf', false ) ) {
		return true;
	}

	$candidates = [];

	if ( defined( 'GEMFINDDL_PATH' ) ) {
		$candidates[] = GEMFINDDL_PATH . 'vendor/autoload.php';
	}

	$candidates[] = GEMFINDRB_PATH . 'vendor/autoload.php';

	foreach ( $candidates as $autoload ) {
		if ( ! is_string( $autoload ) || ! file_exists( $autoload ) ) {
			continue;
		}

		// Another plugin may have already required a vendor tree with the same
		// ComposerAutoloaderInit* class; skip require_once but still probe Dompdf.
		if ( ! gemfindRB_composer_autoload_already_registered( $autoload ) ) {
			require_once $autoload;
		}

		if ( class_exists( '\\Dompdf\\Dompdf' ) ) {
			return true;
		}
	}

	return class_exists( '\\Dompdf\\Dompdf' );
}

/**
 * True when this autoload_real.php class was already loaded by another plugin.
 */
function gemfindRB_composer_autoload_already_registered( string $autoload_path ): bool {
	$real = dirname( $autoload_path ) . '/composer/autoload_real.php';
	if ( ! file_exists( $real ) ) {
		return false;
	}

	$src = file_get_contents( $real );
	if ( ! is_string( $src ) ) {
		return false;
	}

	if ( preg_match( '/class (ComposerAutoloaderInit[a-f0-9]+)/', $src, $m ) !== 1 ) {
		return false;
	}

	return class_exists( $m[1], false );
}
