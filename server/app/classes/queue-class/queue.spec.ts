/* eslint-disable @typescript-eslint/no-magic-numbers */
import { assert, expect } from 'chai';
import { describe } from 'mocha';
import { Queue } from './queue';

describe('Queue', () => {
    let q: Queue<[]>;
    beforeEach(async () => {
        q = new Queue<[]>();
    });

    it('queue should initialize with array uppon construction', () => {
        expect(q['queue']).to.deep.equal([]);
    });

    it('length should return difference between end and start', () => {
        const length = 0;
        const ret = q.length;
        expect(ret).to.deep.equal(length);
    });

    it('isEmpty should return if queue is empty', () => {
        const val = q.isEmpty();
        expect(val).to.equal(true);
    });

    it('dequeue should throw error if queue is already empy', () => {
        expect(() => {
            q.dequeue();
        }).to.throw('Queue is empty.');
    });

    it('dequeue should return element', () => {
        q.enqueue([]);
        const element = q.dequeue();
        expect(element).to.deep.equal(q['queue'][0]);
    });
    it('toString method should return the correct length of the queue', () => {
        q['end'] = 10;
        q['start'] = 5;
        expect(q.toString()).to.equal('Queue (5)');
    });
    it('Should have an iterator', () => {
        expect(q).to.have.property(Symbol.iterator);
        assert.isFunction(q[Symbol.iterator]);
    });

    it('Should correctly iterate over the elements in the queue', () => {
        const queue = new Queue<number>([1, 2, 3, 4, 5]);
        queue['start'] = 0;
        queue['end'] = 5;

        const expected = [1, 2, 3, 4, 5];
        let index = 0;
        for (const value of queue) {
            assert.equal(value, expected[index]);
            index++;
        }
    });
});
