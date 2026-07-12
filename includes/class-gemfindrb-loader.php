<?php
declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers WordPress hooks.
 */
final class GEMFINDRB_Loader {

	/** @var list<array{hook:string, component:object|null, callback:callable|string, priority:int, accepted_args:int}> */
	private array $actions = [];

	/** @var list<array{hook:string, component:object|null, callback:callable|string, priority:int, accepted_args:int}> */
	private array $filters = [];

	public function add_action(
		string $hook,
		object|null $component,
		callable|string $callback,
		int $priority = 10,
		int $accepted_args = 1
	): void {
		$this->actions[] = [
			'hook'          => $hook,
			'component'     => $component,
			'callback'      => $callback,
			'priority'      => $priority,
			'accepted_args' => $accepted_args,
		];
	}

	public function add_filter(
		string $hook,
		object|null $component,
		callable|string $callback,
		int $priority = 10,
		int $accepted_args = 1
	): void {
		$this->filters[] = [
			'hook'          => $hook,
			'component'     => $component,
			'callback'      => $callback,
			'priority'      => $priority,
			'accepted_args' => $accepted_args,
		];
	}

	public function run(): void {
		foreach ( $this->filters as $f ) {
			add_filter(
				$f['hook'],
				$this->resolve_callback( $f ),
				$f['priority'],
				$f['accepted_args']
			);
		}
		foreach ( $this->actions as $a ) {
			add_action(
				$a['hook'],
				$this->resolve_callback( $a ),
				$a['priority'],
				$a['accepted_args']
			);
		}
	}

	/**
	 * @param array{component:object|null, callback:callable|string} $hook
	 */
	private function resolve_callback( array $hook ): callable {
		if ( null === $hook['component'] ) {
			if ( ! is_callable( $hook['callback'] ) ) {
				throw new \InvalidArgumentException( 'GEMFINDRB_Loader: callback must be callable when component is null.' );
			}
			/** @var callable $cb */
			$cb = $hook['callback'];
			return $cb;
		}

		if ( ! is_string( $hook['callback'] ) || '' === $hook['callback'] ) {
			throw new \InvalidArgumentException( 'GEMFINDRB_Loader: callback must be a method name string when component is set.' );
		}

		return [ $hook['component'], $hook['callback'] ];
	}
}
