// ===============================================
// 工具函数 - AI信息聚合平台
// ===============================================

/**
 * 格式化时间显示
 * @param {string} timeString - 时间字符串
 * @returns {string} 格式化后的时间
 */
function formatTime(timeString) {
  return timeString;
}

/**
 * 计算重要性等级
 * @param {number} score - 重要性评分
 * @returns {string} 重要性等级
 */
function getImportanceLevel(score) {
  if (score >= 8.5) return 'high';
  if (score >= 7.0) return 'medium';
  return 'low';
}

/**
 * 获取情感分析显示信息
 * @param {string} sentiment - 情感类型
 * @returns {object} 情感信息对象
 */
function getSentimentInfo(sentiment) {
  return window.mockData.sentiment[sentiment] || window.mockData.sentiment.neutral;
}

/**
 * 截取文本并添加省略号
 * @param {string} text - 原始文本
 * @param {number} maxLength - 最大长度
 * @returns {string} 截取后的文本
 */
function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * 高亮搜索关键词
 * @param {string} text - 原始文本
 * @param {string} query - 搜索关键词
 * @returns {string} 高亮后的HTML字符串
 */
function highlightSearchText(text, query) {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<span class="search-highlight">$1</span>');
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} delay - 节流时间（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(func, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}

/**
 * 生成随机ID
 * @returns {string} 随机ID
 */
function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * 深拷贝对象
 * @param {any} obj - 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * 数组去重
 * @param {Array} array - 要去重的数组
 * @param {string} key - 去重的键名（可选）
 * @returns {Array} 去重后的数组
 */
function uniqueArray(array, key) {
  if (!key) return [...new Set(array)];
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * 数组排序
 * @param {Array} array - 要排序的数组
 * @param {string} key - 排序的键名
 * @param {string} order - 排序顺序 ('asc' 或 'desc')
 * @returns {Array} 排序后的数组
 */
function sortArray(array, key, order = 'desc') {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
}

/**
 * 过滤数组
 * @param {Array} array - 要过滤的数组
 * @param {Object} filters - 过滤条件
 * @returns {Array} 过滤后的数组
 */
function filterArray(array, filters) {
  return array.filter(item => {
    for (const [key, value] of Object.entries(filters)) {
      if (value && item[key] !== value) {
        return false;
      }
    }
    return true;
  });
}

/**
 * 搜索数组
 * @param {Array} array - 要搜索的数组
 * @param {string} query - 搜索关键词
 * @param {Array} searchFields - 搜索字段列表
 * @returns {Array} 搜索结果
 */
function searchArray(array, query, searchFields = ['title', 'summary', 'keywords']) {
  if (!query) return array;
  
  const lowerQuery = query.toLowerCase();
  return array.filter(item => {
    return searchFields.some(field => {
      const value = item[field];
      if (Array.isArray(value)) {
        return value.some(v => v.toLowerCase().includes(lowerQuery));
      }
      return value && value.toLowerCase().includes(lowerQuery);
    });
  });
}

/**
 * 分页数组
 * @param {Array} array - 要分页的数组
 * @param {number} page - 当前页码（从1开始）
 * @param {number} pageSize - 每页大小
 * @returns {Object} 分页结果
 */
function paginateArray(array, page = 1, pageSize = 10) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    data: array.slice(startIndex, endIndex),
    total: array.length,
    page,
    pageSize,
    totalPages: Math.ceil(array.length / pageSize),
    hasNext: endIndex < array.length,
    hasPrev: page > 1
  };
}

/**
 * 本地存储工具
 */
const localStorage = {
  /**
   * 设置存储项
   * @param {string} key - 键名
   * @param {any} value - 值
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('LocalStorage set failed:', error);
    }
  },
  
  /**
   * 获取存储项
   * @param {string} key - 键名
   * @param {any} defaultValue - 默认值
   * @returns {any} 存储的值
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('LocalStorage get failed:', error);
      return defaultValue;
    }
  },
  
  /**
   * 删除存储项
   * @param {string} key - 键名
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('LocalStorage remove failed:', error);
    }
  },
  
  /**
   * 清空所有存储项
   */
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('LocalStorage clear failed:', error);
    }
  }
};

/**
 * URL工具函数
 */
const urlUtils = {
  /**
   * 获取URL参数
   * @param {string} param - 参数名
   * @returns {string} 参数值
   */
  getParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },
  
  /**
   * 设置URL参数
   * @param {string} param - 参数名
   * @param {string} value - 参数值
   */
  setParam(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.pushState({}, '', url);
  },
  
  /**
   * 删除URL参数
   * @param {string} param - 参数名
   */
  removeParam(param) {
    const url = new URL(window.location);
    url.searchParams.delete(param);
    window.history.pushState({}, '', url);
  }
};

/**
 * DOM工具函数
 */
const domUtils = {
  /**
   * 创建元素
   * @param {string} tag - 标签名
   * @param {Object} attributes - 属性对象
   * @param {string} content - 内容
   * @returns {HTMLElement} 创建的元素
   */
  createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element.setAttribute(key, value);
      }
    });
    
    if (content) {
      element.innerHTML = content;
    }
    
    return element;
  },
  
  /**
   * 添加事件监听器
   * @param {HTMLElement|string} element - 元素或选择器
   * @param {string} event - 事件名
   * @param {Function} handler - 事件处理器
   * @param {Object} options - 选项
   */
  on(element, event, handler, options = {}) {
    const target = typeof element === 'string' ? document.querySelector(element) : element;
    if (target) {
      target.addEventListener(event, handler, options);
    }
  },
  
  /**
   * 移除事件监听器
   * @param {HTMLElement|string} element - 元素或选择器
   * @param {string} event - 事件名
   * @param {Function} handler - 事件处理器
   */
  off(element, event, handler) {
    const target = typeof element === 'string' ? document.querySelector(element) : element;
    if (target) {
      target.removeEventListener(event, handler);
    }
  }
};

/**
 * 动画工具函数
 */
const animationUtils = {
  /**
   * 淡入动画
   * @param {HTMLElement} element - 目标元素
   * @param {number} duration - 持续时间（毫秒）
   */
  fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    const start = performance.now();
    
    function animate(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      element.style.opacity = progress.toString();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    requestAnimationFrame(animate);
  },
  
  /**
   * 淡出动画
   * @param {HTMLElement} element - 目标元素
   * @param {number} duration - 持续时间（毫秒）
   */
  fadeOut(element, duration = 300) {
    const startOpacity = parseFloat(getComputedStyle(element).opacity);
    
    const start = performance.now();
    
    function animate(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      element.style.opacity = (startOpacity * (1 - progress)).toString();
      
      if (progress >= 1) {
        element.style.display = 'none';
      } else {
        requestAnimationFrame(animate);
      }
    }
    
    requestAnimationFrame(animate);
  },
  
  /**
   * 滑动动画
   * @param {HTMLElement} element - 目标元素
   * @param {string} direction - 滑动方向 ('up', 'down', 'left', 'right')
   * @param {number} distance - 滑动距离
   * @param {number} duration - 持续时间（毫秒）
   */
  slide(element, direction = 'up', distance = 100, duration = 300) {
    const transformMap = {
      up: `translateY(${distance}px)`,
      down: `translateY(-${distance}px)`,
      left: `translateX(${distance}px)`,
      right: `translateX(-${distance}px)`
    };
    
    element.style.transform = transformMap[direction];
    element.style.transition = `transform ${duration}ms ease`;
    
    requestAnimationFrame(() => {
      element.style.transform = 'translate(0, 0)';
    });
  }
};

/**
 * 性能监控工具
 */
const performanceUtils = {
  /**
   * 标记性能点
   * @param {string} name - 标记名称
   */
  mark(name) {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name);
    }
  },
  
  /**
   * 测量性能
   * @param {string} startMark - 开始标记
   * @param {string} endMark - 结束标记
   * @param {string} measureName - 测量名称
   * @returns {number} 持续时间（毫秒）
   */
  measure(startMark, endMark, measureName) {
    if ('performance' in window && 'measure' in performance) {
      performance.measure(measureName, startMark, endMark);
      const measure = performance.getEntriesByName(measureName)[0];
      return measure.duration;
    }
    return 0;
  },
  
  /**
   * 获取导航时机
   * @returns {object} 导航时机数据
   */
  getNavigationTiming() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        request: navigation.responseStart - navigation.requestStart,
        response: navigation.responseEnd - navigation.responseStart,
        dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        load: navigation.loadEventEnd - navigation.loadEventStart
      };
    }
    return {};
  }
};

/**
 * 错误处理工具
 */
const errorUtils = {
  /**
   * 捕获全局错误
   * @param {Function} handler - 错误处理器
   */
  catchGlobalErrors(handler) {
    window.addEventListener('error', (event) => {
      handler({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      handler({
        type: 'promise',
        reason: event.reason
      });
    });
  },
  
  /**
   * 创建错误边界
   * @param {Function} errorHandler - 错误处理器
   * @returns {Function} 包装函数
  */
  createErrorBoundary(errorHandler) {
    return (fn) => {
      return (...args) => {
        try {
          return fn.apply(this, args);
        } catch (error) {
          errorHandler(error);
          throw error;
        }
      };
    };
  }
};

// 导出工具函数到全局
window.utils = {
  formatTime,
  getImportanceLevel,
  getSentimentInfo,
  truncateText,
  highlightSearchText,
  debounce,
  throttle,
  generateId,
  deepClone,
  uniqueArray,
  sortArray,
  filterArray,
  searchArray,
  paginateArray,
  localStorage,
  urlUtils,
  domUtils,
  animationUtils,
  performanceUtils,
  errorUtils
};