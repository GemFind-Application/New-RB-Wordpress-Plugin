<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Ring, diamond, and complete-ring outbound emails (12 storefront endpoints).
 */
final class GEMFINDRB_Email {

	// ── Ring emails ───────────────────────────────────────────────────────────

	public static function ring_drop_hint( array $data ): bool|WP_Error {
		$required = [ 'name', 'email', 'hint_Recipient_name', 'hint_Recipient_email', 'hint_message', 'shopurl', 'settingid' ];
		if ( $err = self::validate_required( $data, $required ) ) {
			return $err;
		}
		if ( $err = self::validate_gift_deadline( $data ) ) {
			return $err;
		}

		$shop     = (string) $data['shopurl'];
		$cfg      = GEMFINDRB_DB::get_config( $shop );
		$ringData = self::resolve_ring_for_email( (string) $data['settingid'], $shop, $data );

		$ctx = self::ring_mail_context( $data, $cfg, $ringData );

		self::send_role_mails(
			$shop,
			$cfg,
			[
				[ 'to' => (string) $data['email'], 'template' => 'email-ring-drop-hint', 'role' => 'sender', 'subject' => __( 'Someone Wants To Drop You A Hint', 'gemfind-ring-builder' ) ],
				[ 'to' => (string) $data['hint_Recipient_email'], 'template' => 'email-ring-drop-hint', 'role' => 'receiver', 'subject' => __( 'Someone Wants To Drop You A Hint', 'gemfind-ring-builder' ) ],
			],
			$ctx
		);

		$retailer = self::resolve_retailer_emails( $cfg, $ringData );
		if ( $retailer !== [] ) {
			foreach ( $retailer as $to ) {
				self::send_template( $shop, $cfg, $to, __( 'Ring Drop Hint Notification', 'gemfind-ring-builder' ), 'email-ring-drop-hint', array_merge( $ctx, [ 'role' => 'retailer' ] ) );
			}
		}

		return true;
	}

	public static function ring_req_info( array $data ): bool|WP_Error {
		$required = [ 'name', 'email', 'message', 'shopurl', 'settingid' ];
		if ( $err = self::validate_required( $data, $required ) ) {
			return $err;
		}

		$shop     = (string) $data['shopurl'];
		$cfg      = GEMFINDRB_DB::get_config( $shop );
		$ringData = self::resolve_ring_for_email( (string) $data['settingid'], $shop, $data );
		$ctx      = self::ring_mail_context( $data, $cfg, $ringData );

		self::send_template( $shop, $cfg, (string) $data['email'], __( 'Request For More Info', 'gemfind-ring-builder' ), 'email-ring-req-info', array_merge( $ctx, [ 'role' => 'sender' ] ) );
		$retailer = self::resolve_retailer_emails( $cfg, $ringData );
		foreach ( $retailer as $to ) {
			self::send_template( $shop, $cfg, $to, __( 'Request For More Info', 'gemfind-ring-builder' ), 'email-ring-req-info', array_merge( $ctx, [ 'role' => 'retailer' ] ) );
		}

		return true;
	}

	public static function ring_email_friend( array $data ): bool|WP_Error {
		$required = [ 'name', 'email', 'frnd_email', 'frnd_message', 'shopurl', 'settingid' ];
		if ( $err = self::validate_required( $data, $required ) ) {
			return $err;
		}

		$shop     = (string) $data['shopurl'];
		$cfg      = GEMFINDRB_DB::get_config( $shop );
		$ringData = self::resolve_ring_for_email( (string) $data['settingid'], $shop, $data );
		$ctx      = self::ring_mail_context( $data, $cfg, $ringData );

		self::send_template( $shop, $cfg, (string) $data['frnd_email'], __( 'A Friend Wants To Share With You', 'gemfind-ring-builder' ), 'email-ring-email-friend', array_merge( $ctx, [ 'role' => 'receiver' ] ) );
		self::send_template( $shop, $cfg, (string) $data['email'], __( 'A Friend Wants To Share With You', 'gemfind-ring-builder' ), 'email-ring-email-friend', array_merge( $ctx, [ 'role' => 'sender' ] ) );

		$retailer = self::resolve_retailer_emails( $cfg, $ringData );
		foreach ( $retailer as $to ) {
			self::send_template( $shop, $cfg, $to, __( 'A Friend Wants To Share With You', 'gemfind-ring-builder' ), 'email-ring-email-friend', array_merge( $ctx, [ 'role' => 'retailer' ] ) );
		}

		return true;
	}

	public static function ring_schedule_viewing( array $data ): bool|WP_Error {
		$required = [ 'name', 'email', 'phone_no', 'schl_message', 'location', 'shopurl', 'settingid' ];
		if ( $err = self::validate_required( $data, $required ) ) {
			return $err;
		}

		$shop     = (string) $data['shopurl'];
		$cfg      = GEMFINDRB_DB::get_config( $shop );
		$ringData = self::resolve_ring_for_email( (string) $data['settingid'], $shop, $data );
		$ctx      = self::ring_mail_context( $data, $cfg, $ringData );

		self::send_template( $shop, $cfg, (string) $data['email'], __( 'Schedule Viewing Notification', 'gemfind-ring-builder' ), 'email-ring-schedule-viewing', array_merge( $ctx, [ 'role' => 'sender' ] ) );
		$retailer = self::resolve_retailer_emails( $cfg, $ringData );
		foreach ( $retailer as $to ) {
			self::send_template( $shop, $cfg, $to, __( 'Schedule Viewing Notification', 'gemfind-ring-builder' ), 'email-ring-schedule-viewing', array_merge( $ctx, [ 'role' => 'retailer' ] ) );
		}

		return true;
	}

	// ── Diamond emails ────────────────────────────────────────────────────────

	public static function diamond_drop_hint( array $data ): bool|WP_Error {
		$required = [ 'senderName', 'senderEmail', 'recipientName', 'recipientEmail', 'message', 'shop', 'diamondId' ];
		if ( $err = self::validate_required( $data, $required ) ) {
			return $err;
		}
		if ( $err = self::validate_gift_deadline( $data ) ) {
			return $err;
		}

		$shop    = (string) $data['shop'];
		$cfg     = GEMFINDRB_DB::get_config( $shop );
		$diamond = GEMFINDRB_JewelCloud::get_diamond_by_id( (string) $data['diamondId'], (string) ( $data['diamondType'] ?? 'mined' ), $shop );
		$ctx     = self::diamond_mail_context( $data, $cfg, $diamond );

		self::send_role_mails(
			$shop,
			$cfg,
			[
				[ 'to' => (string) $data['recipientEmail'], 'template' => 'email-diamond-drop-hint', 'role' => 'receiver', 'subject' => __( 'Someone Wants To Drop You A Hint', 'gemfind-ring-builder' ) ],
				[ 'to' => (string) $data['senderEmail'], 'template' => 'email-diamond-drop-hint', 'role' => 'sender', 'subject' => __( 'Someone Wants To Drop You A Hint', 'gemfind-ring-builder' ) ],
			],
			$ctx
		);

		$retailer = self::resolve_retailer_emails( $cfg, $diamond );
		foreach ( $retailer as $to ) {
			self::send_template( $shop, $cfg, $to, __( 'Diamond Drop Hint Notification', 'gemfind-ring-builder' ), 'email-diamond-drop-hint', array_merge( $ctx, [ 'role' => 'retailer' ] ) );
		}

		return true;
	}

	public static function diamond_req_info( array $data ): bool|WP_Error {
		$required = [ 'name', 'email', 'message', 'shop', 'diamondId' ];
		if ( $err = self::validate_required( $data, $required ) ) {
			return $err;
		}

		$shop    = (string) $data['shop'];
		$cfg     = GEMFINDRB_DB::get_config( $shop );
		$diamond = GEMFINDRB_JewelCloud::get_diamond_by_id( (string) $data['diamondId'], (string) ( $data['diamondType'] ?? 'mined' ), $shop );
		$ctx     = self::diamond_mail_context( $data, $cfg, $diamond );

		self::send_template( $shop, $cfg, (string) $data['email'], __( 'Request For More Info', 'gemfind-ring-builder' ), 'email-diamond-req-info', array_merge( $ctx, [ 'role' => 'sender' ] ) );
		$retailer = self::resolve_retailer_emails( $cfg, $diamond );
		foreach ( $retailer as $to ) {
			self::send_template( $shop, $cfg, $to, __( 'Request For More Info', 'gemfind-ring-builder' ), 'email-diamond-req-info', array_merge( $ctx, [ 'role' => 'retailer' ] ) );
		}

		return true;
	}

	public static function diamond_email_friend( array $data ): bool|WP_Error {
		$required = [ 'senderName', 'senderEmail', 'recipientEmail', 'message', 'shop', 'diamondId' ];
		if ( $err = self::validate_required( $data, $required ) ) {
			return $err;
		}

		$shop    = (string) $data['shop'];
		$cfg     = GEMFINDRB_DB::get_config( $shop );
		$diamond = GEMFINDRB_JewelCloud::get_diamond_by_id( (string) $data['diamondId'], (string) ( $data['diamondType'] ?? 'mined' ), $shop );
		$ctx     = self::diamond_mail_context( $data, $cfg, $diamond );

		self::send_template( $shop, $cfg, (string) $data['recipientEmail'], __( 'A Friend Wants To Share With You', 'gemfind-ring-builder' ), 'email-diamond-email-friend', array_merge( $ctx, [ 'role' => 'receiver' ] ) );
		self::send_template( $shop, $cfg, (string) $data['senderEmail'], __( 'A Friend Wants To Share With You', 'gemfind-ring-builder' ), 'email-diamond-email-friend', array_merge( $ctx, [ 'role' => 'sender' ] ) );
		$retailer = self::resolve_retailer_emails( $cfg, $diamond );
		foreach ( $retailer as $to ) {
			self::send_template( $shop, $cfg, $to, __( 'A Friend Wants To Share With You', 'gemfind-ring-builder' ), 'email-diamond-email-friend', array_merge( $ctx, [ 'role' => 'retailer' ] ) );
		}

		return true;
	}

	public static function diamond_schedule_viewing( array $data ): bool|WP_Error {
		$required = [ 'name', 'email', 'phone_no', 'schl_message', 'location', 'shop', 'diamondId' ];
		if ( $err = self::validate_required( $data, $required ) ) {
			return $err;
		}

		$shop    = (string) $data['shop'];
		$cfg     = GEMFINDRB_DB::get_config( $shop );
		$diamond = GEMFINDRB_JewelCloud::get_diamond_by_id( (string) $data['diamondId'], (string) ( $data['diamondType'] ?? 'mined' ), $shop );
		$ctx     = self::diamond_mail_context( $data, $cfg, $diamond );

		self::send_template( $shop, $cfg, (string) $data['email'], __( 'Schedule Viewing Notification', 'gemfind-ring-builder' ), 'email-diamond-schedule-viewing', array_merge( $ctx, [ 'role' => 'sender' ] ) );
		$retailer = self::resolve_retailer_emails( $cfg, $diamond );
		foreach ( $retailer as $to ) {
			self::send_template( $shop, $cfg, $to, __( 'Schedule Viewing Notification', 'gemfind-ring-builder' ), 'email-diamond-schedule-viewing', array_merge( $ctx, [ 'role' => 'retailer' ] ) );
		}

		return true;
	}

	// ── Complete ring emails ──────────────────────────────────────────────────

	public static function complete_ring_drop_hint( array $data ): bool|WP_Error {
		return self::complete_ring_drop_hint_action( $data );
	}

	public static function complete_ring_req_info( array $data ): bool|WP_Error {
		return self::complete_ring_req_info_action( $data );
	}

	public static function complete_ring_email_friend( array $data ): bool|WP_Error {
		return self::complete_ring_email_friend_action( $data );
	}

	public static function complete_ring_schedule_viewing( array $data ): bool|WP_Error {
		return self::complete_ring_schedule_viewing_action( $data );
	}

	/**
	 * @param array<string,mixed> $data
	 */
	private static function complete_ring_drop_hint_action( array $data ): bool|WP_Error {
		if ( $err = self::validate_gift_deadline( $data ) ) {
			return $err;
		}
		$ctx = self::complete_ring_mail_context( $data );
		if ( is_wp_error( $ctx ) ) {
			return $ctx;
		}
		$shop = (string) $ctx['shop_key'];
		$cfg  = $ctx['cfg'];
		$subject = __( 'Someone Wants To Drop You A Hint', 'gemfind-ring-builder' );

		self::send_role_mails(
			$shop,
			$cfg,
			[
				[ 'to' => (string) ( $ctx['email'] ?? '' ), 'template' => 'email-complete-ring-drop-hint', 'role' => 'sender', 'subject' => $subject ],
				[ 'to' => (string) ( $ctx['hint_Recipient_email'] ?? '' ), 'template' => 'email-complete-ring-drop-hint', 'role' => 'receiver', 'subject' => $subject ],
			],
			$ctx
		);

		$retailer = self::resolve_retailer_emails( $cfg, $ctx['ring'] ?? [] );
		foreach ( $retailer as $to ) {
			self::send_template( $shop, $cfg, $to, $subject, 'email-complete-ring-drop-hint', array_merge( $ctx, [ 'role' => 'retailer' ] ) );
		}

		return true;
	}

	/**
	 * @param array<string,mixed> $data
	 */
	private static function complete_ring_req_info_action( array $data ): bool|WP_Error {
		$ctx = self::complete_ring_mail_context( $data );
		if ( is_wp_error( $ctx ) ) {
			return $ctx;
		}
		$shop    = (string) $ctx['shop_key'];
		$cfg     = $ctx['cfg'];
		$subject = __( 'Request For More Info', 'gemfind-ring-builder' );

		self::send_template( $shop, $cfg, (string) ( $ctx['email'] ?? '' ), $subject, 'email-complete-ring-req-info', array_merge( $ctx, [ 'role' => 'sender' ] ) );
		$retailer = self::resolve_retailer_emails( $cfg, $ctx['ring'] ?? [] );
		foreach ( $retailer as $to ) {
			self::send_template( $shop, $cfg, $to, $subject, 'email-complete-ring-req-info', array_merge( $ctx, [ 'role' => 'retailer' ] ) );
		}

		return true;
	}

	/**
	 * @param array<string,mixed> $data
	 */
	private static function complete_ring_email_friend_action( array $data ): bool|WP_Error {
		$ctx = self::complete_ring_mail_context( $data );
		if ( is_wp_error( $ctx ) ) {
			return $ctx;
		}
		$shop    = (string) $ctx['shop_key'];
		$cfg     = $ctx['cfg'];
		$subject = __( 'A Friend Wants To Share With You', 'gemfind-ring-builder' );

		self::send_template( $shop, $cfg, (string) ( $ctx['frnd_email'] ?? '' ), $subject, 'email-complete-ring-email-friend', array_merge( $ctx, [ 'role' => 'receiver' ] ) );
		self::send_template( $shop, $cfg, (string) ( $ctx['email'] ?? '' ), $subject, 'email-complete-ring-email-friend', array_merge( $ctx, [ 'role' => 'sender' ] ) );
		$retailer = self::resolve_retailer_emails( $cfg, $ctx['ring'] ?? [] );
		foreach ( $retailer as $to ) {
			self::send_template( $shop, $cfg, $to, $subject, 'email-complete-ring-email-friend', array_merge( $ctx, [ 'role' => 'retailer' ] ) );
		}

		return true;
	}

	/**
	 * @param array<string,mixed> $data
	 */
	private static function complete_ring_schedule_viewing_action( array $data ): bool|WP_Error {
		$required = [ 'name', 'email', 'phone_no', 'schl_message', 'location', 'settingid', 'diamondId' ];
		if ( $err = self::validate_required( $data, $required ) ) {
			return $err;
		}

		$ctx = self::complete_ring_mail_context( $data );
		if ( is_wp_error( $ctx ) ) {
			return $ctx;
		}
		$shop    = (string) $ctx['shop_key'];
		$cfg     = $ctx['cfg'];
		$subject = __( 'Schedule Viewing Notification', 'gemfind-ring-builder' );

		self::send_template( $shop, $cfg, (string) ( $ctx['email'] ?? '' ), $subject, 'email-complete-ring-schedule-viewing', array_merge( $ctx, [ 'role' => 'sender' ] ) );
		$retailer = self::resolve_retailer_emails( $cfg, $ctx['ring'] ?? [] );
		foreach ( $retailer as $to ) {
			self::send_template( $shop, $cfg, $to, $subject, 'email-complete-ring-schedule-viewing', array_merge( $ctx, [ 'role' => 'retailer' ] ) );
		}

		return true;
	}

	/**
	 * @param array<string,mixed> $data
	 * @return array<string,mixed>|WP_Error
	 */
	private static function complete_ring_mail_context( array $data ) {
		$shop = (string) ( $data['shopurl'] ?? $data['shop'] ?? '' );
		if ( $shop === '' ) {
			return new WP_Error( 'validation', 'Shop is required', [ 'status' => 422 ] );
		}

		$cfg      = GEMFINDRB_DB::get_config( $shop );
		$ringData = self::resolve_ring_for_email( (string) ( $data['settingid'] ?? '' ), $shop, $data );
		$diamond  = GEMFINDRB_JewelCloud::get_diamond_by_id( (string) ( $data['diamondId'] ?? '' ), (string) ( $data['diamondType'] ?? 'mined' ), $shop );

		return array_merge(
			self::ring_mail_context( $data, $cfg, $ringData ),
			self::diamond_flat_fields( $diamond ),
			[
				'shop_key'          => $shop,
				'ring'              => $ringData,
				'diamond'           => $diamond,
				'complete_ring_url' => (string) ( $data['complete_ring_url'] ?? '' ),
				'diamond_url'       => (string) ( $data['diamond_url'] ?? $data['diamondurl'] ?? '' ),
				'price_rb'          => self::format_ring_price( $ringData ),
				'price'             => self::format_diamond_price( $diamond ),
				'req_message'       => (string) ( $data['req_message'] ?? $data['message'] ?? '' ),
				'frnd_name'         => (string) ( $data['frnd_name'] ?? $data['friend_name'] ?? '' ),
				'frnd_email'        => (string) ( $data['frnd_email'] ?? $data['friend_email'] ?? '' ),
				'frnd_message'      => (string) ( $data['frnd_message'] ?? $data['message'] ?? '' ),
			]
		);
	}

	// ── Diamond details + print HTML ────────────────────────────────────────

	/**
	 * @return array{diamond:array<string,mixed>,configData:array<string,mixed>,shopName:string}
	 */
	public static function get_diamond_details( string $diamond_id, string $type, string $shop, string $show_retailer_info ): array {
		$diamond = GEMFINDRB_JewelCloud::get_diamond_by_id( $diamond_id, $type, $shop );
		$cfg     = GEMFINDRB_DB::get_config( $shop );
		$cfg_arr = $cfg ? (array) $cfg : [];
		if ( $show_retailer_info === 'true' ) {
			$cfg_arr['show_retailer'] = true;
		}
		unset( $cfg_arr['dealerpassword'], $cfg_arr['smtp_json'] );

		return [
			'diamond'    => $diamond,
			'configData' => $cfg_arr,
			'shopName'   => (string) get_bloginfo( 'name' ),
		];
	}

	public static function get_print_layout_html( string $diamond_id, string $type, string $shop ): string {
		$shop = trim( $shop );
		if ( $shop === '' ) {
			$shop = gemfindRB_shop_key();
		}

		$cfg = GEMFINDRB_DB::get_config( $shop );
		if ( ! $cfg || trim( (string) ( $cfg->dealerid ?? '' ) ) === '' ) {
			return '';
		}

		$diamond = GEMFINDRB_JewelCloud::get_diamond_by_id( $diamond_id, $type, $shop );
		if ( empty( $diamond['diamondId'] ) ) {
			return '';
		}

		$site_name = (string) get_bloginfo( 'name' );

		$img_url      = self::resolve_diamond_image_url( $diamond );
		$img_data_uri = $img_url !== '' ? self::image_url_to_data_uri( $img_url ) : '';

		if ( function_exists( 'gemfindRB_enqueue_diamond_print_styles' ) ) {
			gemfindRB_enqueue_diamond_print_styles();
		}

		return self::render( 'diamond-print-page', compact( 'diamond', 'cfg', 'shop', 'site_name', 'img_url', 'img_data_uri' ) );
	}

	/**
	 * Printable HTML for a complete ring (setting + diamond).
	 *
	 * @param array<string,string> $display_options Storefront overrides: ring_size, metal_type, side_stone_quality, center_stone_min, center_stone_max, style_number.
	 */
	public static function get_complete_ring_print_layout_html(
		string $setting_id,
		string $diamond_id,
		string $diamond_type,
		string $shop,
		int $is_lab_settings = 0,
		array $display_options = []
	): string {
		$shop = trim( $shop );
		if ( $shop === '' ) {
			$shop = gemfindRB_shop_key();
		}

		$cfg = GEMFINDRB_DB::get_config( $shop );
		if ( ! $cfg || trim( (string) ( $cfg->dealerid ?? '' ) ) === '' ) {
			return '';
		}

		$ring_bundle = GEMFINDRB_JewelCloud::get_ring_by_id( $setting_id, $shop, $is_lab_settings );
		$ring        = $ring_bundle['ringData'] ?? [];
		if ( empty( $ring['settingId'] ) ) {
			return '';
		}

		$diamond = GEMFINDRB_JewelCloud::get_diamond_by_id( $diamond_id, $diamond_type, $shop );
		if ( empty( $diamond['diamondId'] ) ) {
			return '';
		}

		$ring = self::apply_ring_display_overrides( $ring, $display_options );

		$site_name = (string) get_bloginfo( 'name' );

		$ring_img_url      = self::resolve_ring_image_url( $ring );
		$ring_img_data_uri = $ring_img_url !== '' ? self::image_url_to_data_uri( $ring_img_url ) : '';

		$diamond_img_url      = self::resolve_diamond_image_url( $diamond );
		$diamond_img_data_uri = $diamond_img_url !== '' ? self::image_url_to_data_uri( $diamond_img_url ) : '';

		if ( function_exists( 'gemfindRB_enqueue_diamond_print_styles' ) ) {
			gemfindRB_enqueue_diamond_print_styles();
		}

		return self::render(
			'complete-ring-print-page',
			compact(
				'ring',
				'diamond',
				'cfg',
				'shop',
				'site_name',
				'display_options',
				'ring_img_url',
				'ring_img_data_uri',
				'diamond_img_url',
				'diamond_img_data_uri'
			)
		);
	}

	/**
	 * @param array<string,mixed>              $ring
	 * @param array<string,string> $display_options
	 * @return array<string,mixed>
	 */
	private static function apply_ring_display_overrides( array $ring, array $display_options ): array {
		$map = [
			'metal_type'          => 'metalType',
			'ring_size'           => 'ringSize',
			'side_stone_quality'  => 'sideStoneQuality',
			'center_stone_min'    => 'centerStoneMinCarat',
			'center_stone_max'    => 'centerStoneMaxCarat',
			'style_number'        => 'styleNumber',
		];
		foreach ( $map as $opt_key => $ring_key ) {
			if ( ! empty( $display_options[ $opt_key ] ) ) {
				$ring[ $ring_key ] = $display_options[ $opt_key ];
			}
		}
		return $ring;
	}

	/**
	 * JewelCloud detail API + storefront overrides (metal, carat, style, price).
	 *
	 * @param array<string,mixed> $data
	 * @return array<string,mixed>
	 */
	private static function resolve_ring_for_email( string $setting_id, string $shop, array $data ): array {
		$is_lab = self::is_lab_setting_from_data( $data );
		$detail = GEMFINDRB_JewelCloud::get_mounting_detail( $setting_id, $shop, $is_lab );
		if ( self::has_ring_detail( $detail ) ) {
			return self::apply_ring_request_overrides( $detail, $data );
		}

		$bundle = GEMFINDRB_JewelCloud::get_ring_by_id( $setting_id, $shop, $is_lab ? 1 : 0 );
		return self::apply_ring_request_overrides( $bundle['ringData'] ?? [], $data );
	}

	/**
	 * @param array<string,mixed> $data
	 */
	private static function is_lab_setting_from_data( array $data ): bool {
		$raw = $data['islabsettings'] ?? $data['isLabSetting'] ?? $data['is_lab_setting'] ?? 0;
		return $raw === true || $raw === 'true' || $raw === 1 || $raw === '1';
	}

	/**
	 * @param array<string,mixed> $detail
	 */
	private static function has_ring_detail( array $detail ): bool {
		if ( $detail === [] ) {
			return false;
		}
		foreach ( [ 'settingId', 'gfInventoryId', 'styleNumber', 'metalType' ] as $key ) {
			if ( ! empty( $detail[ $key ] ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @param array<string,mixed> $ring
	 * @param array<string,mixed> $data
	 * @return array<string,mixed>
	 */
	private static function apply_ring_request_overrides( array $ring, array $data ): array {
		$fields = [
			'metalType'           => [ 'metalType', 'metaltype' ],
			'styleNumber'         => [ 'styleNumber', 'stylenumber' ],
			'centerStoneMinCarat' => [ 'min_carat', 'centerStoneMinCarat' ],
			'centerStoneMaxCarat' => [ 'max_carat', 'centerStoneMaxCarat' ],
		];
		foreach ( $fields as $ring_key => $sources ) {
			foreach ( $sources as $source ) {
				if ( isset( $data[ $source ] ) && (string) $data[ $source ] !== '' ) {
					$ring[ $ring_key ] = (string) $data[ $source ];
					break;
				}
			}
		}

		if ( ! empty( $data['price'] ) ) {
			$price_raw = str_replace( [ ',', '$' ], '', (string) $data['price'] );
			if ( is_numeric( $price_raw ) ) {
				$ring['cost']      = (float) $price_raw;
				$ring['showPrice'] = true;
			}
		}

		return $ring;
	}

	/**
	 * @param array<string,mixed> $ring
	 */
	private static function resolve_ring_image_url( array $ring ): string {
		$keys = [
			'mainImageURL',
			'mainImage',
			'image1',
			'settingImage',
			'imageURL',
		];
		foreach ( $keys as $key ) {
			if ( empty( $ring[ $key ] ) || is_array( $ring[ $key ] ) ) {
				continue;
			}
			$url = trim( (string) $ring[ $key ] );
			if ( $url !== '' ) {
				return self::normalize_image_url( $url );
			}
		}
		return '';
	}

	/**
	 * @param array<string,mixed> $item
	 */
	public static function format_print_price( array $item ): string {
		$price_raw = '';
		foreach ( [ 'fltPrice', 'cost', 'price', 'settingPrice' ] as $key ) {
			if ( isset( $item[ $key ] ) && (string) $item[ $key ] !== '' ) {
				$price_raw = (string) $item[ $key ];
				break;
			}
		}
		if ( trim( $price_raw ) === '' ) {
			return '';
		}
		if ( is_numeric( str_replace( [ ',', '$' ], '', $price_raw ) ) ) {
			$currency = (string) ( $item['currencySymbol'] ?? $item['currency'] ?? '$' );
			return $currency . preg_replace( '/\s+/', '', $price_raw );
		}
		return $price_raw;
	}

	// ── Helpers ───────────────────────────────────────────────────────────────

	/**
	 * @param array<string,mixed> $data
	 * @param array<string,mixed> $ringData
	 * @return array<string,mixed>
	 */
	private static function ring_mail_context( array $data, ?object $cfg, array $ringData ): array {
		$shop_key      = ltrim( (string) ( $data['shopurl'] ?? $data['shop'] ?? gemfindRB_shop_key() ), 'https://' );
		$shopurl       = 'https://' . $shop_key;
		$shop_logo     = is_object( $cfg ) ? (string) ( $cfg->shop_logo ?? '' ) : '';
		$shop_logo_alt = is_object( $cfg ) ? (string) ( $cfg->shop ?? $shop_key ) : $shop_key;
		$vendor_name   = (string) ( $ringData['vendorName'] ?? $shop_logo_alt );

		return array_merge(
			[
				'data'         => $data,
				'cfg'          => $cfg,
				'ring'         => $ringData,
				'shop_key'     => $shop_key,
				'shopurl'      => $shopurl,
				'shop_logo'    => $shop_logo,
				'shop_logo_alt'=> $shop_logo_alt,
				'retailername' => $vendor_name,
				'vendorName'   => $vendor_name,
				'name'         => (string) ( $data['name'] ?? $data['senderName'] ?? '' ),
				'email'        => (string) ( $data['email'] ?? $data['senderEmail'] ?? '' ),
				'phone_no'     => (string) ( $data['phone_no'] ?? $data['phone'] ?? '' ),
				'hint_Recipient_name'  => (string) ( $data['hint_Recipient_name'] ?? $data['recipient_name'] ?? $data['recipientName'] ?? '' ),
				'hint_Recipient_email' => (string) ( $data['hint_Recipient_email'] ?? $data['recipient_email'] ?? $data['recipientEmail'] ?? '' ),
				'reason_of_gift' => (string) ( $data['reason_of_gift'] ?? $data['gift_reason'] ?? '' ),
				'hint_message'   => (string) ( $data['hint_message'] ?? $data['message'] ?? '' ),
				'deadline'       => (string) ( $data['deadline'] ?? $data['gift_deadline'] ?? '' ),
				'ring_url'       => (string) ( $data['ring_url'] ?? $data['ringurl'] ?? '' ),
				'frnd_name'      => (string) ( $data['frnd_name'] ?? $data['friend_name'] ?? '' ),
				'frnd_email'     => (string) ( $data['frnd_email'] ?? $data['friend_email'] ?? '' ),
				'frnd_message'   => (string) ( $data['frnd_message'] ?? '' ),
				'req_message'    => (string) ( $data['message'] ?? $data['req_message'] ?? '' ),
				'contact_preference' => (string) ( $data['contact_preference'] ?? $data['contact_pref'] ?? '' ),
				'schl_message'   => (string) ( $data['schl_message'] ?? $data['message'] ?? '' ),
				'location'       => (string) ( $data['location'] ?? '' ),
				'availability_date' => (string) ( $data['availability_date'] ?? $data['appointmentDate'] ?? '' ),
				'appnt_time'     => (string) ( $data['appnt_time'] ?? '' ),
				'setting_id'     => (string) ( $ringData['settingId'] ?? $data['settingid'] ?? '' ),
				'stylenumber'    => (string) ( $ringData['styleNumber'] ?? '' ),
				'metaltype'      => (string) ( $ringData['metalType'] ?? '' ),
				'centerStoneMinCarat' => (string) ( $ringData['centerStoneMinCarat'] ?? '' ),
				'centerStoneMaxCarat' => (string) ( $ringData['centerStoneMaxCarat'] ?? '' ),
				'price'          => self::format_ring_price( $ringData ),
				'price_rb'       => self::format_ring_price( $ringData ),
			]
		);
	}

	/**
	 * @param array<string,mixed> $data
	 * @param array<string,mixed> $diamond
	 * @return array<string,mixed>
	 */
	private static function diamond_mail_context( array $data, ?object $cfg, array $diamond ): array {
		$shop_key      = ltrim( (string) ( $data['shop'] ?? $data['shopurl'] ?? gemfindRB_shop_key() ), 'https://' );
		$shopurl       = 'https://' . $shop_key;
		$shop_logo     = is_object( $cfg ) ? (string) ( $cfg->shop_logo ?? '' ) : '';
		$shop_logo_alt = is_object( $cfg ) ? (string) ( $cfg->shop ?? $shop_key ) : $shop_key;
		$vendor_name   = (string) ( $diamond['vendorName'] ?? $shop_logo_alt );

		return array_merge(
			[
				'data'         => $data,
				'cfg'          => $cfg,
				'diamond'      => $diamond,
				'shop_key'     => $shop_key,
				'shopurl'      => $shopurl,
				'shop_logo'    => $shop_logo,
				'shop_logo_alt'=> $shop_logo_alt,
				'retailername' => $vendor_name,
				'vendorName'   => $vendor_name,
				'name'         => (string) ( $data['senderName'] ?? $data['name'] ?? '' ),
				'email'        => (string) ( $data['senderEmail'] ?? $data['email'] ?? '' ),
				'phone_no'     => (string) ( $data['phone_no'] ?? $data['phone'] ?? '' ),
				'hint_Recipient_name'  => (string) ( $data['recipientName'] ?? $data['hint_Recipient_name'] ?? '' ),
				'hint_Recipient_email' => (string) ( $data['recipientEmail'] ?? $data['hint_Recipient_email'] ?? '' ),
				'reason_of_gift' => (string) ( $data['reason_of_gift'] ?? $data['gift_reason'] ?? '' ),
				'hint_message'   => (string) ( $data['message'] ?? $data['hint_message'] ?? '' ),
				'deadline'       => (string) ( $data['deadline'] ?? $data['gift_deadline'] ?? '' ),
				'diamondurl'     => (string) ( $data['diamondurl'] ?? $data['diamond_url'] ?? '' ),
				'diamond_url'    => (string) ( $data['diamondurl'] ?? $data['diamond_url'] ?? '' ),
				'frnd_name'      => (string) ( $data['recipientName'] ?? $data['frnd_name'] ?? '' ),
				'frnd_email'     => (string) ( $data['recipientEmail'] ?? $data['frnd_email'] ?? '' ),
				'frnd_message'   => (string) ( $data['message'] ?? $data['frnd_message'] ?? '' ),
				'req_message'    => (string) ( $data['message'] ?? '' ),
				'contact_preference' => (string) ( $data['contact_preference'] ?? $data['contact_pref'] ?? '' ),
				'schl_message'   => (string) ( $data['message'] ?? $data['schl_message'] ?? '' ),
				'location'       => (string) ( $data['location'] ?? '' ),
				'availability_date' => (string) ( $data['appointmentDate'] ?? $data['availability_date'] ?? '' ),
				'appnt_time'     => (string) ( $data['appnt_time'] ?? '' ),
				'price'          => self::format_diamond_price( $diamond ),
			],
			self::diamond_flat_fields( $diamond )
		);
	}

	/**
	 * @param array<string,mixed> $diamond
	 * @return array<string,mixed>
	 */
	private static function diamond_flat_fields( array $diamond ): array {
		$diamond = GEMFINDRB_JewelCloud::normalize_diamond_detail( $diamond );
		$measurement = (string) ( $diamond['measurement'] ?? $diamond['measurements'] ?? '' );

		return [
			'diamond_id'  => (string) ( $diamond['diamondId'] ?? '' ),
			'size'        => (string) ( $diamond['caratWeight'] ?? '' ),
			'cut'         => (string) ( $diamond['cut'] ?? '' ),
			'color'       => self::diamond_color_display( $diamond ),
			'clarity'     => (string) ( $diamond['clarity'] ?? '' ),
			'depth'       => (string) ( $diamond['depth'] ?? '' ),
			'table'       => (string) ( $diamond['table'] ?? '' ),
			'measurment'  => $measurement,
			'measurement' => $measurement,
			'certificate' => (string) ( $diamond['certificate'] ?? '' ),
		];
	}

	/**
	 * @param array<string,mixed> $ringData
	 */
	private static function format_ring_price( array $ringData ): string {
		if ( empty( $ringData['showPrice'] ) ) {
			return 'Call For Price';
		}
		if ( empty( $ringData['cost'] ) ) {
			return '';
		}
		$formatted = number_format( (float) $ringData['cost'], 2 );
		$currency  = (string) ( $ringData['currencyFrom'] ?? 'USD' );
		if ( $currency === 'USD' ) {
			return '$' . $formatted;
		}
		$symbol = (string) ( $ringData['currencySymbol'] ?? '' );
		return trim( $currency . ' ' . $symbol . $formatted );
	}

	/**
	 * @param array<string,mixed> $diamond
	 */
	private static function format_diamond_price( array $diamond ): string {
		if ( empty( $diamond['showPrice'] ) ) {
			return 'Call For Price';
		}
		if ( empty( $diamond['fltPrice'] ) ) {
			return '';
		}
		$formatted = number_format( (float) $diamond['fltPrice'], 2 );
		$currency  = (string) ( $diamond['currencyFrom'] ?? 'USD' );
		if ( $currency === 'USD' ) {
			return '$' . $formatted;
		}
		$symbol = (string) ( $diamond['currencySymbol'] ?? '' );
		return trim( $currency . ' ' . $symbol . $formatted );
	}

	/**
	 * @param array<string,mixed> $diamond
	 */
	private static function diamond_color_display( array $diamond ): string {
		if ( ! empty( $diamond['fancyColorMainBody'] ) ) {
			return trim( (string) ( $diamond['fancyColorIntensity'] ?? '' ) . ' ' . (string) $diamond['fancyColorMainBody'] );
		}
		if ( ! empty( $diamond['color'] ) ) {
			return (string) $diamond['color'];
		}
		return 'NA';
	}

	/**
	 * @param array<string,mixed> $ctx
	 * @param list<array{to:string,template:string,role:string,subject:string}> $jobs
	 */
	private static function send_role_mails( string $shop, ?object $cfg, array $jobs, array $ctx ): void {
		foreach ( $jobs as $job ) {
			if ( $job['to'] === '' || ! is_email( $job['to'] ) ) {
				continue;
			}
			self::send_template( $shop, $cfg, $job['to'], $job['subject'], $job['template'], array_merge( $ctx, [ 'role' => $job['role'] ] ) );
		}
	}

	/**
	 * @param array<string,mixed> $ctx
	 */
	private static function send_template( string $shop, ?object $cfg, string $to, string $subject, string $template, array $ctx ): void {
		if ( $to === '' || ! is_email( $to ) ) {
			return;
		}
		$html = self::render( $template, $ctx );
		GEMFINDRB_Mail::send( $shop, sanitize_email( $to ), $subject, $html, self::html_headers( $cfg ) );
	}

	/**
	 * @param array<string,mixed> $ringData
	 * @return list<string>
	 */
	private static function resolve_retailer_emails( ?object $cfg, array $ringData ): array {
		$emails = [];
		if ( is_object( $cfg ) && ! empty( $cfg->admin_email_address ) ) {
			foreach ( explode( ',', (string) $cfg->admin_email_address ) as $e ) {
				$e = sanitize_email( trim( $e ) );
				if ( is_email( $e ) ) {
					$emails[] = $e;
				}
			}
		}
		if ( ! empty( $ringData['vendorEmail'] ) ) {
			foreach ( explode( ',', (string) $ringData['vendorEmail'] ) as $e ) {
				$e = sanitize_email( trim( $e ) );
				if ( is_email( $e ) ) {
					$emails[] = $e;
				}
			}
		}
		return array_values( array_unique( $emails ) );
	}

	private static function admin_email( ?object $cfg ): string {
		if ( is_object( $cfg ) && ! empty( $cfg->admin_email_address ) ) {
			$first = explode( ',', (string) $cfg->admin_email_address )[0] ?? '';
			$first = sanitize_email( trim( $first ) );
			if ( is_email( $first ) ) {
				return $first;
			}
		}
		return sanitize_email( (string) get_option( 'admin_email' ) );
	}

	/**
	 * Primary image URL from JewelCloud detail payload.
	 *
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
			$url = trim( (string) $diamond[ $key ] );
			if ( $url !== '' ) {
				return self::normalize_image_url( $url );
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

	/**
	 * Fetch an image URL and return a data URI for PDF embedding.
	 */
	private static function image_url_to_data_uri( string $url ): string {
		$url = self::normalize_image_url( trim( $url ) );
		if ( $url === '' ) {
			return '';
		}

		$resp = wp_remote_get(
			$url,
			[
				'timeout'     => 20,
				'redirection' => 5,
				'sslverify'   => gemfindRB_http_sslverify(),
				'headers'     => [
					'User-Agent' => 'WordPress/' . get_bloginfo( 'version' ),
					'Accept'     => 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
				],
			]
		);
		if ( is_wp_error( $resp ) ) {
			return '';
		}

		$code = (int) wp_remote_retrieve_response_code( $resp );
		if ( $code < 200 || $code >= 300 ) {
			return '';
		}

		$bytes = wp_remote_retrieve_body( $resp );
		if ( ! is_string( $bytes ) || $bytes === '' ) {
			return '';
		}

		$ct = strtolower( trim( explode( ';', (string) wp_remote_retrieve_header( $resp, 'content-type' ) )[0] ?? '' ) );
		if ( $ct === '' || ! str_starts_with( $ct, 'image/' ) ) {
			$ct = self::detect_image_mime( $bytes, $url );
		}
		if ( $ct === '' || ! str_starts_with( $ct, 'image/' ) ) {
			return '';
		}

		if ( strlen( $bytes ) > 2_500_000 ) {
			return '';
		}

		return 'data:' . $ct . ';base64,' . base64_encode( $bytes );
	}

	private static function detect_image_mime( string $bytes, string $url ): string {
		if ( function_exists( 'finfo_open' ) ) {
			$finfo = finfo_open( FILEINFO_MIME_TYPE );
			if ( $finfo !== false ) {
				$detected = finfo_buffer( $finfo, $bytes );
				finfo_close( $finfo );
				if ( is_string( $detected ) && str_starts_with( $detected, 'image/' ) ) {
					return $detected;
				}
			}
		}

		$lower = strtolower( $url );
		if ( str_contains( $lower, '.png' ) ) {
			return 'image/png';
		}
		if ( str_contains( $lower, '.gif' ) ) {
			return 'image/gif';
		}
		if ( str_contains( $lower, '.webp' ) ) {
			return 'image/webp';
		}

		return 'image/jpeg';
	}

	/**
	 * @param array<string,mixed> $vars
	 */
	private static function render( string $template, array $vars = [] ): string {
		$file = GEMFINDRB_PATH . 'includes/templates/' . $template . '.php';
		if ( ! is_readable( $file ) ) {
			return '';
		}
		extract( $vars, EXTR_SKIP );
		ob_start();
		include $file;
		return (string) ob_get_clean();
	}

	private static function html_headers( ?object $cfg ): array {
		$from_name  = is_object( $cfg ) && ! empty( $cfg->shop_title ) ? (string) $cfg->shop_title : (string) get_bloginfo( 'name' );
		$from_email = self::admin_email( $cfg );
		return [
			'Content-Type: text/html; charset=UTF-8',
			"From: {$from_name} <{$from_email}>",
		];
	}

	/**
	 * @param array<string,mixed> $data
	 * @param list<string> $required
	 */
	private static function validate_required( array $data, array $required ): ?WP_Error {
		foreach ( $required as $field ) {
			if ( empty( $data[ $field ] ) ) {
				return new WP_Error( 'validation', ucfirst( $field ) . ' is required', [ 'status' => 422 ] );
			}
		}
		return null;
	}

	/**
	 * Gift deadline must be today or a future date (store timezone).
	 *
	 * @param array<string,mixed> $data
	 */
	private static function validate_gift_deadline( array $data ): ?WP_Error {
		$deadline = (string) ( $data['deadline'] ?? $data['gift_deadline'] ?? '' );
		if ( $deadline === '' ) {
			return new WP_Error( 'validation', 'Gift deadline is required', [ 'status' => 422 ] );
		}

		$parsed = \DateTimeImmutable::createFromFormat( 'Y-m-d', $deadline, wp_timezone() );
		if ( ! $parsed || $parsed->format( 'Y-m-d' ) !== $deadline ) {
			return new WP_Error( 'validation', 'Gift deadline is invalid', [ 'status' => 422 ] );
		}

		$today = new \DateTimeImmutable( 'today', wp_timezone() );
		if ( $parsed < $today ) {
			return new WP_Error( 'validation', 'Gift deadline cannot be in the past', [ 'status' => 422 ] );
		}

		return null;
	}
}
