import { TestBed } from '@angular/core/testing';
import { MINUTE_TO_SECONDS } from '@common/utils/constants';
import { TimerService } from './timer.service';

describe('TimerService', () => {
    let service: TimerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TimerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return the correct format for given score in seconds', () => {
        const result = service.convertScoreToString(MINUTE_TO_SECONDS);
        expect(result).toEqual('01:00');
    });
});
