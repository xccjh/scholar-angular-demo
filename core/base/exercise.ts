export declare interface ExecriseOption {
  label: string;
  content: string;
  id: string;
  /** 是否是我选择的答案 */
  isMyAnswer?: boolean;
  /** 是否我做得正确 */
  isRight?: boolean;
}

// 填空 问答
export declare interface Answer {
  label: string;
  answer: string;
}

/** 分录题 */
export declare interface EntrySubjectOption {
  id?: string;
  qid?: string;
  /** 借贷： 1：借 -1：贷 */
  jd: string;
  /** 顺序 从1开始 */
  seq?: number;
  subject: string;
  /** 答案  */
  answer: number;
}

export declare interface TableOption {
  alignment: string;
  col: number;
  content: string;
  dataType: string;
  id: string;
  inputType: string;
  pos: string;
  qid: string;
  row: number;
}

export declare interface Execrise {
  title: string;
  /**
   * 题目类型
   * '201': '单选题',
   * '202': '多选题',
   * '203': '判断题',
   * '204': '填空题',
   * '205': '表格题',
   * '206': '分录题',
   * '207': '问答题',
   * '299': '综合题'
   */
  type: string;
  content?: string;
  analysis?: string;
  answer?: any;
  myAnswer?: any;
  header?: string;
  questionList?: Array<Execrise>;
  [key: string]: any;
}


