import { ChangeDetectorRef, Component, OnDestroy, OnInit, PLATFORM_ID, inject, output, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { AppLanguage, PreferencesService } from '../../services/preferences.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductFilterService } from '../../services/product-filter.service';
import { ProfileService, UserProfile } from '../../services/profile.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  public router = inject(Router);
  public cartService = inject(CartService);
  public preferences = inject(PreferencesService);
  private authService = inject(AuthService);
  private productFilterService = inject(ProductFilterService);
  private profileService = inject(ProfileService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  searchQuery = output<string>();
  user: UserProfile | null = null;
  cartCount = 0;
  cartIsAnimating = false;
  private cartCountSubscription?: Subscription;
  private profileSubscription?: Subscription;
  private cartAnimationHandler?: () => void;

  // Estado reativo para o dropdown de perfil
  isProfileMenuOpen = signal(false);

  get isHomePage() {
    return this.router.url === '/' || this.router.url === '/home';
  }

  get userGreeting() {
    return this.user?.name ? `Olá, ${this.user.name}` : this.preferences.t('helloUser');
  }

  ngOnInit() {
    this.cartCountSubscription = this.cartService.cartCount$.subscribe((count) => {
      console.log('[Navbar] count recebido:', count);
      this.cartCount = count;
      this.cdr.detectChanges();
    });

    this.profileSubscription = this.profileService.user$.subscribe((user) => {
      this.user = user;
      this.cdr.detectChanges();
    });

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.cartAnimationHandler = () => this.triggerCartBounce();
    window.addEventListener('shope-ngola:cart-bounce', this.cartAnimationHandler);

    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    console.log('[Navbar] token existe?', !!token);

    if (token) {
      this.cartService.loadCartCount().subscribe({
        error: (err) => {
          console.error('Erro ao carregar contador do carrinho:', err);
          this.cartService.setCartCount(0);
        }
      });
      this.profileService.me().subscribe({
        error: (err) => console.error('Erro ao carregar utilizador no menu:', err)
      });
    } else {
      this.cartService.setCartCount(0);
    }
  }

  ngOnDestroy() {
    this.cartCountSubscription?.unsubscribe();
    this.profileSubscription?.unsubscribe();

    if (this.cartAnimationHandler && isPlatformBrowser(this.platformId)) {
      window.removeEventListener('shope-ngola:cart-bounce', this.cartAnimationHandler);
    }
  }

  toggleMenu() {
    this.isProfileMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.isProfileMenuOpen.set(false);
  }

  setLanguage(language: string) {
    this.preferences.setLanguage(language as AppLanguage);
  }

  onSearch(query: string) {
    const cleanQuery = query.trim();
    this.searchQuery.emit(cleanQuery);
    this.productFilterService.setSearchQuery(cleanQuery);
  }

  logout() {
    this.closeMenu();

    this.authService.logout().subscribe({
      next: () => this.finishLogout(),
      error: (err) => {
        console.error('Erro ao terminar sessão no servidor:', err);
        this.finishLogout();
      }
    });
  }

  private triggerCartBounce() {
    this.cartIsAnimating = false;

    setTimeout(() => {
      this.cartIsAnimating = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.cartIsAnimating = false;
        this.cdr.detectChanges();
      }, 500);
    });
  }

  private finishLogout() {
    this.authService.clearSession();
    this.profileService.setCurrentUser(null);
    this.cartService.setCartCount(0);
    this.router.navigate(['/login']);
  }
}
