import { GameConstantsService } from '@app/services/game-constants-service/game-constant.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class GameConstantsController {
    router: Router;
    constructor(public gameConstantsService: GameConstantsService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/', async (req: Request, res: Response) => {
            try {
                const constants = this.gameConstantsService.getConstants();
                res.send(JSON.stringify(constants));
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });

        this.router.post('/', (req: Request, res: Response) => {
            try {
                const constants = this.gameConstantsService.updateConstants(req.body);
                res.send(JSON.stringify(constants));
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });
    }
}
