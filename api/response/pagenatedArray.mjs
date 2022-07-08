import _ from "lodash";
export class PagenatedArray {
  _raw;
  _page;
  _size;
  get raw() {
    return this._raw
  }
  get page() {
    return this._page
  }
  get size() {
    return this._size
  }

  set raw(value) {
    if (this._raw != value) this.markCacheDirty();
    this._raw = value;
  }
  set page(value) {
    if (this._page != value) this.markCacheDirty();
    this._page = value;
  }
  set size(value) {
    if (this._size != value) this.markCacheDirty();
    this._size = value;
  }

  constructor(arr = [], page = 0, size = 25) {
    if (Array.isArray(arr)) {
      this.raw = arr;
      this.page = page
      this.size = size
    } else {
      this.raw = arr.items
      this.page = arr.page
      this.size = arr.size
    }

    //? Init
    this._cacheDirty = true
    this._cache = {
      page: 0,
      size: 0,
      total_pages: 0,
      total: 0,
      items: new Array()
    }
  }

  markCacheDirty() {
    this._cacheDirty = true
  }
  createCache() {
    if (!this._cacheDirty) return;
    const
      totalItems = this.raw.length,
      pageNumber = this.page,
      pageSize = this.size,
      offset = (pageNumber - 1) * pageSize,
      pagedItems = _.chain(this.raw).drop(offset).slice(0, pageSize).value();

    this._cache.page = pageNumber;
    this._cache.size = pageSize;
    this._cache.total_pages = Math.ceil(totalItems / pageSize);
    this._cache.total = pagedItems.length;
    this._cache.items = pagedItems;

    this._cacheDirty = false
  }
  get total_pages() {
    this.createCache()
    return this._cache.total_pages
  }
  get items() {
    this.createCache()
    return this._cache.items
  }
  get total() {
    this.createCache()
    return this._cache.total
  }
  toJSON() {
    this.createCache()
    return this._cache
  }
}
