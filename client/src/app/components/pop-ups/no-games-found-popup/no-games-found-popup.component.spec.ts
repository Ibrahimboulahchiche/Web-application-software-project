import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoGamesFoundPopupComponent } from './no-games-found-popup.component';

describe('NoGamesFoundPopupComponent', () => {
    let component: NoGamesFoundPopupComponent;
    let fixture: ComponentFixture<NoGamesFoundPopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NoGamesFoundPopupComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(NoGamesFoundPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
