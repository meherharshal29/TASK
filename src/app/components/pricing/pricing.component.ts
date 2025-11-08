import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../shared/material/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { PricingService } from '../../service/pricing.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, NgxMatTimepickerModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
  pricingForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private pricingService: PricingService  
  ) {}

 ngOnInit(): void {
  this.pricingForm = this.fb.group({
    fullDay: [false],
    fullDayPrice: [{ value: '', disabled: true }, [Validators.min(0)]],
    checkIn: [{ value: '', disabled: true }, []],
    checkOut: [{ value: '', disabled: true }, []],

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

/** Enable/disable fields dynamically and add/remove validators */
setupFormListeners() {
  const fullDayPriceControl = this.pricingForm.get('fullDayPrice');
  const checkInControl = this.pricingForm.get('checkIn');
  const checkOutControl = this.pricingForm.get('checkOut');

  // Full Day toggle
  this.pricingForm.get('fullDay')?.valueChanges.subscribe((enabled) => {
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

  // Meals Offered toggle
  this.pricingForm.get('mealsOffered')?.valueChanges.subscribe((enabled) => {
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

  // Individual meal toggle enables its input
  ['breakfast', 'lunch', 'dinner', 'hiTea'].forEach((meal) => {
    this.pricingForm.get(`${meal}Available`)?.valueChanges.subscribe((enabled) => {
      const inputCtrl = this.pricingForm.get(meal);
      enabled ? inputCtrl?.enable() : inputCtrl?.disable();
    });
  });
}

onSubmit() {
  if (this.pricingForm.valid) {
    const rawData = this.pricingForm.getRawValue();

    // ✅ Convert empty numeric fields to 0, string fields to ''
    const data = {
      fullDay: rawData.fullDay,
      fullDayPrice: rawData.fullDayPrice ? Number(rawData.fullDayPrice) : 0,
      checkIn: rawData.checkIn || '',
      checkOut: rawData.checkOut || '',
      mealsOffered: rawData.mealsOffered,

      breakfastAvailable: rawData.breakfastAvailable,
      breakfast: rawData.breakfast ? String(rawData.breakfast) : '',

      lunchAvailable: rawData.lunchAvailable,
      lunch: rawData.lunch ? String(rawData.lunch) : '',

      dinnerAvailable: rawData.dinnerAvailable,
      dinner: rawData.dinner ? String(rawData.dinner) : '',

      hiTeaAvailable: rawData.hiTeaAvailable,
      hiTea: rawData.hiTea ? String(rawData.hiTea) : ''
    };

    this.pricingService.addPricing(data).subscribe({
      next: (res) => {
        this.snackBar.open('✅ Pricing Saved Successfully!', '', { duration: 3000, panelClass: ['snackbar-success'] });
        this.pricingForm.reset();
      },
      error: (err) => {
        this.snackBar.open('❌ Error saving data', '', { duration: 3000, panelClass: ['snackbar-error'] });
        console.error(err.error);
      }
    });
  } else {
    this.snackBar.open('⚠️ Please fill in required fields.', '', { duration: 3000, panelClass: ['snackbar-error'] });
  }
}

}
