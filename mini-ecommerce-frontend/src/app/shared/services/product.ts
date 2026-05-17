import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'http://127.0.0.1:8000/api/products'; // Teu Laravel

  constructor(private http: HttpClient) {}

  getProducts() {
    return this.http.get<any>(this.apiUrl).pipe(timeout(10000));
  }
}
