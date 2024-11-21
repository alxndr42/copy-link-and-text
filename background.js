'use strict';

var legacyBrowser = false;

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
  let htmlValue = '';
  let textValue = '';

  if (links.length === 1) {
    htmlValue = htmlLink(links[0].url, links[0].text);
    textValue = markdownLink(links[0].url, links[0].text);
  } else {
    htmlValue += '<ul>\n';
    for (let link of links) {
      htmlValue += `<li>${htmlLink(link.url, link.text)}</li>\n`;
      textValue += `- ${markdownLink(link.url, link.text)}\n`;
    }
    htmlValue += '</ul>\n';
  }

  if (!legacyBrowser) {
    let item = new ClipboardItem({'text/html': htmlValue, 'text/plain': textValue});
    navigator.clipboard.write([item])
      .catch(error => console.error(`Copy link failed: ${error.message}`));
  } else {
    let legacyListener = function (event) {
      event.clipboardData.setData('text/html', htmlValue);
      event.clipboardData.setData('text/plain', textValue);
      event.preventDefault();
    }
    document.addEventListener('copy', legacyListener);
    document.execCommand('copy');
    document.removeEventListener('copy', legacyListener);
  }
}

browser.commands.onCommand.addListener((command, tab) => {
  if (command !== COMMAND_ID) {
    return;
  }

  if (tab !== undefined) {
    browser.tabs.sendMessage(tab.id, {'type': LINK_REQUEST});
  } else {
    browser.tabs.query({'active': true, 'currentWindow': true}).then(tabs => {
      browser.tabs.sendMessage(tabs[0].id, {'type': LINK_REQUEST});
    });
  }
});

browser.contextMenus.create({
    id: COMMAND_ID,
    title: browser.i18n.getMessage('menuItemTitle'),
    contexts: ['link', 'page', 'selection', 'tab'],
  }
);

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== COMMAND_ID) {
    return;
  }

  if (info.hasOwnProperty('linkUrl') && info.hasOwnProperty('linkText')) {
    copyToClipboard([{'url': info.linkUrl, 'text': info.linkText}]);
  }
  else {
    browser.tabs.sendMessage(tab.id, {'type': LINK_REQUEST});
  }
});

browser.runtime.onMessage.addListener(message => {
  if (message.type === LINK_RESPONSE) {
    copyToClipboard(message.links);
  }
});

if (typeof ClipboardItem === 'undefined') {
  legacyBrowser = true;
}
