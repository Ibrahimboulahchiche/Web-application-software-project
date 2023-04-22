import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { ALL_GAMES_TEXT, NO_TEXT, RESET_TEXT, THIS_GAME_TEXT, YES_TEXT } from '@common/utils/constants';

@Component({
    selector: 'app-reset-pop-up',
    templateUrl: './reset-pop-up.component.html',
    styleUrls: ['./reset-pop-up.component.scss'],
})
export class ResetPopUpComponent {
    @ViewChild('modal') modal!: ElementRef;
    @Output() isResetRequest = new EventEmitter<boolean>();

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
            title: RESET_TEXT + message,
            message: '',
            option1: YES_TEXT,
            option2: NO_TEXT,
            isAllGames,
        });

        this.displayPopUp();
    }

    emitResetRequestConfirmation() {
        this.isResetRequest.emit(true);
    }

    displayPopUp() {
        this.modal.nativeElement.style.display = 'flex';
    }

    closePopUp() {
        this.isResetRequest.emit(false);
        this.modal.nativeElement.style.display = 'none';
    }
}
