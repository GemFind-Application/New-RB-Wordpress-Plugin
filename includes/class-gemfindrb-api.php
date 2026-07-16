<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST API — gemfind-ring-builder/v1
 */
final class GEMFINDRB_API {

	private const NS = 'gemfind-ring-builder/v1';

	/** @var list<string> */
	private const JC_PROXY_ALLOWED = [
		'AccountAuthentication',
		'GetNavigation',
		'GetRBNavigation',
		'GetFilters',
		'GetMountingList',
		'GetMountingDetail',
		'GetDiamondFilter',
		'GetColorDiamondFilter',
		'GetDiamond',
		'GetColorDiamond',
		'GetShapeByColorFilter',
		'GetDiamondDetail',
		'GetStyleSetting',
		'GetDiamondsJCOptions',
		'GetInitialFilter',
	];

	public function register_routes(): void {
		// React config
		register_rest_route( self::NS, '/reactconfig', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'handle_reactconfig' ],
			'permission_callback' => [ $this, 'is_storefront_or_admin' ],
		] );

		register_rest_route( self::NS, '/reactconfig/getcssStyle', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'handle_get_css_style' ],
			'permission_callback' => [ $this, 'is_storefront_or_admin' ],
		] );

		register_rest_route( self::NS, '/reactconfig/GetDiamondDetail', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'handle_get_diamond_detail' ],
			'permission_callback' => [ $this, 'is_storefront_or_admin' ],
		] );

		register_rest_route( self::NS, '/reactconfig/GetMountingDetail', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'handle_get_mounting_detail' ],
			'permission_callback' => [ $this, 'is_storefront_or_admin' ],
		] );

		// Billing — always active on WordPress
		register_rest_route( self::NS, '/billing/check-active-plan', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'handle_check_active_plan' ],
			'permission_callback' => [ $this, 'is_storefront_or_admin' ],
		] );

		// Shop / SMTP / CSS configuration
		$this->route( 'GET',  '/shop/configuration',  'handle_get_shop_configuration',  'is_storefront_or_admin' );
		$this->route( 'POST', '/shop/configuration',  'handle_save_shop_configuration', 'is_admin_auth' );
		$this->route( 'GET',  '/smtp/configuration',  'handle_get_smtp_configuration',  'is_admin_auth' );
		$this->route( 'POST', '/smtp/configuration',  'handle_save_smtp_configuration', 'is_admin_auth' );
		$this->route( 'GET',  '/css/configuration',   'handle_get_css_configuration',   'is_storefront_or_admin' );
		$this->route( 'POST', '/css/configuration',   'handle_save_css_configuration',  'is_admin_auth' );

		// Customer
		$this->route( 'GET',  '/customer/check-registration', 'handle_check_registration', 'is_storefront_or_admin' );
		$this->route( 'POST', '/customer/register',           'handle_register_customer',  'is_storefront_nonce_valid' );

		// Cart JSON APIs
		$this->route_with_legacy_api_alias( 'POST', '/addToCart', 'handle_add_to_cart', 'can_add_to_cart' );
		$this->route_with_legacy_api_alias( 'POST', '/addRing',   'handle_add_ring',    'can_add_to_cart' );

		register_rest_route( self::NS, '/cartadd/(?P<diamond_id>[^/]+)(?:/(?P<type>[^/]+))?', [
			[
				'methods'             => [ 'GET', 'POST' ],
				'callback'            => [ $this, 'handle_cartadd_diamond' ],
				'permission_callback' => [ $this, 'is_storefront_or_admin' ],
			],
		] );

		register_rest_route( self::NS, '/cartaddsetting/(?P<setting_id>[^/]+)', [
			[
				'methods'             => [ 'GET', 'POST' ],
				'callback'            => [ $this, 'handle_cartadd_setting' ],
				'permission_callback' => [ $this, 'is_storefront_or_admin' ],
			],
		] );

		register_rest_route( self::NS, '/completePurchase/(?P<diamond_id>[^/]+)/(?P<setting_id>[^/]+)', [
			[
				'methods'             => [ 'GET', 'POST' ],
				'callback'            => [ $this, 'handle_complete_purchase' ],
				'permission_callback' => [ $this, 'is_storefront_or_admin' ],
			],
		] );

		// Ring emails (v1 axios client posts to /api/* — Laravel legacy paths)
		$this->route_with_legacy_api_alias( 'POST', '/dropHintApi',    'handle_ring_drop_hint',    'is_storefront_nonce_valid' );
		$this->route_with_legacy_api_alias( 'POST', '/reqInfoApi',     'handle_ring_req_info',     'is_storefront_nonce_valid' );
		$this->route_with_legacy_api_alias( 'POST', '/emailFriendApi', 'handle_ring_email_friend', 'is_storefront_nonce_valid' );
		$this->route_with_legacy_api_alias( 'POST', '/scheViewApi',    'handle_ring_sche_view',    'is_storefront_nonce_valid' );

		// Diamond emails
		$this->route_with_legacy_api_alias( 'POST', '/dlDropHintApi',    'handle_diamond_drop_hint',    'is_storefront_nonce_valid' );
		$this->route_with_legacy_api_alias( 'POST', '/dlReqInfoApi',     'handle_diamond_req_info',     'is_storefront_nonce_valid' );
		$this->route_with_legacy_api_alias( 'POST', '/dlEmailFriendApi', 'handle_diamond_email_friend', 'is_storefront_nonce_valid' );
		$this->route_with_legacy_api_alias( 'POST', '/dlScheViewApi',    'handle_diamond_sche_view',    'is_storefront_nonce_valid' );

		// Complete ring emails
		$this->route_with_legacy_api_alias( 'POST', '/crDropHintApi',    'handle_cr_drop_hint',    'is_storefront_nonce_valid' );
		$this->route_with_legacy_api_alias( 'POST', '/crReqInfoApi',     'handle_cr_req_info',     'is_storefront_nonce_valid' );
		$this->route_with_legacy_api_alias( 'POST', '/crEmailFriendApi', 'handle_cr_email_friend', 'is_storefront_nonce_valid' );
		$this->route_with_legacy_api_alias( 'POST', '/crScheViewApi',    'handle_cr_sche_view',    'is_storefront_nonce_valid' );

		register_rest_route( self::NS, '/getDiamondDetailsApi/(?P<diamond_id>[^/]+)/(?P<type>[^/]+)/(?P<shop>[^/]+)/(?P<show_retailer_info>[^/]+)', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'handle_get_diamond_details_api' ],
			'permission_callback' => [ $this, 'is_storefront_or_admin' ],
		] );

		register_rest_route( self::NS, '/getDiamondDetailsApi', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'handle_get_diamond_details_query' ],
			'permission_callback' => [ $this, 'is_storefront_or_admin' ],
		] );

		register_rest_route( self::NS, '/printDiamond/(?P<shop>[^/]+)/(?P<diamond_id>[^/]+)/(?P<is_lab>[^/]+)', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'handle_print_diamond' ],
			'permission_callback' => [ $this, 'is_storefront_or_admin' ],
		] );

		// Legacy Laravel path alias (/api/printDiamond) for older storefront bundles.
		register_rest_route( self::NS, '/api/printDiamond/(?P<shop>[^/]+)/(?P<diamond_id>[^/]+)/(?P<is_lab>[^/]+)', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'handle_print_diamond' ],
			'permission_callback' => [ $this, 'is_storefront_or_admin' ],
		] );

		register_rest_route( self::NS, '/printCompleteRing/(?P<shop>[^/]+)/(?P<setting_id>[^/]+)/(?P<diamond_id>[^/]+)/(?P<is_lab>[^/]+)', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'handle_print_complete_ring' ],
			'permission_callback' => [ $this, 'is_storefront_or_admin' ],
		] );

		register_rest_route( self::NS, '/api/printCompleteRing/(?P<shop>[^/]+)/(?P<setting_id>[^/]+)/(?P<diamond_id>[^/]+)/(?P<is_lab>[^/]+)', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'handle_print_complete_ring' ],
			'permission_callback' => [ $this, 'is_storefront_or_admin' ],
		] );

		register_rest_route( self::NS, '/certificatePdf/(?P<shop>[^/]+)/(?P<diamond_id>[^/]+)/(?P<is_lab>[^/]+)', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'handle_certificate_pdf' ],
			'permission_callback' => [ $this, 'is_storefront_or_admin' ],
		] );

		register_rest_route( self::NS, '/api/certificatePdf/(?P<shop>[^/]+)/(?P<diamond_id>[^/]+)/(?P<is_lab>[^/]+)', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'handle_certificate_pdf' ],
			'permission_callback' => [ $this, 'is_storefront_or_admin' ],
		] );

		register_rest_route( self::NS, '/jcProxy/(?P<endpoint>[A-Za-z]+)', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'handle_jc_proxy_get' ],
				'permission_callback' => [ $this, 'is_storefront_or_admin' ],
			],
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'handle_jc_proxy_post' ],
				'permission_callback' => [ $this, 'is_storefront_or_admin' ],
			],
		] );

		register_rest_route( self::NS, '/jcVideoProxy', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'handle_jc_video_proxy' ],
			'permission_callback' => [ $this, 'is_storefront_or_admin' ],
		] );
	}

	private function route( string $method, string $path, string $callback, string $permission ): void {
		$permission_callback = match ( $permission ) {
			'is_admin_auth'              => [ $this, 'is_admin_auth' ],
			'is_storefront_nonce_valid'  => [ $this, 'is_storefront_nonce_valid' ],
			'can_add_to_cart'            => [ $this, 'can_add_to_cart' ],
			default                      => [ $this, 'is_storefront_or_admin' ],
		};

		register_rest_route( self::NS, $path, [
			'methods'             => $method,
			'callback'            => [ $this, $callback ],
			'permission_callback' => $permission_callback,
		] );
	}

	/**
	 * Register a route plus a Laravel-style /api/* alias (v1 email/cart axios client).
	 */
	private function route_with_legacy_api_alias( string $method, string $path, string $callback, string $permission ): void {
		$this->route( $method, $path, $callback, $permission );
		if ( str_starts_with( $path, '/' ) ) {
			$this->route( $method, '/api' . $path, $callback, $permission );
		}
	}

	public function is_admin_auth(): bool {
		return current_user_can( 'manage_options' );
	}

	public function is_storefront_nonce_valid(): bool {
		$nonce = '';
		if ( isset( $_SERVER['HTTP_X_WP_NONCE'] ) ) {
			$nonce = sanitize_text_field( wp_unslash( (string) $_SERVER['HTTP_X_WP_NONCE'] ) );
		}
		if ( $nonce === '' && isset( $_REQUEST['_wpnonce'] ) ) {
			$nonce = sanitize_text_field( wp_unslash( (string) $_REQUEST['_wpnonce'] ) );
		}
		return $nonce !== '' && (bool) wp_verify_nonce( $nonce, 'wp_rest' );
	}

	public function is_storefront_or_admin(): bool {
		return $this->is_admin_auth() || $this->is_storefront_nonce_valid();
	}

	public function can_add_to_cart( WP_REST_Request $request ): bool {
		if ( ! $this->is_storefront_nonce_valid() || ! function_exists( 'wc_get_product' ) ) {
			return false;
		}
		$body = $this->body( $request );
		$id   = sanitize_text_field( (string) ( $body['diamond_id'] ?? $body['setting_id'] ?? '' ) );
		return $id !== '';
	}

	private function shop( WP_REST_Request $req ): string {
		$s = sanitize_text_field( (string) ( $req->get_param( 'shop' ) ?? $req->get_param( 'shopDomain' ) ?? '' ) );
		return $this->normalize_shop_param( $s );
	}

	private function normalize_shop_param( string $shop ): string {
		$shop = sanitize_text_field( $shop );
		if ( $shop === '' ) {
			return gemfindRB_shop_key();
		}
		$host = wp_parse_url( $shop, PHP_URL_HOST );
		if ( is_string( $host ) && $host !== '' ) {
			return $host;
		}
		return $shop;
	}

	/** @return array<string,mixed> */
	private function body( WP_REST_Request $req ): array {
		$body = $req->get_json_params();
		return is_array( $body ) ? $body : (array) $req->get_body_params();
	}

	private function success( mixed $data = [], string $message = 'Success' ): WP_REST_Response {
		return new WP_REST_Response( [ 'status' => 'success', 'message' => $message, 'data' => $data ], 200 );
	}

	private function error( string $message, int $code = 400 ): WP_REST_Response {
		return new WP_REST_Response( [ 'status' => 'fail', 'message' => $message ], $code );
	}

	private function form_ok( string $message ): WP_REST_Response {
		return new WP_REST_Response( [ 'success' => true, 'message' => $message, 'status' => 'success' ], 200 );
	}

	private function form_fail( string $message ): WP_REST_Response {
		return new WP_REST_Response( [ 'success' => false, 'message' => $message, 'status' => 'fail' ], 200 );
	}

	// ── React config ──────────────────────────────────────────────────────────

	public function handle_reactconfig( WP_REST_Request $req ): WP_REST_Response {
		$shop = $this->shop( $req );
		$data = GEMFINDRB_JewelCloud::get_react_config( $shop );
		if ( ! $this->is_admin_auth() ) {
			unset( $data['dealerpassword'], $data['admin_email_address'], $data['from_email_address'], $data['smtp_json'] );
		}
		return new WP_REST_Response( [ 'data' => $data ], 200 );
	}

	public function handle_get_css_style( WP_REST_Request $req ): WP_REST_Response {
		$css = GEMFINDRB_JewelCloud::resolve_css_for_frontend( $this->shop( $req ) );
		return new WP_REST_Response( $css, 200 );
	}

	public function handle_get_diamond_detail( WP_REST_Request $req ): WP_REST_Response {
		$shop      = $this->shop( $req );
		$diamondId = sanitize_text_field( (string) ( $req->get_param( 'DID' ) ?? $req->get_param( 'diamond_id' ) ?? '' ) );
		$typeRaw   = $req->get_param( 'IsLabGrown' );
		$type      = ( $typeRaw === 'true' || $typeRaw === 'labcreated' ) ? 'labcreated' : 'mined';

		if ( $diamondId === '' ) {
			return $this->error( 'DID parameter is required', 400 );
		}

		$diamond = GEMFINDRB_JewelCloud::get_diamond_by_id( $diamondId, $type, $shop );
		return new WP_REST_Response( $diamond ?: new \stdClass(), 200 );
	}

	public function handle_get_mounting_detail( WP_REST_Request $req ): WP_REST_Response {
		$shop   = $this->shop( $req );
		$ringId = sanitize_text_field( (string) ( $req->get_param( 'SID' ) ?? $req->get_param( 'setting_id' ) ?? '' ) );
		$isLab  = $req->get_param( 'IsLabGrown' ) === 'true' || $req->get_param( 'IsLabSetting' ) === '1';

		if ( $ringId === '' ) {
			return $this->error( 'SID parameter is required', 400 );
		}

		$data = GEMFINDRB_JewelCloud::get_mounting_detail( $ringId, $shop, $isLab );
		return new WP_REST_Response( $data, 200 );
	}

	// ── Billing ───────────────────────────────────────────────────────────────

	public function handle_check_active_plan( WP_REST_Request $req ): WP_REST_Response {
		return $this->success(
			[
				'active'         => true,
				'hasActivePlan'  => true,
				'plan'           => 'wordpress',
				'status'         => 'active',
				'message'        => 'Ring Builder is active on this WordPress site.',
			]
		);
	}

	// ── Configuration ─────────────────────────────────────────────────────────

	public function handle_get_shop_configuration( WP_REST_Request $req ): WP_REST_Response {
		$data = GEMFINDRB_Settings::get_shop_configuration( $this->shop( $req ) );
		if ( ! $this->is_admin_auth() ) {
			unset( $data['dealerpassword'], $data['smtp_json'] );
		}
		return $this->success( $data );
	}

	public function handle_save_shop_configuration( WP_REST_Request $req ): WP_REST_Response {
		$body = $this->body( $req );
		$shop = sanitize_text_field( (string) ( $body['shop'] ?? $body['shopDomain'] ?? $this->shop( $req ) ) );
		$res  = GEMFINDRB_Settings::save_shop_configuration( $body, $shop );
		if ( is_wp_error( $res ) ) {
			return $this->error( $res->get_error_message(), (int) ( $res->get_error_data()['status'] ?? 400 ) );
		}
		if ( $res !== true ) {
			return $this->error( 'Could not save configuration', 500 );
		}
		gemfindRB_bump_asset_revision();
		return $this->success( [], 'Configuration saved' );
	}

	public function handle_get_smtp_configuration( WP_REST_Request $req ): WP_REST_Response {
		return $this->success( GEMFINDRB_Smtp::get_configuration_for_api( $this->shop( $req ) ) );
	}

	public function handle_save_smtp_configuration( WP_REST_Request $req ): WP_REST_Response {
		$body = $this->body( $req );
		$res  = GEMFINDRB_Smtp::save_configuration( $this->shop( $req ), $body );
		if ( is_wp_error( $res ) ) {
			return $this->error( $res->get_error_message(), (int) ( $res->get_error_data()['status'] ?? 400 ) );
		}
		return $this->success( [], 'SMTP configuration saved' );
	}

	public function handle_get_css_configuration( WP_REST_Request $req ): WP_REST_Response {
		return $this->success( GEMFINDRB_Settings::get_css_configuration( $this->shop( $req ) ) );
	}

	public function handle_save_css_configuration( WP_REST_Request $req ): WP_REST_Response {
		$body = $this->body( $req );
		$shop = sanitize_text_field( (string) ( $body['shop'] ?? $body['shopDomain'] ?? $this->shop( $req ) ) );
		$ok   = GEMFINDRB_Settings::save_css_configuration( $body, $shop );
		if ( ! $ok ) {
			return $this->error( 'Could not save CSS configuration', 500 );
		}
		gemfindRB_bump_asset_revision();
		return $this->success( [], 'CSS configuration saved' );
	}

	// ── Customer ──────────────────────────────────────────────────────────────

	public function handle_check_registration( WP_REST_Request $req ): WP_REST_Response {
		return $this->success(
			[ 'registered' => GEMFINDRB_Settings::is_customer_registered_for_shop( $this->shop( $req ) ) ]
		);
	}

	public function handle_register_customer( WP_REST_Request $req ): WP_REST_Response {
		$res = GEMFINDRB_Settings::save_customer( $this->body( $req ) );
		if ( is_wp_error( $res ) ) {
			return $this->error( $res->get_error_message(), (int) ( $res->get_error_data()['status'] ?? 400 ) );
		}
		return $this->success( [], 'Customer registered' );
	}

	// ── Cart ──────────────────────────────────────────────────────────────────

	public function handle_add_to_cart( WP_REST_Request $req ): WP_REST_Response {
		$body        = $this->body( $req );
		$shop        = sanitize_text_field( (string) ( $body['shop_domain'] ?? $body['shop'] ?? $this->shop( $req ) ) );
		$diamond_id  = sanitize_text_field( (string) ( $body['diamond_id'] ?? '' ) );
		// v2 sends list_type; v1 classic bundle sends diamond_type (fancydiamonds|labcreated|mined).
		$type        = sanitize_text_field( (string) ( $body['list_type'] ?? $body['diamond_type'] ?? $body['type'] ?? 'mined' ) );

		$diamond = GEMFINDRB_JewelCloud::get_diamond_by_id( $diamond_id, $type, $shop );
		if ( empty( $diamond['diamondId'] ) ) {
			return $this->error( 'Diamond not found', 404 );
		}

		$url = GEMFINDRB_Woo_Cart::get_add_to_cart_url_for_diamond( $diamond, $diamond_id );
		if ( is_wp_error( $url ) ) {
			return $this->error( $url->get_error_message(), (int) ( $url->get_error_data()['status'] ?? 400 ) );
		}

		// Object shape for v1 (success/cart_url); url key kept for v2 parseCartUrlResponse.
		return new WP_REST_Response(
			[
				'success'  => true,
				'cart_url' => $url,
				'url'      => $url,
			],
			200
		);
	}

	public function handle_add_ring( WP_REST_Request $req ): WP_REST_Response {
		$body       = $this->body( $req );
		$shop       = sanitize_text_field( (string) ( $body['shop_domain'] ?? $body['shop'] ?? $this->shop( $req ) ) );
		$setting_id = sanitize_text_field( (string) ( $body['setting_id'] ?? $body['settingId'] ?? '' ) );
		$ring       = GEMFINDRB_JewelCloud::get_ring_by_id( $setting_id, $shop, (int) ( $body['islabsettings'] ?? 0 ) );
		$ringData   = $ring['ringData'] ?? [];

		if ( empty( $ringData['settingId'] ) && empty( $ringData['settingid'] ) ) {
			return $this->error( 'Ring setting not found', 404 );
		}

		$url = GEMFINDRB_Woo_Cart::get_add_to_cart_url_for_ring( $ringData, $setting_id, $body );
		if ( is_wp_error( $url ) ) {
			return $this->error( $url->get_error_message(), (int) ( $url->get_error_data()['status'] ?? 400 ) );
		}

		return new WP_REST_Response(
			[
				'success'  => true,
				'cart_url' => $url,
				'url'      => $url,
			],
			200
		);
	}

	public function handle_cartadd_diamond( WP_REST_Request $req ) {
		$diamond_id = sanitize_text_field( (string) $req->get_param( 'diamond_id' ) );
		$type       = sanitize_text_field( (string) ( $req->get_param( 'type' ) ?? 'mined' ) );
		$shop       = sanitize_text_field( (string) ( $req->get_param( 'shop' ) ?? gemfindRB_shop_key() ) );

		$diamond = GEMFINDRB_JewelCloud::get_diamond_by_id( $diamond_id, $type, $shop );
		$url     = GEMFINDRB_Woo_Cart::get_add_to_cart_url_for_diamond( $diamond, $diamond_id );
		if ( is_wp_error( $url ) ) {
			return $this->error( $url->get_error_message(), (int) ( $url->get_error_data()['status'] ?? 400 ) );
		}
		wp_safe_redirect( $url, 302 );
		exit;
	}

	public function handle_cartadd_setting( WP_REST_Request $req ) {
		$setting_id = sanitize_text_field( (string) $req->get_param( 'setting_id' ) );
		$shop       = sanitize_text_field( (string) ( $req->get_param( 'shop' ) ?? gemfindRB_shop_key() ) );
		$ring       = GEMFINDRB_JewelCloud::get_ring_by_id( $setting_id, $shop, 0 );
		$url        = GEMFINDRB_Woo_Cart::get_add_to_cart_url_for_ring( $ring['ringData'] ?? [], $setting_id, $this->body( $req ) );
		if ( is_wp_error( $url ) ) {
			return $this->error( $url->get_error_message(), (int) ( $url->get_error_data()['status'] ?? 400 ) );
		}
		wp_safe_redirect( $url, 302 );
		exit;
	}

	public function handle_complete_purchase( WP_REST_Request $req ) {
		$diamond_id = sanitize_text_field( (string) $req->get_param( 'diamond_id' ) );
		$setting_id = sanitize_text_field( (string) $req->get_param( 'setting_id' ) );
		$shop       = sanitize_text_field( (string) ( $req->get_param( 'shop' ) ?? gemfindRB_shop_key() ) );
		$body       = $this->body( $req );
		// v2 query: type=; v1 FormData: diamondtype=
		$type       = sanitize_text_field(
			(string) (
				$body['diamondtype']
				?? $body['diamond_type']
				?? $body['list_type']
				?? $req->get_param( 'diamondtype' )
				?? $req->get_param( 'type' )
				?? 'mined'
			)
		);
		$is_lab     = (int) ( $body['islabsettings'] ?? $req->get_param( 'islabsettings' ) ?? 0 );
		$options    = array_merge(
			$body,
			array_filter(
				[
					'ringsizesettingonly' => $body['ringsizesettingonly'] ?? $req->get_param( 'ringsizesettingonly' ),
					'metaltype'           => $body['metaltype'] ?? $req->get_param( 'metaltype' ),
					'islabsettings'       => $is_lab,
				],
				static fn( $value ) => $value !== null && $value !== ''
			)
		);

		$wants_json = $this->wants_json_cart_response( $req );

		if ( $diamond_id === '' || $setting_id === '' ) {
			return $this->complete_purchase_fail( __( 'Diamond and setting are required.', 'gemfind-ring-builder' ), 400, $wants_json );
		}

		$diamond = GEMFINDRB_JewelCloud::get_diamond_by_id( $diamond_id, $type, $shop );
		if ( empty( $diamond['diamondId'] ) ) {
			return $this->complete_purchase_fail( __( 'Diamond not found', 'gemfind-ring-builder' ), 404, $wants_json );
		}

		$ring     = GEMFINDRB_JewelCloud::get_ring_by_id( $setting_id, $shop, $is_lab );
		$ringData = $ring['ringData'] ?? [];
		if ( empty( $ringData['settingId'] ) && empty( $ringData['settingid'] ) ) {
			return $this->complete_purchase_fail( __( 'Ring setting not found', 'gemfind-ring-builder' ), 404, $wants_json );
		}

		// Adds setting + diamond as two WooCommerce line items, then returns cart URL.
		$url = GEMFINDRB_Woo_Cart::get_add_to_cart_url_for_complete_ring( $diamond, $diamond_id, $ringData, $setting_id, $options );
		if ( is_wp_error( $url ) ) {
			return $this->complete_purchase_fail(
				$url->get_error_message(),
				(int) ( $url->get_error_data()['status'] ?? 400 ),
				$wants_json
			);
		}

		if ( $wants_json ) {
			// v1 Classic UI expects { success, redirect_url }.
			return new WP_REST_Response(
				[
					'success'      => true,
					'redirect_url' => $url,
					'cart_url'     => $url,
					'url'          => $url,
				],
				200
			);
		}

		// v2 navigates the browser here (GET) and follows the redirect into cart.
		wp_safe_redirect( $url, 302 );
		exit;
	}

	/**
	 * v1 axios POSTs multipart/JSON and needs a JSON body; v2 does a full-page GET and needs a redirect.
	 */
	private function wants_json_cart_response( WP_REST_Request $req ): bool {
		$accept = strtolower( (string) $req->get_header( 'accept' ) );
		if ( str_contains( $accept, 'application/json' ) ) {
			return true;
		}

		$content_type = strtolower( (string) $req->get_header( 'content-type' ) );
		if (
			str_contains( $content_type, 'multipart/form-data' )
			|| str_contains( $content_type, 'application/json' )
			|| str_contains( $content_type, 'application/x-www-form-urlencoded' )
		) {
			return true;
		}

		if ( strtolower( (string) $req->get_header( 'x-requested-with' ) ) === 'xmlhttprequest' ) {
			return true;
		}

		return (string) $req->get_param( 'format' ) === 'json';
	}

	/**
	 * @return WP_REST_Response
	 */
	private function complete_purchase_fail( string $message, int $status, bool $wants_json ): WP_REST_Response {
		if ( $wants_json ) {
			return new WP_REST_Response(
				[
					'success' => false,
					'error'   => $message,
					'message' => $message,
					'status'  => 'fail',
				],
				$status
			);
		}

		return $this->error( $message, $status );
	}

	// ── Emails ────────────────────────────────────────────────────────────────

	public function handle_ring_drop_hint( WP_REST_Request $req ): WP_REST_Response {
		$res = GEMFINDRB_Email::ring_drop_hint( GEMFINDRB_Form_Payload::normalize_ring_drop_hint( $this->body( $req ) ) );
		return is_wp_error( $res ) ? $this->form_fail( $res->get_error_message() ) : $this->form_ok( __( 'Email sent successfully.', 'gemfind-ring-builder' ) );
	}

	public function handle_ring_req_info( WP_REST_Request $req ): WP_REST_Response {
		$res = GEMFINDRB_Email::ring_req_info( GEMFINDRB_Form_Payload::normalize_ring_req_info( $this->body( $req ) ) );
		return is_wp_error( $res ) ? $this->form_fail( $res->get_error_message() ) : $this->form_ok( __( 'Request sent successfully.', 'gemfind-ring-builder' ) );
	}

	public function handle_ring_email_friend( WP_REST_Request $req ): WP_REST_Response {
		$res = GEMFINDRB_Email::ring_email_friend( GEMFINDRB_Form_Payload::normalize_ring_email_friend( $this->body( $req ) ) );
		return is_wp_error( $res ) ? $this->form_fail( $res->get_error_message() ) : $this->form_ok( __( 'Email sent successfully.', 'gemfind-ring-builder' ) );
	}

	public function handle_ring_sche_view( WP_REST_Request $req ): WP_REST_Response {
		$res = GEMFINDRB_Email::ring_schedule_viewing( GEMFINDRB_Form_Payload::normalize_ring_schedule_viewing( $this->body( $req ) ) );
		return is_wp_error( $res ) ? $this->form_fail( $res->get_error_message() ) : $this->form_ok( __( 'Appointment request sent.', 'gemfind-ring-builder' ) );
	}

	public function handle_diamond_drop_hint( WP_REST_Request $req ): WP_REST_Response {
		$res = GEMFINDRB_Email::diamond_drop_hint( GEMFINDRB_Form_Payload::normalize_diamond_drop_hint( $this->body( $req ) ) );
		return is_wp_error( $res ) ? $this->form_fail( $res->get_error_message() ) : $this->form_ok( __( 'Email sent successfully.', 'gemfind-ring-builder' ) );
	}

	public function handle_diamond_req_info( WP_REST_Request $req ): WP_REST_Response {
		$res = GEMFINDRB_Email::diamond_req_info( GEMFINDRB_Form_Payload::normalize_diamond_req_info( $this->body( $req ) ) );
		return is_wp_error( $res ) ? $this->form_fail( $res->get_error_message() ) : $this->form_ok( __( 'Request sent successfully.', 'gemfind-ring-builder' ) );
	}

	public function handle_diamond_email_friend( WP_REST_Request $req ): WP_REST_Response {
		$res = GEMFINDRB_Email::diamond_email_friend( GEMFINDRB_Form_Payload::normalize_diamond_email_friend( $this->body( $req ) ) );
		return is_wp_error( $res ) ? $this->form_fail( $res->get_error_message() ) : $this->form_ok( __( 'Email sent successfully.', 'gemfind-ring-builder' ) );
	}

	public function handle_diamond_sche_view( WP_REST_Request $req ): WP_REST_Response {
		$res = GEMFINDRB_Email::diamond_schedule_viewing( GEMFINDRB_Form_Payload::normalize_diamond_schedule_viewing( $this->body( $req ) ) );
		return is_wp_error( $res ) ? $this->form_fail( $res->get_error_message() ) : $this->form_ok( __( 'Appointment request sent.', 'gemfind-ring-builder' ) );
	}

	public function handle_cr_drop_hint( WP_REST_Request $req ): WP_REST_Response {
		$res = GEMFINDRB_Email::complete_ring_drop_hint( GEMFINDRB_Form_Payload::normalize_complete_ring( $this->body( $req ) ) );
		return is_wp_error( $res ) ? $this->form_fail( $res->get_error_message() ) : $this->form_ok( __( 'Email sent successfully.', 'gemfind-ring-builder' ) );
	}

	public function handle_cr_req_info( WP_REST_Request $req ): WP_REST_Response {
		$res = GEMFINDRB_Email::complete_ring_req_info( GEMFINDRB_Form_Payload::normalize_complete_ring( $this->body( $req ) ) );
		return is_wp_error( $res ) ? $this->form_fail( $res->get_error_message() ) : $this->form_ok( __( 'Request sent successfully.', 'gemfind-ring-builder' ) );
	}

	public function handle_cr_email_friend( WP_REST_Request $req ): WP_REST_Response {
		$res = GEMFINDRB_Email::complete_ring_email_friend( GEMFINDRB_Form_Payload::normalize_complete_ring( $this->body( $req ) ) );
		return is_wp_error( $res ) ? $this->form_fail( $res->get_error_message() ) : $this->form_ok( __( 'Email sent successfully.', 'gemfind-ring-builder' ) );
	}

	public function handle_cr_sche_view( WP_REST_Request $req ): WP_REST_Response {
		$res = GEMFINDRB_Email::complete_ring_schedule_viewing( GEMFINDRB_Form_Payload::normalize_complete_ring( $this->body( $req ) ) );
		return is_wp_error( $res ) ? $this->form_fail( $res->get_error_message() ) : $this->form_ok( __( 'Appointment request sent.', 'gemfind-ring-builder' ) );
	}

	// ── Diamond details + print ───────────────────────────────────────────────

	public function handle_get_diamond_details_api( WP_REST_Request $req ): WP_REST_Response {
		$bundle = GEMFINDRB_Email::get_diamond_details(
			sanitize_text_field( (string) $req->get_param( 'diamond_id' ) ),
			sanitize_text_field( (string) $req->get_param( 'type' ) ),
			sanitize_text_field( (string) $req->get_param( 'shop' ) ),
			sanitize_text_field( (string) $req->get_param( 'show_retailer_info' ) )
		);
		return new WP_REST_Response( array_merge( $bundle['diamond'], [ '_wpConfigData' => $bundle['configData'], '_wpShopName' => $bundle['shopName'] ] ), 200 );
	}

	public function handle_get_diamond_details_query( WP_REST_Request $req ): WP_REST_Response {
		return $this->handle_get_diamond_details_api( $req );
	}

	public function handle_print_diamond( WP_REST_Request $req ): WP_REST_Response {
		$shop       = $this->normalize_shop_param( (string) $req->get_param( 'shop' ) );
		$diamond_id = sanitize_text_field( (string) $req->get_param( 'diamond_id' ) );
		$type       = $this->normalize_print_diamond_type( (string) $req->get_param( 'is_lab' ) );

		$err = GEMFINDRB_Print::stream_pdf( $diamond_id, $type, $shop );
		if ( $err instanceof WP_Error ) {
			return $this->error( $err->get_error_message(), (int) ( $err->get_error_data()['status'] ?? 500 ) );
		}
		return new WP_REST_Response( null, 200 );
	}

	/**
	 * Map legacy is_lab segment and modern type strings to JewelCloud detail type.
	 */
	private function normalize_print_diamond_type( string $raw ): string {
		$type_raw = strtolower( trim( $raw ) );
		$allowed  = [ 'mined', 'labcreated', 'fancydiamonds', 'fancy' ];
		if ( in_array( $type_raw, $allowed, true ) ) {
			return $type_raw === 'fancy' ? 'fancydiamonds' : $type_raw;
		}
		if ( in_array( $type_raw, [ 'true', '1' ], true ) ) {
			return 'labcreated';
		}
		return 'mined';
	}

	public function handle_print_complete_ring( WP_REST_Request $req ): WP_REST_Response {
		$shop       = $this->normalize_shop_param( (string) $req->get_param( 'shop' ) );
		$setting_id = sanitize_text_field( (string) $req->get_param( 'setting_id' ) );
		$diamond_id = sanitize_text_field( (string) $req->get_param( 'diamond_id' ) );
		$type       = $this->normalize_print_diamond_type( (string) $req->get_param( 'is_lab' ) );
		$is_lab_settings = absint( $req->get_param( 'is_lab_settings' ) );

		$display_options = array_filter(
			[
				'ring_size'          => sanitize_text_field( (string) $req->get_param( 'ring_size' ) ),
				'metal_type'         => sanitize_text_field( (string) $req->get_param( 'metal_type' ) ),
				'side_stone_quality' => sanitize_text_field( (string) $req->get_param( 'side_stone_quality' ) ),
				'center_stone_min'   => sanitize_text_field( (string) $req->get_param( 'center_stone_min' ) ),
				'center_stone_max'   => sanitize_text_field( (string) $req->get_param( 'center_stone_max' ) ),
				'style_number'       => sanitize_text_field( (string) $req->get_param( 'style_number' ) ),
			],
			static fn( string $v ): bool => $v !== ''
		);

		$err = GEMFINDRB_Print::stream_complete_ring_pdf(
			$setting_id,
			$diamond_id,
			$type,
			$shop,
			$is_lab_settings,
			$display_options
		);
		if ( $err instanceof WP_Error ) {
			return $this->error( $err->get_error_message(), (int) ( $err->get_error_data()['status'] ?? 500 ) );
		}
		return new WP_REST_Response( null, 200 );
	}

	public function handle_certificate_pdf( WP_REST_Request $req ): WP_REST_Response {
		$shop            = $this->normalize_shop_param( (string) $req->get_param( 'shop' ) );
		$diamond_id      = sanitize_text_field( (string) $req->get_param( 'diamond_id' ) );
		$type            = $this->normalize_print_diamond_type( (string) $req->get_param( 'is_lab' ) );
		$certificate_url = esc_url_raw( (string) $req->get_param( 'certificate_url' ) );

		$err = GEMFINDRB_Print::stream_certificate_pdf( $diamond_id, $type, $shop, $certificate_url );
		if ( $err instanceof WP_Error ) {
			return $this->error( $err->get_error_message(), (int) ( $err->get_error_data()['status'] ?? 500 ) );
		}
		return new WP_REST_Response( null, 200 );
	}

	// ── JewelCloud proxy ──────────────────────────────────────────────────────

	public function handle_jc_proxy_get( WP_REST_Request $req ): WP_REST_Response {
		$endpoint = sanitize_text_field( (string) $req->get_param( 'endpoint' ) );
		if ( ! in_array( $endpoint, self::JC_PROXY_ALLOWED, true ) ) {
			return $this->error( 'Endpoint not allowed.', 403 );
		}
		$params = $req->get_query_params();
		unset( $params['_wpnonce'], $params['endpoint'] );
		$data = GEMFINDRB_JewelCloud::proxy_get( $endpoint, $params );
		if ( is_wp_error( $data ) ) {
			return $this->error( $data->get_error_message(), 502 );
		}
		return new WP_REST_Response( $data, 200 );
	}

	public function handle_jc_proxy_post( WP_REST_Request $req ): WP_REST_Response {
		$endpoint = sanitize_text_field( (string) $req->get_param( 'endpoint' ) );
		if ( ! in_array( $endpoint, self::JC_PROXY_ALLOWED, true ) ) {
			return $this->error( 'Endpoint not allowed.', 403 );
		}
		$data = GEMFINDRB_JewelCloud::proxy_post( $endpoint, $req->get_body() );
		if ( is_wp_error( $data ) ) {
			return $this->error( $data->get_error_message(), 502 );
		}
		// AccountAuthentication returns a JSON string; keep scalars (and unwrap plain-text { raw }).
		if ( is_array( $data ) && array_keys( $data ) === [ 'raw' ] && is_string( $data['raw'] ) ) {
			$raw = trim( $data['raw'] );
			if ( $raw !== '' && ( $raw[0] ?? '' ) !== '{' && ( $raw[0] ?? '' ) !== '[' ) {
				$data = $raw;
			}
		}
		return new WP_REST_Response( $data, 200 );
	}

	public function handle_jc_video_proxy( WP_REST_Request $req ): WP_REST_Response {
		$params = $req->get_query_params();
		unset( $params['_wpnonce'] );
		$data = GEMFINDRB_JewelCloud::proxy_video_get( $params );
		if ( is_wp_error( $data ) ) {
			return $this->error( $data->get_error_message(), 502 );
		}
		return new WP_REST_Response( $data, 200 );
	}
}
