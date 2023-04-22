/* eslint-disable no-console */
import { GAME_CONSTANTS_FILE, PERSISTENT_DATA_FOLDER_PATH } from '@app/utils/env';
import { ConstantsData } from '@common/interfaces/constants.data';
import { readFileSync, writeFileSync } from 'fs';
import { Service } from 'typedi';

@Service()
export class GameConstantsService {
    getConstants(): ConstantsData {
        let output;
        try {
            const response = readFileSync(PERSISTENT_DATA_FOLDER_PATH + GAME_CONSTANTS_FILE);
            const data = JSON.parse(response.toString());
            output = data;
        } catch (error) {
            writeFileSync(PERSISTENT_DATA_FOLDER_PATH + GAME_CONSTANTS_FILE, '{ countdownValue: 30, penaltyValue: 5, bonusValue: 5 }');
            output = { countdownValue: 30, penaltyValue: 5, bonusValue: 5 };
        }
        return output;
    }

    updateConstants(constants: ConstantsData): void {
        try {
            const filePath = PERSISTENT_DATA_FOLDER_PATH + GAME_CONSTANTS_FILE;
            const data = JSON.stringify(constants);
            writeFileSync(filePath, data);
        } catch (error) {
            console.log(error);
        }
    }
}
