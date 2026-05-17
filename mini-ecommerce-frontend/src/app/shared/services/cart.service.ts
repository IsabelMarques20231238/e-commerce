import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject, switchMap, tap, timeout } from 'rxjs';

interface CartItem {
  id: number;
  productId?: number;
  name: string;
  category?: string;
  image: string;
  price: number;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api';
  private cartCountSubject = new BehaviorSubject<number>(0);

  items = signal<CartItem[]>([]);
  totalItems = signal(0);
  cartCount$ = this.cartCountSubject.asObservable();

  loadCart() {
    return this.http.get<any>(`${this.apiUrl}/cart`).pipe(
      timeout(10000),
      tap((res) => this.syncFromApi(res))
    );
  }

  addProduct(productId: number, quantity = 1) {
    return this.http.post<any>(`${this.apiUrl}/cart/add`, {
      product_id: productId,
      quantity,
    }).pipe(
      timeout(10000),
      switchMap(() => this.loadCartCount())
    );
  }

  removeItem(itemId: number) {
    return this.http.delete<any>(`${this.apiUrl}/cart/remove/${itemId}`).pipe(
      timeout(10000),
      tap(() => {
        const items = this.items().filter((item) => item.id !== itemId);
        this.items.set(items);
        this.updateTotalItems();
      })
    );
  }

  updateItemQuantity(itemId: number, quantity: number) {
    return this.http.put<any>(`${this.apiUrl}/cart/items/${itemId}`, {
      quantity,
    }).pipe(
      timeout(10000),
      tap(() => {
        const items = this.items().map((item) => item.id === itemId ? { ...item, quantity } : item);
        this.items.set(items);
        this.updateTotalItems();
      })
    );
  }

  loadCartCount() {
    return this.http.get<any>(`${this.apiUrl}/cart`).pipe(
      timeout(10000),
      tap((response) => {
        console.log('[CartService] resposta /api/cart:', response);
        const count = this.extractCountFromResponse(response);
        console.log('[CartService] count calculado:', count);
        this.setCartCount(count);
      })
    );
  }

  refreshCartCount() {
    this.loadCartCount().subscribe({
      error: (error) => console.error('Erro ao atualizar contador do carrinho:', error)
    });
  }

  setCartCount(count: number) {
    const safeCount = Number.isFinite(Number(count)) ? Math.max(0, Number(count)) : 0;
    this.cartCountSubject.next(safeCount);
    this.totalItems.set(safeCount);
  }

  resetCartCount() {
    this.setCartCount(0);
  }

  checkout(paymentMethod: string) {
    return this.http.post<any>(`${this.apiUrl}/cart/checkout`, {
      payment_method: paymentMethod,
    }).pipe(
      timeout(10000),
      tap(() => {
        this.items.set([]);
        this.setCartCount(0);
      })
    );
  }

  addToCart(product: Omit<CartItem, 'quantity'>) {
    const items = this.items();
    const existingItem = items.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity++;
      this.items.set([...items]);
    } else {
      this.items.set([...items, { ...product, quantity: 1 }]);
    }

    this.updateTotalItems();
  }

  incrementar(itemId: number) {
    const items = this.items();
    const item = items.find(i => i.id === itemId);
    if (item) {
      item.quantity++;
      this.items.set([...items]);
      this.updateTotalItems();
    }
  }

  decrementar(itemId: number) {
    const items = this.items();
    const item = items.find(i => i.id === itemId);
    if (item && item.quantity > 1) {
      item.quantity--;
      this.items.set([...items]);
      this.updateTotalItems();
    }
  }

  remover(itemId: number) {
    const items = this.items().filter(i => i.id !== itemId);
    this.items.set(items);
    this.updateTotalItems();
  }

  getSubtotal(): number {
    return this.items().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  private updateTotalItems() {
    const total = this.items().reduce((sum, item) => sum + item.quantity, 0);
    this.totalItems.set(total);
    this.setCartCount(total);
  }

  private syncFromApi(res: any) {
    const apiItems = this.extractItemsFromResponse(res);
    const items = apiItems.map((item: any) => ({
      id: item.id,
      productId: Number(item.product_id ?? item.product?.id ?? item.id),
      name: item.product?.name ?? 'Produto',
      category: item.product?.category?.name,
      image: item.product?.image_url ?? item.product?.image ?? 'assets/default-product.png',
      price: Number(item.product?.price ?? 0),
      quantity: Number(item.quantity ?? 1),
    }));

    this.items.set(items);
    this.updateTotalItems();
  }

  private extractItemsFromResponse(res: any) {
    const apiItems =
      res?.data?.items ??
      res?.items ??
      (Array.isArray(res?.data) ? res.data : undefined) ??
      res?.cart?.items ??
      (Array.isArray(res) ? res : []);

    return Array.isArray(apiItems) ? apiItems : [];
  }

  private extractCountFromResponse(res: any) {
    const apiItems = this.extractItemsFromResponse(res);
    return apiItems.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0);
  }
}
