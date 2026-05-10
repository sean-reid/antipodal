import { Component, type ReactNode } from "react";

interface Props {
	children: ReactNode;
}

interface State {
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	state: State = { error: null };

	static getDerivedStateFromError(error: Error) {
		return { error };
	}

	render() {
		if (this.state.error) {
			return (
				<div className="flex h-dvh w-full items-center justify-center bg-navy-950 px-6">
					<div className="text-center">
						<h1 className="text-xl font-semibold text-slate-200">
							Something went wrong
						</h1>
						<p className="mt-2 text-sm text-slate-400">
							{this.state.error.message}
						</p>
						<button
							onClick={() => window.location.reload()}
							className="mt-4 rounded-lg border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-slate-200 hover:border-amber-500/50 transition-colors"
						>
							Reload
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
