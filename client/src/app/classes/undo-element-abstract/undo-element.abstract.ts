import { Vector2 } from '@common/classes/vector2';
import { PEN_WIDTH } from '@common/utils/constants';
export abstract class UndoElement {
    // we need those parameters to have enough data to undo the action
    // eslint-disable-next-line max-params
    constructor(public pixels: Vector2[], public isSourceLeftCanvas: boolean, public penWidth = PEN_WIDTH, public color: string = 'black') {}
    abstract applyElementAction(context: CanvasRenderingContext2D): CanvasRenderingContext2D;
}
