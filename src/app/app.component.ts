
import {HttpClient, HttpEventType, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import {catchError, interval, of, Subscription} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ApplicationService } from 'src/app/services/application.service';
import { StatusMessage, StatusPushMessage } from 'src/app/interfaces/students';
// import { environment } from 'src/environments/environment'
import { DateAdapter, MatDateFormats, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/format-datepicker';


export interface apiPushMode1 {
  start: number,
  stop: number,
  delay: number,
  batchsize: number,
  sDate?: Date,
  programme?: string
}

export interface apiPushModel {
  start: number,
  stop: number,
  delay: number,
  batchsize: number,
  sDate?: Date ,
  programme?: string
}

export interface apiPushModelX {
  start: string,
  stop: string,
  delay: string,
  batchsize: string,
  sDate?: string,
  programme?: string
}
export interface apiPushMode2 {
  sDate: Date,
  eDate: Date,
  delay: number,
  batchsize: number
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [{provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}]
})

export class AppComponent {
  title = 'uaras-frontend';
  // starts: number = 0;
  // stops: number = 0;
  // batchsizes: number = 100;
  // delays: number = 20;

  checkedOption = [true,false,false, true, true, false]
  checkedstart: Boolean = false;
  checkedstop: Boolean = false;
  checkedbatchsize: Boolean = false;
  checkeddelay: Boolean = false;
  beginDate: Date | null | undefined;
  endDate: Date | null | undefined;
  // selectedModel1: Partial <apiPushMode1> = {start:0, batchsize:100, delay:20};
  // selectedModel2: Partial <apiPushMode2> = {batchsize:100, delay:20};
  selectedModel: Partial <apiPushModel> = {start:0,batchsize:100, delay:20};
  // selectedModelX: Partial <apiPushModelX> = {batchsize:"100", delay:"20"};
  file2Upload: File[] = [];

  percentDone: number = 0;
  uploadSuccess: boolean = false;
  //apiUrl = "http://localhost:3000";//http://server.unizik.edu.ng:5001/
  apiUrl = 'https://uaras-backend.onrender.com';
  subscription: Subscription;

  // for push
  subscriptionPushDE: Subscription;
  subscriptionPushUTME: Subscription;
  busyStatusPushDE = false;
  busyStatusPushUTME = false;
  
  selectedStatusMessage: Partial <StatusMessage> = {};
  selectedStatusPushMessage: Partial <StatusPushMessage> = {};
  selectedStatusPushMessageDE: Partial <StatusPushMessage> = {};
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  spinnerValue = 0;
  // title = 'api-nodejs2';
  candidateTypeList = ['', '1', '2', '3', '4'];
  candidateType = ''
  totalmode: ProgressBarMode = 'determinate';
  totalvalue = 0;

  schoolMap = new Map([['', {code:-1}],
    ['UNIZIK', {code:0}],['UMUNZE', {code:1}],
    ['AUCHI', {code:2}],['POPE JOHN', {code:3}],
    ['ESCET', {code:4}]

  ])


  tempmode: ProgressBarMode = 'determinate';
  tempvalue = 0;


  mainmode: ProgressBarMode = 'determinate';
  mainvalue = 0;

  pushOption: string = "Push UTME to Chuka";
  seasons: string[] = ['No of Records mode', 'Recently edited mode'];

  optionsMap = new Map([
    ['Push UTME to Chuka', {code:'UTME'}],['Push DE to Chuka', {code:'DE'}]


  ])

  upload(event: any){
    if (event.target.files.length > 0) {
      this.file2Upload = event.target.files;
    }

  }

  resetAPIParams(): void {
    this.checkedOption = [true, false, false, true, true, false];
    this.selectedModel = {start:0,batchsize:100, delay:20};
  }

//   checkMode(): boolean{
//   let answer = false
//     if (this.optionsMap.get(this.pushOption) && this.optionsMap.get(this.pushOption)?.code === 1)
//     {answer = true}
//   return answer
// }

  uploadButton(): void {
    this.uploadAndProgress(this.file2Upload)
  }

  uploadAndProgress(files: File[]){
    console.log(files)
    let type22 = 0
    var formData = new FormData();
    formData.append('file',files[0])
    console.log('this is type22:', this.candidateType)
    if (this.schoolMap.get(this.candidateType) && this.schoolMap.get(this.candidateType)?.code) 
    // @ts-ignore
    {type22 = this.schoolMap.get(this.candidateType)?.code}

    formData.append('type', type22.toString());

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

  viewPushInfo(): void {
    // this.applicationService.getStatus('DE');
    let aType = '';
    if (this.optionsMap.get(this.pushOption) && this.optionsMap.get(this.pushOption)?.code) 
    
    {
      // @ts-ignore
      aType = this.optionsMap.get(this.pushOption)?.code
      // this.selectedStatusPushMessage = {}
    }
    if (aType === 'UTME') {
      this.busyStatusPushDE = false;
      this.busyStatusPushUTME = true;
    }
    else {
      this.busyStatusPushUTME = false;
      this.busyStatusPushDE = true;}
    
    this.applicationService.getPushStatus(aType);
  
  }

  push2Chuka(type="UTME"): void {
    let aType = type
    let queryParams = new HttpParams();
    if (this.optionsMap.get(this.pushOption) && this.optionsMap.get(this.pushOption)?.code) 
    // @ts-ignore
    {aType = this.optionsMap.get(this.pushOption)?.code}

    queryParams = queryParams.append("type", aType );
    queryParams = this.selectedModel.start ? queryParams.append("start", this.selectedModel.start.toString() ) : queryParams;
    queryParams = this.selectedModel.stop ? queryParams.append("stop", this.selectedModel.stop.toString() ) : queryParams;
    queryParams = this.selectedModel.sDate ? queryParams.append("datelast", this.selectedModel.sDate.toISOString().split('T')[0] ) : queryParams;
    queryParams = this.selectedModel.delay ? queryParams.append("delays", this.selectedModel.delay.toString() ) : queryParams;
    queryParams = this.selectedModel.batchsize ? queryParams.append("batchsize", this.selectedModel.batchsize.toString() ) : queryParams;
    queryParams = this.selectedModel.programme ? queryParams.append("course", this.selectedModel.programme.toString() ) : queryParams;

    const oldParams = {
      name: 'Bill',
      offset: '0',
    };

    console.log(this.selectedModel as apiPushModel)
    const oldParams2 = this.selectedModel as apiPushModel
    console.log({queryParams})
    if (oldParams2.sDate) {}
    const oldParams3 = {
      start: this.selectedModel.start ? this.selectedModel.start.toString() : undefined,
      stop: this.selectedModel.stop ? this.selectedModel.stop.toString() : undefined,
      datelast: this.selectedModel.sDate ? this.selectedModel.sDate.toISOString().split('T')[0] : undefined,
      delays: this.selectedModel.delay ? this.selectedModel.delay.toString() : undefined,
      batchsize: this.selectedModel.batchsize ? this.selectedModel.batchsize.toString() : undefined,
      course: this.selectedModel.programme ? this.selectedModel.programme.toString() : undefined,
      type: aType

    }
    if (oldParams2.sDate) {console.log(oldParams2.sDate.toISOString().split('T')[0])}
    console.log({oldParams3})
    // @ts-ignore
    const newParams = new HttpParams({ fromObject: oldParams3})
    this.busyStatusPushUTME = true;
    this.http
        .get(`${this.apiUrl}/api/push-to-chuka-save`, { params: queryParams }).subscribe((data)=> {
          console.log(data);
        });

    // this.http
    //     .get(`${this.apiUrl}/api/push-to-chuka`, { params: newParams })
    //     .pipe(catchError(error => of(error.url)));

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

    // console.log("schoolmap::",this.schoolMap)
    const source = interval(30000);
    const source2 = interval(5000);
    this.subscription = source.subscribe(val =>
            // this.opensnack(text)

        {
          if (this.busyStatus) {this.applicationService.getStatus();}

        }

    );

    this.subscriptionDE = source.subscribe(val =>
      // this.opensnack(text)

  {
    if (this.busyStatusDE) {this.applicationService.getStatus('DE');}

  }

);

this.subscriptionPushUTME = source2.subscribe(val =>
  // this.opensnack(text)

{
if (this.busyStatusPushUTME) {
  this.applicationService.getPushStatus('UTME');
  if (this.selectedStatusPushMessage.status = 'success') {this.busyStatusPushUTME = false}
}

}

);

this.subscriptionPushDE = source.subscribe(val =>
// this.opensnack(text)

{
if (this.busyStatusPushDE) {this.applicationService.getPushStatus('DE');}

}

);


  }

  checkStat(options: number): void {
    if (!this.checkedOption[options]) {
      if (options === 0) {this.selectedModel.start = 0}
      else if (options === 1) {this.selectedModel.stop = undefined}
      else if (options === 2) {this.selectedModel.sDate = undefined}
      else if (options === 3) {this.selectedModel.batchsize = 100}
      else if (options === 4) {this.selectedModel.delay = 20}
    }
  }

  checkIfBusy(): boolean {
    let answer = false;
    if (this.selectedStatusMessage.status === 'busy') {answer = true;}

    return answer;

  }

  checkIfBusyDE(): boolean {
    let answer = false;
    if (this.selectedStatusMessageDE.status === 'busy') {answer = true;}

    return answer;

  }

  checkIfBusyPushUTME(): boolean {
    let answer = false;
    if (this.selectedStatusPushMessage.status === 'busy') {answer = true;}

    return answer;

  }

  checkIfBusyPushDE(): boolean {
    let answer = false;
    if (this.selectedStatusPushMessageDE.status === 'busy') {answer = true;}

    return answer;

  }

  ngOnInit(): void {
    this.applicationService.getStatus();
    this.applicationService.getStatus('DE');
    this.applicationService.getPushStatus('UTME');
    // this.applicationService.getPushStatus('DE');
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
    this.applicationService.StatusMessageDE.subscribe((data: StatusMessage) => {
      this.selectedStatusMessageDE = data;
      // @ts-ignore
      this.totalvalueDE = (this.selectedStatusMessageDE.rowdata_saved_to_temp  + this.selectedStatusMessageDE.rowdata_processed_success  + this.selectedStatusMessageDE.rowdata_error)/(this.selectedStatusMessageDE.total_rowdata_uploaded_to_api * 2)*100
      // @ts-ignore

      this.tempvalueDE = (this.selectedStatusMessageDE.rowdata_saved_to_temp/this.selectedStatusMessageDE.total_rowdata_uploaded_to_api)*100;
      // @ts-ignore

      this.mainvalueDE = this.selectedStatusMessageDE.rowdata_processed_success/this.selectedStatusMessageDE.total_rowdata_uploaded_to_api * 100
      if (this.checkIfBusyDE()) {this.busyStatusDE = true;}

      console.log('mainValueDE::', this.mainvalueDE)
      // else if (this.selectedStatusMessage){this.busyStatus = false;}


    });

    this.applicationService.StatusMessagePushUTME.subscribe((data: StatusMessage) => {
      this.selectedStatusPushMessage = data;
      console.log({data})
      // @ts-ignore
      // this.totalvalueDE = (this.selectedStatusMessageDE.rowdata_saved_to_temp  + this.selectedStatusMessageDE.rowdata_processed_success  + this.selectedStatusMessageDE.rowdata_error)/(this.selectedStatusMessageDE.total_rowdata_uploaded_to_api * 2)*100
      // // @ts-ignore

      // this.tempvalueDE = (this.selectedStatusMessageDE.rowdata_saved_to_temp/this.selectedStatusMessageDE.total_rowdata_uploaded_to_api)*100;
      // // @ts-ignore

      // this.mainvalueDE = this.selectedStatusMessageDE.rowdata_processed_success/this.selectedStatusMessageDE.total_rowdata_uploaded_to_api * 100
      if (this.checkIfBusyPushUTME()) {this.busyStatusPushUTME = true;}

      // console.log('mainValueDE::', this.mainvalueDE)
      // else if (this.selectedStatusMessage){this.busyStatus = false;}


    });

    this.applicationService.StatusMessagePushDE.subscribe((data: StatusMessage) => {
      this.selectedStatusPushMessageDE = data;
      console.log({data})
      // @ts-ignore
      // this.totalvalueDE = (this.selectedStatusMessageDE.rowdata_saved_to_temp  + this.selectedStatusMessageDE.rowdata_processed_success  + this.selectedStatusMessageDE.rowdata_error)/(this.selectedStatusMessageDE.total_rowdata_uploaded_to_api * 2)*100
      // // @ts-ignore

      // this.tempvalueDE = (this.selectedStatusMessageDE.rowdata_saved_to_temp/this.selectedStatusMessageDE.total_rowdata_uploaded_to_api)*100;
      // // @ts-ignore

      // this.mainvalueDE = this.selectedStatusMessageDE.rowdata_processed_success/this.selectedStatusMessageDE.total_rowdata_uploaded_to_api * 100
      if (this.checkIfBusyPushDE()) {this.busyStatusPushDE = true;}

      // console.log('mainValueDE::', this.mainvalueDE)
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
    this.subscriptionDE.unsubscribe();
    this.subscriptionPushUTME.unsubscribe();
    this.subscriptionPushDE.unsubscribe();
  }




// for DE
percentDoneDE: number = 0;
uploadSuccessDE: boolean = false;
subscriptionDE: Subscription;


selectedStatusMessageDE: Partial <StatusMessage> = {};
colorDE: ThemePalette = 'primary';
modeDE: ProgressSpinnerMode = 'determinate';
spinnerValueDE = 0;
// title = 'api-nodejs2';
// candidateTypeList = ['', '1', '2', '3', '4'];
candidateTypeDE = ''
totalmodeDE: ProgressBarMode = 'determinate';
totalvalueDE = 0;
file2UploadDE: File[] = [];


tempmodeDE: ProgressBarMode = 'determinate';
tempvalueDE = 0;


mainmodeDE: ProgressBarMode = 'determinate';
mainvalueDE = 0;

// @ts-ignore
// @ViewChild('UploadFileInput', { static: false }) uploadFileInput: ElementRef;
// @ts-ignore
// fileUploadForm: FormGroup;
// @ts-ignore
// fileInputLabel: string;
// loaderForFileUpload = false;
// fileName = '';
// arrayBuffer:any;
// arr: any;
// bstr: any;
uploadProgressDE = 0;
// @ts-ignore
busyStatusDE = false;
// @ts-ignore
// uploadSub: Subscription;






uploadDE(event: any){
  if (event.target.files.length > 0) {
    this.file2UploadDE = event.target.files;
  }

}



uploadButtonDE(): void {
  this.uploadAndProgressDE(this.file2UploadDE)
}

uploadAndProgressDE(files: File[]){
  console.log(files)
  let type22 = 0;
  var formData = new FormData();
  formData.append('file',files[0])
  console.log('this is type22:', this.candidateTypeDE)
  // formData.append('type', '');



  // console.log('this is type22:', this.candidateType)
    if (this.schoolMap.get(this.candidateTypeDE) && this.schoolMap.get(this.candidateTypeDE)?.code) 
    // @ts-ignore
    {type22 = this.schoolMap.get(this.candidateTypeDE)?.code}

    formData.append('type', type22.toString());






  this.busyStatusDE = true;
  this.http.post(`${this.apiUrl}/api/uploaddecandidate`, formData, {reportProgress: true, observe: 'events'})
      .subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          // @ts-ignore
          this.percentDoneDE = Math.round(100 * event.loaded / event.total);
          this.spinnerValueDE = this.percentDoneDE
        } else if (event instanceof HttpResponse) {
          this.uploadSuccessDE = true;
        }
      });
}


}
