import { Globe } from "./Globe";
import { TimeSlider } from "./TimeSlider";
import { ComparisonView } from "./ComparisonView";
import { SearchBar } from "./SearchBar";
import { Scanner } from "./Scanner";
import { EducationPanel } from "./EducationPanel";
import { useWeather } from "@/hooks/useWeather";
import { useAppStore } from "@/stores/app-store";

export function Layout() {
	useWeather();

	const selectedPoint = useAppStore((s) => s.selectedPoint);
	const antipodalPoint = useAppStore((s) => s.antipodalPoint);
	const weatherData = useAppStore((s) => s.weatherData);
	const error = useAppStore((s) => s.error);
	const toggleEducation = useAppStore((s) => s.toggleEducation);

	return (
		<div className="relative h-dvh w-full overflow-hidden bg-navy-950">
			<header className="absolute top-0 left-0 right-0 z-10 pointer-events-none px-4 py-3 sm:px-6 sm:py-4">
				<div className="flex items-start justify-between">
					<div className="pointer-events-auto w-72 sm:w-96">
						<div className="flex items-baseline gap-3">
							<h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-200">
								Antipodal
							</h1>
							<p className="text-xs sm:text-sm font-serif italic text-slate-400">
								Exploring the Borsuk-Ulam Theorem
							</p>
						</div>
						<div className="mt-2">
							<SearchBar />
						</div>
					</div>
					<button
						onClick={toggleEducation}
						className="pointer-events-auto flex items-center justify-center h-8 w-8 rounded-full border border-navy-700 bg-navy-900/80 backdrop-blur-sm text-slate-400 hover:text-amber-500 hover:border-amber-500/50 transition-colors"
						aria-label="Learn about the Borsuk-Ulam theorem"
					>
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
							<circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
							<path d="M5.5 5.5a1.5 1.5 0 1 1 2.12 1.37c-.42.24-.62.5-.62.88V8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
							<circle cx="7" cy="10.25" r="0.75" fill="currentColor" />
						</svg>
					</button>
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
					<div className="h-px bg-navy-700 my-4" />
					<Scanner />
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

			<EducationPanel />
		</div>
	);
}
