import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from 'src/app/_services/project.service';
import { Project, Donation } from 'src/app/_models';

@Component({
  selector: 'app-view-project',
  templateUrl: './view-project.component.html',
  styleUrls: ['./view-project.component.css']
})
export class ViewProjectComponent implements OnInit {

  private id: number;
  private project: Project;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService) {
    this.route.params.subscribe(params => this.id = params.id);
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    var that = this;
    this.projectService.getById(this.id)
      .subscribe(response => {
        this.project = response;
        var remainingTime = Math.abs(new Date(this.project.fundingDeadline).getTime() - new Date().getTime());
        this.project.remainingDays = Math.ceil(remainingTime / (1000 * 3600 * 24)); 
        this.project.fundingDeadlinePercent = that.computeDatePercent(new Date(this.project.createdAt), new Date(this.project.fundingDeadline)) + "%";
        this.project.peopleRequiredPercent = that.computeNumberPercent(this.project.peopleGivingTime.length, this.project.peopleRequired) + "%";
        this.project.donationsRequiredPercent = that.computeNumberPercent(this.project.donations.length, this.project.donationsRequired) + "%";
        this.project.totalDonations = 0;
        for(var k = 0 ; k < this.project.donations.length; k++) {
          this.project.totalDonations+= this.project.donations[k].amount;
        }
      });
  }

  computeDatePercent(start: Date, deadline: Date) {
    var now = new Date();
    var totalDuration = deadline.getTime() - start.getTime();
    var expiredDuration = now.getTime() - start.getTime();
    return this.computeNumberPercent(expiredDuration, totalDuration);
  }

  computeNumberPercent(number: number, max: number) {
    if(max == 0) {
      return "100";
    }
    return 100 * number / max;
  }
}
