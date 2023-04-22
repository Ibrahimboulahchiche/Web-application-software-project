import { Action } from '@common/classes/action';
import { MatchType } from '@common/enums/match.type';

export interface GameOverPopUpData {
    isWinByDefault: boolean;
    isTimerDepleted: boolean;
    matchType: MatchType;
    startReplayAction: Action<void> | null;
    username1: string | undefined;
    username2: string | undefined;
}
