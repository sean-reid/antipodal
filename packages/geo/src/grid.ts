import { haversine } from "./distance.js";

export function fibonacciSphere(n: number): Array<{ lat: number; lng: number }> {
	const points: Array<{ lat: number; lng: number }> = [];
	const goldenAngle = Math.PI * (3 - Math.sqrt(5));

	for (let i = 0; i < n; i++) {
		const y = 1 - (2 * i) / (n - 1);
		const radius = Math.sqrt(1 - y * y);
		const theta = goldenAngle * i;

		const lat = (Math.asin(y) * 180) / Math.PI;
		const lng = ((theta * 180) / Math.PI) % 360;
		const wrappedLng = lng > 180 ? lng - 360 : lng < -180 ? lng + 360 : lng;

		points.push({ lat, lng: wrappedLng });
	}

	return points;
}

export function findNearestPoints(
	lat: number,
	lng: number,
	grid: Array<{ lat: number; lng: number }>,
	k: number,
): Array<{ index: number; lat: number; lng: number; distance: number }> {
	const withDistances = grid.map((point, index) => ({
		index,
		lat: point.lat,
		lng: point.lng,
		distance: haversine(lat, lng, point.lat, point.lng),
	}));

	withDistances.sort((a, b) => a.distance - b.distance);

	return withDistances.slice(0, k);
}
