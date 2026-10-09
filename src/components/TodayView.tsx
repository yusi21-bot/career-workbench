import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, BookmarkPlus, CalendarDays, Check, ChevronRight, Plus, Sparkles } from 'lucide-react';
import { Job, InboxItem, CalendarEvent, NewsItem, KnowledgeCard, Company } from '../types';
import { getCardSummary, getCityLabel } from './JobsAndCompaniesView';
import { hasPassedDate, isCurrentInboxItem, isCurrentJob, localTodayIso } from '../opportunity-visibility';

interface TodayViewProps {
  jobs: Job[]; companies: Company[]; inboxItems: InboxItem[]; calendarEvents: CalendarEvent[];
  newsItems: NewsItem[]; knowledgeCards: KnowledgeCard[]; onViewChange: (view: string) => void;
  onSelectJob: (job: Job) => void; onSelectCompany: (company: Company) => void; onToggleEventComplete: (id: string) => void;
  onStartJob: (jobId: string) => void;
}

const priorityNames = ['阿里系', '腾讯', '字节跳动', '华为', '美团', '京东', '拼多多 PDD', '百度', '小米', '大疆 DJI', '网易游戏', '快手', 'OPPO'];

function KoiEditorial() {
  return (
    <div className="koi-editorial" aria-hidden="true">
      <picture className="koi-collage-picture">
        <source srcSet="./assets/koi-collage-wide.webp" type="image/webp" />
        <img className="koi-collage-image" src="./assets/koi-collage-wide.png" alt="" width="1536" height="1024" decoding="async" fetchPriority="high" />
      </picture>
      <div className="koi-lucky-type"><span>LUCKY</span><b>#{new Date().getMonth() + 1}{String(new Date().getDate()).padStart(2, '0')}</b></div>
      <span className="koi-sticker">ALL LUCK<br />ATTACK ME</span>
      <div className="luck-ticker">好运加载中 · ALL LUCK IS LOADING · 好运加载中</div>
    </div>
  );
}

export default function TodayView({
  jobs, companies, inboxItems, calendarEvents, newsItems, knowledgeCards, onViewChange, onSelectJob, onSelectCompany,
  onToggleEventComplete, onStartJob
}: TodayViewProps) {
  const activeJobs = jobs.filter(job => isCurrentJob(job));
  const startHere = [...activeJobs].filter(job => job.status === 'wish').sort((a, b) => {
    const ai = priorityNames.indexOf(a.companyName); const bi = priorityNames.indexOf(b.companyName);
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
  }).slice(0, 3);
  const inProgress = activeJobs.filter(job => ['materials', 'applied', 'test', 'interview'].includes(job.status));
  const appliedCount = activeJobs.filter(job => ['applied', 'test', 'interview'].includes(job.status)).length;
  const favoriteCount = activeJobs.filter(job => job.isFavorite).length;
  const today = localTodayIso();
  const pendingEvents = calendarEvents.filter(event => !event.completed);
  const overdue = pendingEvents
    .filter(event => hasPassedDate(event.date, today))
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  const upcoming = [
    ...overdue,
    ...pendingEvents
      .filter(event => !hasPassedDate(event.date, today))
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
  ].slice(0, 3);
  const getModeLabel = (mode?: CalendarEvent['mode']) => {
    if (mode === 'online') return '线上';
    if (mode === 'offline') return '线下';
    if (mode === 'hybrid') return '线上＋线下';
    return null;
  };
  const pendingInbox = inboxItems.filter(item => item.status === 'pending' && isCurrentInboxItem(item)).length;
  const dateText = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());

  return (
    <div className="today-editorial mx-auto max-w-[1320px] pb-16">
      <section className="today-hero-grid">
        <div className="today-hero-copy">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500"><span>{dateText}</span><span className="manifest-pill">宜出手</span></div>
          <div className="manifest-trigger mt-4 inline-flex items-center gap-2"><span>本日显化</span><Sparkles className="h-3.5 w-3.5" /></div>
          <h1 className="manifest-title mt-3"><span>Offer</span><br /><span className="manifest-cn"><em>不请</em>自来。</span></h1>

          <div className="pangdan-quote mt-5 flex max-w-xl items-center gap-3 rounded-full px-3 py-2 text-left">
            <img src="./assets/pangdan-avatar.webp" alt="胖蛋头像" className="h-8 w-8 shrink-0 rounded-full object-cover object-center" />
            <span className="min-w-0 flex-1"><small className="block text-[10px] font-bold text-[#9e2634]">胖蛋气氛组</small><strong className="block truncate text-sm text-slate-800">不是，先投一个怎么了？万一这把真有了呢。</strong></span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button onClick={() => {
              const company = startHere[0] && companies.find(item => item.id === startHere[0].companyId);
              company ? onSelectCompany(company) : onViewChange('jobs');
            }} className="btn-primary-glow inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"><Sparkles className="h-4 w-4" />接住这个</button>
            <button onClick={() => onViewChange('jobs')} className="glass-button inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-slate-800"><BookmarkPlus className="h-4 w-4" />先看看</button>
          </div>
        </div>
        <KoiEditorial />
      </section>

      <div className="luck-ribbon">好运正在向这里聚集 · LUCK × ACTION = OFFER · 所有好运都向我袭来</div>

      <div className="mt-0 grid lg:grid-cols-[minmax(0,1fr)_248px]">
        <main className="border-r-0 border-slate-200 lg:border-r lg:pr-7">
          <section className="py-8">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div className="flex items-baseline gap-3"><h2 className="text-2xl font-semibold text-slate-950">优先关注</h2><span className="text-xs font-semibold text-[#a52a38]">/ TOP COMPANIES</span></div>
              <button onClick={() => onViewChange('jobs')} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#a52a38]">查看全部 <ArrowRight className="h-3.5 w-3.5" /></button>
            </div>
            <div className="divide-y divide-slate-200 border-y border-slate-200">
              <AnimatePresence initial={false}>
                {startHere.map((job, index) => {
                  const company = companies.find(c => c.id === job.companyId);
                  return <motion.article key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05 }} className="opportunity-row group grid gap-4 py-4 md:grid-cols-[54px_minmax(0,1fr)_auto] md:items-center">
                    <span className="opportunity-index">0{index + 1}</span>
                    <button onClick={() => company ? onSelectCompany(company) : onSelectJob(job)} className="min-w-0 text-left">
                      <div className="flex flex-wrap items-center gap-2"><span className="company-seal">{company?.logo || job.companyName.slice(0, 2)}</span><h3 className="text-lg font-semibold text-slate-950 group-hover:text-[#9e2634]">{job.companyName}</h3><span className="rounded-full bg-[#fff0ee] px-2 py-1 text-[10px] font-semibold text-[#a52a38]">{job.batch.replace('2027届秋招', '')}</span></div>
                      <p className="mt-1 text-xs text-slate-500">{getCityLabel(job, company)} · {company?.subIndustry || '校园招聘'}</p>
                      <p className="mt-1 line-clamp-1 text-[10px] text-slate-400">{getCardSummary(job)}</p>
                    </button>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <button onClick={() => company ? onSelectCompany(company) : onSelectJob(job)} className="btn-primary-glow inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold">查看公司 <ArrowRight className="h-3.5 w-3.5" /></button>
                      <button onClick={() => onStartJob(job.id)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-[#fff0ee] hover:text-[#a52a38]"><Plus className="h-3.5 w-3.5" />加入计划</button>
                    </div>
                  </motion.article>;
                })}
              </AnimatePresence>
            </div>
          </section>

          <section className="border-t border-slate-200 py-8">
            <div className="mb-4 flex items-center justify-between"><div><p className="text-[11px] font-semibold text-[#a52a38]">KEEP GOING</p><h2 className="mt-1 text-xl font-semibold text-slate-950">接着上次的进度</h2></div><button onClick={() => onViewChange('kanban')} className="text-xs font-semibold text-slate-500 hover:text-[#a52a38]">查看全部</button></div>
            {inProgress.length ? <div className="grid gap-3 sm:grid-cols-2">{inProgress.slice(0, 4).map(job => <button key={job.id} onClick={() => onSelectJob(job)} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-[#d9a0a5]"><span className="h-2.5 w-2.5 rounded-full bg-[#b52d3d]" /><span className="min-w-0 flex-1"><strong className="block text-sm text-slate-900">{job.companyName}</strong><span className="mt-1 block truncate text-xs text-slate-400">{job.nextAction || '继续推进，下一步随时补上'}</span></span><ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#a52a38]" /></button>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-7"><p className="text-sm font-semibold text-slate-800">还没有正在推进的公司</p><p className="mt-2 text-xs text-slate-500">上面随便挑一家加入计划，这里就热闹起来了。</p></div>}
          </section>
        </main>

        <aside className="space-y-0 lg:pl-6">
          <section className="border-b border-slate-200 py-8">
            <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-slate-900">今日进度 <span className="text-[10px] font-medium text-slate-400">/ TODAY</span></h2><span className="text-[10px] text-slate-400">行动即显化</span></div>
            <div className="mt-5 flex items-end gap-5"><div className="progress-poster"><img src="./assets/progress-paper-v2.webp" alt="" width="720" height="658" decoding="async" /><strong>{appliedCount}</strong><span>已投递</span></div><dl className="space-y-2 text-xs"><div className="flex gap-4"><dt className="font-bold text-lg text-slate-950">{inProgress.length}</dt><dd className="pt-1 text-slate-500">正在推进</dd></div><div className="flex gap-4"><dt className="font-bold text-lg text-slate-950">{favoriteCount}</dt><dd className="pt-1 text-slate-500">已收藏</dd></div></dl></div>
          </section>

          <section className="border-b border-slate-200 py-7">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold text-slate-900">待办提醒</h2><button onClick={() => onViewChange('calendar')} className="flex items-center text-[11px] text-slate-400 hover:text-[#a52a38]">查看全部 <ChevronRight className="h-3.5 w-3.5" /></button></div>
            <div className="space-y-1">{upcoming.length ? upcoming.map(event => {
              const isOverdue = hasPassedDate(event.date, today);
              return <div key={event.id} className="flex items-start gap-3 py-2.5"><button onClick={() => onToggleEventComplete(event.id)} className="mt-1 flex h-4 w-4 items-center justify-center rounded-full border border-[#cf6d77] text-transparent hover:text-[#a52a38]"><Check className="h-3 w-3" /></button><div className="min-w-0"><div className="flex items-center gap-1.5"><p className="min-w-0 truncate text-xs font-semibold text-slate-800">{event.title}</p>{isOverdue && <span className="shrink-0 rounded-full bg-[#fff0ee] px-1.5 py-0.5 text-[9px] font-bold text-[#a52a38]">待跟进</span>}</div><p className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">{getModeLabel(event.mode) && <span className="rounded-full border border-slate-200 bg-white px-1.5 py-0.5 font-bold text-slate-600">{getModeLabel(event.mode)}</span>}<span>{event.date} · {event.companyName}</span></p></div></div>;
            }) : <button onClick={() => onViewChange('calendar')} className="flex w-full items-start gap-3 py-3 text-left"><CalendarDays className="h-4 w-4 text-slate-300" /><span><strong className="block text-xs text-slate-700">暂时没有硬性节点</strong><span className="mt-1 block text-[10px] leading-5 text-slate-400">收到笔试、面试或明确日期后再记。</span></span></button>}</div>
          </section>

          <section className="py-7">
            <p className="text-[11px] font-semibold text-[#a52a38]">好运收件箱</p><p className="mt-2 whitespace-nowrap text-xs text-slate-500">{pendingInbox ? `${pendingInbox} 条新消息等你确认` : '暂无待确认消息。'}</p>{pendingInbox > 0 && <button onClick={() => onViewChange('inbox')} className="mt-3 text-xs font-semibold text-[#a52a38]">去看看 <ArrowRight className="inline h-3.5 w-3.5" /></button>}
          </section>
        </aside>
      </div>

      <section className="mt-3 grid gap-8 border-t border-slate-200 pt-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)]">
        <div className="min-w-0">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div><p className="text-[11px] font-semibold tracking-[.16em] text-[#a52a38]">AI / DAILY READ</p><h2 className="mt-1 text-xl font-semibold text-slate-950">今天顺手读两条</h2></div>
            <button onClick={() => onViewChange('news')} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#a52a38]">打开每日资讯 <ArrowRight className="h-3.5 w-3.5" /></button>
          </div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {newsItems.slice(0, 2).map(item => (
              <button key={item.id} onClick={() => onViewChange('news')} className="group block w-full py-4 text-left">
                <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#fff0ee] px-2 py-1 text-[10px] font-semibold text-[#a52a38]">{item.category || '资讯'}</span><span className="text-[10px] text-slate-400">{item.source}</span></div>
                <h3 className="mt-2 truncate text-sm font-semibold text-slate-900 group-hover:text-[#a52a38]">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.summary}</p>
              </button>
            ))}
            {!newsItems.length && <p className="py-6 text-xs text-slate-400">还没有资讯，之后可以从收集源里继续接入。</p>}
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div><p className="text-[11px] font-semibold tracking-[.16em] text-[#a52a38]">KNOWLEDGE / NOTES</p><h2 className="mt-1 text-xl font-semibold text-slate-950">最近沉淀</h2></div>
            <button onClick={() => onViewChange('knowledge')} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#a52a38]">查看知识库 <ArrowRight className="h-3.5 w-3.5" /></button>
          </div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {knowledgeCards.slice(0, 2).map(card => (
              <button key={card.id} onClick={() => onViewChange('knowledge')} className="group block w-full py-4 text-left">
                <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">{card.category}</span><span className="text-[10px] text-slate-400">{card.updatedAt}</span></div>
                <h3 className="mt-2 truncate text-sm font-semibold text-slate-900 group-hover:text-[#a52a38]">{card.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{card.content}</p>
              </button>
            ))}
            {!knowledgeCards.length && <p className="py-6 text-xs text-slate-400">还没有知识卡片，随手记一条就会出现在这里。</p>}
          </div>
        </div>
      </section>

      <footer className="manifest-footer">
        <div className="manifest-edition"><span>KOI DAILY</span><small>VOL. {new Date().getMonth() + 1}{String(new Date().getDate()).padStart(2, '0')}</small></div>
        <div className="manifest-wish"><strong>所有好运都向我袭来！</strong></div>
        <div className="manifest-barcode" aria-hidden="true"><i /><span>GET THE OFFER</span></div>
      </footer>
    </div>
  );
}
