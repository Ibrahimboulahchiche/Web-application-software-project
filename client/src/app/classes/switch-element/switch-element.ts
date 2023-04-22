import { UndoElement } from '@app/classes/undo-element-abstract/undo-element.abstract';
import { Vector2 } from '@common/classes/vector2';
import { PEN_WIDTH } from '@common/utils/constants';

export class SwitchElement extends UndoElement {
    leftContext: CanvasRenderingContext2D;
    rightContext: CanvasRenderingContext2D;
    constructor(public isSourceLeftCanvas: boolean = true, public pixels: Vector2[] = [new Vector2(0, 0)]) {
        super(pixels, isSourceLeftCanvas, PEN_WIDTH, 'black');
    }

    loadCanvases(leftContext: CanvasRenderingContext2D, rightContext: CanvasRenderingContext2D) {
        this.leftContext = leftContext;
        this.rightContext = rightContext;
    }

    applyElementAction(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        const leftCanvas = this.leftContext.canvas;
        const rightCanvas = this.rightContext.canvas;
        const tempCanvas = document.createElement('canvas');

        tempCanvas.width = leftCanvas.width;
        tempCanvas.height = leftCanvas.height;

        // Copy the contents of the left canvas to the temporary canvas
        const tempContext = tempCanvas.getContext('2d');
        if (tempContext) {
            tempContext.drawImage(leftCanvas, 0, 0);

            // Copy the contents of the right canvas to the left canvas
            this.leftContext.clearRect(0, 0, leftCanvas.width, leftCanvas.height);
            this.leftContext.drawImage(rightCanvas, 0, 0);

            // Copy the contents of the temporary canvas to the right canvas
            this.rightContext.clearRect(0, 0, rightCanvas.width, rightCanvas.height);
            this.rightContext.drawImage(tempCanvas, 0, 0);
        }

        return context;
    }
}
