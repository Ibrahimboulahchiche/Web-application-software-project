import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { ConstantsData } from '@common/interfaces/constants.data';
import { INITIAL_BONUS, INITIAL_COUNTDOWN, INITIAL_PENALTY } from '@common/utils/constants';
import { GAME_CONSTANTS_PATH } from '@common/utils/env.http';

@Injectable({
    providedIn: 'root',
})
export class GameConstantsService {
    constants: ConstantsData = {
        countdownValue: 0,
        penaltyValue: 0,
        bonusValue: 0,
    };

    constructor(public communicationService: CommunicationService) {}

    get countdownValue(): number {
        return this.constants.countdownValue;
    }

    get penaltyValue(): number {
        return this.constants.penaltyValue;
    }

    get bonusValue(): number {
        return this.constants.bonusValue;
    }

    initGameConstants(): void {
        const routeToSend = GAME_CONSTANTS_PATH;
        this.communicationService.get(routeToSend).subscribe({
            next: (response) => {
                if (response.body) {
                    const serverResult = JSON.parse(response.body);
                    this.constants = {
                        countdownValue: serverResult.countdownValue,
                        penaltyValue: serverResult.penaltyValue,
                        bonusValue: serverResult.bonusValue,
                    };
                }
            },
        });
    }

    updateConstants(isReset: boolean): void {
        const routeToSend = GAME_CONSTANTS_PATH;
        const { countdownValue, penaltyValue, bonusValue } = this.constants;
        if (countdownValue === INITIAL_COUNTDOWN && penaltyValue === INITIAL_PENALTY && bonusValue === INITIAL_BONUS) {
            return;
        } else if (isReset) {
            this.constants = {
                countdownValue: INITIAL_COUNTDOWN,
                penaltyValue: INITIAL_PENALTY,
                bonusValue: INITIAL_BONUS,
            };
        }
        this.communicationService.post(this.constants, routeToSend).subscribe({});
    }
}
