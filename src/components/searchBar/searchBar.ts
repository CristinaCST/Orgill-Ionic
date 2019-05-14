import {Component, EventEmitter, Input, Output} from '@angular/core';
import {App} from "ionic-angular";
import {PopoversProvider} from "../../providers/popovers/popovers";
import * as Strings from "../../util/strings";
import { NavigatorService } from '../../services/navigator/navigator';

@Component({
  selector: 'search-bar',
  templateUrl: 'searchBar.html'
})
export class SearchBarComponent {
  @Input('showBackButton') showBackButton;
  @Input('numberOfProducts') numberOfProducts;
  @Input('initialSearchString') initialSearchString;
  @Output() searched = new EventEmitter<any>();

  public searchString: string;

  constructor(private app: App,
              private popoversProvider: PopoversProvider, private navigatorService: NavigatorService) {
  }

  back() {
    this.navigatorService.pop().then(
     // () => console.log('%cBack from search bar', 'color:red')
      );
  }

  search() {
    if (!this.searchString || this.searchString.length < 3) {
      let content = this.popoversProvider.setContent(Strings.GENERIC_MODAL_TITLE, Strings.SEARCH_INVALID_INPUT);
      this.popoversProvider.show(content);
      return;
    }
    this.searched.emit(this.searchString);
  }
}
