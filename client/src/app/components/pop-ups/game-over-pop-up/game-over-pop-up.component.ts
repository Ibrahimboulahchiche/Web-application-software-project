import { Component, ElementRef, ViewChild } from '@angular/core';
import { Action } from '@common/classes/action';
import { MatchType } from '@common/enums/match.type';
import { GameOverPopUpData } from '@common/interfaces/game.over.pop.up.data';
import { RankingData } from '@common/interfaces/ranking.data';
import {
    EXCELLENT_GAME_TEXT,
    MAIN_MENU_TEXT,
    NO_TEXT,
    OPPONENT_QUITTED_THE_GAME_TEXT,
    PARTNER_LEFT_THE_GAME_TEXT,
    QUITTING_CONFIRMATION_TEXT,
    REPLAY_MODE_TEXT,
    YES_TEXT,
} from '@common/utils/constants';

@Component({
    selector: 'app-game-over-pop-up',
    templateUrl: './game-over-pop-up.component.html',
    styleUrls: ['./game-over-pop-up.component.scss'],
})
export class GameOverPopUpComponent {
    @ViewChild('bgModal') modal!: ElementRef;

    popUpInfo: {
        title: string;
        message: string;
        option1: string;
        option2: string;
        isConfirmation: boolean;
        isGameOver: boolean;
        option2Action: Action<void> | null;
    }[] = [];
    isLimitedTime: boolean = false;

    displayConfirmation() {
        this.popUpInfo.splice(0, this.popUpInfo.length);
        this.popUpInfo.push({
            title: QUITTING_CONFIRMATION_TEXT,
            message: '',
            option1: YES_TEXT,
            option2: NO_TEXT,
            isConfirmation: true,
            isGameOver: false,
            option2Action: null,
        });
        this.display();
    }

    displayGameOver(gameOverData: GameOverPopUpData) {
        let winMessage;
        let secondaryMessage = EXCELLENT_GAME_TEXT;

        if (gameOverData.matchType === MatchType.LimitedCoop) {
            this.isLimitedTime = true;
            winMessage = `Félicitations ${gameOverData.username1} et ${gameOverData.username2} vous avez remporté la partie !`;
        } else {
            if (gameOverData.matchType === MatchType.LimitedSolo || gameOverData.matchType === MatchType.Solo)
                winMessage = 'Félicitations vous avez remporté la partie !';
            else winMessage = `${gameOverData.username1} a remporté la partie !`;
        }
        if (gameOverData.matchType === MatchType.LimitedSolo || gameOverData.matchType === MatchType.LimitedCoop) {
            if (gameOverData.isTimerDepleted) {
                winMessage = 'Le temps est écoulé!';
                secondaryMessage = 'Dommage...';
            }
        }
        if (gameOverData.isWinByDefault) {
            secondaryMessage = OPPONENT_QUITTED_THE_GAME_TEXT;
        }
        this.popUpInfo.splice(0, this.popUpInfo.length);
        this.popUpInfo.push({
            title: winMessage,
            message: secondaryMessage,
            option1: MAIN_MENU_TEXT,
            option2: gameOverData.matchType === MatchType.Solo || gameOverData.matchType === MatchType.OneVersusOne ? REPLAY_MODE_TEXT : '',
            isConfirmation: false,
            isGameOver: true,
            option2Action:
                gameOverData.matchType === MatchType.Solo || gameOverData.matchType === MatchType.OneVersusOne
                    ? gameOverData.startReplayAction
                    : null,
        });
        this.display();
    }

    updateNewBreakingScore(rankingData: RankingData) {
        {
            const winMessage = `Félicitations vous obtenez la ${rankingData.position} 
            place dans les meilleurs temps du jeu ${rankingData.gameName} en ${rankingData.matchType}`;
            this.popUpInfo[0].message = winMessage;
        }
    }

    displayLimitedGameOver(players: { username1: string; username2: string }, isWinByDefault: boolean, isSoloMode: boolean) {
        this.isLimitedTime = true;
        const soloMessage = `Félicitations ${players.username1} vous avez remporté !`;
        const multiPlayerMessage = `Félicitations ${players.username1 + ' ' + players.username2} vous avez remporté !`;
        const titleMessage = isSoloMode ? soloMessage : multiPlayerMessage;
        this.popUpInfo.splice(0, this.popUpInfo.length);
        this.popUpInfo.push({
            title: isWinByDefault ? soloMessage : titleMessage,
            message: isWinByDefault ? PARTNER_LEFT_THE_GAME_TEXT : EXCELLENT_GAME_TEXT,
            option1: MAIN_MENU_TEXT,
            option2: '',
            isConfirmation: false,
            isGameOver: true,
            option2Action: null,
        });
        this.display();
    }

    closePopUp() {
        this.modal.nativeElement.style.display = 'none';
        this.popUpInfo[0]?.option2Action?.invoke();
    }

    display() {
        this.modal.nativeElement.style.display = 'flex';
    }
}
