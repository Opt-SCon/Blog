"""
博客后端API服务
提供文章、评论、分类等功能的RESTful API接口
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
import logging
from datetime import datetime
from logging.handlers import RotatingFileHandler
from config import Config
from validators import validate_article, validate_comment
from utils import sanitize_html, format_datetime, generate_id, truncate_text

# 初始化Flask应用
app = Flask(__name__)
app.config.from_object(Config)

# 配置CORS跨域资源共享
CORS(app, resources={r"/api/*": {
    "origins": Config.CORS_ORIGINS,
    "methods": Config.CORS_METHODS,
    "allow_headers": Config.CORS_HEADERS,
    "supports_credentials": Config.CORS_SUPPORTS_CREDENTIALS
}})

Config.init_app(app)

# 配置日志系统
file_handler = RotatingFileHandler(
    app.config['LOG_FILE'],
    maxBytes=app.config['LOG_MAX_BYTES'],
    backupCount=app.config['LOG_BACKUP_COUNT']
)
file_handler.setFormatter(logging.Formatter(app.config['LOG_FORMAT']))
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)
app.logger.info('Blog startup')

DATA_FILE = app.config['DATA_FILE']

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

# 数据操作函数
def load_data():
    """
    加载博客数据
    从JSON文件中读取文章和分类数据，如果文件不存在则创建默认数据结构
    """
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {
            'articles': [],
            'categories': [
                {"id": 1, "name": "技术", "description": "技术相关文章"},
                {"id": 2, "name": "生活", "description": "生活随笔"},
                {"id": 3, "name": "其他", "description": "其他分类"}
            ]
        }
    except Exception as e:
        app.logger.error('Error loading data: %s', str(e))
        raise BlogError('Failed to load data', 500)

def save_data(data):
    """
    保存博客数据到JSON文件
    确保目录存在并将数据以UTF-8编码保存
    """
    try:
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        app.logger.error('Error saving data: %s', str(e))
        raise BlogError('Failed to save data', 500)

# 文章相关API路由
@app.route('/api/articles', methods=['GET'])
def get_articles():
    """获取所有文章列表，并为每篇文章生成摘要"""
    try:
        data = load_data()
        articles = data['articles']
        for article in articles:
            article['summary'] = truncate_text(article['content'])
            article['formatted_date'] = format_datetime(article['date'])
        return jsonify(articles)
    except Exception as e:
        app.logger.error('Error getting articles: %s', str(e))
        raise BlogError('Failed to get articles', 500)

@app.route('/api/articles/<int:article_id>', methods=['GET'])
def get_article(article_id):
    """
    获取单篇文章详情
    支持通过查询参数increment_views=true增加文章阅读量
    """
    try:
        data = load_data()
        article = next((a for a in data['articles'] if a['id'] == article_id), None)
        if article:
            if request.args.get('increment_views') == 'true':
                article['views'] = article.get('views', 0) + 1
                save_data(data)
            article['formatted_date'] = format_datetime(article['date'])
            for comment in article.get('comments', []):
                comment['formatted_date'] = format_datetime(comment['date'])
            return jsonify(article)
        return jsonify({'error': 'Article not found'}), 404
    except Exception as e:
        app.logger.error('Error getting article: %s', str(e))
        raise BlogError('Failed to get article', 500)

@app.route('/api/articles', methods=['POST'])
@validate_article
def create_article():
    """
    创建新文章
    自动生成文章ID、创建时间，初始化阅读量和点赞数
    对文章内容进行HTML清理以防止XSS攻击
    """
    try:
        data = load_data()
        article = request.json
        article['id'] = generate_id(data['articles'])
        article['date'] = datetime.now().isoformat()
        article['likes'] = 0
        article['views'] = 0
        article['comments'] = []
        article['content'] = sanitize_html(article['content'])
        article['title'] = sanitize_html(article['title'])
        data['articles'].insert(0, article)
        save_data(data)
        return jsonify(article), 201
    except Exception as e:
        app.logger.error('Error creating article: %s', str(e))
        raise BlogError('Failed to create article', 500)

@app.route('/api/articles/<int:article_id>', methods=['PUT'])
@validate_article
def update_article(article_id):
    """
    更新现有文章
    验证文章存在性，清理HTML内容，保存更新
    """
    try:
        data = load_data()
        article = next((a for a in data['articles'] if a['id'] == article_id), None)
        if not article:
            return jsonify({'error': 'Article not found'}), 404
        
        updates = request.json
        updates['content'] = sanitize_html(updates['content'])
        updates['title'] = sanitize_html(updates['title'])
        article.update(updates)
        save_data(data)
        return jsonify(article)
    except Exception as e:
        app.logger.error('Error updating article: %s', str(e))
        raise BlogError('Failed to update article', 500)

@app.route('/api/articles/<int:article_id>', methods=['DELETE'])
def delete_article(article_id):
    """
    删除指定文章
    包括文章的所有相关数据（评论等）
    """
    try:
        data = load_data()
        articles = data['articles']
        article = next((a for a in articles if a['id'] == article_id), None)
        if article:
            articles.remove(article)
            save_data(data)
            return '', 204
        return jsonify({'error': 'Article not found'}), 404
    except Exception as e:
        app.logger.error('Error deleting article: %s', str(e))
        raise BlogError('Failed to delete article', 500)

# 评论相关路由
@app.route('/api/articles/<int:article_id>/comments', methods=['POST'])
@validate_comment
def add_comment(article_id):
    """
    为指定文章添加评论
    生成评论ID和时间戳，清理评论内容防止XSS
    """
    try:
        data = load_data()
        article = next((a for a in data['articles'] if a['id'] == article_id), None)
        if not article:
            return jsonify({'error': 'Article not found'}), 404

        comment = request.json
        if 'comments' not in article:
            article['comments'] = []
        
        comment['id'] = generate_id(article['comments'])
        comment['date'] = datetime.now().isoformat()
        comment['content'] = sanitize_html(comment['content'])
        
        article['comments'].append(comment)
        save_data(data)
        comment['formatted_date'] = format_datetime(comment['date'])
        return jsonify(comment), 201
    except Exception as e:
        app.logger.error('Error adding comment: %s', str(e))
        raise BlogError('Failed to add comment', 500)

@app.route('/api/articles/<int:article_id>/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(article_id, comment_id):
    """
    删除指定文章的特定评论
    验证文章和评论的存在性
    """
    try:
        data = load_data()
        article = next((a for a in data['articles'] if a['id'] == article_id), None)
        if not article or 'comments' not in article:
            return jsonify({'error': 'Article not found'}), 404

        comment = next((c for c in article['comments'] if c['id'] == comment_id), None)
        if comment:
            article['comments'].remove(comment)
            save_data(data)
            return '', 204
        return jsonify({'error': 'Comment not found'}), 404
    except Exception as e:
        app.logger.error('Error deleting comment: %s', str(e))
        raise BlogError('Failed to delete comment', 500)

# 点赞功能
@app.route('/api/articles/<int:article_id>/like', methods=['POST'])
def like_article(article_id):
    """
    为指定文章增加点赞数
    如果文章不存在则返回404错误
    """
    try:
        data = load_data()
        article = next((a for a in data['articles'] if a['id'] == article_id), None)
        if not article:
            return jsonify({'error': 'Article not found'}), 404

        article['likes'] = article.get('likes', 0) + 1
        save_data(data)
        return jsonify({'likes': article['likes']})
    except Exception as e:
        app.logger.error('Error liking article: %s', str(e))
        raise BlogError('Failed to like article', 500)

# 分类相关路由
@app.route('/api/categories', methods=['GET'])
def get_categories():
    """获取所有文章分类"""
    try:
        data = load_data()
        return jsonify(data['categories'])
    except Exception as e:
        app.logger.error('Error getting categories: %s', str(e))
        raise BlogError('Failed to get categories', 500)

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