import { UndoElement } from '@app/classes/undo-element-abstract/undo-element.abstract';

export class RectangleElement extends UndoElement {
    applyElementAction(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.beginPath();
        context.strokeStyle = this.color;
        context.fillStyle = this.color;
        context.moveTo(this.pixels[0].x, this.pixels[0].y);
        const rectStart = this.pixels[0];
        const rectEnd = this.pixels[1];
        if (rectStart && rectEnd) context.fillRect(rectStart.x, rectStart.y, rectEnd.x - rectStart.x, rectEnd.y - rectStart.y);
        return context;
    }
}
