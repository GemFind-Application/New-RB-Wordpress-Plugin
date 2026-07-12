<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class GEMFINDRB_CSS {

	public static function get_dynamic_styles( string $shop ): string {
		$css = GEMFINDRB_DB::get_css( $shop );

		$pick = static function ( ?object $row, string $prop ): string {
			if ( $row && isset( $row->$prop ) && (string) $row->$prop !== '' ) {
				return (string) $row->$prop;
			}
			return function_exists( 'gemfindRB_css_colour_fallback' )
				? gemfindRB_css_colour_fallback( $prop )
				: '';
		};

		ob_start();
		?>
		#GemFind {
			--gemfindrb-link: <?php echo esc_attr( $pick( $css, 'link' ) ); ?>;
			--gemfindrb-header: <?php echo esc_attr( $pick( $css, 'header' ) ); ?>;
			--gemfindrb-button: <?php echo esc_attr( $pick( $css, 'button' ) ); ?>;
			--gemfindrb-slider: <?php echo esc_attr( $pick( $css, 'slider' ) ); ?>;
			--gemfindrb-hover: <?php echo esc_attr( $pick( $css, 'hover' ) ); ?>;
			--gemfindrb-background: <?php echo esc_attr( $pick( $css, 'background' ) ); ?>;
			--gemfindrb-background-txt: <?php echo esc_attr( $pick( $css, 'backgroundText' ) ); ?>;
		}
		<?php
		return (string) ob_get_clean();
	}
}
