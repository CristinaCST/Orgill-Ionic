import {Component, Input, OnInit} from '@angular/core';
import {App, Events} from "ionic-angular";
import {Login} from "../../pages/login/login";
import * as Constants from "../../util/constants";
import * as Strings from '../../util/strings';
import {AuthProvider} from "../../providers/auth/auth";
import {PopoversProvider} from "../../providers/popovers/popovers";
import {AboutPage} from "../../pages/about/about";
import {CatalogsProvider} from "../../providers/catalogs/catalogs";
import {TranslateProvider} from "../../providers/translate/translate";
import {DatabaseProvider} from "../../providers/database/database";
import {ShoppingList} from "../../interfaces/models/shopping-list";

//Pages
import {Program} from "../../interfaces/models/program";
import {Catalog} from "../../pages/catalog/catalog";
import {ScannerPage} from "../../pages/scanner/scanner";
import {ShoppingListPage} from "../../pages/shopping-list/shopping-list";
import {PurchasesPage} from "../../pages/purchases/purchases";
import {ShoppingListsProvider} from "../../providers/shopping-lists/shopping-lists";
import {LocalStorageHelper} from "../../helpers/local-storage";
import { NavigatorService } from '../../services/navigator/navigator';

@Component({
  selector: 'app-menu',
  templateUrl: 'app-menu.html'
})
export class AppMenuComponent implements OnInit {

  public menuPages = {aboutPage: AboutPage, pastPurchases: PurchasesPage};
  public everyDayPrograms: Array<Program> = [];
  public marketOnlyPrograms: Array<Program> = [];
  public doorBusterPrograms: Array<Program> = [];
  public defaultShoppingLists: Array<ShoppingList> = [];
  public customShoppingLists: Array<ShoppingList> = [];
  public showShoppingListsMenu: boolean = false;

  @Input('rootPage') rootPage;
  @Input('menuContent') menuContent;

  constructor(private app: App,
              private popoversProvider: PopoversProvider,
              private authServiceProvider: AuthProvider,
              private catalogsProvider: CatalogsProvider,
              private translateProvider: TranslateProvider,
              private events: Events,
              public databaseProvider: DatabaseProvider,
              public shoppingListsProvider: ShoppingListsProvider,
              private navigatorService: NavigatorService) {
  }

  ngOnInit(): void {
    this.getPrograms();
    this.getShoppingLists();
  }

  public logout() {
    let content = {
      type: Constants.POPOVER_LOGOUT,
      title: Strings.LOGOUT_TITLE,
      message: Strings.LOGOUT_MESSAGE,
      dismissButtonText: Strings.MODAL_BUTTON_CANCEL,
      positiveButtonText: Strings.MODAL_BUTTON_YES
    };

    this.popoversProvider.show(content).subscribe((data) => {
      if (data.optionSelected === "OK") {
        // this.authServiceProvider.logoutDeleteData();
        this.authServiceProvider.logout();
        this.navigatorService.getNav().setRoot(Login).catch(err => console.error(err));
      }
    }
    );
  }

  public goToPage(page) {
    this.navigatorService.push(page).catch(err => console.error(err));
  }

  getShoppingLists() {
    this.shoppingListsProvider.getAllShoppingLists()
      .subscribe(data => {
        let shoppingLists = JSON.parse(data.d);
        if (shoppingLists.length == 0) {
          this.shoppingListsProvider.createDefaultShoppingLists().subscribe(data =>{
            this.getShoppingLists();
          })
        }else {
          shoppingLists.map(shoppingList => {
            let temp : ShoppingList = {
              ListID: shoppingList.shopping_list_id,
              ListDescription: shoppingList.list_description,
              ListName: shoppingList.list_name,
              ListType: shoppingList.list_type,
            }
            if (shoppingList.list_type == Constants.DEFAULT_LIST_TYPE || shoppingList.list_type == Constants.MARKET_ONLY_LIST_TYPE) {
              this.defaultShoppingLists.push(temp)
              if(shoppingList.list_type == Constants.DEFAULT_LIST_TYPE){
                LocalStorageHelper.saveToLocalStorage(Constants.DEFAULT_LIST_ID,shoppingList.shopping_list_id);
              }else{
                LocalStorageHelper.saveToLocalStorage(Constants.MARKET_ONLY_LIST_ID,shoppingList.shopping_list_id);
              }
            }
            else {
              this.customShoppingLists.push(temp)
            }
          });
        }
        this.events.subscribe('DeletedList', (listId: number) => {
          this.customShoppingLists = this.customShoppingLists.filter(list => list.ListID != listId);
         // console.log("this.customshoppinglist after delete",this.customShoppingLists);
        })
      });
  }

  public getPrograms() {
    this.catalogsProvider.getPrograms().subscribe(response => {
      if (response) {
        let programs = JSON.parse(response.d);
        this.addProgramsToDB(programs);
        programs.map(program => {
          if (program.MARKETONLY.toUpperCase().includes("Y")) {
            if (program.NAME.toUpperCase().includes("DOOR BUSTER BOOKING")) {
              program.NAME.replace("DOOR BUSTER BOOKING", "");
              this.doorBusterPrograms.push(program);
            }
            else {
              this.marketOnlyPrograms.push(program)
            }
          }
          else {
            this.everyDayPrograms.push(program);
          }
        })
      }
    })
  }

  addProgramsToDB(programs) {
    let regularProgram = {
      NAME: this.translateProvider.translate(Strings.REGULAR_CATALOG).toUpperCase(),
      PROGRAMNO: "",
      MARKETONLY: "N",
      STARTDATE: "01/01/2014",
      ENDDATE: "01/01/2024",
      SHIPDATE: "01/01/2014",
    };
    programs.unshift(regularProgram);
    this.databaseProvider.addPrograms(programs);
  }

  showCustomShoppingListsMenu() {
    this.showShoppingListsMenu = true;
  }

  public onBack($event) {
    if ($event === 'backToMainMenu') {
      this.showShoppingListsMenu = false;
    }
  }

  showCategories(program) {
    let params = {
      'programName': program.NAME,
      'programNumber': program.PROGRAMNO
    };


    this.navigatorService.getNav().setRoot(Catalog, params).catch(err => console.error(err));
  }

  openBarcode(type) {
    this.navigatorService.push(ScannerPage, {'type': type}).catch(err => console.error(err));
  }

  goToListPage(list: ShoppingList) {
    let params = {
      list: list
    };


    this.navigatorService.push(ShoppingListPage,params).then(()=>{
  //    console.log("ALL OK");
    },(err)=>{
      console.error(err);
    });
  }
}
