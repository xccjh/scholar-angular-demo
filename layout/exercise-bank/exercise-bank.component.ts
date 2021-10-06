import {Component, OnInit, Input, OnChanges, SimpleChange, Output, EventEmitter} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {ToolsUtil} from 'core/utils/tools.util';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NotifyService} from 'core/services/notify.service';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {forkJoin, Observable, of, Subscriber, timer} from 'rxjs';
import {DomSanitizer} from '@angular/platform-browser';
import {environment} from '../../src/environments/environment';
import {TikuService} from '@app/busi-services/tiku.service';
import {SessionStorageUtil} from '../../core/utils/sessionstorage.util';

@Component({
  selector: 'app-exercise-bank',
  templateUrl: './exercise-bank.component.html',
  styleUrls: ['./exercise-bank.component.less']
})
export class ExerciseBankComponent implements OnInit {
  isVisible = false;
  paperData;
  smartQuestion = [];
  currentIndex = 0;
  stringify = JSON.stringify;
  orgCode = ToolsUtil.getOrgCode();
  submitted = {
    flag: false
  };
  paramExpand: any;
  paperId: any;
  paperUuid = '';
  isLoading = false;
  tips = '';
  knowledgePointsParam: any = {};
  isPreviewpolyway = false;
  videoAnalysis;
  currenType = 'mediumQuestion';
  enumKey = ['mediumQuestion', 'easyQuestion', 'difficultQuestion'];
  markQuestion = []; // 已做过的题目
  private courseCode = '';
  private konwledges = '';
  private experiences = '';
  private userId = LocalStorageUtil.getUser().thirdId;
  private loginSignInfo = LocalStorageUtil.getUser();
  private prefix = environment.ow365.substr(0, environment.ow365.length - 5) + 'polywayId=';
  private fraction = '0';
  private questions = 0;
  private knowledgePointsParamString = '';
  private courseData;
  private phase;
  private recordingType; // 阶段，目标，和大纲
  private title;
  private curProgress;
  private status;
  private courseId;
  private professionId;
  private coursePacketId;
  private lessonCount;
  private isSmart;
  private code;
  private teachType;
  private auditStatus;
  private preview;
  private createrId;
  private pcode;
  private knowledgeSubjectId;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private tikuService: TikuService,
              private message: NzMessageService,
              private notification: NotifyService,
              private sanitizer: DomSanitizer
  ) {
    this.initParams();
    this.recordingType = LocalStorageUtil.getMarkQuestionRecording();
    LocalStorageUtil.putAnswers({});
    LocalStorageUtil.putAnswersInfo([]);
    this.echoData();
  }

  echoData() {

    this.courseData = LocalStorageUtil.getSelectedCourse();
    const exercise = JSON.parse(LocalStorageUtil.getExerciseKey());
    const uuid = exercise.paperUuid;
    const paperId = exercise.tpaperId;
    if (uuid) {
      this.paperUuid = uuid;
    }
    if (paperId) {
      this.paperId = paperId;
    }
    this.isLoading = true;
    if (LocalStorageUtil.getQuestionInit() === '0') {  // 智能抽题
      LocalStorageUtil.removeQuestionInit();
      this.initInfo(exercise);
      this.getUuId((data) => {
        const result = data.data;
        if (!result.groups.length) {
          this.message.info('暂无可以训练的最新题目了');
          history.back();
        } else {
          this.paperUuid = result.paper.uuid;
          this.paperId = result.paper.id;
          exercise.paperUuid = this.paperUuid;
          exercise.tpaperId = this.paperId;
          const {update} = this.route.snapshot.queryParams;
          // 说明是再次训练，只有需要继续闯关的才需要更新uuid,即目标闯关和大纲做题需要
          if (update === '1') {
            this.updateUuid({
              sectionId: this.recordingType.sectionId,
              passUuid: this.paperUuid
            }).then((flag) => {
              if (flag) {
                // 再次开始做题
                this.startToDoTheProblem(exercise, result);
              }
            });
          } else {
            this.startToDoTheProblem(exercise, result);
          }
        }
      });
    } else if (LocalStorageUtil.getQuestionInit() === '1') { // 直接做题
      this.isLoading = false;
      LocalStorageUtil.removeQuestionInit();
      // this.getPaperInfo(this.paperUuid).subscribe(res => {
      const paperDataCache = LocalStorageUtil.getPaperTotal();
      const paperData = paperDataCache.groups;
      const {param1, param2, param3, param4, param5, param6, param7, param8, param9, param10} = paperDataCache.paper;
      this.paramExpand = {param1, param2, param3, param4, param5, param6, param7, param8, param9, param10};
      // 还原答案
      LocalStorageUtil.putAnswers({});
      this.smartQuestion = paperData;
      const url = this.smartQuestion[this.currentIndex][this.currenType].videoAnalysis;
      this.videoAnalysis = url ?
        this.sanitizer.bypassSecurityTrustResourceUrl(this.prefix + url) : '';
      // })
    } else { // 回显做题记录
      const timerEnd$ = timer(600).subscribe(() => {
        timerEnd$.unsubscribe();
        forkJoin([this.getRecord({
          uid: '888888',
          paperUuid: this.paperUuid,
        }), this.getPaperInfo(this.paperUuid)]).subscribe((ret) => {
          this.isLoading = false;
          if (Array.isArray(ret) && ret.length > 0) {
            this.convertData(ret);
          } else {
            this.errorMessage('获取信息失败，请稍后再试');
          }
        }, err => {
          this.isLoading = false;
          this.errorMessage(JSON.stringify(err));
        });
      });
    }
  }

  // 开始做题
  startToDoTheProblem(exercise, result) {
    LocalStorageUtil.setExerciseKey(exercise.courseCode, exercise.data, this.paperUuid, this.paperId);
    const timer$ = timer(600).subscribe(() => {
      timer$.unsubscribe();
      this.paperData = result;
      const {groups, paper} = this.paperData;
      const {param1, param2, param3, param4, param5, param6, param7, param8, param9, param10} = paper;
      this.smartQuestion = groups;
      const firstItem = this.smartQuestion[0].mediumQuestion;
      this.videoAnalysis = firstItem.videoAnalysis ?
        this.sanitizer.bypassSecurityTrustResourceUrl(this.prefix + firstItem.videoAnalysis) : '';
      // const {param1, param2, param3, param4, param5, param6, param7, param8, param9, param10} = firstItem;
      this.paramExpand = {param1, param2, param3, param4, param5, param6, param7, param8, param9, param10};
    });
  }

  updateUuid(params) {
    return new Promise((resolve) => {
      this.tikuService.updateUuid(params).subscribe((res) => {
        if (res.status === 200) {
          resolve(true);
        } else {
          this.message.error(res.message);
          resolve(false);
        }
      }, err => {
        this.message.error('更新试卷信息失败');
        resolve(false);
      });
    });
  }


  errorMessage(res) {
    this.message.error(res);
    const timer$ = timer(2000).subscribe(() => {
      timer$.unsubscribe();
      history.back();
    });
  }

  initInfo(exercise) {
    this.courseCode = exercise.courseCode;
    const knowledgePoints = exercise.data;
    if (knowledgePoints && knowledgePoints.length) {
      this.konwledges = knowledgePoints.map(e => {
        return e.code;
      }).join(',');
      this.experiences = knowledgePoints.map(e => {
        return e.experienceValue;
      }).join(',');
    }
  }

  getPaperInfo(uuid) {
    return this.tikuService.replyToTestPaperInformation(uuid);
    // return of(paperData);
  }

  getStage() {
    return new Promise((resolve) => {
      this.tikuService.getStage(this.coursePacketId).subscribe((res) => {
        if (res.status === 200) {
          if (res.data.stage === '精讲阶段') {
            this.phase = 2;
          }
          if (res.data.stage === '密押阶段') {
            this.phase = 4;
          }
          if (res.data.stage === '冲刺阶段') {
            this.phase = 3;
          }
        }
        resolve(true);
      }, error => {
        resolve(true);
      });
    });
  }


  initParams() {
    const {
      name, curProgress, status, courseId, professionId, id, lessonCount, isSmart, code,
      teachType, auditStatus, preview, createrId, pcode, knowledgeSubjectId
    }
      = SessionStorageUtil.getPacketInfo();
    this.title = name; // 课包名称
    this.curProgress = Number(curProgress);
    this.status = status; // 课包状态
    this.courseId = courseId; // 课程id
    this.professionId = professionId; //  学科id
    this.coursePacketId = id; //  课包
    this.lessonCount = Number(lessonCount); // 课次
    this.isSmart = isSmart; // 智适应
    this.code = code; // 课程编码
    this.teachType = teachType; // 授课方式: 线下面授(11)、线下双师(12)、线上直播(21)、线上录播(22)
    this.auditStatus = auditStatus; // 审核流程状态
    this.preview = preview;
    this.createrId = createrId;
    this.pcode = pcode;
    this.knowledgeSubjectId = knowledgeSubjectId;
  }

  async getUuId(fn) {
    const codeUid = await ToolsUtil.getProdIdSync();
    this.getStage().then(() => {
      const params: any = {
        konwledges: this.konwledges,
        experiences: this.experiences,
        userId: this.userId,
        courseCode: this.courseCode,
        proId: codeUid,
        taskType: 6,
        studentId: LocalStorageUtil.getUserId(),
        coursePacketId: this.coursePacketId
      };
      if (this.phase) {
        params.phase = this.phase;
      }
      this.tikuService.getPaperInfo(params).subscribe(result => {
        this.isLoading = false;
        if (result.status === 200) {
          if (result.data) {
            fn(result);
          } else {
            this.errorMessage('暂无智适应题目');
          }
        } else {
          this.errorMessage('暂无智适应题目');
        }
      }, () => {
        this.isLoading = false;
      });
    });
    // fn(paperData);
  }

  nextStep() {
    this.submitted.flag = false;
    const currentItem = this.smartQuestion[this.currentIndex];
    const {currenType} = this;
    if (currenType === 'mediumQuestion' &&
      ((Number(currentItem.mediumQuestion.isCorrect) === 0 && currentItem.easyQuestion)
        ||
        (Number(currentItem.mediumQuestion.isCorrect) === 2 && currentItem.difficultQuestion)
      )
    ) { // 需要做知识点内的题
      // 根据答题情况自动出题
      if (Number(currentItem.mediumQuestion.isCorrect) === 0) {
        this.currenType = 'easyQuestion';
      } else {
        this.currenType = 'difficultQuestion';
      }
      const url = this.smartQuestion[this.currentIndex][this.currenType].videoAnalysis;
      this.videoAnalysis = url ?
        this.sanitizer.bypassSecurityTrustResourceUrl(this.prefix + url) : '';
    } else {
      this.canDoTheNextQuestion(); // 可以做下一题
    }
  }


  // 可以做下一题
  canDoTheNextQuestion() {
    if (this.ifLastQuestion()) {
      this.gotoViewAnswer();
    } else {
      this.currentIndex++;
      this.currenType = 'mediumQuestion';
      this.videoAnalysis =
        this.smartQuestion[this.currentIndex].videoAnalysis ? this.sanitizer.bypassSecurityTrustResourceUrl(this.prefix + this.smartQuestion[this.currentIndex].videoAnalysis) : '';
    }
  }

  gotoViewAnswer() {
    this.updateRecord().subscribe(() => {
      const {fraction, questions, knowledgePointsParamString} = this;
      const url = `/exercise-bank/view-answer?fraction=${fraction}&questions=${questions}
      &knowledgePointsParam=${knowledgePointsParamString}`;
      this.router.navigateByUrl(url);
    });
  }

  updateRecordChild() {
    this.updateRecord(true).subscribe(res => {
      if (res) {
        this.submitted.flag = true;
      }
    });
  }

  setParams() {
    const error = [];
    const success = [];
    this.markQuestion.forEach(e => {
      this.enumKey.forEach(r => {
        if (e[r]) {
          if (Number(e[r].isCorrect) === 0) {
            error.push(e[r]);
          } else if (Number(e[r].isCorrect) === 2) {
            success.push(e[r]);
          }
        }
      });
    });
    this.fraction = (100 * (success.length / (error.length + success.length))).toFixed(0);
    this.questions = success.length + error.length;
    this.knowledgePointsParamString = Object.keys(this.knowledgePointsParam).join(',');
    LocalStorageUtil.putAnswersInfo(this.markQuestion);
  }

  updateRecord(update?) {
    return new Observable((observer: Subscriber<any>) => {
      if (update) {
        this.setParams();
        const {recordingType} = this;
        // 录播大纲，目标或阶段
        if (recordingType.id && LocalStorageUtil.getSelectedCourse().teachType === '22') {
          let type;
          let key;
          const isOutLine = String(this.recordingType.markQuestiontype) === '3';
          if (String(this.recordingType.markQuestiontype) === '1') { // 目标测试
            type = 'updateTheTargetScore';
            key = 'studyTimeSectionId';
          } else if (String(this.recordingType.markQuestiontype) === '2') { // 阶段测试
            type = 'updateTheStageScore';
            key = 'stageId';
          } else if (isOutLine) { // 大纲视图
            type = 'updateTheTargetScore';
            key = 'studyTimeSectionId';
          }
          if (type) {
            this.tikuService[type]({
              [key]: recordingType.id,
              score: Number(this.fraction)
            }).subscribe((res) => {
              if (res.status === 200) {
                observer.next(true);
              } else {
                this.message.error(res.message);
                observer.next(false);
              }
              this.observerNext(observer, null, false);
            }, err => {
              this.observerNext(observer, false);
            });
          } else {
            this.observerNext(observer, true);
          }
        } else {
          this.observerNext(observer, true);
        }
      } else {
        this.observerNext(observer, true);
      }
    });
  }

  observerNext(observer, flag, next = true) {
    if (next) {
      observer.next(flag);
    }
    observer.complete();
    observer.unsubscribe();
  }

  preStep() {
    this.currentIndex--;
  }

  changeStep(i) {
    this.currentIndex = i;
  }

  ngOnInit() {
  }

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    console.log('Button ok clicked!');
    this.isVisible = false;
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isVisible = false;
  }


  submitAnswer() {
    this.notification.lookAnswer.emit(this.currentIndex);
  }


  private getRecord(param) {
    return ToolsUtil.getAjax(`${environment.paperApi}api/getExamedRecord`, param);
  }

  private convertData(data) {
    try {
      let record;
      const result1 = JSON.parse(data[0]);
      if (result1.code === 200) {
        record = result1.data.examRecords.answers;
      }

      const paperDataCache = data[1].data;
      const paperData = paperDataCache.groups;
      const {param1, param2, param3, param4, param5, param6, param7, param8, param9, param10} = paperDataCache.paper;
      this.paramExpand = {param1, param2, param3, param4, param5, param6, param7, param8, param9, param10};

      const {markQuestion} = this;
      const recordIds = Object.keys(record);
      const recordLength = recordIds.length;

      // 还原答案
      LocalStorageUtil.putAnswers(record);
      recordIds.forEach((item) => { // 做题答案
        paperData.every((paperItem, paperItemIndex) => {  // 试卷题目
          return this.enumKey.every((itemP) => {
            if (paperItem[itemP]) {
              if (paperItem[itemP].id === item) { // 找到对应题目
                // 收集做过题目
                if (markQuestion.length) {
                  if (markQuestion.every((question, j) => {
                    if (question.knowledgePointCode === paperItem.knowledgePointCode) {
                      this.markQuestion[j][itemP] = paperItem[itemP];
                    } else {
                      return true;
                    }
                  })) {
                    this.markQuestion.push({
                      [itemP]: paperItem[itemP],
                      knowledgePointCode: paperItem.knowledgePointCode
                    });
                  }
                } else {
                  this.markQuestion.push({
                    [itemP]: paperItem[itemP],
                    knowledgePointCode: paperItem.knowledgePointCode
                  });
                }
                // 根据做题答案回显每道题回填isCorrect
                paperData[paperItemIndex][itemP].isCorrect = record[item].isCorrect;
                // 根据正确答案回填isSuccess
                const correctAnswer = atob(paperItem[itemP].answer).split(',');
                correctAnswer.forEach((userasw) => {
                  paperData[paperItemIndex][itemP].questionOptions.every(((answer, innerIndex) => {
                    if (userasw === answer.answerOption) {
                      paperData[paperItemIndex][itemP].questionOptions[innerIndex].isSuccess = true;
                    } else {
                      return true;
                    }
                  }));
                });
                // 获取用户答案
                const userAns = record[item].userAnswer.split(',');
                // 获取用户答错的
                const errorAnswer = [];
                userAns.forEach((userAnswerItem) => {
                  paperData[paperItemIndex][itemP].questionOptions.forEach(((answerX, innerIndexX) => {
                    if (userAnswerItem === answerX.answerOption) {
                      paperData[paperItemIndex][itemP].questionOptions[innerIndexX].isSelect = true;
                    }
                  }));
                  if (correctAnswer.indexOf(userAnswerItem) < 0) {
                    errorAnswer.push(userAnswerItem);
                  }
                });
                // 根据用户答错的回填isError
                errorAnswer.forEach((userasw) => {
                  paperData[paperItemIndex][itemP].questionOptions.every(((answer, innerIndex) => {
                    if (userasw === answer.answerOption) {
                      paperData[paperItemIndex][itemP].questionOptions[innerIndex].isError = true;
                    } else {
                      return true;
                    }
                  }));
                });
              } else {
                return true;
              }
            } else {
              return true;
            }
          });
        });
      });

      this.smartQuestion = paperData;
      if (recordLength) {
        const recordLastId = this.getLastId(recordIds);
        // 找到下一个currentIndex/currenType
        this.smartQuestion.every((item, itemi) => {
          return this.enumKey.every(itemx => {
            if (item[itemx]) {
              if (item[itemx].id === recordLastId) {
                if (
                  (itemx !== 'mediumQuestion')
                  ||
                  ((Number(item[itemx].isCorrect) === 0 && !item.easyQuestion)
                    ||
                    (Number(item[itemx].isCorrect) === 2 && !item.difficultQuestion))
                ) { // 下一个知识点
                  this.currentIndex = itemi + 1;
                  this.currenType = 'mediumQuestion';
                } else { // 当前知识点下一道题
                  this.currentIndex = itemi;
                  if (Number(item[itemx].isCorrect) === 2) {
                    this.currenType = 'difficultQuestion';
                  } else {
                    this.currenType = 'easyQuestion';
                  }
                }
              } else {
                return true;
              }
            } else {
              return true;
            }
          });
        });
        // 收集做过题目知识点
        new Array(this.currentIndex).fill(0).forEach((xx) => {
          this.knowledgePointsParam[this.smartQuestion[xx].knowledgePointCode] = true;
        });
      }
      const {currentIndex, smartQuestion, currenType} = this;
      if ((currentIndex > smartQuestion.length - 1)
        ||
        (currentIndex === (smartQuestion.length - 1) && (!smartQuestion[currentIndex][currenType]))) {
        this.setParams();
        this.gotoViewAnswer();
      } else {
        const url = this.smartQuestion[this.currentIndex][this.currenType].videoAnalysis;
        this.videoAnalysis = url ?
          this.sanitizer.bypassSecurityTrustResourceUrl(this.prefix + url) : '';
      }
    } catch (e) {
      this.errorMessage('获取试卷信息出错，请稍后再试');
    }
  }

  getTips() {
    if (!this.tips) {
      if (!this.paperUuid) {
        this.tips = '正在获取信息中...';
      } else {
        this.tips = '正在获取信息中...';
      }
    }
    return this.tips;
  }

  showModalEmit(flag: boolean) {
    this.isPreviewpolyway = flag;
  }


  // 获取当前题目索引
  getCurrentNumber() {
    const {smartQuestion, currentIndex, currenType} = this;
    let current = 0;
    smartQuestion.every((item, j) => {
      if (currentIndex >= j) {
        if (item.easyQuestion || item.difficultQuestion) { // 一个知识点多道题
          if (currentIndex === j) { // 最后一个知识点
            if (currenType === 'mediumQuestion') {
              current += 1;
            } else {
              current += 2;
            }
          } else {  // 除了最后的前面知识点
            if ((String(item.mediumQuestion.isCorrect) === '0' && !item.easyQuestion)
              ||
              (String(item.mediumQuestion.isCorrect) === '2' && !item.difficultQuestion)) {
              current += 1;
            } else {
              current += 2;
            }
            return true;
          }
        } else { // 一个知识点一道题
          current += 1;
          return true;
        }
      }
    });
    return current;
  }

// 获取所有题目数 todo:如果是有两道题的情况那么无法确定总共会做多少题目
  getTotalQuestionNumber() {
    let total = this.smartQuestion.length;
    this.smartQuestion.forEach(question => {
      if (Object.keys(question).length > 2) { // 如果一个知识点有多道题
        // if (!((String(item.mediumQuestion.isCorrect) === '0' && !item.easyQuestion)
        //    ||
        //    (String(item.mediumQuestion.isCorrect) === '2' && !item.difficultQuestion))) {
        total += 1;
        // }
      }
    });
    return total;
  }


  ifLastQuestion() {
    const {currentIndex, smartQuestion, currenType} = this;
    const flag = (currentIndex === (smartQuestion.length - 1)) &&
      ((currenType !== 'mediumQuestion')
        ||
        (smartQuestion[currentIndex].mediumQuestion.isCorrect === '0' && !smartQuestion[currentIndex].easyQuestion)
        ||
        (smartQuestion[currentIndex].mediumQuestion.isCorrect === '2' && !smartQuestion[currentIndex].difficultQuestion)
      );
    return flag;
  }

  getLastStatus(fn) {
    fn(this.ifLastQuestion());
  }

  private getLastId(recordIds: string[]) {
    const arr = recordIds.map((recordId) => {
      const obj: any = {};
      this.smartQuestion.every((item, itemI) => {
        return this.enumKey.every((inner, innerIndex) => {
          if (item[inner]) {
            if (item[inner].id === recordId) {
              obj.currentIndex = itemI;
              obj.currentType = inner;
              obj.id = recordId;
            } else {
              return true;
            }
          } else {
            return true;
          }

        });
      });
      return obj;
    });
    arr.sort((a, b) => {
      if (a.currentIndex > b.currentIndex) {
        return 1;
      }
      if (a.currentIndex < b.currentIndex) {
        return -1;
      }
      return 0;
    });
    // 找到当前currentIndex/currentType
    const lastArr = arr.filter(e => e.currentIndex === arr[arr.length - 1].currentIndex);
    if (lastArr.length > 1) {
      return lastArr.filter(e => e.currentType !== 'mediumQuestion')[0].id;
    } else {
      return lastArr[0].id;
    }
  }
}
