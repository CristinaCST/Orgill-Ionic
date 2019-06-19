import { LocationElement } from './location-element';
import { ItemProgram } from './item-program';
import { Product } from './product';

export interface HotDealItem {
  ITEM: Product;
  LOCATIONS: LocationElement[];
  PROGRAM: ItemProgram;
  TOTAL_QUANTITY: number;
}
