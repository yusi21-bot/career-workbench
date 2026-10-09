import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, Check, CheckCircle2, ChevronDown, Edit3, Link2, MessageSquareText, Plus, Save, Target, Trash2, X } from 'lucide-react';
import type { InterviewReview, Job } from '../types';

interface ReviewFocus {
  jobId: string;
  reviewId: string;
}

interface InterviewReviewsViewProps {
  jobs: Job[];
  initialFocus: ReviewFocus | null;
  onClearFocus: () => void;
  onSaveReview: (jobId: string, review: InterviewReview) => void;
  onAddReview: (jobId: string, review: InterviewReview) => void;
  onToast: (message: string, type: 'success' | 'info' | 'warning') => void;
}

const lines = (items: string[]) => items.join('\n');
const splitLines = (value: string) => value.split('\n').map(item => item.trim()).filter(Boolean);

export default function InterviewReviewsView({
  jobs,
  initialFocus,
  onClearFocus,
  onSaveReview,
  onAddReview,
  onToast,
}: InterviewReviewsViewProps) {
  const records = useMemo(() => jobs.flatMap(job => (job.interviewReviews || []).map(review => ({ job, review }))), [jobs]);
  const [selected, setSelected] = useState<ReviewFocus | null>(initialFocus);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<InterviewReview | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newJobId, setNewJobId] = useState('');
  const [newRound, setNewRound] = useState('一面');
  const [newDate, setNewDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [newResult, setNewResult] = useState<InterviewReview['result']>('待通知');

  useEffect(() => {
    if (initialFocus) setSelected(initialFocus);
  }, [initialFocus]);

  const active = selected
    ? records.find(item => item.job.id === selected.jobId && item.review.id === selected.reviewId)
    : undefined;

  useEffect(() => {
    setDraft(active ? structuredClone(active.review) : null);
    setEditing(false);
  }, [active?.job.id, active?.review.id]);

  const trackedJobs = jobs.filter(job => job.isInApplicationTracker || ['materials', 'applied', 'test', 'interview'].includes(job.status));

  const openReview = (jobId: string, reviewId: string) => {
    setSelected({ jobId, reviewId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToArchive = () => {
    setSelected(null);
    setEditing(false);
    onClearFocus();
  };

  const saveDraft = () => {
    if (!active || !draft) return;
    onSaveReview(active.job.id, draft);
    setEditing(false);
    onToast('面试复盘已保存。', 'success');
  };

  const createReview = (event: React.FormEvent) => {
    event.preventDefault();
    const job = trackedJobs.find(item => item.id === newJobId);
    if (!job) {
      onToast('请先选择对应岗位。', 'warning');
      return;
    }
    const review: InterviewReview = {
      id: `interview-review-${Date.now()}`,
      date: newDate,
      round: newRound.trim() || '面试',
      result: newResult,
      source: '本人面试记录',
      summary: '',
      positiveSignals: [],
      improvementAreas: [],
      questions: [],
      nextSteps: [],
    };
    onAddReview(job.id, review);
    setShowCreate(false);
    setSelected({ jobId: job.id, reviewId: review.id });
    setDraft(review);
    setEditing(true);
    onToast('已新建复盘，继续把记得的内容写下来吧。', 'success');
  };

  if (active && draft) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 animate-fadeIn pb-16">
        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button onClick={backToArchive} className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-700">
              <ArrowLeft className="h-4 w-4" />返回全部面试记录
            </button>
            <p className="text-xs font-semibold text-indigo-600">面试复盘 · {active.review.date}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{active.job.companyName}｜{active.job.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{draft.round} · {active.job.city} · {draft.result}</p>
          </div>
          <div className="flex gap-2">
            {editing ? <>
              <button onClick={() => { setDraft(structuredClone(active.review)); setEditing(false); }} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"><X className="h-4 w-4" />取消</button>
              <button onClick={saveDraft} className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500"><Save className="h-4 w-4" />保存复盘</button>
            </> : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"><Edit3 className="h-4 w-4" />编辑本次复盘</button>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="面试轮次"><input value={draft.round} onChange={e => setDraft({ ...draft, round: e.target.value })} className="form-input" /></Field>
                <Field label="面试日期"><input type="date" value={draft.date} onChange={e => setDraft({ ...draft, date: e.target.value })} className="form-input" /></Field>
                <Field label="当前结果"><select value={draft.result} onChange={e => setDraft({ ...draft, result: e.target.value as InterviewReview['result'] })} className="form-input"><option>待通知</option><option>通过</option><option>未通过</option></select></Field>
              </div>
              <Field label="整体复盘"><textarea value={draft.summary} onChange={e => setDraft({ ...draft, summary: e.target.value })} rows={6} className="form-input mt-2 resize-y" placeholder="先记录整体感受、岗位匹配和最需要记住的判断。" /></Field>
            </section>

            <div className="grid gap-5 lg:grid-cols-2">
              <ListEditor title="已经证明的能力" value={draft.positiveSignals} onChange={value => setDraft({ ...draft, positiveSignals: value })} />
              <ListEditor title="下次重点补强" value={draft.improvementAreas} onChange={value => setDraft({ ...draft, improvementAreas: value })} />
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">逐题复盘</p>
                <button onClick={() => setDraft({ ...draft, questions: [...draft.questions, { question: '', intent: '', reflection: '', linkedExperience: '', answerStrategy: '', betterAnswer: '' }] })} className="flex items-center gap-1 rounded-lg border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"><Plus className="h-3.5 w-3.5" />增加问题</button>
              </div>
              <div className="space-y-4">
                {draft.questions.map((item, index) => (
                  <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <div className="mb-3 flex items-center justify-between"><span className="text-xs font-bold text-indigo-700">问题 {index + 1}</span><button onClick={() => setDraft({ ...draft, questions: draft.questions.filter((_, i) => i !== index) })} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></div>
                    <div className="space-y-3">
                      <Field label="面试官原问题"><input value={item.question} onChange={e => updateQuestion(draft, setDraft, index, 'question', e.target.value)} className="form-input" /></Field>
                      <Field label="他真正想判断"><textarea value={item.intent} onChange={e => updateQuestion(draft, setDraft, index, 'intent', e.target.value)} rows={2} className="form-input resize-y" /></Field>
                      <Field label="这次卡在哪里"><textarea value={item.reflection} onChange={e => updateQuestion(draft, setDraft, index, 'reflection', e.target.value)} rows={2} className="form-input resize-y" /></Field>
                      <Field label="可以关联的经历"><textarea value={item.linkedExperience || ''} onChange={e => updateQuestion(draft, setDraft, index, 'linkedExperience', e.target.value)} rows={2} className="form-input resize-y" /></Field>
                      <Field label="回答思路与结构"><textarea value={item.answerStrategy || ''} onChange={e => updateQuestion(draft, setDraft, index, 'answerStrategy', e.target.value)} rows={4} className="form-input resize-y" /></Field>
                      <Field label="推荐表达"><textarea value={item.betterAnswer} onChange={e => updateQuestion(draft, setDraft, index, 'betterAnswer', e.target.value)} rows={7} className="form-input resize-y" /></Field>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <ListEditor title="带到下一场的动作" value={draft.nextSteps} onChange={value => setDraft({ ...draft, nextSteps: value })} />
          </div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between gap-3"><span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700">整体判断</span><span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800">{draft.result}</span></div>
              <p className="mt-4 text-sm leading-7 text-slate-700">{draft.summary || '还没有写整体复盘。点击“编辑本次复盘”开始记录。'}</p>
            </section>
            <div className="grid gap-5 lg:grid-cols-2">
              <ReadList icon={<CheckCircle2 className="h-4 w-4" />} title="已经证明的能力" items={draft.positiveSignals} tone="green" />
              <ReadList icon={<Target className="h-4 w-4" />} title="下次重点补强" items={draft.improvementAreas} tone="amber" />
            </div>
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4"><p className="text-sm font-bold text-slate-950">逐题复盘</p><span className="text-[11px] text-slate-400">{draft.questions.length} 个问题</span></div>
              {draft.questions.length === 0 ? <Empty text="还没有记录面试问题。" /> : draft.questions.map((item, index) => (
                <details key={`${item.question}-${index}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs open:border-indigo-200 open:shadow-md">
                  <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 marker:content-none sm:px-6 sm:py-5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">{index + 1}</span>
                    <h3 className="min-w-0 flex-1 text-sm font-bold leading-6 text-slate-950 sm:text-base">{item.question}</h3>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-slate-100 px-5 pb-6 pt-5 sm:px-6">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <AnswerBlock label="面试官真正想判断" text={item.intent} tone="indigo" />
                      <AnswerBlock label="这次卡在哪里" text={item.reflection} tone="amber" />
                    </div>
                    <section className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5 sm:p-6">
                      <div className="flex items-center gap-2 text-sm font-bold text-indigo-800"><Target className="h-4 w-4" />推荐回答方案</div>
                      {item.linkedExperience && <div className="mt-4 rounded-xl border border-indigo-100 bg-white/80 p-4"><p className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700"><Link2 className="h-3.5 w-3.5" />可以关联的经历</p><p className="mt-2 text-xs leading-6 text-slate-700">{item.linkedExperience}</p></div>}
                      {item.answerStrategy && <div className="mt-5"><p className="text-[11px] font-bold text-slate-700">回答思路</p><ol className="mt-3 space-y-2">{splitLines(item.answerStrategy).map((line, step) => <li key={`${line}-${step}`} className="flex gap-3 text-xs leading-6 text-slate-700"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">{step + 1}</span><span>{line.replace(/^\d+[.、)）]\s*/, '')}</span></li>)}</ol></div>}
                      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-xs"><p className="text-[11px] font-bold text-emerald-700">推荐表达</p><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-800">{item.betterAnswer || '还没有记录。'}</p></div>
                    </section>
                  </div>
                </details>
              ))}
            </section>
            <ReadList icon={<Check className="h-4 w-4" />} title="带到下一场的动作" items={draft.nextSteps} tone="slate" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-semibold text-indigo-600">个人面试档案</p><h2 className="mt-2 flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl"><MessageSquareText className="h-6 w-6 text-indigo-600" />面试复盘</h2><p className="mt-2 text-sm leading-6 text-slate-500">记录面试官真正关心什么、这次如何回答，以及下次怎样说得更好。</p></div>
        <button onClick={() => { setShowCreate(true); setNewJobId(trackedJobs[0]?.id || ''); }} className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500"><Plus className="h-4 w-4" />记录一次面试</button>
      </div>

      {records.length === 0 ? <Empty text="还没有面试记录。完成一次面试后，就在这里留下问题和复盘。" /> : (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {records.sort((a, b) => b.review.date.localeCompare(a.review.date)).map(({ job, review }) => (
            <button key={review.id} onClick={() => openReview(job.id, review.id)} className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
              <div className="flex items-center justify-between"><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">{review.round}</span><span className="text-[10px] font-mono text-slate-400">{review.date}</span></div>
              <h3 className="mt-4 text-base font-bold text-slate-950 group-hover:text-indigo-700">{job.companyName}</h3><p className="mt-1 text-xs text-slate-600">{job.title}</p>
              <p className="mt-4 line-clamp-4 text-xs leading-6 text-slate-500">{review.summary || '还没有填写整体复盘。'}</p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-[11px]"><span className="font-semibold text-amber-700">{review.result}</span><span className="font-semibold text-indigo-700">打开完整复盘 →</span></div>
            </button>
          ))}
        </div>
      )}

      {showCreate && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button aria-label="关闭" onClick={() => setShowCreate(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" /><form onSubmit={createReview} className="relative w-full max-w-lg space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold text-indigo-600">新记录</p><h3 className="mt-1 text-xl font-bold text-slate-950">记录一次面试</h3></div><button type="button" onClick={() => setShowCreate(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><Field label="对应岗位"><select value={newJobId} onChange={e => setNewJobId(e.target.value)} className="form-input"><option value="">请选择岗位</option>{trackedJobs.map(job => <option key={job.id} value={job.id}>{job.companyName}｜{job.title}</option>)}</select></Field><div className="grid gap-4 sm:grid-cols-3"><Field label="轮次"><input value={newRound} onChange={e => setNewRound(e.target.value)} className="form-input" /></Field><Field label="日期"><input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="form-input" /></Field><Field label="结果"><select value={newResult} onChange={e => setNewResult(e.target.value as InterviewReview['result'])} className="form-input"><option>待通知</option><option>通过</option><option>未通过</option></select></Field></div><button type="submit" className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-500">创建并开始复盘</button></form></div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-[11px] font-semibold text-slate-600"><span className="mb-1.5 block">{label}</span>{children}</label>; }
function ListEditor({ title, value, onChange }: { title: string; value: string[]; onChange: (value: string[]) => void }) { return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"><p className="text-sm font-bold text-slate-900">{title}</p><p className="mt-1 text-[11px] text-slate-400">每行记录一点</p><textarea value={lines(value)} onChange={e => onChange(splitLines(e.target.value))} rows={7} className="form-input mt-3 resize-y" /></section>; }
function ReadList({ icon, title, items, tone }: { icon: React.ReactNode; title: string; items: string[]; tone: 'green' | 'amber' | 'slate' }) { const style = tone === 'green' ? 'border-emerald-100 bg-emerald-50/40 text-emerald-800' : tone === 'amber' ? 'border-amber-100 bg-amber-50/50 text-amber-800' : 'border-slate-200 bg-white text-slate-800'; return <section className={`rounded-2xl border p-5 ${style}`}><p className="flex items-center gap-2 text-sm font-bold">{icon}{title}</p>{items.length ? <ul className="mt-4 space-y-2 text-xs leading-6 text-slate-600">{items.map(item => <li key={item} className="flex gap-2"><span>•</span><span>{item}</span></li>)}</ul> : <p className="mt-3 text-xs text-slate-400">还没有记录。</p>}</section>; }
function AnswerBlock({ label, text, tone }: { label: string; text: string; tone: 'indigo' | 'amber' | 'green' }) { const style = tone === 'indigo' ? 'border-indigo-100 bg-indigo-50/40 text-indigo-700' : tone === 'amber' ? 'border-amber-100 bg-amber-50/50 text-amber-700' : 'border-emerald-100 bg-emerald-50/40 text-emerald-700'; return <div className={`rounded-xl border p-4 ${style}`}><p className="text-[11px] font-bold">{label}</p><p className="mt-2 text-xs leading-6 text-slate-600">{text || '还没有记录。'}</p></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 py-20 text-center"><CalendarDays className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm text-slate-500">{text}</p></div>; }
function updateQuestion(draft: InterviewReview, setDraft: React.Dispatch<React.SetStateAction<InterviewReview | null>>, index: number, key: keyof InterviewReview['questions'][number], value: string) { const questions = draft.questions.map((item, i) => i === index ? { ...item, [key]: value } : item); setDraft({ ...draft, questions }); }
