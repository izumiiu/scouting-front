import { useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { errorMessage } from '../../lib/api';
export function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21v-9M12 14C5 15 3 9 3 5c6 0 9 3 9 9Zm0-3c0-5 4-8 9-8 0 5-3 8-9 8Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div>
        <strong>
          NU SEED <span>Scouting</span>
        </strong>
        <small>ENTREPRENEUR DEVELOPMENT</small>
      </div>
    </div>
  );
}
export function AppLayout({
  children,
  route,
}: {
  children: ReactNode;
  route: string;
}) {
  const { user, logout } = useAuth(),
    [error, setError] = useState('');
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        ข้ามไปเนื้อหา
      </a>
      <aside className="sidebar">
        <Brand />
        <div className="workspace-label">พื้นที่ทำงานเจ้าหน้าที่</div>
        <nav aria-label="เมนูหลัก">
          <a
            className={route === '/cases' ? 'nav-item active' : 'nav-item'}
            href="#/cases"
          >
            <span aria-hidden="true">▤</span> รายการเคส
          </a>
          <a
            className={route === '/cases/new' ? 'nav-item active' : 'nav-item'}
            href="#/cases/new"
          >
            <span aria-hidden="true">＋</span> บันทึกข้อมูลใหม่
          </a>
          <a
            className={route === '/guide' ? 'nav-item active' : 'nav-item'}
            href="#/guide"
          >
            <span aria-hidden="true">◇</span> เกณฑ์และแนวทาง
          </a>
        </nav>
        <div className="sidebar-note">
          <span className="dot" /> รุ่นทดลองภายใน
          <p>
            AI ช่วยเสนอ
            <br />
            เจ้าหน้าที่ตรวจและยืนยัน
          </p>
        </div>
        <div className="user-card">
          <span className="avatar">{user?.name.slice(0, 1)}</span>
          <div>
            <strong>{user?.name}</strong>
            <small>เจ้าหน้าที่คัดกรอง</small>
          </div>
          <button
            className="icon-button"
            title="ออกจากระบบ"
            aria-label="ออกจากระบบ"
            onClick={() =>
              void logout().catch((e) => setError(errorMessage(e)))
            }
          >
            ↪
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div>
            งานบ่มเพาะธุรกิจ <span>/</span> <strong>Scouting Platform</strong>
          </div>
          <span className="environment-tag">NU SEED · มหาวิทยาลัยนเรศวร</span>
          <button
            className="mobile-logout text-button"
            onClick={() =>
              void logout().catch((e) => setError(errorMessage(e)))
            }
          >
            ออกจากระบบ ↪
          </button>
        </header>
        {error && (
          <div role="alert" className="notice error layout-error">
            {error}
          </div>
        )}
        <main id="main" className="page-content">
          {children}
        </main>
        <footer>
          NU SEED Scouting{' '}
          <span>
            ข้อมูลภายใน · ผลวิเคราะห์ต้องผ่านการตรวจยืนยันโดยเจ้าหน้าที่
          </span>
        </footer>
      </div>
    </div>
  );
}
