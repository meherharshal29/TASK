import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PricingService {

  private baseUrl = 'http://localhost:3000/api/pricing'; 

  constructor(private http: HttpClient) { }

  // ✅ Add new pricing data
  addPricing(pricingData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, pricingData);
  }

  // ✅ Get all pricing data
  getAllPricing(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  // ✅ Delete pricing by ID
  deletePricing(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
