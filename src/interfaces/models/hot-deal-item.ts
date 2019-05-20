import { LocationElement } from "./location-element";
import { ItemProgram } from "./item-program";

export interface HotDealItem {
  ITEM: any;
  LOCATIONS: LocationElement;
  PROGRAM: ItemProgram;
  TOTAL_QUANTITY: number;
}
