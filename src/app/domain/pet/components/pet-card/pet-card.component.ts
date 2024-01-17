import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../environments/environment';
import { Pet } from '../../interfaces/pet';
import { AgePipe } from '../../pipes/age/age.pipe';

@Component({
  selector: 'app-pet-card',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    AgePipe,
    MatButtonModule,
    CommonModule,
  ],
  templateUrl: './pet-card.component.html',
  styleUrl: './pet-card.component.scss',
})
export class PetCardComponent {
  @Input() pet: Pet;
  @Output() editPet = new EventEmitter<Pet>();
  @Output() removePet = new EventEmitter<Pet>();

  edit() {
    this.editPet.emit(this.pet);
  }
  remove() {
    this.removePet.emit(this.pet);
  }
  getPetImageUrl(photoUrl: string | number) {
    return `${environment.apiUrl}/pets/image/${photoUrl}`;
  }
}
