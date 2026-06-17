import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { BadgeComponent } from '../../common/components/badge/badge.component';
import { ButtonComponent } from '../../common/components/button/button.component';
import { PriceComponent } from '../../common/components/price/price.component';
import { SpinnerComponent } from '../../common/components/spinner/spinner.component';
import { AuthStore } from '../../core/stores/auth.store';
import { Product, TIRE_CATEGORY_LABELS } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-product-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    BadgeComponent,
    ButtonComponent,
    PriceComponent,
    SpinnerComponent,
  ],
  templateUrl: './product-detail-page.component.html',
  styleUrls: ['./product-detail-page.component.scss'],
})
export class ProductDetailPageComponent {
  private readonly productService = inject(ProductService);
  private readonly cartStore = inject(CartStore);
  private readonly authStore = inject(AuthStore);
  private readonly formBuilder = inject(FormBuilder);

  readonly id = input.required<string>();

  protected readonly product = signal<Product | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly isSubmittingComment = signal(false);
  protected readonly commentError = signal('');
  protected readonly ratingOptions = [1, 2, 3, 4, 5] as const;

  protected readonly commentForm = this.formBuilder.nonNullable.group({
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1000)]],
  });

  protected readonly categoryLabel = computed(() => {
    const p = this.product();
    return p ? TIRE_CATEGORY_LABELS[p.category] : '';
  });

  protected readonly comments = computed(() => this.product()?.comments ?? []);
  protected readonly commentsCount = computed(() => this.comments().length);
  protected readonly averageRating = computed(() => {
    const comments = this.comments();
    if (comments.length === 0) {
      return null;
    }

    const total = comments.reduce((sum, comment) => sum + comment.rating, 0);
    return Math.round((total / comments.length) * 10) / 10;
  });
  protected readonly currentUser = computed(() => this.authStore.user());

  constructor() {
    effect(() => {
      const slug = this.id();
      this.isLoading.set(true);
      this.notFound.set(false);
      this.product.set(null);

      this.productService.getBySlug(slug).subscribe({
        next: (p) => {
          this.product.set(p);
          this.isLoading.set(false);
        },
        error: () => {
          this.notFound.set(true);
          this.isLoading.set(false);
        },
      });
    });
  }

  protected setRating(rating: number): void {
    this.commentForm.controls.rating.setValue(rating);
    this.commentForm.controls.rating.markAsTouched();
  }

  protected submitComment(): void {
    if (this.commentForm.invalid || this.isSubmittingComment()) {
      this.commentForm.markAllAsTouched();
      return;
    }

    const product = this.product();
    if (!product) {
      return;
    }

    this.isSubmittingComment.set(true);
    this.commentError.set('');

    const payload = this.commentForm.getRawValue();
    this.productService
      .createComment(product.id, payload)
      .pipe(finalize(() => this.isSubmittingComment.set(false)))
      .subscribe({
        next: (comment) => {
          this.product.update((current) =>
            current
              ? {
                  ...current,
                  comments: [comment, ...(current.comments ?? [])],
                }
              : current,
          );
          this.commentForm.reset({ rating: 5, comment: '' });
        },
        error: (error) => {
          if (error.status === 422) {
            this.commentError.set(
              'Merci de choisir une note entre 1 et 5 et d’écrire un commentaire valide.',
            );
            return;
          }

          if (error.status === 401) {
            this.commentError.set(
              'Votre session a expiré. Reconnectez-vous pour publier un commentaire.',
            );
            return;
          }

          this.commentError.set('Une erreur est survenue lors de l’envoi de votre commentaire.');
        },
      });
  }
}
