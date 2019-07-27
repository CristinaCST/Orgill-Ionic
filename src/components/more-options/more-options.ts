import { Component, OnInit } from '@angular/core';
import { getNavParam } from '../../helpers/validatedNavParams';
import { NavParams } from 'ionic-angular';


@Component({
  selector: 'more-options',
  templateUrl: 'more-options.html'
})

export class MoreOptionsComponent implements OnInit{


  public onClickHandler: () => any;

  constructor(private readonly navParams: NavParams) {}

  public ngOnInit(): void {
    this.onClickHandler = getNavParam(this.navParams, 'action', 'function', () => { });
  }
  
}
