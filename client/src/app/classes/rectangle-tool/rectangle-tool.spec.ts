/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActionsContainer } from '@app/classes/actions-container/actions-container';
import { RectangleElement } from '@app/classes/rectangle-element/rectangle-element';
import { Vector2 } from '@common/classes/vector2';
import { RectangleTool } from './rectangle-tool';
describe('RectangleTool', () => {
    let tool: RectangleTool;
    let context: CanvasRenderingContext2D;

    let actionsContainer: ActionsContainer;
    let leftCanvas: ElementRef<HTMLCanvasElement>;
    let rightCanvas: ElementRef<HTMLCanvasElement>;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        leftCanvas = { nativeElement: document.createElement('canvas') };
        rightCanvas = { nativeElement: document.createElement('canvas') };
        actionsContainer = new ActionsContainer(leftCanvas, rightCanvas);
        tool = new RectangleTool(actionsContainer);
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        context = canvas.getContext('2d') as CanvasRenderingContext2D;
        tool.actionsContainer.leftDrawingCanvas = { nativeElement: canvas };
        tool.actionsContainer.leftContext = context;
    });

    it('should create', () => {
        expect(tool).toBeTruthy();
    });

    it('should use the tool to draw a rectangle and erase previous rectangle', () => {
        tool.actionsContainer.initialPosition = new Vector2(0, 0);
        tool.actionsContainer.previousRectangle = new Vector2(5, 5);
        const firstAction = new RectangleElement([new Vector2(1, 2), new Vector2(3, 4)], true);
        const secondAction = new RectangleElement([new Vector2(1, 2), new Vector2(3, 4)], false);
        const thirdAction = new RectangleElement([new Vector2(1, 2), new Vector2(3, 4)], true);
        tool.actionsContainer.undoActions.push(firstAction);
        tool.actionsContainer.undoActions.push(secondAction);
        tool.actionsContainer.undoActions.push(thirdAction);
        const mouseEvent = new MouseEvent('mousedown', { clientX: 10, clientY: 20, shiftKey: false });
        spyOnProperty(mouseEvent, 'offsetX').and.returnValue(10);
        spyOnProperty(mouseEvent, 'offsetY').and.returnValue(20);
        tool.use(context, mouseEvent);
        const expectedElement = new RectangleElement(
            [new Vector2(1, 2), new Vector2(3, 4)],
            true,
            tool.actionsContainer.penWidth,
            tool.actionsContainer.color,
        );
        expect(tool.actionsContainer.undoActions[0]).toEqual(expectedElement);
    });

    it('should use the tool to draw a square when shift key is pressed', () => {
        tool.actionsContainer.initialPosition = new Vector2(0, 0);
        const lastAction = new RectangleElement([new Vector2(1, 2), new Vector2(3, 4)], false);
        tool.actionsContainer.undoActions.push(lastAction);
        const mouseEvent = new MouseEvent('mousedown', { clientX: 10, clientY: 20, shiftKey: true });
        spyOnProperty(mouseEvent, 'offsetX').and.returnValue(10);
        spyOnProperty(mouseEvent, 'offsetY').and.returnValue(20);
        tool.use(context, mouseEvent);
        const expectedElement = new RectangleElement(
            [new Vector2(1, 2), new Vector2(10, 10)],
            false,
            tool.actionsContainer.penWidth,
            tool.actionsContainer.color,
        );
        expect(tool.actionsContainer.undoActions[0]).toEqual(expectedElement);
    });
    it('should add a new rectangle element to the undoActions container', () => {
        tool.addUndoElementToActionsContainer([new Vector2(1, 2), new Vector2(3, 4)], true);
        expect(tool.actionsContainer.undoActions[0].pixels).toEqual([new Vector2(1, 2), new Vector2(3, 4)]);
    });
});
