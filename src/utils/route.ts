import { Pages, PagesInfoMap } from "../Pages";

/** 获取当前页面的 pathname */
export function getPathname() {
  return location.hash && location.hash.substring(0, 2) === '#/' ? location.hash.substring(1) : location.pathname
}

/**
 * 检查当前路由是否匹配
 * @param route 指定的路由
 * @param page 当前模块的 Page
 * @returns 当前路由是否匹配
 */
export function checkRoute(route: string | RegExp, page: Pages) {
  const isCurrentPage = PagesInfoMap[page].pattern.test(location.href)
  const pathname = getPathname()
  if (!isCurrentPage) return false
  if (route instanceof RegExp) {
    return route.test(pathname)
  } else {
    return route === pathname
  }
}