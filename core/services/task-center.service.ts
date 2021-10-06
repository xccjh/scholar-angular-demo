import { Injectable } from '@angular/core';
import {HttpService} from './http.service';
import {ToolsUtil} from '../utils/tools.util';
import {ServicesModule} from '@app/service/service.module';


@Injectable({
  providedIn: ServicesModule
})
export class TaskCenterService {

  constructor(private http: HttpService) { }

  /**
   * 获取学生任务
   * @param params 根据任务不同传入对应的参数
   * classId 班级id
   * 参数： taskForm-任务形式：课堂(0)、预习(1)、复习(2)
   * teachCourseSectionId-教学课程节id',
   */
  getStudentTaskList(params: {classId?: string, lessonTimeId?: string, taskForm?: any}) {
    return this.http.post('tsk/studentTask/list', { ...params, page: 1, limit: 1000 }, ToolsUtil.getHttpOptions());
  }

  // 资料任务
  getZLTask(courseTimeId) {
    return this.http.post('tsk/studentTask/zlList', {courseTimeId}, ToolsUtil.getHttpOptions());
  }


  // 获取课次状态
  getLessonTime(id) {
    return this.http.post('tch/lessonTime/get', {id}, ToolsUtil.getHttpOptions());
  }

  /**
   * 开始答题
   * @param taskId 任务id
   */
  startAnswer(taskId: string) {
    return this.http.post('tsk/courseTask/startAnswer', { taskId }, ToolsUtil.getHttpOptions());
  }

  /**
   * 答题
   */
  submitQuestion(params: any) {
    return this.http.postBody('tsk/courseTask/submitQuestion', params, ToolsUtil.getHttpOptions());
  }

  /**
   * 交卷
   * @param taskId 任务id
   * @param id id
   */
  finishTask(taskId: string, id: string) {
    return this.http.post('tsk/courseTask/finishTask', { taskId, id }, ToolsUtil.getHttpOptions());
  }

  /**
   * 获取用户答案
   * @param taskId 任务id
   */
  getStuExamAnswerUrl(taskId: string) {
    return this.http.post('tsk/courseTask/getStuExamAnswerUrl', { taskId }, ToolsUtil.getHttpOptions());
  }

  /**
   * 加载阅读任务or加载案例任务
   * @param id id
   */
  getStutaskDetail(id: string) {
    return this.http.post('tsk/studentTask/getStutaskDetail', { id }, ToolsUtil.getHttpOptions());
  }

  // 获取实训进度条
  getTrainStatistics(id: string) {
    return this.http.post('tsk/studentTask/trainStatistics', { id }, ToolsUtil.getHttpOptions());
  }

  // 查看资料详情
  resourceDetail(id: string) {
    return this.http.post('res/resource/resourceDetail', { id }, ToolsUtil.getHttpOptions());
  }

  /**
   * 开始阅读任务
   * @param taskId 任务id
   */
  startReadingTask(taskId: string) {
    return this.http.post('tsk/courseTask/startReadingTask', { taskId }, ToolsUtil.getHttpOptions());
  }


  /**
   * 查看所有用户发言
   * @param id 主键id
   */
  getAllSpeak(id: string) {
    return this.http.post('tsk/studentTask/getAllSpeak', { id }, ToolsUtil.getHttpOptions());
  }

  /**
   *
   * @param params
   * studentGroupId '学生组id',
   *  classId  '班级id',
   *  courseTaskId 课程任务id',
   *  content '发言内容',
   *  resourceId  '资源学生id'
   *  isLeader:是否是组长,
   *  speakType:案例任务属性-发言模式：默认(0)、个人模式(1)、小组模式(2)、组长模式(3)
   *  speakwallAttachment :[{
   *    attachmentName '附件名称',
   *    attachmentPath '附件路径',
   *    attachmentExt  '扩展名',
   *    attachmentType '附件类型：预留字段，有需要再使用'
   *  },{
   *    attachmentName '附件名称',
   *    attachmentPath '附件路径',
   *    attachmentExt  '扩展名',
   *    attachmentType '附件类型：预留字段，有需要再使用'
   *    }]
   */
  saveStuSpeakwall(params: any) {
    return this.http.postBody2('tsk/studentOperate/saveStuSpeakwall', params, ToolsUtil.getHttpOptions());
  }

  previewCourseTask(taskId: string, id: string) {
    return this.http.post('tsk/courseTask/preview', {taskId, id}, ToolsUtil.getHttpOptions());
  }

  getResource(url: string) {
    return this.http.get(url, {}, {});
  }

  previewTestTask(taskId: string, id: string, stuId: string) {
    return this.http.get('tsk/courseTask/preview', {taskId, id, stuId}, ToolsUtil.getHttpOptions());
  }

  /**
   * 修改学生任务
   */
  updateStudentTask(params: any) {
    return this.http.postBody('tsk/courseTask/updateStudentTask', params, ToolsUtil.getHttpOptions());
  }
}
