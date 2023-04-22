import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AuthService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('registerUser should create username', () => {
        const pseudo = 'newPseudo';
        service.registerUser(pseudo);
        expect(service.registeredUsername).toEqual(pseudo);
    });
});
