import { fetchScanner } from "@/lib/api";
import { useAppStore } from "@/stores/app-store";
import { useCallback, useEffect, useRef, useState } from "react";

export function useScanner() {
	const [isScanning, setIsScanning] = useState(false);
	const selectedDate = useAppStore((s) => s.selectedDate);
	const setScannerData = useAppStore((s) => s.setScannerData);
	const scannerData = useAppStore((s) => s.scannerData);
	const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

	const scan = useCallback(async () => {
		setIsScanning(true);
		try {
			const data = await fetchScanner(selectedDate);
			setScannerData(data);
		} catch {
			setScannerData(null);
		} finally {
			setIsScanning(false);
		}
	}, [selectedDate, setScannerData]);

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

	return { scan, isScanning, scannerData };
}
