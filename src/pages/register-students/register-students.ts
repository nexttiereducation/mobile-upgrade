import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicPage, NavController } from 'ionic-angular';

import { emailRegex } from '@nte/constants/stakeholder.constants';
import { ConnectionService } from '@nte/services/connection.service';
import { RegisterFormPage } from './../register-form/register-form';

@IonicPage({
  name: `register-students-page`
})
@Component({
  selector: `register-students`,
  templateUrl: `register-students.html`
})
export class RegisterStudentsPage implements OnInit {
  public studentsForm: FormGroup;

  get studentArray() {
    return this.studentsForm.controls.students as FormArray;
  }

  get students() {
    return this.studentArray.controls;
  }

  constructor(private fb: FormBuilder,
    private navCtrl: NavController,
    private connectionService: ConnectionService) { }

  ngOnInit() {
    this.studentsForm = this.fb.group({
      students: this.fb.array([
        this.initStudents()
      ])
    });
  }

  public addStudent() {
    this.studentArray.push(this.initStudents());
  }

  public next() {
    const studentEmails = this.studentsForm.value.students.map(`email`);
    if (studentEmails && studentEmails.length) {
      for (let i = 0, email; email = studentEmails[i]; i++) {
        if (email.length) {
          this.connectionService.invite(email);
        }
      }
    }
    this.navCtrl.push(RegisterFormPage);
  }

  private initStudents() {
    return this.fb.group({
      email: [``,
        Validators.compose([
          Validators.pattern(emailRegex)
        ])
      ]
    });
  }

}
