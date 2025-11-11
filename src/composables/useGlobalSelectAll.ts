/**
 * 全局选择快捷键指令：为所有需要的输入控件提供 Cmd/Ctrl + A 全选功能。
 * 使用方式：在模板中对 `input` 或 `textarea` 添加 `v-select-all-shortcut`。
 *
 * 官方文档参考：
 * - Vue 3 自定义指令：https://vuejs.org/guide/reusability/custom-directives.html
 */
import type { Directive } from 'vue'

/**
 * 创建一个处理 Cmd/Ctrl + A 的事件监听器。
 * - 仅在 `input` 与 `textarea` 上触发 `select()`。
 * - 阻止默认行为与冒泡，避免被其他键盘处理覆盖。
 * @returns {(e: KeyboardEvent) => void} 键盘事件处理函数
 */
function createSelectAllHandler(): (e: KeyboardEvent) => void {
  return (e: KeyboardEvent): void => {
    const isMac = navigator.platform.toLowerCase().includes('mac')
    const isSelectAll =
      (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'a'
    if (!isSelectAll) return

    const target = e.target as (HTMLInputElement | HTMLTextAreaElement | null)
    if (!target) return

    const tag = target.tagName.toLowerCase()
    if (tag === 'input' || tag === 'textarea') {
      try {
        target.select?.()
      } catch {
        // 某些环境不支持 select(); 忽略错误
      }
      e.preventDefault()
      e.stopPropagation()
    }
  }
}

/**
 * v-select-all-shortcut 指令实现。
 * - 在元素挂载时绑定 `keydown` 监听。
 * - 在卸载时移除监听，避免内存泄漏。
 */
export const selectAllShortcutDirective: Directive<
  HTMLInputElement | HTMLTextAreaElement
> = {
  mounted(el) {
    const handler = createSelectAllHandler()
    // 将处理器挂到元素实例，卸载时可移除
    ;(el as any).__selectAllHandler__ = handler
    el.addEventListener('keydown', handler)
  },
  unmounted(el) {
    const handler = (el as any).__selectAllHandler__ as (e: KeyboardEvent) => void
    if (handler) {
      el.removeEventListener('keydown', handler)
      delete (el as any).__selectAllHandler__
    }
  }
}

/**
 * 导出一个辅助函数，供 main.ts 进行全局注册。
 */
export function useGlobalSelectAllDirective() {
  return { selectAllShortcutDirective }
}