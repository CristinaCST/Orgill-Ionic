import { Component, Input } from '@angular/core';

@Component({
  selector: 'pog-list',
  templateUrl: 'pog-list.html'
})
export class POGlistComponent {
  @Input() public data: any;
}
