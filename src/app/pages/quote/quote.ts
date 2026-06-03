import { Component, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';
import { ToastrService } from 'ngx-toastr';

interface QuoteRequest {
  refNumber: string;
  date: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  services: string[];
  origin: string;
  destination: string;
  weight: string;
  cargoType: string;
}

@Component({
  selector: 'app-quote',
  imports: [ReactiveFormsModule],
  templateUrl: './quote.component.html',
  styleUrl: './quote.component.scss'
})
export class QuoteComponent {
  protected readonly currentStep = signal<'contact' | 'services' | 'cargo' | 'submitting' | 'success'>('contact');
  protected readonly generatedRef = signal<string>('');
  protected readonly savedQuotes = signal<QuoteRequest[]>([]);

  quoteForm: FormGroup;

  constructor(private fb: FormBuilder, private toastr: ToastrService) {
    this.quoteForm = this.fb.group({
      contactName: ['', Validators.required],
      companyName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],

      // Services checkboxes
      serviceFreight: [false],
      serviceRefrigerated: [false],
      serviceStepDeck: [false],
      serviceFlatbed: [false],
      serviceConestoga: [false],

      // Cargo Specs & Origin/Destination
      originCity: ['', Validators.required],
      destinationCity: ['', Validators.required],
      cargoWeight: ['', Validators.required],
      handlingUnit: ['', Validators.required],
      cargoDescription: ['']
    });

    this.loadQuotesFromStorage();
  }

  // Progress Calculations
  protected readonly progressPercent = computed(() => {
    switch (this.currentStep()) {
      case 'contact': return 10;
      case 'services': return 50;
      case 'cargo': return 90;
      default: return 100;
    }
  });

  isStepDone(step: 'contact' | 'services' | 'cargo'): boolean {
    if (step === 'contact') {
      return this.currentStep() !== 'contact';
    }
    if (step === 'services') {
      return this.currentStep() === 'cargo' || this.currentStep() === 'success' || this.currentStep() === 'submitting';
    }
    return this.currentStep() === 'success';
  }

  // Validators
  isContactStepInvalid(): boolean {
    const name = this.quoteForm.get('contactName');
    const company = this.quoteForm.get('companyName');
    const email = this.quoteForm.get('email');
    const phone = this.quoteForm.get('phone');

    return !!(
      (name && name.invalid) ||
      (company && company.invalid) ||
      (email && email.invalid) ||
      (phone && phone.invalid)
    );
  }

  isNoServicesSelected(): boolean {
    const f = this.quoteForm.get('serviceFreight')?.value;
    const r = this.quoteForm.get('serviceRefrigerated')?.value;
    const sd = this.quoteForm.get('serviceStepDeck')?.value;
    const fb = this.quoteForm.get('serviceFlatbed')?.value;
    const c = this.quoteForm.get('serviceConestoga')?.value;
    return !f && !r && !sd && !fb && !c;
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.quoteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Toggles for step 2 custom select cards
  toggleService(controlName: string) {
    const ctrl = this.quoteForm.get(controlName);
    if (ctrl) {
      ctrl.setValue(!ctrl.value);
    }
  }

  // Wizard Navigation
  goToNextStep(step: 'services' | 'cargo') {
    this.currentStep().slice(); // Trigger reactivity or log
    this.currentStep().trim();
    this.currentStep.set(step);
  }

  goToPrevStep(step: 'contact' | 'services') {
    this.currentStep.set(step);
  }

  // Submit Handler
  async submitQuote() {
    if (this.quoteForm.invalid) {
      return;
    }

    this.currentStep.set('submitting');

    const ref = 'NK-Q-' + Math.floor(100000 + Math.random() * 900000);
    this.generatedRef.set(ref);

    // Collect services
    const svcs: string[] = [];
    if (this.quoteForm.value.serviceFreight) svcs.push('Freight');
    if (this.quoteForm.value.serviceRefrigerated) svcs.push('Refrigerated');
    if (this.quoteForm.value.serviceStepDeck) svcs.push('Step Deck');
    if (this.quoteForm.value.serviceFlatbed) svcs.push('Flatbed');
    if (this.quoteForm.value.serviceConestoga) svcs.push('Conestoga');

    const newQuote: QuoteRequest = {
      refNumber: ref,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      name: this.quoteForm.value.contactName,
      company: this.quoteForm.value.companyName,
      email: this.quoteForm.value.email,
      phone: this.quoteForm.value.phone,
      services: svcs,
      origin: this.quoteForm.value.originCity,
      destination: this.quoteForm.value.destinationCity,
      weight: this.quoteForm.value.cargoWeight,
      cargoType: this.quoteForm.value.handlingUnit
    };

    try {
      // NOTE: Replace 'YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', and 'YOUR_PUBLIC_KEY' with your actual EmailJS credentials
      await emailjs.send(
        'service_mjgqlu6',
        'template_fxgqpup',
        {
          ref_number: newQuote.refNumber,
          to_name: newQuote.name,
          to_email: newQuote.email,
          company: newQuote.company,
          phone: newQuote.phone,
          services: newQuote.services.join(', '),
          origin: newQuote.origin,
          destination: newQuote.destination,
          weight: newQuote.weight,
          cargo_type: newQuote.cargoType,
          cargo_description: this.quoteForm.value.cargoDescription || 'None provided'
        },
        '9bYq49Wsp1dOKRKWC'
      );

      // Save to localStorage
      const existing = this.getQuotesFromStorage();
      existing.unshift(newQuote);
      localStorage.setItem('nikhil_quotes', JSON.stringify(existing));
      this.savedQuotes.set(existing);

      this.toastr.success('Your quote has been submitted! Our team will reach you within 15 minutes.', 'Quote Sent!');
      this.currentStep.set('success');
    } catch (error) {
      console.error('FAILED to send email...', error);
      this.toastr.error('Failed to send the quote request. Please check your connection and try again.', 'Submission Failed');
      this.currentStep.set('cargo');
    }
  }

  resetForm() {
    this.quoteForm.reset({
      contactName: '',
      companyName: '',
      email: '',
      phone: '',
      serviceFreight: false,
      serviceRefrigerated: false,
      serviceStepDeck: false,
      serviceFlatbed: false,
      serviceConestoga: false,
      originCity: '',
      destinationCity: '',
      cargoWeight: '',
      handlingUnit: '',
      cargoDescription: ''
    });
    this.currentStep.set('contact');
  }

  // LocalStorage Helpers
  private loadQuotesFromStorage() {
    this.savedQuotes.set(this.getQuotesFromStorage());
  }

  private getQuotesFromStorage(): QuoteRequest[] {
    try {
      const stored = localStorage.getItem('nikhil_quotes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  clearSavedQuotes() {
    localStorage.removeItem('nikhil_quotes');
    this.savedQuotes.set([]);
  }
}
