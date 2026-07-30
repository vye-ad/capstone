import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const NavigationDirectionContext = createContext(null);

// §13: "direction is a boolean held in navigation state, not derived from
// the route" — without this, the router has no way to know whether a
// location change was a forward navigation or a back one, since route
// depth alone doesn't tell you that (e.g. /trips -> /trips/new -> /trips
// is a forward navigation into a shallower path).
export function NavigationDirectionProvider({ children }) {
  const [isBack, setIsBack] = useState(false);
  const navigate = useNavigate();

  const goBack = useCallback(() => {
    setIsBack(true);
    navigate(-1);
  }, [navigate]);

  const resetToForward = useCallback(() => setIsBack(false), []);

  return (
    <NavigationDirectionContext.Provider value={{ isBack, goBack, resetToForward }}>
      {children}
    </NavigationDirectionContext.Provider>
  );
}

export function useNavigationDirection() {
  const ctx = useContext(NavigationDirectionContext);
  if (!ctx) throw new Error('useNavigationDirection must be used within NavigationDirectionProvider');
  return ctx;
}
