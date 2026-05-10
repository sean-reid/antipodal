import { useCallback, useMemo } from "react";
import { useAppStore } from "@/stores/app-store";

const START_YEAR = 1940;
const END_YEAR = 2024;
const MONTHS = [
	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function dateToIndex(dateStr: string): number {
	const year = parseInt(dateStr.slice(0, 4));
	const month = parseInt(dateStr.slice(5, 7)) - 1;
	const day = parseInt(dateStr.slice(8, 10)) - 1;
	const yearOffset = year - START_YEAR;
	return yearOffset * 365 + month * 30 + day;
}

function indexToDate(index: number): string {
	const yearOffset = Math.floor(index / 365);
	const remainder = index % 365;
	const month = Math.min(Math.floor(remainder / 30), 11);
	const day = Math.min(remainder % 30, 27);
	const year = START_YEAR + yearOffset;
	return `${year}-${String(month + 1).padStart(2, "0")}-${String(day + 1).padStart(2, "0")}`;
}

const MAX_INDEX = dateToIndex(`${END_YEAR}-12-28`);

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
					[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
					[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:cursor-pointer
					[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full
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
