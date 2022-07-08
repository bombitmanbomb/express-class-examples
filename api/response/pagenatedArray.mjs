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
    this._raw = value
    this.markCacheDirty()
  }
  set page(value) {
    this._page = value
    this.markCacheDirty()
  }
  set size(value) {
    this._size = value
    this.markCacheDirty()
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
      total: 0,
      total_pages: 0,
      items: []
    }
  }

  markCacheDirty() {
    this._cacheDirty = true
  }

  toJSON() {
    if (!this._cacheDirty) return this._cache
    const
      totalItems = this.raw.length,
      page = this.page,
      pageSize = this.size,
      offset = (page - 1) * pageSize,
      pagedItems = _.chain(this.raw).drop(offset).slice(0, pageSize).value();

    this._cache = {
      page,
      size: pageSize,
      total: pagedItems.length,
      total_pages: Math.ceil(totalItems / pageSize),
      items: pagedItems
    }
    this._cacheDirty = false
    return this._cache
  }
}
