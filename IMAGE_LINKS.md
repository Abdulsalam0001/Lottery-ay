# Changing website pictures

The website now reads its editable picture URLs from `src/imageConfig.js`.

## Homepage hero
Set `homepageHero` to a direct public image URL:

```js
homepageHero: "https://your-domain.com/lottery-hero.webp",
```

## Winner photos
Add a URL to the matching slot in `winnerFallbacks`. The six slots map to the six visible winner cards in display order.

```js
winnerFallbacks: [
  "https://your-domain.com/winner-1.jpg",
  "https://your-domain.com/winner-2.jpg",
  "https://your-domain.com/winner-3.jpg",
  "https://your-domain.com/winner-4.jpg",
  "https://your-domain.com/winner-5.jpg",
  "https://your-domain.com/winner-6.jpg",
],
```

If the connected winners API returns an `imageUrl` property for a winner, that URL takes priority over the matching fallback slot.

## Header avatars and testimonials
Fill `playerAvatars` and `testimonials` with direct URLs in the same way. Empty strings keep the existing fallback photos.

## What counts as a direct image URL?
Use a publicly accessible URL that opens the image itself, ending commonly in `.jpg`, `.png`, or `.webp`. A normal Pinterest/Instagram post link usually is not a direct image URL. You can host files on your own website or a CDN such as Cloudinary.

## Publish your changes
1. Open `src/imageConfig.js` in GitHub.
2. Replace the empty strings with your image URLs.
3. Commit the change to `main`.
4. Render redeploys the site automatically if auto-deploy is enabled. Otherwise, trigger **Manual Deploy → Deploy latest commit**.

**Note:** This file-based method is deliberately simple. It does not create an admin dashboard or store uploaded images. The full admin-managed image editor will need a real authenticated backend and database; browser-only settings would not reliably update the site for all visitors.
