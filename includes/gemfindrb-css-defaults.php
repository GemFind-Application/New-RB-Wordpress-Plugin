<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @return array<string, string>
 */
function gemfindRB_default_css_row(): array {
	return [
		'link'                          => '#836a5d',
		'hover'                         => '#836a5d',
		'header'                        => '#f8f4f2',
		'button'                        => '#836a5d',
		'slider'                        => '#836a5d',
		'background'                    => '#262523',
		'backgroundText'                => '#262523',
		'nav_active_background_color'   => '#836a5d',
		'nav_active_text_color'         => '#ffffff',
		'nav_inactive_background_color' => '#f8f4f2',
		'nav_inactive_text_color'       => '#6a655e',
		'selected_theme'                => 'default',
		'set_default_view'              => '1',
	];
}

function gemfindRB_css_colour_fallback( string $prop ): string {
	$defaults = gemfindRB_default_css_row();
	return $defaults[ $prop ] ?? '';
}

function gemfindRB_ensure_default_css_for_shop( string $shop ): void {
	if ( $shop === '' || ! class_exists( 'GEMFINDRB_DB' ) ) {
		return;
	}
	if ( GEMFINDRB_DB::get_css( $shop ) ) {
		return;
	}
	GEMFINDRB_DB::upsert_css( gemfindRB_default_css_row(), $shop );
}
