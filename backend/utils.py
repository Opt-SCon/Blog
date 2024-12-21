from datetime import datetime
import re

def sanitize_html(text):
    """移除潜在的危险HTML标签"""
    return re.sub(r'<[^>]*?>', '', text)

def format_datetime(dt_str):
    """格式化日期时间字符串"""
    try:
        # 移除Z后缀并尝试解析
        dt_str = dt_str.replace('Z', '+00:00')
        dt = datetime.fromisoformat(dt_str)
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except ValueError:
        try:
            # 尝试直接解析不带时区的格式
            dt = datetime.fromisoformat(dt_str)
            return dt.strftime('%Y-%m-%d %H:%M:%S')
        except ValueError:
            # 如果都失败了，返回原始字符串
            return dt_str

def generate_id(items):
    """生成新的ID"""
    return max([item['id'] for item in items] + [0]) + 1

def truncate_text(text, length=100):
    """截断文本"""
    if len(text) <= length:
        return text
    return text[:length].rsplit(' ', 1)[0] + '...' 