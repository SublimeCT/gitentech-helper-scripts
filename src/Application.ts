import { Pages, PagesInfoMap } from "./Pages"
import { waitFor, waitForElement } from "./utils/wait"

export interface VueRoute {
  path: string,
  name: string,
  meta: {
    title: string
  }
}

export interface ApplicationHooks {
  /** page onLoad */
  onLoad?(): void
  /** 脚本初始化 */
  onInit?(): void
  /** 监听路由变化, 需要指定的 `Pages` 是标准的 `vue SPA` 页面 */
  routeChange?(to: VueRoute, from: VueRoute): void
}

export interface ApplicationModule extends ApplicationHooks {
  /** 当前模块应用的页面 */
  page: Pages
  /** 适用于 vue SPA 页面, 销毁当前引用的元素, 避免内存泄露 */
  unMounted?(): void
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

  /** 检测当前页面是否是 angular SPA 页面, 监听路由变化并触发 routeChange 钩子 */
  async listenAngularRouteChange() {
    const angular = await waitFor(() => (window as any).angular)
    if (!angular) return

    // 1. 获取 AngularJS 应用的 injector
    const appElement = document.querySelector('[ng-app]') || document.body
    const injector = await waitFor(() => angular.element(appElement).injector())

    if (!injector) throw new Error('angular injector not found')

    // 2. 获取 $rootScope 和 $location 服务
    const $rootScope = injector.get('$rootScope')
    // const $location = injector.get('$location')

    // 3. 监听 $locationChangeSuccess 事件
    $rootScope.$on('$locationChangeSuccess', (_: Event, newUrl: string, oldUrl: string) => {
      // console.log('Route changed:')
      // console.log('Old URL:', oldUrl)
      // console.log('New URL:', newUrl)
      // console.log('Current path:', $location.path())
      const toRoute: VueRoute = { path: newUrl, name: newUrl, meta: { title: newUrl } }
      const fromRoute: VueRoute = { path: oldUrl, name: oldUrl, meta: { title: oldUrl } }
      this.emit('routeChange', toRoute, fromRoute)
    })
  }

  /** 检测当前页面是否是 vue SPA 页面, 监听路由变化并触发 routeChange 钩子 */
  async listenVueRouteChange() {
    const app = await waitForElement('#app') as any
    if (!app) return
    const appInstance = await waitFor(() => app?.__vue__)
    if (!appInstance) return
    appInstance.$router.afterEach((to: VueRoute, from: VueRoute) => {
      this.emit('routeChange', to, from)
    })
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
