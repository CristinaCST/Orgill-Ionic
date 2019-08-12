import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import * as Constants from '../../util/constants';
import { NavigationEventType } from '../../services/navigator/navigator';


@Injectable()
export class SearchService {
  public _lastSearchString: string;  // Hold last searched string 

  public get lastSearchString(): string {
    return this._lastSearchString;
  }

  public set lastSearchString(value) {
    this._lastSearchString = value;
  }
  public rootSearch: boolean = true; // Is the current searchbar interaction with a root-level searchbar?

  constructor(private readonly events: Events) {
    this.events.subscribe(Constants.EVENT_NAVIGATE_TO_PAGE, (evType: NavigationEventType) => {

      // When we pop or setroot we should mark that any future new searchbar (navigation stack ones are not updated by deafault) will be rootSearch - level 
      if (evType === NavigationEventType.POP || evType === NavigationEventType.SETROOT) {
        this.rootSearch = true;
      }
    });
  }

  // TODO: Remove this! This is a workaround!
  public clearText() {
    this.lastSearchString = '';
    this.rootSearch = true;
  }
}
