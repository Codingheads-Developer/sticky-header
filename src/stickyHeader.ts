/**!
 * stickyHeader - JS plugin to create sticky header
 * created by Bogdan Barbu
 * requires IntersectionObserver
 *
 * Author: Bogdan Barbu
 * Team: Codingheads (codingheads.com)
 *
 * @format
 */

interface StickyHeaderOptions {
  pinnedClass?: string,
  unpinnedClass?: string,
  mainClass?: string,
  offset?: number,
  positionStickyWorkaround? : boolean,
  addBodyClasses?: boolean,
}

export default class StickyHeader {
  #pinnedClass: string = 'sticky-pinned';
  #unpinnedClass: string = 'sticky-unpinned';
  #mainClass: string = 'sticky';
  #offset:number = 0;
  #positionStickyWorkaround: boolean = true;
  #noNativeSupport:boolean = false;
  #element: HTMLElement = null;
  #observer: IntersectionObserver = null;
  #addBodyClasses: boolean = true;

  constructor(
    element: HTMLElement,
    {
      pinnedClass = 'sticky-pinned',
      unpinnedClass = 'sticky-unpinned',
      mainClass = 'sticky',
      offset = 0,
      positionStickyWorkaround = true,
      addBodyClasses = true,
    }: StickyHeaderOptions = {}
  ) {
    this.#element = element;
    this.#pinnedClass = pinnedClass;
    this.#unpinnedClass = unpinnedClass;
    this.#mainClass = mainClass;
    this.#offset = offset;
    this.#positionStickyWorkaround = positionStickyWorkaround;
    this.#addBodyClasses = addBodyClasses;

    // does this have native support (Modernizr test)
    this.#noNativeSupport = document.documentElement.classList.contains(
      'no-csspositionsticky'
    );

    // initialize
    this.#init();
  }

  #init() {
    const parent = this.#element.parentElement;
    const intersectionItem = document.createElement('div');
    let containerPosition = window
      .getComputedStyle(parent)
      .getPropertyValue('position');
    this.#element.classList.add(this.#mainClass);
    // add position: relative if the class doesn't add it
    if (!containerPosition || containerPosition == 'static') {
      parent.style.position = 'relative';
    }
    // use the workaround if position is sticky or there's no offset set up
    const stickyPosition = window
      .getComputedStyle(this.#element, null)
      .getPropertyValue('position');
    if (!this.#offset || stickyPosition == 'sticky') {
      this.#positionStickyWorkaround = true;
    }
    let height = this.#element.clientHeight;
    let toObserve = intersectionItem;
    // add the intersetion observer item
    intersectionItem.classList.add('sticky-observer');
    intersectionItem.style.pointerEvents = 'none';
    intersectionItem.style.visibility = 'hidden';
    if (!this.#positionStickyWorkaround) {
      // add the item to the top of the page
      intersectionItem.style.position = 'absolute';
      intersectionItem.style.top = '0';
      intersectionItem.style.left = '0';
      intersectionItem.style.right = '0';
      intersectionItem.style.height = this.#offset + 'px';
      parent.appendChild(intersectionItem);
    } else {
      // as a workaround for position: sticky issues, use an element right under the header
      intersectionItem.style.position = 'relative';
      intersectionItem.style.height = '1px';
      if (this.#offset) {
        // if we are using an offset, adjust the "intersection" object position
        intersectionItem.style.height = '0';
        const intersectionItemOffset = document.createElement('div');
        intersectionItemOffset.classList.add('sticky-observer-offset');
        intersectionItemOffset.style.position = 'absolute';
        intersectionItemOffset.style.height = '1px';
        intersectionItemOffset.style.left = '0';
        intersectionItemOffset.style.right = '0';
        intersectionItemOffset.style.top = this.#offset - height + 'px';
        intersectionItem.appendChild(intersectionItemOffset);
        toObserve = intersectionItemOffset;

        // update the offset when the layout changes
        const updateOffset = (newHeight: number) => {
          if (newHeight) height = newHeight;
          intersectionItemOffset.style.top = this.#offset - height + 'px';
        };
        ['resize', 'orientationchange'].forEach(type =>
          window.addEventListener(type, () => {
            updateOffset(this.#element.clientHeight);
          })
        );
      }
      parent.insertBefore(intersectionItem, this.#element.nextElementSibling);
    }

    // create the observer
    this.#observer = new IntersectionObserver(this.#setSticky);
    this.#observer.observe(toObserve);
  }

  // handle intersection observer events
  #setSticky = (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        window.requestAnimationFrame(() => {
          [
            this.#element,
            ...(this.#addBodyClasses ? [document.body] : []),
          ].forEach(element => {
            element.classList.remove(this.#unpinnedClass);
            element.classList.add(this.#pinnedClass);
          });
          if (this.#noNativeSupport && this.#addBodyClasses) {
            document.body.style.paddingTop = this.#element.clientHeight + 'px';
          }
          // dispatch an event to tell that we're pinned
          this.#element.dispatchEvent(
            new CustomEvent('stickyIsPinned', {
              bubbles: true,
            })
          );
        });
      } else {
        window.requestAnimationFrame(() => {
          [
            this.#element,
            ...(this.#addBodyClasses ? [document.body] : []),
          ].forEach(element => {
            element.classList.add(this.#unpinnedClass);
            element.classList.remove(this.#pinnedClass);
          });
          if (this.#noNativeSupport && this.#addBodyClasses) {
            document.body.style.paddingTop = '0';
          }
          // dispatch an event to tell that we're unpinned
          this.#element.dispatchEvent(
            new CustomEvent('stickyIsUnpinned', {
              bubbles: true,
            })
          );
        });
      }
    });
  };
}
(window as any).StickyHeader = StickyHeader;

// register jQuery plugin if jQuery is available
if ('jQuery' in window) {
  (window as any).jQuery.fn.stickyHeader = function (options) {
    this.each((_i, element) => new StickyHeader(element, options));
    return this;
  };
}
