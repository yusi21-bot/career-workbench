import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, BookOpen, FileText, FolderGit2, Newspaper } from 'lucide-react';
import { KnowledgeCard, Material, NewsItem, ProjectExperience } from '../types';

interface Props {
  materials: Material[];
  knowledgeCards: KnowledgeCard[];
  projects: ProjectExperience[];
  newsItems: NewsItem[];
  onViewChange: (view: string) => void;
}

export default function LibraryHubView({ materials, knowledgeCards, projects, newsItems, onViewChange }: Props) {
  const sections = [
    { id: 'materials', name: '求职材料', note: '简历、自我介绍、作品集和常用回答', count: materials.length, icon: FileText },
    { id: 'projects', name: '项目经历', note: '把项目故事整理成简历和面试都能用的版本', count: projects.length, icon: FolderGit2 },
    { id: 'knowledge', name: '知识笔记', note: '面试准备、公司研究和随手记下的想法', count: knowledgeCards.length, icon: BookOpen },
    { id: 'news', name: '资讯收藏', note: '值得之后再看、可以继续加工的招聘与行业内容', count: newsItems.length, icon: Newspaper },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <header className="max-w-2xl pt-2">
        <p className="mb-3 text-xs font-semibold text-indigo-600">资料与知识</p>
        <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">需要准备的东西，都放在这里。</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">不是另一个复杂的知识管理系统。只保留会在投递、笔试和面试里真正用到的内容。</p>
      </header>

      <div className="divide-y divide-slate-200 border-y border-slate-200">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.button
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 6 }}
              onClick={() => onViewChange(section.id)}
              className="group flex w-full items-center gap-4 py-6 text-left"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><Icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2"><strong className="text-base text-slate-900">{section.name}</strong><span className="text-xs text-slate-400">{section.count}</span></span>
                <span className="mt-1 block text-sm text-slate-500">{section.note}</span>
              </span>
              <ArrowUpRight className="h-5 w-5 text-slate-300 transition-colors group-hover:text-indigo-600" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
