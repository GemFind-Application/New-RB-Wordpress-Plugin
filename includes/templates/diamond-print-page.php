<?php
/**
 * Printable diamond summary (storefront Print). Variables: $diamond, $cfg, $shop, $site_name.
 *
 * @var array<string,mixed> $diamond
 * @var object                $cfg
 * @var string                $shop
 * @var string                $site_name
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals -- Template locals passed in via include scope.

$diamond = isset( $diamond ) && is_array( $diamond ) ? $diamond : [];
$site_name = isset( $site_name ) ? (string) $site_name : '';
$shop      = isset( $shop ) ? (string) $shop : '';

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
$price_raw  = (string) ( $diamond['fltPrice'] ?? $diamond['price'] ?? '' );
$currency   = (string) ( $diamond['currencySymbol'] ?? $diamond['currency'] ?? '$' );
$stock_no   = (string) ( $diamond['stockNumber'] ?? $diamond_id );
$img_url      = isset( $img_url ) ? (string) $img_url : '';
$img_data_uri = isset( $img_data_uri ) ? (string) $img_data_uri : '';
$img_src      = $img_data_uri !== '' ? $img_data_uri : $img_url;
$img_src_attr = $img_src === ''
	? ''
	: ( str_starts_with( $img_src, 'data:' ) ? esc_attr( $img_src ) : esc_url( $img_src ) );

$rows = [
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
	__( 'Girdle', 'gemfind-ring-builder' )           => $girdle,
	__( 'Culet', 'gemfind-ring-builder' )          => $culet,
	__( 'Fluorescence', 'gemfind-ring-builder' )   => $fluo,
	__( 'Measurement', 'gemfind-ring-builder' )      => $meas,
];

?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title><?php echo esc_html( 'Diamond Detail - ' . $diamond_id ); ?></title>
	<?php
	// Enqueued in GEMFINDRB_Email::get_print_layout_html() via gemfindRB_enqueue_diamond_print_styles().
	// Dompdf inlines this <link> from assets/css/gemfindrb-diamond-print.css when generating PDFs.
	wp_print_styles( 'gemfindrb-diamond-print' );
	?>
</head>
<body>
	<div id="gemfindrb-print">
	<div class="page">
		<header class="header">
			<p class="title"><?php echo esc_html__( 'Diamond Detail', 'gemfind-ring-builder' ); ?> <?php echo esc_html( gmdate( 'd/m/Y' ) ); ?></p>
			<p class="sku"><?php echo esc_html__( 'SKU#', 'gemfind-ring-builder' ); ?> <?php echo esc_html( $diamond_id ); ?></p>
		</header>

		<div class="top">
			<div class="photo">
				<?php if ( $img_src_attr !== '' ) : ?>
					<img
						src="<?php echo $img_src_attr; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- data: URIs use esc_attr; http(s) uses esc_url. ?>"
						alt="<?php echo esc_attr( $shape ); ?>"
					/>
				<?php else : ?>
					<div style="font-size:12px;color:#777;"><?php echo esc_html__( 'Image unavailable', 'gemfind-ring-builder' ); ?></div>
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

				<?php if ( trim( $price_raw ) !== '' ) : ?>
					<p class="price"><?php echo esc_html( $currency . preg_replace( '/\s+/', '', $price_raw ) ); ?></p>
				<?php endif; ?>

				<table class="kv" role="presentation" aria-hidden="true">
					<tbody>
					<?php foreach ( $rows as $label => $val ) : ?>
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

				<p class="footer">
					<?php echo esc_html( $site_name !== '' ? $site_name : $shop ); ?>
					&middot;
					<?php echo esc_html( $shop ); ?>
				</p>
			</div>
		</div>
	</div>
	</div>
</body>
</html>
<?php
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals
