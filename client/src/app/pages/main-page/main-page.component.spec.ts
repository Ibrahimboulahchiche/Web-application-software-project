import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { MainPageComponent } from './main-page.component';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let matchmakingService: jasmine.SpyObj<MatchmakingService>;

    beforeEach(async () => {
        matchmakingService = jasmine.createSpyObj('MatchmakingService', ['disconnectSocket']);
        await TestBed.configureTestingModule({
            declarations: [MainPageComponent],
            providers: [{ provide: MatchmakingService, useValue: matchmakingService }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should call disconnectSocket on ngOnInit', () => {
        component.ngOnInit();
        expect(matchmakingService.disconnectSocket).toHaveBeenCalled();
    });
});
