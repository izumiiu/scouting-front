import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { CaseInput, Catalog, Value } from '../../types';
import { DynamicField } from './DynamicField';
import { ErrorNotice } from '../common/Feedback';
import { errorMessage } from '../../lib/api';
export function CaseForm({
  catalog,
  initial,
  onSave,
  onDirtyChange,
}: {
  catalog: Catalog;
  initial: CaseInput;
  onSave: (input: CaseInput) => Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [input, setInput] = useState(initial),
    [section, setSection] = useState('ข้อมูลรับเข้า'),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false);
  const dirty = JSON.stringify(input) !== JSON.stringify(initial);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const groups = useMemo(
    () => [
      'ข้อมูลรับเข้า',
      ...new Set(catalog.fields.map((f) => f.section)),
      'สิทธิ์การใช้ข้อมูล',
    ],
    [catalog],
  );
  const set = (name: keyof CaseInput, value: string | boolean) => {
    onDirtyChange?.(true);
    setInput((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };
  const answer = (id: string, value: Value) => {
    onDirtyChange?.(true);
    setInput((prev) => ({
      ...prev,
      answers: { ...prev.answers, [id]: value },
    }));
    setSaved(false);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSave(input);
      onDirtyChange?.(false);
      setSaved(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={(e) => void submit(e)} className="case-form">
      <div className="form-layout">
        <nav className="form-nav" aria-label="หมวดแบบฟอร์ม">
          {groups.map((group, index) => (
            <button
              type="button"
              key={group}
              className={section === group ? 'selected' : ''}
              onClick={() => setSection(group)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {group}
            </button>
          ))}
        </nav>
        <section className="card form-card">
          <div className="section-heading">
            <h2>{section}</h2>
            <p className="muted">
              บันทึกตามข้อมูลที่ได้รับ ช่องที่ไม่ทราบเว้นว่างได้
            </p>
          </div>
          <ErrorNotice message={error} />
          {saved && (
            <div className="notice success" role="status">
              บันทึกข้อมูลเรียบร้อยแล้ว
            </div>
          )}
          <div className="field-grid">
            {section === 'ข้อมูลรับเข้า' ? (
              <>
                <label className="field wide">
                  ชื่อกิจการ / ชื่อเคส *
                  <input
                    required
                    maxLength={180}
                    value={input.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="ชื่อที่ใช้ค้นหาและอ้างอิงเคส"
                  />
                </label>
                <label className="field">
                  ชื่อผู้ติดต่อ (เก็บภายใน)
                  <input
                    value={input.contactName}
                    maxLength={180}
                    onChange={(e) => set('contactName', e.target.value)}
                  />
                </label>
                <label className="field">
                  โทรศัพท์ / LINE (เก็บภายใน)
                  <input
                    value={input.contactPhone}
                    maxLength={80}
                    onChange={(e) => set('contactPhone', e.target.value)}
                  />
                </label>
                <label className="field">
                  อีเมล (เก็บภายใน)
                  <input
                    type="email"
                    value={input.contactEmail}
                    maxLength={180}
                    onChange={(e) => set('contactEmail', e.target.value)}
                  />
                </label>
                <label className="field">
                  ช่องทางรับแบบฟอร์ม
                  <input
                    value={input.sourceChannel}
                    maxLength={100}
                    onChange={(e) => set('sourceChannel', e.target.value)}
                  />
                </label>
                <label className="field wide">
                  เลขอ้างอิง / ที่มาเอกสาร
                  <input
                    value={input.sourceReference}
                    maxLength={500}
                    onChange={(e) => set('sourceReference', e.target.value)}
                  />
                </label>
                <label className="field">
                  วันที่อ้างอิงคุณสมบัติ *
                  <input
                    type="date"
                    required
                    value={input.referenceDate}
                    onChange={(e) => set('referenceDate', e.target.value)}
                  />
                </label>
                <div className="notice info wide">
                  ชื่อและช่องทางติดต่อแยกเก็บภายใน กรุณาไม่ใส่ชื่อ เบอร์โทร
                  หรือเลขบัตรในช่องคำบรรยายที่จะส่งให้ AI
                </div>
              </>
            ) : section === 'สิทธิ์การใช้ข้อมูล' ? (
              <>
                <div className="notice info wide">
                  บันทึกสถานะและหลักฐานที่เกิดขึ้นจริงจากต้นทาง
                  ส่วนนี้เป็นการถอดข้อมูล ไม่ใช่การกดยินยอมแทนลูกค้า
                </div>
                <label className="field">
                  สถานะอนุญาตจากเอกสารต้นทาง
                  <select
                    value={input.permissionStatus}
                    onChange={(e) => {
                      set('permissionStatus', e.target.value);
                      if (e.target.value !== 'granted')
                        set('allowAiProcessing', false);
                    }}
                  >
                    <option value="unknown">ยังไม่ทราบ</option>
                    <option value="granted">มีการอนุญาตแล้ว</option>
                    <option value="denied">ไม่อนุญาต</option>
                  </select>
                </label>
                <label className="field wide">
                  เลขอ้างอิง / ขอบเขตการอนุญาต
                  <input
                    value={input.permissionReference}
                    maxLength={500}
                    onChange={(e) => set('permissionReference', e.target.value)}
                  />
                </label>
                <label className="checkbox-line wide">
                  <input
                    type="checkbox"
                    checked={input.allowAiProcessing}
                    disabled={input.permissionStatus !== 'granted'}
                    onChange={(e) => set('allowAiProcessing', e.target.checked)}
                  />
                  หลักฐานการอนุญาตครอบคลุมการส่งข้อมูลที่จำเป็นให้บริการ AI
                </label>
              </>
            ) : (
              catalog.fields
                .filter((f) => f.section === section)
                .map((field) => (
                  <DynamicField
                    key={field.id}
                    field={field}
                    value={input.answers[field.id]}
                    onChange={(value) => answer(field.id, value)}
                  />
                ))
            )}
          </div>
          <div className="form-actions">
            <span className="muted">
              ข้อมูลขาดยังบันทึกร่างได้ · วิเคราะห์จะระบุข้อที่ยังสรุปไม่ได้
            </span>
            <button className="button primary" disabled={busy}>
              {busy ? 'กำลังบันทึก…' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </section>
      </div>
    </form>
  );
}
