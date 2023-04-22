import { Vector2 } from '@common/classes/vector2';
import { GameData } from '@common/interfaces/game.data';
import { NOT_FOUND } from '@common/utils/constants';
import { Service } from 'typedi';

@Service()
export class MatchingDifferencesService {
    getDifferenceIndex(game: GameData, clickPosition: Vector2): number {
        if (!game || !game.differences) return NOT_FOUND;

        const differences = game.differences;
        for (let i = 0; i < differences.length; i++) {
            const difference = differences[i];
            for (const position of difference) {
                if (position.x === clickPosition.x && position.y === clickPosition.y) {
                    return i;
                }
            }
        }
        return NOT_FOUND;
    }
}
