<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
require_once __DIR__ . '/email-partials.php';
/** @var string $role */
$title = __( 'A Friend Wants To Share With You', 'gemfind-ring-builder' );
gemfindrb_email_layout_open( $title, compact( 'shopurl', 'shop_logo', 'shop_logo_alt' ) );
$item_url = (string) ( $diamondurl ?? $diamond_url ?? '' );

if ( $role === 'sender' ) {
	gemfindrb_email_dear( (string) ( $name ?? '' ) );
	gemfindrb_email_intro( sprintf( 'You have shared this gorgeous gift idea with your friend %s.', (string) ( $frnd_name ?? '' ) ) );
	gemfindrb_email_info_table( [ [ 'label' => 'Additional Comments:', 'value' => (string) ( $frnd_message ?? '' ) ] ] );
	gemfindrb_email_partial_diamond_specs( get_defined_vars() );
	gemfindrb_email_view_button( $item_url );
} elseif ( $role === 'receiver' ) {
	gemfindrb_email_dear( (string) ( $frnd_name ?? '' ) );
	gemfindrb_email_intro( sprintf( 'Your friend %s wants to share this gorgeous gift idea with you.', (string) ( $name ?? '' ) ) );
	gemfindrb_email_info_table( [ [ 'label' => 'Additional Comments:', 'value' => (string) ( $frnd_message ?? '' ) ] ] );
	gemfindrb_email_partial_diamond_specs( get_defined_vars() );
	gemfindrb_email_view_button( $item_url );
} else {
	gemfindrb_email_dear( (string) ( $retailername ?? '' ) );
	gemfindrb_email_intro( sprintf( '%s has shared the following diamond with %s.', (string) ( $name ?? '' ), (string) ( $frnd_name ?? '' ) ) );
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
	gemfindrb_email_partial_diamond_specs( get_defined_vars() );
	gemfindrb_email_view_button( $item_url );
}

gemfindrb_email_layout_close();
