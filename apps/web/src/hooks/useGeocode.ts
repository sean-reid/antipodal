import { useEffect, useRef, useState } from "react";

export interface GeoResult {
	name: string;
	country: string;
	country_code: string;
	latitude: number;
	longitude: number;
	admin1?: string;
}

export function useGeocode() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<GeoResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const abortRef = useRef<AbortController | null>(null);

	useEffect(() => {
		const trimmed = query.trim();
		if (trimmed.length < 2) {
			setResults([]);
			return;
		}

		const timeout = setTimeout(() => {
			abortRef.current?.abort();
			const controller = new AbortController();
			abortRef.current = controller;

			setIsSearching(true);

			fetch(
				`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=5&language=en&format=json`,
				{ signal: controller.signal },
			)
				.then((res) => res.json())
				.then((data) => {
					setResults(data.results ?? []);
					setIsSearching(false);
				})
				.catch((err) => {
					if (err.name !== "AbortError") {
						setResults([]);
						setIsSearching(false);
					}
				});
		}, 300);

		return () => {
			clearTimeout(timeout);
		};
	}, [query]);

	return { query, setQuery, results, isSearching };
}
