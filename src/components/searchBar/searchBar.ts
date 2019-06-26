import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PopoversService, PopoverContent } from '../../services/popovers/popovers';
import * as Strings from '../../util/strings';
import { NavigatorService } from '../../services/navigator/navigator';
import { SearchService } from '../../services/search/search';

@Component({
  selector: 'search-bar',
  templateUrl: 'searchBar.html'
})
export class SearchBarComponent {
  @Input('showBackButton') public showBackButton: boolean;
  @Input('numberOfProducts') public numberOfProducts: number;
  @Output() public searched: EventEmitter<any> = new EventEmitter<any>();

  public searchString: string;
  public onInitSearchStringCopy: string;

  constructor(private readonly popoversService: PopoversService, private readonly navigatorService: NavigatorService, private readonly searchService: SearchService) { }

  public back(): void {
    this.navigatorService.backButtonAction();
  }

  public ngOnInit(): void {
    if (!this.searchString && !this.searchService.rootSearch) {
      this.searchString = this.searchService.lastSearchString;
    }
    this.onInitSearchStringCopy = this.searchService.lastSearchString;
  }

  public search(): void {

    if (!this.searchString || this.searchString.length < 3) {
      const content: PopoverContent = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.SEARCH_INVALID_INPUT);
      this.popoversService.show(content);
      return;
    }
    this.searchService.lastSearchString = this.searchString;
    this.searched.emit(this.searchString);

    if (this.searchService.rootSearch) {
      this.searchService.rootSearch = false;

      // Optional aestethic fix, without it, the searchString disappears before navigation is done.
      setTimeout(() => {
        this.searchString = '';
      }, 1500);
    }
  }

}
