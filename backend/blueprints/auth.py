"""
认证蓝图
处理用户登录、注册、登出和密码修改等认证相关功能
"""

from flask import Blueprint, request, jsonify, current_app
from backend.utils import check_password, hash_password, generate_token, login_required
from backend.models import load_data, save_data

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    """处理管理员注册请求"""
    try:
        # 加载数据
        data = load_data()
        
        # 检查是否已有管理员
        if data.get('admin'):
            return jsonify({'error': 'Administrator already exists'}), 400
            
        # 获取注册信息
        req_data = request.get_json()
        username = req_data.get('username')
        password = req_data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Missing username or password'}), 400
            
        # 创建管理员账号
        data['admin'] = {
            'username': username,
            'password': hash_password(password)
        }
        
        # 保存数据
        save_data(data)
        
        # 生成token
        token = generate_token(username)
        current_app.logger.info('Administrator registered successfully: %s', username)
        
        return jsonify({
            'success': True,
            'token': token,
            'username': username
        })
    except Exception as e:
        current_app.logger.error('Registration error: %s', str(e))
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/api/auth/check-admin', methods=['GET'])
def check_admin():
    """检查是否已有管理员账号"""
    try:
        data = load_data()
        has_admin = bool(data.get('admin'))
        return jsonify({
            'hasAdmin': has_admin
        })
    except Exception as e:
        current_app.logger.error('Error checking admin status: %s', str(e))
        return jsonify({'error': 'Failed to check admin status'}), 500

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    """处理管理员登录请求"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Missing username or password'}), 400
            
        # 加载管理员信息
        blog_data = load_data()
        admin = blog_data.get('admin')
        
        if not admin:
            return jsonify({'error': 'No administrator account exists'}), 401
            
        # 验证用户名和密码
        if username != admin['username'] or not check_password(password, admin['password']):
            current_app.logger.warning('Login failed: invalid credentials for user - %s', username)
            return jsonify({'error': 'Invalid username or password'}), 401
            
        # 生成token
        token = generate_token(username)
        current_app.logger.info('User logged in successfully: %s', username)
        return jsonify({
            'success': True,
            'token': token,
            'username': username
        })
    except Exception as e:
        current_app.logger.error('Login error: %s', str(e))
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    # 由于使用JWT，服务器端不需要维护session
    # 客户端会自行删除token
    return '', 204

@auth_bp.route('/api/auth/verify', methods=['GET'])
@login_required
def verify_token():
    """验证token是否有效"""
    return jsonify({'message': 'Token is valid'})

@auth_bp.route('/api/auth/change-password', methods=['POST'])
@login_required
def change_password():
    try:
        data = request.get_json()
        old_password = data.get('oldPassword')
        new_password = data.get('newPassword')
        
        if not old_password or not new_password:
            return jsonify({'error': 'Missing old or new password'}), 400
            
        # 加载管理员信息
        blog_data = load_data()
        admin = blog_data.get('admin')
        
        if not admin:
            return jsonify({'error': 'No administrator account exists'}), 401
            
        # 验证旧密码
        if not check_password(old_password, admin['password']):
            return jsonify({'error': 'Invalid old password'}), 401
            
        # 更新密码
        admin['password'] = hash_password(new_password)
        save_data(blog_data)
        
        current_app.logger.info('Password changed successfully for user: %s', admin['username'])
        return jsonify({'success': True, 'message': 'Password updated successfully'})
    except Exception as e:
        current_app.logger.error('Error changing password: %s', str(e))
        return jsonify({'error': 'Failed to change password'}), 500 