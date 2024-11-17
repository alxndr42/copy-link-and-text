'use strict';

const MENU_ITEM_ID = 'copy-link-and-text';

function escapeHTML (html) {
    return html
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
}

function htmlLink(url, text) {
  return `<a href="${escapeHTML(url)}">${escapeHTML(text)}</a>`;
}

function markdownLink(url, text) {
  return `[${escapeHTML(text)}](${escapeHTML(url)})`;
}

function copyToClipboard (links) {
  let htmlValue = "";
  let textValue = "";

  if (links.length === 1) {
    htmlValue = htmlLink(links[0].url, links[0].text);
    textValue = markdownLink(links[0].url, links[0].text);
  } else {
    htmlValue += "<ul>\n";
    for (let link of links) {
      htmlValue += `<li>${htmlLink(link.url, link.text)}</li>\n`;
      textValue += `- ${markdownLink(link.url, link.text)}\n`;
    }
    htmlValue += "</ul>\n";
  }

  let item = new ClipboardItem({'text/html': htmlValue, 'text/plain': textValue});
  navigator.clipboard.write([item])
    .catch(error => console.error(`Copy link failed: ${error.message}`));
}

function onMessage (message) {
  if (message.type === 'clat.link_response') {
    copyToClipboard(message.links);
  }
}

browser.contextMenus.create({
    id: MENU_ITEM_ID,
    title: browser.i18n.getMessage('menuItemTitle'),
    contexts: ['link', 'selection', 'tab'],
  }
);

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ITEM_ID) {
    return;
  }

  if (info.hasOwnProperty('linkUrl') && info.hasOwnProperty('linkText')) {
    copyToClipboard([{'url': info.linkUrl, 'text': info.linkText}]);
  }
  else if (info.hasOwnProperty('selectionText')) {
    browser.tabs.sendMessage(tab.id, {'type': 'clat.link_request'});
  }
  else {
    copyToClipboard([{'url': tab.url, 'text': tab.title}]);
  }
});

browser.runtime.onMessage.addListener(message => onMessage(message));
