const MENU_ITEM_ID = 'copy-link-and-text';

function escapeHTML (html) {
    return html
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
}

function copyLinkAndText (link, text) {
  link = escapeHTML(link);
  text = escapeHTML(text);
  var item = new ClipboardItem({
    'text/html': `<a href="${link}">${text}</a>`,
    'text/plain': `[${text}](${link})`,
  });

  navigator.clipboard.write([item])
    .catch((error) => console.error(`Copy link failed: ${error.message}`));
}

browser.contextMenus.create({
    id: MENU_ITEM_ID,
    title: browser.i18n.getMessage('menuItemTitle'),
    contexts: ['link'],
  }
);

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ITEM_ID)
    return;

  if (info.hasOwnProperty('linkUrl') && info.hasOwnProperty('linkText')) {
    copyLinkAndText(info.linkUrl, info.linkText);
  }
});
