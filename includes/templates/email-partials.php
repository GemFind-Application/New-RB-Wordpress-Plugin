<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
require_once __DIR__ . '/email-layout.php';

/**
 * @param array<string,mixed> $ctx Template context from GEMFINDRB_Email.
 */
if ( ! function_exists( 'gemfindrb_email_partial_hint_gift' ) ) {
function gemfindrb_email_partial_hint_gift( array $ctx ): void {
	gemfindrb_email_info_table(
		[
			[ 'label' => 'Reason For This Hint:', 'value' => (string) ( $ctx['reason_of_gift'] ?? '' ) ],
			[ 'label' => 'Gift Deadline:', 'value' => (string) ( $ctx['deadline'] ?? '' ) ],
			[ 'label' => 'Additional Message:', 'value' => (string) ( $ctx['hint_message'] ?? '' ) ],
		]
	);
}
}

/**
 * @param array<string,mixed> $ctx
 */
if ( ! function_exists( 'gemfindrb_email_partial_ring_specs' ) ) {
function gemfindrb_email_partial_ring_specs( array $ctx ): void {
	$ring_url   = (string) ( $ctx['ring_url'] ?? '' );
	$setting_id = (string) ( $ctx['setting_id'] ?? '' );
	$setting_cell = $setting_id;
	if ( $ring_url !== '' && $setting_id !== '' ) {
		$setting_cell = '<a href="' . esc_url( $ring_url ) . '">' . esc_html( $setting_id ) . '</a>';
	}
	gemfindrb_email_section_heading( 'The Ring Specifications are:' );
	gemfindrb_email_info_table(
		[
			[ 'label' => 'Setting #:', 'value' => $setting_cell, 'html' => true ],
			[ 'label' => 'Style Number:', 'value' => (string) ( $ctx['stylenumber'] ?? '' ) ],
			[ 'label' => 'Metal Type:', 'value' => (string) ( $ctx['metaltype'] ?? '' ) ],
			[ 'label' => 'Center Stone Min Carat:', 'value' => (string) ( $ctx['centerStoneMinCarat'] ?? '' ) ],
			[ 'label' => 'Center Stone Max Carat:', 'value' => (string) ( $ctx['centerStoneMaxCarat'] ?? '' ) ],
			[ 'label' => 'Price:', 'value' => (string) ( $ctx['price_rb'] ?? $ctx['price'] ?? '' ) ],
		]
	);
}
}

/**
 * @param list<array{label:string,value:string,html?:bool}> $rows
 * @return list<array{label:string,value:string,html?:bool}>
 */
if ( ! function_exists( 'gemfindrb_email_filter_empty_rows' ) ) {
function gemfindrb_email_filter_empty_rows( array $rows ): array {
	$filtered = [];
	foreach ( $rows as $row ) {
		$value = trim( wp_strip_all_tags( (string) ( $row['value'] ?? '' ) ) );
		if ( $value === '' || $value === '-' ) {
			continue;
		}
		$filtered[] = $row;
	}
	return $filtered;
}
}

/**
 * @param array<string,mixed> $ctx
 */
if ( ! function_exists( 'gemfindrb_email_partial_diamond_specs' ) ) {
function gemfindrb_email_partial_diamond_specs( array $ctx ): void {
	$diamond_url = (string) ( $ctx['diamond_url'] ?? $ctx['diamondurl'] ?? '' );
	$diamond_id  = (string) ( $ctx['diamond_id'] ?? '' );
	$id_cell     = $diamond_id;
	if ( $diamond_url !== '' && $diamond_id !== '' ) {
		$id_cell = '<a href="' . esc_url( $diamond_url ) . '">' . esc_html( $diamond_id ) . '</a>';
	}
	gemfindrb_email_section_heading( 'Diamond Specifications are:' );
	gemfindrb_email_info_table(
		gemfindrb_email_filter_empty_rows(
			[
				[ 'label' => 'Diamond #:', 'value' => $id_cell, 'html' => true ],
				[ 'label' => 'Size:', 'value' => (string) ( $ctx['size'] ?? '' ) ],
				[ 'label' => 'Cut:', 'value' => (string) ( $ctx['cut'] ?? '' ) ],
				[ 'label' => 'Color:', 'value' => (string) ( $ctx['color'] ?? '' ) ],
				[ 'label' => 'Clarity:', 'value' => (string) ( $ctx['clarity'] ?? '' ) ],
				[ 'label' => 'Depth:', 'value' => (string) ( $ctx['depth'] ?? '' ) ],
				[ 'label' => 'Table:', 'value' => (string) ( $ctx['table'] ?? '' ) ],
				[ 'label' => 'Measurements:', 'value' => (string) ( $ctx['measurment'] ?? $ctx['measurement'] ?? '' ) ],
				[ 'label' => 'Certificate:', 'value' => (string) ( $ctx['certificate'] ?? '' ) ],
				[ 'label' => 'Price:', 'value' => (string) ( $ctx['price'] ?? '' ) ],
			]
		)
	);
}
}
