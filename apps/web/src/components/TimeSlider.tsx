import { useCallback, useMemo } from "react";
import { useAppStore } from "@/stores/app-store";

const START = new Date("1940-01-01T00:00:00Z").getTime();
const END = new Date("2024-12-31T00:00:00Z").getTime();
const MS_PER_DAY = 86_400_000;
const MAX_INDEX = Math.round((END - START) / MS_PER_DAY);

const MONTHS = [
	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function dateToIndex(dateStr: string): number {
	const ms = new Date(dateStr + "T00:00:00Z").getTime();
	return Math.round((ms - START) / MS_PER_DAY);
}

function indexToDate(index: number): string {
	const d = new Date(START + index * MS_PER_DAY);
	const y = d.getUTCFullYear();
	const m = String(d.getUTCMonth() + 1).padStart(2, "0");
	const day = String(d.getUTCDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

export function TimeSlider() {
	const selectedDate = useAppStore((s) => s.selectedDate);
	const setSelectedDate = useAppStore((s) => s.setSelectedDate);

	const currentIndex = useMemo(() => dateToIndex(selectedDate), [selectedDate]);

	const displayDate = useMemo(() => {
		const year = selectedDate.slice(0, 4);
		const monthIdx = parseInt(selectedDate.slice(5, 7)) - 1;
		const day = parseInt(selectedDate.slice(8, 10));
		return `${MONTHS[monthIdx]} ${day}, ${year}`;
	}, [selectedDate]);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const idx = parseInt(e.target.value);
			setSelectedDate(indexToDate(idx));
		},
		[setSelectedDate],
	);

	return (
		<div className="flex flex-col items-center gap-2">
			<span className="text-sm font-medium text-slate-200 tabular-nums">
				{displayDate}
			</span>
			<input
				type="range"
				min={0}
				max={MAX_INDEX}
				value={currentIndex}
				onChange={handleChange}
				aria-label={`Date selector: ${displayDate}`}
				className="w-full max-w-md h-1.5 appearance-none rounded-full bg-navy-700 cursor-pointer accent-amber-500
					[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
					[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:cursor-pointer
					[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full
					[&::-moz-range-thumb]:bg-amber-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
			/>
			<div className="flex w-full max-w-md justify-between text-xs text-slate-400">
				<span>1940</span>
				<span>1960</span>
				<span>1980</span>
				<span>2000</span>
				<span>2024</span>
			</div>
		</div>
	);
}
