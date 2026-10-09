/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Inbox, 
  Trash2, 
  CheckCircle, 
  FileEdit, 
  Plus, 
  AlertCircle, 
  FileText, 
  MessageSquare, 
  Share2, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { InboxItem, Job } from '../types';
import { isCurrentInboxItem } from '../opportunity-visibility';

interface InboxViewProps {
  inboxItems: InboxItem[];
  onConvert: (item: InboxItem, parsedJob: Partial<Job>) => void;
  onShelve: (id: string) => void;
  onMarkDuplicate: (id: string) => void;
  onAddInboxItem: (item: Omit<InboxItem, 'id' | 'collectedAt' | 'status'>) => void;
  onToast: (message: string, type: 'success' | 'info' | 'warning') => void;
}

export default function InboxView({
  inboxItems,
  onConvert,
  onShelve,
  onMarkDuplicate,
  onAddInboxItem,
  onToast
}: InboxViewProps) {
  const currentInboxItems = inboxItems.filter(item => isCurrentInboxItem(item));
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    currentInboxItems.find(i => i.status === 'pending')?.id || (currentInboxItems.length > 0 ? currentInboxItems[0].id : null)
  );
  
  // Custom paste states
  const [pasteText, setPasteText] = useState('');
  const [pasteSource, setPasteSource] = useState('微信群转发');
  const [isPasting, setIsPasting] = useState(false);

  // Selected item reference
  const selectedItem = currentInboxItems.find(item => item.id === selectedItemId);

  // Edit fields for extraction
  const [editCompany, setEditCompany] = useState('');
  const [editJob, setEditJob] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editApplyUrl, setEditApplyUrl] = useState('');
  const [editDirection, setEditDirection] = useState<'产品研发' | '技术开发' | '商业分析' | '运营策划' | '设计创意' | '职能管理'>('产品研发');

  // Sync edits when selected item changes
  React.useEffect(() => {
    if (selectedItem) {
      setEditCompany(selectedItem.detectedCompany || '');
      setEditJob(selectedItem.detectedJob || '');
      setEditCity(selectedItem.detectedCity || '');
      setEditDeadline(selectedItem.detectedDeadline || '');
      setEditApplyUrl(selectedItem.detectedApplyUrl || '');
    }
  }, [selectedItem]);

  const handleSimulateNLP = () => {
    if (!pasteText.trim()) {
      onToast('请输入需要解析的内容', 'warning');
      return;
    }

    // A simple, clever mock NLP parser
    let company = '未知公司';
    let title = '未知岗位';
    let city = '全国可选';
    let deadline = '2026-10-31';
    let url = 'https://careers.example.com';

    const text = pasteText;
    if (text.includes('美团') || text.includes('Meituan')) company = '美团';
    else if (text.includes('阿里') || text.includes('天猫') || text.includes('淘宝')) company = '阿里巴巴';
    else if (text.includes('拼多多') || text.includes('PDD')) company = '拼多多';
    else if (text.includes('网易')) company = '网易';
    else if (text.includes('京东')) company = '京东';
    else if (text.includes('小红书')) company = '小红书';
    else if (text.includes('字节') || text.includes('飞书') || text.includes('抖音')) company = '字节跳动';
    else if (text.includes('腾讯') || text.includes('微信')) company = '腾讯控股';
    else if (text.includes('华为')) company = '华为技术';

    // Parse job title
    if (text.includes('产品经理') || text.includes('PM')) title = '产品经理岗';
    else if (text.includes('前端') || text.includes('Web') || text.includes('H5')) title = '前端开发工程师';
    else if (text.includes('后台') || text.includes('后端') || text.includes('开发') || text.includes('Java') || text.includes('C++') || text.includes('研发')) title = '软件研发工程师';
    else if (text.includes('运营') || text.includes('策划')) title = '运营策划助理';
    else if (text.includes('数据分析') || text.includes('商业分析') || text.includes('数分') || text.includes('商分')) title = '数据分析师';
    else if (text.includes('算法') || text.includes('NLP') || text.includes('人工智能') || text.includes('LLM')) title = '算法工程师（AI方向）';

    // Parse city
    if (text.includes('北京')) city = '北京';
    else if (text.includes('上海')) city = '上海';
    else if (text.includes('深圳')) city = '深圳';
    else if (text.includes('广州')) city = '广州';
    else if (text.includes('杭州')) city = '杭州';
    else if (text.includes('成都')) city = '成都';

    // Parse deadline
    const deadlineMatch = text.match(/\d{4}-\d{2}-\d{2}/);
    if (deadlineMatch) {
      deadline = deadlineMatch[0];
    } else if (text.includes('截止日期') || text.includes('截止')) {
      deadline = '2026-09-30';
    }

    // Parse URL
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      url = urlMatch[0];
    }

    onAddInboxItem({
      title: `【随手黏贴自 ${pasteSource}】${company}招聘线索`,
      content: pasteText,
      source: pasteSource,
      sourceType: 'web',
      detectedCompany: company,
      detectedJob: title,
      detectedCity: city,
      detectedDeadline: deadline,
      detectedApplyUrl: url,
      needsConfirmation: true
    });

    setPasteText('');
    setIsPasting(false);
    onToast('已成功通过本地NLP模拟器智能提取招聘线索，正在收件箱中呈现！', 'success');
  };

  const handleConvert = () => {
    if (!selectedItem) return;
    if (!editCompany.trim() || !editJob.trim()) {
      onToast('公司名称和岗位名称不能为空', 'warning');
      return;
    }

    const jobData: Partial<Job> = {
      companyName: editCompany,
      title: editJob,
      city: editCity || '待确认',
      direction: editDirection,
      deadline: editDeadline || '2026-10-31',
      applyUrl: editApplyUrl || 'https://example.com',
      source: selectedItem.source,
      description: selectedItem.content,
      highlight: '提取自原始收集源: ' + selectedItem.title
    };

    onConvert(selectedItem, jobData);
    onToast(`成功将信息转化为正式岗位：【${editCompany} - ${editJob}】`, 'success');

    // Auto select next pending item
    const nextPending = currentInboxItems.find(i => i.status === 'pending' && i.id !== selectedItemId);
    if (nextPending) {
      setSelectedItemId(nextPending.id);
    } else {
      setSelectedItemId(null);
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'excel':
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'wechat':
        return <MessageSquare className="w-4 h-4 text-teal-500" />;
      case 'qq':
        return <Share2 className="w-4 h-4 text-blue-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const pendingCount = currentInboxItems.filter(i => i.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-medium text-slate-900 tracking-widest flex items-center gap-2.5 uppercase">
            <Inbox className="w-5 h-5 text-indigo-600" />
            <span>招聘总录•收件箱</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1.5 font-serif italic">
            自微信群、剪切板抑或网页猎取之原始招聘遗存，皆集于此。无求旦旦清空，宜静心归类。
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsPasting(!isPasting)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer btn-primary-glow"
        >
          <Plus className="w-4 h-4" />
          <span>手动粘贴一则招聘原始信息</span>
        </motion.button>
      </div>

      {/* Paste Modal mock overlay inline to save file count and look beautiful */}
      {isPasting && (
        <div className="bg-slate-50 border border-indigo-100 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>智能识别粘板/群聊内容</span>
            </h4>
            <button 
              onClick={() => setIsPasting(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              取消
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <textarea
                placeholder="直接粘贴微信群通知、网页选区内容、或者是邮件文字。例如：'内推字节2027暑期，北京产品经理，投递地址 https://job.bytedance.com 10月截止...'"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                className="w-full h-32 p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">渠道/信息出处</label>
                <select
                  value={pasteSource}
                  onChange={(e) => setPasteSource(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="微信朋友圈/公众号">微信朋友圈/公众号</option>
                  <option value="QQ招聘群分享">QQ招聘群分享</option>
                  <option value="学长老师转发">学长老师转发</option>
                  <option value="公司官网零散收集">公司官网零散收集</option>
                  <option value="腾讯文档手动摘录">腾讯文档手动摘录</option>
                </select>
              </div>

              <button
                onClick={handleSimulateNLP}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>一键智能本地解析</span>
              </button>
              
              <p className="text-[10px] text-slate-400 leading-normal">
                提示：本地基于关键词智能匹配公司名称与投递链接。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area: Split List & Edit Details */}
      {currentInboxItems.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-2xl">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 text-sm mt-3 font-semibold">收件箱空空如也</p>
          <p className="text-slate-400 text-xs mt-1">您可以尝试粘贴一则求职线索来试试！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* List panel (col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-bold text-slate-400">所有条目 ({currentInboxItems.length})</span>
              <span className="text-xs font-mono text-indigo-600 bg-indigo-50/50 border border-indigo-100/50 px-2 py-0.5 rounded-full">
                {pendingCount} 个待归宿
              </span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {currentInboxItems.map((item) => {
                const isSelected = item.id === selectedItemId;
                const isPending = item.status === 'pending';
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left relative ${
                      isSelected 
                        ? 'bg-indigo-50/70 border-indigo-500 text-slate-900 shadow-xs font-semibold' 
                        : isPending 
                          ? 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700'
                          : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200/40 text-slate-400'
                    }`}
                  >
                    {item.needsConfirmation && isPending && (
                      <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    )}

                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 p-1 rounded-md ${isSelected ? 'bg-indigo-100/80' : 'bg-slate-100'}`}>
                        {getSourceIcon(item.sourceType)}
                      </div>
                      
                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="text-xs font-bold leading-snug line-clamp-2">
                          {item.title}
                        </h4>
                        
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-mono">
                          <span className={isSelected ? 'text-indigo-700' : 'text-slate-500'}>
                            来自: {item.source}
                          </span>
                          <span className={isSelected ? 'text-indigo-300' : 'text-slate-300'}>·</span>
                          <span className={isSelected ? 'text-indigo-700' : 'text-slate-500'}>
                            {item.collectedAt.split(' ')[0]}
                          </span>

                          {!isPending && (
                            <span className="ml-auto text-[10px] text-emerald-500 flex items-center gap-0.5 font-bold">
                              ✓ 已转换
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Editor/Extractor Panel (col-span-3) */}
          <div className="lg:col-span-3">
            {selectedItem ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6 sticky top-6">
                
                {/* Header info */}
                <div className="space-y-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span>原始同步点: {selectedItem.source}</span>
                    <span>·</span>
                    <span>收录于: {selectedItem.collectedAt}</span>
                  </div>
                  
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {selectedItem.title}
                  </h3>

                  {/* Raw body collapsed style to read */}
                  <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4">
                    <p className="text-sm text-slate-700 font-sans whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto pr-2">
                      {selectedItem.content}
                    </p>
                  </div>
                </div>

                {/* Form fields extract */}
                {selectedItem.status === 'pending' ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span>求职舱线索提取引擎 (本地模拟智能识别)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">识别出的公司名称</label>
                        <input
                          type="text"
                          value={editCompany}
                          onChange={(e) => setEditCompany(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-semibold"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">识别出的岗位职位</label>
                        <input
                          type="text"
                          value={editJob}
                          onChange={(e) => setEditJob(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">工作城市</label>
                        <input
                          type="text"
                          value={editCity}
                          onChange={(e) => setEditCity(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">网申截止日期</label>
                        <input
                          type="date"
                          value={editDeadline}
                          onChange={(e) => setEditDeadline(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">岗位发展方向</label>
                        <select
                          value={editDirection}
                          onChange={(e) => setEditDirection(e.target.value as any)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="产品研发">产品研发</option>
                          <option value="技术开发">技术开发</option>
                          <option value="商业分析">商业分析</option>
                          <option value="运营策划">运营策划</option>
                          <option value="设计创意">设计创意</option>
                          <option value="职能管理">职能管理</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">
                        投递官网入口 / 链接
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={editApplyUrl}
                          onChange={(e) => setEditApplyUrl(e.target.value)}
                          className="w-full p-2.5 pl-3 pr-10 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                        {editApplyUrl.startsWith('http') && (
                          <a 
                            href={editApplyUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="absolute right-3 top-3 text-slate-400 hover:text-indigo-600"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Operational row buttons */}
                    <div className="pt-4 flex flex-wrap gap-2 justify-end">
                      <button
                        onClick={() => onMarkDuplicate(selectedItem.id)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-all"
                      >
                        标记重复
                      </button>
                      <button
                        onClick={() => onShelve(selectedItem.id)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-all"
                      >
                        暂时搁置
                      </button>
                      <button
                        onClick={handleConvert}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-indigo-500/10 transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>归并并加入「我的岗位库」</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl space-y-3 border border-slate-200/50">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">已处理归档</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        此招聘原始线索已于先前成功转化为正式求职岗位。已无需在此处理。
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400">
                <p className="text-xs">请在左侧列表中点击选择任一招聘信息线索进行分类与转换</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
