import { useAppStore } from "@/stores/app-store";
import { useCallback, useEffect, useMemo, useRef } from "react";
import GlobeGL from "react-globe.gl";

const GLOBE_IMAGE = "/earth-blue-marble.jpg";

const POINT_COLOR = "#f59e0b";
const ANTIPODE_COLOR = "#0d9488";

interface PointData {
	lat: number;
	lng: number;
	color: string;
	label: string;
	size: number;
}

interface RingData {
	lat: number;
	lng: number;
	color: string;
	maxR: number;
	propagationSpeed: number;
	repeatPeriod: number;
}

// biome-ignore lint/suspicious/noExplicitAny: react-globe.gl ring accessor has no exported type
const ringColorAccessor = (d: any) => {
	const c = d.color;
	return (t: number) => {
		const fade = t < 0.7 ? 1 - t * 0.3 : Math.max(0, 1 - (t - 0.7) / 0.3);
		const alpha = Math.round(fade * 200);
		return `${c}${alpha.toString(16).padStart(2, "0")}`;
	};
};

// biome-ignore lint/suspicious/noExplicitAny: three-globe internal scene objects have no exported types
function clearRingChildren(scene: any) {
	// biome-ignore lint/suspicious/noExplicitAny: three-globe internal
	scene.traverse((obj: any) => {
		if (obj.__globeObjType === "ring" && obj.children.length > 0) {
			while (obj.children.length > 0) {
				const child = obj.children[0];
				obj.remove(child);
				if (child.geometry) child.geometry.dispose();
				if (child.material) child.material.dispose();
			}
		}
	});
}

export default function Globe() {
	// biome-ignore lint/suspicious/noExplicitAny: react-globe.gl ref has no exported type
	const globeRef = useRef<any>(null);
	const selectedPoint = useAppStore((s) => s.selectedPoint);
	const antipodalPoint = useAppStore((s) => s.antipodalPoint);
	const setSelectedPoint = useAppStore((s) => s.setSelectedPoint);

	const handleGlobeClick = useCallback(
		({ lat, lng }: { lat: number; lng: number }) => {
			setSelectedPoint(Math.round(lat * 100) / 100, Math.round(lng * 100) / 100);
		},
		[setSelectedPoint],
	);

	useEffect(() => {
		const globe = globeRef.current;
		if (!globe) return;

		globe.controls().autoRotate = true;
		globe.controls().autoRotateSpeed = 0.4;
		globe.controls().enableDamping = true;
		globe.controls().dampingFactor = 0.1;
	}, []);

	useEffect(() => {
		if (!selectedPoint || !globeRef.current) return;
		globeRef.current.controls().autoRotate = false;
		globeRef.current.pointOfView(
			{ lat: selectedPoint.lat, lng: selectedPoint.lng, altitude: 2 },
			800,
		);
	}, [selectedPoint]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: clearRingChildren is stable
	useEffect(() => {
		const globe = globeRef.current;
		if (!globe) return;
		clearRingChildren(globe.scene());
	}, [selectedPoint, antipodalPoint]);

	const pointsData: PointData[] = useMemo(() => {
		if (!selectedPoint || !antipodalPoint) return [];
		return [
			{
				lat: selectedPoint.lat,
				lng: selectedPoint.lng,
				color: POINT_COLOR,
				label: "Selected",
				size: 1.4,
			},
			{
				lat: antipodalPoint.lat,
				lng: antipodalPoint.lng,
				color: ANTIPODE_COLOR,
				label: "Antipode",
				size: 1.4,
			},
		];
	}, [selectedPoint, antipodalPoint]);

	const ringsData: RingData[] = useMemo(() => {
		if (!selectedPoint || !antipodalPoint) return [];
		return [
			{
				lat: selectedPoint.lat,
				lng: selectedPoint.lng,
				color: POINT_COLOR,
				maxR: 25,
				propagationSpeed: 6,
				repeatPeriod: 600,
			},
			{
				lat: antipodalPoint.lat,
				lng: antipodalPoint.lng,
				color: ANTIPODE_COLOR,
				maxR: 25,
				propagationSpeed: 6,
				repeatPeriod: 600,
			},
		];
	}, [selectedPoint, antipodalPoint]);

	return (
		<GlobeGL
			ref={globeRef}
			globeImageUrl={GLOBE_IMAGE}
			backgroundColor="rgba(0,0,0,0)"
			atmosphereColor="#4a6fa5"
			atmosphereAltitude={0.15}
			onGlobeClick={handleGlobeClick}
			pointsData={pointsData}
			pointLat="lat"
			pointLng="lng"
			pointColor="color"
			pointLabel="label"
			pointRadius="size"
			pointAltitude={0.01}
			ringsData={ringsData}
			ringLat="lat"
			ringLng="lng"
			ringColor={ringColorAccessor}
			ringMaxRadius="maxR"
			ringPropagationSpeed="propagationSpeed"
			ringRepeatPeriod="repeatPeriod"
			animateIn={true}
		/>
	);
}
