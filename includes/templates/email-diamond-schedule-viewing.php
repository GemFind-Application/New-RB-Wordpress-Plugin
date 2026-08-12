<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
require_once __DIR__ . '/email-partials.php';
/** @var string $role */
$title = __( 'Schedule Viewing Notification', 'gemfind-ring-builder' );
gemfindrb_email_layout_open( $title, compact( 'shopurl', 'shop_logo', 'shop_logo_alt' ) );
$item_url = (string) ( $diamondurl ?? $diamond_url ?? '' );

$appt_rows = [
	[ 'label' => 'Contact Name:', 'value' => (string) ( $name ?? '' ) ],
	[ 'label' => 'Email:', 'value' => (string) ( $email ?? '' ) ],
	[ 'label' => 'Phone:', 'value' => (string) ( $phone_no ?? '' ) ],
	[ 'label' => 'Comments:', 'value' => (string) ( $schl_message ?? '' ) ],
	[ 'label' => 'Location:', 'value' => (string) ( $location ?? '' ) ],
];
if ( ! empty( $availability_date ) ) {
	$appt_rows[] = [ 'label' => 'Date:', 'value' => (string) $availability_date ];
}
if ( ! empty( $appnt_time ) ) {
	$appt_rows[] = [ 'label' => 'Time:', 'value' => (string) $appnt_time ];
}

if ( $role === 'sender' ) {
	gemfindrb_email_dear( (string) ( $name ?? '' ) );
	gemfindrb_email_intro( 'Your appointment has been confirmed.' );
	gemfindrb_email_intro( '<strong>Disclaimer : </strong>Not all diamonds are in stock. A sales representative will inform you of alternative options.', true );
	gemfindrb_email_section_heading( 'Appointment Calendar' );
	gemfindrb_email_info_table( $appt_rows );
	gemfindrb_email_partial_diamond_specs( get_defined_vars() );
	gemfindrb_email_view_button( $item_url );
} else {
	gemfindrb_email_dear( (string) ( $retailername ?? '' ) );
	gemfindrb_email_intro( sprintf( 'A customer has requested an appointment to view Diamond#:%s', (string) ( $diamond_id ?? '' ) ) );
	gemfindrb_email_section_heading( 'Appointment Calendar' );
	gemfindrb_email_info_table( $appt_rows );
	gemfindrb_email_partial_diamond_specs( get_defined_vars() );
	gemfindrb_email_view_button( $item_url );
}

gemfindrb_email_layout_close();
