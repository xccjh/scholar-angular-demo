import {
  Component,
  OnInit,
  Injector,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  NzFormatEmitEvent,
  NzTreeNode,
  NzTreeNodeOptions,
  NzFormatBeforeDropEvent,
  NzMessageService,
} from 'ng-zorro-antd';
import {of, Observable, timer} from 'rxjs';

import {HttpService} from 'core/services/http.service';
import {ToolsUtil} from 'core/utils/tools.util';
// import { isNullOrUndefined } from 'util';
import {NzTreeComponent} from 'ng-zorro-antd/tree';
import {NzModalService} from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-simple-knowledgegraph-tree',
  templateUrl: './simple-knowledgegraph-tree.component.html',
  styleUrls: ['./simple-knowledgegraph-tree.component.less']
})
export class SimpleKnowledgegraphTreeComponent implements OnInit, OnChanges {
// actived node
  activedNode: NzTreeNode;
  isLoading = false;
  isPermittedDrag = false;
  defaultExpandedKeys = ['7990370ca8688e9565b1a9dafebb468a'];
  isDone = '';

  @Input() nodes = [];
  @Input() preview: boolean;
  @Input() professionId: string;
  @Input() all;
  @Input() lack;
  @Input() isDraggable = false;
  @Input() isCustomNode = false;
  @Input() isMultiple = false;
  @Input() isCheckable = false;
  @Input() isShowLine = false;
  @Input() defaultCheckedKeys = [];
  @Input() isExpandAll = true;
  @Input() isShrinkAll = false;
  // 显示的模式
  @Input() model: 'custom' | 'check' | 'click' | '' = '';
  // @Output() nodeChange = new EventEmitter<NzTreeNodeOptions>();
  @Output() nodeChange = new EventEmitter<any>();
  @ViewChild('nzTreeComponent') nzTreeComponent: NzTreeComponent;

  constructor(private injector: Injector, private modal: NzModalService, private message: NzMessageService) {
  }

  ngOnInit() {
    if (this.model === 'custom') {
      this.isDraggable = true;
      this.isCustomNode = true;
      this.isMultiple = false;
      this.isCheckable = false;
      this.isShowLine = true;
    } else if (this.model === 'check') {
      this.isDraggable = false;
      this.isCustomNode = false;
      this.isMultiple = false;
      this.isCheckable = true;
      this.isShowLine = true;
    } else if (this.model === 'click') {
      this.isDraggable = false;
      this.isCustomNode = false;
      this.isMultiple = false;
      this.isCheckable = false;
      this.isShowLine = false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['professionId'] && this.professionId) {
      this.getKnowledgeTree(this.professionId, this.isDone);
    }
  }

  get nzMesService() {
    return this.injector.get(NzMessageService);
  }

  get httpService() {
    return this.injector.get(HttpService);
  }


  nzEvent(evt: NzFormatEmitEvent): void {
    if (evt.eventName === 'click') {
      // 处于编辑状态(不是添加进去的)下，失去焦点时，还原之前的状态
      if (
        this.activedNode &&
        this.activedNode.key !== evt.node.key &&
        this.activedNode.origin.isEdit === true &&
        this.activedNode.key.indexOf('qkc') === -1
      ) {
        this.activedNode.title = this.activedNode.origin.cacheTitle;
        this.activedNode.origin.isEdit = false;
      }
      this.activedNode = evt.node;
      if (this.model === 'click' || this.model === 'custom') {
        this.nodeChange.emit(evt.node.origin);
      }
    } else if (evt.eventName === 'check') {
      if (this.model === 'check') {
        if (this.all) {
          this.nodeChange.emit(evt.checkedKeys);
        } else {
          const ckeckedKeys = this.getCheckedLeafKey(evt.checkedKeys);
          this.nodeChange.emit(ckeckedKeys);
        }
      }
    } else if (evt.eventName === 'dragend') {
      if (this.isPermittedDrag) {
        const postData = this.createSortPostData(evt.node);
        this.sortApiNew(postData).subscribe(
          (res) => {
            if (res.status !== 201) {
              this.nzMesService.error(res.message);
            }
          },
          (error) => {
            this.nzMesService.error(error);
          }
        );
      }
    }
  }

  getCheckedLeafKey(arr: any[]): string[] {
    const keys: string[] = [];
    const recurTree = (checkKeyArr: any[]) => {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < checkKeyArr.length; i++) {
        const node =
          checkKeyArr[i] instanceof NzTreeNode
            ? checkKeyArr[i].origin
            : checkKeyArr[i];
        if (node.children && node.children.length > 0) {
          recurTree(node.children);
        } else {
          if (node.isLeaf && node.checked && (node.kType === '4')) {
            keys.push(node.id);
          }
        }
      }
    };
    recurTree(arr);

    return keys;
  }


  saveNode(node: NzTreeNode) {

  }

  cancelEdit(node: NzTreeNode) {
    node.title = node.origin.cacheTitle;
    if (node.key.indexOf('qkc') !== -1) {
      node.remove();
    }
    node.origin.isEdit = false;
  }

  confirmEdit(node: NzTreeNode) {
    const {editTitle, key} = node.origin;
    if (editTitle === '') {
      this.nzMesService.error('数据不能为空');
      return;
    }

    if (
      this.hasAameTitle(
        editTitle,
        key,
        node.parentNode.origin.children,
        node.level
      )
    ) {
      return;
    }

    node.title = node.origin.editTitle;
    this.saveNode(node);
  }

  hasAameTitle(title, key, nodes, level) {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].cacheTitle === title && key !== nodes[i].key) {
        this.showError(level);
        return true;
      }
    }
    return false;
  }

  showError(level) {
    switch (level) {
      case 0:
        this.nzMesService.error('已存在同名学科');
        break;
      case 1:
        this.nzMesService.error('已存在同名知识模块');
        break;
      case 2:
        this.nzMesService.error('已存在同名知识单元');
        break;
      case 3:
        this.nzMesService.error('已存在同名知识点');
        break;
      default:
        this.nzMesService.error('该名称已存在');
    }
  }

  edit(node: NzTreeNode) {
    node.origin.editTitle = node.title;
    node.origin.isEdit = true;
  }

  delete(node: NzTreeNode) {
    const param = {
      id: node.origin.id,
      kType: node.origin.kType,
    };
    this.delTreeNode(param, node).subscribe(
      (result) => {
        if (result.status === 204) {
          node.remove();
        }
      },
      (error) => {
      }
    );


  }

  warning(node): void {
    const kType = node.origin.kType;
    let text = '';
    if (kType === '2') {
      const unitCount = node.origin.children.length;
      let pointCount = 0;
      // tslint:disable-next-line:prefer-for-of
      for (let index = 0; index < node.origin.children.length; index++) {
        pointCount += node.origin.children[index].children.length || 0;
      }
      text = `删除知识模块，将会导致该知识模块下的${unitCount}个知识单元${pointCount}个知识点一起删除，确定删除？`;
    } else if (kType === '3') {
      const pointCount = node.origin.children.length;
      text = `删除知识单元，将会导致该知识单元下的${pointCount}个知识点一起删除，确定删除？`;
    } else {
      text = `确定删除该知识点？`;
    }

    const config: any = {
      nzTitle: '警告',
      nzContent: text,
      nzCancelText: '取消',
      nzOkText: '确定',
      nzOnOk: () => {
        this.delete(node);
      },
    };

    this.modal.warning(config);
  }

  add(node: NzTreeNode) {
    if (node.children && node.children.length > 0) {
      if (!node.children[node.children.length - 1].origin.cacheTitle) {
        return this.nzMesService.error('请先完成当前节点操作');
      }
    }
    const ktype = node.origin.kType;
    const iconBtn = this.getIconBtnSetting(ktype, node);
    const randomKey = this.createRandomNodeKey();

    const newKType: string = (parseInt(ktype, 10) + 1).toString();

    const treeOpt: NzTreeNodeOptions = {
      title: '',
      editTitle: '',
      key: randomKey,
      isLeaf: true,
      isEdit: true,
      kType: newKType,
      id: '',
      pid: node.origin.id,
      iconBtn,
    };

    node.addChildren([treeOpt]);
  }

  getIconBtnSetting(ktype: string, node: NzTreeNode) {
    let iconBtn = null;

    switch (ktype) {
      case '1':
        node.isLeaf = false;
        node.isExpanded = true;
        iconBtn = {add: true, edit: true, del: true};
        break;
      case '2':
        node.isLeaf = false;
        node.isExpanded = true;
        iconBtn = {add: true, edit: true, del: true};
        break;
      case '3':
        node.isLeaf = false;
        node.isExpanded = true;
        iconBtn = {add: false, edit: true, del: true};
        break;
      default:
        iconBtn = {add: false, edit: false, del: false};
        break;
    }

    return iconBtn;
  }

  createRandomNodeKey(): string {
    return `qkc${new Date().getTime()}`;
  }

  beforeDrop = (arg: NzFormatBeforeDropEvent): Observable<boolean> => {
    const orNode = arg.dragNode.parentNode || arg.node.parentNode;

    let isOk = false;
    if (orNode === null) {
      // 顶层
      isOk = arg.pos === 0 ? false : true;
    } else {
      const andNode = arg.dragNode.parentNode && arg.node.parentNode;
      if (andNode === null) {
        // 顶层与不同的层
        isOk = false;
      } else {
        if (arg.dragNode.parentNode.key === arg.node.parentNode.key) {
          // isOk = true;
          isOk = arg.pos === 0 ? false : true;
        } else {
          isOk = false;
        }
      }
    }
    this.isPermittedDrag = isOk;
    return of(isOk);
  }

  saveTreeNode(param: any, node): Observable<any> {
    return new Observable<any>((observe) => {
      const options = {
        isCommonHttpHeader: true,
      };
      let url;
      const kType = node.origin.kType;
      if (kType === '2') {
        url = 'res/knowledge-module/save';
      } else if (kType === '3') {
        url = 'res/knowledge-unit/save';
        param.knowledgeModuleId = node.parentNode.origin.id;
      } else if (kType === '4') {
        url = 'res/knowledge-point/save';
      }
      this.httpService
        .postBody(url, param, options)
        .subscribe(
          (result) => {
            if (result.status === 201) {
              observe.next(result.data);
              observe.unsubscribe();
            }
          },
          (error) => {
            observe.error(error);
          }
        );
    });
  }

  delTreeNode(param: any, node): Observable<any> {
    return new Observable<any>((observe) => {
      const options = {
        isCommonHttpHeader: true,
      };
      let url;
      if (node.origin.kType === '2') {
        url = 'res/knowledge-module/del/';
      } else if (node.origin.kType === '3') {
        url = 'res/knowledge-unit/del/';
      } else {
        url = 'res/knowledge-point/del/';
      }
      this.httpService
        .get(url + param.id, {}, options)
        .subscribe(
          (result) => {
            observe.next(result);
            observe.unsubscribe();
          },
          (error) => {
            observe.error(error);
          }
        );

    });
  }

  getKnowledgeTree(id: string, isDone): void {
    if (id === null) {
      return;
    }
    const options = {
      isCommonHttpHeader: true,
    };
    this.isDone = isDone;

    const success = (result) => {
      this.isLoading = false;
      if (result.status === 200) {
        this.nodes = ToolsUtil.transformNzTreeNodeOptions([result.data], true, false);
        if (!this.isShrinkAll) {
          if (this.defaultCheckedKeys && this.defaultCheckedKeys.length > 0) {
            this.expandCheckedNode();
          } else if (this.nodes.length > 0) {
            this.defaultExpandedKeys = [this.nodes[0].id];
            if (this.nodes[0].children && this.nodes[0].children.length) {
              this.defaultExpandedKeys.push(this.nodes[0].children[0].id);
            }
          }
        }
      }
    };
    const error = (err) => {
      this.isLoading = false;
    };
    this.isLoading = true;
    if (this.lack) {
      this.httpService
        .get('res/knowledge-module/treeWithLackOfVideo/' + id, {}, options)
        .subscribe(success, error);
    } else {
      this.httpService
        .get('res/knowledge-module/treeModuleUnit/' + id, {}, options)
        .subscribe(success, error);
    }

  }


  sortApiNew(param: any) {
    const options = {
      isCommonHttpHeader: true,
    };
    return this.httpService.postBody(
      'res/knowledge-point/updateSeq',
      param,
      options
    );
  }

  createSortPostData(treeNode: NzTreeNode) {
    const children = !treeNode.parentNode.origin.children
      ? []
      : treeNode.parentNode.origin.children;
    children.forEach((ele, idx) => {
      ele.seq = idx + 1;
    });
    return children.map((ele, idx) => ({
      id: ele.id,
      seq: idx + 1,
      kType: ele.kType,
    }));
  }

  openFolder(data: NzTreeNode | Required<NzFormatEmitEvent>): void {
    // do something if u want
    if (data instanceof NzTreeNode) {
      data.isExpanded = !data.isExpanded;
    } else {
      const node = data.node;
      if (node) {
        node.isExpanded = !node.isExpanded;
      }
    }
  }

  expandCheckedNode() {
    timer(0).subscribe(() => {
      if (!this.nzTreeComponent) {
        return;
      }
      let checkedNodes = this.nzTreeComponent.getCheckedNodeList();
      if (checkedNodes && checkedNodes.length === 0) {
        return;
      }
      if (checkedNodes[0].origin.children && checkedNodes[0].origin.children[0] && checkedNodes[0].origin.children[0].checked) {
        checkedNodes = [checkedNodes[0].getChildren()[0]];
      }
      const checkedNodeO = checkedNodes[0];
      const keys = [];
      const getNodes = (checkedNode: NzTreeNode) => {
        if (checkedNode === null) {
          return;
        }
        keys.push(checkedNode.key);
        if (checkedNode.parentNode === null) {
          return;
        }
        getNodes(checkedNode.parentNode);
      };
      getNodes(checkedNodeO);
      this.defaultExpandedKeys = keys;
    });
  }


  getLength(keyLevel: any) {
    return new Array(keyLevel).fill(0);
  }
}
