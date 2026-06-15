import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
})
export class FormFieldComponent {
  readonly label = input<string>();
  readonly inputId = input.required<string>();
  readonly error = input<string>();
  readonly hint = input<string>();
  readonly required = input(false);
}
