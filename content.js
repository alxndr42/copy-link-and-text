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

  // Try to gather URLs from selected A elements
  for (let i = 0; i < selection.rangeCount; i++) {
    let range = selection.getRangeAt(i);
    let fragment = range.cloneContents();
    let anchors = fragment.querySelectorAll('a');
    for (let anchor of anchors) {
      links.push({'url': anchor.href, 'text': anchor.text});
    }
  }

  // Try to create text fragments from selected ranges
  if (links.length === 0 && selection.toString().trim() !== '') {
    let fragments = [];

    for (let i = 0; i < selection.rangeCount; i++) {
      let fragment = '';

      let range = selection.getRangeAt(i);
      let text = range.toString().trim();
      let words = text.split(' ');
      if (words.length > 10) {
        let start = words.slice(0, 5).join(' ');
        let end = words.slice(-5).join(' ');
        fragment = `${encodeFragment(start)},${encodeFragment(end)}`;
      } else {
        fragment = encodeFragment(text);
      }

      fragments.push(`text=${fragment}`);
    }

    let url = new URL(document.URL);
    url.hash = '';
    url = `${url.toString()}#:~:${fragments.join('&')}`;
    links.push({'url': url, 'text': document.title});
  }

  // Otherwise use the page URL
  if (links.length === 0) {
      links.push({'url': document.URL, 'text': document.title});
  }

  browser.runtime.sendMessage({'type': LINK_RESPONSE, 'links': links});
}

function encodeFragment(text) {
  return encodeURIComponent(text).replaceAll('-', '%2D');
}

browser.runtime.onMessage.addListener(message => onMessage(message));
