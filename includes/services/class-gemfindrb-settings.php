<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class GEMFINDRB_Settings {

	public static function save_shop_configuration( array $data, string $shop ): bool|WP_Error {
		if ( $shop === '' ) {
			return new WP_Error( 'missing_shop', 'Shop domain is required', [ 'status' => 400 ] );
		}

		$bool = static function ( mixed $v ): int {
			return ( $v === '1' || $v === 1 || $v === 'true' || $v === true ) ? 1 : 0;
		};

		$update = [
			'dealerid'                   => sanitize_text_field( (string) ( $data['dealerId'] ?? $data['dealerid'] ?? '' ) ),
			'dealerpassword'             => sanitize_text_field( (string) ( $data['dealerpassword'] ?? $data['dealerPassword'] ?? '' ) ),
			'admin_email_address'        => sanitize_text_field( (string) ( $data['adminEmail'] ?? $data['admin_email_address'] ?? '' ) ),
			'from_email_address'         => sanitize_email( (string) ( $data['fromEmail'] ?? $data['from_email_address'] ?? '' ) ),
			'enable_hint'                => $bool( $data['enableHint'] ?? $data['enable_hint'] ?? 1 ),
			'enable_email_friend'        => $bool( $data['enableEmail'] ?? $data['enable_email_friend'] ?? 1 ),
			'enable_schedule_viewing'    => $bool( $data['enableSchedule'] ?? $data['enable_schedule_viewing'] ?? 1 ),
			'enable_more_info'           => $bool( $data['enableInfo'] ?? $data['enable_more_info'] ?? 1 ),
			'enable_print'               => $bool( $data['enablePrint'] ?? $data['enable_print'] ?? 1 ),
			'enable_admin_notification'  => $bool( $data['enableNotification'] ?? $data['enable_admin_notification'] ?? 1 ),
			'show_powered_by'            => $bool( $data['showPowered'] ?? $data['show_powered_by'] ?? 0 ),
			'default_view'               => sanitize_text_field( (string) ( $data['defaultView'] ?? $data['default_view'] ?? 'list' ) ),
			'shop_logo'                  => esc_url_raw( (string) ( $data['shopLogo'] ?? $data['shop_logo'] ?? '' ) ),
			'settings_carat_ranges'      => sanitize_textarea_field( (string) ( $data['caratRanges'] ?? $data['settings_carat_ranges'] ?? '' ) ),
			'buySingleDiamond'           => sanitize_text_field( (string) ( $data['buySingleDiamond'] ?? '0' ) ),
			'products_pp'                => (int) ( $data['productsPerPage'] ?? $data['products_pp'] ?? 12 ),
			'font_family'                => sanitize_text_field( (string) ( $data['fontFamily'] ?? $data['font_family'] ?? 'Helvetica' ) ),
			'theme_font_family'          => sanitize_text_field( (string) ( $data['themeFontFamily'] ?? $data['theme_font_family'] ?? '' ) ),
			'shop_title'                 => sanitize_text_field( (string) ( $data['shopTitle'] ?? $data['shop_title'] ?? '' ) ),
			'phone_number'               => sanitize_text_field( (string) ( $data['phoneNumber'] ?? $data['phone_number'] ?? '' ) ),
			'display_tryon'              => $bool( $data['display_tryon'] ?? $data['displayTryon'] ?? 0 ),
			'show_filter_info'           => $bool( $data['show_filter_info'] ?? $data['showFilterInfo'] ?? 0 ),
			'ring_meta_title'            => sanitize_text_field( (string) ( $data['ring_meta_title'] ?? '' ) ),
			'ring_meta_description'      => sanitize_textarea_field( (string) ( $data['ring_meta_description'] ?? '' ) ),
			'ring_meta_keywords'         => sanitize_text_field( (string) ( $data['ring_meta_keywords'] ?? '' ) ),
			'diamond_meta_title'         => sanitize_text_field( (string) ( $data['diamond_meta_title'] ?? '' ) ),
			'diamond_meta_description'   => sanitize_textarea_field( (string) ( $data['diamond_meta_description'] ?? '' ) ),
			'diamond_meta_keyword'       => sanitize_text_field( (string) ( $data['diamond_meta_keyword'] ?? '' ) ),
			'announcement_text'          => sanitize_textarea_field( (string) ( $data['announcement_text'] ?? '' ) ),
			'announcement_text_rbdetail' => sanitize_textarea_field( (string) ( $data['announcement_text_rbdetail'] ?? '' ) ),
			'diamond_details_textarea'   => sanitize_textarea_field( (string) ( $data['diamond_details_textarea'] ?? '' ) ),
			'site_key'                   => sanitize_text_field( (string) ( $data['site_key'] ?? '' ) ),
			'secret_key'                 => sanitize_text_field( (string) ( $data['secret_key'] ?? '' ) ),
			'recaptcha_version'          => strtolower( sanitize_text_field( (string) ( $data['recaptcha_version'] ?? $data['recaptchaVersion'] ?? 'v2' ) ) ) === 'v3' ? 'v3' : 'v2',
			'price_row_format'           => sanitize_text_field( (string) ( $data['price_row_format'] ?? 'left' ) ),
			'tool_version'               => GEMFINDRB_Frontend_Version::normalize(
				(string) ( $data['tool_version'] ?? $data['toolversion'] ?? GEMFINDRB_Frontend_Version::DEFAULT )
			),
		];

		if ( ( $update['dealerpassword'] ?? '' ) === '' ) {
			unset( $update['dealerpassword'] );
		}
		if ( ( $update['secret_key'] ?? '' ) === '' ) {
			unset( $update['secret_key'] );
		}

		$ok = GEMFINDRB_DB::upsert_config( $update, $shop );
		if ( ! $ok ) {
			return new WP_Error( 'db_error', 'Could not save shop configuration. Please reload the page and try again.', [ 'status' => 500 ] );
		}

		return true;
	}

	public static function get_shop_configuration( string $shop ): array {
		$cfg = GEMFINDRB_DB::get_config( $shop );
		if ( ! $cfg ) {
			return [];
		}
		$arr = (array) $cfg;
		unset( $arr['dealerpassword'], $arr['smtp_json'] );
		return $arr;
	}

	public static function save_css_configuration( array $data, string $shop ): bool {
		$existing = GEMFINDRB_DB::get_css( $shop );
		$prev     = $existing ? (array) $existing : [];

		$sanitize_colour = static function ( mixed $v ): string {
			$s = trim( (string) ( $v ?? '' ) );
			if ( $s === '' ) {
				return '';
			}
			$hex = sanitize_hex_color( $s );
			return $hex ?: $s;
		};

		$pick = static function ( string $db_key, array $aliases ) use ( $data, $prev, $sanitize_colour ): string {
			foreach ( $aliases as $alias ) {
				if ( array_key_exists( $alias, $data ) && (string) $data[ $alias ] !== '' ) {
					return $sanitize_colour( $data[ $alias ] );
				}
			}
			return (string) ( $prev[ $db_key ] ?? '' );
		};

		$row = [
			'link'                          => $pick( 'link', [ 'link', 'link_color' ] ),
			'hover'                         => $pick( 'hover', [ 'hover', 'hover_effect' ] ),
			'header'                        => $pick( 'header', [ 'header', 'column_header_accent' ] ),
			'button'                        => $pick( 'button', [ 'button', 'call_to_action_button' ] ),
			'slider'                        => $pick( 'slider', [ 'slider', 'slider_effect' ] ),
			'background'                    => $pick( 'background', [ 'background' ] ),
			'backgroundText'                => $pick( 'backgroundText', [ 'backgroundText', 'background_text_color' ] ),
			'nav_active_background_color'   => $pick( 'nav_active_background_color', [ 'nav_active_background_color' ] ),
			'nav_active_text_color'         => $pick( 'nav_active_text_color', [ 'nav_active_text_color' ] ),
			'nav_inactive_background_color' => $pick( 'nav_inactive_background_color', [ 'nav_inactive_background_color' ] ),
			'nav_inactive_text_color'       => $pick( 'nav_inactive_text_color', [ 'nav_inactive_text_color' ] ),
			'selected_theme'                => sanitize_text_field(
				(string) ( $data['selected_theme'] ?? $prev['selected_theme'] ?? 'default' )
			),
			'set_default_view'              => sanitize_text_field(
				(string) ( $data['set_default_view'] ?? $prev['set_default_view'] ?? '1' )
			),
		];

		return GEMFINDRB_DB::upsert_css( $row, $shop );
	}

	public static function get_css_configuration( string $shop ): array {
		$row = GEMFINDRB_DB::get_css( $shop );
		if ( ! $row ) {
			return self::format_css_for_admin( gemfindRB_default_css_row() );
		}
		return self::format_css_for_admin( (array) $row );
	}

	/**
	 * Admin + storefront aliases (matches Shopify css-configuration API shape).
	 *
	 * @param array<string, mixed> $row
	 * @return array<string, mixed>
	 */
	public static function format_css_for_admin( array $row ): array {
		$set_default = $row['set_default_view'] ?? '1';
		return [
			'link'                          => (string) ( $row['link'] ?? '' ),
			'hover'                         => (string) ( $row['hover'] ?? '' ),
			'header'                        => (string) ( $row['header'] ?? '' ),
			'button'                        => (string) ( $row['button'] ?? '' ),
			'slider'                        => (string) ( $row['slider'] ?? '' ),
			'background'                    => (string) ( $row['background'] ?? '' ),
			'backgroundText'                => (string) ( $row['backgroundText'] ?? '' ),
			'nav_active_background_color'   => (string) ( $row['nav_active_background_color'] ?? '' ),
			'nav_active_text_color'         => (string) ( $row['nav_active_text_color'] ?? '' ),
			'nav_inactive_background_color' => (string) ( $row['nav_inactive_background_color'] ?? '' ),
			'nav_inactive_text_color'       => (string) ( $row['nav_inactive_text_color'] ?? '' ),
			'selected_theme'                => (string) ( $row['selected_theme'] ?? 'default' ),
			'set_default_view'              => (string) $set_default,
			'link_color'                    => (string) ( $row['link'] ?? '' ),
			'hover_effect'                  => (string) ( $row['hover'] ?? '' ),
			'column_header_accent'          => (string) ( $row['header'] ?? '' ),
			'call_to_action_button'         => (string) ( $row['button'] ?? '' ),
			'slider_effect'                 => (string) ( $row['slider'] ?? '' ),
			'background_text_color'         => (string) ( $row['backgroundText'] ?? '' ),
			'view_type'                     => ( (string) $set_default === '1' ) ? 'default' : 'current',
		];
	}

	public static function is_customer_registered_for_shop( string $shop ): bool {
		if ( $shop === '' ) {
			return false;
		}
		if ( GEMFINDRB_DB::get_customer( $shop ) !== null ) {
			return true;
		}
		$cfg = GEMFINDRB_DB::get_config( $shop );
		if ( ! $cfg ) {
			return false;
		}
		$v = $cfg->customer_registered ?? 0;
		return (string) $v === '1' || (int) $v === 1;
	}

	public static function save_customer( array $data ): bool|WP_Error {
		$shop = sanitize_text_field(
			(string) ( $data['shop'] ?? $data['shopDomain'] ?? $data['shop_domain'] ?? gemfindRB_shop_key() )
		);
		if ( $shop === '' ) {
			return new WP_Error( 'missing_shop', 'Shop domain is required', [ 'status' => 400 ] );
		}

		$customer = [
			'name'       => sanitize_text_field( (string) ( $data['name'] ?? $data['fullName'] ?? '' ) ),
			'email'      => sanitize_email( (string) ( $data['email'] ?? $data['contactEmail'] ?? '' ) ),
			'phone'      => sanitize_text_field( (string) ( $data['phone'] ?? $data['phoneNumber'] ?? $data['telephone'] ?? '' ) ),
			'business'   => sanitize_text_field( (string) ( $data['business'] ?? '' ) ),
			'telephone'  => sanitize_text_field( (string) ( $data['telephone'] ?? $data['phone'] ?? '' ) ),
			'address'    => sanitize_textarea_field( (string) ( $data['address'] ?? '' ) ),
			'city'       => sanitize_text_field( (string) ( $data['city'] ?? '' ) ),
			'state'      => sanitize_text_field( (string) ( $data['state'] ?? '' ) ),
			'country'    => sanitize_text_field( (string) ( $data['country'] ?? '' ) ),
			'zip_code'   => sanitize_text_field( (string) ( $data['zip_code'] ?? '' ) ),
			'website'    => esc_url_raw( (string) ( $data['website'] ?? '' ) ),
			'notes'      => sanitize_textarea_field( (string) ( $data['notes'] ?? '' ) ),
			'updated_at' => current_time( 'mysql' ),
		];

		if ( ! GEMFINDRB_DB::upsert_customer( $customer, $shop ) ) {
			return new WP_Error( 'db_error', 'Could not save customer', [ 'status' => 500 ] );
		}

		GEMFINDRB_DB::mark_customer_registered_in_config( $shop );
		return true;
	}
}
