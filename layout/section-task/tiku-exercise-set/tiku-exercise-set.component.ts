import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { Router } from '@angular/router';
import { MyClassService } from 'src/app/busi-services/my-class.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { forkJoin, Observable, Subscriber } from 'rxjs';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {TaskCenterService} from 'core/services/task-center.service';
@Component({
  selector: 'app-tiku-exercise-set',
  templateUrl: './tiku-exercise-set.component.html',
  styleUrls: ['./tiku-exercise-set.component.less']
})
export class TikuExerciseSetComponent implements OnInit, OnChanges {

  @Input() nodes: any[] = [];
  @Input() selectedCourse: any;
  statusName = ['未完成', '已完成', '重做', '待自评'];
  constructor(
    private router: Router,
    private nzMsg: NzMessageService,
    private taskService: TaskCenterService,
    private myClassService: MyClassService) { }

  ngOnChanges(changes: {[key: string]: SimpleChange}): void {
    const { selectedCourse } = changes;
    if (selectedCourse && selectedCourse.currentValue) {
     this.getStudyOutline(this.selectedCourse.coursePacketId);
    }
  }

  ngOnInit(): void {
  }

  getStudyOutline(coursePacketId: string): void {
    this.myClassService.getStudyOutline(coursePacketId).subscribe(res => {
      if (res.status === 200) {
        this.nodes = res.data.chapterList;
        if (this.nodes .length > 0) {
          this.nodes[0].active = true;
          this.getChapterTask(this.nodes[0]);
        }
      } else {
        this.nzMsg.error(JSON.stringify(res));
      }
    });
  }

  sectionChange(chapter: any) {
    if (chapter.loading) {
      return;
    }
    if (!chapter.children || chapter.children.length === 0) {
      this.getChapterTask(chapter);
    }
  }

  getChapterTask(chapter: any) {
    const chapterId = chapter.chapterId;
    const { id: orderDetailId } = this.selectedCourse;
    if (!orderDetailId) {
      return;
    }
    const params = {
      orderDetailId,
      chapterId
    };
    chapter.loading = true;
    this.myClassService.getTask(params).subscribe(res => {
      if (res.status === 200) {
        const sections: any[] = res.data;
        const taskList: any[] = sections.reduce((pre, cur, index) => {
          const mainFileTaskList: any[] = Array.isArray(cur.mainFileTaskList) ? cur.mainFileTaskList : [];
          const maintasks = mainFileTaskList.map(task => ({
            ...task,
            taskName: task.name,
            sectionIdxName: `第${index + 1}节`,
            sectionName: cur.sectionName
          }));
          pre.push(maintasks);
          const sectionTaskList: any[] = Array.isArray(cur.taskList) ? cur.taskList : [];
          const tasks = sectionTaskList.map(task => ({
            ...task,
            taskName: task.name,
            sectionIdxName: `第${index + 1}节`,
            sectionName: cur.sectionName
          }));
          pre.push(tasks);
          return pre;
        }, []).flat(1).filter(task => (task.taskType === '2' || task.taskType === '4') && task.taskStatus !== '2'); // 作业任务，试卷，状态不是撤回
        if (taskList.length === 0) {
          chapter.children = [];
          chapter.loading = false;
          return;
        }
        this.getExamTaskInfo(taskList).subscribe(taskInfo => {
          chapter.children = taskList.map(task => {
            return {
              ...task,
              taskStautsResult: this.getTaskStatus(task)
            };
          });
          chapter.loading = false;
        }, err => {
          chapter.children = [];
          chapter.loading = false;
          this.nzMsg.error(JSON.stringify(res));
        });
      } else {
        chapter.children = [];
        chapter.loading = false;
        this.nzMsg.error(JSON.stringify(res));
      }
    });
  }

  getExamTaskInfo(taskList: any[]) {
    return new Observable((observer: Subscriber<any>) => {
      const examTaskList = taskList.filter((task: any) => task.taskType === '4');
      if (examTaskList.length === 0) {
        observer.next();
        observer.complete();
        return;
      }
      const userInfo = LocalStorageUtil.getUser();
      const examTasks$ = examTaskList.map(examTask => {
        const id = examTask.studentTaskId ? examTask.studentTaskId : examTask.id;
        return this.taskService.previewTestTask(examTask.busId, id, userInfo.id);
      });
      forkJoin(examTasks$).subscribe(res => {
        // @ts-ignore
        const successRes = res.filter(s => s.status === 200);
        for (const examTaskRes of successRes) {
          // @ts-ignore
          const task = examTaskList.find(taskEle => taskEle.taskUrl === examTaskRes.data.taskUrl);
          if (task) {
            // @ts-ignore
            task.examTaskPreview = examTaskRes.data;
          }
        }
        observer.next();
        observer.complete();
      }, err => {
        observer.error(err);
      });
    });
  }

  redoExecrise(task: any): void {
    if (task.taskType === '4') {
      if (!task.taskStautsResult.status) {
        this.nzMsg.error(task.taskStautsResult.mes);
        return;
      }
      // examRedo=1重做，examRedo=0不重做，展示做题记录
      let taskUrl = `${task.taskUrl}&tikuType=1&examRedo=1`;
      if (!taskUrl.startsWith('https') && !taskUrl.startsWith('http')) {
        taskUrl = window.location.protocol + taskUrl;
      }
      window.open(taskUrl, '__blank');
      return;
    }
    SessionStorageUtil.putTikuTask(task);
    this.router.navigateByUrl(`/section/tiku-execrise-task?tikuType=${1}`);
  }

  getTaskStatus(task: any) {
    const { examTaskPreview } = task;
    if (examTaskPreview) {
      // 考试次数： 不限次，不管什么时候都能进
      // 限制次数， 次数用完了不能进, 结束了不能进
      // -- 真奇葩的逻辑 --
      if (examTaskPreview.totalTimes === 0) {
        return { mes: '不限次，不管什么时候都能进', status: true};
      } else {
        if (examTaskPreview.taskFinish === '1') {
          return { mes: '任务已结束', status: false};
        } else {
          if (examTaskPreview.totalTimes - examTaskPreview.taskTimes > 0) {
            return { mes: '考试重做', status: true };
          } else {
            return { mes: '暂无考试次数', status: false};
          }
        }
      }
    } else {
      return { mes: '非考试任务暂不处理', status: true };
    }
  }

}
