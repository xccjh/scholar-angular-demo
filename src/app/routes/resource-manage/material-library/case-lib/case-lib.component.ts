import {Component, ElementRef, Inject, LOCALE_ID, ViewChild} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {MenuService} from 'core/services/menu.service';
import {MaterialLibraryService} from '../../../../busi-services/material-library.service';
import {getName, STATISTICALRULES} from 'core/base/static-data';
import {NzModalService, NzTreeNodeOptions} from 'ng-zorro-antd';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {ActivatedRoute} from '@angular/router';
import {NzResizeEvent} from 'ng-zorro-antd/resizable/public-api';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {forkJoin, timer} from 'rxjs';
import {SearchTableComponent} from '../../../course-manage/components';
import {ConfirmableFlat} from 'core/decorators';
import {StatisticsLogService} from '@app/busi-services/statistics-log.service';

@Component({
  selector: 'app-case-lib',
  templateUrl: './case-lib.component.html',
  styleUrls: ['./case-lib.component.less'],
})
export class CaseLibComponent extends SearchTableComponent {
  _PAGE_ID_ = 'MaterialCaseLibraryComponent';
  id = -1;
  width;
  selectedProfesson: any;
  knowledgePointId = '';
  task;
  conditionObj = {
    category: 100, // 200 习题 100 素材
    knowledgeSubjectId: '', // 学科id
    knowledgeModuleId: '', // 知识模块id
    knowledgeUnitId: '', // 知识单元id
    knowledgePointId: '', // 知识点id
    condition: '', // 模糊查询条件
    coursewareType: ['104'], // 资源类型
    learningGoalCode: [''], // 学习目标
  };
  condition: ''; // 模糊查询条件
  learningGoalCode: any ['']; // 学习目标
  // 调用相关参数
  from: '' | 'scp' = '';
  callResourceData: any = {};
  callResourceId = 'MaterialCallResource';
  selected = '';
  knowledgegraphTree = true;
  changeProfession = true;
  init = false;
  permitedCall = true;
  getName = getName;
  @ViewChild('treeContainer') treeContainer: ElementRef<any>;
  order: string | 'ascend' | 'descend' = null;

  constructor(
    private menuService: MenuService,
    private modalService: NzModalService,
    public message: NzMessageService,
    public route: ActivatedRoute,
    private materialLibService: MaterialLibraryService,
    public courseMgService: CourseManageService,
    private statisticsLogService: StatisticsLogService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    super();
  }


  /*
   * @Override
   * @*/
  initData() {
    this.selected = SessionStorageUtil.getCasetree() || SessionStorageUtil.getPacketInfoItem('code');
    const {from, task} = this.route.snapshot.queryParams;
    this.task = task;
    if (from === 'scp') {
      this.from = from;
      this.callResourceData = SessionStorageUtil.getScpResourceMaterial();
    }
  }

  /*
   * @Override
   * @*/
  ngOnAttach() {
    this.selected = SessionStorageUtil.getCasetree() || SessionStorageUtil.getPacketInfoItem('code');
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

  /*
   * @Override
   * @*/
  collectParam() {
    const {condition, learningGoalCode} = SessionStorageUtil.getSearch(this._PAGE_ID_);
    this.condition = condition || '';
    this.learningGoalCode = learningGoalCode || [];
  }

  /*
   * @Override
   * @*/
  sybcParam() {
    this.conditionObj.condition = this.condition;
    this.conditionObj.learningGoalCode = this.learningGoalCode;
  }

  /*
   * @Override
   * @*/
  storingData() {
    const {condition, learningGoalCode} = this;
    this.passData({condition, learningGoalCode});
  }


  /*
* @Override
* @*/
  resetInit() {
    this.condition = '';
    this.learningGoalCode = [];
    this.conditionObj.learningGoalCode = [];
    this.conditionObj.condition = '';
  }

  /*
 * @Override
 * @*/
  searchData(reset: boolean = false): void {
    if (reset) {
      this.pageIndex = 1;
      this.learningGoalCode = [];
      this.condition = '';
      this.conditionObj.learningGoalCode = [];
      this.conditionObj.condition = '';
      this.removeData();
    }
    this.getDataList();
  }

  collectSearch() {
    this.collectParam();
    this.sybcParam();
    this.getDataList();
  }

  resetSearch() {
    this.pageIndex = 1;
    this.conditionObj.condition = this.condition;
    this.conditionObj.learningGoalCode = this.learningGoalCode;
    this.getDataList();
  }

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
          //   if (i === 1) {
          //     item.useTime = 2;
          //   }
          //   return item;
          // });
          this.total = result.data.total;
          if (
            this.from === 'scp' &&
            this.callResourceData.nodes &&
            this.callResourceData.nodes.length > 0
          ) {
            // 调用
            this.data = this.data.map((item) => {
              const hasCallItem = this.callResourceData.nodes.find(
                (it) => it.id === item.id
              );
              if (hasCallItem) {
                item.isCall = true;
                item.taskId = hasCallItem.taskId;
              }
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

  onResize({width}: NzResizeEvent): void {
    const flag = this.treeContainer
      && this.treeContainer.nativeElement
      && this.treeContainer.nativeElement.offsetWidth;
    if (
      flag && ((this.treeContainer.nativeElement.offsetWidth + 80 < width))
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


  professionChange(item: any): void {
    SessionStorageUtil.putCasetree(item.code);
    this.selectedProfesson = item;
    this.conditionObj.knowledgeSubjectId = item.id;
    if (!this.init) {
      this.init = true;
      this.collectSearch();
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

  goAddCase() {
    if (!this.selectedProfesson) {
      return this.message.error('还没有建立学科哦~');
    }
    const selectedProfessonId = this.selectedProfesson
      ? this.selectedProfesson.id
      : 0;
    this.menuService.gotoUrl({
      url: '/m/rm/material-details',
      paramUrl: `/0/104/${selectedProfessonId}?t=${new Date().getTime()}`,
      title: '新增案例'
    });
  }


  edit(data: any) {
    this.menuService.gotoUrl({
      url: '/m/rm/material-details',
      paramUrl: `/${data.id}/${data.type}/${this.selectedProfesson.id}`,
      title: '编辑案例'
    });
  }

  preview(data: any) {
    const url = '/m/rm/material-pre-case';
    const tabTitle = `预览案例`;
    this.menuService.gotoUrl({
      url,
      paramUrl: `/${data.id}/${data.type}/${this.selectedProfesson.id}`,
      title: tabTitle,
    });
  }

  @ConfirmableFlat({
      title: '案例复制',
      content: (args) => ('您确定复制' + args[0].title + '案例吗？'),
      type: 'confirm'
    }
  )
  copy(data) {
    return new Promise((resolve) => {
      this.materialLibService.copyResource(data.id).subscribe(
        (result) => {
          if (result.status === 201) {
            this.searchData();
            resolve(true);
          } else {
            if (result.status === 500) {
              this.message.error('服务器业务异常');
            }
            resolve(false);
          }
        },
        (error) => {
          this.message.error(JSON.stringify(error));
          resolve(false);
        }
      );
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

  @ConfirmableFlat({
    title: (args) => (`确定删除"${args[0].title}"的案例资源？`),
    content: '',
    type: 'warning'
  })
  del(data: any): Promise<boolean> {
    return new Promise((resolve) => {
      this.materialLibService.delResource(data.id).subscribe(
        (result) => {
          if (result.status === 200) {
            this.searchData();
            resolve(true);
          } else {
            if (result.status === 500) {
              this.message.error('服务器业务异常');
            }
            resolve(false);
          }
        },
        (error) => {
          this.message.error(JSON.stringify(error));
          resolve(false);
        }
      );
    });
  }

  delIF(data: any) {
    return String(data.useTime) === '0';
  }

  callResource(data, index) {
    // 调用
    const error = (err) => {
      this.isLoading = false;
      this.message.warning(JSON.stringify(err));
    };
    const params: any = {
      ...this.callResourceData.sectionInfo,
      resourceId: data.id,
      sourceType: 1,
      isGrade: '1'
    };
    const success = (res) => {
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
        this.statisticsLogService.statisticsPacketInfoLog({
          name: '案例库调用',
          actionCode: STATISTICALRULES.packetInfo[field].addCode,
          content: JSON.stringify(params),
        });
        this.data[index].isCall = true;
        this.data[index].taskId = res.data.id;
        this.callResourceData.nodes.push({
          id: this.data[index].id,
          taskId: res.data.id,
        });
        this.callResourceData.seq += 1;
        SessionStorageUtil.putScpResourceMaterial(this.callResourceData);
        this.setPermitedCall();

      } else {
        if (res.status === 500) {
          this.message.error('服务器业务异常导致调用失败，可能标题太长，请保持35字符以内');
        } else {
          this.message.error(res.message);
        }
      }
    };
    this.isLoading = true;
    if (this.task === '1') {
      params.name = data.title;
      params.taskType = '1';
      params.seq = SessionStorageUtil.getScpResourceMaterial().seq;
      this.courseMgService
        .quickCreate_courseSectionResourceTask(params)
        .subscribe(success, error);
    } else {
      params.title = data.title;
      params.category = data.category;
      params.type = this.task;
      params.seq = SessionStorageUtil.getScpResourceMaterial().seq;
      this.courseMgService
        .quickCreate_courseSectionResource(params)
        .subscribe(success, error);
    }
  }

  cancelCallResource(data, index) {
    const error = (err) => {
      this.isLoading = false;
      this.message.warning(JSON.stringify(err));
    };
    const success = (res) => {
      this.isLoading = false;
      if (res.status === 204) {
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
          name: '案例库取消调用',
          actionCode: STATISTICALRULES.packetInfo[field].delCode,
          content: data.taskId,
        });
        this.data[index].isCall = false;
        this.callResourceData.nodes = this.callResourceData.nodes.filter(
          (item) => item.id !== this.data[index].id
        );
        this.callResourceData.seq -= 1;
        SessionStorageUtil.putScpResourceMaterial(this.callResourceData);
        this.setPermitedCall();
      } else {
        this.message.warning(JSON.stringify(res));
      }
    };
    this.isLoading = true;
    if (this.task === '1') {
      this.courseMgService
        .delInvoke_courseTask(data.taskId)
        .subscribe(success, error);
    } else {
      this.courseMgService
        .delInvoke_course(data.taskId)
        .subscribe(success, error);
    }
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
}
