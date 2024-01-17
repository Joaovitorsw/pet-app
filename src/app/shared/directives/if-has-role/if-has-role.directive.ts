import { NgIf } from '@angular/common';
import { Directive, inject, Input, OnInit } from '@angular/core';
import {
  AuthService,
  eRoles,
} from '../../../domain/auth/services/auth/auth.service';

@Directive({
  selector: '[ngIfHasRole]',
  hostDirectives: [
    {
      directive: NgIf,
      inputs: ['ngIfElse: ifHasRoleElse'],
    },
  ],
  standalone: true,
})
export class IfHasRoleDirective implements OnInit {
  private ngIfDirective = inject(NgIf);
  private authorizationService = inject(AuthService);
  @Input('ngIfHasRole') set role(role: eRoles | '') {
    this.ngIfDirective.ngIf = this.authorizationService.validRole(role);
  }

  ngOnInit(): void {
    this.ngIfDirective.ngIf = this.authorizationService.validRole();
  }
}
