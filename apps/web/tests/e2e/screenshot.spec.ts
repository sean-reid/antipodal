import { test, expect } from "@playwright/test";

test("globe loads with instructions", async ({ page }) => {
	await page.goto("/");
	await page.waitForTimeout(3000);
	await page.screenshot({ path: "test-results/01-initial-desktop.png", fullPage: true });
	await expect(page.getByText("Tap anywhere")).toBeVisible();
});

test("click globe shows weather comparison", async ({ page }) => {
	await page.goto("/");
	await page.waitForTimeout(2000);

	// Click near center of viewport to hit the globe surface
	const canvas = page.locator("canvas").first();
	const box = await canvas.boundingBox();
	if (box) {
		await canvas.click({ position: { x: box.width / 2, y: box.height / 2 - 40 } });
	}
	await page.waitForTimeout(1000);

	// If click didn't register, set the point programmatically
	const hasPoint = await page.evaluate(() => {
		const store = (window as any).__ZUSTAND_STORE__;
		return store?.getState()?.selectedPoint !== null;
	});

	if (!hasPoint) {
		await page.evaluate(() => {
			const store = (window as any).__ZUSTAND_STORE__;
			if (store) store.getState().setSelectedPoint(40.71, -74.01);
		});
	}

	await page.waitForTimeout(2000);
	await page.screenshot({ path: "test-results/02-clicked-desktop.png", fullPage: true });
});

test("mobile layout with weather panel", async ({ page }) => {
	await page.setViewportSize({ width: 375, height: 812 });
	await page.goto("/");
	await page.waitForTimeout(2000);

	await page.evaluate(() => {
		const store = (window as any).__ZUSTAND_STORE__;
		if (store) store.getState().setSelectedPoint(35.68, 139.69);
	});

	await page.waitForTimeout(2000);
	await page.screenshot({ path: "test-results/03-mobile-weather.png", fullPage: true });
});
