import { expect } from 'chai';
import { describe } from 'mocha';
import { Vector2 } from './vector2';

describe('HttpException', () => {
    it('vector construction should have two attributes', () => {
        const vector = new Vector2(0, 0);
        expect(vector.x).to.equal(0);
        expect(vector.y).to.equal(0);
    });
});
