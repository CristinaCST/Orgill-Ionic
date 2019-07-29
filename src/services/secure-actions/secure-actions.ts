import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../interfaces/models/user';

@Injectable()
export class SecureActionsService {

    private _authState: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private user: User;

    public get authState(): Observable<boolean>{
        return this._authState;
    }

    public setAuthState(state: boolean, user?: User) {
        this.user = user ? user : undefined;
        this._authState.next(state);
        
    }

    public waitForAuth(): Observable<User> {
        return this._authState.filter(val => val).take(1).map((elem) => {   // Poor man's inclusive takeWhile() that's only available in rxjs6
            return this.user;
        });
    }
}
