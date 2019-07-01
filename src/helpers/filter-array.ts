/* WIP array filter utility
export function filterArrays(array1: any[], array2: any[], pattern1?: any, pattern2?: any ): void{
    pattern1.keys
    for (let i: number = array1.length - 1; i >= 0; i--) {
        for (let j: number = array2.length - 1; j >= 0; j--) {

            let array1item = pattern1? this.getObjectByPattern(array1[i]): array1[i];
            let array2item = pattern2? this.getObjectByPattern
            if (this.shoppingListItems[i].product.SKU === this.selectedItems[j].product.SKU) {
                this.selectedItems.splice(j, 1);      // Safe splice as we break out of this loop after this if
                this.shoppingListItems.splice(i, 1);  // Safe splice since we iterate from the end
                break;
            }
        }
    }
}

function getObjectByPattern(item: any): any{
    let arrayItem = item;
    let ok: boolean = Object.keys(arrayItem).length>0;

    while(ok){
        const newKeys = Object.keys(arrayItem);
        if (newKeys.length > 0) {
            arrayItem = arrayItem[Object.keys(arrayItem)[0]];
        } else {
            ok = false;
        }
    }
    return arrayItem;
} */
