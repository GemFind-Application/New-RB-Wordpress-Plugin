<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * JewelCloud RingBuilder API client (server-side wp_remote_get/post).
 */
final class GEMFINDRB_JewelCloud {

	private const JC_BASE = 'https://api.jewelcloud.com/api/RingBuilder/';

	/**
	 * @return array<string,string>
	 */
	public static function canonical_api_urls(): array {
		return [
			'dealerauthapi'        => self::JC_BASE . 'AccountAuthentication',
			'ringfiltersapi'       => self::JC_BASE . 'GetFilters?',
			'mountinglistapi'      => self::JC_BASE . 'GetMountingList?',
			'mountinglistapifancy' => self::JC_BASE . 'GetMountingDetail?',
			'mountingdetailapi'    => self::JC_BASE . 'GetMountingDetail?',
			'ringstylesettingsapi' => self::JC_BASE . 'GetStyleSetting?',
			'navigationapi'        => self::JC_BASE . 'GetNavigation?',
			'navigationapirb'      => self::JC_BASE . 'GetRBNavigation?',
			'filterapi'            => self::JC_BASE . 'GetDiamondFilter?',
			'filterapifancy'       => self::JC_BASE . 'GetColorDiamondFilter?',
			'diamondlistapi'       => self::JC_BASE . 'GetDiamond?',
			'diamondlistapifancy'  => self::JC_BASE . 'GetColorDiamond?',
			'diamondshapeapi'      => self::JC_BASE . 'GetShapeByColorFilter?',
			'diamonddetailapi'     => self::JC_BASE . 'GetDiamondDetail?',
			'stylesettingapi'      => self::JC_BASE . 'GetStyleSetting?',
			'diamondsoptionapi'    => self::JC_BASE . 'GetDiamondsJCOptions?',
		];
	}

	public static function ensure_https_url( string $url ): string {
		if ( ! str_starts_with( $url, 'http://' ) ) {
			return $url;
		}
		$host = strtolower( (string) wp_parse_url( $url, PHP_URL_HOST ) );
		if ( str_ends_with( $host, 'jewelcloud.com' ) ) {
			return 'https://' . substr( $url, strlen( 'http://' ) );
		}
		return $url;
	}

	/**
	 * @return array{is_auth:bool,message:string}
	 */
	public static function account_authentication( string $dealer_id, string $password = '' ): array {
		if ( trim( $dealer_id ) === '' ) {
			return [
				'is_auth' => false,
				'message' => __( 'Dealer ID is not set.', 'gemfind-ring-builder' ),
			];
		}

		$response = wp_remote_post(
			self::JC_BASE . 'AccountAuthentication',
			[
				'body'      => wp_json_encode( [ 'DealerID' => $dealer_id, 'Password' => $password ] ),
				'headers'   => [ 'Content-Type' => 'application/json' ],
				'timeout'   => 15,
				'sslverify' => gemfindRB_http_sslverify(),
			]
		);

		if ( is_wp_error( $response ) ) {
			return [ 'is_auth' => false, 'message' => $response->get_error_message() ];
		}

		$data = json_decode( (string) wp_remote_retrieve_body( $response ), true );
		$is_auth = is_array( $data ) && (
			( isset( $data['IsAuth'] ) && strtolower( (string) $data['IsAuth'] ) === 'true' ) ||
			( isset( $data['is_auth'] ) && (bool) $data['is_auth'] )
		);

		return [
			'is_auth' => $is_auth,
			'message' => $is_auth ? 'Authenticated' : (string) ( $data['message'] ?? 'Authentication failed' ),
		];
	}

	public static function get_style_settings( string $shop ): array {
		$cfg       = GEMFINDRB_DB::get_config( $shop );
		$dealer_id = is_object( $cfg ) ? trim( (string) ( $cfg->dealerid ?? '' ) ) : '';
		if ( $dealer_id === '' ) {
			return [];
		}

		$url = self::ensure_https_url( self::JC_BASE . 'GetStyleSetting?DealerID=' . rawurlencode( $dealer_id ) );
		$raw = self::http_get( $url );
		$data = json_decode( $raw, true );

		return is_array( $data ) ? $data : [];
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get_diamond_by_id( string $diamond_id, string $type, string $shop ): array {
		$cfg = GEMFINDRB_DB::get_config( $shop );
		if ( ! $cfg ) {
			return [];
		}

		$detail_url = ! empty( $cfg->diamonddetailapi )
			? (string) $cfg->diamonddetailapi
			: self::JC_BASE . 'GetDiamondDetail?';

		$type_param = self::diamond_type_query_params( $type );

		$dealer = trim( (string) ( $cfg->dealerid ?? '' ) );
		if ( $dealer === '' ) {
			return [];
		}

		$base = rtrim( self::ensure_https_url( $detail_url ), '?&' );
		$url  = $base . '?DealerID=' . rawurlencode( $dealer ) . '&DID=' . rawurlencode( $diamond_id ) . $type_param;
		$data = json_decode( self::http_get( $url ), true );

		if ( is_array( $data ) ) {
			$data = self::normalize_diamond_detail( $data );
		}

		if ( is_array( $data ) && ! empty( $data['diamondId'] ) ) {
			$cfg_row = GEMFINDRB_DB::get_config( $shop );
			$data['buySingleDiamond'] = is_object( $cfg_row ) ? (string) ( $cfg_row->buySingleDiamond ?? '0' ) : '0';
			return $data;
		}

		return [];
	}

	/**
	 * Query flags for JewelCloud GetDiamondDetail (matches Laravel DiamondLibService).
	 */
	private static function diamond_type_query_params( string $type ): string {
		$t = strtolower( sanitize_text_field( $type ) );
		$is_lab   = in_array( $t, [ 'labcreated', 'labgrown', 'lab' ], true );
		$is_fancy = in_array( $t, [ 'fancydiamonds', 'fancy', 'fancy-diamonds' ], true );
		$params   = '&IslabGrown=' . ( $is_lab ? 'true' : 'false' );
		if ( $is_fancy ) {
			$params .= '&IsFancy=true';
		}
		return $params;
	}

	/**
	 * Normalize JC detail payload to consistent keys used by emails and print views.
	 *
	 * @param array<string,mixed> $raw
	 * @return array<string,mixed>
	 */
	public static function normalize_diamond_detail( array $raw ): array {
		$d = $raw;
		if ( isset( $raw['diamondData'] ) && is_array( $raw['diamondData'] ) ) {
			$d = array_merge( $raw, $raw['diamondData'] );
		}

		$measurement = self::resolve_diamond_measurement( $d );

		return array_merge(
			$d,
			[
				'diamondId'   => (string) ( $d['diamondId'] ?? $d['lotNumber'] ?? '' ),
				'caratWeight' => (string) ( $d['caratWeight'] ?? $d['carat'] ?? '' ),
				'cut'         => self::resolve_diamond_cut( $d ),
				'measurement' => $measurement,
				'measurements'=> $measurement,
				'certificate' => (string) ( $d['certificate'] ?? $d['cert'] ?? '' ),
				'depth'       => (string) ( $d['depth'] ?? $d['depthPercent'] ?? '' ),
				'table'       => (string) ( $d['table'] ?? $d['tablePercent'] ?? '' ),
				'clarity'     => (string) ( $d['clarity'] ?? '' ),
				'color'       => (string) ( $d['color'] ?? '' ),
				'fltPrice'    => $d['fltPrice'] ?? $d['price'] ?? null,
			]
		);
	}

	/**
	 * @param array<string,mixed> $diamond
	 */
	private static function resolve_diamond_cut( array $diamond ): string {
		foreach ( [ 'cut', 'txtCutGrade', 'cutGrade', 'txtCut' ] as $key ) {
			if ( ! empty( $diamond[ $key ] ) ) {
				return trim( (string) $diamond[ $key ] );
			}
		}
		return '';
	}

	/**
	 * @param array<string,mixed> $diamond
	 */
	private static function resolve_diamond_measurement( array $diamond ): string {
		foreach ( [ 'measurement', 'measurements', 'measurment', 'dimension', 'dimensions' ] as $key ) {
			if ( ! empty( $diamond[ $key ] ) ) {
				return trim( (string) $diamond[ $key ] );
			}
		}

		$length = $diamond['length'] ?? $diamond['mmLength'] ?? $diamond['diameter'] ?? '';
		$width  = $diamond['width'] ?? $diamond['mmWidth'] ?? '';
		$depth  = $diamond['depthmm'] ?? $diamond['mmDepth'] ?? $diamond['depthMM'] ?? '';

		if ( $length !== '' && $width !== '' && $depth !== '' ) {
			return trim( (string) $length ) . 'X' . trim( (string) $width ) . 'X' . trim( (string) $depth );
		}

		return '';
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get_mounting_detail( string $ring_id, string $shop, bool $is_lab_setting = false ): array {
		$cfg = GEMFINDRB_DB::get_config( $shop );
		if ( ! $cfg ) {
			return [];
		}

		$dealer = trim( (string) ( $cfg->dealerid ?? '' ) );
		if ( $dealer === '' ) {
			return [];
		}

		$api = ! empty( $cfg->mountingdetailapi )
			? (string) $cfg->mountingdetailapi
			: self::JC_BASE . 'GetMountingDetail?';

		$base = rtrim( self::ensure_https_url( $api ), '?&' );
		$url  = $base . '?DealerID=' . rawurlencode( $dealer ) . '&SID=' . rawurlencode( $ring_id );
		if ( $is_lab_setting ) {
			$url .= '&IsLabSetting=1';
		}

		$data = json_decode( self::http_get( $url ), true );
		return is_array( $data ) ? $data : [];
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get_ring_by_id( string $ring_id, string $shop, int $is_lab_settings = 0 ): array {
		$cfg = GEMFINDRB_DB::get_config( $shop );
		if ( ! $cfg ) {
			return [ 'ringData' => [], 'message' => 'Shop configuration not found.' ];
		}

		$dealer = trim( (string) ( $cfg->dealerid ?? '' ) );
		if ( $dealer === '' ) {
			return [ 'ringData' => [], 'message' => 'Dealer ID not configured.' ];
		}

		$api = ! empty( $cfg->mountinglistapifancy )
			? (string) $cfg->mountinglistapifancy
			: ( ! empty( $cfg->mountingdetailapi )
				? (string) $cfg->mountingdetailapi
				: ( ! empty( $cfg->mountinglistapi ) ? (string) $cfg->mountinglistapi : self::JC_BASE . 'GetMountingDetail?' ) );

		$base = rtrim( self::ensure_https_url( $api ), '?&' );
		$url  = $base . '?DealerID=' . rawurlencode( $dealer ) . '&SID=' . rawurlencode( $ring_id );
		if ( $is_lab_settings === 1 ) {
			$url .= '&IsLabSetting=1';
		}

		$result = json_decode( self::http_get( $url ), true );
		if ( ! is_array( $result ) ) {
			return [ 'ringData' => [], 'message' => 'Gemfind: An error has occurred.' ];
		}
		if ( ! empty( $result['message'] ) ) {
			return [ 'ringData' => [], 'message' => (string) $result['message'] ];
		}
		if ( ! empty( $result['settingId'] ) ) {
			return [ 'ringData' => $result ];
		}

		return [ 'ringData' => [] ];
	}

	/**
	 * JewelCloud GetNavigation row for a dealer (cached per request).
	 *
	 * @return array<string,mixed>
	 */
	public static function get_dealer_navigation_row( string $dealer_id ): array {
		static $cache = [];

		$dealer_id = trim( $dealer_id );
		if ( $dealer_id === '' ) {
			return [];
		}
		if ( isset( $cache[ $dealer_id ] ) ) {
			return $cache[ $dealer_id ];
		}

		$url  = self::JC_BASE . 'GetNavigation?DealerId=' . rawurlencode( $dealer_id );
		$data = json_decode( self::http_get( $url ), true );
		$row  = ( is_array( $data ) && isset( $data[0] ) && is_array( $data[0] ) ) ? $data[0] : [];
		$cache[ $dealer_id ] = $row;

		return $row;
	}

	/**
	 * Truthy JC navigation flags (e.g. navAdvanced may be the label "Advanced", not "1").
	 *
	 * @param mixed $value
	 */
	private static function jc_nav_flag_enabled( $value ): bool {
		if ( $value === null || $value === '' || $value === false || $value === 0 || $value === '0' ) {
			return false;
		}
		return true;
	}

	/**
	 * Build reactconfig payload (sans secrets).
	 *
	 * @return array<string,mixed>
	 */
	public static function get_react_config( string $shop ): array {
		$cfg = GEMFINDRB_DB::get_config( $shop );
		if ( ! $cfg ) {
			return [ 'shop' => $shop ];
		}

		$arr = (array) $cfg;
		unset( $arr['dealerpassword'], $arr['smtp_json'], $arr['shop_access_token'] );

		// V1 SettingDetails reads mountinglistapifancy for single-setting fetches (Shopify parity).
		if ( empty( $arr['mountinglistapifancy'] ) ) {
			$arr['mountinglistapifancy'] = ! empty( $arr['mountingdetailapi'] )
				? (string) $arr['mountingdetailapi']
				: self::JC_BASE . 'GetMountingDetail?';
		}

		foreach ( [ 'display_tryon', 'show_filter_info', 'enable_sticky_header', 'enable_hint', 'enable_email_friend', 'enable_schedule_viewing', 'enable_more_info', 'enable_print', 'enable_admin_notification', 'show_powered_by', 'show_copyright', 'load_from_woocommerce' ] as $bool_key ) {
			if ( array_key_exists( $bool_key, $arr ) ) {
				$arr[ $bool_key ] = ( (int) $arr[ $bool_key ] === 1 ) ? '1' : '0';
			}
		}

		foreach ( $arr as $key => $val ) {
			if ( is_string( $val ) && $val !== '' ) {
				$arr[ $key ] = self::ensure_https_url( $val );
			}
		}

		$rest_base = rtrim( rest_url( 'gemfind-ring-builder/v1' ), '/' );
		$arr['jc_api_url'] = $rest_base . '/jcProxy';
		$arr['videoapi']    = $rest_base . '/jcVideoProxy?';

		// V1 classic bundle gates "Advance Search" on this flag (not navAdvanced from GetNavigation).
		$dealer_id = trim( (string) ( $arr['dealerid'] ?? '' ) );
		$nav       = self::get_dealer_navigation_row( $dealer_id );
		if ( $nav !== [] ) {
			$arr['show_Advance_options_as_Default_in_Diamond_Search'] = self::jc_nav_flag_enabled( $nav['navAdvanced'] ?? null ) ? '1' : '0';
		} elseif ( empty( $arr['show_Advance_options_as_Default_in_Diamond_Search'] ) ) {
			$arr['show_Advance_options_as_Default_in_Diamond_Search'] = '1';
		}

		return $arr;
	}

	/**
	 * CSS precedence: DB → JC API → defaults.
	 *
	 * @return array<string,mixed>
	 */
	public static function resolve_css_for_frontend( string $shop ): array {
		$row = GEMFINDRB_DB::get_css( $shop );
		if ( $row && self::has_valid_db_colors( $row ) ) {
			return (array) $row;
		}

		$style = self::get_style_settings( $shop );
		if ( ! empty( $style['settings'] ) && is_array( $style['settings'] ) ) {
			$from_api = self::process_jc_api_colors( $style['settings'] );
			if ( self::has_valid_color_map( $from_api ) ) {
				$from_api['set_default_view'] = 1;
				return $from_api;
			}
		}

		$defaults = function_exists( 'gemfindRB_default_css_row' ) ? gemfindRB_default_css_row() : [];
		$defaults['set_default_view'] = 1;
		return $defaults;
	}

	private static function has_valid_db_colors( object $cssData ): bool {
		foreach ( [ 'link', 'hover', 'header', 'button', 'slider', 'background', 'backgroundText' ] as $key ) {
			$val = $cssData->$key ?? null;
			if ( empty( $val ) || ! self::is_valid_hex_color( (string) $val ) ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * @param array<string,mixed> $colors
	 */
	private static function has_valid_color_map( array $colors ): bool {
		foreach ( [ 'link', 'hover', 'header', 'button' ] as $key ) {
			if ( empty( $colors[ $key ] ) ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * @param array<string,mixed> $settings
	 * @return array<string,string>
	 */
	private static function process_jc_api_colors( array $settings ): array {
		$pick = static function ( array $setting ): ?string {
			$c2 = $setting['color2'] ?? '';
			$c1 = $setting['color1'] ?? '';
			if ( is_string( $c2 ) && $c2 !== '' && self::is_valid_hex_color( $c2 ) ) {
				return $c2;
			}
			return ( is_string( $c1 ) && $c1 !== '' && self::is_valid_hex_color( $c1 ) ) ? $c1 : null;
		};

		$colors = [];
		if ( isset( $settings['hoverEffect'][0] ) && is_array( $settings['hoverEffect'][0] ) ) {
			$colors['hover'] = $pick( $settings['hoverEffect'][0] ) ?? '#AC8888';
		}
		if ( isset( $settings['columnHeaderAccent'][0] ) && is_array( $settings['columnHeaderAccent'][0] ) ) {
			$colors['header'] = $pick( $settings['columnHeaderAccent'][0] ) ?? '#252A25';
		}
		if ( isset( $settings['linkColor'][0] ) && is_array( $settings['linkColor'][0] ) ) {
			$colors['link'] = $pick( $settings['linkColor'][0] ) ?? '#000000';
		}
		if ( isset( $settings['callToActionButton'][0] ) && is_array( $settings['callToActionButton'][0] ) ) {
			$colors['button'] = $pick( $settings['callToActionButton'][0] ) ?? '#FF5722';
		}

		$colors['slider']         = $colors['slider'] ?? '#0973ba';
		$colors['background']     = '#ffffff';
		$colors['backgroundText'] = '#ffffff';

		return $colors;
	}

	private static function is_valid_hex_color( string $color ): bool {
		$color = ltrim( trim( $color ), '#' );
		return (bool) preg_match( '/^(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/', $color );
	}

	public static function proxy_get( string $endpoint, array $params = [] ): array|WP_Error {
		$url = self::JC_BASE . $endpoint;
		if ( $params !== [] ) {
			$url .= '?' . http_build_query( $params );
		}

		$response = wp_remote_get(
			self::ensure_https_url( $url ),
			[
				'timeout'   => 30,
				'sslverify' => gemfindRB_http_sslverify(),
				'headers'   => [
					'Accept'     => 'application/json',
					'User-Agent' => 'WP-RB/' . GEMFINDRB_VERSION,
				],
			]
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$raw  = (string) wp_remote_retrieve_body( $response );
		$data = json_decode( $raw, true );

		return is_array( $data ) ? $data : [ 'raw' => $raw ];
	}

	public static function proxy_post( string $endpoint, string $body ): array|WP_Error {
		$response = wp_remote_post(
			self::ensure_https_url( self::JC_BASE . $endpoint ),
			[
				'body'      => $body,
				'headers'   => [ 'Content-Type' => 'application/json' ],
				'timeout'   => 30,
				'sslverify' => gemfindRB_http_sslverify(),
			]
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$raw  = (string) wp_remote_retrieve_body( $response );
		$data = json_decode( $raw, true );

		return is_array( $data ) ? $data : [ 'raw' => $raw ];
	}

	/**
	 * @param array<string, scalar> $params
	 * @return array<string,mixed>|WP_Error
	 */
	public static function proxy_video_get( array $params = [] ): array|WP_Error {
		$url = 'https://api.jewelcloud.com/api/jewelry/GetVideoUrl';
		if ( $params !== [] ) {
			$url .= '?' . http_build_query( $params );
		}

		$response = wp_remote_get(
			self::ensure_https_url( $url ),
			[
				'timeout'   => 30,
				'sslverify' => gemfindRB_http_sslverify(),
				'headers'   => [
					'Accept'     => 'application/json',
					'User-Agent' => 'WP-RB/' . GEMFINDRB_VERSION,
				],
			]
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$raw  = (string) wp_remote_retrieve_body( $response );
		$data = json_decode( $raw, true );

		return is_array( $data ) ? $data : [ 'raw' => $raw ];
	}

	private static function http_get( string $url ): string {
		$response = wp_remote_get(
			self::ensure_https_url( $url ),
			[ 'timeout' => 20, 'sslverify' => gemfindRB_http_sslverify() ]
		);
		if ( is_wp_error( $response ) ) {
			return '';
		}
		return (string) wp_remote_retrieve_body( $response );
	}
}
