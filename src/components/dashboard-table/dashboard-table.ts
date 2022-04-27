import { Component, Input } from '@angular/core';

@Component({
  selector: 'dashboard-table',
  templateUrl: 'dashboard-table.html'
})
export class DashboardTableComponent {
  @Input() public stickyColumn: any;
  @Input() public tableHeaders: any;
  @Input() public tableData: any;
}
