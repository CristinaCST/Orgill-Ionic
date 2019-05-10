import {Component, EventEmitter, Input, Output} from '@angular/core';
import {App} from "ionic-angular";
import { NavigatorService } from '../../services/navigator/navigator';

@Component({
  selector: 'navbar',
  templateUrl: 'navbar.html'
})
export class NavbarComponent {
  @Input('title') title;
  @Input('isMenuEnabled') isMenuEnabled;
  @Input('isBackEnabled') isBackEnabled;
  @Input('customButtons') customButtons = [];
  @Output() buttonClicked = new EventEmitter<any>();

  constructor(private app: App, private navigatorService: NavigatorService) {
  }

  back() {
    this.navigatorService.pop().catch(err => console.error(err));
  }

  buttonActions(type) {
    this.buttonClicked.emit({type});
  }
}
