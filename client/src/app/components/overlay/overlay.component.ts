import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DeleteGamesPopUpComponent } from '@app/components/pop-ups/delete-games-pop-up/delete-games-pop-up.component';
import { ResetPopUpComponent } from '@app/components/pop-ups/reset-pop-up/reset-pop-up.component';
import { GamesService } from '@app/services/games-service/games.service';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { MatchType } from '@common/enums/match.type';
import { REGISTRATION_PATH } from '@common/utils/env.http';

@Component({
    selector: 'app-overlay',
    templateUrl: './overlay.component.html',
    styleUrls: ['./overlay.component.scss'],
})
export class OverlayComponent {
    @Input() isPlayable: boolean;
    @Input() id: string;
    @Input() matchToJoinIfAvailable: string | null = null;
    @ViewChild('deletePopUpElement') deletePopUpElement: DeleteGamesPopUpComponent;
    @ViewChild('resetPopUpElement') resetPopUpElement: ResetPopUpComponent;

    constructor(
        private readonly matchmakingService: MatchmakingService,
        private readonly router: Router,
        private readonly gamesService: GamesService,
    ) {}

    requestGameCreationToServer(matchType: MatchType): void {
        this.matchmakingService.createGame(this.id);
        this.matchmakingService.setCurrentMatchType(matchType);
    }

    createOneVersusOneGame(): void {
        this.requestGameCreationToServer(MatchType.OneVersusOne);
        this.router.navigate([REGISTRATION_PATH, this.id]);
    }

    createSoloGame(): void {
        this.requestGameCreationToServer(MatchType.Solo);
        this.router.navigate([REGISTRATION_PATH, this.id]);
    }

    joinGame(): void {
        if (!this.matchToJoinIfAvailable) return;
        this.matchmakingService.joinGame(this.matchToJoinIfAvailable, this.id);
        this.router.navigate([REGISTRATION_PATH, this.id]);
    }

    showDeletePopUp(): void {
        this.deletePopUpElement.showPopUp(false);
    }

    showResetPopUp(): void {
        this.resetPopUpElement.showPopUp(false);
    }

    deleteSelectedGame(isDeleteRequest: boolean): void {
        this.gamesService.deleteById(isDeleteRequest, this.id);
    }

    resetSelectedGame(isResetRequest: boolean): void {
        this.gamesService.resetById(isResetRequest, this.id);
    }

    reloadPage(): void {
        window.location.reload();
    }
}
