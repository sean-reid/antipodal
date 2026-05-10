export function idwInterpolate(
	values: Array<{ value: number; distance: number }>,
	power = 2,
): number {
	for (const v of values) {
		if (v.distance === 0) {
			return v.value;
		}
	}

	let weightSum = 0;
	let valueSum = 0;

	for (const v of values) {
		const w = 1 / v.distance ** power;
		weightSum += w;
		valueSum += w * v.value;
	}

	return valueSum / weightSum;
}
