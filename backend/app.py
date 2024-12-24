"""
博客后端API服务
提供文章、评论、分类等功能的RESTful API接口
"""

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os
import logging
from logging.handlers import RotatingFileHandler
from backend.config import Config

# 初始化Flask应用
app = Flask(__name__)

# 加载配置
app.config.from_object(Config)

# 配置日志系统
if not os.path.exists(Config.LOG_DIR):
    os.makedirs(Config.LOG_DIR)

file_handler = RotatingFileHandler(
    Config.LOG_FILE,
    maxBytes=Config.LOG_MAX_BYTES,
    backupCount=Config.LOG_BACKUP_COUNT
)
file_handler.setFormatter(logging.Formatter(Config.LOG_FORMAT))
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)

# 在应用上下文中初始化配置
with app.app_context():
    Config.init_app(app)
    app.logger.info('Blog startup')

# 配置CORS跨域资源共享
CORS(app, resources={r"/api/*": {
    "origins": Config.CORS_ORIGINS,
    "methods": Config.CORS_METHODS,
    "allow_headers": Config.CORS_HEADERS,
    "supports_credentials": Config.CORS_SUPPORTS_CREDENTIALS
}})

# 注册蓝图
from backend.blueprints.auth import auth_bp
from backend.blueprints.articles import articles_bp
from backend.blueprints.comments import comments_bp
from backend.blueprints.categories import categories_bp
from backend.blueprints.uploads import uploads_bp

app.register_blueprint(auth_bp)
app.register_blueprint(articles_bp)
app.register_blueprint(comments_bp)
app.register_blueprint(categories_bp)
app.register_blueprint(uploads_bp)

# 自定义错误类
class BlogError(Exception):
    """博客应用自定义异常类，用于处理业务逻辑错误"""
    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.status_code = status_code

# 错误处理器
@app.errorhandler(BlogError)
def handle_blog_error(error):
    """处理自定义博客错误"""
    response = jsonify({'error': str(error)})
    response.status_code = error.status_code
    return response

@app.errorhandler(404)
def not_found_error(error):
    """处理404未找到错误"""
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """处理500服务器内部错误"""
    app.logger.error('Server Error: %s', str(error))
    return jsonify({'error': 'Internal server error'}), 500

# 静态文件服务
@app.route('/')
def serve_frontend():
    """提供前端首页"""
    response = send_from_directory('../frontend', 'index.html')
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@app.route('/<path:path>')
def serve_static(path):
    """提供前端静态资源"""
    response = send_from_directory('../frontend', path)
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

if __name__ == '__main__':
    app.run(
        debug=Config.DEBUG,
        port=Config.PORT,
        host=Config.HOST
    )