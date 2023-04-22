import { UndoElement } from '@app/classes/undo-element-abstract/undo-element.abstract';
import { Vector2 } from '@common/classes/vector2';
import { PEN_WIDTH } from '@common/utils/constants';

export class ClearElement extends UndoElement {
    actionsToCopy: UndoElement[];
    leftContext: CanvasRenderingContext2D;
    rightContext: CanvasRenderingContext2D;
    constructor(public isSourceLeftCanvas: boolean = true, public pixels: Vector2[] = [new Vector2(0, 0)]) {
        super(pixels, isSourceLeftCanvas, PEN_WIDTH, 'black');
    }

    applyElementAction(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        return context;
    }
}
