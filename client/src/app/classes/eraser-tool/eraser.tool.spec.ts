/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-restricted-imports */
/* eslint-disable no-unused-vars */
import { ElementRef } from '@angular/core';
import { ActionsContainer } from '../actions-container/actions-container';
import { EraserElement } from '../eraser-element/eraser-element';
import { EraserTool } from './eraser.tool';

describe('EraserTool', () => {
    let actionsContainer: ActionsContainer;
    let leftCanvas: ElementRef<HTMLCanvasElement>;
    let rightCanvas: ElementRef<HTMLCanvasElement>;
    let eraserTool: EraserTool;
    let contextMock: CanvasRenderingContext2D;
    beforeEach(() => {
        leftCanvas = { nativeElement: document.createElement('canvas') };
        rightCanvas = { nativeElement: document.createElement('canvas') };
        actionsContainer = new ActionsContainer(leftCanvas, rightCanvas);
        eraserTool = new EraserTool(actionsContainer);
        contextMock = jasmine.createSpyObj('CanvasRenderingContext2D', ['beginPath', 'moveTo', 'lineTo', 'stroke']);
        eraserTool.actionsContainer.undoActions = [];
    });

    it('should create', () => {
        expect(eraserTool).toBeTruthy();
    });

    describe('use', () => {
        beforeEach(() => {
            eraserTool = new EraserTool(actionsContainer);
            contextMock = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', ['beginPath', 'moveTo', 'lineTo', 'stroke']);
            const eraserElement = new EraserElement([], true, 5, '#000000');
            eraserTool.actionsContainer.undoActions.push(eraserElement);
        });

        it('should add new Vector2 to the pixels array of the last action and apply the action', () => {
            const eventMock = {
                offsetX: 100,
                offsetY: 200,
            };
            const lastAction = jasmine.createSpyObj('EraserElement', ['applyElementAction', 'pixels']);
            eraserTool.actionsContainer.undoActions.push(lastAction);
            lastAction.pixels = [{ x: 100, y: 200 }];
            lastAction.applyElementAction.and.callFake(() => {
                return;
            });
            eraserTool.use(contextMock, new MouseEvent('click'));
            expect(lastAction.pixels[0].x).toEqual(eventMock.offsetX);
            expect(lastAction.pixels[0].y).toEqual(eventMock.offsetY);
        });
    });

    describe('addUndoElementToActionsContainer', () => {
        it('should add a new EraserElement to the undoActions array of the actionsContainer', () => {
            const modifiedPixelsMock = [jasmine.createSpyObj('Vector2', ['x', 'y'])];
            const isLeftCanvasMock = true;
            eraserTool.actionsContainer.undoActions = [];
            eraserTool.addUndoElementToActionsContainer(modifiedPixelsMock, isLeftCanvasMock);
            expect(eraserTool.actionsContainer).not.toBeUndefined();
        });
    });
});
