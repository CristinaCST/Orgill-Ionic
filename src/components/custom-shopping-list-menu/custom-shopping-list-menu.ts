import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ShoppingList } from '../../interfaces/models/shopping-list';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { PopoversService, CustomListPopoverResult, PopoverContent } from '../../services/popovers/popovers';
import { ShoppingListsProvider } from '../../providers/shopping-lists/shopping-lists';
import { ShoppingListPage } from '../../pages/shopping-list/shopping-list';
import { Events } from 'ionic-angular';
import { NavigatorService } from '../../services/navigator/navigator';
import { ShoppingListResponse } from '../../interfaces/response-body/shopping-list';
import { SearchService } from '../../services/search/search';

@Component({
  selector: 'custom-shopping-list-menu',
  templateUrl: 'custom-shopping-list-menu.html'
})
export class CustomShoppingListMenuComponent implements OnInit, OnDestroy {
  @Input('customShoppingLists') public customShoppingLists: ShoppingList[] = [];
  @Output() public back: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private readonly shoppingListsProvider: ShoppingListsProvider,
    private readonly popoversService: PopoversService,
    private readonly events: Events,
    private readonly navigatorService: NavigatorService,
    private readonly searchService: SearchService
  ) {}

  public backToMainMenu(): void {
    this.back.emit('backToMainMenu');
  }

  // TODO: Why are there 2 methods that do the same thing?
  public addNewList(): void {
    const content: PopoverContent = this.popoversService.setContent(
      Strings.SHOPPING_LIST_NEW_DIALOG_TITLE,
      undefined,
      Strings.MODAL_BUTTON_SAVE,
      undefined,
      Strings.MODAL_BUTTON_CANCEL,
      Constants.POPOVER_NEW_SHOPPING_LIST
    );

    this.popoversService
      .show(content)
      .take(1)
      .subscribe((data: CustomListPopoverResult) => {
        if (data.optionSelected !== 'OK') {
          return;
        }

        if (data && data.listName) {
          this.shoppingListsProvider.checkNameAvailability(data.listName).then(status => {
            if (status === 'available') {
              data.type =
                data.type === 'default' ? Constants.CUSTOM_LIST_DEFAULT_TYPE : Constants.CUSTOM_LIST_MARKET_TYPE;
              this.shoppingListsProvider
                .createNewShoppingList(data.listName, data.listDescription, data.type)
                .subscribe((resp: any) => {
                  const addedList: ShoppingListResponse = resp[0];
                  const list: ShoppingList = {
                    ListID: addedList.shopping_list_id,
                    ListName: addedList.list_name,
                    ListDescription: addedList.list_description,
                    ListType: addedList.list_type
                  };
                  this.customShoppingLists.push(list);

                  if (this.navigatorService.isRootLevel) {
                    this.goToListPage(list);
                  }
                });
            } else {
              const innerContent: PopoverContent = this.popoversService.setContent(
                Strings.GENERIC_MODAL_TITLE,
                Strings.SHOPPING_LIST_NEW_DIALOG_NAME_EXISTS_ERROR
              );
              this.popoversService.show(innerContent);
            }
          });
        }
      });
  }

  public goToListPage(list: ShoppingList): void {
    const params: any = {
      list
    };
    this.searchService.clearText(); // TODO: Workaround
    this.navigatorService.push(ShoppingListPage, params, { paramsEquality: false }).catch(err => console.error(err));
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
