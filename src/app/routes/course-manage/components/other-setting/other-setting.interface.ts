import {NzTreeNode, NzTreeSelectComponent} from 'ng-zorro-antd';
import {PacketInfo} from 'core/base/common';

export declare interface SubQuestionBank {
  id: string; // seeai这边的id
  quebankName: string; // 子模块名称
  quebankId: number; // 子模块id
  busType: '2' | '1'; // 专用区分
}

export declare interface IdMap {
  [key: number]: 'EXAM' | 'PRACTICE"';
}

export declare interface SubModule {
  id: number;
  name: string;
}

export declare interface LevelItem {
  seq: number;
  examId: string;
  id: string;
  quebankId: string;
  passScore: number;
}


export declare interface CompanyItem {
  seq: number;
  courseId: string;
  coursePacketId: string;
  filePath: string;
  id: string;
  name: string | { value: string, disable: boolean };
  fileName: string;
  permission: '业务中心' | '数字大脑' | '财务中心';
  termType: '0' | '1' | '2' | '3'; // 有效期：默认半年(0)、1年(1)、2年(2)、3年(3)
}
export declare interface HqItem {
  seq: number;
  courseId: string;
  coursePacketId: string;
  id: string;
  name: string | { value: string, disable: boolean };
  accountHqId: string;
  status?:  '0'|'1';
}


export declare interface LessonsItem {
  index: number;
  seq: number;
  name: string;
  id: string;
  courseId: string;
  coursePacketId: string;
}

export type LessonsItemOption = Partial<LessonsItem>;

export type Loading = 'isLoading' | 'searchLoad';
export type LoadObj = Record<Loading, boolean>;

export declare interface SubQuestionBankchangeItem {
  data: number[];
  type: 'subQuestionBank' | 'subQuestionBankInt';
  treeSelect: NzTreeSelectComponent;
}

export interface OtherSettingState {
  packetInfo: PacketInfo;
  isLoading: boolean; // 新增课次
  searchLoad: boolean; // 子模块树
  exam: NzTreeNode[]; // 考核专用树
  intelligent: NzTreeNode[]; // 智适应专用树
  subQuestionBankCurrent: number[]; // 当前考核专用
  subQuestionBankCurrentPre: number[];
  subQuestionBank: SubQuestionBank[]; // 考核专用列表
  subQuestionBankInt: SubQuestionBank[]; // 智适应专用列表
  listSublibrary: SubQuestionBank[]; // 考核+智适应列表
  subQuestionBankIntCurrent: number[]; // 当前智适应专用
  subQuestionBankIntCurrentPre: number[];
  moduleArr: SubModule[]; // 闯关子模块下拉
  levelLists: LevelItem[]; // 闯关列表
  companyLists: any[]; // 闯关列表
  listOfData: LessonsItemOption[]; // 课次列表
  idMap: IdMap; // sublibraryModule id=>TYPE
  breakthroughMode: boolean;
  practiceOn: boolean;
  isBet: boolean;
  knowledgeNum: number;
}
