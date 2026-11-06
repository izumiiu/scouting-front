import type { Catalog, Eligibility, Value } from '../types/index.ts';

type Answers = Record<string, Value>;
type Fields = Pick<Catalog, 'fields'>;
type Condition = Eligibility['conditions'][number];
export interface AnalysisContext {
  answers: Answers;
  eligibility: Eligibility[];
}

const displayNames: Record<string, string> = {
  A1: 'ชื่อกิจการหรือโครงการ',
  A2: 'จังหวัดที่ตั้งกิจการ',
  A3: 'สถานะผู้สมัคร เช่น นิสิต ศิษย์เก่า หรือผู้ประกอบการ',
  institution: 'สถาบันการศึกษา',
  A4: 'อายุผู้สมัคร ณ วันที่อ้างอิง',
  A5: 'จำนวนสมาชิกทีม รวมผู้สมัคร',
  A6: 'สถานะการจดทะเบียนกิจการ',
  studentShares: 'สัดส่วนหุ้นของนิสิตหรือศิษย์เก่าที่เข้าเงื่อนไข (%)',
  thaiShares: 'สัดส่วนหุ้นที่ถือโดยบุคคลสัญชาติไทย (%)',
  authorizedDirector: 'การเป็นกรรมการผู้มีอำนาจลงนาม',
  nationalityThai: 'ข้อมูลสัญชาติของผู้สมัคร',
  preInMonths: 'ระยะเวลาที่เข้าร่วมการบ่มเพาะขั้นเตรียมความพร้อม (เดือน)',
  previousNetwork: 'ประวัติการบ่มเพาะในเครือข่ายตามนิยาม TBI',
  C2: 'ขั้นการพัฒนาผลิตภัณฑ์หรือต้นแบบ',
  trlNumeric: 'ระดับความพร้อมของเทคโนโลยี (TRL 1–9)',
  trlVerified: 'การตรวจยืนยันหลักฐานระดับความพร้อมของเทคโนโลยีโดยเจ้าหน้าที่',
  mvpVerified: 'การตรวจยืนยันหลักฐานต้นแบบหรือการทดสอบตลาดโดยเจ้าหน้าที่',
  bandsVerified: 'การตรวจยืนยันประเภทและระดับบริบทโดยเจ้าหน้าที่',
};
const verificationFields = new Set(['trlVerified', 'mvpVerified', 'bandsVerified']);

export function fieldLabel(ref: string, catalog: Fields): string {
  const label = displayNames[ref] ?? catalog.fields.find((f) => f.id === ref)?.label;
  return label?.replace(/\s*\([A-H]\d+\)/g, '') ?? 'ข้อมูลจากแบบฟอร์มที่ยังไม่ระบุชื่อ';
}

export function referenceLabels(refs: string[], catalog: Fields): string[] {
  return [...new Set(refs.map((ref) => fieldLabel(ref, catalog)))];
}

// Translate known identifiers inside older AI prose without replacing parts of words.
export function readableAnalysisText(text: string, catalog: Fields): string {
  const keys = [...new Set([...Object.keys(displayNames), ...catalog.fields.map((f) => f.id)])]
    .sort((a, b) => b.length - a.length)
    .map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return text.replace(
    new RegExp(`(?<![A-Za-z0-9_])(?:${keys.join('|')})(?![A-Za-z0-9_])`, 'g'),
    (ref) => fieldLabel(ref, catalog),
  );
}

function hasValue(value: Value | undefined): boolean {
  return value !== null && value !== undefined &&
    !(typeof value === 'string' && value.trim() === '') &&
    !(Array.isArray(value) && value.length === 0);
}

function applicable(ref: string, answers: Answers): boolean {
  if (ref === 'graduatedOn' && answers.A3 !== 'ศิษย์เก่า') return false;
  if (ref === 'preInMonths' && ['นิสิต', 'ศิษย์เก่า', 'บุคลากร/นักวิจัย'].includes(String(answers.A3))) return false;
  if (['registeredOn', 'thaiShares', 'studentShares', 'authorizedDirector'].includes(ref) &&
    ['ยังไม่จดทะเบียน', 'ทะเบียนพาณิชย์'].includes(String(answers.A6))) return false;
  if (ref === 'A4' && hasValue(answers.bornOn)) return false;
  if (ref === 'bornOn' && typeof answers.A4 === 'number') return false;
  return true;
}

function fieldFollowUp(ref: string, catalog: Fields, answers?: Answers): string[] {
  if (answers && !applicable(ref, answers)) return [];
  if (verificationFields.has(ref)) {
    if (!answers) return [`กรุณาตรวจ${fieldLabel(ref, catalog)} ตามผลวิเคราะห์รอบนี้`];
    if (answers?.[ref] === 'ใช่') return [];
    if (ref === 'trlVerified') return [
      answers && hasValue(answers.trlNumeric)
        ? 'ระบุระดับความพร้อมของเทคโนโลยีแล้ว แต่ยังต้องให้เจ้าหน้าที่ตรวจยืนยันหลักฐาน'
        : 'ต้องให้เจ้าหน้าที่ตรวจยืนยันหลักฐานระดับความพร้อมของเทคโนโลยี',
    ];
    if (ref === 'mvpVerified') return ['ต้องให้เจ้าหน้าที่ตรวจยืนยันหลักฐานต้นแบบหรือการทดสอบตลาด'];
    return ['ต้องให้เจ้าหน้าที่ตรวจยืนยันประเภทและระดับบริบทของธุรกิจ'];
  }
  if (answers && hasValue(answers[ref])) return [];
  const name = fieldLabel(ref, catalog);
  if (!answers) return [`กรุณาตรวจข้อมูลเรื่อง ${name} ตามผลวิเคราะห์รอบนี้`];
  if (ref === 'graduatedOn') return ['ยังไม่ระบุวันสำเร็จการศึกษา สำหรับตรวจเงื่อนไขศิษย์เก่าจบไม่เกิน 5 ปี'];
  return [`ยังไม่ระบุ${name}`];
}

export function conditionFollowUps(condition: Condition, catalog: Fields, answers: Answers): string[] {
  if (condition.outcome !== 'unknown') return [];
  let refs = condition.evidenceRefs;
  // These fields are alternative paths, not a checklist requiring every reference.
  if (condition.id === 'age') {
    if (!hasValue(answers.bornOn) && typeof answers.A4 !== 'number') {
      return ['ยังไม่ระบุวันเกิดหรืออายุผู้สมัคร ณ วันที่อ้างอิง (ระบุอย่างใดอย่างหนึ่ง)'];
    }
    return ['กรุณาตรวจวันเกิดหรืออายุให้ถูกต้องตามวันที่อ้างอิง'];
  }
  if (condition.id === 'ubi-membership') {
    refs = !hasValue(answers.A3) ? ['A3'] :
      answers.A3 === 'บุคลากร/นักวิจัย' ? [] :
      ['นิสิต', 'ศิษย์เก่า'].includes(String(answers.A3))
        ? ['institution', ...(answers.A3 === 'ศิษย์เก่า' ? ['graduatedOn'] : [])]
        : ['preInMonths'];
  }
  if (condition.id === 'education') {
    refs = !hasValue(answers.A3) ? ['A3'] : answers.A3 === 'ศิษย์เก่า' ? ['graduatedOn'] : [];
  }
  const questions = [...new Set(refs.flatMap((ref) => fieldFollowUp(ref, catalog, answers)))];
  if (questions.length) return questions;
  return [condition.note?.includes('เกณฑ์')
    ? 'มีข้อมูลที่ใช้พิจารณาแล้ว แต่ยังต้องให้ผู้รับผิดชอบยืนยันเกณฑ์หรือเส้นทางที่ใช้'
    : 'มีข้อมูลที่ใช้พิจารณาแล้ว กรุณาตรวจความถูกต้องและหลักฐานของเงื่อนไขนี้'];
}

function codeList(text: string, catalog: Fields): string[] | null {
  const tokens = text.replace(/[`'"]/g, '').replaceAll('[', '').replaceAll(']', '')
    .trim().split(/[\s,;/]+/).filter(Boolean);
  const known = new Set([...Object.keys(displayNames), ...catalog.fields.map((f) => f.id)]);
  return tokens.length && tokens.every((token) => known.has(token) ||
    /^(?:[A-H]\d+|[a-z]+(?:[A-Z][a-zA-Z]*)+)$/.test(token)) ? tokens : null;
}

export function missingInformationText(
  items: string[], catalog: Fields, context?: AnalysisContext,
): string[] {
  const questions = items.flatMap((item) => {
    const refs = codeList(item, catalog);
    return refs ? refs.flatMap((ref) => {
      if (context) {
        const uses = context.eligibility.filter((program) =>
          program.conditions.some((condition) => condition.evidenceRefs.includes(ref)));
        if (uses.length && !uses.some((program) => program.outcome === 'unknown' &&
          program.conditions.some((condition) => condition.outcome === 'unknown' &&
            condition.evidenceRefs.includes(ref)))) return [];
      }
      return fieldFollowUp(ref, catalog, context?.answers);
    })
      : [readableAnalysisText(item, catalog)];
  });
  if (context) {
    for (const program of context.eligibility) {
      // A failed route does not create new requests for its other prerequisites.
      if (program.outcome !== 'unknown') continue;
      for (const condition of program.conditions) {
        questions.push(...conditionFollowUps(condition, catalog, context.answers));
      }
    }
  }
  return [...new Set(questions)];
}
