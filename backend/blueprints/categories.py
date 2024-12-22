"""
分类蓝图
处理文章分类的增删改查功能
"""

from flask import Blueprint, request, jsonify, current_app
from backend.utils import sanitize_html, generate_id, login_required, truncate_text, format_datetime
from backend.models import load_data, save_data

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('/api/categories', methods=['GET'])
def get_categories():
    """获取所有文章分类，包含每个分类的文章数量"""
    try:
        data = load_data()
        categories = data['categories']
        articles = data['articles']
        
        # 统计每个分类下的文章数量
        category_counts = {}
        for article in articles:
            category_id = article['categoryId']
            category_counts[category_id] = category_counts.get(category_id, 0) + 1
        
        # 添加文章数量到分类信息中
        for category in categories:
            category['article_count'] = category_counts.get(category['id'], 0)
        
        # 按文章数量降序排序
        categories.sort(key=lambda x: x['article_count'], reverse=True)
        
        return jsonify(categories)
    except Exception as e:
        current_app.logger.error('Error getting categories: %s', str(e))
        return jsonify({'error': 'Failed to get categories'}), 500

@categories_bp.route('/api/categories/<int:category_id>', methods=['GET'])
def get_category(category_id):
    """获取单个分类的详细���息，包含该分类下的所有文章"""
    try:
        data = load_data()
        category = next((c for c in data['categories'] if c['id'] == category_id), None)
        
        if not category:
            return jsonify({'error': 'Category not found'}), 404
            
        # 获取该分类下的所有文章
        articles = [a for a in data['articles'] if a['categoryId'] == category_id]
        
        # 按日期降序排序文章
        articles.sort(key=lambda x: x['date'], reverse=True)
        
        # 为文章添加摘要和格式化日期
        for article in articles:
            article['summary'] = truncate_text(article['content'])
            article['formatted_date'] = format_datetime(article['date'])
        
        # 添加文章数量到分类信息中
        category['article_count'] = len(articles)
        category['articles'] = articles
        
        return jsonify(category)
    except Exception as e:
        current_app.logger.error('Error getting category: %s', str(e))
        return jsonify({'error': 'Failed to get category'}), 500

@categories_bp.route('/api/categories', methods=['POST'])
@login_required
def create_category():
    """创建新分类"""
    try:
        data = request.get_json()
        
        if not data or not isinstance(data, dict):
            return jsonify({'error': 'Invalid request data'}), 400
            
        name = data.get('name')
        if not name:
            return jsonify({'error': 'Category name is required'}), 400
            
        # 清理分类名称
        name = sanitize_html(name)
        
        # 检查分类名称是否已存在
        blog_data = load_data()
        categories = blog_data.get('categories', [])
        if any(c['name'] == name for c in categories):
            return jsonify({'error': 'Category already exists'}), 400
            
        # 创建新分类
        category = {
            'id': generate_id(categories),
            'name': name,
            'description': sanitize_html(data.get('description', '')),
            'article_count': 0
        }
        
        categories.append(category)
        blog_data['categories'] = categories
        save_data(blog_data)
        
        return jsonify(category), 201
    except Exception as e:
        current_app.logger.error('Error creating category: %s', str(e))
        return jsonify({'error': 'Failed to create category'}), 500

@categories_bp.route('/api/categories/<int:category_id>', methods=['PUT'])
@login_required
def update_category(category_id):
    """更新分类"""
    try:
        data = request.get_json()
        
        if not data or not isinstance(data, dict):
            return jsonify({'error': 'Invalid request data'}), 400
            
        name = data.get('name')
        if not name:
            return jsonify({'error': 'Category name is required'}), 400
            
        # 清理分类名称
        name = sanitize_html(name)
        
        # 查找并更新分类
        blog_data = load_data()
        categories = blog_data.get('categories', [])
        category = next((c for c in categories if c['id'] == category_id), None)
        
        if not category:
            return jsonify({'error': 'Category not found'}), 404
            
        # 检查名称是否与其他分类重复
        if any(c['name'] == name and c['id'] != category_id for c in categories):
            return jsonify({'error': 'Category name already exists'}), 400
            
        category['name'] = name
        category['description'] = sanitize_html(data.get('description', category.get('description', '')))
        
        # 统计该分类下的文章数量
        category['article_count'] = len([a for a in blog_data['articles'] if a['categoryId'] == category_id])
        
        save_data(blog_data)
        
        return jsonify(category)
    except Exception as e:
        current_app.logger.error('Error updating category: %s', str(e))
        return jsonify({'error': 'Failed to update category'}), 500

@categories_bp.route('/api/categories/<int:category_id>', methods=['DELETE'])
@login_required
def delete_category(category_id):
    """删除分类"""
    try:
        blog_data = load_data()
        categories = blog_data.get('categories', [])
        articles = blog_data.get('articles', [])
        
        # 检查是否有文章使用此分类
        if any(a['categoryId'] == category_id for a in articles):
            return jsonify({
                'error': 'Cannot delete category that has articles'
            }), 400
            
        # 查找并删除分类
        category = next((c for c in categories if c['id'] == category_id), None)
        if not category:
            return jsonify({'error': 'Category not found'}), 404
            
        categories.remove(category)
        save_data(blog_data)
        
        return '', 204
    except Exception as e:
        current_app.logger.error('Error deleting category: %s', str(e))
        return jsonify({'error': 'Failed to delete category'}), 500 