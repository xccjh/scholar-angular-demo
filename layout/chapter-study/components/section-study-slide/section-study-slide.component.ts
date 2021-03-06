import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Router} from '@angular/router';
import {MyClassService} from 'src/app/busi-services/my-class.service';
import {ActivatedRoute} from '@angular/router';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {AliOssService} from 'core/services/ali-oss.service';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {ToolsUtil} from 'core/utils/tools.util';

@Component({
  selector: 'app-section-study-slide',
  templateUrl: './section-study-slide.component.html',
  styleUrls: ['./section-study-slide.component.less'],
})
export class SectionStudySlideComponent implements OnInit {
  @Input() isSmart: any = '1';
  @Input() isChapter: any = '2';
  @Input() chapterStudyData: any = {};
  @Input() studyVideo: any = {};
  @Output() videoData = new EventEmitter<any>();
  @Output() teacherTab = new EventEmitter<any>();
  user = LocalStorageUtil.getUser();
  isVisible = false;
  click = false;
  modelTitle = '';
  selectQuestionData: any = {};
  selectQuestionDataNew: any = {};
  sectionId = '';
  modelLoading = false;
  title;
  curProgress;
  status;
  courseId;
  professionId;
  coursePacketId;
  lessonCount;
  code;
  teachType;
  auditStatus;
  preview;
  createrId;
  pcode;
  knowledgeSubjectId;
  private orgCode = ToolsUtil.getOrgCode();

  constructor(
    private router: Router,
    private aliOss: AliOssService,
    private message: NzMessageService,
    private myClassService: MyClassService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.initParams();
    this.route.paramMap.subscribe(param => {
      this.sectionId = param.get('sectionId');
    });
  }

  initParams() {
    const {
      name, curProgress, status, courseId, professionId, id, lessonCount, isSmart, code,
      teachType, auditStatus, preview, createrId, pcode, knowledgeSubjectId
    }
      = SessionStorageUtil.getPacketInfo();
    this.title = name; // ????????????
    this.curProgress = Number(curProgress);
    this.status = status; // ????????????
    this.courseId = courseId; // ??????id
    this.professionId = professionId; //  ??????id
    this.coursePacketId = id; //  ??????
    this.lessonCount = Number(lessonCount); // ??????
    this.isSmart = isSmart; // ?????????
    this.code = code; // ????????????
    this.teachType = teachType; // ????????????: ????????????(11)???????????????(12)???????????????(21)???????????????(22)
    this.auditStatus = auditStatus; // ??????????????????
    this.preview = preview;
    this.createrId = createrId;
    this.pcode = pcode;
    this.knowledgeSubjectId = knowledgeSubjectId;
  }

  download(data) {
    this.aliOss.download(data);
  }

  videoTab(data) {
    this.videoData.emit(data);
  }

  teachTab() {
    this.teacherTab.emit(true);
  }

  gotoKnowledgeStudy(points: any) {
    window.open(`#/chapter-study/1/${points.code}`);
  }

  async toConfirm(title: string) {
    if (this.click) {
      return false;
    }
    this.click = true;
    if (this.chapterStudyData.points.length === 0) {
      this.message.info('??????????????????');
      this.click = false;
      return false;
    }
    this.modelTitle = title;
    const codeUid = await ToolsUtil.getProdIdSync();
    const params = {
      konwledges: this.chapterStudyData.points.map((item) => {
        return item.code;
      }).join(),
      experiences: this.chapterStudyData.points.map((item) => {
        return item.experienceValue;
      }).join(),
      userId: '888888',
      courseCode: this.code,
      proId: codeUid,
      taskType: '6',
      coursePacketId: this.coursePacketId
    };
    const result = await this.myClassService.getExamDayStage(this.coursePacketId).toPromise();
    if (result.status !== 200) {
      this.click = false;
      return false;
    }
    const subModule = await this.myClassService.getsubModule(this.coursePacketId).toPromise();
    if (subModule.status == 200) {
      params['submoduleIds'] = subModule.data.filter(e => String(e.busType) === '2').map(ee => ee.quebankId).join(',');
    } else {
      this.click = false;
      return false;
    }
    this.myClassService.selectQuestion(params, result.data.stage).subscribe((res) => {
      this.click = false;
      if (res.status === 200) {
        if (res.data.groups.length === 0) {
          this.message.warning('????????????');
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
    this.modelLoading = true;
    const params = {
      sectionId: this.sectionId,
      passUuid: this.selectQuestionData.paperUuid
    };
    this.myClassService.saveSectionLearnUUID(params).subscribe((res) => {
      this.modelLoading = false;
      if (res.status === 200) {
        this.isVisible = false;
        this.exercise('????????????');
      }
    });
  }

  exercise(type?: string) {
    const markQuestionRecording = LocalStorageUtil.getMarkQuestionRecording();
    LocalStorageUtil.setExerciseKey(
      this.code,
      this.chapterStudyData.points,
      ['????????????', '????????????'].includes(this.modelTitle) ? this.selectQuestionData.paperUuid : this.chapterStudyData.paperUuid,
      ['????????????', '????????????'].includes(this.modelTitle) ? this.selectQuestionData.tpaperId : this.chapterStudyData.paperUuid,
    );
    LocalStorageUtil.setBackUrl(window.location.hash.replace('#', ''));
    if (markQuestionRecording) {
      if (this.modelTitle == '????????????') {
        if (markQuestionRecording.markQuestiontype !== '4') {
          markQuestionRecording.markQuestiontype = '4';
          LocalStorageUtil.putMarkQuestionRecording(markQuestionRecording);
        }
      } else if (markQuestionRecording.from !== markQuestionRecording.markQuestiontype) {
        markQuestionRecording.markQuestiontype = markQuestionRecording.from;
        LocalStorageUtil.putMarkQuestionRecording(markQuestionRecording);
      }
    }
    LocalStorageUtil.putQuestionInit('1');
    LocalStorageUtil.putPaperTotal(this.selectQuestionDataNew);
    this.router.navigateByUrl(`/exercise-bank`);

  }

}
