import { Component, Input } from '@angular/core';
import { GameConstantsService } from '@app/services/game-constants-service/game-constants.service';
import { MatchType } from '@common/enums/match.type';

@Component({
    selector: 'app-info-card',
    templateUrl: './info-card.component.html',
    styleUrls: ['./info-card.component.scss'],
})
export class InfoCardComponent {
    @Input() name: string | undefined;
    @Input() isEasy: boolean | undefined;
    @Input() matchType: MatchType | undefined;
    @Input() gameConstantsService: GameConstantsService | undefined;
    get difficulty() {
        return this.isEasy ? 'Facile' : 'Difficile';
    }

    get matchTypeToString(): string {
        switch (this.matchType) {
            case MatchType.Solo: {
                return 'Classique Solo';
            }
            case MatchType.OneVersusOne: {
                return 'Classique 1v1';
            }
            case MatchType.LimitedCoop: {
                return 'Temps Limité Coop';
            }
            case MatchType.LimitedSolo: {
                return 'Temps Limité Solo';
            }
            default: {
                return 'sus';
            }
        }
    }

    get isSoloMode() {
        return this.matchType === MatchType.Solo || this.matchType === MatchType.LimitedSolo;
    }

    get isLimitedMode() {
        return this.matchType === MatchType.LimitedCoop || this.matchType === MatchType.LimitedSolo;
    }

    get isOneVersusOne() {
        return this.matchType === MatchType.OneVersusOne;
    }

    get matchMode() {
        return this.matchTypeToString;
    }
}
