
import { HttpClient, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ApplicationService } from 'src/app/services/application.service';
import { StatusMessage } from 'src/app/interfaces/students';
// import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'uaras-frontend';

  file2Upload: File[] = [];

  percentDone: number = 0;
  uploadSuccess: boolean = false;
  // apiUrl = "http://localhost:3000";http://server.unizik.edu.ng:5001/
  apiUrl = 'https://uaras-backend.onrender.com'
  subscription: Subscription;
  selectedStatusMessage: Partial <StatusMessage> = {};
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  spinnerValue = 0;
  // title = 'api-nodejs2';
  candidateTypeList = ['', '1', '2', '3', '4'];
  candidateType = ''
  totalmode: ProgressBarMode = 'determinate';
  totalvalue = 0;

  schoolMap = new Map([
    ['UNIZIK', {code:0}],['UMUNZE', {code:1}],
    ['AUCHI', {code:2}],['POPE JOHN', {code:3}],
    ['ESCET', {code:4}]

  ])
  tempmode: ProgressBarMode = 'determinate';
  tempvalue = 0;


  mainmode: ProgressBarMode = 'determinate';
  mainvalue = 0;

  upload(event: any){
    if (event.target.files.length > 0) {
      this.file2Upload = event.target.files;
    }

  }

  uploadButton(): void {
    this.uploadAndProgress(this.file2Upload)
  }

  uploadAndProgress(files: File[]){
    console.log(files)

    var formData = new FormData();
    formData.append('file',files[0])
    console.log('this is type22:', this.candidateType)
    formData.append('type', '');

    this.busyStatus = true;
    this.http.post(`${this.apiUrl}/api/uploadutme`, formData, {reportProgress: true, observe: 'events'})
        .subscribe(event => {
          if (event.type === HttpEventType.UploadProgress) {
            // @ts-ignore
            this.percentDone = Math.round(100 * event.loaded / event.total);
            this.spinnerValue = this.percentDone
          } else if (event instanceof HttpResponse) {
            this.uploadSuccess = true;
          }
        });
  }








  // @ts-ignore
  @ViewChild('UploadFileInput', { static: false }) uploadFileInput: ElementRef;
  // @ts-ignore
  fileUploadForm: FormGroup;
  // @ts-ignore
  fileInputLabel: string;
  loaderForFileUpload = false;
  fileName = '';
  arrayBuffer:any;
  arr: any;
  bstr: any;
  uploadProgress = 0;
  // @ts-ignore
  busyStatus = false;
  // @ts-ignore
  uploadSub: Subscription;

  constructor(
      private http: HttpClient,
      private formBuilder: FormBuilder,
      private applicationService: ApplicationService
  ) {

    console.log("schoolmap::",this.schoolMap)
    const source = interval(30000);

    this.subscription = source.subscribe(val =>
            // this.opensnack(text)

        {
          if (this.busyStatus === true) {this.applicationService.getStatus();}
          else {}

        }

    );
  }

  checkIfBusy(): boolean {
    let answer = false;
    if (this.selectedStatusMessage.status === 'busy') {answer = true;}

    return answer;

  }

  ngOnInit(): void {
    this.applicationService.getStatus();
    // console.log("ON INIT")
    this.fileUploadForm = this.formBuilder.group({
      myfile: ['']
    });


    this.applicationService.StatusMessageUTME.subscribe((data: StatusMessage) => {
      this.selectedStatusMessage = data;
      // @ts-ignore
      this.totalvalue = (this.selectedStatusMessage.rowdata_saved_to_temp  + this.selectedStatusMessage.rowdata_processed_success  + this.selectedStatusMessage.rowdata_error)/(this.selectedStatusMessage.total_rowdata_uploaded_to_api * 2)*100
      // @ts-ignore

      this.tempvalue = (this.selectedStatusMessage.rowdata_saved_to_temp/this.selectedStatusMessage.total_rowdata_uploaded_to_api)*100;
      // @ts-ignore

      this.mainvalue = this.selectedStatusMessage.rowdata_processed_success/this.selectedStatusMessage.total_rowdata_uploaded_to_api * 100
      if (this.checkIfBusy()) {this.busyStatus = true;}
      // else if (this.selectedStatusMessage){this.busyStatus = false;}


    });

    // this.uploadForm = this.formBuilder.group({
    //   profile: ['']
    // });
  }

  reset() {
    this.uploadProgress = 0;
    // @ts-ignore

    this.uploadSub = null;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }






}
