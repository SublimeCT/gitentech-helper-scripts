import { unsafeWindow } from "$";

/** 获取当前环境 window 对象 */
export function getWindow() {
  try {
    return unsafeWindow
  } catch(error) {
    return window
  }
}