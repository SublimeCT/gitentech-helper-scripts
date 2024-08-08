import { ApplicationModule } from "../Application";
import { Pages } from "../Pages";
import { waitForElement, waitFor, delay } from '../utils/wait'

export class CourseModule implements ApplicationModule {
  page = Pages.course;
  component: any = null
  async onLoad() {
    this.modifyStudyButton()
    await delay(1000)
    const el = await waitForElement('.courseIntroduce.coursewareWrapper.courseMobile > div') as any
    this.component = await waitFor(() => el.__vue__)
    this.proxyStorage()
    console.warn('test onLoad', this.component, el)
  }
  async modifyStudyButton() {
    const buttonEl = await waitForElement('.head .rightBtn button')
    if (!buttonEl) throw new Error("Misisng study button");
    const buttonTextEl = buttonEl.querySelector('span')
    if (!buttonTextEl) throw new Error("Misisng study button text");
    buttonTextEl.innerText = '立即学习(自动化 🤖)';
    (buttonEl as HTMLElement).style.width = '180px';
    (buttonEl as HTMLElement).style.filter = 'drop-shadow(2px 4px 6px cyan)'
  }
  async proxyStorage() {
    // await Toolkit.waitFor(() => this.courseWareListEl.__vue__ && this.courseWareListEl.__vue__.courseDetail)
    const component = this.component
    component._$storage = component.$storage
    const timeOffset = 60 * 60 * 1000
    component.$storage = {
      ...component.$storage,
      getSessionStorage(key: string) {
        console.log('🐔', key)
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
    component.getCourseWare = async function() {
      console.warn('????')
      await component._$getCourseWare() 
      this.sendCourseWareData(true)
      await delay(800)
      location.reload()
    }
    component.isVideoPlaying = true
  }
}