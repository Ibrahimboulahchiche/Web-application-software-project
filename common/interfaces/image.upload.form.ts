import { DifferenceImage } from './difference.image';

// This is what the client sends FIRST when they want to create a game
// it's a form that contains the two images and the radius
export interface ImageUploadForm {
    firstImage: DifferenceImage;
    secondImage: DifferenceImage;
    radius: number;
}
