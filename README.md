# Sticky Header

This library allows you to create sticky headers. It uses `position: sticky` and IntersectionObserver.

The plugin doesn't require jQuery, but it adds itself to jQuery if jQuery exists on the page.

## Installing

Use npm (or yarn) to install the package.

```npm2yarn
npm install --save @codingheads/sticky-header
```

## Initializing in JavaScript

To initialize the library, you need to create a new instance of the `StickyHeader` class:

```javascript
import StickyHeader from '@codingheads/sticky-header';

const header = document.querySelector('header.page-header');
new StickyHeader(header, options);
```

Or using jQuery:

```javascript
import '@codingheads/sticky-header';

$('header.page-header).stickyHeader(options);
```

The options object can have the following properties:

- `mainClass` - the class added when the plugin is initialized (default: `sticky`)
- `pinnedClass` - the class added when the element becomes "stuck" (default: `sticky-pinned`)
- `unpinnedClass` - the class added when the element becomes "unstuck" (default: `sticky-unpinned`)
- `offset` - the offset (in pixels) where the element should become "stuck" (default: 0)
- `addBodyClasses` - add the `pinnedClass` and `unpinnedClass` classes to the body element as well (default: true)

## Warnings

1. The plugin uses `position: sticky`. This is supported in all modern browsers. However, `position: sticky` has some requirements: you must not have parent elements with `overflow: hidden`, or otherwise it will not work (the position will be static). If you cannot get it to start, check that you don't have `overflow: hidden` on a parent element.

2. If you change the header size depending on the "stuck"/"unstuck" status, you will probably need to prevent the window from scrolling when this happens (the header will push the content).

  If you have a `#wrapper` element around the content (including the header), you could do something like this:

  ```css
  header.sticky {
    top: 0;
    position: sticky;
  }

  /** fix for when the header grows in size when it becomes unpinned and the scroll position changes (we need to scroll more) **/
  @supports (position: sticky) {
    body.sticky-unpinned #wrapper {
      overflow-anchor: none;
    }
  }

  ```