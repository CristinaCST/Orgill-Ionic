import { Injectable } from '@angular/core';
import { SessionValidatorService } from '../session/sessionValidator';


@Injectable()
export class SecureActionsService {
  private actionQueue: any[] = [];

  constructor(private readonly sessionValidatorProvider: SessionValidatorService) { }

  public do(action: () => void): Promise<any> | void {
    if (this.sessionValidatorProvider.isValidSession()) {
      return action();
    }
    return new Promise((resolve, reject) => {
      resolve(this.actionQueue.push(action));
    });
  }

  public executeQueue(): void {
    if (this.sessionValidatorProvider.isValidSession()) {
      this.actionQueue.forEach(action => {
        action();
      });
      this.actionQueue = [];
    }
  }

}
