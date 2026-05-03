import { parse } from 'node-html-parser';
import { eastAsianWidth } from 'get-east-asian-width';

/**
 * 统计结果接口
 */
export interface WordCountResult {
    /** 总字数 */
    total: number
    /** 中日韩字符数（汉字、日文假名、韩文谚文） */
    cjk: number
    /** 其他语言单词数 */
    noCjk: number
    /** 全角标点等其他字符数 */
    other: number
    /** 所有字符数 */
    character: number
    /** 解析后的原文 */
    text: string
}

/**
 * 阅读速度配置（单位：字/分钟）
 */
export interface ReadingSpeed {
    /* 中日韩字符阅读速度
    *  @default 330
    */
    cjk?: number
    /* 其他语言阅读速度
    *  @default 200
    */
    noCjk?: number
    /* 其他字符（全角标点）
    *  @default 1000
    */
    other?: number
}

/**
 * 包装渲染函数，在渲染结果中自动注入字数和阅读时间到 env.frontmatter
 * @param render 原始渲染函数，接收 src 和 env，返回 HTML 字符串
 * @param ReadingSpeed 阅读速度配置（单位：字/分钟）
 * @returns 包装后的渲染函数
 */
export function withWordCountAndReadingTime<P extends any[]>(
    render: (src: string, env?: any, ...rest: P) => string,
    ReadingSpeed?: ReadingSpeed
): (src: string, env?: any, ...rest: P) => string {
    return function (this: unknown, src: string, env: any = {}, ...rest: P): string {
        const html = render.call(this, src, env, ...rest)
        const stats = getWordCount(html)
        // 注入到 env.frontmatter
        env.frontmatter ??= {}
        env.frontmatter.wordCount = stats.total
        env.frontmatter.readingTime = getReadingTime(stats, ReadingSpeed)
        env.frontmatter.wordCountStats = stats
        return html
    }
}

/**
 * 通用字数统计：任何语言的字母序列（字母、数字、连字符）作为一个单词，
 * 但 CJK 字符每个单独计数。
 * @param html 原始 HTML 字符串
 * @returns 字数统计结果
 */
export function getWordCount(html: string): WordCountResult {

    // 解析html
    const doc = parse(html)
    // 获取所有文本节点内容，并去除插值语法、HTML特殊字符
    const text = doc.innerText
        .replace(/\{\{.*?\}\}/g, " ")
        .replace(/&(?:[a-zA-Z][a-zA-Z0-9]+|#\d+|#x[0-9a-fA-F]+);/g, " ")

    // 是中日韩字符吗？
    function isCJKChar(char: string): boolean {
        const code = char.charCodeAt(0)
        return (
            (code >= 0x4e00 && code <= 0x9fff) || // 基本汉字
            (code >= 0x3400 && code <= 0x4dbf) || // 扩展A
            (code >= 0xf900 && code <= 0xfaff) || // 兼容汉字
            (code >= 0xac00 && code <= 0xd7af) || // 韩文谚文
            (code >= 0x3040 && code <= 0x309f) || // 平假名
            (code >= 0x30a0 && code <= 0x30ff)    // 片假名
        )
    }

    // 是单词字符吗？
    function isWordChar(char: string): boolean {
        // Unicode 字母（包括西欧、西里尔、阿拉伯等）
        // 为了简单，使用正则测试
        return /[\p{L}\p{N}\-']/u.test(char)
    }
    

    // 按 Unicode 类别分别统计
    let cjk = 0
    let noCjk = 0
    let other = 0
    let character = 0
    let currentWord = ''
    function wordOver() {
        if (currentWord.length > 0) {
            noCjk++
            currentWord = ''
        }
    }
    for (const char of text) {
        // 一个字符算一个字符
        character++
        if (isCJKChar(char)) {
            // 遇到 CJK 字符：先结束之前的单词（如果有）
            wordOver()
            cjk++
        } else if (isWordChar(char)) {
            // 单词字符：加入当前单词缓冲区
            currentWord += char
        } else {
            const isWhitespace = /\s|[\p{C}]/u.test(char)
            const isFullwidthMark = (eastAsianWidth(
                char.codePointAt(0) ?? 0,
                { ambiguousAsWide: true }
            ) >= 2 )
            // 如果是空白字符/特殊字符，结束当前单词
            if (isWhitespace) wordOver()
            // 按照中文习惯，标点符号算一字
            // 如果是全角标点，其他符号+1
            else if (isFullwidthMark) other++
        }
    }
    
    return {
        total: cjk + noCjk + other,
        cjk, noCjk, other, character, text
    }
}

/**
 * 计算阅读时长（分钟）
 * @param stats 字数统计结果
 * @param speed 可选的速度配置
 * @returns 阅读时长（分钟），向上取整到0.5分钟
 */
export function getReadingTime(
    stats: WordCountResult,
    speed?: ReadingSpeed
): number {
    const totalMinutes =
          stats.cjk   / (speed?.cjk   ?? 330)
        + stats.noCjk / (speed?.noCjk ?? 200)
        + stats.other / (speed?.other ?? 1000)
    // 向上取整到最近的 0.5 分钟
    return Math.ceil(totalMinutes * 2) / 2
}