import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Analysis, CaseDetail, Catalog } from '../../types';
import { api, mutation, errorMessage } from '../../lib/api';
import { ErrorNotice } from '../common/Feedback';
export function HumanReviewForm({
  detail,
  run,
  catalog,
  onConfirmed,
}: {
  detail: CaseDetail;
  run: Analysis;
  catalog: Catalog;
  onConfirmed: () => Promise<void>;
}) {
  const [destination, setDestination] = useState(''),
    [areas, setAreas] = useState<string[]>(
      run.result?.expertRecommendations.map((e) => e.area) ?? [],
    ),
    [notes, setNotes] = useState(''),
    [checked, setChecked] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const request = useRef({ body: '', key: '' });
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const body = {
      revision: detail.caseRecord.revision,
      decisionVersion: detail.caseRecord.decisionVersion,
      analysisId: run._id,
      destination: destination || null,
      expertAreas: areas,
      notes,
    };
    const json = JSON.stringify(body);
    if (request.current.body !== json)
      request.current = { body: json, key: crypto.randomUUID() };
    try {
      await api(`/cases/${detail.caseRecord._id}/reviews`, {
        ...mutation('POST', body),
        headers: { 'Idempotency-Key': request.current.key },
      });
      await onConfirmed();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="card human-review">
      <div className="section-heading">
        <div className="section-kicker">OFFICER DECISION</div>
        <h2>เจ้าหน้าที่ตรวจและยืนยัน</h2>
        <p className="muted">
          ผลส่วนนี้เก็บแยกจาก AI และยังไม่ใช่การรับเรื่องโดย PM
        </p>
      </div>
      <form onSubmit={(e) => void submit(e)}>
        <ErrorNotice message={error} />
        <label className="field">
          โครงการที่จะส่งต่อ
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          >
            <option value="">ยังไม่ส่งต่อ / รอข้อมูลเพิ่มเติม</option>
            {detail.eligibility.map((p) => (
              <option
                key={p.program}
                value={p.program}
                disabled={p.outcome !== 'pass'}
              >
                {p.label}
                {p.outcome === 'pass' ? '' : ' — ยังไม่ผ่านหรือข้อมูลไม่พอ'}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="field">
          <legend>สาขาผู้เชี่ยวชาญที่เจ้าหน้าที่ยืนยัน</legend>
          <div className="expert-checkboxes">
            {catalog.experts.map((expert) => (
              <label key={expert.code}>
                <input
                  type="checkbox"
                  checked={areas.includes(expert.code)}
                  onChange={(e) =>
                    setAreas((previous) =>
                      e.target.checked
                        ? [...previous, expert.code]
                        : previous.filter((x) => x !== expert.code),
                    )
                  }
                />
                {expert.label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="field">
          ข้อสรุปและเหตุผลที่ตรวจยืนยัน *
          <textarea
            required
            rows={4}
            maxLength={3000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="อธิบายเหตุผล หลักฐานที่ตรวจ และการปรับข้อเสนอ AI หากมี"
          />
        </label>
        <label className="checkbox-line">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          ตรวจข้อมูลและข้อเสนอ AI ของข้อมูลรุ่นนี้แล้ว
        </label>
        <div className="form-actions">
          <span className="muted">
            ยืนยันสาขาได้แม้ยังรอข้อมูลคุณสมบัติโครงการ
          </span>
          <button className="button primary" disabled={!checked || busy}>
            {busy ? 'กำลังบันทึก…' : 'ยืนยันผลตรวจและบันทึกส่งต่อ'}
          </button>
        </div>
      </form>
    </section>
  );
}
