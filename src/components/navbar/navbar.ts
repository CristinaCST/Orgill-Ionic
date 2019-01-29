import {Component, EventEmitter, Input, Output} from '@angular/core';
import {App} from "ionic-angular";

@Component({
  selector: 'navbar',
  templateUrl: 'navbar.html'
})
export class NavbarComponent {
  @Input('title') title;
  @Input('isMenuEnabled') isMenuEnabled;
  @Input('isBackEnabled') isBackEnabled;
  @Input('showScanButton') showScanButton;
  @Input('customButtons') customButtons = [];
  @Output() buttonClicked = new EventEmitter<any>();

  constructor(private app: App) {
  }

  back() {
    this.app.getActiveNav().pop().catch(err => console.error(err));
  }

  buttonActions(type) {
    this.buttonClicked.emit({type});
  }

  redirectToScan() {
  }
}
