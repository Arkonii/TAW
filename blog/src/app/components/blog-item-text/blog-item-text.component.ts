import { Component, Input  } from '@angular/core';

@Component({
  selector: 'blog-item-text',
  templateUrl: './blog-item-text.component.html',
  styleUrls: ['./blog-item-text.component.css']
})
export class BlogItemTextComponent {
    @Input() text?: string;
    @Input() id?: number;
    constructor() { }

    
    ngOnInit(): void {}
}
