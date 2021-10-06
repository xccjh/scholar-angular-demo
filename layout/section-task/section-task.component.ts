import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MyClassService} from 'src/app/busi-services/my-class.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Subject, Observable, forkJoin, of} from 'rxjs';
import {switchMap, catchError, map} from 'rxjs/operators';
import {TikuService} from 'src/app/busi-services/tiku.service';
import {ExerciseTaskService} from './exercise-task/exercise-task.service';
import {TaskCenterService} from 'core/services/task-center.service';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {ApiService} from 'core/services/api.service';
import {NotifyService} from 'core/services/notify.service';
import {CourseManageService, KnowledgeManageService} from '@app/busi-services';

@Component({
  selector: 'app-section-task',
  templateUrl: './section-task.component.html',
  styleUrls: ['./section-task.component.less'],
  providers: [ExerciseTaskService]
})
export class SectionTaskComponent implements OnInit {
  // 标题
  title = '';
  // 状态名
  statusName = ['未开始', '正在进行', '已结束'];
  status = '0';
  isLoading = false;
  // 参数，用来定位上一级菜单
  fromParams = '';
  selectedTask$ = new Subject<any>();
  // 当前选择任务
  curTask: any = {
    taskType: '-999',
    selectedItem: {}
  };
  // 课次id
  lessonTimeId = ''; // 任务
  // 授课类别
  lessonPlanType = '0';
  lessonTimeData: any = {};
  // 直播的
  liveStudioId = '';
  urlParams: any = {};
  userInfo: any = {};
  liveAddress = '';
  showLiveBtn = true;
  lessonPlanId = '';
  hideBtn = false;
  refreshList = false;
  recordUrl = '';
  private handouts: any; // 接下所有
  private taskList: any;
  private selectedId: string;

  constructor(
    private router: Router,
    private taskService: TaskCenterService,
    private message: NzMessageService,
    private myClassService: MyClassService,
    private apiService: ApiService,
    private notifyService: NotifyService,
    private tikuService: TikuService,
    private exerciseTaskService: ExerciseTaskService,
    private courseMgService: CourseManageService,
    private knowledgeManageService: KnowledgeManageService
  ) {
  }

  ngOnInit() {
    this.urlParams = LocalStorageUtil.getBaseParams();
    this.selectedId = LocalStorageUtil.getDefaultTask();
    this.userInfo = LocalStorageUtil.getUser();
    this.lessonTimeId = this.urlParams.lessonTimeId;
    this.lessonPlanType = this.urlParams.lessonPlanType;
    this.title = this.urlParams.OutlineData.sectionName;
    this.getInfoList();
  }

  getInfoList() {
    this.isLoading = true;
    forkJoin([this.getTaskListInfo()]).subscribe(([source2]) => {
      if (source2.status === 200) {
        if (source2.data && source2.data.length) {
          this.taskList = source2.data;
          this.taskList.forEach((data, i) => {
            this.taskList[i].isDownloadType = data.downloadType === '1' ? true : false;
            this.taskList[i].isNeed = data.isNeed === '1' ? true : false;
          });
        } else {
          this.taskList = [];
        }
      }
      this.taskList = this.taskList.concat(this.urlParams.OutlineData.mainFileTaskList);
      this.getDetail(this.selectedId);
      this.selectTask();
      this.getLive();
      this.isLoading = false;
    }, err => {
      this.isLoading = false;
    });
  }

  // 讲义列表
  private getHandoutFiles() {
    return this.courseMgService.sectionFileList_courseSectionFile(this.urlParams.courseSectionId);
  }

  // 任务列表
  private getTaskListInfo() {
    return this.knowledgeManageService.getTaskList({
      courseSectionId: this.urlParams.courseSectionId
    });
  }


  getLive() {
    this.liveAddress = SessionStorageUtil.getLiveAddress();
    this.notifyService.showLive.subscribe(res => {
      this.liveAddress = res.liveAddress;
    });
  }


  private getDetail(id) {
    this.taskList.every(h => {
      if (h.id === id) {
        this.curTask.id = h.id;
        this.curTask.selectedItem = h; //
        this.curTask.taskType = h.taskType;
        this.curTask.selectedItem.downloadType = h.downloadType ? h.downloadType : this.curTask.downloadType; //
      } else {
        return true;
      }
    });
  }


  // tslint-disable
  selectTask() {
    // taskType：0：阅读，1：案例，2：习题，3：实训, 考试(4)、实战(5)
    this.selectedTask$.subscribe(res => {
      // switch (res.taskType) {
      //   case '2': // 作业任务
      //   case '3': // 实训任务
      //   case '4':  // 考试
      //   case '6': // 问卷
      //   case '7':  // 调研
      //   case '0':  // 阅读库
      //   case '1': // 案例库
      // }
      if (res.taskType === '2') {
        this.curTask.status = '2';
        this.exerciseTaskService.exeMode = this.exerciseTaskService.toExerciseMode({}); // 重做，收藏，错题，一般
        this.exerciseTaskService.exeStatus = this.exerciseTaskService.toExerciseStatus({taskInfo: this.curTask});
      }
      this.getDetail(res.id);
    });
    //   .subscribe((res: any) => {
    //     if (this.curTask.taskType === '3') { // 实训
    //       const trainStatistic = res.data;
    //       this.curTask.selectedItem = {...this.curTask, trainStatistic};
    //     } else if (this.curTask.taskType === '2') {  // 练习
    //       this.curTask.selectedItem = res.data;
    //     } else { // 阅读
    //       this.curTask.selectedItem = res.data; //
    //       this.curTask.selectedItem.taskType = this.curTask.taskType; //
    //       this.curTask.selectedItem.downloadType = res.data.downloadType ? res.data.downloadType : this.curTask.downloadType; //
    //     }
    //   }
    // );
  }

  goBack() {
    LocalStorageUtil.setDefaultTask('');
    LocalStorageUtil.putBaseParams({});
    this.router.navigateByUrl(`/of/outline-fl`);
  }


  // 任务选择
  setSelect(item) {
    this.curTask = {...item};
    const params = {
      taskType: item.taskType, // 任务类型
      id: item.id, // 任务id
    };
    this.selectedTask$.next(params);
  }

  // 作业完成的回调
  finishTask(data) {
    if (this.curTask.taskType === '0') {
      this.curTask.exp = this.curTask.totalExp;
    }
    setTimeout(() => {
      this.isLoading = true;
      this.refreshList = !this.refreshList;
    }, 1000);
  }
}
