# 个人博客系统

一个基于 Flask 和原生 JavaScript 的个人博客系统。

## 功能特点

- 文章管理
- 评论系统
- 分类管理
- 数据统计
- RESTful API
- JSON 数据存储

## 快速开始

1. 克隆项目：
```bash
git clone https://github.com/Opt-SCon/Blog.git
cd blog-system
```

2. 安装依赖：
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

3. 启动后端：
```bash
cd backend
flask run
```

4. 访问前端：
打开浏览器访问 `http://localhost:5000`

## 项目结构

请参考 project_summary.md 了解详细的项目结构和功能说明。

## 开发说明

- 后端使用 Flask 框架
- 前端使用原生 JavaScript
- 数据存储使用 JSON 文件
- API 遵循 RESTful 设计
