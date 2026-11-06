import type { AiResult, Catalog } from '../../types';
import type { AnalysisContext } from '../../lib/fieldPresentation';
import { buildFollowUpGroups } from '../../lib/followUpPresentation';

export function FollowUpPanel({ result, catalog, context, historical = false }: {
  result: AiResult; catalog: Catalog; context?: AnalysisContext; historical?: boolean;
}) {
  // Historical results must not be reinterpreted using today's answers/rules.
  const groups = buildFollowUpGroups(result, catalog, historical ? undefined : context);
  if (!groups.length) return null;
  return (
    <section className="missing-info follow-up-panel" aria-label="ข้อมูลเพิ่มเติมแยกตามโครงการและที่มา">
      <h3>{historical ? 'ข้อมูลที่ AI เสนอให้ตรวจเพิ่ม ณ รอบวิเคราะห์นั้น' : 'ข้อมูลเพิ่มเติม แยกตามโครงการและที่มา'}</h3>
      <p className="follow-up-intro">เลือกอ่านตามโครงการที่กำลังพิจารณา รายการนี้ไม่ใช่ข้อบังคับร่วมที่ต้องครบทุกข้อก่อนส่งต่อทุกโครงการ</p>
      {groups.map((group) => (
        <section className="follow-up-group" key={group.key} aria-label={group.title}>
          <h4>{group.title}</h4>
          <p className="follow-up-description">{group.description}</p>
          <ul>
            {group.items.map((item) => (
              <li key={item.question}>
                <p>{item.question}</p>
                <div className="follow-up-tags">
                  {item.sources.map((source) => <span className="follow-up-tag" key={source}>{source === 'AI' ? 'AI แนะนำให้ตรวจเพิ่ม' : 'จากผลตรวจตามกฎ'}</span>)}
                  {item.programs.map((code) => <span className="follow-up-tag" key={code}>{catalog.programs.find((program) => program.code === code)?.label ?? 'โครงการที่เกี่ยวข้อง'}</span>)}
                </div>
                {item.conditions.length > 0 && <small className="follow-up-condition">หัวข้อที่ตรวจ: {item.conditions.join(' · ')}</small>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </section>
  );
}
