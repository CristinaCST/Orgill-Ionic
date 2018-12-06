import {Component, Input} from '@angular/core';
import {App} from "ionic-angular";

@Component({
  selector: 'navbar',
  templateUrl: 'navbar.html'
})
export class NavbarComponent {
  @Input('title') title;
  @Input('isMenuEnabled') isMenuEnabled;
  @Input('isBackEnabled') isBackEnabled;

  constructor(private app: App) {
  }

  back() {
    this.app.getActiveNav().pop();//.then(() => console.log('%cBack from nav bar', 'color:#42f4a1')).catch(err => console.error(err));
  }

}
