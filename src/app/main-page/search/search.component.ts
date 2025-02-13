import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectionListComponent } from '../../shared/selection-list/selection-list.component';
import { SearchService } from '../../services/search.service';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { MessageboardService } from '../../services/messageboard.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { categories } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, SelectionListComponent, ClickOutsideDirective],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {

  searchService = inject(SearchService);
  channelService = inject(ChannelServiceService);
  messageboardService = inject(MessageboardService);

  @Input() placeholder: string = '';

  inputValue: string = '';
  listShown: boolean = false;
  filteredResults: Record<string, any> = {};

  onInputChange(value: string): void {
    this.inputValue = value;
    if(this.inputValue.length === 0) {
      this.listShown = false;
      return;
    }

    if (value.startsWith('#')) {
      this.filteredResults = {
        categories: [this.getFilteredChannels(value)]
      }
    } else if (value.startsWith('@')) {
      this.filteredResults = {
        categories: [this.getFilteredUsers(value)]
      }
    } else {
      this.filteredResults = {
        categories: this.getFilteredGeneralResults(value)
      }
    }
    this.listShown = true;
  }


  private getFilteredChannels(searchTerm: string) {
    const searchTermWithoutHash = searchTerm.replace('#', '');
    const results = {
      type: 'channel',
        title: 'Channels',
        items: this.searchService.filterChannelsByName(searchTermWithoutHash).map(channel => ({
            ...channel,
            name: this.highlightSearchTerm(channel.name, searchTermWithoutHash)
          }))
    };
    return results;
  }

  private getFilteredUsers(searchTerm: string) {
    const searchTermWithoutAt = searchTerm.replace('@', '');
    const results = {
        type: 'user',
          title: 'Users',
          items: this.searchService.filterUsersByName(searchTermWithoutAt).map(user => ({
            ...user,
            name: this.highlightSearchTerm(user.name, searchTermWithoutAt)
          }))
    };
    return results;
  }

  private getFilteredMessages(searchTerm: string) {
    const results = {
      type: 'message',
      title: 'Nachrichten',
      items: this.searchService.filterMessagesByContent(searchTerm).map(message => ({
        ...message,
        content: this.highlightSearchTerm(message.content, searchTerm)
      }))
    }
    return results;
      
  }

  private getFilteredGeneralResults(searchTerm: string) {
    const results = [
        this.getFilteredChannels(searchTerm),
        this.getFilteredUsers(searchTerm),
        this.getFilteredMessages(searchTerm)
      ]
    return results;
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
    this.messageboardService.openMessageBoard();
    this.listShown = false;
    this.inputValue = '';
  }

  onOutsideClick(): void {
    this.listShown = false;
  }
}
