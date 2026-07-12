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

	private const CART_CTX_PREFIX = 'gemfindRB_cart_ctx_';
	private const CART_CTX_TTL    = 1200;

	private static bool $hooks_registered = false;

	public static function register_hooks(): void {
		if ( self::$hooks_registered ) {
			return;
		}
		self::$hooks_registered = true;

		add_filter( 'woocommerce_add_cart_item_data', [ self::class, 'add_cart_item_data_from_token' ], 10, 4 );
		add_filter( 'woocommerce_get_item_data', [ self::class, 'display_cart_item_data' ], 15, 2 );
		add_action( 'woocommerce_checkout_create_order_line_item', [ self::class, 'copy_line_meta_to_order' ], 10, 4 );
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
	 * @param array<string,mixed> $diamond
	 * @param array<string,mixed> $ring
	 */
	public static function get_add_to_cart_url_for_complete_ring( array $diamond, string $diamond_id, array $ring, string $setting_id ): string|WP_Error {
		$d_price = self::parse_price( $diamond );
		$r_price = self::parse_price( $ring );
		if ( $d_price === null && $r_price === null ) {
			return new WP_Error( 'gemfindRB_no_price', __( 'Price is not available for this complete ring.', 'gemfind-ring-builder' ), [ 'status' => 400 ] );
		}

		$price = (float) ( $d_price ?? 0 ) + (float) ( $r_price ?? 0 );
		$title = sprintf(
			/* translators: 1: ring title, 2: diamond title */
			__( 'Complete Ring: %1$s + %2$s', 'gemfind-ring-builder' ),
			(string) ( $ring['mainHeader'] ?? $setting_id ),
			self::diamond_title( $diamond, $diamond_id )
		);

		return self::build_cart_url(
			self::TYPE_COMPLETE,
			self::normalize_sku( 'CR-' . $setting_id . '-' . $diamond_id ),
			$title,
			$price,
			$title,
			array_merge( $diamond, [ '_ring' => $ring ] )
		);
	}

	/**
	 * @param array<string,mixed> $payload
	 */
	private static function build_cart_url( string $type, string $sku, string $title, ?float $price, string $details_line, array $payload ): string|WP_Error {
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
		if ( $product_id > 0 ) {
			$product = wc_get_product( $product_id );
			if ( $product instanceof WC_Product ) {
				$product->set_name( $title );
				$product->set_regular_price( (string) $price );
				$product->set_catalog_visibility( 'visible' );
				$product->update_meta_data( '_gemfind_product_type', $type );
				$product->save();
			}
		} else {
			$product = new WC_Product_Simple();
			$product->set_name( $title );
			$product->set_sku( $sku );
			$product->set_regular_price( (string) $price );
			$product->set_catalog_visibility( 'visible' );
			$product->set_manage_stock( false );
			$product->set_stock_status( 'instock' );
			$product->set_status( 'publish' );
			$product->update_meta_data( '_gemfind_product_type', $type );
			$product_id = (int) $product->save();
		}

		if ( $product_id <= 0 ) {
			return new WP_Error( 'gemfindRB_create_failed', __( 'Could not create cart product.', 'gemfind-ring-builder' ), [ 'status' => 500 ] );
		}

		$token = wp_generate_password( 24, false, false );
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
				'add-to-cart'         => $product_id,
				'quantity'            => 1,
				'gemfindRB_cart_ctx'  => $token,
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
			$item->add_meta_data( '_gemfind_product_type', sanitize_text_field( (string) $values['gemfindRB_product_type'] ), true );
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
		foreach ( [ 'price', 'fltPrice', 'FltPrice', 'settingPrice' ] as $key ) {
			if ( isset( $item[ $key ] ) && is_numeric( $item[ $key ] ) ) {
				$p = (float) $item[ $key ];
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
				$ring['metalType'] ?? '',
				$ring['settingName'] ?? '',
				$options['size'] ?? $options['ringSize'] ?? '',
			]
		);
		return implode( ' · ', array_map( 'strval', $parts ) );
	}
}
