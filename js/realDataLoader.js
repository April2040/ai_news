// ===============================================
// 真实数据加载器 - AI信息聚合平台
// 替换模拟数据，加载真实的AI新闻数据
// ===============================================

class RealDataLoader {
  constructor() {
    this.realData = null;
    this.hotNews = [];
    this.stats = {
      totalNews: 0,
      highImpact: 0,
      dataSources: 0,
      updateFreq: "实时"
    };
  }

  /**
   * 加载真实的AI新闻数据
   * @returns {Promise<Object>} 加载的数据对象
   */
  async loadRealData() {
    try {
      // 优先加载固定名称的最新数据文件
      const realDataFiles = [
        'latest_news.json',             // 固定的最新数据文件（推荐）
        'ai_news_20251221_110947.json', // 最新文件
        'ai_news_20251221_105342.json',
        'ai_news_20251221_104920.json',
        'collected_news.json'           // 备用文件名
      ];

      let loadedData = null;
      
      for (const filename of realDataFiles) {
        try {
          const response = await fetch(filename);
          if (response.ok) {
            loadedData = await response.json();
            console.log(`成功加载真实数据文件: ${filename}`);
            break;
          }
        } catch (error) {
          console.log(`无法加载文件 ${filename}:`, error);
        }
      }

      if (loadedData && loadedData.length > 0) {
        this.realData = loadedData;
        this.processRealData();
        return this.getProcessedData();
      } else {
        console.warn('未找到真实数据文件，使用模拟数据');
        return this.getMockData();
      }
      
    } catch (error) {
      console.error('加载真实数据失败:', error);
      return this.getMockData();
    }
  }

  /**
   * 处理真实数据，转换为前端需要的格式
   */
  processRealData() {
    if (!this.realData) return;

    // 转换数据格式，使其与组件期望的字段匹配
    this.realData = this.realData.map(item => ({
      ...item,
      // 映射字段
      importance: item.importance_score || 5.0,
      sourceIcon: this.getSourceIcon(item.source),
      publishTime: this.formatTime(item.published_date),
      isNew: this.isNewNews(item.published_date),
      isTrending: item.importance_score >= 8.0
    }));

    // 计算统计数据
    this.stats.totalNews = this.realData.length;
    this.stats.highImpact = this.realData.filter(item => item.importance_score >= 8.0).length;
    
    // 统计数据源
    const uniqueSources = new Set(this.realData.map(item => item.source));
    this.stats.dataSources = uniqueSources.size;

    // 生成热点新闻列表（按重要性排序，取前5条）
    this.hotNews = this.realData
      .sort((a, b) => b.importance_score - a.importance_score)
      .slice(0, 5)
      .map((item, index) => ({
        id: item.id,
        title: this.truncateTitle(item.title),
        rank: index + 1,
        trend: 'up',
        trendValue: this.calculateTrendValue(item.importance_score)
      }));

    // 更新分类数据
    this.updateCategoryData();
  }

  /**
   * 计算趋势值
   * @param {number} importanceScore - 重要性评分
   * @returns {string} 趋势值
   */
  calculateTrendValue(importanceScore) {
    if (importanceScore >= 9.0) return '+25%';
    if (importanceScore >= 8.0) return '+15%';
    if (importanceScore >= 7.0) return '+10%';
    return '+5%';
  }

  /**
   * 截断标题
   * @param {string} title - 原始标题
   * @returns {string} 截断后的标题
   */
  truncateTitle(title) {
    return title.length > 30 ? title.substring(0, 30) + '...' : title;
  }

  /**
   * 更新分类数据
   */
  updateCategoryData() {
    // 根据关键词和内容对新闻进行分类
    this.categories = {
      all: { name: "全部资讯", count: this.realData.length },
      tech: { name: "技术突破", count: this.getCategoryCount('tech') },
      industry: { name: "产业动态", count: this.getCategoryCount('industry') },
      application: { name: "应用场景", count: this.getCategoryCount('application') },
      policy: { name: "政策法规", count: this.getCategoryCount('policy') }
    };
  }

  /**
   * 获取特定分类的新闻数量
   * @param {string} category - 分类名称
   * @returns {number} 新闻数量
   */
  getCategoryCount(category) {
    if (category === 'tech') {
      return this.realData.filter(item => 
        item.keywords.some(keyword => 
          ['GPT', 'ChatGPT', 'OpenAI', 'AI', 'machine learning', 'deep learning', 'neural network'].includes(keyword)
        )
      ).length;
    } else if (category === 'industry') {
      return this.realData.filter(item =>
        item.title.toLowerCase().includes('funding') || 
        item.title.toLowerCase().includes('valuation') ||
        item.title.toLowerCase().includes('investment') ||
        item.title.toLowerCase().includes('融资')
      ).length;
    } else if (category === 'application') {
      return this.realData.filter(item =>
        item.title.toLowerCase().includes('chatgpt') ||
        item.title.toLowerCase().includes('safety') ||
        item.title.toLowerCase().includes('usage')
      ).length;
    } else if (category === 'policy') {
      return this.realData.filter(item =>
        item.title.toLowerCase().includes('regulation') ||
        item.title.toLowerCase().includes('policy') ||
        item.title.toLowerCase().includes('safety') ||
        item.title.toLowerCase().includes('law')
      ).length;
    }
    return 0;
  }

  /**
   * 获取处理后的数据
   * @returns {Object} 处理后的数据对象
   */
  getProcessedData() {
    return {
      news: this.realData || [],
      hotNews: this.hotNews,
      categories: this.categories || {},
      stats: this.stats,
      isRealData: true
    };
  }

  /**
   * 获取模拟数据作为备用
   * @returns {Object} 模拟数据对象
   */
  getMockData() {
    return {
      news: window.mockData.news,
      hotNews: window.mockData.hotNews,
      categories: window.mockData.categories,
      stats: window.mockData.stats,
      isRealData: false
    };
  }

  /**
   * 格式化时间显示
   * @param {string} publishedDate - 发布时间
   * @returns {string} 格式化后的时间
   */
  formatTime(publishedDate) {
    if (!publishedDate) return '刚刚';
    
    try {
      const date = new Date(publishedDate);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) {
        return `${diffMins}分钟前`;
      } else if (diffHours < 24) {
        return `${diffHours}小时前`;
      } else if (diffDays < 7) {
        return `${diffDays}天前`;
      } else {
        return date.toLocaleDateString('zh-CN');
      }
    } catch (error) {
      return '刚刚';
    }
  }

  /**
   * 判断是否为新新闻（24小时内发布）
   * @param {string} publishedDate - 发布时间
   * @returns {boolean} 是否为新新闻
   */
  isNewNews(publishedDate) {
    if (!publishedDate) return false;
    try {
      const date = new Date(publishedDate);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = diffMs / 3600000;
      return diffHours < 24;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取新闻的源图标
   * @param {string} source - 新闻源
   * @returns {string} 图标URL
   */
  getSourceIcon(source) {
    // 根据新闻源返回对应的图标
    const iconMap = {
      'TechCrunch AI': 'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png',
      'MIT Technology Review': 'https://wp.technologyreview.com/wp-content/uploads/2018/06/favicon-gradient.png',
      'DeepMind Blog': 'https://deepmind.google/discover/wp-content/uploads/2019/06/favicon.png',
      'AI News': 'https://artificialintelligence-news.com/wp-content/uploads/2020/06/favicon.png'
    };
    
    return iconMap[source] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iMiIgZmlsbD0iI0Y1RjlGQiIvPgo8dGV4dCB4PSI4IiB5PSI4LjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0Y4RkFGQyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RzwvdGV4dD4KPC9zdmc+';
  }

  /**
   * 刷新数据
   * @returns {Promise<Object>} 最新的数据
   */
  async refreshData() {
    console.log('正在刷新AI新闻数据...');
    // 这里可以重新运行数据收集器
    // await this.runDataCollection();
    return await this.loadRealData();
  }

  /**
   * 运行数据收集器（需要在服务器端运行）
   */
  async runDataCollection() {
    // 这个方法需要在服务器端实现
    // 这里只是客户端的接口
    console.log('数据收集功能需要在服务器端运行');
  }
}

/**
 * 增强的数据源管理器
 */
class DataSourceManager {
  constructor() {
    this.loader = new RealDataLoader();
    this.lastUpdate = null;
    this.updateInterval = 30 * 60 * 1000; // 30分钟自动更新
  }

  /**
   * 初始化数据源管理器
   * @returns {Promise<Object>} 初始数据
   */
  async initialize() {
    console.log('🚀 初始化AI信息聚合平台数据源...');
    const data = await this.loader.loadRealData();
    this.lastUpdate = new Date();
    
    if (data.isRealData) {
      console.log('✅ 成功加载真实AI新闻数据');
      console.log(`📊 数据统计: ${data.stats.totalNews}条新闻, ${data.stats.dataSources}个数据源`);
    } else {
      console.log('⚠️ 使用模拟数据 (真实数据不可用)');
    }
    
    return data;
  }

  /**
   * 获取当前数据
   * @returns {Object} 当前数据
   */
  getCurrentData() {
    return this.loader.getProcessedData();
  }

  /**
   * 启动自动更新
   */
  startAutoUpdate() {
    setInterval(async () => {
      console.log('🔄 自动更新数据...');
      await this.loader.refreshData();
      this.lastUpdate = new Date();
    }, this.updateInterval);
  }

  /**
   * 手动刷新数据
   * @returns {Promise<Object>} 最新数据
   */
  async manualRefresh() {
    console.log('🔄 手动刷新数据...');
    const data = await this.loader.refreshData();
    this.lastUpdate = new Date();
    return data;
  }

  /**
   * 获取数据源状态
   * @returns {Object} 状态信息
   */
  getStatus() {
    return {
      lastUpdate: this.lastUpdate,
      isRealData: this.loader.realData !== null,
      totalNews: this.loader.stats.totalNews,
      dataSources: this.loader.stats.dataSources,
      autoUpdate: this.updateInterval > 0
    };
  }
}

// 导出到全局
window.RealDataLoader = RealDataLoader;
window.DataSourceManager = DataSourceManager;