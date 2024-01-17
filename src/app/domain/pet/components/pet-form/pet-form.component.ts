import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MaterialFileInputModule } from 'ngx-custom-material-file-input';
import { ImageCroppedEvent, ImageCropperModule } from 'ngx-image-cropper';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { FADE_ANIMATION } from '../../../../shared/animations/fade';
import { NotificationService } from '../../../../shared/services/notification/notification.service';
import { BINARY_MULTIPLES } from '../../constants/binary';
import { FormControlRangeDirective } from '../../directives/form-control-range/form-control-range.directive';
import { eStep } from '../../enum/step.enum';
import { Owner, Pet } from '../../interfaces/pet';
import { FileSizePipe } from '../../pipes/file-size/file-size.pipe';
import { PetService } from '../../services/pet/pet.service';

@Component({
  selector: 'app-pet-form,[app-pet-form]',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    ImageCropperModule,
    MaterialFileInputModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatDividerModule,
    FileSizePipe,
    MatTooltipModule,
    FormControlRangeDirective,
  ],
  animations: [FADE_ANIMATION],
  templateUrl: './pet-form.component.html',
  styleUrl: './pet-form.component.scss',
})
export class PetFormComponent implements OnInit {
  @ViewChild('cropContainer') cropContainer: TemplateRef<unknown>;

  formGroup = new FormGroup({
    id: new FormControl(),
    name: new FormControl('', [Validators.required]),
    birthDate: new FormControl('', [Validators.required]),
    photoUrl: new FormControl<File | null>(null, [Validators.required]),
    owner: new FormControl(NaN, [Validators.required]),
  });
  imageChangedEvent: SafeUrl | null;
  croppedImage: SafeUrl | null;
  event: ImageCroppedEvent;
  imageBase64: string;
  size: number;
  file: File | null;
  maxSize: number;
  dateNow = new Date();

  @Input() pets: WritableSignal<Pet[]>;
  @Input() owners: WritableSignal<Owner[]>;
  @Input() step: WritableSignal<number | null>;
  @Input() matExpansionPanel: QueryList<MatExpansionPanel>;
  owners$: Observable<Owner[]>;

  constructor(
    private _sanitizer: DomSanitizer,
    readonly notificationService: NotificationService,
    readonly matDialog: MatDialog,
    readonly petService: PetService
  ) {}
  ngOnInit(): void {
    this.resetPetForm();
  }

  openImageCropper() {
    if (this.croppedImage) {
      this.matDialog.open(this.cropContainer);
    } else {
      this.notificationService.showSnackBarError({
        message: 'Please select an image',
      });
    }
  }
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    this.file = event.target.files[0];
    const file = event.target['files'][0];
    this.formGroup.controls.photoUrl.setValue(file);
    this.croppedImage = this._sanitizer.bypassSecurityTrustUrl(
      window.URL.createObjectURL(file)
    );
    this.matDialog.open(this.cropContainer);
  }
  async imageCropped(event: ImageCroppedEvent) {
    this.event = event;
    const fiveHundredMB = 501024;
    this.size = (await this.event.blob?.size) ?? 0;
    this.size = +(this.size / BINARY_MULTIPLES).toFixed(2);
    this.maxSize = +(fiveHundredMB / BINARY_MULTIPLES).toFixed(2);

    if (this.isInvalideFileLength) {
      this.notificationService.showSnackBarError({
        message: `File size should be less than ${this.maxSize}KB`,
      });
    }
  }
  get isInvalideFileLength() {
    return (this.size ?? 0) > (this.maxSize ?? 0);
  }

  private getPetImage(pet: Pet) {
    this.petService.httpClient
      .get(`${this.petService.getPetImageUrl(pet.photoUrl)}`, {
        responseType: 'blob',
      })
      .subscribe((blob) => {
        this.croppedImage = this._sanitizer.bypassSecurityTrustUrl(
          window.URL.createObjectURL(blob)
        );
        this.file = new File([blob], pet.photoUrl, {
          lastModified: new Date().getTime(),
        });
        this.formGroup.controls.photoUrl.setValue(this.file);
        this.readBlob(blob);
      });
  }
  private readBlob(blob: Blob) {
    const self = this;
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      const base64data = reader.result;
      self.imageBase64 = base64data as string;
    };
  }

  async saveImage() {
    if (!this.file || !this.event.blob) {
      this.notificationService.showSnackBarError({
        message: 'Please select an image',
      });
      return;
    }

    this.croppedImage = this._sanitizer.bypassSecurityTrustUrl(
      this.event.objectUrl as string
    );
    const buffer = await this.event.blob.arrayBuffer();
    this.formGroup.controls.photoUrl.setValue(
      new File([buffer], this.file.name, {
        lastModified: new Date().getTime(),
      })
    );
  }
  onSubmit() {
    const method = this.formGroup.controls.id.value ? 'updatePet' : 'createPet';
    this.petService[method](this.formGroup.value).subscribe({
      next: (response) => {
        this.notificationService.showSnackBarSuccess(response);
        this.matExpansionPanel.forEach((panel) => panel.close());
        this.pets.update((pets) => {
          const index = pets.findIndex((pet) => pet.id === response.data.id);
          if (index > -1) {
            pets[index] = response.data;
          } else {
            pets.push(response.data);
          }
          return pets;
        });
        this.resetPetForm();
      },
      error: (error) => {
        this.notificationService.showError(error);
      },
    });
  }
  resetPetForm() {
    this.imageChangedEvent = null;
    this.file = null;
    this.croppedImage = null;
    this.formGroup.reset();
  }

  editPet(pet: Pet) {
    this.petService.search$$.next(true);
    this.formGroup.patchValue({
      id: pet.id,
      birthDate: pet.birthDate,
      name: pet.name,
      owner: pet.owner.id,
    });

    this.getPetImage(pet);

    document.documentElement?.scrollTo({
      left: 0,
      top: 0,
      behavior: 'smooth',
    });

    this.step.set(eStep.PetForm);
    if (this.petService.search$$.value) this.matExpansionPanel?.first.open();
  }

  removePet(pet: Pet) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this pet!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.isConfirmed) {
        this.petService.removePet(pet).subscribe({
          next: (response) => {
            this.notificationService.showSnackBarSuccess(response);
            this.pets.update((pets) => {
              const index = pets.findIndex(
                (pet) => pet.id === response.data.id
              );
              if (index > -1) {
                pets.splice(index, 1);
              }
              return pets;
            });
          },
          error: (error) => {
            this.notificationService.showError(error);
          },
        });
      }
    });
  }
}
