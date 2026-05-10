import { create } from "zustand";

export interface WeatherPoint {
	lat: number;
	lng: number;
	temp: number;
	pressure: number;
}

export interface WeatherResponse {
	point: WeatherPoint;
	antipode: WeatherPoint;
	delta: { temp: number; pressure: number };
}

export interface ScannerPoint {
	lat: number;
	lng: number;
	antiLat: number;
	antiLng: number;
	tempDelta: number;
	pressureDelta: number;
	combinedDelta: number;
}

export interface ScannerResponse {
	points: ScannerPoint[];
	closest: {
		index: number;
		lat: number;
		lng: number;
		tempDelta: number;
		pressureDelta: number;
	};
}

interface AppState {
	selectedPoint: { lat: number; lng: number } | null;
	antipodalPoint: { lat: number; lng: number } | null;
	selectedDate: string;
	weatherData: WeatherResponse | null;
	scannerData: ScannerResponse | null;
	isEducationOpen: boolean;
	isLoading: boolean;
	error: string | null;
	setSelectedPoint: (lat: number, lng: number) => void;
	setSelectedDate: (date: string) => void;
	setWeatherData: (data: WeatherResponse | null) => void;
	setScannerData: (data: ScannerResponse | null) => void;
	toggleEducation: () => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	reset: () => void;
}

const initialState = {
	selectedPoint: null,
	antipodalPoint: null,
	selectedDate: "2020-07-15",
	weatherData: null,
	scannerData: null,
	isEducationOpen: false,
	isLoading: false,
	error: null,
};

export const useAppStore = create<AppState>((set) => ({
	...initialState,

	setSelectedPoint: (lat, lng) =>
		set({
			selectedPoint: { lat, lng },
			antipodalPoint: {
				lat: -lat,
				lng: lng > 0 ? lng - 180 : lng + 180,
			},
		}),

	setSelectedDate: (date) => set({ selectedDate: date }),

	setWeatherData: (data) => set({ weatherData: data }),

	setScannerData: (data) => set({ scannerData: data }),

	toggleEducation: () =>
		set((state) => ({ isEducationOpen: !state.isEducationOpen })),

	setLoading: (loading) => set({ isLoading: loading }),

	setError: (error) => set({ error }),

	reset: () => set(initialState),
}));

if (typeof window !== "undefined") {
	(window as any).__ZUSTAND_STORE__ = useAppStore;
}
