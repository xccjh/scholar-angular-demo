import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  OnChanges,
  SimpleChange,
  ViewChild,
  Output,
  EventEmitter
} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ExerciseRadioComponent} from './exercise-radio/exercise-radio.component';
import {TikuService} from 'src/app/busi-services/tiku.service';
import {Exercise, ExerciseKindEnum, ExerciseMode, ExerciseStatus} from '../exercises-lib/model/exercise';
import {ExerciseTaskService} from './exercise-task.service';
import {Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {TaskCenterService} from 'core/services/task-center.service';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';

interface FinishTaskOption {
  exe?: Exercise;
  redo: number;
  skipUpdateStatus?: boolean;
  skipSubmitPaper?: boolean;
  status?: number;
  action: 'evalute' | 'finish' | 'cacheExe';
  refresh?: boolean;
  finishCb?: () => void;
}

interface IExeDirection {
  direction: 'prev' | 'next' | 'jump';
  index?: number;
}

@Component({
  selector: 'app-exercise-task',
  templateUrl: './exercise-task.component.html',
  styleUrls: ['./exercise-task.component.less']
})
export class ExerciseTaskComponent implements OnInit, OnChanges, OnDestroy {
  /** 题库类型： 题库集 1， 错题集：2， 收藏： 3 */
  @Input() tikuType: number;
  /** 题库任务状态，用于题库入口，做完评分 */
  @Input() tikuTaskStatus = -1;
  @Input() data: any;
  @Input() curTask: any;
  @Output() finishTaskCallBack = new EventEmitter<any>();
  @ViewChild('appExerciseRadio') exeRadio: ExerciseRadioComponent;
  // 习题列表
  exerciseList: Exercise[] = [];
  /** 习题数 */
  exeNum = 0;
  /** 未做题数  */
  unDoneExeNum = 0;
  /** 是否包含主观题 */
  isContainSubjectQues = false;
  /** 是否缓存习题 */
  isCahceExe = false;
  isVisible = false;
  statusVisible = false;
  paperInfo: any;
  evaluteModal = {
    visible: false,
    isRight: false
  };
  exeMode: ExerciseMode = '';
  exeStatus: ExerciseStatus = 'init';
  passRecord = true;
  exeIdx = 0;
  isSaveLoading = false;
  isSubmitLoading = false;

  constructor(
    private tskCenterService: TaskCenterService,
    private nzMsg: NzMessageService,
    private router: Router,
    private exerciseTaskService: ExerciseTaskService,
    private tikuService: TikuService) {
  }

  ngOnInit() {

  }

  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    if (changes.data && !!changes.data.currentValue) {
      this.getExercises();
    }
  }

  ngOnDestroy() {
    if (['finish', 'selfEvalute'].includes(this.exeStatus)) {
      return;
    }
    this.cacheExercise();
  }

  getExercisesReal() {
    this.unDoneExeNum = 0;
    this.exeIdx = 0;
    const quesList: any = this.data.quesList;
    const answerList: any = this.data.answerList || [];
    const collectionList = this.data.collectionList || [];
    const errorQuestionList = this.data.errorQuestionList || [];
    const questions = ((quesList.groups || []) as any[]).reduce((pre, cur) => {
      Array.prototype.push.apply(pre, cur.questions || []);
      return pre;
    }, []);
    this.paperInfo = quesList.paper || {};

    this.exerciseTaskService.formatAnswers(answerList);
    this.exerciseTaskService.exeMode = this.exerciseTaskService.toExerciseMode({
      tikuType: this.tikuType
    }); // wrong collect
    this.exerciseTaskService.exeStatus = this.exerciseTaskService.toExerciseStatus({
      taskInfo: this.curTask,
      tikuType: this.tikuType,
      tikuTaskStatus: this.tikuTaskStatus
    }); // init redo
    this.exeMode = this.exerciseTaskService.exeMode;
    this.exeStatus = this.exerciseTaskService.exeStatus;
    this.exerciseTaskService
      .initialize({questions, answerList, collectionList, errorQuestionList})
      .process([
        {NotComplex: this.exerciseTaskService.optionHandler},
        this.exerciseTaskService.subjectHandler,
      ])
      .process([
        this.exerciseTaskService.doneHandler
      ])
      .process([
        this.exerciseTaskService.commonHandler
      ])
      .processWithComplex([
        this.exerciseTaskService.doneWithWrongExerciseHandler
      ])
      .process([
        this.exerciseTaskService.doneWithRedoHandler
      ])
      .process([
        { NotComplex: this.exerciseTaskService.myAnswerHandler }
      ]);

    let filterFun;
    if (this.exeMode === 'wrong') { // 错题集
      filterFun = (exe: Exercise) => !exe.isRight;
      // 取传过来的错题列表
      filterFun = (exe: Exercise) => {
        return (errorQuestionList as any[]).some(errQues => {
          if (errQues.parentId === '0') {
            return errQues.questionId === exe.exerciseId;
          } else {
            return errQues.parentId === exe.exerciseId;
          }
        });
      };
    } else if (this.exeMode === 'collection') { // 收藏集
      filterFun = (exe: Exercise) => exe.isCollected;
    } else {
      filterFun = (exe: Exercise) => true;
    }
    this.exerciseList = this.exerciseTaskService
      .filter(filterFun)
      .getFilterExerciseList();

    console.log(this.exerciseList);

    this.defaultSelected(this.exeIdx);
    this.exeNum = this.exerciseList.length === 0 ? 0 : this.exerciseList.length - 1;
    this.isContainSubjectQues = this.getSubjectQuesStatus();
    this.passRecord = false;

  }

  getExercises() {
    const taskUrl = this.tikuService.getPaperUrl(this.data.resourceId.split('-')[0]);
    this.exerciseTaskService.getExercise(taskUrl).subscribe(resp => {
      this.data.quesList = resp.quesList;
      this.getExercisesReal();
    });
  }


  defaultSelected(idx: number) {
    if (this.exerciseList.length > 0) {
      this.exerciseList[idx].isSelected = true;
    }
  }

  exerciseChange(idx: number) {
    this.nextExercise({direction: 'jump', index: idx});
  }

  nextExercise(direct: IExeDirection) {
    if (['finish', 'selfEvalute'].includes(this.exeStatus)) {
      this.switchExercise(direct);
      return;
    }
    this.cacheExercise();
    this.switchExercise(direct);
  }

  cacheExercise(): void {
    if (this.exerciseList.length === 0) {
      return;
    }
    if (this.exeStatus === 'init' || this.exeStatus === 'ongoing') {
      const curExe = this.exerciseList[this.exeIdx];
      const isChange = this.setExerciseStatus(curExe);
      if (this.exeMode !== '') {
        return;
      }

      if (isChange) {
        this.finishTask({
          redo: 2,
          skipUpdateStatus: false,
          action: 'cacheExe',
          finishCb: () => this.isCahceExe = true
        });
      }
    }
  }

  setExerciseStatus(exercise: Exercise): boolean {
    let isChange = false;
    if (this.exerciseTaskService.checkExerciseChange(exercise)) {
      this.exerciseTaskService.copyAnswer2Old(exercise);
      this.exerciseTaskService.setExerciseDone(exercise);
      isChange = true;
    }
    return isChange;
  }

  switchExercise(direct: IExeDirection): void {
    let nextExeIdx = this.exeIdx;
    if (direct.direction === 'prev') {
      nextExeIdx--;
    } else if (direct.direction === 'next') {
      nextExeIdx++;
    } else {
      nextExeIdx = direct.index;
    }

    if (nextExeIdx < 0) {
      nextExeIdx = 0;
    } else if (nextExeIdx > this.exeNum) {
      nextExeIdx = this.exeNum;
    }
    this.exeIdx = nextExeIdx;
    this.exeRadio.setItemSelect(this.exerciseList[this.exeIdx].exerciseId);
  }

  checkExerciseValid(exe: Exercise): boolean {
    // 分录不能不填
    let isValid = true;
    if (exe.exerciseKind === ExerciseKindEnum.EntrySubject) {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < exe.myAnswer.length; i++) {
        if (exe.myAnswer[i].subject === '') {
          this.nzMsg.error('科目不能空');
          isValid = false;
          break;
        } else if (!exe.myAnswer[i].answer) {
          this.nzMsg.error('金额不能空');
          isValid = false;
        } else if (!Number.isFinite(exe.myAnswer[i].answer)) {
          this.nzMsg.error('金额只能是数字');
          isValid = false;
          break;
        }
      }
    }
    return isValid;
  }

  setExeNavDone(exeIdx: number) {
    const exeNav = this.exerciseList[exeIdx];
    exeNav.isDone = true;
  }

  confirmFinishPaper(): void {
    // this.finishTask({
    //   redo: 0,
    //   action: 'finish',
    //   finishCb: () => this.isVisible = false
    // });
    this.isVisible = false;
  }


  finishTask(finishOption: FinishTaskOption) {
    this.isSubmitLoading = true;

    this.exerciseTaskService
      .process([
        this.exerciseTaskService.doneHandlerWithMyAnswer
      ], this.exerciseList)
      .process([
        this.exerciseTaskService.commonHandlerWithSubmit
      ], this.exerciseList);

    const status = this.getTaskStatus();
    finishOption.status = status;
    this.tikuTaskStatus = status;

    if (this.exeMode !== '') {
      this.exeStatus = this.exerciseTaskService.toExerciseStatus({
        taskInfo: {
          studentTaskId: 'xxxxx',
          studentTaskStatus: status.toString()
        }
      });
      this.exerciseTaskService.exeStatus = this.exeStatus;

      this.exerciseTaskService
        .process([
          this.exerciseTaskService.statusHandlerWithSubmit
        ], this.exerciseList);

      if (status !== 1) {
        finishOption.skipSubmitPaper = true;
      }
    }

    switch (finishOption.action) {
      case 'cacheExe':
        finishOption.refresh = false;
        const taskStatus = this.curTask.studentTaskId ? this.curTask.studentTaskStatus : this.curTask.status;
        if (parseInt(taskStatus, 10) === 0) {
          finishOption.refresh = status === 4 ? true : false;
        }
        break;
      case 'finish':
        finishOption.refresh = this.exeMode === '';
        finishOption.skipUpdateStatus = this.exeMode === '' ? false : true;
        break;
      case 'evalute':
        finishOption.refresh = this.exeMode === '' ? status === 1 ? true : false : false;
        finishOption.skipUpdateStatus = this.exeMode === '' ? false : true;
        break;
    }

    const start$ = of({});
    start$.pipe(
      switchMap(() => {
        return finishOption.skipSubmitPaper ? of({}) : this.submitPaper(finishOption);
      }),
      switchMap(() => {
        return finishOption.skipUpdateStatus ? of({}) : this.updateStudentTask(finishOption);
      })
    ).subscribe(() => {
      this.isSubmitLoading = false;
      if (finishOption.refresh) {
        this.finishTaskCallBack.emit({tikuTaskStatus: this.tikuTaskStatus});
      }
      finishOption.finishCb?.();
    }, err => {
      this.isSubmitLoading = false;
      this.nzMsg.error(err);
    });
  }

  getTaskStatus() {
    // 任务状态：已失效(-1)、未处理(0)，已完成(1), 重做(2), 待自评(3)，进行中(4)
    let status = 0;
    const allDone = this.exerciseList.every(exercise => exercise.isDone);
    const doneBit = this.exerciseTaskService.isDoneBitQuestion(this.exerciseList);
    if (this.exeMode === '') {
      if (allDone) {
        const allEvalute = this.exerciseList.every(exercise => exercise.isEvalute);
        status = allEvalute ? 1 : 3;
      } else if (doneBit) {
        status = 4;
      } else {
        status = 0;
      }
    } else {
      const allEvalute = this.exerciseList.filter(exercise => exercise.isDone).every(exercise => exercise.isEvalute);
      if (allEvalute) {
        status = 1;
      } else {
        status = 3;
      }
    }
    return status;
  }


  submitPaper(finishOption?: FinishTaskOption): Observable<{ answers: object }> {
    return new Observable<any>(observer => {
      observer.next({});
      // const {thirdId: uid} = LocalStorageUtil.getUser();
      // const {uuid, param1, param2, param3, param4, param5, param6, param7, param8, param9, param10} = this.paperInfo;
      // const redo = finishOption.redo;
      // this.exerciseTaskService
      //   .process([
      //     this.exerciseTaskService.doneHandlerWithMyAnswer
      //   ], this.exerciseList)
      //   .process([
      //     this.exerciseTaskService.commonHandlerWithSubmit
      //   ], this.exerciseList);
      // const answers = this.exerciseTaskService.toSubmitAnswer(this.exerciseList);
      //
      // // 交卷参数
      // const params: any = {
      //   uid: 888888,
      //   paperUuid: uuid,
      //   answersJson: {
      //     uid: '888888',
      //     paperUuid: uuid,
      //     examId: this.curTask.busId,
      //     redo,
      //     answers,
      //     param1,
      //     param2,
      //     param3,
      //     param4,
      //     param5,
      //     param6,
      //     param7,
      //     param8,
      //     param9,
      //     param10
      //   }
      // };
      // this.tikuService.submitPaper(params).subscribe(res => {
      //   const resCode = parseInt(res.code, 10);
      //   if (resCode !== 200) {
      //     observer.error(res.message || JSON.stringify(res));
      //     return;
      //   }
      //   observer.next({answers});
      // }, err => {
      //   observer.error(JSON.stringify(err));
      // });
    });
  }

  /// 更新业务状态
  updateStudentTask(finishOption: FinishTaskOption): Observable<void> {
    return new Observable(observer => {
      const exeList = this.exerciseTaskService.getExerciseList();
      const quesNum = exeList.length;
      const undoneNum = exeList.filter(exercise => !exercise.isDone).length;
      const status = finishOption.status;
      const extraParams = exeList.reduce((acc, exe) => {
        if (exe.mode === '') {
          if (exe.isRight) {
            acc.rightQuesNum += 1;
          }
          acc.score += exe.originalExp;
          acc.exp += exe.evaluateExp;
          if (exe.isDone) {
            acc.undoneNum += 1;
          }
        } else {
          if (exe.isDone) {
            acc.undoneNum += 1;
            if (exe.isRight) {
              acc.rightQuesNum += 1;
            }
            acc.score += exe.originalExp;
            acc.exp += exe.evaluateExp;
          } else {
            if (exe.orginalAnswer) {
              if (exe.orginalAnswer.isCorrect === '2') {
                acc.rightQuesNum += 1;
              }
              acc.score += exe.originalExp;
              acc.exp += parseInt(exe.orginalAnswer.score, 10);
            }
          }
        }
        return acc;
      }, {score: 0, exp: 0, rightQuesNum: 0, undoneNum: 0});
      const finishQuesNum = quesNum - extraParams.undoneNum;
      const params: any = {
        id: this.curTask.studentTaskId || this.curTask.id,
        teacherProcStatus: '2', // 教师处理状态：未处理(0)，已处理(1)，不需要处理(2)
        finishQuesNum, // 完成题目数
        quesNum, // 总题目数
        taskType: '2',
        status,
        ...extraParams
      };
      observer.next();
      // this.tskCenterService.updateStudentTask(params).subscribe(res => {
      //   if (res.status === 201) {
      //     observer.next();
      //   } else {
      //     observer.error(res.message || JSON.stringify(res));
      //   }
      // }, err => {
      //   observer.error(JSON.stringify(err));
      // });
    });
  }

  modifyTaskStatus() {
    // 这个option随便填，只要isFinish = false
    this.isSubmitLoading = true;
    this.updateStudentTask({
      redo: 0,
      action: 'finish'
    }).subscribe(() => {
      this.isSubmitLoading = false;
      this.finishTaskCallBack.emit({tikuTaskStatus: this.tikuTaskStatus});
    }, err => {
      this.isSubmitLoading = false;
    });
  }

  showConfirmSubmit() {
    this.cacheExercise();

    this.unDoneExeNum = this.getUndoneExerciseNum();
    this.isVisible = true;
  }

  getUndoneExerciseNum(): number {
    return this.exerciseTaskService.getExerciseList().filter(exe => !exe.isDone).length;
  }

  /** 处理综合题答案, 由于后台不存储综合的答案，需要前端在计算一次 */
  handleComplexAnswer(questions: any[], answers: any) {
    if (answers && Object.keys(answers).length === 0) {
      return;
    }
    const complexQuestions = questions.filter(ques => ques.typeId === '23');
    const allComplexAnswers = complexQuestions.reduce((acc, cur) => {
      // 返回的答案本身就有答案，就不在计算
      // if (answers[cur.id]) {
      //   return acc;
      // }
      const questionChildrenList = Array.isArray(cur.questionChildrenList) ? cur.questionChildrenList : [];
      const complexAnswers = {
        typeId: '23',
        userAnswer: '',
        initAnswer: '',
        ...this.getComplexAnswer(questionChildrenList, answers)
      };
      acc[cur.id] = complexAnswers;
      return acc;
    }, {});
    Object.assign(answers, allComplexAnswers);
  }

  /** 获取综合题的答案 */
  getComplexAnswer(questions: any[], answers: any) {
    return questions.reduce((acc, cur) => {
      const quesId = cur.id;
      const answerItem = answers[quesId] || {};
      const isCorrect = parseInt(answerItem.isCorrect, 10) || 0;
      const score = (parseInt(answerItem.score, 10) || 0);
      const markStatus = (parseInt(answerItem.markStatus, 10) || 0);
      // 完全正确的加分
      if (isCorrect === 2) {
        acc.score = acc.score + score;
      }
      acc.markStatus = (acc.markStatus && markStatus) ? 1 : 0;
      acc.isCorrect = (acc.isCorrect && isCorrect) ? 2 : 0;
      return acc;
    }, {isCorrect: 2, score: 0, markStatus: 1});
  }

  showEvaluateModal(isRight: boolean): void {
    this.evaluteModal.isRight = isRight;
    this.evaluteModal.visible = true;
  }

  confirmEvalute() {
    let evaluteExe: Exercise;
    const curExe = this.exerciseList[this.exeIdx];
    if (curExe.exerciseKind === ExerciseKindEnum.Complex) {
      const complexExe = curExe.questionList[curExe.complexExeIdx];
      evaluteExe = complexExe;
    } else {
      evaluteExe = curExe;
    }

    evaluteExe.isRight = this.evaluteModal.isRight;
    evaluteExe.isEvalute = true;

    this.setExeEvaluteStatus();

    this.finishTask({
      redo: 0,
      exe: evaluteExe,
      action: 'evalute',
      finishCb: () => this.evaluteModal.visible = false
    });
  }


  setExeEvaluteStatus() {
    const curExe = this.exerciseList[this.exeIdx];
    if (curExe.exerciseKind === ExerciseKindEnum.Complex) {
      const allEvalute = (curExe.questionList as any[]).every(exe => exe.isEvalute);
      curExe.isEvalute = allEvalute;
      curExe.isRight = (curExe.questionList as any[]).every(exe => exe.isRight);
    } else {
      curExe.isEvalute = true;
      curExe.isRight = curExe.isRight;
    }
  }


  redoExecrises(): void {
    SessionStorageUtil.putTikuTask(this.curTask);
    this.router.navigateByUrl(`/section/tiku-execrise-task?tikuType=1&from=section`);
  }

  getSubjectQuesStatus(): boolean {
    return this.exerciseList.filter(exe => exe.isSubject).length === 0 ? false : true;
  }

  handleCollection() {
    const curExe = this.exerciseList[this.exeIdx];
    if (curExe.collectionLoading) {
      return;
    }
    if (this.exeCollected) {
      this.cancelCollectExecrise(curExe);
    } else {
      this.collectExecrise(curExe);
    }
  }

  /** 收藏习题 */
  collectExecrise(curExe: Exercise) {
    curExe.isCollected = true;
    // const {thirdId: uid} = LocalStorageUtil.getUser();
    // if (!uid) {
    //   console.log('uid is null');
    //   this.nzMsg.error('保存习题失败，缺少thirdId，解决：此账号请在网校先登录，然后重新登录本应用！');
    //   return;
    // }
    // const {uuid} = this.paperInfo;
    // const params = {
    //   chapterCode: '',
    //   paperUuid: uuid,
    //   productId: 0,
    //   questionId: parseInt(curExe.exerciseId, 10),
    //   remark: '',
    //   subModuleId: '',
    //   userId: parseInt(uid, 10)
    // };
    // curExe.collectionLoading = true;
    // this.tikuService.collectExecrise(params).subscribe(res => {
    //   curExe.collectionLoading = false;
    //   if (res.code === 200) {
    //     curExe.isCollected = true;
    //     curExe.orginalCollection = res.data.myCollection;
    //   } else {
    //     this.nzMsg.error(JSON.stringify(res));
    //   }
    // }, err => {
    //   curExe.collectionLoading = false;
    //   this.nzMsg.error(JSON.stringify(err));
    // });
  }

  /** 取消收藏习题 */
  cancelCollectExecrise(curExe: Exercise) {
    curExe.isCollected = false;
    curExe.orginalCollection = undefined;
    // const {thirdId: uid} = LocalStorageUtil.getUser();
    // if (!uid) {
    //   console.log('uid is null');
    //   this.nzMsg.error('保存习题失败，缺少thirdId，解决：此账号请在网校先登录，然后重新登录本应用！');
    //   return;
    // }
    // const {id} = curExe.orginalCollection;
    // const params = {
    //   id,
    //   uid: parseInt(uid, 10)
    // };
    // curExe.collectionLoading = true;
    // this.tikuService.cancelCollectExecrise(params).subscribe(res => {
    //   curExe.collectionLoading = false;
    //   if (res.code === 200) {
    //     curExe.isCollected = false;
    //     curExe.orginalCollection = undefined;
    //   } else {
    //     this.nzMsg.error(JSON.stringify(res));
    //   }
    // }, err => {
    //   curExe.collectionLoading = false;
    //   this.nzMsg.error(JSON.stringify(err));
    // });
  }


  showAnswer(): void {
    const curExe: any = this.exerciseList[this.exeIdx];
    if (!curExe) {
      return;
    }
    if (curExe.exerciseKind === ExerciseKindEnum.Complex) {
      const complexExe: any = curExe.questionList[curExe.complexExeIdx];
      if (complexExe) {
        this.setExerciseStatus(complexExe);
        this.exerciseTaskService.commonHandlerWithSubmit.NotComplex(complexExe);
        complexExe.status = 'finish';
        complexExe.isShowAnswer = true;
      }
    } else {
      this.setExerciseStatus(curExe);
      this.exerciseTaskService.commonHandlerWithSubmit.NotComplex(curExe);
      curExe.status = 'finish';
      curExe.isShowAnswer = true;
    }
    this.exerciseList[this.exeIdx] = {...curExe};
  }

  get exeShowAnswer(): boolean {
    if ((this.exeStatus === 'init' || this.exeStatus === 'ongoing') && this.exeMode !== 'collection') {
      const curExe = this.exerciseList[this.exeIdx];
      if (!curExe) {
        return true;
      }
      if (curExe.exerciseKind === ExerciseKindEnum.Complex) {
        const complexExe = curExe.questionList[curExe.complexExeIdx];
        if (complexExe) {
          return !complexExe.isShowAnswer;
        } else {
          return true;
        }
      } else {
        return !curExe.isShowAnswer;
      }
    } else {
      return false;
    }
  }

  get lastNum(): boolean {
    return this.exeIdx !== this.exeNum;
  }

  get exeEvalute(): boolean {
    const curExe = this.exerciseList[this.exeIdx];
    if (!curExe) {
      return false;
    }
    if (curExe.exerciseKind === ExerciseKindEnum.Complex) {
      const complexExe = curExe.questionList[curExe.complexExeIdx];
      if (complexExe) {
        return complexExe.isSubject ? !complexExe.isEvalute : false;
      } else {
        return false;
      }
    } else {
      return curExe.isSubject ? !curExe.isEvalute : false;
    }
  }

  get exeCollected(): boolean {
    const curExe = this.exerciseList[this.exeIdx];
    if (!curExe) {
      return false;
    }
    return curExe.isCollected;
  }

  get collectionLoading(): boolean {
    const curExe = this.exerciseList[this.exeIdx];
    if (!curExe) {
      return false;
    }
    return curExe.collectionLoading;
  }
}
