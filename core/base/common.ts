import {TemplateRef} from '@angular/core';
import {NzSafeAny} from 'ng-zorro-antd/core/types';
import {StyleObjectLike} from 'ng-zorro-antd/modal/modal-types';
import {NzUploadXHRArgs} from 'ng-zorro-antd';

export declare interface Json extends Object {
  [key: string]: any;
}

export declare interface HttpOptions {
  headers?: {};
  isJsonEncode?: boolean;
  isUrlEncode?: boolean;
  isAutoShowMessage?: boolean;
  isWithCredentials?: boolean;
  isCommonHttpHeader?: boolean;
  isBody?: boolean;
}

export declare interface ServerPaginationStandard {
  currentPage: number;
  showCount: number;
  totalResult: number;
  totalPage?: number;
}

export declare interface HttpResponseDataStandard {
  state: number; // 为1才是成功
  data: Json | [{}] | object | string | any; // 没有值 data: ''
  mess: string; // 返回的消息
  page?: ServerPaginationStandard;
}

export declare interface CallItem {
  name: string;
  sublibraryModuleIdList: Json[];
  id: string;
  paperUuid: string;
  year: string; // 试卷年份
  number: number; // 题量
  score: number;
  paperId: string;
  groupWay: 1 | 2 | 3;    // 1: '选题组卷/录题组卷' 2: '题型难度随机组卷 '3: '知识点难度抽题组卷'
  type: 1 | 2 | 3 | 4; // 1: '真题';2: '模拟';3: '原创';4: '测试卷';
}

export declare interface WjCallItem {
  majorId: string;
  name: string;
  evaluateId: '1' | '2'; // '1': '总部测评' '2': '校区测评';
  majorName: string;
  questionNumber: number;
  status: 1 | 2 | 3 | 4; // 1:'未发布';   2: '已发布';   3: '已过期';   4: '未完成';
  paperUuid: string;
  id: string;
  paperId: string;

}

export declare interface PacketInfoOrigin {
  id: string; // 课包id
  name: string; // 课包名称
  teachType: string; // 课包类型
  createrId: string;
  professionId: string; // 专业id
  majorId: string; // 专业id
  code: string; // 课程编码
  courseCode: string; // 课程编码
  isSmart: string; // '0' | '1'
  isUsed: '0' | '1' | '2'; // '0' | '1' | '2' // 启用
  preview: any; // '0' | '1'
  isCard: string | boolean; // '0' | '1'// 开启闯关
  is99Train: string | boolean; // '0' | '1' //  开启99实训
  isHqTrain: string | boolean; // '0' | '1' //  开启99实训
  isBet: string | boolean; // '0' | '1' //  开启押题宝
  status: string; // '0' | '1'
  auditStatus: string; // '0' | '1' | '2' | '3' | '99';
  lessonCount: string; // 课次
  courseId: string;
  curProgress: string; // 当前进度
  innerCurProgress: string; // 当前进度
  pcode: string; // 课包编码
  majorLeaderId: string; // 专业负责人id
  knowledgeSubjectId: string; // 知识点id
  exerciseType: '0' | '1'; // 可重做模式
  isKjlTrain: '0' | '1';
  isYyTrain: '0' | '1';
}

export type PacketInfo = Partial<PacketInfoOrigin>;

export declare interface ConfirmableDescription {
  title: string;
  content: string;
  type: TYPE;
  replaceXxxField?: string;
  condition?: () => boolean;
  conditionField?: string | number;
  conditionResult?: string | number;
  conditionTitleReplace?: string;
  conditionContentReplace?: string;
}


export type TYPE = 'info' | 'warning' | 'success' | 'error' | 'confirm' | 'create';

export type FUNC_R<F, T> = (F, NzModalRef) => T;

export declare interface ConfirmableFlatDescription {
  title: FUNC_R<any[], string> | string;
  content: FUNC_R<any[], string> | FUNC_R<any[], TemplateRef<NzSafeAny>> | string;
  type?: FUNC_R<any[], string> | TYPE;
  nzComponentParams?: FUNC_R<any[], Partial<NzSafeAny>>;
  nzBodyStyle?: StyleObjectLike;
  nzWrapClassName?: string;
  nzOkText?: string;
  nzCancelText?: string;
  nzOnCancel?: () => boolean | Promise<boolean> | null;
}

export declare interface LoadingControl {
  loading: boolean;
}

export type OptsKey = 'key';
export type OptsItem = Record<OptsKey, string>;

export declare interface ChildrenContainItem extends OptsItem {
  children: OptsItem[];
}

export declare interface PackInfoItem {
  name?: string;
  teachType?: '11' | '12' | '21' | '22';
  exerciseType?: '1' | '2'; // 做题模式
  id?: string;
  selectdCourse?: string;
  courseSubjectTypeId?: string;
  courseId?: string;
  status?: string;
  isUsed?: '1' | '0';
  opts?: ChildrenContainItem[];
  nickName?: string;
}

export declare interface CourseItem {
  courseId: string;
  id: string;
  name: string;
  code: string;
  majorId: string;
}

// export declare interface HttpOptions {
//     columnHeaders?: Array<StandardTableColumnsHeader | TableColumnsHeader>,
//     pageConfig?: PaginationConfig,
//     page?: ParamsPage,
//     headers?: {},
//     isJsonEncode?: boolean
//     isUrlEncode?: boolean
//     isAutoShowMessage?: boolean
//     isWithCredentials?: boolean
//   }

export declare interface HttpRseponseTransformCell {
  [key: string]: Json;
}

export declare interface HttpOptions {
  headers?: {};
  isJsonEncode?: boolean;
  isUrlEncode?: boolean;
  isAutoShowMessage?: boolean;
  isWithCredentials?: boolean;
  isCommonHttpHeader?: boolean;
  isStudyHttpHeader?: boolean;
  isBody?: boolean;
}

export declare interface Handout {
  attachmentName: string;
  attachmentPath: string;
  aattachmentExt: string;
  isMainFile: boolean | '0' | '1';
  isDownloadType: boolean;
  downloadType: '0' | '1';  // 0 :不可以 1 可以
  createTime: number;
  seq: number;
  title: string;
  type: '101' | '102' | '103' | '104';
  resourceId: string;
  paperId: string;
  sourceType: '1' | '2';
  authorName: string;
  authorUnit: string;
  courseSectionId: string;
  courseChapterId: string;
  courseId: string;
  coursePacketId: string;
  learningGoalCode: string;
  id: string;
  name: string;
  taskForm: string;
  quebankId: string;
  gradeType: '1' | '2'; // 1:学生自评 ; 2:老师批改
  isGrade: '' | '0' | '1'; // 0 :不评分| 1 需评分
  taskType: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7';
  // 任务类型：阅读任务(0)、案例任务(1)、作业任务(2)、实训任务(3)、考试任务(4)、实战任务(5)、问卷(6)、测评(7)
}

export type HandoutItem = Partial<Handout>;

export declare interface Teacher {
  value: string;
  id: string;
  name: string;
}

export enum UserAction {
  ADD,
  EDIT,
  DEL,
  QUERY,
  SUPPERADD
}

export declare interface AtrFormOpt {
  type: 'add' | 'edit';
  layout?: 'full' | '1l2c' | '1l1c';
  items: AtrFormDetail[]; // 表单项目
}

export declare interface AtrFormDetail {
  label: string;
  type: 'text' | 'image' | 'select' | 'date' | 'number' | 'telphone' | 'password' | 'checkbox' | 'editor' | 'textarea' | 'dateTime';
  key: string;
  isHidden?: boolean;
  defaultValue?: any;
  value?: any; // 编辑下原始数值
  dictCode?: string; // select 模式下配置
  span?: number; // 显示宽度
  validators?: AtrFormValid[]; // 验证条件
  isRequired?: boolean; // 隐性条件 无需填写
  placeholder?: string;
  imageOpts?: ImageOpts;
  editContent?: string;
  height?: number; // editor有效
  disable?: boolean;
  lspan?: number;
  cspan?: number;
  rows?: number; // textarea 显示行数

}

export declare interface AtrFormValid {
  type: 'required' | 'email' | 'telphone' | 'maxlength' | 'minlength' | 'pattern';
  errorLabel: string;
  maxlength?: number;
  minlength?: number;
  patternValue?: string;
}

export declare interface AtrQueyrOpt {
  actions?: TableAction[];
  isIndex?: boolean; // 是否显示序号
  isShowCheckbox?: boolean;
  showNum?: number;
  url: string;
  sort?: string;
  headers: AtrQueryHeader[];
  tables: Table[];
  isAutoQuery?: boolean; // true时候默认触发查询
}

export declare interface Table {
  name: string; // 表头名称
  key?: string; // 实际数据字段
  sortKey?: string; // 是否排序
  sortable?: boolean;
  type: 'text' | 'link' | 'action' | 'image' | 'date' | 'dateTime'; // 类型： 文字、链接、操作
  isShow?: boolean;
  width?: string; // 150px
  actions?: TableAction[];
}

export declare interface AtrQueryHeader {
  name: string;
  type: 'text' | 'number' | 'checkbox' | 'select' | 'datepicker' | 'selectCus' | 'dateRange';
  key: string;
  isShow?: boolean;
  placeholder?: string;
  span?: number;
  dictCode?: string; // 字典编码
  dictList?: CusDict[];
}

export declare interface TableAction {
  name: string;
  code: string;
  data?: any;
  datas?: any[];
  numberOfChecked?: number;
  type?: 'rows' | 'row';
  operator?: string; // 显示操作符
}

export declare interface Dict {
  id: string;
  typeName: string;

}

export declare interface DictGroup {
  groupCode: string;
  dicts: Dict[];
}

export declare interface CusDict {
  label: string;
  value: string;
}

export declare interface ImageOpts {
  limit?: number;
  uploadDir: string;
  removeAction?: string;
  imageList?: any[];
  key?: string;

}

export declare interface CusNotification {
  type: string; // 表示类型，事务
  data?: any;

  [key: string]: string;
}


export declare interface Pagination {
  currentPage: number;
  totalPage?: number;
  totalResult?: number;
  pageSize?: number;
}

export interface NzUploadXHRArgsExtend extends NzUploadXHRArgs {
  percentReport: (percent: any) => void;
}


export interface AnyJson {
  [key: string]: any;
}

export interface CommonStructure {
  status: number;
  message: string;
}

export interface CommonData<T> extends CommonStructure {
  data: T[];
}

export interface CommonPagination<T> extends CommonData<T> {
  page: { totalPage: number, totalResult: number };
}

export interface CommonOption {
  id: string;
  name: string;
}


export interface CourseListDataType {
  id: string;
  code: string;
  name: string;
  gbCode: string;
  courseTypeName: string;
  majorNames: string;
  majorName: string;
  seq: number;
  leaderName: string;
  lastModifiedTime: number;
  statusName: string;
  auditStatusName: string;
  leaderId: string;
  auditStatus: string;
  status: string;
  eduLevel: string | string[];
  areaIdList: string[];
  knowledgeSubjectId: string;
  billDate: string;
  auditDate: string;
  createrName: string;
  zksdLeaderIds: string;
  majorLeaderId: string;
  upButtonArr: {
    method: string,
    title: string,
    show: string
  }[];
}

export interface ProfessionalParams {
  page: number;
  limit: number;
  orgCode: string;
  searchKey?: string;
  startTime?: string;
  endTime?: string;
  filterKey: 'MANAGER';
}


export interface NewMajorTypeParams {
  id: string;
  name: string;
  leaderId: string; // 负责人
  courseProviderId: string; // 服务商
  seq: number;
  majorIdList: string[];
  eduLevel: string[];
  // areaIdList: string[];
  courseType: string;
  gbCode: string;
  majorId: string; // 学科
}

export interface CourseListParams {
  page: number;
  limit: number;
  searchKey?: string;
  startTime?: string;
  startBillDate?: string;
  endBillDate?: string;
  endTime?: string;
  auditStatus?: string;
  queryFilterType?: string;
  filterKey: 'MANAGER';
}

export interface CourseServiceProviderType {
  id: string;
  typeName: string;
}

export type DisciplineDataType = CommonOption;

export type AreaZkDataType = CommonOption;
