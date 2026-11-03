import { useEffect, useState } from 'react';
import type { CaseRecord } from '../types';
import { api, errorMessage } from '../lib/api';
import { ErrorNotice, Loading } from '../components/common/Feedback';
import { StatusBadge } from '../components/common/StatusBadge';
export function CaseListPage() {
  const [items, setItems] = useState<CaseRecord[]>([]),
    [q, setQ] = useState(''),
    [search, setSearch] = useState(''),
    [cursor, setCursor] = useState<string | null>(null),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true),
    [moreBusy, setMoreBusy] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSearch(q.trim()), 300);
    return () => clearTimeout(timer);
  }, [q]);
  useEffect(() => {
    const controller = new AbortController();
    api<{ items: CaseRecord[]; nextCursor: string | null }>(
      `/cases?q=${encodeURIComponent(search)}`,
      { signal: controller.signal },
    )
      .then((x) => {
        setItems(x.items);
        setCursor(x.nextCursor);
        setError('');
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(errorMessage(e));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [search]);
  const more = async () => {
    setMoreBusy(true);
    try {
      const x = await api<{ items: CaseRecord[]; nextCursor: string | null }>(
        `/cases?q=${encodeURIComponent(search)}&cursor=${cursor}`,
      );
      setItems((prev) => [...prev, ...x.items]);
      setCursor(x.nextCursor);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setMoreBusy(false);
    }
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="section-kicker">SCOUTING WORKSPACE</div>
          <h1>รายการเคสผู้ประกอบการ</h1>
          <p>เริ่มจากข้อมูลที่ดี สู่คำแนะนำที่เหมาะกับแต่ละธุรกิจ</p>
        </div>
        <a className="button primary" href="#/cases/new">
          ＋ บันทึกเคสใหม่
        </a>
      </div>
      <div className="workflow-strip">
        <div>
          <span>01</span>
          <strong>บันทึกข้อมูล</strong>
          <small>จากแบบฟอร์มที่ได้รับ</small>
        </div>
        <i>→</i>
        <div>
          <span>02</span>
          <strong>AI ช่วยวิเคราะห์</strong>
          <small>โครงการและสาขาผู้เชี่ยวชาญ</small>
        </div>
        <i>→</i>
        <div>
          <span>03</span>
          <strong>เจ้าหน้าที่ตรวจยืนยัน</strong>
          <small>เลือกเส้นทางส่งต่อ</small>
        </div>
      </div>
      <ErrorNotice message={error} />
      <section className="card">
        <div className="card-toolbar">
          <div>
            <h2>
              กล่องข้อมูลคัดกรอง{' '}
              <span className="count-chip">{items.length}</span>
            </h2>
            <p className="muted">ข้อมูลในพื้นที่ทำงานของหน่วยงาน</p>
          </div>
          <label className="search-field">
            <span className="sr-only">ค้นหาด้วยชื่อขึ้นต้นหรือรหัสเคส</span>
            <span aria-hidden="true">⌕</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหาชื่อขึ้นต้น หรือรหัสเคส…"
            />
          </label>
        </div>
        {loading ? (
          <Loading />
        ) : items.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">
              ▤
            </span>
            <h3>{q ? 'ไม่พบเคสที่ค้นหา' : 'เริ่มต้นคัดกรองผู้ประกอบการ'}</h3>
            <p>
              {q
                ? 'ลองค้นหาจากชื่อขึ้นต้นหรือรหัสเคส'
                : 'บันทึกข้อมูลจากแบบฟอร์ม แล้วให้ AI ช่วยเสนอแนวทาง'}
            </p>
            {!q && (
              <a className="button secondary" href="#/cases/new">
                บันทึกเคสแรก →
              </a>
            )}
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>รหัส / ผู้ประกอบการ</th>
                  <th>ช่องทางรับข้อมูล</th>
                  <th>สถานะ</th>
                  <th>อัปเดตล่าสุด</th>
                  <th>
                    <span className="sr-only">เปิดเคส</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <small className="case-code">{item.code}</small>
                      <strong>{item.input.title}</strong>
                    </td>
                    <td>{item.input.sourceChannel || 'ไม่ระบุ'}</td>
                    <td>
                      <StatusBadge
                        status={
                          item.activeAnalysisId
                            ? 'queued'
                            : item.latestAnalysisId &&
                                item.latestAnalysisId ===
                                  item.lastReviewAnalysisId
                              ? 'reviewed'
                              : item.latestAnalysisId
                                ? 'succeeded'
                                : 'draft'
                        }
                      />
                    </td>
                    <td className="nowrap">
                      {new Date(item.updatedAt).toLocaleDateString('th-TH')}
                    </td>
                    <td>
                      <a
                        className="button small secondary"
                        href={`#/cases/${item._id}`}
                      >
                        เปิดเคส ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {cursor && (
          <div className="load-more">
            <button
              className="button secondary"
              disabled={moreBusy}
              onClick={() => void more()}
            >
              {moreBusy ? 'กำลังโหลด…' : 'โหลดเพิ่มเติม'}
            </button>
          </div>
        )}
      </section>
      <p className="page-note">
        ผล AI เป็นข้อเสนอเบื้องต้น การส่งต่อยังต้องผ่านการตรวจของเจ้าหน้าที่
        และไม่เท่ากับการอนุมัติทุน
      </p>
    </>
  );
}
