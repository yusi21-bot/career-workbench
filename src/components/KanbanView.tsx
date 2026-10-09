/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trello, 
  GitCommit, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  CheckCircle2, 
  Calendar,
  AlertCircle,
  Filter,
  Sparkles,
  Layers,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Job } from '../types';
import { isCurrentJob } from '../opportunity-visibility';

interface KanbanViewProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onChangeJobStatus: (id: string, status: Job['status']) => void;
  onToast: (message: string, type: 'success' | 'info' | 'warning') => void;
}

export default function KanbanView({
  jobs,
  onSelectJob,
  onChangeJobStatus,
  onToast
}: KanbanViewProps) {
  const [viewMode, setViewMode] = useState<'kanban' | 'timeline'>('timeline');
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'applied' | 'test' | 'interview'>('all');
  const currentJobs = jobs.filter(job => isCurrentJob(job) && (
    // “关注优先级”和“个人投递进度”是两套数据。只有明确加入投递跟踪，
    // 或已经进入备料/投递/测评/面试阶段的岗位，才出现在个人进度中。
    job.isInApplicationTracker === true
    || ['materials', 'applied', 'test', 'interview'].includes(job.status)
  ));

  const getTimelineDate = (job: Job) => {
    // 已进入投递流程的记录优先采用当前动作日期（投递/测评/面试）；
    // 关注与备料记录则采用最近更新时间，避免未来提醒日期改变历史归档。
    if (['applied', 'test', 'interview'].includes(job.status) && job.nextActionDate) {
      return job.nextActionDate;
    }
    return job.updatedDate || job.addedDate || job.nextActionDate || job.deadline;
  };

  // Custom columns setup for Kanban board
  const columns: { id: Job['status']; name: string; color: string; desc: string }[] = [
    { id: 'wish', name: '关注中', color: 'border-t-slate-400 bg-slate-50 text-slate-800', desc: '已收藏、待调研' },
    { id: 'materials', name: '备料中', color: 'border-t-amber-600 bg-amber-50/30 text-amber-900', desc: '修改简历、写故事' },
    { id: 'applied', name: '已网申', color: 'border-t-indigo-600 bg-indigo-50/30 text-indigo-900', desc: '官网已投、待响应' },
    { id: 'test', name: '笔试测评', color: 'border-t-rose-600 bg-rose-50/30 text-rose-900', desc: '在线测评、专业笔试' },
    { id: 'interview', name: '面试中', color: 'border-t-amber-700 bg-amber-50/40 text-amber-950', desc: '初试、复试、HR面' },
    { id: 'shelved', name: '暂时搁置', color: 'border-t-slate-300 bg-slate-100/50 text-slate-600', desc: '放弃、或不匹配' }
  ];

  const handleMove = (jobId: string, company: string, title: string, nextStatus: Job['status']) => {
    onChangeJobStatus(jobId, nextStatus);
    const colName = columns.find(c => c.id === nextStatus)?.name || '';
    onToast(`${company}已更新到“${colName}”。`, 'success');
  };

  // Filtered jobs for timeline mode
  const timelineJobs = currentJobs
    .filter((j) => {
      if (j.status === 'shelved' || j.status === 'ended') return false;
      if (timelineFilter === 'all') return true;
      return j.status === timelineFilter;
    })
    .sort((a, b) => {
      const dateA = getTimelineDate(a);
      const dateB = getTimelineDate(b);
      return dateB.localeCompare(dateA);
    });

  const timelineGroups = timelineJobs.reduce<Array<{ date: string; jobs: Job[] }>>((groups, job) => {
    const date = getTimelineDate(job);
    const latest = groups[groups.length - 1];
    if (latest?.date === date) {
      latest.jobs.push(job);
    } else {
      groups.push({ date, jobs: [job] });
    }
    return groups;
  }, []);

  const statusLabels: Record<Job['status'], { label: string; badgeClass: string }> = {
    wish: { label: '关注中', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
    materials: { label: '备料中', badgeClass: 'bg-amber-100/80 text-amber-900 border-amber-200' },
    applied: { label: '已网申', badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200 font-bold' },
    test: { label: '笔试测评', badgeClass: 'bg-rose-100 text-rose-800 border-rose-200 font-bold' },
    interview: { label: '面试中', badgeClass: 'bg-amber-200/90 text-amber-950 border-amber-300 font-bold' },
    shelved: { label: '已搁置', badgeClass: 'bg-slate-100 text-slate-500 border-slate-200' },
    ended: { label: '已结束', badgeClass: 'bg-slate-100 text-slate-400 border-slate-200' }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title & View Switcher Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <p className="mb-2 text-xs font-semibold text-indigo-600">个人进度</p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight flex items-center gap-2.5">
            <Trello className="w-5 h-5 text-indigo-600" />
            <span>我的投递</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 leading-6">
            只记住每家公司走到哪里、下一步做什么。不统计完成率，也不催你赶进度。
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-lg self-start md:self-auto shrink-0">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-md text-xs font-serif transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'kanban'
                ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Trello className="w-3.5 h-3.5" />
            <span>按阶段</span>
          </button>

          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-md text-xs font-serif transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'timeline'
                ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5 text-indigo-600" />
            <span>时间线</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Standard Kanban Board */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth">
          {columns.map((col) => {
            const colJobs = currentJobs.filter((j) => j.status === col.id);
            return (
              <div 
                key={col.id}
                className="w-72 shrink-0 bg-slate-50/80 border border-slate-200/90 rounded-xl p-4 flex flex-col snap-align-start h-[640px]"
              >
                {/* Column Header */}
                <div className={`border-t-4 ${col.color} pt-2 pb-3 mb-3 flex flex-col justify-start`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-slate-900">{col.name}</span>
                    <span className="font-mono text-[11px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded font-semibold">
                      {colJobs.length}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-sans mt-1">{col.desc}</span>
                </div>

                {/* Cards List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {colJobs.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-lg py-8 text-center text-xs text-slate-400 font-serif italic">
                      当前阶段暂无公司
                    </div>
                  ) : (
                    colJobs.map((job) => (
                      <motion.div
                        key={job.id}
                        onClick={() => onSelectJob(job)}
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-[#fffdfa] border border-[#e6d8c3] p-3.5 rounded-lg transition-all text-left space-y-2.5 cursor-pointer group premium-shadow-hover relative overflow-hidden"
                      >
                        {/* Subtle Vermilion Top Line Accent on Hover */}
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="space-y-1 pt-0.5">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                            <span>{job.batch.split('秋招')[1] || job.batch}</span>
                            <span className="truncate max-w-[100px] text-right font-serif">{job.city}</span>
                          </div>
                          
                          <h4 className="text-xs font-serif font-bold text-slate-900 leading-snug truncate group-hover:text-indigo-700 transition-colors">
                            {job.companyName}
                          </h4>
                          
                          <p className="text-xs font-medium text-slate-700 truncate font-sans">
                            {job.title}
                          </p>
                        </div>

                        {/* Next action block if present */}
                        {job.nextAction && (
                          <div className="p-2 bg-amber-50/60 border border-amber-200/60 rounded text-[10px] leading-relaxed text-slate-800">
                            <span className="font-serif font-bold text-indigo-700 block text-[9px] uppercase">下一步行动:</span>
                            <p className="line-clamp-2 mt-0.5 font-sans">{job.nextAction}</p>
                          </div>
                        )}

                        {/* Manual movement action select picker */}
                        <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[9px] font-mono font-medium text-slate-400 uppercase">阶段变动:</span>
                          <select
                            value={job.status}
                            onChange={(e) => handleMove(job.id, job.companyName, job.title, e.target.value as any)}
                            className="p-1 text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded cursor-pointer font-medium"
                          >
                            <option value="wish">想投递</option>
                            <option value="materials">准备材料</option>
                            <option value="applied">已网申</option>
                            <option value="test">笔试测评</option>
                            <option value="interview">面试中</option>
                            <option value="shelved">已搁置</option>
                          </select>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Compact application timeline */}
      {viewMode === 'timeline' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Sub-Filter Toolbar */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-serif font-bold text-slate-900">时间筛选：</span>
              
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  { id: 'all', label: '全部活跃节点' },
                  { id: 'applied', label: '已网申' },
                  { id: 'test', label: '笔试测评' },
                  { id: 'interview', label: '面试中' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTimelineFilter(item.id as any)}
                    className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer font-serif ${
                      timelineFilter === item.id
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-serif italic">
              共 {timelineJobs.length} 条记录
            </div>
          </div>

          {/* Application timeline */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs relative overflow-hidden">
            <div className="mb-8 border-b border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                  <span>投递时间线</span>
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-1">
                  按实际推进日期归档投递、测评和面试；同一天的记录沿一条竖向时间轴排列。
                </p>
              </div>
            </div>

            {timelineJobs.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-serif text-slate-500">暂无符合当前筛选条件的投递节点</p>
                <p className="text-xs text-slate-400 font-sans">先在【目标公司】中主动加入投递计划，这里才会显示；仅收藏或关注不会进入时间线。</p>
              </div>
            ) : (
              <div className="relative mx-auto max-w-4xl pb-2 pl-10 sm:pl-14">
                {/* 一条纵向主轴承载所有日期，日期只在分组节点出现一次。 */}
                <div className="absolute bottom-5 left-[15px] top-3 w-px bg-indigo-600/55 sm:left-[23px]" />

                <div className="space-y-10">
                  {timelineGroups.map((group, groupIndex) => (
                    <section key={group.date} className="relative">
                      <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-indigo-600 ring-4 ring-amber-100 shadow-sm sm:-left-[39px]" />

                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <span className="rounded-md bg-slate-900 px-3 py-1 text-xs font-bold tracking-tight text-amber-100 shadow-xs font-mono">
                          {group.date}
                        </span>
                        <span className="text-[11px] text-slate-400 font-serif">
                          当日 {group.jobs.length} 条推进记录
                        </span>
                      </div>

                      <div className="space-y-4">
                        {group.jobs.map((job, itemIndex) => {
                          const stage = statusLabels[job.status] || { label: '进行中', badgeClass: 'bg-slate-100' };
                          const sequence = timelineGroups
                            .slice(0, groupIndex)
                            .reduce((total, item) => total + item.jobs.length, 0) + itemIndex + 1;

                          return (
                            <div key={job.id} className="relative">
                              <div className="absolute -left-7 top-7 h-px w-7 bg-indigo-600/35 sm:-left-8 sm:w-8" />

                              <motion.div
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                onClick={() => onSelectJob(job)}
                                className="w-full bg-[#fffdfa] border border-[#e6d8c3] rounded-xl p-4 sm:p-5 transition-all cursor-pointer space-y-3 relative group overflow-hidden premium-shadow-hover"
                              >
                          {/* Subtle Vermilion Top Line Accent on Hover */}
                          <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {/* Corner Curator Tag */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white font-mono">
                                {sequence}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-serif border ${stage.badgeClass}`}>
                                {stage.label}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              {job.batch.includes('正式批') ? '正式批' : '提前批'}
                            </span>
                          </div>

                          {/* Company and Job Title */}
                          <div className="space-y-1">
                            <h4 className="text-sm font-serif font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                              {job.companyName}
                            </h4>
                            <p className="text-xs text-slate-700 font-sans font-medium line-clamp-1">
                              {job.title}
                            </p>
                          </div>

                          {/* Location */}
                          <div className="flex items-center text-[11px] text-slate-500 font-mono">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{job.city}</span>
                            </span>
                          </div>

                          {/* Next Action Highlight */}
                          {job.nextAction ? (
                            <div className="p-2.5 bg-amber-50/50 border border-amber-200/60 rounded text-[11px] text-slate-800 leading-relaxed font-sans">
                              <span className="font-serif font-bold text-indigo-700 block text-[10px] mb-0.5">下一步</span>
                              <p className="line-clamp-2">{job.nextAction}</p>
                            </div>
                          ) : (
                            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded text-[11px] text-slate-500 font-sans italic">
                              还没有设置下一步
                            </div>
                          )}

                          {/* Status Select Action Picker */}
                          <div 
                            className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="font-serif text-slate-500">更新阶段：</span>
                            <select
                              value={job.status}
                              onChange={(e) => handleMove(job.id, job.companyName, job.title, e.target.value as any)}
                              className="p-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded font-sans cursor-pointer"
                            >
                              <option value="wish">想投递</option>
                              <option value="materials">准备材料</option>
                              <option value="applied">已网申</option>
                              <option value="test">笔试测评</option>
                              <option value="interview">面试中</option>
                              <option value="shelved">已搁置</option>
                            </select>
                          </div>
                              </motion.div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
