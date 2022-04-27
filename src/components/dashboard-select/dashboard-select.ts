import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'dashboard-select',
  templateUrl: 'dashboard-select.html'
})
export class DashboardSelectComponent {
  @Input() public options: string[] = [];
  @Input() public currentSelectedOption: number;
  @Output() public onSelect: EventEmitter<any> = new EventEmitter();

  public isActive: boolean = false;

  public toggleSelectActive(state?: boolean): void {
    this.isActive = state || !this.isActive;
  }

  public handleSelect(index: number): void {
    this.currentSelectedOption = index;

    this.toggleSelectActive(false);

    this.onSelect.emit(index);
  }
}
