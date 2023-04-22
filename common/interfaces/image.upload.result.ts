import { Vector2 } from '../classes/vector2';

// This is what the server sends back to the client after they send the ImageUploadForm
// it contains the result image (black and white),
// the number of differences, the generated game id, and the differences
// We need to send all of that to the client because we can't save it directly
// instead, we'll save it once the client confirms that the game is OK
// (they also send the name of the game)
export interface ImageUploadResult {
    resultImageByteArray: number[];
    numberOfDifferences: number;
    generatedGameId: number;
    message: string;
    differences: Vector2[][];
    isEasy: boolean;
}
