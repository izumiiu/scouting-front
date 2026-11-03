import type { Catalog, CaseInput, CaseRecord } from '../types';
import { useRef } from 'react';
import { CaseForm } from '../components/cases/CaseForm';
import { emptyInput } from '../lib/caseDefaults';
import { api, mutation } from '../lib/api';
import { navigate } from '../hooks/useRoute';
export function NewCasePage({ catalog }: { catalog: Catalog }) {
  const request = useRef({ body: '', key: '' });
  const save = async (input: CaseInput) => {
    const body = JSON.stringify(input);
    if (request.current.body !== body)
      request.current = { body, key: crypto.randomUUID() };
    const x = await api<{ caseRecord: CaseRecord }>('/cases', {
      ...mutation('POST', input),
      headers: { 'Idempotency-Key': request.current.key },
    });
    navigate(`/cases/${x.caseRecord._id}`);
  };
  return (
    <>
      <a className="back-link" href="#/cases">
        ← กลับรายการเคส
      </a>
      <div className="page-heading">
        <div>
          <div className="section-kicker">NEW SCOUTING CASE</div>
          <h1>บันทึกข้อมูลผู้ประกอบการ</h1>
          <p>ถอดข้อมูลจากแบบฟอร์มที่ได้รับ แล้วบันทึกไว้สำหรับตรวจวิเคราะห์</p>
        </div>
        <span className="badge status-draft">เคสใหม่</span>
      </div>
      <CaseForm catalog={catalog} initial={emptyInput()} onSave={save} />
    </>
  );
}
