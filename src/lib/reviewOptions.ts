import type { Analysis, Eligibility } from '../types/index.ts';

// TED is an officer decision informed by AI, including when AI needs more data.
// This is not a grant approval. The server repeats all version/revision checks.
export function canSelectDestination(
  program: Eligibility,
  run: Analysis,
): boolean {
  if (program.program === 'TED_IDEA' || program.program === 'TED_POC') {
    return (
      program.assessmentMode === 'qualitative' &&
      Boolean(run.result?.tedAssessment)
    );
  }
  return program.outcome === 'pass';
}
