import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-123'
    DATA_DIR = os.path.join(basedir, 'data')
    LOG_DIR = os.path.join(basedir, 'logs')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # 跨域设置
    CORS_HEADERS = 'Content-Type'
    
    # 日志配置
    LOG_FORMAT = '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    LOG_FILE = os.path.join(LOG_DIR, 'blog.log')
    LOG_MAX_BYTES = 10240
    LOG_BACKUP_COUNT = 10
    
    # 数据文件
    DATA_FILE = os.path.join(DATA_DIR, 'blog.json')
    
    @staticmethod
    def init_app(app):
        # 创建必要的目录
        os.makedirs(Config.DATA_DIR, exist_ok=True)
        os.makedirs(Config.LOG_DIR, exist_ok=True) 