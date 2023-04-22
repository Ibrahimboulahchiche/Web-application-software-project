import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuitButtonComponent } from './quit-button.component';

describe('QuitButtonComponent', () => {
    let component: QuitButtonComponent;
    let fixture: ComponentFixture<QuitButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [QuitButtonComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(QuitButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
