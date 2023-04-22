import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { ALL_GAMES_TEXT, DELETE_TEXT, NO_TEXT, THIS_GAME_TEXT, YES_TEXT } from '@common/utils/constants';

@Component({
    selector: 'app-delete-games-pop-up',
    templateUrl: './delete-games-pop-up.component.html',
    styleUrls: ['./delete-games-pop-up.component.scss'],
})
export class DeleteGamesPopUpComponent {
    @ViewChild('modal') modal: ElementRef;
    @Output() isDeleteRequest = new EventEmitter<boolean>();

    popUpInfo: {
        title: string;
        message: string;
        option1: string;
        option2: string;
        isAllGames: boolean;
    }[] = [];

    showPopUp(isAllGames: boolean) {
        const message = isAllGames ? ALL_GAMES_TEXT : THIS_GAME_TEXT;
        this.popUpInfo.splice(0, this.popUpInfo.length);
        this.popUpInfo.push({
            title: DELETE_TEXT + message,
            message: '',
            option1: YES_TEXT,
            option2: NO_TEXT,
            isAllGames,
        });

        this.displayPopUp();
    }

    emitDeleteRequestConfirmation() {
        this.isDeleteRequest.emit(true);
    }

    displayPopUp() {
        this.modal.nativeElement.style.display = 'flex';
    }

    closePopUp() {
        this.isDeleteRequest.emit(false);
        this.modal.nativeElement.style.display = 'none';
    }
}
