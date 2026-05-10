import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";
import { fetchWeather } from "@/lib/api";

export function useWeather() {
	const selectedPoint = useAppStore((s) => s.selectedPoint);
	const selectedDate = useAppStore((s) => s.selectedDate);
	const setWeatherData = useAppStore((s) => s.setWeatherData);
	const setLoading = useAppStore((s) => s.setLoading);
	const setError = useAppStore((s) => s.setError);

	useEffect(() => {
		if (!selectedPoint) return;

		let cancelled = false;
		setLoading(true);
		setError(null);

		fetchWeather(selectedPoint.lat, selectedPoint.lng, selectedDate)
			.then((data) => {
				if (!cancelled) {
					setWeatherData(data);
					setLoading(false);
				}
			})
			.catch((err) => {
				if (!cancelled) {
					setError(err.message);
					setLoading(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [selectedPoint, selectedDate, setWeatherData, setLoading, setError]);
}
