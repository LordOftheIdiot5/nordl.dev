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

## The pulse badge

`pulse.svg` is generated on chain by `PulseRenderer`
(`0x50bf16D32C4c8A4E8Fe4A3fD1bc0A5029F0b65a0` on Sepolia) and fetched at deploy
time:

    node scripts/fetch-pulse.js

It carries real state without any client-side script, so the page stays static.
Accurate as of the last deploy rather than the last second, which is the trade
being made deliberately.
