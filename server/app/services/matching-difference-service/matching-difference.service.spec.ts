import { Vector2 } from '@common/classes/vector2';
import { GameData } from '@common/interfaces/game.data';
import { defaultRanking } from '@common/interfaces/ranking';
import { NOT_FOUND } from '@common/utils/constants';
import { expect } from 'chai';
import { assert } from 'console';
import * as sinon from 'sinon';
import { MatchingDifferencesService } from './matching-differences.service';

describe('MatchingDifferences service', () => {
    let differenceService: MatchingDifferencesService;
    let gameData: GameData;
    let click: Vector2;

    beforeEach(async () => {
        differenceService = new MatchingDifferencesService();
        gameData = {
            id: 0,
            name: 'myGame',
            isEasy: true,
            nbrDifferences: 7,
            differences: [
                [
                    { x: 1, y: 2 },
                    { x: 3, y: 4 },
                ],
                [
                    { x: 5, y: 6 },
                    { x: 7, y: 8 },
                ],
            ],
            oneVersusOneRanking: defaultRanking,
            soloRanking: defaultRanking,
        };
        click = { x: 3, y: 4 };
    });

    it('getDifference should be called with a game and a vector of clicks', () => {
        const methodSpy = sinon.spy(differenceService, 'getDifferenceIndex');
        assert(methodSpy.calledWith(gameData, click));
    });

    it('should return the index of the difference that matches the click position', () => {
        const result = differenceService.getDifferenceIndex(gameData, click);
        expect(result).to.deep.equal(0);
    });

    it('getDIfference should return -1 if none have been found', () => {
        click = { x: 0, y: 0 };
        const result = differenceService.getDifferenceIndex(gameData, click);
        expect(result).to.deep.equal(NOT_FOUND);
    });
});
