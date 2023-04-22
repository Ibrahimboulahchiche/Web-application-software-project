import { FIVE_MINUTES_TO_SECONDS, FOUR_MINUTES_TO_SECONDS, THREE_MINUTES_TO_SECONDS } from '@common/utils/constants';
export interface Ranking {
    name: string;
    score: number;
}

export const defaultRanking: Ranking[] = [
    { name: 'Player 1', score: THREE_MINUTES_TO_SECONDS },
    { name: 'Player 2', score: FOUR_MINUTES_TO_SECONDS },
    { name: 'Player 3', score: FIVE_MINUTES_TO_SECONDS },
];
