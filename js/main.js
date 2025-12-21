// ===============================================
// 主应用逻辑 - AI信息聚合平台
// ===============================================

class AIInfoApp {
  constructor() {
    this.currentPage = 1;
    this.pageSize = 10;
    this.currentCategory = 'all';
    this.currentQuery = '';
    this.currentSort = 'time';
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
    this.allNews = [];
    this.filteredNews = [];
    this.displayedNews = [];
    
    // 初始化应用
    this.init();
  }
  
  /**
   * 初始化应用
   */
  init() {
    this.initTheme();
    this.initComponents();
    this.bindEvents();
    this.loadInitialData();
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
    
    // 初始化热点列表
    this.hotList = new components.HotList(window.mockData.hotNews);
    this.hotList.setHotItemClickHandler((newsId) => {
      this.scrollToNews(newsId);
    });
    
    const hotListContainer = document.getElementById('hotList');
    hotListContainer.appendChild(this.hotList.create());
    
    // 初始化统计面板
    this.statsPanel = new components.StatsPanel(window.mockData.stats);
    const statsContainer = document.querySelector('.stats-section');
    if (statsContainer) {
      statsContainer.appendChild(this.statsPanel.create());
    }
    
    // 初始化分类筛选
    this.categoryFilter = new components.CategoryFilter(window.mockData.categories);
    this.categoryFilter.setChangeHandler((category) => {
      this.filterByCategory(category);
    });
    this.categoryFilter.create(document);
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
            e.preventDefault();
            searchInput.focus();
            break;
          case 'f':
            e.preventDefault();
            searchInput.focus();
            break;
        }
      }
    });
    
    // 滚动事件
    window.addEventListener('scroll', utils.throttle(() => {
      this.handleScroll();
    }, 100));
  }
  
  /**
   * 加载初始数据
   */
  loadInitialData() {
    this.showLoading();
    
    // 模拟异步加载
    setTimeout(() => {
      this.allNews = [...window.mockData.news];
      this.applyFilters();
      this.hideLoading();
    }, 1000);
  }
  
  /**
   * 显示加载状态
   */
  showLoading() {
    this.isLoading = true;
    this.loadingState.show();
  }
  
  /**
   * 隐藏加载状态
   */
  hideLoading() {
    this.isLoading = false;
    this.loadingState.hide();
  }
  
  /**
   * 显示错误状态
   */
  showError(message) {
    this.errorState.show(message, () => {
      this.loadInitialData();
    });
  }
  
  /**
   * 处理搜索
   * @param {string} query - 搜索关键词
   */
  handleSearch(query) {
    this.currentQuery = query.trim();
    const clearSearch = document.getElementById('clearSearch');
    
    clearSearch.style.display = this.currentQuery ? 'block' : 'none';
    
    this.currentPage = 1;
    this.applyFilters();
    
    // 更新URL参数
    if (this.currentQuery) {
      utils.urlUtils.setParam('q', this.currentQuery);
    } else {
      utils.urlUtils.removeParam('q');
    }
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
    
    // 更新URL参数
    if (category !== 'all') {
      utils.urlUtils.setParam('category', category);
    } else {
      utils.urlUtils.removeParam('category');
    }
  }
  
  /**
   * 应用筛选条件
   */
  applyFilters() {
    this.showLoading();
    
    // 模拟处理延迟
    setTimeout(() => {
      // 分类筛选
      let filtered = this.allNews;
      if (this.currentCategory !== 'all') {
        filtered = filtered.filter(news => news.category === this.currentCategory);
      }
      
      // 搜索筛选
      if (this.currentQuery) {
        filtered = utils.searchArray(filtered, this.currentQuery);
      }
      
      // 排序
      switch (this.currentSort) {
        case 'importance':
          filtered = utils.sortArray(filtered, 'importance', 'desc');
          break;
        case 'relevance':
          // 简化实现，按相关性排序（实际应用中需要更复杂的算法）
          filtered = utils.sortArray(filtered, 'importance', 'desc');
          break;
        default: // time
          // 按时间排序（简化实现，假设数据已经按时间排序）
          break;
      }
      
      this.filteredNews = filtered;
      this.updateDisplay();
      this.hideLoading();
    }, 200);
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
      loadMoreBtn.textContent = '加载更多资讯';
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
    const message = hasFilters ? '未找到匹配的资讯' : '暂无资讯';
    const hint = hasFilters 
      ? '请尝试调整筛选条件或搜索关键词' 
      : '请稍后再试';
    
    this.emptyState.show(message, hint);
    
    // 隐藏加载更多按钮
    document.querySelector('.load-more-container').style.display = 'none';
  }
  
  /**
   * 滚动到指定新闻
   * @param {number} newsId - 新闻ID
   */
  scrollToNews(newsId) {
    const newsCard = document.querySelector(`[data-id="${newsId}"]`);
    if (newsCard) {
      newsCard.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // 高亮显示
      newsCard.style.outline = '2px solid var(--primary-500)';
      setTimeout(() => {
        newsCard.style.outline = '';
      }, 2000);
    }
  }
  
  /**
   * 处理滚动事件
   */
  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // 滚动到底部自动加载更多
    if (scrollTop + windowHeight >= documentHeight - 1000) {
      const loadMoreContainer = document.querySelector('.load-more-container');
      if (loadMoreContainer.style.display !== 'none') {
        this.loadMore();
      }
    }
  }
  
  /**
   * 启动定期更新
   */
  startPeriodicUpdate() {
    // 每5分钟更新一次统计数据
    setInterval(() => {
      this.updateStats();
    }, 5 * 60 * 1000);
    
    // 每30秒检查一次新资讯
    setInterval(() => {
      this.checkNewNews();
    }, 30 * 1000);
  }
  
  /**
   * 更新统计数据
   */
  updateStats() {
    // 模拟数据更新
    const newStats = {
      totalNews: Math.floor(Math.random() * 20) + 150,
      highImpact: Math.floor(Math.random() * 10) + 20,
      dataSources: 45 + Math.floor(Math.random() * 5),
      updateFreq: '5分钟'
    };
    
    this.statsPanel.update(newStats);
  }
  
  /**
   * 检查新资讯
   */
  checkNewNews() {
    // 模拟检查新资讯
    // 实际应用中这里会调用API检查新数据
    const hasNewNews = Math.random() > 0.8; // 20%概率有新资讯
    
    if (hasNewNews) {
      this.showNewNewsNotification();
    }
  }
  
  /**
   * 显示新资讯通知
   */
  showNewNewsNotification() {
    const notification = utils.domUtils.createElement('div', {
      className: 'new-news-notification',
      style: `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-500);
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
      <span>🆕 有新的AI资讯</span>
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
    const autoHide = setTimeout(() => {
      this.hideNotification(notification);
    }, 5000);
    
    // 点击关闭
    const closeBtn = notification.querySelector('button');
    closeBtn.addEventListener('click', () => {
      clearTimeout(autoHide);
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
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  // 性能监控
  utils.performanceUtils.mark('app-start');
  
  // 全局错误处理
  utils.errorUtils.catchGlobalErrors((error) => {
    console.error('Global error:', error);
    // 可以发送错误报告到服务器
  });
  
  // 创建应用实例
  window.aiApp = new AIInfoApp();
  
  // 性能监控完成
  utils.performanceUtils.mark('app-ready');
  const loadTime = utils.performanceUtils.measure('app-start', 'app-ready', 'app-load-time');
  console.log(`App loaded in ${loadTime.toFixed(2)}ms`);
});

// 页面可见性变化处理
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // 页面变为可见时，可以刷新数据
    console.log('Page became visible, checking for updates...');
  }
});

// 页面卸载前的清理工作
window.addEventListener('beforeunload', () => {
  // 保存用户状态
  if (window.aiApp) {
    utils.localStorage.set('appState', {
      currentCategory: window.aiApp.currentCategory,
      currentQuery: window.aiApp.currentQuery,
      currentSort: window.aiApp.currentSort
    });
  }
});

// 恢复用户状态
window.addEventListener('load', () => {
  const savedState = utils.localStorage.get('appState');
  if (savedState && window.aiApp) {
    // 恢复分类筛选
    if (savedState.currentCategory) {
      window.aiApp.categoryFilter.setActive(savedState.currentCategory);
    }
    
    // 恢复搜索
    if (savedState.currentQuery) {
      const searchInput = document.getElementById('searchInput');
      searchInput.value = savedState.currentQuery;
      window.aiApp.handleSearch(savedState.currentQuery);
    }
    
    // 恢复排序
    if (savedState.currentSort) {
      const sortSelect = document.getElementById('sortSelect');
      sortSelect.value = savedState.currentSort;
      window.aiApp.handleSort(savedState.currentSort);
    }
  }
});

// 导出应用类
window.AIInfoApp = AIInfoApp;