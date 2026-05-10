import { fetchRange } from "@/lib/api";
import { useAppStore } from "@/stores/app-store";
import { useCallback, useEffect, useMemo } from "react";

const MS_PER_DAY = 86_400_000;
const DEFAULT_START = "1940-01-01";
const DEFAULT_END = "2024-12-31";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toMs(dateStr: string): number {
	return new Date(`${dateStr}T00:00:00Z`).getTime();
}

function buildYearLabels(startYear: number, endYear: number): number[] {
	if (endYear - startYear <= 10) {
		const step = Math.max(1, Math.ceil((endYear - startYear) / 4));
		const labels: number[] = [startYear];
		for (let y = startYear + step; y < endYear; y += step) labels.push(y);
		labels.push(endYear);
		return labels;
	}
	const span = endYear - startYear;
	const step = Math.ceil(span / 4);
	const labels: number[] = [startYear];
	for (let y = startYear + step; y < endYear; y += step) labels.push(y);
	labels.push(endYear);
	return labels;
}

export function TimeSlider() {
	const selectedDate = useAppStore((s) => s.selectedDate);
	const setSelectedDate = useAppStore((s) => s.setSelectedDate);
	const dateRange = useAppStore((s) => s.dateRange);
	const setDateRange = useAppStore((s) => s.setDateRange);

	useEffect(() => {
		if (dateRange) return;
		fetchRange()
			.then(setDateRange)
			.catch(() => setDateRange({ start: DEFAULT_START, end: DEFAULT_END }));
	}, [dateRange, setDateRange]);

	const start = dateRange?.start ?? DEFAULT_START;
	const end = dateRange?.end ?? DEFAULT_END;
	const startMs = toMs(start);
	const endMs = toMs(end);
	const maxIndex = Math.round((endMs - startMs) / MS_PER_DAY);

	const dateToIndex = useCallback(
		(dateStr: string) => Math.round((toMs(dateStr) - startMs) / MS_PER_DAY),
		[startMs],
	);

	const indexToDate = useCallback(
		(index: number) => {
			const d = new Date(startMs + index * MS_PER_DAY);
			const y = d.getUTCFullYear();
			const m = String(d.getUTCMonth() + 1).padStart(2, "0");
			const day = String(d.getUTCDate()).padStart(2, "0");
			return `${y}-${m}-${day}`;
		},
		[startMs],
	);

	const currentIndex = useMemo(() => dateToIndex(selectedDate), [dateToIndex, selectedDate]);

	const displayDate = useMemo(() => {
		const year = selectedDate.slice(0, 4);
		const monthIdx = Number.parseInt(selectedDate.slice(5, 7)) - 1;
		const day = Number.parseInt(selectedDate.slice(8, 10));
		return `${MONTHS[monthIdx]} ${day}, ${year}`;
	}, [selectedDate]);

	const yearLabels = useMemo(() => {
		const startYear = Number.parseInt(start.slice(0, 4));
		const endYear = Number.parseInt(end.slice(0, 4));
		return buildYearLabels(startYear, endYear);
	}, [start, end]);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const idx = Number.parseInt(e.target.value);
			setSelectedDate(indexToDate(idx));
		},
		[setSelectedDate, indexToDate],
	);

	return (
		<div className="flex flex-col items-center gap-2">
			<span className="text-sm font-medium text-slate-200 tabular-nums">{displayDate}</span>
			<input
				type="range"
				min={0}
				max={maxIndex}
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
				{yearLabels.map((year) => (
					<span key={year}>{year}</span>
				))}
			</div>
		</div>
	);
}
