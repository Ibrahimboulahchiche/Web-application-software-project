/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { GamesService } from '@app/services/games-service/games.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { GameData } from '@common/interfaces/game.data';
import { defaultRanking } from '@common/interfaces/ranking';
import { Socket } from 'socket.io-client';
import { GamesDisplayComponent } from './games-display.component';
import SpyObj = jasmine.SpyObj;
class SocketClientServiceMock extends SocketClientService {
    override connect() {}
}

describe('GamesDisplayComponent', () => {
    let component: GamesDisplayComponent;
    let fixture: ComponentFixture<GamesDisplayComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let socketClientService: SocketClientService;
    let socketTestHelper: SocketTestHelper;
    let socketServiceMock: SocketClientServiceMock;
    let gameService: SpyObj<GamesService>;
    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketTestHelper as unknown as Socket;
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['get', 'post', 'delete', 'handleError']);
        gameService = jasmine.createSpyObj('GamesService', ['fetchGameDataFromServer']);
    });
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GamesDisplayComponent],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                HttpClient,
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: GamesService, useValue: gameService },
            ],
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(GamesDisplayComponent);
        component = fixture.componentInstance;
        socketClientService = TestBed.inject(SocketClientService);
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set title based on isSelection (when true)', () => {
        component.isSelection = true;
        component.ngOnInit();
        expect(component.title).toEqual('Page de configuration');
    });

    it('should set title based on isSelection (when false)', () => {
        component.isSelection = false;
        component.ngOnInit();
        expect(component.title).toEqual('Page de selection');
    });
    it('should add server socket messages listeners', () => {
        spyOn(socketClientService, 'on').and.callThrough();
        component.addServerSocketMessagesListeners();
        // eslint-disable-next-line no-unused-vars
        const callback = ((params: any) => {}) as any;
        spyOn(component, 'reloadPage').and.stub();
        spyOn(component, 'updateGameAvailability').and.stub();
        socketTestHelper.on('gameProgressUpdate', callback);
        socketTestHelper.peerSideEmit('actionOnGameReloadingThePage');
        const data = { gameId: 1, matchToJoinIfAvailable: 'match' };
        socketTestHelper.peerSideEmit('gameProgressUpdate', data);
        expect(socketClientService.on).toHaveBeenCalledTimes(2);
        expect(socketClientService.on).toHaveBeenCalledWith('gameProgressUpdate', jasmine.any(Function));
        expect(socketClientService.on).toHaveBeenCalledWith('actionOnGameReloadingThePage', jasmine.any(Function));
    });
    it('should update the game availability', () => {
        const gameId = 1234;
        const matchToJoinIfAvailable = 'match-1234';

        const game: GameData = {
            id: 1234,
            name: 'test',
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
        component.theGamesService.games = [{ gameData: game, originalImage: 'http://localhost:3000/api/images/104/1', matchToJoinIfAvailable }];
        component.updateGameAvailability(gameId, matchToJoinIfAvailable);
        expect(component.theGamesService.games[0].matchToJoinIfAvailable).toBe(matchToJoinIfAvailable);
    });
});
