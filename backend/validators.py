"""
请求数据验证模块
提供文章和评论数据的验证装饰器
确保接收到的数据符合应用的业务规则
"""

from functools import wraps
from flask import request, jsonify

def validate_article(f):
    """
    文章数据验证装饰器
    验证文章创建和更新请求中的数据是否有效
    
    验证规则：
    1. 必须包含 title, content, categoryId 字段
    2. title 必须是非空字符串
    3. content 必须是非空字符串
    4. categoryId 必须是大于0的整数
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        data = request.get_json()
        
        # 验证必需字段是否存在
        required_fields = ['title', 'content', 'categoryId']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                'error': 'Missing required fields',
                'fields': missing_fields
            }), 400
            
        # 验证标题：必须是非空字符串
        if not isinstance(data['title'], str) or len(data['title'].strip()) == 0:
            return jsonify({'error': 'Invalid title'}), 400
            
        # 验证内容：必须是非空字符串
        if not isinstance(data['content'], str) or len(data['content'].strip()) == 0:
            return jsonify({'error': 'Invalid content'}), 400
            
        # 验证分类ID：必须是正整数
        if not isinstance(data['categoryId'], int) or data['categoryId'] < 1:
            return jsonify({'error': 'Invalid category ID'}), 400
            
        return f(*args, **kwargs)
    return decorated_function

def validate_comment(f):
    """
    评论数据验证装饰器
    验证评论创建请求中的数据是否有效
    
    验证规则：
    1. 必须包含 content 字段
    2. content 必须是非空字符串
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        data = request.get_json()
        
        # 验证评论内容：必须存在且为非空字符串
        if 'content' not in data or not isinstance(data['content'], str) or \
           len(data['content'].strip()) == 0:
            return jsonify({'error': 'Invalid comment content'}), 400
            
        return f(*args, **kwargs)
    return decorated_function 