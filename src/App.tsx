import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useRoute } from './hooks/useRoute';
import { api, errorMessage } from './lib/api';
import type { Catalog } from './types';
import { Loading, ErrorNotice } from './components/common/Feedback';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { CaseListPage } from './pages/CaseListPage';
import { NewCasePage } from './pages/NewCasePage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { GuidePage } from './pages/GuidePage';
function Workspace() {
  const route = useRoute(),
    [catalog, setCatalog] = useState<Catalog | null>(null),
    [error, setError] = useState(''),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api<Catalog>('/catalog', { signal: controller.signal })
      .then((x) => {
        setCatalog(x);
        setError('');
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(errorMessage(e));
      });
    return () => controller.abort();
  }, [attempt]);
  const match = /^\/cases\/([a-f\d]{24})$/i.exec(route);
  return (
    <AppLayout route={route}>
      {error ? (
        <>
          <ErrorNotice message={error} />
          <button
            className="button secondary"
            onClick={() => setAttempt((x) => x + 1)}
          >
            ลองโหลดอีกครั้ง
          </button>
        </>
      ) : !catalog ? (
        <Loading />
      ) : route === '/cases/new' ? (
        <NewCasePage catalog={catalog} />
      ) : match ? (
        <CaseDetailPage key={match[1]} id={match[1]!} catalog={catalog} />
      ) : route === '/guide' ? (
        <GuidePage catalog={catalog} />
      ) : (
        <CaseListPage />
      )}
    </AppLayout>
  );
}
function AuthenticatedApp() {
  const { user, loading } = useAuth();
  return loading ? (
    <Loading label="กำลังตรวจสอบการเข้าสู่ระบบ…" />
  ) : user ? (
    <Workspace key={user.id} />
  ) : (
    <LoginPage />
  );
}
export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
