import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private username: string = '';

    get registeredUsername() {
        return this.username;
    }

    registerUser(username: string) {
        this.username = username;
    }
}
