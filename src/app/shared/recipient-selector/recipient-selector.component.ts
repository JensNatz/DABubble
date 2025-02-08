import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectionListComponent } from '../selection-list/selection-list.component';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-recipient-selector',
  standalone: true,
  imports: [SelectionListComponent, FormsModule],
  templateUrl: './recipient-selector.component.html',
  styleUrl: './recipient-selector.component.scss'
})
export class RecipientSelectorComponent {

  inputValue: string = '';
  channelService = inject(ChannelServiceService);
  searchService = inject(SearchService);

  filteredResults: Record<string, any> = {};
  listShown: boolean = false;

  onInputChange(value: string): void {
    this.inputValue = value;
    if(this.inputValue.length === 0) {
      this.listShown = false;
      return;
    }
  
    if (value.startsWith('#')) {
      this.filterChannels(value);
    } else if (value.startsWith('@')) {
      this.filterUsersByName(value);
    } else {
      this.filterUsersByEmail(value);
    }
    this.listShown = true;
  }

  private filterChannels(searchTerm: string): void {
    searchTerm = searchTerm.replace('#', '');
    this.filteredResults = {
      categories: [{
        type: 'channel',
        title: 'Channels',
        items: this.searchService.filterChannelsByName(searchTerm)
      }]
    };
  }

  private filterUsersByName(searchTerm: string): void {
    searchTerm = searchTerm.replace('@', '');
    this.filteredResults = {
      categories: [{
        type: 'user',
        title: 'Users',
        items: this.searchService.filterUsersByName(searchTerm)
      }]
    };
  }

  private filterUsersByEmail(searchTerm: string): void {
    this.filteredResults = {
      categories: [{
        type: 'user',
        title: 'Users',
        items: this.searchService.filterUsersByEmail(searchTerm)
      }]
    };
  }


  onRecipientSelected(recipient: any): void {
    this.listShown = false;
    console.log(recipient, 'recipient');
    if(recipient.categoryType === 'channel') {
      this.channelService.setCurrentChannelById(recipient.element.id);
    } else if(recipient.categoryType === 'user') {
      this.channelService.setDirectMessageChannel(recipient.element.id);
    }
  }
}
