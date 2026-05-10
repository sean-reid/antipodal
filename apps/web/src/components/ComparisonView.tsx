import { useAppStore } from "@/stores/app-store";
import { WeatherCard } from "./WeatherCard";

export function ComparisonView() {
	const weatherData = useAppStore((s) => s.weatherData);
	const isLoading = useAppStore((s) => s.isLoading);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-amber-500" />
			</div>
		);
	}

	if (!weatherData) return null;

	const { point, antipode, delta } = weatherData;

	return (
		<div className="flex flex-col gap-6">
			<WeatherCard
				label="Selected"
				lat={point.lat}
				lng={point.lng}
				temp={point.temp}
				pressure={point.pressure}
				accentColor="#f59e0b"
			/>

			<div className="h-px bg-navy-700" />

			<WeatherCard
				label="Antipode"
				lat={antipode.lat}
				lng={antipode.lng}
				temp={antipode.temp}
				pressure={antipode.pressure}
				accentColor="#0d9488"
			/>

			<div className="h-px bg-navy-700" />

			<div className="flex flex-col gap-2">
				<p className="text-xs font-medium uppercase tracking-wider text-slate-400">
					Difference
				</p>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-xl font-semibold tabular-nums" style={{
							color: Math.abs(delta.temp) < 2 ? "#22c55e" : Math.abs(delta.temp) < 10 ? "#f59e0b" : "#ef4444",
						}}>
							{delta.temp > 0 ? "+" : ""}{delta.temp.toFixed(1)}&deg;C
						</p>
					</div>
					<div>
						<p className="text-xl font-semibold tabular-nums" style={{
							color: Math.abs(delta.pressure) < 2 ? "#22c55e" : Math.abs(delta.pressure) < 10 ? "#f59e0b" : "#ef4444",
						}}>
							{delta.pressure > 0 ? "+" : ""}{delta.pressure.toFixed(1)} hPa
						</p>
					</div>
				</div>
				<p className="text-xs text-slate-400 mt-1">
					{Math.abs(delta.temp) < 2 && Math.abs(delta.pressure) < 5
						? "Very close to the Borsuk-Ulam prediction!"
						: "The theorem guarantees equal points exist somewhere."}
				</p>
			</div>
		</div>
	);
}
