import { fetchScanner } from "@/lib/api";
import { useAppStore } from "@/stores/app-store";
import type { ScannerResponse } from "@/stores/app-store";
import { useCallback, useState } from "react";

export function useScanner() {
	const [isScanning, setIsScanning] = useState(false);
	const selectedDate = useAppStore((s) => s.selectedDate);
	const setScannerData = useAppStore((s) => s.setScannerData);
	const scannerData = useAppStore((s) => s.scannerData);

	const scan = useCallback(async (): Promise<ScannerResponse | null> => {
		setIsScanning(true);
		try {
			const data = await fetchScanner(selectedDate);
			setScannerData(data);
			return data;
		} catch {
			setScannerData(null);
			return null;
		} finally {
			setIsScanning(false);
		}
	}, [selectedDate, setScannerData]);

	return { scan, isScanning, scannerData };
}
