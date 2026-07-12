<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
require_once __DIR__ . '/email-partials.php';
/** @var string $role */
$title = __( 'Someone Wants To Drop You A Hint', 'gemfind-ring-builder' );
gemfindrb_email_layout_open( $title, compact( 'shopurl', 'shop_logo', 'shop_logo_alt' ) );
$view_url = (string) ( $complete_ring_url ?? $ring_url ?? '' );

if ( $role === 'sender' ) {
	gemfindrb_email_dear( (string) ( $name ?? '' ) );
	gemfindrb_email_intro( sprintf( 'You Sent A Little Hint To %s', (string) ( $hint_Recipient_name ?? '' ) ) );
	gemfindrb_email_partial_hint_gift( get_defined_vars() );
	gemfindrb_email_partial_ring_specs( get_defined_vars() );
	gemfindrb_email_partial_diamond_specs( get_defined_vars() );
	gemfindrb_email_view_button( $view_url );
} elseif ( $role === 'receiver' ) {
	gemfindrb_email_dear( (string) ( $hint_Recipient_name ?? '' ) );
	gemfindrb_email_intro( sprintf( 'A Little Hint from %s', (string) ( $name ?? '' ) ) );
	gemfindrb_email_partial_hint_gift( get_defined_vars() );
	gemfindrb_email_partial_ring_specs( get_defined_vars() );
	gemfindrb_email_partial_diamond_specs( get_defined_vars() );
	gemfindrb_email_view_button( $view_url );
} else {
	gemfindrb_email_dear( (string) ( $retailername ?? '' ) );
	gemfindrb_email_intro( sprintf( '%s has sent following product to his/her friend %s.', (string) ( $name ?? '' ), (string) ( $hint_Recipient_name ?? '' ) ) );
	gemfindrb_email_section_heading( 'User Information:' );
	gemfindrb_email_info_table(
		[
			[ 'label' => 'Name:', 'value' => (string) ( $name ?? '' ) ],
			[ 'label' => 'Email:', 'value' => (string) ( $email ?? '' ) ],
			[ 'label' => 'Recipient Name:', 'value' => (string) ( $hint_Recipient_name ?? '' ) ],
			[ 'label' => 'Recipient Email:', 'value' => (string) ( $hint_Recipient_email ?? '' ) ],
			[ 'label' => 'Additional Comments:', 'value' => (string) ( $hint_message ?? '' ) ],
		]
	);
	gemfindrb_email_section_heading( 'Gift Information:' );
	gemfindrb_email_partial_hint_gift( get_defined_vars() );
	gemfindrb_email_partial_ring_specs( get_defined_vars() );
	gemfindrb_email_partial_diamond_specs( get_defined_vars() );
	gemfindrb_email_view_button( $view_url );
}

gemfindrb_email_layout_close();
