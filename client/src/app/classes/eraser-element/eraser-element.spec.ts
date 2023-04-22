/* eslint-disable @typescript-eslint/no-magic-numbers */
import { EraserElement } from './eraser-element';

describe('EraserElement', () => {
    const pixel = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
    ];

    it('if the stroke has more than one point, it should draw the stroke', () => {
        const eraserElement = new EraserElement(pixel, false);
        const context = jasmine.createSpyObj('CanvasRenderingContext2D', ['beginPath', 'lineWidth', 'moveTo', 'clearRect', 'stroke']);
        const stroke = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        eraserElement.pixels = stroke;
        eraserElement.penWidth = 1;
        eraserElement.applyElementAction(context);
        expect(context.beginPath).toHaveBeenCalled();
        expect(context.lineWidth).toBe(1);
        expect(context.moveTo).toHaveBeenCalledWith(0, 0);
        expect(context.clearRect).toHaveBeenCalledWith(-0.5, -0.5, 1, 1);
        expect(context.stroke).toHaveBeenCalled();
    });

    it('if the stroke has only one point, it should draw the stroke', () => {
        const eraserElement = new EraserElement(pixel, false);
        const context = jasmine.createSpyObj('CanvasRenderingContext2D', ['beginPath', 'lineWidth', 'moveTo', 'clearRect', 'stroke']);
        const stroke = [{ x: 0, y: 0 }];
        eraserElement.pixels = stroke;
        eraserElement.penWidth = 1;
        eraserElement.applyElementAction(context);
        expect(context.beginPath).toHaveBeenCalled();
        expect(context.lineWidth).toBe(1);
        expect(context.clearRect).toHaveBeenCalledWith(-0.5, -0.5, 1, 1);
        expect(context.stroke).toHaveBeenCalled();
    });
});
