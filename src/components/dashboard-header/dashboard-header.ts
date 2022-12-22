import { Component, Input } from '@angular/core';

@Component({
  selector: 'dashboard-header',
  templateUrl: 'dashboard-header.html'
})
export class DashboardHeaderComponent {
  @Input() public pageTitle: string;
}
