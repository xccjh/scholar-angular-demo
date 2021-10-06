import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {AliOssService} from 'core/services/ali-oss.service';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {TaskCenterService} from 'core/services/task-center.service';
import {environment} from 'src/environments/environment';

@Component({
  selector: 'app-question-task',
  templateUrl: './question-task.component.html',
  styleUrls: ['./question-task.component.less'],
})
export class QuestionTaskComponent implements OnInit {
  @Input() curTask: any;
  @Input() data: any;
  @Input() id = '';
  @Output() finishTaskCallBack = new EventEmitter<any>();
  isShow = false;
  url: any;
  isLoading = false;
  question = false;
  attachmentPath = '';
  userInfo = LocalStorageUtil.getUser();
  status = ['未完成', '已完成', '重做'];
  testType = ['阶段考试', '单科考试', '模拟考试', '密押考试', '机考考试', '实操考试'];

  constructor(
    private message: NzMessageService,
    private aliOss: AliOssService,
    private taskService: TaskCenterService,
  ) {
  }

  ngOnInit() {

  }

  download() {
    const pathArr = this.attachmentPath.split('.');
    const filename = this.data.taskType === '4' ? this.data.title : this.data?.taskName;
    const name = filename + '.' + pathArr[pathArr.length - 1];
    this.aliOss.download({attachmentName: filename, ...this.data});
  }

  gotoTest() {
    if (this.question) {
      this.questionTask();
      return false;
    }
    this.a();
  }

  questionTask() {
    const taskId = this.curTask.studentTaskId ? this.curTask.studentTaskId : this.curTask.id;
    this.taskService.previewTestTask(this.curTask.busId, taskId, this.userInfo.id).subscribe((res) => {
      if (res.status === 200) {
        this.data = res.data;
        this.a();
      }
    });
  }

  a() {
    if (this.data.taskFinish === '1') {
      this.message.info(`${this.curTask.taskType === '6' ? '调查问卷已完成' : '问卷测评已完成'}`);
      return false;
    }
    // this.question = true;
    const a = document.createElement('a');
    a.target = '_black';
    a.href =
      environment.tkPage + '/practice?uuid=' +
      this.data.resourceId.split('-')[0] + '&uid=88888888&examId=88888888&redo=1&tikuType='
      + (this.curTask.taskType === '6' ? 4 : 5) + '&linkFromseeai';
    a.click();
  }
}
