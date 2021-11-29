import { Injectable } from '@angular/core';
import { ItemProgram } from '../../interfaces/models/item-program';
import { Product } from '../../interfaces/models/product';
import { PopoversService, PopoverContent } from '../popovers/popovers';
import * as Strings from '../../util/strings';
import * as Constants from '../../util/constants';

@Injectable()
export class PricingService {
  constructor(private readonly popoversService: PopoversService) {}

  /**
   * Shows a generic prompt with an OK button and custom message.
   * TODO: Should make a public method out of this... Streamline the entire popover process
   * @param message Message string key or the actuall message
   */
  private showPrompt(message: string): void {
    const content: PopoverContent = {
      type: Constants.PERMISSION_MODAL,
      title: Strings.GENERIC_MODAL_TITLE,
      message,
      positiveButtonText: Strings.MODAL_BUTTON_OK
    };

    this.popoversService.show(content);
  }

  /**
   * Returns the validated quantity and shows popovers depending on the action taken, if it's the case
   * @param suggestedValue - Value that needs validation
   * @param program - The product program, needed for program rules
   * @param product - The product
   * @returns number - a validated quantity or the same if it's ok.
   */
  public validateQuantity(
    suggestedValue: number | string,
    program: ItemProgram,
    product: Product,
    getDefaultMode: boolean = false
  ): number {
    const safeSuggestedValue: number =
      typeof suggestedValue === 'string' ? Number(suggestedValue.replace(/[^0-9]/g, '')) : suggestedValue;
    // let minQty: number = Math.max(1, Number(program.MINQTY));
    // const maxQty: number = Number(program.MAXQTY);
    const shelfPack: number = Number(product.SHELF_PACK);

    // if (product.QTY_ROUND_OPTION === 'X' && shelfPack > 1 && minQty < shelfPack) {
    //   minQty = shelfPack;
    // }

    // if (maxQty > 0 && safeSuggestedValue > maxQty) {
    //   if (!getDefaultMode) {
    //     this.showPrompt(Strings.QUANTITY_ROUNDED_MAX);
    //   }

    //   return Number(program.MAXQTY);
    // }

    // if (safeSuggestedValue < minQty) {
    //   if (!getDefaultMode) {
    //     this.showPrompt(Strings.QUANTITY_ROUNDED_MIN);
    //   }
    //   return minQty;
    // }

    if (product.QTY_ROUND_OPTION === 'X') {
      if (safeSuggestedValue > shelfPack) {
        if (safeSuggestedValue % shelfPack === 0) {
          return this.maxCheck(safeSuggestedValue, program);
        }
        if (!getDefaultMode) {
          this.showPrompt(Strings.QUANTITY_X_WARNING);
        }
        return this.maxCheck(shelfPack * Math.ceil(safeSuggestedValue / shelfPack), program);
      }
      return shelfPack;
    }

    if (product.QTY_ROUND_OPTION === 'Y') {
      if (safeSuggestedValue < Number(product.SHELF_PACK) && safeSuggestedValue >= Number(product.SHELF_PACK) * 0.7) {
        this.showPrompt(Strings.QUANTITY_Y_UNDER_70_PERCENT);
        return Number(product.SHELF_PACK); //maxQty > 0 ? Math.min(maxQty, Number(product.SHELF_PACK)) : Number(product.SHELF_PACK);
      }
      return this.maxCheck(safeSuggestedValue, program);
    }
    return this.maxCheck(safeSuggestedValue, program);
  }

  public maxCheck(value: number, program: ItemProgram): number {
    return value;
    // const maxQty: number = Number(program.MAXQTY);
    // return Math.min(value, maxQty > 0 ? maxQty : Constants.MAX_QUANTITY_HARDCAP);
  }

  /**
   * WARNING: Perform quantity validation before call-in this method.
   * This method returns the price for a known quantity, product and item program.
   * @param quantity - Quantity wanted but it needs to be pre-validated
   * @param product - Product
   */
  public getPrice(quantity: number, product: Product, program: ItemProgram): number {
    const shelfPack: number = Number(product.SHELF_PACK);
    const price: number = Number(program.PRICE);
    return this.getCorrectedPrice(shelfPack, quantity, price, product.QTY_ROUND_OPTION);
  }

  /**
   * WARNING: This method does not check the validity of the unitary item price, please ensure the item price is right.
   * This method is useful when you don't have program data and you know the unitary price.
   * @param quantity - Quantity wanted, it needs to be pre-validated
   * @param product - The product, a Product object
   * @param price - Unitary price.
   */
  public getShoppingListPrice(quantity: number, product: Product, price: number): number {
    const shelfPack: number = Number(product.SHELF_PACK);
    return this.getCorrectedPrice(shelfPack, quantity, price, product.QTY_ROUND_OPTION);
  }

  /**
   * Universal Inner function that calculates the rounded (if needed) price with plain dependencies.
   * @param shelfPack - Thelf pack for the item as a number
   * @param quantity - The quantity wanted
   * @param price - The unitary price for the calculation
   * @param roundOption - The rounding option
   */
  private getCorrectedPrice(shelfPack: number, quantity: number, price: number, roundOption: string = ''): number {
    return quantity < shelfPack && roundOption === 'Y' ? price * quantity + price * 0.04 * quantity : price * quantity;
  }
}
