<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WooCommerce cart: diamond, ring setting, and complete ring.
 */
final class GEMFINDRB_Woo_Cart {

	public const TYPE_DIAMOND  = 'gemfindRB_diamond';
	public const TYPE_RING     = 'gemfindRB_ring';
	public const TYPE_COMPLETE = 'gemfindRB_complete_ring';

	private const CART_CTX_PREFIX      = 'gemfindRB_cart_ctx_';
	private const COMPLETE_CTX_PREFIX  = 'gemfindRB_complete_ctx_';
	private const CART_CTX_TTL         = 1200;

	private static bool $hooks_registered = false;

	public static function register_hooks(): void {
		if ( self::$hooks_registered ) {
			return;
		}
		self::$hooks_registered = true;

		add_filter( 'woocommerce_add_cart_item_data', [ self::class, 'add_cart_item_data_from_token' ], 10, 4 );
		add_filter( 'woocommerce_get_item_data', [ self::class, 'display_cart_item_data' ], 15, 2 );
		add_action( 'woocommerce_checkout_create_order_line_item', [ self::class, 'copy_line_meta_to_order' ], 10, 4 );
		add_action( 'wp_loaded', [ self::class, 'maybe_apply_complete_ring_cart_token' ], 20 );
	}

	/**
	 * @param array<string,mixed> $diamond
	 */
	public static function get_add_to_cart_url_for_diamond( array $diamond, string $diamond_id ): string|WP_Error {
		return self::build_cart_url(
			self::TYPE_DIAMOND,
			self::normalize_sku( 'D-' . $diamond_id ),
			self::diamond_title( $diamond, $diamond_id ),
			self::parse_price( $diamond ),
			self::diamond_meta_line( $diamond ),
			$diamond
		);
	}

	/**
	 * @param array<string,mixed> $ring
	 * @param array<string,mixed> $options
	 */
	public static function get_add_to_cart_url_for_ring( array $ring, string $setting_id, array $options = [] ): string|WP_Error {
		$title = (string) ( $ring['mainHeader'] ?? $ring['settingName'] ?? sprintf( __( 'Ring Setting %s', 'gemfind-ring-builder' ), $setting_id ) );
		$line  = self::ring_meta_line( $ring, $options );

		return self::build_cart_url(
			self::TYPE_RING,
			self::normalize_sku( 'R-' . $setting_id ),
			$title,
			self::parse_price( $ring ),
			$line,
			$ring
		);
	}

	/**
	 * Prepare setting + diamond products, then hand the browser a cart URL that
	 * adds both on landing (same session-safe pattern as single-item add-to-cart).
	 *
	 * @param array<string,mixed> $diamond
	 * @param array<string,mixed> $ring
	 * @param array<string,mixed> $options
	 */
	public static function get_add_to_cart_url_for_complete_ring( array $diamond, string $diamond_id, array $ring, string $setting_id, array $options = [] ): string|WP_Error {
		$ring_prepared = self::prepare_cart_product(
			self::TYPE_RING,
			self::normalize_sku( 'R-' . $setting_id ),
			(string) ( $ring['mainHeader'] ?? $ring['settingName'] ?? sprintf( __( 'Ring Setting %s', 'gemfind-ring-builder' ), $setting_id ) ),
			self::parse_price( $ring ),
			self::ring_meta_line( $ring, $options ),
			$ring
		);
		if ( is_wp_error( $ring_prepared ) ) {
			return $ring_prepared;
		}

		$diamond_prepared = self::prepare_cart_product(
			self::TYPE_DIAMOND,
			self::normalize_sku( 'D-' . $diamond_id ),
			self::diamond_title( $diamond, $diamond_id ),
			self::parse_price( $diamond ),
			self::diamond_meta_line( $diamond ),
			$diamond
		);
		if ( is_wp_error( $diamond_prepared ) ) {
			return $diamond_prepared;
		}

		$token = wp_generate_password( 24, false, false );
		set_transient(
			self::COMPLETE_CTX_PREFIX . $token,
			[
				'items' => [ $ring_prepared, $diamond_prepared ],
			],
			self::CART_CTX_TTL
		);

		$base = function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/cart/' );
		return add_query_arg( [ 'gemfindRB_complete_ctx' => $token ], $base );
	}

	/**
	 * Consume complete-ring token on cart landing and add both WooCommerce products.
	 */
	public static function maybe_apply_complete_ring_cart_token(): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$token = isset( $_GET['gemfindRB_complete_ctx'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['gemfindRB_complete_ctx'] ) ) : '';
		if ( $token === '' || ! function_exists( 'WC' ) ) {
			return;
		}

		$payload = get_transient( self::COMPLETE_CTX_PREFIX . $token );
		if ( ! is_array( $payload ) || empty( $payload['items'] ) || ! is_array( $payload['items'] ) ) {
			return;
		}

		delete_transient( self::COMPLETE_CTX_PREFIX . $token );

		if ( is_null( WC()->cart ) && function_exists( 'wc_load_cart' ) ) {
			wc_load_cart();
		}
		if ( ! WC()->cart instanceof WC_Cart ) {
			return;
		}

		foreach ( $payload['items'] as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$product_id     = (int) ( $item['product_id'] ?? 0 );
			$cart_item_data = is_array( $item['cart_item_data'] ?? null ) ? $item['cart_item_data'] : [];
			if ( $product_id <= 0 ) {
				continue;
			}
			WC()->cart->add_to_cart( $product_id, 1, 0, [], $cart_item_data );
		}

		$cart_url = function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/cart/' );
		wp_safe_redirect( $cart_url, 302 );
		exit;
	}

	/**
	 * @param array<string,mixed> $payload
	 * @return array{product_id:int,cart_item_data:array<string,mixed>}|WP_Error
	 */
	private static function prepare_cart_product( string $type, string $sku, string $title, ?float $price, string $details_line, array $payload ): array|WP_Error {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return new WP_Error( 'gemfindRB_no_woocommerce', __( 'WooCommerce must be active.', 'gemfind-ring-builder' ), [ 'status' => 503 ] );
		}
		if ( $sku === '' ) {
			return new WP_Error( 'gemfindRB_invalid_sku', __( 'Invalid product id.', 'gemfind-ring-builder' ), [ 'status' => 400 ] );
		}
		if ( $price === null || $price <= 0 ) {
			return new WP_Error( 'gemfindRB_no_price', __( 'Price is not available for purchase.', 'gemfind-ring-builder' ), [ 'status' => 400 ] );
		}

		$product_id = function_exists( 'wc_get_product_id_by_sku' ) ? (int) wc_get_product_id_by_sku( $sku ) : 0;
		$image_url  = self::resolve_payload_image_url( $type, $payload );
		if ( $product_id > 0 ) {
			$product = wc_get_product( $product_id );
			if ( ! $product instanceof WC_Product ) {
				return new WP_Error( 'gemfindRB_product_missing', __( 'Could not load cart product.', 'gemfind-ring-builder' ), [ 'status' => 500 ] );
			}
			$product->set_name( $title );
			$product->set_regular_price( (string) $price );
			$product->set_catalog_visibility( 'visible' );
			$product->update_meta_data( '_gemfindrb_product_type', $type );
			self::sync_product_featured_image( $product, $image_url, $sku );
			$product->save();
		} else {
			$product = new WC_Product_Simple();
			$product->set_name( $title );
			$product->set_sku( $sku );
			$product->set_regular_price( (string) $price );
			$product->set_catalog_visibility( 'visible' );
			$product->set_manage_stock( false );
			$product->set_stock_status( 'instock' );
			$product->set_status( 'publish' );
			$product->update_meta_data( '_gemfindrb_product_type', $type );
			self::sync_product_featured_image( $product, $image_url, $sku );
			$product_id = (int) $product->save();
		}

		if ( $product_id <= 0 ) {
			return new WP_Error( 'gemfindRB_create_failed', __( 'Could not create cart product.', 'gemfind-ring-builder' ), [ 'status' => 500 ] );
		}

		return [
			'product_id'     => $product_id,
			'cart_item_data' => [
				'gemfindRB_details_line'  => $details_line,
				'gemfindRB_product_type'  => $type,
			],
		];
	}

	/**
	 * @param list<array{product_id:int,cart_item_data:array<string,mixed>}> $items
	 */
	private static function add_items_to_cart( array $items ): bool|WP_Error {
		if ( ! function_exists( 'WC' ) ) {
			return new WP_Error( 'gemfindRB_no_woocommerce', __( 'WooCommerce must be active.', 'gemfind-ring-builder' ), [ 'status' => 503 ] );
		}

		if ( is_null( WC()->cart ) && function_exists( 'wc_load_cart' ) ) {
			wc_load_cart();
		}

		if ( ! WC()->cart instanceof WC_Cart ) {
			return new WP_Error( 'gemfindRB_cart_unavailable', __( 'Could not load cart.', 'gemfind-ring-builder' ), [ 'status' => 500 ] );
		}

		foreach ( $items as $item ) {
			$product_id     = (int) ( $item['product_id'] ?? 0 );
			$cart_item_data = is_array( $item['cart_item_data'] ?? null ) ? $item['cart_item_data'] : [];
			if ( $product_id <= 0 ) {
				return new WP_Error( 'gemfindRB_invalid_product', __( 'Invalid cart product.', 'gemfind-ring-builder' ), [ 'status' => 400 ] );
			}

			$cart_item_key = WC()->cart->add_to_cart( $product_id, 1, 0, [], $cart_item_data );
			if ( ! $cart_item_key ) {
				return new WP_Error( 'gemfindRB_cart_add_failed', __( 'Could not add item to cart.', 'gemfind-ring-builder' ), [ 'status' => 500 ] );
			}
		}

		return true;
	}

	/**
	 * @param array<string,mixed> $payload
	 */
	private static function build_cart_url( string $type, string $sku, string $title, ?float $price, string $details_line, array $payload ): string|WP_Error {
		$prepared = self::prepare_cart_product( $type, $sku, $title, $price, $details_line, $payload );
		if ( is_wp_error( $prepared ) ) {
			return $prepared;
		}

		$product_id = (int) $prepared['product_id'];
		$token      = wp_generate_password( 24, false, false );
		set_transient(
			self::CART_CTX_PREFIX . $token,
			[
				'product_id' => $product_id,
				'line'       => $details_line,
				'type'       => $type,
			],
			self::CART_CTX_TTL
		);

		$base = function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/cart/' );
		return add_query_arg(
			[
				'add-to-cart'        => $product_id,
				'quantity'           => 1,
				'gemfindRB_cart_ctx' => $token,
			],
			$base
		);
	}

	public static function get_wc_cart_add_url_for_product_id( int $product_id ): string {
		if ( $product_id <= 0 ) {
			return '';
		}
		$base = function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/cart/' );
		return add_query_arg( [ 'add-to-cart' => $product_id ], $base );
	}

	/**
	 * @param array<string,mixed> $cart_item_data
	 * @return array<string,mixed>
	 */
	public static function add_cart_item_data_from_token( array $cart_item_data, int $product_id, int $variation_id, int $quantity ): array {
		unset( $variation_id, $quantity );
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$token = isset( $_GET['gemfindRB_cart_ctx'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['gemfindRB_cart_ctx'] ) ) : '';
		if ( $token === '' ) {
			return $cart_item_data;
		}
		$payload = get_transient( self::CART_CTX_PREFIX . $token );
		if ( ! is_array( $payload ) || (int) ( $payload['product_id'] ?? 0 ) !== $product_id ) {
			return $cart_item_data;
		}
		delete_transient( self::CART_CTX_PREFIX . $token );
		if ( ! empty( $payload['line'] ) ) {
			$cart_item_data['gemfindRB_details_line'] = (string) $payload['line'];
		}
		if ( ! empty( $payload['type'] ) ) {
			$cart_item_data['gemfindRB_product_type'] = (string) $payload['type'];
		}
		return $cart_item_data;
	}

	/**
	 * @param list<array{name:string,value:string}> $item_data
	 * @param array<string,mixed> $cart_item
	 * @return list<array{name:string,value:string}>
	 */
	public static function display_cart_item_data( array $item_data, array $cart_item ): array {
		if ( ! empty( $cart_item['gemfindRB_details_line'] ) ) {
			$label       = __( 'Details', 'gemfind-ring-builder' );
			$item_data[] = [
				'key'   => $label,
				'name'  => $label,
				'value' => esc_html( (string) $cart_item['gemfindRB_details_line'] ),
			];
		}
		return $item_data;
	}

	/**
	 * @param \WC_Order_Item_Product $item
	 * @param array<string,mixed> $values
	 */
	public static function copy_line_meta_to_order( object $item, string $cart_item_key, array $values, object $order ): void {
		unset( $cart_item_key, $order );
		if ( ! $item instanceof WC_Order_Item_Product ) {
			return;
		}
		if ( ! empty( $values['gemfindRB_details_line'] ) ) {
			$item->add_meta_data( __( 'Details', 'gemfind-ring-builder' ), sanitize_text_field( (string) $values['gemfindRB_details_line'] ), true );
		}
		if ( ! empty( $values['gemfindRB_product_type'] ) ) {
			$item->add_meta_data( '_gemfindrb_product_type', sanitize_text_field( (string) $values['gemfindRB_product_type'] ), true );
		}
	}

	private static function normalize_sku( string $sku ): string {
		$sku = preg_replace( '/[^A-Za-z0-9\-_]/', '-', $sku ) ?? '';
		return substr( trim( $sku, '-' ), 0, 60 );
	}

	/**
	 * @param array<string,mixed> $item
	 */
	private static function parse_price( array $item ): ?float {
		foreach ( [ 'cost', 'price', 'fltPrice', 'FltPrice', 'settingPrice' ] as $key ) {
			if ( ! isset( $item[ $key ] ) ) {
				continue;
			}

			$raw = is_string( $item[ $key ] )
				? str_replace( [ ',', '$' ], '', trim( $item[ $key ] ) )
				: $item[ $key ];

			if ( is_numeric( $raw ) ) {
				$p = (float) $raw;
				return $p > 0 ? $p : null;
			}
		}
		return null;
	}

	/**
	 * @param array<string,mixed> $diamond
	 */
	private static function diamond_title( array $diamond, string $diamond_id ): string {
		if ( ! empty( $diamond['mainHeader'] ) ) {
			return (string) $diamond['mainHeader'];
		}
		return sprintf( __( 'Diamond %s', 'gemfind-ring-builder' ), $diamond_id );
	}

	/**
	 * @param array<string,mixed> $diamond
	 */
	private static function diamond_meta_line( array $diamond ): string {
		$parts = array_filter(
			[
				$diamond['shape'] ?? '',
				isset( $diamond['caratWeight'] ) ? $diamond['caratWeight'] . ' ct' : '',
				$diamond['color'] ?? '',
				$diamond['clarity'] ?? '',
			]
		);
		return implode( ' · ', array_map( 'strval', $parts ) );
	}

	/**
	 * @param array<string,mixed> $ring
	 * @param array<string,mixed> $options
	 */
	private static function ring_meta_line( array $ring, array $options ): string {
		$parts = array_filter(
			[
				$ring['metalType'] ?? $options['metaltype'] ?? '',
				$ring['settingName'] ?? '',
				$options['size'] ?? $options['ringSize'] ?? $options['ringsizesettingonly'] ?? '',
			]
		);
		return implode( ' · ', array_map( 'strval', $parts ) );
	}

	/**
	 * @param array<string,mixed> $payload
	 */
	private static function resolve_payload_image_url( string $type, array $payload ): string {
		if ( $type === self::TYPE_RING ) {
			return self::resolve_ring_image_url( $payload );
		}

		if ( $type === self::TYPE_COMPLETE ) {
			$ring = is_array( $payload['_ring'] ?? null ) ? $payload['_ring'] : [];
			$url  = self::resolve_ring_image_url( $ring );
			if ( $url !== '' ) {
				return $url;
			}
		}

		return self::resolve_diamond_image_url( $payload );
	}

	/**
	 * @param array<string,mixed> $diamond
	 */
	private static function resolve_diamond_image_url( array $diamond ): string {
		$keys = [
			'image2',
			'image1',
			'biggerDiamondimage',
			'diamondImage',
			'diamondImageUrl',
			'defaultDiamondImage',
		];

		foreach ( $keys as $key ) {
			if ( empty( $diamond[ $key ] ) || is_array( $diamond[ $key ] ) ) {
				continue;
			}
			$url = self::normalize_image_url( (string) $diamond[ $key ] );
			if ( $url !== '' ) {
				return $url;
			}
		}

		return '';
	}

	/**
	 * @param array<string,mixed> $ring
	 */
	private static function resolve_ring_image_url( array $ring ): string {
		$keys = [
			'mainImageURL',
			'mainImage',
			'imageUrl',
			'imageURL',
			'image1',
			'settingImage',
		];

		foreach ( $keys as $key ) {
			if ( empty( $ring[ $key ] ) || is_array( $ring[ $key ] ) ) {
				continue;
			}
			$url = self::normalize_image_url( (string) $ring[ $key ] );
			if ( $url !== '' ) {
				return $url;
			}
		}

		return '';
	}

	private static function normalize_image_url( string $url ): string {
		$url = trim( $url );
		if ( $url === '' ) {
			return '';
		}
		if ( str_starts_with( $url, '//' ) ) {
			return 'https:' . $url;
		}

		return $url;
	}

	private static function sync_product_featured_image( WC_Product $product, string $image_url, string $sku ): void {
		if ( $image_url === '' ) {
			return;
		}

		$existing_url = (string) $product->get_meta( '_gemfindrb_source_image_url', true );
		$has_image    = (int) $product->get_image_id() > 0;
		if ( $has_image && $existing_url === $image_url ) {
			return;
		}

		$attach_id = self::sideload_featured_image( $image_url, $sku );
		if ( $attach_id > 0 ) {
			$product->set_image_id( $attach_id );
			$product->update_meta_data( '_gemfindrb_source_image_url', $image_url );
		}
	}

	private static function sideload_featured_image( string $url, string $sku ): int {
		$url = str_replace( ' ', '%20', esc_url_raw( self::normalize_image_url( $url ) ) );
		if ( $url === '' ) {
			return 0;
		}

		if ( ! function_exists( 'media_sideload_image' ) ) {
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';
		}

		$tmp = download_url( $url );
		if ( is_wp_error( $tmp ) ) {
			return 0;
		}

		$file_array = [
			'name'     => 'gemfind-' . sanitize_file_name( $sku ) . '.jpg',
			'tmp_name' => $tmp,
		];

		$id = media_handle_sideload( $file_array, 0 );
		if ( is_wp_error( $id ) ) {
			wp_delete_file( $tmp );

			return 0;
		}

		return (int) $id;
	}
}
