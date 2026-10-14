# Caitlyn St John Psychotherapy

Plain HTML and CSS with no build step. Open `index.html` in a browser to preview.

## Pages

| File | Page |
|---|---|
| `index.html` | Home |
| `about.html` | About |
| `how-i-work.html` | How I work, and What I can help with |
| `services.html` | Walk & talk, Online, Bell tent |
| `fees.html` | Fees and practicalities, Getting started |
| `faq.html` | FAQ |
| `contact.html` | Contact |

The header and footer are repeated on every page, so a change to either (a new link, a new phone number) needs making in all seven files.

## Design

Uses a softened **Mustard, Olive & Rust** palette on a warm dusty-rust ground, with colour used thoughtfully so the site feels peaceful.

- Grounds: warm dusty rust `#E9D4C6` (main), parchment `#F7EEE4` (cards, quiet bands), walnut `#5A4334` (Ways to work with me, with parchment heading)
- Olive `#67653C`: approach-cards band, bell tent section and Fees "Getting started", always with parchment text
- Deep bands: muted olive `#66664E` (free first conversation), dusty rust `#7F5545` (contact), footer olive-charcoal `#3D3D30`
- Mustard: golden mustard `#C8962E` for photo frames, rules and underlines (and the "Free" card on Fees, with ink text); deep mustard `#75540F` for mustard-coloured text and focus rings
- Fees cards: rust, mustard, oat and parchment
- Text: ink `#33332A`, body `#55534A`, muted olive `#5E5E46` for labels
- Buttons and links: dusty rust `#7F5545` (hover `#6E4A3C`); on olive bands, parchment buttons with rust text

Headings and the name in Marcellus, body text in Jost (both Google Fonts).

## Contact form

The form on `contact.html` sends messages through Formspree (free for up to 50 messages a month), because GitHub Pages can't send email itself.

1. Sign up at formspree.io with Caitlyn's email address and create a new form.
2. Copy the form's ID (the part after `/f/` in its endpoint, e.g. `xyzabcd`).
3. In `contact.html`, replace `YOUR_FORM_ID` in `https://formspree.io/f/YOUR_FORM_ID` with it.

Messages then arrive in her inbox. Until that's done, the form won't send.

## Publishing with GitHub Pages

Settings → Pages → Source: "Deploy from a branch" → Branch: `main`, folder `/ (root)` → Save. The site appears at `https://<username>.github.io/<repo-name>/` within a minute or two, and a custom domain can be added on the same page.

## Still to fill in

- Email address: search for `[YOUR EMAIL]` (on `contact.html`)
- Contact form ID: replace `YOUR_FORM_ID` (see Contact form above)
- Privacy policy: search for `[Privacy policy]` (footer of every page)
- Higher-resolution bell tent interior photo (`images/bell-tent-interior.jpg`)
