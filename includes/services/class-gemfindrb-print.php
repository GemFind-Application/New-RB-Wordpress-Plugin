<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Dompdf PDF export for diamond and complete-ring print views.
 */
final class GEMFINDRB_Print {

	public static function stream_pdf( string $diamond_id, string $type, string $shop ): WP_Error|null {
		$html = GEMFINDRB_Email::get_print_layout_html( $diamond_id, $type, $shop );
		if ( $html === '' ) {
			return new WP_Error(
				'print_unavailable',
				__( 'Print is unavailable. Check Dealer ID and that this diamond exists.', 'gemfind-ring-builder' ),
				[ 'status' => 404 ]
			);
		}

		$filename = 'Diamond-' . ( $diamond_id !== '' ? $diamond_id : 'Detail' ) . '.pdf';
		return self::stream_html_as_pdf( $html, $filename );
	}

	/**
	 * @param array<string,string> $display_options
	 */
	public static function stream_complete_ring_pdf(
		string $setting_id,
		string $diamond_id,
		string $diamond_type,
		string $shop,
		int $is_lab_settings = 0,
		array $display_options = []
	): WP_Error|null {
		$html = GEMFINDRB_Email::get_complete_ring_print_layout_html(
			$setting_id,
			$diamond_id,
			$diamond_type,
			$shop,
			$is_lab_settings,
			$display_options
		);
		if ( $html === '' ) {
			return new WP_Error(
				'print_unavailable',
				__( 'Print is unavailable. Check Dealer ID and that this ring and diamond exist.', 'gemfind-ring-builder' ),
				[ 'status' => 404 ]
			);
		}

		$filename = 'Complete-Ring-' . ( $setting_id !== '' ? $setting_id : 'Setting' );
		if ( $diamond_id !== '' ) {
			$filename .= '-' . $diamond_id;
		}
		$filename .= '.pdf';

		return self::stream_html_as_pdf( $html, $filename );
	}

	public static function stream_certificate_pdf( string $diamond_id, string $type, string $shop, string $certificate_url = '' ): WP_Error|null {
		$url = trim( $certificate_url );
		if ( $url === '' && $diamond_id !== '' ) {
			$diamond = GEMFINDRB_JewelCloud::get_diamond_by_id( $diamond_id, $type, $shop );
			$url     = (string) ( $diamond['certificateUrl'] ?? '' );
		}
		if ( $url === '' ) {
			return new WP_Error(
				'certificate_unavailable',
				__( 'Certificate is not available for this diamond.', 'gemfind-ring-builder' ),
				[ 'status' => 404 ]
			);
		}

		$filename = 'Certificate-' . ( $diamond_id !== '' ? $diamond_id : 'Report' ) . '.pdf';
		return self::stream_remote_pdf( $url, $filename );
	}

	private static function stream_remote_pdf( string $url, string $filename ): WP_Error|null {
		$last_error = null;
		foreach ( self::certificate_url_candidates( $url ) as $candidate ) {
			$candidate = GEMFINDRB_JewelCloud::ensure_https_url( $candidate );
			if ( $candidate === '' || ! wp_http_validate_url( $candidate ) ) {
				continue;
			}

			$body = self::fetch_remote_pdf_body( $candidate );
			if ( is_wp_error( $body ) ) {
				$last_error = $body;
				continue;
			}

			self::send_pdf_download( $body, $filename );
			return null;
		}

		return $last_error ?? new WP_Error(
			'certificate_fetch_failed',
			__( 'Could not download certificate.', 'gemfind-ring-builder' ),
			[ 'status' => 502 ]
		);
	}

	/**
	 * @return string|WP_Error
	 */
	private static function fetch_remote_pdf_body( string $url ) {
		$response = wp_remote_get(
			$url,
			[
				'timeout'     => 90,
				'redirection' => 5,
				'sslverify'   => gemfindrb_http_sslverify(),
				'headers'     => [
					'Accept'     => 'application/pdf,*/*',
					'User-Agent' => 'GemFind-RingBuilder/1.0',
				],
			]
		);

		if ( is_wp_error( $response ) ) {
			$message = $response->get_error_message();
			if ( $response->get_error_code() === 'http_request_failed' ) {
				$message = __( 'The certificate server could not be reached. Please try again later.', 'gemfind-ring-builder' );
			}
			return new WP_Error( 'certificate_fetch_failed', $message, [ 'status' => 502 ] );
		}

		$code = (int) wp_remote_retrieve_response_code( $response );
		if ( $code < 200 || $code >= 300 ) {
			return new WP_Error(
				'certificate_fetch_failed',
				__( 'Could not download certificate from the lab server.', 'gemfind-ring-builder' ),
				[ 'status' => 502 ]
			);
		}

		$body = wp_remote_retrieve_body( $response );
		if ( $body === '' ) {
			return new WP_Error(
				'certificate_empty',
				__( 'Certificate file is empty.', 'gemfind-ring-builder' ),
				[ 'status' => 502 ]
			);
		}

		if ( strncmp( $body, '%PDF', 4 ) !== 0 ) {
			$content_type = (string) wp_remote_retrieve_header( $response, 'content-type' );
			if ( stripos( $content_type, 'pdf' ) === false ) {
				return new WP_Error(
					'certificate_invalid',
					__( 'Downloaded file is not a valid PDF.', 'gemfind-ring-builder' ),
					[ 'status' => 502 ]
				);
			}
		}

		return $body;
	}

	/**
	 * @return list<string>
	 */
	private static function certificate_url_candidates( string $url ): array {
		$url = self::normalize_certificate_url( $url );
		if ( $url === '' ) {
			return [];
		}

		$candidates = [ $url ];
		$parts      = wp_parse_url( $url );
		if ( ! is_array( $parts ) || empty( $parts['host'] ) ) {
			return $candidates;
		}

		$host    = (string) $parts['host'];
		$scheme  = (string) ( $parts['scheme'] ?? 'https' );
		$path    = (string) ( $parts['path'] ?? '' );
		$query   = isset( $parts['query'] ) ? '?' . $parts['query'] : '';
		$alt_host = str_starts_with( strtolower( $host ), 'www.' )
			? substr( $host, 4 )
			: 'www.' . $host;
		$candidates[] = $scheme . '://' . $alt_host . $path . $query;

		return array_values( array_unique( array_filter( $candidates ) ) );
	}

	private static function normalize_certificate_url( string $url ): string {
		$url = trim( $url );
		if ( $url === '' ) {
			return '';
		}
		if ( str_starts_with( $url, '//' ) ) {
			return 'https:' . $url;
		}
		if ( ! preg_match( '#^https?://#i', $url ) ) {
			return 'https://' . ltrim( $url, '/' );
		}
		return $url;
	}

	private static function send_pdf_download( string $pdf, string $filename ): void {
		if ( function_exists( 'status_header' ) ) {
			status_header( 200 );
		}
		while ( function_exists( 'ob_get_level' ) && ob_get_level() > 0 ) {
			ob_end_clean();
		}
		if ( function_exists( 'nocache_headers' ) ) {
			nocache_headers();
		}

		header( 'Content-Type: application/pdf' );
		header( 'Content-Disposition: attachment; filename="' . sanitize_file_name( $filename ) . '"' );
		header( 'Cache-Control: no-store, no-cache, must-revalidate, max-age=0' );
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo $pdf;
		exit;
	}

	private static function stream_html_as_pdf( string $html, string $filename ): WP_Error|null {
		if ( ! gemfindRB_load_dompdf_autoload() ) {
			return new WP_Error(
				'pdf_engine_missing',
				__( 'PDF engine is not installed. Run composer install in the plugin folder.', 'gemfind-ring-builder' ),
				[ 'status' => 500 ]
			);
		}

		$html = self::inline_print_stylesheet( $html );

		try {
			$opts = new \Dompdf\Options();
			$opts->set( 'isRemoteEnabled', true );
			$opts->set( 'isHtml5ParserEnabled', true );
			$opts->set( 'defaultFont', 'sans-serif' );

			$uploads = function_exists( 'wp_upload_dir' ) ? wp_upload_dir() : [];
			$tempDir = is_array( $uploads ) && ! empty( $uploads['basedir'] )
				? rtrim( (string) $uploads['basedir'], '/' ) . '/gemfindRB-dompdf-temp'
				: GEMFINDRB_PATH . 'gemfindRB-dompdf-temp';
			if ( ! is_dir( $tempDir ) && function_exists( 'wp_mkdir_p' ) ) {
				wp_mkdir_p( $tempDir );
			}
			if ( is_dir( $tempDir ) ) {
				$opts->set( 'tempDir', $tempDir );
			}

			$dompdf = new \Dompdf\Dompdf( $opts );
			$dompdf->setPaper( 'A4', 'portrait' );
			$dompdf->loadHtml( $html, 'UTF-8' );
			$dompdf->render();
			$pdf = $dompdf->output();
		} catch ( \Throwable $e ) {
			return new WP_Error( 'pdf_render_failed', $e->getMessage(), [ 'status' => 500 ] );
		}

		if ( function_exists( 'status_header' ) ) {
			status_header( 200 );
		}
		while ( function_exists( 'ob_get_level' ) && ob_get_level() > 0 ) {
			ob_end_clean();
		}
		if ( function_exists( 'nocache_headers' ) ) {
			nocache_headers();
		}

		self::send_pdf_download( $pdf, $filename );
		return null;
	}

	private static function inline_print_stylesheet( string $html ): string {
		$print_css_path = GEMFINDRB_PATH . 'assets/css/gemfindrb-diamond-print.css';
		if ( ! is_readable( $print_css_path ) ) {
			return $html;
		}

		$print_css = (string) file_get_contents( $print_css_path );
		if ( $print_css === '' ) {
			return $html;
		}

		$style_open  = '<' . 'style';
		$style_close = '<' . '/style>';
		$inline      = $style_open . '>' . $print_css . $style_close;

		return preg_replace(
			'#<link\s+[^>]*gemfindrb-diamond-print[^>]*/?>#i',
			$inline,
			$html,
			1
		) ?: $html;
	}
}
