import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParameterButtonComponent } from './parameters-button.component';

describe('ParameterButtonComponent', () => {
    let component: ParameterButtonComponent;
    let fixture: ComponentFixture<ParameterButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParameterButtonComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ParameterButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
