import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PopoversService, PopoverContent } from '../../services/popovers/popovers';
import * as Strings from '../../util/strings';
import { NavigatorService } from '../../services/navigator/navigator';

@Component({
  selector: 'search-bar',
  templateUrl: 'searchBar.html'
})
export class SearchBarComponent {
  @Input('showBackButton') public showBackButton: boolean;
  @Input('numberOfProducts') public numberOfProducts: number;
  @Input('initialSearchString') public initialSearchString: string;
  @Output() public searched: EventEmitter<any> = new EventEmitter<any>();

  public searchString: string;

  constructor(private readonly popoversProvider: PopoversService, private readonly navigatorService: NavigatorService) { }

  public back(): void {
    this.navigatorService.backButtonAction();
  }

  public search(): void {
    if (!this.searchString || this.searchString.length < 3) {
      const content: PopoverContent = this.popoversProvider.setContent(Strings.GENERIC_MODAL_TITLE, Strings.SEARCH_INVALID_INPUT);
      this.popoversProvider.show(content);
      return;
    }
    this.searched.emit(this.searchString);
  }
}
