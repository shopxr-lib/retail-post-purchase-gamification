import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorBanner } from "./components";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        this.state.error?.message && 
          <ErrorBanner message={this.state.error?.message}/>
      );
    }

    return this.props.children;
  }
}
