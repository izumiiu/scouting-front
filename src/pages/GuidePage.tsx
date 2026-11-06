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
        <h2>4 โครงการ · แยกผลกฎกับการจำแนก TED</h2>
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
        <h3>TED IDEA / TED POC: จำแนกเบื้องต้นโดยไม่ให้คะแนน</h3>
        <p>
          ใช้ภาพเกณฑ์ TED Youth Startup ใหม่แทนเงื่อนไข TED เดิมทั้งหมด AI
          วิเคราะห์จากคำตอบและสรุปหลักฐานที่บันทึกในระบบ เพื่อเสนอ IDEA, POC
          หรือข้อมูลยังไม่พอแยกประเภท พร้อมเหตุผลเมื่อเทียบอีกประเภท ข้อจำกัด
          และคำถามเพิ่มเติม ต้นแบบเพียงอย่างเดียวไม่ใช่ข้อสรุปว่าเป็น POC
          และยังไม่มีรายได้ก็พิจารณาแผนรายได้แรกได้ แยกเงินสมทบ POC อย่างน้อย
          10% เป็นเรื่องรอตรวจยืนยัน ไม่ใช้เปลี่ยนประเภทโครงการ
          ช่องงบเดิมยังไม่ยืนยันว่าครบ 10% เจ้าหน้าที่เลือกต่างจาก AI
          ได้โดยตรวจและบันทึกเหตุผล
        </p>
        {catalog.tedCriteria?.stageGuidance && (
          <details>
            <summary>วิธีพิจารณาระยะพัฒนาและเงื่อนไขเงินสมทบ</summary>
            <ul>
              {catalog.tedCriteria.stageGuidance.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>{catalog.tedCriteria.fundingGuidance}</p>
          </details>
        )}
        {catalog.tedCriteria?.programs.map((program) => (
          <details key={program.program}>
            <summary>
              {catalog.programs.find((p) => p.code === program.program)?.label}{' '}
              · หัวข้อที่ใช้พิจารณา
            </summary>
            <p>{program.focus}</p>
            {program.domains.map((domain) => (
              <div key={domain.label}>
                <h4>{domain.label}</h4>
                <ul>
                  {domain.considerations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </details>
        ))}
        <p className="muted">
          ไม่มีคะแนนหรือเส้นผ่าน เกณฑ์นี้ใช้ประกอบการจำแนกคร่าว ๆ
          ไม่ใช่การตรวจสิทธิ์ทุนครบถ้วน ระบบไม่อ่านไฟล์ Word/PDF หรือ Google
          Sheet โดยอัตโนมัติ และไม่เรียกวิเคราะห์ใหม่เมื่อเกณฑ์เปลี่ยน
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
          {catalog.tedCriteria && (
            <>
              <br />
              รุ่นเกณฑ์ TED: {catalog.tedCriteria.version}
            </>
          )}
          <br />
          รุ่นตารางผู้เชี่ยวชาญ: {catalog.expertVersion}
        </small>
      </section>
    </>
  );
}
