/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
// import { CommunicationService } from '@app/services/communication-service/communication.service';
import { of } from 'rxjs';
import { GameConstantsService } from './game-constants.service';

describe('GameConstantsService', () => {
    let service: GameConstantsService;
    // let mockCommunicationService: jasmine.SpyObj<CommunicationService>;

    beforeEach(() => {
        const communicationServiceMock = jasmine.createSpyObj('CommunicationService', ['post']);

        communicationServiceMock.post.and.returnValue(of(null));
        service = new GameConstantsService(communicationServiceMock);
    });

    it('should return the countdown value', () => {
        expect(service.countdownValue).toEqual(0);
    });

    it('should return the penalty value', () => {
        expect(service.penaltyValue).toEqual(0);
    });

    it('should return the bonus value', () => {
        expect(service.bonusValue).toEqual(0);
    });

    it('should reset constants', () => {
        service.updateConstants(true);
        expect(service.countdownValue).toEqual(30);
        expect(service.penaltyValue).toEqual(5);
        expect(service.bonusValue).toEqual(5);
    });

    it('should not reset constants', () => {
        service.constants.countdownValue = 30;
        service.constants.penaltyValue = 5;
        service.constants.bonusValue = 5;
        service.updateConstants(false);
        expect(service.countdownValue).toEqual(30);
        expect(service.penaltyValue).toEqual(5);
        expect(service.bonusValue).toEqual(5);
    });
});
