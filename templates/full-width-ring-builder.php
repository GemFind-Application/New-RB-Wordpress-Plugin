<?php
/**
 * Full-width page template for Ring Builder SPA.
 *
 * @package GemFind_Ring_Builder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>
<main id="primary" class="site-main gemfind-full-width-main">
	<?php
	while ( have_posts() ) :
		the_post();
		the_content();
	endwhile;
	?>
</main>
<?php
get_footer();
