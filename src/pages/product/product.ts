import {Component, OnInit} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Product} from "../../interfaces/models/product";
import {ProgramProvider} from "../../providers/program/program";
import {ItemProgram} from "../../interfaces/models/item-program";
import {PopoversProvider} from "../../providers/popovers/popovers";
import * as Constants from "../../util/constants";
import {AddToShoppingListPage} from "../add-to-shopping-list/add-to-shopping-list";
import {LoadingProvider} from "../../providers/loading/loading";
import {ShoppingListsProvider} from "../../providers/shopping-lists/shopping-lists";

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
  public programName: string;

  public fromShoppingList;
  private shoppingListId;
  private id;
  public quantityFromList;

  constructor(public navController: NavController,
              public navParams: NavParams,
              private loading: LoadingProvider,
              private programProvider: ProgramProvider,
              private popoversProvider: PopoversProvider,
              private shoppingListProvider: ShoppingListsProvider) {
  }

  ngOnInit(): void {
    this.loading.presentSimpleLoading();

    this.product = this.navParams.get('product');
    this.programNumber = this.navParams.get('programNumber');
    this.programName = this.navParams.get('programName');
    this.subCategoryName = this.navParams.get('subcategoryName');

    this.fromShoppingList = this.navParams.get('fromShoppingList');
    if (this.fromShoppingList) {
      this.shoppingListId = this.navParams.get('shoppingListId');
      this.id = this.navParams.get('id');
      this.quantityFromList = this.navParams.get('quantity');
    }

    this.programProvider.getProductPrograms(this.product.SKU).subscribe(programs => {
      if (programs) {
        this.productPrograms = JSON.parse(programs.d);
        if (this.productPrograms.length === 0) {
          let content = this.popoversProvider.setContent(Constants.O_ZONE, Constants.PRODUCT_NOT_AVAILABLE, undefined, Constants.OK, Constants.POPOVER_ERROR);
          this.popoversProvider.show(content);
          this.navController.pop().catch(err => console.error(err));
          return;
        }
        let initialProgram: ItemProgram = this.getInitialProgram();
        this.selectedProgram = initialProgram;
        this.programProvider.selectProgram(initialProgram);
        this.loading.hideLoading();
      }
    });

    this.programProvider.getSelectedProgram().subscribe(selectedProgram => this.selectedProgram = selectedProgram);
  }

  getInitialProgram() {
    let programs = this.productPrograms.filter(program => parseInt(program.PROGRAM_NO) === this.programNumber);
    return programs.length > 0 ? programs[0] : this.productPrograms[0];
  }

  close() {
    this.navController.pop().catch(err => console.error(err));
  }

  addToShoppingList() {
    if (this.product.QTY_ROUND_OPTION === 'Y' && this.isMinimum70percentQuantity()) {
      let content = this.popoversProvider.setContent(Constants.O_ZONE, Constants.Y_SHELF_PACK_QUANTITY_WARNING, undefined, Constants.OK, Constants.Y_SHELF_PACK_QUANTITY_WARNING);
      this.popoversProvider.show(content);
      this.programProvider.setPackQuantity(true);
    } else if (this.product.QTY_ROUND_OPTION === 'X' && this.quantity % Number(this.product.SHELF_PACK) !== 0) {
      let content = this.popoversProvider.setContent(Constants.O_ZONE, Constants.X_SHELF_PACK_QUANTITY_WARNING, undefined, Constants.OK, 'X category');
      this.popoversProvider.show(content);
    } else {
      this.navController.push(AddToShoppingListPage, {
        'product': this.product,
        'quantity': this.quantity,
        'selectedProgram': this.selectedProgram,
        'quantityItemPrice': this.quantityItemPrice
      }).catch(err => console.error(err));
    }
  }

  onQuantityChange($event) {
    this.quantity = $event.quantity;
    this.quantityItemPrice = $event.total;
    this.programProvider.setPackQuantity(false);

    if (this.fromShoppingList) {
      this.shoppingListProvider.updateShoppingListItem(this.id, this.shoppingListId, this.programNumber.toString(), $event.productPrice, this.quantity);
    }
  }

  public isMinimum70percentQuantity(): boolean {
    return this.quantity >= (Number(this.product.SHELF_PACK) * 70 / 100) && this.quantity < Number(this.product.SHELF_PACK);
  }
}
