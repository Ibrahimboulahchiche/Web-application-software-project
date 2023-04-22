import { CrayonElement } from './crayon-element';

describe('CrayonElement', () => {
    const pixel = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
    ];

    it('if the stroke has only one point, it should draw the stroke', () => {
        const crayonElement = new CrayonElement(pixel, false);
        const context = jasmine.createSpyObj('CanvasRenderingContext2D', [
            'beginPath',
            'strokeStyle',
            'lineWidth',
            'lineCap',
            'moveTo',
            'lineTo',
            'stroke',
        ]);
        const stroke = [{ x: 0, y: 0 }];
        crayonElement.pixels = stroke;
        crayonElement.color = 'black';
        crayonElement.penWidth = 1;
        crayonElement.applyElementAction(context);
        expect(context.beginPath).toHaveBeenCalled();
        expect(context.strokeStyle).toBe('black');
        expect(context.lineWidth).toBe(1);
        expect(context.lineCap).toBe('round');
        expect(context.moveTo).toHaveBeenCalledWith(0, 0);
        expect(context.lineTo).toHaveBeenCalledWith(0, 0);
        expect(context.stroke).toHaveBeenCalled();
    });
});
