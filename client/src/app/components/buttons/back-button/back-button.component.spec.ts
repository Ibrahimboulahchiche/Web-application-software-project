import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackButtonComponent } from './back-button.component';

describe('BackButtonComponent', () => {
    let component: BackButtonComponent;
    let fixture: ComponentFixture<BackButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BackButtonComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(BackButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate back in the browser history', () => {
        const spy = spyOn(window.history, 'back');

        component.goBack();

        expect(spy).toHaveBeenCalled();
    });
});
