import { fetchScanner } from "@/lib/api";
import { useAppStore } from "@/stores/app-store";
import { useEffect, useRef, useState } from "react";

export function useScanner() {
	const [isScanning, setIsScanning] = useState(false);
	const selectedDate = useAppStore((s) => s.selectedDate);
	const setScannerData = useAppStore((s) => s.setScannerData);
	const scannerData = useAppStore((s) => s.scannerData);
	const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => {
		clearTimeout(timerRef.current);
		let cancelled = false;

		timerRef.current = setTimeout(() => {
			setIsScanning(true);
			fetchScanner(selectedDate)
				.then((data) => {
					if (!cancelled) setScannerData(data);
				})
				.catch(() => {
					if (!cancelled) setScannerData(null);
				})
				.finally(() => {
					if (!cancelled) setIsScanning(false);
				});
		}, 300);

		return () => {
			cancelled = true;
			clearTimeout(timerRef.current);
		};
	}, [selectedDate, setScannerData]);

	return { isScanning, scannerData };
}
