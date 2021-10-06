import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChange,
  Output,
  EventEmitter,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NotifyService} from 'core/services/notify.service';
import {ToolsUtil} from 'core/utils/tools.util';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {Subscription} from 'rxjs';
import {TikuService} from '@app/busi-services/tiku.service';
import {letterMapping} from 'core/base/static-data';
import {environment} from 'src/environments/environment';


@Component({
  selector: 'app-smart-question',
  templateUrl: './smart-question.component.html',
  styleUrls: ['./smart-question.component.less']
})
export class SmartQuestionComponent implements OnInit, OnDestroy, OnChanges {
  @Input() maxScreen = true;
  @Input() data = [];
  @Input() idx = 0; // 当前知识点索引
  @Input() current = 1; // 当前题目数
  @Input() knowledgePointsParam = {};
  @Input() currenType = 'mediumQuestion';
  @Input() markQuestion = []; // 已做过的题目
  @Input() smartQuestion = [];
  @Input() paramExpand = {};
  @Input() paperId: any;
  @Input() paperUuid: any;
  @Input() videoAnalysis: any;
  @Input() isPreviewpolyway = false;
  @Input() submitted = {
    flag: false
  };
  answer = {}; // 本个知识点答案
  name: any; // 当前题目知识点
  answers: any = {}; // 用户做题答案合计
  enumKey = ['mediumQuestion', 'easyQuestion', 'difficultQuestion'];
  private loginSignInfo = LocalStorageUtil.getUser();
  private notificat$: Subscription;
  private userAnswers: string; // 用户本道题填写答案
  @Output() updateRecord: EventEmitter<null> = new EventEmitter<null>();
  @Output() showModalEmit = new EventEmitter<any>();
  @Output() isLast = new EventEmitter();


  constructor(private message: NzMessageService,
              private notification: NotifyService,
              private tikuService: TikuService,
  ) {
  }

  ngOnInit() {
    this.notificat$ = this.notification.lookAnswer.subscribe(res => {
      this.lookAnswer(res);
    });
    this.initInfo();
  }

  ngOnChanges(changes: SimpleChanges) {
    // if (changes.idx !== undefined && !changes.firstChange) {
    //   debugger
    //   this.initInfo()
    // }
  }

  ngOnDestroy() {
    this.notificat$.unsubscribe();
  }

  initInfo() {
    const knowledgesQuestion = this.smartQuestion[this.idx];
    this.enumKey.forEach((key) => {
      if (knowledgesQuestion[key]) {
        if (knowledgesQuestion[key].questionOptions) {
          if (!knowledgesQuestion[key].questionOptions.length) {
            this.addOption(key);
          }
        } else {
          this.smartQuestion[this.idx][key].questionOptions = [];
          this.addOption(key);
        }
        this.answer[key] = window.atob(knowledgesQuestion[key].answer);
        if (typeof letterMapping[this.answer[key].split(',')[0]] !== 'number') {
          this.message.error('试卷信息出错，选项中找不到答案');
        }
      }
    });
    this.getDetailsOfKnowledgePoints();
  }

  addOption(key) {
    this.smartQuestion[this.idx][key].questionOptions.push({
      answerOption: 'A',
      answerContent: '正确',
    });
    this.smartQuestion[this.idx][key].questionOptions.push({
      answerOption: 'B',
      answerContent: '错误',
    });
  }

  getDetailsOfKnowledgePoints(index?, currenType?) {
    this.tikuService.getDetailsOfKnowledgePoints(this.smartQuestion[index || this.idx][currenType || this.currenType].param8).subscribe(res => {
      if (res.status === 200) {
        if (res.data && res.data.name) {
          this.name = res.data.name;
        } else {
          this.name = '知识点';
        }
        this.knowledgePointsParam[this.smartQuestion[this.idx][this.currenType].param8] = true;
      }
    });
  }

  paperSubmit() {
    const {currenType, idx, smartQuestion, markQuestion} = this;
    const questionsInfo = smartQuestion[idx][currenType];
    const knowledgePointCode = smartQuestion[idx].knowledgePointCode;
    const typeId = questionsInfo.typeId;
    const questionId = questionsInfo.id;
    const userAnswer = this.userAnswers;
    const initAnswer = atob(questionsInfo.answer);
    let score = 0;
    if (questionsInfo.isCorrect === '2') {
      score = this.getScore(typeId);
    }
    // 收集做题题目
    if (markQuestion.length) {
      if (markQuestion.every((question, j) => {
        if (question.knowledgePointCode === knowledgePointCode) {
          this.markQuestion[j][currenType] = questionsInfo;
        } else {
          return true;
        }
      })) {
        this.markQuestion.push({
          [currenType]: questionsInfo,
          knowledgePointCode
        });
      }
    } else {
      this.markQuestion.push({
        [currenType]: questionsInfo,
        knowledgePointCode
      });
    }
    this.answers = LocalStorageUtil.getAnswers();
    this.answers[questionId] = {
      typeId,
      userAnswer,
      initAnswer,
      score,
      isCorrect: questionsInfo.isCorrect
    };
    LocalStorageUtil.putAnswers(this.answers);

    const answersJson: any = {
      uid: '888888',
      paperUuid: this.paperUuid,
      redo: 2,
      answers: this.answers,
      ...this.paramExpand
    };
    this.isLast.emit((flag) => {
      if (flag) {
        answersJson.redo = 0;
      }
      const params = {
        uid: '888888',
        paperUuid: this.paperUuid,
        answersJson: JSON.stringify(answersJson),
      };
      ToolsUtil.postAjax(`${environment.paperApi}api/submitPaper`, params).subscribe((res) => {
        try {
          const result = JSON.parse(res);
          if (result.code === 200) {
            if (flag) {
              this.updateRecord.emit();
            } else {
              this.submitted.flag = true;
            }
          } else {
            this.message.error(result.message);
          }
        } catch (e) {
          this.message.error(res || e);
        }
      });
    });
  }


  private getScore(type) {
    switch (Number(type)) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 7:
        return 2;
      case 5:
        return 1;
      default:
        return 1;
    }
  }

  private getUserAnswer(ee: any) {
    const arr = [];
    this.smartQuestion[ee].questionOptions.forEach(e => {
      if (e.isSelect) {
        arr.push(e.answerOption);
      }
    });
    return arr;
  }


// 记录做题情况到option
  recordTheProblemz(currentItem, answer) {
    const {currenType} = this;
    // 用户答案
    this.userAnswers = answer[currenType].join(',');
    // 回显正确答案
    if (this.answer[currenType].length > 2) {
      this.answer[currenType].split(',').forEach((item) => {
        currentItem[currenType].questionOptions[letterMapping[item]].isSuccess = true;
      });
    } else {
      currentItem[currenType].questionOptions[letterMapping[this.answer[currenType]]].isSuccess = true;
    }
    // 记录做题情况
    if (this.answer[currenType].split(',').sort().join(',') === this.userAnswers) {
      currentItem[currenType].isCorrect = '2'; // 正确
    } else {
      currentItem[currenType].isCorrect = '0'; // 错误
      currentItem[currenType].questionOptions.forEach((e, ii) => {
        if (e.isSelect && (!e.isSuccess)) {
          currentItem[currenType].questionOptions[ii].isError = true;
        }
      });
    }
  }

// 收集答案到answer
  collectAnswers(currentItem, answer) {
    currentItem[this.currenType].questionOptions.forEach(e => {
      if (e.isSelect) {
        answer[this.currenType].push(e.answerOption);
      }
    });
    if (!answer[this.currenType].length) {
      this.message.warning('请先选择你的预期答案');
      return true;
    }
    if (currentItem[this.currenType].typeId === '2' && answer[this.currenType].length < 2) {
      this.message.warning('该题是多选题,请至少选择两个选项');
      return true;
    }
  }

  // 提交答案一条龙
  oneStopAnswerSubmission(currentItem, answer) {
    if (!this.collectAnswers(currentItem, answer)) {
      this.recordTheProblemz(currentItem, answer);
      this.paperSubmit();
    }
  }

  lookAnswer(idx) {
    const answer = {
      mediumQuestion: [],
      difficultQuestion: [],
      easyQuestion: []
    };
    const currentItem = this.smartQuestion[this.idx];
    this.oneStopAnswerSubmission(currentItem, answer);
  }

  // 记录答案
  clickItem(item, idx) {
    const currentItem = this.smartQuestion[this.idx];
    const {questionOptions, typeId} = currentItem[this.currenType];
    if (typeId === '3' || typeId === '1') { // 单选，判断
      questionOptions.forEach((res, i) => {
        currentItem[this.currenType].questionOptions[i].isSelect = false;
      });
      item.isSelect = true;
    } else if (typeId === '2' || typeId === '7') { // 多选，双选
      if (item.isSelect) {
        item.isSelect = false;
      } else {
        item.isSelect = true;
      }
    }
  }

  ifSelect(item) {
    return item.isSelect;
  }

  ifSuccess(item) {
    return item.isSuccess;
  }

  ifError(item: any) {
    return item.isError;
  }


  answerCorrect(idx) {
    return Number(this.smartQuestion[idx][this.currenType].isCorrect) === 0;
  }

  answerError(idx) {
    return Number(this.smartQuestion[idx][this.currenType].isCorrect) === 2;
  }

  showModal() {
    this.showModalEmit.emit(true);
  }

  getColor() {
    return '#00AB84';
  }

  getKnoColor() {
    return '#e1f2ed';
  }
}
