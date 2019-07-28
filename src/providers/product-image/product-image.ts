import { Injectable } from '@angular/core';
import * as Constants from '../../util/constants';
import * as ConstantsUrl from '../../util/constants-url';

@Injectable()
export class ProductImageProvider {

    public getImageURL(SKU: string): Promise<string> {
        const mainURL: string = ConstantsUrl.PRODUCT_IMAGE_BASE_URL + SKU + '.JPG';
        const fallbackURL: string = Constants.LOCAL_PRODUCT_IMAGE_PLACEHOLDER;
        return new Promise(resolve => {
            const img: HTMLImageElement = new Image();
            img.addEventListener('load', e => resolve(img.src));
            img.onerror = () => {
                img.src = fallbackURL;
                resolve(img.src);
            };
            img.src = mainURL;
        });
    }

}
