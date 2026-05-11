import { useAppStore } from "@/stores/app-store";

function PointLabel({
	label,
	lat,
	lng,
	accentColor,
}: { label: string; lat: number; lng: number; accentColor: string }) {
	return (
		<div className="flex items-center gap-2">
			<span
				className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
				style={{ backgroundColor: accentColor }}
			/>
			<span className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span>
			<span className="text-xs text-slate-500 tabular-nums">
				{lat.toFixed(2)}, {lng.toFixed(2)}
			</span>
		</div>
	);
}

function CompactCard({
	label,
	lat,
	lng,
	temp,
	pressure,
	accentColor,
}: {
	label: string;
	lat: number;
	lng: number;
	temp: number;
	pressure: number;
	accentColor: string;
}) {
	return (
		<div className="flex flex-col gap-1">
			<PointLabel label={label} lat={lat} lng={lng} accentColor={accentColor} />
			<div className="flex gap-6 pl-[18px]">
				<p className="text-lg font-semibold tabular-nums text-slate-200">
					{temp.toFixed(1)}
					<span className="text-xs font-normal text-slate-400">&deg;C</span>
				</p>
				<p className="text-lg font-semibold tabular-nums text-slate-200">
					{pressure.toFixed(1)}
					<span className="text-xs font-normal text-slate-400"> hPa</span>
				</p>
			</div>
		</div>
	);
}

function FullCard({
	label,
	lat,
	lng,
	temp,
	pressure,
	accentColor,
}: {
	label: string;
	lat: number;
	lng: number;
	temp: number;
	pressure: number;
	accentColor: string;
}) {
	return (
		<div className="flex flex-col gap-3">
			<PointLabel label={label} lat={lat} lng={lng} accentColor={accentColor} />
			<div className="grid grid-cols-2 gap-4">
				<div>
					<p className="text-2xl font-semibold tabular-nums text-slate-200">
						{temp.toFixed(1)}
						<span className="text-sm font-normal text-slate-400">&deg;C</span>
					</p>
					<p className="text-xs text-slate-400">Temperature</p>
				</div>
				<div>
					<p className="text-2xl font-semibold tabular-nums text-slate-200">
						{pressure.toFixed(1)}
						<span className="text-sm font-normal text-slate-400"> hPa</span>
					</p>
					<p className="text-xs text-slate-400">Pressure</p>
				</div>
			</div>
		</div>
	);
}

export function ComparisonView() {
	const selectedPoint = useAppStore((s) => s.selectedPoint);
	const antipodalPoint = useAppStore((s) => s.antipodalPoint);
	const weatherData = useAppStore((s) => s.weatherData);
	const isLoading = useAppStore((s) => s.isLoading);

	if (!selectedPoint || !antipodalPoint) return null;

	if (isLoading) {
		return (
			<div className="flex flex-col gap-3">
				<div className="flex gap-6">
					<PointLabel
						label="Selected"
						lat={selectedPoint.lat}
						lng={selectedPoint.lng}
						accentColor="#f59e0b"
					/>
				</div>
				<div className="flex items-center justify-center py-3">
					<div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-amber-500" />
				</div>
			</div>
		);
	}

	if (!weatherData) {
		return (
			<div className="flex flex-col gap-2">
				<PointLabel
					label="Selected"
					lat={selectedPoint.lat}
					lng={selectedPoint.lng}
					accentColor="#f59e0b"
				/>
				<PointLabel
					label="Antipode"
					lat={antipodalPoint.lat}
					lng={antipodalPoint.lng}
					accentColor="#0d9488"
				/>
			</div>
		);
	}

	const { point, antipode, delta } = weatherData;

	return (
		<div className="flex flex-col gap-4">
			{/* Compact on mobile, full on desktop */}
			<div className="sm:hidden flex flex-col gap-3">
				<CompactCard
					label="Selected"
					lat={point.lat}
					lng={point.lng}
					temp={point.temp}
					pressure={point.pressure}
					accentColor="#f59e0b"
				/>
				<CompactCard
					label="Antipode"
					lat={antipode.lat}
					lng={antipode.lng}
					temp={antipode.temp}
					pressure={antipode.pressure}
					accentColor="#0d9488"
				/>
			</div>

			<div className="hidden sm:flex sm:flex-col sm:gap-6">
				<FullCard
					label="Selected"
					lat={point.lat}
					lng={point.lng}
					temp={point.temp}
					pressure={point.pressure}
					accentColor="#f59e0b"
				/>
				<div className="h-px bg-navy-700" />
				<FullCard
					label="Antipode"
					lat={antipode.lat}
					lng={antipode.lng}
					temp={antipode.temp}
					pressure={antipode.pressure}
					accentColor="#0d9488"
				/>
			</div>

			<div className="h-px bg-navy-700" />

			<div className="flex flex-col gap-1.5">
				<p className="text-xs font-medium uppercase tracking-wider text-slate-400">Difference</p>
				<div className="flex gap-4">
					<p
						className="text-lg sm:text-xl font-semibold tabular-nums"
						style={{
							color:
								Math.abs(delta.temp) < 2
									? "#22c55e"
									: Math.abs(delta.temp) < 10
										? "#f59e0b"
										: "#ef4444",
						}}
					>
						{delta.temp > 0 ? "+" : ""}
						{delta.temp.toFixed(1)}&deg;C
					</p>
					<p
						className="text-lg sm:text-xl font-semibold tabular-nums"
						style={{
							color:
								Math.abs(delta.pressure) < 2
									? "#22c55e"
									: Math.abs(delta.pressure) < 10
										? "#f59e0b"
										: "#ef4444",
						}}
					>
						{delta.pressure > 0 ? "+" : ""}
						{delta.pressure.toFixed(1)} hPa
					</p>
				</div>
				<p className="text-xs text-slate-400">
					{Math.abs(delta.temp) < 2 && Math.abs(delta.pressure) < 5
						? "Very close to the Borsuk-Ulam prediction!"
						: "The theorem guarantees equal points exist somewhere."}
				</p>
			</div>
		</div>
	);
}
