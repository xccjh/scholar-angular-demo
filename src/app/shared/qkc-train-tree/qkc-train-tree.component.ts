import { Component, OnInit, Input, Output,
  EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import {
  NzFormatEmitEvent,
  NzTreeNode,
} from 'ng-zorro-antd';

import { ToolsUtil } from 'core/utils/tools.util';
import { NzTreeComponent } from 'ng-zorro-antd/tree';
import { TrainManageService } from 'src/app/busi-services/train-manage.service';

@Component({
  selector: 'qkc-train-tree',
  templateUrl: './qkc-train-tree.component.html',
  styleUrls: ['./qkc-train-tree.component.less']
})
export class QkcTrainTreeComponent implements OnInit, OnChanges {

  // actived node
  activedNode: NzTreeNode;
  activeId = '';
  isLoading = false;

  @Input() nodes = [];
  @Input() flag = 1;

  @Input() professionId: string;

  @Input() isDraggable = false;

  @Input() isCheckable = false;

  @Input() defaultCheckedKeys = [];

  @Input() isExpandAll = false;

  defaultExpandedKeys = [];

  @ViewChild('nzTreeComponent') nzTreeComponent: NzTreeComponent;

  // 显示的模式
  @Input() model: 'custom' | 'check' | 'click' | '' = '';

  // @Output() nodeChange = new EventEmitter<NzTreeNodeOptions>();
  @Output() nodeChange = new EventEmitter<any>();

  constructor(private trainManageService: TrainManageService) { }

  ngOnInit() {
    if (this.model === 'custom') {
      this.isCheckable = false;
    } else if (this.model === 'check') {
      this.isCheckable = false;
    } else if (this.model === 'click') {
      this.isCheckable = false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['professionId']) {
      this.getKnowledgeTree(this.professionId);
    }
  }

  nzEvent(evt: NzFormatEmitEvent): void {
    if (evt.eventName === 'click') {
      if (this.activedNode && this.activedNode.key !== evt.node.key && this.activedNode.origin.isEdit === true) {
        this.activedNode.title = this.activedNode.origin.cacheTitle;
        this.activedNode.origin.isEdit = false;
      }
      this.activedNode = evt.node;
      this.activeId = evt.node.origin.id;
      this.nodeChange.emit(evt.node.origin);
    } else if (evt.eventName === 'check') {
      if (this.model === 'check') {
        const ckeckedKeys = this.getCheckedLeafKey(evt.checkedKeys);
        this.nodeChange.emit(ckeckedKeys);
      }
    }
  }

  getCheckedLeafKey(arr: any[]): string[] {
    const keys: string[] = [];
    const recurTree = (checkKeyArr: any[]) => {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < checkKeyArr.length; i++) {
        const node = checkKeyArr[i] instanceof NzTreeNode ? checkKeyArr[i].origin : checkKeyArr[i];
        if (node.children && node.children.length > 0) {
          recurTree(node.children);
        } else {
          keys.push(node.id);
        }
      }
    };
    recurTree(arr);
    return keys;
  }

  getKnowledgeTree(id: string): void {
    if (id === null) {
      return;
    }
    const param = { industryId: id, page: 1, limit: 100};
    this.isLoading = true;
    const success = result => {
      this.isLoading = false;
      if (result.status === 200) {
        this.defaultCheckedKeys = [...this.defaultCheckedKeys];
        this.nodes = ToolsUtil.transformNzTreeNodeOptions(result.data);
        if (this.defaultCheckedKeys.length > 0) {
          this.expandCheckedNode();
        } else if (this.nodes.length > 0) {
          this.defaultExpandedKeys = [this.nodes[0].id];
        }
        if (this.model === 'check') {
          this.activeId = this.defaultCheckedKeys[0];
        }
      }
    };
    const error = err => {
      this.isLoading = false;
    };
    this.trainManageService.listAllCompary(param).subscribe(success, error);
  }

  expandCheckedNode() {
    setTimeout(() => {
      if (!this.nzTreeComponent) {
        return;
      }
      const checkedNodes = this.nzTreeComponent.getCheckedNodeList();
      if (checkedNodes.length === 0) {
        return;
      }
      const checkedNode = checkedNodes[0];
      const keys = [];
      const getNodes = (parentNode: NzTreeNode) => {
        if (parentNode === null) {
          return;
        }
        keys.push(parentNode.key);
        getNodes(parentNode.parentNode);
      };
      getNodes(checkedNode.parentNode);
      this.defaultExpandedKeys = keys;
    }, 800);
  }
}
