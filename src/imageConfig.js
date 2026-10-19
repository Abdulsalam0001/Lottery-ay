/**
 * IMAGE LINK SETTINGS — American Lottery
 *
 * Edit these public image URLs to customize the homepage and photo cards.
 * After committing changes to main, Render can redeploy automatically if enabled.
 * These are external iStock image URLs; ensure your use complies with the image licence.
 */
export const imageConfig = {
  // Hero slideshow. The first slide is also used as the legacy homepageHero value.
  homepageHero: "https://media.istockphoto.com/id/2096494657/photo/senior-couple-using-laptop-while-sitting-on-sofa-in-living-room-at-home.jpg?s=612x612&w=0&k=20&c=lrmX0jOTVDK65D5-5tUdMHS6NxOShPNfD1z1En9c3Xc=",
  homepageHeroSlides: [
    "https://media.istockphoto.com/id/2096494657/photo/senior-couple-using-laptop-while-sitting-on-sofa-in-living-room-at-home.jpg?s=612x612&w=0&k=20&c=lrmX0jOTVDK65D5-5tUdMHS6NxOShPNfD1z1En9c3Xc=",
    "https://media.istockphoto.com/id/1413583709/photo/cheerful-senior-having-fun-while-taking-selfie-at-retirement-community.jpg?s=612x612&w=0&k=20&c=nYFvWrL80Zh9DCDbBJNO5DnUQQv9qliQfBjLfFcymCc=",
  ],
  winnerFallbacks: [
    "https://media.istockphoto.com/id/1792968045/photo/close-up-of-senior-woman-holding-mug-smiling-beside-window.jpg?s=612x612&w=0&k=20&c=z7XlbQTFXmaXowZZf8FnxJyl7GiNGFBQA97zYfgZEC4=",
    "https://media.istockphoto.com/id/2032240867/photo/caregiver-helping-woman-with-disability-in-park-for-support-trust-and-care-in-retirement.jpg?s=612x612&w=0&k=20&c=hkYMhFNG0IYcdIli55q_rVnTvbDskVtR-M76KWRBT_c=",
    "https://media.istockphoto.com/id/2152776645/photo/senior-women-friends-playing-cards.jpg?s=612x612&w=0&k=20&c=AVFJaQjUbeAIYZ4QmCEjOTQ3AGtNFR9s_ti9501RWbA=",
    "https://media.istockphoto.com/id/2159172130/photo/happy-senior-woman-with-her-adult-daughter-at-home.jpg?s=612x612&w=0&k=20&c=9ipFg8VGkJA9YrzA3GifTS6V-0yJmg7VBzT96osYWDc=",
    "https://media.istockphoto.com/id/2213315467/photo/elderly-woman-at-her-home-sitting-in-armchair-and-looking-at-camera.jpg?s=612x612&w=0&k=20&c=Nv45KUWOl2P9BJavBXUZOUNwED5ZnYHihHRWaRKISBw=",
    "https://media.istockphoto.com/id/2172612894/photo/mother-and-daughter-embraced-at-home.jpg?s=612x612&w=0&k=20&c=ikKz_4ubkUzhf3qgyI9j4Trjgj7ypKTRgt6KfvME_eo=",
  ],
  playerAvatars: [
    "https://media.istockphoto.com/id/2117668893/photo/portrait-of-an-old-man-content-and-happy-85-years-of-age.jpg?s=612x612&w=0&k=20&c=MPU6vcRFHvIDBjUXwg92v9JHR0jHGTmeDdfJzgX9K5o=",
    "https://media.istockphoto.com/id/929981250/photo/elderly-man-portraits.jpg?s=612x612&w=0&k=20&c=4sfc4niyywdXESDIqsekJ2hwrPhoLAKwNeDVVFCn-40=",
    "https://media.istockphoto.com/id/1203039364/photo/portrait-of-a-93-year-old-man-holding-a-walking-cane-studio-shot.jpg?s=612x612&w=0&k=20&c=h7myh0xHbe-TDDiL4tJ3Tw1AN7qMJyLlxg6wftKv8bU=",
    "https://media.istockphoto.com/id/1405947768/photo/elderly-man-smiling-face-expression-concept-over-white-background.jpg?s=612x612&w=0&k=20&c=znCWQP18472bi1q27h3H9vPUa3fbhCmnZeSh7Qq41b8=",
    "https://media.istockphoto.com/id/1189492977/photo/portrait-of-senior-caucasian-man-with-skeptical-expression.jpg?s=612x612&w=0&k=20&c=DBMBWLYpjFrUCZBjQOxOjARq4_JmKHhwbuZweLCIMo0=",
    "https://media.istockphoto.com/id/2275345074/photo/portrait-older-gentleman-in-glasses-looking-at-camera-with-smile.jpg?s=612x612&w=0&k=20&c=DLjDtMRLTXHvwhlmIXLRrVhPBV4aAwLlPQtz55lW9FY=",
  ],
  testimonials: [
    "https://media.istockphoto.com/id/2172316440/photo/parents-playing-with-daughter-at-home.jpg?s=612x612&w=0&k=20&c=CsV-8851AgfVD8AYQGChK4cyQzQohK_cNpW8gf4fwAQ=",
    "https://media.istockphoto.com/id/1480574526/photo/happy-multigenerational-people-having-fun-sitting-on-grass-in-a-public-park.jpg?s=612x612&w=0&k=20&c=iIzSiY2FK9mWTCmV8Ip8zpvXma7f1Qbd-UuKXNJodPg=",
    "https://media.istockphoto.com/id/2218468195/photo/mother-and-daughter-doing-piggyback-outdoors.jpg?s=612x612&w=0&k=20&c=o1cwLrkNBcp72Qtuo96YbryAzhXQeSsX-iWMIu5cI1U=",
  ],
};

export const imageUrlOr = (url, fallback) =>
  typeof url === "string" && /^https?:\/\//i.test(url.trim()) ? url.trim() : fallback;
