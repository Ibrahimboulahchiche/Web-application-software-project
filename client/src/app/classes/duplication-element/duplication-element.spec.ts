/* eslint-disable @typescript-eslint/no-magic-numbers */
import { DuplicationElement } from './duplication-element';

describe('DuplicationElement', () => {
    it('should create an instance', () => {
        const duplicateCanvas = new DuplicationElement();
        expect(duplicateCanvas).toBeTruthy();
    });

    it('should load canvases', () => {
        const duplicateCanvas = new DuplicationElement();
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d') as CanvasRenderingContext2D;

        tempCanvas.width = 500;
        tempCanvas.height = 500;

        duplicateCanvas.loadCanvases(tempContext, tempContext);
        expect(duplicateCanvas.leftContext).toEqual(tempContext);
    });

    it('temp canvas should have the same size as the source canvas', () => {
        const duplicateCanvas = new DuplicationElement();
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d') as CanvasRenderingContext2D;

        tempCanvas.width = 500;
        tempCanvas.height = 500;

        duplicateCanvas.loadCanvases(tempContext, tempContext);
        duplicateCanvas.applyElementAction(tempContext);
        expect(tempCanvas.width).toEqual(500);
        expect(tempCanvas.height).toEqual(500);
    });
});
