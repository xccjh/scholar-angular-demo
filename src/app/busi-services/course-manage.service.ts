import {Injectable} from '@angular/core';
import {HttpService} from 'core/services/http.service';
import {ToolsUtil} from 'core/utils/tools.util';
import {environment} from 'src/environments/environment';
import {ServicesModule} from '@app/service/service.module';
import {Observable} from 'rxjs';
import {map} from 'rxjs/internal/operators';
import {
  AreaZkDataType,
  CommonData, CommonPagination, CommonStructure,
  CourseListDataType, CourseListParams,
  CourseServiceProviderType, NewMajorTypeParams
} from 'core/base/common';

@Injectable({
  providedIn: ServicesModule
})
export class CourseManageService {

  constructor(private http: HttpService) {
  }

  /**
   * 新建专业
   * @param id 主键id
   * @param name 专业名
   */


  handoutPageNumberRelatedTasks(param) {
    const url = 'pkg/courseTaskLink/save';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, param, options);
  }


  batchApproval(param) {
    const url = 'pkg/course/courseProcess/batch';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, param, options);
  }


  batchApprovalPkg(param) {
    const url = 'pkg/coursePacket/batchApproval';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, param, options);
  }
  getViewUrlWebPath(furl) {
    const url = 'res/v1/viewByFileUrl';
    const options = {isCommonHttpHeader: true, isWithCredentials: true};
    return this.http.postBody(url, {fileUrl: furl}, options);
  }


  getTheVersionNumber(param) {
    const url = 'pkg/coursePacket/getPacketVer';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, param, options);
  }


  /**
   * 获取知识点总数
   * @param param { id?:packetId,courseId?:courseId }
   */
  getKnos(param) {
    const url = 'res/knowledge-point/countKnowledgeNum';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, param, options);
  }

  // 关卡新增修改-id无值新增、有值修改
  addCoursePacketCard(param) {
    const url = 'pkg/coursePacketCard/saveOrUpdate';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, param, options);
  }

  // 公司新增修改-id无值新增、有值修改
  addCoursePacketCompany(param) {
    const url = 'pkg/coursePacket99Train/saveOrUpdate';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, param, options);
  }

  // 恒企新增修改-id无值新增、有值修改
  addCoursePacketHq(param) {
    const url = 'pkg/coursePacketHqTrain/saveOrUpdate';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, param, options);
  }

  // 关卡列表
  levelList(coursePacketId) {
    const url = 'pkg/coursePacketCard/list';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {coursePacketId, status: 1}, options);
  }

  // 公司列表
  getCompany(coursePacketId) {
    const url = 'pkg/coursePacket99Train/list';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {coursePacketId, status: 1}, options);
  }

  /**
   * 获取会计乐实训列表
   */
  getKjlTrain(coursePacketId) {
    const url = 'pkg/coursePacketTrain/list';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {coursePacketId, status: 1}, options);
  }

  getKjlOption() {
    const url = 'tsk/kjlTrain/getKjlAllTrainList';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {}, options);
  }


  coursePkgTrainSave(params) {
    const url = 'pkg/coursePacketTrain/saveOrUpdate';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, params, options);
  }

  coursePkgTrainDel(id){
    const url = 'pkg/coursePacketTrain/del';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {id}, options);
  }



  getHq(coursePacketId) {
    const url = 'pkg/coursePacketHqTrain/list';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {coursePacketId, status: 1}, options);
  }


  //
  levelDeletion(id) {
    const url = 'pkg/coursePacketCard/del';
    const options = {isCommonHttpHeader: true};
    return this.http.post(url, {id}, options);
  }


  /**
   * 公司删除
   * @param id 公司id
   */
  companyDeletion(id) {
    const url = 'pkg/coursePacket99Train/del';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {id}, options);
  }

  hqDeletion(id) {
    const url = 'pkg/coursePacketHqTrain/del';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {id}, options);
  }


  // 关卡资料-批量上传
  levelInformationBatchUpload(param) {
    const url = 'pkg/coursePacketCardResource/batchUpload';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, param, options);
  }

  // 关卡资料-新增与修改
  levelInformationAddAndModify(param) {
    const url = 'pkg/coursePacketCardResource/saveOrUpdate';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, param, options);
  }


  // 关卡资料删除
  levelDataDeletion(id) {
    const url = 'pkg/coursePacketCardResource/del';
    const options = {isCommonHttpHeader: true};
    return this.http.post(url, {id}, options);
  }

  getCourseListTree() {
    const url = 'pkg/course/listByTree';
    const options = {isCommonHttpHeader: true};
    return this.http.post(url, {}, options);
  }


  getCourseListTreeNew() {
    const url = 'pkg/course/list';
    const options = {isCommonHttpHeader: true};
    return this.http.post(url, {}, options);
  }

  chapterSelectionLack(id) {
    const url = 'pkg/coursePacket/getLackVideoChapterSectionTree';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {id}, options);
  }

  countTheNumberOfKnowledgePoints(params) {
    const url = 'res/knowledge-unit/countKnowledgePointList';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, params, options);
  }

  getTotalInfo(id) {
    const url = 'pkg/coursePacket/getSectionNum';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {id}, options);
  }


  getTotalKnowledgePointsInfo(knowledgeSubjectId) {
    const url = 'res/knowledge-module/countWithLackOfVideo/' + knowledgeSubjectId;
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {}, options);
  }


  delTable(id) {
    const url = 'pkg/courseTime/del';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {id}, options);
  }

  // 解绑知识点
  unbindKnowledgePoints(courseSectionId) {
    const url = 'pkg/course-section-unit/unBind/' + courseSectionId;
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {}, options);
  }

  saveTable(params) {
    const url = 'pkg/courseTime/save';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, params, options);
  }


  nailingApproval(param) {
    const url = 'pkg/coursePacket/dingApproval';
    const options = {isCommonHttpHeader: true};
    return this.http.post(url, param, options);
  }

  coursePackageSeriesList(params) {
    const url = 'pkg/courseSeries/list';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, params, options);
  }

  delLabel(params) {
    const url = 'pkg/courseSeries/del';
    const options = {isCommonHttpHeader: true};
    return this.http.post(url, {id: params.id}, options);
  }

  addLabel(params) {
    const url = 'pkg/courseSeries/saveOrUpdate';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, params, options);
  }

  getApproveStatus(code) {
    const url = 'pkg/course/isCourseUser';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {code}, options);
  }


  checkLearningSettings(coursePacketId) {
    const url = 'pkg/courseTask/sectionTask';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {coursePacketId}, options);
  }

  getLessonPackageTable(coursePacketId) {
    const url = 'pkg/courseTime/list';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {coursePacketId}, options);
  }


  exportExcel() {
    const url = 'pkg/courseChapter/downloadExcelTemp';
    const options = {isCommonHttpHeader: true, isFile: true, isObserve: true};
    return this.http.get(url, {}, options);
  }


  exportExcelVideo() {
    const url = 'pkg/courseSectionResource/downloadExcelTemp';
    const options = {isCommonHttpHeader: true, isFile: true, isObserve: true};
    return this.http.get(url, {}, options);
  }

  exportExcelKno(id) {
    const url = 'pkg/coursePacket/exportKnowledgeQuestionList?coursePacketId=' + id;
    const options = {isCommonHttpHeader: true, isFile: true, isObserve: true};
    return this.http.get(url, {}, options);
  }

  exportExcelCourse(courseCode) {
    const url = 'pkg/course/exportKnowledgeQuestion?courseCode=' + courseCode;
    const options = {isCommonHttpHeader: true, isFile: true, isObserve: true};
    return this.http.get(url, {}, options);
  }

  exportKno(id) {
    const url = 'pkg/course/exportKnowledgeQuestionList?courseId=' + id;
    const options = {isCommonHttpHeader: true, isFile: true, isObserve: true};
    return this.http.get(url, {}, options);
  }

  getVideoLength(param, userid) {
    const url = environment.polywayApi + 'v2/video/' + userid + '/info';
    return this.http.get(url, param, {});
  }

  getVideoMsg(param, userid) {
    const url = environment.polywayApi + 'v2/video/' + userid + '/get-video-msg';
    return this.http.get(url, param, {});
  }

  delSubLibrary(param) {
    const url = 'pkg/coursePacketQuebank/del';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, param, options);
  }


  getSubLibrary(param) {
    const url = 'pkg/coursePacketQuebank/list';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, param, options);
  }


  callSubLibrary(param) {
    const url = 'pkg/coursePacketQuebank/saveOrUpdate';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, param, options);
  }

  newTestPaper(param) {
    const url = 'pkg/courseTask/saveJobExam';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, param, options);
  }


  saveOrUpdate(param) {
    const url = 'pkg/courseSectionResource/batchSave';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, param, options);
  }

  saveOrUpdateTask(param) {
    const url = 'pkg/courseTask/batchSave';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, param, options);
  }

  getssocateList(courseChapterId, resourceId) {
    const url = 'pkg/courseTask/getLink';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {courseChapterId, resourceId}, options);
  }

  saveAssocateList(param) {
    const url = 'pkg/courseTaskLink/batchSave';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, param, options);
  }


  save_major(id: string, courseId: string, leaderId: string) {
    const url = 'pkg/major/save';
    const params = {id, name, leaderId};
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }


  removeTeachingDemonstration(id) {
    const url = 'pkg/coursePacketFile/del';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.get(url, {id}, opts);

  }

  getDetails(id) {
    const url = 'pkg/coursePacket/count';
    const options = {isCommonHttpHeader: true};
    return this.http.get(url, {id}, options);
  }

  // 课包审核
  submitForApproval(params) {
    const url = 'pkg/coursePacket/approval';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.get(url, params, opts);
  }

  // 新增试卷
  addTestPaper(params) {
    const url = environment.questionBankApi + 'system/qkcPaper/savePaper';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  bindKnowledgePoints(params) {
    const url = 'pkg/course-section-unit/bind';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  bindKnowledgePointsBatch(params) {
    const url = 'pkg/course-section-unit/bindList';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  getKnowledgePoints(params) {
    const url = 'pkg/course-section-unit/get';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  getLessonPackage(id, courseId) {
    const url = 'pkg/coursePacketConfig/get';
    const params = {id, courseId};
    const opts = ToolsUtil.getHttpOptions();
    return this.http.get(url, {id, courseId}, opts);
  }

  getCampus() {


  }

  setLessonPackage(params) {
    const url = 'pkg/coursePacketConfig/saveOrUpdate';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  examSetting(params) {
    const url = 'pkg/coursePacketConfigExam/saveOrUpdate';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  getExamination(id) {
    const url = 'pkg/coursePacketConfigExam/get';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.get(url, {id}, opts);

  }

  saveTheCampus(params) {
    const url = 'pkg/coursePacketOrg/batchDelSave';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  getChapterBindList(params) {
    const url = 'pkg/course-section-unit/list';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.get(url, params, opts);
  }

  getTheCampus(coursePacketId) {
    const url = 'pkg/coursePacketOrg/getSuCodes';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.get(url, {coursePacketId}, opts);
  }

  getOtherSetting(coursePacketId) {
    const url = 'pkg/coursePacketFile/getList';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.get(url, {coursePacketId}, opts);
  }

  getAreaZk(): Observable<CommonData<AreaZkDataType>> {
    const url = 'sys/area/listZKAreas';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.get(url, {}, opts).pipe(map((res: CommonData<AreaZkDataType>) => res));
  }

  synchronizedKnowledge(params) {
    const url = 'pkg/courseChapter/importKnowledgeModuleUnit';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.get(url, params, opts);
  }

  packetChapterExport(coursePacketId) {
    const url = 'pkg/courseChapter/exportByExcel';
    const options = {isCommonHttpHeader: true, isFile: true, isObserve: true};
    return this.http.get(url, {coursePacketId}, options);
  }

  excelImportChapter(params) {
    const url = 'pkg/courseChapter/importByExcel';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  excelImportVideo(params) {
    const url = 'pkg/courseSectionResource/importVideoByExcel';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  getMajorList(): Observable<CommonData<CourseServiceProviderType>> {
    const url = 'sys/type/courseProvideList';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.get(url, {}, opts).pipe(map((res: CommonData<CourseServiceProviderType>) => res));
  }


  save_curriculum_building(params) {
    const url = 'pkg/course/settingCourse';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }


  newMajor(param: NewMajorTypeParams): Observable<CommonStructure> {
    const url = 'pkg/course/saveCourse';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, param, opts).pipe(map((res: CommonStructure) => res));
  }

  /**
   * 专业列表
   */
  listMajor(param) {
    const url = 'pkg/major/listMajor';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, param, opts);
  }

  // /**
  //  * 根据专业请求课程
  //  * @param majorId 专业id
  //  * @param isAll 0/1是否查询全部课程
  //  */
  getCourseList(majorId: string, isAll: string, page, limit) {
    const url = 'pkg/course/getCourseList';
    const params = {majorId, isAll, page, limit};
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  getPkgList(param) {
    const url = 'pkg/coursePacket/approvalList';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, param, opts);
  }


  getCourseListNew(params: CourseListParams): Observable<CommonPagination<CourseListDataType>> {
    const url = 'pkg/course/getCourseList';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.get(url, params, opts).pipe(map((res: CommonPagination<CourseListDataType>) => res));
  }

  /**
   *
   * 删除课程
   * @param id 主键id
   */
  delCousre(id: string) {
    const url = 'pkg/course/delCousre';
    const params = {id};
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  /**
   * 查询负责人
   * @param orgCode, platformId （固定值）
   */
  leaderList(orgCode, platformId) {
    const url = 'sys/userOrgRole/getPlatformUser';
    const params = {subCode: orgCode, platformId};
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  /**
   * 查询校区
   * @param groupId area分组类型（固定值）
   */
  collegeList(groupId: string) {
    const url = 'sys/type/collegeList';
    const params = {groupId};
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }


  // name-课程名称
  // id 课程id
  //  majorId-专业id
  //       leaderId-负责人id
  //       roomType-教室类型：普通教室(1)、电教室(2)'
  //       ocodes:["ocode","ocode"]所属校区,
  //       teachType-授课方式，线下面授(11)、线下双师(12)、线上直播(21)、线上录播(22)',
  //       isPlan-是否排课：否(0)、是(1)
  //       coverPath-封面地址
  //       introduction-课程介绍
  //       target-课程目标
  //       examination-课程考核方式
  //       innovation-创新点
  //       teamIntroduction-团队介绍
  /**
   * 课程编辑
   * @param params up
   */
  saveCourse(params: any) {
    const url = 'pkg/course/saveCourse';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  /**
   * 课程预览
   * @param id 课程id
   */
  preview_course(id: string) {
    const url = 'pkg/course/preview';
    const params = {id};
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  preview_course_new(id: string) {
    const url = 'pkg/course/getCourse';
    const params = {courseId: id};
    const opts = ToolsUtil.getHttpOptions();
    return this.http.get(url, params, opts);
  }

  /**
   * 课包列表
   * @param courseId 课程id
   * @param majorId 专业id
   * @param page -
   * @param limit -
   */
  listPackets(params: any) {
    const url = 'pkg/coursePacket/getList';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  // id-编辑时
  // name-课包名
  // courseId-课程id
  // majorId-专业id
  /**
   * 课包编辑/新增空白课包
   * @param params -
   */
  saveOrUpdate_coursePacket(params: any) {
    const url = 'pkg/coursePacket/saveOrUpdate';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  /**
   * 根据课包id获取章
   * @param coursePacketId -
   */
  getList_courseChapter(coursePacketId: string) {
    const url = 'pkg/courseChapter/getList';
    const params = {coursePacketId};
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }


  // getList_courseChapter(coursePacketId: string) {
  //   const url = 'res/knowledge-module/treeModuleUnit';
  //   const params = {coursePacketId};
  //   const opts = ToolsUtil.getHttpOptions();
  //   return this.http.post(url, params, opts);
  // }

  /**
   * 根据章id获取节
   * @param courseChapterId -
   */
  getList_courseSection(courseChapterId: string) {
    const url = 'pkg/courseSection/getList';
    const params = {courseChapterId};
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  // {
  // 	chapters:"[{"id":"","name":"123","seq":4}]"
  // 	courseId:"b5a36f01f7942bf30e3436a1272acc49"
  // 	coursePacketId:"9b9c6fbafa06defa53bf1702fb8c7947"
  // 	orgCode:"san-si"
  // }
  /**
   * .新增章
   * @param params -
   */
  save_courseChapter(params: any) {
    const url = 'pkg/courseChapter/save';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }


  /**
   * 根据章id获取讲义
   * @param courseChapterId 章id
   */
  chapterFileList_courseChapterFile(courseChapterId: string) {
    const url = 'pkg/courseChapterFile/chapterFileList';
    const params = {courseChapterId};
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  /**
   * 根据节id获取讲义
   * @param courseSectionId 节id
   */
  sectionFileList_courseSectionFile(courseSectionId: string, courseChapterId?: string) {
    const url = 'pkg/courseSectionResource/sectionResourceList';
    const params: any = {};
    if (courseSectionId) {
      params.courseSectionId = courseSectionId;
    }
    if (courseChapterId) {
      params.courseChapterId = courseChapterId;
    }
    if (courseSectionId || courseChapterId) {
      const opts = ToolsUtil.getHttpOptions();
      return this.http.get(url, params, opts);
    }
  }

  // 参数：放在body[
  //   {attachmentName:文件名称,
  //   attachmentPath:文件路径,
  //   aattachmentExt:扩展名,
  //   courseId:课程id,
  //   coursePacketId:课包id,
  //   courseChapterId:课程章id,
  //   seq:顺序},
  //   {},
  //   {}]
  /**
   * 章添加讲义
   * @param params -
   */
  batchSave_courseChapterFile(params: any) {
    const url = 'pkg/courseChapterFile/batchSave';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }


  batchSave_courseSectionFile(params: any) {
    // const url = 'pkg/courseSectionFile/batchSave';
    // const opts = ToolsUtil.getHttpOptions();
    // return this.http.postBody(url, params, opts);
    const url = 'pkg/courseSectionResource/batchUpload';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }


  batchSave_courseSectionTaskFile(params: any) {
    // const url = 'pkg/courseSectionFile/batchSave';
    // const opts = ToolsUtil.getHttpOptions();
    // return this.http.postBody(url, params, opts);
    const url = 'pkg/courseTask/batchUpload';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }


  batchSave_courseTimeFile(params: any) {
    const url = 'pkg/courseTimeFile/batchSave';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  /**
   * 删除章讲义
   * @param id 主键id
   */
  del_courseChapterFile(id: string) {
    const url = 'pkg/courseChapterFile/del';
    const params = {id};
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }


  del_courseSectionFile(id: string) {
    // const url = 'pkg/courseSectionFile/del';
    const url = 'pkg/courseSectionResource/del';
    const params = {id};
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  del_courseSectionFileTask(id: string) {
    // const url = 'pkg/courseSectionFile/del';
    const url = 'pkg/courseTask/del';
    const params = {id};
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  /**
   * 删除课次讲义
   * @param id 课次id
   */
  del_courseTimeFile(id: string) {
    const url = 'pkg/courseTimeFile/del';
    const params = {id};
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  // 参数：id-讲义主键id
  // attachmentName:文件名称,
  // attachmentPath:文件路径,
  // aattachmentExt:扩展名,
  // seq:顺序
  /**
   * 修改单个讲义
   * @param params -
   */
  save_courseChapterFile(params: any) {
    const url = 'pkg/courseChapterFile/save';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  //   参数：放在body
  // [
  // 	{
  // 		attachmentName:附件名称,
  // 		attachmentPath:附件路径,
  // 		aattachmentExt:扩展名,
  // 		courseId:课程id,
  // 		coursePacketId:课包id,
  // 		seq:顺序
  // 	},{},{}
  // ]
  /**
   * 批量上传课包简介视频
   * @param params -
   */
  batchSave_coursePacketFile(params: any) {
    const url = 'pkg/coursePacketFile/batchSave';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }


  // 参数：id-视频主键id
  // 	attachmentName:附件名称,
  // 	attachmentPath:附件路径,
  // 	aattachmentExt:扩展名,
  // 	seq:顺序
  /**
   * 修改单个课包视频
   * @param params -
   */
  delCoursePacketFile(params: any) {
    const url = 'pkg/coursePacketFile/del';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  /**
   * 修改单个课包视频
   * @param params -
   */
  save_coursePacketFile(params: any) {
    const url = 'pkg/coursePacketFile/save';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  // 参数：`courseId` '课程id',
  //   `coursePacketId` '课包id',
  //   `courseChapterId` '课程章id',
  //   `courseSectionId` '课程节id',
  //    resourId：资源id
  //    sourceType：来源
  /**
   * 添加资源并快速任务化(调用)
   * @param params -
   */
  quickCreate_courseSectionResource(params: any) {
    const url = 'pkg/courseSectionResource/invoke';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }


  quickCreate_courseSectionResourceTask(params: any) {
    const url = 'pkg/courseTask/invoke';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }


  // {
  // 	"taskId":"任务id"
  // 	resIds:[resourceId1,id2]
  // }
  /**
   * 批量调用试题
   * @param params -
   */
  batchImport_courseTaskResource(params: any) {
    const url = 'pkg/courseTaskResource/batchImport';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  /**
   * 查询节下任务
   * @param courseSectionId 节id
   * @param category 200习题，其他；任何数值
   */
  listTask_courseTask(courseSectionId: string, category: string) {
    const url = 'pkg/courseTask/listTask';
    const params = {courseSectionId, category};
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  /**
   * 设置任务形式
   * @param id 任务id
   * @param taskForm 任务形式：课前(0)、课中(1)、课后(2)、资料(3)
   */
  save_courseTask(id: string, taskForm: string) {
    const url = 'pkg/courseTask/save';
    const params = {id, taskForm};
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  /**
   * 删除调用
   * @param id 任务id
   */
  delInvoke_course(id: string) {
    const url = 'pkg/courseSectionResource/del';
    const params = {id};
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  delInvoke_courseTask(id: string) {
    const url = 'pkg/courseTask/delInvoke';
    const params = {id};
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  // 参数：-任务名
  // `courseId` '课程id',
  // `coursePacketId` '标准课包id',
  // `courseChapterId` '标准课程章id',
  // `courseSectionId` '标准课程节id',
  /**
   * 新建空白任务
   * @param params -
   */
  creatBlankTask_courseTask(params: any) {
    const url = 'pkg/courseTask/creatBlankTask';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

//   修改课次名：/pkg/courseTime/save
// 参数：id-课次id，
// 	name：课次名
  // 参数：courseId：课程id，
  //   coursePacketId：课包id
  //   name：课次名
  /**
   * 新增课次
   * @param params -
   */
  save_courseTime(params: any) {
    const url = 'pkg/courseTime/save';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  // 参数：{
  //   courseId: 课程id
  //   coursePacketId: 课包id
  //   name: 课次名
  //   sections：[//课次选中的章节信息
  //     {
  //       "courseChapterId": "KCZ364238560",
  //       "courseSectionId": "KCJ743130146"
  //     },{},{}...
  //   ]
  // }
  saveCourseTimeNew_courseTime(params: any) {
    const url = 'pkg/courseTime/saveCourseTimeNew';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  // 参数：放body，
  // 	[
  // 		{
  // 			courseId：课程id，
  // 			coursePacketId：课包id
  // 			courseTimeId：课次id
  // 			courseChapterId：课包章id
  // 			courseSectionId：课包节id
  // 		}，{}，{}
  // 	]
  /**
   * 课次添加章节信息
   * @param params -
   */
  saveCourseTime_courseTime(params: any) {
    const url = 'pkg/courseTime/saveCourseTime';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  getCourseChapterTreeNode(coursePacketId: string, courseTimeIds?: string[]) {
    const url = 'pkg/courseChapter/courseChapterTreeNode';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, {coursePacketId, courseTimeIds}, opts);
  }

  /**
   * 获取课包教学视频列表
   * @param coursePacketId coursePacketId
   */
  videoList_coursePacketFile(coursePacketId: string) {
    const url = 'pkg/coursePacketFile/videoList';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, {coursePacketId}, opts);
  }

  /**
   * 章节资源统计
   * @param coursePacketId coursePacketId
   */
  chapterResStatistics_courseChapter(coursePacketId: string) {
    const url = 'pkg/courseChapter/chapterResStatistics';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, {coursePacketId}, opts);
  }

  /**
   * 课次列表
   * @param coursePacketId coursePacketId
   */
  courseTimeList_courseTime(coursePacketId: string) {
    const url = 'pkg/courseTime/courseTimeList';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, {coursePacketId}, opts);
  }

  /**
   * 统计经验
   * @param coursePacketId coursePacketId
   */
  calculate_courseTask(coursePacketId: string) {
    const url = 'pkg/courseTask/showExp';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, {coursePacketId}, opts);
  }

  /**
   * 更新课包状态
   * @param id 课包id
   * @param status 状态：草稿(0)、标准(1)',
   */
  save_coursePacket(id: string, status: string) {
    const url = 'pkg/coursePacket/saveOrUpdate';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, {id, status}, opts);
  }

  /**
   * 复制课包
   * @param id 课包id
   */
  copy_coursePacket(id: string) {
    const url = 'pkg/coursePacket/copy';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, {id}, opts);
  }

  // 放body，[{"id":"题目在作业中的主键id","seq":"调整后的顺序"}]
  /**
   * 作业任务中题目排序
   * @param params -
   */
  sort_courseTaskResource(params: any) {
    const url = 'pkg/courseTaskResource/sort';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  // 放body，[{"id":"主键id","seq":"调整后的顺序"}]
  /**
   * 任务排序
   * @param params -
   */
  sort_courseTask(params: any) {
    const url = 'pkg/courseTask/sort';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  // 参数：id-任务，
  // downloadType'资源下载权限：默认不可下载(0)、仅老师可下载(1)、老师和学生都可下载(2)',
  /**
   * 修改资源下载权限
   * @param params -
   */
  modifyResAuth(params: any) {
    const url = 'pkg/courseTask/save';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  // 参数：id-任务，
  // downloadType'资源下载权限：默认不可下载(0)、仅老师可下载(1)、老师和学生都可下载(2)',
  /**
   * 修改节资源下载权限
   * @param params -
   */
  modifySectionResource(params: any) {
    const url = 'pkg/courseSectionResource/save';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  modifySectionResourceTask(params: any) {
    const url = 'pkg/courseTask/save';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  modifyChapterResource(params: any) {
    const url = 'pkg/courseChapterFile/save';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  /**
   * 课包使用
   * @param id 课包id
   * @param isUsed 是否使用：否(0)、是(1)',
   */
  UsecoursePacket(id: string, isUsed: string) {
    const url = 'pkg/coursePacket/saveOrUpdate';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, {id, isUsed}, opts);
  }

  /**
   * 开启智适应
   * @param id 课包id
   * @param isSmart 是否开启：否(0)、是(1)
   */
  isSmartUpdate(id: string, isSmart) {
    const url = 'pkg/coursePacket/saveOrUpdate';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, {id, isSmart, isDailyOn: isSmart}, opts);
  }

  /**
   * 开启闯关
   * @param isCard 是否开启：否(0)、是(1)
   */
  isCardUpdate(id: string, isCard: string) {
    const url = 'pkg/coursePacket/saveOrUpdate';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, {id, isCard}, opts);
  }

  /**
   * 开启99实训
   * @param isCard 是否开启：否(0)、是(1)
   */
  is99TrainUpdate(id: string, is99Train: string) {
    const url = 'pkg/coursePacket/saveOrUpdate';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, {id, is99Train}, opts);
  }

  /**
   * 开启用友
   * @param id
   * @param isYyTrain
   */
  isYyTrainUpdate(id: string, isYyTrain: string) {
    const url = 'pkg/coursePacket/saveOrUpdate';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, {id, isYyTrain}, opts);
  }

  /**
   * 开启会计乐实训
   * @param isCard 是否开启：否(0)、是(1)
   */
  isKjlTrainUpdate(id: string, isKjlTrain: string) {
    const url = 'pkg/coursePacket/saveOrUpdate';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, {id, isKjlTrain}, opts);
  }

  isHqTrainUpdate(id: string, isHqTrain: string){
    const url = 'pkg/coursePacket/saveOrUpdate';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, {id, isHqTrain}, opts);
  }

  /**
   * 开启押题宝
   * @param isCard 是否开启：否(0)、是(1)
   */
  isBetUpdate(id: string, isBet: string) {
    const url = 'pkg/coursePacket/saveOrUpdate';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, {id, isBet}, opts);
  }

  /**
   * 生成课次
   * @param coursePacketId 课包id
   * @param lessonCount 课次
   * @param courseId 课程id
   */
  lessonPackage(coursePacketId, lessonCount, courseId) {
    const url = 'pkg/courseTime/batchGenerate';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, {coursePacketId, lessonCount, courseId}, opts);
  }

  /**
   *  课程售卖
   * @param id 课包id
   * @param isSale 是否售卖：否(0)、是(1)
   */
  lessonBuy(id: string, isSale) {
    const url = 'pkg/coursePacket/saveOrUpdate';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, {id, isSale}, opts);
  }

  /**
   * 作业任务删除单个题目
   * @param id 题目在作业中的主键id
   */
  delTaskRes_courseTaskResource(id: string) {
    const url = 'pkg/courseTaskResource/delTaskRes';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, {id}, opts);
  }

  /**
   * 删除课次
   * @param id 课次id
   */
  del_courseTime(id: string) {
    const url = 'pkg/courseTime/del';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, {id}, opts);
  }

  /**
   * 删除章/pkg/courseChapter/del 参数：id-章id
   * 方视
   * 删除节/pkg/courseSection/del 参数：id-节id
   * 方视
   * 删除节中资源、/pkg/courseSectionResource/del  id-资源记录id
   * 方视
   * 删除节中资源，参数不是资源的id，是这条对应记录的id。不是resourceId
   * @param id id
   * @param type 类型
   */
  delTreeNode(id: string, type: 'chapter' | 'section' | 'secRes' | 'secAllRes') {
    let url = '';
    switch (type) {
      case 'chapter':
        url = 'pkg/courseChapter/del';
        break;

      case 'section':
        url = 'pkg/courseSection/del';
        break;

      case 'secRes':
        url = 'pkg/courseSectionResource/del';
        break;

      case 'secAllRes':
        url = 'pkg/courseSectionResource/del';
        break;

      default:
        url = '';
    }
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, {id}, opts);
  }

  // {
  //   ·courseId`  '课程id',
  //   `coursePacketId` '课包id',
  //   `courseChapterId`  '课程章id',
  //   `seq`  '顺序',
  //   resourceId：资源id
  //   }
  /**
   * 章调用讲义
   * @param params -
   */
  invoke_courseChapterFile(params: any) {
    const url = 'pkg/courseChapterFile/invoke';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }

  // {
  //   ·courseId`  '课程id',
  //   `coursePacketId` '课包id',
  //   `courseChapterId`  '课程章id',
  //   courseSectionId 课程节id，
  //   `seq`  '顺序',
  //   resourceId：资源id
  //   }
  /**
   * 节调用讲义
   * @param params -
   */
  invoke_courseSectionFile(params: any) {
    // const url = 'pkg/courseSectionFile/invoke';
    const url = 'pkg/courseSectionResource/invoke';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  /**
   *  调用阅读库
   * @param params 调用参数
   */
  invoke_courseSectionFileTask(params: any) {
    // const url = 'pkg/courseSectionFile/invoke';
    const url = 'pkg/courseTask/invoke';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.postBody(url, params, opts);
  }

  invoke_courseTimeFile(params: any) {
    const url = 'pkg/courseTimeFile/invoke';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, params, opts);
  }


  /**
   * 根据节id获取章节信息
   * @param courseSectionId 节id
   */
  chapterSection_courseSection(courseSectionId: string) {
    const url = 'pkg/courseSection/chapterSection';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, {courseSectionId}, opts);
  }

  export_coursePacket(coursePacketId: string) {
    const url = `pkg/coursePacket/export?id=${coursePacketId}`;
    return `${environment.SERVER_URL}${url}`;
  }

  checkSecTask_courseTask(coursePacketId: string) {
    const url = 'pkg/courseTask/checkSecTask';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, {coursePacketId}, opts);
  }

  /**
   * 根据节id获取课次讲义
   * @param courseSectionId 课包节id
   */
  listBySectionId_courseTimeFile(courseSectionId: string) {
    const url = 'pkg/courseTimeFile/listBySectionId';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, {courseSectionId}, opts);
  }

  /**
   * 按照课次结构预览课包
   * @param courseSectionId 课包节id
   */
  courseTimeList_coursePacket(id: string) {
    const url = 'pkg/coursePacket/courseTimeList';
    const opts = ToolsUtil.getHttpOptions();
    return this.http.post(url, {id}, opts);
  }

  // 学生端点击获取学习大纲，会返回第一章数据
  listFirstChapterTask(orderDetailId) {
    return this.http.get('tsk/v2/listFirstChapterTask', {orderDetailId}, ToolsUtil.getHttpOptions());
  }

  // 章-任务列表
  getTask(params) {
    return this.http.get('tsk/v2/chapter/getTask', params, ToolsUtil.getHttpOptions());
  }

  // 学生登陆
  loginByPhone(params: any) {
    return this.http.post('stu/student/getStuInfoByPhone', params, {});
  }

  /**
   * 学生端点击获取学习大纲
   * @param packetId 课包ID
   */
  getStudyOutline(packetId) {
    return this.http.get('pkg/courseChapter/outline', {packetId}, ToolsUtil.getHttpOptions());
  }

  // 数据统计
  getStatistics(params) {
    const url = 'pkg/course/getKnowledgeQuestionList';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, params, options);
  }

  sortSubQuestionBank(params) {
    const url = 'pkg/coursePacketQuebank/batchSaveOrUpdate';
    const options = {isCommonHttpHeader: true};
    return this.http.postBody(url, params, options);
  }
}

