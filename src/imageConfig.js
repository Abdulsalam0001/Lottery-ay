/**
 * IMAGE LINK SETTINGS — American Lottery
 *
 * Paste your own publicly accessible image URLs between the quotes.
 * Good sources: your own website/CDN, Cloudinary, or direct image links.
 * The URL must point to the image itself (usually .jpg, .png, .webp).
 *
 * To change these after deployment: edit this file on GitHub and commit.
 * Render will redeploy automatically if auto-deploy is enabled.
 */
export const imageConfig = {
  homepageHero: "", // Main hero image, e.g. "https://your-site.com/hero.webp"
  winnerFallbacks: [
    "", // Winner 1 image URL
    "", // Winner 2 image URL
    "", // Winner 3 image URL
    "", // Winner 4 image URL
    "", // Winner 5 image URL
    "", // Winner 6 image URL
  ],
  playerAvatars: [
    "", // Avatar 1
    "", // Avatar 2
    "", // Avatar 3
    "", // Avatar 4
    "", // Avatar 5
    "", // Avatar 6
  ],
  testimonials: [
    "", // Testimonial avatar 1
    "", // Testimonial avatar 2
    "", // Testimonial avatar 3
  ],
};

export const imageUrlOr = (url, fallback) =>
  typeof url === "string" && /^https?:\/\//i.test(url.trim()) ? url.trim() : fallback;
