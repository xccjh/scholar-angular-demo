import { Component, OnInit, Injector, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NzFormatEmitEvent, NzTreeNode, NzTreeNodeOptions, NzFormatBeforeDropEvent } from 'ng-zorro-antd';
import { NzMessageService } from 'ng-zorro-antd';
import { of, Observable } from 'rxjs';
import { NzTreeComponent } from 'ng-zorro-antd';
import { HttpService } from 'core/services/http.service';
import { ActivatedRoute } from '@angular/router';
import { CourseManageService } from 'src/app/busi-services/course-manage.service';

@Component({
  selector: 'app-structure-adjust-tree',
  templateUrl: './structure-adjust-tree.component.html',
  styleUrls: ['./structure-adjust-tree.component.less']
})
export class StructureAdjustTreeComponent implements OnInit {

  // actived node
  activedNode: NzTreeNode;

  isLoading = false;

  nodes = [];

  @Input() isDraggable = true;

  // @Output() nodeChange = new EventEmitter<NzTreeNodeOptions>();
  @Output() nodeChange = new EventEmitter<any>();

  courseId = '';
  coursePacketId = '';

  isPermittedDrag = false;

  emptyChapter = [];

  /**
   * 是在添加，章添加跟节添加，不能同时添加
   */
  isAddModel = false;

  expandedKeys: string[] = [];

  isStandard = false;

  @ViewChild('treeVar') treeCom: NzTreeComponent;

  constructor(
    private injector: Injector,
    private route: ActivatedRoute,
    private courseMgService: CourseManageService
  ) { }

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('courseId');
    this.coursePacketId = this.route.snapshot.paramMap.get('id');
    this.isStandard = this.route.snapshot.paramMap.get('status') === '1';
    // this.getCourseChapterTreeNode(this.coursePacketId);
    this.getChapter();
  }

  get nzMesService() {
    return this.injector.get(NzMessageService);
  }

  get httpService() {
    return this.injector.get(HttpService);
  }


  nzEvent(evt: NzFormatEmitEvent): void {
    if (evt.eventName === 'click') {
      if (this.activedNode && this.activedNode.key !== evt.node.key && this.activedNode.origin.isEdit === true) {
        this.activedNode.title = this.activedNode.origin.cacheTitle;
        this.activedNode.origin.isEdit = false;
      }
      this.activedNode = evt.node;
      // if (this.model === 'click' || this.model === 'custom') {
      //   this.nodeChange.emit(evt.node.origin);
      // }
    } else if (evt.eventName === 'dragend') {

      if (this.isPermittedDrag) {
        const treeNodes: NzTreeNode[] = this.treeCom.getTreeNodes();
        const treeOpts = this.resort(treeNodes);
        const postData = this.transformPostTreeData(treeOpts);

        this.courseMgService.save_courseChapter(postData).subscribe(res => {
          // this.nodes = this.transformTreeNodes(res);
          this.renderTree(res);
        },
          error => {

          });
      }
    } else if (evt.eventName === 'expand') {
      this.expandedKeys = evt.keys;
      const node = evt.node;
      if (node?.getChildren().length === 0 && node?.isExpanded) {
        this.getSection(node);
      }
    }
  }

  saveNode(node: NzTreeNode) {
    node.origin.name = node.title;
    const postData = this.transformPostTreeData(this.nodes);
    this.courseMgService.save_courseChapter(postData).subscribe(res => {
      this.renderTree(res.data);
    });
  }


  confirmEdit(node: NzTreeNode) {
    if (node.origin.editTitle.trim() === '') {
      this.nzMesService.error('数据不能为空');
      return;
    }
    const checkList = node.parentNode ? node.parentNode.children : this.nodes;
    if (this.checkRepeatedName(node.origin.editTitle.trim(), checkList, [node.key])) {
      this.isAddModel = false;
      this.nzMesService.error('重复名称');
      return;
    }
    this.isAddModel = false;
    node.title = node.origin.editTitle.trim();
    this.saveNode(node);
  }

  cancelEdit(node: NzTreeNode) {
    this.isAddModel = false;
    node.title = node.origin.cacheTitle;
    if (node.key.indexOf('qkc') !== -1) {
      node.remove();
    }
    node.origin.isEdit = false;
  }

  edit(node: NzTreeNode) {
    node.origin.editTitle = node.title;
    node.origin.isEdit = true;
  }

  delete(node: NzTreeNode) {
    // if (node.level === 0) {
    //   this.nodes = this.nodes.filter(ele => ele.key !== node.key)
    // } else {
    //   node.remove();
    // }

    if (node.origin._level === 1) {
      this.delTreeNode(node.origin.id, 'chapter').subscribe(res => {
        this.getCourseChapterTreeNode(this.coursePacketId);
      });
    } else {
      this.delTreeNode(node.origin.id, 'section').subscribe(res => {
        this.getCourseChapterTreeNode(this.coursePacketId);
      });
    }

  }

  add(node: NzTreeNode) {
    if (!this.isPermitAdd()) {
      return;
    }
    this.isAddModel = true;

    const randomKey = this.createRandomNodeKey();
    const treeOpt: NzTreeNodeOptions = {
      title: '',
      editTitle: '', // 使用这个，因为title是空的话，antd tree默认给一个 --- 值，所以不能用title双向绑定
      key: randomKey,
      isLeaf: true,
      isEdit: true,
      id: '',
      seq: node.children.length + 1,
      name: '',
      _level: node.origin._level + 1
    };
    if (!this.expandedKeys.includes(node.key)) {
      this.expandedKeys = [...this.expandedKeys, node.key];
    }
    node.addChildren([treeOpt]);
  }

  resort(tree: NzTreeNode[]) {
    const tmpOpts: NzTreeNodeOptions[] = [];

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < tree.length; i++) {
      tmpOpts.push(tree[i].origin);
    }
    const recurTree = (nodes: NzTreeNodeOptions[]) => {
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].seq = i + 1;
        if (nodes[i].children && nodes[i].children.length > 0) {
          recurTree(nodes[i].children);
        }
      }
    };

    recurTree(tmpOpts);

    return tmpOpts;
  }

  addChapter({ value }: { value: string, level: string }) {
    if (this.checkRepeatedName(value, this.nodes, [])) {
      this.isAddModel = false;
      this.nzMesService.error('重复名称');
      return;
    }
    this.isAddModel = false;
    const len = this.nodes.length;
    this.courseMgService.save_courseChapter({
      courseId: this.courseId,
      coursePacketId: this.coursePacketId,
      chapters: [
        {
          id: '',
          name: value,
          seq: len + 1
        }
      ]
    }).subscribe(res => {
      // res = res[0];
      // const node: NzTreeNodeOptions = {
      //   title: value,
      //   key: res.id,
      //   isEdit: false,
      //   isLeaf: false,
      //   id: res.id,
      //   ...res
      // };
      // console.log(node);
      // this.nodes = [...this.nodes, node];

      this.getCourseChapterTreeNode(this.coursePacketId);
    });
  }

  createRandomNodeKey(): string {
    return `qkc${new Date().getTime()}`;
  }

  beforeDrop = (arg: NzFormatBeforeDropEvent): Observable<boolean> => {

    const orNode = arg.dragNode.parentNode || arg.node.parentNode;

    let isOk = false;
    if (orNode === null) {// 顶层
      isOk = arg.pos === 0 ? false : true;
    } else {
      const andNode = arg.dragNode.parentNode && arg.node.parentNode;
      if (andNode === null) {// 顶层与不同的层
        isOk = false;
      } else {
        if (arg.dragNode.parentNode.key === arg.node.parentNode.key) {
          isOk = true;
        } else {
          isOk = false;
        }
      }
    }
    this.isPermittedDrag = isOk;
    return of(isOk);
  }


  /**
   * 删除章/pkg/courseChapter/del 参数：id-章id
   * 方视
   * 删除节/pkg/courseSection/del 参数：id-节id
   * 方视
   * 删除节中资源、/pkg/courseSectionResource/del  id-资源记录id
   * 方视
   * 删除节中资源，参数不是资源的id，是这条对应记录的id。不是resourceId
   * @param id id
   * @param type 类型
   */
  delTreeNode(id: string, type: 'chapter' | 'section' | 'secRes' | 'secAllRes'): Observable<any> {
    let url = '';
    switch (type) {
      case 'chapter':
        url = 'pkg/courseChapter/del';
        break;

      case 'section':
        url = 'pkg/courseSection/del';
        break;

      case 'secRes':
        url = 'pkg/courseSectionResource/del';
        break;

      case 'secAllRes':
        url = 'pkg/courseSectionResource/del';
        break;

      default:
        url = '';
    }
    return new Observable<any>(observe => {
      const options = {
        isCommonHttpHeader: true
      };
      if (url === '') {
        observe.error('empty url');
        return;
      }
      this.httpService.post(url, { id }, options).subscribe(
        result => {
          observe.next(result);
          observe.unsubscribe();
        },
        error => {
          observe.error(error);
        }
      );
    });
  }


  getCourseChapterTreeNode(coursePacketId: string): void {
    const options = { isCommonHttpHeader: true };
    this.isLoading = true;
    this.httpService.post('pkg/courseChapter/courseChapterTreeNode', { coursePacketId }, options).subscribe(res => {
      this.isLoading = false;

      if (res.status === 200) {
        this.renderTree(res.data);
      } else {
        this.nodes = [];
      }
    });
  }

  getChapter(): void {
    this.isLoading = true;
    this.courseMgService.getList_courseChapter(this.coursePacketId).subscribe(res => {
      this.isLoading = false;
      if (res.status === 200) {
        this.renderTree(res.data);
      }
    });
  }

  getSection(node: NzTreeNode): void {
    this.courseMgService.getList_courseSection(node.key).subscribe(res => {
      if (res.status === 200) {
        node.addChildren(this.transformSectionTreeNodes(res.data));
      } else {
        node.isLoading = false;
      }
    });
  }

  transformSectionTreeNodes(nodes: any[]): NzTreeNodeOptions[] {
    return nodes.map(node => {
      return {
        title: node.name,
        cacheTitle: node.name,
        key: node.id,
        isEdit: false,
        isLeaf: true,
        _level: 2,
        ...node
      };
    });
  }

  transformTreeNodes(data: any[]): any[] {

    // 初始化第一层
    data = data.map(ele => {
      ele._level = 1;
      return ele;
    });

    const emptyChapter = [];

    const recurTree = (nodes: any[], level: number) => {

      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].title = nodes[i].name;
        nodes[i].cacheTitle = nodes[i].name;
        nodes[i].key = nodes[i].id;
        nodes[i].isEdit = false;

        if (level !== -1) {
          nodes[i]._level = level + 1;
        }

        if (nodes[i].children && nodes[i].children.length > 0) {
          nodes[i].isLeaf = false;
          recurTree(nodes[i].children, nodes[i]._level);
        } else {
          if (nodes[i]._level === 1) {
            nodes[i].isLeaf = false;
            // emptyChapter.push(nodes[i].title);
          } else {
            nodes[i].isLeaf = true;
          }
        }
      }
    };

    recurTree(data, -1);
    this.emptyChapter = emptyChapter;
    return data;
  }

  transformPostTreeData(data: any[]) {
    const postData: any = {
      courseId: this.courseId,
      coursePacketId: this.coursePacketId,
      chapters: [
      ]
    };

    const tmp = [];
    const recurTree = (nodes: any[], parentNode: { [key: string]: any }) => {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < nodes.length; i++) {
        let node = {};
        if (nodes[i]._level === 2) {
          node = {
            id: nodes[i].id,
            name: nodes[i].name,
            seq: nodes[i].seq
          };
          parentNode.sections.push(node);
        } else {
          node = {
            id: nodes[i].id,
            name: nodes[i].name,
            seq: nodes[i].seq,
            sections: []
          };
        }

        if (nodes[i].children && nodes[i].children.length > 0) {
          tmp.push(node);
          recurTree(nodes[i].children, node);
        } else {
          if (nodes[i]._level === 1) {
            tmp.push(node);
          }
        }
      }
    };

    recurTree(data, null);

    postData.chapters = tmp;

    return postData;
  }

  prefessionLabelShowChange(show: boolean) {
    this.isAddModel = show;
  }

  isPermitAdd(): boolean {
    if (this.isAddModel) {
      this.nzMesService.warning('你已经在添加模式了，请处理完在添加！');
      return false;
    } else {
      return true;
    }
  }

  renderTree(data: any[]) {
    this.nodes = this.transformTreeNodes(data);
    this.expandedKeys = [...this.expandedKeys];
  }

  checkStructure(): boolean {
    if (this.nodes.length === 0) {
      return false;
    }
    for (const section of this.nodes) {
      if (section.children && section.children.length === 0) {
        return false;
      }
    }
    return true;
  }

  checkRepeatedName(name: string, nodes: NzTreeNode[], excludeIds: string []) {
    for (const node of nodes) {
      if (!excludeIds.includes(node.key) && node.title === name) {
        return true;
      }
    }
    return false;
   }

}
