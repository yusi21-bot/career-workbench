import type { NewsItem } from '../types';

export const AI_BUILDERS_DIGEST_META = {
  "generatedAt": "2026-08-13T09:03:44.183Z",
  "feedGeneratedAt": "2026-08-13T06:47:37.704Z",
  "stats": {
    "podcastEpisodes": 1,
    "xBuilders": 16,
    "totalTweets": 33,
    "blogPosts": 3,
    "feedGeneratedAt": "2026-08-13T06:47:37.704Z"
  }
} as const;

export const AI_BUILDERS_NEWS: NewsItem[] = [
  {
    "id": "ai-builders-x-2026-08-13-thsottiaux",
    "title": "AI 产品迭代正在进入更高频的阶段",
    "summary": "高频发布和快速反馈正在成为 AI 产品的常态，产品团队需要把模型能力、用户反馈和版本验证连成短闭环。",
    "content": "高频发布和快速反馈正在成为 AI 产品的常态，产品团队需要把模型能力、用户反馈和版本验证连成短闭环。\n\n产品管理：用快速实验验证真实使用价值，同时控制版本回归风险。\n\n来源人物：Thibault Sottiaux。简介：Codex & ChatGPT @OpenAI\n\n原文摘录：Old news actually from a bunch of days ago, but crossed that 15M. Enjoy a nice reset everyone. Landing in the next hour or so, go /fast.",
    "source": "Thibault Sottiaux / X / follow-builders",
    "url": "https://x.com/thsottiaux/status/2087706104814023111",
    "publishDate": "2026-08-13",
    "publishTime": "AI Builders Digest",
    "tags": [
      "AI产品",
      "产品迭代",
      "AI评测",
      "Builder",
      "follow-builders"
    ],
    "connectedCompanies": [],
    "savedToKnowledge": false,
    "isIdea": true,
    "category": "Builder观点",
    "coreIdea": "高频发布和快速反馈正在成为 AI 产品的常态，产品团队需要把模型能力、用户反馈和版本验证连成短闭环。",
    "productLens": "产品管理：用快速实验验证真实使用价值，同时控制版本回归风险。"
  },
  {
    "id": "ai-builders-x-2026-08-13-swyx",
    "title": "Builder 观点：关注 AI 产品的真实落地",
    "summary": "这条 Builder 动态值得从“用户问题、AI 能力和落地场景”三个角度继续追问，而不止停留在产品发布本身。",
    "content": "这条 Builder 动态值得从“用户问题、AI 能力和落地场景”三个角度继续追问，而不止停留在产品发布本身。\n\n面试视角：把观点还原成用户价值、产品机制和验证指标。\n\n来源人物：Swyx。简介：achieve ambition with intentionality, intensity, integrity & insanity. affiliations: - @s...\n\n原文摘录：Perplexity offered to buy @googlechrome one year ago today (this is a scheduled tweet) https://t.co/EdFp28P2qO",
    "source": "Swyx / X / follow-builders",
    "url": "https://x.com/swyx/status/2087691099691475285",
    "publishDate": "2026-08-13",
    "publishTime": "AI Builders Digest",
    "tags": [
      "AI产品",
      "产品思考",
      "Builder",
      "follow-builders"
    ],
    "connectedCompanies": [],
    "savedToKnowledge": false,
    "isIdea": true,
    "category": "Builder观点",
    "coreIdea": "这条 Builder 动态值得从“用户问题、AI 能力和落地场景”三个角度继续追问，而不止停留在产品发布本身。",
    "productLens": "面试视角：把观点还原成用户价值、产品机制和验证指标。"
  },
  {
    "id": "ai-builders-x-2026-08-13-rauchg",
    "title": "Builder 观点：关注 AI 产品的真实落地",
    "summary": "这条 Builder 动态值得从“用户问题、AI 能力和落地场景”三个角度继续追问，而不止停留在产品发布本身。",
    "content": "这条 Builder 动态值得从“用户问题、AI 能力和落地场景”三个角度继续追问，而不止停留在产品发布本身。\n\n面试视角：把观点还原成用户价值、产品机制和验证指标。\n\n来源人物：Guillermo Rauch。简介：@vercel CEO\n\n原文摘录：Endless opportunity everywhere you look",
    "source": "Guillermo Rauch / X / follow-builders",
    "url": "https://x.com/rauchg/status/2087736311885218160",
    "publishDate": "2026-08-13",
    "publishTime": "AI Builders Digest",
    "tags": [
      "AI产品",
      "产品思考",
      "Builder",
      "follow-builders"
    ],
    "connectedCompanies": [],
    "savedToKnowledge": false,
    "isIdea": true,
    "category": "Builder观点",
    "coreIdea": "这条 Builder 动态值得从“用户问题、AI 能力和落地场景”三个角度继续追问，而不止停留在产品发布本身。",
    "productLens": "面试视角：把观点还原成用户价值、产品机制和验证指标。"
  },
  {
    "id": "ai-builders-blog-2026-08-13-2",
    "title": "Managed Agents：把“思考”和“执行”拆开",
    "summary": "长任务 Agent 的关键不只是更强模型，而是把“负责推理的脑”和“负责执行的手”拆开，让上下文、工具权限和运行时可以独立演进。",
    "content": "长任务 Agent 的关键不只是更强模型，而是把“负责推理的脑”和“负责执行的手”拆开，让上下文、工具权限和运行时可以独立演进。\n\nAgent 架构：推理层与执行层解耦，才能支撑长期任务和复杂工具调用。\n\n原文摘要：Get started with Claude Managed Agents by following our docs . A running topic on the Engineering Blog is how to build effective agents and design harnesses for long-running work . A common thread across this work is that harnesses encode assumptions about what Claude can’t do on its own. However, those assumptions need to be frequently questioned because they can go stale as models improve. As just one example, in prior work we found that Claude Sonnet 4.5 would wrap up tasks prematurely as it sensed its context limit approaching—a behavior sometimes called “context anxiety.” We addressed this by adding context resets to the harness. But wh...",
    "source": "Anthropic Engineering / follow-builders",
    "url": "https://www.anthropic.com/engineering/managed-agents",
    "publishDate": "2026-08-13",
    "publishTime": "AI Builders Digest",
    "tags": [
      "Agent",
      "基础模型",
      "系统架构",
      "follow-builders"
    ],
    "connectedCompanies": [],
    "savedToKnowledge": false,
    "isIdea": false,
    "category": "AI深读",
    "coreIdea": "长任务 Agent 的关键不只是更强模型，而是把“负责推理的脑”和“负责执行的手”拆开，让上下文、工具权限和运行时可以独立演进。",
    "productLens": "Agent 架构：推理层与执行层解耦，才能支撑长期任务和复杂工具调用。"
  },
  {
    "id": "ai-builders-blog-2026-08-13-1",
    "title": "Claude Code 质量问题复盘：模型变差了吗？",
    "summary": "一次用户感知到的“模型变差”，可能来自推理强度、上下文处理和工具链的组合变化；AI 产品评测不能只看模型分数，还要看真实任务成功率、延迟和版本回归。",
    "content": "一次用户感知到的“模型变差”，可能来自推理强度、上下文处理和工具链的组合变化；AI 产品评测不能只看模型分数，还要看真实任务成功率、延迟和版本回归。\n\nAI 评测：把真实工作流、稳定性和体验指标纳入版本验收。\n\n原文摘要：Over the past month, we’ve been looking into reports that Claude’s responses have worsened for some users. We’ve traced these reports to three separate changes that affected Claude Code, the Claude Agent SDK, and Claude Cowork. The API was not impacted. All three issues have now been resolved as of April 20 (v2.1.116). In this post, we explain what we found, what we fixed, and what we’ll do differently to ensure similar issues are much less likely to happen again. We take reports about degradation very seriously. We never intentionally degrade our models, and we were able to immediately confirm that our API and inference layer were unaffecte...",
    "source": "Anthropic Engineering / follow-builders",
    "url": "https://www.anthropic.com/engineering/april-23-postmortem",
    "publishDate": "2026-08-13",
    "publishTime": "AI Builders Digest",
    "tags": [
      "AI评测",
      "Agent",
      "模型质量",
      "follow-builders"
    ],
    "connectedCompanies": [],
    "savedToKnowledge": false,
    "isIdea": false,
    "category": "AI深读",
    "coreIdea": "一次用户感知到的“模型变差”，可能来自推理强度、上下文处理和工具链的组合变化；AI 产品评测不能只看模型分数，还要看真实任务成功率、延迟和版本回归。",
    "productLens": "AI 评测：把真实工作流、稳定性和体验指标纳入版本验收。"
  },
  {
    "id": "ai-builders-x-2026-08-13-zarazhangrui",
    "title": "Builder 观点：关注 AI 产品的真实落地",
    "summary": "这条 Builder 动态值得从“用户问题、AI 能力和落地场景”三个角度继续追问，而不止停留在产品发布本身。",
    "content": "这条 Builder 动态值得从“用户问题、AI 能力和落地场景”三个角度继续追问，而不止停留在产品发布本身。\n\n面试视角：把观点还原成用户价值、产品机制和验证指标。\n\n来源人物：Zara Zhang。简介：Builder. Make something people want, then make people want it. Harvard’17. GitHub: https:...\n\n原文摘录：This Stanford lecture series is pure gold. Crazy that such high-quality knowledge is freely disseminated on YouTube https://t.co/bHH1QYLy98",
    "source": "Zara Zhang / X / follow-builders",
    "url": "https://x.com/zarazhangrui/status/2087547174662136273",
    "publishDate": "2026-08-12",
    "publishTime": "AI Builders Digest",
    "tags": [
      "AI产品",
      "产品思考",
      "Builder",
      "follow-builders"
    ],
    "connectedCompanies": [],
    "savedToKnowledge": false,
    "isIdea": true,
    "category": "Builder观点",
    "coreIdea": "这条 Builder 动态值得从“用户问题、AI 能力和落地场景”三个角度继续追问，而不止停留在产品发布本身。",
    "productLens": "面试视角：把观点还原成用户价值、产品机制和验证指标。"
  },
  {
    "id": "ai-builders-x-2026-08-13-steipete",
    "title": "Agent 产品正在从命令行工具走向云端服务",
    "summary": "Agent 的产品形态正在从 CLI、桌面应用扩展到云端服务和持续运行的会话，使用入口会越来越接近“交代目标”而不是“操作工具”。",
    "content": "Agent 的产品形态正在从 CLI、桌面应用扩展到云端服务和持续运行的会话，使用入口会越来越接近“交代目标”而不是“操作工具”。\n\n产品演进：关注 Agent 的运行时、状态保持、权限和交付方式。\n\n来源人物：Peter Steinberger。简介：Polyagentmorous ClawFather. Came back from retirement to mess with AI and help a lobster...\n\n原文摘录：cli was a year ago. apps maybe 6 months. now it’s services, web, cloud sessions. https://t.co/UlwOZslqX9",
    "source": "Peter Steinberger / X / follow-builders",
    "url": "https://x.com/steipete/status/2087568620465607078",
    "publishDate": "2026-08-12",
    "publishTime": "AI Builders Digest",
    "tags": [
      "Agent",
      "产品演进",
      "基础设施",
      "Builder",
      "follow-builders"
    ],
    "connectedCompanies": [],
    "savedToKnowledge": false,
    "isIdea": true,
    "category": "Builder观点",
    "coreIdea": "Agent 的产品形态正在从 CLI、桌面应用扩展到云端服务和持续运行的会话，使用入口会越来越接近“交代目标”而不是“操作工具”。",
    "productLens": "产品演进：关注 Agent 的运行时、状态保持、权限和交付方式。"
  },
  {
    "id": "ai-builders-x-2026-08-13-garrytan",
    "title": "个人知识库与 Agent 技能正在形成可迭代的工作系统",
    "summary": "个人 Agent 的价值不只是一次性回答，而是把长期积累的资料、技能和工作习惯组织成可复用、可持续改进的系统。",
    "content": "个人 Agent 的价值不只是一次性回答，而是把长期积累的资料、技能和工作习惯组织成可复用、可持续改进的系统。\n\nAI 产品：长期记忆、技能复用和反馈闭环，是个人 AI 的关键体验。\n\n来源人物：Garry Tan。简介：President & CEO @ycombinator —Founder @garryslist—Creator of GStack & GBrain—designer/eng...\n\n原文摘录：GBrain just dropped v0.45.6.0 which added 17 new brain skills hardened through my own personal OpenClaw agent with hundreds of thousands of markdown files. A personal AGI is one that works for you. GBrain now works with Codex and Claude code, btw. https://t.co/yFpFU4pn5b https://t.co/MqpMfX4wsX",
    "source": "Garry Tan / X / follow-builders",
    "url": "https://x.com/garrytan/status/2087594114372259890",
    "publishDate": "2026-08-12",
    "publishTime": "AI Builders Digest",
    "tags": [
      "Agent",
      "AI产品",
      "个人知识库",
      "Builder",
      "follow-builders"
    ],
    "connectedCompanies": [],
    "savedToKnowledge": false,
    "isIdea": true,
    "category": "Builder观点",
    "coreIdea": "个人 Agent 的价值不只是一次性回答，而是把长期积累的资料、技能和工作习惯组织成可复用、可持续改进的系统。",
    "productLens": "AI 产品：长期记忆、技能复用和反馈闭环，是个人 AI 的关键体验。"
  },
  {
    "id": "ai-builders-x-2026-08-13-claudeai",
    "title": "AI 助手开始跨设备保持连续上下文",
    "summary": "当对话、技能和连接器能跨浏览器、桌面与移动端延续，AI 助手才真正从单次聊天变成持续服务。",
    "content": "当对话、技能和连接器能跨浏览器、桌面与移动端延续，AI 助手才真正从单次聊天变成持续服务。\n\n产品体验：跨端一致性和上下文连续性，会直接影响用户留存。\n\n来源人物：Claude。简介：Claude is an AI assistant built by @anthropicai to be safe, accurate, and secure. Talk to...\n\n原文摘录：Your Claude in Chrome sessions now carry over to desktop, web, and mobile. Conversations are saved, and your skills and connectors work in the browser. Available on Max and Team today, rolling out to Pro in the coming weeks. https://t.co/Hnxs18PVI8",
    "source": "Claude / X / follow-builders",
    "url": "https://x.com/claudeai/status/2087635262390026525",
    "publishDate": "2026-08-12",
    "publishTime": "AI Builders Digest",
    "tags": [
      "AI产品",
      "Agent",
      "用户体验",
      "Builder",
      "follow-builders"
    ],
    "connectedCompanies": [],
    "savedToKnowledge": false,
    "isIdea": true,
    "category": "Builder观点",
    "coreIdea": "当对话、技能和连接器能跨浏览器、桌面与移动端延续，AI 助手才真正从单次聊天变成持续服务。",
    "productLens": "产品体验：跨端一致性和上下文连续性，会直接影响用户留存。"
  },
  {
    "id": "ai-builders-x-2026-08-13-amandaaskell",
    "title": "Builder 观点：关注 AI 产品的真实落地",
    "summary": "这条 Builder 动态值得从“用户问题、AI 能力和落地场景”三个角度继续追问，而不止停留在产品发布本身。",
    "content": "这条 Builder 动态值得从“用户问题、AI 能力和落地场景”三个角度继续追问，而不止停留在产品发布本身。\n\n面试视角：把观点还原成用户价值、产品机制和验证指标。\n\n来源人物：Amanda Askell。简介：Philosopher & ethicist trying to make AI be good @AnthropicAI. Personal account. All opin...\n\n原文摘录：When I started playing Skyrim, I quickly realized you can make a lot of progress without doing any killing. You can also adopt orphans and build them nice houses, so I focused on that. I honestly don't really remember the plot beyond \"that challenging fantasy philanthropy game\".",
    "source": "Amanda Askell / X / follow-builders",
    "url": "https://x.com/AmandaAskell/status/2087597131800674495",
    "publishDate": "2026-08-12",
    "publishTime": "AI Builders Digest",
    "tags": [
      "AI产品",
      "产品思考",
      "Builder",
      "follow-builders"
    ],
    "connectedCompanies": [],
    "savedToKnowledge": false,
    "isIdea": true,
    "category": "Builder观点",
    "coreIdea": "这条 Builder 动态值得从“用户问题、AI 能力和落地场景”三个角度继续追问，而不止停留在产品发布本身。",
    "productLens": "面试视角：把观点还原成用户价值、产品机制和验证指标。"
  },
  {
    "id": "ai-builders-podcast-2026-08-13-4",
    "title": "微软 CTO：Agent 正在重写互联网的使用方式",
    "summary": "Agent 要真正替用户完成任务，必须能调用工具并修改系统；产品竞争点会从聊天体验转向权限、可靠性和可追踪的执行闭环。",
    "content": "Agent 要真正替用户完成任务，必须能调用工具并修改系统；产品竞争点会从聊天体验转向权限、可靠性和可追踪的执行闭环。\n\n产品形态：从“回答问题”走向“代表用户完成任务”。\n\n原文摘要：Speaker 1 | 00:00 - 00:10 You're someone who, I think, cares a lot about the craft of things. One of the knocks on, you know, using agents for coding is it gets rid of some of that feeling or something like that. How do you feel about that? Speaker 2 | 00:10 - 00:38 I love the fact that my people, you know, makers, writ large, so software engineers or, you know, mechanical engineers Yeah. Or woodworkers or potters. If you are really passionate about what you do, you're going to have very strong opinions about how you do it. I've been a woodworker for almost as long as I've been a programmer. This is not the first moment in the past four deca...",
    "source": "AI & I by Every / follow-builders",
    "url": "https://www.youtube.com/playlist?list=PLuMcoKK9mKgHtW_o9h5sGO2vXrffKHwJL",
    "publishDate": "2026-08-12",
    "publishTime": "AI Builders Digest",
    "tags": [
      "Agent",
      "AI产品",
      "基础模型",
      "follow-builders"
    ],
    "connectedCompanies": [],
    "savedToKnowledge": false,
    "isIdea": false,
    "category": "访谈播客",
    "coreIdea": "Agent 要真正替用户完成任务，必须能调用工具并修改系统；产品竞争点会从聊天体验转向权限、可靠性和可追踪的执行闭环。",
    "productLens": "产品形态：从“回答问题”走向“代表用户完成任务”。"
  },
  {
    "id": "ai-builders-blog-2026-08-13-3",
    "title": "Managed Agents 支持自托管沙箱与 MCP 隧道",
    "summary": "企业使用 Agent 时，核心问题会从“模型能不能回答”转向“能不能在企业边界内安全执行”；自托管沙箱、私有 MCP 和权限隔离是落地基础。",
    "content": "企业使用 Agent 时，核心问题会从“模型能不能回答”转向“能不能在企业边界内安全执行”；自托管沙箱、私有 MCP 和权限隔离是落地基础。\n\nToB 产品：把安全边界、数据权限和可追踪执行做成产品能力。\n\n原文摘要：Starting today, Claude Managed Agents can operate in a sandbox you control and connect to your private Model Context Protocol (MCP) servers. Both the sandbox where an agent executes tools and the services it reaches run within the established boundaries of your enterprise, under your security and runtime controls. The sandbox runs on your own infrastructure, or with managed providers like Cloudflare , Daytona , Modal , or Vercel to handle the compute and isolation for you. On the Claude Platform, self-hosted sandboxes is available in public beta and MCP tunnels in research preview ( request access ). Self-hosted sandboxes: keep agent executi...",
    "source": "Claude Blog / follow-builders",
    "url": "https://claude.com/blog/claude-managed-agents-updates",
    "publishDate": "2026-05-18",
    "publishTime": "AI Builders Digest",
    "tags": [
      "Agent",
      "ToB",
      "AI安全",
      "follow-builders"
    ],
    "connectedCompanies": [],
    "savedToKnowledge": false,
    "isIdea": false,
    "category": "AI深读",
    "coreIdea": "企业使用 Agent 时，核心问题会从“模型能不能回答”转向“能不能在企业边界内安全执行”；自托管沙箱、私有 MCP 和权限隔离是落地基础。",
    "productLens": "ToB 产品：把安全边界、数据权限和可追踪执行做成产品能力。"
  }
];
