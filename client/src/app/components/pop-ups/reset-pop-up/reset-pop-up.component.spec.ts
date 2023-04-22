import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetPopUpComponent } from './reset-pop-up.component';

describe('ResetPopUpComponent', () => {
    let component: ResetPopUpComponent;
    let fixture: ComponentFixture<ResetPopUpComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ResetPopUpComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ResetPopUpComponent);
        component = fixture.componentInstance;
        component.modal = jasmine.createSpyObj('ElementRef', ['nativeElement']);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit true when emitDeleteRequestConfirmation is called', () => {
        spyOn(component.isResetRequest, 'emit');
        component.emitResetRequestConfirmation();
        expect(component.isResetRequest.emit).toHaveBeenCalledWith(true);
    });

    it('should emit false when closePopUp is called', () => {
        spyOn(component.isResetRequest, 'emit');
        component.modal = { nativeElement: { style: { display: 'flex' } } };
        component.closePopUp();
        expect(component.isResetRequest.emit).toHaveBeenCalledWith(false);
    });

    it('should show pop up when showPopUp is called', () => {
        component.modal = { nativeElement: { style: { display: 'none' } } };
        component.displayPopUp();
        expect(component.modal.nativeElement.style.display).toBe('flex');
    });

    it('should close pop up when closePopUp is called', () => {
        component.modal = { nativeElement: { style: { display: 'flex' } } };
        component.closePopUp();
        expect(component.modal.nativeElement.style.display).toBe('none');
    });

    it('should show pop up when showDeleteGamesPopUp is true', () => {
        component.modal = { nativeElement: { style: { display: 'none' } } };
        component.showPopUp(true);
        expect(component.modal.nativeElement.style.display).toBe('flex');
    });

    it('should show the popUp when isallGames is false', () => {
        component.modal = { nativeElement: { style: { display: 'none' } } };
        component.showPopUp(false);
        expect(component.modal.nativeElement.style.display).toBe('flex');
    });
});
