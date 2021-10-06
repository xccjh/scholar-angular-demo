import {Json} from 'core/base/common';
import {ToolsUtil} from './tools.util';
import {codeJsonAES} from './crypto';

export class LocalStorageUtil {
  // 设置管理员信息
  static putAdminUser(userInfo: Json): void {
    localStorage.removeItem('SCHOLAR_ADMIN_INFO_' + ToolsUtil.getOrgCode());
    if (userInfo) {
      localStorage.setItem('SCHOLAR_ADMIN_INFO_' + ToolsUtil.getOrgCode(), JSON.stringify(codeJsonAES(userInfo)));
    }
    // console.log(ToolsUtil.getOrgCode())
  }

  // 因从订单中获取渠道，所以不能用渠道拼接命名（存在因果关系）
  static setClassMarketData(value: Json) {
    const key = 'MarketData';
    localStorage.setItem(key, JSON.stringify(value));
  }


  static setMilestones(Milestones: Json) {
    if (Milestones) {
      const key = ToolsUtil.createCacheKey('Milestones');
      localStorage.setItem(key, JSON.stringify(Milestones));
    }
  }

  static getMilestones() {
    let Milestones: Json = {};
    const obj = localStorage.getItem(ToolsUtil.createCacheKey('Milestones'));
    if (obj) {
      Milestones = JSON.parse(obj);
    }
    return Milestones;
  }



  static getAdminUser(): any {
    const str = localStorage.getItem('SCHOLAR_ADMIN_INFO_' + ToolsUtil.getOrgCode());
    let userInfo: Json = null;
    if (str) {
      userInfo = codeJsonAES(JSON.parse(str), 'decode');
    }
    if (userInfo) {
      return userInfo;
    } else {
      return {};
    }
  }

  static getClassMarketData(): any {
    const key = 'MarketData';
    const valueStr = localStorage.getItem(key);
    let valueJson: Json = null;
    if (valueStr) {
      valueJson = JSON.parse(valueStr);
    }
    return valueJson;
  }

  static putCollegeLib(info: Json): void {
    localStorage.removeItem('SCHOLAR_CollegeLib_' + ToolsUtil.getOrgCode());
    if (info) {
      localStorage.setItem('SCHOLAR_CollegeLib_' + ToolsUtil.getOrgCode(), JSON.stringify(info));
    }
  }

  static getCollegeLib(): any {
    const str = localStorage.getItem('SCHOLAR_CollegeLib_' + ToolsUtil.getOrgCode());
    let info: Json = null;
    if (str) {
      info = JSON.parse(str);
    }
    if (info) {
      return info;
    } else {
      return {};
    }
  }

  static putSavePath(info: Json): void {
    localStorage.removeItem('SCHOLAR_SAVE_PATH' + ToolsUtil.getOrgCode());
    if (info) {
      localStorage.setItem('SCHOLAR_SAVE_PATH' + ToolsUtil.getOrgCode(), JSON.stringify(info));
    }
  }

  static getSavePath(): any {
    const str = localStorage.getItem('SCHOLAR_SAVE_PATH' + ToolsUtil.getOrgCode());
    let info: Json = null;
    if (str) {
      info = JSON.parse(str);
    }
    if (info) {
      return info;
    } else {
      return {};
    }
  }

  static putBaseParams(baseParams: Json): void {
    const key = ToolsUtil.createCacheKey('BaseParams_');
    if (baseParams) {
      localStorage.setItem(key, JSON.stringify(baseParams));
    }
  }

  static getBaseParams() {
    const key = ToolsUtil.createCacheKey('BaseParams_');
    const str = localStorage.getItem(key);
    let baseParams: Json = null;
    if (str) {
      baseParams = JSON.parse(str);
    }
    return baseParams;
  }

  static removeBaseParams() {
    const key = ToolsUtil.createCacheKey('BaseParams_');
    localStorage.removeItem(key);
  }

  static getDefaultTask(): string {
    const key = ToolsUtil.createCacheKey('TASK_ID');
    const taskId = localStorage.getItem(key);
    return taskId ? taskId : '';
  }

  static setDefaultTask(taskId: string): void {
    const key = ToolsUtil.createCacheKey('TASK_ID');
    localStorage.setItem(key, taskId);
  }

  static removeDefaultTask(): void {
    const key = ToolsUtil.createCacheKey('TASK_ID');
    localStorage.removeItem(key);
  }

  static putAnswersInfo(answersInfo: Json): void {
    if (answersInfo) {
      const key = ToolsUtil.createCacheKey('ANSWERS_INFO');
      localStorage.setItem(key, JSON.stringify(answersInfo));
    }
  }

  static getAnswersInfo(): any {
    const key = ToolsUtil.createCacheKey('ANSWERS_INFO');
    const str = localStorage.getItem(key);
    let userInfo: Json = null;
    if (str) {
      userInfo = JSON.parse(str);
    }
    if (userInfo) {
      return userInfo;
    } else {
      return {};
    }
  }

  static removeAnswersInfo() {
    const key = ToolsUtil.createCacheKey('ANSWERS_INFO');
    localStorage.removeItem(key);
  }

  static getCaterysTree() {
    let caterysTree = null;
    const key = ToolsUtil.createCacheKey('caterysTree');
    const str = localStorage.getItem(key);
    if (str) {
      caterysTree = JSON.parse(str);
    }
    if (caterysTree && caterysTree != null) {
      return caterysTree;
    }
    return null;
  }

  static putCaterysTree(caterysTree) {
    const key = ToolsUtil.createCacheKey('caterysTree');
    localStorage.setItem(key, JSON.stringify(caterysTree));
  }

  static removeCaterysTree() {
    const key = ToolsUtil.createCacheKey('caterysTree');
    localStorage.removeItem(key);
  }

  static getBackUrl(): string {
    const key = ToolsUtil.createCacheKey('BACK_URL');
    const url = localStorage.getItem(key);
    return url;
  }

  static setBackUrl(url: string): void {
    const key = ToolsUtil.createCacheKey('BACK_URL');
    localStorage.setItem(key, url);
  }

  static removeBackUrl(): void {
    const key = ToolsUtil.createCacheKey('BACK_URL');
    localStorage.removeItem(key);
  }

  /**
   * 训练/答题数据传递
   * @param courseCode 课程编码
   * @param data 习题/知识点等实体数组
   */
  static setExerciseKey(courseCode: string, data: Array<unknown>, paperUuid: string, tpaperId: string): void {
    const key = ToolsUtil.createCacheKey('ExerciseKeyData_');
    localStorage.setItem(
      key,
      JSON.stringify({
        courseCode,
        data: data ? data : [],
        paperUuid,
        tpaperId
      })
    );
  }

  static getExerciseKey() {
    const key = ToolsUtil.createCacheKey('ExerciseKeyData_');
    const valueStr = localStorage.getItem(key);
    return valueStr;
  }

  static removeExerciseKey() {
    const key = ToolsUtil.createCacheKey('ExerciseKeyData_');
    localStorage.removeItem(key);
  }

  static putUser(userInfo: Json): void {
    localStorage.removeItem('SCHOLAR_USER_INFO_' + ToolsUtil.getOrgCode());
    if (userInfo) {
      localStorage.setItem('SCHOLAR_USER_INFO_' + ToolsUtil.getOrgCode(), JSON.stringify(codeJsonAES(userInfo)));
    }
  }

  static putLogin(loginInfo: Json): void {
    localStorage.removeItem('SCHOLAR_USER_INFO_L_' + ToolsUtil.getOrgCode());
    if (loginInfo) {
      localStorage.setItem('SCHOLAR_USER_INFO_L_' + ToolsUtil.getOrgCode(), JSON.stringify(codeJsonAES(loginInfo)));
    }
  }

  static removeLogin() {
    localStorage.removeItem('SCHOLAR_USER_INFO_L_' + ToolsUtil.getOrgCode());
  }


  static getLogin(): any {
    const str = localStorage.getItem('SCHOLAR_USER_INFO_L_' + ToolsUtil.getOrgCode());
    let loginInfo: Json = null;
    if (str) {
      loginInfo = codeJsonAES(JSON.parse(str), 'decode');
    }
    if (loginInfo) {
      return loginInfo;
    } else {
      return {};
    }
  }

  static putOrgCode(): void {
    localStorage.setItem('SCHOLAR_ORGCODE_' + ToolsUtil.getOrgCode(), ToolsUtil.getOrgCode());
  }

  static getOrgcode(): string {
    return localStorage.getItem('SCHOLAR_ORGCODE_' + ToolsUtil.getOrgCode());
  }

  static removeOrgcode() {
    localStorage.removeItem('SCHOLAR_ORGCODE_' + ToolsUtil.getOrgCode());
  }


  static putCodeUid(codeUid: string): void {
    localStorage.setItem('SCHOLAR_CODEUID_' + ToolsUtil.getOrgCode(), codeUid);
  }

  static getCodeUid(): string {
    return localStorage.getItem('SCHOLAR_CODEUID_' + ToolsUtil.getOrgCode());
  }

  static removeCodeUid() {
    localStorage.removeItem('SCHOLAR_CODEUID_' + ToolsUtil.getOrgCode());
  }

  static getUser(): any {
    const str = localStorage.getItem('SCHOLAR_USER_INFO_' + ToolsUtil.getOrgCode());
    let userInfo: Json = null;
    if (str) {
      userInfo = codeJsonAES(JSON.parse(str), 'decode');
    }
    if (userInfo) {
      return userInfo;
    } else {
      return {};
    }

  }

  static putTkToken(TkToken: Json): void {
    localStorage.removeItem('SCHOLAR_TkToken_' + ToolsUtil.getOrgCode());
    if (TkToken) {
      localStorage.setItem('SCHOLAR_TkToken_' + ToolsUtil.getOrgCode(), JSON.stringify(codeJsonAES(TkToken)));
    }
  }

  static getTkToken(): any {
    const str = localStorage.getItem('SCHOLAR_TkToken_' + ToolsUtil.getOrgCode());
    let TkToken: Json = null;
    if (str) {
      TkToken = codeJsonAES(JSON.parse(str), 'decode');
    }
    if (TkToken) {
      return TkToken;
    } else {
      return {};
    }
  }

  static removeTkToken(): void {
    localStorage.removeItem('SCHOLAR_TkToken_' + ToolsUtil.getOrgCode());
  }

  static getUserToken(): string {
    const userInfo: Json = this.getUser();
    if (userInfo && userInfo.token) {
      return userInfo.token;
    } else {
      return '';
    }
  }

  static getUserId(): string {
    const userInfo: Json = this.getUser();
    if (userInfo && userInfo.id) {
      return userInfo.id;
    } else {
      return '';
    }
  }

  static removeUser() {
    localStorage.removeItem('SCHOLAR_USER_INFO_' + ToolsUtil.getOrgCode());
  }

  static putOrgInfo(orgInfo: Json): void {
    localStorage.removeItem('SCHOLAR_ORG_INFO_' + ToolsUtil.getOrgCode());
    if (orgInfo) {
      localStorage.setItem('SCHOLAR_ORG_INFO_' + ToolsUtil.getOrgCode(), JSON.stringify(codeJsonAES(orgInfo)));
    }
  }

  static getOrgInfo(): any {
    const str = localStorage.getItem('SCHOLAR_ORG_INFO_' + ToolsUtil.getOrgCode());
    let orgInfo: Json = null;
    if (str) {
      orgInfo = codeJsonAES(JSON.parse(str), 'decode');
    }
    if (orgInfo) {
      return orgInfo;
    } else {
      return {};
    }
  }

  static removeOrgInfo(): any {
    localStorage.removeItem('SCHOLAR_ORG_INFO_' + ToolsUtil.getOrgCode());
  }

  static removeSchoolName(): void {
    localStorage.removeItem('SCHOLAR_SCHOO_NAME_' + ToolsUtil.getOrgCode());
  }

  static putSchoolName(name: string): void {
    localStorage.setItem('SCHOLAR_SCHOO_NAME_' + ToolsUtil.getOrgCode(), name);
  }

  static getSchoolName(): string {
    const str = localStorage.getItem('SCHOLAR_SCHOO_NAME_' + ToolsUtil.getOrgCode());
    return str;
  }


  static removePracSubquestionbank(): void {
    localStorage.removeItem('SELECTD_PRAC_SUBQUESTIONBANK_' + ToolsUtil.getOrgCode());
  }

  static putPracSubquestionbank(name: string): void {
    localStorage.setItem('SELECTD_PRAC_SUBQUESTIONBANK_' + ToolsUtil.getOrgCode(), name);
  }

  static getPracSubquestionbank(): string {
    const str = localStorage.getItem('SELECTD_PRAC_SUBQUESTIONBANK_' + ToolsUtil.getOrgCode());
    return str;
  }

  static removeExamSubquestionbank(): void {
    localStorage.removeItem('SELECTD_EXAM_SUBQUESTIONBANK_' + ToolsUtil.getOrgCode());
  }

  static putExamSubquestionbank(name: string): void {
    localStorage.setItem('SELECTD_EXAM_SUBQUESTIONBANK_' + ToolsUtil.getOrgCode(), name);
  }

  static getExamSubquestionbank(): string {
    const str = localStorage.getItem('SELECTD_EXAM_SUBQUESTIONBANK_' + ToolsUtil.getOrgCode());
    return str;
  }

  static getSelectedCourse() {
    const key = ToolsUtil.createCacheKey('SelectedCourse_');
    const valueStr = localStorage.getItem(key);
    let valueJson: any = {coursePacketId: ''};
    if (valueStr) {
      valueJson = JSON.parse(valueStr);
    }
    return valueJson;
  }

  static setSelectedCourse(value: Json) {
    const key = ToolsUtil.createCacheKey('SelectedCourse_');
    const valueStr = localStorage.setItem(key, JSON.stringify(value));
  }


  static getMarkQuestionRecording() {
    let questionRecording: Json = {};
    const obj = localStorage.getItem(ToolsUtil.createCacheKey('QUESTION_RECORDING'));
    if (obj) {
      questionRecording = JSON.parse(obj);
    }
    return questionRecording;
  }

  static putMarkQuestionRecording(QuestionRecording: Json) {
    if (QuestionRecording) {
      const key = ToolsUtil.createCacheKey('QUESTION_RECORDING');
      localStorage.setItem(key, JSON.stringify(QuestionRecording));
    }
  }


  static clearMarkQuestionRecording() {
    localStorage.removeItem(ToolsUtil.createCacheKey('QUESTION_RECORDING'));
  }


  static putQuestionInit(QuestionRecording) {
    localStorage.setItem(ToolsUtil.createCacheKey('QUESTION_INIT'), QuestionRecording);
  }

  static getQuestionInit() {
    return localStorage.getItem(ToolsUtil.createCacheKey('QUESTION_INIT'));
  }

  static removeQuestionInit() {
    localStorage.removeItem(ToolsUtil.createCacheKey('QUESTION_INIT'));
  }

  static putPaperTotal(paper) {
    localStorage.setItem(ToolsUtil.createCacheKey('QUESTION_TOTAL'), JSON.stringify(paper));
  }

  static getPaperTotal() {
    const obj = localStorage.getItem(ToolsUtil.createCacheKey('QUESTION_TOTAL'));
    if (obj) {
      return JSON.parse(obj);
    } else {
      return {};
    }
  }

  static removePaperTotal() {
    localStorage.removeItem(ToolsUtil.createCacheKey('QUESTION_TOTAL'));
  }

  static putAnswers(answers) {
    if (answers) {
      const key = ToolsUtil.createCacheKey('answers');
      localStorage.setItem(key, JSON.stringify(answers));
    }
  }

  static getAnswers() {
    let answers: Json = {};
    const obj = localStorage.getItem(ToolsUtil.createCacheKey('answers'));
    if (obj) {
      answers = JSON.parse(obj);
    }
    return answers;
  }

  static putOrginalCaterysTree(caterysTree) {
    const key = ToolsUtil.createCacheKey('original_caterysTree');
    localStorage.setItem(key, JSON.stringify(caterysTree));
  }

  static getOrginalCaterysTree() {
    let caterysTree = null;
    const key = ToolsUtil.createCacheKey('original_caterysTree');
    const str = localStorage.getItem(key);
    if (str) {
      caterysTree = JSON.parse(str);
    }
    if (caterysTree && caterysTree != null) {
      return caterysTree;
    }
    return null;
  }

  static clearAll(): void {
    LocalStorageUtil.removeTkToken();
    LocalStorageUtil.removeUser();
    LocalStorageUtil.removeLogin();
    LocalStorageUtil.removeBackUrl();
    LocalStorageUtil.removeExerciseKey();
    LocalStorageUtil.removeCaterysTree();
    LocalStorageUtil.removeAnswersInfo();
    LocalStorageUtil.removeBaseParams();
    LocalStorageUtil.removeDefaultTask();
    LocalStorageUtil.removeOrgcode();
    LocalStorageUtil.removePracSubquestionbank();
    LocalStorageUtil.removeExamSubquestionbank();
    LocalStorageUtil.removeCodeUid();
  }

}
