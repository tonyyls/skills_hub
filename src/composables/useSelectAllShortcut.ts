/**
 * 提供输入控件的 Cmd/Ctrl+A 全选快捷键处理。
 * 在绑定的输入框上监听 `keydown`，当检测到快捷键时自动选中全部文本。
 * 兼容 `input` 与 `textarea`。
 *
 * @returns {(e: KeyboardEvent) => void} 键盘事件处理函数
 */
export function useSelectAllShortcut() {
  /**
   * 处理 Cmd/Ctrl + A 快捷键，实现选中当前输入框所有文本。
   *
   * @param {KeyboardEvent} e 键盘事件
   */
  const onKeydownSelectAll = (e: KeyboardEvent): void => {
    const isSelectAll = (e.metaKey || e.ctrlKey) && (e.key === 'a' || e.key === 'A')
    if (!isSelectAll) return

    const target = e.target as HTMLElement | null
    if (!target) return

    // 仅在输入控件上处理，避免影响其他组件
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      e.preventDefault()
      try {
        target.select()
      } catch {
        // 部分环境可能不支持 select(); 忽略错误以保证稳定性
      }
    }
  }

  return { onKeydownSelectAll }
}