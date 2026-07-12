<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class GEMFINDRB_Smtp {

	/**
	 * @return array{host:string,port:int,user:string,pass:string,encryption:string,from:string,from_name:string}|null
	 */
	public static function get_smtp_config_for_shop( string $shop ): ?array {
		if ( $shop === '' ) {
			return null;
		}

		$stored = self::get_stored_smtp_json( $shop );
		if ( is_array( $stored ) && ( $stored['host'] ?? '' ) !== '' ) {
			return $stored;
		}

		return is_array( $stored ) ? $stored : null;
	}

	/**
	 * @param array<string,mixed> $payload
	 */
	public static function save_configuration( string $shop, array $payload ): bool|WP_Error {
		if ( $shop === '' ) {
			return new WP_Error( 'missing_shop', 'Shop domain is required', [ 'status' => 400 ] );
		}

		$existing = self::get_stored_smtp_json( $shop ) ?? [];
		$pass     = (string) ( $payload['smtp_password'] ?? $payload['pass'] ?? '' );
		if ( $pass === '' && ! empty( $existing['pass'] ) ) {
			$pass = (string) $existing['pass'];
		}

		$row = [
			'host'       => sanitize_text_field( (string) ( $payload['smtp_host'] ?? $payload['host'] ?? '' ) ),
			'port'       => (int) ( $payload['smtp_port'] ?? $payload['port'] ?? 587 ),
			'user'       => sanitize_text_field( (string) ( $payload['smtp_username'] ?? $payload['user'] ?? '' ) ),
			'pass'       => $pass,
			'encryption' => sanitize_key( (string) ( $payload['encryption'] ?? $payload['protocol'] ?? 'tls' ) ),
			'from'       => sanitize_email( (string) ( $payload['from'] ?? '' ) ),
			'from_name'  => sanitize_text_field( (string) ( $payload['from_name'] ?? '' ) ),
		];

		$json = wp_json_encode( $row );
		if ( ! is_string( $json ) ) {
			return new WP_Error( 'encode', 'Could not encode SMTP settings', [ 'status' => 500 ] );
		}

		if ( ! GEMFINDRB_DB::get_config( $shop ) ) {
			GEMFINDRB_DB::upsert_config( [], $shop );
		}

		global $wpdb;
		$ok = false !== $wpdb->update(
			GEMFINDRB_DB::config_table(),
			[ 'smtp_json' => $json, 'updated_at' => current_time( 'mysql' ) ],
			[ 'shop' => $shop ],
			[ '%s', '%s' ],
			[ '%s' ]
		);

		return $ok ? true : new WP_Error( 'db', 'Could not save SMTP settings', [ 'status' => 500 ] );
	}

	public static function get_configuration_for_api( string $shop ): array {
		$stored = self::get_stored_smtp_json( $shop );
		if ( ! is_array( $stored ) ) {
			return [
				'encryption'    => 'none',
				'smtp_host'     => '',
				'smtp_port'     => '',
				'smtp_username' => '',
				'smtp_password' => '',
			];
		}

		return [
			'encryption'    => (string) ( $stored['encryption'] ?? 'tls' ),
			'smtp_host'     => (string) ( $stored['host'] ?? '' ),
			'smtp_port'     => (string) ( $stored['port'] ?? '' ),
			'smtp_username' => (string) ( $stored['user'] ?? '' ),
			'smtp_password' => ! empty( $stored['pass'] ) ? '********' : '',
		];
	}

	/**
	 * @return array<string,mixed>|null
	 */
	private static function get_stored_smtp_json( string $shop ): ?array {
		$raw = GEMFINDRB_DB::get_config_smtp_json( $shop );
		if ( $raw === null ) {
			return null;
		}
		$row = json_decode( $raw, true );
		return is_array( $row ) ? $row : null;
	}
}
