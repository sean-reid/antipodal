export function Layout() {
	return (
		<div className="relative h-dvh w-full overflow-hidden bg-navy-950">
			<header className="absolute top-0 left-0 right-0 z-10 bg-navy-950/80 backdrop-blur-sm border-b border-navy-800 px-6 py-4">
				<h1 className="text-xl font-semibold tracking-tight text-slate-200">
					Antipodal
				</h1>
				<p className="text-sm font-serif italic text-slate-400">
					Exploring the Borsuk-Ulam Theorem
				</p>
			</header>

			<main className="flex h-full items-center justify-center">
				<span className="text-slate-400 text-sm">
					Globe will render here
				</span>
			</main>
		</div>
	);
}
