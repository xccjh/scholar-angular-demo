import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import {MyClassService} from 'src/app/busi-services/my-class.service';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {ToolsUtil} from 'core/utils/tools.util';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';

@Component({
  selector: 'app-knowledge-study-slide',
  templateUrl: './knowledge-study-slide.component.html',
  styleUrls: ['./knowledge-study-slide.component.less']
})
export class KnowledgeStudySlideComponent implements OnInit {
  @Input() knowledge: any = {};
  @Input() studyVideo: any = {};
  @Output() knowledgeTab = new EventEmitter<any>();
  title;
  curProgress;
  status;
  courseId;
  professionId;
  coursePacketId;
  lessonCount;
  isSmart;
  code;
  teachType;
  auditStatus;
  preview;
  createrId;
  pcode;
  knowledgeSubjectId;
  user = LocalStorageUtil.getUser();
  selectQuestionData: any = {};
  selectQuestionDataNew: any = {};
  isVisible = false;
  click = false;

  constructor(
    private router: Router,
    private message: NzMessageService,
    private myClassService: MyClassService,
  ) {
  }

  ngOnInit(): void {
    this.initParams();
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

  async gotoExerciseBank() {
    if (this.click) {
      return false;
    }
    this.click = true;
    const codeUid = await ToolsUtil.getProdIdSync();
    const params = {
      konwledges: this.knowledge.detail.code,
      experiences: this.knowledge.detail.experienceValue,
      userId: '888888',
      courseCode: this.code,
      proId: codeUid,
      // typeIds:'',
      taskType: '6',
      coursePacketId: this.coursePacketId
    };
    const result = await this.myClassService.getExamDayStage(this.coursePacketId).toPromise();
    if (result.status !== 200) {
      this.click = false;
      return false;
    }
    const subModule = await this.myClassService.getsubModule(this.coursePacketId).toPromise();
    if (subModule.status === 200) {
      params['submoduleIds'] = subModule.data.filter(e => String(e.busType) === '2').map(ee => ee.quebankId).join(',');
    } else {
      this.click = false;
      return false;
    }


    this.myClassService.selectQuestion(params, result.data.stage).subscribe((res) => {
      this.click = false;
      if (res.status === 200) {
        if (res.data.groups.length === 0) {
          this.message.warning('暂无题目');
          return false;
        }
        this.selectQuestionData['quesNums'] = res.data.groups.length;
        this.selectQuestionData['paperUuid'] = res.data.paper.uuid;
        this.selectQuestionData['tpaperId'] = res.data.paper.id;
        this.isVisible = true;
        this.selectQuestionDataNew = res.data;
      } else {
        this.message.warning(res.msg);
      }
    });

  }

  handleOk() {
    this.isVisible = false;
    LocalStorageUtil.setExerciseKey(
      this.code,
      [this.knowledge.detail],
      this.selectQuestionData.paperUuid,
      this.selectQuestionData.tpaperId,
    );
    LocalStorageUtil.putQuestionInit('1');
    LocalStorageUtil.putPaperTotal(this.selectQuestionDataNew);
    LocalStorageUtil.setMilestones({});
    LocalStorageUtil.putMarkQuestionRecording({});
    LocalStorageUtil.setBackUrl(window.location.hash.replace('#', ''));
    this.router.navigateByUrl(`/exercise-bank`);
  }

  keyLevel(keyLevel) {
    if (keyLevel < 1) {
      return [];
    }
    const a = new Array(keyLevel);
    return a;
  }

  gotoKnowledgeStudy(points: any) {
    window.open(`#/chapter-study/1/${points.code}`, '_self');
    this.knowledgeTab.emit(points.code);
  }

  expPipe(value: any) {
    switch (value) {
      /** 未学习 */
      case 0:
        return 'not';
      /** 待加强 */
      case 1:
      case 2:
        return 'need';
      /** 已掌握 */
      case 3:
        return 'well';
    }
  }
}
