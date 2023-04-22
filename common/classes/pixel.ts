export class Pixel {
    static readonly white = new Pixel(255, 255, 255);
    static readonly black = new Pixel(0, 0, 0);
    r: number;
    g: number;
    b: number;

    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    equals = (pixel: Pixel): boolean => {
        return this.r === pixel.r && this.g === pixel.g && this.b === pixel.b;
    };
}
