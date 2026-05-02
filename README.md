# vitepress-plugin-word-count

## 安装

```bash
npm i vitepress-plugin-word-count
# pnpm add vitepress-plugin-word-count
# ...
```

## 使用

在vitepress的配置文件`.vitepress/config.ts`处添加：

```ts
import { withWordCountAndReadingTime } from "vitepress-plugin-word-count"
export default defineConfig({
  // 其他配置…
  markdown: {
    config(md) {
      md.render = withWordCountAndReadingTime(md.render);
    }
  }
})
```

随后可以在markdown或自定义组件中使用，比如在markdown中：

```markdown
<script setup lang="ts">
import { useData } from 'vitepress'
const { frontmatter } = useData()
</script>

_My {{frontmatter.wordCount}} Words!_

*Only {{frontmatter.readingTime}} Minutes!*

**Let's See All Details! {{frontmatter.wordCountStats}}**
```

项目还附带了一个自定义组件，可通过[布局插槽](https://vitepress.dev/guide/extending-default-theme#layout-slots)直接插入：

```vue
<!-- MyLayout.vue -->
<script setup lang="ts">
import WordCountComponent from "vitepress-plugin-word-count/WordCount.vue"
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

---

由于本项目写得比较急，多有疏忽还望海涵。欢迎issue和PR！
