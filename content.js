'use strict';

function onMessage (message) {
  if (message.type !== 'clat.link_request') {
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

  if (links.length > 0) {
    browser.runtime.sendMessage({'type': 'clat.link_response', 'links': links});
  } else {
    console.log('No links selected.')
  }
}

browser.runtime.onMessage.addListener(message => onMessage(message));
