/** 课件类型 */
export enum CourseWareType {
  /** 未知, 可能是内部的课件 */
	html = 'II01',
  /** 未知 */
	unkonwn = 'II02',
  /** 视频 */
	video = 'II03',
  /** PDF */
  pdf = 'II04',
  /** 链接 */
  URL = 'II05',
}

export interface CourseWare {
	courseId: number;
	coursewareId: number;
	archivesId: number;
	coursewareName: string;
	summary?: any;
	studyProgress: number;
	coursewareType: CourseWareType;
	coursewareUrl: string;
	isSignUp: number;
	currentCoursePlayTime: number;
}