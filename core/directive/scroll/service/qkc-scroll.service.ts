import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QkcScrollService {

  constructor() { }

  scrollToAnchor(eleId: string) {
    document.getElementById(eleId).scrollIntoView({
      behavior: 'smooth'
    });
  }

}
