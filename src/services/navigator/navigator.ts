import { Injectable } from '@angular/core';
import { NavController, NavOptions, App, Platform, Events, NavParams, ViewController } from 'ionic-angular';
import * as Equals from '../../helpers/equality';
import { SecureActionsService } from '../../services/secure-actions/secure-actions';
import * as Constants from '../../util/constants';
import { BehaviorSubject } from 'rxjs';
import { Page } from 'ionic-angular/navigation/nav-util';
import { NavControllerBase } from 'ionic-angular/navigation/nav-controller-base';

export enum NavigationEventType{
    POP,
    PUSH,
    SETROOT
}

@Injectable()
export class NavigatorService {
    private _navController: NavController;  // Store the nav controller reference
    private pageReference: Page | string;
    private backButtonMainFunc: () => void;
    private overrideFunc: () => void;
    public lastPage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    public lastEvent: NavigationEventType;

    /**
     * Tries to return the cached navController or gets it and returns it.
     */
    private get navController(): NavController {

        if (!this._navController) {
            const firstNav: NavControllerBase = this.app.getActiveNavs()[0];
            this._navController = firstNav;
            return firstNav;
        }
        return this._navController;
    }

    /**
     * Sets the cached value of navController
     */
    private set navController(value: NavController) {
        this._navController = value;
    }

    /**
     * Exposes inner navController.canGoBack()
     */
    public get canGoBack(): boolean {
        return this.navController.canGoBack();
    }

    /**
     * Returns true if there is only 1 page in navigation stack.
     */
    public get isRootLevel(): boolean {
        return this.navController.getViews().length <= 1;
    }

    constructor(private readonly app: App, private readonly platform: Platform, private readonly secureActions: SecureActionsService, private readonly events: Events) {
        this.navController = this.app.getActiveNavs()[0];  // Grab it at construction
    }

    /**
     * Wrapper for the nav controller Push, this one check if the wanted page is the same and "refreshes" it if not
     * @param page Page
     * @param params Parameters for push
     * @param opts NavOptions
     * @param done TransitionDoneFn
     * @param paramEquality Default value true. Should we check for param equality when we check pages?
     */
    public push(page: Page, params?: any, opts?: NavOptions & { paramsEquality?: boolean }, done?: () => void): Promise<any> {

        let equals: boolean = false;     // We will store if the current view is the same as the last one

        const lastPage: ViewController = this.navController.last();
        if (lastPage && lastPage.component === page) {

            if (!opts || opts.paramsEquality) {
                if (Equals.deepIsEqual(params, lastPage.data)) {
                    equals = true;
                }
            } else {
                equals = true;
            }
        }


            // If indeed the last view is the current one
        if (equals) {

                // Check if navOptions are set, if not create an empty object
                if (!opts) {
                    opts = {};
                }

                opts.animate = false; // Set animate to false so we don't get animations on our "refresh"

              //  return this.secureActions.do(() => {
                    // Insert this page without animations in the stack before this one with the exact same properties
                this.navController.insert(this.navController.getViews().length - 1, page, params, opts, done);

                    // Afterwards, pop this one without animations and return the promise as normal
                return this.navController.pop({ animate: false });
              //  });

            } 

        this.pageReference = page;

        return this.secureActions.do(() => {
            this.announceTransition(NavigationEventType.PUSH, page);
            return this.navController.push(page, params, opts, done);
        }) as Promise<any>;
    }

    public pop(opts?: NavOptions, done?: () => void): Promise<any> {
        this.announceTransition(NavigationEventType.POP);
        return this.navController.pop(opts, done);
    }

    public setRoot(pageOrViewCtrl: any, params?: any, opts?: NavOptions, done?: () => void): Promise<any> {
        // TODO: Check what's happening to reference after setroot!
       /* if( pageOrViewCtrl !instanceof ViewController){
            this.pageReference = pageOrViewCtrl
        }*/
        this.announceTransition(NavigationEventType.SETROOT, pageOrViewCtrl);
        return this.navController.setRoot(pageOrViewCtrl, params, opts, done);
    }

    public performRefresh(): void {
        const params: NavParams = this.navController.getActive().getNavParams();
        const opts: { animate: boolean } = { animate: false };
           // Insert this page without animations in the stack before this one with the exact same properties
        this.navController.insert(this.navController.getViews().length - 1, this.pageReference, params, opts, undefined).then(() => {

            // Afterwards, pop this one without animations and return the promise as normal
            this.navController.pop({ animate: false });
        });
    }

    public initializeBackButton(func: () => void): void {
        this.backButtonMainFunc = func;
        this.platform.registerBackButtonAction(func);
    }

    /**
     * One time override for the backbutton
     * @param func Pass a function to be executed once instead of the standard backbutton function
     */
    public oneTimeBackButtonOverride(func: () => void): void {
        this.overrideFunc = func;
        this.platform.registerBackButtonAction(() => {
            func();
            this.platform.registerBackButtonAction(this.backButtonMainFunc);
            this.overrideFunc = undefined;
        });
    }


    /**
     * Remove the current override of the backbutton
     */
    public removeOverride(): void {
        this.platform.registerBackButtonAction(this.backButtonMainFunc);
        this.overrideFunc = undefined;
    }

    /**
     * Call this to execute the current backbutton action manually, this will consume the override!
     */
    public backButtonAction(): void {
        if (!this.overrideFunc) { this.backButtonMainFunc(); } else {
            this.overrideFunc();
            this.platform.registerBackButtonAction(this.backButtonMainFunc);
            this.overrideFunc = undefined;
        }
    }

    public initialRootPage(page: string | Page): void {
        // this.announceTransition(page);
        const name: string = typeof page === 'string' ? page : page.name;
        this.lastPage.next(name);
      }

    private announceTransition(navType: NavigationEventType, newPage?: string | Page): void {
        const name: string = newPage ? (typeof newPage === 'string' ? newPage : newPage.name) : this.lastPage.getValue();
        this.events.publish(Constants.EVENT_NAVIGATE_TO_PAGE, name, navType);
        this.lastEvent = navType;
        this.lastPage.next(name);
    }
}
