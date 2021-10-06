import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {MyClassService} from 'src/app/busi-services/my-class.service';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CourseManageService, KnowledgeManageService} from '@app/busi-services';
import {AliOssService} from 'core/services/ali-oss.service';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-study-outline-fl',
  templateUrl: './study-outline-fl.component.html',
  styleUrls: ['./study-outline-fl.component.less'],
})
// tslint:disable-next-line:component-class-suffix
export class StudyOutlineFl implements OnInit {
  courseData = SessionStorageUtil.getPacketInfo();
  studyOutlineList = []; // 所有章
  handoutsMaterial = []; // 章下资料
  isLoading = false;
  isVisible = false;
  chineseNumber = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '二十一', '二十二', '二十三', '二十四', '二十五', '二十六', '二十七', '二十八', '二十九', '三十'];

  constructor(
    private router: Router,
    private message: NzMessageService,
    private myClassService: MyClassService,
    private courseMgService: CourseManageService,
    private knowledgeManageService: KnowledgeManageService,
    private aliOss: AliOssService
  ) {
  }

  ngOnInit() {
    this.getChapter();
  }


  switchChapters(chapters, index: number): void {
    if (this.studyOutlineList[index]['openTarget']) {
      this.studyOutlineList[index]['openTarget'] = false;
    } else {
      this.studyOutlineList[index]['openTarget'] = true;
    }
    if (!chapters.children) {
      this.chapterChange(this.studyOutlineList[index]);
    }
  }

  getTastType(type: any) {
    const arr = [
      '阅读', '案例', '作业', '实训', '考试', '实战', '问卷', '测评'
    ];
    return arr[type];
  }

  gotoTask(data: any, taskForm: number, node: any) {
    const urlParams: any = {
      taskForm,
      lessonPlanType: this.courseData.teachType, // 课包类型
      lessonTimeId: data.id, // 任务id
      courseName: this.courseData.name, // 课程名字
      from: encodeURIComponent(`/of/outline-fl`), // 返回地址
      OutlineData: node, // 节下所有任务
      chapterId: data.courseChapterId, // 章id
      orderDetailId: this.courseData.id, // 课包id
      courseSectionId: data.courseSectionId // 节id
    };
    LocalStorageUtil.setDefaultTask(data.id);
    LocalStorageUtil.putBaseParams(urlParams);
    this.router.navigateByUrl(`/section`);
  }

  showData(data) {
    this.isVisible = !this.isVisible;
    if (!data) {
      return false;
    }
    this.handoutsMaterial = data.handoutsMaterial;
  }

  download(data) {
    this.aliOss.download(data);
  }


  // 获取所有章
  getChapter(): void {
    this.courseMgService.getList_courseChapter(this.courseData.id).subscribe(res => {
      if (res.status === 200) {
        res.data.forEach(data => {
          data.openTarget = false;
        });
        this.studyOutlineList = res.data;
        if (this.studyOutlineList.length > 0) {
          this.studyOutlineList[0].openTarget = true;
          if (!this.studyOutlineList[0].children || this.studyOutlineList[0].children.length === 0) {
            this.chapterChange(this.studyOutlineList[0]);
          }
        }
      }
    });
  }

  // 获取章下详细信息
  private chapterChange(chapter) {
    forkJoin(
      [this.courseMgService.getList_courseSection(chapter.id), // 获取章下所有节
        this.courseMgService.sectionFileList_courseSectionFile(null, chapter.id),
        this.knowledgeManageService.getTaskList({courseChapterId: chapter.id})], // 获取章下所有资料
      // 获取章下的所有任务
    ).subscribe(([res1, res2, res3]) => {
      if (res1.status === 200) {
        chapter.children = res1.data || [];
      }
      if (res2.status === 200) {
        const result = res2.data || [];
        chapter.handoutsMaterial = result.filter(itemM => itemM.type === '102').sort((a, b) => {
          if (a.seq > b.seq) {
            return -1;
          }
          if (a.seq < b.seq) {
            return 1;
          }
          return 0;
        }); // 章下资料
        // 主讲义放到对应节下
        chapter.mainFileTaskList = result.filter(itemR => itemR.type === '101' && itemR.isMainFile === '1').map(item => {
          item.name = item.title;
          item.taskType = '0';
          return item;
        });
        this.setExtendData(chapter, 'handoutsMaterial');  // 把对应资料放到对应节
        this.setExtendData(chapter, 'mainFileTaskList');  // 把对应主讲义放到对应节
      }
      if (res3.status === 200) {
        const result = res3.data || [];
        chapter.taskList = result.sort((a, b) => {
          if (a.seq > b.seq) {
            return -1;
          }
          if (a.seq < b.seq) {
            return 1;
          }
          return 0;
        }); // 章下资料
        this.setExtendData(chapter, 'taskList');  // 把对应任务放到对应节
      }
    });
  }

  private setExtendData(chapter, type) {
    chapter[type].forEach((itemMa) => { // 章任务循环
      if (chapter.children.length) {
        chapter.children.every((child, j) => { // 节循环
          if (child.id === itemMa.courseSectionId) {
            if (chapter.children[j][type]) {
              chapter.children[j][type].push(itemMa);
            } else {
              chapter.children[j][type] = [itemMa];
            }
          } else {
            return true;
          }
        });
      }
    });
  }

}
