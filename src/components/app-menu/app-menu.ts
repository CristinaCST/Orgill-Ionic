import {Component, Input, OnInit} from '@angular/core';
import {App} from "ionic-angular";
import {Login} from "../../pages/login/login";
import * as Constants from "../../util/constants";
import {AuthServiceProvider} from "../../providers/authservice/authservice";
import {PopoversProvider} from "../../providers/popovers/popovers";
import {AboutPage} from "../../pages/about/about";
import {CatalogsProvider} from "../../providers/catalogs/catalogs";
import {TranslateProvider} from "../../providers/translate/translate";
import {DatabaseProvider} from "../../providers/database/database";
import {ShoppingList} from "../../interfaces/models/shopping-list";
import {Program} from "../../interfaces/models/program";
import {Catalog} from "../../pages/catalog/catalog";
import {ShoppingListPage} from "../../pages/shopping-list/shopping-list";

@Component({
  selector: 'app-menu',
  templateUrl: 'app-menu.html'
})
export class AppMenuComponent implements OnInit {

  public menuPages = {aboutPage: AboutPage,};
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
              private authServiceProvider: AuthServiceProvider,
              private catalogsProvider: CatalogsProvider,
              private translateProvider: TranslateProvider,
              public databaseProvider: DatabaseProvider) {
  }

  ngOnInit(): void {
    this.getPrograms();
    this.getLocalShoppingLists();
  }

  public logout() {
    let content = {
      type: Constants.POPOVER_LOGOUT,
      title: Constants.LOGOUT_TITLE,
      message: Constants.LOGOUT_MESSAGE,
      dismissButtonText: Constants.CANCEL,
      negativeButtonText: Constants.NO,
      positiveButtonText: Constants.OK
    };

    this.popoversProvider.show(content).subscribe((data) => {
      if (data.type === Constants.POPOVER_LOGOUT) {
        if (data.optionSelected === "NO") {
          this.authServiceProvider.logoutDeleteData();
        }
        this.authServiceProvider.logout();
        this.app.getActiveNav().setRoot(Login).then(() => console.log('To Login'));
      }
    });
  }

  public goToPage(page) {
    this.app.getActiveNav().push(page).then(() => console.log('To ', page));
  }

  getLocalShoppingLists() {
    this.databaseProvider.getAllShoppingLists()
      .then(data => {
        if (data) {
          for (let i = 0; i < data.rows.length; i++) {
            let list: ShoppingList = {
              "id": data.rows.item(i).id,
              "name": data.rows.item(i).name,
              "description": data.rows.item(i).description
            };
            if (data.rows.item(i).id == Constants.DEFAULT_LIST_ID || data.rows.item(i).id == Constants.MARKET_ONLY_LIST_ID) {
              this.defaultShoppingLists.push(list)
            }
            else {
              this.customShoppingLists.push(list)
            }
          }
        }
      }).catch(error => console.error(error));
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
      NAME: this.translateProvider.translate(Constants.REGULAR_CATALOG).toUpperCase(),
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
    this.app.getActiveNavs()[0].push(Catalog, params).then(() => console.log('To CatalogPage', params));
  }

  goToListPage(list: ShoppingList) {
    let params = {
      list: list
    };
    this.app.getActiveNavs()[0].push(ShoppingListPage, params);
  }
}
