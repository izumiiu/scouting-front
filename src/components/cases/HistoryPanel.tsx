import { useState } from 'react';
import type { CaseDetail, Catalog, AuditEvent } from '../../types';
import { api, errorMessage } from '../../lib/api';
import { ErrorNotice } from '../common/Feedback';
import { StatusBadge } from '../common/StatusBadge';
export function HistoryPanel({
  detail,
  catalog,
}: {
  detail: CaseDetail;
  catalog: Catalog;
}) {
  const [events, setEvents] = useState<AuditEvent[]>(detail.events),
    [cursor, setCursor] = useState<string | null>(
      detail.historyHasMore ? (detail.events.at(-1)?._id ?? null) : null,
    ),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const more = async () => {
    setBusy(true);
    try {
      const x = await api<{ events: AuditEvent[]; nextCursor: string | null }>(
        `/cases/${detail.caseRecord._id}/history?cursor=${cursor}`,
      );
      setEvents((prev) => [...prev, ...x.events]);
      setCursor(x.nextCursor);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="history-layout">
      <section className="card">
        <div className="section-heading">
          <h2>ผลยืนยันของเจ้าหน้าที่</h2>
          <p className="muted">ประวัติคำยืนยันยังคงอยู่เมื่อข้อมูลเปลี่ยน</p>
        </div>
        {detail.reviews.length === 0 ? (
          <div className="empty-state compact">
            <p>ยังไม่มีคำยืนยัน</p>
          </div>
        ) : (
          detail.reviews.map((review) => (
            <article className="review-record" key={review._id}>
              <div className="inline-heading">
                <strong>
                  {review.destination
                    ? catalog.programs.find(
                        (p) => p.code === review.destination,
                      )?.label
                    : 'รอข้อมูล / ยังไม่ส่งต่อ'}
                </strong>
                <small>
                  ข้อมูลรุ่น {review.inputRevision}
                  {review.inputRevision !== detail.caseRecord.revision
                    ? ' · ต้องทบทวน'
                    : ''}
                </small>
              </div>
              <p>{review.notes}</p>
              <div className="tag-list">
                {review.expertAreas.map((area) => (
                  <span className="badge status-draft" key={area}>
                    {catalog.experts.find((e) => e.code === area)?.label ??
                      area}
                  </span>
                ))}
              </div>
              <small className="muted">
                {review.reviewerName} ·{' '}
                {new Date(review.createdAt).toLocaleString('th-TH')}
              </small>
            </article>
          ))
        )}
        <div className="section-heading">
          <h3>การวิเคราะห์ที่ผ่านมา</h3>
        </div>
        {detail.analyses.map((run) => (
          <details className="history-run" key={run._id}>
            <summary>
              <StatusBadge status={run.status} />
              <span>
                ข้อมูลรุ่น {run.inputRevision} ·{' '}
                {new Date(run.createdAt).toLocaleString('th-TH')}
              </span>
            </summary>
            <p>{run.result?.summary ?? run.error ?? 'กำลังรอผล'}</p>
            {run.result && (
              <>
                <h4>โครงการที่ AI เสนอ</h4>
                {run.result.programRecommendations.map((p) => (
                  <p key={p.program}>
                    {p.program}: {p.reason}
                  </p>
                ))}
                <h4>สาขาที่ AI เสนอ</h4>
                {run.result.expertRecommendations.map((p) => (
                  <p key={p.area}>
                    {catalog.experts.find((e) => e.code === p.area)?.label}:{' '}
                    {p.reason}
                  </p>
                ))}
              </>
            )}
            <small className="muted">
              {run.ruleVersion} · {run.expertVersion} · {run.model}
            </small>
          </details>
        ))}
      </section>
      <section className="card">
        <div className="section-heading">
          <h2>กิจกรรมของเคส</h2>
          <p className="muted">ลำดับเหตุการณ์ที่ระบบบันทึก</p>
        </div>
        <ErrorNotice message={error} />
        <ol className="timeline">
          {events.map((event) => (
            <li key={event._id}>
              <span className="timeline-dot" />
              <strong>{event.action}</strong>
              <p>
                {event.actorName} · ข้อมูลรุ่น {event.revision}
              </p>
              <small>{new Date(event.createdAt).toLocaleString('th-TH')}</small>
            </li>
          ))}
        </ol>
        {cursor && (
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => void more()}
          >
            {busy ? 'กำลังโหลด…' : 'โหลดกิจกรรมก่อนหน้า'}
          </button>
        )}
      </section>
    </div>
  );
}
