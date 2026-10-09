import React from 'react';
import { Building2, ChevronDown, ExternalLink, LockKeyhole, MapPin, ShieldCheck } from 'lucide-react';
import { CENTRAL_SOE_GROUPS } from '../central-soe-data';
import type { Company, Job, SoeGroup, SoeRecruitmentStatus } from '../types';

const statusStyle: Record<SoeRecruitmentStatus, string> = {
  已开放: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  部分开放: 'border-blue-200 bg-blue-50 text-blue-700',
  暂缓投递: 'border-amber-200 bg-amber-50 text-amber-700',
  未开放: 'border-slate-200 bg-slate-50 text-slate-500',
  待核实: 'border-violet-200 bg-violet-50 text-violet-700',
  已结束: 'border-rose-200 bg-rose-50 text-rose-700',
};

const fitStyle: Record<SoeGroup['fit'], string> = {
  重点研究: 'bg-indigo-600 text-white',
  可关注: 'bg-indigo-50 text-indigo-700',
  低匹配: 'bg-slate-100 text-slate-500',
  待评估: 'bg-white text-slate-500 border border-slate-200',
};

function normalizeName(name: string) {
  return name.replace(/中国|国家|（集团）|集团|控股|有限责任公司|股份有限公司|有限公司|研究院|总局/g, '');
}

function linkedCompanyFor(group: SoeGroup, companies: Company[]) {
  const groupKey = normalizeName(group.name);
  return companies.find(company => {
    const companyKey = normalizeName(company.name);
    return company.name === group.name || (groupKey.length >= 3 && (companyKey.includes(groupKey) || groupKey.includes(companyKey)));
  });
}

interface CentralSoeViewProps {
  companies: Company[];
  jobs: Job[];
  searchQuery: string;
  onSelectCompany: (company: Company) => void;
}

export default function CentralSoeView({ companies, jobs, searchQuery, onSelectCompany }: CentralSoeViewProps) {
  const [status, setStatus] = React.useState<SoeRecruitmentStatus | '全部状态'>('全部状态');
  const [fit, setFit] = React.useState<SoeGroup['fit'] | '全部匹配'>('全部匹配');
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const groups = CENTRAL_SOE_GROUPS.filter(group => {
    const keyword = searchQuery.trim().toLowerCase();
    const searchable = `${group.name} ${group.strategy ?? ''} ${(group.regions ?? []).join(' ')} ${(group.units ?? []).map(unit => `${unit.name} ${unit.roles ?? ''}`).join(' ')}`.toLowerCase();
    return (!keyword || searchable.includes(keyword)) && (status === '全部状态' || group.status === status) && (fit === '全部匹配' || group.fit === fit);
  }).sort((a, b) => {
    const fitOrder = { 重点研究: 0, 可关注: 1, 待评估: 2, 低匹配: 3 };
    const statusOrder: Record<SoeRecruitmentStatus, number> = { 已开放: 0, 部分开放: 1, 暂缓投递: 2, 待核实: 3, 未开放: 4, 已结束: 5 };
    return fitOrder[a.fit] - fitOrder[b.fit] || statusOrder[a.status] - statusOrder[b.status] || a.name.localeCompare(b.name, 'zh-CN');
  });

  const statusCounts = CENTRAL_SOE_GROUPS.reduce<Record<string, number>>((result, group) => {
    result[group.status] = (result[group.status] ?? 0) + 1;
    return result;
  }, {});

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="央企集团目录" value={CENTRAL_SOE_GROUPS.length} note="按集团口径，不把子公司平铺计数" />
        <SummaryCard label="开放中" value={(statusCounts['已开放'] ?? 0) + (statusCounts['部分开放'] ?? 0)} note="已开放与部分开放合计" tone="emerald" />
        <SummaryCard label="暂缓投递" value={statusCounts['暂缓投递'] ?? 0} note="存在分批放岗或志愿限制" tone="amber" />
        <SummaryCard label="尚未开放" value={statusCounts['未开放'] ?? 0} note="等待官网后续更新" />
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-950">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <div><strong>集团招聘资料 · 公开演示</strong><p className="mt-1 text-xs leading-5 text-amber-800">按集团与下属单位整理招聘入口；演示中的优先级不代表适合所有人，具体岗位与开放时间请核对官网。</p></div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select value={status} onChange={event => setStatus(event.target.value as SoeRecruitmentStatus | '全部状态')} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400">
          <option>全部状态</option><option>已开放</option><option>部分开放</option><option>暂缓投递</option><option>未开放</option><option>待核实</option><option>已结束</option>
        </select>
        <select value={fit} onChange={event => setFit(event.target.value as SoeGroup['fit'] | '全部匹配')} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400">
          <option>全部匹配</option><option>重点研究</option><option>可关注</option><option>待评估</option><option>低匹配</option>
        </select>
        <span className="text-xs text-slate-400">当前显示 {groups.length} 家集团</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {groups.map(group => {
          const linkedCompany = linkedCompanyFor(group, companies);
          const currentJobs = linkedCompany ? jobs.filter(job => job.companyId === linkedCompany.id && !['ended', 'shelved'].includes(job.status)) : [];
          const isExpanded = expanded === group.id;
          return (
            <article key={group.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-indigo-200 hover:shadow-sm">
              <button type="button" onClick={() => setExpanded(isExpanded ? null : group.id)} className="w-full p-4 text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white"><Building2 className="h-4 w-4" /></div>
                    <div className="min-w-0"><h3 className="font-semibold text-slate-950">{group.name}</h3><p className="mt-1 text-[11px] text-slate-400">资料整理 {group.sourceUpdatedAt}{group.publicVerifiedAt ? ` · 公开信息核验 ${group.publicVerifiedAt}` : ''}{currentJobs.length ? ` · 工作台已有 ${currentJobs.length} 个招聘批次` : ''}</p></div>
                  </div>
                  <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyle[group.status]}`}>{group.status}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${fitStyle[group.fit]}`}>{group.fit}</span>{group.regions?.map(region => <span key={region} className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] text-slate-500"><MapPin className="h-3 w-3" />{region}</span>)}</div>
                {group.strategy && <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-600">{group.strategy}</p>}
              </button>

              {isExpanded && <div className="border-t border-slate-100 bg-slate-50/60 p-4">
                {group.intelligence && <div className="mb-3 rounded-xl bg-slate-900 p-3 text-white"><strong className="text-xs">上市与融资信息</strong><p className="mt-2 text-[11px] leading-5 text-slate-200">{group.intelligence.capitalStatus}</p><p className="mt-2 text-[10px] leading-4 text-slate-300">{group.intelligence.fundingSummary}</p><p className="mt-2 text-[10px] leading-4 text-slate-400">岗位提示：{group.intelligence.rationale}</p><div className="mt-2 flex flex-wrap gap-2">{group.intelligence.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 px-2 py-1 text-[9px] text-slate-200">{source.title}</a>)}</div></div>}
                {group.units?.length ? <div className="space-y-2">{group.units.map(unit => <div key={unit.name} className="rounded-xl border border-slate-200 bg-white p-3"><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><strong className="text-xs text-slate-800">{unit.name}</strong>{unit.evidence && <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${unit.evidence === '已核实2027招聘' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{unit.evidence}</span>}</div>{unit.roles && <p className="mt-1 text-xs leading-5 text-slate-500">{unit.roles}</p>}{unit.strategy && <p className="mt-1 text-[11px] leading-5 text-amber-700">{unit.strategy}</p>}{unit.verifiedAt && <p className="mt-1 text-[10px] text-slate-400">公开信息核验：{unit.verifiedAt}</p>}</div>{unit.url && <a href={unit.url} target="_blank" rel="noreferrer" onClick={event => event.stopPropagation()} className="text-indigo-600"><ExternalLink className="h-3.5 w-3.5" /></a>}</div></div>)}</div> : <p className="text-xs text-slate-500">当前仅收录集团级状态，具体下属单位等待进一步核验。</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.officialUrl && <a href={group.officialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white">官方招聘入口 <ExternalLink className="h-3 w-3" /></a>}
                  {linkedCompany && <button type="button" onClick={() => onSelectCompany(linkedCompany)} className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-[11px] font-semibold text-indigo-700"><ShieldCheck className="h-3 w-3" />查看关联公司卡</button>}
                </div>
              </div>}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, note, tone = 'slate' }: { label: string; value: number; note: string; tone?: 'slate' | 'emerald' | 'amber' }) {
  const color = tone === 'emerald' ? 'text-emerald-700' : tone === 'amber' ? 'text-amber-700' : 'text-slate-950';
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"><p className="text-[11px] font-semibold text-slate-400">{label}</p><strong className={`mt-2 block text-2xl ${color}`}>{value}</strong><p className="mt-1 text-[10px] leading-4 text-slate-400">{note}</p></div>;
}
