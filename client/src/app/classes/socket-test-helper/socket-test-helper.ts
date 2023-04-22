/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
type CallbackSignature = (params: any) => {};

export class SocketTestHelper {
    private callbacks = new Map<string, CallbackSignature[]>();

    on(event: string, callback: CallbackSignature): void {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }

        this.callbacks.get(event)?.push(callback);
    }

    // eslint-disable-next-line no-unused-vars
    emit(event: string, ...params: any): void {
        // We need to use the params variable, otherwise the linter will complain
        // eslint-disable-next-line no-console
        console.log('emit', event, params);
        return;
    }

    disconnect(): void {
        return;
    }

    peerSideEmit(event: string, params?: any) {
        if (!this.callbacks.has(event)) {
            return;
        }

        for (const callback of this.callbacks.get(event)!) {
            callback(params);
        }
    }
}
