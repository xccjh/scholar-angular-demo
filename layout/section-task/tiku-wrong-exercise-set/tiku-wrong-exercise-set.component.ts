import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { Router } from '@angular/router';
import { MyClassService } from 'src/app/busi-services/my-class.service';
import { TikuService } from 'src/app/busi-services/tiku.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import {LocalStorageUtil} from '../../../core/utils/localstorage.util';
import {SessionStorageUtil} from '../../../core/utils/sessionstorage.util';
@Component({
  selector: 'app-tiku-wrong-exercise-set',
  templateUrl: './tiku-wrong-exercise-set.component.html',
  styleUrls: ['./tiku-wrong-exercise-set.component.less']
})
export class TikuWrongExerciseSetComponent implements OnInit, OnChanges {

  @Input() nodes: any[] = [];
  @Input() selectedCourse: any;
  constructor(
    private router: Router,
    private nzMsg: NzMessageService,
    private tikuService: TikuService,
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
          chapter.loading = false;
          chapter.children = [];
          chapter.active = true;
          return;
        }

        const uuids = taskList.map(task => task.uuid).join(',');
        const examIds = taskList.map(task => task.busId).join(',');
        const { thirdId: uid } = LocalStorageUtil.getUser();
        this.tikuService.getErrorExecrise(parseInt(uid, 10), uuids, examIds).subscribe(errDoRes => {
          chapter.loading = false;
          if (errDoRes.code === 200) {
            const errorRedo: object = errDoRes.data.errorRedo;
            const errorRedoKeys = Object.keys(errorRedo);
            errorRedoKeys.forEach(errKey => {
              const task = taskList.find(taskEle => `${taskEle.uuid}_${taskEle.busId}` === errKey);
              if (task) {
                task.errorExeNum = errorRedo[errKey].parentQuestionCount || 0;

                // 错题列表
                const errorQuestionList = new Set<string>();
                const errorList = errorRedo[errKey].errorQuestionList;
                // tslint:disable-next-line:prefer-for-of
                for (let i = 0; i < errorList.length; i++) {
                  if (errorList[i].parentId === '0') {
                    errorQuestionList.add(errorList[i].questionId);
                  } else { // 综合题里小题取 parentId
                    errorQuestionList.add(errorList[i].parentId);
                  }
                }
                task.errorQuestionList = [...errorQuestionList];
              }
            });

            chapter.children = taskList.filter(task => task.errorExeNum > 0);
          } else {
            chapter.children = [];
            this.nzMsg.error(JSON.stringify(errDoRes));
          }
        });
      } else {
        this.nzMsg.error(JSON.stringify(res));
      }
    });
  }

  redoExecrise(task: any): void {
    if (task.taskType === '4') {
      let taskUrl = `${task.taskUrl}&tikuType=2`;
      if (!taskUrl.startsWith('https') && !taskUrl.startsWith('http')) {
        taskUrl = window.location.protocol + taskUrl;
      }
      window.open(taskUrl, '__blank');
      return;
    }
    SessionStorageUtil.putTikuTask(task);
    this.router.navigateByUrl(`/section/tiku-execrise-task?tikuType=${2}`);
  }

}
