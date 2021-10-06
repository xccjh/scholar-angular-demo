import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {AliOssService} from 'core/services/ali-oss.service';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {TaskCenterService} from 'core/services/task-center.service';
import {environment} from '../../../src/environments/environment';
import {CourseManageService} from '@app/busi-services';

@Component({
  selector: 'app-test-task',
  templateUrl: './test-task.component.html',
  styleUrls: ['./test-task.component.less'],
})
export class TestTaskComponent implements OnInit {
  @Input() curTask: any;
  @Input() data: any;
  @Input() id = '';
  @Output() finishTaskCallBack = new EventEmitter<any>();
  isShow = false;
  url: any;
  isLoading = false;
  attachmentPath = '';
  userInfo = LocalStorageUtil.getUser();
  status = ['未完成', '已完成', '重做'];
  testType = ['阶段考试', '单科考试', '模拟考试', '密押考试', '机考考试', '实操考试'];
  paperType: any;
  answerTimes: any;
  examLength: any;
  isComputer: any;
  isRedo: any;
  resultWay: any;
  passScore: any;
  computerType: any;

  constructor(
    private message: NzMessageService,
    private aliOss: AliOssService,
    private taskService: TaskCenterService,
    private courseMgService: CourseManageService,
  ) {
  }

  ngOnInit() {
    this.courseMgService.getExamination(this.data.id).subscribe(res => {
      this.paperType = res.data.paperType;
      this.answerTimes = res.data.answerTimes;
      this.examLength = res.data.examLength;
      this.isComputer = res.data.isComputer;
      this.isRedo = res.data.isRedo;
      this.resultWay = res.data.resultWay;
      this.passScore = res.data.passScore;
      this.computerType = res.data.computerType;
    });
  }

  getName() {
    switch (this.paperType) {
      case '1' :
        return '阶段考试';
      case '2' :
        return '单科考试';
      case '3' :
        return '模拟考试';
      case '4' :
        return '密押考试';
      case '5' :
        return '机考考试';
      case '6' :
        return '实操考试';
      default:
        return '阶段考试';
    }
  }

  download() {
    const filename = this.data.taskType === '4' ? this.data.title : this.data?.taskName;
    this.aliOss.download({attachmentName: filename, ...this.data});
  }

  gotoTest() {
    this.a();
  }

  testTask() {
    const taskId = this.curTask.studentTaskId ? this.curTask.studentTaskId : this.curTask.id;
    this.taskService.previewTestTask(this.curTask.busId, taskId, this.userInfo.id).subscribe((res) => {
      if (res.status === 200) {
        this.data = res.data;
        this.a();
      }
    });
  }

  a() {
    if (this.answerTimes !== 0 && (this.data.taskTimes === this.answerTimes || this.data.taskTimes > this.answerTimes)) {
      this.message.info('考试次数已用完');
      return false;
    }
    this.data.taskTimes = (this.data.taskTimes || 0) + 1;
    const a = document.createElement('a');
    a.target = '_black';
    a.href = environment.tkPage + '/practice?uuid=' +
      this.data.resourceId.split('-')[0] +
      '&examId=88888888' +
      '&uid=88888888&examDuration=' + this.examLength +
      '&examType=' + (this.computerType === '2' ? 'middle' : 'junior') + '&redo=' + this.isRedo;
    a.click();
  }
}
