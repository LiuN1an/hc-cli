/**
 * useMobile Hook
 * 
 * 检测当前是否为移动端设备
 * 使用 window.matchMedia 监听屏幕宽度变化
 * 
 * @example
 * const isMobile = useIsMobile();
 * 
 * return isMobile ? <MobileView /> : <DesktopView />;
 */

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

