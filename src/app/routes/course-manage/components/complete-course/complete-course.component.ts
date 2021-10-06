import {Component, Input, OnInit} from '@angular/core';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';

@Component({
  selector: 'app-complete-course',
  templateUrl: './complete-course.component.html',
  styleUrls: ['./complete-course.component.less']
})
export class CompleteCourseComponent implements OnInit {
  listOfData = [];
  lessonCount: any = 0;
  quebankNum: any = 0;
  knowledgeNum: any = 0;
  authorNum: any = 0;
  sectionNum: any = 0;
  teachDemoNum: any = 0;
  teachType;
  preview;
  coursePacketId;

  constructor(
    private courseManageService: CourseManageService,
  ) {
  }

  ngOnInit() {
    this.initParams();
    this.getDetails();
  }

  getDetails() {
    this.courseManageService.getDetails(this.coursePacketId).subscribe(res => {
      if (res.status === 200) {
        const {studySet, lessonCount, quebankNum, knowledgeNum, authorNum, sectionNum, teachDemoNum} = res.data;
        this.listOfData = studySet ? studySet : [];
        this.lessonCount = lessonCount ? lessonCount : 0;
        this.quebankNum = quebankNum ? quebankNum : 0;
        this.knowledgeNum = knowledgeNum ? knowledgeNum : 0;
        this.authorNum = authorNum ? authorNum : 0;
        this.sectionNum = sectionNum ? sectionNum : 0;
        this.teachDemoNum = teachDemoNum ? teachDemoNum : 0;
      }
    });
  }

  private initParams() {
    const {teachType, preview, id} = SessionStorageUtil.getPacketInfo();
    this.teachType = teachType;
    this.preview = preview;
    this.coursePacketId = id;
  }
}
