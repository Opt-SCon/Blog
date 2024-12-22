"""
评论蓝图
处理文章评论的添加和删除功能
"""

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from backend.utils import sanitize_html, format_datetime, generate_id, login_required
from backend.models import load_data, save_data
from backend.validators import validate_comment

comments_bp = Blueprint('comments', __name__)

@comments_bp.route('/api/articles/<int:article_id>/comments', methods=['POST'])
@validate_comment
def add_comment(article_id):
    """为指定文章添加评论"""
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
        current_app.logger.error('Error adding comment: %s', str(e))
        return jsonify({'error': 'Failed to add comment'}), 500

@comments_bp.route('/api/articles/<int:article_id>/comments/<int:comment_id>', methods=['DELETE'])
@login_required
def delete_comment(article_id, comment_id):
    """删除指定文章的评论"""
    try:
        data = load_data()
        article = next((a for a in data['articles'] if a['id'] == article_id), None)
        if not article:
            return jsonify({'error': 'Article not found'}), 404
            
        comment = next((c for c in article['comments'] if c['id'] == comment_id), None)
        if not comment:
            return jsonify({'error': 'Comment not found'}), 404
            
        article['comments'].remove(comment)
        save_data(data)
        
        return '', 204
    except Exception as e:
        current_app.logger.error('Error deleting comment: %s', str(e))
        return jsonify({'error': 'Failed to delete comment'}), 500 