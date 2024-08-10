import { ApplicationModule } from "../Application";
import { Pages } from "../Pages";
import { CourseDetail, CourseDetailShowSignUp } from "../types/CourseDetail";
import { CourseWare } from "../types/CourseWare";
import { CourseWareStudy } from "../types/CourseWareStudy";
import { getCourseIdByURL, getTimeStamp, toFetch } from "../utils/fetch";
import { checkRoute } from "../utils/route";
import { waitForElement, delay } from '../utils/wait'

/**
 * 学习模块(仅请求接口)
 * @deprecated
 */
export class StudyModule implements ApplicationModule {
  page = Pages.ilearn;
  component: any = null
  async onLoad() {
    if (!checkRoute('/courseMain', this.page)) return this.unMounted()
    this.initElement()
    // this.autoStudy()
  }
  routeChange(): void {
    this.onLoad()
  }
  unMounted() {
    this.component = null
  }
  getStudyButton() {
    const button = document.createElement('button')
    button.type = 'button'
    button.classList.add('ant-btn')
    button.innerText = '自动学习 🤖'
    button.style.backgroundColor = 'rgb(224, 0, 50)'
    button.style.height = '50px'
    button.style.width = '170px'
    button.style.fontSize = '22px'
    button.style.color = '#FFF'
    button.addEventListener('click', () => {
      this.autoStudy()
    })
    return button
  }
  async initElement() {
    const rightContent = await waitForElement('#boxP .rightContent')
    if (!rightContent) throw new Error('Missing rightContent')
    const box = document.getElementById('boxP')
    if (!box) throw new Error('Missing box')
    box.style.height = '385px'
    const studyButton = this.getStudyButton()
    rightContent?.appendChild(studyButton)
  }
  async autoStudy() {
    const timeStamp = getTimeStamp()
    const courseDetail = await toFetch<CourseDetail>(`/api/course/getCourseDetail?courseId=${getCourseIdByURL()}&t=${timeStamp}`)
    // 报名
    if (courseDetail.data.showSignUp = CourseDetailShowSignUp.unregistered) {
      await toFetch('/api/course/studySignUp', {
        method: 'POST',
        body: JSON.stringify({
          courseId: getCourseIdByURL(),
          limitExamCount: courseDetail.data.limitExamCount,
          courseCharge: courseDetail.data.courseCharge,
          startTime: formatDate(timeStamp),
          endTime: formatDate(timeStamp + 60 * 60 * 24 * 30 * 1000),
          t: timeStamp,
        })
      })
    }
    // 开始学习所有课件并发送日志
    const coursewareList = await this.getCourseWareList(timeStamp)
    for (const courseware of coursewareList) {
      const record = await this.studyCourseWare(courseware)
      const params = await this.sendStudyLog(timeStamp, record)
      await delay(800)
      await this.closeCourseWare(params)
      console.warn('success', params)
    }
  }
  async getCourseWareList(t: number) {
    const res = await toFetch<Array<CourseWare>>(`/api/course/getCourseWareList?courseId=${getCourseIdByURL()}&t=${t}`)
    return res.data
  }
  async sendStudyLog(t: number, courseWareStudy: CourseWareStudy) {
    const params = {
      archivesId: courseWareStudy.archivesId,
      courseId: courseWareStudy.courseId,
      coursewareId: courseWareStudy.coursewareId,
      recordId: courseWareStudy.recordId,
      formatType: courseWareStudy.formatType,
      currentCoursePlayTime: 60 * 90,
      videoStopTime: 60 * 90,
      sessionTime: '90:00:00',
      type: 'default',
      lessonStatus: 'completed',
      timeStamp: t,
    }
    // const res = await toFetch<CourseWareStudy>(`/api/course/studyCourseWare`, {
    //   method: 'POST',
    //   body: JSON.stringify(params),
    // })
    return params
  }
  async closeCourseWare(params: object) {
    const res = await toFetch<CourseWareStudy>(`/api/course/closeCourseWare`, {
      method: 'POST',
      body: JSON.stringify(params)
    })
    return res.data
  }
  async studyCourseWare(courseWare: CourseWare) {
    const res = await toFetch<CourseWareStudy>(`/api/course/studyCourseWare`, {
      method: 'POST',
      body: JSON.stringify({
        courseId: courseWare.courseId.toString(),
        archivesId: courseWare.archivesId,
        coursewareId: courseWare.coursewareId,
        showStudy: 0,
      })
    })
    return res.data
  }

}