import {Component, ElementRef, Inject, LOCALE_ID, ViewChild} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';
import {MenuService} from 'core/services/menu.service';
import {MaterialLibraryService} from '@app/busi-services/material-library.service';
import {getName, MATERIAL_TYPE, STATISTICALRULES} from 'core/base/static-data';
import {NzTreeNodeOptions} from 'ng-zorro-antd';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {ActivatedRoute} from '@angular/router';
import {NzResizeEvent} from 'ng-zorro-antd/resizable/public-api';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {forkJoin, timer} from 'rxjs';
import {SearchTableComponent} from '@app/routes/course-manage/components';
import {ToolsUtil} from 'core/utils/tools.util';
import {ConfirmableFlat} from 'core/decorators';
import {LoadingControl} from 'core/base/common';
import {StatisticsLogService} from '@app/busi-services/statistics-log.service';
import {environment} from 'src/environments/environment';


@Component({
  selector: 'app-read-lib',
  templateUrl: './read-lib.component.html',
  styleUrls: ['./read-lib.component.less'],
})
export class ReadLibComponent extends SearchTableComponent {
  _PAGE_ID_ = 'MaterialReadLibraryComponent';
  id = -1;
  width;
  selectedProfesson: any;
  materialMenus = MATERIAL_TYPE.filter((item) => item.id !== '104');
  knowledgePointId = '';
  curSelectedItem: any;
  // 调用相关参数
  from: '' | 'scp' = '';
  callResourceData: any = {};
  callResourceId = 'MaterialCallResource';
  // 允许调用
  permitedCall = true;
  type = '0';
  fileType = '0';
  task;
  reward; // 是否记录日志
  selected = '';
  getTwoWords = ToolsUtil.getTwoWords;
  getName = getName;
  conditionObj = {
    category: 100, // 200 习题 100 素材
    knowledgeSubjectId: '', // 学科id
    knowledgeModuleId: '', // 知识模块id
    knowledgeUnitId: '', // 知识单元id
    knowledgePointId: '', // 知识点id
    condition: '', // 模糊查询条件
    coursewareType: [], // 资源类型
    learningGoalCode: [], // 学习目标
  };
  condition = ''; // 模糊查询条件
  coursewareType = []; // 资源类型
  learningGoalCode: any = []; // 学习目标
  init = false; // 初始化
  knowledgegraphTree = true; // 树
  changeProfession = true; //  切换课程
  resourceUrl: any; // 预览地址
  previewTitle = '';
  isPreviewpolyway = false; // 保利威
  previewStart = false;
  order = null;
  qrcode = '';
  qrName = '';
  size = 200;
  qrcodeVisible: any;
  @ViewChild('treeContainer') treeContainer: ElementRef<any>;


  constructor(
    private materialLibService: MaterialLibraryService,
    private menuService: MenuService,
    private modalService: NzModalService,
    public message: NzMessageService,
    public courseMgService: CourseManageService,
    public route: ActivatedRoute,
    private statisticsLogService: StatisticsLogService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    super();
  }


  /*
  * @Override
  * @*/
  initData() {
    this.selected = SessionStorageUtil.getReadtree() || SessionStorageUtil.getPacketInfoItem('code');
    const {from, task, reward} = this.route.snapshot.queryParams;
    this.task = task;
    this.reward = reward;
    if (from === 'scp') {
      this.from = from;
      if (this.task === '101' || this.task === '102') {
        this.conditionObj.coursewareType = [this.task];
        this.coursewareType = [this.task];
      } else {
        this.conditionObj.coursewareType = ['101', '102', '103'];
        this.coursewareType = ['101', '102', '103'];
      }
      this.storingData();
      this.callResourceData = SessionStorageUtil.getScpResourceMaterial();
    }
  }


  /*
  * @Override
  * @*/
  collectParam() {
    const {condition, learningGoalCode, coursewareType} = SessionStorageUtil.getSearch(this._PAGE_ID_);
    this.condition = condition || '';
    this.learningGoalCode = learningGoalCode || [];
    this.coursewareType = coursewareType || [];
  }

  /*
  * @Override
  * @*/
  sybcParam() {
    this.conditionObj.condition = this.condition;
    this.conditionObj.coursewareType = this.coursewareType;
    this.conditionObj.learningGoalCode = this.learningGoalCode;
  }

  /*
  * @Override
  * @*/
  storingData() {
    const {condition, coursewareType, learningGoalCode} = this;
    this.passData({condition, learningGoalCode, coursewareType});
  }

  /*
* @Override
* @*/
  resetInit() {
    this.condition = '';
    this.coursewareType = [];
    this.learningGoalCode = [];
    this.conditionObj.coursewareType = [];
    this.conditionObj.learningGoalCode = [];
    this.conditionObj.condition = '';
  }

  /*
  * @Override
  * @*/
  getDataList(): void {
    this.conditionObj.condition = this.conditionObj.condition.trim();
    const param: any = {
      ...this.conditionObj,
      page: this.pageIndex,
      limit: this.pageSize,
    };
    if (this.order) {
      param.sort = this.order === 'ascend' ? 'useTime|asc' : 'useTime|desc';
    }
    if (!this.conditionObj.coursewareType.length) {
      param.coursewareType = ['101', '102', '103'];
    }
    const success = (result: any) => {
      this.isLoading = false;
      if (result.status === 200) {
        if (result.data && result.data.records && result.data.records.length) {
          this.data = result.data.records;
          //   .sort((stringA, stringB) => {
          //   if (this.order === 'ascend') {
          //     if (stringB.useTime < stringA.useTime) {
          //       return -1;
          //     }
          //     if (stringB.useTime > stringA.useTime) {
          //       return 1;
          //     }
          //     return 0;
          //   } else if (this.order === 'descend') {
          //     if (stringA.useTime < stringB.useTime) {
          //       return -1;
          //     }
          //     if (stringA.useTime > stringB.useTime) {
          //       return 1;
          //     }
          //     return 0;
          //   } else {
          //     if (stringA.useTime < stringB.useTime) {
          //       return 1;
          //     }
          //     if (stringA.useTime > stringB.useTime) {
          //       return -1;
          //     }
          //     return 0;
          //   }
          // });
          // .map((item, i) => {
          //   if (i === 2) {
          //     item.useTime = 2;
          //   }
          //   return item;
          // });
          this.total = result.data.total;
          if (this.from === 'scp' && this.callResourceData.nodes) {
            // 调用
            this.data = this.data.map((item) => {
              const hasCallItem = this.callResourceData.nodes.find(
                (it) => it.id === item.id
              );
              if (hasCallItem) {
                item.isCall = true;
                item.taskId = hasCallItem.taskId;
                item.taskType = hasCallItem.taskType;
              } else {
                item.taskType = '-1';
              }
              item.supportType = this.supportType(item.fileType);
              return item;
            });
            this.setPermitedCall();
          }
        } else {
          this.data = [];
          this.total = 0;
        }
      } else {
        this.data = [];
        this.total = 0;
        this.message.create('error', result.message);
      }
    };
    const error = (err: any) => {
      this.isLoading = false;
      this.message.create('error', JSON.stringify(err));
    };
    this.isLoading = true;
    const work = [this.materialLibService.resConditionQuery(param)];
    forkJoin(work).subscribe(
      (ret) => {
        this.isLoading = false;
        success(ret[0]);
      },
      (err) => {
        this.isLoading = false;
        error(err);
      }
    );
  }

  /*
  * @Override
  * @*/
  ngOnAttach() {
    this.selected = SessionStorageUtil.getReadtree() || SessionStorageUtil.getPacketInfoItem('code');
    this.collectParam();
    this.sybcParam();
    this.init = false;
    this.knowledgegraphTree = false;
    this.changeProfession = false;
    timer(0).subscribe(() => {
      this.knowledgegraphTree = true;
      this.changeProfession = true;
    });
  }


  onResize({width, height}: NzResizeEvent): void {
    const flag = this.treeContainer
      && this.treeContainer.nativeElement
      && this.treeContainer.nativeElement.offsetWidth;
    if (
      flag && ((this.treeContainer.nativeElement.offsetWidth + 50 < width))
      ||
      (flag && (this.treeContainer.nativeElement.offsetWidth + 10) > width)
    ) {
      return;
    }
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      // tslint:disable-next-line:no-non-null-assertion
      this.width = width!;
    });
  }

  professionChange(item: any): void {
    SessionStorageUtil.putReadtree(item.code);
    this.selectedProfesson = item;
    this.conditionObj.knowledgeSubjectId = item.id;
    if (!this.init) {
      this.init = true;
      this.searchData('collect');
    } else {
      this.pageIndex = 1;
      this.searchData();
    }
  }

  nodeChange(nodeOpt: NzTreeNodeOptions) {
    if (nodeOpt.kType === '1') {
      this.conditionObj.knowledgeSubjectId = nodeOpt.id;
      this.conditionObj.knowledgeModuleId = '';
      this.conditionObj.knowledgeUnitId = '';
      this.conditionObj.knowledgePointId = '';
    } else if (nodeOpt.kType === '2') {
      this.conditionObj.knowledgeSubjectId = '';
      this.conditionObj.knowledgeModuleId = nodeOpt.id;
      this.conditionObj.knowledgeUnitId = '';
      this.conditionObj.knowledgePointId = '';
    } else if (nodeOpt.kType === '3') {
      this.conditionObj.knowledgeSubjectId = '';
      this.conditionObj.knowledgeModuleId = '';
      this.conditionObj.knowledgeUnitId = nodeOpt.id;
      this.conditionObj.knowledgePointId = '';
    } else if (nodeOpt.kType === '4') {
      this.conditionObj.knowledgeSubjectId = '';
      this.conditionObj.knowledgeModuleId = '';
      this.conditionObj.knowledgeUnitId = '';
      this.conditionObj.knowledgePointId = nodeOpt.id;
      this.knowledgePointId = nodeOpt.id;
    }
    this.pageIndex = 1;
    this.searchData();
  }

  selectMenu(item: any) {
    if (!this.selectedProfesson) {
      return this.message.error('还没有建立学科哦~');
    }
    const selectedProfessonId = this.selectedProfesson ? this.selectedProfesson.id : 0;
    this.menuService.gotoUrl({
      url: '/m/rm/material-details',
      paramUrl: `/0/${item.id}/${selectedProfessonId}?knowledgeId=${this.conditionObj.knowledgePointId || ''}&t=${new Date().getTime()}`,
      title: '新增' + item.name
    });
  }


  edit(data: any) {
    this.menuService.gotoUrl({
      url: '/m/rm/material-details',
      paramUrl: `/${data.id}/${data.type}/${this.selectedProfesson.id}`,
    });
  }

  qcode(data) {
    this.materialLibService.getResourceDetail(data.id, data.type).subscribe(result => {
      if (result.status === 200) {
        this.qrName = result.data.title;
        if (data.sourceType === '2') {
          this.qrcode = environment.ow365.substr(0, environment.ow365.length - 5)
            + 'polywayId=' +
            result.data.resourceUrl
            + '&share=0&native=0&ow365=1';
        } else {
          this.qrcode = environment.ow365 + environment.OSS_URL +
            (result.data.resourceUrl.indexOf('/') === '0' ?
              result.data.resourceUrl : ( '/' + result.data.resourceUrl)) + '&share=0&native=0&ow365=1';
        }
        this.qrcodeVisible = true;
        console.log(this.qrcode);
      }
    });
  }

  goback() {
    this.menuService.goBack(false);
    this.menuService.gotoUrl({
      title: '课包建设',
      url: `/m/course-manage/prepare-course`,
      paramUrl: ``
    });
  }


  preview(data: any) {
    if ((data.title.indexOf('.') < 0) && data.sourceType === '2' && data.type === '103') {
      this.isPreviewpolyway = false;
      this.previewStart = false;
      timer(0).subscribe(() => {
        this.resourceUrl = data.fileType;
        this.previewTitle = '';
        this.isPreviewpolyway = true;
        this.previewStart = true;
      });
    } else {
      this.materialLibService.getResourceDetail(data.id, data.type).subscribe(result => {
        if (result.status === 200) {
          if (result.data.attachmentName.indexOf('.') < 0 && result.data.sourceType === '2' && data.type === '103') {
            this.previewStart = false;
            this.isPreviewpolyway = false;
            timer(0).subscribe(() => {
              this.resourceUrl = data.fileType;
              this.previewTitle = '';
              this.isPreviewpolyway = true;
              this.previewStart = true;
            });
          } else {
            this.previewStart = false;
            this.isPreviewpolyway = false;
            timer(0).subscribe(() => {
              this.isPreviewpolyway = false;
              this.resourceUrl = result.data.resourceUrl;
              this.previewTitle = result.data.title;
              this.previewStart = true;
            });
          }
        }
      });
    }
  }

  closePreview() {
    this.isPreviewpolyway = false;
    this.resourceUrl = '';
    this.previewTitle = '';
    this.previewStart = false;
  }


  @ConfirmableFlat({
    title: (args) => (`确定删除"${args[0].title}"的阅读资源？`),
    content: '',
    type: 'warning'
  })
  del(data: any, loadingControl?: LoadingControl) {
    return new Promise((resolve) => {
      this.materialLibService.delResource(data.id).subscribe(
        (result) => {
          if (result.status === 200) {
            resolve(true);
            this.searchData();
          } else {
            resolve(false);
            if (result.status === 500) {
              this.message.error('服务端业务异常');
            }
          }
        },
        (error) => {
          resolve(false);
          this.message.error(JSON.stringify(error));
        }
      );
    });
  }

  setPermitedCall() {
    if (this.callResourceData.hasOwnProperty('limit')) {
      if (Number(this.callResourceData.limit) === 0) {
        this.permitedCall = true;
      } else if (
        this.callResourceData.nodes.length >= this.callResourceData.limit || Number(this.callResourceData.limit) === -1
      ) {
        this.permitedCall = false;
      } else {
        this.permitedCall = true;
      }
    }
  }

  supportType(fileType: string) {
    if (!fileType) {
      return true;
    }
    if (!this.callResourceData.supportFileType) {
      return true;
    }
    const supportFileType: string = this.callResourceData.supportFileType;
    return supportFileType.indexOf(fileType.toLowerCase()) !== -1;
  }

  callResource(data, index) {
    // 调用
    const error = (err) => {
      this.isLoading = false;
      this.message.warning(JSON.stringify(err));
    };
    const getParams = () => {
      if (this.callResourceData.type === 'scp-section-handout') {
        return {
          ...this.callResourceData.sectionInfo,
          resourceId: data.id,
        };
      }
    };
    const getSource$ = (params: any) => {
      if (this.callResourceData.type === 'scp-section-handout') {
        if (this.task === '1') {
          return this.courseMgService.invoke_courseSectionFileTask(params);
        } else if (this.task === '2') {
          return this.courseMgService.levelInformationAddAndModify(params);
        } else {
          return this.courseMgService.invoke_courseSectionFile(params);
        }
      }
    };
    const paramResult: any = getParams();
    if (this.task === '1') {
      paramResult.sourceType = data.sourceType;
      paramResult.name = data.title;
      paramResult.taskType = '0';
      paramResult.downloadType = '0';
    } else if (this.task === '2') {
      paramResult.title = data.title;
    } else {
      paramResult.sourceType = data.sourceType;
      if (this.task === '101') {
        paramResult.downloadType = '0';
      } else {
        paramResult.downloadType = '2';
      }
      paramResult.resourceId = data.id;
      paramResult.type = this.task;
      paramResult.category = data.category;
      paramResult.title = data.title;
    }
    paramResult.seq = SessionStorageUtil.getScpResourceMaterial().seq;
    const source$ = getSource$(paramResult);
    this.isLoading = true;
    source$.subscribe((res) => {
      this.isLoading = false;
      if (res.status === 201) {
        const {task} = this;
        let field = '';
        if (task === '1') {
          field = 'learnSet-task-action';
        } else if (task === '101') {
          field = 'learnSet-lecture-action';
        } else if (task === '104') {
          field = 'learnSet-material-action';
        } else {
          field = 'learnSet-record-action';
        }
        if (this.reward === '1') {
          this.statisticsLogService.statisticsPacketInfoLog({
            name: '关卡奖励设置阅读库调用',
            actionCode: STATISTICALRULES.packetInfo['otherSet-levelthrough-action'].modify,
            content: JSON.stringify(paramResult),
          });
        } else {
          this.statisticsLogService.statisticsPacketInfoLog({
            name: '阅读库调用',
            actionCode: STATISTICALRULES.packetInfo[field].addCode,
            content: JSON.stringify(paramResult),
          });
        }
        if (res.data && res.data.id) {
          this.data[index].isCall = true;
          this.data[index].taskId = res.data.id;
          this.data[index].taskType = res.data.taskType;
          this.callResourceData.nodes.push({
            id: this.data[index].id,
            taskId: res.data.id,
            taskType: res.data.taskType,
          });
          this.callResourceData.seq += 1;
          SessionStorageUtil.putScpResourceMaterial(this.callResourceData);
          this.setPermitedCall();
        }
      } else {
        if (res.status === 500) {
          this.message.error('服务器业务异常导致调用失败，可能标题太长，请保持35字符以内');
        } else {
          this.message.error(res.message);
        }
      }
    }, error);
  }

  cancelCallResource(data, index) {
    // 取消调用
    this.modalService.warning({
      nzTitle: '警告',
      nzContent: this.task === '2' ? '确定取消调用吗？' : '删除该资源将会导致现有的记录丢失，确定删除吗？',
      nzCancelText: '取消',
      nzOkText: '确定',
      nzOnOk: () => {
        return new Promise((resolve) => {
          const error = (err) => {
            this.isLoading = false;
            this.message.warning(JSON.stringify(err));
            resolve(false);
          };
          const getSource$ = () => {
            if (this.callResourceData.type === 'scp-section-handout') {
              if (this.task === '1') {
                return this.courseMgService.del_courseSectionFileTask(
                  data.taskId
                );
              } else if (this.task === '2') {
                return this.courseMgService.levelDataDeletion(
                  data.taskId
                );
              } else {
                return this.courseMgService.del_courseSectionFile(
                  data.taskId
                );
              }
            }
          };
          const success = (res) => {
            this.isLoading = false;
            if (res.status === 204) {
              if (this.reward === '1') {
                this.statisticsLogService.statisticsPacketInfoLog({
                  name: '关卡奖励设置阅读库取消调用',
                  actionCode: STATISTICALRULES.packetInfo['otherSet-levelthrough-action'].modify,
                  content: data.taskId
                });
              } else {
                const {task} = this;
                let field = '';
                if (task === '1') {
                  field = 'learnSet-task-action';
                } else if (task === '101') {
                  field = 'learnSet-lecture-action';
                } else if (task === '104') {
                  field = 'learnSet-material-action';
                } else {
                  field = 'learnSet-record-action';
                }
                this.statisticsLogService.statisticsPacketInfoLog({
                  name: '阅读库取消调用',
                  actionCode: STATISTICALRULES.packetInfo[field].delCode,
                  content: data.taskId
                });
              }
              this.data[index].isCall = false;
              this.callResourceData.nodes = this.callResourceData.nodes.filter(
                (item) => item.id !== this.data[index].id
              );
              this.callResourceData.seq -= 1;
              SessionStorageUtil.putScpResourceMaterial(this.callResourceData);
              this.setPermitedCall();
              resolve(true);
            } else {
              this.message.warning(res.message || '删除失败');
              resolve(false);
            }
          };
          this.isLoading = true;
          getSource$().subscribe(success, error);
        });
      },
    });
  }

  nzSortOtrderChange($event: string | 'ascend' | 'descend') {
    this.order = $event;
    this.getDataList();
    // let pre = -1;
    // let last = 1;
    // if ($event === 'ascend') {
    //   pre = -1;
    //   last = 1;
    // } else if ($event === 'descend') {
    //   pre = 1;
    //   last = -1;
    // } else {
    //   this.data = this.data.sort((stringB, stringA) => {
    //     if (stringA.lastModifiedTime < stringB.lastModifiedTime) {
    //       return -1;
    //     }
    //     if (stringA.lastModifiedTime > stringB.lastModifiedTime) {
    //       return 1;
    //     }
    //     return 0;
    //   });
    //   return;
    // }
    // this.data = this.data.sort((stringB, stringA) => {
    //   if (stringA.useTime < stringB.useTime) {
    //     return pre;
    //   }
    //   if (stringA.useTime > stringB.useTime) {
    //     return last;
    //   }
    //   return 0;
    // });
  }

  delIF(data: any) {
    return String(data.useTime) === '0';
  }

  downloadQrcode() {
    const link = document.createElement('a');
    link.setAttribute('href', (document.querySelector('#qr-code > img') as HTMLImageElement).src);
    link.setAttribute('download', (this.qrName.indexOf('.') > -1 ? this.qrName.split('.')[0] : this.qrName) + '.png');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
