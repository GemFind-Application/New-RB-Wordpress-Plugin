<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
require_once __DIR__ . '/email-partials.php';
/** @var string $role */
$title = __( 'Someone Wants To Drop You A Hint', 'gemfind-ring-builder' );
gemfindrb_email_layout_open( $title, compact( 'shopurl', 'shop_logo', 'shop_logo_alt' ) );
$gemfindrb_item_url = (string) ( $diamondurl ?? $diamond_url ?? '' );

// Hint rows carry the sender's phone, labelled from the reader's point of view.
$gemfindrb_phone_label = $role === 'receiver' ? 'Sender Phone:' : 'Your Phone:';
$gemfindrb_hint_rows   = gemfindrb_email_filter_empty_rows(
	[
		[ 'label' => 'Reason For This Hint:', 'value' => (string) ( $reason_of_gift ?? '' ) ],
		[ 'label' => $gemfindrb_phone_label, 'value' => (string) ( $phone_no ?? '' ) ],
		[ 'label' => 'Gift Deadline:', 'value' => (string) ( $deadline ?? '' ) ],
		[ 'label' => 'Additional Message:', 'value' => (string) ( $hint_message ?? '' ) ],
	]
);

if ( $role === 'sender' ) {
	gemfindrb_email_dear( (string) ( $name ?? '' ) );
	gemfindrb_email_intro( sprintf( 'You Sent A Little Hint To %s', (string) ( $hint_Recipient_name ?? '' ) ) );
	gemfindrb_email_info_table( $gemfindrb_hint_rows );
	gemfindrb_email_view_button( $gemfindrb_item_url );
} elseif ( $role === 'receiver' ) {
	gemfindrb_email_dear( (string) ( $hint_Recipient_name ?? '' ) );
	gemfindrb_email_intro( sprintf( 'A Little Hint from %s', (string) ( $name ?? '' ) ) );
	gemfindrb_email_info_table( $gemfindrb_hint_rows );
	gemfindrb_email_view_button( $gemfindrb_item_url );
} else {
	gemfindrb_email_dear( (string) ( $retailername ?? '' ) );
	gemfindrb_email_intro( sprintf( '%s has sent following product to his/her friend %s.', (string) ( $name ?? '' ), (string) ( $hint_Recipient_name ?? '' ) ) );
	gemfindrb_email_section_heading( 'User Information:' );
	gemfindrb_email_info_table(
		[
			[ 'label' => 'Name:', 'value' => (string) ( $name ?? '' ) ],
			[ 'label' => 'Email:', 'value' => (string) ( $email ?? '' ) ],
			[ 'label' => 'Phone:', 'value' => (string) ( $phone_no ?? '' ) ],
			[ 'label' => 'Recipient Name:', 'value' => (string) ( $hint_Recipient_name ?? '' ) ],
			[ 'label' => 'Recipient Email:', 'value' => (string) ( $hint_Recipient_email ?? '' ) ],
			[ 'label' => 'Additional Comments:', 'value' => (string) ( $hint_message ?? '' ) ],
		]
	);
	gemfindrb_email_section_heading( 'Gift Information:' );
	gemfindrb_email_partial_hint_gift( get_defined_vars() );
	gemfindrb_email_partial_vendor_info( $diamondVendorInfo ?? null );
	gemfindrb_email_view_button( $gemfindrb_item_url );
	$gemfindrb_footer = '<p>' . sprintf( 'This message was sent to %s', esc_html( (string) ( $hint_Recipient_email ?? '' ) ) ) . '</p>';
	gemfindrb_email_layout_close( $gemfindrb_footer );
	return;
}

gemfindrb_email_layout_close();
