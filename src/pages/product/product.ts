import {Component, OnInit} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Product} from "../../interfaces/models/product";
import {ProgramProvider} from "../../providers/program/program";
import {ItemProgram} from "../../interfaces/models/item-program";
import {PopoversProvider} from "../../providers/popovers/popovers";
import * as Constants from "../../util/constants";


@Component({
  selector: 'page-product',
  templateUrl: 'product.html',
})
export class ProductPage implements OnInit {
  product: Product;
  subCategoryName: string;
  quantity: number = 0;
  activeTab: string = 'summary_tab';
  productPrograms: Array<ItemProgram> = [];
  programNumber: number;

  constructor(public navController: NavController, public navParams: NavParams,
              private programProvider: ProgramProvider, private popoversProvider: PopoversProvider) {
    this.product = this.navParams.get('product');
    this.programNumber = this.navParams.get('programNumber');
    this.subCategoryName = this.navParams.get('categoryName');
  }

  ngOnInit(): void {
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
        }
        let initialProgram: ItemProgram = this.getInitialProgram();
        this.programProvider.selectProgram(initialProgram);
      }
    })
  }

  getInitialProgram() {
    let programs = this.productPrograms.filter(program => parseInt(program.PROGRAM_NO) === this.programNumber);
    return programs.length > 0 ? programs[0] : this.productPrograms[0];
  }

  close() {
    this.navController.pop();
  }
}
