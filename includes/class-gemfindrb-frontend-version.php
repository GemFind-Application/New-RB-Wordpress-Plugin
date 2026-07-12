<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Storefront version helpers (matches Diamond Link 1.0 / 2.0 and Shopify version-one / version-two).
 */
final class GEMFINDRB_Frontend_Version {

	public const DEFAULT = '2.0';

	public static function normalize( string $raw ): string {
		$t = strtolower( trim( $raw ) );
		if ( $t === 'version-one' || $t === '1' || preg_match( '/^1(\.|$)/', $t ) === 1 ) {
			return '1.0';
		}
		if ( $t === 'version-two' || $t === '2' || preg_match( '/^2(\.|$)/', $t ) === 1 ) {
			return '2.0';
		}
		return self::DEFAULT;
	}

	/**
	 * @param string       $shortcode_version Empty = use shop settings only.
	 * @param object|null  $cfg               ringbuilder_config row.
	 */
	public static function is_version_one( string $shortcode_version = '', ?object $cfg = null ): bool {
		$sv = strtolower( trim( $shortcode_version ) );
		if ( $sv !== '' ) {
			if ( preg_match( '/^1(\.|$)/', $sv ) === 1 || $sv === 'version-one' ) {
				return true;
			}
			if ( preg_match( '/^2(\.|$)/', $sv ) === 1 || $sv === 'version-two' ) {
				return false;
			}
		}

		$tv = is_object( $cfg ) ? strtolower( trim( (string) ( $cfg->tool_version ?? self::DEFAULT ) ) ) : self::DEFAULT;

		return preg_match( '/^1(\.|$)/', $tv ) === 1 || $tv === 'version-one';
	}

	public static function format_admin_badge( string $tool_version ): string {
		return self::is_version_one( '', (object) [ 'tool_version' => $tool_version ] ) ? 'v1' : 'v2';
	}
}
