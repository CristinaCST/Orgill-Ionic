import { Injectable } from "@angular/core";
import { NavController, NavOptions, App, Platform, Events} from "ionic-angular";
import * as Equals from "../../util/equality";
import { SecureActionsService } from "../../services/secure-actions/secure-actions";
import * as Constants from "../../util/constants";
import { BehaviorSubject } from "rxjs";


@Injectable()
export class NavigatorService {
    private _navController: NavController;  //Store the nav controller reference
    private pageReference: any;
    private backButtonMainFunc: any;
    private overrideFunc: any;
    public lastPage: BehaviorSubject<string> = new BehaviorSubject<string>("");

    private get navController() {
        return this._navController ? this._navController : this.app.getActiveNavs()[0];
    }

    private set navController(value) {
        this._navController = value;
    }

    constructor(private app: App, private platform:Platform, private secureActions: SecureActionsService, private events: Events) {
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
    public push(page: any, params: any = undefined, opts: NavOptions = undefined, done: any = undefined) {

        this.events.publish(Constants.EVENT_HIDE_MENU_FROM_NAVIGATION);

        let pageName = typeof page == "string" ? page : page.name;    //Grab the page name wheter it's directly passed or the entire Page object is passed
        let equals = false;     //We will store if the current view is the same as the last one 


       
        let lastPage = this.navController.last();
        if (lastPage && lastPage.name && pageName === lastPage.name) //If the name equals to the last we mark it 
        {

            if (!opts || opts['paramsEquality'] === true) {
                if (Equals.deepIsEqual(params, lastPage.data)) {
                    equals = true;
                }
            } else {
                equals = true;
            }
        }


            //If indeed the last view is the current one
            if (equals) {

                //Check if navOptions are set, if not create an empty object
                if (!opts) {
                    opts = {};
                }

                opts.animate = false; //Set animate to false so we don't get animations on our "refresh"

              //  return this.secureActions.do(() => {
                    //Insert this page without animations in the stack before this one with the exact same properties
                    this.navController.insert(this.navController.getViews().length - 1, page, params, opts, done);

                    //Afterwards, pop this one without animations and return the promise as normal
                    return this.navController.pop({ animate: false });
              //  });

            } else {
                //If the view is different just proceed to push

                this.pageReference = page;

                return this.secureActions.do(() => {
                    this.announceTransition(page);
                    return this.navController.push(page, params, opts, done);
                });
            }
        


    };

    public pop(opts: NavOptions = undefined, done: any = undefined) {
        return this.navController.pop(opts, done);
    }

    public setRoot(pageOrViewCtrl: any, params: any = undefined, opts: NavOptions = undefined, done:  any = undefined) {
        //TODO: Check what's happening to reference after setroot!
       /* if( pageOrViewCtrl !instanceof ViewController){
            this.pageReference = pageOrViewCtrl
        }*/
        this.announceTransition(pageOrViewCtrl);
        return this.navController.setRoot(pageOrViewCtrl, params, opts, done);
    }

    public getNav() {
        return this.navController;
    }

    public performRefresh(){
        let params = this.navController.getActive().getNavParams();
        let opts = {animate:false};
           //Insert this page without animations in the stack before this one with the exact same properties
          this.navController.insert(this.navController.getViews().length - 1, this.pageReference, params, opts, undefined).then(() => {

            //Afterwards, pop this one without animations and return the promise as normal
            this.navController.pop({ animate: false });
        })
    }

    public initializeBackButton(func){
        this.backButtonMainFunc = func;
        this.platform.registerBackButtonAction(func);
    }

    /**
     * One time override for the backbutton
     * @param func Pass a function to be executed once instead of the standard backbutton function
     */
    public oneTimeBackButtonOverride(func){
        this.overrideFunc = func;
        this.platform.registerBackButtonAction(()=>{
            func();
            this.platform.registerBackButtonAction(this.backButtonMainFunc);
            this.overrideFunc = undefined;
        });
    }


    /**
     * Remove the current override of the backbutton
     */
    public removeOverride(){
        this.platform.registerBackButtonAction(this.backButtonMainFunc);
        this.overrideFunc = undefined;
    }

    /**
     * Call this to execute the current backbutton action manually, this will consume the override!
     */
    public backButtonAction() {
        if (!this.overrideFunc) { this.backButtonMainFunc(); }
        else {
            this.overrideFunc();
            this.platform.registerBackButtonAction(this.backButtonMainFunc);
            this.overrideFunc = undefined;
        }
    }
    public initialRootPage(page){
        this.announceTransition(page);
      }

    private announceTransition(newPage){
        let name = typeof newPage == "string"?newPage:newPage.name;

        this.events.publish(Constants.EVENT_NAVIGATE_TO_PAGE, name);
        this.lastPage.next(name);
    }
}