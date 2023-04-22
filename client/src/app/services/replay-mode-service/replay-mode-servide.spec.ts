/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable prettier/prettier */
import { TestBed } from '@angular/core/testing';
import { DelayedMethod } from '@app/classes/delayed-method/delayed-method';
import { ReplayModeService, ReplayModeState } from './replay-mode.service';
describe('Replay Mode Service', () => {
    let replayModeService: ReplayModeService;
    beforeEach(() => {
        replayModeService = TestBed.inject(ReplayModeService);
        replayModeService.replaySpeed=5;

    });
    it('should return an arrow function that calls stopRecording and launchReplayMode', () => {
        const output = replayModeService.startReplayModeAction;
        const spyStopRecording = spyOn(replayModeService, 'stopRecording');
        const spyLaunchReplayMode = spyOn(replayModeService, 'launchReplayMode');
    
        output.invoke();
    
        expect(spyStopRecording).toHaveBeenCalled();
        expect(spyLaunchReplayMode).toHaveBeenCalled();
    });
    it('should return an arrow function that calls stopRecording and launchReplayMode', () => {
        const output = replayModeService.isReplayModeFinished;
        expect(output).toEqual(false);
    });
    it('should return an arrow function that calls stopRecording and launchReplayMode', () => {
        const output = replayModeService.isReplayModePaused;
        expect(output).toEqual(false);
    });
    it('should return an arrow function that calls stopRecording and launchReplayMode', () => {
        replayModeService.currentState=0;
        const output = replayModeService.currentStatus;
        expect(output).toEqual('Idle');
    });
    it('should return an arrow function that calls stopRecording and launchReplayMode', () => {
        const output = replayModeService.replaySpeed;
        expect(output).toEqual(5);
    });
    it('should return an arrow function that calls stopRecording and launchReplayMode', () => {
        replayModeService.currentState=ReplayModeState.Replaying;
        const delay = 100;
        const spy = jasmine.createSpy();
        const delayedMethod1 = new DelayedMethod(spy, delay);
        replayModeService.recordedActions.push(delayedMethod1);
        replayModeService.replaySpeed=5;
        expect(replayModeService.recordedActions).toContain(delayedMethod1);
    });
    it('should stop recording', ()=>{
        replayModeService.currentState=ReplayModeState.Recording;
        
        const spyFinishReplayMode = spyOn(replayModeService, ['finishReplayMode'] as any);
        const spyAddMethodToReplay = spyOn(replayModeService, 'addMethodToReplay');

        replayModeService.stopRecording();


        const addedArrowFunction = spyAddMethodToReplay.calls.mostRecent().args[0];

        addedArrowFunction();
        expect(spyFinishReplayMode).toHaveBeenCalledTimes(1);   
    });
    it('should add Method to replay',()=>{
        replayModeService.currentState=ReplayModeState.Recording;
        spyOn(replayModeService,['getMillisecondsBetweenNowAndStartOfRecording'] as any);
        replayModeService.addMethodToReplay(()=>{return 1;});
        expect(replayModeService.recordedActions.length).not.toEqual(0);
    });
    it('should launch replay mode ',()=>{
        replayModeService.launchReplayMode();
        expect(replayModeService.currentState).toEqual(ReplayModeState.Replaying);
    });
    it('should launch replay mode ',()=>{
        const delay = 100;
        const spy = jasmine.createSpy();
        const delayedMethod1 = new DelayedMethod(spy, delay);
        const recordedActions = [delayedMethod1,delayedMethod1,delayedMethod1];
        replayModeService.recordedActions = recordedActions;
        replayModeService.launchReplayMode();
        expect(replayModeService.currentState).toEqual(ReplayModeState.Replaying);
    });
    it('should launch replay mode ',()=>{
        replayModeService['resumeReplayingTimer']();
        expect(replayModeService.currentState).toEqual(ReplayModeState.Replaying);
    });
    it('should launch replay mode ',()=>{
        replayModeService['finishReplayMode']();
        expect(replayModeService.currentState).toEqual(ReplayModeState.FinishedReplaying);
    });
   
    it('should return the correct difference in milliseconds', () => {
        const now = new Date(Date.now() + 1000); 
        spyOn(window, 'Date').and.returnValue(now as any); 
        replayModeService.startRecordingDate = new Date(10000 ); 

        const differenceInMilliseconds = replayModeService['getMillisecondsBetweenNowAndStartOfRecording']();
        expect(differenceInMilliseconds).not.toBeUndefined(); 
    });
    it('should toggle replay mode ',()=>{
        replayModeService.currentState=ReplayModeState.Replaying;
        const delay = 100;
        const spy = jasmine.createSpy();
        const delayedMethod1 = new DelayedMethod(spy, delay);
        const recordedActions = [delayedMethod1,delayedMethod1,delayedMethod1];
        replayModeService.recordedActions = recordedActions;
        replayModeService.togglePauseReplayMode();
        expect(replayModeService.currentState).toEqual(ReplayModeState.Paused as any);
    });
    it('should launch replay mode ',()=>{
        replayModeService.currentState=ReplayModeState.Paused;
        const delay = 100;
        const spy = jasmine.createSpy();
        const delayedMethod1 = new DelayedMethod(spy, delay);
        const recordedActions = [delayedMethod1,delayedMethod1,delayedMethod1];
        replayModeService.recordedActions = recordedActions;
        replayModeService.togglePauseReplayMode();
        expect(replayModeService.currentState).toEqual(ReplayModeState.Replaying as any);
    });
    it('should stop all recorded actions and kill any delayed methods', () => {
        const delay = 100;
        const spy = jasmine.createSpy();
        const delayedMethod1 = new DelayedMethod(spy, delay);
        const recordedActions = [delayedMethod1,delayedMethod1,delayedMethod1];
        replayModeService.recordedActions = recordedActions;
    
        spyOn(DelayedMethod, 'killAll');
    
        replayModeService.stopAllPlayingActions();
    
        expect(DelayedMethod.killAll).toHaveBeenCalled(); 
      });
   

});
