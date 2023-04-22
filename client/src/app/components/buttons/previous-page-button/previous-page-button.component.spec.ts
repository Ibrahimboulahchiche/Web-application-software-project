import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousPageButtonComponent } from './previous-page-button.component';

describe('PreviousPageButtonComponent', () => {
    let component: PreviousPageButtonComponent;
    let fixture: ComponentFixture<PreviousPageButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PreviousPageButtonComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PreviousPageButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
