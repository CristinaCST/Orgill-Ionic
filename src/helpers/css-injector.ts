import { Injectable } from '@angular/core';

@Injectable()
/** CSS injector class, can inject CSS at runtime in the <head> node of the document and can set css variables in realtime
 */
export class CSSInjector {
    private static injectedCSSRef: HTMLStyleElement; // Reference to the new <style> element inserted by the injector or an already existent element if it's the case
    private static cssBlocks: string[] = []; // Css blocks ready to be injected
    private static injected: boolean = false; // Flag to restrict raw CSS injection to only once.

    /**
     * This method sets a css variable value, if it's not already added in <head> it will be added, otherwise it will be modified, don't use any 
     * forbidden characters that would not work in a css file.
     * @param name The name of the variable, without syntactic sugar (--).
     * @param value The value wanted for the variable.
     */
    public static setVar(name: string, value: string): void {
        if (!this.injectedCSSRef) {
            this.injectStyleElement();
            CSSInjector.injectedCSSRef.innerHTML = CSSInjector.injectedCSSRef.innerHTML.concat(':root{}');
        }
        const varRegex = new RegExp('/(--' + name + '.+?(?:;))/');
        const stringifiedVar = '--' + name + ':' + value + ';';
        if (CSSInjector.injectedCSSRef.innerHTML.search(varRegex) > -1) {
            CSSInjector.injectedCSSRef.innerHTML = CSSInjector.injectedCSSRef.innerHTML.replace(varRegex, stringifiedVar);
        } else {
            CSSInjector.injectedCSSRef.innerHTML = CSSInjector.injectedCSSRef.innerHTML.replace(':root{', ':root{' + stringifiedVar);
        }
    }

    /**
     * Adds raw CSS as string to the buffer, to write the entire buffer call injectCSS().
     * This CSS cannot be edited after injecting at this point, but if it contains css variables, if written correctly, can be detected and replaced with values instead of being duplicated.
     * @param rawCSS The css as string
     */
    public static addRawCSS(rawCSS: string): void {
        const sanitizedCSS: string = rawCSS.replace(/(<\/style>)|(<script>)/, ''); // Avoid js injection 
        this.cssBlocks.push(sanitizedCSS);
    }

    /**
     * Injects raw CSS blocks in the <head> tag, it only works once per application run.
     */
    public static injectCSS(): void {
        if (!document.head || this.injected) {
            return;
        }

        const concatString = (accumulator: string, currentValue: string | number | boolean): string => accumulator + currentValue;

        this.injectStyleElement();

        CSSInjector.injectedCSSRef.innerHTML = CSSInjector.injectedCSSRef.innerHTML.concat(this.cssBlocks.reduce(concatString));
        this.injected = true;
    }

    /**
     * Internal function that tries to inject the <style> element in head if it's not already existent
     */
    private static injectStyleElement(): void {
        if (!document.head || this.injectedCSSRef)
        {
            return;
        }

        let styleTags = document.head.getElementsByTagName('style');

        if (!styleTags || !styleTags[0]) {
            CSSInjector.injectedCSSRef = document.head.appendChild(document.createElement('style'));
        }
        else if (styleTags[0]){
            CSSInjector.injectedCSSRef = styleTags[0];
        }
    }
}
