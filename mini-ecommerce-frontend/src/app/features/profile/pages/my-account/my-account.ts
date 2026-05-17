import { ChangeDetectorRef, Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Subscription } from 'rxjs';
import { AppLanguage, PreferencesService } from '../../../../shared/services/preferences.service';
import { ProfileService, UserOrder, UserProfile } from '../../../../shared/services/profile.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../shared/services/cart.service';
import { FavoriteService } from '../../../../shared/services/favorite.service';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-account.html',
  styleUrls: ['./my-account.css']
})
export class MyAccountComponent implements OnInit, OnDestroy {
  preferences = inject(PreferencesService);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private cartService = inject(CartService);
  private favoriteService = inject(FavoriteService);

  user: UserProfile | null = null;
  loading = false;
  saving = false;
  loadingPassword = false;
  loadingOrders = false;
  loadingFavorites = false;
  isEditing = false;
  selectedSection: 'personal' | 'orders' | 'favorites' | 'security' = 'personal';
  errorMessage = '';
  successMessage = '';
  ordersErrorMessage = '';
  favoritesErrorMessage = '';
  securityErrorMessage = '';
  securitySuccessMessage = '';
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  avatarUrl = 'assets/avatars/avatar-1.svg';
  orders: UserOrder[] = [];
  selectedOrder: UserOrder | null = null;
  loadingOrderDetails = false;
  orderDetailsErrorMessage = '';
  totalOrders = 0;
  cartCount = 0;
  favoritesCount = 0;

  favorites: any[] = [];

  private loadingTimer: ReturnType<typeof setTimeout> | null = null;
  private savingTimer: ReturnType<typeof setTimeout> | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private cartCountSubscription?: Subscription;

  avatars = [
    'assets/avatars/avatar-1.svg',
    'assets/avatars/avatar-2.svg',
    'assets/avatars/avatar-3.svg',
    'assets/avatars/avatar-4.svg',
    'assets/avatars/avatar-5.svg',
    'assets/avatars/avatar-6.svg',
  ];

  profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    phone: [''],
    address: [''],
    avatar: [this.avatarUrl],
  });

  passwordForm = this.fb.group({
    current_password: ['', [Validators.required]],
    new_password: ['', [Validators.required, Validators.minLength(8)]],
    new_password_confirmation: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cartCountSubscription = this.cartService.cartCount$.subscribe((count) => {
        this.cartCount = count;
        this.cdr.detectChanges();
      });

      this.route.queryParamMap.subscribe((params) => {
        const section = params.get('section');

        if (section === 'orders' || section === 'favorites' || section === 'security' || section === 'personal') {
          this.selectSection(section);
        }
      });

      this.loadUserProfile();
      this.loadOrders();
    }
  }

  ngOnDestroy() {
    this.cartCountSubscription?.unsubscribe();
  }

  loadUserProfile() {
    this.loading = true;
    this.errorMessage = '';
    this.clearLoadingTimer();

    this.loadingTimer = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.errorMessage = 'Erro ao carregar dados da conta.';
        this.cdr.detectChanges();
      }
    }, 12000);

    this.profileService.me().pipe(
      finalize(() => {
        this.loading = false;
        this.clearLoadingTimer();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: any) => {
        this.user = response.data ?? response.user ?? null;

        if (!this.user) {
          this.errorMessage = 'Erro ao carregar dados da conta.';
          console.log('Resposta /api/me:', response);
          console.log('User carregado:', this.user);
          return;
        }

        this.avatarUrl = this.resolveAvatarUrl(this.user.avatar);
        this.profileForm.patchValue({
          name: this.user.name ?? '',
          phone: this.user.phone ?? '',
          address: this.user.address ?? '',
          avatar: this.avatarUrl,
        });

        this.errorMessage = '';
        console.log('Resposta /api/me:', response);
        console.log('User carregado:', this.user);
        console.log('user', this.user);
        this.loadAccountStats();
      },
      error: (err) => {
        console.error('Erro ao carregar perfil:', err);
        this.errorMessage = 'Erro ao carregar dados da conta.';

        if (err.status === 401) {
          this.authService.clearSession();
          this.profileService.setCurrentUser(null);
          this.router.navigate(['/login']);
        }

      }
    });
  }

  get memberSince() {
    return this.user?.created_at ? new Date(this.user.created_at) : null;
  }

  setLanguage(language: string) {
    this.preferences.setLanguage(language as AppLanguage);
  }

  selectSection(section: 'personal' | 'orders' | 'favorites' | 'security') {
    this.selectedSection = section;
    this.successMessage = '';
    this.errorMessage = '';
    this.securityErrorMessage = '';
    this.securitySuccessMessage = '';

    if (section === 'orders' && this.orders.length === 0) {
      this.loadOrders();
    }

    if (section === 'favorites') {
      this.loadFavorites();
    }
  }

  loadOrders() {
    if (this.loadingOrders) {
      return;
    }

    this.loadingOrders = true;
    this.ordersErrorMessage = '';

    this.profileService.getOrders().pipe(
      finalize(() => {
        this.loadingOrders = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: any) => {
        this.orders = response.data ?? response.orders ?? [];
        console.log('Resposta /api/orders:', response);
        console.log('Pedidos:', this.orders);
        console.log('orders', this.orders);
      },
      error: (error) => {
        console.error('Erro ao carregar pedidos:', error);
        console.log('Erro ao carregar pedidos:', error);
        this.orders = [];
        this.ordersErrorMessage = 'Erro ao carregar pedidos.';

        if (error.status === 401) {
          this.authService.clearSession();
          this.profileService.setCurrentUser(null);
          this.router.navigate(['/login']);
        }

      }
    });
  }

  loadAccountStats() {
    this.profileService.getOrders().subscribe({
      next: (response: any) => {
        const orders = response.data ?? response.orders ?? [];
        this.totalOrders = Array.isArray(orders) ? orders.length : 0;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar total de pedidos:', error);
        this.totalOrders = 0;
        this.cdr.detectChanges();
      }
    });

    this.cartService.loadCartCount().subscribe({
      error: (error) => {
        console.error('Erro ao carregar total do carrinho:', error);
      }
    });

    this.favoriteService.getFavorites().subscribe({
      next: (response: any) => {
        const favorites = response.data ?? response.favorites ?? [];
        this.favoritesCount = Array.isArray(favorites) ? favorites.length : 0;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar total de favoritos:', error);
        this.favoritesCount = 0;
        this.cdr.detectChanges();
      }
    });
  }

  getOrderTotal(order: UserOrder) {
    return Number((order as any).total_amount ?? (order as any).total ?? 0);
  }

  getOrderStatusClass(status: string) {
    const normalizedStatus = String(status ?? '').toLowerCase();

    if (normalizedStatus === 'paid') {
      return 'bg-green-100 text-green-700';
    }

    if (normalizedStatus === 'shipped') {
      return 'bg-blue-100 text-blue-700';
    }

    if (normalizedStatus === 'cancelled') {
      return 'bg-red-100 text-red-700';
    }

    return 'bg-yellow-50 text-yellow-700 border border-yellow-100';
  }

  getOrderStatusLabel(status: string) {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      paid: 'Pago',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    };

    return labels[String(status ?? '').toLowerCase()] ?? status;
  }

  openOrderDetails(order: UserOrder) {
    this.selectedOrder = order;
    this.loadingOrderDetails = true;
    this.orderDetailsErrorMessage = '';

    this.profileService.getOrder(order.id).pipe(
      finalize(() => {
        this.loadingOrderDetails = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: any) => {
        console.log('Detalhe do pedido:', response);
        const detail = response.data ?? response.order ?? order;
        const items = detail.items ?? detail.order_items ?? [];

        this.selectedOrder = {
          ...detail,
          items,
        };
      },
      error: (error) => {
        console.error('Erro ao carregar detalhe do pedido:', error);
        this.orderDetailsErrorMessage = 'Erro ao carregar detalhes do pedido.';
      }
    });
  }

  closeOrderDetails() {
    this.selectedOrder = null;
    this.loadingOrderDetails = false;
    this.orderDetailsErrorMessage = '';
  }

  getOrderPaymentMethod(order: UserOrder | null) {
    const method = String((order as any)?.payment_method ?? '').toLowerCase();
    const labels: Record<string, string> = {
      card: 'Cartão',
      cash_on_delivery: 'Pagamento na entrega',
      multicaixa: 'Multicaixa',
    };

    return labels[method] ?? ((order as any)?.payment_method || 'Não informado');
  }

  getOrderPaymentStatus(order: UserOrder | null) {
    const paymentStatus = String((order as any)?.payment_status ?? '').toLowerCase();
    const labels: Record<string, string> = {
      pending: 'Pendente',
      paid: 'Pago',
      failed: 'Falhou',
      refunded: 'Reembolsado',
    };

    if (paymentStatus) {
      return labels[paymentStatus] ?? (order as any)?.payment_status;
    }

    return String(order?.status ?? '').toLowerCase() === 'paid' ? 'Pago' : 'Pendente';
  }

  getOrderItemSubtotal(item: any) {
    return Number(item?.price ?? 0) * Number(item?.quantity ?? 1);
  }

  getSelectedOrderItems() {
    return this.selectedOrder?.items ?? this.selectedOrder?.order_items ?? [];
  }

  getOrderDeliveryAddress(order: UserOrder | null) {
    return (order as any)?.shipping_address
      ?? (order as any)?.delivery_address
      ?? (order as any)?.address
      ?? order?.user?.address
      ?? this.user?.address
      ?? 'Morada não definida';
  }

  getOrderDeliveryPhone(order: UserOrder | null) {
    return (order as any)?.shipping_phone
      ?? (order as any)?.delivery_phone
      ?? (order as any)?.phone
      ?? order?.user?.phone
      ?? this.user?.phone
      ?? 'Telefone não definido';
  }

  getOrderProductImage(item: any) {
    const image = item?.product?.image_url ?? item?.product?.image;

    if (!image) {
      return 'assets/default-product.png';
    }

    if (String(image).startsWith('http') || String(image).startsWith('assets/')) {
      return image;
    }

    return `http://127.0.0.1:8000/storage/${image}`;
  }

  startEditing() {
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEditing() {
    this.isEditing = false;

    if (this.user) {
      this.avatarUrl = this.resolveAvatarUrl(this.user.avatar);
      this.profileForm.patchValue({
        name: this.user.name ?? '',
        phone: this.user.phone ?? '',
        address: this.user.address ?? '',
        avatar: this.avatarUrl,
      });
    }
  }

  selectAvatar(avatar: string) {
    this.avatarUrl = avatar;
    this.profileForm.patchValue({ avatar });
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.clearSavingTimer();

    this.savingTimer = setTimeout(() => {
      if (this.saving) {
        this.saving = false;
        this.errorMessage = 'Nao foi possivel guardar. Confirma se o backend esta ligado e tenta novamente.';
        this.cdr.detectChanges();
      }
    }, 12000);

    const formValue = this.profileForm.value;

    this.profileService.updateProfile({
      name: formValue.name ?? '',
      phone: formValue.phone || null,
      address: formValue.address || null,
      avatar: this.avatarFileName(formValue.avatar || this.avatarUrl),
    }).subscribe({
      next: (res) => {
        this.clearSavingTimer();
        this.user = res.data;
        this.avatarUrl = this.resolveAvatarUrl(this.user.avatar);
        this.profileForm.patchValue({ avatar: this.avatarUrl });
        this.isEditing = false;
        this.saving = false;
        this.successMessage = 'Perfil atualizado com sucesso.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.clearSavingTimer();
        console.error('Erro ao atualizar perfil:', err);
        this.saving = false;
        this.errorMessage = 'Nao foi possivel atualizar o perfil. Confirma se o backend esta ligado e se ainda estas autenticado.';

        if (err.status === 401) {
          this.authService.clearSession();
          this.profileService.setCurrentUser(null);
          this.router.navigate(['/login']);
        }

        this.cdr.detectChanges();
      }
    });
  }

  removeFavorite(favoriteId: number) {
    const favorite = this.favorites.find((item) => item.id === favoriteId);
    const productId = favorite?.product_id ?? favorite?.product?.id;

    if (!productId) {
      return;
    }

    this.favoriteService.removeFavorite(productId).subscribe({
      next: () => {
        this.favorites = this.favorites.filter((item) => item.id !== favoriteId);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao remover favorito:', error);
        this.favoritesErrorMessage = 'Erro ao carregar favoritos.';
        this.cdr.detectChanges();
      }
    });
  }

  addFavoriteToCart(favorite: any) {
    const product = favorite.product ?? favorite;
    if (!product?.id) {
      return;
    }

    this.cartService.addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price ?? 0),
      image: product.image_url ?? product.image ?? 'assets/default-product.png',
      category: 'Favoritos',
    });
  }

  loadFavorites() {
    this.loadingFavorites = this.favorites.length === 0;
    this.favoritesErrorMessage = '';

    this.favoriteService.getFavorites().pipe(
      finalize(() => {
        this.loadingFavorites = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: any) => {
        this.favorites = response.data ?? response.favorites ?? [];
      },
      error: (error) => {
        console.error('Erro ao carregar favoritos:', error);
        this.favorites = [];
        this.favoritesErrorMessage = 'Erro ao carregar favoritos.';
      }
    });
  }

  updatePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const value = this.passwordForm.value;
    if (value.new_password !== value.new_password_confirmation) {
      this.securityErrorMessage = 'A confirmação da nova palavra-passe não coincide.';
      this.securitySuccessMessage = '';
      this.showToast('A confirmação da nova palavra-passe não coincide.', 'error');
      return;
    }

    this.loadingPassword = true;
    this.securityErrorMessage = '';
    this.securitySuccessMessage = '';

    this.profileService.updatePassword({
      current_password: value.current_password ?? '',
      new_password: value.new_password ?? '',
      new_password_confirmation: value.new_password_confirmation ?? '',
    }).subscribe({
      next: (response) => {
        this.loadingPassword = false;
        this.passwordForm.reset();
        this.securitySuccessMessage = '';
        this.securityErrorMessage = '';
        this.showToast('Palavra-passe atualizada com sucesso.', 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao atualizar password:', err);
        this.loadingPassword = false;
        const apiMessage = err.error?.message;
        this.securityErrorMessage = '';
        this.securitySuccessMessage = '';
        this.showToast(apiMessage || 'Não foi possível atualizar a palavra-passe.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.finishLogout(),
      error: (err) => {
        console.error('Erro ao terminar sessao no servidor:', err);
        this.finishLogout();
      }
    });
  }

  private finishLogout() {
    this.authService.clearSession();
    this.profileService.setCurrentUser(null);
    this.cartService.setCartCount(0);
    this.router.navigate(['/login']);
  }

  private clearLoadingTimer() {
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
      this.loadingTimer = null;
    }
  }

  private clearSavingTimer() {
    if (this.savingTimer) {
      clearTimeout(this.savingTimer);
      this.savingTimer = null;
    }
  }

  private resolveAvatarUrl(avatar?: string | null) {
    if (!avatar) {
      return this.avatars[0];
    }

    if (avatar.startsWith('assets/avatars/')) {
      return avatar;
    }

    return `assets/avatars/${avatar}`;
  }

  private avatarFileName(avatar: string) {
    return avatar.replace('assets/avatars/', '');
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
      this.cdr.detectChanges();
    }, 3000);
  }
}
