#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI信息聚合平台 - 真实数据收集器
实现对多个权威AI信息源的自动抓取和处理
"""

import asyncio
import aiohttp
import feedparser
import json
import re
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from urllib.parse import urljoin, urlparse
import hashlib
from bs4 import BeautifulSoup
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class NewsItem:
    """新闻条目数据结构"""
    id: str
    title: str
    summary: str
    content: str
    url: str
    source: str
    author: Optional[str] = None
    published_date: Optional[str] = None
    importance_score: float = 0.0
    category: str = "tech"
    keywords: List[str] = None
    sentiment: str = "neutral"
    created_at: str = None
    
    def __post_init__(self):
        if self.keywords is None:
            self.keywords = []
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()

class DataSource:
    """数据源基类"""
    def __init__(self, name: str, url: str, priority: str = "medium"):
        self.name = name
        self.url = url
        self.priority = priority  # high, medium, low
        self.rate_limit = 1  # 请求间隔（秒）
        
    async def fetch(self, session: aiohttp.ClientSession) -> List[NewsItem]:
        raise NotImplementedError

class RSSDataSource(DataSource):
    """RSS数据源"""
    def __init__(self, name: str, url: str, priority: str = "medium", category: str = "tech"):
        super().__init__(name, url, priority)
        self.category = category
        
    async def fetch(self, session: aiohttp.ClientSession) -> List[NewsItem]:
        try:
            logger.info(f"抓取RSS源: {self.name} - {self.url}")
            
            async with session.get(self.url, timeout=10) as response:
                if response.status == 200:
                    content = await response.text()
                    feed = feedparser.parse(content)
                    
                    news_items = []
                    for entry in feed.entries[:10]:  # 限制每源10条
                        if self._should_include(entry):
                            news_item = self._parse_rss_entry(entry)
                            if news_item:
                                news_items.append(news_item)
                    
                    logger.info(f"从 {self.name} 抓取到 {len(news_items)} 条新闻")
                    return news_items
                else:
                    logger.warning(f"RSS源 {self.name} 返回状态码: {response.status}")
                    return []
                    
        except Exception as e:
            logger.error(f"抓取RSS源 {self.name} 失败: {str(e)}")
            return []
    
    def _should_include(self, entry) -> bool:
        """检查是否应该包含该条目"""
        # 过滤条件：标题或摘要中包含AI相关关键词
        ai_keywords = [
            'AI', 'artificial intelligence', 'machine learning', 'ML',
            'deep learning', 'neural network', 'GPT', 'ChatGPT', 'OpenAI',
            '人工智能', '机器学习', '深度学习', '神经网络'
        ]
        
        content = (getattr(entry, 'title', '') + ' ' + 
                  getattr(entry, 'summary', '')).lower()
        
        return any(keyword.lower() in content for keyword in ai_keywords)
    
    def _clean_and_truncate_summary(self, summary: str, max_length: int = 300) -> str:
        """清理HTML标签并截断摘要"""
        # 移除HTML标签
        clean_summary = re.sub(r'<[^>]+>', '', summary)
        # 移除多余空白
        clean_summary = re.sub(r'\s+', ' ', clean_summary).strip()
        # 移除HTML实体
        clean_summary = re.sub(r'&[a-zA-Z0-9#]+;', '', clean_summary)
        
        # 截断到指定长度
        if len(clean_summary) > max_length:
            truncated = clean_summary[:max_length]
            last_period = truncated.rfind('.')
            last_space = truncated.rfind(' ')
            
            if last_period > max_length * 0.6:
                return truncated[:last_period + 1]
            elif last_space > max_length * 0.6:
                return truncated[:last_space] + '...'
            else:
                return truncated + '...'
        
        return clean_summary
    
    def _parse_rss_entry(self, entry) -> Optional[NewsItem]:
        """解析RSS条目"""
        try:
            title = getattr(entry, 'title', '').strip()
            summary = getattr(entry, 'summary', '').strip()
            url = getattr(entry, 'link', '')
            author = getattr(entry, 'author', '')
            published = getattr(entry, 'published', '')
            
            # 清理并截断摘要
            summary = self._clean_and_truncate_summary(summary, max_length=300)
            
            # 生成唯一ID
            content_hash = hashlib.md5(f"{title}{url}".encode()).hexdigest()[:16]
            news_id = f"{self.name}_{content_hash}"
            
            # 提取关键词
            keywords = self._extract_keywords(title + ' ' + summary)
            
            # 计算重要性评分（传入发布时间用于时效性加分）
            importance_score = self._calculate_importance(title, summary, keywords, published)
            
            # 信源权威性加分
            importance_score = self._apply_source_bonus(importance_score)
            
            # 情感分析
            sentiment = self._analyze_sentiment(title + ' ' + summary)
            
            return NewsItem(
                id=news_id,
                title=title,
                summary=summary,
                content=summary,
                url=url,
                source=self.name,
                author=author,
                published_date=published,
                importance_score=importance_score,
                category=self.category,
                keywords=keywords,
                sentiment=sentiment
            )
            
        except Exception as e:
            logger.error(f"解析RSS条目失败: {str(e)}")
            return None
    
    def _apply_source_bonus(self, base_score: float) -> float:
        """
        根据信源权威性调整分数
        
        T1 权威媒体：+0.5
        T2 专业博客：+0.3
        T3 学术源：+0.2
        T4 社区源：+0.0
        """
        source_bonus = {
            # T1: 头部科技媒体
            'TechCrunch AI': 0.5,
            'The Verge AI': 0.5,
            'Wired AI': 0.5,
            'Ars Technica': 0.4,
            'MIT Technology Review': 0.5,
            # T2: 官方博客/专业媒体
            'OpenAI News': 0.6,  # 官方源额外加分
            'DeepMind Blog': 0.5,
            'Google AI Blog': 0.5,
            'Anthropic Blog': 0.5,
            'Hugging Face Blog': 0.4,
            'VentureBeat AI': 0.3,
            'AI News': 0.3,
            # T3: 学术源
            'arXiv AI': 0.3,
            'arXiv ML': 0.3,
            # T4: 社区源
            '机器之心': 0.3,
            'Reddit ML': 0.1,
            'Lobsters AI': 0.1,
        }
        
        bonus = source_bonus.get(self.name, 0.0)
        return min(base_score + bonus, 10.0)
    
    def _extract_keywords(self, text: str) -> List[str]:
        """提取关键词"""
        # 简单的关键词提取逻辑
        ai_terms = [
            'GPT', 'ChatGPT', 'OpenAI', 'DeepMind', 'Anthropic', 'Claude',
            'Google AI', 'Meta AI', 'Microsoft AI', 'NVIDIA', 'Tesla',
            'machine learning', 'deep learning', 'neural network',
            'artificial intelligence', 'AI', 'ML', 'LLM', 'transformer',
            '大语言模型', '生成式AI', '计算机视觉', '自然语言处理'
        ]
        
        found_keywords = []
        text_lower = text.lower()
        
        for term in ai_terms:
            if term.lower() in text_lower:
                found_keywords.append(term)
        
        return found_keywords[:5]  # 限制5个关键词
    
    def _calculate_importance(self, title: str, summary: str, keywords: List[str], published_date: str = None) -> float:
        """
        计算重要性评分 (优化版)
        
        评分维度：
        1. 基础分：4.0
        2. 核心关键词加分：头部公司/产品 +1.5，重要公司 +0.8
        3. 事件类型加分：发布/突破 +1.0
        4. 关键词丰富度：每个关键词 +0.3
        5. 时效性加分：24小时内 +1.0，48小时内 +0.5
        6. 信源权威性：由外部传入（在调用时处理）
        """
        score = 4.0  # 基础分（降低以给其他维度留空间）
        
        text = (title + ' ' + summary).lower()
        title_lower = title.lower()
        
        # ===== 1. 核心关键词加分 =====
        # 头部AI公司/产品（最高权重）
        tier1_keywords = {
            'openai': 1.5, 'chatgpt': 1.5, 'gpt-4': 1.5, 'gpt-5': 2.0,
            'anthropic': 1.3, 'claude': 1.3,
            'gemini': 1.2, 'deepmind': 1.2,
            'sora': 1.5, 'dall-e': 1.2
        }
        
        # 重要AI公司（中等权重）
        tier2_keywords = {
            'google': 0.8, 'meta': 0.8, 'microsoft': 0.8, 'nvidia': 0.8,
            'apple': 0.8, 'amazon': 0.6, 'tesla': 0.6, 'hugging face': 0.7,
            'mistral': 0.8, 'llama': 0.8, 'copilot': 0.7
        }
        
        # 重要事件/概念（中等权重）
        tier3_keywords = {
            '融资': 1.0, 'funding': 1.0, 'valuation': 1.0, '估值': 1.0,
            'agi': 1.2, '通用人工智能': 1.2,
            '法规': 0.8, 'regulation': 0.8, 'safety': 0.7, '安全': 0.7,
            'open source': 0.8, '开源': 0.8
        }
        
        # 计算关键词加分（每类最多计1次最高分，避免重复叠加）
        tier1_score = max([v for k, v in tier1_keywords.items() if k in text], default=0)
        tier2_score = max([v for k, v in tier2_keywords.items() if k in text], default=0)
        tier3_score = max([v for k, v in tier3_keywords.items() if k in text], default=0)
        
        score += tier1_score + tier2_score + tier3_score
        
        # ===== 2. 事件类型加分 =====
        event_words = {
            # 重大发布
            '发布': 1.0, '推出': 1.0, 'release': 1.0, 'launch': 1.0, 'announce': 0.8,
            # 技术突破
            '突破': 1.2, 'breakthrough': 1.2, '首次': 1.0, 'first': 0.8,
            # 重大变动
            '收购': 1.0, 'acquisition': 1.0, '合并': 0.8, 'merger': 0.8
        }
        
        event_score = max([v for k, v in event_words.items() if k in title_lower], default=0)
        score += event_score
        
        # ===== 3. 关键词丰富度加分 =====
        score += min(len(keywords) * 0.2, 1.0)  # 最多加1分
        
        # ===== 4. 时效性加分 =====
        if published_date:
            try:
                from datetime import datetime
                from email.utils import parsedate_to_datetime
                
                # 尝试解析日期
                try:
                    pub_time = parsedate_to_datetime(published_date)
                except:
                    pub_time = datetime.fromisoformat(published_date.replace('Z', '+00:00'))
                
                now = datetime.now(pub_time.tzinfo) if pub_time.tzinfo else datetime.now()
                hours_ago = (now - pub_time).total_seconds() / 3600
                
                if hours_ago < 6:
                    score += 1.5  # 6小时内
                elif hours_ago < 24:
                    score += 1.0  # 24小时内
                elif hours_ago < 48:
                    score += 0.5  # 48小时内
            except Exception:
                pass  # 解析失败则不加分
        
        # ===== 5. 标题质量加分 =====
        # 标题长度适中（15-80字符）
        if 15 <= len(title) <= 80:
            score += 0.2
        
        # 标题包含具体数字（如融资金额、性能提升）
        import re
        if re.search(r'\$[\d.]+[BMK]|\d+%|\d+x', title):
            score += 0.5
        
        return min(max(score, 1.0), 10.0)  # 限制在1-10分
    
    def _analyze_sentiment(self, text: str) -> str:
        """简单的情感分析"""
        positive_words = ['突破', '进展', '成功', '创新', '提升', '突破', 'breakthrough', 'success', 'innovation']
        negative_words = ['问题', '失败', '错误', '批评', '争议', 'problem', 'failure', 'error', 'controversy']
        
        text_lower = text.lower()
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"

class WebDataSource(DataSource):
    """网页数据源"""
    def __init__(self, name: str, url: str, priority: str = "low", category: str = "tech"):
        super().__init__(name, url, priority)
        self.category = category
        
    async def fetch(self, session: aiohttp.ClientSession) -> List[NewsItem]:
        try:
            logger.info(f"抓取网页源: {self.name} - {self.url}")
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            async with session.get(self.url, headers=headers, timeout=15) as response:
                if response.status == 200:
                    content = await response.text()
                    soup = BeautifulSoup(content, 'html.parser')
                    
                    # 这里需要根据具体网站结构调整解析逻辑
                    news_items = self._parse_webpage(soup)
                    
                    logger.info(f"从 {self.name} 抓取到 {len(news_items)} 条新闻")
                    return news_items
                else:
                    logger.warning(f"网页源 {self.name} 返回状态码: {response.status}")
                    return []
                    
        except Exception as e:
            logger.error(f"抓取网页源 {self.name} 失败: {str(e)}")
            return []
    
    def _parse_webpage(self, soup: BeautifulSoup) -> List[NewsItem]:
        """解析网页内容"""
        # 这里需要根据具体网站的结构来实现
        # 示例：解析Hacker News的AI相关内容
        news_items = []
        
        try:
            # 查找包含AI关键词的条目
            items = soup.find_all(['article', 'div'], class_=['item', 'story'])
            
            for item in items[:5]:  # 限制5条
                title_elem = item.find('a', string=re.compile(r'AI|artificial|intelligence|machine', re.I))
                if title_elem:
                    title = title_elem.get_text().strip()
                    url = title_elem.get('href', '')
                    
                    if url and not url.startswith('http'):
                        url = urljoin(self.url, url)
                    
                    # 生成ID
                    content_hash = hashlib.md5(f"{title}{url}".encode()).hexdigest()[:16]
                    news_id = f"{self.name}_{content_hash}"
                    
                    # 提取摘要
                    summary_elem = item.find(['p', 'div'], class_=['excerpt', 'summary'])
                    summary = summary_elem.get_text().strip() if summary_elem else title
                    
                    # 计算重要性
                    importance_score = self._calculate_importance(title, summary)
                    
                    news_items.append(NewsItem(
                        id=news_id,
                        title=title,
                        summary=summary,
                        content=summary,
                        url=url,
                        source=self.name,
                        importance_score=importance_score,
                        category=self.category
                    ))
                    
        except Exception as e:
            logger.error(f"解析网页内容失败: {str(e)}")
        
        return news_items
    
    def _calculate_importance(self, title: str, summary: str) -> float:
        """计算重要性评分"""
        score = 4.0  # 网页源基础分较低
        
        text = (title + ' ' + summary).lower()
        
        # 高权重词汇
        high_weight = ['gpt', 'openai', 'chatgpt', 'breakthrough', '发布', '突破']
        for word in high_weight:
            if word in text:
                score += 1.0
        
        return min(score, 10.0)

class DataCollector:
    """数据收集器主类"""
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.data_sources: List[DataSource] = []
        self.news_cache: Dict[str, NewsItem] = {}
        
        # 初始化数据源
        self._init_data_sources()
    
    def _init_data_sources(self):
        """初始化数据源"""
        # 第一层：头部权威源（高优先级）
        tier1_sources = [
            RSSDataSource("TechCrunch AI", "https://techcrunch.com/category/artificial-intelligence/feed/", "high", "tech"),
            RSSDataSource("The Verge AI", "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", "high", "tech"),
            RSSDataSource("Wired AI", "https://www.wired.com/feed/tag/ai/latest/rss", "high", "tech"),
            RSSDataSource("Ars Technica", "https://feeds.arstechnica.com/arstechnica/technology-lab", "high", "tech"),
            RSSDataSource("Google AI Blog", "https://blog.google/technology/ai/rss/", "high", "tech"),
        ]
        
        # 第二层：专业技术源（中高优先级）
        tier2_sources = [
            RSSDataSource("MIT Technology Review", "https://www.technologyreview.com/feed/", "high", "tech"),
            RSSDataSource("DeepMind Blog", "https://deepmind.google/blog/rss.xml", "high", "tech"),
            RSSDataSource("OpenAI News", "https://openai.com/news/rss.xml", "high", "tech"),
            RSSDataSource("Hugging Face Blog", "https://huggingface.co/blog/feed.xml", "medium", "tech"),
            RSSDataSource("AI News", "https://artificialintelligence-news.com/feed/", "medium", "tech"),
            RSSDataSource("VentureBeat AI", "https://venturebeat.com/category/ai/feed/", "medium", "tech"),
        ]
        
        # 第三层：学术与研究源
        tier3_sources = [
            RSSDataSource("arXiv AI", "https://rss.arxiv.org/rss/cs.AI", "medium", "research"),
            RSSDataSource("arXiv ML", "https://rss.arxiv.org/rss/cs.LG", "medium", "research"),
        ]
        
        # 第四层：社区源（低优先级）
        tier4_sources = [
            RSSDataSource("Reddit ML", "https://www.reddit.com/r/MachineLearning/.rss", "low", "tech"),
            RSSDataSource("Lobsters AI", "https://lobste.rs/t/ai.rss", "low", "tech"),
        ]
        
        # 第五层：中文源
        tier5_sources = [
            RSSDataSource("机器之心", "https://www.jiqizhixin.com/rss", "medium", "tech"),
        ]
        
        self.data_sources = tier1_sources + tier2_sources + tier3_sources + tier4_sources + tier5_sources
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def collect_all(self) -> List[NewsItem]:
        """收集所有数据源的数据"""
        all_news = []
        
        # 按优先级分组
        high_priority = [s for s in self.data_sources if s.priority == "high"]
        medium_priority = [s for s in self.data_sources if s.priority == "medium"]
        low_priority = [s for s in self.data_sources if s.priority == "low"]
        
        # 抓取高优先级数据源
        if high_priority:
            logger.info(f"开始抓取 {len(high_priority)} 个高优先级数据源...")
            high_news = await self._collect_sources(high_priority)
            all_news.extend(high_news)
            await asyncio.sleep(2)  # 短暂休息
        
        # 抓取中优先级数据源
        if medium_priority:
            logger.info(f"开始抓取 {len(medium_priority)} 个中优先级数据源...")
            medium_news = await self._collect_sources(medium_priority)
            all_news.extend(medium_news)
            await asyncio.sleep(2)
        
        # 抓取低优先级数据源
        if low_priority:
            logger.info(f"开始抓取 {len(low_priority)} 个低优先级数据源...")
            low_news = await self._collect_sources(low_priority)
            all_news.extend(low_news)
        
        # 去重和排序
        unique_news = self._deduplicate(all_news)
        sorted_news = self._sort_by_importance(unique_news)
        
        logger.info(f"数据收集完成，共获取 {len(sorted_news)} 条唯一新闻")
        return sorted_news
    
    async def _collect_sources(self, sources: List[DataSource]) -> List[NewsItem]:
        """并发收集指定数据源"""
        tasks = []
        
        for source in sources:
            task = asyncio.create_task(source.fetch(self.session))
            tasks.append(task)
            
            # 请求间隔控制
            await asyncio.sleep(source.rate_limit)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        news_items = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"数据源 {sources[i].name} 抓取失败: {result}")
            elif isinstance(result, list):
                news_items.extend(result)
        
        return news_items
    
    def _deduplicate(self, news_list: List[NewsItem]) -> List[NewsItem]:
        """去除重复新闻（基于URL和标题相似度）"""
        from difflib import SequenceMatcher
        
        seen_urls = set()
        unique_news = []
        
        def is_similar_title(title1: str, title2: str, threshold: float = 0.75) -> bool:
            """检查两个标题是否相似"""
            ratio = SequenceMatcher(None, title1.lower(), title2.lower()).ratio()
            return ratio > threshold
        
        for news in news_list:
            # 基于URL去重
            if news.url and news.url in seen_urls:
                continue
                
            # 基于标题相似度去重
            is_duplicate = False
            for existing in unique_news:
                if is_similar_title(news.title, existing.title):
                    is_duplicate = True
                    # 保留重要性更高的版本
                    if news.importance_score > existing.importance_score:
                        unique_news.remove(existing)
                        is_duplicate = False
                    break
            
            if not is_duplicate:
                if news.url:
                    seen_urls.add(news.url)
                unique_news.append(news)
        
        return unique_news
    
    def _sort_by_importance(self, news_list: List[NewsItem]) -> List[NewsItem]:
        """按重要性排序"""
        return sorted(news_list, key=lambda x: x.importance_score, reverse=True)
    
    def save_to_news_list(self, news_list: List[NewsItem], filename: str = "collected_news.json"):
        """保存到文件"""
        try:
            news_dicts = [asdict(news) for news in news_list]
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(news_dicts, f, ensure_ascii=False, indent=2)
            
            logger.info(f"数据已保存到 {filename}")
            
        except Exception as e:
            logger.error(f"保存数据失败: {str(e)}")

async def main():
    """主函数"""
    logger.info("开始AI信息聚合数据收集...")
    
    async with DataCollector() as collector:
        # 收集数据
        news_items = await collector.collect_all()
        
        # 保存数据
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"ai_news_{timestamp}.json"
        collector.save_to_news_list(news_items, filename)
        
        # 输出统计信息
        logger.info(f"\n数据收集统计:")
        logger.info(f"总新闻数: {len(news_items)}")
        
        # 按类别统计
        categories = {}
        for news in news_items:
            categories[news.category] = categories.get(news.category, 0) + 1
        
        for category, count in categories.items():
            logger.info(f"{category}: {count} 条")
        
        # 按重要性统计
        high_importance = sum(1 for news in news_items if news.importance_score >= 8.0)
        logger.info(f"高重要性新闻 (>=8.0): {high_importance} 条")
        
        # 显示前5条最重要新闻
        logger.info(f"\n前5条最重要新闻:")
        for i, news in enumerate(news_items[:5], 1):
            logger.info(f"{i}. {news.title} (重要性: {news.importance_score:.1f})")
    
    logger.info("数据收集完成!")

if __name__ == "__main__":
    asyncio.run(main())