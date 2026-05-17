import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  
  // 1. Criámos estas variáveis para controlar as mensagens no ecrã
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onRegister() {
    // Limpa as mensagens sempre que tentamos de novo
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.valid) {
      // 2. CORREÇÃO PARA O LARAVEL (Erro 422):
      // O Laravel espera um campo chamado "password_confirmation"
      const { confirmPassword, ...rest } = this.registerForm.value;
      const userData = {
        ...rest,
        password_confirmation: confirmPassword // Mudamos o nome para o Laravel aceitar!
      };

      this.authService.register(userData).subscribe({
        next: (res: any) => {
          this.successMessage = 'Conta criada com sucesso! A redirecionar...';
          setTimeout(() => this.router.navigate(['/login']), 2000); // Espera 2 segs e vai pro login
        },
        error: (err: any) => {
          // 3. Captura o erro real do Laravel em vez de um alert genérico
          console.error('Erro no Registo:', err);
          if (err.status === 422) {
             // O Laravel manda os erros de validação aqui
             this.errorMessage = 'Dados inválidos. O e-mail já existe ou a password é fraca.';
          } else {
             this.errorMessage = 'Erro ao contactar o servidor. Tenta novamente.';
          }
        }
      });
    } else {
      this.errorMessage = 'Por favor, preenche todos os campos corretamente.';
    }
  }
}