import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {MyClassService} from 'src/app/busi-services/my-class.service';
import {Router, ActivatedRoute, ParamMap, NavigationEnd} from '@angular/router';
import {Location} from '@angular/common';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {SessionStorageUtil} from '../../core/utils/sessionstorage.util';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-chapter-study',
  templateUrl: './chapter-study.component.html',
  styleUrls: ['./chapter-study.component.less']
})
// tslint:disable-next-line:component-class-suffix
export class ChapterStudy implements OnInit {
  user = LocalStorageUtil.getUser();
  isVisible = false;
  isSmart = '1';
  title;
  curProgress;
  status;
  courseId;
  professionId;
  coursePacketId;
  lessonCount;
  code;
  teachType;
  auditStatus;
  preview;
  createrId;
  pcode;
  knowledgeSubjectId;
  pageType = '2';
  sectionId = '';
  teacherList: any = [];
  currentTeacherId = '';
  data: any = {};
  chapterStudyVideo: any = {};
  curResourceId = '';
  resourceId = '';
  knowledgeData: any = {};
  knowledgeSubjectCode: string;

  constructor(
    private myClassService: MyClassService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit() {
    document.getElementsByTagName('html')[0].style.minWidth = 'auto';
    document.getElementsByTagName('body')[0].style.minWidth = 'auto';
    this.initParams();
    this.initLoad();
  }

  initParams() {
    const {
      name, curProgress, status, courseId, professionId, id, lessonCount, isSmart, code,
      teachType, auditStatus, preview, createrId, pcode, knowledgeSubjectId
    }
      = SessionStorageUtil.getPacketInfo();
    this.title = name; // 课包名称
    this.curProgress = Number(curProgress);
    this.status = status; // 课包状态
    this.courseId = courseId; // 课程id
    this.professionId = professionId; //  学科id
    this.coursePacketId = id; //  课包
    this.lessonCount = Number(lessonCount); // 课次
    this.isSmart = isSmart; // 智适应
    this.code = code; // 课程编码
    this.teachType = teachType; // 授课方式: 线下面授(11)、线下双师(12)、线上直播(21)、线上录播(22)
    this.auditStatus = auditStatus; // 审核流程状态
    this.preview = preview;
    this.createrId = createrId;
    this.pcode = pcode;
    this.knowledgeSubjectId = knowledgeSubjectId;
  }


  initLoad() {
    this.route.paramMap.subscribe(param => {
      this.sectionId = param.get('sectionId');
      this.pageType = param.get('type');
      this.knowledgeSubjectCode = param.get('code');
    });
    this.getSectionLearn();
  }

  showModel() {
    this.isVisible = !this.isVisible;
  }

  getSectionLearn() {
    if (this.pageType === '1') {
      this.knowledge();
    } else {
      this.chapter();
    }
  }

  chapter(type = '') {
    this.chapterStudyVideo = '';
    this.route.paramMap.subscribe(param => {
      this.curResourceId = decodeURIComponent(param.get('resourceId'));
    });
    const params: object = {
      sectionId: this.sectionId,
    };
    if (type === '') {
      params['resourceId'] = this.curResourceId;
    }
    this.myClassService.getSectionLearn(params).subscribe((res) => {
      if (res.status === 200) {
        this.data = res.data;
        if (this.curResourceId && this.curResourceId !== '1') {   // 当前播放的视频ID
          this.chapterStudyVideo = this.data.videos.filter((item) => {
            return item.resourceId == this.curResourceId;
          })[0];
        } else if (this.data.breakThroughResourceId) {       // 上次播放的视频ID
          this.chapterStudyVideo = this.data.videos.filter((item) => {
            return item.resourceId == this.data.breakThroughResourceId;
          })[0];
        }
        this.chapterStudyVideo = this.chapterStudyVideo ? this.chapterStudyVideo : this.data.videos[0];
        this.curResourceId = this.data.videos[0]?.resourceId;
        this.currentTeacherId = this.data.teachId;
        this.getAllTeachByoursePacketId();
      }
    });
  }

  knowledge() {
    this.myClassService.knowledgeDetail(this.knowledgeSubjectCode).subscribe((res) => {
      if (res.status === 200) {
        this.knowledgeData = res.data;
        if (this.knowledgeData.video.videoDetail) {
          this.chapterStudyVideo = this.knowledgeData.video.videoDetail;
        } else {
          this.chapterStudyVideo = {};
        }
      }
    });
  }

  getAllTeachByoursePacketId() {
    this.myClassService.getAllTeachByoursePacketId(this.data.coursePacketId).subscribe((res) => {
      if (res.status === 200) {
        this.teacherList = res.data;
      }
    });
  }

  videoTab(data: any) {
    this.chapterStudyVideo = data;
    this.router.navigate([`/chapter-study/${this.sectionId}/2/${data.resourceId}`]);
  }

  teacherTab(isVisible: any) {
    this.isVisible = isVisible;
  }


  teacherChange(event) {
    this.currentTeacherId = event;
  }

  saveHalfWayOutVideo() {
    const params = {
      sectionId: this.sectionId,
      resourceId: this.chapterStudyVideo.resourceId,
    };
    this.myClassService.saveHalfWayOutVideo(params).subscribe((res) => {
      if (res.status === 200) {
      }
    });
  }

}
