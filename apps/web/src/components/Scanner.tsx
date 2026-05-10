import { useScanner } from "@/hooks/useScanner";
import { useAppStore } from "@/stores/app-store";

export function Scanner() {
	const { scan, isScanning, scannerData } = useScanner();
	const setSelectedPoint = useAppStore((s) => s.setSelectedPoint);

	const handleFindAndGo = async () => {
		const data = await scan();
		if (data?.closest) {
			setSelectedPoint(data.closest.lat, data.closest.lng);
		}
	};

	if (scannerData?.closest && !isScanning) {
		return (
			<div className="flex flex-col gap-3">
				<div className="flex items-center gap-2">
					<span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
					<span className="text-xs font-medium uppercase tracking-wider text-slate-400">
						Closest match
					</span>
				</div>

				<p className="text-xs text-slate-400 tabular-nums">
					{scannerData.closest.lat.toFixed(2)}, {scannerData.closest.lng.toFixed(2)}
				</p>

				<div className="flex gap-3">
					<button
						type="button"
						onClick={() => {
							if (scannerData.closest) {
								setSelectedPoint(scannerData.closest.lat, scannerData.closest.lng);
							}
						}}
						className="text-sm py-1.5 text-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
					>
						Go to this pair
					</button>
					<button
						type="button"
						onClick={handleFindAndGo}
						className="text-sm py-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
					>
						Scan again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-2">
				<span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-500" />
				<span className="text-xs font-medium uppercase tracking-wider text-slate-400">
					Equal points
				</span>
			</div>

			<button
				type="button"
				onClick={handleFindAndGo}
				disabled={isScanning}
				className="text-sm text-left py-1.5 text-amber-500 hover:text-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
			>
				{isScanning ? "Scanning grid..." : "Find the closest matching pair"}
			</button>
		</div>
	);
}
