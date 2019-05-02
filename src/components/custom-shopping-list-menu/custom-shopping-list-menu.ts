import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ShoppingList} from "../../interfaces/models/shopping-list";
import * as Constants from "../../util/constants";
import {PopoversProvider} from "../../providers/popovers/popovers";
import {ShoppingListsProvider} from "../../providers/shopping-lists/shopping-lists";
import {ShoppingListPage} from "../../pages/shopping-list/shopping-list";
import {App, Events} from "ionic-angular";

@Component({
  selector: 'custom-shopping-list-menu',
  templateUrl: 'custom-shopping-list-menu.html'
})
export class CustomShoppingListMenuComponent implements OnInit, OnDestroy {

  @Input('customShoppingLists') customShoppingLists: Array<ShoppingList> = [];
  @Output() back = new EventEmitter<any>();

  constructor(private shoppingListsProvider: ShoppingListsProvider,
              private popoversProvider: PopoversProvider,
              private app: App,
              private events: Events) {
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
            this.shoppingListsProvider.createNewShoppingList(data.listName, data.listDescription, data.type).then(addedList => {
              let list: ShoppingList =
                {
                  id: addedList.insertId,
                  name: data.listName,
                  description: data.listDescription
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
    this.app.getActiveNavs()[0].push(ShoppingListPage, params).catch(err => console.error(err));
  }

  ngOnDestroy(): void {
    this.events.unsubscribe('DeletedList');
  }

  ngOnInit(): void {
    this.events.subscribe('DeletedList', (listId: number) => {
      this.customShoppingLists = this.customShoppingLists.filter(list => list.id != listId);
    })
  }
}
