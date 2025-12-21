// ===============================================
// 组件功能 - AI信息聚合平台
// ===============================================

/**
 * 新闻卡片组件
 */
class NewsCard {
  constructor(newsItem, options = {}) {
    this.data = newsItem;
    this.options = {
      showFullContent: false,
      highlightQuery: '',
      ...options
    };
    this.element = null;
  }
  
  /**
   * 创建新闻卡片元素
   * @returns {HTMLElement} 新闻卡片元素
   */
  create() {
    this.element = utils.domUtils.createElement('div', {
      className: 'news-card fade-in-up',
      dataset: { id: this.data.id }
    });
    
    this.render();
    this.bindEvents();
    
    return this.element;
  }
  
  /**
   * 渲染新闻卡片内容
   */
  render() {
    const importanceLevel = utils.getImportanceLevel(this.data.importance);
    const sentimentInfo = utils.getSentimentInfo(this.data.sentiment);
    
    // 高亮搜索关键词
    const title = this.options.highlightQuery 
      ? utils.highlightSearchText(this.data.title, this.options.highlightQuery)
      : this.data.title;
    
    const summary = this.options.highlightQuery
      ? utils.highlightSearchText(this.data.summary, this.options.highlightQuery)
      : this.data.summary;
    
    this.element.innerHTML = `
      <div class="card-header">
        <div class="source-info">
          <img src="${this.data.sourceIcon}" alt="${this.data.source}" class="source-icon" 
               onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iMiIgZmlsbD0iI0Y1RjlGQiIvPgo8dGV4dCB4PSI4IiB5PSI4LjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0Y4RkFGQyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RzwvdGV4dD4KPC9zdmc+'">
          <span class="source-name">${this.data.source}</span>
          <span class="publish-time">${this.data.publishTime}</span>
        </div>
        <div class="importance-badge ${importanceLevel}">
          <span class="importance-score">${this.data.importance.toFixed(1)}</span>
          ${this.data.isNew ? '<span class="badge new">NEW</span>' : ''}
          ${this.data.isTrending ? '<span class="badge trending">HOT</span>' : ''}
        </div>
      </div>
      
      <h3 class="card-title">${title}</h3>
      
      <p class="card-summary">${summary}</p>
      
      <div class="card-footer">
        ${this.data.keywords.map(keyword => 
          `<span class="keyword-tag" data-keyword="${keyword}">${keyword}</span>`
        ).join('')}
        <div class="sentiment-tag ${this.data.sentiment}">
          <span>${sentimentInfo.icon}</span>
          <span>${sentimentInfo.label}</span>
        </div>
      </div>
    `;
  }
  
  /**
   * 绑定事件
   */
  bindEvents() {
    // 点击卡片跳转到原文
    this.element.addEventListener('click', (e) => {
      if (!e.target.classList.contains('keyword-tag')) {
        window.open(this.data.url, '_blank');
      }
    });
    
    // 点击关键词标签进行筛选
    this.element.addEventListener('click', (e) => {
      if (e.target.classList.contains('keyword-tag')) {
        const keyword = e.target.dataset.keyword;
        this.onKeywordClick && this.onKeywordClick(keyword);
      }
    });
  }
  
  /**
   * 更新卡片数据
   * @param {Object} newData - 新数据
   */
  update(newData) {
    this.data = { ...this.data, ...newData };
    this.render();
  }
  
  /**
   * 设置关键词点击回调
   * @param {Function} callback - 回调函数
   */
  setKeywordClickHandler(callback) {
    this.onKeywordClick = callback;
  }
}

/**
 * 热点列表组件
 */
class HotList {
  constructor(hotNews = []) {
    this.data = hotNews;
    this.element = null;
  }
  
  /**
   * 创建热点列表元素
   * @returns {HTMLElement} 热点列表元素
   */
  create() {
    this.element = utils.domUtils.createElement('div', {
      className: 'hot-list'
    });
    
    this.render();
    this.bindEvents();
    
    return this.element;
  }
  
  /**
   * 渲染热点列表
   */
  render() {
    this.element.innerHTML = this.data.map(item => `
      <div class="hot-item" data-id="${item.id}">
        <div class="hot-rank ${item.rank <= 3 ? 'top-3' : ''}">${item.rank}</div>
        <div class="hot-title">${item.title}</div>
        <div class="hot-trend">
          ${this.getTrendIcon(item.trend)}
          <span>${item.trendValue}</span>
        </div>
      </div>
    `).join('');
  }
  
  /**
   * 获取趋势图标
   * @param {string} trend - 趋势类型
   * @returns {string} SVG图标
   */
  getTrendIcon(trend) {
    const iconMap = {
      up: '<svg class="trend-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',
      down: '<svg class="trend-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>',
      neutral: '<svg class="trend-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>'
    };
    return iconMap[trend] || iconMap.neutral;
  }
  
  /**
   * 绑定事件
   */
  bindEvents() {
    this.element.addEventListener('click', (e) => {
      const hotItem = e.target.closest('.hot-item');
      if (hotItem) {
        const newsId = parseInt(hotItem.dataset.id);
        this.onHotItemClick && this.onHotItemClick(newsId);
      }
    });
  }
  
  /**
   * 更新热点数据
   * @param {Array} newData - 新数据
   */
  update(newData) {
    this.data = newData;
    this.render();
  }
  
  /**
   * 设置热点项点击回调
   * @param {Function} callback - 回调函数
   */
  setHotItemClickHandler(callback) {
    this.onHotItemClick = callback;
  }
}

/**
 * 统计面板组件
 */
class StatsPanel {
  constructor(stats = {}) {
    this.data = stats;
    this.element = null;
    this.animationDuration = 1000;
  }
  
  /**
   * 创建统计面板元素
   * @returns {HTMLElement} 统计面板元素
   */
  create() {
    this.element = utils.domUtils.createElement('div', {
      className: 'stats-section'
    });
    
    this.render();
    
    return this.element;
  }
  
  /**
   * 渲染统计面板
   */
  render() {
    this.element.innerHTML = `
      <h3 class="sidebar-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 3v18h18"/>
          <path d="m19 9-5 5-4-4-3 3"/>
        </svg>
        实时统计
      </h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number" id="totalNews">${this.data.totalNews}</div>
          <div class="stat-label">今日资讯</div>
        </div>
        <div class="stat-item">
          <div class="stat-number" id="highImpact">${this.data.highImpact}</div>
          <div class="stat-label">高影响力</div>
        </div>
        <div class="stat-item">
          <div class="stat-number" id="dataSources">${this.data.dataSources}</div>
          <div class="stat-label">数据源</div>
        </div>
        <div class="stat-item">
          <div class="stat-number" id="updateFreq">${this.data.updateFreq}</div>
          <div class="stat-label">更新频率</div>
        </div>
      </div>
    `;
  }
  
  /**
   * 动画更新数值
   * @param {string} elementId - 元素ID
   * @param {number} targetValue - 目标数值
   * @param {string} suffix - 后缀
   */
  animateValue(elementId, targetValue, suffix = '') {
    const element = this.element.querySelector(`#${elementId}`);
    if (!element) return;
    
    const startValue = 0;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.animationDuration, 1);
      
      // 使用easeOutCubic缓动函数
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (targetValue - startValue) * easeProgress);
      
      element.textContent = currentValue + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  /**
   * 更新统计数据
   * @param {Object} newStats - 新统计数据
   */
  update(newStats) {
    this.data = { ...this.data, ...newStats };
    
    // 动画更新数值
    if (newStats.totalNews !== undefined) {
      this.animateValue('totalNews', newStats.totalNews);
    }
    if (newStats.highImpact !== undefined) {
      this.animateValue('highImpact', newStats.highImpact);
    }
    if (newStats.dataSources !== undefined) {
      this.animateValue('dataSources', newStats.dataSources);
    }
    if (newStats.updateFreq !== undefined) {
      const updateFreqElement = this.element.querySelector('#updateFreq');
      if (updateFreqElement) {
        updateFreqElement.textContent = newStats.updateFreq;
      }
    }
  }
}

/**
 * 加载状态组件
 */
class LoadingState {
  constructor(container) {
    this.container = container;
    this.element = null;
  }
  
  /**
   * 显示加载状态
   */
  show() {
    this.hide();
    
    this.element = utils.domUtils.createElement('div', {
      className: 'loading-state'
    });
    
    this.element.innerHTML = `
      <div class="skeleton-card loading-skeleton"></div>
      <div class="skeleton-card loading-skeleton"></div>
      <div class="skeleton-card loading-skeleton"></div>
    `;
    
    this.container.appendChild(this.element);
  }
  
  /**
   * 隐藏加载状态
   */
  hide() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}

/**
 * 错误状态组件
 */
class ErrorState {
  constructor(container) {
    this.container = container;
    this.element = null;
  }
  
  /**
   * 显示错误状态
   * @param {string} message - 错误消息
   * @param {Function} onRetry - 重试回调
   */
  show(message = '加载失败，请稍后重试', onRetry = null) {
    this.hide();
    
    this.element = utils.domUtils.createElement('div', {
      className: 'error-state'
    });
    
    this.element.innerHTML = `
      <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
      <div class="error-message">${message}</div>
      ${onRetry ? '<button class="retry-button">重试</button>' : ''}
    `;
    
    if (onRetry) {
      const retryButton = this.element.querySelector('.retry-button');
      retryButton.addEventListener('click', onRetry);
    }
    
    this.container.appendChild(this.element);
  }
  
  /**
   * 隐藏错误状态
   */
  hide() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}

/**
 * 空状态组件
 */
class EmptyState {
  constructor(container) {
    this.container = container;
    this.element = null;
  }
  
  /**
   * 显示空状态
   * @param {string} message - 空状态消息
   * @param {string} hint - 提示信息
   */
  show(message = '暂无数据', hint = '请尝试调整筛选条件或搜索关键词') {
    this.hide();
    
    this.element = utils.domUtils.createElement('div', {
      className: 'empty-state'
    });
    
    this.element.innerHTML = `
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <div class="empty-message">${message}</div>
      <div class="empty-hint">${hint}</div>
    `;
    
    this.container.appendChild(this.element);
  }
  
  /**
   * 隐藏空状态
   */
  hide() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}

/**
 * 搜索高亮组件
 */
class SearchHighlighter {
  /**
   * 高亮文本中的搜索关键词
   * @param {string} text - 原始文本
   * @param {string} query - 搜索关键词
   * @returns {string} 高亮后的HTML
   */
  static highlight(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }
  
  /**
   * 转义正则表达式特殊字符
   * @param {string} string - 原始字符串
   * @returns {string} 转义后的字符串
   */
  static escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

/**
 * 分类筛选组件
 */
class CategoryFilter {
  constructor(categories = {}) {
    this.data = categories;
    this.activeCategory = 'all';
    this.onChange = null;
  }
  
  /**
   * 创建筛选按钮组
   * @param {HTMLElement} container - 容器元素
   */
  create(container) {
    const filterContainer = container.querySelector('.filter-container');
    
    Object.entries(this.data).forEach(([key, category]) => {
      const button = utils.domUtils.createElement('button', {
        className: `filter-pill ${key === this.activeCategory ? 'active' : ''}`,
        dataset: { category: key }
      });
      
      button.innerHTML = `
        ${category.name}
        <span class="count">${category.count}</span>
      `;
      
      button.addEventListener('click', () => {
        this.setActive(key);
      });
      
      filterContainer.appendChild(button);
    });
  }
  
  /**
   * 设置活跃分类
   * @param {string} category - 分类键名
   */
  setActive(category) {
    this.activeCategory = category;
    
    // 更新按钮状态
    document.querySelectorAll('.filter-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    // 触发变化回调
    this.onChange && this.onChange(category);
  }
  
  /**
   * 设置变化回调
   * @param {Function} callback - 回调函数
   */
  setChangeHandler(callback) {
    this.onChange = callback;
  }
  
  /**
   * 更新分类数据
   * @param {Object} newData - 新数据
   */
  update(newData) {
    this.data = { ...this.data, ...newData };
    
    // 更新计数
    Object.entries(newData).forEach(([key, category]) => {
      const button = document.querySelector(`[data-category="${key}"] .count`);
      if (button) {
        button.textContent = category.count;
      }
    });
  }
}

// 导出组件类到全局
window.components = {
  NewsCard,
  HotList,
  StatsPanel,
  LoadingState,
  ErrorState,
  EmptyState,
  SearchHighlighter,
  CategoryFilter
};