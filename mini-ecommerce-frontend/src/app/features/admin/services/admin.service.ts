import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { timeout } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api';

  getDashboard() {
    return this.http.get<any>(`${this.apiUrl}/admin/dashboard`).pipe(timeout(10000));
  }

  getProducts() {
    return this.http.get<any>(`${this.apiUrl}/admin/products`).pipe(timeout(10000));
  }

  createProduct(data: FormData) {
    return this.http.post<any>(`${this.apiUrl}/admin/products`, data).pipe(timeout(10000));
  }

  updateProduct(id: number, data: FormData) {
    data.append('_method', 'PUT');
    return this.http.post<any>(`${this.apiUrl}/admin/products/${id}`, data).pipe(timeout(10000));
  }

  deleteProduct(id: number) {
    return this.http.delete<any>(`${this.apiUrl}/admin/products/${id}`).pipe(timeout(10000));
  }

  getOrders() {
    return this.http.get<any>(`${this.apiUrl}/admin/orders`).pipe(timeout(10000));
  }

  getOrder(id: number) {
    return this.http.get<any>(`${this.apiUrl}/admin/orders/${id}`).pipe(timeout(10000));
  }

  updateOrderStatus(id: number, status: string) {
    return this.http.patch<any>(`${this.apiUrl}/admin/orders/${id}/status`, { status }).pipe(timeout(10000));
  }

  getCategories() {
    return this.http.get<any>(`${this.apiUrl}/categories`).pipe(timeout(10000));
  }

  exportCsv() {
    return this.http.get(`${this.apiUrl}/admin/reports/export-csv`, {
      responseType: 'blob',
    });
  }

  exportPdf() {
    return this.http.get(`${this.apiUrl}/admin/reports/export-pdf`, {
      responseType: 'blob',
    });
  }

  updatePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }) {
    return this.http.put<any>(`${this.apiUrl}/user/password`, data).pipe(timeout(10000));
  }
}
