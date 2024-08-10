import { ApplicationModule } from "../Application";
import { Pages } from "../Pages";
import { checkRoute } from "../utils/route";
import { waitForElement, waitFor, delay } from '../utils/wait'

export class TestModule implements ApplicationModule {
  page = Pages.ilearn;
  component: any = null
  private viewDataIsEmpty(viewData: Record<string, Array<object>>) {
    return Object.values(viewData).every(v => v.length === 0)
  }
  async onLoad() {
    if (!checkRoute('/testPage', this.page)) return this.unMounted
    const el = await waitForElement('.box') as any
    this.component = await waitFor(() => {
      if (el.__vue__ && el.__vue__.formData && el.__vue__.viewData && !this.viewDataIsEmpty(el.__vue__.viewData)) return el.__vue__
    })
    this.fillAnswer()
    return undefined
  }
  routeChange(): void {
    this.onLoad()
  }
  unMounted(): void {
    this.component = null
  }
  private correctAnswerToValue(correctAnswer: string) {
    return correctAnswer.split(',').map(a => a.replace(/[\[\]]/g, '')).toString()
  }
  private answerValueToIndex(answer: string) {
    return answer.split(',').map(a => a.charCodeAt(0) - 65)
  }

  async fillAnswer() {
    const questionsElements: Array<Element> = Array.from(document.querySelectorAll('.problem'))
    if (questionsElements.length === 0) throw new Error('questionsElements length is 0')
    for (const type in this.component.viewData) {
      const questions = this.component.viewData[type]
      await Promise.all(questions.map((q: any) => this.fillQuestion(q, questionsElements)))
    }
  }
  async fillQuestion(question: any, questionsElements: Array<Element>) {
    question.value = this.correctAnswerToValue(question.correctAnswer)
    const questionEl = questionsElements[question.questionIndex - 1]
    if (questionEl) {
      const optionLabelElements = Array.from(questionEl.querySelectorAll('label'))
      if (optionLabelElements.length) {
        const answerIndexs = this.answerValueToIndex(question.value)
        for (const i of answerIndexs) {
          optionLabelElements[i] && optionLabelElements[i].click()
          await delay(300)
        }
      } else {
        console.error('Missing option label element')
        return
      }
    } else {
      console.error('Missing question element')
      return
    }
  }
}