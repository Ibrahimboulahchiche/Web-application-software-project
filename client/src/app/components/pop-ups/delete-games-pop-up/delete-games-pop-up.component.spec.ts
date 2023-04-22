import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteGamesPopUpComponent } from './delete-games-pop-up.component';

describe('DeleteGamesPopUpComponent', () => {
    let component: DeleteGamesPopUpComponent;
    let fixture: ComponentFixture<DeleteGamesPopUpComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DeleteGamesPopUpComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(DeleteGamesPopUpComponent);
        component = fixture.componentInstance;
        component.modal = jasmine.createSpyObj('ElementRef', ['nativeElement']);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit true when emitDeleteRequestConfirmation is called', () => {
        spyOn(component.isDeleteRequest, 'emit');
        component.emitDeleteRequestConfirmation();
        expect(component.isDeleteRequest.emit).toHaveBeenCalledWith(true);
    });

    it('should emit false when closePopUp is called', () => {
        spyOn(component.isDeleteRequest, 'emit');
        component.modal = { nativeElement: { style: { display: 'flex' } } };
        component.closePopUp();
        expect(component.isDeleteRequest.emit).toHaveBeenCalledWith(false);
    });

    it('should show pop up when showPopUp is called', () => {
        component.modal = { nativeElement: { style: { display: 'none' } } };
        component.showPopUp(true);
        expect(component.modal.nativeElement.style.display).toBe('flex');
    });

    it('should close pop up when closePopUp is called', () => {
        component.modal = { nativeElement: { style: { display: 'flex' } } };
        component.closePopUp();
        expect(component.modal.nativeElement.style.display).toBe('none');
    });

    it('should show the popUp when isallGames is false', () => {
        component.modal = { nativeElement: { style: { display: 'none' } } };
        component.showPopUp(false);
        expect(component.modal.nativeElement.style.display).toBe('flex');
    });
});
