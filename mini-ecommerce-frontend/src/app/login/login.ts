import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service'; 
import { CartService } from '../shared/services/cart.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService,
    private cartService: CartService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res: any) => {
          console.log('Resposta do Laravel:', res);
          
          const token = res.access_token || res.token;
          const user = res.user || res.data?.user || res.data;
          const role = user?.role || 'user';

          if (token) {
            this.authService.saveSession(token, user);

            if (role === 'admin') {
              this.cartService.setCartCount(0);
              this.router.navigate(['/admin/dashboard']);
              return;
            }

            this.cartService.refreshCartCount();
          }

          this.router.navigate(['/home']);
        },
        error: (err: any) => {
          console.error('Erro no Login:', err);
          alert('Credenciais inválidas ou erro no servidor.');
        }
      });
    }
  }
}
