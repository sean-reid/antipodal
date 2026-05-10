import { useCallback, useEffect, useMemo, useRef } from "react";
import GlobeGL from "react-globe.gl";
import { useAppStore } from "@/stores/app-store";

const GLOBE_IMAGE = "/earth-blue-marble.jpg";

const POINT_COLOR = "#f59e0b";
const ANTIPODE_COLOR = "#0d9488";
const ARC_COLOR = ["#f59e0b", "#0d9488"];

interface PointData {
	lat: number;
	lng: number;
	color: string;
	label: string;
	size: number;
}

interface ArcData {
	startLat: number;
	startLng: number;
	endLat: number;
	endLng: number;
}

export function Globe() {
	const globeRef = useRef<any>(null);
	const selectedPoint = useAppStore((s) => s.selectedPoint);
	const antipodalPoint = useAppStore((s) => s.antipodalPoint);
	const setSelectedPoint = useAppStore((s) => s.setSelectedPoint);

	const handleGlobeClick = useCallback(
		({ lat, lng }: { lat: number; lng: number }) => {
			setSelectedPoint(
				Math.round(lat * 100) / 100,
				Math.round(lng * 100) / 100,
			);
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

	const pointsData: PointData[] = useMemo(() => {
		if (!selectedPoint || !antipodalPoint) return [];
		return [
			{
				lat: selectedPoint.lat,
				lng: selectedPoint.lng,
				color: POINT_COLOR,
				label: "Selected",
				size: 0.8,
			},
			{
				lat: antipodalPoint.lat,
				lng: antipodalPoint.lng,
				color: ANTIPODE_COLOR,
				label: "Antipode",
				size: 0.8,
			},
		];
	}, [selectedPoint, antipodalPoint]);

	const arcsData: ArcData[] = useMemo(() => {
		if (!selectedPoint || !antipodalPoint) return [];
		return [
			{
				startLat: selectedPoint.lat,
				startLng: selectedPoint.lng,
				endLat: antipodalPoint.lat,
				endLng: antipodalPoint.lng,
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
			arcsData={arcsData}
			arcStartLat="startLat"
			arcStartLng="startLng"
			arcEndLat="endLat"
			arcEndLng="endLng"
			arcColor={() => ARC_COLOR}
			arcDashLength={0.4}
			arcDashGap={0.2}
			arcDashAnimateTime={1500}
			arcStroke={0.5}
			animateIn={true}
		/>
	);
}
