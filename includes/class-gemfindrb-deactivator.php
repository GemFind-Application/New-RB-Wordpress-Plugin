<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class GEMFINDRB_Deactivator {

	public static function deactivate(): void {
		// Intentionally leave pages and tables intact on deactivation.
	}
}
