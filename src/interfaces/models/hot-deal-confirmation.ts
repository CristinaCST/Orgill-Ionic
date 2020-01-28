import { LocationElement } from './location-element';

export interface HotDealConfirmation {
    SKU: string;
    confirmation: string;
    customer_number: string;
    fullLocation: LocationElement;
    quantity: number;
    ErrorMessage?: string;
}
