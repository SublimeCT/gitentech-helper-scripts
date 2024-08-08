export enum Pages {
  /** 答题 */
  test,
  /** 课程 */
  course,
  /** 工时 */
  timesheet,
}

export interface PagesInfo {
  name: string
  pattern: RegExp
}

export const PagesInfoMap: Record<Pages, PagesInfo> = {
  [Pages.test]: {
    name: '答题',
    pattern: /^https:\/\/ilearn\.gientech\.com\/testPage.*/,
  },
  [Pages.course]: {
    name: '课程',
    pattern: /^https:\/\/ilearn\.gientech\.com\/courseMain.*/,
  },
  [Pages.timesheet]: {
    name: '工时',
    pattern: /^https:\/\/timesheet\.gientech\.com\/\#\/.*/,
  },
}