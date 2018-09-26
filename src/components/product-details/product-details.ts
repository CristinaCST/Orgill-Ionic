import {Component, Input} from '@angular/core';
import {Product} from "../../interfaces/models/product";
import {NavController} from "ionic-angular";
import {ProductDescriptionPage} from "../../pages/product-description/product-description";

@Component({
  selector: 'product-details',
  templateUrl: 'product-details.html'
})
export class ProductDetailsComponent {

  @Input() product: Product;

  constructor(private navController:NavController) {
  }

  public showProductDescription(){
    this.navController.push(ProductDescriptionPage, {'product': this.product})
  }
}
