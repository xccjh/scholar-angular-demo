import { Injectable } from '@angular/core';
import { HttpService } from 'core/services/http.service';
import { ToolsUtil } from 'core/utils/tools.util';
import { LocalStorageUtil } from 'core/utils/localstorage.util';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MyClassService {

  constructor(private http: HttpService) { }

  /**
   * 学生端点击获取课程列表
   * @param status '课程状态(1:正常,0:结课)',
   */
  getCourses(id) {
    return this.http.get('tch/classMarketStudent/getCourses', {id}, ToolsUtil.getHttpOptions());
  }

  // 学生端点击获取课程列表，不包含课次信息
  listStudentOrderDetail(id) {
    return this.http.get('tch/classMarketStudent/listStudentOrderDetail', {id}, ToolsUtil.getHttpOptions());
  }

  /**
   * 学生端点击获取课次列表
   * @param status '课程状态(1:正常,0:结课)',
   * @param lessonPlanId 排课计划 id
   * @param classMarketId 版型id
   */
  getCourseTimeList(orderDetailId) {
    return this.http.get('tsk/v2/getClassTimes', {orderDetailId}, ToolsUtil.getHttpOptions());
  }

  /**
   * 学生端点击获取课次任务列表
   * @param lessonTimeId 课次id
   */
  getTasks(lessonTimeId) {
    return this.http.get('tsk/v2/getTasks', {lessonTimeId}, ToolsUtil.getHttpOptions());
  }

  getStuCourseTotalExp(lessonPlanId: string) {
    return this.http.post(`tsk/stuApp/queryStuCourseTotalExp/${lessonPlanId}`, { }, ToolsUtil.getHttpOptions());
  }

  /**
   * 学情统计
   * @param classId 班级id
   * @param taskType  阅读任务(0)、案例任务(1)、作业任务(2)、签到任务(5), 实训（3）
   *
   * @param page 页码
   * @param limit 限制
   */
  getStuExpSourceList(taskType: string, lessonPlanId: string, page: number, limit: number, classId: string) {
    // tslint:disable-next-line:max-line-length
    return this.http.post('tsk/studentTask/getStuExpSourceList', { taskType, lessonPlanId,  page, limit, classId }, ToolsUtil.getHttpOptions());
  }

  // 获取直播间参数
  getLiveStudioId(liveStudioId) {
    return this.http.post('tsk/stuCourseTime/goLiveStudio', {liveStudioId}, ToolsUtil.getHttpOptions());
  }

  getAllUnreadTask(id) {
    return this.http.post(`tsk/stuApp/getAllUnreadTask/${id}`, {}, ToolsUtil.getHttpOptions());
  }

  clearUnreadMsg(params) {
    return this.http.postBody(`tsk/stuApp/clearUnreadMsg`, params, ToolsUtil.getHttpOptions());
  }
  // 获取节下的素材（视频）列表
  getVideoResource(params) {
    return this.http.get(`pkg/courseSectionResource/getVideoResource/chapterId`, params, ToolsUtil.getHttpOptions());
  }
  // （录播）智适应通过课包id查询学习大纲与非智适应下获取章节信息公用
  getStudyProgram(params) {
    return this.http.postBody(`stu/studyTimeSection/getStudyProgram`, params, ToolsUtil.getHttpOptions());
  }
  // 进入课程初始化页面（录播）（查询学习计划，判断是否已选择学习计划公用此接口）
  getStudyPlan(params) {
    return this.http.postBody(`stu/studyPlan/getStudyPlan`, params, ToolsUtil.getHttpOptions());
  }
  // 定制专属计划（录播）
  addPlan(params) {
    return this.http.postBody(`stu/studyPlan/addPlan`, params, ToolsUtil.getHttpOptions());
  }
  // 改变学习计划（录播）
  changeStudyPlan(params) {
    return this.http.postBody(`stu/studyPlan/changeStudyPlan`, params, ToolsUtil.getHttpOptions());
  }

  // 获取距离考试天数，计算段阶
  getExamDayStage(id) {
    return this.http.get(`pkg/coursePacketConfig/getExamDayStage`, {id}, ToolsUtil.getHttpOptions());
  }

  /**
   * 学生端点击获取学习大纲
   * @param packetId 课包ID
   */
  getStudyOutline(packetId) {
    return this.http.get('pkg/courseChapter/outline', {packetId}, ToolsUtil.getHttpOptions());
  }
  // 学生端点击获取学习大纲，会返回第一章数据
  listFirstChapterTask(orderDetailId) {
    return this.http.get('tsk/v2/listFirstChapterTask', {orderDetailId}, ToolsUtil.getHttpOptions());
  }
  // 章-任务列表
  getTask(params) {
    return this.http.get('tsk/v2/chapter/getTask', params, ToolsUtil.getHttpOptions());
  }

  // 【智适应首页】考点总数与掌握率
  personPointInfo(params) {
    return this.http.get('stu/studentKnowledge/personPointInfo', params, ToolsUtil.getHttpOptions());
  }
  // 【智适应首页】待加强知识点列表
  stuPoints(params) {
    return this.http.get(`stu/studentKnowledge/intelligentPush`, params, ToolsUtil.getHttpOptions());
  }

  // 【知识点学习】知识点掌握度
  stuPoints1(params) {
    return this.http.get(`stu/studentKnowledge/stuPoints?knowledgePointCode=${params.knowledgePointCode}`, params, ToolsUtil.getHttpOptions());
  }

  // 章节学习页主接口（录播）
  getSectionLearn(params) {
    return this.http.postBody(`pkg/courseSection/getSectionLearn`, params, ToolsUtil.getHttpOptions());
  }

  // (录播)更改默认指导讲师前查询课包所有讲师接口
  getAllTeachByoursePacketId(params) {
    return this.http.get(`pkg/courseSectionResource/getAllTeachByoursePacketId/${params}`, {}, ToolsUtil.getHttpOptions());
  }

  // 章节学习页主接口（录播）
  saveHalfWayOutVideo(params) {
    return this.http.postBody(`pkg/courseSection/saveHalfWayOutVideo`, params, ToolsUtil.getHttpOptions());
  }

  // （录播）节更改默认指导讲师接口
  changeDefaultTeach(params) {
    return this.http.postBody(`stu/studyPlan/changeDefaultTeach`, params, ToolsUtil.getHttpOptions());
  }

  // 一个节下的所有资料
  listBySectionId(params) {
    return this.http.get(`pkg/courseSectionResource/listBySectionId`, params, ToolsUtil.getHttpOptions());
  }
  // 一个课包下的所有资料
  listBycoursePacketId(params) {
    return this.http.get(`pkg/courseSectionResource/listBycoursePacketId`, params, ToolsUtil.getHttpOptions());
  }

  // 一个章下的所有资料
  sectionResourceList(params) {
    return this.http.get(`pkg/courseSectionResource/sectionResourceList`, params, ToolsUtil.getHttpOptions());
  }


  // 获取替换长链接需要的tempCode
  getTempCode(params) {
    return this.http.postBody(`https://tylive.beta.hqjy.com/third/getTempCode`, params, ToolsUtil.getHttpOptions());
  }

  // 智适应获取周数
  getWeeks(params) {
    return this.http.get(`pkg/coursePacketConfig/getWeeks/${params}`, {}, ToolsUtil.getHttpOptions());
  }
  // 知识点明细 (知识点学习页)
  knowledgeDetail(params) {
    return this.http.get(`res/knowledge-point/detail/${params}`, {}, ToolsUtil.getHttpOptions());
  }
  // 智适应抽题
  selectQuestion(params, stage) {
    if (stage) {
      if (stage.includes('精讲')) {
        params['phase'] = 2;
      } else if (stage.includes('冲刺')) {
        params['phase'] = 3;
      } else if (stage.includes('密押')) {
        params['phase'] = 4;
      }
    }
    params['studentId'] = LocalStorageUtil.getUserId();
    return this.http.get(`smart/adaptiveLearning/generateAdaptiveExam`, params, ToolsUtil.getHttpOptions());
  }
  getsubModule(coursePacketId) {
    return this.http.get(`pkg/coursePacketQuebank/list?coursePacketId=${coursePacketId}`, {}, ToolsUtil.getHttpOptions());
  }

  // 排课下的任务进度
  listTasksByPlan(params) {
    return this.http.get(`tch/studentTask/listTasksByPlan`, params, ToolsUtil.getHttpOptions());
  }

  // 排课下1个学生的签到率
  countStudentSign(params) {
    return this.http.get(`tch/studentSign/countStudentSign`, params, ToolsUtil.getHttpOptions());
  }
  // 排课下1个学生的出勤率
  duration(params) {
    return this.http.get(`stu/duration/select/duration`, params, ToolsUtil.getHttpOptions());
  }

  // 学员做题统计接口
  findPaperStatistic(params) {
    return this.http.postBody(`${environment.questionBankApi}tkApi/pc/paperStatistic/findPaperStatistic`, params, ToolsUtil.getHttpOptions());
  }

  // 查询1个排课中，教师所发布的任务列表。
  listTeachCourseTask(params) {
    return this.http.get(`tsk/v2/listTeachCourseTask`, params, ToolsUtil.getHttpOptions());
  }
  // 获取保利威视频信息
  getVideoMsg(param, userid) {
    const url = environment.polywayApi + 'v2/video/' + userid + '/get-video-msg';
    return this.http.get(url, param, {});
  }
  /**
   * 签到记录
   */
  getStudentSignByPage(params: any) {
    return this.http.post('tch/studentSign/getStudentSignByPage', params, ToolsUtil.getHttpOptions());
  }

  // 查询学习计划状态
  getStudyPlanStatus(id) {
    return this.http.get(`stu/studyPlan/getStudyPlanStatus/${id}`, {}, ToolsUtil.getHttpOptions());
  }
  // 存uuid
  saveSectionLearnUUID(params: any) {
    return this.http.postBody('pkg/courseSection/saveSectionLearnUUID', params, ToolsUtil.getHttpOptions());
  }
  // 更新最后用户时间
  updateLastUsedTime(id: string) {
    return this.http.get(`tch/orderDetail/updateLastUsedTime?id=${id}`, {}, ToolsUtil.getHttpOptions());
  }
  // 课包建设是否完整
  getIsUserd(id: string) {
    return this.http.get(`pkg/coursePacket/getIsUserd/${id}`, {}, ToolsUtil.getHttpOptions());
  }
  // 1个月的课时情况
  isClassTime(params) {
    return this.http.get(`tsk/v2/getMonthIs/isClassTime`, params, ToolsUtil.getHttpOptions());
  }
  // 1天的课时列表
  byDate(params) {
    return this.http.get(`tsk/v2/getClassTimes/byDate`, params, ToolsUtil.getHttpOptions());
  }
  // 学员未完成任务列表
  todoTask(params) {
    return this.http.get(`tsk/v2/todoTask`, params, ToolsUtil.getHttpOptions());
  }
  // 录播视频播放后，回调
  insertPlaybackRecord(params) {
    return this.http.postBody(`stu/studyTimeSection/insertPlaybackRecord`, params, ToolsUtil.getHttpOptions());
  }
  // 关卡列表
  cardList(params) {
    return this.http.get(`tsk/card/list`, params, ToolsUtil.getHttpOptions());
  }
  // 关卡奖励
  cardResources(params) {
    return this.http.get(`tsk/card/resources`, params, ToolsUtil.getHttpOptions());
  }
  // 考试相关详情
  testDetail(params) {
    return this.http.get(`${environment.questionBankApi}tkApi/seeai/sublibrary/exam/one`, params, ToolsUtil.getHttpOptions());
  }
  // 获取最新的已做题记录
  getExamedRecord(params) {
    return this.http.get(`${environment.questionBankApi}api/getExamedRecord`, params, ToolsUtil.getHttpOptions());
  }
  // 进入考试详情页
  getTikuParams(params) {
    return this.http.get(`tsk/card/getTikuParams`, params, ToolsUtil.getHttpOptions());
  }
  // 99实训列表数据
  student99trainLogList(params) {
    return this.http.get(`tsk/student99trainLog/list`, params, ToolsUtil.getHttpOptions());
  }
  // 进入99实训
  student99trainLogInto(params) {
    return this.http.get(`tsk/student99trainLog/into`, params, ToolsUtil.getHttpOptions());
  }
  // 统计报告个人-出勤数据
  findStudentAttendanceData(params) {
    return this.http.get(`bi/stu/study/report/findStudentAttendanceData`, params, ToolsUtil.getHttpOptions());
  }
  // 统计报告个人-阶段参考率和作业达标率
  getStudentTaskAndExamRate(params) {
    return this.http.get(`bi/stu/study/report/getStudentTaskAndExamRate`, params, ToolsUtil.getHttpOptions());
  }
  // 统计报告个人-战斗力和知识点掌握
  findStudentHistoryAndPoint(params) {
    return this.http.get(`bi/stu/study/report/findStudentHistoryAndPoint`, params, ToolsUtil.getHttpOptions());
  }
  // 查询排课时间
  selectLessonPlanStartTimeInfo(params) {
    return this.http.get(`bi/stu/study/report/selectLessonPlanStartTimeInfo`, params, ToolsUtil.getHttpOptions());
  }
  // 根据月份查询，排课开始到传的月份所有数据
  findStudentHistoryBattlePower(params) {
    return this.http.get(`bi/stu/study/report/findStudentHistoryBattlePower`, params, ToolsUtil.getHttpOptions());
  }

  // 【押题宝】学员进入首页检查押题宝领取状态
  adaptiveExamBetCheck(params) {
    return this.http.get(`smart/adaptiveExamBet/check`, params, ToolsUtil.getHttpOptions());
  }
  // 【押题宝】学员领取或打开押题宝
  adaptiveExamBetReceive(params) {
    return this.http.get(`smart/adaptiveExamBet/receive`, params, ToolsUtil.getHttpOptions());
  }
  // 【押题宝】学员进入押题卷
  adaptiveExamBetPaper(params) {
    return this.http.get(`smart/adaptiveExamBet/paper`, params, ToolsUtil.getHttpOptions());
  }
  // 【押题宝】学员知识点详细
  adaptiveExamBetKnowledgePointDetail(params) {
    return this.http.get(`smart/adaptiveExamBet/knowledgePointDetail`, params, ToolsUtil.getHttpOptions());
  }
  // 【押题宝】学员知识点详细
  adaptiveExamBetStudent(params) {
    return this.http.get(`smart/adaptiveExamBet/student`, params, ToolsUtil.getHttpOptions());
  }
  // 【押题宝】学员智适应个人统计
  personSmartInfo(params) {
    return this.http.get(`tsk/ytb/personInfo`, params, ToolsUtil.getHttpOptions());
  }
  // 查询准考证
  examInfoGet(params) {
    return this.http.get(`tsk/examInfo/get`, params, ToolsUtil.getHttpOptions());
  }
  // 保存准考证
  examInfoSave(params) {
    return this.http.postBody(`tsk/examInfo/save`, params, ToolsUtil.getHttpOptions());
  }
  // 地区
  areaList() {
    return this.http.get(`sys/area/list`, {}, ToolsUtil.getHttpOptions());
  }
  // 学期列表
  termList(params) {
    return this.http.get(`tsk/zk/termList`, params, ToolsUtil.getHttpOptions());
  }
  // 当前学期排课信息
  lessonPlanList(params) {
    return this.http.get(`tsk/zk/lessonPlanList`, params, ToolsUtil.getHttpOptions());
  }
  // 学习规划
  studyPlanning(params) {
    return this.http.get(`tsk/zk/studyPlan`, params, ToolsUtil.getHttpOptions());
  }
  // 查分链接
  examInfoScoreGet(params) {
    return this.http.get(`tsk/examInfoScore/get`, params, ToolsUtil.getHttpOptions());
  }
  // 查分链接
  examInfoScoreSave(params) {
    return this.http.postBody(`tsk/examInfoScore/save`, params, ToolsUtil.getHttpOptions());
  }

}
