"""
文章蓝图
处理文章的增删改查等功能
"""

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from backend.utils import sanitize_html, format_datetime, generate_id, truncate_text, login_required
from backend.models import load_data, save_data
from backend.validators import validate_article

articles_bp = Blueprint('articles', __name__)

@articles_bp.route('/api/articles', methods=['GET'])
def get_articles():
    """获取所有文章列表，并为每篇文章生成摘要"""
    try:
        data = load_data()
        articles = data['articles']
        
        # 按日期降序排序
        articles.sort(key=lambda x: x['date'], reverse=True)
        
        # 获取所有分类
        categories = data['categories']
        categories_dict = {c['id']: c for c in categories}
        
        # 统计每个分类下的文章数量
        category_counts = {}
        for article in articles:
            category_id = article['categoryId']
            category_counts[category_id] = category_counts.get(category_id, 0) + 1
            
            # 添加分���信息到文章
            if category_id in categories_dict:
                article['category'] = categories_dict[category_id]
            
            # 生成摘要和格式化日期
            article['summary'] = truncate_text(article['content'])
            article['formatted_date'] = format_datetime(article['date'])
        
        # 按文章数量降序排序分类
        sorted_categories = sorted(
            [
                {
                    **cat,
                    'article_count': category_counts.get(cat['id'], 0)
                }
                for cat in categories
            ],
            key=lambda x: x['article_count'],
            reverse=True
        )
        
        return jsonify({
            'articles': articles,
            'categories': sorted_categories
        })
    except Exception as e:
        current_app.logger.error('Error getting articles: %s', str(e))
        return jsonify({'error': 'Failed to get articles'}), 500

@articles_bp.route('/api/articles/<int:article_id>', methods=['GET'])
def get_article(article_id):
    """获取单篇文章详情"""
    try:
        data = load_data()
        article = next((a for a in data['articles'] if a['id'] == article_id), None)
        if article:
            # 增加阅读量
            if request.args.get('increment_views') == 'true':
                article['views'] = article.get('views', 0) + 1
                save_data(data)
            
            # 添加分类信息
            categories = data['categories']
            category = next((c for c in categories if c['id'] == article['categoryId']), None)
            article['category'] = category
            
            # 格式化日期
            article['formatted_date'] = format_datetime(article['date'])
            for comment in article.get('comments', []):
                comment['formatted_date'] = format_datetime(comment['date'])
            
            return jsonify(article)
        return jsonify({'error': 'Article not found'}), 404
    except Exception as e:
        current_app.logger.error('Error getting article: %s', str(e))
        return jsonify({'error': 'Failed to get article'}), 500

@articles_bp.route('/api/articles', methods=['POST'])
@login_required
@validate_article
def create_article():
    """创建新文章"""
    try:
        data = request.get_json()
        blog_data = load_data()

        # 清理HTML内容
        title = sanitize_html(data['title'])
        content = sanitize_html(data['content'])

        # 创建新文章
        article = {
            'id': generate_id(blog_data['articles']),
            'title': title,
            'content': content,
            'categoryId': data['categoryId'],
            'date': datetime.now().isoformat(),
            'views': 0,
            'likes': 0,
            'comments': []
        }

        # 保存文章
        blog_data['articles'].append(article)
        save_data(blog_data)

        return jsonify(article), 201
    except Exception as e:
        current_app.logger.error('Error creating article: %s', str(e))
        return jsonify({'error': 'Failed to create article'}), 500

@articles_bp.route('/api/articles/<int:article_id>', methods=['PUT'])
@login_required
@validate_article
def update_article(article_id):
    """更新文章"""
    try:
        data = request.get_json()
        blog_data = load_data()
        article = next((a for a in blog_data['articles'] if a['id'] == article_id), None)

        if not article:
            return jsonify({'error': 'Article not found'}), 404

        # 更新文章字段
        article['title'] = sanitize_html(data['title'])
        article['content'] = sanitize_html(data['content'])
        article['categoryId'] = data['categoryId']

        save_data(blog_data)
        return jsonify(article)
    except Exception as e:
        current_app.logger.error('Error updating article: %s', str(e))
        return jsonify({'error': 'Failed to update article'}), 500

@articles_bp.route('/api/articles/<int:article_id>', methods=['DELETE'])
@login_required
def delete_article(article_id):
    """删除文章"""
    try:
        blog_data = load_data()
        article = next((a for a in blog_data['articles'] if a['id'] == article_id), None)

        if not article:
            return jsonify({'error': 'Article not found'}), 404

        blog_data['articles'].remove(article)
        save_data(blog_data)

        return '', 204
    except Exception as e:
        current_app.logger.error('Error deleting article: %s', str(e))
        return jsonify({'error': 'Failed to delete article'}), 500

@articles_bp.route('/api/articles/<int:article_id>/like', methods=['POST'])
def like_article(article_id):
    """为文章点赞"""
    try:
        blog_data = load_data()
        article = next((a for a in blog_data['articles'] if a['id'] == article_id), None)

        if not article:
            return jsonify({'error': 'Article not found'}), 404

        article['likes'] = article.get('likes', 0) + 1
        save_data(blog_data)

        return jsonify({'likes': article['likes']})
    except Exception as e:
        current_app.logger.error('Error liking article: %s', str(e))
        return jsonify({'error': 'Failed to like article'}), 500