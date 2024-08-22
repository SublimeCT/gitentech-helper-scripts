import { ApplicationModule } from "../Application";
import { Pages } from "../Pages";
import { checkRoute } from "../utils/route";
import { waitForElement, waitFor, delay } from '../utils/wait'

export class TimesheetModule implements ApplicationModule {
  page = Pages.timesheet;
  initialized = false
  scope: any = null
  async onLoad() {
    if (!checkRoute('/Fill_ByCalendar.aspx', this.page)) return this.unMounted()
    if (!this.initialized) this.initModule()
  }
  async initModule() {
    this.initialized = true
    const angular = await waitFor(() => (window as any).angular)
    if (!angular) throw new Error('Missing angular object')
    const el = await waitForElement('.wrapper.ccontent.ng-scope')
    if (!el) throw new Error('Missing timesheet tab page element')
    this.scope = await waitFor(() => angular.element(el).scope())
    console.warn('timesheet', this.scope)
    delay(1000).then(() => this.modifyWeekList())
    this.interceptNextAndRevious()
  }
  /** 更新日历组件中的 weekList 数据, 并触发 UI 层更新 */
  modifyWeekList() {
    for (const row of this.scope.MetaData.ResultCalender.WeekList) {
      const satItem = row[row.length - 1]
      if (!Reflect.has(satItem, 'isWorkDay')) continue // 忽略非本月的日期
      if (satItem.dayState !== '0') continue // 忽略已填写的日期
      if (satItem.isholiday !== 'True') {
        satItem.isWorkDay = 'True'
        satItem.isShow = '1'
        console.log('符合条件的周六', satItem)
      }
    }
    this.clickToUpdateElement()
  }
  clickToUpdateElement() {
    const li = document.querySelector<HTMLDivElement>('.calenderDate')
    li?.click()
  }
  /** 确保页面内已经没有了 loading 元素 */
  ensureNoLoading() {
    return waitFor(() => !document.querySelector('.loading-indicator-overlay'))
  }
  interceptNextAndRevious() {
    const _this = this
    this.scope._$next = this.scope.next
    this.scope.next = function(...args: any[]) {
      this._$next(...args)
      delay(1500).then(_this.ensureNoLoading).then(() => _this.modifyWeekList())
    }
    this.scope._$revious = this.scope.revious
    this.scope.revious = function(...args: any[]) {
      this._$revious(...args)
      delay(1500).then(_this.ensureNoLoading).then(() => _this.modifyWeekList())
    }
  }
  routeChange(): void {
    this.onLoad()
  }
  unMounted(): void {
    this.scope = null
    this.initialized = false
  }
}