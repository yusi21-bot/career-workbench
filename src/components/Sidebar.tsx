import React from 'react';
import { motion } from 'motion/react';
import { Compass, Inbox, Briefcase, Layers3, CalendarDays, Library, Newspaper, Radio, X, Plus, Search, Flame, TrendingUp, ChevronDown, MessageSquareText } from 'lucide-react';

interface SidebarProps {
  currentView: string; onViewChange: (view: string) => void; inboxPendingCount: number;
  onQuickRecordOpen: () => void; searchQuery: string;
  onSearchQueryChange: (query: string) => void; mobileOpen: boolean; onMobileOpenChange: (open: boolean) => void;
}

export default function Sidebar({ currentView, onViewChange, inboxPendingCount, onQuickRecordOpen, searchQuery, onSearchQueryChange, mobileOpen, onMobileOpenChange }: SidebarProps) {
  const [showZodiac, setShowZodiac] = React.useState(false);
  const [horoscope, setHoroscope] = React.useState<HoroscopeData>(VERIFIED_SCORPIO_READING);
  React.useEffect(() => {
    if (!showZodiac) return;
    const controller = new AbortController();
    fetch('./horoscope-sample.html', { signal: controller.signal })
      .then(response => response.ok ? response.text() : Promise.reject(new Error('source unavailable')))
      .then(html => setHoroscope(parseXzwReading(html)))
      .catch(error => {
        if (error.name !== 'AbortError') setHoroscope(VERIFIED_SCORPIO_READING);
      });
    return () => controller.abort();
  }, [showZodiac]);
  const primaryItems = [
    { id: 'today', name: '今天', icon: Compass },
    { id: 'jobs', name: '目标公司', icon: Briefcase },
    { id: 'kanban', name: '我的投递', icon: Layers3 },
    { id: 'interviews', name: '面试复盘', icon: MessageSquareText },
    { id: 'calendar', name: '日程提醒', icon: CalendarDays },
    { id: 'library', name: '求职准备', icon: Library },
    { id: 'news', name: 'AI 资讯', icon: Newspaper },
  ];
  const supportItems = [
    { id: 'inbox', name: '信息收件箱', icon: Inbox },
    { id: 'sources', name: '信息收集源', icon: Radio },
  ];
  const activeView = ['materials', 'knowledge', 'projects'].includes(currentView) ? 'library' : currentView;
  const navigate = (id: string) => { onViewChange(id); onMobileOpenChange(false); };
  const renderItem = (item: { id: string; name: string; icon: React.ComponentType<{ className?: string }> }) => {
    const Icon = item.icon;
    const active = activeView === item.id;
    return <motion.button key={item.id} whileHover={{ x: 3 }} onClick={() => navigate(item.id)} className={`relative flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${active ? 'text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}>
      {active && <motion.span layoutId="active-nav" className="absolute inset-0 rounded-xl bg-indigo-50" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
      <span className="relative flex items-center gap-3"><Icon className={`h-4 w-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />{item.name}</span>
      {item.id === 'inbox' && inboxPendingCount > 0 && <span className="relative rounded-full bg-indigo-600 px-1.5 py-0.5 text-[9px] text-white">{inboxPendingCount}</span>}
    </motion.button>;
  };
  const content = (
    <div className="sidebar-surface flex h-full flex-col text-slate-700">
      <div className="flex items-center justify-between px-6 pb-7 pt-7">
        <button onClick={() => navigate('today')} className="group flex items-center gap-3 text-left">
          <div className="brand-orbit"><Flame className="h-5 w-5" /></div>
          <div><h1 className="brand-wordmark text-base font-bold text-slate-950">好运收件处</h1><p className="mt-0.5 text-[9px] font-semibold tracking-[.22em] text-slate-400">KOI MODE</p></div>
        </button>
        <button onClick={() => onMobileOpenChange(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 lg:hidden"><X className="h-4 w-4" /></button>
      </div>

      <div className="px-4">
        <div className="relative"><Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" /><input value={searchQuery} onChange={e => onSearchQueryChange(e.target.value)} placeholder="搜索公司或资料" className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-8 pr-3 text-xs outline-none transition focus:border-indigo-300 focus:bg-white" /></div>
      </div>

      <nav className="mt-6 min-h-0 flex-1 overflow-y-auto px-4 pb-3">
        <div className="space-y-1">{primaryItems.map(renderItem)}</div>
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="px-3 pb-2 text-[9px] font-bold tracking-[.18em] text-slate-400">辅助工具</p>
          <div className="space-y-1">{supportItems.map(renderItem)}</div>
        </div>
      </nav>

      <div className="space-y-3 border-t border-slate-100 p-4">
        <button onClick={onQuickRecordOpen} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700"><Plus className="h-3.5 w-3.5" />随手记一条</button>
        <div className="sidebar-profile flex w-full items-center gap-3 rounded-2xl p-3 text-left">
          <img src="./assets/demo-avatar.svg" alt="示例头像" className="h-10 w-10 rounded-full object-cover object-center" />
          <span className="min-w-0 flex-1"><strong className="text-sm text-slate-950">林知夏 · 示例</strong><span className="mt-0.5 block truncate text-[10px] text-slate-500">公开演示 · 个人记录均为虚构</span></span>
        </div>
        <div className="luck-score-wrap">
          <button type="button" onClick={() => setShowZodiac(value => !value)} className="luck-score-pill" aria-expanded={showZodiac}>
            <SparkleMark /><span>天蝎座 · 运势小卡</span><TrendingUp className="h-3.5 w-3.5" /><ChevronDown className={`h-3.5 w-3.5 transition-transform ${showZodiac ? 'rotate-180' : ''}`} />
          </button>
          {showZodiac && <div className="zodiac-note">
            <div className="flex items-center justify-between gap-2"><span className="zodiac-kicker">天蝎座 · 运势小卡</span><span className="zodiac-orbit">✦</span></div>
            <strong>{horoscope.tagline}</strong>
            <p className="zodiac-reading">{horoscope.description}</p>
            <div className="zodiac-facts"><span>幸运色 <b>{horoscope.color}</b></span><span>幸运数字 <b>{horoscope.luckyNumber}</b></span></div>
            <a href="https://www.xzw.com/fortune/scorpio/" target="_blank" rel="noreferrer">查看今日原始运势 ↗（此卡为展示样例）</a>
          </div>}
        </div>
      </div>
    </div>
  );
  return <><aside className="hidden h-screen w-[236px] shrink-0 lg:block">{content}</aside>{mobileOpen && <div onClick={() => onMobileOpenChange(false)} className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm lg:hidden" />}<div className={`fixed inset-y-0 left-0 z-50 w-[250px] transform transition-transform lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>{content}</div></>;
}

function SparkleMark() { return <span className="text-[#d73245]">✦</span>; }

interface HoroscopeData { tagline: string; description: string; color: string; luckyNumber: string; }

const VERIFIED_SCORPIO_READING: HoroscopeData = {
  tagline: '稳住内心节奏',
  description: '今日整体运势呈小吉态势，虽无天降惊喜，但各方面均能平稳推进。你内心的笃定感有所增强，面对日常事务时更易保持从容。不过需注意，部分环节可能存在隐性的小阻碍，需以细致态度应对。',
  color: '草绿',
  luckyNumber: '17',
};

function parseXzwReading(html: string): HoroscopeData {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const items = Array.from(document.querySelectorAll('dl dd li'));
  const readItem = (label: string) => items.find(item => item.textContent?.includes(label))?.textContent?.replace(label, '').trim() || '';
  const sourceDescription = document.querySelector('.c_cont .p1')?.parentElement?.querySelector('span')?.textContent
    ?.replace(/星.座.屋/g, '').replace(/\s+/g, ' ').trim() || '';
  const description = sourceDescription.length > 108 ? `${sourceDescription.slice(0, 108)}…` : sourceDescription;
  const reading = {
    tagline: readItem('短评：'),
    description,
    color: readItem('幸运颜色：'),
    luckyNumber: readItem('幸运数字：'),
  };
  if (!reading.tagline || !reading.description || !reading.color || !reading.luckyNumber) {
    throw new Error('invalid horoscope page');
  }
  return reading;
}
