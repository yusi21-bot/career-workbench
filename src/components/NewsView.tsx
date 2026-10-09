/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Newspaper, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  Bookmark, 
  Share2, 
  CheckCircle2,
  Calendar,
  Lightbulb
} from 'lucide-react';
import { NewsItem } from '../types';
import { AI_BUILDERS_DIGEST_META } from '../generated/ai-builders-news';

interface NewsViewProps {
  newsItems: NewsItem[];
  onClipNewsToInbox: (news: NewsItem) => void;
  onToast: (message: string, type: 'success' | 'info' | 'warning') => void;
}

export default function NewsView({
  newsItems,
  onClipNewsToInbox,
  onToast
}: NewsViewProps) {

  const [activeFilter, setActiveFilter] = React.useState('全部');

  const handleClip = (news: NewsItem) => {
    onClipNewsToInbox(news);
    onToast(`已将【${news.title}】收录到「求职收件箱」，后续可整理成面试素材。`, 'success');
  };

  const digestCount = newsItems.filter((item) => item.id.startsWith('ai-builders-')).length;
  const feedDate = AI_BUILDERS_DIGEST_META.feedGeneratedAt
    ? new Date(AI_BUILDERS_DIGEST_META.feedGeneratedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '待同步';
  const filters = ['全部', 'Agent', 'ToB', 'AI评测', '基础模型', '产品案例'];
  const filteredNews = newsItems.filter((news) => {
    if (activeFilter === '全部') return true;
    return news.tags.some((tag) => tag.includes(activeFilter)) || news.productLens?.includes(activeFilter);
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="border-b border-slate-200/60 pb-4">
        <h2 className="text-xl sm:text-2xl font-display font-medium text-slate-900 tracking-widest flex items-center gap-2.5 uppercase">
          <Newspaper className="w-5 h-5 text-indigo-600" />
          <span>AI 资讯</span>
        </h2>
        <p className="text-slate-500 text-xs mt-1.5 font-serif italic">
          只收录前沿 AI 技术进展、产品案例、Builder 观点，以及你积累的 AI 思考。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${activeFilter === filter
              ? 'border-indigo-500 bg-indigo-600 text-white'
              : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-600'}`}
          >
            {filter}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">显示 {filteredNews.length} / {newsItems.length} 张</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">主数据源</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">follow-builders</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">本次卡片</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{digestCount} 条累计知识卡</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Feed 更新时间</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{feedDate}</p>
        </div>
      </div>

      {/* Main Grid Layout list */}
      <div className="space-y-5">
        {filteredNews.map((news) => (
          <motion.div 
            key={news.id}
            whileHover={{ scale: 1.01, y: -2 }}
            className="bg-white border border-slate-200/60 hover:border-slate-300 rounded-2xl p-5 sm:p-6 premium-shadow premium-shadow-hover transition-all text-left"
          >
            {/* Left Content Column */}
            <div className="space-y-4">
              
              {/* Header row metadata */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
                  news.category === 'Builder观点' ? 'bg-indigo-50 text-indigo-600 border-indigo-100/50' :
                  news.category === 'AI深读' ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' :
                  news.category === '访谈播客' ? 'bg-sky-50 text-sky-600 border-sky-100/50' :
                  'bg-rose-50 text-rose-600 border-rose-100/50'
                }`}>
                  {news.category}
                </span>

                <span className="text-slate-400 font-mono flex items-center gap-1 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>发布时间: {news.publishTime}</span>
                </span>
                
                <span className="text-slate-300">·</span>
                <span className="text-slate-400 font-mono">来源: {news.source}</span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-display font-bold text-slate-900 tracking-tight leading-snug">
                {news.title}
              </h3>

              {/* Summary card body */}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <p className="mb-1 text-[10px] font-bold tracking-widest text-indigo-500">核心信息</p>
                  <p className="text-sm leading-relaxed text-slate-700">{news.coreIdea || news.summary}</p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                  <p className="mb-1 text-[10px] font-bold tracking-widest text-amber-600">产品 / 技术视角</p>
                  <p className="text-sm leading-relaxed text-slate-700">{news.productLens || '从用户问题、AI能力和验证指标三个角度继续追问。'}</p>
                </div>
              </div>

              {/* Tags and clips */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap gap-1.5">
                  {news.tags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200/40 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Clipping CTA Button */}
                <button
                  onClick={() => handleClip(news)}
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100/60 text-indigo-600 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>存为面试素材</span>
                </button>
              </div>

            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[10px] font-mono text-slate-400">{news.publishDate}</span>
              {news.url ? (
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-0.5"
                >
                  <span>查看原文</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : <span className="text-xs text-slate-400 font-semibold">暂无原文</span>}
            </div>

          </motion.div>
        ))}
      </div>

      <div className="border-t border-slate-200/70 pt-5 text-xs leading-relaxed text-slate-400">
        <p className="font-semibold text-slate-500">关于 follow-builders</p>
        <p className="mt-1">它持续整理 AI Builder 在 X、工程博客和播客中的公开内容；本站只把原始 feed 转成中文学习卡片，原文链接保留在每张卡片底部。新增内容会追加到资料库，不会替换历史卡片。</p>
      </div>
    </div>
  );
}
