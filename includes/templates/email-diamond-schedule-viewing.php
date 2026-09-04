<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
require_once __DIR__ . '/email-partials.php';
/** @var string $role */
$title = __( 'Schedule Viewing Notification', 'gemfind-ring-builder' );
gemfindrb_email_layout_open( $title, compact( 'shopurl', 'shop_logo', 'shop_logo_alt' ) );
$gemfindrb_item_url = (string) ( $diamondurl ?? $diamond_url ?? '' );
$gemfindrb_specs_heading = 'The Diamond Specifications are:';

$gemfindrb_appt_rows = [
	[ 'label' => 'Contact Name:', 'value' => (string) ( $name ?? '' ) ],
	[ 'label' => 'Email:', 'value' => (string) ( $email ?? '' ) ],
	[ 'label' => 'Phone:', 'value' => (string) ( $phone_no ?? '' ) ],
	[ 'label' => 'Comments:', 'value' => (string) ( $schl_message ?? '' ) ],
	[ 'label' => 'Location:', 'value' => (string) ( $location ?? '' ) ],
];
if ( ! empty( $availability_date ) ) {
	$gemfindrb_appt_rows[] = [ 'label' => 'Date:', 'value' => (string) $availability_date ];
}
if ( ! empty( $appnt_time ) ) {
	$gemfindrb_appt_rows[] = [ 'label' => 'Time:', 'value' => (string) $appnt_time ];
}

if ( $role === 'sender' ) {
	gemfindrb_email_dear( (string) ( $name ?? '' ) );
	gemfindrb_email_intro( 'Your appointment has been confirmed.' );
	gemfindrb_email_intro( '<strong>Disclaimer : </strong>Not all diamonds are in stock. A sales representative will inform you of alternative options.', true );
	gemfindrb_email_section_heading( 'Appointment Calendar' );
	gemfindrb_email_info_table( $gemfindrb_appt_rows );
	gemfindrb_email_partial_diamond_specs( get_defined_vars(), $gemfindrb_specs_heading );
	gemfindrb_email_view_button( $gemfindrb_item_url );
	gemfindrb_email_regards( (string) ( $storeName ?? '' ) );
} else {
	gemfindrb_email_dear( (string) ( $retailername ?? '' ) );
	gemfindrb_email_intro( 'The following appointment has been scheduled through your website' );
	gemfindrb_email_section_heading( 'Appointment Calendar:' );
	gemfindrb_email_info_table( $gemfindrb_appt_rows );
	gemfindrb_email_partial_diamond_specs( get_defined_vars(), $gemfindrb_specs_heading, true );
	gemfindrb_email_partial_vendor_info( $diamondVendorInfo ?? null );
	gemfindrb_email_view_button( $gemfindrb_item_url );
	gemfindrb_email_regards( (string) ( $storeName ?? '' ) );
}

gemfindrb_email_layout_close();
