import { Component, OnInit } from '@angular/core';
import { ShoppingList } from '../../interfaces/models/shopping-list';
import { LoadingService } from '../../services/loading/loading';
import { NavigatorService } from '../../services/navigator/navigator';
import { TranslateWrapperService } from '../../services/translate/translate';
import { ShoppingListsProvider } from '../../providers/shopping-lists/shopping-lists';
import { APIResponse } from '../../interfaces/response-body/response';
import { ShoppingListResponse } from '../../interfaces/response-body/shopping-list';
import { ShoppingListPage } from '../../pages/shopping-list/shopping-list';
import { LANDING_PAGE_TITLE } from '../../util/strings';

@Component({
  selector: 'all-shopping-lists',
  templateUrl: 'all-shopping-lists.html'
})
export class AllShoppingLists implements OnInit {
  public mainList: ShoppingList[];
  public pageTitle: string = this.translateProvider.translate(LANDING_PAGE_TITLE);
  private readonly loader: LoadingService;

  constructor(
    public navigatorService: NavigatorService,
    public loadingService: LoadingService,
    public translateProvider: TranslateWrapperService,
    private readonly shoppingListsProvider: ShoppingListsProvider
  ) {
    this.loader = loadingService.createLoader();
    this.getShoppingLists();
  }
  public ngOnInit(): void {}

  public getShoppingLists(): void {
    this.loader.show();
    this.shoppingListsProvider.getAllShoppingLists().subscribe((data: APIResponse) => {
      const shoppingLists: ShoppingListResponse[] = JSON.parse(data.d);
      this.mainList = shoppingLists.map(
        (shoppingList: ShoppingListResponse): ShoppingList => {
          const temp: ShoppingList = {
            ListID: shoppingList.shopping_list_id,
            ListDescription: shoppingList.list_description,
            ListName: shoppingList.list_name,
            ListType: shoppingList.list_type
          };
          return temp;
        }
      );
      this.loader.hide();
    });
  }

  public goToShoppingList(list: ShoppingList): void {
    const params: any = {
      list
    };

    this.navigatorService.push(ShoppingListPage, params).then(
      () => {},
      err => {
        console.error(err);
      }
    );
  }
}
