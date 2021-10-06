import {Component, OnInit, Input, OnChanges, SimpleChange, Output, EventEmitter} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd/message';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {DomSanitizer} from '@angular/platform-browser';
import {environment} from 'src/environments/environment';
import {TikuService} from '@app/busi-services/tiku.service';

@Component({
  selector: 'app-view-answer',
  templateUrl: './view-answer.component.html',
  styleUrls: ['./view-answer.component.less']
})
export class ViewAnswerComponent implements OnInit {
  fraction: string;
  successModal = false;
  questions = [];
  smartQuestion = [];
  isVisible = false;
  currentIndex = 0;
  currenType = 'mediumQuestion';
  exercise = JSON.parse(LocalStorageUtil.getExerciseKey());
  knowledgeList = this.exercise.data;
  correctKnowledges = [];
  errorKnowledges = [];
  knowledgePointsParam = '';
  recordingType;
  StringI = String;
  isPass;
  currentStage; // 当前阶段
  nextTarget; // 下一目标
  nextStage; // 下一阶段
  isLastStage; // 最后阶段
  isLastTarget; // 是否最后目标
  videoAnalysis;
  passRecord = false;
  isPreviewpolyway = false;
  enumKey = ['mediumQuestion', 'easyQuestion', 'difficultQuestion'];
  private prefix = environment.ow365.substr(0, environment.ow365.length - 5) + 'polywayId=';


  constructor(private router: Router,
              private route: ActivatedRoute,
              private tikuService: TikuService,
              private message: NzMessageService,
              private sanitizer: DomSanitizer
  ) {

  }

  ngOnInit() {
    this.smartQuestion = LocalStorageUtil.getAnswersInfo(); // 试卷信息
    this.fraction = this.route.snapshot.queryParamMap.get('fraction'); //  闯关分数
    this.questions = Array(Number(this.route.snapshot.queryParamMap.get('questions'))).fill(0); // 题目数量
    this.knowledgePointsParam = this.route.snapshot.queryParamMap.get('knowledgePointsParam'); // 试卷知识点
    this.recordingType = LocalStorageUtil.getMarkQuestionRecording(); // 做题入口类型，1目标闯关,2阶段测验,3大纲做题
    this.getKnowledgePointData();
    const {recordingType} = this;
    // 录播大纲，目标或阶段
    if (recordingType.id && LocalStorageUtil.getSelectedCourse().teachType === '22') {
      let type;
      let key;
      const isOutline = String(recordingType.markQuestiontype) === '3';
      if (String(recordingType.markQuestiontype) === '1') {
        type = 'goalBreakthrough';
        key = 'studyTimeSectionId';
      } else if (String(recordingType.markQuestiontype) === '2') {
        type = 'stageTest';
        key = 'stageId';
      } else if (isOutline) {
        type = 'goalBreakthrough';
        key = 'studyTimeSectionId';
      }
      if (type) {
        this.passRecord = true;
        this.tikuService[type]({
          [key]: recordingType.id,
          passScore: Number(this.fraction)
        }).subscribe((res) => {
          if (res.status === 200) {
            if (Number(res.data.isPass) === 0 && this.fraction && Number(this.fraction) >= 75) {
              this.tikuService[type]({
                [key]: recordingType.id,
                isPass: '1',
                passScore: Number(this.fraction)
              }).subscribe((resT) => {
                this.passRecord = false;
                if (resT.status === 200) {
                  this.currentStage = resT.data.currentStage;
                  this.isPass = resT.data.isPass;
                  if (String(this.recordingType.markQuestiontype) !== '2') { // 目标闯关
                    this.nextTarget = resT.data.nextTarget;
                    this.isLastTarget = resT.data.isLastTarget;
                  } else {
                    this.nextStage = resT.data.nextStage;
                    this.isLastStage = resT.data.isLastStage;
                  }
                  this.successModal = true;
                } else {
                  this.message.error(resT.message);
                }
              }, err => {
                this.passRecord = false;
                this.message.error('更新闯关信息失败');
              });
            } else {
              this.passRecord = false;
            }
          } else {
            this.message.error(res.message);
          }
        }, () => {
          this.passRecord = false;
          this.message.error('获取闯关信息失败');
        });
      }
    }
    // // 录播做题通过了要记录分数更新闯关状态和分数并弹框
    // if (Number(this.fraction) >= 75 // 通过了
    //   && LocalStorageUtil.getSelectedCourse().teachType === '22' // 录播
    //   && this.recordingType
    //   && this.recordingType.markQuestiontype
    //   && String(this.recordingType.markQuestiontype) !== '3' // 说明为目标，阶段闯关, 而针对训练,大纲不需要弹框
    //   && ((this.statge < this.statgeTotal) // 阶段测试用
    //     ||
    //     (this.statge === this.statgeTotal && this.target <= this.targetTotal && (this.target !== 0 && this.targetTotal !== 0))) // 目标闯关用
    // ) {
    //   if (update && Number(update) === 1) {
    //     if (this.target === this.targetTotal && String(this.recordingType.markQuestiontype) === '1') { // 目标闯关提示阶段测试解锁
    //       this.target = -1;
    //       this.statge -= 1;
    //     } else if (String(this.recordingType.markQuestiontype) === '2') { // 阶段测试提示下一阶段解锁
    //       this.target = 0;
    //     } else {
    //       if (this.target) {  // 目标闯关提示下一目标解锁
    //         this.statge -= 1;
    //       }
    //     }
    //   }
    // }
  }

// 再次训练
  trainAgain() {
    // 目标,大纲循环做题需要更新uuid,因为他们有继续闯关，大纲做题通关目标也解锁
    const {recordingType} = this;
    if (recordingType && recordingType.markQuestiontype &&
      (String(recordingType.markQuestiontype) !== '4' || String(recordingType.markQuestiontype) !== '2')) {
      this.trainAgainReal(true);
    } else {
      this.trainAgainReal(false);
    }
  }


  trainAgainReal(update) {
    this.getKnowledgePointsDetail().then(flag => {
      if (flag) {
        LocalStorageUtil.setExerciseKey(this.exercise.courseCode, this.exercise.data, '', '');
        LocalStorageUtil.putQuestionInit('0');
        if (update) {
          this.router.navigateByUrl('/exercise-bank?update=1');
        } else {
          this.router.navigateByUrl('/exercise-bank');
        }
      }
    });
  }

// 更新知识点经验值
  getKnowledgePointsDetail() {
    return new Promise((resolve) => {
      const {recordingType} = this;
      if (!(recordingType && String(recordingType.markQuestiontype) === '4')) { // 只有自由闯关不需要,大纲和目标联动难度
        const info = JSON.parse(LocalStorageUtil.getExerciseKey());
        const knowledgePoints = info.data;
        const pointCodes = info.data.map(e => e.code).join(',');
        this.tikuService.getKnowledgePointsDetail(pointCodes).subscribe(res => {
          if (res.status === 200) {
            if (res.data && res.data.length) {
              res.data.forEach((item) => {
                knowledgePoints.forEach((element, i) => {
                  if (item.CODE === element.code) {
                    knowledgePoints[i].experienceValue = item.EXPERIENCEVALUE;
                  }
                });
              });
              info.data = knowledgePoints;
              this.exercise = info;
              LocalStorageUtil.setExerciseKey(info.courseCode, info.data, info.paperUuid, info.tpaperId);
              resolve(true);
            }else {
              resolve(true);
            }
          } else {
            this.message.error(res.message);
            resolve(false);

          }
        }, err => {
          this.message.error('更新知识点经验值失败');
          resolve(false);
        });
      } else {
        resolve(true);
      }
    });
  }

  showModal(i: number) {
    const info = this.getIndexType(i);
    this.currentIndex = info.smartQuestionIndex;
    this.currenType = info.smartQuestionType;
    const url = this.smartQuestion[this.currentIndex][this.currenType].videoAnalysis;
    this.videoAnalysis = url ?
      this.sanitizer.bypassSecurityTrustResourceUrl(this.prefix + url) : '';
    this.isVisible = true;
  }


  private getKnowledgePointData() {
    const knowledges = this.knowledgePointsParam.split(',');
    const knowledgeList = this.knowledgeList.filter(e => {
      return knowledges.indexOf(e.code) > -1;
    });

    let successCodes = [];
    let errorCodes = [];
    this.smartQuestion.forEach(question => {
      this.enumKey.forEach((key) => {
        if (question[key]) {
          if (Number(question[key].isCorrect) === 0) {
            errorCodes.push(question[key].param8);
          } else {
            successCodes.push(question[key].param8);
          }
        }
      });
    });
    errorCodes = Array.from(new Set(errorCodes));
    successCodes = Array.from(new Set(successCodes));
    errorCodes.forEach(e => {
      knowledgeList.every(ee => {
        if (ee.code === e) {
          this.errorKnowledges.push(ee);
        } else {
          return true;
        }
      });
    });
    this.errorKnowledges.sort((a: any, b: any) => {
      return (b.keyLevel - a.keyLevel) as number;
    });
    successCodes.forEach(e => {
      if (errorCodes.indexOf(e) < 0) {
        knowledgeList.every(ee => {
          if (ee.code === e) {
            this.correctKnowledges.push(ee);
          } else {
            return true;
          }
        });
      }
    });
    this.correctKnowledges.sort((a: any, b: any) => {
      return (b.keyLevel - a.keyLevel) as number;
    });
  }

  getLevel(keyLevel: any) {
    if (Number(keyLevel) === 0) {
      return [];
    }
    return Array(Number(keyLevel)).fill(0);
  }

  getOtherLevel(keyLevel: any) {
    if (Number(keyLevel) >= 3) {
      return [];
    }
    return Array(Number(3 - keyLevel)).fill(0);
  }

  continueStudying() {
    this.router.navigateByUrl(`/p/structure?flat=new`);
  }

  gotoKnowledgePoints(item: any) {
    this.router.navigateByUrl(`/chapter-study/1/${item.code}`);
  }

  ifRed(i: any) {
    const info = this.getIndexType(i + 1);
    return Number(this.smartQuestion[info.smartQuestionIndex][info.smartQuestionType].isCorrect) === 0;
  }

// 获取第几个知识点某个类型
  getIndexType(i) {
    let smartQuestionType = 'mediumQuestion';
    let smartQuestionIndex = 0;
    let index = 0;
    this.smartQuestion.every((item, j) => {
      const keyArr = Object.keys(item);
      index += (keyArr.length - 1);
      if (index >= i) {
        smartQuestionIndex = j;
        if (keyArr.length > 2 && (i - index + keyArr.length - 1) > 1) {
          smartQuestionType = keyArr.filter(e => (e !== 'mediumQuestion' && e !== 'knowledgePointCode'))[0];
        }
      } else {
        return true;
      }
    });
    return {
      smartQuestionType,
      smartQuestionIndex
    };
  }

  getTitle() {
    const {isLastStage} = this;
    return (isLastStage && String(isLastStage) === '1') ? '恭喜你'
      : '恭喜你，解锁' + ((isLastStage && String(isLastStage) !== '1') ? '新阶段' : '新目标');
  }

  getDetail() {
    const {isLastTarget, isLastStage, recordingType, nextStage, currentStage, nextTarget} = this;
    return (isLastStage && String(isLastStage) === '1') ? '已通过所有目标和阶段闯关' :
      (recordingType && String(recordingType.markQuestiontype) === '2') ?
        ('阶段' + nextStage + '- 目标1') : (isLastTarget && String(isLastTarget) === '1')
        ? ('阶段' + currentStage + '测试')
        : ('阶段' + currentStage + '- 目标' + nextTarget);
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


  showModalEmit(flag: boolean) {
    this.isPreviewpolyway = flag;
  }
}
