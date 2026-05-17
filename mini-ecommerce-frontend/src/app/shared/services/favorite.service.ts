import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { timeout } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/favorites';

  getFavorites() {
    return this.http.get<any>(this.apiUrl).pipe(timeout(10000));
  }

  addFavorite(productId: number) {
    return this.http.post<any>(this.apiUrl, { product_id: productId }).pipe(timeout(10000));
  }

  removeFavorite(productId: number) {
    return this.http.delete<any>(`${this.apiUrl}/${productId}`).pipe(timeout(10000));
  }
}
