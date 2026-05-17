import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/categories';

  // No Angular (category.service.ts)
getCategories() {
  return this.http.get<any>(this.apiUrl).pipe(
    map(res => res.data) // <--- GARANTE QUE TENS ESTA LINHA
  );
}
}