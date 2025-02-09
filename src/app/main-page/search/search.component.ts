import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectionListComponent } from '../../shared/selection-list/selection-list.component';
import { SearchService } from '../../services/search.service';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';

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
  channelService = inject(ChannelServiceService);


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
          items: this.searchService.filterChannelsByName(serachterm).map(channel => ({
            ...channel,
            name: this.highlightSearchTerm(channel.name, serachterm)
          })),
        }]
      };
    } else if (value.startsWith('@')) {
      const serachterm = value.replace('@', '');
      this.filteredResults = {
        categories: [{
          type: 'user',
          title: 'Users',
          items: this.searchService.filterUsersByName(serachterm).map(user => ({
            ...user,
            name: this.highlightSearchTerm(user.name, serachterm)
          })),
        }]
      };
    } else {
      const searchterm = value;

      this.filteredResults = {
        categories: [
          {
            type: 'channel',
            title: 'Channels',
            items: this.searchService.filterChannelsByName(searchterm).map(channel => ({
              ...channel,
              name: this.highlightSearchTerm(channel.name, searchterm)
            }))
          },
          {
            type: 'user',
            title: 'Mitglieder',
            items: this.searchService.filterUsersByName(searchterm).map(user => ({
              ...user,
              name: this.highlightSearchTerm(user.name, searchterm)
            }))
          },
          {
            type: 'message',
            title: 'Nachrichten',
            items: this.searchService.filterMessagesByContent(searchterm).map(message => ({
              ...message,
              content: this.highlightSearchTerm(message.content, searchterm)
            }))
          }
        ]
      };
    }
    this.listShown = true;
  }

  private highlightSearchTerm(text: string, searchTerm: string): string {
    return text.replace(new RegExp(`(${searchTerm})`, 'gi'), '<span class="highlight">$1</span>');
  }

  onElementSelected(entry: any): void {
    if(entry.categoryType === 'channel') {
      const channelId = entry.element.id;
      this.channelService.setCurrentChannelById(channelId);
    } else if(entry.categoryType === 'user') {
      const userId = entry.element.id;
      this.channelService.setDirectMessageChannel(userId);
    } else if(entry.categoryType === 'message') {
      this.channelService.jumpToMessage(entry.element);
    }
    this.listShown = false;
    this.inputValue = '';
  }


}
