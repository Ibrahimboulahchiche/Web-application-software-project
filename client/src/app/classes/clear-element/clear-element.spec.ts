import { ClearElement } from './clear-element';

describe('ClearElement', () => {
    it('should create an instance', () => {
        expect(new ClearElement()).toBeTruthy();
    });

    it('should clear the canvas', () => {
        const clearElement = new ClearElement();
        const context = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        spyOn(context, 'clearRect');
        clearElement.applyElementAction(context);
        expect(context.clearRect).toHaveBeenCalled();
    });
});
