import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  protected readonly messageSent = signal(false);
  protected readonly isSending = signal(false);
  protected readonly expandedFaq = signal<number | null>(null);

  contactForm: FormGroup;

  faqs: FAQItem[] = [
    {
      id: 1,
      question: 'How fast do you respond to quote requests?',
      answer: 'Our sales desk operates 24/7/365. For standard FTL/LTL and general hazmat inquiries, we promise a complete proposal back to you within 15 minutes of submission.'
    },
    {
      id: 2,
      question: 'What are your cargo insurance liability coverages?',
      answer: 'All freight moved by Global Carry Transportation is covered under our primary liability insurance policy up to $250,000. Higher cargo valuations can be accommodated through custom quotes.'
    },
    {
      id: 3,
      question: 'Do you offer temperature tracking reports for cold transit?',
      answer: 'Yes. All refrigerated shipments are monitored in real time using cellular telemetry. We supply complete temperature logging PDF files to clients upon cargo delivery.'
    },
    {
      id: 4,
      question: 'What safety certifications does your hazmat team have?',
      answer: 'All our hazmat drivers hold DOT certification in hazardous materials. Our facilities meet EPA and IATA standards for dangerous goods storage and handling.'
    }
  ];

  constructor(private fb: FormBuilder, private toastr: ToastrService) {
    this.contactForm = this.fb.group({
      senderName: ['', Validators.required],
      senderEmail: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  sendMessage() {
    if (this.contactForm.invalid) {
      return;
    }

    this.isSending.set(true);

    // Simulate API delay
    setTimeout(() => {
      this.isSending.set(false);
      this.messageSent.set(true);
      this.toastr.success('Your message has been received! Our dispatch team will contact you within 15 minutes.', 'Message Sent!');
    }, 1200);
  }

  resetForm() {
    this.contactForm.reset();
    this.messageSent.set(false);
  }

  toggleFaq(id: number) {
    if (this.expandedFaq() === id) {
      this.expandedFaq.set(null);
    } else {
      this.expandedFaq.set(id);
    }
  }
}
