import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Events, MenuController } from 'ionic-angular';
import { Login } from '../../pages/login/login';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { AuthService } from '../../services/auth/auth';
import { PopoversService, DefaultPopoverResult, PopoverContent } from '../../services/popovers/popovers';
import { AboutPage } from '../../pages/about/about';
import { CatalogsProvider } from '../../providers/catalogs/catalogs';
import { TranslateWrapperService } from '../../services/translate/translate';
import { DatabaseProvider } from '../../providers/database/database';
import { ShoppingList } from '../../interfaces/models/shopping-list';

// Pages
import { Program } from '../../interfaces/models/program';
import { Catalog } from '../../pages/catalog/catalog';
import { ScannerPage } from '../../pages/scanner/scanner';
import { ShoppingListPage } from '../../pages/shopping-list/shopping-list';
import { PurchasesPage } from '../../pages/purchases/purchases';
import { ShoppingListsProvider } from '../../providers/shopping-lists/shopping-lists';
import { LocalStorageHelper } from '../../helpers/local-storage';
import { NavigatorService } from '../../services/navigator/navigator';
import { HotDealService } from '../../services/hotdeal/hotdeal';
import { Page } from 'ionic-angular/navigation/nav-util';
import { ShoppingListResponse } from '../../interfaces/response-body/shopping-list';

@Component({
  selector: 'app-menu',
  templateUrl: 'app-menu.html'
})
export class AppMenuComponent implements OnInit {

  public menuPages: any = { aboutPage: AboutPage, pastPurchases: PurchasesPage };
  public everyDayPrograms: Program[] = [];
  public marketOnlyPrograms: Program[] = [];
  public doorBusterPrograms: Program[] = [];
  public defaultShoppingLists: ShoppingList[] = [];
  public customShoppingLists: ShoppingList[] = [];
  public showShoppingListsMenu: boolean = false;
  public hotDealNotification: boolean = false;

  @Input('rootPage') public rootPage: any;
  @Input('menuContent') public menuContent: any;

  constructor(private readonly popoversProvider: PopoversService,
              private readonly authServiceProvider: AuthService,
              private readonly catalogsProvider: CatalogsProvider,
              private readonly translateProvider: TranslateWrapperService,
              private readonly events: Events,
              public databaseProvider: DatabaseProvider,
              public shoppingListsProvider: ShoppingListsProvider,
              private readonly navigatorService: NavigatorService,
              private readonly hotDealService: HotDealService,
              private readonly menuCtrl: MenuController,
              private readonly changeDetector: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    this.getPrograms();
    this.getShoppingLists();
    this.updateHotDealButtonToState();
    this.events.subscribe(Constants.EVENT_HOT_DEAL_NOTIFICATION_RECEIVED, sku => {
      this.updateHotDealButtonToState(sku);
    });

    this.events.subscribe(Constants.HOT_DEAL_EXPIRED_EVENT, () => {
      this.updateHotDealButtonToState();
    });

    this.events.subscribe(Constants.EVENT_NAVIGATE_TO_PAGE, () => {
      this.menuCtrl.close('main_menu');
    });

    this.events.subscribe(Constants.EVENT_NEW_SHOPPING_LIST, () => {
      this.getShoppingLists();
    });
  }

  public menuOpen(): void {
    this.navigatorService.oneTimeBackButtonOverride(() => {
      this.menuCtrl.close('main_menu');
    });
  }

  public menuClose(): void {
  //  this.events.unsubscribe(Constants.EVENT_HOT_DEAL_NOTIFICATION_RECEIVED,this.checkHotDealState);
    this.navigatorService.removeOverride();
  }

  private updateHotDealButtonToState(sku: string = ''): void {
      this.hotDealNotification = this.hotDealService.checkHotDealState(sku);
      this.changeDetector.detectChanges();    
  }

  public logout(): void {
    const content: PopoverContent = {
      type: Constants.POPOVER_LOGOUT,
      title: Strings.LOGOUT_TITLE,
      message: Strings.LOGOUT_MESSAGE,
      dismissButtonText: Strings.MODAL_BUTTON_CANCEL,
      positiveButtonText: Strings.MODAL_BUTTON_YES
    };

    this.popoversProvider.show(content).subscribe((data: DefaultPopoverResult) => {
        if (data.optionSelected === 'OK') {
          // this.authServiceProvider.logoutDeleteData();
          this.authServiceProvider.logout();
          this.navigatorService.setRoot(Login).catch(err => console.error(err));
        }
      }
    );
  }


  public hotDealPage(): void {
    if (this.hotDealService.isHotDealExpired()) {
      this.hotDealNotification = false;
      return;
    }

    const hotDealSku: string = LocalStorageHelper.getFromLocalStorage(Constants.ONE_SIGNAL_HOT_DEAL_SKU_PATH);
    if (hotDealSku) {
      this.hotDealService.navigateToHotDeal(hotDealSku);
    }
  }

  public goToPage(page: string | Page): void {
    // this.navigatorService.push(page).catch(err => console.error(err));
    this.navigatorService.setRoot(page).catch(err => console.error(err));
  }

  public getShoppingLists(): void {
    this.customShoppingLists = [];
    this.shoppingListsProvider.getAllShoppingLists()
      .subscribe(shoppingListsResponse => {
        const shoppingLists: ShoppingListResponse[] = JSON.parse(shoppingListsResponse.d);
        if (shoppingLists.length === 0) {
          this.shoppingListsProvider.createDefaultShoppingLists().subscribe(defaultShoppingListsResponse => {
            this.getShoppingLists();
          });
        } else {
          shoppingLists.map(shoppingList => {
            const temp: ShoppingList = {
              ListID: shoppingList.shopping_list_id,
              ListDescription: shoppingList.list_description,
              ListName: shoppingList.list_name,
              ListType: shoppingList.list_type
            };
            if (shoppingList.list_type === Constants.DEFAULT_LIST_TYPE || shoppingList.list_type === Constants.MARKET_ONLY_LIST_TYPE) {
              this.defaultShoppingLists.push(temp);
              if (shoppingList.list_type === Constants.DEFAULT_LIST_TYPE) {
                LocalStorageHelper.saveToLocalStorage(Constants.DEFAULT_LIST_ID, shoppingList.shopping_list_id);
              } else {
                LocalStorageHelper.saveToLocalStorage(Constants.MARKET_ONLY_LIST_ID, shoppingList.shopping_list_id);
              }
            } else {
              this.customShoppingLists.push(temp);
            }
          });
        }
        this.events.subscribe('DeletedList', (listId: string) => {
          this.customShoppingLists = this.customShoppingLists.filter(list => list.ListID !== listId);
        });
      });
  }

  public getPrograms(): void {
    this.catalogsProvider.getPrograms().subscribe(response => {
      if (response) {
        const programs: Program[] = JSON.parse(response.d) as Program[];
        this.addProgramsToDB(programs);
        programs.map(program => {
          if (program.MARKETONLY.toUpperCase().includes('Y')) {
            if (program.NAME.toUpperCase().includes('DOOR BUSTER BOOKING')) {
              program.NAME.replace('DOOR BUSTER BOOKING', '');
              this.doorBusterPrograms.push(program);
            } else {
              this.marketOnlyPrograms.push(program);
            }
          } else {
            this.everyDayPrograms.push(program);
          }
        });
      }
    });
  }

  public addProgramsToDB(programs: Program[]): void {
    const regularProgram: Program = {
      NAME: this.translateProvider.translate(Strings.REGULAR_CATALOG).toUpperCase(),
      PROGRAMNO: '',
      MARKETONLY: 'N',
      STARTDATE: '01/01/2014',
      ENDDATE: '01/01/2024',
      SHIPDATE: '01/01/2014'
    };
    programs.unshift(regularProgram);
    this.databaseProvider.addPrograms(programs);
  }

  public showCustomShoppingListsMenu(): void {
    this.showShoppingListsMenu = true;
  }

  public onBack($event: string): void {
    if ($event === 'backToMainMenu') {
      this.showShoppingListsMenu = false;
    }
  }

  public showCategories(program: Program): void {
    const params: any = {
      programName: program.NAME,
      programNumber: program.PROGRAMNO
    };


    this.navigatorService.getNav().setRoot(Catalog, params).catch(err => console.error(err));
  }

  public openBarcode(type: string): void {
    // this.navigatorService.push(ScannerPage, {'type': type}).catch(err => console.error(err));
    this.navigatorService.setRoot(ScannerPage, { type }).catch(err => console.error(err));
  }

  public goToListPage(list: ShoppingList): void {
    const params: any = {
      list
    };

    this.navigatorService.setRoot(ShoppingListPage, params).then(() => {
        }, err => {
          console.error(err);
        });
    /*this.navigatorService.push(ShoppingListPage,params).then(()=>{
    },(err)=>{
      console.error(err);
    });*/
  }
}
