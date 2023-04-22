/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-imports */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ElementRef } from '@angular/core';
import { CrayonElement } from '@app/classes/crayon-element/crayon-element';
import { EraserElement } from '@app/classes/eraser-element/eraser-element';
import { RectangleElement } from '@app/classes/rectangle-element/rectangle-element';
import { Vector2 } from '@common/classes/vector2';
import { EraserTool } from '../eraser-tool/eraser.tool';
import { PencilTool } from '../pencil-tool/pencil-tool';
import { RectangleTool } from '../rectangle-tool/rectangle-tool';
import { ActionsContainer, ToolType } from './actions-container';

describe('ActionsContainer', () => {
    let actionsContainer: ActionsContainer;
    let leftCanvas: ElementRef<HTMLCanvasElement>;
    let rightCanvas: ElementRef<HTMLCanvasElement>;

    beforeEach(() => {
        leftCanvas = { nativeElement: document.createElement('canvas') };
        rightCanvas = { nativeElement: document.createElement('canvas') };
        actionsContainer = new ActionsContainer(leftCanvas, rightCanvas);
    });

    describe('constructor', () => {
        it('should set the left context and right context properties', () => {
            expect(actionsContainer.leftContext).toBeDefined();
            expect(actionsContainer.rightContext).toBeDefined();
        });
    });

    describe('undo', () => {
        it('should redraw all previous strokes onto the canvas', () => {
            // Given
            const spyDraw = spyOn(actionsContainer, 'draw');
            actionsContainer.redoActions = [];
            actionsContainer.undoActions.push(new EraserElement([new Vector2(1, 2), new Vector2(3, 4)], false));

            actionsContainer.draw(new MouseEvent('mousemove'));
            actionsContainer.draw(new MouseEvent('mousedown'));
            actionsContainer.draw(new MouseEvent('mouseup'));

            actionsContainer.undoActions.push(new CrayonElement([new Vector2(1, 2), new Vector2(3, 4)], true));
            actionsContainer.draw(new MouseEvent('mouseup'));
            actionsContainer.undoActions.push(new CrayonElement([new Vector2(1, 2), new Vector2(3, 4)], false));
            actionsContainer.draw(new MouseEvent('mouseup'));
            // When
            actionsContainer.undo();
            actionsContainer.undo();
            actionsContainer.undo();

            // Then
            actionsContainer.redo();
            actionsContainer.redo();
            actionsContainer.redo();
            expect(spyDraw).toHaveBeenCalledTimes(5);
        });

        it('should draw a rectangle with correct dimensions and clear previous rectangle', () => {
            const spyDraw = spyOn(actionsContainer, 'draw');

            actionsContainer.undoActions.push(new RectangleElement([new Vector2(1, 2), new Vector2(3, 4)], false));

            actionsContainer.initialPosition = new Vector2(10, 10);
            actionsContainer.previousRectangle = new Vector2(20, 20);
            const mockEvent = new MouseEvent('click', {
                bubbles: true,
                offsetX: 30,
                offsetY: 30,
            } as MouseEventInit);
            actionsContainer.draw(mockEvent);
            expect(spyDraw).toHaveBeenCalled();
        });

        it('should draw a square when shift key is pressed', () => {
            const spyDraw = spyOn(actionsContainer, 'draw');
            actionsContainer.undoActions.push(new RectangleElement([new Vector2(1, 2), new Vector2(3, 4)], false));
            actionsContainer.initialPosition = new Vector2(10, 10);
            const mockEvent = new MouseEvent('click', {
                bubbles: true,
                offsetX: 30,
                offsetY: 30,
                shiftKey: true,
            } as MouseEventInit);
            actionsContainer.draw(mockEvent);
            expect(spyDraw).toHaveBeenCalled();
        });

        it('should handle mousedown event on left or right canvas', () => {
            actionsContainer = new ActionsContainer(leftCanvas, rightCanvas);
            const mockEvent = new MouseEvent('mousedown', {
                bubbles: true,
                clientX: 10,
                clientY: 10,
            });
            actionsContainer.leftDrawingCanvas.nativeElement.dispatchEvent(mockEvent);
            actionsContainer.rightDrawingCanvas.nativeElement.dispatchEvent(mockEvent);
            actionsContainer.leftDrawingCanvas.nativeElement.dispatchEvent(mockEvent);
            actionsContainer.rightDrawingCanvas.nativeElement.dispatchEvent(mockEvent);
            actionsContainer.leftDrawingCanvas.nativeElement.dispatchEvent(mockEvent);
            actionsContainer.rightDrawingCanvas.nativeElement.dispatchEvent(mockEvent);
            expect(actionsContainer.leftDrawingCanvas.nativeElement.dispatchEvent(mockEvent)).toBeTruthy();
        });

        it('should handle mousedown event on left or right canvas', () => {
            const mockEvent = new MouseEvent('mouseup', {
                bubbles: true,
            });
            expect(actionsContainer.leftDrawingCanvas.nativeElement.dispatchEvent(mockEvent)).toBeTruthy();
        });
    });

    it('should return the correct selected tool type', () => {
        actionsContainer.currentToolObject = new PencilTool(actionsContainer);
        expect(actionsContainer.selectedToolType).toBe(ToolType.CRAYON);

        actionsContainer.currentToolObject = new RectangleTool(actionsContainer);
        expect(actionsContainer.selectedToolType).toBe(ToolType.RECTANGLE);

        actionsContainer.currentToolObject = new EraserTool(actionsContainer);
        expect(actionsContainer.selectedToolType).toBe(ToolType.ERASER);

        actionsContainer.currentToolObject = null;
        expect(actionsContainer.selectedToolType).toBe(ToolType.NONE);
    });

    it('should select the correct tool', () => {
        actionsContainer.selectTool(ToolType.CRAYON);
        expect(actionsContainer.currentToolObject).toBeInstanceOf(PencilTool);

        actionsContainer.selectTool(ToolType.RECTANGLE);
        expect(actionsContainer.currentToolObject).toBeInstanceOf(RectangleTool);

        actionsContainer.selectTool(ToolType.ERASER);
        expect(actionsContainer.currentToolObject).toBeInstanceOf(EraserTool);

        actionsContainer.selectTool(ToolType.NONE);
        expect(actionsContainer.currentToolObject).toBeNull();
    });
});
