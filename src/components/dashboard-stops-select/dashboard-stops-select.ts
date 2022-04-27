import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'dashboard-stops-select',
  templateUrl: 'dashboard-stops-select.html'
})
export class DashboardStopsSelectComponent {
  @Input() public options: any = [];
  @Input() public btnText: string;
  @Input() public btnImg: string;
  @Input() public currentSelectedOption: number;
  @Input() public isFilter?: boolean;
  @Output() public onSelect: EventEmitter<any> = new EventEmitter();
  @Output() public onFilter: EventEmitter<any> = new EventEmitter();

  public isActive: boolean = false;

  public keyedin: boolean = false;
  public keyedinTrueSelected: boolean = false;
  public keyedinFalseSelected: boolean = false;

  public visited: boolean = false;
  public visitedTrueSelected: boolean = false;
  public visitedFalseSelected: boolean = false;

  public invoicedate: boolean = false;
  public invoicedateStartValue: string;
  public invoicedateEndValue: string;

  public orderdate: boolean = false;
  public orderdateStartValue: string;
  public orderdateEndValue: string;

  public route: boolean = false;
  public routeValue: string;

  public toggleSelectActive(state?: boolean): void {
    this.isActive = state || !this.isActive;
  }

  public handleSelect(index: number): void {
    this.currentSelectedOption = index;

    this.toggleSelectActive(false);

    this.onSelect.emit(index);
  }

  public handleCheckbox(filter: string, value: string): void {
    if (filter === 'keyedin') {
      this.keyedinTrueSelected = value === 'True' && !this.keyedinTrueSelected;
      this.keyedinFalseSelected = value === 'False' && !this.keyedinFalseSelected;

      this.keyedin = this.keyedinTrueSelected || this.keyedinFalseSelected;
    } else {
      this.visitedTrueSelected = value === 'True' && !this.visitedTrueSelected;
      this.visitedFalseSelected = value === 'False' && !this.visitedFalseSelected;

      this.visited = this.visitedTrueSelected || this.visitedFalseSelected;
    }

    this.handleFilter(
      'checkbox',
      filter,
      value,
      this.keyedinTrueSelected || this.keyedinFalseSelected || this.visitedTrueSelected || this.visitedFalseSelected
    );
  }

  public handleDate(date: any, datepicker: string, isStart?: boolean): void {
    if (datepicker === 'invoicedate') {
      if (isStart) {
        this.invoicedateStartValue = `${date.year}-${date.month}-${date.day}`;
      } else {
        this.invoicedateEndValue = `${date.year}-${date.month}-${date.day}`;
      }

      this.invoicedate = Boolean(this.invoicedateStartValue && this.invoicedateEndValue);
    } else {
      if (isStart) {
        this.orderdateStartValue = `${date.year}-${date.month}-${date.day}`;
      } else {
        this.orderdateEndValue = `${date.year}-${date.month}-${date.day}`;
      }

      this.orderdate = Boolean(this.orderdateStartValue && this.orderdateEndValue);
    }

    if (this.invoicedate || this.orderdate) {
      this.handleFilter(
        'daterange',
        datepicker,
        this.invoicedate
          ? [this.invoicedateStartValue, this.invoicedateEndValue]
          : [this.orderdateStartValue, this.orderdateEndValue]
      );
    }
  }

  public handleRouteInput(value: string): void {
    this.handleFilter('input', 'route', value);
  }

  private handleFilter(type: string, filter: string, data: any, shouldRemove?: boolean): void {
    this.onFilter.emit([type, filter, data, !shouldRemove]);

    this.toggleSelectActive(false);
  }
}
