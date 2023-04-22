import { Injectable } from '@angular/core';
import { MINUTE_TO_SECONDS } from '@common/utils/constants';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    convertScoreToString(scoreTime: number): string {
        const formattedMinutes = Math.floor(scoreTime / MINUTE_TO_SECONDS).toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false,
        });
        const formattedSeconds = Math.floor(scoreTime % MINUTE_TO_SECONDS).toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false,
        });
        return formattedMinutes + ':' + formattedSeconds;
    }
}
