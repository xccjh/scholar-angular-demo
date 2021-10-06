import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  OnChanges,
  SimpleChange
} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {SectionTaskItemComponent} from './section-task-item/section-task-item.component';
import {MyClassService} from 'src/app/busi-services/my-class.service';
import {LocalStorageUtil} from 'core/utils/localstorage.util';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.less']
})
export class TaskListComponent implements OnInit, OnChanges {
  // @Input() hideBtn: boolean
  @Input() refreshList: boolean;
  @Output() hideBtnChange = new EventEmitter<any>();
  @Output() taskItemChanges = new EventEmitter<any>();

  refresh = false;
  isLoading = false;
  // 当前高亮来源
  tabIdx = 0;
  hideBtn = false;
  // 任务类型
  typeList = ['课前', '课中', '课后', '资料'];
  // 任务数据
  onTaskList: any[] = [];
  allTaskList = [];

  // 课次id
  lessonTimeId = '';
  courseTimeId = '';

  urlParams: any = {};

  selectedId = '';

  curTask: any = {};

  @ViewChildren(SectionTaskItemComponent) items: QueryList<SectionTaskItemComponent>;

  constructor(
    private message: NzMessageService,
    private myClassService: MyClassService,
  ) {
  }

  ngOnInit(): void {
    this.urlParams = LocalStorageUtil.getBaseParams();
    this.selectedId = LocalStorageUtil.getDefaultTask(); // 默认任务
    this.onTaskList = [...(this.urlParams.OutlineData.mainFileTaskList || []), ...(this.urlParams.OutlineData.taskList || [])]; // 所有任务
  }

  ngOnChanges(chngs: { [key: string]: SimpleChange }) {
    if (chngs.refreshList) {
      if (this.refreshList === this.refresh) {
        return false;
      }
      this.refresh = this.refreshList;
      this.onTaskList[this.curTask.taskForm] = [];
      this.getStudentTaskList(this.curTask.taskForm); // 获取任务列表
    }
  }

  btnChange(hide) {
    this.hideBtn = hide;
    this.hideBtnChange.emit();
  }

  // 获取学生任务
  getStudentTaskList(taskForm = null, implicit = false) { // implicit 隐式刷新
    if (!implicit) {
      this.isLoading = true;
    }
    const params = {
      orderDetailId: this.urlParams.orderDetailId, // 课包id
      chapterId: this.urlParams.chapterId // 章id
    };
    this.myClassService.getTask(params).subscribe((res) => {
      if (res.status === 200) {
        const section = res.data.filter((item) => {
          return item.sectionId === this.urlParams.OutlineData.sectionId;
        })[0];
        // 更新缓存
        this.urlParams.OutlineData.mainFileTaskList = section.mainFileTaskList;
        this.urlParams.OutlineData.taskList = section.taskList;
        LocalStorageUtil.putBaseParams(this.urlParams);
        const sectionTastData = [...section.mainFileTaskList, ...section.taskList];
        this.classifyData(sectionTastData);
      }
    });
  }

  classifyData(data: any[]) {
    this.onTaskList = data;
    if (this.selectedId) {
      const selectedTask = this.onTaskList.filter(el => this.selectedId === el.id);
      if (selectedTask[0]) {
        this.setSelect(selectedTask[0], true);
      } else {
        LocalStorageUtil.setDefaultTask('');
        this.taskItemChanges.emit({
          taskType: '-999',
          selectedItem: {}
        });
      }
    }
  }

  // 左侧任务选择
  taskItemChange(taskItem: any) {
    if (taskItem.id === this.selectedId) {
      return false;
    }
    this.selectedId = taskItem.id;
    LocalStorageUtil.setDefaultTask(this.selectedId);
    this.setSelect(taskItem, false);
  }

  // 任务选择
  setSelect(taskItem: any, isJump: boolean) {
    this.curTask = taskItem;
    this.taskItemChanges.emit(taskItem);
    if (isJump) {
      setTimeout(() => {
        this.getview(this.selectedId);
      }, 600);
    }
  }

  getview(id: string) {
    const idx = this.onTaskList.findIndex(el => id === el.id);
    if (idx === -1) {
      return false;
    }
    const results: SectionTaskItemComponent[] = this.items['_results'];
    const ele = results[idx];
    ele.scrollToView();
  }
}
