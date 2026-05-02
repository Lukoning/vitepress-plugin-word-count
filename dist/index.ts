import { load } from 'cheerio'

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
    /** 其他字符数 */
    other: number
}

/**
 * 阅读速度配置（单位：字/分钟）
 */
export interface ReadingSpeed {
    cjk: number // 中日韩字符阅读速度，默认 330
    noCjk: number // 其他语言阅读速度，默认 200
    other: number// 其他字符（标点之类的），默认 1000
}

// 默认阅读速度
const DEFAULT_READING_SPEED: ReadingSpeed = {
    cjk: 330,   // 中日韩字符，默认 330
    noCjk: 200, // 其他语言单词，默认 200
    other: 1000, // 其他字符（标点之类的），默认 1000
}


/**
 * 包装渲染函数，在渲染结果中自动注入字数和阅读时间到 env.frontmatter
 * @param render 原始渲染函数，接收 src 和 env，返回 HTML 字符串
 * @returns 包装后的渲染函数
 */
export function withWordCountAndReadingTime<P extends any[]>(
    render: (src: string, env?: any, ...rest: P) => string
): (src: string, env?: any, ...rest: P) => string {
    return function (this: unknown, src: string, env: any = {}, ...rest: P): string {
        const html = render.call(this, src, env, ...rest)
        const stats = getWordCount(html)
        // 注入到 env.frontmatter
        env.frontmatter ??= {}
        env.frontmatter.wordCount = stats.total
        env.frontmatter.readingTime = getReadingTime(stats)
        env.frontmatter.wordCountStats = stats
        return html
    }
}

/**
 * 通用字数统计：任何语言的字母序列（字母、数字、连字符）作为一个单词，
 * 但 CJK 字符每个单独计数。
 */
export function getWordCount(htmlString: string) {
    const $ = load(htmlString)
    // 去掉无关元素
    $('script, style, noscript, meta, link').remove()
    let text = $('body').text()

    // 是中日韩字符吗？
    function isCJKChar(char: string): boolean {
        const code = char.charCodeAt(0)
        return (
            (code >= 0x4e00 && code <= 0x9fff) || // 基本汉字
            (code >= 0x3400 && code <= 0x4dbf) || // 扩展A
            (code >= 0xf900 && code <= 0xfaff) || // 兼容汉字
            (code >= 0xac00 && code <= 0xd7af) || // 韩文谚文
            (code >= 0x3040 && code <= 0x309f) || // 平假名
            (code >= 0x30a0 && code <= 0x30ff)   // 片假名
        )
    }

    // 是单词字符吗？
    function isWordChar(char: string): boolean {
        // Unicode 字母（包括西欧、西里尔、阿拉伯等）
        // 为了简单，使用正则测试（可改用码点范围）
        return /[\p{L}\p{N}\-']/u.test(char)
    }
    

    // 按 Unicode 类别分别统计
    let cjk = 0
    let noCjk = 0
    let other = 0
    let currentWord = ''
    function wordOver() {
        if (currentWord.length > 0) {
            noCjk++
            currentWord = ''
        }
    }
    for (const ch of text) {
        if (isCJKChar(ch)) {
            // 遇到 CJK 字符：先结束之前的单词（如果有）
            wordOver()
            cjk++
        } else if (isWordChar(ch)) {
            // 单词字符：加入当前单词缓冲区
            currentWord += ch
        } else {
            // 非单词字符（空格、标点等）：结束当前单词
            wordOver()
            // 如果并非空格，其他符号+1
            if (/\s/g.test(ch)) other++
        }
    }
    
    return {
        total: cjk + noCjk + other,
        cjk, noCjk, other, text
    }
}

/**
 * 计算阅读时长（分钟）
 * @param stats 字数统计结果
 * @param speed 可选的速度配置（会合并默认值）
 * @returns 阅读时长（分钟），向上取整到0.5分钟
 */
export function getReadingTime(
    stats: WordCountResult,
    speed: Partial<ReadingSpeed> = {}
): number {
    const { cjk: cjkSpeed, noCjk: noCjkSpeed, other: otherSpeed } = { ...DEFAULT_READING_SPEED, ...speed }
    const totalMinutes = stats.cjk / cjkSpeed + stats.noCjk / noCjkSpeed+ stats.other / otherSpeed
    // 向上取整到最近的 0.5 分钟
    return Math.ceil(totalMinutes * 2) / 2
}