/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { ImageManipulationService } from '@app/services/image-manipulation-service/image-manipulation.service';
import { Vector2 } from '@common/classes/vector2';
import { EntireGameUploadForm } from '@common/interfaces/entire.game.upload.form';
import { SAVE_GAMES_PATH } from '@common/utils/env.http';
import { of } from 'rxjs';
import { CreationResultModalComponent } from './creation-result-modal.component';

describe('CreationResultModalComponent', () => {
    let component: CreationResultModalComponent;
    let fixture: ComponentFixture<CreationResultModalComponent>;
    let imageManipulationService: ImageManipulationService;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;

    const mockResponse: HttpResponse<string> = new HttpResponse({
        status: 200,
        body: 'mock response',
    });

    const routerMock = {
        navigate: jasmine.createSpy('navigate'),
    };
    const mockObservable = of(mockResponse);
    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['get', 'post', 'delete']);
        communicationServiceSpy.get.and.returnValue(mockObservable);
        imageManipulationService = new ImageManipulationService();
    });

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['post']);

        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            declarations: [CreationResultModalComponent, SpinnerComponent],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: convertToParamMap({ id: '123' }) },
                    },
                },
                { provide: Router, useValue: routerMock },
                { provide: ImageManipulationService, useValue: imageManipulationService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreationResultModalComponent);
        component = fixture.componentInstance;
        component.modal = jasmine.createSpyObj('ElementRef', ['nativeElement']);
        component.errorPopupText = jasmine.createSpyObj('ElementRef', ['nativeElement']);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show the pop-up', () => {
        component.modal = { nativeElement: { style: { display: 'none' } } };
        component.display();
        expect(component.modal.nativeElement.style.display).toBe('flex');
        expect(component.errorPopupText.nativeElement.style.display).toBe('none');
    });

    it('should close the pop-up', () => {
        component.modal = { nativeElement: { style: { display: 'flex' } } };
        component.closePopUp();
        expect(component.modal.nativeElement.style.display).toBe('none');
    });

    it('should display the game name form', () => {
        const game: EntireGameUploadForm = {
            gameId: 1,
            firstImage: { background: [1, 2, 3, 4, 5, 6, 7] },
            secondImage: { background: [1, 2, 3, 4, 5, 6, 7] },
            differences: [[new Vector2(1, 2)], [new Vector2(1, 2)], [new Vector2(1, 2)]],
            gameName: 'myLastGame',
            isEasy: true,
        };
        component.gameNameForm = { nativeElement: { style: { display: 'none' } } };
        component.showGameNameForm(4, game);
        expect(component.gameNameForm.nativeElement.style.display).toBe('flex');
        component.showGameNameForm(1, game);
        expect(component.gameNameForm.nativeElement.style.display).toBe('flex');
    });

    it('should reset the canvas', () => {
        const canvas = document.createElement('canvas');
        component.imagePreview = { nativeElement: canvas };
        component.resetBackgroundCanvas();
        expect(component.imagePreview).toEqual({ nativeElement: canvas });
    });

    it('updates the image display on the canvas', () => {
        const byteArray = [1, 2, 3, 4];

        const buffer = new ArrayBuffer(byteArray.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < byteArray.length; i++) {
            view[i] = byteArray[i];
        }

        const imgData = new Uint8Array(buffer);
        const canvas = document.createElement('canvas');
        component.imagePreview = { nativeElement: canvas };
        const img = new Image();
        img.src = URL.createObjectURL(new Blob([imgData]));
        component.updateImageDisplay(imgData);
        expect(component.imagePreview).toEqual({ nativeElement: canvas });
    });

    it('should the game name to the server', async () => {
        const game: EntireGameUploadForm = {
            gameId: 1,
            firstImage: { background: [1, 2, 3, 4, 5, 6, 7] },
            secondImage: { background: [1, 2, 3, 4, 5, 6, 7] },
            differences: [[new Vector2(1, 2)]],
            gameName: 'myLastGame',
            isEasy: true,
        };
        component.formToSendAfterServerConfirmation = game;
        communicationServiceSpy.post.and.returnValue(
            of({
                headers: new HttpHeaders(),
                status: 201,
                statusText: 'CREATED',
                url: '',
                body: JSON.stringify({ game }),
                type: 4,
                ok: true,
                clone: (): HttpResponse<string> => new HttpResponse<string>(undefined),
            }),
        );
        component.sendGameNameToServer();
        expect(communicationServiceSpy.post).toHaveBeenCalledWith(game, SAVE_GAMES_PATH);
    });
});
