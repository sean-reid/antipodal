import type { ScannerResponse, WeatherResponse } from "@/stores/app-store";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export async function fetchWeather(
	lat: number,
	lng: number,
	date: string,
): Promise<WeatherResponse> {
	const params = new URLSearchParams({
		lat: String(lat),
		lng: String(lng),
		date,
	});
	const res = await fetch(`${API_BASE}/weather?${params}`);
	if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
	return res.json();
}

export async function fetchScanner(date: string): Promise<ScannerResponse> {
	const params = new URLSearchParams({ date });
	const res = await fetch(`${API_BASE}/scanner?${params}`);
	if (!res.ok) throw new Error(`Scanner fetch failed: ${res.status}`);
	return res.json();
}
