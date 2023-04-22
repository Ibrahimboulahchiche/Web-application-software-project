/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NOT_FOUND } from '@common/utils/constants';
import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [TimerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TimerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get actual minutes time', () => {
        component['timeCountInSeconds'] = 60;
        const expectedMinutes = 1;
        const getMinutes = component.minutes;
        expect(getMinutes).toEqual(expectedMinutes);
    });

    it('should get seconds and return number of seconds', () => {
        component['timeCountInSeconds'] = 120;
        const expectedSeconds = 0;
        const getMinutes = component.seconds;
        expect(getMinutes).toEqual(expectedSeconds);
    });

    it('should display the current elapsed time with the correct format', () => {
        const result = component.getTimeDisplayValue(2);
        expect(result).toEqual('02');
    });

    it('should refresh the current elapsed time with the correct format', () => {
        spyOn(component, 'getTimeDisplayValue').and.returnValue('30');
        component.refreshTimerDisplay();
        expect(component.minute.nativeElement.innerText).toEqual('30');
        expect(component.minute.nativeElement.innerText).toEqual('30');
    });

    it('should emit time reached 0 when no time left', () => {
        spyOn(component.timeReachedZero, 'emit').and.callFake(() => new EventEmitter<void>());
        component['timeCountInSeconds'] = 0;
        component['timePenalty'] = -1;
        component.refreshTimerDisplay();
        expect(component.timeReachedZero.emit).not.toHaveBeenCalled();
    });

    it('should apply the chosen time penalty', () => {
        spyOn(component, 'refreshTimerDisplay');
        component['timeCountInSeconds'] = 40;
        component['timePenalty'] = -1;
        component.applyTimePenalty(1);
        expect(component['timePenalty']).toEqual(-2);
        expect(component.refreshTimerDisplay).toHaveBeenCalled();
    });

    it('should force set time', () => {
        spyOn(component, 'refreshTimerDisplay');
        component['timeCountInSeconds'] = 40;
        component['timePenalty'] = 0;
        component.isCountdown = false;
        component.forceSetTime(20);
        expect(component['timeCountInSeconds']).toEqual(20);
        expect(component.refreshTimerDisplay).toHaveBeenCalled();
    });

    it('should force set time and change time count in seconds', () => {
        component['timeCountInSeconds'] = 40;
        component['timePenalty'] = 0;
        component['initialTime'] = 0;
        component.isCountdown = true;
        component.forceSetTime(20);
        expect(component['timeCountInSeconds']).toEqual(-20);
    });

    it('should force set time and change initial time', () => {
        component['timeCountInSeconds'] = 40;
        component['timePenalty'] = 0;
        component['initialTime'] = NOT_FOUND;
        component.isCountdown = true;
        component.forceSetTime(20);
        expect(component['initialTime']).toEqual(0);
    });

    it('should reset all the timer constants and call refreshTimerDisplay', () => {
        spyOn(component, 'refreshTimerDisplay');
        component.isCountdown = false;
        component['timeCountInSeconds'] = 40;
        component['timePenalty'] = -1;
        component.reset();
        expect(component['timeCountInSeconds']).toEqual(0);
        expect(component['timePenalty']).toEqual(0);
        expect(component['initialTime']).toEqual(component['timeCountInSeconds']);
        expect(component.minute.nativeElement.innerText).toEqual('00');
        expect(component.second.nativeElement.innerText).toEqual('00');
        expect(component.refreshTimerDisplay).toHaveBeenCalled();
    });

    it('should reset all the timer constants when it is time limited mode', () => {
        spyOn(component, 'refreshTimerDisplay');
        component.isCountdown = true;
        component.reset();
        expect(component['timeCountInSeconds']).toEqual(0);
    });
});
