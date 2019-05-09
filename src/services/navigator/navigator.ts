import { Injectable } from "@angular/core";
import { Page, NavOptions, TransitionDoneFn } from "ionic-angular/umd/navigation/nav-util";
import { NavController, ViewController } from "ionic-angular";
import { App } from "ionic-angular";



//TODO: Implement timer because API has limits!!
@Injectable()
export class NavigatorService {
    navController: NavController;  //Store the nav controller reference
    constructor(private app: App) {
        this.navController = this.app.getActiveNavs()[0];  //Grab it at construction
    };

    /**TODO: Implemnt refresh boolean?
     * Wrapper for the nav controller Push, this one check if the wanted page is the same and "refreshes" it if not
     * @param page Page as string or Page
     * @param params Parameters for push
     * @param opts NavOptions
     * @param done TransitionDoneFn
     */
    public push(page: string | Page, params: any = null, opts: NavOptions = null, done: TransitionDoneFn = null) {

        console.log("LENGHT" + this.navController.getViews().length);

        let pageName = typeof page == "string" ? page : page.name;    //Grab the page name wheter it's directly passed or the entire Page object is passed
        let equals = false;     //We will store if the current view is the same as the last one 

        if (pageName === this.navController.last().name) //If the name equals to the last we mark it 
        {
            equals = true;
        }

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
}