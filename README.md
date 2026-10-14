# ekbekar.co

Portfolio site for Erhan Kucukbekar — static HTML, Tailwind CSS and a little vanilla JS. Hosted on GitHub Pages.

## Run locally

```bash
python3 -m http.server 5174
```

Then open http://localhost:5174.

## Rebuild the CSS

`assets/css/tailwind.css` is compiled from `src/input.css`. After adding or changing Tailwind classes, rebuild it with the [Tailwind CLI](https://github.com/tailwindlabs/tailwindcss/releases/tag/v3.4.16) (v3.4.16):

```bash
tailwindcss -c tailwind.config.js -i src/input.css -o assets/css/tailwind.css --minify
```

Hand-written styles and animations live in `assets/css/site.css`. Project content lives in `assets/js/projects.js`.
