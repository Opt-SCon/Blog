from functools import wraps
from flask import request, jsonify

def validate_article(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        data = request.get_json()
        
        # 验证必需字段
        required_fields = ['title', 'content', 'categoryId']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                'error': 'Missing required fields',
                'fields': missing_fields
            }), 400
            
        # 验证字段类型和内容
        if not isinstance(data['title'], str) or len(data['title'].strip()) == 0:
            return jsonify({'error': 'Invalid title'}), 400
            
        if not isinstance(data['content'], str) or len(data['content'].strip()) == 0:
            return jsonify({'error': 'Invalid content'}), 400
            
        if not isinstance(data['categoryId'], int) or data['categoryId'] < 1:
            return jsonify({'error': 'Invalid category ID'}), 400
            
        return f(*args, **kwargs)
    return decorated_function

def validate_comment(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        data = request.get_json()
        
        # 验证评论内容
        if 'content' not in data or not isinstance(data['content'], str) or \
           len(data['content'].strip()) == 0:
            return jsonify({'error': 'Invalid comment content'}), 400
            
        return f(*args, **kwargs)
    return decorated_function 