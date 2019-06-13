import { Injectable } from '@angular/core';
import { SessionValidatorService } from '../session/sessionValidator';


@Injectable()
export class SecureActionsService {
  private actionQueue: any[] = [];

  constructor(private sessionValidatorProvider: SessionValidatorService) { }

  public do(action) {
    if (this.sessionValidatorProvider.isValidSession()) {
      return action();
    } else {
      return new Promise((resolve, reject) => {
        resolve(this.actionQueue.push(action));
      });
    }
  }

  public executeQueue() {
    if (this.sessionValidatorProvider.isValidSession()) {
      this.actionQueue.forEach(action => {
        action();
      });
      this.actionQueue = [];
    }
  }

}
