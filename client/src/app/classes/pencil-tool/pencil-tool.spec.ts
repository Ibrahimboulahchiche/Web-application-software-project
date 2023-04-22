/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-restricted-imports */
/* eslint-disable no-unused-vars */
import { ElementRef } from '@angular/core';
import { ActionsContainer } from '../actions-container/actions-container';
import { EraserElement } from '../eraser-element/eraser-element';
import { PencilTool } from './pencil-tool';

describe('pencilTool', () => {
    let actionsContainer: ActionsContainer;
    let leftCanvas: ElementRef<HTMLCanvasElement>;
    let rightCanvas: ElementRef<HTMLCanvasElement>;
    let pencilTool: PencilTool;
    let contextMock: CanvasRenderingContext2D;
    beforeEach(() => {
        leftCanvas = { nativeElement: document.createElement('canvas') };
        rightCanvas = { nativeElement: document.createElement('canvas') };
        actionsContainer = new ActionsContainer(leftCanvas, rightCanvas);
        pencilTool = new PencilTool(actionsContainer);
        contextMock = jasmine.createSpyObj('CanvasRenderingContext2D', ['beginPath', 'moveTo', 'lineTo', 'stroke']);
        pencilTool.actionsContainer.undoActions = [];
    });

    it('should create', () => {
        expect(pencilTool).toBeTruthy();
    });

    describe('use', () => {
        beforeEach(() => {
            pencilTool = new PencilTool(actionsContainer);
            contextMock = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', ['beginPath', 'moveTo', 'lineTo', 'stroke']);
            const eraserElement = new EraserElement([], true, 5, '#000000');
            pencilTool.actionsContainer.undoActions.push(eraserElement);
        });

        it('should add new Vector2 to the pixels array of the last action and apply the action', () => {
            const eventMock = {
                offsetX: 100,
                offsetY: 200,
            };
            const lastAction = jasmine.createSpyObj('EraserElement', ['applyElementAction', 'pixels']);
            pencilTool.actionsContainer.undoActions.push(lastAction);
            lastAction.pixels = [{ x: 100, y: 200 }];
            lastAction.applyElementAction.and.callFake(() => {
                return;
            });
            pencilTool.use(contextMock, new MouseEvent('click'));
            expect(lastAction.pixels[0].x).toEqual(eventMock.offsetX);
            expect(lastAction.pixels[0].y).toEqual(eventMock.offsetY);
        });
    });

    describe('addUndoElementToActionsContainer', () => {
        it('should add a new EraserElement to the undoActions array of the actionsContainer', () => {
            const modifiedPixelsMock = [jasmine.createSpyObj('Vector2', ['x', 'y'])];
            const isLeftCanvasMock = true;
            pencilTool.actionsContainer.undoActions = [];

            pencilTool.addUndoElementToActionsContainer(modifiedPixelsMock, isLeftCanvasMock);
            expect(pencilTool.actionsContainer).not.toBeUndefined();
        });
    });
});
