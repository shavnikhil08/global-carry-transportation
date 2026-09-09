import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { EmailConfig } from '../../config/email.config';

@Component({
  selector: 'app-career',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './career.component.html',
  styleUrl: './career.component.scss'
})
export class CareerComponent {
  careerForm: FormGroup;
  isSubmitting = signal<boolean>(false);

  positions = [
    'Back Office Executive',
    'Dispatch Executive',
    'Tracking & Tracing Executive',
    'Load Booking Executive'
  ];

  constructor(private fb: FormBuilder, private toastr: ToastrService) {
    this.careerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      position: ['', Validators.required],
      details: ['']
    });
  }



  hasFieldError(fieldName: string): boolean {
    const field = this.careerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }



  async submitApplication(formElement: HTMLFormElement) {
    if (this.careerForm.invalid) {
      // Mark all controls as touched to trigger validation UI
      Object.values(this.careerForm.controls).forEach(control => {
        control.markAsTouched();
      });
      this.toastr.error('Please fill all required fields.', 'Form Invalid');
      return;
    }

    this.isSubmitting.set(true);

    try {
      const serviceId = EmailConfig.defaultServiceId;
      const templateId = EmailConfig.templates.career;
      const publicKey = EmailConfig.defaultPublicKey;

      await emailjs.send(
        serviceId, 
        templateId, 
        {
          user_name: this.careerForm.value.fullName,
          user_email: this.careerForm.value.email,
          user_phone: this.careerForm.value.phone,
          position: this.careerForm.value.position,
          message: this.careerForm.value.details || 'None provided'
        },
        publicKey
      );

      this.toastr.success('Your application has been submitted successfully!', 'Application Sent');
      this.careerForm.reset();
    } catch (error) {
      console.error('FAILED to send application...', error);
      this.toastr.error('Failed to submit application. Please check your connection and try again.', 'Submission Failed');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
