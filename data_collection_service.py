#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI信息聚合平台 - 自动化数据收集服务
定期运行数据收集器，确保数据实时更新
"""

import asyncio
import schedule
import time
import logging
import json
from datetime import datetime
from data_collector import DataCollector

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data_collection.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DataCollectionService:
    """数据收集服务"""
    
    def __init__(self):
        self.collector = None
        self.last_successful_run = None
        self.run_count = 0
        self.error_count = 0
        
    async def run_collection(self):
        """执行数据收集"""
        try:
            logger.info("=" * 60)
            logger.info(f"开始数据收集 - 第 {self.run_count + 1} 次运行")
            logger.info(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            async with DataCollector() as collector:
                # 收集数据
                news_items = await collector.collect_all()
                
                # 保存数据
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"ai_news_{timestamp}.json"
                collector.save_to_news_list(news_items, filename)
                
                # 更新统计信息
                self.last_successful_run = datetime.now()
                self.run_count += 1
                
                logger.info(f"✅ 数据收集成功完成!")
                logger.info(f"📊 收集到 {len(news_items)} 条新闻")
                logger.info(f"💾 数据已保存到: {filename}")
                logger.info(f"⏰ 下次运行时间: {self.get_next_run_time()}")
                
                return True
                
        except Exception as e:
            self.error_count += 1
            logger.error(f"❌ 数据收集失败: {str(e)}")
            logger.error(f"错误统计: 总运行 {self.run_count + 1} 次, 成功 {self.run_count} 次, 失败 {self.error_count} 次")
            return False
    
    def get_next_run_time(self):
        """获取下次运行时间"""
        next_run = schedule.next_run()
        return next_run.strftime('%Y-%m-%d %H:%M:%S') if next_run else "未知"
    
    def setup_schedule(self):
        """设置定时任务"""
        # 每30分钟运行一次（生产环境可以调整）
        schedule.every(30).minutes.do(lambda: asyncio.run(self.run_collection()))
        
        # 每天凌晨2点运行一次完整收集
        schedule.every().day.at("02:00").do(lambda: asyncio.run(self.run_collection()))
        
        logger.info("📅 定时任务设置完成:")
        logger.info("  - 每30分钟: 增量更新")
        logger.info("  - 每天02:00: 完整收集")
    
    def get_status(self):
        """获取服务状态"""
        return {
            "status": "running",
            "total_runs": self.run_count,
            "successful_runs": self.run_count - self.error_count,
            "failed_runs": self.error_count,
            "success_rate": f"{((self.run_count - self.error_count) / max(self.run_count, 1) * 100):.1f}%",
            "last_successful_run": self.last_successful_run.isoformat() if self.last_successful_run else None,
            "next_run": self.get_next_run_time(),
            "current_time": datetime.now().isoformat()
        }
    
    def start_service(self):
        """启动服务"""
        logger.info("🚀 AI信息聚合平台数据收集服务启动")
        logger.info("=" * 60)
        
        # 设置定时任务
        self.setup_schedule()
        
        # 立即运行一次
        logger.info("🔄 执行初始数据收集...")
        asyncio.run(self.run_collection())
        
        logger.info("⏰ 服务已进入定时运行模式")
        
        # 主循环
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # 每分钟检查一次
                
        except KeyboardInterrupt:
            logger.info("🛑 收到停止信号，正在关闭服务...")
        except Exception as e:
            logger.error(f"❌ 服务运行异常: {str(e)}")
        finally:
            logger.info("👋 数据收集服务已停止")

def create_web_server():
    """创建简单的Web服务器用于管理"""
    from http.server import HTTPServer, SimpleHTTPRequestHandler
    import urllib.parse
    
    class DataCollectionHandler(SimpleHTTPRequestHandler):
        def do_GET(self):
            if self.path == '/status':
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                status = service.get_status()
                self.wfile.write(json.dumps(status, ensure_ascii=False, indent=2).encode())
                return
            
            elif self.path == '/run':
                # 手动触发数据收集
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                
                # 在后台运行数据收集
                asyncio.create_task(service.run_collection())
                
                html = """
                <!DOCTYPE html>
                <html>
                <head><title>Data Collection Triggered</title></head>
                <body>
                    <h1>数据收集已触发</h1>
                    <p>数据收集任务已在后台运行，请查看日志了解进度。</p>
                    <a href="/">返回首页</a>
                </body>
                </html>
                """
                self.wfile.write(html.encode())
                return
            
            # 默认返回状态页面
            elif self.path == '/':
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                
                status = service.get_status()
                html = f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <title>AI信息聚合平台 - 数据收集服务</title>
                    <meta charset="utf-8">
                    <style>
                        body {{ font-family: Arial, sans-serif; margin: 40px; }}
                        .status {{ background: #f0f0f0; padding: 20px; border-radius: 8px; }}
                        .success {{ color: #28a745; }}
                        .error {{ color: #dc3545; }}
                        .info {{ color: #17a2b8; }}
                        button {{ padding: 10px 20px; margin: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }}
                        button:hover {{ background: #0056b3; }}
                    </style>
                </head>
                <body>
                    <h1>🤖 AI信息聚合平台 - 数据收集服务</h1>
                    
                    <div class="status">
                        <h2>服务状态</h2>
                        <p><strong>运行状态:</strong> <span class="success">✅ 运行中</span></p>
                        <p><strong>总运行次数:</strong> {status['total_runs']}</p>
                        <p><strong>成功次数:</strong> <span class="success">{status['successful_runs']}</span></p>
                        <p><strong>失败次数:</strong> <span class="error">{status['failed_runs']}</span></p>
                        <p><strong>成功率:</strong> <span class="info">{status['success_rate']}</span></p>
                        <p><strong>最后成功运行:</strong> {status['last_successful_run'] or '尚未运行'}</p>
                        <p><strong>下次运行:</strong> {status['next_run']}</p>
                    </div>
                    
                    <h2>控制面板</h2>
                    <button onclick="location.href='/run'">🔄 立即收集数据</button>
                    <button onclick="location.reload()">🔄 刷新状态</button>
                    
                    <h2>API端点</h2>
                    <ul>
                        <li><code>GET /status</code> - 获取服务状态 (JSON)</li>
                        <li><code>GET /run</code> - 手动触发数据收集</li>
                        <li><code>GET /</code> - 管理界面</li>
                    </ul>
                    
                    <p><small>最后更新: {status['current_time']}</small></p>
                </body>
                </html>
                """
                self.wfile.write(html.encode())
                return
            
            else:
                super().do_GET()
    
    return DataCollectionHandler

# 全局服务实例
service = DataCollectionService()

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='AI信息聚合平台数据收集服务')
    parser.add_argument('--mode', choices=['service', 'server', 'once'], default='service',
                       help='运行模式: service(服务模式), server(Web服务器), once(单次运行)')
    parser.add_argument('--port', type=int, default=8082, help='Web服务器端口')
    
    args = parser.parse_args()
    
    if args.mode == 'once':
        # 单次运行模式
        asyncio.run(service.run_collection())
        
    elif args.mode == 'server':
        # Web服务器模式
        handler = create_web_server()
        server = HTTPServer(('localhost', args.port), handler)
        logger.info(f"🌐 Web管理服务器启动在 http://localhost:{args.port}")
        logger.info("📋 访问 http://localhost:{args.port} 查看管理界面")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            logger.info("🛑 Web服务器已停止")
            
    else:
        # 服务模式
        service.start_service()

if __name__ == "__main__":
    main()