export interface GridPoint {
	lat: number;
	lng: number;
	antiLat: number;
	antiLng: number;
}

export interface DayEntry {
	t1: number | null;
	p1: number | null;
	t2: number | null;
	p2: number | null;
}

export interface MonthFile {
	days: Record<string, DayEntry[]>;
}
