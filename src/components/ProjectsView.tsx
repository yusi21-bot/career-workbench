/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FolderGit2, 
  Plus, 
  CheckCircle, 
  ChevronDown, 
  Trash2, 
  HelpCircle,
  FileEdit,
  Sparkles,
  Award
} from 'lucide-react';
import { ProjectExperience } from '../types';

interface ProjectsViewProps {
  projects: any[];
  onAddProject: (proj: any) => void;
  onDeleteProject: (id: string) => void;
  onToast: (message: string, type: 'success' | 'info' | 'warning') => void;
}

export default function ProjectsView({
  projects,
  onAddProject,
  onDeleteProject,
  onToast
}: ProjectsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'academic' | 'internship' | 'contest'>('all');

  // Form states (Structured by STAR method!)
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ProjectExperience['type']>('internship');
  const [newRole, setNewRole] = useState('');
  const [newSituation, setNewSituation] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newResult, setNewResult] = useState('');
  const [newResumeSnippet, setNewResumeSnippet] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newRole.trim()) {
      onToast('项目名称及角色承担不能为空', 'warning');
      return;
    }

    // Auto compile a resume snippet based on STAR if empty
    const compiledSnippet = newResumeSnippet.trim() || 
      `在 [${newTitle}] 中承担 [${newRole}] 角色。面对 [${newSituation.slice(0, 20)}...] 的业务场景，负责 [${newTask.slice(0, 20)}...]。通过实施 [${newAction.slice(0, 30)}...]，最终取得了 [${newResult.slice(0, 30)}...] 的卓越成果。`;

    onAddProject({
      title: newTitle,
      type: newType,
      role: newRole,
      situation: newSituation || '待确认背景场景',
      task: newTask || '待细化承担目标任务',
      action: newAction || '待记录实施动作细节',
      result: newResult || '待量化核心成果产出',
      resumeSnippet: compiledSnippet
    });

    setNewTitle('');
    setNewRole('');
    setNewSituation('');
    setNewTask('');
    setNewAction('');
    setNewResult('');
    setNewResumeSnippet('');
    setShowAddForm(false);
    onToast(`成功登记项目素材: ${newTitle}`, 'success');
  };

  const filteredProjects = projects.filter(proj => {
    if (activeTab === 'all') return true;
    return proj.type === activeTab;
  });

  const getProjTypeBadge = (type: string) => {
    switch (type) {
      case 'internship':
        return <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">校企实习经历</span>;
      case 'academic':
        return <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold">科研/实验室项目</span>;
      case 'contest':
        return <span className="text-[10px] bg-purple-50 border border-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold">竞赛与社会实践</span>;
      default:
        return <span className="text-[10px] bg-slate-50 border border-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">其他经历</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-medium text-slate-900 tracking-widest flex items-center gap-2.5 uppercase">
            <FolderGit2 className="w-5 h-5 text-indigo-600" />
            <span>履历华章•叙事舱</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1.5 font-serif italic">
            依循 STAR 黄金法则，梳理并沉淀平生最硬核之核心经历，以为应试、撰志之不竭泉源。
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer btn-primary-glow"
        >
          <Plus className="w-4 h-4" />
          <span>提炼新经历 (STAR法)</span>
        </motion.button>
      </div>

      {/* Manual STAR Form */}
      {showAddForm && (
        <form onSubmit={handleCreateProject} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 max-w-3xl">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>STAR 经典面试叙事结构提炼</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">经历/项目具体名称</label>
              <input
                type="text"
                placeholder="例如：北航软院大模型智能体协作平台研发"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">经历所属类别</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
              >
                <option value="internship">大厂/初创实习经历</option>
                <option value="academic">高校实验室/大作业项目</option>
                <option value="contest">学科竞赛 / 开源贡献</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">承担的主要角色/岗位</label>
              <input
                type="text"
                placeholder="例如：核心前端研发、架构组组长"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">简历一句话精修摘要 (若不写将依据STAR自动合成)</label>
              <input
                type="text"
                placeholder="例如：作为主要研发部署了多模块微前端架构，首屏耗时降低45%"
                value={newResumeSnippet}
                onChange={(e) => setNewResumeSnippet(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* STAR Fields */}
          <div className="border border-slate-200 bg-white rounded-2xl p-4 space-y-4">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">STAR 结构细节</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Situation (情境背景)</label>
                <textarea
                  placeholder="当时面临什么困难？为何要做此项目？"
                  value={newSituation}
                  onChange={(e) => setNewSituation(e.target.value)}
                  className="w-full h-20 p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Task (责任目标)</label>
                <textarea
                  placeholder="你负责的具体核心技术突破或业务指标是什么？"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="w-full h-20 p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Action (行动细节 - 重点)</label>
                <textarea
                  placeholder="你是如何一步步攻克困难的？采用了什么工具、算法、架构或方案？"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full h-24 p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Result (成果量化)</label>
                <textarea
                  placeholder="最终取得了什么收益？首屏加载耗时从 3s 减少到 0.8s？提升了 30% 性能？"
                  value={newResult}
                  onChange={(e) => setNewResult(e.target.value)}
                  className="w-full h-24 p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 text-slate-500 hover:bg-slate-100 text-xs"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              录入故事库
            </button>
          </div>
        </form>
      )}

      {/* Tabs list */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'all' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          全部经历 ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('internship')}
          className={`px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'internship' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          校企实习
        </button>
        <button
          onClick={() => setActiveTab('academic')}
          className={`px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'academic' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          科研学术
        </button>
        <button
          onClick={() => setActiveTab('contest')}
          className={`px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'contest' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          竞赛实践
        </button>
      </div>

      {/* Projects Cards List */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl">
          <FolderGit2 className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-500 text-xs font-semibold mt-3">在此分类下尚无任何经历沉淀</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProjects.map((proj) => (
            <motion.div 
              key={proj.id}
              whileHover={{ scale: 1.01, y: -2 }}
              className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 text-left space-y-6 premium-shadow premium-shadow-hover transition-all"
            >
              {/* Header row */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  {getProjTypeBadge(proj.type)}
                  <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 tracking-tight leading-snug">
                    {proj.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    承担角色: <span className="font-bold text-slate-800">{proj.role}</span>
                  </p>
                </div>

                <button
                  onClick={() => onDeleteProject(proj.id)}
                  className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* STAR details breakdown columns */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50/50 border border-slate-100/80 p-5 rounded-2xl text-xs sm:text-sm">
                
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider block">S · 情景背景</span>
                  <p className="text-slate-600 leading-relaxed font-sans font-medium">{proj.situation || proj.background}</p>
                </div>
                
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-teal-600 uppercase tracking-wider block">T · 目标任务</span>
                  <p className="text-slate-600 leading-relaxed font-sans font-medium">{proj.task}</p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-purple-600 uppercase tracking-wider block">A · 实施动作</span>
                  <p className="text-slate-600 leading-relaxed font-sans font-medium">{proj.action}</p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-wider block">R · 成果产出</span>
                  <p className="text-slate-600 leading-relaxed font-sans font-medium">{proj.result}</p>
                </div>

              </div>

              {/* Resume snippet card */}
              <div className="p-5 bg-indigo-50/30 border border-indigo-100/40 rounded-2xl space-y-2">
                <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-4 h-4 text-indigo-500" />
                  <span>简历/面试背书精细段落描述 (STAR 融会版)</span>
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans font-medium whitespace-pre-line">
                  {proj.resumeSnippet}
                </p>
              </div>

            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
