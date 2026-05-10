import { useScanner } from "@/hooks/useScanner";

export function Scanner() {
	const { scan, isScanning, scannerData } = useScanner();

	return (
		<div className="flex flex-col gap-3">
			<button
				type="button"
				onClick={scan}
				disabled={isScanning}
				className="flex items-center justify-center gap-2 rounded-lg border border-navy-700 bg-navy-800 px-4 py-2 text-sm font-medium text-slate-200 hover:border-amber-500/50 hover:bg-navy-800/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
			>
				{isScanning ? (
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-amber-500" />
				) : (
					<svg
						className="h-4 w-4 text-amber-500"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zm0 13a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zm8-5a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zm11.95-4.95a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zm-12.73 9.9a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zm12.73 0a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 011.06-1.06l1.06 1.06zm-9.9-12.73a.75.75 0 01-1.06 1.06L4.22 4.22a.75.75 0 011.06-1.06l1.06 1.06zM10 7a3 3 0 100 6 3 3 0 000-6z" />
					</svg>
				)}
				Find Equal Points
			</button>

			{scannerData?.closest && (
				<div className="rounded-lg border border-navy-700 bg-navy-800/60 px-3 py-2">
					<p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
						Closest match
					</p>
					<p className="text-sm tabular-nums text-slate-200">
						({scannerData.closest.lat.toFixed(2)}, {scannerData.closest.lng.toFixed(2)})
					</p>
					<div className="mt-1 flex gap-3 text-xs text-slate-400 tabular-nums">
						<span>temp delta: {scannerData.closest.tempDelta.toFixed(1)}&deg;C</span>
						<span>pressure delta: {scannerData.closest.pressureDelta.toFixed(1)} hPa</span>
					</div>
				</div>
			)}
		</div>
	);
}
