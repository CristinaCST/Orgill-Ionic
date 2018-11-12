import { Injectable } from '@angular/core';
import {Product} from "../../interfaces/models/product";
import * as Constants from '../../util/constants';


@Injectable()
export class ProductProvider {


  isYCategoryProduct(product: Product): boolean {
    return product.QTY_ROUND_OPTION === 'Y';
  }

  isXCategoryProduct(product: Product): boolean {
    return product.QTY_ROUND_OPTION === 'X';

  }

  getItemPrice(product: Product, initialPrice: number, quantity: number): number {
    let newPrice = 0;

    if (this.isYCategoryProduct(product) && quantity < Number(product.SHELF_PACK)) {
      newPrice = Number(initialPrice + (initialPrice * 4 / 100));
    } else {
      newPrice = Number(initialPrice);
    }

    return Number(newPrice.toFixed(Constants.DECIMAL_NUMBER));
  }


  protected isProductInList(listId: number, listsThatContainProduct: number[] ): boolean {
    return listsThatContainProduct.indexOf(listId) > -1;
  }






}
