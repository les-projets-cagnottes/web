import { Component, OnInit } from '@angular/core';
import { Schedule } from 'src/app/_entities';
import { ScheduleService } from 'src/app/_services';

@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.css']
})
export class SchedulerComponent implements OnInit {
  
  // Data
  schedules: Schedule[] = [];

  // Statuses
  refreshStatus: string = "idle";

  constructor(private scheduleService: ScheduleService) { }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
      this.scheduleService.getAll()
        .subscribe(response => {
          this.schedules = Schedule.fromModels(response);
          var schedulesRef = []
          this.schedules.forEach(schedule => schedulesRef.push(schedule.id));
          this.scheduleService.status(schedulesRef)
          .subscribe(statuses => {
            this.schedules.forEach(schedule => schedule.scheduled = statuses[schedule.id]);
            this.refreshStatus = 'success';
            setTimeout(() => {
              this.refreshStatus = 'idle';
            }, 2000);
          }, error => {
            this.refreshStatus = 'error';
            console.log(error);
            setTimeout(() => {
              this.refreshStatus = 'idle';
            }, 2000);
          });
          this.refreshStatus = 'success';
          setTimeout(() => {
            this.refreshStatus = 'idle';
          }, 2000);
        },
        error => {
          console.log(error);
          this.refreshStatus = 'error';
          setTimeout(() => {
            this.refreshStatus = 'idle';
          }, 2000);
        });
  }

}
