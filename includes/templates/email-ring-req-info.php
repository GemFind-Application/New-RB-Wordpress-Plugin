<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
require_once __DIR__ . '/email-partials.php';
/** @var string $role */
$title = __( 'Request For More Info', 'gemfind-ring-builder' );
gemfindrb_email_layout_open( $title, compact( 'shopurl', 'shop_logo', 'shop_logo_alt' ) );

$gemfindrb_contact_rows = [
	[ 'label' => 'Name:', 'value' => (string) ( $name ?? '' ) ],
	[ 'label' => 'Email:', 'value' => (string) ( $email ?? '' ) ],
	[ 'label' => 'Phone No:', 'value' => (string) ( $phone_no ?? '' ) ],
	[ 'label' => 'Comments about Diamond:', 'value' => (string) ( $req_message ?? '' ) ],
	[ 'label' => 'Contact Preference:', 'value' => (string) ( $contact_preference ?? '' ) ],
];

if ( $role === 'sender' ) {
	gemfindrb_email_dear( (string) ( $name ?? '' ) );
	gemfindrb_email_intro( 'Thank you for your interest in our Ring.' );
	gemfindrb_email_section_heading( 'Your Information' );
	gemfindrb_email_info_table( $gemfindrb_contact_rows );
	gemfindrb_email_partial_ring_specs( get_defined_vars() );
	gemfindrb_email_view_button( (string) ( $ring_url ?? '' ) );
} else {
	gemfindrb_email_dear( (string) ( $vendorName ?? $retailername ?? '' ) );
	gemfindrb_email_intro( '<strong>NOTICE:</strong> This is notification that one of your diamonds received interest from a consumer of the retail jeweler below, please DO NOT CONTACT the retailer, they will contact you if they need additional information about this diamond.', true );
	gemfindrb_email_intro( sprintf( 'Customer interested in jewelcloud.com Ring#:%s', (string) ( $setting_id ?? '' ) ) );
	gemfindrb_email_section_heading( 'Consumer Information' );
	gemfindrb_email_info_table( $gemfindrb_contact_rows );
	gemfindrb_email_partial_ring_specs( get_defined_vars() );
	gemfindrb_email_partial_vendor_info( $settingVendorInfo ?? null );
	gemfindrb_email_view_button( (string) ( $ring_url ?? '' ) );
	gemfindrb_email_regards( (string) ( $storeName ?? '' ) );
}

gemfindrb_email_layout_close();
