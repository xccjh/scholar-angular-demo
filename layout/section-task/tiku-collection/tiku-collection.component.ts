import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MyClassService } from 'src/app/busi-services/my-class.service';
import { TikuService } from 'src/app/busi-services/tiku.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';

@Component({
  selector: 'app-tiku-collection',
  templateUrl: './tiku-collection.component.html',
  styleUrls: ['./tiku-collection.component.less']
})
export class TikuCollectionComponent implements OnInit, OnChanges {

  @Input() nodes: any[] = [];
  @Input() selectedCourse: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
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
          const node = this.getDefaultChapter();
          this.getChapterTask(node);
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
        const { thirdId: uid } = LocalStorageUtil.getUser();
        this.tikuService.getCollectionByUidPids(parseInt(uid, 10), uuids).subscribe(collectionRes => {
          chapter.loading = false;
          if (collectionRes.code === 200) {
            const myCollections: object = collectionRes.data.myCollections;
            const collectionKeys = Object.keys(myCollections);
            collectionKeys.forEach(collectKey => {
              const task = taskList.find(taskEle => taskEle.uuid === collectKey);
              if (task) {
                task.collectionExeNum = myCollections[collectKey].count || 0;
              }
            });
            chapter.children = taskList.filter(task => task.collectionExeNum > 0);
          } else {
            chapter.children = [];
            this.nzMsg.error(JSON.stringify(collectionRes));
          }
          chapter.active = true;
        });
      } else {
        this.nzMsg.error(JSON.stringify(res));
      }
    });
  }

  redoExecrise(task: any): void {
    task.taskUrl = this.tikuService.getPaperUrl(task.uuid);
    SessionStorageUtil.putTikuTask(task);
    this.router.navigateByUrl(`/section/tiku-execrise-task?tikuType=${3}`);
  }

  getDefaultChapter(): any {
    const courseChapterId = this.route.snapshot.queryParamMap.get('courseChapterId');
    const chapter = this.nodes.find(node => node.chapterId === courseChapterId);
    if (chapter) {
      return chapter;
    } else {
      return this.nodes[0];
    }
  }
}
