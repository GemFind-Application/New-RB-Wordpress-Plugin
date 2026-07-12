<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
 * Shared Shopify-style email layout helpers (inline styles only for mail-client compatibility).
 *
 * @package GemFind_Ring_Builder
 */

/**
 * @param array<string,mixed> $vars
 */
if ( ! function_exists( 'gemfindrb_email_layout_open' ) ) {
function gemfindrb_email_layout_open( string $title, array $vars = [] ): void {
	?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?php echo esc_html( $title ); ?></title>
</head>
<body style="margin:0;padding:0;background-color:#f6f6f6;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.4;color:#333;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f6f6f6;width:100%;">
<tr><td style="padding:10px 0;">&nbsp;</td>
<td width="720" style="max-width:720px;width:100%;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#ffffff;max-width:720px;width:100%;">
<tr><td style="padding:20px;">
<?php
	gemfindrb_email_logo_header(
		(string) ( $vars['shopurl'] ?? '' ),
		(string) ( $vars['shop_logo'] ?? '' ),
		(string) ( $vars['shop_logo_alt'] ?? '' )
	);
}
}

if ( ! function_exists( 'gemfindrb_email_layout_close' ) ) {
function gemfindrb_email_layout_close( ?string $footer_html = null ): void {
	?>
</td></tr>
</table>
<?php if ( $footer_html !== null && $footer_html !== '' ) : ?>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:10px;">
<tr><td style="text-align:center;font-size:12px;color:#999999;padding:10px 0;"><?php echo $footer_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></td></tr>
</table>
<?php endif; ?>
</td><td style="padding:10px 0;">&nbsp;</td></tr>
</table>
</body>
</html>
<?php
}
}

if ( ! function_exists( 'gemfindrb_email_logo_header' ) ) {
function gemfindrb_email_logo_header( string $shopurl, string $shop_logo, string $shop_logo_alt ): void {
	?>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tr><td align="center" style="text-align:center;padding-bottom:16px;">
<?php if ( $shop_logo !== '' ) : ?>
<a href="<?php echo esc_url( $shopurl !== '' ? $shopurl : '#' ); ?>" style="text-decoration:none;">
<img src="<?php echo esc_url( $shop_logo ); ?>" alt="<?php echo esc_attr( $shop_logo_alt ); ?>" border="0" style="max-height:52px;max-width:50%;height:auto;display:block;margin:0 auto;" />
</a>
<?php endif; ?>
</td></tr>
<tr><td style="border-bottom:1px solid #e8e8e8;font-size:1px;line-height:1px;height:1px;">&nbsp;</td></tr>
</table>
<?php
}
}

if ( ! function_exists( 'gemfindrb_email_dear' ) ) {
function gemfindrb_email_dear( string $name ): void {
	?>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:24px;">
<tr><td>
<h2 style="margin:0 0 8px;font-size:30px;font-weight:400;color:#000;font-family:Arial,Helvetica,sans-serif;"><?php printf( 'Dear %s', esc_html( $name ) ); ?></h2>
<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="height:3px;width:100px;background-color:#26a9e0;font-size:1px;line-height:3px;">&nbsp;</td></tr></table>
<?php
}
}

if ( ! function_exists( 'gemfindrb_email_intro' ) ) {
function gemfindrb_email_intro( string $text, bool $allow_html = false ): void {
	?>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;">
<tr><td style="font-size:14px;color:#000;font-family:Arial,Helvetica,sans-serif;">
<p style="margin:0 0 8px;"><?php echo $allow_html ? wp_kses_post( $text ) : esc_html( $text ); ?></p>
</td></tr>
</table>
</td></tr></table>
<?php
}
}

if ( ! function_exists( 'gemfindrb_email_section_heading' ) ) {
function gemfindrb_email_section_heading( string $title ): void {
	?>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:24px;">
<tr><td>
<h2 style="margin:0 0 8px;font-size:30px;font-weight:400;color:#000;font-family:Arial,Helvetica,sans-serif;"><?php echo esc_html( $title ); ?></h2>
<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="height:3px;width:100px;background-color:#26a9e0;font-size:1px;line-height:3px;">&nbsp;</td></tr></table>
</td></tr></table>
<?php
}
}

/**
 * @param list<array{label:string,value:string,html?:bool}> $rows
 */
if ( ! function_exists( 'gemfindrb_email_info_table' ) ) {
function gemfindrb_email_info_table( array $rows ): void {
	if ( $rows === [] ) {
		return;
	}
	?>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0;">
<tr><td>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f2f2f2;border-bottom:5px solid #1979c3;padding:20px;">
<?php foreach ( $rows as $row ) :
	$label = (string) ( $row['label'] ?? '' );
	$value = (string) ( $row['value'] ?? '' );
	if ( $label === '' && $value === '' ) {
		continue;
	}
	?>
<tr>
<td style="font-size:18px;color:#000;width:50%;padding:8px 12px 8px 0;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;"><?php echo esc_html( $label ); ?></td>
<td style="font-size:16px;color:#848484;width:50%;padding:8px 0;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;"><?php echo ! empty( $row['html'] ) ? wp_kses_post( $value ) : esc_html( $value ); ?></td>
</tr>
<?php endforeach; ?>
</table>
</td></tr></table>
<?php
}
}

if ( ! function_exists( 'gemfindrb_email_view_button' ) ) {
function gemfindrb_email_view_button( string $url, string $label = 'View This Item' ): void {
	if ( $url === '' ) {
		return;
	}
	?>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0 8px;">
<tr><td align="center" style="text-align:center;padding:10px 0;">
<a href="<?php echo esc_url( $url ); ?>" style="display:inline-block;background-color:#3498db;color:#ffffff;text-decoration:none;padding:12px 24px;font-size:14px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;border-radius:4px;"><?php echo esc_html( $label ); ?></a>
</td></tr></table>
<?php
}
}
