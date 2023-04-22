import { Injectable } from '@angular/core';
import { DelayedMethod } from '@app/classes/delayed-method/delayed-method';
import { Action } from '@common/classes/action';

export enum ReplayModeState {
    Idle,
    Recording,
    FinishedRecording,
    Replaying,
    Paused,
    FinishedReplaying,
}
@Injectable({
    providedIn: 'root',
})
export class ReplayModeService {
    elapsedSeconds: number = 0;
    timerId: number;
    recordedActions: DelayedMethod[] = [];
    onStartReplayMode: Action<void> = new Action<void>();
    onFinishReplayMode: Action<void> = new Action<void>();
    currentState: ReplayModeState = ReplayModeState.Idle;
    startRecordingDate: Date;

    get startReplayModeAction(): Action<void> {
        const output: Action<void> = new Action<void>();
        output.add(() => this.stopRecording());
        output.add(() => this.launchReplayMode());
        return output;
    }

    get shouldShowReplayModeGUI(): boolean {
        return (
            this.currentState === ReplayModeState.Replaying ||
            this.currentState === ReplayModeState.Paused ||
            this.currentState === ReplayModeState.FinishedReplaying
        );
    }

    get isReplayModePaused(): boolean {
        return this.currentState === ReplayModeState.Paused;
    }

    get isReplayModeFinished(): boolean {
        return this.currentState === ReplayModeState.FinishedReplaying;
    }

    get currentStatus(): string {
        return ReplayModeState[this.currentState];
    }

    get replaySpeed(): number {
        return DelayedMethod.speed;
    }

    set replaySpeed(speed: number) {
        DelayedMethod.speed = speed;
        this.recordedActions.forEach((action) => {
            action.pause();
            if (this.currentState === ReplayModeState.Replaying) action.resume();
        });
    }

    startRecording(): void {
        this.resetTimer();
        this.startRecordingTimer();
    }

    stopRecording(): void {
        this.addMethodToReplay(() => this.finishReplayMode());
        this.stopRecordingTimer();
    }

    addMethodToReplay(action: () => void): void {
        if (this.currentState === ReplayModeState.Recording) {
            this.recordedActions.push(new DelayedMethod(action, this.getMillisecondsBetweenNowAndStartOfRecording()));
        }
    }

    launchReplayMode() {
        this.currentState = ReplayModeState.Replaying;
        this.stopAllPlayingActions();
        this.onStartReplayMode.invoke();

        this.pauseReplayingTimer();
        this.elapsedSeconds = 0;

        this.startReplayingTimer();

        this.recordedActions.forEach((action) => {
            action.start();
        });
        this.currentState = ReplayModeState.Replaying;
    }

    togglePauseReplayMode() {
        if (this.currentState === ReplayModeState.Replaying) {
            this.pauseReplayingTimer();
            this.recordedActions.forEach((action) => {
                action.pause();
            });
            DelayedMethod.pauseAll();
        } else if (this.currentState === ReplayModeState.Paused) {
            this.resumeReplayingTimer();
            this.recordedActions.forEach((action) => {
                action.resume();
            });
            DelayedMethod.resumeAll();
        }
    }

    stopAllPlayingActions() {
        this.recordedActions.forEach((action) => {
            action.stop(); // cancel it if it was already started
        });
        DelayedMethod.killAll();
    }

    private finishReplayMode() {
        this.onFinishReplayMode.invoke();
        this.pauseReplayingTimer();
        this.currentState = ReplayModeState.FinishedReplaying;
    }

    private startRecordingTimer() {
        this.currentState = ReplayModeState.Recording;
        this.startRecordingDate = new Date();
    }

    private getMillisecondsBetweenNowAndStartOfRecording(): number {
        const now = new Date();
        const differenceInMilliseconds = now.getTime() - this.startRecordingDate.getTime();
        return differenceInMilliseconds;
    }

    private stopRecordingTimer() {
        this.currentState = ReplayModeState.FinishedRecording;
        clearInterval(this.timerId);
    }

    private startReplayingTimer() {
        this.currentState = ReplayModeState.Replaying;
    }

    private pauseReplayingTimer() {
        this.currentState = ReplayModeState.Paused;
    }

    private resumeReplayingTimer() {
        this.currentState = ReplayModeState.Replaying;
    }

    private resetTimer() {
        this.elapsedSeconds = 0;
        clearInterval(this.timerId);
        this.recordedActions = [];
    }
}
