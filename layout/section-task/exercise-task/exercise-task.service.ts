import {Injectable} from '@angular/core';
import {forkJoin, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {TikuService} from 'src/app/busi-services/tiku.service';
import {
  Exercise, ExerciseKind,
  ChoiceExercise, ComplexExercise, BaseExercise,
  ExerciseHandler, ExerciseHandlerFunction, EntrySubjectExercise,
  ExerciseKindEnum, FillBlanksExercise, SketchExercise, FormSubjectExercise,
  ExerciseFilterHandlerFunction, ExerciseMode, ExerciseStatus
} from '../exercises-lib/model/exercise';
import {Base64} from 'js-base64';
import {environment} from 'src/environments/environment';
import {cloneDeep, isEqual} from 'lodash';
import {TaskCenterService} from 'core/services/task-center.service';
import {LocalStorageUtil} from 'core/utils/localstorage.util';


@Injectable()
export class ExerciseTaskService {
  private originalExerciseList: any[] = [];
  private originalAnswerList = {};
  private originalCollectionList: any[] = [];
  private orgianlErrorQuestionList: any[] = [];
  private exerciseList: Exercise[] = [];
  private filterExerciseList: Exercise[] = [];
  private exerciseKindMap = {
    1: 'SingleChoice',
    2: 'MultipleChoice',
    24: 'TwiceChoice',
    7: 'IndefiniteMultiple',
    3: 'JudgeChoice',
    6: 'FillBlanks',
    22: 'FormSubject',
    12: 'EntrySubject',
    18: 'Sketch',
    23: 'Complex'
  };

  public exeMode: ExerciseMode = '';
  public exeStatus: ExerciseStatus = 'init';

  public subjectHandler: ExerciseHandler = {
    NotComplex: (exercise: Exercise) => {
      exercise.isSubject = this.checkQuesSubject(exercise.exerciseKind as ExerciseKindEnum);
      return exercise;
    },
    Complex: (exercise: ComplexExercise) => {
      exercise.isSubject = exercise.questionList.some(question => question.isSubject);
      return exercise;
    }
  };

  public commonHandler: ExerciseHandler = {
    NotComplex: (exercise: Exercise) => {
      const isDone = exercise.isDone;
      if (isDone) {
        // isCorrect: 0为错误，1为部分对，2为正确
        exercise.isRight = exercise.orginalAnswer?.isCorrect === 2;
        exercise.evaluateExp = this.toInt(exercise.orginalAnswer?.score);
        if (exercise.isSubject) {
          exercise.isEvalute = ['finish', 'selfEvalute'].includes(exercise.status) ? exercise.orginalAnswer?.markStatus === 1 : false;
        } else {
          exercise.isEvalute = true;
        }
      } else {
        if (exercise.isSubject) {
          if (['finish', 'selfEvalute'].includes(exercise.status) && exercise.orginalAnswer) {
            exercise.isRight = exercise.orginalAnswer?.isCorrect === 2;
            exercise.isEvalute = exercise.orginalAnswer?.markStatus === 1;
            exercise.evaluateExp = this.toInt(exercise.orginalAnswer?.score);
          } else {
            exercise.isEvalute = false;
            exercise.isRight = false;
            exercise.evaluateExp = 0;
          }
        } else {
          exercise.isEvalute = true;
          exercise.isRight = false;
          exercise.evaluateExp = 0;
        }
      }
      return exercise;
    },
    Complex: (exercise: ComplexExercise) => {
      exercise.isRight = exercise.questionList.every(question => question.isRight);
      exercise.evaluateExp = this.toInt(exercise.orginalAnswer?.score);
      exercise.isEvalute = exercise.questionList.every(question => question.isEvalute);
      return exercise;
    }
  };

  public commonHandlerWithSubmit: ExerciseHandler = {
    NotComplex: (exercise: Exercise) => {
      switch (exercise.exerciseKind) {
        case ExerciseKindEnum.SingleChoice:
        case ExerciseKindEnum.JudgeChoice:
          const formatMyAnswerWithSingle = exercise.myAnswer ? exercise.myAnswer.toUpperCase() : '';
          const formatRightAnswer = exercise.answer ? exercise.answer.toUpperCase() : '';
          exercise.isRight = formatRightAnswer === formatMyAnswerWithSingle;
          exercise.evaluateExp = exercise.isRight ? exercise.originalExp : 0;
          exercise.isEvalute = true;
          break;
        case ExerciseKindEnum.TwiceChoice:
        case ExerciseKindEnum.IndefiniteMultiple:
        case ExerciseKindEnum.MultipleChoice:
          const formatMyAnswerWithMulti = exercise.myAnswer ? exercise.myAnswer.toUpperCase().split(',').sort().join(',') : '';
          const sortRightAnswer = exercise.answer ? exercise.answer.toUpperCase().split(',').sort().join(',') : '';
          exercise.isRight = sortRightAnswer === formatMyAnswerWithMulti;
          exercise.evaluateExp = exercise.isRight ? exercise.originalExp : 0;
          exercise.isEvalute = true;
          break;
        case ExerciseKindEnum.EntrySubject:
        case ExerciseKindEnum.Sketch:
        case ExerciseKindEnum.FillBlanks:
        case ExerciseKindEnum.FormSubject:
          if (exercise.isDone) {
            exercise.evaluateExp = exercise.isRight ? exercise.originalExp : 0;
          } else {
            exercise.isRight = false;
            exercise.evaluateExp = 0;
            exercise.isEvalute = false;
          }
          break;
        default:
          break;
      }
      return exercise;
    },
    Complex: (exercise: ComplexExercise) => {
      exercise.isRight = exercise.questionList.every(question => question.isRight);
      exercise.evaluateExp = exercise.questionList.reduce((acc, cur) => {
        acc = acc + cur.evaluateExp;
        return acc;
      }, 0);
      exercise.isEvalute = exercise.questionList.every(question => question.isEvalute);
      return exercise;
    }
  };

  public statusHandlerWithSubmit: ExerciseHandler = {
    NotComplex: (exercise: Exercise) => {
      switch (exercise.exerciseKind) {
        case ExerciseKindEnum.SingleChoice:
        case ExerciseKindEnum.JudgeChoice:
        case ExerciseKindEnum.TwiceChoice:
        case ExerciseKindEnum.IndefiniteMultiple:
        case ExerciseKindEnum.MultipleChoice:
          exercise.status = this.exeStatus;
          break;
        case ExerciseKindEnum.EntrySubject:
        case ExerciseKindEnum.Sketch:
        case ExerciseKindEnum.FillBlanks:
        case ExerciseKindEnum.FormSubject:
          exercise.status = this.exeStatus;
          break;
        default:
          break;
      }
      return exercise;
    },
    Complex: (exercise: ComplexExercise) => {
      exercise.status = this.exeStatus;
      return exercise;
    }
  };


  public doneHandler: ExerciseHandler = {
    NotComplex: (exercise: Exercise) => {
      switch (exercise.exerciseKind) {
        case ExerciseKindEnum.SingleChoice:
        case ExerciseKindEnum.JudgeChoice:
        case ExerciseKindEnum.TwiceChoice:
        case ExerciseKindEnum.IndefiniteMultiple:
        case ExerciseKindEnum.MultipleChoice:
        case ExerciseKindEnum.EntrySubject:
        case ExerciseKindEnum.Sketch:
        case ExerciseKindEnum.FillBlanks:
        case ExerciseKindEnum.FormSubject:
          if (!!exercise.orginalAnswer) {
            exercise.isDone = this.checkDoneWithOriginalAnswer(exercise);
          } else {
            exercise.isDone = false;
          }
          return exercise;
        default:
          return exercise;
      }
    },
    Complex: (exercise: ComplexExercise) => {
      exercise.isDone = exercise.questionList.every(question => question.isDone);
      return exercise;
    }
  };

  public doneHandlerWithMyAnswer: ExerciseHandler = {
    NotComplex: (exercise: Exercise) => {
      switch (exercise.exerciseKind) {
        case ExerciseKindEnum.SingleChoice:
        case ExerciseKindEnum.JudgeChoice:
        case ExerciseKindEnum.TwiceChoice:
        case ExerciseKindEnum.IndefiniteMultiple:
        case ExerciseKindEnum.MultipleChoice:
        case ExerciseKindEnum.EntrySubject:
        case ExerciseKindEnum.Sketch:
        case ExerciseKindEnum.FillBlanks:
        case ExerciseKindEnum.FormSubject:
          if (!!exercise.myAnswer) {
            exercise.isDone = this.checkDoneWithMyAnswer(exercise);
          } else {
            exercise.isDone = false;
          }
          return exercise;
        default:
          return exercise;
      }
    },
    Complex: (exercise: ComplexExercise) => {
      exercise.isDone = exercise.questionList.every(question => question.isDone);
      return exercise;
    }
  };

  public doneWithWrongExerciseHandler: ExerciseHandler = {
    NotComplex: (exercise: Exercise) => {
      switch (exercise.exerciseKind) {
        case ExerciseKindEnum.SingleChoice:
        case ExerciseKindEnum.JudgeChoice:
        case ExerciseKindEnum.TwiceChoice:
        case ExerciseKindEnum.IndefiniteMultiple:
        case ExerciseKindEnum.MultipleChoice:
        case ExerciseKindEnum.EntrySubject:
        case ExerciseKindEnum.Sketch:
        case ExerciseKindEnum.FillBlanks:
        case ExerciseKindEnum.FormSubject:
          if (!exercise.isRight) {
            if (exercise.status === 'init' && exercise.mode === 'wrong') {
              exercise.isDone = false;
            }
          }
          return exercise;
        default:
          return exercise;
      }
    },
    Complex: (exercise: ComplexExercise) => {
      if (!exercise.isRight) {
        if (exercise.status === 'init' && exercise.mode === 'wrong') {
          exercise.isDone = false;
          exercise.questionList.forEach(question => {
            question.isDone = false;
          });
        }
      }
      return exercise;
    }
  };

  public doneWithRedoHandler: ExerciseHandler = {
    NotComplex: (exercise: Exercise) => {
      switch (exercise.exerciseKind) {
        case ExerciseKindEnum.SingleChoice:
        case ExerciseKindEnum.JudgeChoice:
        case ExerciseKindEnum.TwiceChoice:
        case ExerciseKindEnum.IndefiniteMultiple:
        case ExerciseKindEnum.MultipleChoice:
        case ExerciseKindEnum.EntrySubject:
        case ExerciseKindEnum.Sketch:
        case ExerciseKindEnum.FillBlanks:
        case ExerciseKindEnum.FormSubject:
          if (exercise.mode === 'redo') {
            exercise.isDone = false;
          }
          return exercise;
        default:
          return exercise;
      }
    },
    Complex: (exercise: ComplexExercise) => {
      if (exercise.mode === 'redo') {
        exercise.isDone = false;
      }
      return exercise;
    }
  };

  public doneWithCollectionHandler: ExerciseHandler = {
    NotComplex: (exercise: Exercise) => {
      switch (exercise.exerciseKind) {
        case ExerciseKindEnum.SingleChoice:
        case ExerciseKindEnum.JudgeChoice:
        case ExerciseKindEnum.TwiceChoice:
        case ExerciseKindEnum.IndefiniteMultiple:
        case ExerciseKindEnum.MultipleChoice:
        case ExerciseKindEnum.EntrySubject:
        case ExerciseKindEnum.Sketch:
        case ExerciseKindEnum.FillBlanks:
        case ExerciseKindEnum.FormSubject:
          if (exercise.mode === 'collection') {
            exercise.isDone = false;
          }
          return exercise;
        default:
          return exercise;
      }
    },
    Complex: (exercise: ComplexExercise) => {
      if (exercise.mode === 'collection') {
        exercise.isDone = false;
      }
      return exercise;
    }
  };

  constructor(
    private taskService: TaskCenterService,
    private tikuService: TikuService) {
  }

  /** 获取作业详情 */
  public getExercise(tkuDataUrl = ''): Observable<any> {
    return new Observable<any>((observe) => {
      const getTiKuData = (taskUrl) => {
        if (!taskUrl) {
          observe.error('任务缺少taskUrl');
          return;
        }
        if (!taskUrl.startsWith('https') && !taskUrl.startsWith('http')) {
          taskUrl = window.location.protocol + taskUrl;
        }
        const task$ = this.taskService.getResource(
          `${taskUrl}?t=${new Date().getTime()}`
        );
        const caterys$ = this.tikuService.getAccountingCaterysTree();
        forkJoin([task$, caterys$]).subscribe(
          ([taskRes, caterysRes]) => {
            // 字典
            if (caterysRes.code === 200) {
              console.log('获取题目字典成功');
            } else {
              console.error('获取题目字典失败');
            }
            observe.next({
              quesList: taskRes || {},
            });
            observe.complete();
          },
          (err) => {
            observe.error(err);
          }
        );
      };
      getTiKuData(tkuDataUrl);
    });
  }


  public getQuestionList(taskUrl: string) {
    return this.taskService.getResource(
      `${taskUrl}?t=${new Date().getTime()}`
    ).pipe(
      map(taskRes => taskRes || {})
    );
  }

  /** 获取作业答案 */
  public getExeAnswer(taskUrl: string, examId: string): Observable<any> {
    const arr = taskUrl.split('/');
    const paperName = arr[arr.length - 1];
    const uuid = paperName.split('.')[0];
    const {thirdId: uid} = LocalStorageUtil.getUser();
    const lastRecord$ = this.tikuService.getExamedRecord(
      parseInt(uid, 10),
      uuid,
      examId
    );

    if (this.exeMode === 'collection') {
      return of({});
    }

    return lastRecord$.pipe(
      map(anwserRes => {
        let answerList = {};
        if (parseInt(anwserRes.code, 10) !== 200) {
          answerList = {};
        } else {
          const {
            data: {
              examRecords: {answers},
            },
          } = anwserRes;
          answerList = answers || {};
        }
        return answerList;
      })
    );
  }

  /** 获取作业收藏 */
  public getCollections(taskUrl: string): Observable<any> {
    const arr = taskUrl.split('/');
    const paperName = arr[arr.length - 1];
    const uuid = paperName.split('.')[0];
    const {thirdId: uid} = LocalStorageUtil.getUser();
    return this.tikuService.getCollectionByUidPid(parseInt(uid, 10), uuid).pipe(
      map(collectionRes => {
        let collectionList = [];
        if (parseInt(collectionRes.code, 10) !== 200) {
          collectionList = [];
        } else {
          const {
            data: {myCollections},
          } = collectionRes;
          collectionList = myCollections || [];
        }
        return collectionList;
      })
    );
  }

  public getExerciseList() {
    return this.exerciseList;
  }

  public getFilterExerciseList() {
    return this.filterExerciseList;
  }

  public initialize({questions, answerList, collectionList, errorQuestionList}:
                      { questions: any[], answerList: object, collectionList: any[], errorQuestionList: any[] }) {
    this.originalExerciseList = questions || [];
    this.originalAnswerList = answerList || {};
    this.originalCollectionList = collectionList || [];
    this.orgianlErrorQuestionList = errorQuestionList || [];
    this.exerciseList = this.standard
    (this.originalExerciseList, this.originalAnswerList, this.originalCollectionList, this.orgianlErrorQuestionList);
    return this;
  }

  public getExerciseKind(typeId: string): ExerciseKind {
    return this.exerciseKindMap[typeId];
  }

  private getVideoAnalysisUrl(videoAnalysis: string): string {
    if (videoAnalysis) {
      if (environment.commonViewer.indexOf('?') > -1) {
        return `${environment.commonViewer}&polywayId=${videoAnalysis}`;
      } else {
        return `${environment.commonViewer}?polywayId=${videoAnalysis}`;
      }
    } else {
      return '';
    }
  }

  private standard(exerciseList: any[], answerList: object, collectionList: any[], errorQuestionList: any[]): Exercise[] {
    // TODO 先过滤掉录音题，以后在补上
    return exerciseList.filter(ques => ques.typeId !== '21').map(exercise => {
      const decodeAnswer = this.toDecodeAnswer(exercise.answer);
      const exerciseKind = this.getExerciseKind(exercise.typeId);
      const orginalAnswer = answerList[exercise.id] ? answerList[exercise.id] : null;
      const orginalCollection = collectionList.find(collection => collection.questionId === exercise.id);
      const orginalErrorExeInfo = errorQuestionList.find(errExe => errExe.questionId === exercise.id);
      const videoAnalysis = this.getVideoAnalysisUrl(exercise.videoAnalysis);
      const mode = this.exeMode;
      const status = this.exeStatus;
      const isShowAnswer = false;
      const baseExercise: Partial<BaseExercise> = {
        orginalExercise: exercise,
        orginalAnswer,
        orginalCollection,
        orginalErrorExeInfo,
        exerciseId: exercise.id,
        title: exercise.title,
        content: exercise.title,
        exerciseKindName: exercise.questionTypeName,
        analysis: exercise.textAnalysis,
        originalExp: this.toInt(exercise.score),
        evaluateExp: 0,
        isRight: false,
        isDone: false,
        isCollected: !!orginalCollection,
        collectionLoading: false,
        videoAnalysis,
        exerciseLoading: false,
        isSelected: false,
        mode,
        status,
        isShowAnswer
      };
      switch (exerciseKind) {
        case ExerciseKindEnum.SingleChoice:
        case ExerciseKindEnum.JudgeChoice:
        case ExerciseKindEnum.TwiceChoice:
        case ExerciseKindEnum.IndefiniteMultiple:
        case ExerciseKindEnum.MultipleChoice:
          return {
            ...baseExercise,
            isEvalute: true,
            exerciseKind,
            answer: decodeAnswer,
            myAnswer: '',
            optionList: [],
          } as ChoiceExercise;

        case ExerciseKindEnum.EntrySubject:
          return {
            ...baseExercise,
            isEvalute: false,
            exerciseKind,
            answer: this.transformEntrySubjectAnswer(decodeAnswer),
            myAnswer: [],
          } as EntrySubjectExercise;

        case ExerciseKindEnum.FillBlanks:
          return {
            ...baseExercise,
            isEvalute: false,
            exerciseKind,
            answer: this.transformFillBlanksAnswer(decodeAnswer),
            myAnswer: [],
          } as FillBlanksExercise;

        case ExerciseKindEnum.FormSubject:
          return {
            ...baseExercise,
            isEvalute: false,
            exerciseKind,
            header: decodeAnswer.info.content,
            answer: this.transformFormSubjectAnswer(decodeAnswer),
            myAnswer: [],
          } as FormSubjectExercise;

        case ExerciseKindEnum.Sketch:
          return {
            ...baseExercise,
            isEvalute: false,
            exerciseKind,
            answer: decodeAnswer,
          } as SketchExercise;

        case ExerciseKindEnum.Complex:
          return {
            ...baseExercise,
            isEvalute: false,
            exerciseKind,
            complexExeIdx: 0,
            questionList: this.standard(exercise.questionChildrenList || [], answerList, collectionList, errorQuestionList)
          } as ComplexExercise;
      }
    });
  }

  /** 遍历题目，遇到综合题，根据子题的状态去推断综合题的状态 */
  public process(handlers: ExerciseHandler[], handlerList?: Exercise[]) {
    const list = handlerList ? handlerList : this.exerciseList;
    // 处理非综合题，包括综合题里的子题
    list.forEach(exercise => {
      if (exercise.exerciseKind !== 'Complex') {
        this.processExerciseHander(exercise, handlers);
      } else if (exercise.exerciseKind === 'Complex') {
        exercise.questionList.forEach(question => {
          this.processExerciseHander(question, handlers);
        });
      }
    });

    // 处理综合题
    this.exerciseList.forEach(exercise => {
      if (exercise.exerciseKind === 'Complex') {
        this.processExerciseHander(exercise, handlers);
      }
    });
    return this;
  }

  /** 遍历题目，遇到综合题，根据综合题的状态去推断子题的状态 */
  public processWithComplex(handlers: ExerciseHandler[], handlerList?: Exercise[]) {
    const list = handlerList ? handlerList : this.exerciseList;
    list.forEach(exercise => {
      if (exercise.exerciseKind !== 'Complex') {
        this.processExerciseHander(exercise, handlers);
      } else if (exercise.exerciseKind === 'Complex') {
        this.processExerciseHander(exercise, handlers);
      }
    });
    return this;
  }

  public filter(filterHandler: ExerciseFilterHandlerFunction) {
    this.filterExerciseList = this.exerciseList.filter(exercise => filterHandler(exercise));
    return this;
  }

  public optionHandler: ExerciseHandlerFunction = (exercise: Exercise) => {
    switch (exercise.exerciseKind) {
      case ExerciseKindEnum.SingleChoice:
      case ExerciseKindEnum.JudgeChoice:
      case ExerciseKindEnum.TwiceChoice:
      case ExerciseKindEnum.IndefiniteMultiple:
      case ExerciseKindEnum.MultipleChoice:
        const questionOptions = exercise.orginalExercise.questionOptions || [];
        exercise.optionList = questionOptions.map(option => ({
          label: option.answerOption,
          content: option.answerContent,
        }));
        return exercise;
      default:
        return exercise;
    }
  }

  public myAnswerHandler: ExerciseHandlerFunction = (exercise: Exercise) => {
    switch (exercise.exerciseKind) {
      case ExerciseKindEnum.SingleChoice:
      case ExerciseKindEnum.JudgeChoice:
      case ExerciseKindEnum.TwiceChoice:
      case ExerciseKindEnum.IndefiniteMultiple:
      case ExerciseKindEnum.MultipleChoice:
      case ExerciseKindEnum.Sketch:
        exercise.myAnswer = exercise.isDone ? exercise.orginalAnswer.answer : '';
        exercise.oldMyAnswer = exercise.myAnswer;
        return exercise;
      case ExerciseKindEnum.EntrySubject:
        exercise.myAnswer = exercise.isDone ? exercise.orginalAnswer.answer : [];
        exercise.oldMyAnswer = cloneDeep(exercise.myAnswer);
        return exercise;
      case ExerciseKindEnum.FillBlanks:
        exercise.myAnswer = exercise.isDone ? exercise.orginalAnswer.answer : exercise.answer.map(answerItem => ({
          label: answerItem.label,
          answer: ''
        }));
        exercise.oldMyAnswer = cloneDeep(exercise.myAnswer);
        return exercise;
      case ExerciseKindEnum.FormSubject:
        exercise.myAnswer = exercise.isDone ? exercise.orginalAnswer.answer : exercise.answer;
        exercise.oldMyAnswer = cloneDeep(exercise.myAnswer);
        return exercise;
      default:
        return exercise;
    }
  }

  /** 复制新答案到旧答案里 */
  public copyAnswer2Old(exercise: Exercise): void {
    switch (exercise.exerciseKind) {
      case ExerciseKindEnum.SingleChoice:
      case ExerciseKindEnum.JudgeChoice:
      case ExerciseKindEnum.TwiceChoice:
      case ExerciseKindEnum.IndefiniteMultiple:
      case ExerciseKindEnum.MultipleChoice:
      case ExerciseKindEnum.Sketch:
        exercise.oldMyAnswer = exercise.myAnswer;
        break;
      case ExerciseKindEnum.EntrySubject:
        exercise.oldMyAnswer = cloneDeep(exercise.myAnswer);
        break;
      case ExerciseKindEnum.FillBlanks:
        exercise.oldMyAnswer = cloneDeep(exercise.myAnswer);
        break;
      case ExerciseKindEnum.FormSubject:
        exercise.oldMyAnswer = cloneDeep(exercise.myAnswer);
        break;
      case ExerciseKindEnum.Complex:
        exercise.questionList.forEach(question => {
          this.copyAnswer2Old(question);
        });
        break;
      default:
        break;
    }
  }

  public checkExerciseChange(exercise: Exercise): boolean {
    if (exercise.exerciseKind === ExerciseKindEnum.Complex) {
      return exercise.questionList.some(question => {
        if (question.exerciseKind !== ExerciseKindEnum.Complex) {
          return !isEqual(question.myAnswer, question.oldMyAnswer);
        } else {
          return false;
        }
      });
    } else {
      return !isEqual(exercise.myAnswer, exercise.oldMyAnswer);
    }
  }

  public setExerciseDone(exercise: Exercise): void {
    exercise.isDone = true;
  }

  /** 检查是否作答 */
  public checkDoneWithMyAnswer(exercise: Exercise): boolean {
    switch (exercise.exerciseKind) {
      case ExerciseKindEnum.SingleChoice:
      case ExerciseKindEnum.JudgeChoice:
      case ExerciseKindEnum.TwiceChoice:
      case ExerciseKindEnum.IndefiniteMultiple:
      case ExerciseKindEnum.MultipleChoice:
      case ExerciseKindEnum.Sketch:
        return !!exercise.myAnswer;
      case ExerciseKindEnum.FillBlanks:
        return Array.isArray(exercise.myAnswer)
          ?
          exercise.myAnswer.map(it => it.answer).filter(answerText => !!answerText).length === 0 ? false : true
          : false;
      case ExerciseKindEnum.EntrySubject:
        return Array.isArray(exercise.myAnswer)
          ?
          exercise.myAnswer.length === 0 ? false : true
          : false;
      case ExerciseKindEnum.FormSubject:
        if (Array.isArray(exercise.myAnswer)) {
          for (const row of exercise.myAnswer) {
            for (const col of row) {
              if (col.myAnswer) { // 有一空作答算已作答
                return true;
              }
            }
          }
        }
        return false;
      case ExerciseKindEnum.Complex: // 综合题，全部题答，算作答
        return exercise.questionList.every(ques => this.checkDoneWithMyAnswer(ques));
      default:
        return true;
    }
  }

  public checkDoneWithOriginalAnswer(exercise: Exercise): boolean {
    switch (exercise.exerciseKind) {
      case ExerciseKindEnum.SingleChoice:
      case ExerciseKindEnum.JudgeChoice:
      case ExerciseKindEnum.TwiceChoice:
      case ExerciseKindEnum.IndefiniteMultiple:
      case ExerciseKindEnum.MultipleChoice:
      case ExerciseKindEnum.Sketch:
        return !!exercise.orginalAnswer.answer;
      case ExerciseKindEnum.FillBlanks:
        return Array.isArray(exercise.orginalAnswer.answer)
          ?
          exercise.orginalAnswer.answer.map(it => it.answer).filter(answerText => !!answerText).length === 0 ? false : true
          : false;
      case ExerciseKindEnum.EntrySubject:
        return Array.isArray(exercise.orginalAnswer.answer)
          ?
          exercise.orginalAnswer.answer.length === 0 ? false : true
          : false;
      case ExerciseKindEnum.FormSubject:
        if (Array.isArray(exercise.orginalAnswer.answer)) {
          for (const row of exercise.orginalAnswer.answer) {
            for (const col of row) {
              if (col.myAnswer) { // 有一空作答算已作答
                return true;
              }
            }
          }
        }
        return false;
      case ExerciseKindEnum.Complex: // 综合题，全部题答，算作答
        return exercise.questionList.every(ques => this.checkDoneWithOriginalAnswer(ques));
      default:
        return true;
    }
  }

  public toInt(num: any): number {
    if (Number.isFinite(num)) {
      return num;
    } else if (typeof num === 'string') {
      return parseInt(num || '0', 10);
    } else {
      return 0;
    }
  }

  /**
   * 有没有做过了一些题
   * @params list
   */
  public isDoneBitQuestion(exerciseList: Exercise[]): boolean {
    const doneBitQuesFunc = (list: Exercise[]): boolean => {
      for (const exercise of list) {
        if (exercise.exerciseKind === ExerciseKindEnum.Complex) {
          const doneBit = doneBitQuesFunc(exercise.questionList);
          if (doneBit) {
            return true;
          }
        } else {
          if (exercise.isDone) {
            return true;
          }
        }
      }
      return false;
    };
    return doneBitQuesFunc(exerciseList);
  }

  public toExerciseMode(data: any): ExerciseMode {
    const {tikuType} = data;
    let exeMode: ExerciseMode = '';
    if (tikuType && tikuType > 0) {
      switch (tikuType) {
        case 1:
          exeMode = 'redo';
          break;
        case 2:
          exeMode = 'wrong';
          break;
        case 3:
          exeMode = 'collection';
          break;
        default:
          exeMode = '';
      }
    }
    return exeMode;
  }

  public toExerciseStatus(data: any): ExerciseStatus {
    const {taskInfo, tikuTaskStatus, tikuType} = data;
    // status: 未完成 0, 已完成 1, 重做 2, 待自评 3
    let status = taskInfo.studentTaskId ? taskInfo.studentTaskStatus : taskInfo.status;
    if (tikuType > 0) {
      status = tikuTaskStatus.toString();
    }
    const isEndOfTask = status === '1';
    const isSelfEvalute = status === '3';
    const isOngoing = status === '4';
    let exeStatus: ExerciseStatus = 'init';
    if (isEndOfTask) {
      exeStatus = 'finish';
    } else if (isSelfEvalute) {
      exeStatus = 'selfEvalute';
    } else if (isOngoing) {
      exeStatus = 'ongoing';
    }
    return exeStatus;
  }

  public toSubmitAnswer(list: Exercise[], skipUndone: boolean) {
    const answers = {};
    const getSubmitAnswer = (exerciseList: Exercise[]) => {
      for (const exercise of exerciseList) {
        if (exercise.exerciseKind !== ExerciseKindEnum.Complex) {
          if (skipUndone) {
            if (!exercise.isDone) {
              if (exercise.mode !== '' && !!exercise.orginalAnswer) {
                answers[exercise.exerciseId] = {
                  typeId: exercise.orginalAnswer.typeId,
                  userAnswer: this.formatSubmitAnswer(exercise.orginalAnswer.answer),
                  initAnswer: '',
                  isCorrect: exercise.orginalAnswer.isCorrect,
                  score: exercise.orginalAnswer.score,
                  markStatus: exercise.orginalAnswer.markStatus,
                };
              }
              continue;
            }
          }
          answers[exercise.exerciseId] = {
            typeId: exercise.orginalExercise.typeId,
            userAnswer: this.formatSubmitAnswer(exercise.myAnswer),
            initAnswer: '',
            isCorrect: exercise.isRight ? 2 : 0,
            score: exercise.evaluateExp,
            markStatus: exercise.isEvalute ? 1 : 0,
            // recordDetailId:  exercise.orginalErrorExeInfo ? exercise.orginalErrorExeInfo.recordDetailId : ''
          };
        } else {
          getSubmitAnswer(exercise.questionList);
        }
      }
    };
    getSubmitAnswer(this.exerciseList);
    return answers;
  }

  private formatSubmitAnswer(item: any) {
    const type = typeof item;
    if (type === 'string') {
      return item;
    } else if (type === 'number') {
      return item;
    } else {
      return JSON.stringify(item);
    }
  }

  private processExerciseHander(exercise: Exercise, handlers: ExerciseHandler[]): void {
    handlers.forEach(handler => {
      const keys = Object.keys(handler);
      keys.forEach(key => {
        if (exercise.exerciseKind === key || key === 'NotComplex') {
          const handlerFun = handler[key] as ExerciseHandlerFunction;
          Object.assign(exercise, handlerFun(exercise));
        } else if (exercise.exerciseKind === ExerciseKindEnum.Complex && key === 'Complex') {
          const handlerFun = handler[key] as ExerciseHandlerFunction;
          Object.assign(exercise, handlerFun(exercise));
        }
      });
    });
  }

  private toDecodeAnswer(answer: string): any {
    try {
      const decodeAnswer = Base64.decode(answer);
      const decodeAnswerObj = JSON.parse(decodeAnswer);
      if (typeof decodeAnswerObj === 'object') {
        return decodeAnswerObj;
      } else {
        return decodeAnswer;
      }
    } catch (error) {
      return '';
    }
  }

  public formatAnswers(answers: object) {
    const keys = Object.keys(answers);
    keys.forEach(key => {
      try {
        const userAnswerObj = JSON.parse(answers[key].userAnswer);
        if (typeof userAnswerObj === 'object') {
          answers[key].userAnswer = userAnswerObj;
        }
      } catch (error) {

      } finally {
        answers[key].answer = answers[key].userAnswer;
      }
    });
  }

  /** 检查是否主观题 */
  public checkQuesSubject(exerciseKind: ExerciseKindEnum): boolean {
    switch (exerciseKind) {
      case ExerciseKindEnum.SingleChoice:
      case ExerciseKindEnum.JudgeChoice:
      case ExerciseKindEnum.TwiceChoice:
      case ExerciseKindEnum.IndefiniteMultiple:
      case ExerciseKindEnum.MultipleChoice:
        return false; // 客观题
      case ExerciseKindEnum.FillBlanks:
      case ExerciseKindEnum.EntrySubject:
      case ExerciseKindEnum.FormSubject:
      case ExerciseKindEnum.Sketch:
      case ExerciseKindEnum.Complex: // 综合题： 有一道是主观题，就是主观题，否则不是
        return true; // 主观题
    }
  }

  private transformEntrySubjectAnswer(answer: any): any[] {
    const contents: any[] = answer.contents || [];
    const subjects: any[] = contents.map(el => ([
      (el.DaiOptions as any[]).map(d => ({
        jd: '-1',
        subject: d.Key,
        answer: d.Value
      })),
      (el.JieOptions as any[]).map(d => ({
        jd: '1',
        subject: d.Key,
        answer: d.Value
      }))])
    );
    // @ts-ignore
    return subjects.flat(3);
  }

  private transformFillBlanksAnswer(answer: string): any[] {
    return answer.split('&').map(el => ({label: el, answer: el}));
  }

  private transformFormSubjectAnswer(tableInfo: any) {
    try {
      const optionList = [];
      tableInfo.contents.map((trInfo, row) => {
        optionList[row] = trInfo.tr.map((td, col) => {
          return ({
            header: td.header,
            col,
            content: td.content || td.answer,
            inputType: !!td.inputType ? 1 : 0,
            row,
            rowSpan: td.rowSpan,
            colSpan: td.colSpan
          });
        });
      });
      return optionList;
    } catch (err) {
      console.log(err);
    }
  }
}




