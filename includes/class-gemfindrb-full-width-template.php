<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class GEMFINDRB_Full_Width_Template {

	public const TEMPLATE_FILE = 'gemfindrb-full-width-ring-builder.php';

	public static function register(): void {
		add_filter( 'theme_page_templates', [ self::class, 'add_to_page_template_dropdown' ], 20, 4 );
		add_filter( 'template_include', [ self::class, 'load_plugin_template' ], 99 );
		add_filter( 'body_class', [ self::class, 'body_class' ] );
	}

	/**
	 * @param array<string,string> $post_templates
	 * @return array<string,string>
	 */
	public static function add_to_page_template_dropdown( array $post_templates, $theme, $post, $post_type ): array {
		if ( $post_type !== 'page' ) {
			return $post_templates;
		}
		$post_templates[ self::TEMPLATE_FILE ] = __( 'GemFind Ring Builder (full width)', 'gemfind-ring-builder' );
		return $post_templates;
	}

	public static function load_plugin_template( string $template ): string {
		if ( ! self::is_ring_builder_page() ) {
			return $template;
		}
		$plugin_template = GEMFINDRB_PATH . 'templates/full-width-ring-builder.php';
		return is_readable( $plugin_template ) ? $plugin_template : $template;
	}

	public static function is_ring_builder_page(): bool {
		if ( ! is_singular( 'page' ) ) {
			return false;
		}
		$post = get_queried_object();
		if ( ! $post instanceof WP_Post ) {
			return false;
		}
		$content = (string) $post->post_content;
		return has_shortcode( $content, 'gemfindRB_ring_builder' ) || str_contains( $content, '[gemfindRB_ring_builder' );
	}

	/**
	 * @param string[] $classes
	 * @return string[]
	 */
	public static function body_class( array $classes ): array {
		if ( self::is_ring_builder_page() ) {
			$classes[] = 'gemfind-full-width-layout';
		}
		return $classes;
	}
}
