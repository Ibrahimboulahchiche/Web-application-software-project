import { HttpException } from '@app/classes/http-exception-class/http.exception';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';
import * as swaggerJSDoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import { Service } from 'typedi';
import { GameConstantsController } from './controllers/game-constants-controller/game-constants.controller';
import { GamesController } from './controllers/games-controller/games.controller';
import { HistoryController } from './controllers/history-controller/history.controller';
import { ImageProcessingController } from './controllers/image-processing-controller/image-processing.controller';
import { ImageProviderController } from './controllers/image-provider-controller/image-provider.controller';

@Service()
export class Application {
    app: express.Application;
    private readonly internalError: number = StatusCodes.INTERNAL_SERVER_ERROR;
    private readonly swaggerOptions: swaggerJSDoc.Options;

    // eslint-disable-next-line max-params
    constructor(
        private imageProviderController: ImageProviderController,
        private readonly imageProcessingController: ImageProcessingController,
        readonly gamesController: GamesController,
        readonly historyController: HistoryController,
        readonly gameConstantsController: GameConstantsController,
    ) {
        this.app = express();

        this.swaggerOptions = {
            swaggerDefinition: {
                openapi: '3.0.0',
                info: {
                    title: 'Cadriciel Serveur',
                    version: '1.0.0',
                },
            },
            apis: ['**/*.ts'],
        };

        this.config();

        this.bindRoutes();
    }

    bindRoutes(): void {
        this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(this.swaggerOptions)));
        this.app.use('/api/image_processing', this.imageProcessingController.router);
        this.app.use('/api/games', this.gamesController.router);
        this.app.use('/api/images', this.imageProviderController.router);
        this.app.use('/api/history', this.historyController.router);
        this.app.use('/api/game_constants', this.gameConstantsController.router);
        this.app.use('/', (req, res) => {
            res.redirect('/api/docs');
        });
        this.errorHandling();
    }

    private config(): void {
        // Middlewares configuration
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors({ origin: '*' }));
    }

    private errorHandling(): void {
        // When previous handlers have not served a request: path wasn't found
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const err: HttpException = new HttpException('Not Found');
            next(err);
        });

        // development error handler
        // will print stacktrace
        if (this.app.get('env') === 'development') {
            this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        // production error handler
        // no stacktraces  leaked to user (in production env only)
        this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
            res.status(err.status || this.internalError);
            res.send({
                message: err.message,
                error: {},
            });
        });
    }
}
