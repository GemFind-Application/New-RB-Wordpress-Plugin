<?php
/**
 * Printable complete ring summary (setting + diamond).
 *
 * @var array<string,mixed> $ring
 * @var array<string,mixed> $diamond
 * @var object                $cfg
 * @var string                $shop
 * @var string                $site_name
 * @var array<string,string>  $display_options
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals

$ring    = isset( $ring ) && is_array( $ring ) ? $ring : [];
$diamond = isset( $diamond ) && is_array( $diamond ) ? $diamond : [];
$display_options = isset( $display_options ) && is_array( $display_options ) ? $display_options : [];
$site_name = isset( $site_name ) ? (string) $site_name : '';
$shop      = isset( $shop ) ? (string) $shop : '';

$setting_id   = (string) ( $ring['settingId'] ?? '' );
$setting_name = (string) ( $ring['settingName'] ?? $ring['mainHeader'] ?? '' );
$style_number = (string) ( $ring['styleNumber'] ?? '' );
$metal_type   = (string) ( $ring['metalType'] ?? '' );
$ring_size    = (string) ( $ring['ringSize'] ?? ( $display_options['ring_size'] ?? '' ) );
$side_quality = $ring['sideStoneQuality'] ?? '';
if ( is_array( $side_quality ) ) {
	$side_quality = (string) ( $side_quality[0] ?? '' );
} else {
	$side_quality = (string) $side_quality;
}
$center_min = (string) ( $ring['centerStoneMinCarat'] ?? '' );
$center_max = (string) ( $ring['centerStoneMaxCarat'] ?? '' );
$center_range = ( $center_min !== '' && $center_max !== '' ) ? $center_min . '-' . $center_max : ( $center_min !== '' ? $center_min : $center_max );
$ring_price   = GEMFINDRB_Email::format_print_price( $ring );
$ring_desc    = wp_strip_all_tags( (string) ( $ring['description'] ?? '' ) );

$ring_img_url      = isset( $ring_img_url ) ? (string) $ring_img_url : '';
$ring_img_data_uri = isset( $ring_img_data_uri ) ? (string) $ring_img_data_uri : '';
$ring_img_src      = $ring_img_data_uri !== '' ? $ring_img_data_uri : $ring_img_url;
$ring_img_attr     = $ring_img_src === ''
	? ''
	: ( str_starts_with( $ring_img_src, 'data:' ) ? esc_attr( $ring_img_src ) : esc_url( $ring_img_src ) );

$diamond_id = (string) ( $diamond['diamondId'] ?? $diamond['lotNumber'] ?? '' );
$sku        = (string) ( $diamond['sku'] ?? $diamond['dealerInventoryNo'] ?? '' );
$shape      = (string) ( $diamond['shape'] ?? '' );
$carat      = (string) ( $diamond['caratWeight'] ?? $diamond['carat'] ?? '' );
$color      = (string) ( $diamond['color'] ?? '' );
$clarity    = (string) ( $diamond['clarity'] ?? '' );
$cut        = (string) ( $diamond['cut'] ?? $diamond['txtCutGrade'] ?? '' );
$report     = (string) ( $diamond['cert'] ?? $diamond['certificate'] ?? '' );
$depth      = (string) ( $diamond['depth'] ?? '' );
$table      = (string) ( $diamond['table'] ?? '' );
$polish     = (string) ( $diamond['polish'] ?? '' );
$symmetry   = (string) ( $diamond['symmetry'] ?? '' );
$girdle     = (string) ( $diamond['gridle'] ?? $diamond['girdle'] ?? '' );
$culet      = (string) ( $diamond['culet'] ?? '' );
$fluo       = (string) ( $diamond['fluorescence'] ?? '' );
$meas       = (string) ( $diamond['measurement'] ?? $diamond['measurements'] ?? '' );
$diamond_price = GEMFINDRB_Email::format_print_price( $diamond );
$stock_no   = (string) ( $diamond['stockNumber'] ?? $diamond_id );

$diamond_img_url      = isset( $diamond_img_url ) ? (string) $diamond_img_url : '';
$diamond_img_data_uri = isset( $diamond_img_data_uri ) ? (string) $diamond_img_data_uri : '';
$diamond_img_src      = $diamond_img_data_uri !== '' ? $diamond_img_data_uri : $diamond_img_url;
$diamond_img_attr     = $diamond_img_src === ''
	? ''
	: ( str_starts_with( $diamond_img_src, 'data:' ) ? esc_attr( $diamond_img_src ) : esc_url( $diamond_img_src ) );

$ring_rows = [
	__( 'Setting ID', 'gemfind-ring-builder' )           => $setting_id,
	__( 'Style Number', 'gemfind-ring-builder' )         => $style_number,
	__( 'Metal Type', 'gemfind-ring-builder' )           => $metal_type,
	__( 'Ring Size', 'gemfind-ring-builder' )            => $ring_size,
	__( 'Side Stone Quality', 'gemfind-ring-builder' )   => $side_quality,
	__( 'Center Stone Size (Ct.)', 'gemfind-ring-builder' ) => $center_range,
];

$diamond_rows = [
	__( 'Stock Number', 'gemfind-ring-builder' )   => $stock_no,
	__( 'Carat Weight', 'gemfind-ring-builder' )   => $carat,
	__( 'Cut', 'gemfind-ring-builder' )            => $cut,
	__( 'Color', 'gemfind-ring-builder' )          => $color,
	__( 'Clarity', 'gemfind-ring-builder' )        => $clarity,
	__( 'Report', 'gemfind-ring-builder' )         => $report,
	__( 'Depth %', 'gemfind-ring-builder' )        => $depth,
	__( 'Table %', 'gemfind-ring-builder' )        => $table,
	__( 'Polish', 'gemfind-ring-builder' )         => $polish,
	__( 'Symmetry', 'gemfind-ring-builder' )       => $symmetry,
	__( 'Girdle', 'gemfind-ring-builder' )         => $girdle,
	__( 'Culet', 'gemfind-ring-builder' )          => $culet,
	__( 'Fluorescence', 'gemfind-ring-builder' )   => $fluo,
	__( 'Measurement', 'gemfind-ring-builder' )    => $meas,
];

$total_price = '';
$ring_num    = is_numeric( str_replace( [ ',', '$' ], '', (string) ( $ring['cost'] ?? $ring['price'] ?? '' ) ) )
	? (float) str_replace( [ ',', '$' ], '', (string) ( $ring['cost'] ?? $ring['price'] ?? '0' ) ) : null;
$diamond_num = is_numeric( str_replace( [ ',', '$' ], '', (string) ( $diamond['fltPrice'] ?? $diamond['price'] ?? '' ) ) )
	? (float) str_replace( [ ',', '$' ], '', (string) ( $diamond['fltPrice'] ?? $diamond['price'] ?? '0' ) ) : null;
if ( $ring_num !== null && $diamond_num !== null && $ring_num > 0 && $diamond_num > 0 ) {
	$currency    = (string) ( $diamond['currencySymbol'] ?? $ring['currencySymbol'] ?? '$' );
	$total_price = $currency . number_format( $ring_num + $diamond_num, 2 );
}

?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title><?php echo esc_html( 'Complete Ring - ' . $setting_id . ' / ' . $diamond_id ); ?></title>
	<?php wp_print_styles( 'gemfindrb-diamond-print' ); ?>
</head>
<body>
	<div id="gemfindrb-print">
	<div class="page">
		<header class="header">
			<p class="title"><?php echo esc_html__( 'Complete Ring Detail', 'gemfind-ring-builder' ); ?> <?php echo esc_html( gmdate( 'd/m/Y' ) ); ?></p>
			<p class="sku"><?php echo esc_html__( 'Setting#', 'gemfind-ring-builder' ); ?> <?php echo esc_html( $setting_id ); ?> &middot; <?php echo esc_html__( 'Diamond#', 'gemfind-ring-builder' ); ?> <?php echo esc_html( $diamond_id ); ?></p>
		</header>

		<h2 class="section-title"><?php echo esc_html__( 'Ring Setting', 'gemfind-ring-builder' ); ?></h2>
		<div class="top">
			<div class="photo">
				<?php if ( $ring_img_attr !== '' ) : ?>
					<img src="<?php echo $ring_img_attr; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" alt="<?php echo esc_attr( $setting_name ); ?>" />
				<?php else : ?>
					<div class="placeholder"><?php echo esc_html__( 'Image unavailable', 'gemfind-ring-builder' ); ?></div>
				<?php endif; ?>
			</div>
			<div class="content">
				<p class="summary"><strong><?php echo esc_html( $setting_name ); ?></strong></p>
				<?php if ( $ring_desc !== '' ) : ?>
					<p class="summary"><?php echo esc_html( $ring_desc ); ?></p>
				<?php endif; ?>
				<?php if ( $ring_price !== '' ) : ?>
					<p class="price"><?php echo esc_html( $ring_price ); ?></p>
				<?php endif; ?>
				<table class="kv" role="presentation" aria-hidden="true">
					<tbody>
					<?php foreach ( $ring_rows as $label => $val ) : ?>
						<?php if ( trim( (string) $val ) === '' ) { continue; } ?>
						<tr>
							<td><?php echo esc_html( $label ); ?></td>
							<td><?php echo esc_html( (string) $val ); ?></td>
						</tr>
					<?php endforeach; ?>
					</tbody>
				</table>
			</div>
		</div>

		<h2 class="section-title section-gap"><?php echo esc_html__( 'Diamond', 'gemfind-ring-builder' ); ?></h2>
		<div class="top">
			<div class="photo">
				<?php if ( $diamond_img_attr !== '' ) : ?>
					<img src="<?php echo $diamond_img_attr; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" alt="<?php echo esc_attr( $shape ); ?>" />
				<?php else : ?>
					<div class="placeholder"><?php echo esc_html__( 'Image unavailable', 'gemfind-ring-builder' ); ?></div>
				<?php endif; ?>
			</div>
			<div class="content">
				<p class="summary">
					<strong><?php echo esc_html( $carat ); ?></strong>
					<?php echo esc_html__( 'Carat', 'gemfind-ring-builder' ); ?>
					<strong><?php echo esc_html( $shape ); ?></strong>
					<?php echo esc_html__( 'Diamond', 'gemfind-ring-builder' ); ?>
				</p>
				<p class="summary">
					<?php
						printf(
							/* translators: 1: cut 2: color 3: clarity 4: report */
							esc_html__( 'This %1$s cut, %2$s color, %3$s clarity diamond comes accompanied by a diamond grading report from %4$s.', 'gemfind-ring-builder' ),
							$cut !== '' ? esc_html( $cut ) : esc_html__( '—', 'gemfind-ring-builder' ),
							$color !== '' ? esc_html( $color ) : esc_html__( '—', 'gemfind-ring-builder' ),
							$clarity !== '' ? esc_html( $clarity ) : esc_html__( '—', 'gemfind-ring-builder' ),
							$report !== '' ? esc_html( $report ) : esc_html__( '—', 'gemfind-ring-builder' )
						);
					?>
				</p>
				<?php if ( $diamond_price !== '' ) : ?>
					<p class="price"><?php echo esc_html( $diamond_price ); ?></p>
				<?php endif; ?>
				<table class="kv" role="presentation" aria-hidden="true">
					<tbody>
					<?php foreach ( $diamond_rows as $label => $val ) : ?>
						<?php if ( trim( (string) $val ) === '' ) { continue; } ?>
						<tr>
							<td><?php echo esc_html( $label ); ?></td>
							<td><?php echo esc_html( (string) $val ); ?></td>
						</tr>
					<?php endforeach; ?>
					<?php if ( $sku !== '' ) : ?>
						<tr>
							<td><?php echo esc_html__( 'SKU', 'gemfind-ring-builder' ); ?></td>
							<td><?php echo esc_html( $sku ); ?></td>
						</tr>
					<?php endif; ?>
					</tbody>
				</table>
			</div>
		</div>

		<?php if ( $total_price !== '' ) : ?>
			<p class="total-price"><?php echo esc_html__( 'Total Price', 'gemfind-ring-builder' ); ?>: <strong><?php echo esc_html( $total_price ); ?></strong></p>
		<?php endif; ?>

		<p class="footer">
			<?php echo esc_html( $site_name !== '' ? $site_name : $shop ); ?>
			&middot;
			<?php echo esc_html( $shop ); ?>
		</p>
	</div>
	</div>
</body>
</html>
<?php
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals
