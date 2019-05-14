import { Injectable} from '@angular/core';
import { Loading, LoadingController, Events } from "ionic-angular";

@Injectable()
export class LoadingService {

  private isLoadingPresent: boolean = false;  //Stores wether the loader was actually shown
  private activated: boolean = false;   //Stores wether the loader actually tried to show
  private alreadyExpired: boolean = false;  //Stores wether we tried to hide the loader but was not shown yet
  private loading: Loading;   //Holder for the controller
  static activeQueue: LoadingService[] = [];  //Holds all loading elements across the app
  static activeLoading: LoadingService;   //The current showing loadingService instance
  private instance: boolean = false;  //Is this an instance or the actual service?
  private content: string;  //Content of instanace if it's given

  constructor(private loadingCtrl: LoadingController) { }

  /**
   * Creates and returns a instance of this service
   * @param content Optional text
   * @returns LoadingService instance that expose show() and hide()
   */
  public createLoader(content = null) {
    let newLoader = new LoadingService(this.loadingCtrl);
    newLoader.instance = true;  //We mark the object as an actual instance, this service being an actual instance (can't use instanceof)
    newLoader.content = content;

    //Remove showLoader method on instances (newLoader.showLoader = ()=>{}; works too but the IDE throws errors)
    Object.defineProperty(newLoader, "createLoader", {
      value: () => { console.error("createLoader should not be called on sub instance of LoadingService, only on a main reference."); }
    });

    return newLoader;
  }

  /**
   * Removes a loader from the queue if it's the case and calls the next one if this one was active
   */
  private cleanup() {
    LoadingService.activeLoading = undefined;
    let index = LoadingService.activeQueue.indexOf(this); //Get the position in queue of this loader

    //Check if the object is actually in queue
    if (index > -1) {
      LoadingService.activeQueue.splice(index, 1);  //Remove it from the queue

      if (index == 0) { //If it was the first in queue
        this.next();  //Try to access the next loader if that exists
      }
    }

    //Consistency logic
    this.alreadyExpired = false;
    this.activated = false;
    this.isLoadingPresent = false;
  }

  /**
   * Tries to show a loader, if it's the first in the queue and valid, else it may queue it or just return
   */
  public show() {

    //Check if object is subinstance
    if (!this.instance) {
      console.warn("Don't call show() on the main instance, call it on subinstances");
      return;
    }

    let qIndex = LoadingService.activeQueue.indexOf(this);  //Grab the index of this object in the queue if it exists


    //if the object isn't in queue
    if (qIndex < 0) {
      LoadingService.activeQueue.push(this);    //Add it
      this.next();  //Perform a next check, this will only work if the last active object was removed from the queue
      return;
    }

    //If the loader is already active/activated/queued, just return
    if (this.activated || this.isLoadingPresent || qIndex > 0) {
    //  console.log("Loader already queued/active");
      return;
    }

    //If the loader is expired at the time ofshowing
    if (this.alreadyExpired) {
    //  console.log("Loader is already expired, ignoring show call " + this.content);
      this.cleanup(); //We try to clean it up
      return;
    }

    //At this point we can claim the loader is going to be activated
    this.activated = true;



    //Set up options of the loader
    let spinner = 'circles';
    let options;
    if (this.content) {   //If it has content we pass it, if not we pass just the other options
      options = {
        content: this.content, spinner
      }
    } else {
      options = {
        spinner
      }
    }

    this.loading = this.loadingCtrl.create(options);  //Actually create the loader from the ctrl only when we need to show it

    this.loading.present().then(() => {   //Try to show it
      //console.log("created: " + this.content);
      this.isLoadingPresent = true; //Mark it if it is going to show here so 

      //We subscribe to the event that get's called when a loader leaves, this allows a safe check in hide() method relying on valid data
      this.loading.willLeave.subscribe(()=>{  
        this.isLoadingPresent=false;  //Mark it as not present so it's not being removed twice.
      });


      //Check if it didn't expire during creations
      if (this.alreadyExpired) {
       // console.log("Loader expired during creation");
        this.hide();  //if it did, immediately remove it
      };
    }, (err) => {
      console.error("Error in loader: " + err);
    });
  }

  /**
   * Tries to show the first of the queue if it exists
   */
  private next() {
    if (LoadingService.activeQueue.length > 0) {  //Check if the queue is nonempty
      if (LoadingService.activeLoading != LoadingService.activeQueue[0]) //if the current active item is different than the one at the begginning (e.g.:removed from queue by cleanup)
      {
        //Pick it and try to show it
        LoadingService.activeLoading = LoadingService.activeQueue[0];

        if (LoadingService.activeLoading) {
          LoadingService.activeLoading.show();
        }
      }
    }else{
      LoadingService.activeLoading=null;
    }
  }

  /**
   * Hides / destroys a loader
   */
  public hide() {
    if (this.isLoadingPresent) {    //if the loader is showing
      if (this.loading) { //Check if loading object is valid, this is more of a sanity check, this.LoadingPresent should be the main driver here


        this.loading.dismiss().then(() => {
          this.cleanup(); //If we succesfully dismiss the loader we then destroy it
          this.isLoadingPresent = false;
        }, (err) => {
          console.error("Error dismissing loader with content " + this.content + " | ERR:" + err);
        });
      }
    } else if (LoadingService.activeQueue.indexOf(this) > -1 && !this.activated) {  //If it's not showing but it's in any state to be showing we clean it
      this.cleanup();
    }
    else {
      //Otherwise we mark it as expired and it will return here for cleanup at the right time
      this.alreadyExpired = true;
    }
  }

  /**
   * Hides "all" loaders by emptyin the queue and dismissing the current one
   */
  public static hideAll() {
    LoadingService.activeQueue = [];
    if (LoadingService.activeLoading) {
      LoadingService.activeLoading.hide();
    }
  }
}
