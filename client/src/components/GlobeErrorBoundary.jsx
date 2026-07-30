import { Component } from 'react';

// React only supports catching render/lifecycle errors (a failed dynamic
// import, a WebGL context lost mid-session) with a class component — hooks
// have no equivalent. Falls back to whatever was passed as `fallback`
// (the static globe) rather than crashing the page.
export default class GlobeErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
