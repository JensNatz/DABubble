import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectionListComponent } from '../../shared/selection-list/selection-list.component';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, SelectionListComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {

  @Input() placeholder: string = '';

  inputValue: string = '';
  listShown: boolean = false;
  filteredResults: Record<string, any> = {};

  searchService = inject(SearchService);
  

  onInputChange(value: string): void {
    this.inputValue = value;
    if(this.inputValue.length === 0) {
      this.listShown = false;
      return;
    }



    if (value.startsWith('#')) {
      const serachterm = value.replace('#', '');
      this.filteredResults = {
        categories: [{
          type: 'channel',
          title: 'Channels',
          items: this.searchService.filterChannelsByName(serachterm),
        }]
      };
    } else if (value.startsWith('@')) {
      const serachterm = value.replace('@', '');
      this.filteredResults = {
        categories: [{
          type: 'user',
          title: 'Users',
          items: this.searchService.filterUsersByName(serachterm),
        }]
      };
    } else {
      const searchterm = value;

      this.filteredResults = {
        categories: [
          {
            type: 'channel',
            title: 'Channels',
            items: this.searchService.filterChannelsByName(searchterm)
          },
          {
            type: 'user',
            title: 'Mitglieder',
            items: this.searchService.filterUsersByName(searchterm)
          },
          {
            type: 'message',
            title: 'Nachrichten',
            items: this.searchService.filterMessagesByContent(searchterm)
          }
        ]
      };
    }
    this.listShown = true;
    console.log(this.filteredResults);
  }

  onElementSelected(element: any): void {
    console.log(element);
  }


}
