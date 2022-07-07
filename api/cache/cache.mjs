import NodeCache from "node-cache";
const myCache = new NodeCache({ stdTTL: 50, checkperiod: 60 })

export function cache(ttl = 60) {
  /**
  * @param {import("express").Request} req
  * @param {import("express").Response} res
  * @param {import("express").NextFunction} next
  */
  return (req, res, next) => {
    //? Injected Value
    if (req.isCaching) return next();
    res.set("Cache-Control", `public, max-age=${ttl}, must-revalidate`);
    //* Check Cache
    const key = "__express__" + (req.originalUrl ?? req.url);

    caching:
    if (myCache.has(key)) {
      let myTTL = myCache.getTtl(key)
      if (myTTL < Date.now()) break caching; //* Ignore Stale Cache
      res.set("Age", ttl + Math.ceil((Date.now() - myTTL)*0.001));
      return next(myCache.get(key));
    }

    res.set("Age", 0);
    //* Inject Caching into send
    req.isCaching = true;
    //! Overwrite Prototypes
    res.jsonOld = res.json;
    res.json = (data) => {
      myCache.set(key, data, ttl)
      res.jsonOld(data);
    }
    next()
  }
}
