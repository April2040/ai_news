# 🤖 AI信息聚合平台 - 真实数据版本

## 📋 项目概述

这是一个基于真实数据源的AI信息聚合平台，能够自动抓取全球权威AI资讯源的最新信息，并通过智能分类、重要性评分和情感分析，为用户提供高质量的AI资讯聚合服务。

### ✨ 核心特性

- 📡 **真实数据源**: 集成TechCrunch AI、MIT Technology Review、DeepMind等权威源
- 🔄 **实时更新**: 每30分钟自动抓取最新资讯
- 🧠 **智能分析**: AI驱动的内容分类、重要性评分、情感分析
- 📱 **响应式设计**: 完美适配桌面和移动设备
- 🎨 **现代UI**: 基于设计规范的极简风格界面
- 🔍 **高效搜索**: 实时搜索和关键词高亮功能

## 🚀 快速开始

### 方法1: 使用启动脚本 (推荐)

```bash
# 下载项目文件到本地
git clone <your-repo-url>
cd ai-info-aggregator

# 运行启动脚本
chmod +x start_realdata.sh
./start_realdata.sh
```

启动脚本会提供交互式菜单:
- **开发模式**: 启动Web服务器 + 数据收集服务
- **仅Web服务器**: 只提供前端界面
- **仅数据收集**: 只收集数据，不启动Web服务器
- **单次数据收集**: 执行一次数据收集
- **查看服务状态**: 检查服务运行状态

### 方法2: 手动启动

#### 1. 安装依赖
```bash
pip install -r requirements.txt
```

#### 2. 启动数据收集服务
```bash
python3 data_collection_service.py --mode service
```

#### 3. 启动Web服务器 (新终端)
```bash
python3 -m http.server 8081
```

#### 4. 访问应用
打开浏览器访问: http://localhost:8081

## 📁 项目结构

```
ai-info-aggregator/
├── index_realdata.html          # 主页面 (真实数据版)
├── data_collector.py            # 数据收集器
├── data_collection_service.py   # 数据收集服务
├── start_realdata.sh            # 启动脚本
├── requirements.txt             # Python依赖
├── styles/
│   ├── main.css                 # 主要样式
│   ├── components.css           # 组件样式
│   ├── responsive.css           # 响应式样式
│   └── realdata.css            # 真实数据版样式
├── js/
│   ├── main_realdata.js         # 主应用逻辑 (真实数据版)
│   ├── realDataLoader.js        # 真实数据加载器
│   ├── components.js            # UI组件
│   └── utils.js                 # 工具函数
├── data/
│   └── mockData.js              # 备用模拟数据
└── logs/                        # 日志目录
```

## 🔧 配置说明

### 数据源配置

数据收集器支持多种数据源类型:

#### RSS数据源
```python
RSSDataSource("TechCrunch AI", "https://techcrunch.com/category/artificial-intelligence/feed/", "high", "tech")
```

#### 网页数据源
```python
WebDataSource("Hacker News AI", "https://news.ycombinator.com", "medium", "tech")
```

### 更新频率配置

在 `data_collection_service.py` 中可以调整:

```python
# 每30分钟运行一次 (生产环境推荐)
schedule.every(30).minutes.do(lambda: asyncio.run(self.run_collection()))

# 每天凌晨2点运行一次完整收集
schedule.every().day.at("02:00").do(lambda: asyncio.run(self.run_collection()))
```

### 数据源管理

访问数据管理界面: http://localhost:8082

功能包括:
- 查看服务状态
- 手动触发数据收集
- 查看运行统计
- API接口访问

## 📊 数据处理流程

### 1. 数据收集
- **RSS解析**: 自动解析RSS订阅源
- **网页抓取**: 智能提取网页内容
- **API集成**: 支持官方API接口

### 2. 内容分析
- **关键词提取**: AI相关术语识别
- **重要性评分**: 多维度评估算法
- **情感分析**: 自动识别内容倾向
- **智能分类**: 技术突破、产业动态、应用场景、政策法规

### 3. 数据存储
- **JSON格式**: 结构化数据存储
- **去重处理**: 基于URL和标题去重
- **时间排序**: 按发布时间排序

## 🌐 API接口

### 数据收集服务API

#### 获取服务状态
```
GET /status
```

#### 手动触发数据收集
```
GET /run
```

#### 获取统计数据
```bash
curl http://localhost:8082/status
```

### 前端数据接口

#### 获取新闻数据
```javascript
// 通过JavaScript动态加载
const data = await fetch('ai_news_latest.json');
const news = await data.json();
```

## 🔍 功能特性详解

### 智能分类系统

基于关键词和内容分析自动分类:

- **技术突破**: GPT、ChatGPT、OpenAI、机器学习等
- **产业动态**: 融资、估值、投资、公司动态等
- **应用场景**: 产品发布、使用案例、安全等
- **政策法规**: 监管、伦理、法律、标准等

### 重要性评分算法

```python
def _calculate_importance(self, title, summary, keywords):
    score = 5.0  # 基础分
    
    # 高权重词汇加权
    high_weight_words = ['GPT', 'ChatGPT', 'OpenAI', 'AI法案', '融资', '发布', '突破']
    medium_weight_words = ['Meta', 'Google', 'Microsoft', '模型', '训练', '算法']
    
    # 根据关键词数量加分
    score += len(keywords) * 0.3
    
    # 特殊事件加权
    if any(word in title.lower() for word in ['发布', '推出', '突破']):
        score += 1.0
    
    return min(score, 10.0)
```

### 实时更新机制

- **增量更新**: 每30分钟检查新内容
- **完整收集**: 每天凌晨2点执行全量更新
- **状态监控**: 实时监控数据源状态
- **错误处理**: 自动重试和故障恢复

## 🛠️ 部署指南

### 开发环境部署

1. **克隆项目**
```bash
git clone <your-repo-url>
cd ai-info-aggregator
```

2. **安装依赖**
```bash
pip install -r requirements.txt
```

3. **配置环境**
```bash
# 创建环境变量文件 (可选)
echo "DATA_COLLECTION_INTERVAL=30" > .env
echo "MAX_NEWS_PER_SOURCE=20" >> .env
```

4. **启动服务**
```bash
./start_realdata.sh
```

### 生产环境部署

#### 使用Docker (推荐)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8081 8082

CMD ["python3", "data_collection_service.py", "--mode", "service"]
```

```bash
# 构建镜像
docker build -t ai-info-aggregator .

# 运行容器
docker run -d -p 8081:8081 -p 8082:8082 ai-info-aggregator
```

#### 使用systemd服务

创建服务文件 `/etc/systemd/system/ai-info-aggregator.service`:

```ini
[Unit]
Description=AI Information Aggregator
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/ai-info-aggregator
ExecStart=/usr/bin/python3 data_collection_service.py --mode service
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启动服务:
```bash
sudo systemctl enable ai-info-aggregator
sudo systemctl start ai-info-aggregator
```

## 🔧 故障排除

### 常见问题

#### 1. 数据收集失败
```bash
# 检查日志
tail -f data_collection.log

# 手动测试数据收集
python3 data_collector.py

# 检查网络连接
curl -I https://techcrunch.com/category/artificial-intelligence/feed/
```

#### 2. Web服务器无法访问
```bash
# 检查端口占用
netstat -tlnp | grep 8081

# 检查防火墙
sudo ufw status

# 检查服务状态
./start_realdata.sh 5
```

#### 3. 数据源访问被拒绝
- 部分网站可能限制访问频率
- 检查robots.txt文件
- 考虑使用代理或VPN
- 联系网站管理员获取API访问权限

### 性能优化

#### 1. 数据收集优化
```python
# 调整请求间隔
rate_limit = 2  # 增加间隔时间

# 限制并发请求
semaphore = asyncio.Semaphore(3)  # 最多3个并发请求
```

#### 2. 前端性能优化
```javascript
// 启用懒加载
const observer = new IntersectionObserver((entries) => {
  // 滚动加载更多内容
});

// 缓存策略
localStorage.setItem('cachedNews', JSON.stringify(newsData));
```

## 📈 监控和维护

### 日志监控

```bash
# 实时查看日志
tail -f data_collection.log

# 统计错误
grep "ERROR" data_collection.log | wc -l

# 查看服务状态
./start_realdata.sh 5
```

### 数据质量监控

```bash
# 检查数据文件
ls -la ai_news_*.json

# 验证数据格式
python3 -c "import json; data=json.load(open('ai_news_latest.json')); print(f'数据条数: {len(data)}')"

# 检查数据源状态
curl -s http://localhost:8082/status | jq '.'
```

### 定期维护任务

```bash
# 清理旧数据文件 (保留最近30天)
find . -name "ai_news_*.json" -mtime +30 -delete

# 备份重要配置
cp data_collector.py backup/data_collector_$(date +%Y%m%d).py

# 更新依赖包
pip install --upgrade -r requirements.txt
```

## 🤝 贡献指南

### 添加新数据源

1. **在data_collector.py中添加数据源**
```python
# RSS源示例
RSSDataSource("新数据源", "https://example.com/rss", "medium", "tech")

# 网页源示例
WebDataSource("新网页源", "https://example.com", "low", "tech")
```

2. **测试数据源**
```bash
python3 -c "
import asyncio
from data_collector import DataCollector

async def test_source():
    async with DataCollector() as collector:
        sources = [RSSDataSource('测试源', 'https://example.com/rss')]
        results = await collector._collect_sources(sources)
        print(f'获取到 {len(results)} 条数据')

asyncio.run(test_source())
```

### 改进评分算法

在 `_calculate_importance` 方法中添加新的评分因子:

```python
def _calculate_importance(self, title, summary, keywords):
    score = 5.0  # 基础分
    
    # 添加新的评分逻辑
    # 例如: 基于作者权威性、来源可信度等
    
    return min(score, 10.0)
```

## 📞 技术支持

### 获取帮助

1. **查看文档**: 阅读本README和相关文档
2. **检查日志**: 查看 `data_collection.log` 文件
3. **社区讨论**: 在项目Issues中提问
4. **直接联系**: 通过邮件或其他联系方式

### 报告问题

提交Issue时请包含:
- 错误信息或截图
- 复现步骤
- 系统环境信息
- 相关日志内容

## 📄 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 🙏 致谢

感谢以下开源项目和资源:
- Python生态系统
- 各AI资讯源提供的RSS订阅
- 开源社区的贡献

---

**版本**: v2.0 (真实数据版)  
**最后更新**: 2025-12-21  
**作者**: MiniMax Agent