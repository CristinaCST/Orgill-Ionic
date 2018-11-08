import {Component, EventEmitter, Output} from '@angular/core';
import {ShoppingList} from "../../interfaces/models/shopping-list";
import * as Constants from "../../util/constants";
import {NavController, NavParams} from "ionic-angular";
import {ProgramProvider} from "../../providers/program/program";
import {PopoversProvider} from "../../providers/popovers/popovers";
import {LoadingProvider} from "../../providers/loading/loading";
import {ShoppingListsProvider} from "../../providers/shopping-lists/shopping-lists";
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'custom-shopping-list-menu',
  templateUrl: 'custom-shopping-list-menu.html'
})
export class CustomShoppingListMenuComponent {

  @Output() back = new EventEmitter<any>();

  constructor(private shoppingListsProvider: ShoppingListsProvider,
              private popoversProvider: PopoversProvider) {
  }
  backToMainMenu() {
    this.back.emit('backToMainMenu');
  }

  addNewList() {
      let content = this.popoversProvider.setContent(Constants.SHOPPING_LIST_NEW_DIALOG_TITLE, undefined, Constants.SAVE, Constants.CANCEL, Constants.POPOVER_NEW_SHOPPING_LIST);
      let subscription = this.popoversProvider.show(content).subscribe(data => {
        if (data && data.listName) {
          this.shoppingListsProvider.checkNameAvailability(data.listName).then(status => {
            if (status === 'available') {
              this.shoppingListsProvider.createNewShoppingList(data.listName, data.description, data.type).then(addedList => {
                let list: ShoppingList =
                  {
                    id: addedList.insertId,
                    name: data.listName,
                    description: data.description
                  };
                this.shoppingLists.push(list);
                this.listForm.value.listOptions = list.id;
              });
            } else {
              let content = this.popoversProvider.setContent(Constants.O_ZONE, Constants.SHOPPING_LIST_NEW_DIALOG_NAME_EXISTS_ERROR);
              this.popoversProvider.show(content);
            }
            subscription.unsubscribe();
          });
        }
      });
  }
}
