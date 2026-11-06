import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canSelectDestination } from '../src/lib/reviewOptions.ts';
import {
  missingInformationText,
  readableAnalysisText,
} from '../src/lib/fieldPresentation.ts';
import type { Analysis, Catalog, Eligibility } from '../src/types/index.ts';

const run = {
  result: { tedAssessment: { classification: 'INSUFFICIENT_DATA' } },
} as Analysis;
test('officer may select either TED route even if AI is undecided', () => {
  for (const program of ['TED_IDEA', 'TED_POC']) {
    assert.equal(
      canSelectDestination(
        {
          program,
          assessmentMode: 'qualitative',
          outcome: 'unknown',
        } as Eligibility,
        run,
      ),
      true,
    );
    assert.equal(
      canSelectDestination({ program, outcome: 'pass' } as Eligibility, run),
      false,
    );
    assert.equal(
      canSelectDestination(
        { program, assessmentMode: 'qualitative' } as Eligibility,
        { result: null } as Analysis,
      ),
      false,
    );
  }
});
test('UBI and TBI still need a deterministic pass', () => {
  for (const program of ['UBI_PRE', 'UBI_STARTUP', 'TBI']) {
    for (const outcome of ['pass', 'unknown', 'fail'] as const) {
      assert.equal(
        canSelectDestination({ program, outcome } as Eligibility, run),
        outcome === 'pass',
      );
    }
  }
});
test('qualitative TED adds no retired gate checklist to missing information', () => {
  const eligibility: Eligibility[] = [
    {
      program: 'TED_POC',
      label: 'TED POC',
      assessmentMode: 'qualitative',
      outcome: 'unknown',
      conditions: [],
    },
  ];
  assert.deepEqual(
    missingInformationText(
      ['ขอผลทดสอบกับลูกค้าจริง'],
      { fields: [] } as unknown as Catalog,
      { answers: {}, eligibility },
    ),
    ['ขอผลทดสอบกับลูกค้าจริง'],
  );
});

test('TED machine codes in generated prose have readable program names', () => {
  assert.equal(
    readableAnalysisText(
      'เหมาะกับ TED_IDEA เทียบกับ TED_POC; INSUFFICIENT_DATA',
      { fields: [] },
    ),
    'เหมาะกับ TED IDEA เทียบกับ TED POC; ข้อมูลยังไม่พอแยกประเภท',
  );
});
