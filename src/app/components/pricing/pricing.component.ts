import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../shared/material/material.module';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { PricingService } from '../../service/pricing.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxMatTimepickerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {

  pricingForm!: FormGroup;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private pricingService: PricingService
  ) {}

  ngOnInit(): void {
 this.pricingForm = this.fb.group({
  fullDay: [false],
  fullDayPrice: [{ value: '', disabled: true }, [Validators.min(0)]],
  checkIn: [{ value: '00:00', disabled: true }],   // 12:00 AM default
  checkOut: [{ value: '00:00', disabled: true }],  // 12:00 AM default
  mealsOffered: [false],
  breakfastAvailable: [{ value: false, disabled: true }],
  breakfast: [{ value: '', disabled: true }],
  lunchAvailable: [{ value: false, disabled: true }],
  lunch: [{ value: '', disabled: true }],
  dinnerAvailable: [{ value: false, disabled: true }],
  dinner: [{ value: '', disabled: true }],
  hiTeaAvailable: [{ value: false, disabled: true }],
  hiTea: [{ value: '', disabled: true }]
});


    this.setupFormListeners();
  }

  setupFormListeners() {
    const fullDayPriceControl = this.pricingForm.get('fullDayPrice');
    const checkInControl = this.pricingForm.get('checkIn');
    const checkOutControl = this.pricingForm.get('checkOut');

    this.pricingForm.get('fullDay')?.valueChanges.subscribe(enabled => {
      if (enabled) {
        fullDayPriceControl?.enable();
        checkInControl?.enable();
        checkOutControl?.enable();
        fullDayPriceControl?.setValidators([Validators.required, Validators.min(0)]);
        checkInControl?.setValidators([Validators.required]);
        checkOutControl?.setValidators([Validators.required]);
      } else {
        fullDayPriceControl?.disable();
        checkInControl?.disable();
        checkOutControl?.disable();
        fullDayPriceControl?.clearValidators();
        checkInControl?.clearValidators();
        checkOutControl?.clearValidators();
      }
      fullDayPriceControl?.updateValueAndValidity();
      checkInControl?.updateValueAndValidity();
      checkOutControl?.updateValueAndValidity();
    });

    this.pricingForm.get('mealsOffered')?.valueChanges.subscribe(enabled => {
      const mealToggles = ['breakfastAvailable', 'lunchAvailable', 'dinnerAvailable', 'hiTeaAvailable'];
      const mealInputs = ['breakfast', 'lunch', 'dinner', 'hiTea'];
      mealToggles.forEach((toggle, i) => {
        const toggleCtrl = this.pricingForm.get(toggle);
        const inputCtrl = this.pricingForm.get(mealInputs[i]);
        if (enabled) {
          toggleCtrl?.enable();
        } else {
          toggleCtrl?.disable();
          inputCtrl?.disable();
          inputCtrl?.setValue('');
        }
      });
    });

    ['breakfast', 'lunch', 'dinner', 'hiTea'].forEach(meal => {
      this.pricingForm.get(`${meal}Available`)?.valueChanges.subscribe(enabled => {
        const inputCtrl = this.pricingForm.get(meal);
        enabled ? inputCtrl?.enable() : inputCtrl?.disable();
      });
    });
  }

  onSubmit() {
    if (!this.pricingForm.valid) {
      this.snackBar.open('⚠️ Please fill in required fields.', '', {
        duration: 3000,
        panelClass: ['snackbar-error'],
         horizontalPosition: 'right',
         verticalPosition: 'top'
      });
      return;
    }

    const rawData = this.pricingForm.getRawValue();
    const data = {
      fullDay: rawData.fullDay,
      fullDayPrice: rawData.fullDayPrice ? Number(rawData.fullDayPrice) : 0,
      checkIn: rawData.checkIn || '',
      checkOut: rawData.checkOut || '',
      mealsOffered: rawData.mealsOffered,
      breakfastAvailable: rawData.breakfastAvailable,
      breakfast: rawData.breakfast || '',
      lunchAvailable: rawData.lunchAvailable,
      lunch: rawData.lunch || '',
      dinnerAvailable: rawData.dinnerAvailable,
      dinner: rawData.dinner || '',
      hiTeaAvailable: rawData.hiTeaAvailable,
      hiTea: rawData.hiTea || ''
    };

    // Show spinner for 3 seconds
    this.loading = true;

    setTimeout(() => {
      this.loading = false;
      this.snackBar.open('✅ Pricing Saved Successfully!', '', {
        duration: 3000,
        panelClass: ['snackbar-success'],
         horizontalPosition: 'right',
         verticalPosition: 'top'
      });
      this.pricingForm.reset();

      // Call API after spinner
      this.pricingService.addPricing(data).subscribe({
        error: (err) => console.error(err)
      });

    }, 3000);
  }
}
