import type { Catalog, CaseInput, Eligibility } from '../../types';
import { conditionFollowUps, readableAnalysisText } from '../../lib/fieldPresentation';
import { EvidenceReferences } from './EvidenceReferences';
import { StatusBadge } from '../common/StatusBadge';
export function EligibilityPanel({ results, catalog, answers }: {
  results: Eligibility[];
  catalog: Catalog;
  answers: CaseInput['answers'];
}) {
  return (
    <section className="card eligibility-panel">
      <div className="section-heading">
        <div className="section-kicker">DETERMINISTIC ELIGIBILITY</div>
        <h2>ผลตรวจคุณสมบัติตามกฎ</h2>
        <p className="muted">
          แยกผลรายเงื่อนไขจากคำแนะนำ AI · เกณฑ์อ้างอิงยังรอ PM รับรอง
        </p>
      </div>
      <div className="eligibility-grid">
        {results.map((item) => (
          <details className="eligibility-item" key={item.program}>
            <summary>
              <strong>{item.label}</strong>
              <StatusBadge status={item.outcome} />
              <span aria-hidden="true">⌄</span>
            </summary>
            <div className="condition-list">
              {item.conditions.map((condition) => (
                <div className="condition" key={condition.id}>
                  <StatusBadge status={condition.outcome} />
                  <div>
                    <p>{readableAnalysisText(condition.label, catalog)}</p>
                    <EvidenceReferences refs={condition.evidenceRefs} catalog={catalog} />
                    {condition.outcome === 'unknown' && (
                      <div className="condition-follow-up">
                        <strong>สิ่งที่ต้องถามหรือตรวจเพิ่ม</strong>
                        <ul>
                          {conditionFollowUps(condition, catalog, answers).map((question) => (
                            <li key={question}>{question}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {condition.note && (
                      <small className="condition-note">หมายเหตุเกณฑ์: {readableAnalysisText(condition.note, catalog)}</small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
