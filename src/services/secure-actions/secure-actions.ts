import { Injectable } from "@angular/core";
import { SessionValidatorService } from "../session/sessionValidator";


@Injectable()
export class SecureActionsService {
  private actionQueue = [];

  constructor(private sessionValidatorProvider: SessionValidatorService) { }

  public do(action) {
    if (this.sessionValidatorProvider.isValidSession()) {
      console.log("SECURE ACTION VALID");
      return action();
    } else {
      console.log("SECURE ACTION QUEUED");
      return new Promise((resolve, reject) => {
        resolve(this.actionQueue.push(action));
      });
    }
  }

  public executeQueue() {
    console.log("EXECUTE QUEUE");
    if (this.sessionValidatorProvider.isValidSession()) {
      this.actionQueue.forEach((action) => {
        console.log("EACH ACTION");
        action();
      });
      this.actionQueue = [];
    }
  }

}
