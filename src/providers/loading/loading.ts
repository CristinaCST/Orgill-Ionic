import { Injectable } from '@angular/core';
import {Loading, LoadingController} from "ionic-angular";

@Injectable()
export class LoadingProvider {

  private loading: Loading;

  constructor(private loadingCtrl : LoadingController) {

  }

  presentLoading(content){
    this.loading = this.loadingCtrl.create({
      content: content,
      spinner: 'circles'
    });

    this.loading.present();
  }


  hideLoading(){
    this.loading.dismiss();
  }

}
