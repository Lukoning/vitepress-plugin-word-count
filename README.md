# vitepress-plugin-word-count

简单轻量的文字计数VitePress插件。

插件会在解析markdown时统计字数并注入frontmatter，不会在运行时才统计。

- [安装](#安装)
- [使用](#使用)
- [配置](#配置)
- [API](#API)
- [我可以在非vitepress项目安装吗](#我可以在非vitepress项目安装吗)
- [许可证](#许可证)

## 安装

```bash
npm install --save-dev vitepress-plugin-word-count
# pnpm add --save-dev vitepress-plugin-word-count
# ...
```

## 使用

在VitePress的配置文件`.vitepress/config.ts`处添加：

```ts
import { withWordCountAndReadingTime } from "vitepress-plugin-word-count"
export default defineConfig({
  // 其他配置…
  markdown: {
    config(md) {
      md.render = withWordCountAndReadingTime(md.render, {
          // 阅读速度配置，详见「#配置」
      });
    }
  }
})
```

随后可以利用插值语法，在markdown中使用，比如：

```markdown
<script setup lang="ts">
import { useData } from 'vitepress'
const { frontmatter } = useData()
</script>

这是，一个，示例文件！

My {{frontmatter.wordCount}} Words!

Only {{frontmatter.readingTime}} Minutes!

Let's See All Details! {{frontmatter.wordCountStats}}
```

输出：

```text
这是，一个，示例文件！

My 22 Words!

Only 0.5 Minutes!

Let's See All Details! { "total": 22, "cjk": 8, "noCjk": 11, "other": 3, "character": 125, "text": "这是，一个，示例文件！\nMy !InterpolationHere! Words!\nOnly !InterpolationHere! Minutes!\nLet's See All Details! !InterpolationHere! \n" }
```

或者自定义一个vue组件，以显示文字计数

<details>
<summary>示例组件</summary>

假设有以下文件结构：

```
./docs/.vitepress/theme/
├─ components/
│  └─ WordCountComponent.vue
├─ MyLayout.vue
└─ index.ts
```

示例组件代码：

```vue
<!-- components/WordCountComponent.vue -->
<script setup lang="ts">

defineOptions({ name: "WordCountComponent" })

import { useData } from 'vitepress'

const { frontmatter } = useData()

</script>

<template>
  <div class="WordCountContainer">
    <span class="WordCount">
      Word Count: {{ frontmatter.wordCount }}
    </span>
    <span class="ReadingTime">
      Reading Time: {{ frontmatter.readingTime }} minute
    </span>
  </div>
</template>
```

可通过[布局插槽](https://vitepress.dev/guide/extending-default-theme#layout-slots)直接插入示例组件。

比如：

```vue
<!-- MyLayout.vue -->
<script setup lang="ts">
import WordCountComponent from "./components/WordCountComponent.vue"
//…
</script>

<template>
  <DefaultTheme.Layout>
    <template #doc-before>
      <WordCountComponent />
    </template>
  </DefaultTheme.Layout>
</template>
```

然后在主题入口文件配置：

```ts
// index.ts
import MyLayout from './MyLayout.vue'
//…

export default {
  Layout: MyLayout,
  //…
} satisfies Theme
```

</details>

## 配置

```ts
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
```

可在VitePress配置文件自定义默认阅读速度：

```ts
md.render = withWordCountAndReadingTime(md.render, {
  // 阅读速度配置（单位：字/分钟）
  cjk: 330,    // 中日韩字符，默认 330
  noCjk: 200,  // 其他语言单词，默认 200
  other: 1000 // 其他字符（标点之类的），默认 1000
});
```

也可以在frontmatter中为单个文件配置阅读速度，这会覆盖默认速度：

```markdown
---
title: My .md file!
readingSpeed:
  cjk: .Inf
  noCjk: 0.0001
  other: 100000
---

<script setup lang="ts">
import { useData } from 'vitepress'
const { frontmatter } = useData()
</script>

Only {{frontmatter.readingTime}} Minutes!
```

输出：

```text
Only 30000 Minutes!
```

## API

```ts
/**
 * 统计结果接口
 */
interface WordCountResult {
    /** 总字数 */
    total: number;
    /** 中日韩字符数（汉字、日文假名、韩文谚文） */
    cjk: number;
    /** 其他语言单词数 */
    noCjk: number;
    /** 全角标点等其他字符数 */
    other: number;
    /** 所有字符数 */
    character: number;
    /** 解析后的原文 */
    text: string;
}

/**
 * 通用字数统计：任何语言的字母序列（字母、数字、连字符）作为一个单词，
 * 但 CJK 字符每个单独计数。
 * @param html 原始 HTML 字符串
 * @returns 字数统计结果
 */
declare function getWordCount(html: string): WordCountResult;

/**
 * 计算阅读时长（分钟）
 * @param stats 字数统计结果
 * @param speed 可选的速度配置
 * @returns 阅读时长（分钟），向上取整到0.5分钟
 */
declare function getReadingTime(stats: WordCountResult, speed?: ReadingSpeed): number;
```

## 我可以在非VitePress项目安装吗

当然可以！如果你只导入并使用API的话，按理说任何Node.js项目都行。

这个插件非常轻量，甚至不依赖VitePress运行。作者开发插件的目的是在VitePress项目中使用，所以叫VitePress插件，仅此而已。

理论上该插件还可以适用于任何使用markdown-it作为markdown解析器的项目，但不保证一定能用。

## 许可证

MIT

---

由于本项目写得比较急，多有疏忽还望海涵。欢迎issue和PR！
