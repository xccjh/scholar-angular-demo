import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {trigger, state, style, transition, animate} from '@angular/animations';
import {NzMessageService} from 'ng-zorro-antd/message';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {AliOssService} from 'core/services/ali-oss.service';
import {CourseManageService} from '@app/busi-services';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-study-outline-recorded',
  templateUrl: './study-outline.component.html',
  styleUrls: ['./study-outline.component.less'],
  animations: [
    trigger('collapse', [
      state('open', style({
        height: 0
      })),
      state('close', style({
        height: 'auto'
      })),
      transition('open <=> close', [
        animate('0.3s')
      ])
    ])
  ]
})
export class StudyOutlineComponent implements OnInit {
  courseData = SessionStorageUtil.getPacketInfo();
  outline: Array<any> = [];// 所有章
  isVisible = false;
  chineseNumber = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '二十一', '二十二', '二十三', '二十四', '二十五', '二十六', '二十七', '二十八', '二十九', '三十'];
  handouts = []; // 所有资料
  handoutsMaterial = []; // 章下资料
  handoutsRecording = []; // 章下录播


  constructor(
    private message: NzMessageService,
    private courseMgService: CourseManageService,
    private aliOss: AliOssService,
  ) {
  }

  ngOnInit(): void {
    this.getChapter();
  }

  switchChapters(chapters, index: number): void {
    if (this.outline[index]['open']) {
      this.outline[index]['open'] = false;
    } else {
      this.outline[index]['open'] = true;
    }
    if (!chapters.children) {
      this.chapterChange(this.outline[index]);
    }
  }

  showData(section) {
    this.isVisible = !this.isVisible;
    if (!section) {
      return false;
    }
    this.handoutsMaterial = section.handoutsMaterial;
  }

// 下载节的资料
  download(data) {
    this.aliOss.download(data);
  }

  goToBreakthrough(knowledge, section) {
    const url = `#/chapter-study/${section.id}/2${knowledge.resourceId ? '/' + knowledge.resourceId : ''}`;
    window.open(url);
  }

// 获取所有章
  getChapter(): void {
    this.courseMgService.getList_courseChapter(this.courseData.id).subscribe(res => {
      if (res.status === 200) {
        res.data.forEach(data => {
          data.open = false;
        });
        this.outline = res.data;
        if (this.outline.length > 0) {
          this.outline[0].open = true;
          if (!this.outline[0].children || this.outline[0].children.length === 0) {
            this.chapterChange(this.outline[0]);
          }
        }
      }
    });
  }

// 获取章下详细信息
  private chapterChange(chapter) {
    forkJoin(
      [this.courseMgService.getList_courseSection(chapter.id), // 获取章下所有节
        this.courseMgService.sectionFileList_courseSectionFile(null, chapter.id)] // 获取章下所有资料
    ).subscribe(([res1, res2]) => {
      if (res1.status === 200) {
        chapter.children = res1.data || [];
        if (chapter.children.length) {
          const idList = [];
          chapter.children.forEach(children => {
            idList.push(children.id);
          });
          this.courseMgService.countTheNumberOfKnowledgePoints(idList).subscribe((res) => {
            if (res.status === 200) {
              res.data.forEach((data, index) => {
                chapter.children.every((child, j) => {
                  if (child.id === data.courseSectionId) {
                    chapter.children[j].knowledgePointCount = data.knowledgePointCount; // 增加节的知识点统计
                  } else {
                    return true;
                  }
                });
              });
            }
          });
        }
      }
      if (res2.status === 200) {
        const result = res2.data || [];
        chapter.handoutsMaterial = result.filter(itemM => itemM.type === '102'); // 章下录播
        chapter.handoutsRecording = result.filter(itemR => itemR.type === '103').sort((a, b) => {
          if (a.seq > b.seq) {
            return -1;
          }
          if (a.seq < b.seq) {
            return 1;
          }
          return 0;
        }); // 章下资料
        this.setExtendData(chapter, 'handoutsMaterial');  // 把对应资料放到对应节
        this.setExtendData(chapter, 'handoutsRecording'); // 把对应录播放到对应节
      }
    });
  }

  private setExtendData(chapter, type) {
    chapter[type].forEach((itemMa,) => {
      if (chapter.children.length) {
        chapter.children.every((child, j) => {
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
