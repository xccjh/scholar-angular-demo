import {Component, Inject, OnInit, TemplateRef, ViewChild, ViewChildren} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {ActivatedRoute} from '@angular/router';
import {MenuService} from 'core/services/menu.service';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {UploadHandoutComponent} from '../upload-handout/upload-handout.component';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {CourseStructureTreeComponent, NodeChangeEvent} from '../course-structure-tree/course-structure-tree.component';
import {AliOssService} from 'core/services/ali-oss.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {KnowledgeManageService} from 'src/app/busi-services/knowledge-manag.service';
import {queryParam, ToolsUtil} from 'core/utils/tools.util';
import {environment} from 'src/environments/environment';
import {forkJoin, Observable, Subscriber, Subscription, timer} from 'rxjs';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {hex_sha1} from 'core/utils/sha1';
import {NzSafeAny, NzSelectComponent, NzTreeNode} from 'ng-zorro-antd';
import {TrainManageService} from '@app/busi-services/train-manage.service';
import {SafeResourceUrl} from '@angular/platform-browser';
import {spaceValidator} from '@app/shared/validators/atr-validtors';
import {VideoImportComponent} from './video-import/video-import.component';
import {CallItem, HandoutItem, HttpResponseDataStandard, Json, Teacher, WjCallItem} from 'core/base/common';
import {NzTreeNodeOptions} from 'ng-zorro-antd/core/tree';
import {StatisticsLogService} from '@app/busi-services/statistics-log.service';
import {STATISTICALRULES} from 'core/base/static-data';
import {DOCUMENT} from '@angular/common';

declare const WebOfficeSDK;

@Component({
  selector: 'app-chapter-handout',
  templateUrl: './chapter-handout.component.html',
  styleUrls: ['./chapter-handout.component.less'],
})
export class ChapterHandoutComponent implements OnInit {
  //#region state
  _PAGE_ID_ = 'MaterialCallResource';
  active1 = true; // ????????????????????????
  active2 = true;
  active3 = true;
  active4 = true;
  listLoading = false;
  hanoutLoading = false;
  isStandard = false;
  totalPage = 0;
  handouts: HandoutItem[] = [];
  taskList: Json[] = [];
  curNode: NodeChangeEvent;
  handoutsMaterial: HandoutItem[] = []; // ??????
  handoutsLecture: HandoutItem[] = []; // ??????
  handoutsRecording: HandoutItem[] = []; // ??????
  teacherList: Teacher[] = [];
  modalFormRef: NzModalRef;
  exam: Array<NzTreeNode | NzTreeNodeOptions> = []; // ?????????????????????
  exercise: Array<NzTreeNode | NzTreeNodeOptions> = []; // ?????????????????????
  examSearch: Array<NzTreeNode | NzTreeNodeOptions> = []; // ???????????????????????????
  exerciseSearch: Array<NzTreeNode | NzTreeNodeOptions> = []; // ???????????????????????????
  searchLoad = false;
  examListPreview = false; // ????????????
  exerciseListPreview = false; // ????????????
  listOfData: CallItem[] = [];  // ??????????????????
  listOfDataExercise: CallItem[] = [];  // ??????????????????
  listOfQuestionnaireData: WjCallItem[] = [];
  listOfEvaluationData: WjCallItem[] = [];
  selectedValue = ''; //  ????????????????????????
  examSubQuestionBankExam = []; //  ?????????????????????
  examSubQuestionBankExamBak = []; //  ?????????????????????
  homeworkSubQuestionBank = []; //  ?????????????????????
  homeworkSubQuestionBankBak = []; //  ?????????????????????
  testPaperName = ''; // ?????????????????????
  testPaperId = ''; // ??????????????????ID
  testExerciseName = ''; // ?????????????????????
  testExerciseId = ''; // ??????????????????ID
  polywayId: string;
  NumberS = Number;
  isPreviewpolyway = false;
  orgCode = ToolsUtil.getOrgCode();
  value = 1; // ????????????????????????
  answerTimesValue = 1; // ????????????????????????
  isVisible = false; // ????????????
  isQuestionnaireVisible = false; // ????????????
  examSettingForm: FormGroup; // ????????????
  questionnairSettingForm: FormGroup; // ????????????
  addJobFromSeting: FormGroup; // ????????????
  addExamFrom: FormGroup; // ????????????
  polyway: FormGroup; //  ?????????id??????
  localVideo: FormGroup; // ?????????????????????
  visibleAssociate = false;
  currentAssocate: HandoutItem;
  assocateList = [];
  current: number; // ??????????????????
  tokenObj = LocalStorageUtil.getTkToken();
  currentExam: Json = {
    id: ''
  }; // ??????????????????????????????
  currentQuestionnair: any = {
    id: ''
  }; // ??????????????????????????????
  currentBindLength = 0;
  courseId = '';
  preview = '0';
  exerciseType = '1';
  coursePacketId = '';
  professionId = '';
  title: string;
  status: '0' | '1';
  auditStatus: '0' | '1' | '2' | '3' | '99';
  lessonCount = 1;
  isSmart: '0' | '1' = '0';
  code: string;
  teachType: '11' | '12' | '21' | '22';
  assocateLists = [];
  assocateClassLists = [];
  defaultSection: Json;
  defaultExpandedKeys = [];
  examType = '1';
  reset = true;
  label: 'polyway' | 'localVideo' | 'showInteraction' = 'polyway';
  resourceUrl: SafeResourceUrl = '';
  questionnairePreview = false;
  evaluationPreview = false;
  questionnaireType: string;  // ??????
  questionnaireName: string;
  evaluationType: string;  // ??????
  evaluationName: string;
  isCallLoading = false; // ??????/???????????????
  loading = false; // ????????????
  examSettingLoading = false; // ????????????
  bindLoading = false; // ????????????
  instructorLoading = false; // ????????????
  trainLoading = false; // ????????????
  queryKeywords = '1';
  queryKeywordsJob = '1';
  previewTitle = '';
  previewStart = false;
  limitTask = 1000000;
  bingLimit = 1000000;
  wps;
  wpsApplication;
  stack;
  associateing = {};
  private modalRef: NzModalRef<null>; // ??????????????????
  private curJobData: HandoutItem = {}; // ??????????????????
  private curExamData: HandoutItem = {}; // ??????????????????
  @ViewChild('polywaymodal') polywayModal: TemplateRef<null>;
  @ViewChild('localvideomodal') localVideoModal: TemplateRef<null>;
  @ViewChild('addExam') addExam: TemplateRef<null>;
  @ViewChild('addExamExit') addExamExit: TemplateRef<null>;
  @ViewChild('jobSettings') jobSettings: TemplateRef<null>;
  @ViewChild('jobSettingsEdit') jobSettingsEdit: TemplateRef<null>;
  @ViewChild('questionnaire') questionnaire: TemplateRef<null>;
  @ViewChildren(NzSelectComponent) nzSelects: NzSelectComponent;
  @ViewChild('tree') tree: CourseStructureTreeComponent;

  //#endregion

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private menuService: MenuService,
    private nzMesService: NzMessageService,
    private nzModalService: NzModalService,
    private aliOssService: AliOssService,
    private modalService: NzModalService,
    private knowledgeManageService: KnowledgeManageService,
    private trainManageService: TrainManageService,
    private courseMgService: CourseManageService,
    private statisticsLogService: StatisticsLogService,
    @Inject(DOCUMENT) private doc: Document
  ) {
    // ????????????????????????
    const currentSession = SessionStorageUtil.getSelection();
    if (currentSession) {
      this.defaultSection = JSON.parse(currentSession);
    }
    const currentChapter = SessionStorageUtil.getChapter();
    if (currentChapter) {
      this.defaultExpandedKeys = [currentChapter];
    }
  }

  ngOnInit() {
    this.initParams();
    this.initFrom();
  }

  /**
   * ??????????????????
   * @param item HandoutItem
   */
  examSetting(item: HandoutItem) {
    if (item.taskType === '4') {
      this.currentExam = item;
      this.getExamination();
    } else {
      this.questionnaireSetting(item);
    }
  }

  getExamType(type) {
    switch (String(type)) {
      case '1' :
        return '??????????????????';
      case '2' :
        return '??????????????????';
      case '3' :
        return '??????????????????';
      case '4' :
        return '??????????????????';
      case '5' :
        return '??????????????????';
      case '6' :
        return '??????????????????';
    }
  }

  /**
   * ??????????????????
   * @param item ??????Item
   */
  questionnaireSetting(item: HandoutItem) {
    this.currentQuestionnair = item;
    this.courseMgService.getExamination(item.id).subscribe(res => {
      if (res.status === 200) {
        const data = JSON.parse(JSON.stringify(res.data || {}));
        if (data.answerTimes && Number(data.answerTimes) !== 0) {
          this.answerTimesValue = data.answerTimes;
          this.questionnairSettingForm.patchValue({
            answerTimes: 1
          });
        } else {
          this.questionnairSettingForm.patchValue({
            answerTimes: 0
          });
          this.answerTimesValue = undefined;
        }
        // tslint:disable-next-line:forin
        for (const i in this.questionnairSettingForm.controls) {
          this.questionnairSettingForm.controls[i].markAsUntouched();
          this.questionnairSettingForm.controls[i].markAsPristine();
          this.questionnairSettingForm.controls[i].updateValueAndValidity();
        }
        this.isQuestionnaireVisible = true;
      }
    });
  }

  /**
   * ??????????????????
   */
  saveQuestionnaire() {
    const {answerTimes} = this.questionnairSettingForm.value;
    if (answerTimes === 1 && !(this.answerTimesValue)) {
      this.nzMesService.warning('?????????????????????????????????');
      return;
    }
    const params = {
      answerTimes: Object.is(answerTimes, 1) ? String(this.answerTimesValue) : '0',
      id: this.currentQuestionnair.id
    };
    this.courseMgService.examSetting(params).subscribe(res => {
      if (res.status === 201) {
        this.statisticsLogService.statisticsPacketInfoLog({
          name: (this.currentQuestionnair.taskType === '6' ? '??????' : '??????') + '????????????????????????',
          actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].modify,
          content: JSON.stringify(params),
        });
        this.isQuestionnaireVisible = false;
      }
    });
  }

  /**
   * ??????????????????
   */
  saveExamination() {
    if (this.examSettingForm.value.answerTimes === 1 && !(this.value)) {
      this.nzMesService.warning('?????????????????????????????????');
      return;
    }
    Object.keys(this.examSettingForm.controls).forEach(key => {
      this.examSettingForm.controls[key].markAsDirty();
      this.examSettingForm.controls[key].updateValueAndValidity();
    });
    if (this.examSettingForm.invalid) {
      return;
    }
    this.examSettingLoading = true;
    const params = JSON.parse(JSON.stringify(this.examSettingForm.value));
    if (Object.is(params.answerTimes, 1)) {
      params.answerTimes = String(this.value);
    }
    params.id = this.currentExam.id;
    this.courseMgService.examSetting(params).subscribe(res => {
      this.examSettingLoading = false;
      if (res.status === 201) {
        this.statisticsLogService.statisticsPacketInfoLog({
          name: '??????????????????????????????',
          actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].modify,
          content: JSON.stringify(params),
        });
        this.isVisible = false;
        this.getTaskList();
      }
    }, () => {
      this.examSettingLoading = false;
    });
  }

  /**
   * ??????????????????????????????
   * @param data ????????????
   * @param label ??????
   */
  conversionNode(data, label: 'exam' | 'exercise' | 'examSearch' | 'exerciseSearch') {
    if (data.length) {
      data.forEach((item, ii) => {
        if (item.sublibraryModuleList && item.sublibraryModuleList.length) {
          data[ii].children = item.sublibraryModuleList;
          data[ii].children.forEach((child, iii) => {
            data[ii].children[iii].title = child.name;
            data[ii].children[iii].key = child.id;
            data[ii].children[iii].isLeaf = true;
          });
        }
        data[ii].title = item.name;
        data[ii].key = item.code;
        if (label === 'exam' || label === 'exercise') {
          data[ii].disabled = true;
          data[ii].selectable = false;
        }
        if (!item.sublibraryModuleList || !item.sublibraryModuleList.length) {
          data[ii].isLeaf = true;
        }
      });
    }
    return data;
  }

  /**
   * ????????????
   * @param event CdkDragDrop
   * @param type ????????????
   */
  sectionDrop(event: CdkDragDrop<any[]>, type: '1' | '2' | '3' | '4') {
    const params: any = [];
    const successFn = (res: any) => {
      if (res.status !== 201) {
        this.nzMesService.error(res.message || '??????????????????????????????');
        return;
      }
    };
    const failFn = (error: any) => {
      this.nzMesService.error(JSON.stringify(error));
    };
    if (type === '3') { // ??????
      moveItemInArray(this.taskList, event.previousIndex, event.currentIndex);
      this.taskList.forEach((ee, ii) => {
        const obj: any = {};
        obj.id = ee.id;
        obj.seq = this.taskList.length - ii;
        this.taskList[ii].seq = obj.seq;
        params.push(obj);
      });
      this.courseMgService.saveOrUpdateTask(params).subscribe(successFn, failFn);
    } else {
      if (type === '1') { // ??????
        moveItemInArray(this.handoutsLecture, event.previousIndex, event.currentIndex);
        this.handoutsLecture.forEach((ee, ii) => {
          const obj: any = {};
          obj.id = ee.id;
          obj.seq = this.handoutsLecture.length - ii;
          this.handoutsLecture[ii].seq = obj.seq;
          params.push(obj);
        });
      } else if (type === '2') { // ??????
        moveItemInArray(this.handoutsRecording, event.previousIndex, event.currentIndex);
        this.handoutsRecording.forEach((ee, ii) => {
          const obj: any = {};
          obj.id = ee.id;
          obj.seq = this.handoutsRecording.length - ii;
          this.handoutsRecording[ii].seq = obj.seq;
          params.push(obj);
        });
      } else {  // ??????
        moveItemInArray(this.handoutsMaterial, event.previousIndex, event.currentIndex);
        this.handoutsMaterial.forEach((ee, ii) => {
          const obj: any = {};
          obj.id = ee.id;
          obj.seq = this.handoutsMaterial.length - ii;
          this.handoutsMaterial[ii].seq = obj.seq;
          params.push(obj);
        });
      }
      this.courseMgService.saveOrUpdate(params).subscribe(successFn, failFn);
    }
    console.log(this.handoutsRecording);
  }

  /**
   * ??????????????????
   */
  getExamination() {
    this.courseMgService.getExamination(this.currentExam.id).subscribe(res => {
      if (res.status === 200) {
        const data = JSON.parse(JSON.stringify(res.data || {}));
        // if (res.data.deadTime) {
        //   data.deadTime = new Date(res.data.deadTime);
        // }
        this.examType = data.examType;
        const obj = {
          id: data.id,
          examLength: data.examLength || 0,
          passScore: data.passScore || 0,
          paperType: data.paperType || '1',
          isRedo: (data.isRedo && String(data.isRedo)) || '0',
          // isComputer: data.isComputer || '1',
          computerType: data.computerType || '1',
          // deadTime: data.deadTime || new Date(),
          resultWay: data.resultWay || '1',
          configType: data.configType || '1'
        };
        this.examSettingForm.patchValue(obj);
        if (!Object.is(data.answerTimes, 0)) {
          this.value = data.answerTimes;
          this.examSettingForm.patchValue({
            answerTimes: 1
          });
        } else {
          this.value = undefined;
          this.examSettingForm.patchValue({
            answerTimes: 0
          });
        }
        // tslint:disable-next-line:forin
        for (const i in this.examSettingForm.controls) {
          this.examSettingForm.controls[i].markAsUntouched();
          this.examSettingForm.controls[i].markAsPristine();
          this.examSettingForm.controls[i].updateValueAndValidity();
        }
        this.isVisible = true;
      }
    });
  }

  /**
   * ????????????
   */
  private getTeacher(): void {
    this.instructorLoading = true;
    this.knowledgeManageService.getTeacher().subscribe(res => {
      this.instructorLoading = false;
      if (res.status === 200) {
        this.teacherList = res.data;
      }
    }, () => {
      this.instructorLoading = false;
    });
  }

  private initFrom(): void {
    // ????????????
    this.examSettingForm = this.fb.group({
      id: [''],
      examLength: [0, Validators.required],
      passScore: [0, Validators.required],
      // isComputer: ['1', Validators.required],
      computerType: ['1'],
      isRedo: ['0'],
      paperType: ['1'],
      answerTimes: [0, Validators.required],
      // deadTime: [new Date(), Validators.required],
      resultWay: ['1', Validators.required],
      configType: ['1', Validators.required]
    });
    this.questionnairSettingForm = this.fb.group({
      answerTimes: [1, Validators.required],
    });
    // ????????????
    this.addJobFromSeting = this.fb.group({
      id: [this.courseId],
      taskForm: ['2', Validators.required],
      name: ['????????????', [Validators.required, spaceValidator(), Validators.maxLength(50)]],
      subQuestionBank: ['', [Validators.required]]
    });
    // ????????????
    this.addExamFrom = this.fb.group({
      missionName: ['', [Validators.required, Validators.maxLength(50), spaceValidator()]],
      formingMethod: [1, [Validators.required]],
      subQuestionBank: ['', [Validators.required]]
    });
    this.polyway = this.fb.group({
      videoUrl: ['', [Validators.required]],
      authorId: ['', [Validators.required]],
      videoType: ['1', [Validators.required]],
      seq: [1, [Validators.required]],
      videoDuration: [0],
      id: [''],
      attachmentName: ['', [Validators.required, Validators.maxLength(50), spaceValidator()]]
    });
    this.localVideo = this.fb.group({
      videoUrl: [[], [Validators.required]],
      authorId: ['', [Validators.required]],
      videoType: ['1', [Validators.required]],
      seq: [1, [Validators.required]],
      id: [''],
      attachmentName: ['', [Validators.required, Validators.maxLength(50), spaceValidator()]]
    });
  }

  /**
   * ????????????
   */
  private initParams(): void {
    const {courseId, id, professionId, status, code, teachType, name, auditStatus, lessonCount, isSmart, preview, isUsed, exerciseType}
      = SessionStorageUtil.getPacketInfo();
    this.courseId = courseId;
    this.coursePacketId = id;
    this.professionId = professionId;
    this.isStandard = isUsed > 0;
    this.code = code;
    this.teachType = teachType;
    this.title = name;
    this.status = status;
    this.auditStatus = auditStatus;
    this.lessonCount = Number(lessonCount);
    this.isSmart = isSmart;
    this.preview = preview;
    this.exerciseType = exerciseType;
  }

  /**
   * ????????????
   */
  private getTaskList(): void {
    this.listLoading = true;
    const params = {
      courseSectionId: this.curNode.data.id,
    };
    this.knowledgeManageService.getTaskList(params).subscribe(res => {
      this.isCallLoading = false;
      this.listLoading = false;
      if (res.status === 200) {
        if (res.data && res.data.length) {
          this.taskList = res.data;
          this.taskList.forEach((data, i) => {
            this.taskList[i].isDownloadType = data.downloadType === '1' ? true : false;
            this.taskList[i].isNeed = data.isNeed === '1' ? true : false;
          });
          this.taskList.sort((a, b) => a.seq > b.seq ? -1 : a.seq < b.seq ? 1 :
            a.createTime > b.createTime ? -1 : a.createTime < b.createTime ? 1 : 0);
        } else {
          this.taskList = [];
        }
      }
    }, () => {
      this.listLoading = false;
      this.isCallLoading = false;
    });
  }

  /**
   * ????????????
   */
  private getHandoutFiles(): void {
    if (!this.curNode) {
      console.error('please select node');
      return;
    }
    const id = this.curNode.data.id;
    const source$ = this.courseMgService.sectionFileList_courseSectionFile(id);
    if (source$) {
      this.hanoutLoading = true;
      source$.subscribe(res => {
        this.hanoutLoading = false;
        if (res.status !== 200) {
          this.nzMesService.error(res.message);
          return;
        }
        this.handouts = res.data;
        this.handouts.forEach((data, i) => {
          this.handouts[i].isDownloadType = data.downloadType === '1' ? true : false;
        });
        this.handoutsLecture = this.getTypeData('101');
        this.handoutsMaterial = this.getTypeData('102');
        this.handoutsRecording = this.getTypeData('103');
      }, () => {
        this.hanoutLoading = false;
      });
    }
  }


  /**
   *  ?????????????????????????????????????????????
   * @param type ??????
   */
  private getTypeData(type: '101' | '102' | '103') {
    const arr = this.handouts.filter(e => {
      return e.type === type;
    }).map(ee => {
      const ext = ToolsUtil.getFileExt(ee.title);
      ee.aattachmentExt = Object.is(ext, ee.title) ? '' : ext;
      ee.attachmentName = ee.title || ee.attachmentName;
      ee.attachmentPath = ee.attachmentPath;
      ee.isMainFile = ee.isMainFile === '0' ? false : true;
      return ee;
    });
    arr.sort((a, b) => a.seq > b.seq ? -1 : a.seq < b.seq ? 1 :
      a.createTime > b.createTime ? -1 : a.createTime < b.createTime ? 1 : 0);
    return arr;
  }

  /**
   * ??????????????????
   */
  private getssocateList() {
    this.courseMgService.getssocateList(this.curNode.data.courseChapterId, this.currentAssocate.id).subscribe(res => {
      if (res.status === 200) {
        if (res.data && res.data.length) {
          this.assocateList = res.data;
          this.assocateList.forEach((e, i) => {
            this.assocateList[i].isBindAssoicate = e.pageNum ? true : false;
          });
          this.assocateLists = JSON.parse(JSON.stringify(this.assocateList));
          this.assocateClassLists = [];
          let sectionSeq;
          let innerArr = [];

          this.assocateList.forEach((ee, ii) => {
            if (!sectionSeq) {
              sectionSeq = ee.sectionSeq;
            }
            if (sectionSeq === ee.sectionSeq) {
              innerArr.push(ee);
              if (ii === this.assocateList.length - 1) {
                this.assocateClassLists.push(innerArr);
              }
            } else {
              this.assocateClassLists.push(innerArr);
              innerArr = [];
              sectionSeq = ee.sectionSeq;
              innerArr.push(ee);
              if (ii === this.assocateList.length - 1) {
                this.assocateClassLists.push(innerArr);
              }
            }
          });

          this.currentBindLength = res.data.filter(resP => {
            return resP.pageNum;
          }).length;
        } else {
          this.assocateList = [];
        }
      }
    });
  }

  /**
   * ???????????????
   * @param handout HandoutItem
   */
  previewpolyway(handout: HandoutItem) {
    this.previewTitle = '';
    this.isPreviewpolyway = true;
    this.resourceUrl = this.polywayId = handout.attachmentPath;
    this.previewStart = true;
  }

  /**
   * ????????????
   * @param handout HandoutItem
   */
  previewHandout(handout: HandoutItem) {
    if (handout.attachmentPath.indexOf('/') < 0 && handout.sourceType==='2') {
      this.previewpolyway(handout);
    } else {
      this.previewTitle = handout.attachmentName;
      this.isPreviewpolyway = false;
      this.resourceUrl = handout.attachmentPath;
      this.previewStart = true;
    }
  }

  /**
   * ????????????
   * @param type '101' | '102' | '104'
   */
  uploadHandout(type: '101' | '102' | '104') {
    const obj: Partial<UploadHandoutComponent> = {
      node: this.curNode,
      type,
    };
    let field = '';
    if (type === '104') {
      field = 'learnSet-task-action';
    } else if (type === '101') {
      field = 'learnSet-lecture-action';
    } else if (type === '102') {
      field = 'learnSet-material-action';
    } else {
      field = 'learnSet-record-action';
    }
    if (type === '101') {
      obj.seq = ToolsUtil.getMaxSeq(this.handoutsLecture);
      obj.maxSize = 100;
    } else if (type === '102') {
      obj.seq = ToolsUtil.getMaxSeq(this.handoutsMaterial);
    } else if (type === '104') {
      obj.seq = ToolsUtil.getMaxSeq(this.taskList);
    }
    if (type === '104') {
      obj.limit = this.limitTask - this.taskList.length;
    }
    const modalRef = this.nzModalService.create<UploadHandoutComponent>({
      nzTitle: '????????????',
      nzContent: UploadHandoutComponent,
      nzComponentParams: obj,
      nzFooter: null,
      nzMaskClosable: false
    });

    modalRef.afterClose.subscribe(params => {
      if (params) {
        this.statisticsLogService.statisticsPacketInfoLog({
          name: '????????????',
          actionCode: STATISTICALRULES.packetInfo[field].addCode,
          content: JSON.stringify(params),
        });
        this.getHandoutFiles();
        this.getTaskList();
      }
    });
  }

  /**
   * ????????????
   * @param node ?????????
   */
  nodeChange(node: NodeChangeEvent) {
    SessionStorageUtil.setChapter(node.data.courseChapterId);
    SessionStorageUtil.setSelection(node.data);
    this.curNode = node;
    this.getHandoutFiles();
    this.getTaskList();
  }

  // param.taskType = 2; // ???????????????????????????(0)???????????????(1)???????????????(2)???????????????(3)???????????????(4)???????????????(5)?????????(6)?????????(7)
  getDescType(param) {
    return [
      '????????????',
      '????????????',
      '????????????',
      '????????????',
      '????????????',
      '????????????',
      '??????',
      '??????',
    ][param];
  }

  /**
   * ????????????
   * @param handout  HandoutItem
   * @param task  ????????????
   */
  delHandout(handout: HandoutItem, task?: boolean) {
    this.nzModalService.confirm({
      nzTitle: '??????',
      // tslint:disable-next-line:max-line-length
      nzContent: this.isStandard ? '??????????????????????????????????????????????????????????????????????????????????????????' : `??????????????????${handout.attachmentName ? handout.attachmentName : handout.name}?????????`,
      nzOnOk: () => {
        return new Promise((resolve) => {
          const source$ = task ?
            this.courseMgService.del_courseSectionFileTask(handout.id) : this.courseMgService.del_courseSectionFile(handout.id);
          source$.subscribe(res => {
            if (res.status !== 204) {
              this.nzMesService.error(res.message);
              resolve(false);
              return;
            }
            if (task) { // ??????seq
              this.statisticsLogService.statisticsPacketInfoLog({
                name: '??????' + this.getDescType(handout.taskType),
                actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].delCode,
                content: handout.id,
              });
              const params = [];
              const successFn = (resT: any) => {
                if (resT.status !== 201) {
                  this.nzMesService.error(resT.message);
                  return;
                }
              };
              const failFn = (error: any) => {
                this.nzMesService.error(JSON.stringify(error));
              };
              this.taskList.filter(w => w.id !== handout.id).forEach((ee, ii) => {
                const obj: any = {};
                obj.id = ee.id;
                obj.seq = ii;
                params.push(obj);
              });
              if (params.length) {
                this.courseMgService.saveOrUpdateTask(params).subscribe(successFn, failFn);
              }
            } else {
              const type = handout.type;
              let desc;
              let field;
              if (type === '101') {
                desc = '??????';
                field = 'learnSet-lecture-action';
              } else if (type === '103') {
                desc = '????????????';
                field = 'learnSet-record-action';
              } else if (type === '102') {
                desc = '??????';
                field = 'learnSet-material-action';
              }
              this.statisticsLogService.statisticsPacketInfoLog({
                name: '??????' + desc,
                actionCode: STATISTICALRULES.packetInfo[field].delCode,
                content: handout.id,
              });

            }
            if (handout.isMainFile) {
              this.getTaskList();
              this.getHandoutFiles();
            } else {
              task ? this.getTaskList() : this.getHandoutFiles();
            }
            resolve(true);
          });
        });
      }
    });
  }

  /**
   * ???????????????
   * @param ifMainFile boolean
   * @param item HandoutItem
   */
  mainFileChange(ifMainFile: boolean, item: HandoutItem) {
    const work = [this.courseMgService.modifySectionResource({id: item.id, isMainFile: ifMainFile ? '1' : '0'})];
    if (ifMainFile) { // ????????????????????????????????????
      this.handoutsLecture.every((ee, ii) => {
        if (ee.isMainFile && ee.id !== item.id) {
          const param = {id: ee.id, isMainFile: '0'};
          work.push(this.courseMgService.modifySectionResource(param));
          this.handoutsLecture[ii].isMainFile = false;
        } else {
          return true;
        }
      });
    }
    forkJoin(work).subscribe(res => {
      if (res[0].status !== 201) {
        this.nzMesService.error(res[0].message);
        return;
      }
      this.statisticsLogService.statisticsPacketInfoLog({
        name: '???????????????',
        actionCode: STATISTICALRULES.packetInfo['learnSet-lecture-action'].modify,
        content: JSON.stringify({id: item.id, isMainFile: ifMainFile ? '1' : '0'}),
      });
      item.isMainFile = ifMainFile;
      this.getTaskList();
    }, err => {
      this.nzMesService.error(JSON.stringify(err));
    });
  }


  /**
   * ??????????????????
   * @param gradeType 1:???????????? ; 2:????????????
   * @param handout  HandoutItem
   */
  gradeTypeChange(gradeType: '1' | '2', handout: HandoutItem) {
    const params = {id: handout.id, gradeType, needTeacherProc: gradeType === '1' ? 0 : 1};
    this.courseMgService.modifySectionResourceTask(params).subscribe(res => {
      if (res.status !== 201) {
        this.nzMesService.error(res.message);
        return;
      }
      this.statisticsLogService.statisticsPacketInfoLog({
        name: '????????????????????????',
        actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].modify,
        content: JSON.stringify(params),
      });
      handout.gradeType = gradeType;
    }, err => {
      this.nzMesService.error(JSON.stringify(err));
    });
  }

  /**
   * ???????????????
   * @param isGrade 0 :?????????| 1 ?????????
   * @param handout HandoutItem
   */
  isGradeChange(isGrade: '' | '0' | '1', handout: HandoutItem) {
    const params = {id: handout.id, isGrade};
    this.courseMgService.modifySectionResourceTask(params).subscribe(res => {
      if (res.status !== 201) {
        this.nzMesService.error(res.message);
        return;
      }
      this.statisticsLogService.statisticsPacketInfoLog({
        name: '??????????????????????????????',
        actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].modify,
        content: JSON.stringify(params),
      });
      handout.isGrade = isGrade;
    }, err => {
      this.nzMesService.error(JSON.stringify(err));
    });
  }

  /**
   * ????????????
   * @param downloadType  0 :????????? 1 ??????
   * @param handout HandoutItem
   * @param isTask boolean
   */
  downloadChange(downloadType: '0' | '1', handout: HandoutItem, isTask?: boolean) {
    const params = {id: handout.id, downloadType};
    let source$;
    if (isTask) {
      source$ = this.courseMgService.modifySectionResourceTask(params);
    } else {
      source$ = this.courseMgService.modifySectionResource(params);
    }
    source$.subscribe(res => {
      if (res.status !== 201) {
        this.nzMesService.error(res.message);
        return;
      }
      if (isTask) {
        this.statisticsLogService.statisticsPacketInfoLog({
          name: '??????????????????????????????',
          actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].modify,
          content: JSON.stringify(params),
        });
      } else {
        this.statisticsLogService.statisticsPacketInfoLog({
          name: '????????????????????????',
          actionCode: STATISTICALRULES.packetInfo['learnSet-lecture-action'].modify,
          content: JSON.stringify(params),
        });
      }
      handout.downloadType = downloadType;
    }, err => {
      this.nzMesService.error(JSON.stringify(err));
    });
  }

  /**
   * ????????????
   * @param label ??????/?????????
   * @param reset ??????/??????
   * @param data  HandoutItem
   */
  videoUpload(label: 'localVideo' | 'polyway' | 'showInteraction', reset = true, data?: HandoutItem) {
    this.reset = reset;
    this.label = label;
    this.getTeacher();
    // tslint:disable-next-line:forin
    for (const i in this[this.getModalField(label)].controls) {
      this[this.getModalField(label)].controls[i].markAsUntouched();
      this[this.getModalField(label)].controls[i].markAsPristine();
      this[this.getModalField(label)].controls[i].updateValueAndValidity();
    }
    if (reset) {
      this[this.getModalField(label)].patchValue({
        seq: (this.handoutsRecording[0] && this.handoutsRecording[0].seq) ? (this.handoutsRecording[0].seq + 1) : 1
      });
    }
    this.modalFormRef = this.modalService.create({
      nzTitle: this.getLabel(label, reset),
      nzContent: this[this.getModalField(label) + 'Modal'],
      nzMaskClosable: false,
      nzWrapClassName: 'vertical-center-modal',
      nzCancelText: '??????',
      nzOkText: '??????',
      nzOnOk: (e) => {
        return this.comfirmUpload(label, data);
      },
      nzOnCancel: (ee) => {
        this[this.getModalField(label)].patchValue({
          videoUrl: label === 'localVideo' ? [] : '',
          authorId: '',
          videoType: '1',
          seq: 1,
          attachmentName: '',
          id: '',
        });
      },
    });
  }

  private getModalField(label: 'polyway' | 'localVideo' | 'showInteraction') {
    return  label === 'localVideo' ? 'localVideo' : 'polyway';
  }

  private getLabel(label: 'polyway' | 'localVideo' | 'showInteraction', reset: boolean): string {
    if (reset) {
      return label === 'polyway' ? '?????????' : label === 'showInteraction' ?  '????????????' : '????????????';
    } else {
      return '????????????';
    }
  }

  comfirmUpload(label: 'polyway' | 'localVideo' | 'showInteraction', data?: HandoutItem): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // tslint:disable-next-line:forin
      const realLabel = this.getModalField(label);
      for (const i in this[this.getModalField(label)].controls) {
        this[realLabel].controls[i].markAsDirty();
        this[realLabel].controls[i].updateValueAndValidity();
      }
      if (this[realLabel].invalid) {
        this.nzMesService.warning('?????????????????????????????????');
        resolve(false);
        return;
      }
      const {value} = this[realLabel];
      const {videoUrl} = value;
      const param: any = this.getParams(label, this.reset);
      if (this.reset) { // ??????
        if (label === 'polyway') {
          this.getDuration(videoUrl).subscribe((res) => {
            if (res.code === 200) {
              if (res.data.length) {
                param[0].videoLength = this.getVideoLength(res.data[0].duration);
                this.storingData(param, resolve, label, this.reset);
              } else {
                this.nzMesService.warning('????????????????????????ID');
                resolve(false);
              }
            } else {
              this.nzMesService.warning('???????????????????????????????????????');
              resolve(false);
            }
          });
        } else if (label === 'showInteraction') {
          if (!this.polyway.value.videoDuration) {
            this.nzMesService.warning('?????????????????????');
            resolve(false);
            return;
          }
          param[0].videoLength = this.polyway.value.videoDuration;
          this.storingData(param, resolve, label, this.reset);
        } else {
          param[0].videoLength =  this.getVideoLength(param[0].attachmentPath[0].videoLength);
          param[0].attachmentPath = param[0].attachmentPath[0].path;
          this.storingData(param, resolve, label, this.reset);
        }
      } else {
        if (typeof param[0].attachmentPath !== 'string') {
          param[0].attachmentPath = param[0].attachmentPath[0].path;
          param[0].resourceId = data.resourceId;
        }
        this.storingData(param, resolve, label, this.reset);
      }
    });
  }

  getParams(label: 'polyway' | 'localVideo' | 'showInteraction', reset: boolean) {
    const {courseId, coursePacketId} = this;
    const {id, courseChapterId} = this.curNode.data;
    const {value} = this[this.getModalField(label)];
    const {authorId, videoType, seq, videoUrl, attachmentName, videoLength} = value;
    const obj: any = {
      courseId,
      coursePacketId,
      courseChapterId,
      courseSectionId: id,
      title: attachmentName,
      attachmentName,
      attachmentPath: videoUrl,
      authorId,
      attachmentExt: typeof videoUrl === 'string' ? '' : ToolsUtil.getFileExt(videoUrl[0].name),
      authorName: this.teacherList.filter(eee => Object.is(eee.id, authorId))[0].name,
      type: '103',
      // sourceType: label === 'polyway' ? 2 : 1,
      sourceType: label === 'showInteraction' ? 3 : 2,
      seq,
      videoType,
      videoLength,
    };
    if (!reset) {
      obj.id = value.id;
    }
    return [
      obj
    ];
  }

  /**
   * ??????????????????
   * @param videoUrl vid
   */
  getDuration(videoUrl: string) {
    const params: any = {
      ptime: (new Date()).getTime(),
      vids: videoUrl,
    };
    const sign = hex_sha1(queryParam(params) + environment.secretkey).toUpperCase();
    params.sign = sign;
    return this.courseMgService.getVideoLength(params, environment.userid);
  }

  storingData(param, resolve, label, reset) {
    // let interfaceUrl;
    // if (reset) {
    // interfaceUrl = 'batchSave_courseSectionFile';
    // } else {
    // interfaceUrl = 'saveOrUpdate';
    // }
    this.courseMgService.batchSave_courseSectionFile(param).subscribe(resP => {
      if (resP.status === 201) {
        const field = reset ? 'addCode' : 'modify';
        this.statisticsLogService.statisticsPacketInfoLog({
          name: (reset ? '??????' : '??????') + '????????????',
          actionCode: STATISTICALRULES.packetInfo['learnSet-record-action'][field],
          content: JSON.stringify(param),
        });
        this.getHandoutFiles();
        const realLabel = this.getModalField(label);
        this[realLabel].patchValue({
          videoUrl: label === 'localVideo' ? [] : '',
          authorId: '',
          videoType: '1',
          seq: 1,
          attachmentName: '',
          id: '',
        });
        // tslint:disable-next-line:forin
        for (const i in this[realLabel].controls) {
          this[realLabel].controls[i].markAsUntouched();
          this[realLabel].controls[i].markAsPristine();
          this[realLabel].controls[i].updateValueAndValidity();
        }
        this.modalFormRef.destroy();
        resolve(true);
      }
    });
  }

  /**
   * ????????????
   * @param type ?????????/?????????/?????????
   * @param task  ??????
   * @param data  HandoutItem
   */
  callSchoolEnterpriseLib(type: 'read' | 'case' | 'setting', task: '1' | '101' | '102' | '103', data?: HandoutItem) {
    let tasks;
    if (task === '1') {
      tasks = this.taskList;
    } else if (task === '101') {
      tasks = this.handoutsLecture;
    } else if (task === '102') {
      tasks = this.handoutsMaterial;
    } else if (task === '103') {
      tasks = this.handoutsRecording;
    }
    const nodes = tasks.map(el => {
      return {
        taskId: el.id,
        id: el.resourceId
      };
    });
    const item: any = {
      type: 'scp-section-handout',
      professionId: this.professionId,
      sectionInfo: {
        courseId: this.courseId,
        coursePacketId: this.coursePacketId,
        courseChapterId: this.curNode.data.courseChapterId,
        courseSectionId: this.curNode.data.id,
      },
      seq: ToolsUtil.getMaxSeq(tasks),
      nodes,
    };
    if (this.isStandard) {
      item.isStandard = '1';
    } else {
      item.isStandard = '';
    }
    if (task === '1') {
      item.limit = this.limitTask;
    }
    SessionStorageUtil.putScpResourceMaterial(item);
    if (type === 'read') {
      SessionStorageUtil.removeReadtree();
    } else if (type === 'case') {
      SessionStorageUtil.removeCasetree();
    } else if (type === 'setting') {
      SessionStorageUtil.removeTrainTree();
    }
    this.menuService.gotoUrl({
      url: '/m/rm/' + type,
      paramUrl: `?from=scp&task=${task}`
    });
  }

  /**
   * ????????????
   * @param name ?????????
   * @param attachmentPath ????????????
   */
  downLoad(item: HandoutItem) {
    let name = item.attachmentName;
    if (name.indexOf('.') < 0) {
      const pathArr = item.attachmentPath.split('.');
      name += ('.' + pathArr[pathArr.length - 1]);
    }
    this.aliOssService.downloadFile(name, item.attachmentPath).subscribe(res => res);
  }

  /**
   * ????????????/??????????????????
   * @param label ??????/??????
   */
  async getCallList(label: 'exam' | 'exercise') {
    const codeUid = await ToolsUtil.getProdIdSync();
    const params = {
      id: label === 'exam' ? ((String(this.testPaperId) && String(this.testPaperId) !== 'null') ? this.testPaperId : '')
        : ((String(this.testExerciseId) && String(this.testExerciseId) !== 'null') ? this.testExerciseId : ''),
      proId: codeUid,
      groupWay: label === 'exercise' ? '' : this.selectedValue ? this.selectedValue : '',
      courseCode: this.code,
      name: label === 'exam' ? (this.testPaperName ? this.testPaperName : '') : (this.testExerciseName ? this.testExerciseName : ''),
      isNotTaskType: label === 'exam' ? '4' : '2', // ?????????????????????
      sublibraryModuleIds: label === 'exam' ? this.examSubQuestionBankExamBak.join(',') : this.homeworkSubQuestionBankBak.join(','),
      pageSize: '10000',
      pageNum: '1'
    };
    ToolsUtil.getAjax(environment.questionBankApi + 'system/qkcPaper/list', params).subscribe(res => {
      try {
        const result = JSON.parse(res);
        if (result.code === 200) {
          if (label === 'exam') {
            this.listOfData = result.data.rows;
          } else {
            this.listOfDataExercise = result.data.rows;
          }
        } else {
          this.nzMesService.warning(res);
        }
      } catch (e) {
        this.nzMesService.warning(res || e);
      }
    });
  }

  /**
   * ????????????????????????
   * @param label ??????
   */
  getSubQuestionBank(label: 'exam' | 'exercise' | 'examSearch' | 'exerciseSearch') {
    return new Promise((resolve) => {
      this.searchLoad = true;
      ToolsUtil.getAjax(environment.questionBankApi + 'system/qkcPaper/courseCode', {
        courseCode: this.code,
        type: (label === 'exam' || label === 'examSearch') ? 'EXAM' : 'PRACTICE'
      }).subscribe(resultS => {
        this.searchLoad = false;
        try {
          const resP = JSON.parse(resultS);
          if (resP.code === 200) {
            this[label] = this.conversionNode(resP.data, label);
            resolve(true);
          } else {
            this.nzMesService.error(resP.message);
            resolve(false);
          }
        } catch (e) {
          resolve(false);
          this.nzMesService.error('??????????????????');
        }
      });
    });
  }

  getTaskFormText(taskForm) {
    switch (taskForm) {
      case '0':
        return '????????????';
      case '1':
        return '????????????';
      case '2':
        return '????????????';
    }
  }

  /**
   * ??????/????????????
   * @param data HandoutItem
   */
  async entryExercises(data?: HandoutItem) {
    this.curJobData = data ? data : {};
    const codeUid = await ToolsUtil.getProdIdSync();
    this.getSubQuestionBank('exercise').then(resS => {
      if (resS) {
        if (data) {
          this.addJobFromSeting.patchValue({
            name: data.name,
            taskForm: data.taskForm,
            subQuestionBank: Number(data.quebankId)
          });
        } else {
          const selected = LocalStorageUtil.getPracSubquestionbank();
          this.addJobFromSeting.patchValue({
            name: '????????????',
            taskForm: '2',
            subQuestionBank: selected ? Number(selected) : ''
          });
        }
        this.modalRef = this.nzModalService.create({
          nzTitle: data ? '????????????' : '????????????',
          nzContent: data ? this.jobSettingsEdit : this.jobSettings,
          nzMaskClosable: false,
          nzCancelText: '??????',
          nzFooter: data ? null : undefined,
          nzOkText: '??????',
          nzOnOk: () => {
            return new Promise((resolve) => {
              Object.keys(this.addJobFromSeting.controls).forEach(key => {
                this.addJobFromSeting.controls[key].markAsDirty();
                this.addJobFromSeting.controls[key].updateValueAndValidity();
              });
              if (this.addJobFromSeting.invalid) {
                resolve(false);
                return;
              }
              if (data) { // ??????
                this.realSave({
                  id: data.id,
                  name: this.addJobFromSeting.value.name,
                  taskForm: this.addJobFromSeting.value.taskForm
                }).subscribe(param => {
                  if (param) {
                    this.statisticsLogService.statisticsPacketInfoLog({
                      name: '????????????',
                      actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].modify,
                      content: JSON.stringify(param),
                    });
                    resolve(true);
                  } else {
                    resolve(false);
                  }
                });
              } else { // ??????
                const params = {
                  name: this.addJobFromSeting.value.name,
                  proId: codeUid,
                  courseCode: this.code,
                  taskType: 2,
                  groupWay: 1,
                  sublibraryModuleId: this.addJobFromSeting.value.subQuestionBank,
                  userPhone: LocalStorageUtil.getUser().userName
                };
                ToolsUtil.postAjax(environment.questionBankApi + 'system/qkcPaper/savePaper', params).subscribe(res => {
                  try {
                    const result = JSON.parse(res);
                    if (result.code === 200) {
                      const syncParams = {
                        proId: codeUid,
                        courseCode: this.code,
                        mobile: LocalStorageUtil.getUser().userName,
                      };
                      ToolsUtil.postAjax(environment.questionBankApi + 'system/qkcPaper/saveDefaultCourse', syncParams)
                        .subscribe(async resT => {
                          try {
                            const resultT = JSON.parse(resT);
                            if (resultT.code === 200) {
                              const result$ = await this.postTaskList(result, true);
                              result$.subscribe(param => {
                                if (param) {
                                  this.statisticsLogService.statisticsPacketInfoLog({
                                    name: '????????????',
                                    actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].modify,
                                    content: JSON.stringify(param),
                                  });
                                  this.edit({id: result.data.paperId, taskType: '2'});
                                  resolve(true);
                                } else {
                                  resolve(false);
                                }
                              });
                            } else {
                              this.nzMesService.error(resT);
                              resolve(false);
                            }
                          } catch (e) {
                            this.nzMesService.error(resT);
                            resolve(false);
                          }
                        });
                    } else {
                      if (result.code === 99) {
                        this.nzMesService.warning('???????????????????????????????????????,?????????????????????????????????');
                      } else {
                        this.nzMesService.warning(res);
                      }
                      resolve(false);
                    }
                  } catch (e) {
                    this.nzMesService.warning(e);
                    resolve(false);
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  /**
   * ??????/????????????
   * @param data HandoutItem
   */
  async addVolume(data?) {
    this.curExamData = data ? data : {};
    const codeUid = await ToolsUtil.getProdIdSync();
    this.getSubQuestionBank('exam').then(resS => {
      if (resS) {
        this.addExamFrom.reset();
        if (data) {
          this.addExamFrom.patchValue({
            missionName: data.name,
            formingMethod: data.groupWay ? Number(data.groupWay) : (data.examType ? Number(data.examType) : 1),
            subQuestionBank: Number(data.quebankId)
          });
        } else {
          const selected = LocalStorageUtil.getExamSubquestionbank();
          this.addExamFrom.patchValue({
            missionName: '',
            formingMethod: 1,
            subQuestionBank: selected ? Number(selected) : ''
          });
        }
        this.modalRef = this.nzModalService.create({
          nzTitle: data ? '????????????' : '????????????',
          nzContent: data ? this.addExamExit : this.addExam,
          nzMaskClosable: false,
          nzFooter: data ? null : undefined,
          nzCancelText: '??????',
          nzOkText: '??????',
          nzOnOk: () => {
            return new Promise((resolve, reject) => {
              Object.keys(this.addExamFrom.controls).forEach(key => {
                this.addExamFrom.controls[key].markAsDirty();
                this.addExamFrom.controls[key].updateValueAndValidity();
              });
              if (this.addExamFrom.invalid) {
                resolve(false);
                return;
              }
              if (data) {// ????????????
                this.realSave({
                  id: data.id,
                  name: this.addExamFrom.value.missionName,
                }).subscribe(param => {
                  if (param) {
                    this.statisticsLogService.statisticsPacketInfoLog({
                      name: '????????????',
                      actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].modify,
                      content: JSON.stringify(param),
                    });
                    resolve(true);
                  } else {
                    resolve(false);
                  }
                });
              } else {
                const params = {
                  name: this.addExamFrom.value.missionName,
                  groupWay: this.addExamFrom.value.formingMethod,
                  proId: codeUid,
                  courseCode: this.code,
                  taskType: 4,
                  sublibraryModuleId: this.addExamFrom.value.subQuestionBank,
                  userPhone: LocalStorageUtil.getUser().userName
                };
                ToolsUtil.postAjax(environment.questionBankApi + 'system/qkcPaper/savePaper', params).subscribe(res => {
                  try {
                    const result = JSON.parse(res);
                    if (result.code === 200) {
                      const syncParams = {
                        proId: codeUid,
                        courseCode: this.code,
                        mobile: LocalStorageUtil.getUser().userName
                      };
                      ToolsUtil.postAjax(environment.questionBankApi + 'system/qkcPaper/saveDefaultCourse', syncParams)
                        .subscribe(async resT => {
                          try {
                            const resultT = JSON.parse(resT);
                            if (resultT.code === 200) {
                              // ??????
                              const result$ = await this.postTaskList(result, false);
                              result$.subscribe(param => {
                                if (param) {
                                  this.statisticsLogService.statisticsPacketInfoLog({
                                    name: '????????????',
                                    actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].addCode,
                                    content: JSON.stringify(param),
                                  });
                                  this.edit({id: result.data.paperId, taskType: '4'});
                                  resolve(true);
                                } else {
                                  resolve(false);
                                }
                              });
                            } else {
                              this.nzMesService.error(resT);
                              resolve(false);
                            }
                          } catch (e) {
                            this.nzMesService.error(resT);
                            resolve(false);
                          }
                        });
                    } else {
                      if (result.code === 99) {
                        this.nzMesService.warning('???????????????????????????????????????,?????????????????????????????????');
                      } else {
                        this.nzMesService.warning(res);
                      }
                      resolve(false);
                    }
                  } catch (e) {
                    this.nzMesService.warning(res || e);
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  /*
  * ??????/?????????????????????
  * result?????????????????????
  * job?????????/??????
  * data: ??????????????????
  * ????????????:
  *  ????????????????????????????????????   ?????????????????????????????????
  *  ???????????????               ?????????????????????????????????
  * ????????????:
  *  ????????????????????????????????????   ?????????????????????????????????
  *  ???????????????               ?????????????????????????????????
  * */
  async postTaskList(result: HttpResponseDataStandard, job?: boolean, data?: CallItem) {
    const codeUid = await ToolsUtil.getProdIdSync();
    // ????????????(11)???????????????(12)???????????????(21)???????????????(22)',
    const gradeType = job ? 1 : this.exerciseType === '1' ? 1 : 2;
    const param: any = {
      courseId: this.courseId,
      coursePacketId: this.coursePacketId,
      courseChapterId: this.curNode.data.courseChapterId,
      courseSectionId: this.curNode.data.id,
      status: 1, // ???????????????(1)?????????(0)
      seq: ToolsUtil.getMaxSeq(this.taskList),
      examType: 1, // ?????????????????????/????????????(1)???????????????????????????(2)??????????????????????????????(3)
      // gradeType: (this.teachType === '21' || this.teachType === '22') ? 1 : 2,
      gradeType, // ???????????????????????????(1)???????????????(2)
      needTeacherProc: gradeType === 1 ? 0 : 1,
      isGrade: 1, // ????????????????????????(0)??????(1)
      attachmentPath: environment.questionBank + '#/questionList?proId=' + codeUid + '&courseCode=' + this.code // ????????????
    };
    // ????????????
    if (job) {
      param.taskType = 2; // ???????????????????????????(0)???????????????(1)???????????????(2)???????????????(3)???????????????(4)???????????????(5)?????????(6)?????????(7)
      if (data) { // ??????
        param.name = data.name;
        param.attachmentName = data.name;
        param.quebankId = (data.sublibraryModuleIdList && data.sublibraryModuleIdList.length)
          ? data.sublibraryModuleIdList.map(e => e.sublibraryModuleId).join(',') : '';
        param.resourceId = data.paperUuid + '-' + data.id;
        param.taskForm = '2';
      } else {  // ??????
        param.name = this.addJobFromSeting.value.name; // ????????????(?????????????????????)
        param.attachmentName = this.addJobFromSeting.value.name; // ?????????
        param.resourceId = result.data.paperUuid + '-' + result.data.paperId; // ??????id??????????????????????????????id
        param.taskForm = this.addJobFromSeting.value.taskForm; // ?????????????????????(0)?????????(1)?????????(2)
        param.quebankId = this.addJobFromSeting.value.subQuestionBank; // ?????????????????????(0)?????????(1)?????????(2)
      }
    } else {
      // ????????????
      param.taskType = 4;
      param.paperType = '1';
      if (data) { // ??????
        param.quebankId = (data.sublibraryModuleIdList && data.sublibraryModuleIdList.length)
          ? data.sublibraryModuleIdList.map(e => e.sublibraryModuleId).join(',') : '';
        param.examType = data.groupWay;
        param.name = data.name;
        param.attachmentName = data.name;
        param.resourceId = data.paperUuid + '-' + data.id;
      } else {   // ??????
        param.examType = this.addExamFrom.value.formingMethod;
        param.name = this.addExamFrom.value.missionName;
        param.attachmentName = this.addExamFrom.value.missionName;
        param.resourceId = result.data.paperUuid + '-' + result.data.paperId;
        param.quebankId = this.addExamFrom.value.subQuestionBank; // ?????????????????????(0)?????????(1)?????????(2)
      }
      if (this.exerciseType === '2') {
        param.answerTimes = 1;
      }
    }
    return this.realSave(param);
  }

  realSave(param) {
    return new Observable<any>((observer: Subscriber<any>) => {
      this.courseMgService.newTestPaper(param).subscribe(resul => {
        if (resul.status === 201) {
          this.getTaskList();
          observer.next(param);
          observer.complete();
          observer.unsubscribe();
        } else {
          this.isCallLoading = false;
          observer.next(false);
          observer.complete();
          observer.unsubscribe();
        }
      });
    });
  }

  // ????????????
  chooseTestPaper() {
    this.getSubQuestionBank('examSearch');
    this.getCallList('exam');
    this.selectedValue = '';  // ????????????
    this.testPaperName = '';  // ?????????
    this.examSubQuestionBankExam = []; //  ?????????????????????
    this.examSubQuestionBankExamBak = []; //  ?????????????????????
    this.examListPreview = true;
  }

// ????????????
  chooseExercises() {
    this.getSubQuestionBank('exerciseSearch');
    this.getCallList('exercise');
    this.homeworkSubQuestionBank = []; //  ?????????????????????
    this.homeworkSubQuestionBankBak = []; //  ?????????????????????
    this.testExerciseName = ''; // ?????????
    this.exerciseListPreview = true;
  }

// ???????????????
  associate(item: HandoutItem, sectionIdx: number) {
    this.associateing[sectionIdx] = true;
    this.totalPage = 0;
    this.currentAssocate = item;
    this.courseMgService.getViewUrlWebPath(environment.OSS_URL + item.attachmentPath).subscribe(async (res) => {
      if (res.status === 200) {
        this.wps = WebOfficeSDK.config({
          url: res.data.wpsUrl,
        });
        this.wps.iframe.style.display = 'none';
        await this.wps.ready();
        this.wpsApplication = this.wps.Application;
        this.stack = this.wpsApplication.Stack();
        this.totalPage = await this.wpsApplication.ActivePresentation.Slides.Count;
        this.associateing[sectionIdx] = false;
        this.visibleAssociate = true;
      }
    });
    this.getssocateList();
  }


  // ??????????????????
  isNeedChange(ifNeed: any, item: any) {
    const isNeed = item.isNeed ? '1' : '0';
    const params = {id: item.id, isNeed};
    const source$ = this.courseMgService.modifySectionResourceTask(params);
    source$.subscribe(res => {
      if (res.status !== 201) {
        this.nzMesService.error(res.message);
        return;
      }
      item.isNeed = ifNeed;
    }, err => {
      this.nzMesService.error(JSON.stringify(err));
    });
  }

// ???????????????????????????
  disableMainLecture(item) {
    return !(this.preview === '1'
      || (item.attachmentPath
        && (item.attachmentPath.indexOf('.ppt') > -1
          || item.attachmentPath.indexOf('.pptx') > -1)));
  }

  /**
   * ????????????
   * @param item HandoutItem
   */
  showassolite(item: HandoutItem) {
    return this.preview === '0' && item.isMainFile && item.attachmentPath &&
      (item.attachmentPath.indexOf('.ppt') > -1 || item.attachmentPath.indexOf('.pptx') > -1);
  }

  saveAssociate() {
    const params = [];
    this.assocateList.forEach((ee, ii) => {
      const obj: any = {};
      obj.id = ee.linkId;
      obj.courseId = ee.courseId;
      obj.coursePacketId = ee.coursePacketId;
      obj.courseChapterId = ee.courseChapterId;
      obj.courseSectionId = ee.courseSectionId;
      obj.courseTaskId = ee.id;
      obj.resourceId = this.currentAssocate.id;
      obj.pageNum = ee.pageNum;
      obj.seq = ee.seq;
      params.push(obj);
    });
    this.courseMgService.saveAssocateList(params).subscribe(res => {
      if (res.status === 201) {
        this.visibleAssociate = false;
      }
    });
  }

  getType(type: any) {
    switch (type) {
      case 1:
        return '??????';
      case 2:
        return '??????';
      case 3:
        return '??????';
      case 4:
        return '?????????';
    }
  }

// ??????/??????????????????
  showTransfer(data: WjCallItem, flag: boolean) {
    // ????????????7???
    if (this.taskList.length >= this.limitTask) {
      if (!flag) {
        return false;
      }
    }
    let list = [];
    if (this.taskList.length) {
      list = this.taskList.map(e => {
        return e.resourceId.split('-')[0];
      });
    }
    // ????????????????????????
    if (flag) {
      if (list.length) {
        if (list.indexOf(data.paperUuid) > -1) {
          return true;
        }
      }
    } else {
      // ??????????????????
      if (!list.length) {
        return true;
      }
      if (list.indexOf(data.paperUuid) < 0) {
        return true;
      }
    }
  }

  /**
   * ??????
   * @param data ????????????
   * @param ifExercise ????????????/??????
   */
  async transfer(data: CallItem, ifExercise: boolean) {
    this.isCallLoading = true;
    // ????????????
    const result$ = await this.postTaskList(null, ifExercise, data);
    result$.subscribe(param => {
      if (param) {
        this.statisticsLogService.statisticsPacketInfoLog({
          name: ifExercise ? '????????????' : '????????????',
          actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].addCode,
          content: JSON.stringify(param),
        });
      }
    });
  }

  /**
   * ????????????
   * @param data ?????????
   * @param type ??????
   */
  cancelCall(data: CallItem, type?: 'exam' | 'exercise' | 'questionnaireType' | 'evaluationType') {
    this.isCallLoading = true;
    const list = this.taskList.map(e => {
      return e.resourceId.split('-')[0];
    });
    const index = list.findIndex((ee) => {
      return ee === data.paperUuid;
    });
    this.courseMgService.del_courseSectionFileTask(this.taskList[index].id).subscribe(res => {
      if (res.status !== 204) {
        this.nzMesService.error(res.message);
        return;
      }
      this.getTaskList();
    }, () => {
      this.isCallLoading = false;
    });
  }

  /**
   * ????????????
   * @param data HandoutItem
   */
  async previewExaminationPaper(data: HandoutItem) {
    const codeUid = await ToolsUtil.getProdIdSync();
    if (data.resourceId) {
      open(environment.questionBank + '#/paper/previewPaper?paperId=' + data.resourceId.split('-')[1] +
        '&token=' + this.tokenObj.token + '&refreshToken=' + this.tokenObj.refreshToken + '&proId=' + codeUid + '&courseCode=' + this.code);
    } else {
      open(environment.questionBank + '#/paper/previewPaper?paperId=' + data.id +
        '&token=' + this.tokenObj.token + '&refreshToken=' + this.tokenObj.refreshToken + '&proId=' + codeUid + '&courseCode=' + this.code);
    }
  }

  /**
   * ??????????????????
   * @param data HandoutItem
   */
  edit(data: HandoutItem) {
    if (data.name) {
      if (data.taskType === '2') {
        this.entryExercises(data);
      } else if (data.taskType === '4') {
        this.addVolume(data); // ??????/????????????
      } else {
        this.otherEdit(data);
      }
    } else {
      this.otherEdit(data);
    }
  }

  async otherEdit(data: HandoutItem) {
    const codeUid = await ToolsUtil.getProdIdSync();
    const syncParams = {
      proId: codeUid,
      courseCode: this.code,
      mobile: LocalStorageUtil.getUser().userName
    };
    ToolsUtil.postAjax(environment.questionBankApi + 'system/qkcPaper/saveDefaultCourse', syncParams).subscribe(resT => {
      try {
        const resultT = JSON.parse(resT);
        if (resultT.code === 200) {
          let url: string;
          const str = 'courseCode=' + this.code
            + '&proId=' + codeUid + '&token=' + this.tokenObj.token + '&refreshToken=' + this.tokenObj.refreshToken + '&paperId=';
          if (data.taskType === '7') {
            url = environment.questionBank
              + '#/PaperEvaluation/List?'
              + str;
          } else if (data.taskType === '6') {
            url = environment.questionBank
              + '#/PaperQuestionnaire/List?'
              + str;
          } else {
            url = environment.questionBank
              + '#/paper/createPaper?'
              + str;
          }
          if (data.resourceId) {
            url += data.resourceId.split('-')[1];
          } else {
            url += data.id;
          }
          open(url);
        } else {
          this.nzMesService.error('?????????????????????????????????????????????');
        }
      } catch (e) {
        this.nzMesService.error(resT);
      }
    });
  }

  /**
   * ????????????
   * @param item HandoutItem
   */
  previewTask(item: HandoutItem) {
    if (item.taskType === '3') {
      this.previewTraining(item);
    } else if (item.taskType === '1') {
      const url = '/m/rm/material-pre-case';
      const tabTitle = `????????????`;
      this.menuService.gotoUrl({
        url,
        paramUrl: `/${item.resourceId}/104/${item.courseChapterId}`,
        title: tabTitle,
      });
    } else if (item.taskType === '2' || item.taskType === '4' || item.taskType === '6' || item.taskType === '7') {
      this.previewExaminationPaper(item);
    } else {
      this.previewHandout(item);
    }
  }


  // ????????????????????????
  modelChangeDetect(current: number) {
    if (typeof current === 'number') {
      this.current = current;
    }
  }

  stopPropagation(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
  }

  /**
   * ???????????????????????????
   * @param item ?????????
   */
  async getBlur(item) {
    this.bindLoading = true;
    if (this.totalPage) {
      const pageNum = this.current || item.pageNum;
      if (this.totalPage < pageNum) {
        this.bindLoading = false;
        timer(0).subscribe(() => {
          item.isBindAssoicate = false;
        });
        this.nzMesService.warning('?????????????????? ' + this.totalPage + ' ???,?????????????????????????????????????????????!');
        return;
      }
      if (item.paperId) {
        ToolsUtil.getAjax(environment.questionBankApi + 'system/qkcPaper/decidePaper?paperId=' + item.paperId)
          .subscribe(result => {
            try {
              const res = JSON.parse(result);
              if (res.code === 200) {
                if (res.data.decide) {
                  this.nzMesService.warning('?????????????????????????????????????????????????????????');
                  this.bindLoading = false;
                  timer(0).subscribe(() => {
                    item.isBindAssoicate = false;
                  });
                } else {
                  this.boundTask(item);
                }
              } else {
                this.nzMesService.error('?????????????????????????????????????????????');
              }
            } catch (e) {
              this.nzMesService.error(result);
            }
          });
      } else {
        this.boundTask(item);
      }
    } else {
      this.bindLoading = false;
      timer(0).subscribe(() => {
        item.isBindAssoicate = false;
      });
      this.nzMesService.error('?????????????????????????????????????????????????????????????????????');
    }
  }

  boundTask(item) {
    const pageNum = this.current || item.pageNum;
    const params: any = {
      courseId: item.courseId,
      coursePacketId: item.coursePacketId,
      courseChapterId: item.courseChapterId,
      courseSectionId: item.courseSectionId,
      courseTaskId: item.id,
      resourceId: this.currentAssocate.id,
      pageNum,
      seq: item.seq,
      id: item.linkId
    };
    this.courseMgService.handoutPageNumberRelatedTasks(params).subscribe(res => {
      this.bindLoading = false;
      if (res.status === 201) {
        this.statisticsLogService.statisticsPacketInfoLog({
          name: '????????????????????????',
          actionCode: STATISTICALRULES.packetInfo['learnSet-lecture-action'].modify,
          content: JSON.stringify(params),
        });
        item.linkId = res.data.id;
        item.isBindAssoicate = true;
        const index = this.assocateList.findIndex((e) => {
          return e.id === item.id;
        });
        this.assocateLists[index] = JSON.parse(JSON.stringify(this.assocateList[index]));
        this.currentBindLength = this.assocateList.filter(resP => {
          return resP.isBindAssoicate;
        }).length;
        console.log(this.currentBindLength);
        // this.getssocateList();
      } else {
        timer(0).subscribe(() => {
          item.isBindAssoicate = false;
        });
      }
    }, () => {
      this.bindLoading = false;
      timer(0).subscribe(() => {
        item.isBindAssoicate = false;
      });
    });
  }

  getApp(fn) {
    if (this.bindLoading) {
      if (!this.totalPage) {
        const wps = this.doc.getElementById('iframePage')['contentWindow'].wps;
        if (wps) {
          fn(wps);
        } else {
          timer(100).subscribe(() => {
            this.getApp(fn);
          });
        }
      } else {
        fn(false);
      }
    }
  }

  /**
   * ?????????????????????
   * @param flag boolean
   * @param item ?????????
   */
  isBindChange(flag: boolean, item) {
    if (flag) {
      this.getBlur(item);
    } else {
      this.delBind(item);
    }
  }

  delBind(item) {
    this.knowledgeManageService.delBind(item.linkId).subscribe(res => {
      if (res.status === 204) {
        this.statisticsLogService.statisticsPacketInfoLog({
          name: '????????????????????????',
          actionCode: STATISTICALRULES.packetInfo['learnSet-lecture-action'].modify,
          content: JSON.stringify({id: item.linkId}),
        });
        delete item.pageNum;
        delete item.linkId;
        item.isBindAssoicate = false;
        const index = this.assocateList.findIndex((e) => {
          return e.id === item.id;
        });
        this.assocateLists[index] = JSON.parse(JSON.stringify(this.assocateList[index]));
        this.currentBindLength = this.assocateList.filter(resP => {
          return resP.isBindAssoicate;
        }).length;
      } else {
        timer(0).subscribe(() => {
          item.isBindAssoicate = true;
        });
      }
    }, err => {
      timer(0).subscribe(() => {
        item.isBindAssoicate = true;
      });
    });
  }


  completebind() {
    this.visibleAssociate = false;
    this.totalPage = 0;
    this.wps.iframe.parentNode.parentNode.removeChild(this.wps.iframe.parentNode);
    this.stack.End();
    this.wpsApplication = null;
    this.wps.destroy();
    this.wps = null;
    this.getTaskList();
  }

  getText(type) {
    switch (String(type)) {
      case '0':
        return '???';
      case '1':
        return '???';
      case '2':
        return '???';
      case '3':
        return '???';
      case '4':
        return '???';
      case '5':
        return '???';
      case '6':
        return '???';
      case '7':
        return '???';
    }
  }

  getColor(taskType: any) {
    switch (taskType) {
      case '0':
        return '#f0a14d';
      case '1':
        return '#35ad8e';
      case '2':
        return '#b27fd7';
      case '3':
        return '#ecc13a';
      case '4':
        return '#33ade7';
      case '5':
        return '#5f88f2';
      case '6':
        return '#40a9ff';
      case '7':
        return '#567180';
    }
  }

  getFormingMethod(type) {
    switch (type) {
      case 1:
        return '????????????/????????????';
      case 2:
        return '????????????????????????';
      case 3:
        return '???????????????????????????';
    }
  }

// ????????????
  private previewTraining(item: any) {
    this.trainLoading = true;
    this.trainManageService.getAccountPeriodId(item.resourceId).subscribe(res => {
      if (res.status === 200) {
        const params = {
          id: item.resourceId,
          accountId: res.data.accountId,
        };
        const success = (resP: any) => {
          this.trainLoading = false;
          if (resP.status === 200) {
            if (resP.data) {
              window.open(resP.data);
            }
          }
        };
        const error = (err: any) => {
          this.trainLoading = false;
          this.nzMesService.create('error', JSON.stringify(err));
        };
        this.trainManageService.getPracticalDetail(params).subscribe(success, error);
      } else {
        this.trainLoading = false;
      }
    }, err => {
      this.trainLoading = false;
    });
  }

// ????????????????????????
  clearStatus(label: 'examSettingForm' | 'questionnairSettingForm') {
    const {answerTimes} = this[label].controls;
    answerTimes.markAsUntouched();
    answerTimes.markAsPristine();
    answerTimes.updateValueAndValidity();
  }

// ????????????????????????
  editHandout(item: any) {
    if (item.attachmentExt && item.sourceType !== '3') {
      item.attachmentName = item.title;
      item.videoUrl = [
        {
          name: item.title,
          title: item.title,
          path: item.attachmentPath,
          videoLength: item.videoLength
        }
      ];
      this.localVideo.patchValue(item);
      this.videoUpload('localVideo', false, item);
    } else {
      item.attachmentName = item.title;
      item.videoUrl = item.attachmentPath;
      this.polyway.patchValue(item);
      if (item.sourceType === '3') {
        this.polyway.patchValue({
          videoDuration: item.videoLength
        });
        this.videoUpload('showInteraction', false, item);
      } else {
        this.videoUpload('polyway', false, item);
      }
    }
  }

  compltedUpload() {
    const {videoUrl} = this.localVideo.value;
    this.localVideo.patchValue({
      attachmentName: videoUrl[0].title.split('.')[0]
    });
  }

// ??????????????????????????????
  private getVideoLength(duration) {
    let videoLength = 0;
    const arr = duration.split(':');
    const hour = Number(arr[0]);
    const minute = Number(arr[1]);
    const second = Number(arr[2]);
    if (hour > 0) {
      videoLength += hour * 60;
    }
    if (minute > 0) {
      videoLength += minute;
    }
    if (second > 0) {
      videoLength += 1;
    }
    return videoLength;
  }

  paperTypeChange(type: any) {
    if (type === '6' && (this.examType === '3' || this.examType === '2')) {
      this.examSettingForm.patchValue({
        isRedo: '1'
      });
    } else {
      this.examSettingForm.patchValue({
        isRedo: '0'
      });
    }
  }

  /**
   * ????????????
   * @param data ??????item
   * @param label ??????
   */
  async transferQuestionnaire(data: WjCallItem, label: 'evaluationType' | 'questionnaireType') {
    const codeUid = await ToolsUtil.getProdIdSync();
    this.isCallLoading = true;
    const param: any = {
      courseId: this.courseId,
      coursePacketId: this.coursePacketId,
      courseChapterId: this.curNode.data.courseChapterId,
      courseSectionId: this.curNode.data.id,
      status: 1, // ???????????????(1)?????????(0)
      seq: ToolsUtil.getMaxSeq(this.taskList),
      attachmentPath: environment.questionBank +
        (label === 'evaluationType' ? '#/PaperEvaluation/List' : '#/PaperQuestionnaire/List')
        + '?proId=' + codeUid + '&courseCode=' + this.code, // ????????????
      name: data.name,
      attachmentName: data.name,
      resourceId: data.paperUuid + '-' + data.paperId,
      taskType: label === 'evaluationType' ? 7 : 6,
      answerTimes: 1
    };


    this.courseMgService.newTestPaper(param).subscribe(resul => {
      this.statisticsLogService.statisticsPacketInfoLog({
        name: label === 'evaluationType' ? '????????????' : '????????????',
        actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].addCode,
        content: JSON.stringify(param),
      });
      if (resul.status === 201) {
        this.getTaskList();
      }
    }, () => {
      this.isCallLoading = false;
    });
  }

  /**
   * ????????????
   * @param data HandoutItem
   */
  async previewExaminationQuestionnaire(data: WjCallItem) {
    const codeUid = await ToolsUtil.getProdIdSync();
    const str = '&token=' + this.tokenObj.token + '&refreshToken=' + this.tokenObj.refreshToken
      + '&proId=' + codeUid + '&courseCode=' + this.code;
    open(environment.questionBank + '#/paper/previewPaper?paperId=' + data.paperId + str);
  }

  /**
   * ??????????????????
   * @param label ??????/??????
   */
  async questionnaireCall(label: 'evaluationType' | 'questionnaireType') {
    const {evaluationType, questionnaireType, evaluationName, questionnaireName, orgCode, code} = this;
    const codeUid = await ToolsUtil.getProdIdSync();
    ToolsUtil.getAjax(environment.questionBankApi + 'system/qkcPaper/evaluateQuestionnaireList', {
      proId: codeUid,
      typeId: label === 'evaluationType' ? 3 : 4,
      evaluateId: label === 'evaluationType' ?
        evaluationType ? evaluationType : undefined : questionnaireType ? questionnaireType : undefined,
      name: label === 'evaluationType' ? evaluationName ? evaluationName : undefined : questionnaireName ? questionnaireName : undefined,
      courseCode: code,
      status: 2,
      pageSize: '10000',
      pageNum: '1',
    }).subscribe(res => {
      try {
        const result = JSON.parse(res);
        if (result.code === 200) {
          if (label === 'evaluationType') {
            this.listOfEvaluationData = result.data.rows;
            this.evaluationPreview = true;
          } else {
            this.listOfQuestionnaireData = result.data.rows;
            this.questionnairePreview = true;
          }
        } else {
          this.nzMesService.error(result.message);
        }
      } catch (e) {
        this.nzMesService.error('??????????????????');
      }
    });
  }


  getEvaluationType(evaluateId: '1' | '2') {
    switch (evaluateId) {
      case '1':
        return '????????????';
      case '2':
        return '????????????';
    }
  }


  getQuestionnaireType(evaluateId: '1' | '2') {
    switch (evaluateId) {
      case '1':
        return '????????????';
      case '2':
        return '????????????';
    }
  }

  getEvaluationStatus(status: 1 | 2 | 3 | 4) {
    switch (status) {
      case 1:
        return '?????????';
      case 2:
        return '?????????';
      case 3:
        return '?????????';
      case 4:
        return '?????????';
    }
  }

  /**
   * ??????????????????
   * @param label ??????
   */
  async newQuestionnaire(label: 'evaluationType' | 'questionnaireType') {
    const codeUid = await ToolsUtil.getProdIdSync();
    const str = 'token=' + this.tokenObj.token + '&refreshToken=' + this.tokenObj.refreshToken
      + '&proId=' + codeUid + '&courseCode=' + this.code;
    if (label === 'evaluationType') {
      open(environment.questionBank + '#/PaperEvaluation/List?' + str);
    } else {
      open(environment.questionBank + '#/PaperQuestionnaire/List?' + str);
    }
  }

  closeQuestionnaire(label: 'evaluationType' | 'questionnaireType') {
    if (label === 'evaluationType') {
      this.questionnaireType = '';
      this.questionnaireName = '';
      this.evaluationPreview = false;
    } else {
      this.questionnairePreview = false;
      this.evaluationType = '';
      this.evaluationName = '';
    }
  }

// ?????????????????????????????????id
  subQuestionBankChange(checkData: any) {
    if (checkData) {
      LocalStorageUtil.putExamSubquestionbank(checkData);
    }
  }

// ?????????????????????????????????id
  execrisesSubQuestionBankChange(checkData: any) {
    if (checkData) {
      LocalStorageUtil.putPracSubquestionbank(checkData);
    }
  }

  /**
   * ??????/?????????????????????????????????id
   * @param data ?????????????????????
   * @param label ??????
   */
  subQuestionBankChangeSearch(data, label: 'examSearch' | 'exerciseSearch') {
    const bakLabel = label === 'examSearch' ? 'examSubQuestionBankExamBak' : 'homeworkSubQuestionBankBak';
    this[bakLabel] = [];
    if (data.length) {
      data.forEach(e => {
        if (parseFloat(e).toString() === 'NaN') {
          this[label].every((item) => {
            if (item['code'] === e) {
              // @ts-ignore
              item.children.forEach(child => {
                this[bakLabel].push(child.key);
              });
            } else {
              return true;
            }
          });
        } else {
          this[bakLabel].push(e);
        }
      });
    }
  }

  /**
   * ??????excel????????????
   */
  importVideo() {
    this.nzModalService.create<VideoImportComponent, NzSafeAny>({
      nzTitle: '????????????',
      nzContent: VideoImportComponent,
      nzComponentParams: {
        courseId: this.courseId,
        coursePacketId: this.coursePacketId,
      },
      nzMaskClosable: false,
    }).afterClose
      .subscribe((flag: boolean) => {
        if (flag) {
          this.getHandoutFiles();
        }
      });
  }


  queryKeywordsChange() {
    Number(this.queryKeywords) === 1 ? this.testPaperName = '' : this.testPaperId = '';
  }

  queryKeywordsJobChange() {
    Number(this.queryKeywordsJob) === 1 ? this.testExerciseName = '' : this.testExerciseId = '';
  }

  getExamText(data) {
    if (String(data.taskType) === '4') {
      return this.getExamType(data.paperType || '1');
    } else {
      return '';
    }
  }

  showExamType(item: any) {
    return String(item.taskType) === '4';
  }

  ShowJobType(item: any) {
    return String(item.taskType) === '2';
  }

  // taskForm
  // ??????(0)?????????(1)?????????(2)
  // taskType: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7';
  // ???????????????????????????(0)???????????????(1)???????????????(2)???????????????(3)???????????????(4)???????????????(5)?????????(6)?????????(7)
  ShowCheck(item) {
    return (Number(item.taskForm) === 2 && Number(item.taskType) === 2)
      || (Number(item.taskType) === 4 && Number(item.paperType)===6)
    || (Number(item.taskType) === 6)
  }

  jobCancel() {
    this.modalRef.destroy();
  }

  /**
   * ??????????????????????????????
   * @param label ??????/??????
   */
  jumpQuestionBank(label: 'curJobData' | 'curExamData') {
    this.otherEdit(this[label] as HandoutItem);
  }

  /**
   * ??????????????????
   */
  jobDetermine() {
    Object.keys(this.addJobFromSeting.controls).forEach(key => {
      this.addJobFromSeting.controls[key].markAsDirty();
      this.addJobFromSeting.controls[key].updateValueAndValidity();
    });
    if (this.addJobFromSeting.invalid) {
      return;
    }
    this.realSave({
      id: this.curJobData.id,
      name: this.addJobFromSeting.value.name,
      taskForm: this.addJobFromSeting.value.taskForm
    }).subscribe(param => {
      if (param) {
        this.statisticsLogService.statisticsPacketInfoLog({
          name: '????????????',
          actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].modify,
          content: JSON.stringify(param),
        });
        this.modalRef.destroy();
      }
    });
  }

  /**
   * ??????????????????
   */
  examDetermine() {
    Object.keys(this.addExamFrom.controls).forEach(key => {
      this.addExamFrom.controls[key].markAsDirty();
      this.addExamFrom.controls[key].updateValueAndValidity();
    });
    if (this.addExamFrom.invalid) {
      return;
    }
    this.realSave({
      id: this.curExamData.id,
      name: this.addExamFrom.value.missionName,
    }).subscribe(param => {
      if (param) {
        this.statisticsLogService.statisticsPacketInfoLog({
          name: '????????????',
          actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].modify,
          content: JSON.stringify(param),
        });
        this.modalRef.destroy();
      }
    });
  }

  closePreview() {
    this.isPreviewpolyway = false;
    this.resourceUrl = '';
    this.previewTitle = '';
    this.previewStart = false;
  }
}

