<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class GEMFINDRB_DB {

	private static bool $schema_checked = false;

	public static function config_table(): string {
		global $wpdb;
		return $wpdb->prefix . 'ringbuilder_config';
	}

	public static function css_table(): string {
		global $wpdb;
		return $wpdb->prefix . 'ringbuilder_css_configure';
	}

	public static function customer_table(): string {
		global $wpdb;
		return $wpdb->prefix . 'ringbuilder_customer';
	}

	public static function column_exists( string $table, string $column ): bool {
		global $wpdb;
		$found = $wpdb->get_results(
			$wpdb->prepare( 'SHOW COLUMNS FROM %i LIKE %s', $table, $column )
		);
		return is_array( $found ) && $found !== [];
	}

	public static function runtime_migrate(): void {
		if ( self::$schema_checked ) {
			return;
		}
		self::$schema_checked = true;

		global $wpdb;
		$table = self::config_table();
		$cust  = self::customer_table();
		$jc    = 'https://api.jewelcloud.com/api/RingBuilder/';

		if ( ! self::column_exists( $table, 'customer_registered' ) ) {
			$wpdb->query(
				$wpdb->prepare(
					'ALTER TABLE %i ADD COLUMN customer_registered tinyint(1) NOT NULL DEFAULT 0',
					$table
				)
			);
		}

		if ( ! self::column_exists( $table, 'smtp_json' ) ) {
			$wpdb->query(
				$wpdb->prepare( 'ALTER TABLE %i ADD COLUMN smtp_json longtext NULL', $table )
			);
		}

		$optional_columns = [
			'display_tryon'              => 'tinyint(1) DEFAULT 0',
			'show_filter_info'           => 'tinyint(1) DEFAULT 1',
			'enable_sticky_header'       => 'tinyint(1) DEFAULT 1',
			'ring_meta_title'            => 'text DEFAULT NULL',
			'ring_meta_description'      => 'text DEFAULT NULL',
			'ring_meta_keywords'         => 'text DEFAULT NULL',
			'diamond_meta_title'         => 'text DEFAULT NULL',
			'diamond_meta_description'   => 'text DEFAULT NULL',
			'diamond_meta_keyword'       => 'text DEFAULT NULL',
			'announcement_text'          => 'text DEFAULT NULL',
			'announcement_text_rbdetail' => 'text DEFAULT NULL',
			'diamond_details_textarea'   => 'text DEFAULT NULL',
			'site_key'                   => 'varchar(255) DEFAULT NULL',
			'secret_key'                 => 'varchar(255) DEFAULT NULL',
			'recaptcha_version'          => "varchar(10) DEFAULT 'v2'",
			'price_row_format'           => "varchar(50) DEFAULT 'left'",
			'tool_version'               => "varchar(50) DEFAULT '2.0'",
		];

		foreach ( $optional_columns as $column => $definition ) {
			if ( ! self::column_exists( $table, $column ) ) {
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- controlled column names.
				$wpdb->query( "ALTER TABLE `{$table}` ADD COLUMN `{$column}` {$definition}" );
			}
		}

		$cust_table = self::customer_table();
		$customer_cols = [
			'business' => 'varchar(255) DEFAULT NULL',
			'telephone' => 'varchar(50) DEFAULT NULL',
			'address' => 'text DEFAULT NULL',
			'city' => 'varchar(100) DEFAULT NULL',
			'state' => 'varchar(100) DEFAULT NULL',
			'country' => 'varchar(100) DEFAULT NULL',
			'zip_code' => 'varchar(20) DEFAULT NULL',
			'website' => 'varchar(255) DEFAULT NULL',
			'notes' => 'text DEFAULT NULL',
		];
		foreach ( $customer_cols as $column => $definition ) {
			if ( ! self::column_exists( $cust_table, $column ) ) {
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$wpdb->query( "ALTER TABLE `{$cust_table}` ADD COLUMN `{$column}` {$definition}" );
			}
		}

		$wpdb->query(
			$wpdb->prepare(
				'UPDATE %i c INNER JOIN %i u ON c.shop = u.shop SET c.customer_registered = 1',
				$table,
				$cust
			)
		);

		if ( function_exists( 'gemfindRB_ensure_default_css_for_shop' ) ) {
			$shops = $wpdb->get_col( $wpdb->prepare( 'SELECT shop FROM %i', $table ) );
			if ( is_array( $shops ) ) {
				foreach ( $shops as $shop ) {
					if ( is_string( $shop ) && $shop !== '' ) {
						gemfindRB_ensure_default_css_for_shop( $shop );
					}
				}
			}
		}

		$rows = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT id, dealerauthapi, navigationapi, filterapi, mountinglistapi, mountingdetailapi, mountinglistapifancy FROM %i',
				$table
			)
		);

		foreach ( (array) $rows as $row ) {
			$update = [];
			if ( empty( $row->dealerauthapi ) ) {
				$update['dealerauthapi'] = $jc . 'AccountAuthentication';
			}
			if ( empty( $row->navigationapi ) ) {
				$update['navigationapi']   = $jc . 'GetNavigation?';
				$update['navigationapirb'] = $jc . 'GetRBNavigation?';
			}
			if ( empty( $row->filterapi ) ) {
				$update['filterapi']           = $jc . 'GetDiamondFilter?';
				$update['filterapifancy']      = $jc . 'GetColorDiamondFilter?';
				$update['diamondlistapi']      = $jc . 'GetDiamond?';
				$update['diamondlistapifancy'] = $jc . 'GetColorDiamond?';
				$update['diamondshapeapi']     = $jc . 'GetShapeByColorFilter?';
				$update['diamonddetailapi']    = $jc . 'GetDiamondDetail?';
				$update['stylesettingapi']     = $jc . 'GetStyleSetting?';
				$update['ringfiltersapi']      = $jc . 'GetFilters?';
				$update['mountinglistapi']     = $jc . 'GetMountingList?';
				$update['mountingdetailapi']   = $jc . 'GetMountingDetail?';
			}
			if ( empty( $row->mountinglistapifancy ) ) {
				$update['mountinglistapifancy'] = ! empty( $row->mountingdetailapi )
					? (string) $row->mountingdetailapi
					: $jc . 'GetMountingDetail?';
			}
			if ( $update !== [] ) {
				$wpdb->update( $table, $update, [ 'id' => $row->id ] );
			}
		}
	}

	/** @return object|null */
	public static function get_config( string $shop ) {
		global $wpdb;
		return $wpdb->get_row(
			$wpdb->prepare( 'SELECT * FROM %i WHERE shop = %s LIMIT 1', self::config_table(), $shop )
		);
	}

	public static function update_config( array $data, string $shop ): bool {
		global $wpdb;
		self::runtime_migrate();
		$data['updated_at'] = current_time( 'mysql' );
		$result = $wpdb->update( self::config_table(), $data, [ 'shop' => $shop ] );
		if ( $result === false && $wpdb->last_error !== '' ) {
			return false;
		}
		return true;
	}

	public static function upsert_config( array $data, string $shop ): bool {
		global $wpdb;
		self::runtime_migrate();
		$table  = self::config_table();
		$exists = $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM %i WHERE shop = %s LIMIT 1', $table, $shop ) );
		if ( $exists ) {
			return self::update_config( $data, $shop );
		}
		$data['shop']       = $shop;
		$data['created_at'] = current_time( 'mysql' );
		$data['updated_at'] = current_time( 'mysql' );
		return (bool) $wpdb->insert( $table, $data );
	}

	public static function mark_customer_registered_in_config( string $shop ): void {
		if ( $shop === '' || ! self::get_config( $shop ) ) {
			return;
		}
		self::update_config( [ 'customer_registered' => 1 ], $shop );
	}

	/** @return string|null */
	public static function get_config_smtp_json( string $shop ): ?string {
		if ( ! self::column_exists( self::config_table(), 'smtp_json' ) ) {
			return null;
		}
		global $wpdb;
		$raw = $wpdb->get_var(
			$wpdb->prepare( 'SELECT smtp_json FROM %i WHERE shop = %s LIMIT 1', self::config_table(), $shop )
		);
		return is_string( $raw ) && $raw !== '' ? $raw : null;
	}

	/** @return object|null */
	public static function get_customer( string $shop ) {
		global $wpdb;
		return $wpdb->get_row(
			$wpdb->prepare( 'SELECT * FROM %i WHERE shop = %s LIMIT 1', self::customer_table(), $shop )
		);
	}

	public static function upsert_customer( array $data, string $shop ): bool {
		global $wpdb;
		$table  = self::customer_table();
		$exists = $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM %i WHERE shop = %s LIMIT 1', $table, $shop ) );
		if ( $exists ) {
			$data['updated_at'] = current_time( 'mysql' );
			return (bool) $wpdb->update( $table, $data, [ 'shop' => $shop ] );
		}
		$data['shop']       = $shop;
		$data['created_at'] = current_time( 'mysql' );
		$data['updated_at'] = current_time( 'mysql' );
		return (bool) $wpdb->insert( $table, $data );
	}

	/** @return object|null */
	public static function get_css( string $shop ) {
		global $wpdb;
		return $wpdb->get_row(
			$wpdb->prepare( 'SELECT * FROM %i WHERE shop = %s LIMIT 1', self::css_table(), $shop )
		);
	}

	public static function upsert_css( array $data, string $shop ): bool {
		global $wpdb;
		$table  = self::css_table();
		$exists = $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM %i WHERE shop = %s LIMIT 1', $table, $shop ) );
		if ( $exists ) {
			return $wpdb->update( $table, $data, [ 'shop' => $shop ] ) !== false;
		}
		$data['shop']       = $shop;
		$data['created_at'] = current_time( 'mysql' );
		return (bool) $wpdb->insert( $table, $data );
	}
}
