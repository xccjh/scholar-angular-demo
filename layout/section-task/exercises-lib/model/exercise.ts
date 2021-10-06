export interface BaseExercise {
  orginalExercise: any;
  orginalCollection: any;
  orginalAnswer: any;
  orginalErrorExeInfo: any;
  /** 习题id，唯一标志 */
  exerciseId: string;
  /** 是否正确 */
  isRight: boolean;
  /** 是否做题 */
  isDone: boolean;
  /** 是否收藏 */
  isCollected: boolean;
  /** 是否评分 */
  isEvalute: boolean;
  /** 是否主观题 */
  isSubject: boolean;
  /** 是否显示答案，主动的显示 */
  isShowAnswer: boolean;
  /** 题目分数 */
  originalExp: number;
  /** 评估分数 */
  evaluateExp: number;
  /** 视频解析 */
  videoAnalysis: string;
  /** 文本解析 */
  analysis: string;
  /** 标题 */
  title: string;
  /** 题干 */
  content: string;
  /** 习题类型名称 */
  exerciseKindName: string;
  /** 收藏加载 */
  collectionLoading: boolean;
  /** 习题是否在加载 */
  exerciseLoading: boolean;
  /** 是否被选中 */
  isSelected: boolean;
  /** 模式 */
  mode: ExerciseMode;
  /** 状态 */
  status: ExerciseStatus;
}

export enum ExerciseKindEnum {
  /** 判断题 */
  JudgeChoice = 'JudgeChoice',
  /** 单选题 */
  SingleChoice = 'SingleChoice',
  /** 双选题 */
  TwiceChoice = 'TwiceChoice',
  /** 不定项选择题 */
  IndefiniteMultiple = 'IndefiniteMultiple',
  /** 多选题 */
  MultipleChoice = 'MultipleChoice',
  /** 分录题 */
  EntrySubject = 'EntrySubject',
  /** 填空题 */
  FillBlanks = 'FillBlanks',
  /** 表格题 */
  FormSubject = 'FormSubject',
  /** 问答题 */
  Sketch = 'Sketch',
  /** 综合题 */
  Complex = 'Complex'
}


/** 判断题 */
export interface JudgeChoiceExercise extends BaseExercise {
  exerciseKind: 'JudgeChoice';
  /** 自己作答 */
  myAnswer: string;
  /** 旧的自己作答，可以用来对比有没有修改过 */
  oldMyAnswer?: string;
  /** 题目答案 */
  answer: string;
  optionList: any[];
}

/** 单选题 */
export interface SingleChoiceExercise extends BaseExercise {
  exerciseKind: 'SingleChoice';
  myAnswer: string;
  oldMyAnswer?: string;
  answer: string;
  optionList: any[];
}

/** 双选题 */
export interface TwiceChoiceExercise extends BaseExercise {
  exerciseKind: 'TwiceChoice';
  myAnswer: string;
  oldMyAnswer?: string;
  answer: string;
  optionList: any[];
}

/** 不定项选择题 */
export interface IndefiniteMultipleExercise extends BaseExercise {
  exerciseKind: 'IndefiniteMultiple';
  myAnswer: string;
  oldMyAnswer?: string;
  answer: string;
  optionList: any[];
}

/** 多选题 */
export interface MultipleChoiceExercise extends BaseExercise {
  exerciseKind: 'MultipleChoice';
  myAnswer: string;
  oldMyAnswer?: string;
  answer: string;
  optionList: any[];
}

/** 分录题 */
export interface EntrySubjectExercise extends BaseExercise {
  exerciseKind: 'EntrySubject';
  myAnswer: any[];
  oldMyAnswer?: any[];
  answer: any[];
}

/** 填空题 */
export interface FillBlanksExercise extends BaseExercise {
  exerciseKind: 'FillBlanks';
  myAnswer: any[];
  oldMyAnswer?: any[];
  answer: any[];
}

/** 表格题 */
export interface FormSubjectExercise extends BaseExercise {
  exerciseKind: 'FormSubject';
  header: string;
  myAnswer: any[];
  oldMyAnswer?: any[];
  answer: any[];
}

/** 问答题 */
export interface SketchExercise extends BaseExercise {
  exerciseKind: 'Sketch';
  myAnswer: string;
  oldMyAnswer?: any[];
  answer: string;
}

/** 综合题 */
export interface ComplexExercise extends BaseExercise {
  exerciseKind: 'Complex';
  questionList: Exercise[];
  /** 综合题的习题序号 */
  complexExeIdx: number;

  myAnswer?: string;
  oldMyAnswer?: string;
  answer?: string;
}

export type ChoiceExercise = JudgeChoiceExercise | SingleChoiceExercise | TwiceChoiceExercise | IndefiniteMultipleExercise | MultipleChoiceExercise;

/** 习题 */
export type Exercise = ChoiceExercise | EntrySubjectExercise | FillBlanksExercise | FormSubjectExercise | SketchExercise | ComplexExercise;
export type ExerciseKind = Exercise['exerciseKind'];
export type ExerciseHandlerType = ExerciseKind | 'NotComplex';
export type ExerciseHandlerFunction = (exe: Exercise) => Exercise;
export interface ExerciseHandler  {
  [handleKey: string]: ExerciseHandlerFunction;
}
export type ExerciseFilterHandlerFunction = (exe: Exercise) => boolean;
export type ExerciseMode = 'redo' | 'collection' | 'wrong' | '';
export type ExerciseStatus = 'init' | 'selfEvalute' | 'finish' | 'ongoing';
