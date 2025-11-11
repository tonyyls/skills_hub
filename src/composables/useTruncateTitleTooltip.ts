/**
 * 提供 v-truncate-title 指令：当元素文本被单行截断（ellipsis）时，自动设置 title 提示完整内容。
 * 使用方式：在标题元素上添加 `v-truncate-title="fullText"`。
 *
 * 参考文档：
 * - Vue 3 自定义指令：https://vuejs.org/guide/reusability/custom-directives.html
 * - 文本溢出省略（Tailwind `truncate`）：https://tailwindcss.com/docs/text-overflow
 */
import type { Directive } from 'vue'

/**
 * 判断元素是否发生了单行文本截断。
 * 通过对比 `scrollWidth` 与 `clientWidth` 来判断是否溢出。
 * @param el 目标元素
 * @returns 是否溢出并出现省略
 */
function isSingleLineTruncated(el: HTMLElement): boolean {
  // 使用 requestAnimationFrame 确保布局已完成
  return el.scrollWidth > el.clientWidth
}

/**
 * 创建一个可复用的指令处理器，用于监听元素尺寸/文本变化并更新 title。
 * @param el 目标元素
 * @param getText 获取完整文本的方法
 */
function attachTooltip(el: HTMLElement, getText: () => string) {
  const updateTitle = () => {
    const text = getText().trim()
    // 仅当文本存在且被截断时才设置 title
    if (text && isSingleLineTruncated(el)) {
      el.setAttribute('title', text)
    } else {
      el.removeAttribute('title')
    }
  }

  // 监听元素尺寸变化（如父容器调整、窗口缩放）
  const resizeObserver = new ResizeObserver(() => updateTitle())
  resizeObserver.observe(el)

  // 首次挂载后更新一次
  updateTitle()

  // 清理函数：在卸载时断开监听
  ;(el as any).__truncateCleanup__ = () => {
    try { resizeObserver.disconnect() } catch {}
  }
}

/**
 * v-truncate-title 指令：在文本被截断时为元素设置 title 提示完整标题。
 * - 支持绑定值作为完整文本；若未提供则退化为元素的 textContent。
 */
export const truncateTitleDirective: Directive<HTMLElement, string | undefined> = {
  mounted(el, binding) {
    const getText = () => {
      const bound = binding?.value
      if (typeof bound === 'string' && bound.length > 0) return bound
      return (el.textContent || '').toString()
    }
    attachTooltip(el, getText)
  },
  updated(el, binding) {
    // 当绑定值或内容变化时，重新计算 title
    const cleanup = (el as any).__truncateCleanup__ as (() => void) | undefined
    if (cleanup) cleanup()
    const getText = () => {
      const bound = binding?.value
      if (typeof bound === 'string' && bound.length > 0) return bound
      return (el.textContent || '').toString()
    }
    attachTooltip(el, getText)
  },
  unmounted(el) {
    const cleanup = (el as any).__truncateCleanup__ as (() => void) | undefined
    if (cleanup) cleanup()
    delete (el as any).__truncateCleanup__
  }
}

/**
 * 导出一个辅助函数，供 main.ts 进行全局注册。
 */
export function useTruncateTitleDirective() {
  return { truncateTitleDirective }
}