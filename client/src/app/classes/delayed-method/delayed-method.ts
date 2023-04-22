import { MINIMUM_TIME_MILLISECONDS } from '@common/utils/constants';

export class DelayedMethod {
    static speed: number = 1;
    private static instances: DelayedMethod[] = []; // keep track of all instances of DelayedMethod
    private timeoutId: number | undefined;
    private isPaused: boolean = false;
    private isExecuted: boolean = false;
    private startTime: number | undefined;
    private elapsed: number = 0;
    private resolvePromise: ((value: string) => void) | null = null;

    constructor(private readonly method: () => void, private readonly delay: number, private readonly looping: boolean = false) {
        DelayedMethod.instances.push(this);
    }

    static killAll(): void {
        DelayedMethod.instances.forEach((instance) => instance.stop());
        DelayedMethod.instances = [];
    }

    static pauseAll(): void {
        DelayedMethod.instances.forEach((instance) => instance.pause());
    }

    static resumeAll(): void {
        DelayedMethod.instances.forEach((instance) => instance.resume());
    }

    async start(): Promise<string> {
        this.isExecuted = false;
        this.isPaused = false;
        this.startTime = Date.now();
        this.setTimeoutLoop();

        return new Promise<string>((resolve) => {
            this.resolvePromise = resolve;
        });
    }

    pause() {
        this.isPaused = true;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    stop() {
        this.pause();
        this.isExecuted = true;
        if (this.resolvePromise) {
            this.resolvePromise('stopped');
        }
    }

    resume() {
        if (this.isExecuted && !this.looping) {
            return;
        }
        this.isPaused = false;
        this.elapsed = this.elapsed / DelayedMethod.speed;
        this.startTime = Date.now() - this.elapsed;
        this.setTimeoutLoop();
    }

    private setTimeoutLoop() {
        if (!this.isPaused) {
            this.elapsed = (Date.now() - (this.startTime ?? 0)) * DelayedMethod.speed;
            const remaining = this.delay - this.elapsed;

            if (remaining <= 0) {
                this.method();
                this.isExecuted = true;
                if (this.looping) {
                    this.elapsed = 0;
                    this.startTime = Date.now();
                } else {
                    if (this.resolvePromise) {
                        this.resolvePromise('finished');
                    }
                    return;
                }
            }
            // cap the minimum time to 16ms to avoid unnecessarily high CPU usage
            const nextTick = Math.max(remaining, MINIMUM_TIME_MILLISECONDS) / DelayedMethod.speed;
            this.timeoutId = window.setTimeout(this.setTimeoutLoop.bind(this), nextTick);
        }
    }
}
