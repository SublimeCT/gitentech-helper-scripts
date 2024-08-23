import { ApplicationModule } from "../Application";
import { Pages } from "../Pages";
import { defaultTimeOffset, getCourseIdByURL, getTimeStamp, getToken } from "../utils/fetch";
import { checkRoute } from "../utils/route";
import { waitForElement, waitFor, delay } from '../utils/wait'

export class CourseModule implements ApplicationModule {
  page = Pages.ilearn;
  component: any = null
  initialized = false
  /** 是否点击了开始学习按钮 */
  isClickStudy: boolean = false
  async onLoad() {
    if (!checkRoute('/courseMain', this.page)) return this.unMounted()
    if (this.initialized) return
    this.initialized = true
    this.modifyStudyButton()
    const el = await waitForElement('.courseIntroduce.coursewareWrapper.courseMobile > div') as any
    this.component = await waitFor(() => el.__vue__)
    this.proxyStorage()
  }
  routeChange(): void {
    this.onLoad()
  }
  unMounted() {
    this.component = null
    this.isClickStudy = false
    this.initialized = false
  }
  async modifyStudyButton() {
    const buttonEl = await waitForElement('.head .rightBtn button')
    if (!buttonEl) throw new Error("Misisng study button");
    const buttons = Array.from(document.querySelectorAll('.head .rightBtn button'))
    for (const button of buttons) {
      if (button.classList.contains('userscript')) continue
      const buttonTextEl = button.querySelector('span')
      if (!buttonTextEl) throw new Error("Misisng study button text");
      button.classList.add('userscript')
      button.addEventListener('click', async () => {
        if (buttonTextEl.innerText.includes('立即学习')) {
          console.warn('立即学习 ▶️')
          this.isClickStudy = true
        }
        await delay(800)
        this.modifyStudyButton()
      })
      buttonTextEl.innerText += ' 🤖';
      (button as HTMLElement).style.filter = 'drop-shadow(2px 4px 6px cyan)'
    }
  }
  async proxyStorage() {
    const component = this.component
    component._$storage = component.$storage
    /** 课程开始学习时间的偏移量(ms) */
    const timeOffset = defaultTimeOffset
    /** 代理对于 SessionStorage 的访问方法, 当获取到视频总时长时, 减去偏移量, 避免视频播放时, 视频总时长被修改为当前时间 */
    component.$storage = {
      ...component.$storage,
      getSessionStorage(key: string) {
        component.isVideoPlaying = true
        const d = Date.now()
        if (key === 'videoTotalDuration') return timeOffset
        if (key === 'videoStart') return timeOffset / 1000
        if (key === 'courseStartPoint') return d - timeOffset
        if (key === 'videoStart') return d - timeOffset
        return component._$storage.getSessionStorage(key)
      }
    }
    component._$videoStop = component.videoStop
    component.videoStop = function() {
      console.log('Intercept video stop')
    }
    component._$getCourseWare = component.getCourseWare
    const that = this
    component.getCourseWare = async function(...args: Array<any>) {
      const courseware = await component._$getCourseWare(...args)
      // 获取课件详情时尝试直接发送日志, 这样就可以直接完成此课程
      delay(300).then(() => {
        this.sendCourseWareData(true)
        console.warn('[CourseModule], sendCourseWareData(true)')
        // 调用发送日志方法后关闭模态框
        return that.closeModal()
      }).then(() => {
        // 实测连续点击 '立即学习' 按钮时可能会导致无限循环, 暂时先忽略
        // if (that.isClickStudy) return that.continueStudyCourses()
      }).catch((error) => {
        console.error('[CourseModule] sendCourseWareData error: ', error)
      })
      // location.reload()
      return courseware
    }
    component._$httpPost = component.$httpPost
    component.$httpPost = async function(...args: Array<any>) {
      if (!args || args.length === 0) return component._$httpPost(...args)
      const [url, options] = args
      // 对于非视频课程, 阻止 closeCourseWare 请求
      if (url === this.$httpApi.studyWare.closeCourseWare && options && options.formatType !== 'II03') {
        console.warn('not II03, stop close request', options)
        return Promise.resolve({
          data: {
            code: 0,
            msg: 'success'
          }
        })
      }
      if (url === this.$httpApi.studyWare.ilearn && options) {
        const beforeTimeStamp = getTimeStamp()
        const afterTimeStamp = getTimeStamp(-defaultTimeOffset)
        options.timeStamp = beforeTimeStamp
        const logData = JSON.parse(atob(options.log))
        logData.timeStamp = beforeTimeStamp
        // 对于非视频课程, 将时间改为当前时间之后的时间
        if (logData.formatType !== 'II03') {
          logData.timeStamp = afterTimeStamp
          options.timeStamp = afterTimeStamp
          logData.currentCoursePlayTime = null
          console.warn('II04 log', options, logData)
          setTimeout(() => location.reload(), 1500)
        }
        logData.currentCoursePlayTime = defaultTimeOffset
        if (Reflect.has(logData, 'lessonStatus')) logData.lessonStatus = 'completed'
        if (Reflect.has(logData, 'sessionTime')) logData.sessionTime = '01:30:00'
        
        options.log = btoa(JSON.stringify(logData))
        console.warn('log', options, logData)
      }
      return component._$httpPost(...args)
    }
    component.isVideoPlaying = true
  }
  /** 继续自动学习其他剩余课程 */
  async continueStudyCourses() {
    const res = await fetch(`https://ilearn.gientech.com/api/course/getCourseWareList?courseId=${getCourseIdByURL()}&t=${Date.now()}`, {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "token": getToken()
      },
      "referrerPolicy": "origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "include"
    })
    const resJson = await res.json()
    const courseWareList = resJson.data
    if (courseWareList.some((courseWare: any) => courseWare.studyProgress !== 100)) {
      const buttons = Array.from(document.querySelectorAll('.head .rightBtn button')) as HTMLElement[]
      const studyButton = buttons.find((button: HTMLElement) => button.innerText.includes('立即学习'))
      studyButton?.click()
      console.warn('[CourseModule] Continue to study next course')
    } else {
      console.warn('[CourseModule] All courses have been completed')
    }
  }
  async closeModal() {
    const closeButtonEl = (await waitForElement('.ant-modal-body i.anticon-close')) as HTMLElement | undefined
    if (!closeButtonEl) return console.warn('[CourseModule] Missing close button')
    await delay(1500)
    closeButtonEl.click()
  }
}