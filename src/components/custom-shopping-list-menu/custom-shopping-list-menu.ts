
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ShoppingList } from '../../interfaces/models/shopping-list';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { PopoversService, CustomListPopoverResult } from '../../services/popovers/popovers';
import { ShoppingListsProvider } from '../../providers/shopping-lists/shopping-lists';
import { ShoppingListPage } from '../../pages/shopping-list/shopping-list';
import { Events } from 'ionic-angular';
import { NavigatorService } from '../../services/navigator/navigator';

@Component({
  selector: 'custom-shopping-list-menu',
  templateUrl: 'custom-shopping-list-menu.html'
})
export class CustomShoppingListMenuComponent implements OnInit, OnDestroy {

  @Input('customShoppingLists') public customShoppingLists: ShoppingList[] = [];
  @Output() public back: EventEmitter<any> = new EventEmitter<any>();

  constructor(private readonly shoppingListsProvider: ShoppingListsProvider,
              private readonly popoversProvider: PopoversService,
              private readonly events: Events,
              private readonly navigatorService: NavigatorService) {
  }

  public backToMainMenu() {
    this.back.emit('backToMainMenu');
  }

  public addNewList() {
    const content = this.popoversProvider.setContent(Strings.SHOPPING_LIST_NEW_DIALOG_TITLE, undefined, Strings.MODAL_BUTTON_SAVE, undefined , Strings.MODAL_BUTTON_CANCEL, Constants.POPOVER_NEW_SHOPPING_LIST);

    const subscription = this.popoversProvider.show(content).subscribe((data: CustomListPopoverResult) => {
      if (data && data.listName) {
        this.shoppingListsProvider.checkNameAvailability(data.listName).then(status => {
          if (status === 'available') {
            data.type = data.type === 'default' ? Constants.CUSTOM_SHOPPING_LIST_TYPE : Constants.MARKET_ONLY_CUSTOM_TYPE;
            this.shoppingListsProvider.createNewShoppingList(data.listName, data.listDescription, data.type).subscribe(resp => {
              const addedList = JSON.parse(resp.d)[0];
              const list: ShoppingList = {
                ListID: addedList.shopping_list_id,
                ListName: addedList.list_name,
                ListDescription: addedList.list_description,
                ListType: addedList.list_type
              };
              this.customShoppingLists.push(list);
            });
          } else {
            const innerContent = this.popoversProvider.setContent(Strings.GENERIC_MODAL_TITLE, Strings.SHOPPING_LIST_NEW_DIALOG_NAME_EXISTS_ERROR);
            this.popoversProvider.show(innerContent);
          }
          subscription.unsubscribe();
        });
      }
    });
  }

  public goToListPage(list: ShoppingList) {
    const params = {
      list
    };
    this.navigatorService.push(ShoppingListPage, params).catch(err => console.error(err));
  }

  public ngOnDestroy(): void {
    this.events.unsubscribe('DeletedList');
  }

  public ngOnInit(): void {
    this.events.subscribe('DeletedList', (listId: number) => {
      this.customShoppingLists = this.customShoppingLists.filter(list => list.ListID !== listId);
    });
  }
}
