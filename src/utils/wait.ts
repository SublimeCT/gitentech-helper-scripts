/**
 * 延迟指定时间
 * @param timeout 延迟时间(ms)
 */
export function delay(timeout: number) {
  return new Promise(resolve => setTimeout(resolve, timeout))
}

/**
 * 循环执行取值函数直到获取到该值
 * @param fn 取值函数
 * @param times 循环次数
 * @returns 值
 */
export async function waitFor<T>(fn: (...args: any[]) => undefined | T | Promise<undefined | T>, times: number = 60) {
  for (let _times = times; _times--;) {
    const result = fn()
    if (result === undefined) {
      await delay(200)
      continue
    }
    return result
  }
  return undefined
}

/**
 * 等待指定元素出现在 DOM 结构中
 * @param selector 元素 selector
 * @param times 循环次数
 * @returns 元素
 */
export async function waitForElement(selector: string, times?: number): Promise<Element | undefined> {
  return waitFor<Element>(() => document.querySelector(selector) || undefined, times)
}