import { ActionsContainer } from '@app/classes/actions-container/actions-container';
import { Vector2 } from '@common/classes/vector2';

export abstract class AbstractTool {
    actionsContainer: ActionsContainer;

    constructor(_actionsContainer: ActionsContainer) {
        this.actionsContainer = _actionsContainer;
    }

    abstract use(context: CanvasRenderingContext2D, event: MouseEvent): void;

    abstract addUndoElementToActionsContainer(modifiedPixels: Vector2[], isLeftCanvas: boolean): void;
}
