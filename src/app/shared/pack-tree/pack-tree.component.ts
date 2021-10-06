import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import {HttpService} from 'core/services/http.service';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {NzFormatEmitEvent, NzTreeNode, NzTreeNodeOptions, NzFormatBeforeDropEvent} from 'ng-zorro-antd';

@Component({
  selector: 'app-pack-tree',
  templateUrl: './pack-tree.component.html',
  styleUrls: ['./pack-tree.component.less']
})
export class PackTreeComponent implements OnInit {


  @Input() select;
  @Output() courseChange = new EventEmitter<any>();
  @Output() chapterClick = new EventEmitter<any>();


  isLoading = false;
  flag = '';
  curFession: any = {};

  nodes: any = [];
  activedNode: NzTreeNode;
  selectedKeys: any = [];

  constructor(private httpService: HttpService) {
  }

  ngOnInit() {
    this.flag = LocalStorageUtil.getUser().isAdmin === '1' ? '' : 'college';
    this.getProfessionList();
  }

  getProfessionList() {
    const options = {isCommonHttpHeader: true};
    this.isLoading = true;
    // /pkg/major/listMajor
    this.httpService.post('pkg/course/listByTree', {}, options).subscribe(
      result => {
        this.isLoading = false;
        if (result.status === 200) {
          this.nodes = this.transformNzTreeNodeOptions(result.data);
          const {id, professionId} = this.select;
          // 课程
          if (id) {
            this.selectedKeys = [id];
            this.curFession = result.data.filter((item) => item.id === professionId)[0];
            this.firstChange(this.curFession.courseList.filter((itemC) => itemC.id === id)[0]);
            // 专业
          } else if (professionId) {
            this.selectedKeys = [professionId];
            this.curFession = result.data.filter((item) => item.id === professionId)[0];
            this.chapterClick.emit(this.curFession);
          } else if (result.data[0] && result.data[0].courseList && result.data[0].courseList[0]) {
            // 第一个专业第一个课程
            this.selectedKeys = [result.data[0].courseList[0].id];
            this.curFession = result.data[0];
            this.firstChange(result.data[0].courseList[0]);
          }
        }
      },
      error => {
        this.isLoading = false;
      }
    );
  }

  firstChange(item: any) {
    this.courseChange.emit({
      professionId: this.curFession.id,
      professionName: this.curFession.name,
      ...item
    });
  }

  changeCourse(activedNode: any) {
    const parentNode = activedNode.parentNode;
    this.courseChange.emit({
      professionId: parentNode.origin.id,
      professionName: parentNode.origin.name,
      ...activedNode.origin
    });

  }

  nzEvent(evt: NzFormatEmitEvent): void {
    if (evt.eventName === 'click') {
      if (this.activedNode && this.activedNode.key !== evt.node.key) {
        this.activedNode.title = this.activedNode.origin.cacheTitle;
      }
      this.activedNode = evt.node;
      if (this.activedNode.isLeaf) {
        this.changeCourse(this.activedNode);
      } else {
        this.chapterClick.emit(this.activedNode.origin);
      }
      // console.log(this.activedNode)
    }
  }

  transformNzTreeNodeOptions(trees: NzTreeNodeOptions[], isFirst: boolean = true): NzTreeNodeOptions[] {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < trees.length; i++) {
      trees[i].title = trees[i].name;
      trees[i].cacheTitle = trees[i].name;
      trees[i].key = trees[i].id;
      if (trees[i].courseList) {
        trees[i].children = trees[i].courseList;
      }

      if (isFirst) {
        trees[i].expanded = true;
      }

      if (trees[i].courseList && trees[i].courseList.length > 0) {
        this.transformNzTreeNodeOptions(trees[i].courseList, false);
      } else {
        trees[i].isLeaf = true;
      }
    }
    return trees;
  }

}
