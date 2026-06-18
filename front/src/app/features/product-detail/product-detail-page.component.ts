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
import {
  DealerInfo,
  DealerModalComponent,
} from '../../common/components/dealer-modal/dealer-modal.component';
import { PriceComponent } from '../../common/components/price/price.component';
import { SpinnerComponent } from '../../common/components/spinner/spinner.component';
import { AuthStore } from '../../core/stores/auth.store';
import { Product, TIRE_CATEGORY_LABELS } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { ResellerService } from '../../core/services/reseller.service';

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
    DealerModalComponent,
    PriceComponent,
    SpinnerComponent,
  ],
  templateUrl: './product-detail-page.component.html',
  styleUrls: ['./product-detail-page.component.scss'],
})
export class ProductDetailPageComponent {
  private static readonly IMAGE_SWITCH_DURATION_MS = 120;

  private readonly productService = inject(ProductService);
  private readonly resellerService = inject(ResellerService);
  private readonly authStore = inject(AuthStore);
  private readonly formBuilder = inject(FormBuilder);
  private imageSwitchTimer: ReturnType<typeof setTimeout> | null = null;

  readonly id = input.required<string>();

  protected readonly product = signal<Product | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly isSubmittingComment = signal(false);
  protected readonly isDealerModalOpen = signal(false);
  protected readonly isLoadingDealers = signal(false);
  protected readonly dealerError = signal('');
  protected readonly dealers = signal<DealerInfo[]>([]);
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
  protected readonly selectedImageUrl = computed(() => this.product()?.imageUrl ?? '');
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
      this.selectedImageIndex.set(0);
      this.isDealerModalOpen.set(false);
      this.isLoadingDealers.set(false);
      this.dealerError.set('');
      this.dealers.set([]);

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

    effect(() => {
      const imagesCount = this.galleryImages().length;
      const currentIndex = this.selectedImageIndex();

      if (imagesCount === 0) {
        this.selectedImageIndex.set(0);
        return;
      }

      if (currentIndex >= imagesCount) {
        this.selectedImageIndex.set(0);
      }
    });
  }

  protected openDealerModal(): void {
    this.isDealerModalOpen.set(true);
    if (this.dealers().length === 0 && !this.isLoadingDealers()) {
      this.loadDealers();
    }
  }

  protected closeDealerModal(): void {
    this.isDealerModalOpen.set(false);
  }

  protected retryLoadDealers(): void {
    this.loadDealers();
  }

  private loadDealers(): void {
    const slug = this.id();
    if (!slug) {
      return;
    }

    this.isLoadingDealers.set(true);
    this.dealerError.set('');

    this.resellerService.getByProductSlug(slug).subscribe({
      next: (dealers) => {
        this.dealers.set(dealers);
        this.isLoadingDealers.set(false);
      },
      error: () => {
        this.dealerError.set('Impossible de charger les revendeurs pour ce produit.');
        this.isLoadingDealers.set(false);
      },
    });
  }

  protected selectImage(index: number): void {
    if (index < 0 || index >= this.galleryImages().length) {
      return;
    }

    this.switchImageWithTransition(index);
  }

  protected showPreviousImage(): void {
    const images = this.galleryImages();
    if (images.length <= 1) {
      return;
    }

    const current = this.selectedImageIndex();
    this.switchImageWithTransition((current - 1 + images.length) % images.length);
  }

  protected showNextImage(): void {
    const images = this.galleryImages();
    if (images.length <= 1) {
      return;
    }

    const current = this.selectedImageIndex();
    this.switchImageWithTransition((current + 1) % images.length);
  }

  private switchImageWithTransition(nextIndex: number): void {
    if (nextIndex === this.selectedImageIndex()) {
      return;
    }

    if (this.imageSwitchTimer) {
      clearTimeout(this.imageSwitchTimer);
      this.imageSwitchTimer = null;
    }

    this.isImageSwitching.set(true);
    this.imageSwitchTimer = setTimeout(() => {
      this.selectedImageIndex.set(nextIndex);
      this.isImageSwitching.set(false);
      this.imageSwitchTimer = null;
    }, ProductDetailPageComponent.IMAGE_SWITCH_DURATION_MS);
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
