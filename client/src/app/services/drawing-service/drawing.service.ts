import { ElementRef, Injectable } from '@angular/core';
import { ActionsContainer, ToolType } from '@app/classes/actions-container/actions-container';
import { ClearElement } from '@app/classes/clear-element/clear-element';
import { DuplicationElement } from '@app/classes/duplication-element/duplication-element';
import { SwitchElement } from '@app/classes/switch-element/switch-element';
import { MAX_PEN_WIDTH, NOT_FOUND, PEN_WIDTH } from '@common/utils/constants';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    penWidth: number = PEN_WIDTH;

    private actionsContainer: ActionsContainer;

    private drawingCanvasOne!: ElementRef;
    private drawingCanvasTwo!: ElementRef;

    private leftDrawingContext: CanvasRenderingContext2D;
    private rightDrawingContext: CanvasRenderingContext2D;

    private pen!: ElementRef;
    private eraser!: ElementRef;
    private rectangle!: ElementRef;

    initialize(drawingCanvasOne: ElementRef, drawingCanvasTwo: ElementRef, toolsElementRefs: ElementRef[]): void {
        this.drawingCanvasOne = drawingCanvasOne;
        this.drawingCanvasTwo = drawingCanvasTwo;
        this.actionsContainer = new ActionsContainer(this.drawingCanvasOne, this.drawingCanvasTwo);

        this.leftDrawingContext = this.drawingCanvasOne.nativeElement.getContext('2d');
        this.rightDrawingContext = this.drawingCanvasTwo.nativeElement.getContext('2d');

        this.pen = toolsElementRefs[0];
        this.eraser = toolsElementRefs[1];
        this.rectangle = toolsElementRefs[2];
    }

    undo() {
        this.actionsContainer.undo();
    }
    redo() {
        this.actionsContainer.redo();
    }

    swapForegrounds() {
        const switchElement = new SwitchElement();
        switchElement.loadCanvases(this.leftDrawingContext, this.rightDrawingContext);

        switchElement.applyElementAction(this.leftDrawingContext);
        this.actionsContainer.undoActions.push(switchElement);
    }

    duplicateCanvas(isSourceRight: boolean) {
        const duplication = new DuplicationElement(!isSourceRight);
        duplication.loadCanvases(this.leftDrawingContext, this.rightDrawingContext);
        duplication.applyElementAction(this.leftDrawingContext);
        this.actionsContainer.undoActions.push(duplication);
    }

    refreshSelectedColor(newColor: string) {
        this.actionsContainer.color = newColor;
    }

    setPenWidth(isIncremented: boolean) {
        this.penWidth = this.penWidth + (isIncremented ? 1 : NOT_FOUND);
        if (this.penWidth < 1) this.penWidth = 1;
        if (this.penWidth > MAX_PEN_WIDTH) this.penWidth = MAX_PEN_WIDTH;

        this.actionsContainer.penWidth = this.penWidth;
    }

    deactivateTools() {
        this.actionsContainer.selectTool(ToolType.NONE);
        this.pen.nativeElement.style.backgroundColor = 'white';
        this.eraser.nativeElement.style.backgroundColor = 'white';
        this.rectangle.nativeElement.style.backgroundColor = 'white';
    }

    selectTool(toolName: string) {
        const toolToSelect: ToolType = ToolType[toolName.toUpperCase() as keyof typeof ToolType];
        if (!(this.actionsContainer.selectedToolType === toolToSelect)) {
            this.actionsContainer.selectTool(toolToSelect);
            this.pen.nativeElement.style.backgroundColor = toolToSelect === ToolType.CRAYON ? 'salmon' : 'white';
            this.eraser.nativeElement.style.backgroundColor = toolToSelect === ToolType.ERASER ? 'salmon' : 'white';
            this.rectangle.nativeElement.style.backgroundColor = toolToSelect === ToolType.RECTANGLE ? 'salmon' : 'white';
        } else {
            this.deactivateTools();
        }
    }

    resetForegroundCanvas(isLeft: boolean) {
        const clearElement = new ClearElement(isLeft);
        clearElement.actionsToCopy = this.actionsContainer.undoActions;
        if (isLeft) {
            clearElement.applyElementAction(this.leftDrawingContext);
        } else {
            clearElement.applyElementAction(this.rightDrawingContext);
        }
        this.actionsContainer.undoActions.push(clearElement);
    }
}
