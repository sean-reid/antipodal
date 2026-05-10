import { useState, useCallback } from "react";
import { useAppStore } from "@/stores/app-store";
import type { ScannerResponse } from "@/stores/app-store";
import { fetchScanner } from "@/lib/api";

export function useScanner() {
	const [isScanning, setIsScanning] = useState(false);
	const selectedDate = useAppStore((s) => s.selectedDate);
	const setScannerData = useAppStore((s) => s.setScannerData);
	const scannerData = useAppStore((s) => s.scannerData);

	const scan = useCallback(async () => {
		setIsScanning(true);
		try {
			const data: ScannerResponse = await fetchScanner(selectedDate);
			setScannerData(data);
		} catch {
			setScannerData(null);
		} finally {
			setIsScanning(false);
		}
	}, [selectedDate, setScannerData]);

	return { scan, isScanning, scannerData };
}
