import type { AiResult, Catalog } from '../types/index.ts';
import { aiFollowUpText, conditionFollowUps, readableAnalysisText, type AnalysisContext } from './fieldPresentation.ts';

type GroupKey = 'TED' | 'FUNDING' | 'UBI' | 'TBI' | 'DEVELOPMENT' | 'UNASSIGNED';
type Source = 'AI' | 'RULE';
export interface FollowUpItem {
  question: string;
  sources: Source[];
  programs: string[];
  conditions: string[];
}
export interface FollowUpGroup {
  key: GroupKey;
  title: string;
  description: string;
  items: FollowUpItem[];
}
const groupDefinitions: Omit<FollowUpGroup, 'items'>[] = [
  { key: 'TED', title: 'ข้อมูลเพิ่มเติมสำหรับ TED', description: 'ช่วยพิจารณา IDEA / POC เบื้องต้น ให้เจ้าหน้าที่ตรวจความเกี่ยวข้องของแต่ละข้อ' },
  { key: 'FUNDING', title: 'เงื่อนไขเงินสมทบ TED POC', description: 'ตรวจเรื่องเงินสมทบแยกจากการจำแนก IDEA / POC ยังไม่ใช่การอนุมัติทุน' },
  { key: 'DEVELOPMENT', title: 'ข้อมูลด้านธุรกิจและผู้เชี่ยวชาญ', description: 'ข้อเสนอเพื่อพัฒนาหรือตรวจหลักฐานทางธุรกิจ ไม่ใช่ข้อบังคับร่วมของทุกโครงการ' },
  { key: 'UBI', title: 'ข้อมูลสำหรับ UBI', description: 'ใช้เมื่อพิจารณา UBI Pre-incubation หรือ UBI Startup ตามป้ายกำกับแต่ละข้อ' },
  { key: 'TBI', title: 'ข้อมูลสำหรับ TBI', description: 'ใช้ตรวจเส้นทาง TBI ไม่ใช่เงื่อนไขบังคับของ TED' },
  { key: 'UNASSIGNED', title: 'คำถามจาก AI ที่ยังไม่ระบุโครงการ', description: 'ผลรอบนี้ยังไม่มีโครงการกำกับคำถาม ให้เจ้าหน้าที่ตรวจว่าเกี่ยวข้องกับโครงการใด โดยไม่ถือว่าทุกข้อเป็นข้อบังคับของ TED' },
];
function scopeGroup(scope: string): { key: GroupKey; programs: string[] } {
  switch (scope) {
    case 'TED': return { key: 'TED', programs: ['TED_IDEA', 'TED_POC'] };
    case 'TED_IDEA': case 'TED_POC': return { key: 'TED', programs: [scope] };
    case 'TED_POC_FUNDING': return { key: 'FUNDING', programs: ['TED_POC'] };
    case 'UBI_PRE': case 'UBI_STARTUP': return { key: 'UBI', programs: [scope] };
    case 'TBI': return { key: 'TBI', programs: [scope] };
    case 'DEVELOPMENT': return { key: 'DEVELOPMENT', programs: [] };
    default: return { key: 'UNASSIGNED', programs: [] };
  }
}
export function buildFollowUpGroups(
  result: AiResult, catalog: Pick<Catalog, 'fields'>, context?: AnalysisContext,
): FollowUpGroup[] {
  const groups = groupDefinitions.map((group) => ({ ...group, items: [] as FollowUpItem[] }));
  function add(key: GroupKey, question: string, source: Source, programs: string[], condition?: string) {
    if (!question.trim()) return;
    const items = groups.find((group) => group.key === key)!.items;
    let item = items.find((entry) => entry.question === question);
    if (!item) { item = { question, sources: [], programs: [], conditions: [] }; items.push(item); }
    if (!item.sources.includes(source)) item.sources.push(source);
    for (const code of programs) if (!item.programs.includes(code)) item.programs.push(code);
    if (condition && !item.conditions.includes(condition)) item.conditions.push(condition);
  }
  const covered = new Set<string>();
  for (const item of result.followUps ?? []) {
    covered.add(item.question);
    const group = scopeGroup(item.scope);
    for (const text of aiFollowUpText([item.question], catalog, context)) add(group.key, text, 'AI', group.programs);
  }
  // Old AI prose has no reliable route metadata. Never guess from keywords such
  // as age/MVP/IP; preserve it in a clearly unassigned group instead.
  for (const text of aiFollowUpText(result.missingInformation.filter((item) => !covered.has(item)), catalog, context)) {
    add('UNASSIGNED', text, 'AI', []);
  }
  if (context) for (const program of context.eligibility) {
    if (program.assessmentMode === 'qualitative' || program.outcome !== 'unknown') continue;
    const group = scopeGroup(program.program);
    for (const condition of program.conditions) {
      for (const text of conditionFollowUps(condition, catalog, context.answers)) {
        add(group.key, text, 'RULE', group.programs, readableAnalysisText(condition.label, catalog));
      }
    }
  }
  return groups.filter((group) => group.items.length > 0);
}
