export interface FormList {
  form_id: number;
  form_name: string;
  form_type: string;
  savings: number;
  total_special_cost: number;
  vendor_id: number;
  vendor_name: number;
  vendor_number: string;
}

export interface SavedorderList {
  customer_name: string;
  customer_number: string;
  form_id: number;
  full_name: string;
  form_order_quantity: string;
  form_type: string;
  number_of_items: string;
  order_id: number;
  order_total: string;
  po_number: string;
  ship_date: string;
  user_name: string;
}

export interface FormDetails {
  form_id: number;
  form_name: string;
  form_type: string;
  image: string | null;
  number_of_items: number;
  prepaid_freight_minimum: string;
  savings: number;
  shipment_terms: string;
  special_cash_terms: string;
  special_minimum_order: string;
  total_special_cost: number;
  vendor_address: string;
  vendor_email: string;
  vendor_id: number;
  vendor_name: string;
  vendor_number: string;
  vendor_phone: string;
  selectedQuantity?: number;
  form_order_quantity?: number;
  item_list?: FormItems[];
}

export interface FormItems {
  description: string;
  factory_number: string;
  form_id: number;
  min_qty: number;
  orgill_sku: string;
  regular_cost: number;
  savings: number;
  special_cost: number;
  unit: string;
  upc_code: string;
  selectedQuantity?: number;
  special_minimum_order?: string;
}

export interface SavedorderItems extends FormItems {
  order_id: number;
  order_qty: number;
}

export interface VendorUserName {
  email_address: string;
  full_name: string;
  user_name: string;
}

export interface CustomerInfoForm {
  customer_number: string;
  selected_user: VendorUserName;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  ship_date: string;
  po_number: string;
}
