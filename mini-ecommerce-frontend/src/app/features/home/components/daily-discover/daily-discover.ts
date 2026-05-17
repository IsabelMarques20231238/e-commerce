import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CartService } from '../../../../shared/services/cart.service';
import { FavoriteService } from '../../../../shared/services/favorite.service';

@Component({
  selector: 'app-daily-discover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './daily-discover.html',
  styleUrl: './daily-discover.css'
})
export class DailyDiscoverComponent implements OnInit {
  private cartService = inject(CartService);
  private favoriteService = inject(FavoriteService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  @Input() products: any[] = [];
  @Input() loading = false;

  readonly defaultProductImage = 'assets/default-product.png';
  favoriteIds = new Set<number>();
  addingToCartIds = new Set<number>();
  togglingFavoriteIds = new Set<number>();
  successMessage = '';
  errorMessage = '';
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    if (this.hasToken()) {
      this.loadFavorites();
      this.cartService.loadCartCount().subscribe({
        error: (err) => console.error('Erro ao carregar contador do carrinho:', err)
      });
    }
  }

  getProductImage(product: any): string {
    if (product?.image && String(product.image).startsWith('http')) {
      return product.image;
    }

    if (product?.image) {
      return `http://127.0.0.1:8000/storage/${product.image}`;
    }

    return this.defaultProductImage;
  }

  useDefaultImage(event: Event) {
    const image = event.target as HTMLImageElement;
    image.src = this.defaultProductImage;
  }

  addToCart(product: any, event?: MouseEvent) {
    if (!this.ensureAuthenticated()) {
      return;
    }

    if (!product?.id || this.addingToCartIds.has(product.id)) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.setProductAdding(product.id, true);

    try {
      this.triggerFlyToCart(product, event);
    } catch (error) {
      console.error('Erro na animação do carrinho:', error);
    }

    this.cartService.addProduct(product.id, 1).pipe(
      finalize(() => {
        this.setProductAdding(product.id, false);
      })
    ).subscribe({
      next: () => {
        console.log('[Home] add sucesso, agora atualizar count');
        this.showToast('Produto adicionado ao carrinho', 'success');
        this.triggerCartAnimation();
      },
      error: (err) => {
        console.error('Erro ao adicionar ao carrinho:', err);
        this.showToast('Erro ao adicionar produto', 'error');

        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  isFavorite(productId: number) {
    return this.favoriteIds.has(productId);
  }

  toggleFavorite(product: any) {
    if (!this.ensureAuthenticated()) {
      return;
    }

    if (this.togglingFavoriteIds.has(product.id)) {
      return;
    }

    this.togglingFavoriteIds.add(product.id);
    const request = this.isFavorite(product.id)
      ? this.favoriteService.removeFavorite(product.id)
      : this.favoriteService.addFavorite(product.id);

    request.subscribe({
      next: () => {
        if (this.isFavorite(product.id)) {
          this.favoriteIds.delete(product.id);
        } else {
          this.favoriteIds.add(product.id);
        }

        this.togglingFavoriteIds.delete(product.id);
      },
      error: (err) => {
        console.error('Erro ao atualizar favorito:', err);
        this.togglingFavoriteIds.delete(product.id);

        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  private loadFavorites() {
    this.favoriteService.getFavorites().subscribe({
      next: (res) => {
        const favorites = res.data ?? [];
        this.favoriteIds = new Set(
          favorites
            .map((favorite: any) => favorite.product_id ?? favorite.product?.id)
            .filter((id: any) => id !== undefined && id !== null)
        );
      },
      error: (err) => {
        console.error('Erro ao carregar favoritos:', err);
      }
    });
  }

  private ensureAuthenticated() {
    if (this.hasToken()) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }

  private hasToken() {
    return typeof localStorage !== 'undefined'
      && Boolean(localStorage.getItem('token') || localStorage.getItem('auth_token'));
  }

  private showToast(message: string, type: 'success' | 'error') {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.successMessage = type === 'success' ? message : '';
    this.errorMessage = type === 'error' ? message : '';

    this.toastTimer = setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
      this.toastTimer = null;
    }, 2000);
  }

  private setProductAdding(productId: number, isAdding: boolean) {
    const nextIds = new Set(this.addingToCartIds);

    if (isAdding) {
      nextIds.add(productId);
    } else {
      nextIds.delete(productId);
    }

    this.addingToCartIds = nextIds;
    this.cdr.detectChanges();
  }

  private triggerCartAnimation() {
    if (typeof window === 'undefined') {
      return;
    }

    window.dispatchEvent(new CustomEvent('shope-ngola:cart-bounce'));
  }

  private triggerFlyToCart(product: any, event?: MouseEvent) {
    if (typeof document === 'undefined') {
      return;
    }

    const button = event?.currentTarget as HTMLElement | null;
    const card = button?.closest('.product-card');
    const sourceImage = card?.querySelector('img') as HTMLImageElement | null;
    const cartIcon = document.querySelector('[data-cart-icon="main-cart"]') as HTMLElement | null;

    if (!sourceImage || !cartIcon) {
      return;
    }

    const sourceRect = sourceImage.getBoundingClientRect();
    const targetRect = cartIcon.getBoundingClientRect();
    const clone = sourceImage.cloneNode(true) as HTMLImageElement;

    clone.className = 'cart-fly-image';
    clone.style.left = `${sourceRect.left}px`;
    clone.style.top = `${sourceRect.top}px`;
    clone.style.width = `${sourceRect.width}px`;
    clone.style.height = `${sourceRect.height}px`;
    document.body.appendChild(clone);

    const deltaX = targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
    const deltaY = targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2);

    clone.animate(
      [
        { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 0.9 },
        { transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.18)`, opacity: 0.15 },
      ],
      {
        duration: 620,
        easing: 'cubic-bezier(0.22, 0.8, 0.22, 1)',
      }
    ).onfinish = () => clone.remove();

    setTimeout(() => clone.remove(), 800);
  }
}
