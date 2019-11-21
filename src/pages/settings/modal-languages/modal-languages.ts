import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the ModalLanguagesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-modal-languages',
  templateUrl: 'modal-languages.html'
})
export class ModalLanguagesPage {

  public languages: any = {
    english: undefined,
    french: true
  };

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public view: ViewController) {
  }

  public ionViewDidLoad(): void {
    console.log('ionViewDidLoad ModalLanguagesPage');
  }

  public closeModal(): void {
    this.view.dismiss();
    console.log(this.languages);
  }

}
