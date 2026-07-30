import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { NavigationDirectionProvider, useNavigationDirection } from './NavigationDirectionContext.jsx';

function Probe() {
  const { isBack, goBack, resetToForward } = useNavigationDirection();
  return (
    <div>
      <span>isBack: {String(isBack)}</span>
      <button type="button" onClick={goBack}>
        go back
      </button>
      <button type="button" onClick={resetToForward}>
        reset
      </button>
    </div>
  );
}

function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={['/a', '/b']} initialIndex={1}>
      <NavigationDirectionProvider>
        <Routes>
          <Route path="/a" element={<Probe />} />
          <Route path="/b" element={<Probe />} />
        </Routes>
      </NavigationDirectionProvider>
    </MemoryRouter>
  );
}

describe('NavigationDirectionContext', () => {
  it('defaults to forward (isBack: false)', () => {
    renderWithRouter();
    expect(screen.getByText('isBack: false')).toBeInTheDocument();
  });

  it('sets isBack to true when goBack is called', () => {
    renderWithRouter();
    fireEvent.click(screen.getByText('go back'));
    expect(screen.getByText('isBack: true')).toBeInTheDocument();
  });

  it('resetToForward flips it back to false', () => {
    renderWithRouter();
    fireEvent.click(screen.getByText('go back'));
    fireEvent.click(screen.getByText('reset'));
    expect(screen.getByText('isBack: false')).toBeInTheDocument();
  });
});
