import { Component } from '@angular/core';

@Component({
  selector: 'blog-item-details',
  templateUrl: './blog-item-details.component.html',
  styleUrls: ['./blog-item-details.component.css']
})
export class BlogItemDetailsComponent {


    public image: string = 'http://osnews.pl/wp-content/uploads/2016/06/it-grafika.jpg';
    public text: string = 'Tytuł';

}
