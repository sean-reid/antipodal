import { test, expect } from "@playwright/test";

test("initial state with instructions", async ({ page }) => {
	await page.goto("/");
	await page.waitForTimeout(3000);
	await page.screenshot({ path: "test-results/01-initial.png", fullPage: true });
});

test("weather comparison after point selection", async ({ page }) => {
	await page.goto("/");
	await page.waitForTimeout(2000);

	await page.evaluate(() => {
		const store = (window as any).__ZUSTAND_STORE__;
		if (store) store.getState().setSelectedPoint(40.71, -74.01);
	});

	await page.waitForTimeout(2500);
	await page.screenshot({ path: "test-results/02-weather-desktop.png", fullPage: true });
});

test("education panel", async ({ page }) => {
	await page.goto("/");
	await page.waitForTimeout(2000);

	await page.evaluate(() => {
		const store = (window as any).__ZUSTAND_STORE__;
		if (store) store.getState().toggleEducation();
	});

	await page.waitForTimeout(800);
	await page.screenshot({ path: "test-results/03-education.png", fullPage: true });
});

test("mobile weather and education", async ({ page }) => {
	await page.setViewportSize({ width: 375, height: 812 });
	await page.goto("/");
	await page.waitForTimeout(2000);

	await page.evaluate(() => {
		const store = (window as any).__ZUSTAND_STORE__;
		if (store) store.getState().setSelectedPoint(35.68, 139.69);
	});

	await page.waitForTimeout(2500);
	await page.screenshot({ path: "test-results/04-mobile-weather.png", fullPage: true });

	await page.evaluate(() => {
		const store = (window as any).__ZUSTAND_STORE__;
		if (store) store.getState().toggleEducation();
	});

	await page.waitForTimeout(800);
	await page.screenshot({ path: "test-results/05-mobile-education.png", fullPage: true });
});
