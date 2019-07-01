import { Injectable } from '@angular/core';

@Injectable()
export class CSSInjector {
    private static headReference: HTMLHeadElement;
    private static injectedCSSRef: HTMLStyleElement;

  public static setHead(): void {
      this.headReference = document.head;
  }

  public static injectCSS(rawCSS: string): void {

      // Avoid js injection 
      const sanitizedCSS = rawCSS.replace("</style>", "").replace("<script>", "");
      if (this.headReference) {
          if (!this.injectedCSSRef) {
              this.injectedCSSRef = this.headReference.appendChild(document.createElement('style'));
          }
          this.injectedCSSRef.innerHTML = sanitizedCSS;
      }
  }
}
