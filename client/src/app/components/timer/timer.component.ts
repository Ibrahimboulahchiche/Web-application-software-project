import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { GameConstantsService } from '@app/services/game-constants-service/game-constants.service';
import { LIMITED_TIME_DURATION, MINUTE_LIMIT, MINUTE_TO_SECONDS, NOT_FOUND } from '@common/utils/constants';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent {
    @Input() isCountdown: boolean = false;
    @Output() timeReachedZero: EventEmitter<void> = new EventEmitter();
    @ViewChild('minute', { static: true }) minute: ElementRef;
    @ViewChild('second', { static: true }) second: ElementRef;
    private timeCountInSeconds: number;
    private timePenalty: number = 0;
    private initialTime: number = NOT_FOUND;

    constructor(public gameConstantsService: GameConstantsService) {
        this.gameConstantsService.initGameConstants();
    }

    get elapsedSeconds(): number {
        const output: number = this.timeCountInSeconds + this.timePenalty;
        if (output > LIMITED_TIME_DURATION && this.isCountdown) return LIMITED_TIME_DURATION;
        return output < 0 ? 0 : output;
    }

    get minutes(): number {
        return Math.floor(this.elapsedSeconds / MINUTE_TO_SECONDS);
    }

    get seconds(): number {
        return Math.floor(this.elapsedSeconds % MINUTE_TO_SECONDS);
    }

    getTimeDisplayValue(value: number): string {
        return value < MINUTE_LIMIT ? '0' + value : value.toString();
    }

    refreshTimerDisplay() {
        this.minute.nativeElement.innerText = this.getTimeDisplayValue(this.minutes);
        this.second.nativeElement.innerText = this.getTimeDisplayValue(this.seconds);

        if (this.elapsedSeconds <= 0 && this.isCountdown) {
            this.timeReachedZero.emit();
        }
    }

    forceSetTime(elapsedTime: number) {
        if (!this.isCountdown) this.timeCountInSeconds = elapsedTime;
        else {
            if (this.initialTime === NOT_FOUND) this.initialTime = this.gameConstantsService.countdownValue;
            this.timeCountInSeconds = this.initialTime - elapsedTime;
        }

        this.refreshTimerDisplay();
    }

    applyTimePenalty(decreaseValue: number) {
        this.timePenalty -= decreaseValue;
        this.refreshTimerDisplay();
    }

    reset() {
        this.timeCountInSeconds = this.isCountdown ? this.gameConstantsService.countdownValue : 0;
        this.timePenalty = 0;
        this.initialTime = this.timeCountInSeconds;
        this.minute.nativeElement.innerText = '00';
        this.second.nativeElement.innerText = '00';
        this.refreshTimerDisplay();
    }
}
