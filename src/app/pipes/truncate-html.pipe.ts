import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateHtml',
  standalone: true
})
export class TruncateHtmlPipe implements PipeTransform {
  transform(html: string, limit: number = 100): string {
    if (!html) return '';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const truncate = (node: Node, charCount: number): number => {
      if (charCount <= 0) return 0;

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text.length > charCount) {
          node.textContent = text.slice(0, charCount) + '...';
          return 0;
        }
        return charCount - text.length;
      }

      if (node.nodeType === Node.ELEMENT_NODE && node.childNodes) {
        let remainingChars = charCount;
        const children = Array.from(node.childNodes);
        
        for (const child of children) {
          remainingChars = truncate(child, remainingChars);
          if (remainingChars <= 0) {
            let nextSibling = child.nextSibling;
            while (nextSibling) {
              const current = nextSibling;
              nextSibling = nextSibling.nextSibling;
              node.removeChild(current);
            }
            break;
          }
        }
        return remainingChars;
      }

      return charCount;
    };

    truncate(tempDiv, limit);
    return tempDiv.innerHTML;
  }
}