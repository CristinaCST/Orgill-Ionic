import { Injectable } from '@angular/core';

@Injectable()
export class CSSInjector {
    private static headReference: HTMLHeadElement;
    private static injectedCSSRef: HTMLStyleElement;

  public static setHead(): void {
      CSSInjector.headReference = document.head;
  }

  public static injectCSS(rawCSS: string): void {

      // Avoid js injection 
      const sanitizedCSS: string = rawCSS.replace('</style>', '').replace('<script>', '');
      if (CSSInjector.headReference) {
          if (!CSSInjector.injectedCSSRef) {
              CSSInjector.injectedCSSRef = CSSInjector.headReference.appendChild(document.createElement('style'));
          }
          CSSInjector.injectedCSSRef.innerHTML = sanitizedCSS;
      }
  }
}
