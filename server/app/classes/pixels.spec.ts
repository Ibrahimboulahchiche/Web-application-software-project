/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Pixel } from '@common/classes/pixel';
import { expect } from 'chai';
import { describe } from 'mocha';

describe('Pixel', () => {
    it('should have r equal to 255', () => {
        expect(Pixel.white.r).to.equal(255);
    });
    it('should have g equal to 255', () => {
        expect(Pixel.white.g).to.equal(255);
    });
    it('should have b equal to 255', () => {
        expect(Pixel.white.b).to.equal(255);
    });
    it('should have r equal to 0', () => {
        expect(Pixel.black.r).to.equal(0);
    });
    it('should have g equal to 0', () => {
        expect(Pixel.black.g).to.equal(0);
    });
    it('should have b equal to 0', () => {
        expect(Pixel.black.b).to.equal(0);
    });
    it('should set the r value', () => {
        const pixel = new Pixel(1, 2, 3);
        expect(pixel.r).to.equal(1);
    });
    it('should set the g value', () => {
        const pixel = new Pixel(1, 2, 3);
        expect(pixel.g).to.equal(2);
    });
    it('should set the b value', () => {
        const pixel = new Pixel(1, 2, 3);
        expect(pixel.b).to.equal(3);
    });
    it('should return true for equal pixels', () => {
        const pixel1 = new Pixel(1, 2, 3);
        const pixel2 = new Pixel(1, 2, 3);
        expect(pixel1.equals(pixel2)).to.be.true;
    });
    it('should return false for non-equal pixels', () => {
        const pixel1 = new Pixel(1, 2, 3);
        const pixel2 = new Pixel(3, 2, 1);
        expect(pixel1.equals(pixel2)).to.be.false;
    });
    it('should return false for non-equal pixels', () => {
        const pixel1 = new Pixel(1, 5, 3);
        const pixel2 = new Pixel(3, 2, 1);
        expect(pixel1.equals(pixel2)).to.be.false;
    });
    it('should return false for non-equal pixels', () => {
        const pixel1 = new Pixel(3, 2, 3);
        const pixel2 = new Pixel(3, 2, 1);
        expect(pixel1.equals(pixel2)).to.be.false;
    });
    it('should return false for non-equal pixels', () => {
        const pixel1 = new Pixel(3, 2, 3);
        const pixel2 = new Pixel(9, 8, 3);
        expect(pixel1.equals(pixel2)).to.be.false;
    });
});
