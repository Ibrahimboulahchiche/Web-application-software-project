import { HistoryStorageService } from '@app/services/history-storage-service/history-storage.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class HistoryController {
    router: Router;
    constructor(public historyStorageService: HistoryStorageService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/', async (req: Request, res: Response) => {
            try {
                const history = await this.historyStorageService.getAllHistory();
                res.send(JSON.stringify(history));
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });

        this.router.delete('/', async (req: Request, res: Response) => {
            try {
                await this.historyStorageService.wipeHistory();
                res.status(StatusCodes.OK);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });
    }
}
