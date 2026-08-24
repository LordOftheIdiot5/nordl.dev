// Pulls the live pulse badge out of the chain and writes it to pulse.svg.
//
//   node scripts/fetch-pulse.js
//
// Run before deploying, so the homepage carries real chain state without any
// client-side JavaScript. The badge is accurate as of the last deploy, which is
// honest and costs the page nothing at runtime.
//
// Deliberately dependency-free: one eth_call and a hand-rolled ABI string
// decode, so this repo stays a static site with no node_modules.
const fs = require("fs");
const path = require("path");

const RPC = "https://ethereum-sepolia-rpc.publicnode.com";
const RENDERER = "0x50bf16D32C4c8A4E8Fe4A3fD1bc0A5029F0b65a0";
const SUBJECT = "0x8cA1470b3Ea971ADD119aDA2271e84bDBfccEA2A";
const RENDER_SVG = "0xd85f0148"; // renderSVG(address)

const OUT = path.join(__dirname, "..", "pulse.svg");

async function ethCall(to, data) {
  const response = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_call",
      params: [{ to, data }, "latest"],
    }),
  });
  const body = await response.json();
  if (body.error) throw new Error(body.error.message);
  return body.result;
}

// A dynamic string comes back as: 32 bytes of offset, 32 bytes of length, then
// the bytes themselves padded to a 32 byte boundary.
function decodeString(hex) {
  const raw = hex.replace(/^0x/, "");
  const offset = parseInt(raw.slice(0, 64), 16) * 2;
  const length = parseInt(raw.slice(offset, offset + 64), 16) * 2;
  const bytes = raw.slice(offset + 64, offset + 64 + length);
  return Buffer.from(bytes, "hex").toString("utf8");
}

async function main() {
  const padded = SUBJECT.toLowerCase().replace(/^0x/, "").padStart(64, "0");
  const result = await ethCall(RENDERER, RENDER_SVG + padded);
  const svg = decodeString(result);

  if (!svg.startsWith("<svg") || !svg.endsWith("</svg>")) {
    throw new Error("That is not an SVG - refusing to write it");
  }

  const previous = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  fs.writeFileSync(OUT, svg);

  const bpm = (svg.match(/>(\d+) BPM/) || [])[1];
  const state = (svg.match(/BPM &#183; (\w+)</) || [])[1];
  console.log(`pulse.svg: ${svg.length} bytes — ${bpm} BPM, ${state}`);
  console.log(previous === svg ? "  unchanged since last fetch" : "  updated");
}

main().catch((error) => {
  console.error("FAILED:", error.message);
  process.exitCode = 1;
});
