export function antipodal(lat: number, lng: number): { lat: number; lng: number } {
	// Adding 0 converts -0 to 0
	const antiLat = -lat + 0;
	let antiLng = lng + 180;
	if (antiLng > 180) {
		antiLng -= 360;
	}
	return { lat: antiLat, lng: antiLng };
}
