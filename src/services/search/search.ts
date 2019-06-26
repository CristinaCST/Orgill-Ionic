import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import * as Constants from '../../util/constants';
import { NavigationEventType } from '../../services/navigator/navigator';


@Injectable()
export class SearchService {
  public lastSearchString: string;

  public rootSearch: boolean = true;

  constructor(private readonly events: Events) {
    this.events.subscribe(Constants.EVENT_NAVIGATE_TO_PAGE, (name: string, evType: NavigationEventType) => {
      if (evType === NavigationEventType.POP || evType === NavigationEventType.SETROOT) {
        this.rootSearch = true;
      }
    });
  }
}
