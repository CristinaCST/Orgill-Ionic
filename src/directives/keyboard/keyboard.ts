import {Directive} from '@angular/core';

@Directive({
  selector: '[keyboardDirective]'
})
export class KeyboardDirective {
  // @HostListener('keyboardDidShow', ['$event.target'])
  // toggleClass() {
  //   console.log('KEYBOARD');
  //   document.querySelector('body').classList.toggle('keyboard-is-open')
  // }

  constructor() {
    window.addEventListener('keyboardDidShow', () => {
      document.body.classList.add('keyboard-is-open');
    });

    window.addEventListener('keyboardDidHide', () => {
      document.body.classList.remove('keyboard-is-open');
    });
  }

}
