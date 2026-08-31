<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Custom plugin tables have no WP_Query equivalent.
// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange

class GEMFINDRB_Activator {

	public static function activate(): void {
		self::migrate_schema();
		self::ensure_ringbuilder_pages();
		if ( function_exists( 'flush_rewrite_rules' ) ) {
			flush_rewrite_rules( false );
		}
	}

	public static function migrate_schema(): void {
		global $wpdb;

		$charset_collate = $wpdb->get_charset_collate();
		$table_config    = $wpdb->prefix . 'ringbuilder_config';
		$table_css       = $wpdb->prefix . 'ringbuilder_css_configure';
		$table_customer  = $wpdb->prefix . 'ringbuilder_customer';

		$sql_config = "CREATE TABLE $table_config (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			shop varchar(255) NOT NULL,
			dealerid varchar(255) DEFAULT NULL,
			dealerpassword varchar(255) DEFAULT NULL,
			admin_email_address text DEFAULT NULL,
			from_email_address text DEFAULT NULL,
			dealerauthapi text DEFAULT NULL,
			ringfiltersapi text DEFAULT NULL,
			mountinglistapi text DEFAULT NULL,
			mountinglistapifancy text DEFAULT NULL,
			mountingdetailapi text DEFAULT NULL,
			ringstylesettingsapi text DEFAULT NULL,
			navigationapi text DEFAULT NULL,
			navigationapirb text DEFAULT NULL,
			filterapi text DEFAULT NULL,
			filterapifancy text DEFAULT NULL,
			diamondlistapi text DEFAULT NULL,
			diamondlistapifancy text DEFAULT NULL,
			diamondshapeapi text DEFAULT NULL,
			diamonddetailapi text DEFAULT NULL,
			stylesettingapi text DEFAULT NULL,
			diamondsoptionapi text DEFAULT NULL,
			enable_hint tinyint(1) DEFAULT 1,
			enable_email_friend tinyint(1) DEFAULT 1,
			enable_schedule_viewing tinyint(1) DEFAULT 1,
			enable_more_info tinyint(1) DEFAULT 1,
			enable_print tinyint(1) DEFAULT 1,
			enable_admin_notification tinyint(1) DEFAULT 1,
			default_view varchar(50) DEFAULT 'list',
			shop_logo text DEFAULT NULL,
			settings_carat_ranges longtext DEFAULT NULL,
			load_from_woocommerce tinyint(1) DEFAULT 0,
			buySingleDiamond varchar(10) DEFAULT '0',
			show_powered_by tinyint(1) DEFAULT 0,
			show_copyright tinyint(1) DEFAULT 0,
			products_pp int(11) DEFAULT 12,
			font_family varchar(255) DEFAULT 'Helvetica',
			theme_font_family varchar(255) DEFAULT NULL,
			shop_title varchar(255) DEFAULT NULL,
			phone_number varchar(50) DEFAULT NULL,
			display_tryon tinyint(1) DEFAULT 0,
			show_filter_info tinyint(1) DEFAULT 1,
			enable_sticky_header tinyint(1) DEFAULT 1,
			ring_meta_title text DEFAULT NULL,
			ring_meta_description text DEFAULT NULL,
			ring_meta_keywords text DEFAULT NULL,
			diamond_meta_title text DEFAULT NULL,
			diamond_meta_description text DEFAULT NULL,
			diamond_meta_keyword text DEFAULT NULL,
			announcement_text text DEFAULT NULL,
			announcement_text_rbdetail text DEFAULT NULL,
			diamond_details_textarea text DEFAULT NULL,
			site_key varchar(255) DEFAULT NULL,
			secret_key varchar(255) DEFAULT NULL,
			recaptcha_version varchar(10) DEFAULT 'v2',
			price_row_format varchar(50) DEFAULT 'left',
			tool_version varchar(50) DEFAULT '2.0',
			smtp_json longtext NULL,
			customer_registered tinyint(1) NOT NULL DEFAULT 0,
			created_at datetime DEFAULT NULL,
			updated_at datetime DEFAULT NULL,
			PRIMARY KEY  (id)
		) $charset_collate;";

		$sql_css = "CREATE TABLE $table_css (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			shop varchar(255) DEFAULT NULL,
			link varchar(50) DEFAULT NULL,
			header varchar(50) DEFAULT NULL,
			button varchar(50) DEFAULT NULL,
			slider varchar(50) DEFAULT NULL,
			hover varchar(50) DEFAULT NULL,
			background varchar(50) DEFAULT NULL,
			backgroundText varchar(50) DEFAULT NULL,
			nav_active_background_color varchar(50) DEFAULT NULL,
			nav_active_text_color varchar(50) DEFAULT NULL,
			nav_inactive_background_color varchar(50) DEFAULT NULL,
			nav_inactive_text_color varchar(50) DEFAULT NULL,
			selected_theme varchar(50) DEFAULT NULL,
			set_default_view varchar(50) DEFAULT NULL,
			created_at datetime DEFAULT NULL,
			PRIMARY KEY  (id)
		) $charset_collate;";

		$sql_customer = "CREATE TABLE $table_customer (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			shop varchar(255) NOT NULL,
			name varchar(255) DEFAULT NULL,
			email varchar(255) DEFAULT NULL,
			phone varchar(50) DEFAULT NULL,
			business varchar(255) DEFAULT NULL,
			telephone varchar(50) DEFAULT NULL,
			address text DEFAULT NULL,
			city varchar(100) DEFAULT NULL,
			state varchar(100) DEFAULT NULL,
			country varchar(100) DEFAULT NULL,
			zip_code varchar(20) DEFAULT NULL,
			website varchar(255) DEFAULT NULL,
			notes text DEFAULT NULL,
			created_at datetime DEFAULT NULL,
			updated_at datetime DEFAULT NULL,
			PRIMARY KEY  (id)
		) $charset_collate;";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql_config );
		dbDelta( $sql_css );
		dbDelta( $sql_customer );

		$shop   = gemfindRB_shop_key();
		$jc     = 'https://api.jewelcloud.com/api/RingBuilder/';
		$exists = $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM %i WHERE shop = %s', $table_config, $shop ) );

		if ( ! $exists ) {
			$wpdb->insert(
				$table_config,
				[
					'shop'                 => $shop,
					'dealerid'             => '',
					'dealerauthapi'        => $jc . 'AccountAuthentication',
					'ringfiltersapi'       => $jc . 'GetFilters?',
					'mountinglistapi'      => $jc . 'GetMountingList?',
					'mountinglistapifancy' => $jc . 'GetMountingDetail?',
					'mountingdetailapi'    => $jc . 'GetMountingDetail?',
					'ringstylesettingsapi' => $jc . 'GetStyleSetting?',
					'navigationapi'        => $jc . 'GetNavigation?',
					'navigationapirb'      => $jc . 'GetRBNavigation?',
					'filterapi'            => $jc . 'GetDiamondFilter?',
					'filterapifancy'       => $jc . 'GetColorDiamondFilter?',
					'diamondlistapi'       => $jc . 'GetDiamond?',
					'diamondlistapifancy'  => $jc . 'GetColorDiamond?',
					'diamondshapeapi'      => $jc . 'GetShapeByColorFilter?',
					'diamonddetailapi'     => $jc . 'GetDiamondDetail?',
					'stylesettingapi'      => $jc . 'GetStyleSetting?',
					'diamondsoptionapi'    => $jc . 'GetDiamondsJCOptions?',
					'enable_hint'          => 1,
					'enable_email_friend'  => 1,
					'enable_schedule_viewing' => 1,
					'enable_more_info'     => 1,
					'enable_print'         => 1,
					'show_powered_by'      => 0,
					'products_pp'          => 12,
					'font_family'          => 'Helvetica',
					'customer_registered'  => 0,
					'tool_version'         => GEMFINDRB_Frontend_Version::DEFAULT,
					'created_at'           => current_time( 'mysql' ),
					'updated_at'           => current_time( 'mysql' ),
				]
			);
		}

		if ( function_exists( 'gemfindRB_ensure_default_css_for_shop' ) ) {
			gemfindRB_ensure_default_css_for_shop( $shop );
		}
	}

	public static function ensure_ringbuilder_pages(): void {
		if ( ! function_exists( 'wp_insert_post' ) ) {
			return;
		}

		$parent_id = self::ensure_page(
			'gemfindRB_tool_page_id',
			'ringbuilder',
			__( 'Ring Builder', 'gemfind-ring-builder' ),
			self::default_tool_page_content(),
			0
		);

		if ( $parent_id <= 0 ) {
			return;
		}

		self::ensure_page(
			'gemfindRB_settings_page_id',
			'settings',
			__( 'Settings', 'gemfind-ring-builder' ),
			'',
			$parent_id
		);

		self::ensure_page(
			'gemfindRB_diamondlink_page_id',
			'diamondlink',
			__( 'Diamond Link', 'gemfind-ring-builder' ),
			'',
			$parent_id
		);

		self::assign_full_width_template_if_missing( $parent_id );

		if ( function_exists( 'flush_rewrite_rules' ) ) {
			delete_option( 'gemfindRB_rewrite_version' );
		}
	}

	private static function default_tool_page_content(): string {
		return "<!-- wp:shortcode -->\n[gemfindRB_ring_builder]\n<!-- /wp:shortcode -->";
	}

	private static function ensure_page( string $option_key, string $slug, string $title, string $content, int $parent_id ): int {
		$candidate_id = (int) get_option( $option_key, 0 );
		if ( $candidate_id > 0 ) {
			$p = get_post( $candidate_id );
			if ( $p instanceof WP_Post && $p->post_type === 'page' && $p->post_status !== 'trash' ) {
				self::repair_page( $candidate_id, $slug, $title, $content, $parent_id );
				return $candidate_id;
			}
		}

		$path = $parent_id > 0 ? 'ringbuilder/' . $slug : $slug;
		$by_path = get_page_by_path( $path, OBJECT, 'page' );
		if ( $by_path instanceof WP_Post && $by_path->ID > 0 && $by_path->post_status !== 'trash' ) {
			self::repair_page( (int) $by_path->ID, $slug, $title, $content, $parent_id );
			update_option( $option_key, (int) $by_path->ID );
			return (int) $by_path->ID;
		}

		$insert = wp_insert_post(
			[
				'post_type'    => 'page',
				'post_status'  => 'publish',
				'post_title'   => $title,
				'post_name'    => $slug,
				'post_parent'  => $parent_id,
				'post_content' => $content,
			],
			true
		);

		if ( is_wp_error( $insert ) || (int) $insert <= 0 ) {
			return 0;
		}

		update_option( $option_key, (int) $insert );
		return (int) $insert;
	}

	private static function repair_page( int $page_id, string $slug, string $title, string $content, int $parent_id ): void {
		$p = get_post( $page_id );
		if ( ! $p instanceof WP_Post ) {
			return;
		}

		$update  = [ 'ID' => $page_id ];
		$changed = false;

		if ( $p->post_status !== 'publish' ) {
			$update['post_status'] = 'publish';
			$changed               = true;
		}
		if ( $p->post_name !== $slug ) {
			$update['post_name'] = $slug;
			$changed             = true;
		}
		if ( $parent_id !== (int) $p->post_parent ) {
			$update['post_parent'] = $parent_id;
			$changed               = true;
		}
		if ( $content !== '' && ! has_shortcode( (string) $p->post_content, 'gemfindRB_ring_builder' ) ) {
			$update['post_content'] = $content;
			$changed                = true;
		}

		if ( $changed ) {
			wp_update_post( $update );
		}
	}

	private static function assign_full_width_template_if_missing( int $page_id ): void {
		if ( $page_id <= 0 || ! class_exists( 'GEMFINDRB_Full_Width_Template', false ) ) {
			return;
		}
		$tpl     = GEMFINDRB_Full_Width_Template::TEMPLATE_FILE;
		$current = (string) get_post_meta( $page_id, '_wp_page_template', true );
		if ( $current !== '' && $current !== $tpl ) {
			return;
		}
		update_post_meta( $page_id, '_wp_page_template', $tpl );
	}
}
