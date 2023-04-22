import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
    let component: SpinnerComponent;
    let fixture: ComponentFixture<SpinnerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SpinnerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SpinnerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should hide spinner', () => {
        component.hideSpinner();
        expect(component.spinner.nativeElement.style.display).toBe('none');
    });

    it('should show spinner', () => {
        component.showSpinner();
        expect(component.spinner.nativeElement.style.display).toBe('flex');
    });
});
