import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ExerciseTaskService } from '../exercise-task/exercise-task.service';
import {SessionStorageUtil} from '../../../core/utils/sessionstorage.util';

@Component({
  selector: 'app-tiku-exercise-task',
  templateUrl: './tiku-exercise-task.component.html',
  styleUrls: ['./tiku-exercise-task.component.less'],
  providers: [ ExerciseTaskService ]
})
export class TikuExerciseTaskComponent implements OnInit {
  @Input() nodes: any[] = [];
  @Input() selectedCourse: any;
  hideBtn = false;
  taskInfo: any;
  tikuType = -1;
  isLoading = false;
  /** 题库任务状态，用于题库入口，做完评分 */
  tikuTaskStatus = -1;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private exerciseTaskService: ExerciseTaskService,
    private nzMsg: NzMessageService) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(queryParam => {
      this.tikuType = parseInt(queryParam.get('tikuType'), 10);
      if (this.tikuType === 3) {
        this.tikuTaskStatus = 1;
      }
      this.taskInfo = SessionStorageUtil.getTikuTask();
      this.loadData();
    });
  }

  loadData() {
    const { studentTaskId, id,  busId, taskUrl, errorQuestionList } = this.taskInfo;
    this.exerciseTaskService.exeMode = this.exerciseTaskService.toExerciseMode({
      taskInfo: this.taskInfo,
      tikuType: this.tikuType,
      tikuTaskStatus: this.tikuTaskStatus
    });
    this.exerciseTaskService.exeStatus = this.exerciseTaskService.toExerciseStatus({
      taskInfo: this.taskInfo,
      tikuType: this.tikuType,
      tikuTaskStatus: this.tikuTaskStatus
    });
    this.isLoading = true;
    this.exerciseTaskService.getExercise(taskUrl).subscribe(res => {
      this.isLoading = false;
      if (this.tikuType === 2) { // 错题集传送错题列表
        res.errorQuestionList = errorQuestionList || [];
      }
      this.taskInfo.selectedItem = res;
    }, err => {
      this.isLoading = false;
      this.nzMsg.error(err);
    });
  }

  goBack() {
    if (this.route.snapshot.queryParamMap.get('from') === 'section') {
      window.history.go(-1);
    } else {
      this.router.navigateByUrl(`/section/tiku-profile
      ?tikuType=${this.tikuType}&coursePacketId=${this.taskInfo.coursePacketId}&courseChapterId=${this.taskInfo.courseChapterId}`);
    }
  }

  get pageTitle(): string {
    switch (this.tikuType) {
      case 1:
        return '题库集';
      case 2:
        return '错题集';
      case 3:
        return '收藏';
      default:
        return '';
    }
  }

  finishTask(data: any) {
    this.tikuTaskStatus = data.tikuTaskStatus;
    this.loadData();
  }

}
