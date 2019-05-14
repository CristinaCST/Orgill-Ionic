import { Injectable } from "@angular/core";
import { Page, NavOptions, TransitionDoneFn } from "ionic-angular/umd/navigation/nav-util";
import { NavController, ViewController } from "ionic-angular";
import { App } from "ionic-angular";
import * as Equals from "../../util/equality";



//TODO: Implement timer because API has limits!!
@Injectable()
export class NavigatorService {
    private _navController: NavController;  //Store the nav controller reference


    private get navController() {
        return this._navController ? this._navController : this.app.getActiveNavs()[0];
    }

    private set navController(value) {
        this._navController = value;
    }

    constructor(private app: App) {
        this.navController = this.app.getActiveNavs()[0];  //Grab it at construction
    };

    /**TODO: Implemnt refresh boolean?
     * Wrapper for the nav controller Push, this one check if the wanted page is the same and "refreshes" it if not
     * @param page Page as string or Page
     * @param params Parameters for push
     * @param opts NavOptions
     * @param done TransitionDoneFn
     * @param paramEquality Default value true. Should we check for param equality when we check pages?
     */
    public push(page: string | Page, params: any = null, opts: NavOptions = null, done: TransitionDoneFn = null) {



      //  console.log("navigator params:", params);
     //   console.log("navOptions:",opts);

        let pageName = typeof page == "string" ? page : page.name;    //Grab the page name wheter it's directly passed or the entire Page object is passed
        let equals = false;     //We will store if the current view is the same as the last one 


        if (pageName === this.navController.last().name) //If the name equals to the last we mark it 
        {
         
            if (!opts || opts['paramsEquality'] === true || !opts['paramsEquality']) {
                if (Equals.deepIsEqual(params, this.navController.last().data)) {
                    //   console.log("Parms are equal");
                    equals = true;
                }
            } else {
                equals = true;
            }
        }
      //    console.log("LASTPAGENAME: " + this.navController.last().name);
      //   console.log('CURRENTPAGENAME: '+ pageName);

       //    console.log("-----New params: " + JSON.stringify(params));
      //      console.log("-----Last params: " + JSON.stringify(this.navController.last().data));
        

        //If indeed the last view is the current one
        if (equals) {

            //Check if navOptions are set, if not create an empty object
            if (!opts) {
                opts = {};
            }

            opts.animate = false; //Set animate to false so we don't get animations on our "refresh"

            //Insert this page without animations in the stack before this one with the exact same properties
            return this.navController.insert(this.navController.getViews().length - 1, page, params ? params : null, opts ? opts : null, done ? done : null).then(() => {

                //Afterwards, pop this one without animations and return the promise as normal
                return this.navController.pop({ animate: false });
            })
        } else {
         //   console.log("Not equals so=>");
            //If the view is different just proceed to push
            return this.navController.push(page, params ? params : null, opts ? opts : null, done ? done : null);
        }


    };

    public pop(opts: NavOptions = null, done: TransitionDoneFn = null) {
        return this.navController.pop(opts ? opts : null, done ? done : null);
    }

    public setRoot(pageOrViewCtrl: string | ViewController | Page, params: any = null, opts: NavOptions = null, done: TransitionDoneFn = null) {
        return this.navController.setRoot(pageOrViewCtrl, params ? params : null, opts ? opts : null, done ? done : null);
    }

    public getNav() {
        return this.navController;
    }
}