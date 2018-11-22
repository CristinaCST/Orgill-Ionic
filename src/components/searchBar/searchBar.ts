import {Component, EventEmitter, Input, Output} from '@angular/core';
import {App} from "ionic-angular";

@Component({
  selector: 'search-bar',
  templateUrl: 'searchBar.html'
})
export class SearchBarComponent {
  @Input('showBackButton') showBackButton;
  @Output() searched = new EventEmitter<any>();

  public searchString: string;

  constructor(private app: App) {
  }

  back() {
    this.app.getActiveNav().pop().then(() => console.log('%cBack from search bar', 'color:red'));
  }

  search() {
    this.searched.emit(this.searchString);
  }
}
