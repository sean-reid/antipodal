import { useScanner } from "@/hooks/useScanner";
import { useAppStore } from "@/stores/app-store";

export function Scanner() {
	const { scan, isScanning, scannerData } = useScanner();
	const setSelectedPoint = useAppStore((s) => s.setSelectedPoint);

	if (isScanning) {
		return (
			<div className="flex flex-col gap-3">
				<div className="flex items-center gap-2">
					<span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-500 animate-pulse" />
					<span className="text-xs font-medium uppercase tracking-wider text-slate-400">
						Scanning grid...
					</span>
				</div>
			</div>
		);
	}

	if (!scannerData?.closest) return null;

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
					onClick={scan}
					className="text-sm py-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
				>
					Scan again
				</button>
			</div>
		</div>
	);
}
