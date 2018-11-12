import {Component, OnInit} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Product} from "../../interfaces/models/product";
import {TranslateProvider} from "../../providers/translate/translate";
import {ItemProgram} from "../../interfaces/models/item-program";

@Component({
  selector: 'page-product-details',
  templateUrl: 'product-details.html',
})
export class ProductDetailsPage implements  OnInit{

  product: Product;
  programNumber: string;
  isAddButtonVisible: boolean;
  quantity: number;
  productPrograms: ItemProgram[];
  selectedProgram: ItemProgram;
  currentPrice: number;


  constructor(public navCtrl: NavController, public navParams: NavParams, public translator : TranslateProvider) {
    this.product = this.navParams.get('selectedProduct');
    this.programNumber = this.navParams.get('fromProgramNumber');
    this.quantity = this.navParams.get('currentQuantity');
    this.currentPrice = Number(this.product.YOURCOST);
    }


  ngOnInit() {
    //this.getProductPrograms();

  }

}
