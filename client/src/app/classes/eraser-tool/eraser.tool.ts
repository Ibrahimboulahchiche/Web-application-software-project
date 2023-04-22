import { AbstractTool } from '@app/classes/abstract-tool/abstract-tool';
import { EraserElement } from '@app/classes/eraser-element/eraser-element';
import { Vector2 } from '@common/classes/vector2';

export class EraserTool extends AbstractTool {
    use(context: CanvasRenderingContext2D, event: MouseEvent): void {
        const lastAction = this.actionsContainer.undoActions[this.actionsContainer.undoActions.length - 1];
        lastAction.pixels.push(new Vector2(event.offsetX, event.offsetY));
        lastAction.applyElementAction(context);
    }

    addUndoElementToActionsContainer(modifiedPixels: Vector2[], isLeftCanvas: boolean): void {
        this.actionsContainer.undoActions.push(
            new EraserElement(modifiedPixels, isLeftCanvas, this.actionsContainer.penWidth, this.actionsContainer.color),
        );
    }
}
