import {Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {MenuService} from 'core/services/menu.service';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {NzMessageService} from 'ng-zorro-antd/message';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {timer} from 'rxjs';
import {APPROVE_MAP} from 'core/base/static-data';
import {KnowledgeManageService} from '@app/busi-services';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {ConfirmableFlat} from 'core/decorators';
import {ToolsUtil} from 'core/utils/tools.util';
import {LoadingControl} from 'core/base/common';

@Component({
  selector: 'app-scp-course-build',
  templateUrl: './scp-course-build.component.html',
  styleUrls: ['./scp-course-build.component.less'],
  providers: [CourseManageService]
})
export class ScpCourseBuildComponent implements OnInit {
  nextStepLoading = false;
  modalFormRef: NzModalRef;
  seeDetails = false;
  seeMoreDetails = false;
  listOfData = [];
  jumpFlag = false;
  exceedLength: any;
  independentTask = false;
  seeMoreIndependentTask = false;
  preview = '0';
  lessonCount = 1;
  isSmart = '0';
  curProgress = 0;
  curProgressInfo = SessionStorageUtil.getCourseInfoItem();
  teachType: string;
  courseId: string;
  code: string;
  majorId: string;
  coursePacketId: string;
  professionId: string;
  createrId;
  title = '';
  status = '0';
  auditStatus = '0';
  pcode = '';
  knowledgeSubjectId = '';
  tabs = [{
    title: '课包结构',
  }, {
    title: '知识图谱'
  }];
  ifApprove = false;
  lock = false;
  mainVideo = 0;
  knowledgeExplanationVideo = 0;
  lackChapterSession = [];
  kno = false;
  isLoading = false;
  userInfo = LocalStorageUtil.getUser();
  userId = this.userInfo.id;


  @ViewChild('curriculumConstruction') curriculumConstruction;
  @ViewChild('knowledgeGraph') knowledgeGraph;
  // @ViewChild('recordingLecturer') recordingLecturer;
  @ViewChild('nailingTmp') nailingTmp: TemplateRef<any>;
  @Output() searchData = new EventEmitter<any>();


  constructor(
    private route: ActivatedRoute,
    private menuService: MenuService,
    private modal: NzModalService,
    private modalService: NzModalService,
    private courseMgService: CourseManageService,
    private message: NzMessageService,
    private knowledgeManageService: KnowledgeManageService,
  ) {

  }

  ngOnInit() {
    const {curProgressInfo} = this;
    let currentStep = 0;
    this.route.paramMap.subscribe(params => {
      this.knowledgeSubjectId = params.get('knowledgeSubjectId');
      this.courseId = params.get('courseId');
      this.status = params.get('status');
      this.auditStatus = params.get('auditStatus');
      this.code = params.get('code');
      this.majorId = params.get('majorId');
      if (curProgressInfo) {
        currentStep = JSON.parse(curProgressInfo)[this.courseId];
      }
      this.curProgress = currentStep ? currentStep : 0;
    });
    this.title = SessionStorageUtil.getCourseName();
    timer(500).subscribe(() => {
      this.kno = true;
    });
  }


  nextStep() {
    this.changeProgress(-1, 'next');
  }

  preStep() {
    this.changeProgress(1, 'prev');
  }

  submitReview(resubmit) {
    if (resubmit) {
      this.resubmit();
    } else {
      this.submitForApproval();
    }
  }

  // 解绑
  @ConfirmableFlat({
      title: '提交审批',
      content: '课程一经审批通过，课程将开放资源研发存储，课包建设权限。',
    }
  )
  submitForApproval(loadingControl?: LoadingControl) {
    return this.approveAll('0', loadingControl);
  }

  @ConfirmableFlat({
      title: '重新提交',
      content() {
        return '确定对' + this.title + '课程重新提交审批吗？课程一经审批通过，课程将开放资源研发存储，课包建设权限。';
      },
    }
  )
  resubmit(loadingControl?: LoadingControl) {
    return this.approveAll('5', loadingControl);
  }

  private approveAll(type, loadingControl?: LoadingControl) {
    return new Promise((resolve) => {
      const param = {
        courseId: this.courseId,
        action: APPROVE_MAP[type]
      };
      this.isLoading = loadingControl.loading = true;
      this.knowledgeManageService.approveAll(param).subscribe(res => {
        this.isLoading = loadingControl.loading = false;
        if (res.status === 201) {
          this.menuService.goBack(false);
          this.menuService.gotoUrl({
            url: '/m/course-manage/course-list',
            paramUrl: '',
            title: '课程管理'
          });
          resolve(true);
        } else {
          if (res.status === 500) {
            this.message.error('服务器业务异常');
          }
          resolve(false);
        }
      }, () => {
        this.isLoading = loadingControl.loading = false;
        resolve(false);
      });
    });
  }


  async changeProgress(index: number, direction: 'prev' | 'next' | 'direct') {
    if (this.curProgress === 0) {  // 保存课程建设
      if (this.curriculumConstruction.checkChange()) {
        this.isLoading = true;
        this.curriculumConstruction.save().then((flag) => {
          this.isLoading = false;
          if (flag) {
            this.realChange(index, direction);
          }
        });
      } else {
        this.realChange(index, direction);
      }
    } else if (this.curProgress === 1) {// 保存知识图谱
      if (this.knowledgeGraph.curNode && this.knowledgeGraph.curNode.origin) {
        const {kType, weight} = this.knowledgeGraph.curNode.origin;
        if (kType === '2') {
          if (weight !== this.knowledgeGraph.examWeightInThisChapter) {
            this.isLoading = true;
            this.knowledgeGraph.saveKnowledgePoints(true, true).then((flagP) => {
              this.isLoading = false;
              if (flagP) {
                this.realChange(index, direction);
              }
            });
          } else {
            this.realChange(index, direction);
          }
        } else if (kType === '4') {
          if (this.knowledgeGraph.checkChange(this.knowledgeGraph.curNode)) {
            this.isLoading = true;
            this.knowledgeGraph.saveKnowledgePoints(true, true).then((flagP) => {
              const {explanationVideo, learningMaterials} =
                this.knowledgeGraph.recoverMaterial(this.knowledgeGraph.curNode.origin.fileList);
              this.knowledgeGraph.learningMaterials = JSON.parse(JSON.stringify(learningMaterials));
              this.knowledgeGraph.explanationVideo = JSON.parse(JSON.stringify(explanationVideo));
              this.isLoading = false;
              if (flagP) {
                this.realChange(index, direction);
              }
            });
          } else {
            this.realChange(index, direction);
          }
        } else {
          this.realChange(index, direction);
        }
      } else {
        this.realChange(index, direction);
      }
    }
  }


  realChange(index: number, direction: 'prev' | 'next' | 'direct') {
    if (direction === 'prev') {
      this.curProgress--;
    } else if (direction === 'next') {
      this.curProgress++;
    } else {
      this.curProgress = index;
    }
    SessionStorageUtil.putCourseInfoItem({[this.courseId]: this.curProgress});
  }


  private warning(title: string, content: string) {
    this.modal.warning({
      nzTitle: title,
      nzContent: content
    });
  }

  back() {
    this.isLoading = true;
    this.curriculumConstruction.save(true, false).then((flag1) => {
        if (flag1) {
          this.knowledgeGraph.saveKnowledgePoints(false, true).then(flag2 => {
            if (flag2) {
              Promise.all([this.curriculumConstruction.save(false, true),
                this.knowledgeGraph.saveKnowledgePoints(true, false)]).then((data) => {
                this.isLoading = false;
                if (data[0] && data[1]) {
                  this.menuService.goBack(false);
                  this.menuService.gotoUrl({
                    url: '/m/course-manage/course-list',
                    paramUrl: '',
                    title: '课程管理'
                  });
                }
              }).catch(() => {
                this.isLoading = false;
              });
            } else {
              this.isLoading = false;
            }
          });
        } else {
          this.isLoading = false;
        }
      }
    );
  }

  seeDetailsF() {
    this.seeMoreDetails = true;
    this.seeDetails = false;
    this.courseMgService.chapterSelectionLack(this.coursePacketId).subscribe(res => {
      if (res.status === 200) {
        this.lackChapterSession = res.data;
      }
    });

  }

  // 课程审批
  seeDetailsComfirm() {
    const params: any = {
      id: this.coursePacketId,
      auditStatus: '1'
    };
    this.courseMgService.submitForApproval(params).subscribe(res => {
      if (res.status === 201) {
        this.seeDetails = false;
        this.menuService.goBack(false);
        this.menuService.gotoUrl({
          url: '/m/course-manage/scp-list',
          paramUrl: '',
          title: '课包'
        });
      }
    });

  }

  showAudit() {
    return this.curProgress === 3 && this.preview === '0' && (this.auditStatus === '0' || this.auditStatus === '3') && this.ifApprove;
  }

  lookOver() {
    this.independentTask = false;
    this.seeMoreIndependentTask = true;
  }


  nailingApproval() {
    this.modalService.confirm({
      nzTitle: `课包审批`,
      nzContent: this.nailingTmp,
      nzOnOk: () => {
        return new Promise((resolve) => {
          const params = {
            id: this.coursePacketId,
            auditStatus: '1',
          };
          this.courseMgService.nailingApproval(params).subscribe(res => {
            if (res.status === 201) {
              this.menuService.goBack(false);
              this.menuService.gotoUrl({
                url: '/m/course-manage/scp-list',
                paramUrl: '',
                title: '课包'
              });
              resolve(true);
            } else {
              resolve(false);
            }
          }, err => {
            resolve(false);
          });
        });
      }
    });
  }

  getDisabled() {
    if (this.majorId === this.userId) {
      if (this.status !== '0') { // 草稿一定不禁用
        if (this.auditStatus === '1') { // 待审批一定禁用
          return true;
        }
        return !this.knowledgeGraph?.treeComponent?.modify.flag;
      }
    } else {
      return true;
    }
  }
}
