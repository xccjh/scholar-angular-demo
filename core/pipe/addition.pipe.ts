import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'welcome' })
export class WelcomePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) { return value; }
    if (typeof value !== 'string') {
      throw new Error('Invalid pipe argument for WelcomePipe');
    }
    return 'Welcome to ' + value;
  }
}
