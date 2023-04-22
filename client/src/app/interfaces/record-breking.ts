import { MatchType } from '@common/enums/match.type';

export interface RecordBreaking {
    recordBreakingPlayer: string;
    placePosition: number;
    gameName: string;
    matchType: MatchType;
}
