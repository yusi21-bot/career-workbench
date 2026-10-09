/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Radio, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  ExternalLink, 
  Database, 
  Code,
  FileSpreadsheet,
  Cpu,
  ChevronRight,
  Sparkles,
  Search
} from 'lucide-react';
import { Source } from '../types';

interface SourcesViewProps {
  sources: Source[];
  onSyncSource: (id: string) => void;
  onAddSource: (source: Omit<Source, 'id' | 'lastSyncTime' | 'itemsCollected' | 'status'>) => void;
  onToast: (message: string, type: 'success' | 'info' | 'warning') => void;
}

export default function SourcesView({
  sources,
  onSyncSource,
  onAddSource,
  onToast
}: SourcesViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'excel' | 'website' | 'wechat' | 'qq_group' | 'manual'>('excel');
  const [newConnectionType, setNewConnectionType] = useState<'在线同步' | '自动化插件' | '剪切板导入' | '文件拖放'>('在线同步');
  const [newUrl, setNewUrl] = useState('');

  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = (id: string, name: string) => {
    setSyncingId(id);
    onToast(`正在检查 [${name}] 的来源状态…`, 'info');
    
    setTimeout(() => {
      onSyncSource(id);
      setSyncingId(null);
      onToast(`[${name}] 已加入待核验刷新队列；公开页面有新内容后再写入机会池。`, 'info');
    }, 1500);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      onToast('信息源名称不能为空', 'warning');
      return;
    }

    onAddSource({
      name: newName,
      type: newType,
      connectionType: newConnectionType,
      originalUrl: newUrl || '本地自定义'
    });

    setNewName('');
    setNewUrl('');
    setShowAddForm(false);
    onToast('已成功接入新信息同步源！已预置空轮询任务。', 'success');
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      case 'website':
        return <Database className="w-5 h-5 text-indigo-500" />;
      case 'wechat':
        return <Cpu className="w-5 h-5 text-teal-500" />;
      case 'qq_group':
        return <Code className="w-5 h-5 text-sky-500" />;
      default:
        return <Radio className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-medium text-slate-900 tracking-widest flex items-center gap-2.5 uppercase">
            <Radio className="w-5 h-5 text-indigo-600 animate-pulse" />
            <span>消息来源</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1.5 font-serif italic">
            这里记录群聊、公众号、招聘官网和资料表，方便以后继续补充和核对信息。
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer btn-primary-glow"
        >
          <Plus className="w-4 h-4" />
          <span>接入新招聘渠道</span>
        </button>
      </div>

      {/* Add source inline form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 max-w-2xl">
          <h3 className="text-xs font-bold text-slate-800">接入全新数据源配置</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">渠道名称</label>
              <input
                type="text"
                placeholder="例如：微信求职内推互助群"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">渠道类型</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="excel">腾讯文档 / Excel在线表</option>
                <option value="website">大厂官网 / 校园招聘网</option>
                <option value="wechat">微信公众号 / 朋友圈快讯</option>
                <option value="qq_group">QQ招聘交流群/求职表</option>
                <option value="manual">个人零星手记收集箱</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">连接/接入方式</label>
              <select
                value={newConnectionType}
                onChange={(e) => setNewConnectionType(e.target.value as any)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="在线同步">在线同步 (轮询API/爬虫脚本模拟)</option>
                <option value="自动化插件">自动化插件 (网页拦截器 / 微信拦截)</option>
                <option value="剪切板导入">剪切板导入 (复制到后台一键识别)</option>
                <option value="文件拖放">文件拖放 (支持 PDF 宣传单/截图拖入)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-500 mb-1">原始出处链接/群号 (可选)</label>
              <input
                type="text"
                placeholder="https://docs.qq.com/..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
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
              接入配置
            </button>
          </div>
        </form>
      )}

      {/* Sources Grid cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {sources.map((source) => {
          const isSyncing = syncingId === source.id;
          return (
            <div 
              key={source.id}
              className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Top header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl">
                      {getSourceIcon(source.type)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {source.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {source.id}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-semibold flex items-center gap-1 ${
                    source.status === 'healthy' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' 
                      : source.status === 'warning'
                        ? 'bg-amber-50 text-amber-600 border-amber-100/50 animate-pulse'
                        : 'bg-rose-50 text-rose-600 border-rose-100/50'
                  }`}>
                    {source.status === 'healthy' ? '已接入' : source.status === 'warning' ? '待人工核验' : '未连接'}
                  </span>
                </div>

                {/* Meta list */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">连接模式</span>
                    <span className="font-semibold text-slate-700">{source.connectionType}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">最新收录数量</span>
                    <span className="font-semibold text-slate-700 font-mono">{source.itemsCollected} 条消息</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">上轮同步时间</span>
                    <span className="font-semibold text-slate-600 font-mono text-[11px]">{source.lastSyncTime}</span>
                  </div>
                </div>

                {/* Sub details URL */}
                <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] font-mono text-slate-500 truncate flex items-center gap-1">
                  <span className="text-slate-400 shrink-0">地址:</span>
                  <span className="truncate">{source.originalUrl}</span>
                </div>

                {(source.scope || source.syncNote) && (
                  <div className="space-y-2 rounded-xl border border-indigo-100/80 bg-indigo-50/40 p-3 text-[11px] leading-relaxed text-slate-600">
                    {source.scope && (
                      <p><span className="font-semibold text-slate-800">筛选范围：</span>{source.scope}</p>
                    )}
                    {source.syncNote && (
                      <p><span className="font-semibold text-slate-800">接入边界：</span>{source.syncNote}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Action row */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                {source.originalUrl.startsWith('http') ? (
                  <a
                    href={source.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-0.5"
                  >
                    <span>跳转出处</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-400">本地手动管理</span>
                )}

                <button
                  onClick={() => handleSync(source.id, source.name)}
                  disabled={isSyncing}
                  className={`px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                    isSyncing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? '检查中' : '检查更新'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Synchronizer help info block */}
      <div className="p-6 bg-indigo-50/50 text-slate-800 rounded-2xl border border-indigo-100 space-y-4">
        <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider font-mono flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>未来接入方案技术路线规划</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="space-y-1.5">
            <h4 className="font-semibold text-slate-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              <span>1. 腾讯文档自动化抓取</span>
            </h4>
            <p className="leading-relaxed text-slate-500">
              预留 MCP 或者 Node.js cron 脚本，每天凌晨两点模拟登录或者通过共享只读链接进行单元格变更轮询，若有新行直接发推送到 Inbox 模块。
            </p>
          </div>
          
          <div className="space-y-1.5">
            <h4 className="font-semibold text-slate-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
              <span>2. 浏览器剪切板全量抓取</span>
            </h4>
            <p className="leading-relaxed text-slate-500">
              支持一键开启后台监听。当检测到剪贴板包含 “校招” “截止日期” “简历接收邮箱” 时，自动推送气泡提醒，用户点击即可无缝收入收件箱。
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-slate-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
              <span>3. 微信公众号智能解析</span>
            </h4>
            <p className="leading-relaxed text-slate-500">
              通过搜狗微信搜索或微信小助手机器人转发，自动将各大厂招聘公众号的图文转换为纯文本，并利用 LLM 做 99% 精确度的字段解析，免除繁琐手录。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
