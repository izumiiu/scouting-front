import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildFollowUpGroups } from '../src/lib/followUpPresentation.ts';
import { conditionFollowUps } from '../src/lib/fieldPresentation.ts';
import type { AiResult, Eligibility } from '../src/types/index.ts';
const catalog = { fields: [] };
const result = (missingInformation: string[] = []): AiResult => ({ summary: 'สรุป', programRecommendations: [], expertRecommendations: [], missingInformation });
const condition = (id: string, refs: string[]) => ({ id, label: 'หัวข้อตรวจตัวอย่าง', outcome: 'unknown' as const, evidenceRefs: refs });
const route = (program: string, conditions: Eligibility['conditions'], outcome: Eligibility['outcome'] = 'unknown'): Eligibility => ({ program, label: program, conditions, outcome });

test('the existing mixed-list scenario keeps UBI/TBI rules out of unassigned AI advice', () => {
  const groups = buildFollowUpGroups(result(['ผลทดสอบกับผู้ใช้จริง', 'ขอเงินสมทบสำหรับ POC']), catalog, { answers: {}, eligibility: [route('UBI_STARTUP', [condition('mvp', ['C2', 'mvpVerified'])]), route('TBI', [condition('age', ['bornOn', 'A4']), condition('network', ['previousNetwork'])])] });
  assert.deepEqual(groups.map((g) => g.key), ['UBI', 'TBI', 'UNASSIGNED']);
  assert.ok(groups.find((g) => g.key === 'UNASSIGNED')!.items.every((item) => item.sources.join() === 'AI'));
  assert.ok(groups.find((g) => g.key === 'UBI')!.items.every((item) => item.programs.join() === 'UBI_STARTUP' && item.sources.join() === 'RULE'));
  assert.match(groups.find((g) => g.key === 'TBI')!.items[0]!.question, /วันเกิดหรืออายุ/);
});
test('explicit TED, funding, development, UBI and TBI scopes render in separate groups', () => {
  const followUps = [
    { scope: 'TED' as const, question: 'หลักฐานร่วม TED' }, { scope: 'TED_IDEA' as const, question: 'แผนพิสูจน์แนวคิด' },
    { scope: 'TED_POC' as const, question: 'แผนรายได้แรก' }, { scope: 'TED_POC_FUNDING' as const, question: 'จำนวนเงินสมทบ' },
    { scope: 'DEVELOPMENT' as const, question: 'สิทธิในเทคโนโลยี' }, { scope: 'UBI_PRE' as const, question: 'เส้นทางเตรียมบ่มเพาะ' },
    { scope: 'UBI_STARTUP' as const, question: 'ยืนยัน MVP' }, { scope: 'TBI' as const, question: 'ประวัติเครือข่าย' },
  ];
  const groups = buildFollowUpGroups({ ...result(followUps.map((q) => q.question)), followUps }, catalog);
  assert.deepEqual(groups.map((g) => g.key), ['TED', 'FUNDING', 'DEVELOPMENT', 'UBI', 'TBI']);
  assert.equal(groups.flatMap((g) => g.items).length, 8);
  assert.deepEqual(groups.find((g) => g.key === 'FUNDING')!.items[0]!.programs, ['TED_POC']);
  assert.deepEqual(groups.find((g) => g.key === 'DEVELOPMENT')!.items[0]!.programs, []);
});
test('shared UBI questions retain both applicable subprograms after deduplication', () => {
  const c = condition('legal', ['A6']);
  const groups = buildFollowUpGroups(result(), catalog, { answers: {}, eligibility: [route('UBI_PRE', [c]), route('UBI_STARTUP', [c])] });
  assert.equal(groups[0]!.items.length, 1);
  assert.deepEqual(groups[0]!.items[0]!.programs, ['UBI_PRE', 'UBI_STARTUP']);
  assert.deepEqual(groups[0]!.items[0]!.conditions, ['หัวข้อตรวจตัวอย่าง']);
});
test('history never reconstructs missing rule questions from newer answers', () => {
  const old = result(['A3', 'trlVerified']);
  const groups = buildFollowUpGroups(old, catalog);
  assert.deepEqual(groups.map((g) => g.key), ['UNASSIGNED']);
  assert.ok(groups[0]!.items.every((item) => item.question.includes('ตามผลวิเคราะห์รอบนี้')));
});
test('passed, failed and qualitative routes add no rule requirements', () => {
  const c = condition('legal', ['A6']);
  assert.deepEqual(buildFollowUpGroups(result(), catalog, { answers: {}, eligibility: [route('TBI', [c], 'pass'), route('UBI_PRE', [c], 'fail'), { ...route('TED_POC', [c]), assessmentMode: 'qualitative' }] }), []);
});
test('typed and rule questions can share text while preserving both sources', () => {
  const c = condition('age', ['bornOn', 'A4']);
  const question = conditionFollowUps(c, catalog, {})[0]!;
  const groups = buildFollowUpGroups({ ...result([question]), followUps: [{ scope: 'TBI', question }] }, catalog, { answers: {}, eligibility: [route('TBI', [c])] });
  assert.equal(groups[0]!.items.length, 1);
  assert.deepEqual(groups[0]!.items[0]!.sources, ['AI', 'RULE']);
});
test('untagged leftover questions are preserved without keyword classification', () => {
  const groups = buildFollowUpGroups({ ...result(['ขอทดสอบตลาด', 'อายุสำหรับ TBI', 'เงินสมทบ POC']), followUps: [{ scope: 'TED', question: 'ขอทดสอบตลาด' }] }, catalog);
  assert.deepEqual(groups.map((g) => g.key), ['TED', 'UNASSIGNED']);
  assert.equal(groups[1]!.items.length, 2);
});
test('group text keeps readable Thai field names rather than raw identifiers', () => {
  const groups = buildFollowUpGroups(result(['A3', 'trlVerified']), catalog);
  assert.doesNotMatch(groups.flatMap((g) => g.items.map((i) => i.question)).join(' '), /A3|trlVerified/);
});
test('confirmed evidence is not added as an unanswered field', () => {
  assert.deepEqual(buildFollowUpGroups(result(['mvpVerified']), catalog, { answers: { mvpVerified: 'ใช่' }, eligibility: [] }), []);
});
