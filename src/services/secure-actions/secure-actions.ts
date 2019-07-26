import { Injectable, Injector } from '@angular/core';

@Injectable()
export class SecureActionsService {
  private actionQueue: any[] = [];
  private authService: any;

  constructor(private readonly injector: Injector) { 
    
    setTimeout(() => this.authService = this.injector.get('AuthService'),1000);
  }


  // TODO: Improve this service

  public do(action: () => void): Promise<any> | void {
    if (this.authService.isValidSession()) {
      return action();
    }
    return new Promise((resolve, reject) => {
      resolve(this.actionQueue.push(action));
    });
  }

  public executeQueue(): void {
    if (this.authService.isValidSession()) {
      this.actionQueue.forEach(action => {
        action();
      });
      this.actionQueue = [];
    }
  }

}
