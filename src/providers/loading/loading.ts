import {Injectable} from '@angular/core';
import {Loading, LoadingController} from "ionic-angular";

@Injectable()
export class LoadingProvider {
  private isLoadingPresent: boolean = false;
  private loading: Loading;

  constructor(private loadingCtrl: LoadingController) {
  }

  presentSimpleLoading() {
    this.loading = this.loadingCtrl.create({
      spinner: 'circles'
    });
    this.loading.present().then(() => this.isLoadingPresent = true).catch(err => console.error(err));
  }

  presentLoading(content) {
    this.loading = this.loadingCtrl.create({
      content: content,
      spinner: 'circles'
    });

    this.loading.present().then(() => this.isLoadingPresent = true).catch(err => console.error(err));
  }

  hideLoading() {
   // if (this.isLoadingPresent === true) {
     if(this.loading){
      this.loading.dismiss().then(() => this.isLoadingPresent = false).catch(err => console.error(err));
     }
     
    //}
  }

}
