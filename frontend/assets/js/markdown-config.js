/**
 * markdown-it 配置文件
 * 提供统一的 markdown 解析器配置
 */

// 创建 markdown-it 实例
const md = markdownit({
    html: true,        // 启用 HTML 标签
    breaks: true,      // 转换换行符为 <br>
    linkify: true,     // 自动转换 URL 为链接
    typographer: true  // 启用一些语言中立的替换 + 引号美化
});

// 添加目录插件
if (window.markdownitTocDoneRight) {
    md.use(window.markdownitTocDoneRight, {
        containerClass: 'toc',
        containerId: 'toc',
        listType: 'ul',
        listClass: 'toc-list',
        itemClass: 'toc-item',
        linkClass: 'toc-link',
    });
}

// 添加数学公式插件
if (window.texmath) {
    md.use(window.texmath, {
        engine: katex,
        delimiters: 'dollars',
        katexOptions: { macros: { "\\RR": "\\mathbb{R}" } }
    });
}

// 添加代码高亮插件
if (window.markdownitHighlightjs) {
    md.use(window.markdownitHighlightjs);
}

/**
 * 解析完整文章内容（包含目录）
 * @param {string} content - markdown 格式的文章内容
 * @returns {string} 解析后的 HTML
 */
export function parseArticle(content) {
    if (!content) return '';

    // 渲染内容
    const html = md.render(content);

    return html;
}

/**
 * 解析不需要目录的内容（评论和摘要）
 * @param {string} content - markdown 格式的内容
 * @returns {string} 解析后的 HTML
 */
export function parseContent(content) {
    if (!content) return '';
    return md.render(content);
}

/**
 * 解析文章摘要
 * @param {string} content - markdown 格式的文章内容
 * @param {number} length - 摘要长度限制
 * @returns {string} 解析后的 HTML
 */
export function parseSummary(content, length = 200) {
    if (!content) return '';

    // 获取第一段落或限定长度的内容
    let summary = content.split('\n\n')[0];
    if (summary.length > length) {
        summary = summary.substring(0, length) + '...';
    }

    return parseContent(summary);
} 