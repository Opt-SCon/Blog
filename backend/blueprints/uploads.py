"""
图片上传蓝图
处理图片的上传和访问功能
"""

import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from backend.utils import login_required
import uuid

uploads_bp = Blueprint('uploads', __name__)

def allowed_file(filename, allowed_extensions):
    """检查文件扩展名是否允许"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

@uploads_bp.route('/api/upload/image', methods=['POST'])
@login_required
def upload_image():
    """处理图片上传"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400

        file = request.files['image']
        if not file:
            return jsonify({'error': 'No image file provided'}), 400

        # 检查文件类型
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        if not allowed_file(file.filename, allowed_extensions):
            return jsonify({'error': 'Invalid file type'}), 400

        # 检查文件大小（5MB���制）
        if len(file.read()) > 5 * 1024 * 1024:  # 5MB
            return jsonify({'error': 'File too large'}), 400
        file.seek(0)  # 重置文件指针

        # 生成安全的文件名
        original_filename = secure_filename(file.filename)
        extension = original_filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{extension}"

        # 确保上传目录存在
        upload_folder = os.path.join(current_app.root_path, '..', 'uploads')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        # 保存文件
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)

        return jsonify({
            'filename': filename,
            'url': f'/uploads/{filename}'
        })

    except Exception as e:
        current_app.logger.error('Error uploading image: %s', str(e))
        return jsonify({'error': 'Failed to upload image'}), 500

@uploads_bp.route('/uploads/<path:filename>')
def serve_image(filename):
    """提供图片访问服务"""
    upload_folder = os.path.join(current_app.root_path, '..', 'uploads')
    return send_from_directory(upload_folder, filename) 