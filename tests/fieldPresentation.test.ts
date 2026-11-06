import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import type { Catalog, Eligibility } from '../src/types/index.ts';
import {
  fieldLabel, referenceLabels, readableAnalysisText,
  conditionFollowUps, missingInformationText,
} from '../src/lib/fieldPresentation.ts';

const catalog = { fields: [
  { id: 'province', label: 'จังหวัดที่ตั้งกิจการ (A2)' },
  { id: 'graduatedOn', label: 'วันที่จบการศึกษา' },
  { id: 'bornOn', label: 'วันเกิด' },
  { id: 'registeredOn', label: 'วันที่จดทะเบียนนิติบุคคล' },
  { id: 'B4', label: 'ใครตัดสินใจซื้อ/จ่ายเงิน' },
  { id: 'D1', label: 'ลูกค้าจ่ายจริง จำนวนซื้อซ้ำ และช่องทาง' },
  { id: 'C1', label: 'ผลิตภัณฑ์/บริการหลัก' },
] } as Catalog;
const condition = (id: string, refs: string[], outcome: 'pass' | 'fail' | 'unknown' = 'unknown') => ({
  id, label: 'เงื่อนไขทดสอบ', outcome, evidenceRefs: refs,
});
const route = (conditions: Eligibility['conditions'], outcome: Eligibility['outcome'] = 'unknown'): Eligibility => ({
  program: 'TEST', label: 'โครงการ', outcome, conditions,
});

test('references use Thai labels and remove embedded form codes', () => {
  assert.deepEqual(referenceLabels(['A3', 'province', 'A3'], catalog), [
    'สถานะผู้สมัคร เช่น นิสิต ศิษย์เก่า หรือผู้ประกอบการ', 'จังหวัดที่ตั้งกิจการ',
  ]);
  assert.equal(fieldLabel('retiredField', catalog), 'ข้อมูลจากแบบฟอร์มที่ยังไม่ระบุชื่อ');
});
test('legacy prose replaces identifiers without corrupting words, numbers or nearby codes', () => {
  const text = readableAnalysisText('ถาม A3, graduatedOn และ thaiShares; GMP 2026 A30 myA3', catalog);
  assert.match(text, /วัน.*จบการศึกษา/);
  assert.doesNotMatch(text, /graduatedOn|thaiShares|\bA3\b/);
  assert.match(text, /GMP 2026 A30 myA3/);
});
test('legacy raw code lists become questions instead of visible IDs', () => {
  const items = missingInformationText(['A3', '`institution`, graduatedOn', 'removedField'], catalog);
  assert.equal(items.length, 4);
  assert.doesNotMatch(items.join(' '), /A3|institution|graduatedOn|removedField/);
});
test('only the missing field is requested when other referenced answers exist', () => {
  const questions = conditionFollowUps(condition('ubi-membership', ['A3', 'institution', 'graduatedOn', 'preInMonths']), catalog,
    { A3: 'ศิษย์เก่า', institution: 'มหาวิทยาลัยนเรศวร' });
  assert.equal(questions.length, 1);
  assert.match(questions[0]!, /วันสำเร็จการศึกษา/);
});
test('current students are not asked for graduation date or pre-incubation duration', () => {
  const items = missingInformationText(['graduatedOn', 'preInMonths', 'A3'], catalog, {
    answers: { A3: 'นิสิต' }, eligibility: [],
  });
  assert.deepEqual(items, []);
});
test('unknown applicant status is clarified before requesting an alumni-only date', () => {
  const questions = conditionFollowUps(condition('education', ['A3', 'graduatedOn']), catalog, {});
  assert.equal(questions.length, 1);
  assert.match(questions[0]!, /สถานะผู้สมัคร/);
});
test('provided TRL requests evidence verification without claiming the level is missing', () => {
  const questions = conditionFollowUps(condition('trl-poc', ['trlNumeric', 'trlVerified']), catalog,
    { trlNumeric: 6, trlVerified: 'ไม่ใช่' });
  assert.equal(questions.length, 1);
  assert.match(questions[0]!, /ระบุระดับ.*แล้ว.*ตรวจยืนยันหลักฐาน/);
});
test('confirmed evidence is not requested again', () => {
  assert.deepEqual(missingInformationText(['trlVerified', 'mvpVerified'], catalog, {
    answers: { trlVerified: 'ใช่', mvpVerified: 'ใช่' }, eligibility: [],
  }), []);
});
test('zero and false are answers, not empty inputs', () => {
  assert.deepEqual(missingInformationText(['thaiShares', 'nationalityThai'], catalog, {
    answers: { thaiShares: 0, nationalityThai: false }, eligibility: [],
  }), []);
});
test('birth date and declared age are alternatives rather than two required fields', () => {
  const age = condition('age', ['bornOn', 'A4']);
  assert.equal(conditionFollowUps(age, catalog, {}).length, 1);
  assert.deepEqual(missingInformationText(['bornOn'], catalog, { answers: { A4: 25 }, eligibility: [] }), []);
  assert.deepEqual(missingInformationText(['A4'], catalog, { answers: { bornOn: '2000-01-01' }, eligibility: [] }), []);
});
test('non-corporate applicants are not asked for share structure and corporate date', () => {
  assert.deepEqual(missingInformationText(['thaiShares', 'studentShares', 'authorizedDirector', 'registeredOn'], catalog, {
    answers: { A6: 'ยังไม่จดทะเบียน' }, eligibility: [],
  }), []);
});
test('pending route definitions are separated from missing entrepreneur facts', () => {
  const questions = conditionFollowUps({
    ...condition('ubi-membership', ['A3', 'institution', 'graduatedOn', 'preInMonths']), note: 'เกณฑ์รอรับรอง',
  }, catalog, { A3: 'ผู้ประกอบการ', preInMonths: 0 });
  assert.match(questions[0]!, /มีข้อมูล.*แล้ว.*ผู้รับผิดชอบยืนยันเกณฑ์/);
  assert.doesNotMatch(questions[0]!, /ยังไม่ระบุ/);
});
test('passed and failed conditions create no missing-data questions', () => {
  for (const outcome of ['pass', 'fail'] as const) {
    assert.deepEqual(conditionFollowUps(condition('legal', ['A6'], outcome), catalog, {}), []);
  }
});
test('repeated requirements across programs and old AI codes are deduplicated', () => {
  const c = condition('education', ['A3', 'graduatedOn']);
  const items = missingInformationText(['graduatedOn'], catalog, {
    answers: { A3: 'ศิษย์เก่า' }, eligibility: [route([c]), route([c])],
  });
  assert.equal(items.length, 1);
});
test('a failed program does not add questions for its remaining prerequisites', () => {
  assert.deepEqual(missingInformationText([], catalog, {
    answers: {}, eligibility: [route([condition('legal', ['A6'])], 'fail')],
  }), []);
  assert.deepEqual(missingInformationText(['nationalityThai'], catalog, {
    answers: {}, eligibility: [route([condition('thai', ['nationalityThai'])], 'fail')],
  }), []);
});
test('historic results use neutral wording and are not filtered using current answers', () => {
  const items = missingInformationText(['A3', 'trlVerified'], catalog);
  assert.equal(items.length, 2);
  assert.ok(items.every((item) => item.includes('ตามผลวิเคราะห์รอบนี้')));
});
test('AI prose remains a clarification request even when it mentions a supplied answer', () => {
  const items = missingInformationText(['ขอหลักฐานเพิ่มเติมของ A3'], catalog, {
    answers: { A3: 'นิสิต' }, eligibility: [],
  });
  assert.match(items[0]!, /ขอหลักฐานเพิ่มเติมของ สถานะผู้สมัคร/);
});
