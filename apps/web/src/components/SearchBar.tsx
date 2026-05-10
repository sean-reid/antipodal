import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGeocode } from "@/hooks/useGeocode";
import { useAppStore } from "@/stores/app-store";

export function SearchBar() {
	const { query, setQuery, results, isSearching } = useGeocode();
	const setSelectedPoint = useAppStore((s) => s.setSelectedPoint);
	const inputRef = useRef<HTMLInputElement>(null);
	const blurTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

	function handleSelect(lat: number, lng: number) {
		setSelectedPoint(lat, lng);
		setQuery("");
		inputRef.current?.blur();
	}

	function handleBlur() {
		blurTimeoutRef.current = setTimeout(() => setQuery(""), 150);
	}

	function handleFocus() {
		if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
	}

	const showDropdown = results.length > 0 && query.trim().length >= 2;

	return (
		<div className="relative w-full sm:w-64">
			<div className="relative">
				<svg
					className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fillRule="evenodd"
						d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
						clipRule="evenodd"
					/>
				</svg>
				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onBlur={handleBlur}
					onFocus={handleFocus}
					placeholder="Search city..."
					className="w-full rounded-lg border border-navy-700 bg-navy-800 py-1.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-400 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-colors"
				/>
				{isSearching && (
					<div className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-amber-500" />
				)}
			</div>

			<AnimatePresence>
				{showDropdown && (
					<motion.ul
						initial={{ opacity: 0, y: -4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -4 }}
						transition={{ duration: 0.15 }}
						className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-navy-700 bg-navy-900/95 backdrop-blur-sm overflow-hidden z-50"
					>
						{results.map((r, i) => (
							<li key={`${r.latitude}-${r.longitude}-${i}`}>
								<button
									type="button"
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => handleSelect(r.latitude, r.longitude)}
									className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-navy-800 transition-colors cursor-pointer"
								>
									<span className="font-medium">{r.name}</span>
									<span className="text-slate-400">
										{r.admin1 ? `, ${r.admin1}` : ""} - {r.country}
									</span>
								</button>
							</li>
						))}
					</motion.ul>
				)}
			</AnimatePresence>
		</div>
	);
}
