/* eslint-disable no-console */
import { Application } from '@app/app';
import { ALREADY_IN_USE, DATABASE_CONNECTION_ERROR, DATABASE_CONNECTION_SUCCESS, REQUIRED_ELEVATED_PRIVILEGES } from '@common/utils/constants';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Service } from 'typedi';
import { GamesController } from './controllers/games-controller/games.controller';
import { DatabaseService } from './services/database-service/database.service';
import { GameRankingService } from './services/game-ranking-service/game-ranking.service';
import { GameStorageService } from './services/game-storage-service/game-storage.service';
import { MatchManagerService } from './services/match-manager-service/match-manager.service';
import { SocketManager } from './services/socket-manager-service/socket-manager.service';
const baseDix = 10;

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');
    private static readonly baseDix: number = baseDix;
    private server: http.Server;
    private socketManager: SocketManager;

    // eslint-disable-next-line max-params
    constructor(
        private application: Application,
        private databaseService: DatabaseService,
        public matchManagerService: MatchManagerService,
        public rankingService: GameRankingService,
        public gamesController: GamesController,
    ) {}

    private static normalizePort(val: number | string): number | string | boolean {
        const port: number = typeof val === 'string' ? parseInt(val, this.baseDix) : val;
        if (isNaN(port)) {
            return val;
        } else if (port >= 0) {
            return port;
        } else {
            return false;
        }
    }
    async init(): Promise<void> {
        this.application.app.set('port', Server.appPort);

        this.server = http.createServer(this.application.app);

        this.socketManager = new SocketManager(
            this.server,
            this.matchManagerService,
            this.rankingService,
            new GameStorageService(this.databaseService),
        );
        this.gamesController.initializeSocketManager(this.socketManager);
        this.socketManager.handleSockets();

        this.server.listen(Server.appPort);

        this.server.on('error', (error: NodeJS.ErrnoException) => this.onError(error));
        this.server.on('listening', () => this.onListening());

        try {
            await this.databaseService.start();
            this.application.gamesController.gameStorageService = new GameStorageService(this.databaseService);
            console.log(DATABASE_CONNECTION_SUCCESS);
        } catch {
            console.error(DATABASE_CONNECTION_ERROR);
        }
    }

    private onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind: string = typeof Server.appPort === 'string' ? 'Pipe ' + Server.appPort : 'Port ' + Server.appPort;
        switch (error.code) {
            case 'EACCES':
                console.error(bind + REQUIRED_ELEVATED_PRIVILEGES);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ALREADY_IN_USE);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    private onListening(): void {
        const addr = this.server.address() as AddressInfo;
        const bind: string = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
        console.log(`Listening on ${bind}`);
    }
}
