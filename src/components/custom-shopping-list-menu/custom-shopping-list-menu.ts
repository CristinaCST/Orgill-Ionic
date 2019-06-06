
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ShoppingList} from "../../interfaces/models/shopping-list";
import * as Constants from "../../util/constants";
import * as Strings from "../../util/strings";
import {PopoversService} from "../../services/popovers/popovers";
import {ShoppingListsProvider} from "../../providers/shopping-lists/shopping-lists";
import {ShoppingListPage} from "../../pages/shopping-list/shopping-list";
import {App, Events} from "ionic-angular";
import { NavigatorService } from '../../services/navigator/navigator';

@Component({
  selector: 'custom-shopping-list-menu',
  templateUrl: 'custom-shopping-list-menu.html'
})
export class CustomShoppingListMenuComponent implements OnInit, OnDestroy {

  @Input('customShoppingLists') customShoppingLists: Array<ShoppingList> = [];
  @Output() back = new EventEmitter<any>();

  constructor(private shoppingListsProvider: ShoppingListsProvider,
              private popoversProvider: PopoversService,
              private app: App,
              private events: Events,
              private navigatorService: NavigatorService) {
  }

  backToMainMenu() {
    this.back.emit('backToMainMenu');
  }

  addNewList() {
    let content = this.popoversProvider.setContent(Strings.SHOPPING_LIST_NEW_DIALOG_TITLE, undefined, Strings.MODAL_BUTTON_SAVE, Strings.MODAL_BUTTON_CANCEL, Constants.POPOVER_NEW_SHOPPING_LIST);

    let subscription = this.popoversProvider.show(content).subscribe(data => {
      if (data && data.listName) {
        this.shoppingListsProvider.checkNameAvailability(data.listName).then(status => {
          if (status === 'available') {
            if (data.type == 'default'){
              data.type = Constants.CUSTOM_SHOPPING_LIST_TYPE;
            }else{
              data.type = Constants.MARKET_ONLY_CUSTOM_TYPE;
            }
            this.shoppingListsProvider.createNewShoppingList(data.listName, data.listDescription, data.type).subscribe(resp => {
              let addedList = JSON.parse(resp.d)[0];
              let list: ShoppingList =
                {
                  ListID: addedList.shopping_list_id,
                  ListName: addedList.list_name,
                  ListDescription: addedList.list_description,
                  ListType: addedList.list_type
                };
              this.customShoppingLists.push(list);
            });
          } else {
            let content = this.popoversProvider.setContent(Strings.GENERIC_MODAL_TITLE, Strings.SHOPPING_LIST_NEW_DIALOG_NAME_EXISTS_ERROR);
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
    this.navigatorService.push(ShoppingListPage, params).catch(err => console.error(err));
  }

  ngOnDestroy(): void {
    this.events.unsubscribe('DeletedList');
  }

  ngOnInit(): void {
    this.events.subscribe('DeletedList', (listId: number) => {
      this.customShoppingLists = this.customShoppingLists.filter(list => list.ListID != listId);
    })
  }
}
