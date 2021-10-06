import {Component, OnInit, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {NzTreeComponent, NzFormatEmitEvent, NzTreeNode, NzTreeNodeOptions} from 'ng-zorro-antd/tree';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {timer} from "rxjs";

export type CourseStructureTreeType = 'chapter' | 'section' | 'course-time-division';

export interface NodeChangeEvent {
  type: CourseStructureTreeType;
  data: any;

  [key: string]: any;
}

@Component({
  selector: 'app-course-structure-tree',
  templateUrl: './course-structure-tree.component.html',
  styleUrls: ['./course-structure-tree.component.less']
})
export class CourseStructureTreeComponent implements OnInit {
  nodes: NzTreeNodeOptions[] = [];
  expandedKeys = [];
  selectedKeys = [];
  @Input() coursePacketId: string;
  @Input() defaultSection: any;
  @Input() defaultExpandedKeys = [];
  @Input() chapterSelectable = true;
  @Input() type: 'display' | 'operate' = 'operate'; // display 纯展示  operate 可操作节点
  @Output() nodeChange = new EventEmitter<NodeChangeEvent>();
  @ViewChild('treeVar') treeCom: NzTreeComponent;

  constructor(
    private courseMgService: CourseManageService) {
  }

  ngOnInit(): void {
    this.getChapter();
  }

  nzEvent(evt: NzFormatEmitEvent): void {
    if (evt.eventName === 'click') {
      const node = evt.node;
      const type = node.level === 0 ? 'chapter' : 'section';
      this.sendNodeChange(type, node.origin);
    } else if (evt.eventName === 'expand') {
      const node = evt.node;
      if (node?.getChildren().length === 0 && node?.isExpanded) {
        this.getSection(node);
      }
    }
  }

  getChapter(): void {
    this.courseMgService.getList_courseChapter(this.coursePacketId).subscribe(res => {
      if (res.status === 200) {
        this.nodes = this.transformTreeNodes(res.data, false, 0);
        if (this.nodes.length > 0) {
          if (this.defaultExpandedKeys && this.defaultExpandedKeys.length) {
            setTimeout(() => {
              this.expandedKeys = this.defaultExpandedKeys;
              const treeNode = this.treeCom.getTreeNodeByKey(this.defaultExpandedKeys[0]);
              this.getSection(treeNode);
            }, 400);
          } else {
            this.expandedKeys = [this.nodes[0].id];
            setTimeout(() => {
              const treeNode = this.treeCom.getTreeNodeByKey(this.nodes[0].id);
              this.getSection(treeNode);
            }, 400);
          }
        }
      }
    });
  }

  getSection(node: NzTreeNode): void {
    if (node) {
      node.isLoading = true;
      this.courseMgService.getList_courseSection(node.key).subscribe(res => {
        if (res.status === 200) {
          const childrenNodes = this.transformTreeNodes(res.data, true, node.origin.index);
          node.addChildren(childrenNodes);
          if (this.defaultSection) {
            this.selectedKeys = [this.defaultSection.key];
            this.sendNodeChange('section',  this.defaultSection);
          } else {
            if (childrenNodes.length > 0) {
              this.selectedKeys = [childrenNodes[0].key];
              this.sendNodeChange('section', childrenNodes[0]);
            }
          }
        } else {
          node.isLoading = false;
        }
      });
    }
  }

  transformTreeNodes(nodes: any[], isLeaf: boolean, chapterIdx: number): NzTreeNodeOptions[] {
    return nodes.map((node, index) => {
      return {
        title: !isLeaf ? `第${index + 1}章   ${node.name}` : `${chapterIdx + 1}.${index + 1}节 ${node.name}`,
        key: node.id,
        selectable: !isLeaf ? this.chapterSelectable : true,
        index,
        isLeaf,
        ...node
      };
    });
  }

  sendNodeChange(type: CourseStructureTreeType, data: any) {
    if (type === 'chapter' && !this.chapterSelectable) {
      return;
    }
    this.nodeChange.emit({type, data});
  }

}
