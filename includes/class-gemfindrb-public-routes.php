<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * SEO-friendly /ringbuilder/* SPA routing + ringBuilder-old URL compatibility.
 */
final class GEMFINDRB_Public_Routes {

	private const REWRITE_VERSION = '1.0.1';

	/** @var list<string> */
	private const STOREFRONT_API_PREFIXES = [
		'cartadd',
		'cartaddsetting',
		'completePurchase',
	];

	public static function register(): void {
		add_action( 'init', [ self::class, 'register_rewrite_rules' ], 10 );
		add_action( 'wp_loaded', [ self::class, 'maybe_flush_rewrite_rules' ], 20 );
		add_filter( 'redirect_canonical', [ self::class, 'preserve_spa_canonical_url' ], 10, 2 );
		add_action( 'template_redirect', [ self::class, 'maybe_proxy_storefront_api' ], 0 );
		add_action( 'template_redirect', [ self::class, 'maybe_redirect_legacy_tool_paths' ], 1 );
		add_action( 'template_redirect', [ self::class, 'maybe_resolve_spa_page' ], 2 );
	}

	/**
	 * Proxy cart/checkout API paths to the REST namespace (ringBuilder-old + Shopify /apps/ringbuilder).
	 */
	public static function maybe_proxy_storefront_api(): void {
		if ( is_admin() ) {
			return;
		}

		$rel = self::relative_request_path();
		if ( $rel === '' ) {
			return;
		}

		$api_tail = self::storefront_api_tail( $rel );
		if ( $api_tail === null ) {
			return;
		}

		$target = rest_url( 'gemfind-ring-builder/v1/' . $api_tail );
		if ( isset( $_SERVER['QUERY_STRING'] ) ) {
			$raw_query = sanitize_text_field( wp_unslash( (string) $_SERVER['QUERY_STRING'] ) );
			wp_parse_str( $raw_query, $query_args );
			if ( $query_args !== [] ) {
				$target = add_query_arg( $query_args, $target );
			}
		}
		if ( ! str_contains( $target, '_wpnonce=' ) ) {
			$target = add_query_arg( '_wpnonce', wp_create_nonce( 'wp_rest' ), $target );
		}

		wp_safe_redirect( $target, 307 );
		exit;
	}

	public static function maybe_redirect_legacy_tool_paths(): void {
		if ( is_admin() ) {
			return;
		}
		$rel = self::relative_request_path();
		if ( $rel === '' ) {
			return;
		}

		if ( self::is_storefront_api_path( $rel ) ) {
			return;
		}

		if ( str_starts_with( $rel, 'apps/ringbuilder' ) ) {
			$tail = substr( $rel, strlen( 'apps/ringbuilder' ) );
			$normalized = 'ringbuilder' . ( $tail === '' ? '' : $tail );
			if ( self::is_storefront_api_path( $normalized ) ) {
				return;
			}
			wp_safe_redirect( home_url( '/ringbuilder' . $tail ), 301 );
			exit;
		}

		if ( $rel === 'ringbuilder' ) {
			wp_safe_redirect( home_url( '/ringbuilder/settings/' ), 302 );
			exit;
		}
	}

	public static function register_rewrite_rules(): void {
		$slug = self::tool_page_slug();
		if ( $slug === '' ) {
			return;
		}
		$quoted = preg_quote( $slug, '#' );
		add_rewrite_rule(
			'^' . $quoted . '(?:/.+)?/?$',
			'index.php?pagename=' . $slug,
			'top'
		);
	}

	public static function maybe_flush_rewrite_rules(): void {
		if ( get_option( 'gemfindRB_rewrite_version' ) === self::REWRITE_VERSION ) {
			return;
		}
		flush_rewrite_rules( false );
		update_option( 'gemfindRB_rewrite_version', self::REWRITE_VERSION );
	}

	/**
	 * @param string|false $redirect_url
	 * @return string|false
	 */
	public static function preserve_spa_canonical_url( $redirect_url, $requested_url ) {
		if ( ! is_string( $requested_url ) || $requested_url === '' ) {
			return $redirect_url;
		}
		$path = self::relative_request_path( $requested_url );
		if ( self::path_is_spa( $path ) ) {
			return false;
		}
		return $redirect_url;
	}

	public static function maybe_resolve_spa_page(): void {
		if ( is_admin() || wp_doing_ajax() || wp_doing_cron() || ! is_404() ) {
			return;
		}

		$rel = self::relative_request_path();
		if ( $rel === '' || ! self::path_is_spa( $rel ) ) {
			return;
		}

		$page = self::resolve_tool_shortcode_page();
		if ( ! $page instanceof WP_Post && class_exists( 'GEMFINDRB_Activator' ) ) {
			GEMFINDRB_Activator::ensure_ringbuilder_pages();
			$page = self::resolve_tool_shortcode_page();
			delete_option( 'gemfindRB_rewrite_version' );
		}

		if ( ! $page instanceof WP_Post ) {
			return;
		}

		global $wp_query;
		$wp_query->queried_object    = $page;
		$wp_query->queried_object_id = (int) $page->ID;
		$wp_query->is_page           = true;
		$wp_query->is_singular       = true;
		$wp_query->is_404            = false;
		$wp_query->posts             = [ $page ];
		$wp_query->post_count        = 1;
		$wp_query->found_posts       = 1;
		$wp_query->max_num_pages     = 1;
		$wp_query->post              = $page;
		status_header( 200 );
	}

	private static function is_storefront_api_path( string $path ): bool {
		return self::storefront_api_tail( $path ) !== null;
	}

	private static function storefront_api_tail( string $path ): ?string {
		$prefixes = [ 'ringbuilder/', 'apps/ringbuilder/' ];
		$tail     = null;
		foreach ( $prefixes as $prefix ) {
			if ( str_starts_with( $path, $prefix ) ) {
				$tail = substr( $path, strlen( $prefix ) );
				break;
			}
		}
		if ( $tail === null || $tail === '' ) {
			return null;
		}
		foreach ( self::STOREFRONT_API_PREFIXES as $api_prefix ) {
			if ( $tail === $api_prefix || str_starts_with( $tail, $api_prefix . '/' ) ) {
				return $tail;
			}
		}
		return null;
	}

	private static function relative_request_path( ?string $requested_url = null ): string {
		$uri = $requested_url ?? '';
		if ( $uri === '' && isset( $_SERVER['REQUEST_URI'] ) ) {
			$uri = sanitize_text_field( wp_unslash( (string) $_SERVER['REQUEST_URI'] ) );
		}
		$path = trim( (string) wp_parse_url( $uri, PHP_URL_PATH ), '/' );
		$home = trim( (string) ( wp_parse_url( home_url(), PHP_URL_PATH ) ?? '' ), '/' );
		if ( $home !== '' && $path !== '' && str_starts_with( $path, $home ) ) {
			$path = trim( substr( $path, strlen( $home ) ), '/' );
		}
		return $path;
	}

	private static function path_is_spa( string $path ): bool {
		if ( self::is_storefront_api_path( $path ) ) {
			return false;
		}
		return $path === 'ringbuilder' || str_starts_with( $path, 'ringbuilder/' );
	}

	private static function tool_page_slug(): string {
		$page = self::resolve_tool_shortcode_page();
		if ( $page instanceof WP_Post ) {
			$uri = trim( (string) get_page_uri( $page ), '/' );
			if ( $uri !== '' ) {
				return $uri;
			}
		}
		return 'ringbuilder';
	}

	private static function resolve_tool_shortcode_page(): ?WP_Post {
		$page_id = (int) get_option( 'gemfindRB_tool_page_id', 0 );
		if ( $page_id > 0 ) {
			$p = get_post( $page_id );
			if ( $p instanceof WP_Post && $p->post_type === 'page' && $p->post_status === 'publish' ) {
				return $p;
			}
		}

		$by_path = get_page_by_path( 'ringbuilder', OBJECT, 'page' );
		if ( $by_path instanceof WP_Post ) {
			return $by_path;
		}

		return null;
	}
}
