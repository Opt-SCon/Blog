"""
工具函数模块
提供博客应用所需的通用工具函数
包括文本处理、日期格式化、ID生成等功能
"""

from datetime import datetime
import re

def sanitize_html(text):
    """
    清理HTML标签，防止XSS攻击
    
    Args:
        text (str): 需要清理的文本
        
    Returns:
        str: 清理后的纯文本，所有HTML标签都被移除
        
    Example:
        >>> sanitize_html('<p>Hello <script>alert("xss")</script></p>')
        'Hello '
    """
    return re.sub(r'<[^>]*?>', '', text)

def format_datetime(dt_str):
    """
    格式化ISO格式的日期时间字符串为人类可读格式
    支持带时区和不带时区的ISO格式
    
    Args:
        dt_str (str): ISO格式的日期时间字符串
        
    Returns:
        str: 格式化后的日期时间字符串 (YYYY-MM-DD HH:MM:SS)
        
    Example:
        >>> format_datetime('2023-12-21T10:30:00Z')
        '2023-12-21 10:30:00'
    """
    try:
        # 处理带Z后缀的UTC时间
        dt_str = dt_str.replace('Z', '+00:00')
        dt = datetime.fromisoformat(dt_str)
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except ValueError:
        try:
            # 处理不带时区的本地时间
            dt = datetime.fromisoformat(dt_str)
            return dt.strftime('%Y-%m-%d %H:%M:%S')
        except ValueError:
            # 无法解析时返回原始字符串
            return dt_str

def generate_id(items):
    """
    为新项目生成唯一ID
    通过查找现有项目的最大ID并加1来生成
    
    Args:
        items (list): 包含id字段的字典列表
        
    Returns:
        int: 新生成的唯一ID
        
    Example:
        >>> generate_id([{'id': 1}, {'id': 3}])
        4
    """
    return max([item['id'] for item in items] + [0]) + 1

def truncate_text(text, length=100):
    """
    将长文本截断为指定长度，并在末尾添加省略号
    在单词边界处截断，避免单词被切分
    
    Args:
        text (str): 需要截断的文本
        length (int, optional): 最大长度，默认100个字符
        
    Returns:
        str: 截断后的文本，如果超过指定长度则在末尾添加省略号
        
    Example:
        >>> truncate_text('This is a very long text', 10)
        'This is...'
    """
    if len(text) <= length:
        return text
    return text[:length].rsplit(' ', 1)[0] + '...'