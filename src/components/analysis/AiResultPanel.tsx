import type { Analysis, Catalog } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Loading } from '../common/Feedback';
export function AiResultPanel({
  run,
  catalog,
  revision,
}: {
  run: Analysis | undefined;
  catalog: Catalog;
  revision: number;
}) {
  const stale =
    run &&
    (run.inputRevision !== revision ||
      run.ruleVersion !== catalog.ruleVersion ||
      run.expertVersion !== catalog.expertVersion);
  return (
    <section className="card ai-panel">
      <div className="section-heading inline-heading">
        <div>
          <div className="section-kicker">AI ASSISTED · HUMAN REVIEWED</div>
          <h2>ข้อเสนอจาก AI</h2>
        </div>
        {run && <StatusBadge status={run.status} />}
      </div>
      {stale && (
        <div className="notice warning">
          ผลนี้อ้างข้อมูล/เกณฑ์รุ่นเก่า ต้องวิเคราะห์ใหม่ก่อนใช้ยืนยัน
        </div>
      )}
      {!run ? (
        <div className="empty-state compact">
          <span aria-hidden="true">✧</span>
          <h3>พร้อมให้ AI ช่วยมองแนวทาง</h3>
          <p>บันทึกข้อมูลและขอบเขตการอนุญาต แล้วกด “ให้ AI วิเคราะห์”</p>
        </div>
      ) : run.status === 'queued' || run.status === 'running' ? (
        <Loading
          label={
            run.status === 'queued'
              ? 'รอคิววิเคราะห์…'
              : 'AI กำลังวิเคราะห์โครงการและด้านผู้เชี่ยวชาญ…'
          }
        />
      ) : run.status === 'failed' ? (
        <div className="notice error" role="alert">
          {run.error ?? 'วิเคราะห์ไม่สำเร็จ'}
        </div>
      ) : run.result ? (
        <>
          <p className="ai-summary">{run.result.summary}</p>
          <div className="results-columns">
            <div>
              <h3>โครงการที่แนะนำ</h3>
              {run.result.programRecommendations.length === 0 ? (
                <p className="muted">ยังไม่มีข้อเสนอที่มีหลักฐานเพียงพอ</p>
              ) : (
                run.result.programRecommendations.map((item) => (
                  <article className="suggestion" key={item.program}>
                    <span className="suggestion-icon" aria-hidden="true">
                      ◇
                    </span>
                    <div>
                      <h4>
                        {catalog.programs.find((p) => p.code === item.program)
                          ?.label ?? item.program}
                      </h4>
                      <p>{item.reason}</p>
                      <small>อ้างอิง: {item.evidenceRefs.join(', ')}</small>
                    </div>
                  </article>
                ))
              )}
            </div>
            <div>
              <h3>สาขาผู้เชี่ยวชาญที่ควรปรึกษา</h3>
              {run.result.expertRecommendations.length === 0 ? (
                <p className="muted">ยังระบุสาขาไม่ได้จากข้อมูลที่มี</p>
              ) : (
                run.result.expertRecommendations.map((item) => (
                  <article className="suggestion expert" key={item.area}>
                    <span className="suggestion-icon" aria-hidden="true">
                      ✧
                    </span>
                    <div>
                      <h4>
                        {catalog.experts.find((e) => e.code === item.area)
                          ?.label ?? item.area}
                      </h4>
                      <strong>{item.need}</strong>
                      <p>{item.reason}</p>
                      <small>อ้างอิง: {item.evidenceRefs.join(', ')}</small>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
          {run.result.missingInformation.length > 0 && (
            <div className="missing-info">
              <h3>ข้อมูลที่ควรถามเพิ่มเติม</h3>
              <ul>
                {run.result.missingInformation.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="analysis-meta">
            ข้อมูลรุ่น {run.inputRevision} · OpenAI / {run.model} ·{' '}
            {new Date(run.createdAt).toLocaleString('th-TH')}
          </div>
        </>
      ) : null}
      <div className="panel-footnote">
        ผลเบื้องต้นสำหรับประกอบการตรวจของเจ้าหน้าที่
        ไม่ใช่การรับเข้าหรืออนุมัติทุน
      </div>
    </section>
  );
}
