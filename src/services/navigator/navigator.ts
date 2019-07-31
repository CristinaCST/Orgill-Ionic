import { Injectable } from '@angular/core';
import { NavController, NavOptions, App, Platform, Events, NavParams, ViewController, NavControllerBase } from 'ionic-angular';
import * as Equals from '../../helpers/equality';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { BehaviorSubject } from 'rxjs';
import { Page } from 'ionic-angular/navigation/nav-util';
import { Login } from '../../pages/login/login';
import { LoadingService } from '../../services/loading/loading';
import { ErrorScheduler } from '../../services/error-scheduler/error-scheduler';

export enum NavigationEventType{
    POP,
    PUSH,
    SETROOT
}

export interface BackbuttonOverride {
    id: number;
    override(): void;
}

@Injectable()
export class NavigatorService {
    private _navController: NavController;  // Store the nav controller reference
    private backButtonMainFunc: () => void;
    private backButtonOverrides: BackbuttonOverride[] = [];
    private overridesID: number = 0;    // Starting point for overrides ID returned.
    public lastPage: BehaviorSubject<string> = new BehaviorSubject<string>('');
    public lastEvent: NavigationEventType;

    constructor(private readonly app: App,
                private readonly platform: Platform,
                private readonly events: Events,
                private readonly errorScheduler: ErrorScheduler) {
                this.navController = this.app.getActiveNavs()[0];  // Grab it at construction
                this.events.subscribe(Constants.EVENT_INVALID_AUTH, () => {
                    LoadingService.hideAll();
                    this.setRoot(Login);
                    this.errorScheduler.showCustomError(Strings.LOGIN_ERROR_REQUIRED);
                });
                
}
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

            this.announceTransition(NavigationEventType.PUSH, page);
            return this.navController.push(page, params, opts, done);
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
        this.backButtonOverrides = [];
        this.announceTransition(NavigationEventType.SETROOT, pageOrViewCtrl);
        return this.navController.setRoot(pageOrViewCtrl, params, opts, done);
    }

    public performRefresh(): void {
      
        const params: NavParams = this.navController.getActive().getNavParams();
        const opts: { animate: boolean } = { animate: false };
           // Insert this page without animations in the stack before this one with the exact same properties
        this.navController.insert(this.navController.getViews().length - 1, this.navController.getActive().component, params, opts, undefined).then(() => {

            // Afterwards, pop this one without animations and return the promise as normal
            this.navController.pop({ animate: false });
        });
    }

    public initializeBackButton(func: () => void): void {
       
        this.backButtonMainFunc = func;
        this.platform.registerBackButtonAction(() => this.backButtonAction());
    }

    /**
     * One time override for the backbutton
     * @param func Pass a function to be executed once instead of the standard backbutton function
     * @returns number Returns an ID you can and should use to remove a backbutton reference if it was not used directly.
     */
    public oneTimeBackButtonOverride(func: () => void): number {       
        const id: number = this.overridesID++;
        this.backButtonOverrides.push({ id, override: func });
        return id;
    }


    /**
     * Remove the latest override of the backbutton
     */
    public removeOverride(id: number): void {
        if (this.backButtonOverrides.length > 0) {
            const index: number = this.backButtonOverrides.findIndex(elem => elem.id === id);
            if (index > -1) {
                this.backButtonOverrides.splice(index, 1);
            }
        }
    }

    /**
     * Call this to execute the current backbutton action manually, this will consume the override!
     */
    public backButtonAction(id?: number): void {
        if (this.backButtonOverrides.length === 0) {
            this.backButtonMainFunc();
        } else {
            if (id !== undefined) {
                const index: number = this.backButtonOverrides.findIndex(elem => elem.id === id);
                if (index > -1) {
                    this.backButtonOverrides.splice(index, 1)[0].override();
                }
            } else {
                this.backButtonOverrides.pop().override();
            }
        }
    }

    public initialRootPage(page: string | Page): void {
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
