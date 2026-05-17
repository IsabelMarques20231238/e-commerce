import { ChangeDetectorRef, Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CartService } from '../../../../shared/services/cart.service';
import { FooterComponent } from '../../../../shared/components/footer/footer';
import { ProfileService, UserProfile } from '../../../../shared/services/profile.service';

interface CheckoutItem {
  id: number;
  productId: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule, RouterLink, FooterComponent],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class CheckoutComponent implements OnInit {
  private cartService = inject(CartService);
  private profileService = inject(ProfileService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  user: UserProfile | null = null;
  cartItems: CheckoutItem[] = [];
  loadingUser = false;
  loadingCart = false;
  loadingCheckout = false;
  selectedPaymentMethod = 'card';
  errorMessage = '';
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!this.hasToken()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUser();
    this.loadCart();
  }

  get deliveryFee(): number {
    return this.cartItems.length > 0 ? 2500 : 0;
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  get total(): number {
    return this.cartItems.length > 0 ? this.subtotal + this.deliveryFee : 0;
  }

  get hasDeliveryData(): boolean {
    return Boolean(this.user?.address && this.user?.phone);
  }

  loadUser() {
    this.loadingUser = true;
    this.errorMessage = '';

    this.profileService.me().pipe(
      finalize(() => {
        this.loadingUser = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: any) => {
        this.user = response.data ?? response.user ?? null;
        console.log('Resposta /api/me:', response);
        console.log('user', this.user);
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar dados do utilizador';

        if (error.status === 401) {
          this.router.navigate(['/login']);
          return;
        }

        this.showToast('Erro ao carregar dados do utilizador.', 'error');
      }
    });
  }

  loadCart() {
    this.loadingCart = true;
    this.errorMessage = '';

    this.cartService.loadCart().pipe(
      finalize(() => {
        this.loadingCart = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: any) => {
        const items = response.data?.items ?? response.items ?? (Array.isArray(response) ? response : []);
        this.cartItems = Array.isArray(items) ? items.map((item: any) => this.mapCartItem(item)) : [];
        console.log('Resposta /api/cart:', response);
        console.log('Cart items checkout:', this.cartItems);
        console.log('cart', this.cartItems);
      },
      error: (error) => {
        this.cartItems = [];
        this.errorMessage = 'Erro ao carregar carrinho';

        if (error.status === 401) {
          this.router.navigate(['/login']);
          return;
        }

        this.showToast('Erro ao carregar carrinho.', 'error');
      }
    });
  }

  confirmOrder() {
    if (this.loadingUser || this.loadingCart || !this.user) {
      return;
    }

    if (!this.hasDeliveryData) {
      this.showToast('Complete os dados de entrega em Minha Conta.', 'error');
      return;
    }

    if (this.cartItems.length === 0) {
      this.showToast('O carrinho está vazio.', 'error');
      return;
    }

    this.loadingCheckout = true;

    this.cartService.checkout(this.selectedPaymentMethod).pipe(
      finalize(() => {
        this.loadingCheckout = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.cartItems = [];
        this.cartService.setCartCount(0);
        this.showToast('Pedido realizado com sucesso.', 'success');

        setTimeout(() => {
          this.router.navigate(['/minha-conta'], { queryParams: { section: 'orders' } });
        }, 900);
      },
      error: (error) => {
        if (error.status === 401) {
          this.router.navigate(['/login']);
          return;
        }

        this.showToast(error.error?.message || 'Não foi possível finalizar o pedido.', 'error');
      }
    });
  }

  getProductImage(item: CheckoutItem): string {
    if (!item.image) {
      return 'assets/default-product.png';
    }

    if (item.image.startsWith('http') || item.image.startsWith('assets/')) {
      return item.image;
    }

    return `http://127.0.0.1:8000/storage/${item.image}`;
  }

  private mapCartItem(item: any): CheckoutItem {
    const product = item.product ?? item;

    return {
      id: Number(item.id ?? product.id),
      productId: Number(item.product_id ?? product.id),
      name: product.name ?? 'Produto',
      image: product.image_url ?? product.image ?? 'assets/default-product.png',
      price: Number(product.price ?? item.price ?? 0),
      quantity: Number(item.quantity ?? 1),
    };
  }

  private hasToken(): boolean {
    return Boolean(localStorage.getItem('token') || localStorage.getItem('auth_token'));
  }

  private showToast(message: string, type: 'success' | 'error') {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toastMessage = message;
    this.toastType = type;

    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
      this.toastTimer = null;
    }, 3000);
  }
}

