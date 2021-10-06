export interface StudyOutline {
  /** 章id */
  chapterId?: string;
  /** 章名称 */
  chapterName?: string;
  /** 章知识点总数 */
  chapterPointSum?: number;
  /** 节数据集合 */
  getStudyProgramSectionRess?: Array<StudyOutlineSection>;
}
export interface StudyOutlineSection {
  // /** 视频数据集合 */
  // getStudyProgramSectionVideos?: Array<StudyOutlineVideo>;
  // /** 节id */
  // sectionId?: string;
  // /** 节名称 */
  // sectionName?: string;
  // /** 节知识点总数 */
  // sectionPointSum?: number;
  // /**
  //  * 本节状态
  //  * @description 智适应时有值
  //  * @enum {0}未开始
  //  * @enum {1}已开始
  //  * @enum {2}已结束
  //  */
  // status?: string;
  courseChapterId?: string;
  courseId?: string;
  coursePacketId?: string;
  courseWares?: Array<StudyOutlineVideo>;
  fileNum?: number;
  id?: string;
  isDefault?: string;
  name?: string;
  pptNum?: number;
  seq?: number;
  status?: string;
  studyLength?: number;
  taskNum?: number;
  videoNum?: number;
}
export interface StudyOutlineVideo {
  // /** 视频对应资源id */
  // resourceId?: string;
  // /** 视频时长 */
  // videoLength?: number;
  // /** 视频名称 */
  // videoName?: string;
  // /** 视频地址 */
  // videoUrl?: string;
  attachmentName?: string;
  attachmentPath?: string;
  coursewareType?: string;
  id?: string;
  orgCode?: string;
  status?: string;
  videoLength?: number;
}
export interface StudyCourse {
  courseCode?: string;
  courseId?: string;
  coursePacketId?: string;
  coursePacketName?: string;
  teachType?: string;
  id?: string;
  isSmart?: string;
  selected?: boolean;
  subCode?: string;
}
