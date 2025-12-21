// ===============================================
// 模拟数据 - AI信息聚合平台
// ===============================================

const mockNewsData = [
  {
    id: 1,
    title: "OpenAI发布GPT-5模型：多模态能力实现重大突破",
    summary: "OpenAI今日正式发布GPT-5模型，该模型在推理能力、多模态理解和代码生成方面实现显著提升。新模型支持文本、图像、音频和视频的联合处理，在复杂任务上的表现接近人类水平。",
    category: "tech",
    source: "OpenAI官方博客",
    sourceIcon: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=32&h=32&fit=crop&crop=faces",
    publishTime: "2小时前",
    importance: 9.5,
    keywords: ["GPT-5", "多模态", "OpenAI", "大语言模型"],
    sentiment: "positive",
    url: "https://openai.com/blog/gpt-5",
    isNew: true,
    isTrending: true
  },
  {
    id: 2,
    title: "Google DeepMind推出AlphaCode 2.0：编程能力接近人类程序员",
    summary: "Google DeepMind发布了AlphaCode 2.0系统，该系统在编程竞赛中表现出色，能够解决复杂算法问题。新的系统在代码生成准确率和执行效率方面都有显著提升。",
    category: "tech",
    source: "DeepMind",
    sourceIcon: "https://images.unsplash.com/photo-1633265486064-086b219458ec?w=32&h=32&fit=crop&crop=faces",
    publishTime: "4小时前",
    importance: 8.8,
    keywords: ["AlphaCode", "编程AI", "Google", "代码生成"],
    sentiment: "positive",
    url: "https://deepmind.com/blog/alphacode-2",
    isNew: true,
    isTrending: false
  },
  {
    id: 3,
    title: "Anthropic完成40亿美元C轮融资，估值达到180亿美元",
    summary: "人工智能安全公司Anthropic完成40亿美元的C轮融资，由Amazon和Google共同领投。本轮融资将用于推进AI安全研究和Claude模型的开发。",
    category: "industry",
    source: "TechCrunch",
    sourceIcon: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=32&h=32&fit=crop&crop=faces",
    publishTime: "6小时前",
    importance: 9.2,
    keywords: ["Anthropic", "融资", "Claude", "AI安全"],
    sentiment: "positive",
    url: "https://techcrunch.com/2025/12/18/anthropic-funding",
    isNew: false,
    isTrending: true
  },
  {
    id: 4,
    title: "Meta发布Llama 3：开源大模型的新里程碑",
    summary: "Meta发布了Llama 3开源大语言模型，该模型在多项基准测试中超越了GPT-3.5。模型提供70B和405B两个版本，支持多种编程语言和复杂的推理任务。",
    category: "tech",
    source: "Meta AI",
    sourceIcon: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=32&h=32&fit=crop&crop=faces",
    publishTime: "8小时前",
    importance: 9.0,
    keywords: ["Llama 3", "开源", "Meta", "大语言模型"],
    sentiment: "positive",
    url: "https://ai.meta.com/blog/llama-3",
    isNew: false,
    isTrending: true
  },
  {
    id: 5,
    title: "欧盟发布《AI法案》实施细则，2025年3月正式生效",
    summary: "欧盟委员会发布了《AI法案》的详细实施细则，对高风险AI系统提出具体要求。该法案将于2025年3月开始实施，将对全球AI行业产生深远影响。",
    category: "policy",
    source: "欧盟委员会",
    sourceIcon: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=32&h=32&fit=crop&crop=faces",
    publishTime: "10小时前",
    importance: 8.5,
    keywords: ["AI法案", "欧盟", "监管", "高风险AI"],
    sentiment: "neutral",
    url: "https://ec.europa.eu/ai-act-implementation",
    isNew: false,
    isTrending: false
  },
  {
    id: 6,
    title: "NVIDIA发布H200 GPU：AI训练性能提升2.4倍",
    summary: "NVIDIA发布了专为AI训练设计的H200 GPU，采用最新的Hopper架构。该GPU在大型语言模型训练方面的性能相比H100提升2.4倍，内存带宽提升2.8倍。",
    category: "tech",
    source: "NVIDIA",
    sourceIcon: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=32&h=32&fit=crop&crop=faces",
    publishTime: "12小时前",
    importance: 8.7,
    keywords: ["H200", "NVIDIA", "GPU", "AI训练"],
    sentiment: "positive",
    url: "https://nvidianews.nvidia.com/news/h200-gpu",
    isNew: false,
    isTrending: false
  },
  {
    id: 7,
    title: "微软Copilot集成ChatGPT-4 Turbo，企业版用户可免费使用",
    summary: "微软宣布将ChatGPT-4 Turbo集成到Copilot中，企业版用户可以免费使用。该更新将为Office 365用户带来更强大的AI助手功能。",
    category: "application",
    source: "Microsoft",
    sourceIcon: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=32&h=32&fit=crop&crop=faces",
    publishTime: "14小时前",
    importance: 8.3,
    keywords: ["Copilot", "ChatGPT-4", "微软", "Office"],
    sentiment: "positive",
    url: "https://blogs.microsoft.com/blog/2025/12/18/copilot-gpt4-turbo",
    isNew: false,
    isTrending: false
  },
  {
    id: 8,
    title: "中国AI芯片公司寒武纪发布第三代思元处理器",
    summary: "寒武纪科技发布第三代思元370处理器，采用7nm工艺制造。该芯片专门针对大模型训练和推理优化，算力密度相比前代提升3倍。",
    category: "tech",
    source: "寒武纪科技",
    sourceIcon: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=32&h=32&fit=crop&crop=faces",
    publishTime: "16小时前",
    importance: 8.1,
    keywords: ["思元370", "寒武纪", "AI芯片", "大模型"],
    sentiment: "positive",
    url: "https://www.cambricon.com/news/siyuan-370",
    isNew: false,
    isTrending: false
  },
  {
    id: 9,
    title: "百度文心一言4.0正式发布，中文理解能力显著提升",
    summary: "百度发布文心一言4.0版本，在中文语言理解、古诗词创作和代码生成方面表现突出。新版本支持更长的上下文窗口，达到128K tokens。",
    category: "tech",
    source: "百度",
    sourceIcon: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=32&h=32&fit=crop&crop=faces",
    publishTime: "18小时前",
    importance: 8.4,
    keywords: ["文心一言", "百度", "中文AI", "大模型"],
    sentiment: "positive",
    url: "https://yiyan.baidu.com/blog/ernie-4-0",
    isNew: false,
    isTrending: false
  },
  {
    id: 10,
    title: "AI药物研发公司Insilico Medicine完成1.5亿美元D轮融资",
    summary: "AI药物研发公司Insilico Medicine完成1.5亿美元D轮融资，由红杉资本中国领投。该公司利用AI技术加速新药发现，缩短药物研发周期。",
    category: "industry",
    source: "VentureBeat",
    sourceIcon: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=32&h=32&fit=crop&crop=faces",
    publishTime: "20小时前",
    importance: 7.8,
    keywords: ["Insilico Medicine", "AI制药", "融资", "药物研发"],
    sentiment: "positive",
    url: "https://venturebeat.com/ai/insilico-funding",
    isNew: false,
    isTrending: false
  },
  {
    id: 11,
    title: "特斯拉FSD Beta版本更新：城市驾驶能力大幅提升",
    summary: "特斯拉发布FSD Beta的最新更新，新版本在城市复杂道路环境下的表现显著改善。更新包括更好的物体识别、路径规划和决策算法。",
    category: "application",
    source: "Tesla",
    sourceIcon: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=32&h=32&fit=crop&crop=faces",
    publishTime: "22小时前",
    importance: 8.6,
    keywords: ["特斯拉", "FSD", "自动驾驶", "AI驾驶"],
    sentiment: "positive",
    url: "https://www.tesla.com/blog/fsd-beta-update",
    isNew: false,
    isTrending: false
  },
  {
    id: 12,
    title: "GitHub Copilot Chat功能正式上线，支持自然语言编程",
    summary: "GitHub Copilot Chat功能正式发布，开发者可以通过自然语言与AI助手交流，获得代码建议、调试帮助和技术解答。该功能集成在VS Code和Visual Studio中。",
    category: "application",
    source: "GitHub",
    sourceIcon: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=32&h=32&fit=crop&crop=faces",
    publishTime: "1天前",
    importance: 8.0,
    keywords: ["GitHub Copilot", "编程助手", "自然语言", "代码生成"],
    sentiment: "positive",
    url: "https://github.blog/2025-12-17/copilot-chat",
    isNew: false,
    isTrending: false
  }
];

const mockHotNews = [
  {
    id: 1,
    title: "OpenAI发布GPT-5模型",
    rank: 1,
    trend: "up",
    trendValue: "+15%"
  },
  {
    id: 3,
    title: "Anthropic完成40亿美元融资",
    rank: 2,
    trend: "up",
    trendValue: "+12%"
  },
  {
    id: 4,
    title: "Meta发布Llama 3开源模型",
    rank: 3,
    trend: "up",
    trendValue: "+8%"
  },
  {
    id: 5,
    title: "欧盟AI法案实施细则",
    rank: 4,
    trend: "neutral",
    trendValue: "0%"
  },
  {
    id: 11,
    title: "特斯拉FSD Beta更新",
    rank: 5,
    trend: "up",
    trendValue: "+5%"
  }
];

const categoryData = {
  all: { name: "全部资讯", count: 156 },
  tech: { name: "技术突破", count: 43 },
  industry: { name: "产业动态", count: 67 },
  application: { name: "应用场景", count: 31 },
  policy: { name: "政策法规", count: 15 }
};

const statsData = {
  totalNews: 156,
  highImpact: 23,
  dataSources: 45,
  updateFreq: "5分钟"
};

// 数据源配置
const dataSources = {
  tech: [
    { name: "OpenAI", url: "https://openai.com/blog/rss/", priority: "high" },
    { name: "DeepMind", url: "https://deepmind.com/blog/rss.xml", priority: "high" },
    { name: "Meta AI", url: "https://ai.meta.com/blog/rss/", priority: "high" },
    { name: "Google AI", url: "https://ai.googleblog.com/feeds/posts/default", priority: "high" },
    { name: "NVIDIA", url: "https://blogs.nvidia.com/blog/category/ai/feed/", priority: "medium" }
  ],
  industry: [
    { name: "TechCrunch", url: "https://techcrunch.com/category/artificial-intelligence/feed/", priority: "high" },
    { name: "VentureBeat", url: "https://venturebeat.com/ai/feed/", priority: "high" },
    { name: "MIT Technology Review", url: "https://www.technologyreview.com/feed/", priority: "medium" },
    { name: "Wired", url: "https://www.wired.com/feed/tag/ai/latest/rss", priority: "medium" }
  ],
  application: [
    { name: "Tesla", url: "https://www.tesla.com/blog/rss.xml", priority: "medium" },
    { name: "Microsoft", url: "https://blogs.microsoft.com/feed/", priority: "high" },
    { name: "GitHub", url: "https://github.blog/feed/", priority: "medium" },
    { name: "IBM", url: "https://www.ibm.com/blogs/think/feed/", priority: "low" }
  ],
  policy: [
    { name: "欧盟委员会", url: "https://ec.europa.eu/info/news/rss_en.xml", priority: "high" },
    { name: "美国NIST", url: "https://www.nist.gov/news-events/news/feed", priority: "medium" },
    { name: "中国信通院", url: "http://www.caict.ac.cn/news/rss.xml", priority: "medium" }
  ]
};

// 情感分析配置
const sentimentConfig = {
  positive: {
    label: "积极",
    icon: "😊",
    color: "var(--color-high-impact)"
  },
  neutral: {
    label: "中性",
    icon: "😐",
    color: "var(--text-secondary-light)"
  },
  negative: {
    label: "消极",
    icon: "😞",
    color: "#EF4444"
  }
};

// 重要性评分配置
const importanceConfig = {
  high: { min: 8.5, label: "高影响", color: "var(--color-high-impact)" },
  medium: { min: 7.0, label: "中等影响", color: "var(--color-medium-impact)" },
  low: { min: 0, label: "一般影响", color: "var(--text-secondary-light)" }
};

// 导出数据
window.mockData = {
  news: mockNewsData,
  hotNews: mockHotNews,
  categories: categoryData,
  stats: statsData,
  sources: dataSources,
  sentiment: sentimentConfig,
  importance: importanceConfig
};