import {Component, OnInit} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Product} from "../../interfaces/models/product";
import {ProgramProvider} from "../../providers/program/program";
import {ItemProgram} from "../../interfaces/models/item-program";
import {PopoversProvider} from "../../providers/popovers/popovers";
import * as Constants from "../../util/constants";
import {AddToShoppingListPage} from "../add-to-shopping-list/add-to-shopping-list";

@Component({
  selector: 'page-product',
  templateUrl: 'product.html',
})
export class ProductPage implements OnInit {
  public product: Product;
  public quantity: number = 1;
  public subCategoryName: string;
  public activeTab: string = 'summary_tab';
  public productPrograms: Array<ItemProgram> = [];
  public programNumber: number;
  public selectedProgram: ItemProgram;
  public quantityItemPrice: number = 0;

  constructor(public navController: NavController, public navParams: NavParams,
              private programProvider: ProgramProvider, private popoversProvider: PopoversProvider) {
  }

  ngOnInit(): void {
    this.product = this.navParams.get('product');
    this.programNumber = this.navParams.get('programNumber');
    this.subCategoryName = this.navParams.get('categoryName');

    this.programProvider.getProductPrograms(this.product.SKU).subscribe(programs => {
      if (programs) {
        this.productPrograms = JSON.parse(programs.d);
        if (this.productPrograms.length === 0) {
          let content = {
            type: Constants.POPOVER_ERROR,
            title: Constants.O_ZONE,
            message: Constants.PRODUCT_NOT_AVAILABLE,
            dismissButtonText: Constants.OK
          };
          this.popoversProvider.show(content);
          this.navController.pop();
          return;
        }
        let initialProgram: ItemProgram = this.getInitialProgram();
        this.selectedProgram = initialProgram;
        this.programProvider.selectProgram(initialProgram);
      }
    });

    this.programProvider.getSelectedProgram().subscribe(selectedProgram => this.selectedProgram = selectedProgram);
  }



  getInitialProgram() {
    let programs = this.productPrograms.filter(program => parseInt(program.PROGRAM_NO) === this.programNumber);
    return programs.length > 0 ? programs[0] : this.productPrograms[0];
  }

  close() {
    this.navController.pop();
  }

  addToShoppingList() {
    if (this.product.QTY_ROUND_OPTION === 'Y' && this.isMinimum70percentQuantity()) {
      let content = {
        type: Constants.Y_SHELF_PACK_QUANTITY_WARNING,
        title: Constants.O_ZONE,
        message: Constants.Y_SHELF_PACK_QUANTITY_WARNING,
        dismissButtonText: Constants.OK
      };
      this.popoversProvider.show(content);
      this.programProvider.setPackQuantity(true);
    } else if (this.product.QTY_ROUND_OPTION === 'X' && this.quantity % Number(this.product.SHELF_PACK) !== 0) {
      let content = {
        type: 'X category',
        title: Constants.O_ZONE,
        message: Constants.X_SHELF_PACK_QUANTITY_WARNING,
        dismissButtonText: Constants.OK
      };
      this.popoversProvider.show(content);
    } else {
      this.navController.push(AddToShoppingListPage, {
        'product': this.product,
        'quantity': this.quantity,
        'selectedProgram': this.selectedProgram,
        'quantityItemPrice': this.quantityItemPrice
      });
    }
  }

  onQuantityChange($event) {
    this.quantity = $event.quantity;
    this.quantityItemPrice = $event.total;
    this.programProvider.setPackQuantity(false);
  }

  public isMinimum70percentQuantity(): boolean {
    return this.quantity >= (Number(this.product.SHELF_PACK) * 70 / 100) && this.quantity < Number(this.product.SHELF_PACK);
  }
}
