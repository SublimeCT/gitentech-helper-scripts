export interface CourseWareStudy {
	courseId: number;
	archivesId: number;
	coursewareId: number;
	studyProgress: number;
	recordId: number;
	lastRecordId?: any;
	formatType: string;
	fileUrl: string;
	fileType?: any;
	shortestTime: number;
	coursewareErrorInfo?: any;
	currentCoursePlayTime: number;
	scorm_LESSION_MODE_KEY?: any;
	scorm_LESSION_STATUS_KEY?: any;
	scorm_TOTAL_TIME_KEY?: any;
	scorm_SUSPEND_DATA_KEY?: any;
	scorm_LESSON_LOCATION_KEY?: any;
	scorm_SCORE_RAW_KEY?: any;
	scorm_STUDENT_NAME_KEY?: any;
	scorm_LMSINITIALIZE?: any;
}