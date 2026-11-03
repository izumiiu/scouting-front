import type { Catalog } from '../types';
export function GuidePage({ catalog }: { catalog: Catalog }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="section-kicker">REFERENCE & WORKFLOW</div>
          <h1>เกณฑ์และแนวทางคัดกรอง</h1>
          <p>ใช้ข้อมูลที่มีจริง แยกกฎ AI และคำยืนยันของคน</p>
        </div>
      </div>
      <div className="notice warning">
        เกณฑ์อ้างอิงยังรอผู้รับผิดชอบรับรองสำหรับการใช้จริง
        โดยเฉพาะวันตัดคุณสมบัติและเงื่อนไขที่กำกวม
      </div>
      <section className="card guide-card">
        <h2>5 ชุดผลคุณสมบัติ · 4 โครงการ</h2>
        <div className="tag-list">
          {catalog.programs.map((p) => (
            <span className="badge status-draft" key={p.code}>
              {p.label}
            </span>
          ))}
        </div>
        <p>
          UBI แยก Pre-incubation กับ Startup ข้อมูลขาดแสดง “ข้อมูลไม่พอ”
          ไม่มีการปัดให้ผ่านหรือไม่ผ่านอัตโนมัติ เกณฑ์รายข้อดูได้ในหน้าเคส →
          ผลวิเคราะห์
        </p>
        <h3>สาขาผู้เชี่ยวชาญ</h3>
        <p>
          อ้างอิงเงื่อนไขการพัฒนาและทุน V2 วันที่ 2 พฤศจิกายน 2569
          เสนอด้านที่เหมาะกับช่องว่างที่มีหลักฐาน เช่น ธุรกิจ/IP การตลาด มาตรฐาน
          การเงิน การผลิต และแบรนด์ ยังไม่จับคู่รายบุคคลหรือจองนัด
        </p>
        <h3>ก่อนกดยืนยัน</h3>
        <ol>
          <li>ตรวจข้อมูลต้นทางและหลักฐาน</li>
          <li>อ่านผลรายเงื่อนไขแยกจากข้อเสนอ AI</li>
          <li>ตรวจและแก้ด้านผู้เชี่ยวชาญพร้อมเหตุผล</li>
          <li>เลือกโครงการเดียว หรือบันทึกรอข้อมูลเพิ่มเติม</li>
        </ol>
        <p>
          การยืนยันส่งต่อยังไม่ใช่ PM รับเรื่อง ไม่ใช่การรับเข้าบ่มเพาะ
          และไม่ใช่อนุมัติทุน
        </p>
        <small className="muted">
          รุ่นกฎ: {catalog.ruleVersion}
          <br />
          รุ่นตารางผู้เชี่ยวชาญ: {catalog.expertVersion}
        </small>
      </section>
    </>
  );
}
