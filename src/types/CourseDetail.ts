export interface CourseAdmin {
	userId?: any;
	userName: string;
	englishName?: any;
	password?: any;
	userNo?: any;
	legalEntity?: any;
	deptNo?: any;
	deptId?: any;
	deptName?: any;
	position?: any;
	postNo?: any;
	postType?: any;
	postCn?: any;
	postEn?: any;
	grade?: any;
	linemanagerName?: any;
	linemanagerNo?: any;
	emailAddress: string;
	phone?: any;
	mobile?: any;
	isPm?: any;
	entryTime?: any;
	status?: any;
	resignTime?: any;
	location?: any;
	locationCountryCode?: any;
	locationCountry?: any;
	basicRole?: any;
	userPersonType?: any;
	createBy?: any;
	updateBy?: any;
	createTime?: any;
	updateTime?: any;
}

export enum CourseDetailShowSignUp {
	/** 未报名 */
	unregistered,
	/** 已结束(已报名) */
	completed,
	/** 学习中(已报名) */
	processing,
}

export enum CourseDetailStudyStatus {
	/** 学习中 */
	studying,
	/** 已完成 */
	finished,
}

export interface CourseDetail {
	courseId: number;
	archivesId: number;
	coursePicUrl: string;
	courseName: string;
	courseCode: string;
	limitExamCount: number;
	courseCharge: number;
	/** 学习状态(0: 学习中, 1: 已学习, null: 未) */
	studyStatus: CourseDetailStudyStatus | null;
	standardTime: string;
	studyTimeShow?: any;
	isShowHistory: number;
	currentStage: string;
	studyNum: number;
	favNum: number;
	isFavorite: number;
	evaluateGrade?: any;
	evaluateNum?: any;
	isEval: number;
	isExam: number;
	showSignUp: CourseDetailShowSignUp;
	showStudy: number;
	message?: any;
	tabList: string[];
	courseAdmins: CourseAdmin[];
	userPicUrl: string;
	coursewareVos?: any;
	currentCoursePlayTime: number;
	isShowExamWarning: number;
	isShowEvalWarning: number;
	certPath?: any;
}