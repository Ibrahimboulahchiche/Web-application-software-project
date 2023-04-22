import { AbstractTool } from '@app/classes/abstract-tool/abstract-tool';
import { RectangleElement } from '@app/classes/rectangle-element/rectangle-element';
import { SwitchElement } from '@app/classes/switch-element/switch-element';
import { Vector2 } from '@common/classes/vector2';

export class RectangleTool extends AbstractTool {
    use(context: CanvasRenderingContext2D, event: MouseEvent): void {
        const lastAction = this.actionsContainer.undoActions[this.actionsContainer.undoActions.length - 1];

        let width = event.offsetX - this.actionsContainer.initialPosition.x;
        let height = event.offsetY - this.actionsContainer.initialPosition.y;
        if (this.actionsContainer.previousRectangle) {
            context.clearRect(
                this.actionsContainer.initialPosition.x,
                this.actionsContainer.initialPosition.y,
                this.actionsContainer.previousRectangle.x - this.actionsContainer.initialPosition.x,
                this.actionsContainer.previousRectangle.y - this.actionsContainer.initialPosition.y,
            );
        }

        context.beginPath();
        if (event.shiftKey) {
            const size = Math.min(Math.abs(width), Math.abs(height));
            width = Math.sign(width) * size;
            height = Math.sign(height) * size;
        }
        context.fillRect(this.actionsContainer.initialPosition.x, this.actionsContainer.initialPosition.y, width, height);

        lastAction.pixels[1] = new Vector2(width + this.actionsContainer.initialPosition.x, height + this.actionsContainer.initialPosition.y);
        this.actionsContainer.previousRectangle = new Vector2(
            width + this.actionsContainer.initialPosition.x,
            height + this.actionsContainer.initialPosition.y,
        );
        this.redoClearedPixels();
        lastAction.applyElementAction(context);
    }

    redoClearedPixels() {
        if (this.actionsContainer.undoActions.length > 1) {
            const width = this.actionsContainer.leftDrawingCanvas.nativeElement.width;
            const height = this.actionsContainer.leftDrawingCanvas.nativeElement.height;
            this.actionsContainer.leftContext.clearRect(0, 0, width, height);
            this.actionsContainer.rightContext.clearRect(0, 0, width, height);

            for (let i = 0; i < this.actionsContainer.undoActions.length - 1; i++) {
                const action = this.actionsContainer.undoActions[i];
                const activeContext =
                    action.isSourceLeftCanvas || action instanceof SwitchElement
                        ? this.actionsContainer.leftContext
                        : this.actionsContainer.rightContext;

                action.applyElementAction(activeContext);
            }
        }
    }

    addUndoElementToActionsContainer(modifiedPixels: Vector2[], isLeftCanvas: boolean): void {
        this.actionsContainer.undoActions.push(
            new RectangleElement(modifiedPixels, isLeftCanvas, this.actionsContainer.penWidth, this.actionsContainer.color),
        );
    }
}
