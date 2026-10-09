/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  CheckCircle, 
  ChevronRight, 
  Trash2, 
  HelpCircle,
  Cpu,
  Star,
  Sparkles,
  Award
} from 'lucide-react';
import { KnowledgeCard, Company } from '../types';

interface KnowledgeViewProps {
  knowledgeCards: any[];
  companies: Company[];
  onAddCard: (card: any) => void;
  onDeleteCard: (id: string) => void;
  onToast: (message: string, type: 'success' | 'info' | 'warning') => void;
}

export default function KnowledgeView({
  knowledgeCards,
  companies,
  onAddCard,
  onDeleteCard,
  onToast
}: KnowledgeViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterCompanyId, setFilterCompanyId] = useState<string>('all');
  const [filterCompanyNature, setFilterCompanyNature] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'技术八股' | '面试真题' | '企业文化/业务研究' | '网申指南' | '求职心得'>('技术八股');
  const [newContent, setNewContent] = useState('');
  const [newCompanyId, setNewCompanyId] = useState('');

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      onToast('知识标题及内容不能为空', 'warning');
      return;
    }

    onAddCard({
      title: newTitle,
      category: newCategory,
      content: newContent,
      connectedCompanyId: newCompanyId || undefined
    });

    setNewTitle('');
    setNewContent('');
    setNewCompanyId('');
    setShowAddForm(false);
    onToast(`成功收录知识卡片: ${newTitle}`, 'success');
  };

  const categories = ['技术八股', '面试真题', '企业文化/业务研究', '网申指南', '求职心得'];

  const filteredCards = knowledgeCards.filter(card => {
    const matchCategory = filterCategory !== 'all' ? card.category === filterCategory : true;
    
    // Find the linked company
    const linkedCompany = companies.find(c => c.id === card.connectedCompanyId);
    
    const matchCompany = filterCompanyId !== 'all' ? card.connectedCompanyId === filterCompanyId : true;
    const matchCompanyNature = filterCompanyNature !== 'all' ? (linkedCompany?.nature === filterCompanyNature) : true;

    const matchSearch = searchQuery ? (
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (linkedCompany && linkedCompany.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (linkedCompany && linkedCompany.nature.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (linkedCompany && linkedCompany.industry.toLowerCase().includes(searchQuery.toLowerCase()))
    ) : true;

    return matchCategory && matchCompany && matchCompanyNature && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-medium text-slate-900 tracking-widest flex items-center gap-2.5 uppercase">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>我的知识库</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1.5 font-serif italic">
            沉淀面试、笔试中积累之精妙心得。不求繁芜广博，唯留最深省之关窍记忆，奉若拱璧。
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer btn-primary-glow"
        >
          <Plus className="w-4 h-4" />
          <span>撰写新的备考研究卡</span>
        </motion.button>
      </div>

      {/* Manual Card Form */}
      {showAddForm && (
        <form onSubmit={handleCreateCard} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 max-w-2xl">
          <h3 className="text-xs font-bold text-slate-800">撰写专属备战卡片</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">知识要点标题</label>
              <input
                type="text"
                placeholder="例如：腾讯看点一二面高频技术：Webpack构建调优要点"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">知识分类</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none font-medium"
              >
                <option value="技术八股">面试常见八股</option>
                <option value="面试真题">大厂面试真题回忆</option>
                <option value="企业文化/业务研究">公司架构与业务分析</option>
                <option value="网申指南">网申技巧指南</option>
                <option value="求职心得">心路历程与复盘</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">关联特定公司 (可选)</label>
            <select
              value={newCompanyId}
              onChange={(e) => setNewCompanyId(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none font-medium"
            >
              <option value="">-- 无关联 (通用知识点) --</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">卡片具体解析内容</label>
            <textarea
              placeholder="记录你的回答模板。如：STAR 叙事、问题剖析，或者八股经典解释..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full h-40 p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 text-xs cursor-pointer font-medium rounded-lg"
            >
              取消
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer btn-primary-glow"
            >
              收入脑海知识库
            </motion.button>
          </div>
        </form>
      )}

      {/* Control Filter row & search */}
      <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-200/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category List Filters */}
          <div className="flex flex-wrap gap-1.5">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilterCategory('all')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                filterCategory === 'all' 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/10' 
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
            >
              全部
            </motion.button>
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFilterCategory(cat)}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  filterCategory === cat 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/10' 
                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索知识要点/解析/公司属性..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none font-sans font-medium"
            />
          </div>
        </div>

        {/* Real-time filters by connected company attributes */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-200/40 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">按关联公司:</span>
            <select
              value={filterCompanyId}
              onChange={(e) => setFilterCompanyId(e.target.value)}
              className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none font-medium"
            >
              <option value="all">全部关联公司</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">按企业属性:</span>
            <select
              value={filterCompanyNature}
              onChange={(e) => setFilterCompanyNature(e.target.value)}
              className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none font-medium"
            >
              <option value="all">不限企业性质</option>
              <option value="民营大厂">民营大厂</option>
              <option value="央国企">央国企</option>
              <option value="外企">外企</option>
              <option value="独角兽/中型大厂">独角兽/中型大厂</option>
            </select>
          </div>

          {(filterCompanyId !== 'all' || filterCompanyNature !== 'all' || searchQuery !== '' || filterCategory !== 'all') && (
            <button
              onClick={() => {
                setFilterCategory('all');
                setFilterCompanyId('all');
                setFilterCompanyNature('all');
                setSearchQuery('');
              }}
              className="ml-auto text-[11px] text-indigo-600 hover:text-indigo-700 font-bold"
            >
              重置全部过滤条件
            </button>
          )}
        </div>
      </div>

      {/* Cards Display Grid layout */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-500 text-xs font-semibold mt-3 font-mono">脑中空明，暂无记录卡片</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card) => {
              const linkedCompany = companies.find(c => c.id === card.connectedCompanyId);
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={card.id}
                  whileHover={{ scale: 1.015, y: -3 }}
                  className="bg-white border border-slate-200/60 hover:border-slate-300 rounded-3xl p-6 premium-shadow premium-shadow-hover transition-all flex flex-col justify-between text-left"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 border rounded-md font-mono uppercase tracking-wider ${
                        card.category === '技术八股' ? 'bg-indigo-50 text-indigo-600 border-indigo-100/50' :
                        card.category === '面试真题' ? 'bg-amber-50 text-amber-600 border-amber-100/50' :
                        card.category === '企业文化/业务研究' ? 'bg-purple-50 text-purple-600 border-purple-100/50' :
                        'bg-slate-50 text-slate-600 border-slate-200/60'
                      }`}>
                        {card.category}
                      </span>

                      <button
                        onClick={() => onDeleteCard(card.id)}
                        className="p-1 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                        {card.title}
                      </h3>
                      
                      {/* Related company link */}
                      {linkedCompany && (
                        <div className="inline-flex items-center gap-1 mt-2 text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50/50 border border-indigo-100/30 px-2 py-0.5 rounded">
                          <span>关联公司:</span>
                          <span>{linkedCompany.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50/50 border border-slate-100/80 p-4 rounded-2xl">
                      <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-line leading-relaxed font-sans font-medium">
                        {card.content}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>最后复盘: {card.lastReviewed || card.updatedAt}</span>
                    
                    <button
                      onClick={() => {
                        onToast(`已复习 [${card.title}]！记忆深刻。`, 'success');
                      }}
                      className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-0.5 transition-colors"
                    >
                      <span>已背过</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
