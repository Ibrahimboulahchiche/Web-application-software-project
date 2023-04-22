import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { EntireGameUploadForm } from '@common/interfaces/entire.game.upload.form';
import { MAX_NBR_OF_DIFFERENCES, MIN_NBR_OF_DIFFERENCES } from '@common/utils/constants';
import { HOME_PATH, SAVE_GAMES_PATH } from '@common/utils/env.http';

@Component({
    selector: 'app-creation-result-modal',
    templateUrl: './creation-result-modal.component.html',
    styleUrls: ['./creation-result-modal.component.scss'],
})
export class CreationResultModalComponent {
    static readonly maxNumberOfDifferences: number = MAX_NBR_OF_DIFFERENCES;
    static readonly minNumberOfDifferences: number = MIN_NBR_OF_DIFFERENCES;

    @Input() totalDifferences: number;
    @Input() isEasy: boolean;

    @ViewChild('bgModal') modal!: ElementRef;
    @ViewChild('imagePreview') imagePreview!: ElementRef;
    @ViewChild('gameNameForm') gameNameForm!: ElementRef;
    @ViewChild('errorPopupText') errorPopupText!: ElementRef;
    @ViewChild('spinner') spinnerComponent!: SpinnerComponent;

    gameName: string = '';
    formToSendAfterServerConfirmation: EntireGameUploadForm;

    titleRegistration = new FormGroup({
        title: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[-a-zA-Z0-9-()]{3,15}(\\s+[-a-zA-Z0-9-()]+)*$')])),
    });

    constructor(private readonly communicationService: CommunicationService, private readonly router: Router) {}

    toggleElementVisibility(element: ElementRef, isVisible: boolean) {
        element.nativeElement.style.display = isVisible ? 'flex' : 'none';
    }

    display() {
        this.toggleElementVisibility(this.gameNameForm, false);
        this.toggleElementVisibility(this.errorPopupText, false);
        this.errorPopupText.nativeElement.style.color = 'red';
        this.modal.nativeElement.style.display = 'flex';
        this.spinnerComponent.showSpinner();
    }

    closePopUp() {
        this.modal.nativeElement.style.display = 'none';
    }

    showGameNameForm(totalDifferences: number, gameForm: EntireGameUploadForm) {
        this.spinnerComponent.hideSpinner();
        this.formToSendAfterServerConfirmation = gameForm;
        if (this.isNumberOfDifferencesValid(totalDifferences)) {
            this.toggleElementVisibility(this.gameNameForm, true);
        } else {
            this.toggleElementVisibility(this.errorPopupText, true);
        }
    }

    sendGameNameToServer(): void {
        const routeToSend = SAVE_GAMES_PATH;

        this.toggleElementVisibility(this.gameNameForm, false);
        this.spinnerComponent.showSpinner();
        this.formToSendAfterServerConfirmation.gameName = this.gameName;

        this.communicationService.post<EntireGameUploadForm>(this.formToSendAfterServerConfirmation, routeToSend).subscribe({
            next: () => {
                this.spinnerComponent.hideSpinner();
                this.closePopUp();
                this.router.navigate([HOME_PATH]);
            },
            error: (err: HttpErrorResponse) => {
                // eslint-disable-next-line no-console
                console.log(err);
            },
        });
    }

    async updateImageDisplay(imgData: ArrayBuffer): Promise<void> {
        try {
            const canvas: HTMLCanvasElement = this.imagePreview.nativeElement;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                const bitmap = await createImageBitmap(new Blob([imgData]));
                ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height, 0, 0, canvas.width, canvas.height);
            }
        } catch (error) {
            // we need this try and catch to handle the error
        }
    }

    isNumberOfDifferencesValid(totalDifferences: number): boolean {
        return (
            totalDifferences >= CreationResultModalComponent.minNumberOfDifferences &&
            totalDifferences <= CreationResultModalComponent.maxNumberOfDifferences
        );
    }

    resetBackgroundCanvas(): void {
        const canvasSize: HTMLCanvasElement = this.imagePreview.nativeElement;

        if (canvasSize) {
            const context = canvasSize.getContext('2d');
            context?.clearRect(0, 0, canvasSize.width, canvasSize.height);
        }
    }
}
