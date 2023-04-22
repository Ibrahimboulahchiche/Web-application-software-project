/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { GameData } from '@common/interfaces/game.data';
import { defaultRanking } from '@common/interfaces/ranking';
import { Buffer } from 'buffer';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { GamesService } from './games.service';

class SocketClientServiceMock extends SocketClientService {
    override connect() {}
}
describe('GamesService', () => {
    let service: GamesService;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    let socketServiceMock: SocketClientServiceMock;
    let socketClientService: SocketClientService;
    let socketTestHelper: SocketTestHelper;

    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketTestHelper as unknown as Socket;
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['get', 'post', 'delete', 'handleError']);
    });
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                HttpClient,
                { provide: SocketClientService, useValue: socketServiceMock },
            ],
        }).compileComponents();
        service = TestBed.inject(GamesService);
        socketClientService = TestBed.inject(SocketClientService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch game data from the server', () => {
        const pageId = 0;
        const gameContent: {
            gameData: GameData;
            originalImage: Buffer;
        }[] = [];
        const expectedGames: {
            gameData: GameData;
            originalImage: Buffer;
            matchToJoinIfAvailable: string | null;
        }[] = [];
        for (let i = 1; i <= 4; i++) {
            const game: GameData = {
                id: i,
                name: `Game ${i}`,
                isEasy: true,
                nbrDifferences: 4,
                differences: [
                    [
                        { x: 4, y: 0 },
                        { x: 3, y: 0 },
                        { x: 2, y: 0 },
                        { x: 1, y: 0 },
                        { x: 0, y: 0 },
                    ],
                ],
                oneVersusOneRanking: defaultRanking,
                soloRanking: defaultRanking,
            };
            const match = 'match1';
            gameContent.push({ gameData: game, originalImage: Buffer.alloc(3) });
            expectedGames.push({ gameData: game, originalImage: Object({ type: 'Buffer', data: [0, 0, 0] }), matchToJoinIfAvailable: match });
        }

        communicationServiceSpy.get.and.returnValue(
            of({
                headers: new HttpHeaders(),
                status: 200,
                statusText: 'OK',
                url: '',
                body: JSON.stringify({ gameContent, nbrOfGame: 4 }),
                type: 4,
                ok: true,
                clone: (): HttpResponse<string> => new HttpResponse<string>(undefined),
            }),
        );
        service.fetchGameDataFromServer(pageId);
        expect(communicationServiceSpy.get).toHaveBeenCalledWith(`/games/${pageId}`);
        expect(service.gamesNumber).toEqual(4);
        expect(service.showNextButton).toBeFalse();
    });

    it('should change game pages (next/previous games)', () => {
        spyOn(service, 'fetchGameDataFromServer');
        service.changeGamePages(true);
        expect(service.currentPageNumber).toBe(1);
        service.changeGamePages(false);
        expect(service.currentPageNumber).toBe(0);
    });

    it('should delete all games', () => {
        communicationServiceSpy.delete.and.returnValue(
            of({
                headers: new HttpHeaders(),
                status: 200,
                statusText: 'OK',
                url: '',
                body: 'test',
                type: 4,
                ok: true,
                clone: (): HttpResponse<string> => new HttpResponse<string>(undefined),
            }),
        );
        spyOn(socketClientService.socket, 'emit');
        spyOn(service, 'reloadPage').and.stub();
        service.deleteAll(true);
        expect(communicationServiceSpy.delete).toHaveBeenCalledWith('/games/allGames');
        expect(socketClientService.socket.emit).toHaveBeenCalledWith('deleteAllGames');
        expect(service.reloadPage).toHaveBeenCalled();
    });

    it('should delete game', async () => {
        communicationServiceSpy.delete.and.returnValue(
            of({
                headers: new HttpHeaders(),
                status: 200,
                statusText: 'OK',
                url: '',
                body: 'test',
                type: 4,
                ok: true,
                clone: (): HttpResponse<string> => new HttpResponse<string>(undefined),
            }),
        );
        spyOn(socketClientService.socket, 'emit');
        spyOn(service, 'reloadPage').and.stub();
        await service.deleteById(true, '3');
        expect(communicationServiceSpy.delete).toHaveBeenCalledWith('/games/3');
        expect(socketClientService.socket.emit).toHaveBeenCalledWith('deletedGame', { hasDeletedGame: true, id: '3' });
        expect(service.reloadPage).toHaveBeenCalled();
    });

    it('should reset a game', async () => {
        communicationServiceSpy.post.and.returnValue(
            of({
                headers: new HttpHeaders(),
                status: 200,
                statusText: 'OK',
                url: '',
                body: 'test',
                type: 4,
                ok: true,
                clone: (): HttpResponse<string> => new HttpResponse<string>(undefined),
            }),
        );
        spyOn(socketClientService.socket, 'emit');
        spyOn(service, 'reloadPage').and.stub();
        service.resetById(true, '3');
        expect(socketClientService.socket.emit).toHaveBeenCalledWith('resetGame', { id: '3' });
        expect(service.reloadPage).toHaveBeenCalled();
    });

    it('should reset all games', async () => {
        communicationServiceSpy.post.and.returnValue(
            of({
                headers: new HttpHeaders(),
                status: 200,
                statusText: 'OK',
                url: '',
                body: 'test',
                type: 4,
                ok: true,
                clone: (): HttpResponse<string> => new HttpResponse<string>(undefined),
            }),
        );
        spyOn(socketClientService.socket, 'emit');
        spyOn(service, 'reloadPage').and.stub();
        service.resetAll(true);
        expect(socketClientService.socket.emit).toHaveBeenCalledWith('resetAllGames');
        expect(service.reloadPage).toHaveBeenCalled();
    });
});
