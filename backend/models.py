"""
数据模型模块
处理数据的加载、保存和默认数据初始化
"""

import os
import json
from datetime import datetime
from flask import current_app

def get_default_data():
	"""
	获取默认的数据结构
	包含示例文章和默认分类
	"""
	current_time = datetime.now().isoformat()
	return {
		'admin': None,  # 初始状态下没有管理员信息
		'categories': [
			{
				'id': 1,
				'name': '技术',
				'description': '技术相关文章'
			},
			{
				'id': 2,
				'name': '生活',
				'description': '生活随笔'
			}
		],
		'articles': [
			{
				'id': 1,
				'title': '欢迎使用我的博客',
				'content': '''
# 欢迎使用我的博客系统！

这是一个示例文章，展示了博客系统的基本功能。

## 主要功能

1. 文章管理
2. 分类管理
3. 评论系统
4. 后台管理

## 开始使用

1. 首先进入后台管理页面注册管理员账号
2. 登录后即可开始管理您的博客
3. 可以创建新的文章和分类
4. 可以管理评论和其他设置

祝您使用愉快！
				''',
				'categoryId': 1,
				'date': current_time,
				'views': 0,
				'likes': 0,
				'comments': []
			}
		]
	}

def load_data():
	"""
	加载数据文件
	如果文件不存在，返回默认数据结构
	"""
	try:
		data_file = current_app.config['DATA_FILE']
		if os.path.exists(data_file):
			with open(data_file, 'r', encoding='utf-8') as f:
				return json.load(f)
		else:
			# 如果文件不存在，返回默认数据
			default_data = get_default_data()
			save_data(default_data)  # 保存默认数据
			return default_data
	except Exception as e:
		current_app.logger.error(f'Error loading data: {str(e)}')
		return get_default_data()

def save_data(data):
	"""
	保存数据到文件
	"""
	try:
		data_file = current_app.config['DATA_FILE']
		os.makedirs(os.path.dirname(data_file), exist_ok=True)
		with open(data_file, 'w', encoding='utf-8') as f:
			json.dump(data, f, ensure_ascii=False, indent=4)
	except Exception as e:
		current_app.logger.error(f'Error saving data: {str(e)}')
		raise
