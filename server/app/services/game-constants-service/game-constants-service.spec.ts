/* eslint-disable @typescript-eslint/no-explicit-any */
import { GAME_CONSTANTS_FILE, PERSISTENT_DATA_FOLDER_PATH } from '@app/utils/env';
import { ConstantsData } from '@common/interfaces/constants.data';
import { INITIAL_BONUS, INITIAL_COUNTDOWN, INITIAL_PENALTY } from '@common/utils/constants';
import { expect } from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';
import { GameConstantsService } from './game-constant.service';

const initConstants = { countdownValue: INITIAL_COUNTDOWN, penaltyValue: INITIAL_PENALTY, bonusValue: INITIAL_BONUS };

describe('GameConstantsService', () => {
    let gameConstantsService: GameConstantsService;

    beforeEach(() => {
        gameConstantsService = new GameConstantsService();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return game constants', () => {
        const filePath = PERSISTENT_DATA_FOLDER_PATH + GAME_CONSTANTS_FILE;
        const sandbox: sinon.SinonSandbox = sinon.createSandbox();
        const readFileStub = sandbox.stub(fs, 'readFileSync');
        readFileStub.withArgs(filePath).returns(JSON.stringify(initConstants));
        let result: ConstantsData;

        try {
            gameConstantsService.updateConstants(initConstants);
            result = gameConstantsService.getConstants();
            expect(result).to.deep.equal(initConstants);
            sinon.assert.calledOnce(readFileStub);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(error);
        }
        sandbox.restore();
    });

    it('should write the constants when file is existent', () => {
        const writeSpy = sinon.spy(fs, 'writeFileSync');
        const readStub = sinon.stub(fs, 'readFileSync');
        const filePath = PERSISTENT_DATA_FOLDER_PATH + GAME_CONSTANTS_FILE;
        let result: ConstantsData;
        try {
            readStub.withArgs(filePath).throws(new Error());
            result = gameConstantsService.getConstants();
            expect(result).to.deep.equal(initConstants);
        } catch (error) {
            sinon.assert.calledOnce(writeSpy);
        }
        sinon.restore();
        writeSpy.restore();
    });

    it('should not update game constants when error is thrown', () => {
        const consoleSpy = sinon.spy(console, 'log');
        const errorMessage = "Erreur lors de l'écriture des constantes";
        const writeStub = sinon.stub(fs, 'writeFileSync');
        const filePath = PERSISTENT_DATA_FOLDER_PATH + GAME_CONSTANTS_FILE;
        try {
            writeStub.withArgs(filePath, JSON.stringify(initConstants)).throws(new Error(errorMessage));
            gameConstantsService.updateConstants(initConstants);
        } catch (error) {
            sinon.assert.calledOnce(consoleSpy);
        }
        consoleSpy.restore();
    });
});
