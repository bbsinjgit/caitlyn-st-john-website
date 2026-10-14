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

Uses the **Mustard, Olive & Rust** palette in a dark scheme: deep grounds with light text.

- Grounds: forest `#3B3A1D` (main), olive `#626033` (alternate bands and cards), mahogany `#66321D` (contact and getting-started bands), bark `#2A2614` (footer)
- Text: linen `#F5EEE1` (headings and body), soft linen `#E6DDCA` (secondary text), butter `#F1DFB3` (labels, links, subheadings)
- Accents: mustard `#C08A34` for buttons (with bark text), photo frames, underlines and focus rings
- Form fields stay light: parchment `#FCF8F0` with bark text

Headings in Cormorant Garamond, body in Hanken Grotesk, name in Gloock (all Google Fonts). Mustard is never used for small text on olive.

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
