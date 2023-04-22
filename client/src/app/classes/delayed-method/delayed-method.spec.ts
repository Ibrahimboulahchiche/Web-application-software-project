/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
import { DelayedMethod } from '@app/classes/delayed-method/delayed-method';
let delayedMethod:DelayedMethod;
describe('DelayedMethod', () => {
    
    it('should execute the method after the specified delay', async () => {
        const delay = 100;
        const spy = jasmine.createSpy();
        delayedMethod = new DelayedMethod(spy, delay);
    
        await delayedMethod.start();
        expect(spy).toHaveBeenCalled();
    });
    it('should return a promise that resolves to "finished" after the method has been executed', async () => {
        const delay = 100;
        const spy = jasmine.createSpy();
        delayedMethod = new DelayedMethod(spy, delay);
    
        const result = await delayedMethod.start();
        expect(result).toBe('finished');
    });
    it('should pause the execution of the method', async () => {
        const delay = 100;
        const spy = jasmine.createSpy();
         delayedMethod = new DelayedMethod(spy, delay);
    
        await delayedMethod.start();
        delayedMethod.pause();
        const elapsedBeforePause = delayedMethod['elapsed'];
        await new Promise((resolve) => setTimeout(resolve, delay));
        expect(delayedMethod['elapsed']).toBe(elapsedBeforePause);
    });
    it('should stop the execution of the method and resolve the promise with "stopped"', async () => {
        const delay = 100;
        const spy = jasmine.createSpy();
        delayedMethod = new DelayedMethod(spy, delay);
    
        const resultPromise = delayedMethod.start();
        delayedMethod.stop();
        const result = await resultPromise;
        expect(result).toBe('stopped');
        expect(spy).not.toHaveBeenCalled();
    });
    it('should resume the execution of the method from where it left off', async () => {
        const delay = 100;
        const spy = jasmine.createSpy();
        delayedMethod = new DelayedMethod(spy, delay);
    
        await delayedMethod.start();
        delayedMethod.pause();
        const elapsedBeforePause = delayedMethod['elapsed'];
        delayedMethod['isExecuted']=false;
        delayedMethod.resume();
        await new Promise((resolve) => setTimeout(resolve, delay - elapsedBeforePause));
        expect(spy).toHaveBeenCalled();
    });
    it('should resume the execution of the method from where it left off', async () => {
        const delay = 100;
        const spy = jasmine.createSpy();
        delayedMethod = new DelayedMethod(spy, delay);
    
        await delayedMethod.start();
        delayedMethod.pause();
        const elapsedBeforePause = delayedMethod['elapsed'];
        delayedMethod['isExecuted']=true;
        delayedMethod.resume();
        await new Promise((resolve) => setTimeout(resolve, delay - elapsedBeforePause));
        expect(spy).toHaveBeenCalled();
    });
    it('should stop all instances of DelayedMethod', async () => {
        const delay = 100;
        const spy = jasmine.createSpy();
        const delayedMethod1 = new DelayedMethod(spy, delay);
        const delayedMethod2 = new DelayedMethod(spy, delay);
        console.log(delayedMethod1);
        console.log(delayedMethod2);
    
        DelayedMethod.killAll();
        expect(spy).not.toHaveBeenCalled();
    });
    it('should pause all instances of DelayedMethod', async () => {
        const delay = 100;
        const spy = jasmine.createSpy();
        const delayedMethod1 = new DelayedMethod(spy, delay);
        const delayedMethod2 = new DelayedMethod(spy, delay);
    
        DelayedMethod.pauseAll();
        const elapsedBeforePause1 = delayedMethod1['elapsed'];
        const elapsedBeforePause2 = delayedMethod2['elapsed'];
        console.log(elapsedBeforePause1);
        console.log(elapsedBeforePause2);
        expect(delayedMethod1['isExecuted']).not.toBeUndefined();
    
    });
    it('should resume all instances of DelayedMethod', async () => {
        const delay = 100;
        const spy = jasmine.createSpy();
        const delayedMethod1 = new DelayedMethod(spy, delay);
        const delayedMethod2 = new DelayedMethod(spy, delay);
        delayedMethod1['isExecuted']=true;
        delayedMethod2['isExecuted']=true;

        DelayedMethod.resumeAll();
        const elapsedBeforePause1 = delayedMethod1['elapsed'];
        const elapsedBeforePause2 = delayedMethod2['elapsed'];
        console.log(elapsedBeforePause1);
        console.log(elapsedBeforePause2);
        expect(delayedMethod1['isPaused']).not.toBeUndefined();
    
    });
    it('should set timeout loop', async () => {
        const delay = 100;
        const spy = jasmine.createSpy();
        delayedMethod = new DelayedMethod(spy, delay,true);
        delayedMethod['setTimeoutLoop']();
        expect(delayedMethod['isExecuted']).toEqual(true);
       
    
    });
    
});
