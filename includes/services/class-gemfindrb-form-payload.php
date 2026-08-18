<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Normalizes storefront JSON to fields expected by GEMFINDRB_Email.
 */
final class GEMFINDRB_Form_Payload {

	public static function resolve_shop( array $v ): string {
		$s = $v['shop'] ?? $v['shopurl'] ?? $v['shop_domain'] ?? $v['shopDomain'] ?? '';
		$s = sanitize_text_field( (string) $s );
		return $s !== '' ? $s : gemfindRB_shop_key();
	}

	private static function resolve_diamond_type( array $v ): string {
		$direct = (string) ( $v['diamondType'] ?? $v['diamondtype'] ?? $v['type'] ?? '' );
		$direct = sanitize_text_field( $direct );
		if ( $direct !== '' ) {
			$d = strtolower( $direct );
			if ( in_array( $d, [ 'labcreated', 'mined', 'fancydiamonds' ], true ) ) {
				return $d;
			}
			if ( $d === 'fancy' ) {
				return 'fancydiamonds';
			}
		}

		$is_lab = $v['is_lab'] ?? $v['isLabGrown'] ?? $v['isLabSetting'] ?? $v['islabsettings'] ?? null;
		if ( $is_lab === true || $is_lab === 'true' || $is_lab === 1 || $is_lab === '1' ) {
			return 'labcreated';
		}

		return 'mined';
	}

	private static function resolve_is_lab_setting( array $v ): int {
		$raw = $v['islabsettings'] ?? $v['isLabSetting'] ?? $v['is_lab_setting'] ?? 0;
		if ( $raw === true || $raw === 'true' || $raw === 1 || $raw === '1' ) {
			return 1;
		}
		return 0;
	}

	/**
	 * v2 sends avail_date; v1 sends availability_date. Date may be null when no store hours are configured.
	 *
	 * @param array<string,mixed> $v
	 */
	private static function resolve_schedule_date( array $v ): string {
		$raw = $v['availability_date'] ?? $v['appointmentDate'] ?? $v['avail_date'] ?? null;
		if ( $raw === null || $raw === '' || $raw === 'null' ) {
			return '';
		}
		if ( is_numeric( $raw ) ) {
			return gmdate( 'Y-m-d', (int) $raw );
		}
		$raw = trim( (string) $raw );
		if ( preg_match( '/^(\d{4}-\d{2}-\d{2})/', $raw, $m ) ) {
			return $m[1];
		}
		return $raw;
	}

	/**
	 * @param array<string,mixed> $v
	 */
	private static function resolve_schedule_message( array $v ): string {
		return (string) ( $v['schl_message'] ?? $v['hint_message'] ?? $v['message'] ?? '' );
	}

	/**
	 * Ring specs shown on PDP — forwarded in email forms when available.
	 *
	 * @param array<string,mixed> $v
	 * @return array<string,string>
	 */
	private static function ring_spec_fields_from_request( array $v ): array {
		return [
			'metalType'   => (string) ( $v['metalType'] ?? $v['metaltype'] ?? '' ),
			'min_carat'   => (string) ( $v['min_carat'] ?? '' ),
			'max_carat'   => (string) ( $v['max_carat'] ?? '' ),
			'styleNumber' => (string) ( $v['styleNumber'] ?? $v['stylenumber'] ?? '' ),
			'price'       => (string) ( $v['price'] ?? '' ),
		];
	}

	/**
	 * @param array<string,mixed> $v
	 * @return array<string,mixed>
	 */
	public static function normalize_ring_drop_hint( array $v ): array {
		return array_merge(
			[
				'name'                 => (string) ( $v['name'] ?? '' ),
				'email'                => (string) ( $v['email'] ?? '' ),
				'hint_Recipient_name'  => (string) ( $v['hint_Recipient_name'] ?? $v['recipient_name'] ?? '' ),
				'hint_Recipient_email' => (string) ( $v['hint_Recipient_email'] ?? $v['recipient_email'] ?? '' ),
				'reason_of_gift'       => (string) ( $v['reason_of_gift'] ?? $v['gift_reason'] ?? '' ),
				'hint_message'         => (string) ( $v['hint_message'] ?? $v['message'] ?? '' ),
				'deadline'             => (string) ( $v['deadline'] ?? $v['gift_deadline'] ?? '' ),
				'ring_url'             => (string) ( $v['ring_url'] ?? $v['ringurl'] ?? '' ),
				'settingid'            => (string) ( $v['settingid'] ?? $v['settingId'] ?? '' ),
				'shopurl'              => self::resolve_shop( $v ),
				'islabsettings'        => self::resolve_is_lab_setting( $v ),
			],
			self::ring_spec_fields_from_request( $v )
		);
	}

	/**
	 * @param array<string,mixed> $v
	 * @return array<string,mixed>
	 */
	public static function normalize_ring_req_info( array $v ): array {
		return array_merge(
			[
				'name'                => (string) ( $v['name'] ?? '' ),
				'email'               => (string) ( $v['email'] ?? '' ),
				'phone_no'            => (string) ( $v['phone_no'] ?? $v['phone'] ?? '' ),
				'message'             => (string) ( $v['message'] ?? $v['hint_message'] ?? '' ),
				'contact_preference'  => (string) ( $v['contact_preference'] ?? $v['contact_pref'] ?? '' ),
				'ring_url'            => (string) ( $v['ring_url'] ?? $v['ringurl'] ?? '' ),
				'settingid'           => (string) ( $v['settingid'] ?? $v['settingId'] ?? '' ),
				'shopurl'             => self::resolve_shop( $v ),
				'islabsettings'       => self::resolve_is_lab_setting( $v ),
			],
			self::ring_spec_fields_from_request( $v )
		);
	}

	/**
	 * @param array<string,mixed> $v
	 * @return array<string,mixed>
	 */
	public static function normalize_ring_email_friend( array $v ): array {
		return array_merge(
			[
				'name'          => (string) ( $v['name'] ?? '' ),
				'email'         => (string) ( $v['email'] ?? '' ),
				'frnd_name'     => (string) ( $v['frnd_name'] ?? $v['friendsname'] ?? $v['recipientName'] ?? $v['friend_name'] ?? '' ),
				'frnd_email'    => (string) ( $v['frnd_email'] ?? $v['recipientEmail'] ?? $v['friend_email'] ?? '' ),
				'frnd_message'  => (string) ( $v['frnd_message'] ?? $v['message'] ?? '' ),
				'ring_url'      => (string) ( $v['ring_url'] ?? $v['ringurl'] ?? '' ),
				'settingid'     => (string) ( $v['settingid'] ?? $v['settingId'] ?? '' ),
				'shopurl'       => self::resolve_shop( $v ),
				'islabsettings' => self::resolve_is_lab_setting( $v ),
			],
			self::ring_spec_fields_from_request( $v )
		);
	}

	/**
	 * @param array<string,mixed> $v
	 * @return array<string,mixed>
	 */
	public static function normalize_ring_schedule_viewing( array $v ): array {
		return array_merge(
			[
				'name'              => (string) ( $v['name'] ?? '' ),
				'email'             => (string) ( $v['email'] ?? '' ),
				'phone_no'          => (string) ( $v['phone_no'] ?? $v['phone'] ?? '' ),
				'schl_message'      => self::resolve_schedule_message( $v ),
				'location'          => (string) ( $v['location'] ?? '' ),
				'availability_date' => self::resolve_schedule_date( $v ),
				'appnt_time'        => (string) ( $v['appnt_time'] ?? '' ),
				'ring_url'          => (string) ( $v['ring_url'] ?? $v['ringurl'] ?? '' ),
				'settingid'         => (string) ( $v['settingid'] ?? $v['settingId'] ?? '' ),
				'shopurl'           => self::resolve_shop( $v ),
				'islabsettings'     => self::resolve_is_lab_setting( $v ),
			],
			self::ring_spec_fields_from_request( $v )
		);
	}

	/**
	 * @param array<string,mixed> $v
	 * @return array<string,mixed>
	 */
	public static function normalize_diamond_drop_hint( array $v ): array {
		return [
			'senderName'     => (string) ( $v['senderName'] ?? $v['name'] ?? '' ),
			'senderEmail'    => (string) ( $v['senderEmail'] ?? $v['email'] ?? '' ),
			'recipientName'  => (string) ( $v['recipientName'] ?? $v['hint_Recipient_name'] ?? $v['recipient_name'] ?? '' ),
			'recipientEmail' => (string) ( $v['recipientEmail'] ?? $v['hint_Recipient_email'] ?? $v['recipient_email'] ?? '' ),
			'reason_of_gift' => (string) ( $v['reason_of_gift'] ?? $v['gift_reason'] ?? '' ),
			'message'        => (string) ( $v['message'] ?? $v['hint_message'] ?? '' ),
			'deadline'       => (string) ( $v['deadline'] ?? $v['gift_deadline'] ?? '' ),
			'phone_no'       => (string) ( $v['phone_no'] ?? $v['phone'] ?? '' ),
			'diamondurl'     => (string) ( $v['diamondurl'] ?? $v['diamond_url'] ?? '' ),
			'shop'           => self::resolve_shop( $v ),
			'diamondId'      => (string) ( $v['diamondId'] ?? $v['diamondid'] ?? '' ),
			'diamondType'    => self::resolve_diamond_type( $v ),
		];
	}

	/**
	 * @param array<string,mixed> $v
	 * @return array<string,mixed>
	 */
	public static function normalize_diamond_req_info( array $v ): array {
		return [
			'name'               => (string) ( $v['name'] ?? '' ),
			'email'              => (string) ( $v['email'] ?? '' ),
			'phone'              => (string) ( $v['phone'] ?? $v['phone_no'] ?? '' ),
			'phone_no'           => (string) ( $v['phone_no'] ?? $v['phone'] ?? '' ),
			'message'            => (string) ( $v['message'] ?? $v['hint_message'] ?? '' ),
			'contact_preference' => (string) ( $v['contact_preference'] ?? $v['contact_pref'] ?? '' ),
			'diamondurl'         => (string) ( $v['diamondurl'] ?? $v['diamond_url'] ?? '' ),
			'shop'               => self::resolve_shop( $v ),
			'diamondId'          => (string) ( $v['diamondId'] ?? $v['diamondid'] ?? '' ),
			'diamondType'        => self::resolve_diamond_type( $v ),
		];
	}

	/**
	 * @param array<string,mixed> $v
	 * @return array<string,mixed>
	 */
	public static function normalize_diamond_email_friend( array $v ): array {
		return [
			'senderName'     => (string) ( $v['senderName'] ?? $v['name'] ?? '' ),
			'senderEmail'    => (string) ( $v['senderEmail'] ?? $v['email'] ?? '' ),
			'recipientName'  => (string) ( $v['recipientName'] ?? $v['frnd_name'] ?? $v['friend_name'] ?? '' ),
			'recipientEmail' => (string) ( $v['recipientEmail'] ?? $v['frnd_email'] ?? $v['friend_email'] ?? '' ),
			'message'        => (string) ( $v['message'] ?? $v['frnd_message'] ?? '' ),
			'phone_no'       => (string) ( $v['phone_no'] ?? $v['phone'] ?? '' ),
			'diamondurl'     => (string) ( $v['diamondurl'] ?? $v['diamond_url'] ?? '' ),
			'shop'           => self::resolve_shop( $v ),
			'diamondId'      => (string) ( $v['diamondId'] ?? $v['diamondid'] ?? '' ),
			'diamondType'    => self::resolve_diamond_type( $v ),
		];
	}

	/**
	 * @param array<string,mixed> $v
	 * @return array<string,mixed>
	 */
	public static function normalize_diamond_schedule_viewing( array $v ): array {
		$date = self::resolve_schedule_date( $v );
		return [
			'name'              => (string) ( $v['name'] ?? '' ),
			'email'             => (string) ( $v['email'] ?? '' ),
			'phone'             => (string) ( $v['phone'] ?? $v['phone_no'] ?? '' ),
			'phone_no'          => (string) ( $v['phone_no'] ?? $v['phone'] ?? '' ),
			'message'           => self::resolve_schedule_message( $v ),
			'schl_message'      => self::resolve_schedule_message( $v ),
			'location'          => (string) ( $v['location'] ?? '' ),
			'appointmentDate'   => $date,
			'availability_date' => $date,
			'appnt_time'        => (string) ( $v['appnt_time'] ?? '' ),
			'diamondurl'        => (string) ( $v['diamondurl'] ?? $v['diamond_url'] ?? '' ),
			'shop'              => self::resolve_shop( $v ),
			'diamondId'         => (string) ( $v['diamondId'] ?? $v['diamondid'] ?? '' ),
			'diamondType'       => self::resolve_diamond_type( $v ),
		];
	}

	/**
	 * @param array<string,mixed> $v
	 * @return array<string,mixed>
	 */
	public static function normalize_complete_ring( array $v ): array {
		$base = self::normalize_ring_drop_hint( $v );
		$base['diamondId']       = (string) ( $v['diamondId'] ?? $v['diamondid'] ?? '' );
		$base['diamondType']     = self::resolve_diamond_type( $v );
		$base['diamond_url']     = (string) ( $v['diamond_url'] ?? $v['diamondurl'] ?? '' );
		$base['complete_ring_url'] = (string) ( $v['complete_ring_url'] ?? $v['completeringurl'] ?? '' );
		$base['completering']    = (string) ( $v['completering'] ?? 'completering' );
		if ( isset( $v['setting_price'] ) && (string) $v['setting_price'] !== '' ) {
			$base['setting_price'] = (string) $v['setting_price'];
		} elseif ( isset( $v['ring_price'] ) && (string) $v['ring_price'] !== '' ) {
			$base['setting_price'] = (string) $v['ring_price'];
		}
		// Drop combined total so ring specs cannot misuse it as setting cost.
		unset( $base['price'] );
		$base['req_message']     = (string) ( $v['req_message'] ?? $v['message'] ?? $v['hint_message'] ?? '' );
		$base['phone_no']        = (string) ( $v['phone_no'] ?? $v['phone'] ?? '' );
		$base['contact_preference'] = (string) ( $v['contact_preference'] ?? $v['contact_pref'] ?? '' );
		$base['frnd_name']       = (string) ( $v['frnd_name'] ?? $v['friend_name'] ?? '' );
		$base['frnd_email']      = (string) ( $v['frnd_email'] ?? $v['friend_email'] ?? '' );
		$base['frnd_message']    = (string) ( $v['frnd_message'] ?? $v['message'] ?? '' );
		$base['schl_message']      = self::resolve_schedule_message( $v );
		$base['location']            = (string) ( $v['location'] ?? '' );
		$base['availability_date']   = self::resolve_schedule_date( $v );
		$base['appnt_time']          = (string) ( $v['appnt_time'] ?? '' );
		return $base;
	}
}
