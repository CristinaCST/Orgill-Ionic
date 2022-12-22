import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'vendor-header',
  templateUrl: 'vendor-header.html'
})
export class VendorHeaderComponent {
  @Input() public pageTitle: string;
  @Input() public hasMenuBtn: boolean;
  @Input() public hasScanBtn: boolean;
  @Input() public hasSearchBar: boolean;
  @Output() public onScan: EventEmitter<any> = new EventEmitter();
  @Output() public onSearch: EventEmitter<any> = new EventEmitter();

  public handleScan(): void {
    this.onScan.emit();
  }

  public handleSearch(e: string): void {
    this.onSearch.emit(e);
  }
}
