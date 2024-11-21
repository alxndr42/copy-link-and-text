'use strict';

function onMessage (message) {
  if (message.type !== LINK_REQUEST) {
    return;
  }

  let selection = window.getSelection();
  if (selection === null) {
    console.error('Selection is null.');
    return;
  }

  let links = [];

  for (let i = 0; i < selection.rangeCount; i++) {
    let range = selection.getRangeAt(i);
    let fragment = range.cloneContents();
    let anchors = fragment.querySelectorAll('a');
    for (let anchor of anchors) {
      links.push({'url': anchor.href, 'text': anchor.text});
    }
  }

  if (links.length == 0) {
    links.push({'url': document.URL, 'text': document.title})
  }

  browser.runtime.sendMessage({'type': LINK_RESPONSE, 'links': links});
}

browser.runtime.onMessage.addListener(message => onMessage(message));
