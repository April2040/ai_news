// ===============================================
// 主应用逻辑 - AI信息聚合平台 (真实数据版)
// 集成真实数据收集和处理功能
// ===============================================

class AIInfoAppRealData {
  constructor() {
    this.currentPage = 1;
    this.pageSize = 10;
    this.currentCategory = 'all';
    this.currentQuery = '';
    this.currentSort = 'importance'; // 默认按重要性排序（真实数据更适合）
    this.isLoading = false;
    
    // 组件实例
    this.newsContainer = null;
    this.hotList = null;
    this.statsPanel = null;
    this.categoryFilter = null;
    this.loadingState = null;
    this.errorState = null;
    this.emptyState = null;
    
    // 数据
    this.realDataManager = null;
    this.allNews = [];
    this.filteredNews = [];
    this.displayedNews = [];
    
    // 初始化应用
    this.init();
  }
  
  /**
   * 初始化应用
   */
  async init() {
    console.log('🚀 启动AI信息聚合平台 (真实数据版)...');
    
    this.initTheme();
    this.initComponents();
    this.bindEvents();
    await this.loadInitialData();
    this.startPeriodicUpdate();
  }
  
  /**
   * 初始化主题
   */
  initTheme() {
    const savedTheme = utils.localStorage.get('theme', 'light');
    this.setTheme(savedTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      this.setTheme(newTheme);
    });
  }
  
  /**
   * 设置主题
   * @param {string} theme - 主题名称
   */
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    utils.localStorage.set('theme', theme);
  }
  
  /**
   * 初始化组件
   */
  initComponents() {
    this.newsContainer = document.getElementById('newsContainer');
    this.loadingState = new components.LoadingState(this.newsContainer);
    this.errorState = new components.ErrorState(this.newsContainer);
    this.emptyState = new components.EmptyState(this.newsContainer);
    
    // 初始化真实数据管理器
    this.realDataManager = new DataSourceManager();
  }
  
  /**
   * 绑定事件
   */
  bindEvents() {
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    
    searchInput.addEventListener('input', utils.debounce((e) => {
      this.handleSearch(e.target.value);
    }, 300));
    
    clearSearch.addEventListener('click', () => {
      searchInput.value = '';
      this.handleSearch('');
    });
    
    // 排序功能
    const sortSelect = document.getElementById('sortSelect');
    sortSelect.addEventListener('change', (e) => {
      this.handleSort(e.target.value);
    });
    
    // 加载更多
    const loadMoreBtn = document.getElementById('loadMore');
    loadMoreBtn.addEventListener('click', () => {
      this.loadMore();
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
          case 'f':
            e.preventDefault();
            searchInput.focus();
            break;
          case 'r':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              this.refreshData();
            }
            break;
        }
      }
    });
    
    // 滚动事件
    window.addEventListener('scroll', utils.throttle(() => {
      this.handleScroll();
    }, 100));
    
    // 页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkForUpdates();
      }
    });
  }
  
  /**
   * 加载初始数据
   */
  async loadInitialData() {
    this.showLoading('正在加载最新AI资讯...');
    
    try {
      // 初始化数据源管理器并加载数据
      const data = await this.realDataManager.initialize();
      
      // 设置数据
      this.allNews = data.news;
      this.applyFilters();
      this.hideLoading();
      
      // 显示数据来源信息
      this.showDataSourceInfo(data);
      
    } catch (error) {
      console.error('加载数据失败:', error);
      this.showError('加载AI资讯失败，请稍后重试');
    }
  }
  
  /**
   * 显示数据来源信息
   * @param {Object} data - 数据对象
   */
  showDataSourceInfo(data) {
    if (data.isRealData) {
      // 创建数据来源指示器
      const indicator = document.createElement('div');
      indicator.className = 'data-source-indicator';
      indicator.innerHTML = `
        <div class="indicator-content">
          <span class="indicator-icon">📡</span>
          <span class="indicator-text">实时数据</span>
          <span class="indicator-time">${new Date().toLocaleTimeString('zh-CN')}</span>
        </div>
      `;
      
      // 添加样式
      const style = document.createElement('style');
      style.textContent = `
        .data-source-indicator {
          position: fixed;
          top: 20px;
          left: 20px;
          background: var(--primary-500);
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          z-index: 999;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          animation: slideInLeft 0.5s ease;
        }
        .indicator-content {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .indicator-time {
          opacity: 0.8;
          font-family: monospace;
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(indicator);
      
      // 3秒后自动消失
      setTimeout(() => {
        indicator.style.animation = 'slideInLeft 0.5s ease reverse';
        setTimeout(() => indicator.remove(), 500);
      }, 3000);
    }
  }
  
  /**
   * 显示加载状态
   * @param {string} message - 加载消息
   */
  showLoading(message = '加载中...') {
    this.isLoading = true;
    
    // 创建自定义加载状态
    const loadingElement = document.createElement('div');
    loadingElement.className = 'custom-loading-state';
    loadingElement.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text">${message}</div>
      <div class="loading-subtitle">正在从权威AI资讯源获取最新信息...</div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      .custom-loading-state {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-secondary-light);
      }
      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--border-light);
        border-top: 3px solid var(--primary-500);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }
      .loading-text {
        font-size: 18px;
        font-weight: 500;
        margin-bottom: 8px;
      }
      .loading-subtitle {
        font-size: 14px;
        opacity: 0.7;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    
    if (!document.querySelector('#loading-styles')) {
      style.id = 'loading-styles';
      document.head.appendChild(style);
    }
    
    this.newsContainer.innerHTML = '';
    this.newsContainer.appendChild(loadingElement);
  }
  
  /**
   * 隐藏加载状态
   */
  hideLoading() {
    this.isLoading = false;
    // 加载状态会通过updateDisplay方法清除
  }
  
  /**
   * 显示错误状态
   * @param {string} message - 错误消息
   */
  showError(message) {
    this.errorState.show(message, () => {
      this.refreshData();
    });
  }
  
  /**
   * 处理搜索
   * @param {string} query - 搜索关键词
   */
  handleSearch(query) {
    this.currentQuery = query.trim();
    const clearSearch = document.getElementById('clearSearch');
    
    if (clearSearch) {
      clearSearch.style.display = this.currentQuery ? 'block' : 'none';
    }
    
    this.currentPage = 1;
    this.applyFilters();
  }
  
  /**
   * 处理排序
   * @param {string} sort - 排序方式
   */
  handleSort(sort) {
    this.currentSort = sort;
    this.currentPage = 1;
    this.applyFilters();
  }
  
  /**
   * 按分类筛选
   * @param {string} category - 分类
   */
  filterByCategory(category) {
    this.currentCategory = category;
    this.currentPage = 1;
    this.applyFilters();
  }
  
  /**
   * 应用筛选条件
   */
  applyFilters() {
    this.showLoading('正在筛选资讯...');
    
    // 模拟处理延迟
    setTimeout(() => {
      // 分类筛选
      let filtered = this.allNews;
      if (this.currentCategory !== 'all') {
        filtered = this.filterByCategoryLogic(filtered, this.currentCategory);
      }
      
      // 搜索筛选
      if (this.currentQuery) {
        filtered = utils.searchArray(filtered, this.currentQuery);
      }
      
      // 排序
      switch (this.currentSort) {
        case 'importance':
          filtered = utils.sortArray(filtered, 'importance_score', 'desc');
          break;
        case 'relevance':
          // 基于重要性排序（真实数据没有相关性评分）
          filtered = utils.sortArray(filtered, 'importance_score', 'desc');
          break;
        default: // time
          // 按发布时间排序
          filtered.sort((a, b) => {
            const dateA = new Date(a.published_date || a.created_at);
            const dateB = new Date(b.published_date || b.created_at);
            return dateB - dateA;
          });
          break;
      }
      
      this.filteredNews = filtered;
      this.updateDisplay();
      this.hideLoading();
    }, 300);
  }
  
  /**
   * 按分类逻辑筛选
   * @param {Array} newsList - 新闻列表
   * @param {string} category - 分类
   * @returns {Array} 筛选后的新闻
   */
  filterByCategoryLogic(newsList, category) {
    switch (category) {
      case 'tech':
        return newsList.filter(item => 
          item.keywords.some(keyword => 
            ['GPT', 'ChatGPT', 'OpenAI', 'AI', 'machine learning', 'deep learning', 'neural network'].includes(keyword)
          ) ||
          item.title.toLowerCase().includes('ai') ||
          item.title.toLowerCase().includes('artificial intelligence')
        );
      
      case 'industry':
        return newsList.filter(item =>
          item.title.toLowerCase().includes('funding') || 
          item.title.toLowerCase().includes('valuation') ||
          item.title.toLowerCase().includes('investment') ||
          item.title.toLowerCase().includes('startup') ||
          item.title.toLowerCase().includes('company')
        );
      
      case 'application':
        return newsList.filter(item =>
          item.title.toLowerCase().includes('chatgpt') ||
          item.title.toLowerCase().includes('safety') ||
          item.title.toLowerCase().includes('usage') ||
          item.title.toLowerCase().includes('user')
        );
      
      case 'policy':
        return newsList.filter(item =>
          item.title.toLowerCase().includes('regulation') ||
          item.title.toLowerCase().includes('policy') ||
          item.title.toLowerCase().includes('safety') ||
          item.title.toLowerCase().includes('law') ||
          item.title.toLowerCase().includes('standard')
        );
      
      default:
        return newsList;
    }
  }
  
  /**
   * 更新显示内容
   */
  updateDisplay() {
    const pagination = utils.paginateArray(
      this.filteredNews, 
      this.currentPage, 
      this.pageSize
    );
    
    this.displayedNews = pagination.data;
    
    if (this.displayedNews.length === 0) {
      this.showEmpty();
      return;
    }
    
    this.renderNewsList();
    this.updateLoadMoreButton(pagination);
    this.updateStats();
  }
  
  /**
   * 渲染新闻列表
   */
  renderNewsList() {
    this.newsContainer.innerHTML = '';
    
    this.displayedNews.forEach(newsItem => {
      const newsCard = new components.NewsCard(newsItem, {
        highlightQuery: this.currentQuery
      });
      
      newsCard.setKeywordClickHandler((keyword) => {
        this.handleKeywordClick(keyword);
      });
      
      this.newsContainer.appendChild(newsCard.create());
    });
  }
  
  /**
   * 更新统计信息
   */
  updateStats() {
    if (this.realDataManager) {
      const status = this.realDataManager.getStatus();
      
      // 更新统计面板
      const totalNewsElement = document.getElementById('totalNews');
      const highImpactElement = document.getElementById('highImpact');
      const dataSourcesElement = document.getElementById('dataSources');
      
      if (totalNewsElement) totalNewsElement.textContent = status.totalNews;
      if (highImpactElement) {
        const highImpactCount = this.allNews.filter(item => item.importance_score >= 8.0).length;
        highImpactElement.textContent = highImpactCount;
      }
      if (dataSourcesElement) dataSourcesElement.textContent = status.dataSources;
    }
  }
  
  /**
   * 处理关键词点击
   * @param {string} keyword - 关键词
   */
  handleKeywordClick(keyword) {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = keyword;
    this.handleSearch(keyword);
  }
  
  /**
   * 更新加载更多按钮
   * @param {Object} pagination - 分页信息
   */
  updateLoadMoreButton(pagination) {
    const loadMoreContainer = document.querySelector('.load-more-container');
    const loadMoreBtn = document.getElementById('loadMore');
    
    if (pagination.hasNext) {
      loadMoreContainer.style.display = 'block';
      loadMoreBtn.textContent = '加载更多AI资讯';
    } else {
      loadMoreContainer.style.display = 'none';
    }
  }
  
  /**
   * 加载更多
   */
  loadMore() {
    if (this.isLoading) return;
    
    this.currentPage++;
    this.updateDisplay();
  }
  
  /**
   * 显示空状态
   */
  showEmpty() {
    const hasFilters = this.currentCategory !== 'all' || this.currentQuery;
    const message = hasFilters ? '未找到匹配的AI资讯' : '暂无AI资讯';
    const hint = hasFilters 
      ? '请尝试调整筛选条件或搜索关键词' 
      : '请稍后再试或刷新数据';
    
    this.emptyState.show(message, hint);
    document.querySelector('.load-more-container').style.display = 'none';
  }
  
  /**
   * 刷新数据
   */
  async refreshData() {
    console.log('🔄 刷新AI资讯数据...');
    this.showLoading('正在刷新最新资讯...');
    
    try {
      const data = await this.realDataManager.manualRefresh();
      this.allNews = data.news;
      this.applyFilters();
      
      // 显示刷新成功提示
      this.showRefreshSuccess();
      
    } catch (error) {
      console.error('刷新数据失败:', error);
      this.showError('刷新数据失败，请检查网络连接');
    }
  }
  
  /**
   * 显示刷新成功提示
   */
  showRefreshSuccess() {
    const notification = utils.domUtils.createElement('div', {
      className: 'refresh-success-notification',
      style: `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-high-impact);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
      `
    });
    
    notification.innerHTML = `
      <span>✅ 数据已更新</span>
      <button style="
        margin-left: 10px;
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
      ">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // 显示动画
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });
    
    // 自动隐藏
    setTimeout(() => {
      this.hideNotification(notification);
    }, 3000);
    
    // 点击关闭
    const closeBtn = notification.querySelector('button');
    closeBtn.addEventListener('click', () => {
      this.hideNotification(notification);
    });
  }
  
  /**
   * 隐藏通知
   * @param {HTMLElement} notification - 通知元素
   */
  hideNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
  
  /**
   * 检查更新
   */
  async checkForUpdates() {
    // 页面变为可见时，检查是否有新数据
    if (this.realDataManager) {
      const status = this.realDataManager.getStatus();
      if (status.isRealData) {
        // 可以在这里实现后台数据更新检查
        console.log('页面可见，检查数据更新...');
      }
    }
  }
  
  /**
   * 启动定期更新
   */
  startPeriodicUpdate() {
    if (this.realDataManager) {
      this.realDataManager.startAutoUpdate();
    }
  }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', async () => {
  // 性能监控
  utils.performanceUtils.mark('app-start');
  
  // 全局错误处理
  utils.errorUtils.catchGlobalErrors((error) => {
    console.error('Global error:', error);
  });
  
  try {
    // 创建应用实例
    window.aiApp = new AIInfoAppRealData();
    
    // 性能监控完成
    utils.performanceUtils.mark('app-ready');
    const loadTime = utils.performanceUtils.measure('app-start', 'app-ready', 'app-load-time');
    console.log(`🚀 AI信息聚合平台已启动 (加载时间: ${loadTime.toFixed(2)}ms)`);
    
  } catch (error) {
    console.error('应用启动失败:', error);
  }
});

// 导出应用类
window.AIInfoAppRealData = AIInfoAppRealData;