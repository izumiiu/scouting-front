import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../lib/api';
import { Brand } from '../components/layout/AppLayout';
import { ErrorNotice } from '../components/common/Feedback';
export function LoginPage() {
  const { login, error: sessionError, retry } = useAuth(),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="login-page">
      <section className="login-story">
        <Brand />
        <span className="eyebrow">FROM POTENTIAL TO POSSIBILITY</span>
        <h1>
          ค้นหาศักยภาพ
          <br />
          ต่อยอดผู้ประกอบการ<span>.</span>
        </h1>
        <p>
          พื้นที่ทำงานสำหรับบันทึกข้อมูล วิเคราะห์โครงการ
          <br />
          และค้นหาด้านผู้เชี่ยวชาญที่เหมาะกับแต่ละธุรกิจ
        </p>
        <div className="login-steps">
          <span>01 บันทึก</span>
          <span>02 วิเคราะห์</span>
          <span>03 ตรวจยืนยัน</span>
        </div>
        <div className="story-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <span className="seed-shape" />
        </div>
      </section>
      <section className="login-form-panel">
        <form className="login-form" onSubmit={(e) => void submit(e)}>
          <div className="section-kicker">OFFICER WORKSPACE</div>
          <h2>เข้าสู่ระบบเจ้าหน้าที่</h2>
          <p className="muted">ใช้บัญชีที่หน่วยงานจัดเตรียมไว้สำหรับคุณ</p>
          <ErrorNotice message={error || sessionError} />
          {sessionError && (
            <button type="button" className="text-button" onClick={retry}>
              ตรวจการเชื่อมต่ออีกครั้ง
            </button>
          )}
          <label>
            อีเมล
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@university.ac.th"
            />
          </label>
          <label>
            รหัสผ่าน
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="button primary full" disabled={busy}>
            {busy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่พื้นที่ทำงาน →'}
          </button>
          <p className="login-footnote">
            สำหรับผู้ได้รับสิทธิ์ภายในหน่วยงาน
            <br />
            กรุณาติดต่อผู้ดูแลหากยังไม่มีบัญชี
          </p>
        </form>
      </section>
    </div>
  );
}
