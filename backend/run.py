"""
博客后端启动脚本
"""

import os
import sys

# 将项目根目录添加到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from backend.app import app

if __name__ == '__main__':
    app.run(
        debug=app.config['DEBUG'],
        port=app.config['PORT'],
        host=app.config['HOST']
    ) 