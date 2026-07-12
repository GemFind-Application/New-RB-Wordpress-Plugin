<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class GEMFINDRB_Mail {

	private static ?string $active_shop = null;

	public static function send( string $shop, string $to, string $subject, string $message, array|string $headers = [] ): bool {
		$shop = sanitize_text_field( $shop );
		self::$active_shop = $shop !== '' ? $shop : null;
		add_action( 'phpmailer_init', [ self::class, 'configure_phpmailer' ], 5, 1 );
		$ok = wp_mail( $to, wp_specialchars_decode( $subject, ENT_QUOTES ), $message, $headers );
		remove_action( 'phpmailer_init', [ self::class, 'configure_phpmailer' ], 5 );
		self::$active_shop = null;
		return $ok;
	}

	/**
	 * @param \PHPMailer\PHPMailer\PHPMailer $phpmailer
	 */
	public static function configure_phpmailer( $phpmailer ): void {
		if ( self::$active_shop === null ) {
			return;
		}

		$cfg = GEMFINDRB_Smtp::get_smtp_config_for_shop( self::$active_shop );
		if ( $cfg === null || ( $cfg['host'] ?? '' ) === '' ) {
			return;
		}

		$phpmailer->isSMTP();
		$phpmailer->Host        = (string) $cfg['host'];
		$phpmailer->Port        = (int) ( $cfg['port'] ?? 587 );
		$phpmailer->SMTPAuth    = ( (string) ( $cfg['user'] ?? '' ) ) !== '';
		$phpmailer->Username    = (string) ( $cfg['user'] ?? '' );
		$phpmailer->Password    = (string) ( $cfg['pass'] ?? '' );
		$phpmailer->SMTPAutoTLS = true;

		$enc = strtolower( (string) ( $cfg['encryption'] ?? 'tls' ) );
		$phpmailer->SMTPSecure  = $enc === 'ssl' ? 'ssl' : ( $enc === 'tls' ? 'tls' : '' );

		if ( ! empty( $cfg['from'] ) && is_email( (string) $cfg['from'] ) ) {
			$phpmailer->setFrom( (string) $cfg['from'], (string) ( $cfg['from_name'] ?? '' ), false );
		}
	}
}
