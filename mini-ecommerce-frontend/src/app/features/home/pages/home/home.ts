import { ChangeDetectorRef, Component, DestroyRef, OnInit, PLATFORM_ID, TransferState, inject, makeStateKey } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { FooterComponent } from '../../../../shared/components/footer/footer';
import { HeroBannerComponent } from '../../components/hero-banner/hero-banner';
import { CategoryLinksComponent } from '../../components/category-links/category-links';
import { DailyDiscoverComponent } from '../../components/daily-discover/daily-discover';
import { ProductService } from '../../../../shared/services/product';
import { ProductFilterService } from '../../../../shared/services/product-filter.service';

const HOME_PRODUCTS_KEY = makeStateKey<any[]>('home-products');

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FooterComponent,
    HeroBannerComponent,
    CategoryLinksComponent,
    DailyDiscoverComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private productFilterService = inject(ProductFilterService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private transferState = inject(TransferState);
  private platformId = inject(PLATFORM_ID);

  searchTerm = '';
  selectedCategory = 'Todos';
  allProducts: any[] = [];
  filteredProducts: any[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit() {
    this.productFilterService.searchQuery$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => this.onSearchChange(query));

    const transferredProducts = this.transferState.get(HOME_PRODUCTS_KEY, []);

    if (isPlatformBrowser(this.platformId) && transferredProducts.length > 0) {
      this.setInitialProducts(transferredProducts);
      this.transferState.remove(HOME_PRODUCTS_KEY);
      return;
    }

    this.loadProducts();
  }

  loadProducts() {
    this.loading = this.filteredProducts.length === 0;
    this.errorMessage = '';

    this.productService.getProducts().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: any) => {
        const products = response?.data ?? response ?? [];
        const productList = Array.isArray(products) ? [...products] : [];
        this.transferState.set(HOME_PRODUCTS_KEY, productList);
        this.setInitialProducts(productList);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
        this.allProducts = [];
        this.filteredProducts = [];
        this.loading = false;
        this.errorMessage = 'Erro ao carregar produtos.';
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(query: string) {
    this.searchTerm = query;
    this.applyFilters();
  }

  onCategoryChange(categoryName: string | null) {
    this.selectedCategory = categoryName ?? 'Todos';

    if (this.selectedCategory === 'Todos') {
      this.filteredProducts = [...this.allProducts];
      if (this.searchTerm.trim()) {
        this.applyFilters();
        return;
      }
      this.loading = false;
      this.logFilterState();
      return;
    }

    if (this.searchTerm.trim()) {
      this.applyFilters();
      return;
    }

    this.filteredProducts = this.allProducts.filter((product) =>
      product.category?.name === this.selectedCategory
    );
    this.loading = false;
    this.logFilterState();
  }

  private applyFilters() {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredProducts = this.allProducts.filter((product) => {
      const matchesCategory = this.selectedCategory === 'Todos'
        || product.category?.name === this.selectedCategory;

      const matchesSearch = !search
        || String(product.name ?? '').toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
    this.loading = false;
    this.logFilterState();
  }

  private setInitialProducts(products: any[]) {
    this.allProducts = [...products];
    this.filteredProducts = [...products];
    this.selectedCategory = 'Todos';
    this.loading = false;
    console.log('products', this.allProducts);
    console.log('Produtos carregados no ngOnInit:', this.allProducts.length);
    console.log('Produtos filtrados no início:', this.filteredProducts.length);
    this.logFilterState();
  }

  private logFilterState() {
    console.log('Produtos carregados:', this.allProducts.length);
    console.log('Categoria selecionada:', this.selectedCategory);
    console.log('Produtos filtrados:', this.filteredProducts.length);
  }
}

