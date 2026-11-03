import { useEffect, useState } from 'react';
export function navigate(path: string) {
  window.location.hash = path;
}
export function useRoute() {
  const [route, setRoute] = useState(
    () => window.location.hash.slice(1) || '/cases',
  );
  useEffect(() => {
    const change = () => setRoute(window.location.hash.slice(1) || '/cases');
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  return route;
}
