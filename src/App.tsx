/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Calendar,
  Briefcase,
  BookOpen,
  FileText
} from 'lucide-react';

import { Company, Job, Source, InboxItem, Material, NewsItem, KnowledgeCard, ProjectExperience, CalendarEvent, InterviewReview } from './types';
import {CANONICAL_COMPANIES, PUBLIC_JOBS, PUBLIC_CALENDAR, REAL_ENRICHED_SOURCES, REAL_NEWS, REAL_KNOWLEDGE} from './public-data';
import {AI_BUILDERS_NEWS} from './generated/ai-builders-news';
import {companyCategories} from './company-taxonomy';
import {isCurrentInboxItem, isExpiredSourceLink} from './opportunity-visibility';
import {demoJobs, DEMO_CALENDAR, DEMO_INBOX, DEMO_MATERIALS, DEMO_PROJECTS} from './demo-personal';

import Sidebar from './components/Sidebar';
import TodayView from './components/TodayView';
import InboxView from './components/InboxView';
import SourcesView from './components/SourcesView';
import JobsAndCompaniesView from './components/JobsAndCompaniesView';
import KanbanView from './components/KanbanView';
import CalendarView from './components/CalendarView';
import MaterialsView from './components/MaterialsView';
import NewsView from './components/NewsView';
import KnowledgeView from './components/KnowledgeView';
import ProjectsView from './components/ProjectsView';
import InterviewReviewsView from './components/InterviewReviewsView';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

const readLocal = <T,>(key: string, fallback: T): T => {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) as T : fallback;
  } catch {
    return fallback;
  }
};

const readLocalCollection = <T,>(key: string, fallback: T[]): T[] => {
  const saved = readLocal<T[] | null>(key, null);
  return Array.isArray(saved) && saved.length > 0 ? saved : fallback;
};

// 每次底稿升级时，以 real-data 的完整字段为准，同时保留用户已经记录的状态。
const readCanonicalCollection = <T extends { id: string }>(key: string, canonical: T[], preserveKeys: Array<keyof T> = []): T[] => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(key) || 'null') as T[] | null;
    if (!Array.isArray(saved)) return canonical;
    const byId = new Map(saved.map(item => [item.id, item]));
    return canonical.map(item => {
      const old = byId.get(item.id);
      if (!old) return item;
      const preserved = preserveKeys.reduce((acc, field) => {
        if (old[field] !== undefined) acc[field] = old[field] as T[typeof field];
        return acc;
      }, {} as Partial<T>);
      return { ...item, ...preserved };
    });
  } catch {
    return canonical;
  }
};

// 底稿中新增的官方来源和日程必须进入已有工作台，同时不丢弃用户手动创建的条目。
const readCanonicalCollectionWithCustom = <T extends { id: string }>(key: string, canonical: T[], preserveKeys: Array<keyof T> = [], retiredIds: string[] = []): T[] => {
  const merged = readCanonicalCollection(key, canonical, preserveKeys);
  const saved = readLocal<T[]>(key, []);
  const canonicalIds = new Set(canonical.map(item => item.id));
  const retired = new Set(retiredIds);
  return [...merged, ...saved.filter(item => !canonicalIds.has(item.id) && !retired.has(item.id))];
};

const CANONICAL_JOBS = demoJobs(PUBLIC_JOBS);
const CANONICAL_CALENDAR_EVENTS = [...PUBLIC_CALENDAR, ...DEMO_CALENDAR];
const readJobsWithInterviewUpdates = (): Job[] => readCanonicalCollectionWithCustom('career-public-v1-jobs', CANONICAL_JOBS, ['isFavorite','isInApplicationTracker','status','nextAction','nextActionDate','connectedMaterials','connectedProjects','connectedNotes','interviewReviews','updatedDate']);

const mergeNewsItems = (...groups: NewsItem[][]): NewsItem[] => {
  const byId = new Map<string, NewsItem>();
  groups.flat().forEach((item) => {
    if (!byId.has(item.id)) byId.set(item.id, item);
  });
  return Array.from(byId.values()).sort((a, b) => {
    const dateCompare = b.publishDate.localeCompare(a.publishDate);
    if (dateCompare !== 0) return dateCompare;
    const aIsDigest = a.id.startsWith('ai-builders-') ? 1 : 0;
    const bIsDigest = b.id.startsWith('ai-builders-') ? 1 : 0;
    return bIsDigest - aIsDigest;
  });
};

// “AI 资讯”是专门的 AI 学习与观点流，不承担招聘公告、宣讲通知或求职待办。
// 招聘信息分别进入目标公司、日程和信息收件箱，避免因标题中出现 AI 就混入这里。
const isAiNewsItem = (item: NewsItem): boolean => {
  const aiCategories = new Set(['AI工具', 'AI行业', 'AI安全', 'AI深读', 'Builder观点', '访谈播客']);
  return item.id.startsWith('ai-builders-') || item.isIdea || aiCategories.has(item.category ?? '');
};

export default function App() {
  // Navigation & Shell
  const [currentView, setCurrentView] = useState<string>('today');
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Central States. Personal progress is kept locally between visits.
  const [companies, setCompanies] = useState<Company[]>(() => readCanonicalCollectionWithCustom('career-public-v1-companies', CANONICAL_COMPANIES, ['connectedNotes', 'connectedMaterials', 'connectedProjects']));
  const [jobs, setJobs] = useState<Job[]>(readJobsWithInterviewUpdates);
  const [sources, setSources] = useState<Source[]>(() => readCanonicalCollectionWithCustom('career-public-v1-sources', REAL_ENRICHED_SOURCES));
  const [inboxItems, setInboxItems] = useState<InboxItem[]>(() => readLocal('career-public-v1-inbox', DEMO_INBOX));
  const [materials, setMaterials] = useState<Material[]>(() => readLocal('career-public-v1-materials', DEMO_MATERIALS));
  const [newsItems, setNewsItems] = useState<NewsItem[]>(() => {
    const localNews = readLocalCollection('career-public-v1-news', []);
    const digestIds = new Set(AI_BUILDERS_NEWS.map((item) => item.id));
    const archivedDigestNews = localNews.filter((item) => item.id.startsWith('ai-builders-') && !digestIds.has(item.id));
    return mergeNewsItems(REAL_NEWS, AI_BUILDERS_NEWS, archivedDigestNews).filter(isAiNewsItem);
  });
  const [knowledgeCards, setKnowledgeCards] = useState<KnowledgeCard[]>(() => readLocalCollection('career-public-v1-knowledge', REAL_KNOWLEDGE));
  const [projects, setProjects] = useState<ProjectExperience[]>(() => readLocal('career-public-v1-projects', DEMO_PROJECTS));
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => readCanonicalCollectionWithCustom(
    'career-public-v1-calendar',
    CANONICAL_CALENDAR_EVENTS,
    ['completed', 'notes'],
    [
      'community2-event-aux-hust',
      'school-event-turing-fund-referral',
      'weekly-campus-event-singapore-lta',
      'weekly-campus-event-greater-bay-area-hust',
    ],
  ));

  useEffect(() => { window.localStorage.setItem('career-public-v1-jobs', JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { window.localStorage.setItem('career-public-v1-companies', JSON.stringify(companies)); }, [companies]);
  useEffect(() => { window.localStorage.setItem('career-public-v1-sources', JSON.stringify(sources)); }, [sources]);
  useEffect(() => { window.localStorage.setItem('career-public-v1-inbox', JSON.stringify(inboxItems)); }, [inboxItems]);
  useEffect(() => { window.localStorage.setItem('career-public-v1-materials', JSON.stringify(materials)); }, [materials]);
  useEffect(() => { window.localStorage.setItem('career-public-v1-news', JSON.stringify(newsItems)); }, [newsItems]);
  useEffect(() => { window.localStorage.setItem('career-public-v1-knowledge', JSON.stringify(knowledgeCards)); }, [knowledgeCards]);
  useEffect(() => { window.localStorage.setItem('career-public-v1-projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { window.localStorage.setItem('career-public-v1-calendar', JSON.stringify(calendarEvents)); }, [calendarEvents]);

  // Focus entity drawers
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [interviewReviewFocus, setInterviewReviewFocus] = useState<{ jobId: string; reviewId: string } | null>(null);

  // Quick Record Modal State
  const [quickRecordOpen, setQuickRecordOpen] = useState<boolean>(false);
  const [quickRecordType, setQuickRecordType] = useState<'calendar' | 'inbox' | 'knowledge' | 'material'>('inbox');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickContent, setQuickContent] = useState('');
  const [quickDate, setQuickDate] = useState(new Date().toISOString().slice(0, 10));

  // Toasts Notification system
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // 1. Recalculated counters
  const inboxPendingCount = inboxItems.filter((item) => item.status === 'pending' && isCurrentInboxItem(item)).length;

  // 2. State Mutators
  const handleToggleFavorite = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          const updated = !j.isFavorite;
          addToast(updated ? '已添加到收藏岗位' : '已移出收藏岗位', 'info');
          return { ...j, isFavorite: updated };
        }
        return j;
      })
    );
    // Sync active select
    if (selectedJob?.id === jobId) {
      setSelectedJob(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };

  const handleChangeJobStatus = (jobId: string, status: Job['status']) => {
    const actionDate = new Date().toLocaleDateString('en-CA');
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          return { ...j, status, isInApplicationTracker: true, updatedDate: actionDate };
        }
        return j;
      })
    );
    // Sync active drawer
    if (selectedJob?.id === jobId) {
      setSelectedJob(prev => prev ? { ...prev, status, isInApplicationTracker: true, updatedDate: actionDate } : null);
    }
  };

  const handleStartJob = (jobId: string) => {
    const target = jobs.find(job => job.id === jobId);
    handleChangeJobStatus(jobId, 'materials');
    addToast(`${target?.companyName || '这家公司'}已加入你的投递计划，慢慢来，第一步已经完成。`, 'success');
  };

  const handleUpdateNextAction = (jobId: string, action: string, date: string) => {
    const actionDate = new Date().toLocaleDateString('en-CA');
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          return { ...j, nextAction: action, nextActionDate: date, isInApplicationTracker: true, updatedDate: actionDate };
        }
        return j;
      })
    );
    // Sync active drawer
    if (selectedJob?.id === jobId) {
      setSelectedJob(prev => prev ? { ...prev, nextAction: action, nextActionDate: date, isInApplicationTracker: true, updatedDate: actionDate } : null);
    }
  };

  const handleSaveInterviewReview = (jobId: string, review: InterviewReview) => {
    const actionDate = new Date().toLocaleDateString('en-CA');
    setJobs((prev) => prev.map((job) => job.id === jobId
      ? {
          ...job,
          interviewReviews: (job.interviewReviews || []).map((item) => item.id === review.id ? review : item),
          updatedDate: actionDate,
        }
      : job));
    if (selectedJob?.id === jobId) {
      setSelectedJob((prev) => prev ? {
        ...prev,
        interviewReviews: (prev.interviewReviews || []).map((item) => item.id === review.id ? review : item),
        updatedDate: actionDate,
      } : null);
    }
  };

  const handleAddInterviewReview = (jobId: string, review: InterviewReview) => {
    const actionDate = new Date().toLocaleDateString('en-CA');
    setJobs((prev) => prev.map((job) => job.id === jobId
      ? {
          ...job,
          interviewReviews: [...(job.interviewReviews || []), review],
          status: 'interview',
          isInApplicationTracker: true,
          updatedDate: actionDate,
        }
      : job));
  };

  const handleToggleEventComplete = (id: string) => {
    setCalendarEvents((prev) =>
      prev.map((event) => {
        if (event.id === id) {
          const completed = !event.completed;
          addToast(completed ? '日程已标记为完成，状态更新！' : '日程已重置为待办', 'success');
          return { ...event, completed };
        }
        return event;
      })
    );
  };

  const handleSyncSource = (id: string) => {
    setSources((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            lastSyncTime: '等待真实来源接入',
            status: 'warning' as const
          };
        }
        return s;
      })
    );
  };

  const handleAddSource = (sourceData: Omit<Source, 'id' | 'lastSyncTime' | 'itemsCollected' | 'status'>) => {
    const newSource: Source = {
      ...sourceData,
      id: `s-${Date.now()}`,
      lastSyncTime: '未同步',
      itemsCollected: 0,
      status: 'healthy'
    };
    setSources((prev) => [...prev, newSource]);
  };

  const handleConvertInboxItem = (item: InboxItem, parsedJob: Partial<Job>) => {
    // 1. Mark inbox item as converted
    setInboxItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'converted' } : i))
    );

    // 2. Append new job
    const newJob: Job = {
      id: `j-converted-${Date.now()}`,
      companyId: 'c-1', // default fallback
      companyName: parsedJob.companyName || '未知企业',
      title: parsedJob.title || '未知岗位',
      direction: parsedJob.direction || '技术开发',
      city: parsedJob.city || '深圳',
      batch: '2027届秋招正式批',
      deadline: parsedJob.deadline || '',
      applyUrl: parsedJob.applyUrl || '',
      source: parsedJob.source || '收件箱转换',
      addedDate: '2026-07-14',
      updatedDate: '2026-07-14',
      description: parsedJob.description || '',
      highlight: parsedJob.highlight || '提取自收件箱原始同步线索',
      isFavorite: false,
      status: 'wish',
      connectedMaterials: [],
      connectedProjects: [],
      connectedNotes: []
    };

    setJobs((prev) => [newJob, ...prev]);

    if (newJob.deadline) {
      const newEvent: CalendarEvent = { id: `e-dead-${Date.now()}`, title: `${newJob.companyName} 网申截止`, type: 'deadline', date: newJob.deadline, time: '23:59', jobId: newJob.id, companyName: newJob.companyName, completed: false, notes: '根据已确认的截止日期创建。' };
      setCalendarEvents((prev) => [newEvent, ...prev]);
    }
  };

  const handleShelveInboxItem = (id: string) => {
    setInboxItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'shelved' } : i))
    );
    addToast('这条消息已暂时放到一边。', 'info');
  };

  const handleMarkDuplicateInboxItem = (id: string) => {
    setInboxItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'duplicate' } : i))
    );
    addToast('已标记为重复，不会再打扰你。', 'info');
  };

  const handleAddInboxItem = (itemData: Omit<InboxItem, 'id' | 'collectedAt' | 'status'>) => {
    const newItem: InboxItem = {
      ...itemData,
      id: `in-${Date.now()}`,
      collectedAt: '刚刚',
      status: 'pending'
    };
    setInboxItems((prev) => [newItem, ...prev]);
  };

  const handleAddJob = (jobData: Omit<Job, 'id' | 'addedDate' | 'updatedDate' | 'isFavorite'>) => {
    const newJob: Job = {
      ...jobData,
      id: `j-${Date.now()}`,
      addedDate: '2026-07-14',
      updatedDate: '2026-07-14',
      isFavorite: false
    };
    setJobs((prev) => [newJob, ...prev]);

    if (newJob.deadline) {
      const newEvent: CalendarEvent = {
      id: `e-dead-${Date.now()}`,
      title: `【网申截止】${newJob.companyName} - ${newJob.title}`,
      type: 'deadline',
      date: newJob.deadline,
      time: '23:59',
      jobId: newJob.id,
      companyName: newJob.companyName,
      completed: false,
        notes: '根据你填写的截止日期创建。'
      };
      setCalendarEvents((prev) => [newEvent, ...prev]);
    }
  };

  const handleAddEvent = (eventData: Omit<CalendarEvent, 'id' | 'completed'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `e-${Date.now()}`,
      completed: false
    };
    setCalendarEvents((prev) => [newEvent, ...prev]);
  };

  const handleAddMaterial = (materialData: any) => {
    const newMaterial: Material = {
      id: `m-${Date.now()}`,
      title: materialData.title,
      type: materialData.type,
      version: materialData.version,
      content: materialData.content,
      lastUpdated: '刚刚',
      connectedJobs: [],
      jobDirection: materialData.jobDirection || ''
    };
    setMaterials((prev) => [newMaterial, ...prev]);
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    addToast('这份材料已删除。', 'warning');
  };

  const handleClipNewsToInbox = (news: NewsItem) => {
    const newInbox: InboxItem = {
      id: `in-clip-${Date.now()}`,
      title: `【剪报收录】${news.title}`,
      content: news.content,
      source: `资讯剪报: ${news.source}`,
      sourceType: 'web',
      detectedCompany: '待判断',
      detectedJob: 'AI资讯待整理',
      detectedCity: '待核实',
      detectedDeadline: '待确认',
      detectedApplyUrl: '',
      status: 'pending',
      collectedAt: '2026-07-14 23:15',
      needsConfirmation: true
    };
    setInboxItems((prev) => [newInbox, ...prev]);
  };

  const handleAddKnowledgeCard = (cardData: any) => {
    const newCard: KnowledgeCard = {
      id: `k-${Date.now()}`,
      title: cardData.title,
      category: cardData.category,
      content: cardData.content,
      tags: ['个人心得', '精选备考'],
      source: '工作台随笔',
      updatedAt: '刚刚',
      connectedCompanies: cardData.connectedCompanyId ? [cardData.connectedCompanyId] : [],
      connectedJobs: []
    };
    setKnowledgeCards((prev) => [newCard, ...prev]);
  };

  const handleDeleteKnowledgeCard = (id: string) => {
    setKnowledgeCards((prev) => prev.filter((k) => k.id !== id));
    addToast('这条知识笔记已删除。', 'warning');
  };

  const handleAddProject = (projectData: any) => {
    const newProject: ProjectExperience = {
      id: `p-${Date.now()}`,
      title: projectData.title,
      role: projectData.role,
      period: '近期精修',
      type: projectData.type,
      background: projectData.situation || projectData.background || '待完善背景',
      task: projectData.task || '待完善任务',
      action: projectData.action || '待完善行动',
      result: projectData.result || '待完善结果',
      tools: [],
      starStory: projectData.resumeSnippet || '',
      resumeSnippet: projectData.resumeSnippet || '',
      connectedJobs: [],
      situation: projectData.situation || ''
    };
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    addToast('这段项目经历已删除。', 'warning');
  };

  // 3. Quick Record popup submit handler
  const handleQuickRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) {
      addToast('随手记标题不能为空', 'warning');
      return;
    }

    if (quickRecordType === 'calendar') {
      handleAddEvent({
        title: `【随手记日程】${quickTitle}`,
        type: 'custom',
        date: quickDate,
        time: '10:00',
        companyName: '求职备忘',
        notes: quickContent || '快速登记的求职随想备忘'
      });
      addToast('提醒已经记下了。', 'success');
    } else if (quickRecordType === 'inbox') {
      handleAddInboxItem({
        title: `【随手记线索】${quickTitle}`,
        content: quickContent || '无额外补充备注内容',
        source: '我的随手记',
        sourceType: 'manual',
        detectedCompany: quickTitle.slice(0, 4),
        detectedJob: quickTitle.slice(4) || '网申岗位',
        detectedCity: '北京',
        detectedDeadline: quickDate,
        detectedApplyUrl: '',
        needsConfirmation: true
      });
      addToast('线索已经放进收件箱，之后可以慢慢确认。', 'success');
    } else if (quickRecordType === 'knowledge') {
      handleAddKnowledgeCard({
        title: quickTitle,
        category: '面试表达',
        content: quickContent || '随想技术突破解析点'
      });
      addToast('知识笔记已保存。', 'success');
    } else {
      handleAddMaterial({
        title: quickTitle,
        type: 'intro',
        version: 'v1.0-随记稿',
        content: quickContent || '自我介绍/经历背书讲稿'
      });
      addToast('材料已保存。', 'success');
    }

    // Reset fields
    setQuickTitle('');
    setQuickContent('');
    setQuickRecordOpen(false);
  };

  // 4. Dispatch active screen
  const renderContent = () => {
    switch (currentView) {
      case 'today':
        return (
          <TodayView
            jobs={jobs}
            companies={companies}
            inboxItems={inboxItems}
            calendarEvents={calendarEvents}
            newsItems={newsItems}
            knowledgeCards={knowledgeCards}
            onViewChange={setCurrentView}
            onSelectJob={(job) => {
              setSelectedCompany(null);
              setSelectedJob(job);
              setCurrentView('jobs');
            }}
            onSelectCompany={(company) => {
              setSelectedJob(null);
              setSelectedCompany(company);
              setCurrentView('jobs');
            }}
            onToggleEventComplete={handleToggleEventComplete}
            onStartJob={handleStartJob}
          />
        );
      case 'inbox':
        return (
          <InboxView
            inboxItems={inboxItems}
            onConvert={handleConvertInboxItem}
            onShelve={handleShelveInboxItem}
            onMarkDuplicate={handleMarkDuplicateInboxItem}
            onAddInboxItem={handleAddInboxItem}
            onToast={addToast}
          />
        );
      case 'jobs':
        return (
          <JobsAndCompaniesView
            companies={companies}
            jobs={jobs}
            knowledgeCards={knowledgeCards}
            projects={projects}
            materials={materials}
            selectedCompany={selectedCompany}
            onSelectCompany={setSelectedCompany}
            selectedJob={selectedJob}
            onSelectJob={(job) => {
              setSelectedCompany(null);
              setSelectedJob(job);
              setCurrentView('jobs');
            }}
            onToggleFavorite={handleToggleFavorite}
            onChangeJobStatus={handleChangeJobStatus}
            onUpdateNextAction={handleUpdateNextAction}
            onAddJob={handleAddJob}
            onOpenInterviewReview={(jobId, reviewId) => {
              setInterviewReviewFocus({ jobId, reviewId });
              setSelectedJob(null);
              setCurrentView('interviews');
            }}
            onToast={addToast}
          />
        );
      case 'kanban':
        return (
          <KanbanView
            jobs={jobs}
            onSelectJob={(job) => {
              setSelectedCompany(null);
              setSelectedJob(job);
              setCurrentView('jobs');
            }}
            onChangeJobStatus={handleChangeJobStatus}
            onToast={addToast}
          />
        );
      case 'interviews':
        return (
          <InterviewReviewsView
            jobs={jobs}
            initialFocus={interviewReviewFocus}
            onClearFocus={() => setInterviewReviewFocus(null)}
            onSaveReview={handleSaveInterviewReview}
            onAddReview={handleAddInterviewReview}
            onToast={addToast}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            calendarEvents={calendarEvents}
            jobs={jobs}
            onToggleEventComplete={handleToggleEventComplete}
            onAddEvent={handleAddEvent}
            onToast={addToast}
          />
        );
      case 'materials':
        return (
          <MaterialsView
            materials={materials}
            onAddMaterial={handleAddMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            onToast={addToast}
          />
        );
      case 'library':
        return (
          <MaterialsView
            materials={materials}
            onAddMaterial={handleAddMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            onToast={addToast}
          />
        );
      case 'news':
        return (
          <NewsView
            newsItems={newsItems}
            onClipNewsToInbox={handleClipNewsToInbox}
            onToast={addToast}
          />
        );
      case 'knowledge':
        return (
          <KnowledgeView
            knowledgeCards={knowledgeCards}
            companies={companies}
            onAddCard={handleAddKnowledgeCard}
            onDeleteCard={handleDeleteKnowledgeCard}
            onToast={addToast}
          />
        );
      case 'projects':
        return (
          <ProjectsView
            projects={projects}
            onAddProject={handleAddProject}
            onDeleteProject={handleDeleteProject}
            onToast={addToast}
          />
        );
      case 'sources':
        return (
          <SourcesView
            sources={sources}
            onSyncSource={handleSyncSource}
            onAddSource={handleAddSource}
            onToast={addToast}
          />
        );
      default:
        return <div className="text-slate-500 py-12 text-center text-xs">模块开发中...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#f9f5ef] font-sans overflow-hidden text-slate-800">
      
      {/* Toast Notification Stack */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border flex items-start gap-3 animate-slideIn ${
              t.type === 'success' ? 'bg-white border-emerald-200 text-emerald-800' :
              t.type === 'warning' ? 'bg-white border-rose-200 text-rose-800' :
              'bg-white border-slate-200 text-slate-800'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-600" />}
            {t.type === 'warning' && <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-rose-600" />}
            {t.type === 'info' && <Info className="w-4.5 h-4.5 shrink-0 mt-0.5 text-indigo-600" />}
            <p className="text-xs font-semibold">{t.message}</p>
          </div>
        ))}
      </div>

      {/* Global Quick Record Dialog Popup */}
      {quickRecordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setQuickRecordOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" 
          />
          
          <form 
            onSubmit={handleQuickRecordSubmit}
            className="relative bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 animate-scaleUp text-slate-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-indigo-500 animate-spin-slow" />
                <h3 className="font-bold text-slate-900">随手记一下</h3>
              </div>
              <button 
                type="button"
                onClick={() => setQuickRecordOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector of entry types */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-2">这条内容放在哪里？</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setQuickRecordType('inbox')}
                  className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                    quickRecordType === 'inbox' 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  招聘线索
                </button>
                <button
                  type="button"
                  onClick={() => setQuickRecordType('calendar')}
                  className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                    quickRecordType === 'calendar' 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  日程提醒
                </button>
                <button
                  type="button"
                  onClick={() => setQuickRecordType('knowledge')}
                  className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                    quickRecordType === 'knowledge' 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  知识笔记
                </button>
                <button
                  type="button"
                  onClick={() => setQuickRecordType('material')}
                  className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                    quickRecordType === 'material' 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  求职材料
                </button>
              </div>
            </div>

            {/* Input values */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">
                  {quickRecordType === 'inbox' ? '招聘岗位快讯标题' :
                   quickRecordType === 'calendar' ? '笔试/面试日程主题' :
                   quickRecordType === 'knowledge' ? '知识笔记标题' : '材料名称'}
                </label>
                <input
                  type="text"
                  placeholder="快速填写关键大标题"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              {(quickRecordType === 'inbox' || quickRecordType === 'calendar') && (
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">目标截止或日程时间</label>
                  <input
                    type="date"
                    value={quickDate}
                    onChange={(e) => setQuickDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">补充内容</label>
                <textarea
                  placeholder="在这里随手粘贴，或随便写写。投递链接、群号、考点解析、或者是自我介绍随手记下的绝妙亮点词。"
                  value={quickContent}
                  onChange={(e) => setQuickContent(e.target.value)}
                  className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickRecordOpen(false)}
                className="px-3.5 py-2 text-slate-500 hover:bg-slate-100 text-xs rounded-lg font-medium"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Primary Sidebar Component */}
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => {
          if (view === 'interviews') setInterviewReviewFocus(null);
          setCurrentView(view);
        }}
        inboxPendingCount={inboxPendingCount}
        onQuickRecordOpen={() => setQuickRecordOpen(true)}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />

      {/* Content wrapper with scrollbars */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f9f5ef]">
        
        {/* Top Mobilizer Header */}
        <header className="lg:hidden h-14 border-b border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-30">
          <button 
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            <Menu className="w-6 h-6" />
          </button>

          <span className="font-bold text-sm tracking-wide text-slate-800">好运收件处</span>

          <img src="./assets/demo-avatar.svg" alt="示例头像" className="h-8 w-8 rounded-full object-cover shadow-md" />
        </header>

        {/* Dynamic center page content */}
        <div className={`flex-1 overflow-y-auto px-4 sm:px-7 max-w-[1480px] w-full mx-auto ${currentView === 'today' ? 'py-0' : 'py-6'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
