import { AbstractTool } from '@app/classes/abstract-tool/abstract-tool';
import { CrayonElement } from '@app/classes/crayon-element/crayon-element';
import { Vector2 } from '@common/classes/vector2';

export class PencilTool extends AbstractTool {
    use(context: CanvasRenderingContext2D, event: MouseEvent): void {
        const lastAction = this.actionsContainer.undoActions[this.actionsContainer.undoActions.length - 1];
        lastAction.pixels.push(new Vector2(event.offsetX, event.offsetY));
        lastAction.applyElementAction(context);
    }

    addUndoElementToActionsContainer(modifiedPixels: Vector2[], isLeftCanvas: boolean): void {
        this.actionsContainer.undoActions.push(
            new CrayonElement(modifiedPixels, isLeftCanvas, this.actionsContainer.penWidth, this.actionsContainer.color),
        );
    }
}
