import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../shared/services/cart.service';

type AdminSection = 'dashboard' | 'products' | 'orders' | 'reports' | 'security';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private cartService = inject(CartService);

  selectedSection: AdminSection = 'dashboard';
  stats = {
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalSales: 0,
  };

  products: any[] = [];
  orders: any[] = [];
  categories: any[] = [];
  selectedOrder: any = null;
  editingProduct: any = null;
  selectedImage: File | null = null;

  loadingDashboard = false;
  loadingProducts = false;
  loadingOrders = false;
  savingProduct = false;
  exporting = false;
  loggingOut = false;
  loadingPassword = false;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  adminErrorMessage = '';
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  productForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    category_id: ['', Validators.required],
  });

  passwordForm = this.fb.group({
    current_password: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(8)]],
    new_password_confirmation: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit() {
    const initialSection = (this.route.snapshot.data['section'] as AdminSection) || 'dashboard';
    this.loadSection(initialSection);

    this.route.data.subscribe((data) => {
      const section = (data['section'] as AdminSection) || 'dashboard';

      if (section !== this.selectedSection) {
        this.loadSection(section);
      }
    });

    this.loadCategories();
  }

  selectSection(section: AdminSection) {
    this.router.navigate([`/admin/${section === 'dashboard' ? 'dashboard' : section}`]);
  }

  private loadSection(section: AdminSection) {
    this.selectedSection = section;

    if (section === 'dashboard') {
      this.loadDashboard();
    }

    if (section === 'products') {
      this.loadProducts();
      this.loadCategories();
    }

    if (section === 'orders') {
      this.loadOrders();
    }
  }

  loadDashboard() {
    this.loadingDashboard = true;
    this.adminErrorMessage = '';
    this.adminService.getDashboard().pipe(
      finalize(() => {
        this.loadingDashboard = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response) => {
        console.log('Admin dashboard response:', response);
        const data = response?.data ?? {};
        this.stats = {
          totalProducts: Number(data.totalProducts ?? data.total_products ?? 0),
          totalOrders: Number(data.totalOrders ?? data.total_orders ?? 0),
          totalUsers: Number(data.totalUsers ?? data.total_users ?? 0),
          totalSales: Number(data.totalSales ?? data.total_revenue ?? 0),
        };
        this.loadingDashboard = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Admin API error:', error);
        this.loadingDashboard = false;
        this.handleAdminError(error, 'Erro ao carregar dashboard.');
      },
    });
  }

  loadProducts() {
    this.loadingProducts = true;
    this.adminErrorMessage = '';
    this.adminService.getProducts().pipe(
      finalize(() => {
        this.loadingProducts = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response) => {
        console.log('Admin products response:', response);
        this.products = response?.data ?? [];
        this.loadingProducts = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Admin API error:', error);
        this.loadingProducts = false;
        this.handleAdminError(error, 'Erro ao carregar produtos.');
      },
    });
  }

  loadCategories() {
    this.adminService.getCategories().subscribe({
      next: (response) => {
        this.categories = response?.data ?? response ?? [];
      },
      error: (error) => console.error('Erro ao carregar categorias:', error),
    });
  }

  loadOrders() {
    this.loadingOrders = true;
    this.adminErrorMessage = '';
    this.adminService.getOrders().pipe(
      finalize(() => {
        this.loadingOrders = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response) => {
        console.log('Admin orders response:', response);
        this.orders = response?.data ?? [];
        this.loadingOrders = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Admin API error:', error);
        this.loadingOrders = false;
        this.handleAdminError(error, 'Erro ao carregar pedidos.');
      },
    });
  }

  startCreateProduct() {
    this.editingProduct = null;
    this.selectedImage = null;
    this.productForm.reset({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category_id: '',
    });
  }

  startEditProduct(product: any) {
    this.editingProduct = product;
    this.selectedImage = null;
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stock: Number(product.stock),
      category_id: String(product.category_id ?? ''),
    });
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedImage = input.files?.[0] ?? null;
  }

  saveProduct() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const values = this.productForm.getRawValue();
    formData.append('name', String(values.name ?? ''));
    formData.append('description', String(values.description ?? ''));
    formData.append('price', String(values.price ?? 0));
    formData.append('stock', String(values.stock ?? 0));
    formData.append('category_id', String(values.category_id ?? ''));

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    const request = this.editingProduct
      ? this.adminService.updateProduct(this.editingProduct.id, formData)
      : this.adminService.createProduct(formData);

    this.savingProduct = true;
    request.pipe(
      finalize(() => this.savingProduct = false)
    ).subscribe({
      next: () => {
        this.showToast(this.editingProduct ? 'Produto atualizado.' : 'Produto criado.', 'success');
        this.startCreateProduct();
        this.loadProducts();
        this.loadDashboard();
      },
      error: (error) => {
        console.error('Erro ao guardar produto:', error);
        this.showToast(error?.error?.message ?? 'Erro ao guardar produto.', 'error');
      },
    });
  }

  deleteProduct(product: any) {
    if (!confirm(`Remover "${product.name}"?`)) {
      return;
    }

    this.adminService.deleteProduct(product.id).subscribe({
      next: () => {
        this.showToast('Produto removido.', 'success');
        this.loadProducts();
        this.loadDashboard();
      },
      error: (error) => {
        console.error('Erro ao remover produto:', error);
        this.showToast('Erro ao remover produto.', 'error');
      },
    });
  }

  openOrderDetails(order: any) {
    this.adminService.getOrder(order.id).subscribe({
      next: (response) => {
        this.selectedOrder = response?.data ?? order;
      },
      error: (error) => {
        console.error('Erro ao carregar detalhe do pedido:', error);
        this.showToast('Erro ao carregar detalhe do pedido.', 'error');
      },
    });
  }

  closeOrderDetails() {
    this.selectedOrder = null;
  }

  updateOrderStatus(order: any, status: string) {
    this.adminService.updateOrderStatus(order.id, status).subscribe({
      next: () => {
        this.showToast('Status atualizado.', 'success');
        this.loadOrders();
        this.loadDashboard();
      },
      error: (error) => {
        console.error('Erro ao atualizar status:', error);
        this.showToast('Erro ao atualizar status.', 'error');
      },
    });
  }

  exportReport(type: 'csv' | 'pdf') {
    this.exporting = true;
    const request = type === 'csv' ? this.adminService.exportCsv() : this.adminService.exportPdf();

    request.pipe(
      finalize(() => this.exporting = false)
    ).subscribe({
      next: (blob) => {
        const filename = type === 'csv' ? 'shope-ngola-orders.csv' : 'shope-ngola-report.pdf';
        this.downloadBlob(blob, filename);
        this.showToast('Relatorio exportado.', 'success');
      },
      error: (error) => {
        console.error('Erro ao exportar relatorio:', error);
        this.showToast('Erro ao exportar relatorio.', 'error');
      },
    });
  }

  updatePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const value = this.passwordForm.value;

    if (value.new_password !== value.new_password_confirmation) {
      this.showToast('A confirmacao da nova palavra-passe nao coincide.', 'error');
      return;
    }

    this.loadingPassword = true;
    this.adminService.updatePassword({
      current_password: value.current_password ?? '',
      new_password: value.new_password ?? '',
      new_password_confirmation: value.new_password_confirmation ?? '',
    }).pipe(
      finalize(() => {
        this.loadingPassword = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.showToast('Palavra-passe atualizada com sucesso.', 'success');
      },
      error: (error) => {
        console.error('Erro ao atualizar palavra-passe admin:', error);
        this.showToast(error?.error?.message ?? 'Erro ao atualizar palavra-passe.', 'error');
      },
    });
  }

  logout() {
    if (this.loggingOut) {
      return;
    }

    this.loggingOut = true;
    this.authService.logout().pipe(
      finalize(() => {
        this.loggingOut = false;
        this.finishLogout();
      })
    ).subscribe({
      next: () => {},
      error: (error) => {
        console.error('Erro ao terminar sessão admin:', error);
      },
    });
  }

  getOrderItems(order: any) {
    return order?.items ?? order?.order_items ?? [];
  }

  getImage(product: any) {
    return product?.image_url || product?.image || 'assets/default-product.png';
  }

  formatStatus(status: string) {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      paid: 'Pago',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    };

    return labels[status] ?? status ?? 'Pendente';
  }

  statusClass(status: string) {
    return `status status-${status || 'pending'}`;
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
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

  private handleAdminError(error: any, fallbackMessage: string) {
    const isPermissionError = error?.status === 401 || error?.status === 403;
    const message = isPermissionError
      ? 'Sem permissão para acessar área admin'
      : error?.error?.message ?? fallbackMessage;

    this.adminErrorMessage = message;
    this.showToast(message, 'error');
    this.cdr.detectChanges();

    if (error?.status === 401) {
      setTimeout(() => this.finishLogout(), 800);
      return;
    }

    if (error?.status === 403) {
      setTimeout(() => this.router.navigate(['/home']), 800);
    }
  }

  private finishLogout() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }

    this.authService.clearSession();
    this.cartService.setCartCount(0);
    this.router.navigate(['/login']);
  }
}
