/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Company {
  id: string;
  name: string;
  logo: string;
  logoColor: string; // Tailwind color class
  nature: '央企国企' | '民营企业' | '外企' | '大型互联网' | '金融机构' | '国有控股';
  industry: '互联网' | '金融证券' | '科技制造' | '文化游戏' | '咨询服务' | '消费电子' | '消费零售';
  /** 面向工作台筛选的可叠加标签；不代表公司唯一业务线。 */
  categories?: Array<'互联网' | '软件服务' | '硬件制造' | '游戏内容' | '金融投资' | '新能源汽车' | '半导体芯片' | '能源' | '央国企/事业单位'>;
  subIndustry: string;
  description: string;
  coreBusiness: string;
  city: string[];
  jobsCount: number;
  newsCount: number;
  website: string;
  connectedNotes: string[]; // KnowledgeCard IDs
  connectedMaterials: string[]; // Material IDs
  connectedProjects: string[]; // Project IDs
  /** 投递决策卡；明确区分公开信息核验与基于工作台字段的基础判断。 */
  intelligence?: CompanyIntelligence;
}

export type ApplicationPriorityTier = 1 | 2 | 3;

export interface CompanyIntelligenceSource {
  title: string;
  url: string;
}

export interface CompanyIntelligence {
  priorityTier: ApplicationPriorityTier;
  priorityLabel: string;
  ownership: string;
  capitalStatus: string;
  fundingSummary: string;
  stability: '高' | '中高' | '中' | '中低';
  fitScore: 1 | 2 | 3 | 4 | 5;
  cityFit: string;
  rationale: string;
  risks: string[];
  verifiedAt: string;
  sources: CompanyIntelligenceSource[];
  verificationLevel?: '已公开核验' | '基础判断';
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  direction: '产品研发' | '技术开发' | '商业分析' | '运营策划' | '设计创意' | '职能管理';
  city: string;
  batch: '2027届秋招提前批' | '2027届秋招正式批' | '2027届实习留用' | '2026届补录';
  deadline: string; // YYYY-MM-DD
  /** 截止时间的核验口径；避免把“页面仍开放”误写成统一截止日期。 */
  deadlineVerification?: 'official' | 'institution-specific' | 'rolling' | 'not-announced' | 'unverified' | 'closed' | 'not-applicable';
  /** 截止日期的适用范围、时间点或仍需确认的事项。 */
  deadlineNote?: string;
  /** 最近一次公开信息核验日期。 */
  deadlineVerifiedAt?: string;
  /** 直接支持截止口径的官方公告、招聘系统或高校就业网链接。 */
  deadlineSourceUrl?: string;
  applyUrl: string;
  source: string;
  addedDate: string;
  updatedDate: string;
  description: string;
  highlight: string;
  isFavorite: boolean;
  /** 仅表示用户已主动把岗位纳入个人投递流程；招聘资讯和系统推荐不得自动写入。 */
  isInApplicationTracker?: boolean;
  status: 'wish' | 'materials' | 'applied' | 'test' | 'interview' | 'shelved' | 'ended';
  nextAction?: string;
  nextActionDate?: string;
  connectedMaterials: string[]; // Material IDs
  connectedProjects: string[]; // Project IDs
  connectedNotes: string[]; // KnowledgeCard IDs
  /** 已实际参加的面试复盘；招聘资讯不得写入这里。 */
  interviewReviews?: InterviewReview[];
  referralCodes?: Array<{
    code: string;
    /** 该内推码对应的专属入口；没有可靠链接时留空。 */
    url?: string;
    sourceDate: string;
    sourceTime: string;
    sender: string;
    title: string;
  }>;
  sourceLinks?: Array<{
    title: string;
    url: string;
    status: string;
    /** 区分统一投递、活动报名和只读资讯，避免都显示成“投递入口”。 */
    kind?: 'application' | 'event' | 'article' | 'resource';
    sourceDate: string;
    sourceTime: string;
    sender: string;
  }>;
}

export interface InterviewReview {
  id: string;
  date: string;
  round: string;
  result: '待通知' | '通过' | '未通过';
  source: string;
  summary: string;
  positiveSignals: string[];
  improvementAreas: string[];
  questions: Array<{
    question: string;
    intent: string;
    reflection: string;
    linkedExperience?: string;
    answerStrategy?: string;
    betterAnswer: string;
  }>;
  nextSteps: string[];
}

export interface Source {
  id: string;
  name: string;
  type: 'excel' | 'website' | 'wechat' | 'qq_group' | 'manual';
  connectionType: '在线同步' | '自动化插件' | '剪切板导入' | '文件拖放';
  lastSyncTime: string;
  status: 'healthy' | 'warning' | 'disconnected';
  itemsCollected: number;
  originalUrl: string;
  /** 该来源在工作台中的筛选范围；空值表示沿用通用收集规则。 */
  scope?: string;
  /** 对同步能力和人工核验边界的说明，避免把公开页面监测误解为账号级 API。 */
  syncNote?: string;
}

export interface InboxItem {
  id: string;
  title: string;
  content: string;
  source: string;
  sourceType: 'excel' | 'wechat' | 'qq' | 'web' | 'manual';
  detectedCompany: string;
  detectedJob: string;
  detectedCity: string;
  detectedDeadline: string;
  detectedApplyUrl: string;
  status: 'pending' | 'converted' | 'duplicate' | 'shelved';
  collectedAt: string;
  needsConfirmation: boolean;
}

export interface Material {
  id: string;
  title: string;
  type: 'resume' | 'intro' | 'star_story' | 'qa' | 'cover_letter' | 'checklist' | 'portfolio';
  version: string;
  content: string;
  lastUpdated: string;
  connectedJobs: string[]; // Job IDs
  jobDirection?: string;
  uploadedAt?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  url?: string;
  publishDate: string;
  tags: string[];
  connectedCompanies: string[]; // Company IDs
  savedToKnowledge: boolean;
  isIdea: boolean;
  category?: string;
  publishTime?: string;
  /** 面向快速阅读的中文提炼，不替代原文。 */
  coreIdea?: string;
  /** 适合面试复盘的产品或技术视角。 */
  productLens?: string;
}

export interface KnowledgeCard {
  id: string;
  title: string;
  category: '方法论' | '行业研究' | '公司研究' | '面试表达' | 'AI工具' | '技术八股' | '面试真题' | '企业文化/业务研究' | '网申指南' | '求职心得';
  content: string;
  tags: string[];
  source: string;
  updatedAt: string;
  connectedCompanies: string[]; // Company IDs
  connectedJobs: string[]; // Job IDs
  lastReviewed?: string;
  connectedCompanyId?: string;
}

export interface ProjectExperience {
  id: string;
  title: string;
  role: string;
  period: string;
  type: string;
  background: string;
  task: string;
  action: string;
  result: string;
  tools: string[];
  starStory: string; // STAR expression
  resumeSnippet: string; // Bullet point in resume
  connectedJobs: string[]; // Job IDs
  situation?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'deadline' | 'test' | 'interview' | 'presentation' | 'custom';
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  jobId?: string;
  companyName: string;
  completed: boolean;
  /** 活动参与方式，用于在日程卡片上直接区分空宣和到场活动。 */
  mode?: 'online' | 'offline' | 'hybrid';
  /** 报名、直播或校方通知入口。 */
  url?: string;
  notes?: string;
}

export type SoeRecruitmentStatus = '未开放' | '部分开放' | '已开放' | '暂缓投递' | '待核实' | '已结束';

export interface SoeUnit {
  name: string;
  cities?: string[];
  roles?: string;
  strategy?: string;
  url?: string;
  evidence?: '已核实2027招聘' | '单位存在，本届待核实';
  verifiedAt?: string;
}

/** 央企招聘按集团维护；下属单位仍可与普通 Company 卡片关联。 */
export interface SoeGroup {
  id: string;
  name: string;
  status: SoeRecruitmentStatus;
  sourceUpdatedAt: string;
  publicVerifiedAt?: string;
  officialUrl?: string;
  fit: '重点研究' | '可关注' | '低匹配' | '待评估';
  strategy?: string;
  regions?: string[];
  units?: SoeUnit[];
  /** 内部来源只用于本地决策，不进入对外分享。 */
  confidentialSource: boolean;
  intelligence?: CompanyIntelligence;
}
