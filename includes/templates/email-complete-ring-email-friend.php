<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
require_once __DIR__ . '/email-partials.php';
/** @var string $role */
$title = __( 'A Friend Wants To Share With You', 'gemfind-ring-builder' );
gemfindrb_email_layout_open( $title, compact( 'shopurl', 'shop_logo', 'shop_logo_alt' ) );
$gemfindrb_view_url = (string) ( $complete_ring_url ?? $ring_url ?? '' );

if ( $role === 'sender' ) {
	gemfindrb_email_dear( (string) ( $name ?? '' ) );
	gemfindrb_email_intro( sprintf( 'You have shared this gorgeous gift idea with your friend %s.', (string) ( $frnd_name ?? '' ) ) );
	gemfindrb_email_info_table( [ [ 'label' => 'Additional Comments:', 'value' => (string) ( $frnd_message ?? '' ) ] ] );
	gemfindrb_email_partial_ring_specs( get_defined_vars() );
	gemfindrb_email_partial_diamond_specs( get_defined_vars() );
	gemfindrb_email_view_button( $gemfindrb_view_url );
} elseif ( $role === 'receiver' ) {
	gemfindrb_email_dear( (string) ( $frnd_name ?? '' ) );
	gemfindrb_email_intro( sprintf( 'Your friend %s shared this gorgeous gift idea with you!', (string) ( $name ?? '' ) ) );
	gemfindrb_email_info_table( [ [ 'label' => 'Additional Comments:', 'value' => (string) ( $frnd_message ?? '' ) ] ] );
	gemfindrb_email_partial_ring_specs( get_defined_vars() );
	gemfindrb_email_partial_diamond_specs( get_defined_vars() );
	gemfindrb_email_view_button( $gemfindrb_view_url );
} else {
	gemfindrb_email_dear( (string) ( $retailername ?? '' ) );
	gemfindrb_email_intro( sprintf( '%s has sent following product to his/her friend %s.', (string) ( $name ?? '' ), (string) ( $frnd_name ?? '' ) ) );
	gemfindrb_email_section_heading( 'User Information:' );
	gemfindrb_email_info_table(
		[
			[ 'label' => 'Name:', 'value' => (string) ( $name ?? '' ) ],
			[ 'label' => 'Email:', 'value' => (string) ( $email ?? '' ) ],
			[ 'label' => 'Friend Name:', 'value' => (string) ( $frnd_name ?? '' ) ],
			[ 'label' => 'Friend Email:', 'value' => (string) ( $frnd_email ?? '' ) ],
			[ 'label' => 'Additional Comments:', 'value' => (string) ( $frnd_message ?? '' ) ],
		]
	);
	gemfindrb_email_partial_ring_specs( get_defined_vars() );
	gemfindrb_email_partial_vendor_info( $settingVendorInfo ?? null, 'Setting Vendor Information' );
	gemfindrb_email_partial_diamond_specs( get_defined_vars(), 'Diamond Specifications are:', true );
	gemfindrb_email_partial_vendor_info( $diamondVendorInfo ?? null, 'Diamond Vendor Information' );
	gemfindrb_email_view_button( $gemfindrb_view_url );
}

gemfindrb_email_layout_close();
