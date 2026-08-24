# nordl.dev

The homepage. Static, no build step, published to GitHub Pages on push to `main`.

The apex `nordl.dev` points here; projects live on subdomains, so one domain and
one renewal covers everything rather than a name per idea.

- `worldpulse.nordl.dev` — [WorldPulse](https://github.com/LordOftheIdiot5/Wallet)

## DNS

The apex needs A records, not a CNAME, because a CNAME cannot sit alongside the
other records a zone apex must carry.

    A  @  185.199.108.153
    A  @  185.199.109.153
    A  @  185.199.110.153
    A  @  185.199.111.153
