import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
    let service: HistoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CommunicationService],
        });
        service = TestBed.inject(HistoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('convertGameModeToString should return the correct string', () => {
        const gameMode = 0;
        expect(service.convertGameModeToString(gameMode)).toEqual('Classique - Solo');
    });

    it('convertGameModeToString should return the correct string', () => {
        const gameMode = 1;
        expect(service.convertGameModeToString(gameMode)).toEqual('Classique - 1vs1');
    });

    it('convertGameModeToString should return the correct string', () => {
        const gameMode = 2;
        expect(service.convertGameModeToString(gameMode)).toEqual('Temps Limité - Solo');
    });

    it('convertGameModeToString should return the correct string', () => {
        const gameMode = 3;
        expect(service.convertGameModeToString(gameMode)).toEqual('Temps Limité - Coop');
    });

    it('convertGameModeToString should return the correct string', () => {
        const gameMode = 4;
        expect(service.convertGameModeToString(gameMode)).toEqual('Loading ...');
    });

    it('should format history data correctly', () => {
        const serverResult = [
            {
                startingTime: '2022-01-01T00:00:00Z',
                duration: '60',
                gameMode: 1,
                player1: 'player1',
                player2: 'player2',
                isWinByDefault: false,
                isGameLoose: true,
            },
            {
                startingTime: '2022-01-02T00:00:00Z',
                duration: '120',
                gameMode: 2,
                player1: 'player1',
                player2: 'player2',
                isWinByDefault: false,
                isGameLoose: false,
            },
            {
                startingTime: '2022-01-02T00:00:00Z',
                duration: '120',
                gameMode: 1,
                player1: 'player1',
                player2: 'player2',
                isWinByDefault: false,
                isGameLoose: false,
                isPlayer1Victory: true,
            },
        ];

        service.formatHistoryData(serverResult);
        expect(service.gameHistories).toBeDefined();
        expect(service.gameHistories[0].isGameLoose).toBeTruthy();
    });

    it('should delete game history', () => {
        const spyReloadPage = spyOn(service, 'reloadPage');

        service.deleteHistory();

        expect(spyReloadPage).toHaveBeenCalled();
    });

    it('should return this.gameHistories', () => {
        service.gameHistories = [
            {
                startingTime: '2022-01-01T00:00:00Z',
                duration: '60',
                gameMode: 'Solo',
                player1: 'player1',
                player2: 'player2',
                isWinByDefault: false,
                isGameLoose: true,
            },
        ];

        expect(service.history).toEqual([
            {
                startingTime: '2022-01-01T00:00:00Z',
                duration: '60',
                gameMode: 'Solo',
                player1: 'player1',
                player2: 'player2',
                isWinByDefault: false,
                isGameLoose: true,
            },
        ]);
    });

    it('should return true if gameHistories is empty', () => {
        service.gameHistories = [];

        expect(service.isHistoryEmpty).toEqual(true);
    });
});
