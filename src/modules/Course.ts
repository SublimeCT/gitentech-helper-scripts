import { ApplicationModule } from "../Application";
import { Pages } from "../Pages";
import { checkRoute } from "../utils/route";
import { waitForElement, waitFor, delay } from '../utils/wait'

export class CourseModule implements ApplicationModule {
  page = Pages.ilearn;
  component: any = null
  /** 是否点击了开始学习按钮 */
  isClickStudy: boolean = false
  async onLoad() {
    if (!checkRoute('/courseMain', this.page)) return this.unMounted()
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
    const timeOffset = 60 * 60 * 1000
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
    component.isVideoPlaying = true
  }
  getCourseIdByURL() {
    const matchRes = location.href.match(/courseId=(\d+)/)
    const id = matchRes && matchRes[1]
    if (!id) throw new Error('Missing courseId')
    return id
  }
  getToken() {
    return JSON.parse(localStorage.getItem('token') || '').value
  }
  /** 继续自动学习其他剩余课程 */
  async continueStudyCourses() {
    const res = await fetch(`https://ilearn.gientech.com/api/course/getCourseWareList?courseId=${this.getCourseIdByURL()}&t=${Date.now()}`, {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        "token": this.getToken()
      },
      "referrer": "https://ilearn.gientech.com/",
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