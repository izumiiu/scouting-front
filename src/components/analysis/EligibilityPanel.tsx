import type { Eligibility } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
export function EligibilityPanel({ results }: { results: Eligibility[] }) {
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
                    <p>{condition.label}</p>
                    <small className="muted">
                      อ้างอิง {condition.evidenceRefs.join(', ')}
                    </small>
                    {condition.note && (
                      <small className="condition-note">{condition.note}</small>
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
