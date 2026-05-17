import { Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/pages/register/register';
import { LoginComponent } from './login/login';
import { HomeComponent } from './features/home/pages/home/home';
import { MyAccountComponent } from './features/profile/pages/my-account/my-account';
import { CartComponent } from './features/cart/pages/cart/cart';
import { CheckoutComponent } from './features/profile/pages/my-account/checkout';
import { AdminDashboardComponent } from './features/admin/pages/dashboard/admin-dashboard';
import { adminGuard } from './core/guards/admin.guard';
import { userGuard } from './core/guards/user.guard';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [userGuard] },
  { path: 'minha-conta', component: MyAccountComponent, canActivate: [userGuard] },
  { path: 'carrinho', component: CartComponent, canActivate: [userGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [userGuard] },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [adminGuard], data: { section: 'dashboard' } },
  { path: 'admin/products', component: AdminDashboardComponent, canActivate: [adminGuard], data: { section: 'products' } },
  { path: 'admin/orders', component: AdminDashboardComponent, canActivate: [adminGuard], data: { section: 'orders' } },
  { path: 'admin/reports', component: AdminDashboardComponent, canActivate: [adminGuard], data: { section: 'reports' } },
  { path: 'admin/security', component: AdminDashboardComponent, canActivate: [adminGuard], data: { section: 'security' } },

  // Redirecionamento padrão: 
  // Se queres que o site comece no Login, usa: redirectTo: '/login'
  // Se queres que comece logo na Loja, usa: redirectTo: '/home'
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Rota de "catch-all" (opcional): se o user digitar algo que não existe, vai para a home
  { path: '**', redirectTo: '/home' }
];
