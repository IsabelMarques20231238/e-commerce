import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, timeout } from 'rxjs';

export interface UserProfile {
  id?: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  avatar?: string | null;
  created_at?: string;
}

export interface UserProfileUpdate {
  name: string;
  phone?: string | null;
  address?: string | null;
  avatar?: string | null;
}

export interface UserOrder {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items?: UserOrderItem[];
  order_items?: UserOrderItem[];
  user?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  payment_method?: string | null;
  payment_status?: string | null;
}

export interface UserOrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    name: string;
    image?: string | null;
    image_url?: string | null;
  };
}

export interface PasswordUpdate {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api';
  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  me() {
    return this.http.get<{ status: string; data: UserProfile }>(`${this.apiUrl}/me`).pipe(
      timeout(10000),
      tap((res) => this.userSubject.next(res.data))
    );
  }

  updateProfile(data: UserProfileUpdate) {
    return this.http.put<{ status: string; data: UserProfile }>(`${this.apiUrl}/user/profile`, data).pipe(
      timeout(10000),
      tap((res) => this.userSubject.next(res.data))
    );
  }

  getOrders() {
    return this.http.get<{ status: string; data: UserOrder[] }>(`${this.apiUrl}/orders`).pipe(
      timeout(10000)
    );
  }

  getOrder(orderId: number) {
    return this.http.get<{ status: string; data: UserOrder }>(`${this.apiUrl}/orders/${orderId}`).pipe(
      timeout(10000)
    );
  }

  updatePassword(data: PasswordUpdate) {
    return this.http.put<{ status: string; message: string }>(`${this.apiUrl}/user/password`, data).pipe(
      timeout(10000)
    );
  }

  setCurrentUser(user: UserProfile | null) {
    this.userSubject.next(user);
  }
}
