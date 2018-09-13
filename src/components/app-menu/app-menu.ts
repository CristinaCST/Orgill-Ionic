import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: 'app-menu.html'
})
export class AppMenuComponent {

  public logout() {
    console.log('logout')
  }
}
