import {Component, Input, OnInit} from '@angular/core';
import {App} from "ionic-angular";
import {Login} from "../../pages/login/login";
import * as Constants from "../../util/constants";
import {AuthServiceProvider} from "../../providers/authservice/authservice";
import {PopoversProvider} from "../../providers/popovers/popovers";
import {AboutPage} from "../../pages/about/about";
import {CatalogsProvider} from "../../providers/catalogs/catalogs";

@Component({
  selector: 'app-menu',
  templateUrl: 'app-menu.html'
})
export class AppMenuComponent implements OnInit {

  public menuPages = {aboutPage: AboutPage};
  public everyDayPrograms: Array<any> = [];
  public marketOnlyPrograms: Array<any> = [];
  public doorBusterPrograms: Array<any> = [];

  @Input('rootPage') rootPage;

  constructor(private app: App,
              private popoversProvider: PopoversProvider,
              private authServiceProvider: AuthServiceProvider,
              private catalogsProvider: CatalogsProvider) {

  }

  ngOnInit(): void {
    this.getPrograms();
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

  public getPrograms() {
    this.catalogsProvider.getPrograms().subscribe(response => {
      let programs = JSON.parse(response.d);
      programs.map(program => {
        program.MARKETONLY.toUpperCase().includes("Y") ?
          program.NAME.toUpperCase().includes("DOOR BUSTER BOOKING") ?
            this.doorBusterPrograms.push(program) : this.marketOnlyPrograms.push(program) :
          this.everyDayPrograms.push(program);
      })
    })
  }

}
