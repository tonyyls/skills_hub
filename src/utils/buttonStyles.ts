/**
 * 按钮样式工具类 - 统一全栈按钮风格
 * 参考新建技能按钮: px-3 py-1.5 text-sm rounded-md
 */

/** 基础按钮样式 */
export const baseButton = 'px-3 py-1.5 text-sm rounded-md transition-colors duration-200 inline-flex items-center justify-center gap-1.5 font-medium border-none outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'

/** 主要按钮样式 (橙色主题) */
export const primaryButton = `${baseButton} bg-orange-600 text-white hover:bg-orange-700`

/** 次要按钮样式 (白色边框) */
export const secondaryButton = `${baseButton} bg-white text-gray-700 border border-gray-300 hover:bg-gray-50`

/** 成功按钮样式 (绿色) */
export const successButton = `${baseButton} bg-green-600 text-white hover:bg-green-700`

/** 危险按钮样式 (红色) */
export const dangerButton = `${baseButton} bg-red-600 text-white hover:bg-red-700`

/** 警告按钮样式 (黄色) */
export const warningButton = `${baseButton} bg-yellow-600 text-white hover:bg-yellow-700`

/** 信息按钮样式 (蓝色) */
export const infoButton = `${baseButton} bg-blue-600 text-white hover:bg-blue-700`

/** 渐变按钮样式 */
export const gradientButton = `${baseButton} bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25`

/** 幽灵按钮样式 (透明背景) */
export const ghostButton = `${baseButton} bg-transparent text-gray-600 hover:bg-gray-100`

/** 大号按钮样式 */
export const largeButton = 'px-6 py-3 text-base rounded-lg'

/** 小号按钮样式 */
export const smallButton = 'px-2 py-1 text-xs rounded'

/** 图标按钮样式 */
export const iconButton = 'p-2 rounded-md hover:bg-gray-100 transition-colors duration-200'

/**
 * 获取按钮样式类名
 * @param variant - 按钮变体
 * @param size - 按钮尺寸
 * @param disabled - 是否禁用
 * @returns 完整的样式类名字符串
 */
export function getButtonClass(
  variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'gradient' | 'ghost' = 'primary',
  size: 'default' | 'large' | 'small' = 'default',
  disabled = false
): string {
  let buttonClass = ''
  
  // 基础样式
  switch (variant) {
    case 'primary':
      buttonClass = primaryButton
      break
    case 'secondary':
      buttonClass = secondaryButton
      break
    case 'success':
      buttonClass = successButton
      break
    case 'danger':
      buttonClass = dangerButton
      break
    case 'warning':
      buttonClass = warningButton
      break
    case 'info':
      buttonClass = infoButton
      break
    case 'gradient':
      buttonClass = gradientButton
      break
    case 'ghost':
      buttonClass = ghostButton
      break
    default:
      buttonClass = primaryButton
  }
  
  // 尺寸调整
  if (size === 'large') {
    buttonClass = buttonClass.replace('px-3 py-1.5 text-sm', largeButton)
  } else if (size === 'small') {
    buttonClass = buttonClass.replace('px-3 py-1.5 text-sm', smallButton)
  }
  
  // 禁用状态
  if (disabled) {
    buttonClass += ' opacity-60 cursor-not-allowed'
  }
  
  return buttonClass
}

/**
 * 按钮变体类型
 */
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'gradient' | 'ghost'

/**
 * 按钮尺寸类型
 */
export type ButtonSize = 'default' | 'large' | 'small'