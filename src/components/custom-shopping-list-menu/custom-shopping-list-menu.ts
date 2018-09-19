import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'custom-shopping-list-menu',
  templateUrl: 'custom-shopping-list-menu.html'
})
export class CustomShoppingListMenuComponent {

  @Output() back = new EventEmitter<any>();

  constructor() {
  }

  backToMainMenu() {
    this.back.emit('backToMainMenu');
  }
}
