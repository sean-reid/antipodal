import { Globe } from "./Globe";
import { TimeSlider } from "./TimeSlider";
import { ComparisonView } from "./ComparisonView";
import { useWeather } from "@/hooks/useWeather";
import { useAppStore } from "@/stores/app-store";

export function Layout() {
	useWeather();

	const selectedPoint = useAppStore((s) => s.selectedPoint);
	const antipodalPoint = useAppStore((s) => s.antipodalPoint);
	const weatherData = useAppStore((s) => s.weatherData);
	const error = useAppStore((s) => s.error);

	return (
		<div className="relative h-dvh w-full overflow-hidden bg-navy-950">
			<header className="absolute top-0 left-0 right-0 z-10 pointer-events-none px-4 py-3 sm:px-6 sm:py-4">
				<div className="pointer-events-auto inline-block">
					<h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-200">
						Antipodal
					</h1>
					<p className="text-xs sm:text-sm font-serif italic text-slate-400">
						Exploring the Borsuk-Ulam Theorem
					</p>
				</div>
			</header>

			{!selectedPoint && (
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none text-center px-6">
					<p className="text-sm text-slate-400">
						Tap anywhere on the globe to explore antipodal weather
					</p>
				</div>
			)}

			<main className="h-full w-full">
				<Globe />
			</main>

			{selectedPoint && antipodalPoint && (
				<div className="absolute bottom-28 sm:bottom-24 left-1/2 -translate-x-1/2 z-10 flex gap-4 sm:gap-6 text-xs text-slate-400">
					<div className="flex items-center gap-1.5">
						<span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
						<span className="tabular-nums">
							{selectedPoint.lat.toFixed(2)}, {selectedPoint.lng.toFixed(2)}
						</span>
					</div>
					<div className="flex items-center gap-1.5">
						<span className="inline-block h-2 w-2 rounded-full bg-teal-500" />
						<span className="tabular-nums">
							{antipodalPoint.lat.toFixed(2)}, {antipodalPoint.lng.toFixed(2)}
						</span>
					</div>
				</div>
			)}

			{weatherData && (
				<aside className="
					absolute z-20
					bottom-20 left-2 right-2
					sm:bottom-auto sm:top-16 sm:right-4 sm:left-auto sm:w-80
					bg-navy-900/95 backdrop-blur-sm rounded-xl border border-navy-700 p-4 sm:p-5
					max-h-[40vh] sm:max-h-[calc(100vh-8rem)] overflow-y-auto
				">
					<ComparisonView />
				</aside>
			)}

			{error && (
				<div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-red-900/80 text-red-200 text-sm px-4 py-2 rounded-lg">
					{error}
				</div>
			)}

			<div className="absolute bottom-0 left-0 right-0 z-10 px-4 sm:px-6 pb-4 sm:pb-6 pt-2">
				<TimeSlider />
			</div>
		</div>
	);
}
