import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../../shared/services/notification/notification.service';
import { StorageService } from '../../../../shared/services/storage/storage.service';
import { Role } from '../../../pet/interfaces/pet';
import { RolesService } from '../../../roles/services/roles.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    MatSelectModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent implements OnInit {
  formGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    role: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });
  roles = signal<Role[]>([]);
  authService = inject(AuthService);
  rolesService = inject(RolesService);
  notificationService = inject(NotificationService);
  storageService = inject(StorageService);
  router = inject(Router);

  ngOnInit(): void {
    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles.data.items);
      },
    });
  }
  onSubmit() {
    this.authService.signUp(this.formGroup.value).subscribe({
      next: (user) => {
        this.router.navigate(['home/pets']);
        this.storageService.setItem('user', JSON.stringify(user.data));
        this.notificationService.showSnackBarSuccess({
          message: 'Welcome back!',
        });
      },
    });
  }
}
