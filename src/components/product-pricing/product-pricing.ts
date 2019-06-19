import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../../interfaces/models/product';
import { ItemProgram } from '../../interfaces/models/item-program';
import { ProgramProvider } from '../../providers/program/program';

@Component({
  selector: 'product-pricing',
  templateUrl: 'product-pricing.html'
})
export class ProductPricingComponent implements OnInit {
  @Input() public isInShoppingList: boolean = false;
  @Input() public product: Product;
  @Input() public productPrograms: ItemProgram[];
  @Input() public selectedProgram: ItemProgram;
  public selectedProgramNumber: string;

  constructor(private readonly programProvider: ProgramProvider) {}

  public ngOnInit(): void {
    this.selectedProgramNumber = this.selectedProgram.PROGRAM_NO;
    this.programProvider.getSelectedProgram().subscribe(selectedProgram => {
      this.selectedProgramNumber = selectedProgram.PROGRAM_NO;
    });
  }

  public selectProgram(program: ItemProgram): void {
    this.programProvider.selectProgram(program);
  }

}
