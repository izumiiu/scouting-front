import { useCallback, useEffect, useState } from 'react';
import type { CaseDetail, CaseInput, Catalog } from '../types';
import { api, mutation, errorMessage } from '../lib/api';
import { Loading, ErrorNotice } from '../components/common/Feedback';
import { CaseForm } from '../components/cases/CaseForm';
import { HistoryPanel } from '../components/cases/HistoryPanel';
import { EligibilityPanel } from '../components/analysis/EligibilityPanel';
import { AiResultPanel } from '../components/analysis/AiResultPanel';
import { HumanReviewForm } from '../components/analysis/HumanReviewForm';
import { StatusBadge } from '../components/common/StatusBadge';
export function CaseDetailPage({
  id,
  catalog,
}: {
  id: string;
  catalog: Catalog;
}) {
  const [detail, setDetail] = useState<CaseDetail | null>(null),
    [error, setError] = useState(''),
    [success, setSuccess] = useState(''),
    [dirty, setDirty] = useState(false),
    [tab, setTab] = useState<'input' | 'analysis' | 'history'>('input'),
    [analyzing, setAnalyzing] = useState(false);
  const reload = useCallback(async () => {
    const x = await api<CaseDetail>(`/cases/${id}`);
    setDetail(x);
    setError('');
  }, [id]);
  useEffect(() => {
    const controller = new AbortController();
    api<CaseDetail>(`/cases/${id}`, { signal: controller.signal })
      .then((x) => setDetail(x))
      .catch((e) => {
        if (!controller.signal.aborted) setError(errorMessage(e));
      });
    return () => controller.abort();
  }, [id]);
  const pending = Boolean(detail?.caseRecord.activeAnalysisId);
  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(
      () => void reload().catch((e) => setError(errorMessage(e))),
      2500,
    );
    return () => clearInterval(timer);
  }, [pending, reload]);
  if (!detail)
    return (
      <>
        <ErrorNotice message={error} />
        {!error && <Loading />}
        <a className="back-link" href="#/cases">
          ← กลับรายการ
        </a>
      </>
    );
  const record = detail.caseRecord,
    run =
      detail.analyses.find((x) => x._id === record.activeAnalysisId) ??
      detail.analyses[0];
  const current =
    run?.status === 'succeeded' &&
    run._id === record.latestAnalysisId &&
    run.inputRevision === record.revision &&
    run.ruleVersion === catalog.ruleVersion &&
    run.expertVersion === catalog.expertVersion &&
    !pending;
  const save = async (input: CaseInput) => {
    await api(
      `/cases/${id}`,
      mutation('PUT', { revision: record.revision, input }),
    );
    await reload();
    setSuccess('บันทึกข้อมูลสำเร็จ ผลวิเคราะห์เดิมยังดูได้ในประวัติ');
  };
  const analyze = async () => {
    setAnalyzing(true);
    setError('');
    try {
      await api(
        `/cases/${id}/analyses`,
        mutation('POST', { revision: record.revision }, true),
      );
      setTab('analysis');
      await reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setAnalyzing(false);
    }
  };
  return (
    <>
      <a className="back-link" href="#/cases">
        ← กลับรายการเคส
      </a>
      <div className="page-heading">
        <div>
          <div className="section-kicker">
            {record.code}{' '}
            <span className="revision-label">ข้อมูลรุ่น {record.revision}</span>
          </div>
          <h1>{record.input.title}</h1>
          <p>
            รับข้อมูลทาง {record.input.sourceChannel || 'ไม่ระบุ'} ·
            วันที่อ้างอิง {record.input.referenceDate}
          </p>
        </div>
        <button
          className="button primary"
          disabled={
            dirty ||
            pending ||
            analyzing ||
            !record.input.allowAiProcessing ||
            !catalog.aiConfigured
          }
          onClick={() => void analyze()}
        >
          {pending || analyzing ? '◌ กำลังดำเนินการ…' : '✧ ให้ AI วิเคราะห์'}
        </button>
      </div>
      <ErrorNotice message={error} />
      {success && (
        <div className="notice success" role="status">
          {success}
        </div>
      )}
      {dirty && (
        <div className="notice warning">
          มีข้อมูลที่ยังไม่บันทึก กรุณาบันทึกก่อนให้ AI วิเคราะห์
        </div>
      )}
      {!catalog.aiConfigured && (
        <div className="notice warning">
          ยังไม่ได้ตั้ง API key/model ของบริการ AI ที่เลือกใน backend
          สามารถบันทึกข้อมูลและดูผลกฎได้ก่อน โดยยังไม่แสดงผลจำลองเป็น AI
        </div>
      )}
      {!record.input.allowAiProcessing && (
        <div className="notice info">
          ก่อนใช้ AI กรุณาบันทึกสถานะและหลักฐานที่ครอบคลุมการส่งข้อมูลในหมวด
          “สิทธิ์การใช้ข้อมูล”
        </div>
      )}
      <div className="case-tabs" role="tablist" aria-label="ส่วนข้อมูลเคส">
        {(
          [
            ['input', 'ข้อมูลแบบฟอร์ม'],
            ['analysis', 'ผลวิเคราะห์และตรวจยืนยัน'],
            ['history', 'ประวัติ'],
          ] as const
        ).map(([key, label]) => (
          <button
            role="tab"
            aria-selected={tab === key}
            key={key}
            onClick={() => {
              if (
                dirty &&
                key !== 'input' &&
                !window.confirm(
                  'มีข้อมูลที่ยังไม่บันทึก ต้องการออกจากแบบฟอร์มหรือไม่?',
                )
              )
                return;
              if (key !== 'input') setDirty(false);
              setTab(key);
            }}
          >
            {label}
            {key === 'analysis' && run && <StatusBadge status={run.status} />}
          </button>
        ))}
      </div>
      {tab === 'input' ? (
        <CaseForm
          key={record.revision}
          catalog={catalog}
          initial={record.input}
          onSave={save}
          onDirtyChange={setDirty}
        />
      ) : tab === 'history' ? (
        <HistoryPanel
          key={`${record.revision}-${record.decisionVersion}-${detail.events[0]?._id}`}
          detail={detail}
          catalog={catalog}
        />
      ) : (
        <div className="analysis-stack">
          <div className="notice info">
            เกณฑ์อ้างอิงและตารางสาขาเป็นร่างรอ PM รับรอง
            ผลตรวจไม่ใช่การอนุมัติทุน
          </div>
          <EligibilityPanel results={detail.eligibility} />
          <div className="group-context">
            <strong>บริบทสาขาผู้เชี่ยวชาญ:</strong>{' '}
            {detail.groupContext.group ?? 'ยังยืนยันกลุ่มไม่ได้'}
            {detail.groupContext.warnings.map((warning, index) => (
              <p key={index}>{warning}</p>
            ))}
          </div>
          <AiResultPanel
            run={run}
            catalog={catalog}
            revision={record.revision}
          />
          {current && run ? (
            <HumanReviewForm
              key={`${run._id}-${record.decisionVersion}`}
              detail={detail}
              run={run}
              catalog={catalog}
              onConfirmed={async () => {
                await reload();
                setSuccess(
                  'บันทึกคำยืนยันของเจ้าหน้าที่แล้ว เปิดดูได้ในประวัติ',
                );
              }}
            />
          ) : (
            <div className="notice info">
              ส่วนตรวจยืนยันจะเปิดเมื่อมีผล AI
              สำเร็จของข้อมูลและเกณฑ์รุ่นปัจจุบัน
            </div>
          )}
        </div>
      )}
    </>
  );
}
