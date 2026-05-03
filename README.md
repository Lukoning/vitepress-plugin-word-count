# vitepress-plugin-word-count

简单的文字计数VitePress插件，在解析markdown时统计字数并注入frontmatter

## 安装

```bash
npm i vitepress-plugin-word-count
# pnpm add vitepress-plugin-word-count
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
          // 阅读速度配置
          cjk: 330,   // 中日韩字符，默认 330
          noCjk: 200, // 其他语言单词，默认 200
          other: 1000, // 其他字符（标点之类的），默认 1000
      });
    }
  }
})
```

随后可以在markdown中使用，比如：

```markdown
<script setup lang="ts">
import { useData } from 'vitepress'
const { frontmatter } = useData()
</script>

_My {{frontmatter.wordCount}} Words!_

*Only {{frontmatter.readingTime}} Minutes!*

**Let's See All Details! {{frontmatter.wordCountStats}}**
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
      Word Count: {{ frontmatter.wordCount || 'null' }}
    </span>
    <span class="ReadingTime">
      Reading Time: {{ frontmatter.readingTime || 'null' }} minute
    </span>
  </div>
</template>
```

可通过[布局插槽](https://vitepress.dev/guide/extending-default-theme#layout-slots)直接插入示例组件：

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

## 许可证

MIT

---

由于本项目写得比较急，多有疏忽还望海涵。欢迎issue和PR！
