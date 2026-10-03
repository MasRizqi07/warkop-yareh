# SEO and local discovery

The eight discovery paths have page metadata with absolute canonical and OpenGraph URLs. `sitemap.xml` is generated from that explicit set. Outlet detail embeds `CafeOrCoffeeShop` JSON-LD with name, postal address, hours, map Plus Code, and telephone only for Prapen. The home has `WebSite` JSON-LD. There are no invented `aggregateRating`, reviews, `geo`, email, or reservation capabilities.

Customer application paths (`account`, `profile`, `cart`, `checkout`, `orders`, `payment`, `auth`, `otp`, `qr`, `table`, login/register and related flows) use private metadata and noindex headers. Admin sets `X-Robots-Tag: noindex, nofollow` globally. Vercel preview web responses also receive noindex headers. `robots.txt` permits discovery pages and points to the sitemap; noindex is carried by private pages/headers rather than a blanket robots disallow that would block crawling of the directive.

Local unit and browser tests cover canonical paths, outlet facts, map link, redirects and login noindex. Exact preview HTML, crawler fetches, canonical host, and production cache behavior remain deployment verification gates.
