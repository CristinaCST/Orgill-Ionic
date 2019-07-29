import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { HotDealNotification } from '../../interfaces/models/hot-deal-notification';

@Component({
  selector: 'hot-deal',
  templateUrl: 'hot-deal.html'
})

export class HotDealComponent {
  @Input('item') public item: HotDealNotification;
  @Output('clickEvent') public clickEvent: EventEmitter<HotDealNotification> = new EventEmitter<HotDealNotification>();
}
