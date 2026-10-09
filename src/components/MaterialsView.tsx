/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  FileText,
  Lightbulb,
  PencilLine,
  Plus,
  Printer,
  Save,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { AWARD_CATEGORIES } from '../awards-data';
import { CAMPUS_SERVICE_SECTION_HTML } from '../campus-service-section';
import aiProductInterviewPrep from '../sample-interview-prep.md?raw';

interface MaterialsViewProps {
  materials: any[];
  onAddMaterial: (material: any) => void;
  onDeleteMaterial: (id: string) => void;
  onToast: (message: string, type: 'success' | 'info' | 'warning') => void;
}

interface MaterialSection {
  id: string;
  displayNumber: string;
  title: string;
  html: string;
  searchableText: string;
}

interface CognitionNote {
  id: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  updatedAt: string;
  content: string;
}

const MATERIALS_SOURCE = './application-materials.html';
const MATERIALS_STORAGE_KEY = 'career-public-v1-application-materials-v1';
const COGNITION_STORAGE_KEY = 'career-public-v1-cognition-notes-v1';
const SECTION_ORDINALS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一'];

const INITIAL_COGNITION_NOTE: CognitionNote = {
  id: 'ai-product-positioning-metrics-ab-20260915',
  title: 'AI产品面试准备：产品定位、成功指标与A/B实验',
  summary: '把示例项目经历转化为清晰的产品故事，并建立从产品定位、指标设计到实验验证的完整回答框架。',
  category: '产品方法论',
  tags: ['产品定位', '成功指标', 'A/B实验', 'B端AI'],
  updatedAt: '2026-09-15',
  content: aiProductInterviewPrep,
};

function readStoredValue<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderInlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/\[([^\]]+)\]\((?:&lt;([^&]+)&gt;|([^\)]+))\)/g, (_match, label, wrappedUrl, plainUrl) => {
      const url = wrappedUrl || plainUrl;
      const external = /^https?:\/\//.test(url);
      return `<a href="${url}"${external ? ' target="_blank" rel="noreferrer"' : ''}>${label}</a>`;
    })
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function markdownToHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(trimmed);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      html.push('<hr />');
      index += 1;
      continue;
    }

    if (trimmed.startsWith('|') && index + 1 < lines.length && /^\s*\|?(?:\s*:?-+:?\s*\|)+\s*$/.test(lines[index + 1])) {
      const rows: string[][] = [];
      const splitRow = (row: string) => row.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
      rows.push(splitRow(line));
      index += 2;
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        rows.push(splitRow(lines[index]));
        index += 1;
      }
      const [header, ...body] = rows;
      html.push(`<div class="cognition-table-wrap"><table><thead><tr>${header.map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`).join('')}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*]\s+/, ''));
        index += 1;
      }
      html.push(`<ul>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, ''));
        index += 1;
      }
      html.push(`<ol>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</ol>`);
      continue;
    }

    const paragraph: string[] = [trimmed];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^(#{1,4})\s+|^[-*]\s+|^\d+\.\s+|^\|/.test(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    html.push(`<p>${renderInlineMarkdown(paragraph.join(' '))}</p>`);
  }

  return html.join('');
}

function getMarkdownTitle(content: string) {
  return content.match(/^#\s+(.+)$/m)?.[1]?.trim() || '未命名认知记录';
}

function getMarkdownOutline(content: string) {
  return Array.from(content.matchAll(/^##\s+(.+)$/gm), (match) => match[1].trim());
}

function replaceAwardsSection(body: Element) {
  body.replaceChildren();

  AWARD_CATEGORIES.forEach((category) => {
    const categoryHeading = body.ownerDocument.createElement('h3');
    categoryHeading.textContent = category.title;
    body.append(categoryHeading);

    category.entries.forEach((entry) => {
      const entryHeading = body.ownerDocument.createElement('h4');
      entryHeading.textContent = entry.title;
      body.append(entryHeading);

      const table = body.ownerDocument.createElement('table');
      const tableBody = body.ownerDocument.createElement('tbody');

      entry.fields.forEach(([label, value]) => {
        const row = body.ownerDocument.createElement('tr');
        const labelCell = body.ownerDocument.createElement('th');
        const valueCell = body.ownerDocument.createElement('td');
        labelCell.scope = 'row';
        labelCell.textContent = label;
        valueCell.textContent = value;
        row.append(labelCell, valueCell);
        tableBody.append(row);
      });

      table.append(tableBody);
      body.append(table);
    });
  });
}

function replaceCampusServiceSection(body: Element) {
  body.innerHTML = CAMPUS_SERVICE_SECTION_HTML;
}

function updateGraduateRanking(body: Element) {
  const row = Array.from(body.querySelectorAll('tr')).find((candidate) =>
    candidate.querySelector('td')?.textContent?.trim().startsWith('专业排名、'),
  );
  const cells = row?.querySelectorAll('td');

  if (!cells || cells.length < 2) return;

  cells[0].textContent = '专业排名';
  cells[1].textContent = '8/60（虚构示例）';
}

function prepareCopyButtons(body: Element) {
  const candidates = body.querySelectorAll('p, .section-body > ol, .entry > ol');

  candidates.forEach((node) => {
    const element = node as HTMLElement;
    if (
      element.closest('.application-copy-block') ||
      element.classList.contains('note') ||
      element.closest('li') ||
      (element.textContent?.trim().length ?? 0) < 65
    ) {
      return;
    }

    const wrapper = body.ownerDocument.createElement('div');
    wrapper.className = 'application-copy-block';
    element.before(wrapper);
    wrapper.append(element);

    const button = body.ownerDocument.createElement('button');
    button.type = 'button';
    button.className = 'application-copy-button';
    button.dataset.copyBlock = 'true';
    button.setAttribute('aria-label', '复制此段内容');
    button.textContent = '复制';
    wrapper.append(button);
  });
}

function prepareInternshipCopyButtons(body: Element) {
  const headings = Array.from(body.querySelectorAll(':scope > h3')) as HTMLElement[];

  headings.forEach((heading) => {
    const wrapper = body.ownerDocument.createElement('div');
    wrapper.className = 'application-copy-experience';
    heading.before(wrapper);

    let current: Element | null = heading;
    while (current && (current === heading || current.tagName !== 'H3')) {
      const next = current.nextElementSibling;
      wrapper.append(current);
      current = next;
    }

    const button = body.ownerDocument.createElement('button');
    button.type = 'button';
    button.className = 'application-copy-button';
    button.dataset.copyExperience = 'true';
    button.setAttribute('aria-label', `复制${heading.textContent?.trim() || '整段实习经历'}`);
    button.textContent = '整体复制';
    wrapper.append(button);
  });
}

function rebuildCopyControls(section: MaterialSection): MaterialSection {
  const document = new DOMParser().parseFromString(`<div id="copy-control-root">${section.html}</div>`, 'text/html');
  const body = document.querySelector('#copy-control-root');
  if (!body) return section;

  body.querySelectorAll('.application-copy-button').forEach((button) => button.remove());
  body.querySelectorAll('.application-copy-block, .application-copy-experience').forEach((wrapper) => {
    wrapper.replaceWith(...Array.from(wrapper.childNodes));
  });

  if (section.id === 'section-4') prepareInternshipCopyButtons(body);
  else prepareCopyButtons(body);

  return {
    ...section,
    html: body.innerHTML,
  };
}

function parseMaterialsDocument(source: string): MaterialSection[] {
  const document = new DOMParser().parseFromString(source, 'text/html');

  return Array.from(document.querySelectorAll('main > section')).map((section, index) => {
    const body = section.querySelector('.section-body');
    const sourceTitle = section.querySelector('h2')?.textContent?.trim() || '未命名章节';
    const titleText = sourceTitle
      .replace(/^[一二三四五六七八九十]+、/, '')
      .replace(/｜已定稿汇编$/, '');
    const title = `${SECTION_ORDINALS[index] || index + 1}、${titleText}`;
    const displayNumber = String(index + 1).padStart(2, '0');

    if (!body) {
      return {
        id: section.id,
        displayNumber,
        title,
        html: '',
        searchableText: section.textContent?.toLowerCase() || '',
      };
    }

    if (section.id === 'section-3') updateGraduateRanking(body);

    if (section.id === 'section-7') replaceAwardsSection(body);
    if (section.id === 'section-8') replaceCampusServiceSection(body);
    body.querySelectorAll('script, style, .copy').forEach((node) => node.remove());
    if (section.id === 'section-4') prepareInternshipCopyButtons(body);
    else prepareCopyButtons(body);

    return {
      id: section.id,
      displayNumber,
      title,
      html: body.innerHTML,
      searchableText: `${title} ${body.textContent || ''}`.toLowerCase(),
    };
  });
}

interface CognitionRecordsProps {
  notes: CognitionNote[];
  onNotesChange: (notes: CognitionNote[]) => void;
  onToast: MaterialsViewProps['onToast'];
}

function CognitionRecords({ notes, onNotesChange, onToast }: CognitionRecordsProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const selectedNote = notes.find((note) => note.id === selectedNoteId) || null;
  const outline = useMemo(() => selectedNote ? getMarkdownOutline(selectedNote.content) : [], [selectedNote]);
  const readingMinutes = selectedNote ? Math.max(1, Math.ceil(selectedNote.content.length / 700)) : 0;

  const beginEdit = (note: CognitionNote) => {
    setSelectedNoteId(note.id);
    setEditingNoteId(note.id);
    setDraft(note.content);
  };

  const beginCreate = () => {
    setSelectedNoteId(null);
    setEditingNoteId('new');
    setDraft('# 新的认知记录\n\n更新日期：2026-09-15\n\n## 一、核心问题\n\n从这里开始记录。');
  };

  const saveDraft = () => {
    const title = getMarkdownTitle(draft);
    const now = new Date().toISOString().slice(0, 10);

    if (editingNoteId === 'new') {
      const nextNote: CognitionNote = {
        id: `cognition-${Date.now()}`,
        title,
        summary: '一篇正在持续完善的求职认知记录。',
        category: '认知记录',
        tags: ['待整理'],
        updatedAt: now,
        content: draft,
      };
      onNotesChange([nextNote, ...notes]);
      setSelectedNoteId(nextNote.id);
    } else {
      onNotesChange(notes.map((note) => note.id === editingNoteId
        ? { ...note, title, updatedAt: now, content: draft }
        : note));
      setSelectedNoteId(editingNoteId);
    }

    setEditingNoteId(null);
    onToast('认知记录已保存到本机', 'success');
  };

  const deleteNote = (note: CognitionNote) => {
    if (!window.confirm(`确定删除“${note.title}”吗？`)) return;
    onNotesChange(notes.filter((item) => item.id !== note.id));
    if (selectedNoteId === note.id) setSelectedNoteId(null);
    onToast('认知记录已删除', 'info');
  };

  if (editingNoteId) {
    return (
      <section className="cognition-editor animate-fadeIn">
        <div className="cognition-editor-bar">
          <button type="button" className="cognition-quiet-button" onClick={() => setEditingNoteId(null)}>
            <X aria-hidden="true" /> 取消
          </button>
          <div>
            <span>EDITING NOTE</span>
            <strong>{getMarkdownTitle(draft)}</strong>
          </div>
          <button type="button" className="cognition-primary-button" onClick={saveDraft}>
            <Save aria-hidden="true" /> 保存到本机
          </button>
        </div>
        <div className="cognition-editor-grid">
          <label className="cognition-editor-pane">
            <span>Markdown 原文</span>
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} spellCheck={false} />
          </label>
          <div className="cognition-preview-pane">
            <span>实时预览</span>
            <article className="cognition-article cognition-article-preview" dangerouslySetInnerHTML={{ __html: markdownToHtml(draft) }} />
          </div>
        </div>
      </section>
    );
  }

  if (selectedNote) {
    return (
      <section className="cognition-reader animate-fadeIn">
        <div className="cognition-reader-actions">
          <button type="button" className="cognition-back-button" onClick={() => setSelectedNoteId(null)}>
            <ArrowLeft aria-hidden="true" /> 返回认知记录
          </button>
          <div>
            <button type="button" className="cognition-quiet-button" onClick={() => beginEdit(selectedNote)}>
              <PencilLine aria-hidden="true" /> 编辑
            </button>
            <button type="button" className="cognition-icon-button cognition-delete-button" onClick={() => deleteNote(selectedNote)} aria-label="删除记录">
              <Trash2 aria-hidden="true" />
            </button>
          </div>
        </div>

        <header className="cognition-reader-header">
          <div className="cognition-reader-kicker"><span>{selectedNote.category}</span><i />更新于 {selectedNote.updatedAt}<i />约 {readingMinutes} 分钟</div>
          <h2>{selectedNote.title}</h2>
          <p>{selectedNote.summary}</p>
          <div className="cognition-tags">{selectedNote.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        </header>

        {outline.length > 0 && (
          <nav className="cognition-outline" aria-label="文章目录">
            <span>本篇结构</span>
            <div>{outline.map((item, index) => <em key={`${item}-${index}`}>{String(index + 1).padStart(2, '0')} {item.replace(/^[一二三四五六七八九十]+、/, '')}</em>)}</div>
          </nav>
        )}

        <article className="cognition-article" dangerouslySetInnerHTML={{ __html: markdownToHtml(selectedNote.content) }} />
      </section>
    );
  }

  return (
    <section className="cognition-library animate-fadeIn">
      <header className="cognition-library-hero">
        <div>
          <p>THINK · TEST · EVOLVE</p>
          <h2>把做过的事，变成下一次<br />更清楚的判断。</h2>
          <span>实习复盘、产品方法、公司研究和突然出现的好想法，都可以在这里持续生长。</span>
        </div>
        <button type="button" className="cognition-primary-button" onClick={beginCreate}>
          <Plus aria-hidden="true" /> 新建记录
        </button>
      </header>

      <div className="cognition-library-meta">
        <span>{String(notes.length).padStart(2, '0')} 篇记录</span>
        <span>本机保存 · 随时修改</span>
      </div>

      <div className="cognition-note-grid">
        {notes.map((note, index) => (
          <article key={note.id} className="cognition-note-card" onClick={() => setSelectedNoteId(note.id)}>
            <div className="cognition-note-card-top">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <Lightbulb aria-hidden="true" />
            </div>
            <p>{note.category}</p>
            <h3>{note.title}</h3>
            <span className="cognition-note-summary">{note.summary}</span>
            <div className="cognition-note-card-footer">
              <span>{note.updatedAt}</span>
              <div>
                <button type="button" onClick={(event) => { event.stopPropagation(); beginEdit(note); }} aria-label="编辑记录"><PencilLine /></button>
                <button type="button" onClick={(event) => { event.stopPropagation(); deleteNote(note); }} aria-label="删除记录"><Trash2 /></button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function MaterialsView({ onToast }: MaterialsViewProps) {
  const [activeSpace, setActiveSpace] = useState<'materials' | 'cognition'>('materials');
  const [sections, setSections] = useState<MaterialSection[]>([]);
  const [notes, setNotes] = useState<CognitionNote[]>(() => readStoredValue(COGNITION_STORAGE_KEY, [INITIAL_COGNITION_NOTE]));
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingMaterials, setEditingMaterials] = useState(false);
  const [materialSnapshot, setMaterialSnapshot] = useState<MaterialSection[] | null>(null);
  const [materialRenderKey, setMaterialRenderKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch(MATERIALS_SOURCE)
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load application materials');
        return response.text();
      })
      .then((source) => {
        if (cancelled) return;
        const parsedSections = parseMaterialsDocument(source);
        const storedSections = readStoredValue(MATERIALS_STORAGE_KEY, parsedSections);
        setSections(storedSections.map(rebuildCopyControls));
        setLoadError(false);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(COGNITION_STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleSections = useMemo(
    () => sections.filter((section) => !normalizedQuery || section.searchableText.includes(normalizedQuery)),
    [normalizedQuery, sections]
  );

  const jumpToSection = (id: string) => {
    document.getElementById(`material-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.append(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
    onToast('已复制到剪贴板', 'success');
  };

  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (editingMaterials) return;
    const target = event.target as HTMLElement;
    const experienceButton = target.closest<HTMLButtonElement>('[data-copy-experience="true"]');
    if (experienceButton) {
      const experience = experienceButton.closest<HTMLElement>('.application-copy-experience');
      if (!experience) return;
      const clone = experience.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('.application-copy-button').forEach((node) => node.remove());
      if (clone.innerText.trim()) copyText(clone.innerText.trim());
      return;
    }

    const button = target.closest<HTMLButtonElement>('[data-copy-block="true"]');
    if (!button) return;

    const textNode = button.previousElementSibling as HTMLElement | null;
    if (textNode?.innerText.trim()) copyText(textNode.innerText.trim());
  };

  const beginMaterialsEdit = () => {
    setMaterialSnapshot(sections.map((section) => ({ ...section })));
    setQuery('');
    setEditingMaterials(true);
  };

  const cancelMaterialsEdit = () => {
    if (materialSnapshot) setSections(materialSnapshot);
    setEditingMaterials(false);
    setMaterialSnapshot(null);
    setMaterialRenderKey((value) => value + 1);
  };

  const saveMaterialsEdit = () => {
    const nextSections = sections.map((section) => {
      const body = document.querySelector<HTMLElement>(`[data-material-section-id="${section.id}"]`);
      if (!body) return section;
      return {
        ...section,
        html: body.innerHTML,
        searchableText: `${section.title} ${body.innerText}`.toLowerCase(),
      };
    });
    setSections(nextSections);
    window.localStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(nextSections));
    setEditingMaterials(false);
    setMaterialSnapshot(null);
    onToast('网申资料底稿已保存到本机', 'success');
  };

  return (
    <div className="career-preparation animate-fadeIn">
      <header className="career-preparation-header">
        <div>
          <p>CAREER STUDIO</p>
          <h1>求职准备</h1>
          <span>一份随时可取用的资料底稿，一套持续更新的思考系统。</span>
        </div>
        <Sparkles aria-hidden="true" />
      </header>

      <nav className="career-space-switcher" aria-label="求职准备板块">
        <button type="button" className={activeSpace === 'materials' ? 'active' : ''} onClick={() => setActiveSpace('materials')}>
          <span><FileText /></span>
          <div><strong>网申资料底稿</strong><small>填写、复制与维护全量申请信息</small></div>
          <em>01</em>
        </button>
        <button type="button" className={activeSpace === 'cognition' ? 'active' : ''} onClick={() => setActiveSpace('cognition')}>
          <span><Lightbulb /></span>
          <div><strong>认知记录</strong><small>沉淀复盘、方法论与新想法</small></div>
          <em>02</em>
        </button>
      </nav>

      {activeSpace === 'cognition' ? (
        <CognitionRecords notes={notes} onNotesChange={setNotes} onToast={onToast} />
      ) : (
      <div className={`application-materials ${editingMaterials ? 'is-editing' : ''}`}>
      <header className="application-materials-header">
        <div className="application-materials-heading">
          <div className="application-materials-icon" aria-hidden="true">
            <FileText />
          </div>
          <div>
            <p className="application-materials-eyebrow">APPLICATION MATERIALS · 2027 届</p>
            <h1>网申资料底稿</h1>
            <p>按实际网申填写顺序整理，需要哪一段，就搜索、定位并直接取用。</p>
          </div>
        </div>

        <div className="application-materials-header-actions">
          {editingMaterials ? (
            <>
              <button type="button" className="application-materials-print" onClick={cancelMaterialsEdit}><X aria-hidden="true" />取消</button>
              <button type="button" className="cognition-primary-button" onClick={saveMaterialsEdit}><Save aria-hidden="true" />保存修改</button>
            </>
          ) : (
            <>
              <button type="button" className="application-materials-print" onClick={beginMaterialsEdit}><PencilLine aria-hidden="true" />编辑底稿</button>
              <button type="button" className="application-materials-print" onClick={() => window.print()}><Printer aria-hidden="true" />打印资料</button>
            </>
          )}
        </div>
      </header>

      {!editingMaterials && <div className="application-materials-tools">
        <label className="application-materials-search">
          <Search aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索示例实习、项目、竞赛、教育……"
            aria-label="搜索网申资料"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="清空搜索">
              <X aria-hidden="true" />
            </button>
          )}
        </label>
        <div className="application-materials-status" aria-live="polite">
          {copied ? <><Check /> 已复制</> : normalizedQuery ? `找到 ${visibleSections.length} 个相关章节` : '更新于 2026.09.13'}
        </div>
      </div>}

      {editingMaterials && <div className="application-editing-notice"><PencilLine />正在直接编辑底稿。点击正文即可修改，完成后保存到本机。</div>}

      {!editingMaterials && !loading && !loadError && (
        <nav className="application-materials-nav" aria-label="网申资料章节导航">
          <div className="application-materials-nav-title">
            <BookOpen aria-hidden="true" />
            章节导航
          </div>
          <div className="application-materials-nav-links">
            {sections.map((section) => (
              <button key={section.id} type="button" onClick={() => jumpToSection(section.id)}>
                <span>{section.displayNumber}</span>
                {section.title.replace(/^[一二三四五六七八九十]+、/, '')}
              </button>
            ))}
          </div>
        </nav>
      )}

      {loading && (
        <div className="application-materials-loading">
          <div />
          <div />
          <div />
        </div>
      )}

      {loadError && (
        <div className="application-materials-empty">
          <FileText aria-hidden="true" />
          <strong>资料暂时没有加载成功</strong>
          <span>请刷新页面后再试。</span>
        </div>
      )}

      {!loading && !loadError && visibleSections.length === 0 && (
        <div className="application-materials-empty">
          <Search aria-hidden="true" />
          <strong>没有找到“{query}”</strong>
          <button type="button" onClick={() => setQuery('')}>显示全部资料</button>
        </div>
      )}

      <main key={materialRenderKey} className="application-materials-content" onClick={handleContentClick}>
        {visibleSections.map((section) => (
          <section key={section.id} id={`material-${section.id}`} className="application-materials-section">
            <div className="application-materials-section-heading">
              <span>{section.displayNumber}</span>
              <h2>{section.title}</h2>
            </div>
            <div
              className="application-materials-section-body"
              data-material-section-id={section.id}
              contentEditable={editingMaterials}
              suppressContentEditableWarning
              dangerouslySetInnerHTML={{ __html: section.html }}
            />
          </section>
        ))}
      </main>
      </div>
      )}
    </div>
  );
}
