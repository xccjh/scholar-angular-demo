import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalStorageUtil } from '../utils/localstorage.util';
import { AtrReuseStrategy } from '../routereuse/atr-reuse-strategy';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements   CanActivate {

  constructor( private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    // throw new Error("Method not implemented.");
    if ( LocalStorageUtil.getUserId() !== '') {
      return true;
    }
    setTimeout(() => {
      this.router.navigateByUrl('/p/login');
    });
    setTimeout(() =>  AtrReuseStrategy.deleteAll(), 50);
  }

}
