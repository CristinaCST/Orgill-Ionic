import { ShoppingListItem } from './shopping-list-item';

export interface SelectItemEvent {
  product?: ShoppingListItem;
  status: string;
  price?: string;
}
