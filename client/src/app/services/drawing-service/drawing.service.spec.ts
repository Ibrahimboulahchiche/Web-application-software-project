/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ToolType } from '@app/classes/actions-container/actions-container';
import { DrawingService } from '@app/services/drawing-service/drawing.service';

describe('DrawingService', () => {
    let service: DrawingService;
    let drawingCanvasOne: ElementRef;
    let drawingCanvasTwo: ElementRef;
    let toolsElementRefs: ElementRef[];

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingService);

        drawingCanvasOne = new ElementRef(document.createElement('canvas'));
        drawingCanvasTwo = new ElementRef(document.createElement('canvas'));
        toolsElementRefs = [
            new ElementRef(document.createElement('div')),
            new ElementRef(document.createElement('div')),
            new ElementRef(document.createElement('div')),
        ];

        service.initialize(drawingCanvasOne, drawingCanvasTwo, toolsElementRefs);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should undo', () => {
        service.undo();
        expect(service['actionsContainer'].undoActions[0]).toBeUndefined();
    });

    it('should redo', () => {
        service.redo();
        expect(service['actionsContainer'].redoActions.length).toBe(0);
    });

    it('should swap foregrounds', () => {
        service.swapForegrounds();
        expect(service['actionsContainer'].undoActions.length).toBe(1);
    });

    it('should duplicate canvas', () => {
        service.duplicateCanvas(true);
        expect(service['actionsContainer'].undoActions.length).toBe(1);
    });

    it('should refresh selected color', () => {
        service.refreshSelectedColor('#123456');
        expect(service['actionsContainer'].color).toBe('#123456');
    });

    it('should set pen width', () => {
        service.setPenWidth(true);
        expect(service.penWidth).toBe(11);

        service.setPenWidth(false);
        expect(service.penWidth).toBe(10);

        service.penWidth = 1;
        service.setPenWidth(false);
        expect(service.penWidth).toBe(1);
    });

    it('should not exceed max pen width', () => {
        service.penWidth = 100;
        service.setPenWidth(true);
        expect(service.penWidth).toBe(20);
    });

    it('should deactivate tools', () => {
        service.deactivateTools();
        expect(service['actionsContainer'].selectedToolType).toBe(ToolType.NONE);
    });

    it('should select tool', () => {
        service.selectTool('crayon');
        expect(service['actionsContainer'].selectedToolType).toBe(ToolType.CRAYON);

        service.selectTool('eraser');
        expect(service['actionsContainer'].selectedToolType).toBe(ToolType.ERASER);

        service.selectTool('rectangle');
        expect(service['actionsContainer'].selectedToolType).toBe(ToolType.RECTANGLE);

        service.selectTool('rectangle');
        expect(service['actionsContainer'].selectedToolType).toBe(ToolType.NONE);
    });

    it('should reset foreground canvas', () => {
        service.resetForegroundCanvas(true);
        expect(service['actionsContainer'].undoActions.length).toBe(1);

        service.resetForegroundCanvas(false);
        expect(service['actionsContainer'].undoActions.length).toBe(2);
    });
});
