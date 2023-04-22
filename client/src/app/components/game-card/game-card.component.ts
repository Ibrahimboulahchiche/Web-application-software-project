import { Component, Input, OnInit } from '@angular/core';
import { TimerService } from '@app/services/timer-service/timer.service';
import { GameData } from '@common/interfaces/game.data';
@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent implements OnInit {
    @Input() game: { gameData: GameData; originalImage: string; matchToJoinIfAvailable: string | null };
    @Input() isPlayable: boolean;
    difficulty: string;
    originalImageSrc: string;

    constructor(private readonly timerService: TimerService) {}

    get difficultyColor(): string {
        return this.game.gameData.isEasy ? 'green' : 'red';
    }

    scoreToString(timeInSeconds: number) {
        return this.timerService.convertScoreToString(timeInSeconds);
    }

    ngOnInit() {
        this.difficulty = this.game.gameData.isEasy ? 'Facile' : 'Difficile';
        this.originalImageSrc = this.game.originalImage;
    }
}
