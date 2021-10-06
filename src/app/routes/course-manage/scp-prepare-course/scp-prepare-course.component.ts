import {Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {MenuService} from 'core/services/menu.service';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {NzMessageService} from 'ng-zorro-antd/message';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {EMPTY, of, timer} from 'rxjs';
import {STATISTICALRULES} from 'core/base/static-data';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {EditLessonComponent, NewCompanyComponent, NewLevelComponent, RewardSettingsComponent} from '@app/routes/course-manage/components';
import {NzSafeAny, NzTreeNode, NzTreeSelectComponent} from 'ng-zorro-antd';
import {ToolsUtil} from 'core/utils/tools.util';
import {StatisticsLogService} from '@app/busi-services/statistics-log.service';
import {ConfirmableDesc, ConfirmableFlat, getSetChange} from 'core/decorators';
import {CommonData, LoadingControl} from 'core/base/common';
import {environment} from 'src/environments/environment';
import {CompanyItem, HqItem, LevelItem} from '@app/routes/course-manage/components/other-setting/other-setting.interface';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {tapResponse} from '@ngrx/component-store';
import {NodeChangeEvent} from '@app/routes/course-manage/components/course-structure-tree/course-structure-tree.component';
import {NewHqComponent} from '@app/routes/course-manage/components/other-setting/new-hq/new-hq.component';

@Component({
  selector: 'app-scp-prepare-course',
  templateUrl: './scp-prepare-course.component.html',
  styleUrls: ['./scp-prepare-course.component.less'],
  providers: [CourseManageService]
})
export class ScpPrepareCourseComponent implements OnInit {
  dataSet = [
    {}
  ]; // 录播计划
  selectId: any[];
  curNode: NodeChangeEvent;
  bindList = []; // 缓存绑定数据
  bindLoading = false; // 章节绑定loading
  knowledgeGraphLoading = false; // 知识图谱loading
  untieLoading = false; // 解绑loading
  knowledgeGraphStructureVisible = false;  // 知识图谱树
  lessonPackageStructureVisible = true; // 课程章节树
  chapterBindingVisible = false; // 打开章节绑定弹框
  defaultSection: object; // 默认选中节
  defaultChapter = []; // 默认点选章
  chapterBindingEdit: boolean; // 修改绑定
  defaultTreeKey = [];

  modalFormRef: NzModalRef;
  seeDetails = false;
  seeMoreDetails = false;
  listOfData = []; // 章节任务数量表格
  listOfDataChapterBind = []; // 章节绑定表格
  listOfDataTable = []; // 课次表格
  userId = LocalStorageUtil.getUserId();
  jumpFlag = false;
  exceedLength: any;
  independentTask = false;
  seeMoreIndependentTask = false;
  preview = '0';
  lessonCount = 1;
  isSmart = '0';
  curProgress = 0;
  innerCurProgress = 0;
  teachType: string;
  courseId: string;
  code: string;
  coursePacketId: string;
  majorLeaderId: string;
  isUsed: string;
  professionId: string;
  createrId;
  title = '';
  status = '0';
  auditStatus = '0';
  pcode = '';
  knowledgeSubjectId = '';
  totalSectionNum = 0;
  exerciseType = '';
  tabs = [{
    title: '课包结构',
  }, {
    title: '知识图谱'
  }];
  ifApprove = false;
  lock = false;
  mainVideo;
  knowledgeExplanationVideo;
  isLoading = false;
  isTableLoading = false;
  lackChapterSession = [];
  levelLists = [];
  exam = [];
  intelligent = [];
  moduleArr = [];
  idMap = {};
  searchLoad = false;
  isBet = '0';
  is99Train = '0';
  isKjlTrain = '0';
  isYyTrain = '0';
  isCard = '0';
  isHqTrain = '0';
  breakthroughMode = false;
  isBetOn = false;
  practiceOn = false;
  bookkeeperOn = false;
  ufidaOn = false;
  hqOn = false;
  knowledgeNum = 0;
  companyLists = [];
  kjlLists = [];
  KjlOption = [];
  hqLists = [];
  subQuestionBankCurrentPre = [];
  subQuestionBankCurrent = [];
  subQuestionBankIntCurrentPre = [];
  subQuestionBankIntCurrent = [];
  listSublibrary = [];
  subQuestionBank = [];
  subQuestionBankInt = [];
  applicableHasAFoundationWeekPre: any; // 有基础
  applicableExpertsWeekPre: any; // 专家
  applicableZeroBasisWeekPre: any; // 零基础
  applicableHasAFoundationWeek: any;
  applicableExpertsWeek: any;
  applicableZeroBasisWeek: any;
  applicableZeroBasis = false;
  applicableExperts = false;
  applicableHasAFoundation = false;
  NumberS = Number;
  @getSetChange<boolean>({
    initSet(val) {
      if (val) {
        this.initIntellectualAdaptationData();
      }
    },
    set(val) {
      if (val !== this.intellectualAdaptation) {
        const flag = val ? '1' : '0';
        this.isSmart = flag;
        this.courseMgService.isSmartUpdate(this.coursePacketId, flag).subscribe(res => {
          if (res.status === 201) {
            if (val) {
              this.initIntellectualAdaptationData();
            }
            SessionStorageUtil.putPacketInfoItem('isSmart', flag);
          }
        });
      }
    }
  })
  intellectualAdaptation: boolean; // 智适应开关
  intellectualAdaptationInit: boolean; // 智适应开关
  lockcheck = false;
  @ViewChild('treeSelect') treeSelect: NzTreeSelectComponent;
  @ViewChild('treeSelectInt') treeSelectInt: NzTreeSelectComponent;
  @ViewChild('lessonPackageStructure') lessonPackageStructure;
  @ViewChild('learningSetting') learningSetting;
  @ViewChild('otherSettings') otherSettings;
  @ViewChild('intelligentAdaptiveSetting') intelligentAdaptiveSetting;
  @ViewChild('complete') complete;
  @ViewChild('nailingTmp') nailingTmp: TemplateRef<any>;
  @Output() searchData = new EventEmitter<any>();


  constructor(
    private route: ActivatedRoute,
    private menuService: MenuService,
    private modal: NzModalService,
    private modalService: NzModalService,
    private courseMgService: CourseManageService,
    private nzMsg: NzMessageService,
    private statisticsLogService: StatisticsLogService,
  ) {
  }

  ngOnInit() {
    this.initParams(); // 获取课包参数
    this.recoveryTabData(); // 回显对应tab数据
  }

  /**
   * 会计乐新增删除
   */
  bookkeeperChange(flag: boolean, item) {
    if (!this.lockcheck) {
      this.lockcheck = true;
      if (flag) {
        const {courseId, coursePacketId} = this;
        const params = {
          courseId,
          coursePacketId,
          name: item.name,
          code: item.kjlCourseId,
          trainType: '0',
          status: '1',
          seq: 0
        };
        this.courseMgService.coursePkgTrainSave(params).subscribe(res => {
          if (res.status === 201) {
            this.getKjlTrain().then(() => {
              this.lockcheck = false;
            });
          }
        });
      } else {
        const id = this.kjlLists.find(kjlItem => kjlItem.code === item.kjlCourseId).id;
        this.courseMgService.coursePkgTrainDel(id).subscribe(res => {
          if (res.status === 204) {
            this.getKjlTrain().then(() => {
              this.lockcheck = false;
            });
          }
        });
      }
    } else {
      this.nzMsg.warning('正在处理中，请稍后再操作');
      timer(0).subscribe(() => {
        item.checked = !flag;
      });
    }
  }

  /**
   * 闯关tab
   */
  breakthroughModeTab() {
    this.getLevel(); // 获取闯关列表
    this.breakthroughMode = this.isCard === '1' ? true : false;
  }

  /**
   * 题库tab
   */
  questionBankTab() {
    this.getSubLibrary(); // 获取子题库列表
    this.getSubQuestionBank(); // 获取子题库模块树
  }

  /**
   * 实训tab
   */
  trainTab() {
    this.practiceOn = this.is99Train === '1' ? true : false;
    this.bookkeeperOn = this.isKjlTrain === '1' ? true : false;
    this.ufidaOn = this.isYyTrain === '1' ? true : false;
    this.hqOn = this.isHqTrain === '1' ? true : false;
    if (this.practiceOn) {
      this.getCompany();
    }
    if (this.hqOn) {
      this.getHq();
    }
    this.initKjl();
    if (this.hqOn) {
      this.getHq();
    }
  }

  initKjl() {
    if (this.isKjlTrain === '1') {
      this.getKjlOption().then(res => {
        if (res) {
          this.getKjlTrain().then(() => {
            this.syncChecked();
          });
        }
      });
    }
  }

  /**
   * 智适应tab
   */
  intellectualAdaptationTab() {
    this.intellectualAdaptation = this.intellectualAdaptationInit;
    this.getKnowledgeNum(); // 获取课程知识点总数
    this.isBetOn = this.isBet === '1' ? true : false;
    this.questionBankTab();
  }

  /**
   * 根据tab自动回显
   * @param innerCurProgress
   */
  getFininTabSub(innerCurProgress: number) {
    if (innerCurProgress === 0) {
      this.breakthroughModeTab();
    } else if (innerCurProgress === 1) {
      this.questionBankTab();
    } else if (innerCurProgress === 2) {
      this.trainTab();
      if (this.isSmart === '1') {
        this.getChapterBindList();
        if (this.teachType === '22') {
          this.getLessonPackage();
        }
      }
    } else {
      this.intellectualAdaptationTab();
      if(this.isKjlTrain === '1') {
        this.initKjl();
      }
    }
  }


  /**
   * 获取课程知识点总数
   */
  getKnowledgeNum() {
      this.courseMgService.getKnos({knowledgeSubjectId: this.knowledgeSubjectId}).subscribe(
        res => {
          if (res.status === 200) {
            this.knowledgeNum = res.data.num || 0;
          } else {
            this.knowledgeNum = 0;
          }
        });
  }

  /**
   * 获取子题库模块树
   */
  getSubQuestionBank() {
    ToolsUtil.getAjax(environment.questionBankApi + 'system/qkcPaper/courseCode', {
      courseCode: this.code,
      type: ''
    }).subscribe(
      resultS => {
        const resP = JSON.parse(resultS);
        if (resP.code === 200) {
          if (resP.data && resP.data.length) {
            const bak = JSON.parse(JSON.stringify(resP.data));
            const moduleArr = JSON.parse(JSON.stringify(resP.data));
            // 获取模块列表
            let reduce = [];
            moduleArr.forEach(itemX => {
              reduce = itemX.sublibraryModuleList.filter(itemIn => itemIn.type === 'EXAM').concat(reduce);
            });
            bak.forEach(itemX => {
              itemX.sublibraryModuleList = itemX.sublibraryModuleList.filter(itemIn => itemIn.type === 'PRACTICE');
            });
            const idMap = {};
            resP.data.forEach(itemY => {
              itemY.sublibraryModuleList.forEach(itemP => {
                idMap[itemP.id] = itemP.type;
              });
            });
            // tslint:disable-next-line:max-line-length
            const intelligent = this.conversionNode(bak).sort((a, b) => a.createTime > b.createTime ? -1 : a.createTime < b.createTime ? 1 : 0);
            // tslint:disable-next-line:max-line-length
            const exam = this.conversionNode(resP.data).sort((a, b) => a.createTime > b.createTime ? -1 : a.createTime < b.createTime ? 1 : 0);
            this.exam = exam;
            this.intelligent = intelligent;
            this.moduleArr = reduce;
            this.idMap = idMap;
          } else {
            this.exam = [];
            this.intelligent = [];
            this.moduleArr = [];
          }
        } else {
          this.nzMsg.error(resP.message);
        }
      }, () => {
        this.nzMsg.error('题库服务异常');
      }
    );
  }

  /**
   * 获取公司列表
   */
  getCompany() {
    this.courseMgService.getCompany(this.coursePacketId).subscribe(
      res => {
        if (res.status === 200) {
          this.companyLists = res.data;
        }
      });
  }

  /**
   * 获取会计乐实训列表
   */
  getKjlTrain() {
    return new Promise((resolve) => {
      this.courseMgService.getKjlTrain(this.coursePacketId).subscribe(
        res => {
          if (res.status === 200) {
            this.kjlLists = res.data;
            resolve(true);
          }
        });
    });
  }

  syncChecked() {
    this.kjlLists.forEach(kjlItem => {
      this.KjlOption.every((item) => {
        if (kjlItem.code === item.kjlCourseId) {
          item.checked = true;
        } else {
          return true;
        }
      });
    });
  }

  /**
   * 获取会计乐全部实训
   */
  getKjlOption()  {
    return new Promise((resolve) => {
      this.courseMgService.getKjlOption().subscribe(
        (res: CommonData<{kjlCourseId: string; name: string, checked?: boolean}>) => {
          if (res.status === 200) {
            this.KjlOption = res.data;
            resolve(true);
          }
        });
    });
  }


  getHq() {
    this.courseMgService.getHq(this.coursePacketId).subscribe(
      res => {
        if (res.status === 200) {
          this.hqLists = res.data;
        }
      });
  }

  /**
   * 子题库列表
   */
  getSubLibrary() {
    this.searchLoad = true;
    this.courseMgService.getSubLibrary({
      coursePacketId: this.coursePacketId,
      quebankType: 1
    }).subscribe(res => {
      this.searchLoad = false;
      if (res.status === 200) {
        const listSublibraryBak = res.data.sort
        ((a, b) => Number(a.quebankId) > Number(b.quebankId) ? 1 : Number(a.quebankId) < Number(b.quebankId) ? -1 : 0);
        // tslint:disable-next-line:max-line-length
        const subQuestionBank = listSublibraryBak.filter(e => e.busType === '1').sort((a, b) => a.seq > b.seq ? 1 : a.seq < b.seq ? -1 : 0);
        // tslint:disable-next-line:max-line-length
        const subQuestionBankInt = listSublibraryBak.filter(e => e.busType === '2').sort((a, b) => a.seq > b.seq ? 1 : a.seq < b.seq ? -1 : 0);
        const subQuestionBankCurrentPre = subQuestionBank.map((item) => String(item.quebankId));
        const subQuestionBankCurrent = JSON.parse(JSON.stringify(subQuestionBankCurrentPre));
        const subQuestionBankIntCurrentPre = subQuestionBankInt.map((item) => String(item.quebankId));
        const subQuestionBankIntCurrent = JSON.parse(JSON.stringify(subQuestionBankIntCurrentPre));
        this.subQuestionBankCurrentPre = subQuestionBankCurrentPre;
        this.subQuestionBankCurrent = subQuestionBankCurrent;
        this.subQuestionBankIntCurrentPre = subQuestionBankIntCurrentPre;
        this.subQuestionBankIntCurrent = subQuestionBankIntCurrent;
        this.listSublibrary = listSublibraryBak;
        this.subQuestionBank = subQuestionBank;
        this.subQuestionBankInt = subQuestionBankInt;
      }
    }, () => this.searchLoad = false);
  }

  /**
   * 子题库新增删除
   * @param data
   * @param type
   */
  subQuestionBankChange(data: number[], type: 'subQuestionBank' | 'subQuestionBankInt') {
    debugger
    if (data.length > this[type + 'CurrentPre'].length) {
      const node: NzTreeNode =
        (type === 'subQuestionBank' ? this.treeSelect : this.treeSelectInt).getTreeNodeByKey(String(data[data.length - 1]));
      this.courseMgService.callSubLibrary({
        courseId: this.courseId,
        coursePacketId: this.coursePacketId,
        busType: type === 'subQuestionBank' ? '1' : '2',
        quebankId: node.origin.id,
        quebankName: node.origin.name,
        quebankType: 1,
        seq: ToolsUtil.getMaxSeq(this[type]),
        quebankModuleType: type === 'subQuestionBankInt' ? '1' : this.idMap[data[data.length - 1]] === 'EXAM' ? '2' : '1'
      }).subscribe(res => {
        if (res.status === 201) {
          this.getSubLibrary();
        }
      });
    } else {
      this[type + 'CurrentPre'].every((item, i) => {
        if (data.indexOf(item) < 0) {
          this.courseMgService.delSubLibrary({id: this[type][i].id}).subscribe(res => {
            if (res.status === 204) {
              this.getSubLibrary();
            }
          });
        } else {
          return true;
        }
      });
    }
  }

  /**
   *  开启99实训
   * @param val bool
   */
  practiceOnChange(val: boolean) {
    const flag = val ? '1' : '0';
    this.is99Train = flag;
    this.courseMgService.is99TrainUpdate(this.coursePacketId, flag).subscribe(
      res => {
        if (res.status === 201) {
          if (flag === '1') {
            this.getCompany();
          }
          SessionStorageUtil.putPacketInfoItem('is99Train', flag);
        }
      }
    );
  }

  /**
   * 会计乐实训开关
   * @param val
   */
  bookkeeperOnChange(val: boolean) {
    const flag = val ? '1' : '0';
    this.isKjlTrain = flag;
    this.courseMgService.isKjlTrainUpdate(this.coursePacketId, flag).subscribe(
      res => {
        if (res.status === 201) {
          if (flag === '1') {
            if (this.KjlOption.length) {
              this.getKjlTrain();
            } else {
              this.getKjlOption().then(res => {
                if (res) {
                  this.getKjlTrain();
                }
              });
            }
          }
          SessionStorageUtil.putPacketInfoItem('isKjlTrain', flag);
        }
      }
    );
  }

  /**
   * 用友
   * @param val
   */
  ufidaOnChange(val: boolean) {
    const flag = val ? '1' : '0';
    this.isYyTrain = flag;
    this.courseMgService.isYyTrainUpdate(this.coursePacketId, flag).subscribe(
      res => {
        if (res.status === 201) {
          SessionStorageUtil.putPacketInfoItem('isYyTrain', flag);
        }
      }
    );
  }


  hqOnChange(val: boolean) {
    const flag = val ? '1' : '0';
    this.isHqTrain = flag;
    this.courseMgService.isHqTrainUpdate(this.coursePacketId, flag).subscribe(
      res => {
        if (res.status === 201) {
          if (flag === '1') {
            this.getHq();
          }
          SessionStorageUtil.putPacketInfoItem('isHqTrain', flag);
        }
      }
    );
  }


  /**
   *  开启押题宝
   * @param val bool
   */
  readonly isBetChange = (val: boolean) => {
    const flag = val ? '1' : '0';
    this.isBet = flag;
    this.courseMgService.isBetUpdate(this.coursePacketId, flag).subscribe(
      res => {
        if (res.status === 201) {
          SessionStorageUtil.putPacketInfoItem('isBet', flag);
        }
      }
    );
  }

  /**
   * 新增编辑公司
   * @param companyItem
   */
  addOrEditCompany(companyItem: Partial<CompanyItem>) {
    this.modalService.create<NewCompanyComponent, NzSafeAny>({
      nzTitle: companyItem.id ? '编辑公司' : '新增公司',
      nzContent: NewCompanyComponent,
      nzComponentParams: {
        courseId: this.courseId,
        coursePacketId: this.coursePacketId,
        companyLists: this.companyLists,
        companyItem
      },
      nzMaskClosable: false,
      nzCancelText: '取消',
      nzOkText: '确定',
      nzWidth: 600,
    }).afterClose
      .subscribe((flag: boolean) => {
        if (flag) {
          this.getCompany();
        }
      });
  }


  addOrEditHq(hqItem: Partial<HqItem>) {
    this.modalService.create<NewHqComponent, NzSafeAny>({
      nzTitle: hqItem.id ? '编辑实训' : '新增实训',
      nzContent: NewHqComponent,
      nzComponentParams: {
        courseId: this.courseId,
        coursePacketId: this.coursePacketId,
        hqLists: this.hqLists,
        hqItem
      },
      nzMaskClosable: false,
      nzCancelText: '取消',
      nzOkText: '确定',
      nzWidth: 600,
    }).afterClose
      .subscribe((flag: boolean) => {
        if (flag) {
          this.getHq();
        }
      });
  }

  @ConfirmableFlat({
    title: '删除公司',
    content: (args) => ('确定删除' + args[0].name + '公司吗？'),
    type: 'error',
  })
  deleteCompany(data: CompanyItem, loadingControl?: LoadingControl) {
    loadingControl.loading = true;
    this.courseMgService.companyDeletion(data.id).subscribe(
      res => {
        loadingControl.loading = false;
        this.statisticsLogService.statisticsPacketInfoLog({
          name: '删除公司',
          actionCode: STATISTICALRULES.packetInfo['otherSet-99train-action'].delCode,
          content: data.id
        });
        if (res.status === 204) {
          this.getCompany();
        }
      }, () => loadingControl.loading = false
    );
  }

  @ConfirmableFlat({
    title: '删除实训',
    content: (args) => ('确定删除' + args[0].name + '实训吗？'),
    type: 'error',
  })
  deleteHq(data, loadingControl?: LoadingControl) {
    loadingControl.loading = true;
    this.courseMgService.hqDeletion(data.id).subscribe(
      res => {
        loadingControl.loading = false;
        // this.statisticsLogService.statisticsPacketInfoLog({
        //   name: '删除实训',
        //   actionCode: STATISTICALRULES.packetInfo['otherSet-99train-action'].delCode,
        //   content: data.id
        // });
        if (res.status === 204) {
          this.getHq();
        }
      }, () => loadingControl.loading = false
    );

  }


  /**
   * 子题库拖拽
   * @param event
   * @param label
   */
  listDrop(event: CdkDragDrop<any, any>, label: 'subQuestionBank' | 'subQuestionBankInt') {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    moveItemInArray(this[label], event.previousIndex, event.currentIndex);
    const arr = this[label].map((item) => String(item.quebankId));
    this[label + 'CurrentPre'] = arr;
    this[label + 'Current'] = JSON.parse(JSON.stringify(arr));
    this[label] = this[label];
    const params = [];
    this[label].forEach((item, i) => {
      params.push({
        id: item.id,
        seq: i
      });
    });
    this.courseMgService.sortSubQuestionBank(params).subscribe((res: any) => {
      if (res.status !== 201) {
        this.nzMsg.error(res.message || '移动失败，未知错误！');
      }
    });
  }

  /**
   * 删除子题库
   * @param data
   * @param loadingControl
   */
  @ConfirmableFlat({
    title: '删除子题库',
    content: '确定删除该子题库吗？',
    type: 'error'
  })
  dellistSublibraryItem(data: any, loadingControl?: LoadingControl) {
    if (!(Number(this.isUsed) > 0)) {
      loadingControl.loading = true;
      this.courseMgService.delSubLibrary({
        id: data.id
      }).subscribe(res => {
        loadingControl.loading = false;
        if (res.status === 204) {
          this.getSubLibrary();
        }
      }, () => loadingControl.loading = false);
    }
  }

  /**
   * 子题库树节点数据转换
   * @param data 节点
   */
  private conversionNode = (data) => {
    if (data.length) {
      data.forEach((item, ii) => {
        if (item.sublibraryModuleList && item.sublibraryModuleList.length) {
          data[ii].children = item.sublibraryModuleList;
          data[ii].children.forEach((child, iii) => {
            data[ii].children[iii].title = child.name;
            data[ii].children[iii].key = String(child.id);
            data[ii].children[iii].isLeaf = true;
          });
        }
        data[ii].title = item.name;
        data[ii].key = item.code;
        data[ii].disabled = true;
        data[ii].selectable = false;
        if (!item.sublibraryModuleList || !item.sublibraryModuleList.length) {
          data[ii].isLeaf = true;
        }
      });
    }
    return data;
  }

  /**
   * 获取主视频信息
   */
  getTotalInfo() {
    this.courseMgService.getTotalInfo(this.coursePacketId).subscribe(res => {
      if (res.status === 200) {
        this.mainVideo = res.data.sectionVideoNum;
      }
    });
  }

  /**
   * 获取知识点信息
   */
  getTotalKnowledgePointsInfo() {
    this.courseMgService.getTotalKnowledgePointsInfo(this.knowledgeSubjectId).subscribe(res => {
      if (res.status === 200) {
        this.knowledgeExplanationVideo = res.data.lackVideoNum;
      }
    });
  }

  /**
   * 下一步
   */
  nextStep() {
    if (!this.lock) {
      this.lock = true;
      this.changeProgress(-1, 'next');
    }
  }

  /**
   * 上一步
   */
  preStep() {
    if (!this.lock) {
      this.lock = true;
      this.changeProgress(1, 'prev');
    }
  }

  submitReview() {
    this.isSmart = SessionStorageUtil.getPacketInfoItem('isSmart');
    this.seeDetails = true;
  }

  async changeProgress(index: number, direction: 'prev' | 'next' | 'direct') {
    if (this.preview === '0') {
      if (!this.checkStructure()) { // 章节校验
        this.lock = false;
        return;
      }
      const step = this.curProgress;
      const limit  = (this.teachType !== '22') ? 2 : 1;
      if (index === -1) {// 点按钮从0-4
        if (step === limit) {// 其他设置校验
          if (this.teachType !== '22') {
            if (!await this.getLessonCountTable()) {
              this.warning('课次设置', '请先生成课次');
              this.lock = false;
              return;
            }
          }
        }
      } else {// 直接点
        if (index > limit && step < limit) {
          if (this.teachType !== '22') {
            if (!await this.getLessonCountTable()) {
              this.warning('请生成课次', '请先到课次设置tab生成课次');
              this.lock = false;
              return;
            }
          }
        } else if (index > limit && step === limit) {
          if (this.teachType !== '22') {
            if (!await this.getLessonCountTable()) {
              this.warning('课次设置', '请先生成课次');
              this.lock = false;
              return;
            }
          }
        }
      }
    }
    if (direction === 'prev') {
      this.curProgress--;
    } else if (direction === 'next') {
      this.curProgress++;
    } else {
      this.curProgress = index;
    }
    SessionStorageUtil.putPacketInfoItem('curProgress', String(this.curProgress));
    this.lock = false;
  }

  /**
   * 根据前tab自动刷新数据
   */
  recoveryTabData() {
    if (this.curProgress === 3 || (this.curProgress === 2 && this.teachType === '22')) {
      this.verificationAudit(); // 验证课程组成员
      this.getTotalInfo(); // 获取主视频信息
      this.getTotalKnowledgePointsInfo(); // 获取知识图谱信息
      this.getFininTabSub(this.innerCurProgress);
    } else if (this.curProgress === 2) {
      this.getLessonCountTableList(); // 获取课次列表
    }
  }


  /**
   * 监听内tab切换
   * @param step
   */
  innerCurProgressChange(step: number) {
    this.getFininTabSub(step);
    SessionStorageUtil.putPacketInfoItem('innerCurProgress', String(step));
  }

  /**
   * 课程组成员检查
   */
  verificationAudit() {
    this.courseMgService.getApproveStatus(this.code).subscribe(res => {
      if (res.status === 200) {
        this.ifApprove = res.data;
      }
    });
  }

  /**
   * 课次检查
   */
  async getLessonCountTable() {
    return new Promise((resolve) => {
      this.courseMgService.getLessonPackageTable(this.coursePacketId).subscribe(res => {
        if (res.status === 200) {
          if (res.data && res.data.length) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          this.nzMsg.warning('检查课次失败 ' + JSON.stringify(res));
        }
      }, err => {
        this.nzMsg.warning('检查课次失败 ' + JSON.stringify(err));
      });
    });
  }

  /**
   * 校验每节绑定主讲义任务数
   * @param flag
   */
  async realCheckLearningSettings(flag) {
    const result: any = await this.syncCheckLearningSettings();
    if (result.data && result.data.length) {
      this.exceedLength = result.data.length;
      this.jumpFlag = flag;
      this.listOfData = result.data;
      this.independentTask = true;
      return false;
    } else {
      return true;
    }
  }

  /**
   * 校验每节绑定主讲义任务数
   */
  syncCheckLearningSettings() {
    return new Promise((resolve, reject) => {
      this.courseMgService.checkLearningSettings(this.coursePacketId).subscribe(res => {
        if (res.status === 200) {
          resolve(res);
        } else {
          this.nzMsg.warning('校验每节绑定主讲义任务数失败，请稍后再试');
        }
      }, err => {
        this.nzMsg.warning('校验每节绑定主讲义任务数失败，请稍后再试');
      });
    });
  }

  /**
   * 校验章节设置
   */
  checkStructure() {
    if (this.curProgress === 0 && this.preview === '0' && !this.lessonPackageStructure.checkStructure()) {
      this.warning('课包结构', '您还存在章节没有设置，请完成全部章节结构才能进入下一步');
      return false;
    }
    return true;
  }


  private warning(title: string, content: string) {
    this.modal.warning({
      nzTitle: title,
      nzContent: content
    });
  }

  back() {
    this.menuService.goBack(false);
    this.menuService.gotoUrl({
      url: '/m/course-manage/scp-list',
      paramUrl: '',
      title: '课包'
    });
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

  /**
   * 课程审批
   */
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


  lookOver() {
    this.independentTask = false;
    this.seeMoreIndependentTask = true;
  }

  /**
   * 初始化课包参数
   */
  initParams() {
    const {
      name, curProgress, status, courseId, professionId, id, lessonCount, isSmart, code, isCard, is99Train, isBet,
      teachType, auditStatus, preview, createrId, pcode, knowledgeSubjectId, exerciseType, isUsed, majorLeaderId, innerCurProgress,
      isHqTrain, isYyTrain , isKjlTrain
    }
      = SessionStorageUtil.getPacketInfo();
    this.title = name; // 课包名称
    this.isYyTrain = isYyTrain;
    this.isKjlTrain = isKjlTrain;
    this.innerCurProgress = Number(innerCurProgress);
    this.is99Train = is99Train;
    this.isHqTrain = isHqTrain;
    this.isBet = isBet;
    this.curProgress = Number(curProgress);
    this.status = status; // 课包状态
    this.courseId = courseId; // 课程id
    this.professionId = professionId; //  学科id
    this.coursePacketId = id; //  课包
    this.isUsed = isUsed;
    this.isCard = isCard;
    this.majorLeaderId = majorLeaderId;
    this.lessonCount = Number(lessonCount); // 课次
    this.isSmart = isSmart; // 智适应
    this.code = code; // 课程编码
    this.teachType = teachType; // 授课方式: 线下面授(11)、线下双师(12)、线上直播(21)、线上录播(22)
    this.auditStatus = auditStatus; // 审核流程状态
    this.preview = preview;
    this.createrId = createrId;
    this.pcode = pcode;
    this.knowledgeSubjectId = knowledgeSubjectId;
    this.exerciseType = exerciseType;
    this.intellectualAdaptationInit = isSmart === '1';
  }

  /**
   * 新增课次
   */
  newClass() {
    if (this.listOfDataTable.length >= 200) {
      this.nzMsg.warning('课次最多只能新增200个');
      return of([]);
    }
    const max = ToolsUtil.getMaxSeq(this.listOfDataTable.filter(item => item.seq));
    this.isLoading = true;
    const content = {
      name: '第' + max + '课次',
      courseId: this.courseId,
      coursePacketId: this.coursePacketId,
      seq: max
    };
    this.courseMgService.saveTable(content).subscribe(res => {
      this.isLoading = false;
      if (res.status === 201) {
        this.statisticsLogService.statisticsPacketInfoLog({
          name: '新增课次',
          actionCode: STATISTICALRULES.packetInfo['otherSet-lessons-action'].addCode,
          content: JSON.stringify(content),
        });
        this.getLessonCountTableList();
      }
    }, () => this.isLoading = false);
  }

  /**
   * 删除课次
   * @param id
   * @param loadingControl
   */
  @ConfirmableFlat({
    title: '删除',
    content: '确定删除该课次吗？',
    type: 'error'
  })
  delTable(id: string, loadingControl?: LoadingControl) {
    loadingControl.loading = true;
    return this.courseMgService.delTable(id).subscribe(
      res => {
        loadingControl.loading = false;
        if (res.status === 204) {
          this.statisticsLogService.statisticsPacketInfoLog({
            name: '删除课次',
            actionCode: STATISTICALRULES.packetInfo['otherSet-lessons-action'].delCode,
            content: id
          });
          this.getLessonCountTableList();
        }
      }, () => loadingControl.loading = false);
  }

  /**
   *  编辑课次
   * @param data 当前课次
   */
  edit(data: any) {
    this.modalService.create<EditLessonComponent, NzSafeAny>({
      nzTitle: '编辑课次',
      nzContent: EditLessonComponent,
      nzComponentParams: {
        data,
      },
      nzMaskClosable: false,
      nzCancelText: '取消',
      nzOkText: '确定',
    }).afterClose
      .subscribe((flag: boolean) => {
        if (flag) {
          this.getLessonCountTableList();
        }
      });
  }

  /**
   * 获取课次列表
   */
  getLessonCountTableList() {
    this.isTableLoading = true;
    this.courseMgService.getLessonPackageTable(this.coursePacketId).subscribe(res => {
      this.isTableLoading = false;
      if (res.status === 200) {
        if (res.data && res.data.length) {
          res.data.forEach((item, ii) => {
            res.data[ii].index = ii + 1;
          });
          this.listOfDataTable = res.data;
          this.lessonCount = res.data.length;
        } else {
          this.listOfDataTable = [];
          this.lessonCount = 0;
        }
        SessionStorageUtil.putPacketInfoItem('lessonCount', this.lessonCount);
      }
    }, () => this.isTableLoading = false);
  }

  /**
   * 钉钉审批
   */
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

  /**
   * 生成课次
   */
  generateLessons() {
    if (this.listOfDataTable.length) {
      this.generateLessonsAlert();
    } else {
      this.generateLessonsReal(() => {
      });
    }
  }

  generateLessonsReal(resolve) {
    this.isLoading = true;
    return this.courseMgService.lessonPackage(this.coursePacketId, this.lessonCount, this.courseId).subscribe(
      res => {
        this.isLoading = false;
        if (res.status === 201) {
          this.statisticsLogService.statisticsPacketInfoLog({
            name: '生成课次',
            actionCode: STATISTICALRULES.packetInfo['otherSet-lessons-action'].addCode,
            content: JSON.stringify({coursePacketId: this.coursePacketId, lessonCount: this.lessonCount, courseId: this.courseId}),
          });
          this.getLessonCountTableList();
          resolve(true);
        }
      }, () => this.isLoading = false);
  }

  @ConfirmableDesc({
    title: '提示',
    content: '重新生成课次会覆盖已生成的课次，确定重新生成吗？',
    type: 'warning'
  })
  private generateLessonsAlert() {
    return new Promise((resolve) => {
        this.generateLessonsReal(resolve);
      }
    );
  }

  breakthroughModeChange = (val) => {
    const flag = val ? '1' : '0';
    this.isCard = flag;
    this.courseMgService.isCardUpdate(this.coursePacketId, flag).subscribe(
      res => {
        if (res.status === 201) {
          if (flag === '1') {
            this.getLevel();
          }
          SessionStorageUtil.putPacketInfoItem('isCard', flag);
        }
      }
    );
  }

  /**
   * 闯关列表
   */
  getLevel() {
    this.courseMgService.levelList(this.coursePacketId).subscribe(
      res => {
        if (res.status === 200) {
          const levelLists = res.data.sort((a, b) => a.seq > b.seq ? 1 : a.seq < b.seq ? -1 : 0);
          levelLists.forEach((item) => {
            if (item.coursePacketCardRecourseList) {
              item.coursePacketCardRecourseList =
                item.coursePacketCardRecourseList.sort((a, b) => a.seq > b.seq ? 1 : a.seq < b.seq ? -1 : 0);
            }
          });
          this.levelLists = levelLists;
        }
      });
  }

  /**
   * 新增编辑闯关
   * @param levelItem
   */
  addOrEditLevel(levelItem) {
    return ToolsUtil.getAjax(environment.questionBankApi + 'system/qkcPaper/courseCode', {
      courseCode: this.code,
      type: ''
    }).subscribe(
      resultS => {
        try {
          const resP = JSON.parse(resultS);
          if (resP.code === 200) {
            if (resP.data) {
              let reduce = [];
              if (resP.data.length) {
                const moduleArrInner = JSON.parse(JSON.stringify(resP.data));
                // 获取模块列表
                moduleArrInner.forEach(itemX => {
                  reduce = itemX.sublibraryModuleList.filter(itemIn => itemIn.type === 'EXAM').concat(reduce);
                });
                this.moduleArr = reduce;
              } else {
                this.exam = [];
                this.intelligent = [];
                this.moduleArr = [];
              }
              if (reduce.length) {
                this.modalService.create<NewLevelComponent, NzSafeAny>({
                  nzTitle: levelItem.id ? '编辑关卡' : '新增关卡',
                  nzContent: NewLevelComponent,
                  nzComponentParams: {
                    courseId: this.courseId,
                    coursePacketId: this.coursePacketId,
                    moduleArr: this.moduleArr,
                    levelLists: this.levelLists,
                    levelItem
                  },
                  nzMaskClosable: false,
                  nzCancelText: '取消',
                  nzOkText: '确定',
                  nzWidth: 900,
                }).afterClose
                  .subscribe((flag: boolean) => {
                    if (flag) {
                      this.getLevel();
                    }
                  });
              } else {
                this.nzMsg.warning('该课包的课程尚没有子模块，请到题库新加子模块再来新增关卡');
              }
            }
          } else {
            this.nzMsg.error(resP.message);
          }
        } catch {
          this.nzMsg.error('获取题库子模块列表失败，新增关卡需要子模块信息，请稍后再试新增');
        }
      }, () => {
        this.nzMsg.error('获取题库子模块列表失败，新增关卡需要子模块信息，请稍后再试新增');
      }
    );
  }

  /**
   * 删除关卡
   * @param data
   * @param loadingControl
   */
  @ConfirmableFlat({
    title: '删除关卡',
    content(args) {
      return this.status ? '删除该关卡将同步删除所有学员在此关卡上的所有闯关记录。' : '确定删除' + args[0].name + '关卡吗？';
    },
    type: 'error',
  })
  deleteLevel(data: LevelItem, loadingControl?: LoadingControl) {
    loadingControl.loading = true;
    this.courseMgService.levelDeletion(data.id).subscribe(
      res => {
        loadingControl.loading = false;
        if (res.status === 204) {
          this.getLevel();
          this.statisticsLogService.statisticsPacketInfoLog({
            name: '删除关卡',
            actionCode: STATISTICALRULES.packetInfo['otherSet-levelthrough-action'].delCode,
            content: data.id
          });
        }
      }, () => loadingControl.loading = false
    );
  }

  /**
   * 奖励设置
   * @param data
   */
  rewardSettings(data) {
    if (data.coursePacketCardRecourseList && data.coursePacketCardRecourseList.length) {
      data.coursePacketCardRecourseList.forEach((itemx) => {
        itemx.thumbUrl = null;
        itemx.name = itemx.title;
      });
    }
    this.modalService.create<RewardSettingsComponent, NzSafeAny>({
      nzTitle: '奖励设置',
      nzContent: RewardSettingsComponent,
      nzComponentParams: {
        courseId: this.courseId,
        coursePacketId: this.coursePacketId,
        professionId: this.professionId,
        currentCard: data,
      },
      nzMaskClosable: false,
      nzCancelText: '取消',
      nzOkText: '确定上传',
    }).afterClose
      .subscribe((flag: boolean) => {
        if (flag) {
          this.getLevel();
        }
      });
  }

  /**
   * 删除奖励
   * @param id
   * @param loadingControl
   */
  @ConfirmableFlat({
    title: '删除奖励',
    content: '确定删除该资源吗？',
    type: 'error'
  })
  deleteGift(id: string, loadingControl?: LoadingControl) {
    loadingControl.loading = true;
    return this.courseMgService.levelDataDeletion(id).subscribe(
      res => {
        loadingControl.loading = false;
        if (res.status === 204) {
          this.statisticsLogService.statisticsPacketInfoLog({
            name: '删除奖励',
            actionCode: STATISTICALRULES.packetInfo['otherSet-levelthrough-action'].delCode,
            content: id
          });
          this.getLevel();
        }
      }, () => loadingControl.loading = false
    );
  }


  /**
   * 进行章节绑定
   */
  bindKnowledgePoints() {
    this.bindLoading = true;
    this.courseMgService.bindKnowledgePointsBatch(this.bindList).subscribe(res => {
      if (res.status === 201) {
        const field = this.chapterBindingEdit ? 'modify' : 'addCode';
        this.statisticsLogService.statisticsPacketInfoLog({
          name: '章节绑定' + (this.chapterBindingEdit ? '修改' : '新增'),
          actionCode: STATISTICALRULES.packetInfo['intellectual-chapterbind-action'][field],
          content: JSON.stringify(this.bindList),
        });
        this.getChapterBindList();
      }
      this.bindLoading = false;
    }, err => {
      this.bindLoading = false;
    });
  }

  /**
   * 章节绑定弹框
   */
  bind() {
    this.bindList = [];
    this.chapterBindingVisible = true;
    this.chapterBindingEdit = false;
    this.knowledgeGraphStructureVisible = false;
    this.lessonPackageStructureVisible = false;
    timer(0).subscribe(() => {
      this.lessonPackageStructureVisible = true;
    });
  }

  /**
   * 章节点击
   * @param node
   */
  nodeChange(node: NodeChangeEvent) {
    this.curNode = node;
    const {id, key} = node.data;
    const idR = id ? id : (key ? key : '');
    let idx;
    if (this.bindList.every((e, i) => {
      if (e.courseSectionId === idR) {
        idx = i;
        return;
      } else {
        return true;
      }
    })) {
      // 没有缓存
      this.knowledgeGraphLoading = true;
      const params = {
        courseSectionId: idR,
        courseId: this.courseId,
        coursePacketId: this.coursePacketId
      };
      this.courseMgService.getKnowledgePoints(params).subscribe(res => {
        this.knowledgeGraphLoading = false;
        if (res.status === 200) {
          this.defaultTreeKey = res.data.map(e => e.knowledgeUnitId);
          this.knowledgeGraphStructureVisible = true;
          this.selectId = this.defaultTreeKey;
          this.bindList.push({
            courseSectionId: idR,
            courseId: this.courseId,
            coursePacketId: this.coursePacketId,
            knowledgeUnitIdList: this.defaultTreeKey
          });
        }
      }, () => {
        this.knowledgeGraphLoading = false;
      });
    } else {
      // 从缓存中取
      this.defaultTreeKey = this.bindList.filter((ee, ii) => ii === idx)[0].knowledgeUnitIdList;
      this.selectId = this.defaultTreeKey;
      this.knowledgeGraphStructureVisible = true;
    }
  }

  /**
   * 知识点点击
   * @param nodeOpt
   */
  nodeChangeKnowledge(nodeOpt: any) {
    // 收集点选
    if (nodeOpt.length) {
      this.selectId = [];
      nodeOpt.forEach(e => {
        if (e.origin.kType === '2') {
          if (e.origin.children && e.origin.children.length) {
            e.origin.children.forEach(eeee => {
              this.selectId.push(eeee.id);
            });
          }
        } else if (e.origin.kType === '3') {
          this.selectId.push(e.origin.id);
        } else {
          if (e.origin.children && e.origin.children.length) {
            e.origin.children.forEach(ee => {
              if (ee.children && ee.children.length) {
                ee.children.forEach((eee) => {
                  this.selectId.push(eee.id);
                });
              }
            });
          }
        }
      });
    } else {
      this.selectId = [];
    }
    // 存到缓存
    this.bindList.every((eee, iii) => {
      if (eee.courseSectionId === this.curNode.data.id || eee.courseSectionId === this.curNode.data.key) {
        this.bindList[iii].knowledgeUnitIdList = this.selectId;
        return;
      } else {
        return true;
      }
    });
  }

  /**
   * 章节绑定修改
   * @param data
   */
  modify(data: any) {
    this.chapterBindingEdit = true;
    this.knowledgeGraphStructureVisible = false;
    this.lessonPackageStructureVisible = false;
    this.chapterBindingVisible = true;
    this.bindList = [];
    setTimeout(() => {
      this.defaultSection = {key: data.sectionId}; // 定位节
      this.defaultChapter = [data.chapterId.split(',')[0]]; // 定位章
      this.lessonPackageStructureVisible = true;
    });
  }

  /**
   * 章节解绑
   * @param data
   * @param loadingControl
   */
  @ConfirmableFlat({
      title: '解绑',
      content: (args) => ('确定对“' + args[0].sectionName + '小节名称”与知识图谱进行解绑吗？'),
      type: 'warning'
    }
  )
  untie(data: any, loadingControl?: LoadingControl) {
    this.untieLoading = loadingControl.loading = true;
    this.courseMgService.unbindKnowledgePoints(data.sectionId).subscribe((res) => {
      this.untieLoading = loadingControl.loading = false;
      if (res.status === 200) {
        this.statisticsLogService.statisticsPacketInfoLog({
          name: '章节绑定解绑',
          actionCode: STATISTICALRULES.packetInfo['intellectual-chapterbind-action'].delCode,
          content: JSON.stringify({sectionId: data.sectionId}),
        });
        this.bindList.every((item, itemIndex) => {
          if (item.id === data.sectionId) {
            this.bindList.splice(itemIndex, 1);
          } else {
            return true;
          }
        });
        this.getChapterBindList();
      }
    }, () => {
      this.untieLoading = loadingControl.loading = false;
    });
  }

  /**
   * 格式化章节绑定显示
   * @param knowledgeUnits
   */
  getBingData(knowledgeUnits: any) {
    const knoArr = knowledgeUnits.split(',');
    if (knoArr.length > 5) {
      knoArr.length = 5;
      return knoArr.join(',') + ',...';
    } else {
      return knowledgeUnits;
    }
  }

  /**
   * 录播任务周期Focus
   * @param key
   */
  applicableFocus(key: string) {
    this[key + 'Pre'] = this[key];
  }

  /**
   * 录播任务周期Blur
   * @param data
   * @param key
   * @param label
   */
  applicableWeekChange(data: any, key: string, label: string) {
    if (this[label + 'Pre']) {
      if (this[label] && this[label] > 0) {
        if (this[label] !== this[label + 'Pre']) {
          this.setLessonPackage({
            id: this.coursePacketId,
            [key]: this[label]
          });
        }
      } else {
        timer(0).subscribe(() => {
          this[label] = this[label + 'Pre'];
        });
      }
    } else {
      if (this[label] && this[label] > 0) {
        this.setLessonPackage({
          id: this.coursePacketId,
          [key]: this[label]
        });
      }
    }
  }

  /**
   * 录播任务周期开启关闭
   * @param e
   * @param key
   * @param label
   */
  applicableChange(e: boolean, key: string, label: string) {
    if (!e) {
      const map = {
        seniorWeekNum: 'applicableExperts',
        middleWeekNum: 'applicableHasAFoundation',
        juniorWeekNum: 'applicableZeroBasis'
      };
      const {applicableZeroBasisWeek, applicableExpertsWeek, applicableHasAFoundationWeek} = this;
      if ((
        key === 'juniorWeekNum' && !(applicableHasAFoundationWeek || applicableExpertsWeek)
      ) || (
        key === 'middleWeekNum' && !(applicableZeroBasisWeek || applicableExpertsWeek)
      ) || (
        key === 'seniorWeekNum' && !(applicableHasAFoundationWeek || applicableZeroBasisWeek)
      )) {
        this.nzMsg.warning('学习计划为必填项,请保留至少一个计划');
        timer(0).subscribe(() => {
          this[map[key]] = true;
        });
        return;
      }
      this[label] = '';
      this.setLessonPackage({
        id: this.coursePacketId,
        [key]: 0
      });
    }
  }

  /**
   * 保存操作
   * @param params
   */
  setLessonPackage(params) {
    return new Promise((resolve) => {
      this.courseMgService.setLessonPackage(params).subscribe(res => {
        if (res.status === 201) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, () => {
        resolve(false);
      });
    });
  }


  /**
   * 同步智适应数据
   */
  initIntellectualAdaptationData() {
    this.getLessonPackage();
    this.getChapterBindList();
  }


  /**
   * 回显操作
   */
  getLessonPackage() {
    this.courseMgService.getLessonPackage(this.coursePacketId, this.courseId).subscribe(res => {
      if (res.status === 200) {
        const {
          juniorWeekNum, middleWeekNum, seniorWeekNum, totalSectionNum
        } = res.data;
        // 回显录播计划
        this.totalSectionNum = totalSectionNum ? totalSectionNum : 0;
        if (juniorWeekNum) {
          this.applicableZeroBasisWeekPre = this.applicableZeroBasisWeek = juniorWeekNum;
          this.applicableZeroBasis = true;
        }
        if (middleWeekNum) {
          this.applicableHasAFoundationWeekPre = this.applicableHasAFoundationWeek = middleWeekNum;
          this.applicableHasAFoundation = true;
        }
        if (seniorWeekNum) {
          this.applicableExpertsWeekPre = this.applicableExpertsWeek = seniorWeekNum;
          this.applicableExperts = true;
        }
      }
    });
  }

  /**
   * 获取章节绑定列表
   */
  getChapterBindList() {
    this.courseMgService.getChapterBindList({
      courseId: this.courseId,
      coursePacketId: this.coursePacketId
    }).subscribe(res => {
      if (res.status === 200) {
        if (res.data.length > 0) {
          this.listOfDataChapterBind = res.data.map((e, i) => {
            return {
              sectionName: e.chapterSeq + '.' + e.sectionSeq + ' ' + e.sectionName,
              knowledgeUnits: e.knowledgeUnits,
              sectionId: e.sectionId,
              chapterId: e.chapterId
            };
          });
        } else {
          this.listOfDataChapterBind = [];
        }
      }
    });
  }

  /**
   * 显示审批
   */
  showAudit() {
    return (
      (this.curProgress === 3 || (this.teachType === '22' && this.curProgress === 2)) // 最后一步
      && this.preview === '0'  // 非预览
      && (this.auditStatus === '0' || this.auditStatus === '3') // 待审批
      && this.ifApprove); // 课程组成员
  }

  /**
   * 禁用审批
   */
  disabledAudit() {
    const {teachType} = this;
    const {
      applicableHasAFoundationWeek,
      applicableExpertsWeek,
      applicableZeroBasisWeek, listOfDataChapterBind
    } = this;
    const commonIf = (!!listOfDataChapterBind.length);
    return ((
        !(
          ((applicableHasAFoundationWeek || applicableExpertsWeek || applicableZeroBasisWeek) // 录播任务周期设定
            && commonIf // 章节绑定
            && teachType === '22')  // 录播
          ||
          (commonIf // 章节绑定
            && teachType !== '22')) // 非录播
      )
      && Number(SessionStorageUtil.getPacketInfoItem('isSmart')) === 1) // 开启图谱
      || (this.KjlOption.filter(item => item.checked).length === 0 && this.isKjlTrain === '1');
  }
}
