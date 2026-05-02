<script setup lang="ts">
defineOptions({ name: "WordCountComponent" })
import { useData } from 'vitepress'
const { frontmatter } = useData()
</script>

<template>
  <div class="WordCountContainer">
    <span class="WordCount">
      Word Count: {{ frontmatter.wordCount.total || 'null' }}
    </span>
    <span class="ReadingTime">
      Reading Time: {{ frontmatter.readingTime || 'null' }} minute
    </span>
  </div>
</template>

<style scoped>
.WordCountContainer {
  display: inline-block;
  margin-bottom: 2px;
}
.WordCount, .ReadingTime {
  display: inline-block;
  border: 1px solid transparent;
  border-radius: 12px;
  margin: 2px;
  padding: 0 10px;
  line-height: 22px;
  font-size: 12px;
  font-weight: 500;
  border-color: var(--vp-badge-tip-border);
  color: var(--vp-badge-tip-text);
  background-color: var(--vp-badge-tip-bg);
}
</style>