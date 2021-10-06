import { environment } from '../../environments/environment';
import { HttpService } from 'core/services/http.service';
import { Injectable} from '@angular/core';
import { ToolsUtil } from 'core/utils/tools.util';
import { LocalStorageUtil } from 'core/utils/localstorage.util';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TikuService {

  constructor(private http: HttpService) {
  }

  getStage(id) {
    return this.http.get(`pkg/coursePacketConfig/getExamDayStage`, {id}, ToolsUtil.getHttpOptions());
  }

  getPaperUrl(uuid: string): string {
    const tkurlArr = environment.paperApi.split('/');
    const tkurl = `${tkurlArr[0]}//${tkurlArr[2]}`;
    return tkurl + '/p/' + uuid.substr(0, 1) + '/' + uuid + '.json';
  }

  getSubModule(id) {
    const url = 'pkg/coursePacketQuebank/list?coursePacketId=' + id;
    const options = ToolsUtil.getHttpOptions();
    return this.http.get(url, {}, options);
  }

  // 更新目标做题分数
  updateTheTargetScore(data) {
    const url = `stu/studyTimeSection/updateTimeSectionScore`;
    return this.http.postBody(url, data, ToolsUtil.getHttpOptions());
  }

// 更新阶段做题分数
  updateTheStageScore(data) {
    const url = `stu/studyTimeSection/updateTimeScore`;
    return this.http.postBody(url, data, ToolsUtil.getHttpOptions());
  }


  updateUuid(params) {
    return this.http.postBody(`pkg/courseSection/saveSectionLearnUUID`, params, ToolsUtil.getHttpOptions());
  }

  getPaperInfo(params) {
    return this.http.get(`smart/adaptiveLearning/generateAdaptiveExam`, params, ToolsUtil.getHttpOptions());
  }

  replyToTestPaperInformation(uuid) {
    return this.http.get(`smart/adaptiveLearning/getAdaptivePaperByUuid`, {uuid}, ToolsUtil.getHttpOptions());
  }

  getStatePass(id) {
    return this.http.get(`stu/studyTimeSection/getIsPassByStateId/${id}`, {}, ToolsUtil.getHttpOptions());
  }


  getAimsPass(id) {
    return this.http.get(`stu/studyTimeSection/getIsPassByTimeSectionId/${id}`, {}, ToolsUtil.getHttpOptions());
  }

  getKnowledgePointsDetail(pointCodes) {
    return this.http.get(`stu/studentKnowledge/selectExperienceValuesByPointCodes`, {pointCodes}, ToolsUtil.getHttpOptions());
  }

  submitPaper(params: any) {
    const url = `${environment.paperApi}api/submitPaper`;
    const options = {};
    return this.http.postBody(url, params, options, {'Content-Type': 'Multipart/form-data'});
  }

  //  录播目标闯关记录更新
  goalBreakthrough(params: { studyTimeSectionId: string, isPass: 0 | 1, passScore: number }) {
    return this.http.postBody(
      `stu/studyTimeSection/updateTimeSectionStatus`,
      params,
      ToolsUtil.getHttpOptions()
    );
  }

  //  录播阶段测验记录更新
  stageTest(params: { stageId: string, isPass: 0 | 1, passScore: number }) {
    return this.http.postBody(
      `stu/studyTimeSection/updateTimeStatus`,
      params,
      ToolsUtil.getHttpOptions()
    );
  }

  /** 获取最新的已做题记录 */
  getExamedRecord(uid: number, paperUuid: string, examId: string) {
    const url = `${environment.paperApi}api/getExamedRecord`;
    const options = {};
    return this.http.postBody(url, { uid, paperUuid, examId }, options, {'Content-Type': 'Multipart/form-data'});
  }

  /** 获取服务器缓存的做题记录(2天) */
  getMemExamedRecord(uid: number, paperUuid: string, examId: string) {
    const url = `${environment.paperApi}api/getMemExamedRecord`;
    const options = {};
    return this.http.postBody(url, { uid, paperUuid, examId }, options, {'Content-Type': 'Multipart/form-data'});
  }

  /** 获取历史的已做题记录 */
  getHistoryExamedRecord(uid: number, paperUuid: string, examId: string) {
    const url = `${environment.paperApi}api/getHistoryExamedRecord`;
    const options = {};
    return this.http.postBody(url, { uid, paperUuid, examId }, options, {'Content-Type': 'Multipart/form-data'});
  }

  getDetailsOfKnowledgePoints(code) {
    const url = 'res/knowledge-point/detailByCode/' + code;
    const options = ToolsUtil.getHttpOptions();
    return this.http.get(url, {}, options);
  }

  /** 获取科目, 用于分录题 */
  getAccountingCaterysTree() {
    // const cacheCaterys = LocalStorageUtil.getCaterysTree();
    // if (cacheCaterys) {
    //   return of({ code: 200, data: cacheCaterys });
    // }
    const options = ToolsUtil.getHttpOptions();
    return this.http.get(`${environment.questionBankGateway}tkApi/qkcPaper/getAccountingCaterysTree`, {}, options).pipe(
      map(res => {
        if (res.code === 200) {
          const orginalData = res.data || [];
          const caterys: any = {};
          orginalData.forEach(item => {
            item.accountingList.forEach(child => {
              caterys[child.code] = child;
            });
          });
          LocalStorageUtil.putCaterysTree(caterys);
          LocalStorageUtil.putOrginalCaterysTree(orginalData);
          console.log('获取题目字典成功');
          return { code: 200, data: caterys };
        } else {
          console.error('获取题目字典失败');
          return { code: 400, data: {}};
        }
      })
    );
  }

  /** 收藏习题 */
  collectExecrise(params: any) {
    const url = `${environment.paperApi}api/myCollection/saveOrUpdate`;
    const options = {};
    return this.http.postBody(url, params, options);
  }

  /** 取消收藏习题 */
  cancelCollectExecrise(params: any) {
    const url = `${environment.paperApi}api/myCollection/cancel`;
    const options = {};
    return this.http.get(url, params, options);
  }

  /** 获取多份试卷收藏的题目
   * @param uid 学生ID
   * @param paperUuids 试卷UUIDS，如:uuid1,uuid2,..
   */
  getCollectionByUidPids(uid: number, paperUuids: string) {
    const url = `${environment.paperApi}api/myCollection/findByUidPids`;
    const options = {};
    return this.http.postBody(url, { uid, paperUuids }, options, {'Content-Type': 'Multipart/form-data'});
  }

  /** 获取单份试卷收藏的题目
   * @param uid 学生ID
   * @param paperUuids 试卷UUID
   */
  getCollectionByUidPid(uid: number, paperUuid: string) {
    const url = `${environment.paperApi}api/myCollection/findByUidPid`;
    const options = {};
    return this.http.get(url, { uid, paperUuid }, options);
  }

  /** 获取多份试卷错误的题目
   * @param uid 学生ID
   * @param paperUuids 试卷UUIDS，如:uuid1,uuid2,..
   * @param examIds 考试IDS
   * @param isReturnDetail 是否返回错题明细（默认为是）：0为否，1为是;
   */
  getSublibraryPraticeErrorRedo(uid: number, paperUuids: string, examIds: string, isReturnDetail: number) {
    const url = `${environment.paperApi}api/sublibraryPraticeErrorRedo`;
    const options = {};
    let params = {};
    // if (examIds) {
    //   params = { uid, paperUuids, examIds };
    // } else {
    //   params = { uid, paperUuids };
    // }
    params = { uid, paperUuids, examIds, isReturnDetail };
    return this.http.postBody(url, params, options, {'Content-Type': 'Multipart/form-data'});
  }

  getErrorExecrise(uid: number, paperUuids: string, examIds?: string) {
    const url = `${environment.paperApi}api/praticeErrorRedo`;
    const options = {};
    let params = {};
    if (examIds) {
      params = { uid, paperUuids, examIds };
    } else {
      params = { uid, paperUuids };
    }
    return this.http.postBody(url, params, options, {'Content-Type': 'Multipart/form-data'});
  }

  listCoursePacketQuebank(coursePacketId: string, busType: string = '1') {
    const url = 'pkg/coursePacketQuebank/list';
    const options = ToolsUtil.getHttpOptions();
    return this.http.get(url, { coursePacketId, busType }, options);
  }

  practice(userId: number, sublibraryModuleId: string, courseCode: string) {
    const url = `${environment.questionBankApi}tkApi/seeai/sublibrary/practice`;
    const options = {};
    return this.http.get(url, { userId, sublibraryModuleId, courseCode }, options);
  }

  complianceRate(jsonParam: any) {
    const url = `${environment.paperApi}api/complianceRate`;
    const options = {};
    return this.http.postBody(url, jsonParam, options);
  }

  getPaperStatisticInfo(uid: number, paperUuids: string) {
    const url = `${environment.paperApi}api/getPaperStatisticInfo`;
    const options = {};
    return this.http.postBody(url, { uid, paperUuids }, options, {'Content-Type': 'Multipart/form-data'});
  }

  sublibraryComplianceRate(jsonParam: any) {
    const url = `${environment.paperApi}api/sublibraryComplianceRate`;
    const options = {};
    return this.http.postBody(url, jsonParam, options);
  }

  getSubPaperStatisticInfo(uid: number, paperUuids: string, sublibraryId: number) {
    const url = `${environment.paperApi}api/getSubPaperStatisticInfo`;
    const options = {};
    return this.http.postBody(url, { uid, paperUuids, sublibraryId}, options, {'Content-Type': 'Multipart/form-data'});
  }

  getCollectionByUidSectionIds(uid: number, sectionIds: string) {
    const url = `${environment.paperApi}api/myCollection/findByUidSectionIds`;
    const options = {};
    return this.http.postBody(url, { uid, sectionIds }, options, {'Content-Type': 'Multipart/form-data'});
  }

  getExamRecordByPage(pid: number, uid: number, typeId: number, subModules: string, pageSize: number, curPage: number) {
    const url = `${environment.paperApi}api/getExamRecordByPage`;
    const options = {};
    return this.http.postBody(url, { pid, uid, typeId, subModules, pageSize, curPage }, options, {'Content-Type': 'Multipart/form-data'});
  }

  getChapterSectionByPaperUuid(paperUuids: string[]) {
    const url = `${environment.questionBankApi}/tkApi/seeai/sublibrary/paperUuid`;
    const options = {};
    return this.http.postBody(url, paperUuids, options);
  }

  getCourseChapter(courseCode: string) {
    const url = `${environment.questionBankApi}/tkApi/seeai/sublibrary/courseChapter`;
    const options = {};
    return this.http.get(url, { courseCode }, options);
  }

  getExam(userId: number, sublibraryModuleId: string) {
    const url = `${environment.questionBankApi}/tkApi/seeai/sublibrary/exam`;
    const options = {};
    return this.http.get(url, { userId, sublibraryModuleId }, options);
  }

  getExamErrorRedo(pid: number, uid: number, typeId: number, subModules: string, pageSize: number, curPage: number) {
    const url = `${environment.paperApi}api/examErrorRedo`;
    const options = {};
    return this.http.postBody(url, { pid, uid, typeId, subModules, pageSize, curPage }, options, {'Content-Type': 'Multipart/form-data'});
  }

  updateExamStatus(userId: number, examId: string) {
    const url = `${environment.questionBankApi}/tkApi/seeai/sublibrary/updateExamStatus`;
    const options = {};
    return this.http.get(url, { userId, examId }, options);
  }

}
