interface WeatherCardProps {
	label: string;
	lat: number;
	lng: number;
	temp: number;
	pressure: number;
	accentColor: string;
}

export function WeatherCard({ label, lat, lng, temp, pressure, accentColor }: WeatherCardProps) {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-2">
				<span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
				<span className="text-xs font-medium uppercase tracking-wider text-slate-400">
					{label}
				</span>
			</div>

			<p className="text-xs text-slate-400 tabular-nums">
				{lat.toFixed(2)}, {lng.toFixed(2)}
			</p>

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
