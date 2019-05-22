import { Injectable } from "@angular/core";
import { NavController, NavOptions, App, Platform} from "ionic-angular";
import * as Equals from "../../util/equality";



//TODO: Implement timer because API has limits!!
@Injectable()
export class NavigatorService {
    private _navController: NavController;  //Store the nav controller reference
    private pageReference: any;
    private backButtonMainMethod: any;
    private overrideMethod: any;

    private get navController() {
        return this._navController ? this._navController : this.app.getActiveNavs()[0];
    }

    private set navController(value) {
        this._navController = value;
    }

    constructor(private app: App, private platform:Platform) {
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
    public push(page: any, params: any = null, opts: NavOptions = null, done: any = null) {

      //  console.log("navigator params:", params);
     //   console.log("navOptions:",opts);

        let pageName = typeof page == "string" ? page : page.name;    //Grab the page name wheter it's directly passed or the entire Page object is passed
        let equals = false;     //We will store if the current view is the same as the last one 


        if (pageName === this.navController.last().name) //If the name equals to the last we mark it 
        {
         
            if (!opts || opts['paramsEquality'] === true) {
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
            //console.log("NEW PAGE:",page);
            this.navController.insert(this.navController.getViews().length - 1, page, params ? params : null, opts ? opts : null, done ? done : null);
            
            //Afterwards, pop this one without animations and return the promise as normal
            return this.navController.pop({ animate: false });
        } else {
         //   console.log("Not equals so=>");
            //If the view is different just proceed to push
            this.pageReference = page;
            return this.navController.push(page, params ? params : null, opts ? opts : null, done ? done : null);
        }


    };

    public pop(opts: NavOptions = null, done: any = null) {
        return this.navController.pop(opts ? opts : null, done ? done : null);
    }

    public setRoot(pageOrViewCtrl: any, params: any = null, opts: NavOptions = null, done:  any = null) {
        //TODO: Check what's happening to reference after setroot!
       /* if( pageOrViewCtrl !instanceof ViewController){
            this.pageReference = pageOrViewCtrl
        }*/
        return this.navController.setRoot(pageOrViewCtrl, params ? params : null, opts ? opts : null, done ? done : null);
    }

    public getNav() {
        return this.navController;
    }

    public performRefresh(){
        let params = this.navController.getActive().getNavParams();
        let opts = {animate:false};
           //Insert this page without animations in the stack before this one with the exact same properties
          this.navController.insert(this.navController.getViews().length - 1, this.pageReference, params ? params : null, opts ? opts : null, null).then(() => {

            //Afterwards, pop this one without animations and return the promise as normal
            this.navController.pop({ animate: false });
        })
    }

    public initializeBackButton(method){
        this.backButtonMainMethod = method;
        this.platform.registerBackButtonAction(method);
    }

    public oneTimeBackButtonOverride(method){
        this.overrideMethod = method;
        this.platform.registerBackButtonAction(()=>{
            method();
            this.platform.registerBackButtonAction(this.backButtonMainMethod);
            this.overrideMethod = undefined;
        });
    }

    public backButtonAction(){
        if(!this.overrideMethod)
        {this.backButtonMainMethod();}
        else{
            this.overrideMethod();
            this.overrideMethod = undefined;
        }
    }
}