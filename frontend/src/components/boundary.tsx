"use client";

import { Component, type ReactNode } from "react";

type Props = { name: string; children: ReactNode; fallback?: ReactNode };

// Keeps one broken widget (no WebGL, a failed chunk download) from taking the page down with it.
export class Boundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn(`${this.props.name} could not render`, error);
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
