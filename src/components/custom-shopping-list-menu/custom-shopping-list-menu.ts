import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ShoppingList} from "../../interfaces/models/shopping-list";
import * as Constants from "../../util/constants";
import {PopoversProvider} from "../../providers/popovers/popovers";
import {ShoppingListsProvider} from "../../providers/shopping-lists/shopping-lists";
import {App} from "ionic-angular";
import {ShoppingListPage} from "../../pages/shopping-list/shopping-list";

@Component({
  selector: 'custom-shopping-list-menu',
  templateUrl: 'custom-shopping-list-menu.html'
})
export class CustomShoppingListMenuComponent implements OnInit {

  @Output() back = new EventEmitter<any>();
  public customShoppingLists = [];

  constructor(private shoppingListsProvider: ShoppingListsProvider,
              private popoversProvider: PopoversProvider,
              private app: App) {
  }

  ngOnInit(): void {
    this.shoppingListsProvider.getLocalShoppingLists().then(data => {
        if (data.rows.length) {
          for (let i = 0; i < data.rows.length; i++) {
            let list: ShoppingList = {
              "id": data.rows.item(i).id,
              "name": data.rows.item(i).name,
              "description": data.rows.item(i).description
            };
            if (!(data.rows.item(i).id == Constants.DEFAULT_LIST_ID || data.rows.item(i).id == Constants.MARKET_ONLY_LIST_ID)) {
              this.customShoppingLists.push(list);
            }
          }
        }
      }
    );
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
              this.customShoppingLists.push(list);
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

  goToListPage(list: ShoppingList) {
    let params = {
      list: list
    };
    this.app.getActiveNavs()[0].push(ShoppingListPage, params);
  }
}
