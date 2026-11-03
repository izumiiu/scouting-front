import type { Outcome } from '../../types';
export function StatusBadge({ status }: { status: Outcome | string }) {
  const labels: Record<string, string> = {
    pass: 'ผ่านตามข้อมูล',
    fail: 'ไม่ผ่านเงื่อนไข',
    unknown: 'ข้อมูลไม่พอ',
    queued: 'รอวิเคราะห์',
    running: 'กำลังวิเคราะห์',
    succeeded: 'AI วิเคราะห์แล้ว',
    failed: 'วิเคราะห์ไม่สำเร็จ',
    draft: 'บันทึกข้อมูลแล้ว',
    reviewed: 'เจ้าหน้าที่ตรวจแล้ว',
  };
  return (
    <span className={`badge status-${status}`}>{labels[status] ?? status}</span>
  );
}
