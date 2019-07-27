import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NavigatorService } from '../../services/navigator/navigator';
import { NavbarCustomButton } from '../../interfaces/models/navbar-custom-button';

@Component({
  selector: 'navbar',
  templateUrl: 'navbar.html'
})
export class NavbarComponent {
  @Input('title') public title: string;
  @Input('isMenuEnabled') public isMenuEnabled: boolean;
  @Input('isBackEnabled') public isBackEnabled: boolean;
  @Input('customButtons') public customButtons: NavbarCustomButton[] = [];
  @Output() public buttonClicked: EventEmitter<any> = new EventEmitter<any>();

  constructor(private readonly navigatorService: NavigatorService) {}

  public back(): void {
    this.navigatorService.backButtonAction();
  }

  public buttonActions(action: () => any): void {
    action();
  }
}
