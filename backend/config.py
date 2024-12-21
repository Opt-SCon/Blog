"""
博客应用配置模块
管理所有应用配置项，支持从环境变量加载配置
"""

import os
from dotenv import load_dotenv

# 获取当前文件所在的目录作为基础目录
basedir = os.path.abspath(os.path.dirname(__file__))
# 加载.env文件中的环境变量
load_dotenv(os.path.join(basedir, '.env'))

def get_bool_env(key, default=False):
    """
    从环境变量中获取布尔值
    支持 true, 1, yes, y, on 等多种真值表示方式
    """
    value = os.environ.get(key)
    if value is None:
        return default
    return value.lower() in ('true', '1', 'yes', 'y', 'on')

def get_list_env(key, default=None, separator=','):
    """
    从环境变量中获取列表值
    将字符串按指定分隔符分割成列表，默认使用逗号分隔
    """
    value = os.environ.get(key)
    if value is None:
        return default or []
    return [item.strip() for item in value.split(separator)]

class Config:
    """应用配置类，包含所有配置项"""
    
    # Flask 应用基本配置
    ENV = os.environ.get('FLASK_ENV', 'development')  # 运行环境：development/production
    DEBUG = get_bool_env('FLASK_DEBUG', True)         # 是否开启调试模式
    PORT = int(os.environ.get('FLASK_PORT', 5001))    # 应用运行端口
    HOST = os.environ.get('FLASK_HOST', '0.0.0.0')    # 应用监听地址
    
    # 安全相关配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-123'  # Flask会话密钥
    
    # CORS跨域资源共享配置
    CORS_ORIGINS = get_list_env('CORS_ORIGINS', [     # 允许的跨域来源
        "http://localhost:5001",
        "http://127.0.0.1:5001"
    ])
    CORS_METHODS = get_list_env('CORS_METHODS',       # 允许的HTTP方法
        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    CORS_HEADERS = get_list_env('CORS_HEADERS',       # 允许的HTTP头
        ['Content-Type'])
    CORS_SUPPORTS_CREDENTIALS = get_bool_env(         # 是否支持跨域身份验证
        'CORS_SUPPORTS_CREDENTIALS', True)
    
    # 数据存储相关配置
    DATA_DIR = os.path.join(basedir, 'data')         # 数据存储目录
    LOG_DIR = os.path.join(basedir, 'logs')          # 日志存储目录
    MAX_CONTENT_LENGTH = int(os.environ.get(          # 最大请求内容大小
        'MAX_CONTENT_LENGTH', 16 * 1024 * 1024))     # 默认16MB
    
    # 日志配置
    LOG_FORMAT = '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'  # 日志格式
    LOG_FILE = os.path.join(LOG_DIR, 'blog.log')     # 日志文件路径
    LOG_MAX_BYTES = 10240                            # 单个日志文件最大字节数
    LOG_BACKUP_COUNT = 10                            # 保留的日志文件数量
    
    # 数据文件配置
    DATA_FILE = os.path.join(DATA_DIR, 'blog.json')  # 博客数据JSON文件路径
    
    @staticmethod
    def init_app(app):
        """
        初始化应用配置
        创建必要的数据和日志目录
        """
        os.makedirs(Config.DATA_DIR, exist_ok=True)
        os.makedirs(Config.LOG_DIR, exist_ok=True)