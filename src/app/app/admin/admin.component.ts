import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CampaignService, DonationService } from 'src/app/_services';
import { MainService } from 'src/app/_services/main.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  // Log Box
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  logs: string = '';
  getLogsStatus: string = 'idle';

  // Control Box
  validateStatus: string = 'idle';
  controlDonationsStatus: string = 'idle';

  constructor(
    private campaignService: CampaignService,
    private donationService: DonationService,
    private mainService: MainService) { }

  ngOnInit() {
    this.refreshLogs();
  }

  ngAfterViewChecked() {        
      this.scrollToBottom();        
  } 

  scrollToBottom(): void {
      try {
          this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      } catch(err) { }                 
  }

  refreshLogs() {
    this.getLogsStatus = 'running';
    this.mainService.getLogs()
      .subscribe(data => {
          this.logs = data;
        this.scrollToBottom();
          this.getLogsStatus = 'success';
          setTimeout(() => {
            this.getLogsStatus = 'idle';
          }, 2000);
        },
        error => {
          this.getLogsStatus = 'error';
          console.log(error);
          setTimeout(() => {
            this.getLogsStatus = 'idle';
          }, 2000);
        });
  }

  validateProjects() {
    this.validateStatus = 'running';
    this.campaignService.validate()
      .subscribe(
        () => {
          this.validateStatus = 'success';
          setTimeout(() => {
            this.validateStatus = 'idle';
          }, 2000);
        },
        error => {
          this.validateStatus = 'error';
          console.log(error);
          setTimeout(() => {
            this.validateStatus = 'idle';
          }, 2000);
        });
  }

  controlDonations() {
    this.controlDonationsStatus = 'running';
    this.donationService.control()
      .subscribe(
        () => {
          this.controlDonationsStatus = 'success';
          setTimeout(() => {
            this.controlDonationsStatus = 'idle';
          }, 2000);
        },
        error => {
          this.controlDonationsStatus = 'error';
          console.log(error);
          setTimeout(() => {
            this.controlDonationsStatus = 'idle';
          }, 2000);
        });
  }

}
