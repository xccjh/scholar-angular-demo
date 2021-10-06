import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[exeButtonPress]'
})
export class ExeButtonPressDirective {
  @HostBinding('attr.role') role = 'button';
  @HostBinding('class.pressed') isPressed: boolean;

  @HostListener('mousedown') hasPressed() {
    this.isPressed = true;
  }
  @HostListener('mouseup') hasReleased() {
    this.isPressed = false;
  }
}

// <button ExeButtonPressDirective>按下按钮</button>
