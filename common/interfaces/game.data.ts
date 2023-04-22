import { Vector2 } from '../classes/vector2';
import { Ranking } from './ranking';

export interface GameData {
    id: number;
    name: string;
    isEasy: boolean;
    nbrDifferences: number;
    differences: Vector2[][]; // array of all the pixels in a difference
    oneVersusOneRanking: Ranking[];
    soloRanking: Ranking[];
}
