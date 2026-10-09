/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  MapPin, 
  ExternalLink, 
  Star, 
  SlidersHorizontal, 
  Search, 
  X, 
  ChevronRight, 
  Clock, 
  Plus, 
  MessageSquareText,
} from 'lucide-react';
import { Company, Job, KnowledgeCard, ProjectExperience, Material } from '../types';
import { companyCategories, hasCompanyCategory, type CompanyCategory } from '../company-taxonomy';
import { isCurrentJob } from '../opportunity-visibility';
import CentralSoeView from './CentralSoeView';

type ReferralCodeItem = NonNullable<Job['referralCodes']>[number];

const CURATED_CARD_SUMMARIES: Record<string, string> = {
  '阿里系': '阿里云、淘天、淘宝闪购、阿里国际等业务已陆续启动 2027 届秋招，覆盖 AI、技术、产品与运营等方向。',
  '腾讯': '2027 届校园招聘已于 8 月 11 日启动，开放技术、产品、运营、设计、市场等方向，并新增多类 AI 岗位。',
  '字节跳动': '2027 届校园招聘已启动，技术与产品岗位占比超过 70%，新增 AI 全栈、AI Agent 等方向。',
  '京东': '2027 届 JD STAR 新星计划与 TET 管培生项目已启动，技术、采销及多元业务岗位开放。',
  '小米': '2027 届全球校园招聘已启动，覆盖研发、智能汽车、产品运营、设计、供应链与职能方向。',
  '拼多多 PDD': '2027 届校园招聘提前批开放，覆盖研发、算法、数据分析、产品和运营；提前批提供额外投递机会。',
};

const CURATED_SOURCE_NOTES: Record<string, string> = {
  '阿里系': '实际开放岗位和志愿规则以招聘官网显示为准。',
};

const KNOWN_CITY_LABELS: Record<string, string> = {
  '拼多多 PDD': '上海',
  'OPPO': '深圳 / 东莞 / 成都 / 上海 / 北京 / 西安 / 南京 / 武汉',
};

export const PRIORITY_COMPANY_NAMES = [
  '阿里系', '腾讯', '字节跳动', '华为', '美团', '京东', '拼多多 PDD', '百度',
  '小米', '大疆 DJI', '网易游戏', '快手', 'OPPO', '哔哩哔哩', '蚂蚁集团',
];

type CompanySection = 'evaluated' | 'priority' | 'internet' | 'soe' | 'finance' | 'hardware' | 'games' | 'other';

function getCompanySection(company: Company): Exclude<CompanySection, 'priority' | 'evaluated'> {
  const categories = companyCategories(company);
  if (categories.includes('央国企/事业单位') || company.nature === '央企国企' || company.nature === '国有控股') return 'soe';
  if (categories.includes('金融投资') || company.nature === '金融机构') return 'finance';
  if (categories.includes('游戏内容')) return 'games';
  if (categories.some(category => ['硬件制造', '新能源汽车', '半导体芯片', '能源'].includes(category))) return 'hardware';
  if (categories.some(category => ['互联网', '软件服务'].includes(category))) return 'internet';
  return 'other';
}

const COMPANY_NATURE_ORDER: Record<string, number> = {
  大型互联网: 0,
  央企国企: 1,
  国有控股: 1,
  金融机构: 2,
  外企: 3,
  民营企业: 4,
};

function getStatusLabel(status: Job['status']) {
  return status === 'wish' ? '未加入计划'
    : status === 'materials' ? '准备中'
    : status === 'applied' ? '已投递'
    : status === 'test' ? '笔试测评'
    : status === 'interview' ? '面试中'
    : status === 'shelved' ? '暂时搁置'
    : '已结束';
}

const DEADLINE_STATUS_META: Record<NonNullable<Job['deadlineVerification']>, { label: string; className: string }> = {
  official: { label: '官方确认', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  'institution-specific': { label: '分机构截止', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  rolling: { label: '滚动招聘', className: 'border-sky-200 bg-sky-50 text-sky-700' },
  'not-announced': { label: '官方未公布', className: 'border-slate-200 bg-slate-50 text-slate-600' },
  unverified: { label: '日期待核验', className: 'border-orange-200 bg-orange-50 text-orange-700' },
  closed: { label: '已截止', className: 'border-slate-200 bg-slate-100 text-slate-500' },
  'not-applicable': { label: '已进入流程', className: 'border-violet-200 bg-violet-50 text-violet-700' },
};

function deadlineDays(job: Job) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(job.deadline)) return null;
  const today = new Date();
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [year, month, day] = job.deadline.split('-').map(Number);
  return Math.round((new Date(year, month - 1, day).getTime() - localToday.getTime()) / 86400000);
}

function getDeadlineUrgency(job: Job) {
  const days = deadlineDays(job);
  if (days === null || job.deadlineVerification === 'closed') return null;
  if (days < 0) return { label: '已过期', className: 'bg-slate-100 text-slate-500' };
  if (days === 0) return { label: '今天截止', className: 'bg-rose-600 text-white' };
  if (days <= 3) return { label: `${days}天内截止`, className: 'bg-rose-100 text-rose-700' };
  if (days <= 7) return { label: `${days}天内截止`, className: 'bg-orange-100 text-orange-700' };
  if (days <= 14) return { label: `${days}天内截止`, className: 'bg-amber-100 text-amber-700' };
  return null;
}

function deadlineSortValue(job?: Job) {
  if (!job) return Number.MAX_SAFE_INTEGER;
  const days = deadlineDays(job);
  if (days === null || days < 0 || job.deadlineVerification === 'closed') return Number.MAX_SAFE_INTEGER;
  return days;
}

export function getCityLabel(job: Job, company?: Company) {
  if (job.city && job.city !== '多地') return job.city;
  const companyCities = (company?.city || []).filter(city => city && city !== '多地');
  if (companyCities.length) return companyCities.join(' / ');
  return KNOWN_CITY_LABELS[job.companyName] || '招聘通知未列明城市';
}

function cleanRecruitmentText(text: string) {
  return text
    .split(/\n\n信息归并说明：/)[0]
    .replace(/https?:\/\/\S+/g, '')
    .replace(/【(?:内推链接|投递链接|表格同步更新|腾讯文档)】?[^【\n]*/g, '')
    .replace(/(?:内推码|校招内推码)[:：]?\s*[A-Za-z0-9_-]+/g, '')
    .replace(/[🔥✨🚀✅📣📢🎓🌟⌚🧑‍🎯📍📮]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getCardSummary(job: Job) {
  const curated = CURATED_CARD_SUMMARIES[job.companyName];
  if (curated) return curated;
  const cleaned = cleanRecruitmentText(job.description || '');
  if (cleaned) return cleaned;
  return '招聘入口已收录；岗位方向与最新规则请打开官网查看。';
}

function getSourceNote(job: Job) {
  if (CURATED_SOURCE_NOTES[job.companyName]) return CURATED_SOURCE_NOTES[job.companyName];
  if (!job.highlight) return '';
  return cleanRecruitmentText(job.highlight)
    .replace(/^投递规则：\s*/, '')
    .replace(/^\s*(?:[一二三四五六七八九十]+|\d+)[.、．]\s*/, '')
    .trim();
}

function getJobDescription(job: Job) {
  return job.description
    .split(/\n\n信息归并说明：/)[0]
    .replace(/[；。]?另保留[^。]*(?:来源追溯|便于追溯)[^。]*。?/g, '。')
    .replace(/[^。；]*业务入口在详情中分别保留[。；]?/g, '')
    .replace(/\s+。/g, '。')
    .trim();
}

function getCompanyFocus(company: Company) {
  const focus = company.coreBusiness
    .replace(/当前保留[^。]*。?/g, '')
    .replace(/。+/g, '。')
    .trim();
  return focus || company.subIndustry || '招聘入口已收录，进入详情查看最新投递信息。';
}

function getCompanyProfile(company: Company) {
  const description = company.description.trim();
  if (!description || /已从\s*\d+\s*条|相关招聘片段归并|最新有效线索|信息归并说明|当前保留/.test(description)) {
    return getCompanyFocus(company);
  }
  return description;
}

export function groupReferralCodes(items: Job['referralCodes'] = []) {
  const grouped = new Map<string, { code: string; sources: ReferralCodeItem[] }>();
  items.forEach(item => {
    const key = item.code.trim().toUpperCase();
    if (!key) return;
    const current = grouped.get(key);
    if (current) current.sources.push(item);
    else grouped.set(key, { code: item.code.trim(), sources: [item] });
  });
  return Array.from(grouped.values());
}

interface JobsAndCompaniesViewProps {
  companies: Company[];
  jobs: Job[];
  knowledgeCards: KnowledgeCard[];
  projects: ProjectExperience[];
  materials: Material[];
  selectedCompany: Company | null;
  onSelectCompany: (company: Company | null) => void;
  selectedJob: Job | null;
  onSelectJob: (job: Job | null) => void;
  onToggleFavorite: (jobId: string) => void;
  onChangeJobStatus: (jobId: string, status: Job['status']) => void;
  onUpdateNextAction: (jobId: string, action: string, date: string) => void;
  onAddJob: (job: Omit<Job, 'id' | 'addedDate' | 'updatedDate' | 'isFavorite'>) => void;
  onOpenInterviewReview: (jobId: string, reviewId: string) => void;
  onToast: (message: string, type: 'success' | 'info' | 'warning') => void;
}

export default function JobsAndCompaniesView({
  companies,
  jobs,
  knowledgeCards,
  projects,
  materials,
  selectedCompany,
  onSelectCompany,
  selectedJob,
  onSelectJob,
  onToggleFavorite,
  onChangeJobStatus,
  onUpdateNextAction,
  onAddJob,
  onOpenInterviewReview,
  onToast
}: JobsAndCompaniesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [quickGroup, setQuickGroup] = useState<CompanySection>('evaluated');
  const [filterNature, setFilterNature] = useState<string>('all');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDeadline, setFilterDeadline] = useState<string>('all');
  const [filterFavorite, setFilterFavorite] = useState<boolean>(false);

  // Quick next action editor states (loaded when selectedJob opens)
  const [nextActionText, setNextActionText] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');

  // Add job modal
  const [showAddJob, setShowAddJob] = useState(false);
  const [addJobCompanyId, setAddJobCompanyId] = useState(companies[0]?.id || '');
  const [addJobTitle, setAddJobTitle] = useState('');
  const [addJobDirection, setAddJobDirection] = useState<Job['direction']>('产品研发');
  const [addJobCity, setAddJobCity] = useState('深圳');
  const [addJobBatch, setAddJobBatch] = useState<Job['batch']>('2027届秋招正式批');
  const [addJobDeadline, setAddJobDeadline] = useState('2026-10-31');
  const [addJobApplyUrl, setAddJobApplyUrl] = useState('');

  // Update next action local state when job changes
  React.useEffect(() => {
    if (selectedJob) {
      setNextActionText(selectedJob.nextAction || '');
      setNextActionDate(selectedJob.nextActionDate || '');
    }
  }, [selectedJob]);

  // Handle filter reset
  const handleResetFilters = () => {
    setFilterNature('all');
    setFilterIndustry('all');
    setFilterCity('all');
    setFilterStatus('all');
    setFilterDeadline('all');
    setFilterFavorite(false);
    setSearchQuery('');
    onToast('已重置所有筛选过滤条件', 'info');
  };

  // The company pool is the only discovery surface. Recruitment campaigns live inside companies.
  const filteredCompanies = companies.filter(company => {
    const companyJobs = jobs.filter(job => job.companyId === company.id && isCurrentJob(job));
    const matchSearch = searchQuery ? (
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.subIndustry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.coreBusiness.toLowerCase().includes(searchQuery.toLowerCase())
    ) : true;
    const matchGroup = searchQuery ? true : quickGroup === 'evaluated'
      ? Boolean(company.intelligence)
      : quickGroup === 'priority'
        ? PRIORITY_COMPANY_NAMES.includes(company.name) || companyJobs.some(job => job.isFavorite)
        : getCompanySection(company) === quickGroup;
    const matchNature = filterNature !== 'all' ? (company.nature === filterNature) : true;
    const matchIndustry = filterIndustry !== 'all' ? hasCompanyCategory(company, filterIndustry as CompanyCategory) : true;
    const matchCity = filterCity === 'all' || company.city.includes(filterCity) || companyJobs.some(job => job.city.includes(filterCity));
    const matchStatus = filterStatus === 'all' || companyJobs.some(job => job.status === filterStatus);
    const matchDeadline = filterDeadline === 'all' || companyJobs.some(job => {
      const days = deadlineDays(job);
      if (filterDeadline === 'urgent') return days !== null && days >= 0 && days <= 7;
      if (filterDeadline === 'dated') return days !== null && days >= 0;
      if (filterDeadline === 'rolling') return job.deadlineVerification === 'rolling';
      if (filterDeadline === 'unknown') return ['not-announced', 'unverified'].includes(job.deadlineVerification || 'unverified');
      return true;
    });
    const matchFavorite = !filterFavorite || companyJobs.some(job => job.isFavorite);
    return matchSearch && matchGroup && matchNature && matchIndustry && matchCity && matchStatus && matchDeadline && matchFavorite && companyJobs.length > 0;
  }).sort((a, b) => {
    const aDeadline = Math.min(...jobs.filter(job => job.companyId === a.id && isCurrentJob(job)).map(deadlineSortValue), Number.MAX_SAFE_INTEGER);
    const bDeadline = Math.min(...jobs.filter(job => job.companyId === b.id && isCurrentJob(job)).map(deadlineSortValue), Number.MAX_SAFE_INTEGER);
    if (aDeadline !== bDeadline) return aDeadline - bDeadline;
    const ai = PRIORITY_COMPANY_NAMES.indexOf(a.name);
    const bi = PRIORITY_COMPANY_NAMES.indexOf(b.name);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    const natureCompare = (COMPANY_NATURE_ORDER[a.nature] ?? 99) - (COMPANY_NATURE_ORDER[b.nature] ?? 99);
    if (natureCompare !== 0) return natureCompare;
    return a.name.localeCompare(b.name, 'zh-CN');
  });

  const handleSaveNextAction = () => {
    if (!selectedJob) return;
    onUpdateNextAction(selectedJob.id, nextActionText, nextActionDate);
    onToast(`${selectedJob.companyName}的下一步已记下。`, 'success');
  };

  const handleCreateJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addJobTitle.trim()) {
      onToast('岗位名称不能为空', 'warning');
      return;
    }

    const company = companies.find(c => c.id === addJobCompanyId);
    if (!company) return;

    onAddJob({
      companyId: addJobCompanyId,
      companyName: company.name,
      title: addJobTitle,
      direction: addJobDirection,
      city: addJobCity,
      batch: addJobBatch,
      deadline: addJobDeadline,
      applyUrl: addJobApplyUrl,
      source: '手动新增',
      description: '手动登记岗位的详细说明...',
      highlight: '个人手工标记的值得看机会',
      status: 'wish',
      connectedMaterials: [],
      connectedProjects: [],
      connectedNotes: []
    });

    setAddJobTitle('');
    setAddJobApplyUrl('');
    setShowAddJob(false);
    onToast(`${company.name}已加入公司库。`, 'success');
  };

  // Helper lists for filters
  const citiesList = Array.from(new Set([...companies.flatMap(company => company.city), ...jobs.map(job => job.city)])).filter(city => city && city !== '多地');
  const naturesList = Array.from(new Set(companies.map(c => c.nature)));
  const industriesList: CompanyCategory[] = ['互联网', '软件服务', '硬件制造', '游戏内容', '金融投资', '新能源汽车', '半导体芯片', '能源', '央国企/事业单位'];
  const quickGroups = [
    ['evaluated', '全部公司'], ['priority', '头部互联网'], ['internet', '泛互联网'], ['soe', '央国企'], ['finance', '银行 / 金融'],
    ['hardware', '硬件 / 制造'], ['games', '游戏 / 内容'], ['other', '其他']
  ] as const;
  const currentJobs = jobs.filter(job => isCurrentJob(job));
  const urgentDeadlineCount = currentJobs.filter(job => {
    const days = deadlineDays(job);
    return days !== null && days >= 0 && days <= 7;
  }).length;
  const confirmedDeadlineCount = currentJobs.filter(job => ['official', 'institution-specific'].includes(job.deadlineVerification || '')).length;
  const rollingDeadlineCount = currentJobs.filter(job => job.deadlineVerification === 'rolling').length;
  const unresolvedDeadlineCount = currentJobs.filter(job => ['not-announced', 'unverified'].includes(job.deadlineVerification || 'unverified')).length;

  return (
    <div className="space-y-6 relative animate-fadeIn">
      
      {/* Title Header */}
      <div className="border-b border-slate-200/60 pb-5">
        <p className="mb-2 text-xs font-semibold text-indigo-600">目标公司</p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950 flex items-center gap-2.5">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <span>先选公司，再看招聘</span>
        </h2>
        <p className="text-slate-500 text-sm mt-2 leading-6">先看上市与融资信息，再按具体岗位判断是否适合；未核实的金额不作推测。</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-3.5"><p className="text-[10px] font-bold text-rose-500">未来 7 天</p><p className="mt-1 text-xl font-bold text-rose-700">{urgentDeadlineCount}</p><p className="mt-0.5 text-[10px] text-rose-500">个招聘批次需要先处理</p></div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3.5"><p className="text-[10px] font-bold text-emerald-600">已核实日期</p><p className="mt-1 text-xl font-bold text-emerald-700">{confirmedDeadlineCount}</p><p className="mt-0.5 text-[10px] text-emerald-600">含分机构截止口径</p></div>
        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3.5"><p className="text-[10px] font-bold text-sky-600">滚动招聘</p><p className="mt-1 text-xl font-bold text-sky-700">{rollingDeadlineCount}</p><p className="mt-0.5 text-[10px] text-sky-600">招满即止，不能等统一日期</p></div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5"><p className="text-[10px] font-bold text-slate-500">未公布／待核验</p><p className="mt-1 text-xl font-bold text-slate-700">{unresolvedDeadlineCount}</p><p className="mt-0.5 text-[10px] text-slate-500">已明确标注，不冒充无截止</p></div>
      </div>

      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        
        {/* Company search and filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs">
            <Building2 className="h-3.5 w-3.5 text-indigo-600" />
            <span>{filteredCompanies.length} 家公司</span>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-xs min-w-[180px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索公司、行业或主营业务"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-medium shadow-xs"
            />
          </div>

          {/* Filters Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3.5 py-2 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer glass-button ${
              showFilters 
                ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>更多筛选</span>
          </motion.button>
        </div>

        {/* Right Manual Add Job */}
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddJob(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer btn-primary-glow"
        >
          <Plus className="w-4 h-4" />
          <span>新增招聘批次</span>
        </motion.button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {quickGroups.map(([id, label]) => (
          <button key={id} onClick={() => setQuickGroup(id)} className={`px-3 py-1.5 rounded-full border transition-all font-semibold ${quickGroup === id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4 animate-slideDown">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
              <span>筛选公司</span>
            </h4>
            <button 
              onClick={handleResetFilters}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              清除全部过滤
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
            {/* Nature filter */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1">企业性质</label>
              <select
                value={filterNature}
                onChange={(e) => setFilterNature(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="all">不限</option>
                {naturesList.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* Industry Filter */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1">公司标签</label>
              <select
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="all">不限</option>
                {industriesList.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>


            {/* City filter */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1">工作地点</label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="all">不限</option>
                {citiesList.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1">我的进度</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="all">不限</option>
                <option value="wish">未加入计划</option>
                <option value="materials">准备材料中</option>
                <option value="applied">已投递</option>
                <option value="test">笔试测评</option>
                <option value="interview">面试中</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1">截止状态</label>
              <select
                value={filterDeadline}
                onChange={(e) => setFilterDeadline(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="all">不限</option>
                <option value="urgent">7天内截止</option>
                <option value="dated">已有明确日期</option>
                <option value="rolling">滚动招聘</option>
                <option value="unknown">未公布／待核验</option>
              </select>
            </div>

            {/* Favorite Filter Toggle */}
            <div className="flex items-end pb-1.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={filterFavorite}
                  onChange={(e) => setFilterFavorite(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span>仅看已收藏公司</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Job Overlay block inside to maintain clean UI */}
      {showAddJob && (
        <form onSubmit={handleCreateJobSubmit} className="bg-indigo-50/40 border border-indigo-100 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-500" />
              <span>手工新增招聘批次</span>
            </h4>
            <button 
              type="button"
              onClick={() => setShowAddJob(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              取消
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-600 mb-1">选择目标公司</label>
              <select
                value={addJobCompanyId}
                onChange={(e) => setAddJobCompanyId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
              >
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-600 mb-1">岗位具体名称</label>
              <input
                type="text"
                placeholder="例如：商业分析规培生"
                value={addJobTitle}
                onChange={(e) => setAddJobTitle(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-600 mb-1">工作地点城市</label>
              <input
                type="text"
                placeholder="深圳/上海"
                value={addJobCity}
                onChange={(e) => setAddJobCity(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-600 mb-1">招聘大方向</label>
              <select
                value={addJobDirection}
                onChange={(e) => setAddJobDirection(e.target.value as any)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
              >
                <option value="产品研发">产品研发</option>
                <option value="技术开发">技术开发</option>
                <option value="商业分析">商业分析</option>
                <option value="运营策划">运营策划</option>
                <option value="设计创意">设计创意</option>
                <option value="职能管理">职能管理</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-600 mb-1">求职批次标签</label>
              <select
                value={addJobBatch}
                onChange={(e) => setAddJobBatch(e.target.value as any)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
              >
                <option value="2027届秋招正式批">2027届秋招正式批</option>
                <option value="2027届秋招提前批">2027届秋招提前批</option>
                <option value="2026届补录">2026届补录</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-600 mb-1">网申截止日期</label>
              <input
                type="date"
                value={addJobDeadline}
                onChange={(e) => setAddJobDeadline(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-600 mb-1">投递链接 URL (选填)</label>
              <input
                type="text"
                placeholder="https://..."
                value={addJobApplyUrl}
                onChange={(e) => setAddJobApplyUrl(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddJob(false)}
              className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 text-xs"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              保存招聘批次
            </button>
          </div>
        </form>
      )}

      {/* Company pool; 央国企使用集团层级专属视图。 */}
      {quickGroup === 'soe' ? (
        <CentralSoeView companies={companies} jobs={jobs} searchQuery={searchQuery} onSelectCompany={onSelectCompany} />
      ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-500 text-xs font-semibold mt-3">没有找到匹配条件的公司</p>
            <button onClick={handleResetFilters} className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700">重置筛选</button>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filteredCompanies.map((company) => {
                const companyJobs = jobs.filter(j => j.companyId === company.id && isCurrentJob(j));
                const primaryCampaign = [...companyJobs].sort((a, b) => deadlineSortValue(a) - deadlineSortValue(b))[0];
                const isPriority = PRIORITY_COMPANY_NAMES.includes(company.name);
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={company.id}
                    onClick={() => onSelectCompany(company)}
                    className="bg-white border border-slate-200/60 hover:border-slate-300 rounded-3xl p-6 premium-shadow premium-shadow-hover transition-all flex flex-col justify-between cursor-pointer group text-left"
                    whileHover={{ scale: 1.015, y: -3 }}
                  >
                    <div className="space-y-3.5">
                      {/* Header Row */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {company.logo}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-indigo-600">{company.name}</h3>
                            {isPriority && <span className="shrink-0 rounded-full bg-[#fff0ee] px-2 py-0.5 text-[9px] font-bold text-[#a52a38]">优先关注</span>}
                            {company.intelligence && <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold text-slate-500">{company.intelligence.verificationLevel === '基础判断' ? '资本待核实' : '资本已核实'}</span>}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200/60 rounded">
                              {company.nature}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100/50 rounded font-semibold">
                              {companyCategories(company).slice(0, 2).join(' · ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{company.subIndustry}</p>

                      {company.intelligence && (
                        <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 text-[10px] leading-4 text-slate-500 shadow-xs">
                          <p className="text-slate-700">{company.intelligence.capitalStatus}</p>
                          <p className="mt-1 line-clamp-2 text-slate-500">{company.intelligence.verificationLevel === '基础判断' ? '融资金额未核实' : company.intelligence.fundingSummary}</p>
                        </div>
                      )}

                      {/* Core Business */}
                      <div className="text-[11px] bg-slate-50 border border-slate-100 p-2.5 rounded-xl space-y-1">
                        <span className="font-mono font-bold text-slate-400 block uppercase text-[9px]">核心业务</span>
                        <p className="text-slate-600 line-clamp-2">{getCompanyFocus(company)}</p>
                      </div>
                      {primaryCampaign && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-3 text-[11px]">
                            <span className="truncate font-semibold text-slate-700">{primaryCampaign.batch}</span>
                            <span className={`shrink-0 rounded-full px-2 py-0.5 font-semibold ${primaryCampaign.status === 'wish' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-700'}`}>{getStatusLabel(primaryCampaign.status)}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            <span className={`rounded-full border px-2 py-0.5 font-bold ${DEADLINE_STATUS_META[primaryCampaign.deadlineVerification || 'unverified'].className}`}>
                              {DEADLINE_STATUS_META[primaryCampaign.deadlineVerification || 'unverified'].label}
                            </span>
                            <span className="font-mono font-bold text-slate-700">{primaryCampaign.deadline}</span>
                            {getDeadlineUrgency(primaryCampaign) && <span className={`rounded-full px-2 py-0.5 font-bold ${getDeadlineUrgency(primaryCampaign)?.className}`}>{getDeadlineUrgency(primaryCampaign)?.label}</span>}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Foot metadata */}
                    <div className="pt-4 mt-4 border-t border-slate-100/80 flex items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
                      <span>{company.city.filter(city => city !== '多地').slice(0, 3).join(' / ') || '城市以官网职位为准'}</span>
                      <span className="bg-indigo-50/60 text-indigo-600 px-2.5 py-0.5 rounded-full font-bold">
                        {companyJobs.length} 个招聘批次
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

      {/* DETAILS DRAWER: JOB DETAILS */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => onSelectJob(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-slideLeft">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 space-y-4">
              <button 
                onClick={() => onSelectJob(null)}
                className="absolute top-5 right-5 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>招聘批次详情</span>
                <span>/</span>
                <span>{selectedJob.batch}</span>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                  {selectedJob.companyName.slice(0, 2)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedJob.title}</h2>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{selectedJob.companyName}</span>
                    <span className="text-slate-300">·</span>
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{getCityLabel(selectedJob, companies.find(c => c.id === selectedJob.companyId))}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              
              {/* Highlight and action row */}
              <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-2">
                <span className="text-[10px] bg-indigo-100/70 text-indigo-700 px-2 py-0.5 rounded font-bold">
                  招聘信息速览
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {getCardSummary(selectedJob)}
                </p>
              </div>

              {getSourceNote(selectedJob) && (
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-2">
                  <span className="text-[10px] bg-amber-100/70 text-amber-800 px-2 py-0.5 rounded font-bold">
                    群内经验提醒 · 请以官网为准
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {getSourceNote(selectedJob).replace(/^群内提醒：\s*/, '')}
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">投递截止</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{selectedJob.deadline}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-1.5 text-[10px]">
                    <span className={`rounded-full border px-2.5 py-1 font-bold ${DEADLINE_STATUS_META[selectedJob.deadlineVerification || 'unverified'].className}`}>
                      {DEADLINE_STATUS_META[selectedJob.deadlineVerification || 'unverified'].label}
                    </span>
                    {getDeadlineUrgency(selectedJob) && <span className={`rounded-full px-2.5 py-1 font-bold ${getDeadlineUrgency(selectedJob)?.className}`}>{getDeadlineUrgency(selectedJob)?.label}</span>}
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-600">{selectedJob.deadlineNote || '投递前请进入具体职位页核对截止口径。'}</p>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-[10px] text-slate-400">
                  <span>{selectedJob.deadlineVerifiedAt ? `最近核验 ${selectedJob.deadlineVerifiedAt}` : '尚未记录核验时间'}</span>
                  {selectedJob.deadlineSourceUrl && <a href={selectedJob.deadlineSourceUrl} target="_blank" rel="noreferrer" className="font-bold text-indigo-600 hover:text-indigo-700">查看截止依据</a>}
                </div>
              </div>

              {/* Status and Actions block */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">我的进度</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">投递进程</label>
                    <select
                      value={selectedJob.status}
                      onChange={(e) => onChangeJobStatus(selectedJob.id, e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                    >
                      <option value="wish">刚发现/想投</option>
                      <option value="materials">准备材料中</option>
                      <option value="applied">已网申/已投递</option>
                      <option value="test">笔试测评</option>
                      <option value="interview">面试中</option>
                      <option value="shelved">暂时搁置</option>
                      <option value="ended">已关闭</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">收藏状态</label>
                    <button
                      onClick={() => onToggleFavorite(selectedJob.id)}
                      className={`w-full p-2.5 border rounded-xl flex items-center justify-center gap-1.5 transition-all font-semibold ${
                        selectedJob.isFavorite 
                          ? 'bg-amber-50 text-amber-600 border-amber-200' 
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${selectedJob.isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                      <span>{selectedJob.isFavorite ? '已收藏这家公司' : '收藏这家公司'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Next Action Setter */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold">
                  <Clock className="w-4 h-4" />
                  <span>设置本轮招聘的下一步</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="例如：发邮件咨询内推、刷两套笔试案例"
                      value={nextActionText}
                      onChange={(e) => setNextActionText(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={nextActionDate}
                      onChange={(e) => setNextActionDate(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNextAction}
                    className="px-3.5 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg hover:bg-slate-800 transition-all"
                  >
                    保存下一步计划
                  </button>
                </div>
              </div>

              {/* Job description detail */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">本轮招聘信息</h4>
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl">
                  <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                    {getJobDescription(selectedJob)}
                  </p>
                </div>
              </div>

              {/* The drawer is only a preview. Long-form review work lives in its own full-width workspace. */}
              {selectedJob.interviewReviews && selectedJob.interviewReviews.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <MessageSquareText className="w-4 h-4 text-indigo-600" />
                      <span>面试复盘</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">{selectedJob.interviewReviews.length} 次记录</span>
                  </div>

                  {selectedJob.interviewReviews.map((review) => (
                    <div key={review.id} className="rounded-2xl border border-indigo-100 bg-indigo-50/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{review.round} · {review.date}</p>
                          <p className="mt-1 text-[10px] text-slate-400 font-mono">{review.source}</p>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-700 bg-white border border-indigo-100 px-2 py-1 rounded-lg">{review.result}</span>
                      </div>
                      <p className="mt-3 line-clamp-3 text-xs leading-6 text-slate-600">{review.summary || '尚未填写整体复盘。'}</p>
                      <button
                        onClick={() => onOpenInterviewReview(selectedJob.id, review.id)}
                        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50"
                      >
                        打开完整复盘 <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Referral codes: only keep unique actionable codes in the user view. */}
              {selectedJob.referralCodes && selectedJob.referralCodes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">可用内推码</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {groupReferralCodes(selectedJob.referralCodes).map(({ code }) => (
                      <div key={code} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                        <code className="text-xs font-bold text-indigo-700">{code}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Knowledge Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>关联笔记</span>
                </h4>
                
                {selectedJob.connectedNotes.length === 0 ? (
                  <p className="text-slate-400 text-xs italic bg-slate-50/30 p-3 rounded-xl border border-slate-100 text-center">暂未关联备考知识点</p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedJob.connectedNotes.map((noteId) => {
                      const note = knowledgeCards.find(n => n.id === noteId);
                      if (!note) return null;
                      return (
                        <div key={noteId} className="p-3 border border-slate-200 hover:border-indigo-200 rounded-xl hover:bg-indigo-50/10 transition-all text-left">
                          <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-md">{note.category}</span>
                          <h5 className="text-xs font-bold text-slate-800 mt-1.5">{note.title}</h5>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-normal">{note.content}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Linked Resumes / Materials */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>求职材料</span>
                </h4>
                
                {selectedJob.connectedMaterials.length === 0 ? (
                  <p className="text-slate-400 text-xs italic bg-slate-50/30 p-3 rounded-xl border border-slate-100 text-center">无关联求职资料</p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedJob.connectedMaterials.map((matId) => {
                      const mat = materials.find(m => m.id === matId);
                      if (!mat) return null;
                      return (
                        <div key={matId} className="p-3 border border-slate-200 rounded-xl bg-slate-50/40 text-left">
                          <h5 className="text-xs font-bold text-slate-800 flex items-center justify-between">
                            <span>{mat.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-normal">版本: {mat.version}</span>
                          </h5>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 font-mono leading-normal">{mat.content}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Linked Projects */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>面试素材</span>
                </h4>
                
                {selectedJob.connectedProjects.length === 0 ? (
                  <p className="text-slate-400 text-xs italic bg-slate-50/30 p-3 rounded-xl border border-slate-100 text-center">暂未关联项目经历</p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedJob.connectedProjects.map((projId) => {
                      const proj = projects.find(p => p.id === projId);
                      if (!proj) return null;
                      return (
                        <div key={projId} className="p-3 border border-slate-200 rounded-xl text-left hover:bg-slate-50 transition-all">
                          <span className="text-[10px] font-bold text-purple-500 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md">{proj.type}</span>
                          <h5 className="text-xs font-bold text-slate-800 mt-1.5">{proj.title}</h5>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 font-mono leading-normal">{proj.resumeSnippet}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Footer buttons */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
              <a
                href={selectedJob.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-indigo-500/10 transition-all flex items-center gap-1.5"
              >
                <span>前往官方网申</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

          </div>
        </div>
      )}

      {/* DETAILS DRAWER: COMPANY DETAILS */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => onSelectCompany(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-slideLeft">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 space-y-4">
              <button 
                onClick={() => onSelectCompany(null)}
                className="absolute top-5 right-5 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>公司主页</span>
                <span>/</span>
                <span>{selectedCompany.nature}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${selectedCompany.logoColor} text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0`}>
                  {selectedCompany.logo}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedCompany.name}</h2>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>主营: {selectedCompany.subIndustry}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              
              {/* Profile */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">公司概况</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {getCompanyProfile(selectedCompany)}
                </p>
              </div>

              {selectedCompany.intelligence && (
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 to-slate-800 p-4 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">公司资本信息</p><h4 className="mt-1 text-base font-bold">上市与融资</h4></div>
                    <span className="rounded-xl bg-white/10 px-3 py-2 text-[10px] text-slate-200">{selectedCompany.intelligence.verificationLevel === '基础判断' ? '待核实' : '有公开来源'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="rounded-xl bg-white/5 p-2.5"><span className="text-slate-400">上市状态</span><p className="mt-1 leading-4 text-slate-100">{selectedCompany.intelligence.capitalStatus}</p></div>
                    <div className="rounded-xl bg-white/5 p-2.5"><span className="text-slate-400">招聘城市</span><p className="mt-1 leading-4 text-slate-100">{selectedCompany.intelligence.cityFit}</p></div>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3"><p className="text-[10px] font-semibold text-slate-400">融资金额 / 资本来源</p><p className="mt-1 text-[11px] leading-5 text-slate-200">{selectedCompany.intelligence.verificationLevel === '基础判断' ? '融资金额未核实；上市公司、银行及国央企通常不适用创业融资轮次。' : selectedCompany.intelligence.fundingSummary}</p></div>
                  <div className="rounded-xl bg-white/5 p-3"><p className="text-[10px] font-semibold text-slate-400">岗位匹配提示 · 不代表公司等级</p><p className="mt-1 text-[11px] leading-5 text-slate-200">{selectedCompany.intelligence.rationale}</p></div>
                  <div><p className="text-[10px] font-semibold text-slate-400">需要核对</p><ul className="mt-1 space-y-1 text-[11px] leading-5 text-slate-300">{selectedCompany.intelligence.risks.map(risk => <li key={risk}>· {risk}</li>)}</ul></div>
                  <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
                    <span className="text-[9px] text-slate-500">{selectedCompany.intelligence.verificationLevel === '基础判断' ? '公司资本信息待逐家核实' : `公开资料核对于 ${selectedCompany.intelligence.verifiedAt}`}</span>
                    {selectedCompany.intelligence.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-semibold text-slate-200 hover:bg-white/20">{source.title}</a>)}
                  </div>
                </div>
              )}

              {/* Core Business product detail */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">核心业务</h4>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold p-4 bg-indigo-50/20 border border-indigo-100/50 rounded-2xl">
                  {getCompanyFocus(selectedCompany)}
                </p>
              </div>

              {/* Support cities */}
              <div className="flex items-center justify-between text-xs p-3.5 bg-slate-50 border border-slate-100 rounded-xl font-mono text-slate-600">
                <span>主要招聘城市</span>
                <span className="font-bold text-slate-800">{selectedCompany.city.join(' / ')}</span>
              </div>

              {/* Current Jobs inside Company */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>当前校招项目 ({jobs.filter(j => j.companyId === selectedCompany.id && isCurrentJob(j)).length})</span>
                  <span className="text-[10px] text-slate-400">查看招聘详情</span>
                </h4>
                
                <div className="space-y-2">
                  {jobs.filter(j => j.companyId === selectedCompany.id && isCurrentJob(j)).map(job => (
                    <div 
                      key={job.id}
                      onClick={() => {
                        onSelectJob(job);
                        onSelectCompany(null);
                      }}
                      className="p-3 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl cursor-pointer transition-all flex items-center justify-between text-left"
                    >
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-800">{job.title}</h5>
                        <p className="text-[11px] text-slate-400 mt-1 font-mono">
                          {job.city} · {job.batch}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className={`rounded-full border px-2 py-0.5 font-bold ${DEADLINE_STATUS_META[job.deadlineVerification || 'unverified'].className}`}>{DEADLINE_STATUS_META[job.deadlineVerification || 'unverified'].label}</span>
                          <span className="font-mono font-bold text-slate-600">{job.deadline}</span>
                          {getDeadlineUrgency(job) && <span className={`rounded-full px-2 py-0.5 font-bold ${getDeadlineUrgency(job)?.className}`}>{getDeadlineUrgency(job)?.label}</span>}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected Knowledge Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>已沉淀的相关公司知识/面试经验</span>
                  <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-bold font-mono">备考库</span>
                </h4>
                
                {selectedCompany.connectedNotes.length === 0 ? (
                  <p className="text-slate-400 text-xs italic bg-slate-50/30 p-3 rounded-xl border border-slate-100 text-center">暂未录入与此公司相关的研究笔记</p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedCompany.connectedNotes.map((noteId) => {
                      const note = knowledgeCards.find(n => n.id === noteId);
                      if (!note) return null;
                      return (
                        <div key={noteId} className="p-3 border border-slate-200 hover:border-amber-200 rounded-xl text-left bg-slate-50/30">
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100/50 px-2 py-0.5 rounded-md">{note.category}</span>
                          <h5 className="text-xs font-bold text-slate-800 mt-1.5">{note.title}</h5>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-normal font-mono">{note.content}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                企业求职门户
              </span>
              
              <a
                href={jobs.find(job => job.companyId === selectedCompany.id && isCurrentJob(job))?.applyUrl || selectedCompany.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 text-indigo-600 hover:text-indigo-700 bg-white border border-indigo-200 text-xs font-bold rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>前往官方网申</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
