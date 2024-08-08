import { Pages, PagesInfoMap } from "./Pages"

export interface ApplicationHooks {
  /** page onLoad */
  onLoad?(): void
  /** 脚本初始化 */
  onInit?(): void
}

export interface ApplicationModule extends ApplicationHooks {
  /** 当前模块应用的页面 */
  page: Pages
}

export class Application {
  static modules: Array<ApplicationModule> = []
  static application = new Application()
  static use(plugin: ApplicationModule) {
    Application.modules.push(plugin)
    return this
  }

  /** 触发 onLoad 钩子 */
  onLoad() {
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', () => this.emit('onLoad'))
    } else {
      this.emit('onLoad')
    }
  }

  /** 判断当前页面是否匹配当前模块 */
  matchModulePage(applicationModule: ApplicationModule) {
    return PagesInfoMap[applicationModule.page].pattern.test(location.href)
  }

  /**
   * 触发钩子函数
   * @param hook 钩子事件函数名
   */
  emit<K extends keyof ApplicationHooks>(hook: K, ...args: Parameters<NonNullable<ApplicationHooks[K]>>) {
    for (const m of Application.modules) {
      if (this.matchModulePage(m) && typeof m[hook] === 'function') {
        (m[hook] as Function)(...args)
      }
    }
  }
}
