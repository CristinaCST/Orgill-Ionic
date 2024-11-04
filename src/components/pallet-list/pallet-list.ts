import { Component, Input } from '@angular/core';

@Component({
  selector: 'pallet-list',
  templateUrl: 'pallet-list.html'
})
export class PalletListComponent {
  @Input() public data: any;
}
