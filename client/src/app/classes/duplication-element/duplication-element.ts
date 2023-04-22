import { UndoElement } from '@app/classes/undo-element-abstract/undo-element.abstract';
import { Vector2 } from '@common/classes/vector2';
import { PEN_WIDTH } from '@common/utils/constants';

export class DuplicationElement extends UndoElement {
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
        const sourceCanvas = this.isSourceLeftCanvas ? this.leftContext.canvas : this.rightContext.canvas;
        const destinationContext = this.isSourceLeftCanvas ? this.rightContext : this.leftContext;

        const tempCanvas = document.createElement('canvas');

        tempCanvas.width = sourceCanvas.width;
        tempCanvas.height = sourceCanvas.height;

        // Use a temp canvas to make a deep copy of the source canvas
        // Workaround to prevent drawing on both canvases at the same time
        const tempContext = tempCanvas.getContext('2d');
        if (tempContext) {
            tempContext.drawImage(sourceCanvas, 0, 0);

            destinationContext.clearRect(0, 0, destinationContext.canvas.width, destinationContext.canvas.height);
            destinationContext.drawImage(tempCanvas, 0, 0);
        }

        return context;
    }
}
