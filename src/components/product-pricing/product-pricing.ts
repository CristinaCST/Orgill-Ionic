import {Component, Input, OnInit} from '@angular/core';
import {Product} from "../../interfaces/models/product";
import {ItemProgram} from "../../interfaces/models/item-program";
import {ProgramProvider} from "../../providers/program/program";

@Component({
  selector: 'product-pricing',
  templateUrl: 'product-pricing.html'
})
export class ProductPricingComponent implements OnInit {
  @Input() product: Product;
  @Input() productPrograms: Array<ItemProgram>;
  public selectedProgramNumber;

  constructor(private programProvider: ProgramProvider) {
  }

  ngOnInit(): void {
    this.programProvider.getSelectedProgram().subscribe(selectedProgram => {
      this.selectedProgramNumber = selectedProgram.PROGRAM_NO;
    });
  }

  public selectProgram(program) {
    this.programProvider.selectProgram(program);
  }

}
