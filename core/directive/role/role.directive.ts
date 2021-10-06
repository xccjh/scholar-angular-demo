import { Directive, ElementRef, Input, Injector , OnInit, Renderer2, ViewContainerRef, TemplateRef} from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { Router } from '@angular/router';
import { Menu } from 'core/base/menus';

@Directive({
  selector: '[atrRole]'
})
export class AtrRoleDirective implements OnInit {

  private hasView = false;

  @Input('atrRole')
  set atrRole(condition: string) {
    const curPath = this.getRouterUrl();
    this.menuService.getCurMenu(curPath).subscribe(
      result => {
        const curMenu: Menu =  result;
        let isExited = false;
        if (curMenu && curMenu != null && curMenu.operation) {
          const operations = curMenu.operation.split(',');
          for (const operation of operations) {
              if (operation === condition) {
                isExited = true;
                break;
              }
          }
        }
        if (isExited && !this.hasView) {
          this.viewContainer.createEmbeddedView(this.templateRef);
          this.hasView = true;
        } else if (!condition && this.hasView) {
          this.viewContainer.clear();
          this.hasView = false;
        }
      }, error => {

      }
    );
  }


  constructor(
    private injector: Injector,
    private render: Renderer2,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {

  }
  ngOnInit(): void {

  }

  private get menuService(): MenuService {
    return this.injector.get(MenuService);
  }

  private getRouterUrl(): string {
    return this.injector.get(Router).url;
  }
}
