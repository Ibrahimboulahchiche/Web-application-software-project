import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HintComponent } from './hint.component';

describe('HintComponent', () => {
    let component: HintComponent;
    let fixture: ComponentFixture<HintComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [HintComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(HintComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
