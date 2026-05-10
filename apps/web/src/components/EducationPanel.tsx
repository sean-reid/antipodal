import { useAppStore } from "@/stores/app-store";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

function ChevronDown({ open }: { open: boolean }) {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			aria-hidden="true"
			className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
		>
			<path
				d="M4 6l4 4 4-4"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function useIsMobile() {
	const [mobile, setMobile] = useState(false);
	useEffect(() => {
		const mq = window.matchMedia("(max-width: 639px)");
		setMobile(mq.matches);
		const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);
	return mobile;
}

function PanelContent({ onClose }: { onClose: () => void }) {
	const [formalOpen, setFormalOpen] = useState(false);

	return (
		<>
			<div className="flex items-center justify-between px-5 py-4 border-b border-navy-700 shrink-0">
				<h2 className="text-lg font-semibold text-slate-200">The Borsuk-Ulam Theorem</h2>
				<button
					type="button"
					onClick={onClose}
					className="flex items-center justify-center h-8 w-8 rounded-full bg-navy-800 text-slate-400 hover:text-slate-200 transition-colors"
					aria-label="Close education panel"
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path
							d="M4 4l8 8M12 4l-8 8"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
						/>
					</svg>
				</button>
			</div>

			<div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
				<section>
					<h3 className="font-serif text-xl text-amber-500 mb-3">The Punchline</h3>
					<p className="font-serif text-slate-200 leading-relaxed">
						Right now, at this very moment, there are two points on Earth that are exactly opposite
						each other where the temperature and barometric pressure are identical. Not
						approximately equal. Exactly equal.
					</p>
					<p className="font-serif text-slate-200 leading-relaxed mt-3">
						This is not a guess or a statistical likelihood. It is a mathematical certainty, a
						consequence of continuity and the shape of the sphere.
					</p>
				</section>

				<div className="h-px bg-navy-700" />

				<section>
					<h3 className="font-serif text-xl text-amber-500 mb-3">Why This Must Be True</h3>
					<p className="font-serif text-slate-200 leading-relaxed">
						Start with a simpler version. Imagine walking around the equator carrying two
						thermometers: one measuring the temperature where you stand, the other measuring the
						temperature at the point diametrically opposite you on the globe.
					</p>
					<p className="font-serif text-slate-200 leading-relaxed mt-3">
						At the start, your thermometer reads some value{" "}
						<span className="text-amber-500 italic">T</span> and the opposite one reads{" "}
						<span className="text-amber-500 italic">T&prime;</span>. Now walk halfway around the
						equator, 180 degrees. You are standing where the opposite thermometer was, and it is
						where you started. The readings have swapped.
					</p>
					<p className="font-serif text-slate-200 leading-relaxed mt-3">
						Temperature varies continuously. So somewhere during your walk, the two readings must
						have crossed. At that crossing point, both thermometers show the same number.
					</p>
					<p className="font-serif text-slate-400 text-sm leading-relaxed mt-3">
						This is the one-dimensional case: for any continuous function on a circle, there exist
						antipodal points with equal values. The Intermediate Value Theorem does the heavy
						lifting.
					</p>
				</section>

				<div className="h-px bg-navy-700" />

				<section>
					<h3 className="font-serif text-xl text-amber-500 mb-3">From Circle to Sphere</h3>
					<p className="font-serif text-slate-200 leading-relaxed">
						On Earth's surface (a 2-sphere), the theorem generalizes. For any{" "}
						<span className="text-amber-500 font-medium">two</span> continuous functions defined on
						the sphere, there exist antipodal points where{" "}
						<span className="text-amber-500 font-medium">both</span> functions agree simultaneously.
					</p>
					<p className="font-serif text-slate-200 leading-relaxed mt-3">
						Temperature and pressure are continuous functions on Earth's surface. The theorem
						guarantees a pair of opposite points where both values match.
					</p>
					<p className="font-serif text-slate-200 leading-relaxed mt-3">
						The proof uses algebraic topology. If no such pair existed, you could construct an odd
						continuous map from the 2-sphere to the circle. But such a map cannot exist, as it would
						contradict the structure of the sphere's fundamental group under the antipodal action.
					</p>
				</section>

				<div className="h-px bg-navy-700" />

				<section>
					<h3 className="font-serif text-xl text-amber-500 mb-3">What This App Shows</h3>
					<p className="font-serif text-slate-200 leading-relaxed">
						This app lets you explore that guarantee with real data. Click any point on the globe to
						see its antipode and compare the weather at both locations.
					</p>
					<p className="font-serif text-slate-200 leading-relaxed mt-3">
						The scanner searches a grid of 500 points to find the pair closest to equality. Real
						weather data has measurement noise and our grid is finite, so you will not find an exact
						match. But you will often find surprisingly close ones.
					</p>
					<p className="font-serif text-slate-400 text-sm leading-relaxed mt-3">
						The theorem guarantees the exact match exists somewhere between our grid points.
					</p>
				</section>

				<div className="h-px bg-navy-700" />

				<section>
					<button
						type="button"
						onClick={() => setFormalOpen((v) => !v)}
						className="flex items-center gap-2 w-full text-left group"
					>
						<h3 className="font-serif text-xl text-amber-500 group-hover:text-amber-400 transition-colors">
							The Formal Statement
						</h3>
						<ChevronDown open={formalOpen} />
					</button>

					<AnimatePresence initial={false}>
						{formalOpen && (
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								transition={{ duration: 0.25 }}
								className="overflow-hidden"
							>
								<div className="pt-3 space-y-3">
									<p className="font-serif text-slate-200 leading-relaxed">
										<span className="text-amber-500 font-medium">Theorem</span> (Borsuk-Ulam, 1933).
										For any continuous function{" "}
										<span className="italic">
											f: S<sup>n</sup> &rarr; R<sup>n</sup>
										</span>
										, there exists a point <span className="italic">x</span> in{" "}
										<span className="italic">
											S<sup>n</sup>
										</span>{" "}
										such that <span className="italic">f(x) = f(&minus;x)</span>.
									</p>
									<p className="font-serif text-slate-200 leading-relaxed">
										In our case, <span className="italic">n</span> = 2. The sphere{" "}
										<span className="italic">
											S<sup>2</sup>
										</span>{" "}
										is Earth's surface. The function <span className="italic">f</span> maps each
										point to (temperature, pressure) in{" "}
										<span className="italic">
											R<sup>2</sup>
										</span>
										.
									</p>
									<p className="font-serif text-slate-400 text-sm leading-relaxed">
										First proved by Karol Borsuk in 1933, though Stanislaw Ulam conjectured it
										earlier.
									</p>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</section>
			</div>
		</>
	);
}

export function EducationPanel() {
	const isOpen = useAppStore((s) => s.isEducationOpen);
	const toggle = useAppStore((s) => s.toggleEducation);
	const isMobile = useIsMobile();

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						className="fixed inset-0 z-40 bg-black/60"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.25 }}
						onClick={toggle}
					/>

					<motion.aside
						className={`
							fixed z-50 bg-navy-900 flex flex-col
							${
								isMobile
									? "inset-x-0 bottom-0 top-0 rounded-t-2xl border-t border-navy-700"
									: "inset-y-0 left-0 w-[400px] border-r border-navy-700"
							}
						`}
						initial={isMobile ? { y: "100%" } : { x: "-100%" }}
						animate={isMobile ? { y: 0 } : { x: 0 }}
						exit={isMobile ? { y: "100%" } : { x: "-100%" }}
						transition={{ type: "spring", damping: 30, stiffness: 300 }}
					>
						<PanelContent onClose={toggle} />
					</motion.aside>
				</>
			)}
		</AnimatePresence>
	);
}
