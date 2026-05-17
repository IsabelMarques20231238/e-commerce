import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../../shared/services/cart.service';
import { FooterComponent } from '../../../../shared/components/footer/footer';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, FooterComponent],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!this.hasToken()) {
      this.cartService.setCartCount(0);
      return;
    }

    this.loadCart();
  }

  loadCart() {
    this.cartService.loadCart().subscribe({
      error: (error) => {
        console.error('Erro ao carregar carrinho:', error);
        this.cartService.setCartCount(0);
      }
    });
  }

  incrementar(itemId: number) {
    const item = this.cartService.items().find((cartItem) => cartItem.id === itemId);

    if (!item) {
      return;
    }

    this.cartService.updateItemQuantity(item.id, item.quantity + 1).subscribe({
      next: () => this.loadCart(),
      error: (error) => console.error('Erro ao aumentar quantidade:', error)
    });
  }

  decrementar(itemId: number) {
    const item = this.cartService.items().find((cartItem) => cartItem.id === itemId);

    if (!item || item.quantity <= 1) {
      return;
    }

    this.cartService.updateItemQuantity(item.id, item.quantity - 1).subscribe({
      next: () => this.loadCart(),
      error: (error) => console.error('Erro ao diminuir quantidade:', error)
    });
  }

  remover(itemId: number) {
    this.cartService.removeItem(itemId).subscribe({
      next: () => this.cartService.refreshCartCount(),
      error: (error) => console.error('Erro ao remover item:', error)
    });
  }

  getSubtotal(): number {
    return this.cartService.getSubtotal();
  }

  finalizarCompra() {
    if (this.cartService.items().length === 0) {
      return;
    }

    this.router.navigate(['/checkout']);
  }

  private hasToken() {
    return typeof localStorage !== 'undefined'
      && Boolean(localStorage.getItem('token') || localStorage.getItem('auth_token'));
  }
}
