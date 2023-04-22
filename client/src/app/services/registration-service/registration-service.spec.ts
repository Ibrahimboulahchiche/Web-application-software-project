/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { CLASSIC_PATH, SELECTION_PATH } from '@common/utils/env.http';
import { Socket } from 'socket.io-client';
import { RegistrationService } from './registration.service';

class SocketClientServiceMock extends SocketClientService {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    override connect() {}
}
describe('RegistrationService', () => {
    let registrationService: RegistrationService;
    let socketTestHelper: SocketTestHelper;
    let socketServiceMock: SocketClientServiceMock;

    const routerMock = {
        navigate: jasmine.createSpy('navigate'),
    };

    const matchmakingMock = {
        currentMatch: jasmine.createSpy('currentMatch'),
        currentGameId: jasmine.createSpy('currentGameId'),
    };

    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketTestHelper as unknown as Socket;
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [
                RegistrationService,
                { provide: SocketClientService, useValue: socketServiceMock },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: convertToParamMap({ id: '1' }) },
                    },
                },
                {
                    provide: Router,
                    useValue: routerMock,
                },
                {
                    provide: MatchmakingService,
                    useValue: matchmakingMock,
                },
            ],
        }).compileComponents();
        registrationService = TestBed.inject(RegistrationService);
    }));

    afterEach(() => {
        socketServiceMock.disconnect();
        socketTestHelper.disconnect();
    });

    it('should create the registrationService', () => {
        expect(registrationService).toBeTruthy();
    });

    it('should redirect to main page', () => {
        registrationService.redirectToMainPage();
        expect(routerMock.navigate).toHaveBeenCalled();
    });

    it('should handle game deletion', () => {
        registrationService.handleGameDeleted('1');
        expect(routerMock.navigate).not.toHaveBeenCalledOnceWith('');
    });

    it('should load the game page', fakeAsync(() => {
        const routerSpy = (<jasmine.Spy>routerMock.navigate).and.returnValue(Promise.resolve());
        const id = '1';
        registrationService.loadGamePage(id);
        expect(routerSpy).toHaveBeenCalled();
    }));

    it('should navigate to home page when no game is specified', fakeAsync(() => {
        const gameIdThatWasDeleted = null;
        const routerSpy = (<jasmine.Spy>routerMock.navigate).and.returnValue(Promise.resolve(true));
        spyOn(window, 'alert');

        registrationService.handleGameDeleted(gameIdThatWasDeleted);

        expect(routerSpy).toHaveBeenCalledWith([SELECTION_PATH]);
    }));

    it('should navigate to home page when game id that was deleted is the current match played', fakeAsync(() => {
        const id = '1';
        const routerSpy = (<jasmine.Spy>routerMock.navigate).and.returnValue(Promise.resolve());
        registrationService.loadGamePage(id);
        expect(routerSpy).toHaveBeenCalledWith([CLASSIC_PATH, id]);
    }));
});
