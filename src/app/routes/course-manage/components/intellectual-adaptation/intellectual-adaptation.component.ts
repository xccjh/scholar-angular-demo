import {Component, Inject, Input, LOCALE_ID, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzMessageService, NzModalService, NzTreeComponent, NzTreeNodeOptions} from 'ng-zorro-antd';
import {CourseManageService} from '@app/busi-services/course-manage.service';
import {NodeChangeEvent} from '../course-structure-tree/course-structure-tree.component';
import {ActivatedRoute} from '@angular/router';
import {MenuService} from 'core/services/menu.service';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {formatDate} from '@angular/common';
import {timer} from 'rxjs';
import {ConfirmableFlat, getSetChange} from 'core/decorators';
import {HttpHeaders, HttpResponse} from '@angular/common/http';
import {LoadingControl} from 'core/base/common';
import {STATISTICALRULES} from 'core/base/static-data';
import {StatisticsLogService} from '@app/busi-services/statistics-log.service';

@Component({
  selector: 'app-intellectual-adaptation',
  templateUrl: './intellectual-adaptation.component.html',
  styleUrls: ['./intellectual-adaptation.component.less']
})
export class IntellectualAdaptationComponent implements OnInit {
  date;
  nodes: NzTreeNodeOptions[] = [];
  teacherData = [];
  listOfData = [];
  knowledgeSubjectId = '';
  examSettingForm: FormGroup;
  curNode: NodeChangeEvent;
  defaultTreeKey = [];
  knowledgePointIds = [];
  selectId: any[];
  clickFlag: any = {};
  isVisible = false;
  value = '';
  chapterBindingVisible = false;
  now = new Date();
  isDailyOn = false;
  isSprintOn = false;
  isFinalOn = false;
  courseService;
  defaultTeacherId = [];
  addExamFrom: any;
  selectedValue: any;
  isStandard = false;
  dataSet = [
    {}
  ];
  applicableZeroBasis = false;
  applicableExperts = false;
  applicableHasAFoundation = false;
  examTimePre;
  finalTimePre;
  sprintTimePre;
  examTime; // 国家考试
  finalTime; // 秘压
  sprintTime; // 冲刺
  applicableHasAFoundationWeekPre: any; // 有基础
  applicableExpertsWeekPre: any; // 专家
  applicableZeroBasisWeekPre: any; // 零基础
  applicableHasAFoundationWeek: any;
  applicableExpertsWeek: any;
  applicableZeroBasisWeek: any;
  teachType;
  preview;
  code;
  coursePacketId;
  courseId;
  professionId;
  @getSetChange<boolean>({
    initSet(val) {
      // if (val) {
      this.initIntellectualAdaptationData();
      // }
    },
    set(val) {
      const flag = val ? '1' : '0';
      this.courseMgService.isSmartUpdate(this.coursePacketId, flag).subscribe(res => {
        if (res.status === 201) {
          if (val) {
            this.initIntellectualAdaptationData();
          }
          SessionStorageUtil.putPacketInfoItem('isSmart', flag);
        }
      });
    }
  })
  intellectualAdaptation: boolean;
  bindList = [];
  bindLoading = false; // 章节绑定loading
  knowledgeGraphLoading = false; // 知识图谱loading
  untieLoading = false; // 解绑loading
  totalSectionNum = 0; // 左右节总数
  knowledgeGraphStructureVisible = false;  // 知识图谱树
  lessonPackageStructureVisible = true; // 课程章节树
  defaultSection: object; // 默认选中节
  defaultChapter = []; // 默认点选章
  chapterBindingEdit: boolean;
  examTimeRequire = false;
  @Input() adaptive = {
    middleWeekNum: false,
    juniorWeekNum: false,
    seniorWeekNum: false,
    listOfData: [],
    examTime: null,
    finalTime: null,
    sprintTime: null,
    isSprintOn: false,
    isFinalOn: false,
    examTimeRequire: false
  }; // 用来通知父级当前组件状态


  @ViewChild('nzTreeComponent', {static: false}) nzTreeComponent!: NzTreeComponent;
  @ViewChild('addExam') addExam: TemplateRef<any>;

  constructor(private fb: FormBuilder,
              private courseMgService: CourseManageService,
              private modalService: NzModalService,
              private nzMesService: NzMessageService,
              private route: ActivatedRoute,
              private menuService: MenuService,
              private statisticsLogService: StatisticsLogService,
              @Inject(LOCALE_ID) public locale: string
  ) {
    // this.initFrom();
  }

  ngOnInit() {
    this.getParams();
  }

  initIntellectualAdaptationData() {
    this.getLessonPackage();
    this.getChapterBindList();
  }

  initFrom() {
    this.addExamFrom = this.fb.group({
      missionName: ['', [Validators.required]],
      formingMethod: [1, [Validators.required]],
    });
    this.examSettingForm = this.fb.group({
      id: [this.courseId],
      examLength: [0, Validators.required],
      isComputer: ['1', Validators.required],
      computerType: ['1'],
      answerTimes: [0, Validators.required],
      deadTime: [new Date(), Validators.required],
      resultWay: ['1', Validators.required],
    });
  }

// 回显操作
  getLessonPackage() {
    this.courseMgService.getLessonPackage(this.coursePacketId, this.courseId).subscribe(res => {
      if (res.status === 200) {
        const {
          teacherDtoList, knowledgeSubjectId, examTime, sprintTime, finalTime,
          isDailyOn, isSprintOn, isFinalOn, defaultTeacherId, juniorWeekNum, middleWeekNum, seniorWeekNum, totalSectionNum
        } = res.data;
        this.teacherData = teacherDtoList;
        this.defaultTeacherId = defaultTeacherId ? defaultTeacherId.split(',') : [];
        this.knowledgeSubjectId = knowledgeSubjectId;
        this.isDailyOn = isDailyOn === '1' ? true : false;
        this.isSprintOn = this.adaptive.isSprintOn = isSprintOn === '1' ? true : false;
        this.isFinalOn = this.adaptive.isFinalOn = isFinalOn === '1' ? true : false;
        this.totalSectionNum = totalSectionNum ? totalSectionNum : 0;
        if ((this.isSprintOn || this.isFinalOn) && this.intellectualAdaptation) {
          this.examTimeRequire = true;
          this.adaptive.examTimeRequire = true;
        } else {
          this.examTimeRequire = false;
          this.adaptive.examTimeRequire = false;
        }

        // 回显考试日期
        ['examTime', 'sprintTime', 'finalTime'].forEach((item => {
          if (res.data[item]) {
            this[item] = this[item + 'Pre'] = this.adaptive[item] = new Date(res.data[item]);
          } else {
            this[item] = this[item + 'Pre'] = this.adaptive[item] = null;
          }
        }));
        // 回显录播讲师
        if (teacherDtoList.length) {
          teacherDtoList.forEach((ee, ii) => {
            if (this.defaultTeacherId.indexOf(ee.teacherId) > -1) {
              this.clickFlag[ii] = true;
            } else {
              this.clickFlag[ii] = false;
            }
          });
        }
        // 回显录播计划
        if (juniorWeekNum) {
          this.applicableZeroBasisWeekPre = this.applicableZeroBasisWeek = juniorWeekNum;
          this.applicableZeroBasis = true;
          this.adaptive.juniorWeekNum = true;
        } else {
          this.adaptive.juniorWeekNum = false;
        }
        if (middleWeekNum) {
          this.applicableHasAFoundationWeekPre = this.applicableHasAFoundationWeek = middleWeekNum;
          this.applicableHasAFoundation = true;
          this.adaptive.middleWeekNum = true;
        } else {
          this.adaptive.middleWeekNum = false;
        }
        if (seniorWeekNum) {
          this.applicableExpertsWeekPre = this.applicableExpertsWeek = seniorWeekNum;
          this.applicableExperts = true;
          this.adaptive.seniorWeekNum = true;
        } else {
          this.adaptive.seniorWeekNum = false;
        }
      }
    });
  }

// 保存操作
  setLessonPackage(params) {
    // if (this.checkData() || this.checkPlan()) {
    //   return true;
    // }
    // const {
    //   coursePacketId, defaultTeacherId, examTime, sprintTime, finalTime, isDailyOn,
    //   isSprintOn, isFinalOn, applicableHasAFoundationWeek, applicableExpertsWeek, applicableZeroBasisWeek
    // } = this;
    // const params = {
    //   id: coursePacketId,
    //   defaultTeacherId: defaultTeacherId.join(','),
    //   examTime: formatDate(examTime, 'yyyy-MM-dd', this.locale),
    //   sprintTime: formatDate(sprintTime, 'yyyy-MM-dd', this.locale),
    //   finalTime: formatDate(finalTime, 'yyyy-MM-dd', this.locale),
    //   isDailyOn: isDailyOn ? '1' : '0',
    //   isSprintOn: isSprintOn ? '1' : '0',
    //   isFinalOn: isFinalOn ? '1' : '0',
    //   middleWeekNum: applicableHasAFoundationWeek ? applicableHasAFoundationWeek : 0,
    //   seniorWeekNum: applicableExpertsWeek ? applicableExpertsWeek : 0,
    //   juniorWeekNum: applicableZeroBasisWeek ? applicableZeroBasisWeek : 0,
    // };
    return new Promise((resolve) => {
      this.courseMgService.setLessonPackage(params).subscribe(res => {
        if (res.status === 201) {
          if ((this.isSprintOn || this.isFinalOn) && this.intellectualAdaptation) {
            this.examTimeRequire = true;
            this.adaptive.examTimeRequire = true;
          } else {
            this.examTimeRequire = false;
            this.adaptive.examTimeRequire = false;
          }
          const paramsKey = Object.keys(params);
          const arr = ['middleWeekNum', 'seniorWeekNum', 'juniorWeekNum', 'isSprintOn', 'isFinalOn']
            .filter(item => paramsKey.indexOf(item) > -1);
          // 保存向父级传输数据
          arr.forEach((value) => {
            if (Number(params[value])) {
              this.adaptive[value] = true;
            } else {
              this.adaptive[value] = false;
            }
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

// 点击指导老师
  getflag(i: number, item) {
    if (this.preview === '1') {
      return;
    }
    Object.keys(this.clickFlag).forEach((e, ii) => {
      this.clickFlag[ii] = false;
    });
    this.clickFlag[i] = true;
    this.defaultTeacherId = [];
    this.defaultTeacherId.push(item.teacherId);
    this.setLessonPackage({
      id: this.coursePacketId,
      defaultTeacherId: this.defaultTeacherId.join(','),
    });
  }

// 获取章节绑定列表
  getChapterBindList() {
    const params = {
      courseId: this.courseId,
      coursePacketId: this.coursePacketId
    };
    this.courseMgService.getChapterBindList(params).subscribe(res => {
      if (res.status === 200) {
        if (res.data.length > 0) {
          this.listOfData = res.data.map((e, i) => {
            return {
              sectionName: e.chapterSeq + '.' + e.sectionSeq + ' ' + e.sectionName,
              knowledgeUnits: e.knowledgeUnits,
              sectionId: e.sectionId,
              chapterId: e.chapterId
            };
          });
          this.adaptive.listOfData = JSON.parse(JSON.stringify(this.listOfData));
        } else {
          this.listOfData = [];
          this.adaptive.listOfData = [];
        }
      }
    });
  }

// 点击章节绑定
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


  // 章节点击
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

// 知识点点击
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
        this.nzMesService.warning('学习计划为必填项,请保留至少一个计划');
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

  private getParams() {
    const {courseId, id, professionId, status, code, teachType, isSmart, preview, isUsed} = SessionStorageUtil.getPacketInfo();
    this.courseId = courseId;
    this.coursePacketId = id;
    this.professionId = professionId;
    this.isStandard = isUsed > 0;
    this.code = code;
    this.teachType = teachType;
    this.intellectualAdaptation = isSmart === '1';
    this.preview = preview;
  }


  private checkPlan() {
    if (this.applicableZeroBasis) {
      if (!this.applicableZeroBasisWeek) {
        this.nzMesService.warning('学习计划勾选了适用零基础必须填写具体值');
        return true;
      }
    }
    if (this.applicableHasAFoundation) {
      if (!this.applicableHasAFoundationWeek) {
        this.nzMesService.warning('学习计划勾选了适用有基础必须填写具体值');
        return true;
      }
    }
    if (this.applicableExperts) {
      if (!this.applicableExpertsWeek) {
        this.nzMesService.warning('学习计划勾选了使用专家必须填写具体值');
        return true;
      }
    }
  }

// 根据需求检查日期
  private checkData(key) {
    const {isSprintOn, isFinalOn, examTime, sprintTime, finalTime} = this;
    if (isSprintOn) {
      if (examTime && sprintTime) {
        if (examTime.getTime() <= sprintTime.getTime()) {
          this.nzMesService.warning(key === 'examTime' ? '国家考试日期应大于冲刺开始日期' : '冲刺开始日期应小于国家考试日期');
          return true;
        }
      }
      if (isFinalOn && finalTime && sprintTime) {
        if (finalTime.getTime() <= sprintTime.getTime()) {
          this.nzMesService.warning(key === 'sprintTime' ? '冲刺开始日期应小于密押开始日期' : '密押开始日期应大于冲刺开始日期');
          return true;
        }
      }
    }
    if (isFinalOn && examTime && finalTime) {
      if (examTime.getTime() <= finalTime.getTime()) {
        this.nzMesService.warning(key === 'examTime' ? '国家考试日期应大于密押开始日期' : '密押开始日期应小于国家考试日期');
        return true;
      }
    }
  }

  timeChange(date: any, key: string) {
    if (this[key + 'Pre']) { // 非第一次
      if (date && date.getTime() !== this[key + 'Pre'].getTime()) { // 对比上次时间不同才保存
        this.checkAndSave(date, key, this[key + 'Pre']);
      } else {
        if (!date) {
          if (key === 'examTime' && !this.examTimeRequire) {
            this.checkAndSave(date, key, null);
          } else {
            if (!this.intellectualAdaptation) {
              this.checkAndSave(date, key, null);
            } else {
              this.nzMesService.warning(key === 'examTime' ? '开启了冲刺阶段或者密押阶段，国家考试时间是必填项，请不要清除掉！'
                : this.isStandard ? '课包启用后不可清空' : '如果需要清空日期请关闭该阶段即可');  // 开关打开下不能清空日期
              timer(0).subscribe(() => {
                this[key] = this[key + 'Pre'];
              });
            }
          }
        }
      }
    } else { // 第一次
      if (date) {
        this.checkAndSave(date, key, null);
      }
    }
  }

  checkAndSave(date: any, key: string, setValue) {
    if (this.checkData(key) || this.checkPlan()) { // 保证了空值跳过校验
      timer(0).subscribe(() => {
        this[key] = setValue; // 如果校验失败回显缓存的值
      });
      return;
    }
    this.setLessonPackage({
      id: this.coursePacketId,
      [key]: formatDate(date, 'yyyy-MM-dd', this.locale)
    }).then((flag) => {
      if (!flag) {
        timer(0).subscribe(() => {
          this[key] = setValue;
        });
      } else {
        this[key + 'Pre'] = this.adaptive[key] = this[key];
      }
    });
  }

  isSwitchOnChange(key: string) {
    const param = {
      id: this.coursePacketId,
      [key]: this[key] ? '1' : '0'
    };
    if (key === 'isSprintOn' && !this[key]) {
      this.sprintTime = this.sprintTimePre = null;
      param.sprintTime = formatDate(null, 'yyyy-MM-dd', this.locale);
    } else if (key === 'isFinalOn' && !this[key]) {
      this.finalTime = this.finalTimePre = null;
      param.finalTime = formatDate(null, 'yyyy-MM-dd', this.locale);
    }
    this.setLessonPackage(param);
  }

  applicableWeekChange(data: any, key: string, label: string) {
    //   middleWeekNum: applicableHasAFoundationWeek ? applicableHasAFoundationWeek : 0,
    //   seniorWeekNum: applicableExpertsWeek ? applicableExpertsWeek : 0,
    //   juniorWeekNum: applicableZeroBasisWeek ? applicableZeroBasisWeek : 0,
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

// 缓存上次时间用以校验是否请求保存
  timeOpen(flag: boolean, key: string) {
    if (flag) {
      this[key + 'Pre'] = this[key];
    }
  }

  applicableFocus(key: string) {
    this[key + 'Pre'] = this[key];
  }

  // 解绑
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

  // 修改
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

  getBingData(knowledgeUnits: any) {
    const knoArr = knowledgeUnits.split(',');
    if (knoArr.length > 5) {
      knoArr.length = 5;
      return knoArr.join(',') + ',...';
    } else {
      return knowledgeUnits;
    }
  }

  export() {
    this.courseMgService.exportExcelKno(this.coursePacketId).subscribe((resp: HttpResponse<Blob>) => {
        const headers: HttpHeaders = resp.headers;
        // (window as any).aa=headers.get('content-disposition').split('=')[1];
        // console.log(headers.get('content-disposition').split('=')[1]);
        const link = document.createElement('a');
        // 支持HTML5下载属性的浏览器
        const url = URL.createObjectURL(resp.body);
        link.setAttribute('href', url);
        link.setAttribute('download', '课包知识点题目难度导出.xls');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error => this.nzMesService.error(error));
  }
}
