import {Component, ElementRef, ViewChild} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';
import {MenuService} from 'core/services/menu.service';
import {NzTreeNodeOptions} from 'ng-zorro-antd';
import {TrainManageService} from 'src/app/busi-services/train-manage.service';
import {ActivatedRoute} from '@angular/router';
import {LEARNING_TARGET, STATISTICALRULES} from 'core/base/static-data';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {MaterialLibraryService} from 'src/app/busi-services/material-library.service';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {NzResizeEvent} from 'ng-zorro-antd/resizable';
import {forkJoin, timer} from 'rxjs';
import {SearchTableComponent} from '../../course-manage/components';
import {StatisticsLogService} from '@app/busi-services/statistics-log.service';

@Component({
  selector: 'app-train-course-library',
  templateUrl: './train-library-course.component.html',
  styleUrls: ['./train-library-course.component.less'],
})
export class TrainLibraryCourseComponent extends SearchTableComponent {
  _PAGE_ID_ = 'TrainLibraryCourseComponent';
  task;
  id = -1;
  width;
  selectedProfesson: any = {};
  knowledgePointId = '';
  curSelectedItem: any;
  conditionObj = {
    industryId: '', // 行业ID
    keyword: '', // 模糊查询条件
    learningGoalCodes: [], // 学习目标
    knowledgeSubjectId: ''
  };
  keyword: '';
  learningGoalCodes: [];
  selected = '';
  from: '' | 'scp' = '';
  callResourceData: any = {};
  callResourceId = 'MaterialCallResource';
  learningCode: any = {};
  changeProfession = true;
  knowledgegraphTree = true;
  permitedCall = true;
  private init = false;
  private loading = false;
  private title: any;
  private status: any;
  @ViewChild('treeContainer') treeContainer: ElementRef<any>;


  constructor(
    private trainManageService: TrainManageService,
    private materialLibService: MaterialLibraryService,
    private menuService: MenuService,
    private modalService: NzModalService,
    public message: NzMessageService,
    public route: ActivatedRoute,
    public courseMgService: CourseManageService,
    private statisticsLogService: StatisticsLogService,
  ) {
    super();
  }


  /*
   * @Override
   * @*/
  initData() {
    this.selected = SessionStorageUtil.getTrainTree() || SessionStorageUtil.getPacketInfoItem('code');
    // 调用相关
    const {from, task} = this.route.snapshot.queryParams;
    this.task = task;
    if (from === 'scp') {
      this.from = from;
      this.callResourceData = SessionStorageUtil.getScpResourceMaterial();
    }

    LEARNING_TARGET.map((item) => {
      this.learningCode[item.id] = item.name;
    });
  }

  /*
   * @Override
   * @*/
  ngOnAttach() {
    this.selected = SessionStorageUtil.getTrainTree() || SessionStorageUtil.getPacketInfoItem('code');
    this.collectParam();
    this.sybcParam();
    this.init = false;
    this.changeProfession = false;
    timer(0).subscribe(() => {
      this.changeProfession = true;
    });
  }


  /*
   * @Override
   * @*/
  collectParam() {
    const {keyword, learningGoalCodes} = SessionStorageUtil.getSearch(this._PAGE_ID_);
    this.keyword = keyword || '';
    this.learningGoalCodes = learningGoalCodes || [];
  }

  /*
   * @Override
   * @*/
  sybcParam() {
    this.conditionObj.keyword = this.keyword;
    this.conditionObj.learningGoalCodes = this.learningGoalCodes;
  }

  /*
   * @Override
   * @*/
  storingData() {
    const {keyword, learningGoalCodes} = this;
    this.passData({keyword, learningGoalCodes});
  }

  /*
  * @Override
  * @*/
  resetInit() {
    this.keyword = '';
    this.learningGoalCodes = [];
    this.conditionObj.learningGoalCodes = [];
    this.conditionObj.keyword = '';
  }


  /*
   * @Override
   * @*/
  getDataList(): void {
    this.conditionObj.keyword = this.conditionObj.keyword.trim();
    const param = {
      ...this.conditionObj,
      page: this.pageIndex,
      limit: this.pageSize,
    };
    const success = (result: any) => {
      if (result.status === 200) {
        this.data = result.data;
        this.total = result.page.totalResult;
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
        this.message.create('error', JSON.stringify(result));
      }
    };

    const error = (err: any) => {
      this.isLoading = false;
      this.message.create('error', JSON.stringify(err));
    };

    this.isLoading = true;

    const work = [this.trainManageService.queryPracticalPage(param)];
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


  onResize({width, height}: NzResizeEvent): void {
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
    SessionStorageUtil.putTrainTree(item.code);
    this.selectedProfesson = item;
    this.conditionObj.knowledgeSubjectId = item.id;
    this.conditionObj.industryId = '';
    if (!this.init) {
      this.init = true;
      this.searchData('collect');
    } else {
      this.pageIndex = 1;
      this.searchData();
    }
  }

  nodeChange(nodeOpt: NzTreeNodeOptions) {
    if (nodeOpt.parentNode) {
      this.conditionObj.industryId = nodeOpt.key;
      this.conditionObj.knowledgeSubjectId = '';
    } else {
      this.conditionObj.knowledgeSubjectId = nodeOpt.key;
      this.conditionObj.industryId = '';
    }
    this.pageIndex = 1;
    this.searchData();
  }

  edit(data: any) {
    this.menuService.gotoUrl({
      url: '/m/rm/save-train',
      title: '编辑实训',
      paramUrl: `/edit/${data.id}/${this.selectedProfesson.id}?select=0`,
    });
  }

  goAddPage() {
    this.menuService.gotoUrl({
      url: '/m/rm/save-train',
      title: '新增实训',
      paramUrl:
        '/add/0/' +
        this.selectedProfesson.id +
        '?select=' +
        this.conditionObj.industryId +
        '&t=' +
        new Date().getTime(),
    });
  }

  preview(data: any) {
    if (data.url) {
      return this.goPage(data.url);
    }
    const params = {
      id: data.id,
      accountId: data.accountId,
    };
    this.loading = true;
    const success = (res: any) => {
      this.loading = false;
      if (res.status === 200) {
        if (res.data) {
          data.url = res.data;
          this.goPage(res.data);
        }
      }
    };

    const error = (err: any) => {
      this.loading = false;
      this.message.create('error', JSON.stringify(err));
    };
    this.trainManageService.getPracticalDetail(params).subscribe(success, error);
  }

  goPage(url) {
    open(url);
  }

  goback() {
    this.menuService.goBack();
    timer(0).subscribe(() => {
      this.menuService.gotoUrl({
        title: '课包建设',
        url: `/m/course-manage/prepare-course`,
        paramUrl: ``
      });
    });
  }

  del(data: any) {
    this.curSelectedItem = data;
    this.materialLibService.preDelCheck(this.curSelectedItem.id).subscribe(resPre => {
      if (resPre.status === 200) {
        let text;
        if (resPre.data === '1') {
          text = '该账期正在被使用，删除后课包中的实训任务将同步删除，确定删除吗？';
        } else {
          text = '确定删除该账期吗？';
        }
        this.modalService.error({
          nzTitle: '删除',
          nzContent: text,
          nzCancelText: '取消',
          nzOnOk: () => {
            return new Promise((resolve) => {
              this.materialLibService.delResource(this.curSelectedItem.id).subscribe(
                (result) => {
                  if (result.status === 200) {
                    resolve(true);
                    this.searchData();
                  } else {
                    if (result.status === 500) {
                      this.message.error('服务端业务异常');
                    }
                    resolve(false);
                  }
                },
                (error) => {
                  resolve(false);
                  this.message.error(JSON.stringify(error));
                }
              );
            });
          },
        });
      } else if (resPre.status === 500) {
        this.message.warning('检查账期任务调用情况服务端出错，请稍后再试');
      }
    });
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
          name: '实训库调用',
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
      params.taskType = '3';
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

  cancelCallResource(data: any, index: number) {
    const error = (err: any) => {
      this.message.warning(JSON.stringify(err));
    };
    const success = (res: any) => {
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
          name: '实训库取消调用',
          actionCode: STATISTICALRULES.packetInfo[field].addCode,
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
        this.message.warning(res.message || '未知错误');
      }
    };
    if (this.task === '1') {
      this.courseMgService
        .delInvoke_courseTask(data.taskId)
        .subscribe(success, error);
    } else {
      this.courseMgService.delInvoke_course(data.taskId)
        .subscribe(success, error);
    }
  }
}
