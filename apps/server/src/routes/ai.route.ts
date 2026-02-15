import { Router } from 'express';
import aiController from '@controllers/ai.controller';

class AIRouter {
  public router: Router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', aiController.generateAnswer);
  }
}

export default new AIRouter().router;

