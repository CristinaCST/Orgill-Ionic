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
  form_order_quantity: string;
  form_type: string;
  order_id: number;
  order_total: string;
  po_number: string;
  ship_date: string;
}

export interface FormDetails {
  form_id: number;
  vendor_id: number;
  vendor_number: string;
  vendor_name: string;
  form_name: string;
  form_type: string;
  vendor_address: string;
  vendor_email: string;
  vendor_phone: string;
  shipment_terms: string;
  special_cash_terms: string;
  prepaid_freight_minimum: number;
  special_minimum_order: number;
  total_special_cost: number;
  savings: number;
  image: string;
  selectedQuantity?: number;
  form_order_quantity?: number;
}

export interface FormItems {
  form_id: number;
  factory_number: string;
  orgill_sku: string;
  description: string;
  upc_code: string;
  unit: string;
  regular_cost: number;
  special_cost: number;
  savings: number;
  min_qty: number;
  selectedQuantity?: number;
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
