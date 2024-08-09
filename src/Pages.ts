export enum Pages {
  /** 课程 */
  ilearn,
  /** 工时 */
  timesheet,
}

export interface PagesInfo {
  name: string
  pattern: RegExp
}

export const PagesInfoMap: Record<Pages, PagesInfo> = {
  [Pages.ilearn]: {
    name: 'iLearn(课程/考试)',
    pattern: /^https:\/\/ilearn\.gientech\.com.*/,
  },
  [Pages.timesheet]: {
    name: '工时',
    pattern: /^https:\/\/timesheet\.gientech\.com\/\#\/.*/,
  },
}