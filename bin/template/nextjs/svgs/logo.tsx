/**
 * SVG Logo 组件示例
 * 
 * SVG 组件的书写规范:
 * 1. 使用 React.SVGProps<SVGSVGElement> 类型接收 props
 * 2. 通过 {...props} 传递所有属性，支持外部自定义样式
 * 3. 使用 currentColor 作为 fill 值，可通过 CSS color 属性改变颜色
 * 4. viewBox 保持与设计稿一致
 * 
 * @example
 * // 基础用法
 * <Logo />
 * 
 * // 自定义大小和颜色
 * <Logo className="w-32 h-8 text-blue-500" />
 * 
 * // 内联 style
 * <Logo style={{ width: 100 }} />
 */

import * as React from "react";

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="120"
    height="32"
    viewBox="0 0 120 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* 示例 Logo - 简单的文字 LOGO */}
    <rect width="120" height="32" rx="4" fill="currentColor" fillOpacity="0.1" />
    <text
      x="60"
      y="21"
      textAnchor="middle"
      fill="currentColor"
      fontSize="14"
      fontWeight="bold"
      fontFamily="system-ui, sans-serif"
    >
      TEMPLATE
    </text>
  </svg>
);

export default Logo;

