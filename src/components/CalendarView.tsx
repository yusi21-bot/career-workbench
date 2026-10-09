/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  CheckCircle2, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { CalendarEvent, Job } from '../types';
import { hasPassedDate, isCurrentJob, localTodayIso } from '../opportunity-visibility';

interface CalendarViewProps {
  calendarEvents: CalendarEvent[];
  jobs: Job[];
  onToggleEventComplete: (id: string) => void;
  onAddEvent: (event: Omit<CalendarEvent, 'id' | 'completed'>) => void;
  onToast: (message: string, type: 'success' | 'info' | 'warning') => void;
}

export default function CalendarView({
  calendarEvents,
  jobs,
  onToggleEventComplete,
  onAddEvent,
  onToast
}: CalendarViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  const today = localTodayIso();
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(today.slice(0, 7));

  // New Event Form States
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'deadline' | 'test' | 'interview' | 'presentation' | 'custom'>('test');
  const [newDate, setNewDate] = useState(localTodayIso());
  const [newTime, setNewTime] = useState('14:00');
  const [newMode, setNewMode] = useState<'online' | 'offline' | 'hybrid'>('offline');
  const [newJobId, setNewJobId] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      onToast('日程标题不能为空', 'warning');
      return;
    }

    const linkedJob = jobs.find(j => j.id === newJobId);
    const companyName = linkedJob ? linkedJob.companyName : '个人日程';

    onAddEvent({
      title: newTitle,
      type: newType,
      date: newDate,
      time: newTime,
      mode: newMode,
      jobId: newJobId || undefined,
      companyName,
      notes: newNotes || undefined
    });

    setNewTitle('');
    setNewNotes('');
    setNewJobId('');
    setShowAddForm(false);
    onToast(`成功安排日程: ${newTitle}`, 'success');
  };

  const filteredEvents = calendarEvents.filter(event => {
    const matchType = filterType !== 'all' ? event.type === filterType : true;
    const matchCompleted = showCompleted ? true : !event.completed;
    return matchType && matchCompleted;
  }).sort((a, b) => {
    // Sort chronologically by date then time
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  const [visibleYear, visibleMonthNumber] = visibleMonth.split('-').map(Number);
  const monthDayCount = new Date(visibleYear, visibleMonthNumber, 0).getDate();
  const mondayOffset = (new Date(visibleYear, visibleMonthNumber - 1, 1).getDay() + 6) % 7;
  const calendarCells: Array<number | null> = [
    ...Array.from({ length: mondayOffset }, () => null),
    ...Array.from({ length: monthDayCount }, (_, index) => index + 1),
  ];
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const eventsByDate = filteredEvents.reduce((map, event) => {
    const items = map.get(event.date) || [];
    items.push(event);
    map.set(event.date, items);
    return map;
  }, new Map<string, CalendarEvent[]>());
  const selectedEvents = eventsByDate.get(selectedDate) || [];
  const monthEventCount = filteredEvents.filter(event => event.date.startsWith(`${visibleMonth}-`)).length;
  const pendingHistoryCount = filteredEvents.filter(event => hasPassedDate(event.date, today) && !event.completed).length;

  const isoForDay = (day: number) => `${visibleMonth}-${String(day).padStart(2, '0')}`;
  const moveMonth = (delta: number) => {
    const next = new Date(visibleYear, visibleMonthNumber - 1 + delta, 1);
    const nextMonth = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
    setVisibleMonth(nextMonth);
    setSelectedDate(`${nextMonth}-01`);
  };
  const returnToToday = () => {
    setVisibleMonth(today.slice(0, 7));
    setSelectedDate(today);
  };

  const eventDotColor = (type: CalendarEvent['type']) => {
    if (type === 'deadline') return 'bg-rose-500';
    if (type === 'test') return 'bg-amber-500';
    if (type === 'interview') return 'bg-purple-500';
    if (type === 'presentation') return 'bg-sky-500';
    return 'bg-slate-500';
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'deadline':
        return <span className="text-[10px] bg-rose-50 border border-rose-100 text-rose-600 px-2.5 py-0.5 rounded-full font-bold">截止时间</span>;
      case 'test':
        return <span className="text-[10px] bg-amber-50 border border-amber-100 text-amber-600 px-2.5 py-0.5 rounded-full font-bold">在线笔试</span>;
      case 'interview':
        return <span className="text-[10px] bg-purple-50 border border-purple-100 text-purple-600 px-2.5 py-0.5 rounded-full font-bold">面试约见</span>;
      case 'presentation':
        return <span className="text-[10px] bg-sky-50 border border-sky-100 text-sky-600 px-2.5 py-0.5 rounded-full font-bold">宣讲交流</span>;
      default:
        return <span className="text-[10px] bg-slate-50 border border-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">求职备忘</span>;
    }
  };

  const getModeBadge = (mode?: CalendarEvent['mode']) => {
    if (!mode) return null;
    const labels = { online: '线上', offline: '线下', hybrid: '线上＋线下' } as const;
    return (
      <span className="text-[10px] border border-slate-200 bg-white text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
        {labels[mode]}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-medium text-slate-900 tracking-widest flex items-center gap-2.5 uppercase">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            <span>日程提醒</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1.5 font-serif italic">
            先看整月安排，再点选日期查看当天的宣讲、截止、笔试与面试；历史事项会持续保留。
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>登记新日程/面试安排</span>
        </button>
      </div>

      {/* Manual Entry Form */}
      {showAddForm && (
        <form onSubmit={handleCreateEvent} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 max-w-2xl">
          <h3 className="text-xs font-bold text-slate-800">登记全新的笔面日程</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">日程标题</label>
              <input
                type="text"
                placeholder="例如：【技术初试】字节飞书前端团队"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">日程类别</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
              >
                <option value="test">在线笔试测评</option>
                <option value="interview">面试/复试/HR约谈</option>
                <option value="deadline">网申投递截止</option>
                <option value="presentation">宣讲会/双选会</option>
                <option value="custom">自定义备忘/求职习惯</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">日程日期</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">参与方式</label>
              <select
                value={newMode}
                onChange={(e) => setNewMode(e.target.value as 'online' | 'offline' | 'hybrid')}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
              >
                <option value="offline">线下</option>
                <option value="online">线上</option>
                <option value="hybrid">线上＋线下</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">具体时间</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">关联求职岗位 (可选)</label>
              <select
                value={newJobId}
                onChange={(e) => setNewJobId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
              >
                <option value="">-- 不关联 (普通备忘) --</option>
                {jobs.filter(job => isCurrentJob(job)).map(j => <option key={j.id} value={j.id}>{j.companyName} - {j.title}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">备忘与注意事项 (可写会议室链接等)</label>
            <input
              type="text"
              placeholder="例如：准备身份证，手边放张白纸和笔；飞书视频链接：..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-2 text-slate-500 hover:bg-slate-100 text-xs rounded-lg"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              安排日程
            </button>
          </div>
        </form>
      )}

      {/* Control Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>分类过滤:</span>
          </span>
          
          <div className="flex bg-white border border-slate-200 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded ${filterType === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
            >
              全部
            </button>
            <button
              onClick={() => setFilterType('deadline')}
              className={`px-3 py-1 rounded ${filterType === 'deadline' ? 'bg-rose-50 text-rose-600' : 'text-slate-500'}`}
            >
              截止
            </button>
            <button
              onClick={() => setFilterType('test')}
              className={`px-3 py-1 rounded ${filterType === 'test' ? 'bg-amber-50 text-amber-600' : 'text-slate-500'}`}
            >
              笔试
            </button>
            <button
              onClick={() => setFilterType('interview')}
              className={`px-3 py-1 rounded ${filterType === 'interview' ? 'bg-purple-50 text-purple-600' : 'text-slate-500'}`}
            >
              面试
            </button>
            <button
              onClick={() => setFilterType('presentation')}
              className={`px-3 py-1 rounded ${filterType === 'presentation' ? 'bg-sky-50 text-sky-600' : 'text-slate-500'}`}
            >
              宣讲/招聘会
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingHistoryCount > 0 && (
            <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600">
              {pendingHistoryCount} 项历史待跟进
            </span>
          )}
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <span>显示已完成的活动</span>
          </label>
        </div>
      </div>

      {/* Month overview + selected day details */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-500 text-xs font-semibold mt-3">在此过滤条件下没有找到日程活动</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] gap-5 items-start xl:items-stretch xl:h-[720px]">
          <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs xl:h-full xl:flex xl:flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-200">
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-lg font-display font-semibold text-slate-900">{visibleYear} 年 {visibleMonthNumber} 月</h3>
                  <span className="text-xs text-slate-400">{monthEventCount} 项安排</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">有彩色标记的日期表示当天有日程</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => moveMonth(-1)} aria-label="上个月" className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={returnToToday} className="h-8 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">今天</button>
                <button onClick={() => moveMonth(1)} aria-label="下个月" className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70">
              {['一', '二', '三', '四', '五', '六', '日'].map(day => (
                <div key={day} className="py-2 text-center text-[11px] font-bold text-slate-400">周{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 xl:flex-1 xl:auto-rows-fr">
              {calendarCells.map((day, index) => {
                if (!day) return <div key={`empty-${index}`} className="min-h-[86px] border-b border-r border-slate-100 bg-slate-50/30" />;
                const date = isoForDay(day);
                const dayEvents = eventsByDate.get(date) || [];
                const isSelected = date === selectedDate;
                const isToday = date === today;
                const isPastDay = hasPassedDate(date, today);
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`min-h-[86px] p-2.5 border-b border-r border-slate-100 text-left align-top transition-colors ${isSelected ? 'bg-rose-50/80 ring-1 ring-inset ring-rose-300' : 'hover:bg-slate-50'} ${isPastDay && !isSelected ? 'bg-slate-50/35' : ''}`}
                  >
                    <span className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-bold ${isToday ? 'bg-rose-600 text-white' : isSelected ? 'text-rose-700' : 'text-slate-700'}`}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {dayEvents.slice(0, 4).map(event => <span key={event.id} className={`w-1.5 h-1.5 rounded-full ${eventDotColor(event.type)}`} />)}
                        </div>
                        <span className="block text-[10px] font-semibold text-slate-500 truncate">{dayEvents.length} 项</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="px-5 py-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 text-[10px] font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full bg-rose-500" />截止</span>
              <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full bg-amber-500" />笔试</span>
              <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full bg-purple-500" />面试</span>
              <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full bg-sky-500" />宣讲/招聘会</span>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs xl:h-full xl:min-h-0 xl:flex xl:flex-col">
            <div className="flex items-end justify-between gap-3 pb-4 border-b border-slate-200 shrink-0">
              <div>
                <p className="text-[11px] font-bold text-rose-600 tracking-wider">当天安排</p>
                <h3 className="text-lg font-display font-semibold text-slate-900 mt-1">{Number(selectedDate.slice(5, 7))} 月 {Number(selectedDate.slice(8, 10))} 日</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">{selectedEvents.length} 项</span>
                {selectedEvents.length > 4 && <p className="mt-1 text-[10px] text-slate-400">面板内滚动查看全部</p>}
              </div>
            </div>

            <div className="xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:overscroll-contain xl:pr-2 xl:-mr-2">
              {selectedEvents.length === 0 ? (
              <div className="py-14 text-center xl:h-full xl:flex xl:flex-col xl:items-center xl:justify-center">
                <CalendarIcon className="w-8 h-8 text-slate-200 mx-auto" />
                <p className="text-xs text-slate-400 mt-3">这一天暂时没有安排</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {selectedEvents.map((event) => {
            const isCompleted = event.completed;
            const isPast = hasPassedDate(event.date, today);
            return (
              <div 
                key={event.id}
                className={`py-4 transition-all group ${isCompleted ? 'opacity-55' : ''}`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => onToggleEventComplete(event.id)}
                    className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isCompleted 
                        ? 'border-indigo-500 bg-indigo-500 text-white shadow-inner' 
                        : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/20'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {getEventBadge(event.type)}
                      {getModeBadge(event.mode)}
                      {isPast && (
                        <span className={`text-[10px] border px-2.5 py-0.5 rounded-full font-bold ${isCompleted ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-rose-200 bg-rose-50 text-rose-600'}`}>
                          {isCompleted ? '历史·已完成' : '历史·待跟进'}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{event.time}</span>
                      </span>
                    </div>

                    <h4 className={`text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors ${
                      isCompleted ? 'line-through text-slate-400' : ''
                    }`}>
                      {event.title}
                    </h4>

                    {event.notes && (
                      <p className="text-xs text-slate-500 font-mono leading-relaxed bg-slate-50 p-2 rounded-xl mt-1.5">
                        {event.notes}
                      </p>
                    )}
                    {event.url && (
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-500"
                      >
                        <span>查看报名或通知</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <span className="inline-flex text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                      {event.companyName}
                    </span>
                  </div>
                </div>
              </div>
            );
                })}
              </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
