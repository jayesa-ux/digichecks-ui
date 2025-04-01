import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedMouleModule } from '../../shared/shared-moule.module';
import { AuthenticationService } from '../../core/services/authentication.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [SharedMouleModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    showPassword: boolean = false;
    constructor(
        private fb: FormBuilder,
        private authenticationService: AuthenticationService
    ) {}

    get lgfc() {
        return this.loginForm.controls;
    }

    ngOnInit() {
        this.authenticationService.logout();
        this.loginForm = this.fb.group({
            user: ['', [Validators.required]],
            password: ['', [Validators.required]],
        });
    }

    ngAfterViewInit(): void {}

    clearPassword(): void {
        this.loginForm.get('password')?.setValue('');
    }

    clearUser(): void {
        this.loginForm.get('user')?.setValue('');
    }

    sigIn() {
        this.authenticationService.login(this.loginForm.value.user, this.loginForm.value.password);
    }
}
