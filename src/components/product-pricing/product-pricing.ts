import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../../interfaces/models/product';
import { ItemProgram } from '../../interfaces/models/item-program';
import { ProgramProvider } from '../../providers/program/program';

@Component({
  selector: 'product-pricing',
  templateUrl: 'product-pricing.html'
})
export class ProductPricingComponent implements OnInit {
  @Input() public isInShoppingList: boolean = false;  // If the product is viewed from within a shopping list
  @Input() public product: Product;
  @Input() public productPrograms: ItemProgram[]; // Available programs of the product
  @Input() public selectedProgram: ItemProgram; // Current program
  public selectedProgramNumber: string; // Program number of the real-time selected program, used as model for the inputs, do not rely on this if you need old - new values

  constructor(private readonly programProvider: ProgramProvider) {}

  public ngOnInit(): void {
    this.selectedProgramNumber = this.selectedProgram.PROGRAM_NO;
    this.programProvider.getSelectedProgram().subscribe(selectedProgram => {
      this.selectedProgramNumber = selectedProgram.PROGRAM_NO;
    });
  }

  public selectProgram(program: ItemProgram): void {
    if (this.selectedProgram.PROGRAM_NO !== program.PROGRAM_NO) { // Only try to change the program if it's different than the current one
      this.programProvider.selectProgram(program);
    }
  }

}
