import { NavParams } from 'ionic-angular';

export function getNavParam(navParams: NavParams, propertyName: string, expectedType: string = 'string'): any {
    const param: any = navParams.get(propertyName);
    if (param) {
        if (expectedType !== typeof param) {
            if (typeof param === 'string' && expectedType === 'number') {
                console.warn('Had to cast nav param ' + param.toString() + ' param from string to number');
                return Number(param);
            }
            if (typeof param === 'string' && expectedType === 'boolean') {
                console.warn('Had to cast nav param ' + param + ' from string to boolean');
                return param.toLowerCase() === 'true' ? true : false;
            }
            if (typeof param === 'string' && expectedType === 'object') {
                console.warn('Had to cast nav param ' + param.toString() + ' from string to object');
                return JSON.parse(param);
            }
            if (typeof param !== expectedType && expectedType === 'string' && typeof param !== 'undefined') {
                console.warn('Had to cast nav param ' + param.toString() + 'from ' + typeof param + ' to string');
                return param.toString();
            }

            console.error('Uncastable different type was received, type of navparam: ' + typeof param + ', expected type: ' + expectedType);
            return undefined;
        }
        return param;
    }

    if (expectedType !== 'boolean') { return undefined; }
    return false;
}
