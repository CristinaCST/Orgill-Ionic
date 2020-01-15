import { Product } from './product';

export interface ShoppingListItem {
  id?: number;
  product: Product;
  program_number: string;
  quantity: number;
  item_price: number;
  isCheckedInShoppingList?: boolean;
  isExpired?: boolean;
  price?: number;
}
