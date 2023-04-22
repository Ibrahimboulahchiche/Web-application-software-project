import { RectangleElement } from './rectangle-element';

describe('RectangleElement', () => {
    it('should create an instance', () => {
        const pixel = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        expect(new RectangleElement(pixel, false)).toBeTruthy();
    });

    it('shoudl draw a rectangle', () => {
        const pixel = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        const rectangleElement = new RectangleElement(pixel, false);
        const context = jasmine.createSpyObj('CanvasRenderingContext2D', ['beginPath', 'strokeStyle', 'fillStyle', 'moveTo', 'fillRect']);
        rectangleElement.color = 'black';
        rectangleElement.applyElementAction(context);
        expect(context.beginPath).toHaveBeenCalled();
        expect(context.strokeStyle).toBe('black');
        expect(context.fillStyle).toBe('black');
        expect(context.moveTo).toHaveBeenCalledWith(0, 0);
        expect(context.fillRect).toHaveBeenCalledWith(0, 0, 1, 1);
    });
});
