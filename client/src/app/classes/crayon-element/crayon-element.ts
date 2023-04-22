import { UndoElement } from '@app/classes/undo-element-abstract/undo-element.abstract';

export class CrayonElement extends UndoElement {
    applyElementAction(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.beginPath();
        context.strokeStyle = this.color;
        context.lineWidth = this.penWidth;
        context.lineCap = 'round';

        const stroke = this.pixels;

        if (stroke.length > 1) {
            // Create additional points between two consecutive points based on their distance
            const smoothStroke = [stroke[0]];
            for (const [index, currentPoint] of stroke.slice(1).entries()) {
                const prevPoint = stroke[index];
                const distance = Math.sqrt((prevPoint.x - currentPoint.x) ** 2 + (prevPoint.y - currentPoint.y) ** 2);
                const subDivisions = Math.max(Math.round(distance), 1);
                for (let j = 1; j <= subDivisions; j++) {
                    const point = {
                        x: prevPoint.x + (currentPoint.x - prevPoint.x) * (j / (subDivisions * 2)),
                        y: prevPoint.y + (currentPoint.y - prevPoint.y) * (j / (subDivisions * 2)),
                    };
                    smoothStroke.push(point);
                }
            }

            // Draw the smoothed stroke
            context.moveTo(smoothStroke[0].x, smoothStroke[0].y);
            for (const point of smoothStroke.slice(1)) {
                context.lineTo(point.x, point.y);
            }
        } else if (stroke.length === 1) {
            context.moveTo(stroke[0].x, stroke[0].y);
            context.lineTo(stroke[0].x, stroke[0].y);
        }

        context.stroke();

        return context;
    }
}
