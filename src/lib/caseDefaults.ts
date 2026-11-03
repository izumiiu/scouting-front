import type { CaseInput } from '../types';
export function emptyInput(): CaseInput {
  return {
    title: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    sourceChannel: 'แบบฟอร์มที่ได้รับ',
    sourceReference: '',
    referenceDate: new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Bangkok',
    }),
    permissionStatus: 'unknown',
    permissionReference: '',
    allowAiProcessing: false,
    answers: {},
  };
}
