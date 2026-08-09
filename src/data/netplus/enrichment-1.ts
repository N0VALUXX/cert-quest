import type { Enrichment } from "../../content-model";

export const batch1: Record<string, Enrichment> = {
  "netplus-2": {
    why: "A /26 prefix leaves six host bits, so subnets step in blocks of 64: 0-63, 64-127, 128-191, 192-255. The address .75 falls in the second block, which runs from .64 to .127, and the broadcast address is always the last address in the block — .127.",
    wrong: {
      A: "This is the broadcast address of the first block, 0-63. It would be correct for a host addressed .10 or .50, but .75 has already crossed into the next block.",
      C: "This is the network address of the third block rather than a broadcast address, and it belongs to a different subnet than the host in the question.",
      D: "This would be the broadcast address if the prefix were /24, treating the whole third octet as one subnet. It is what you get by ignoring the /26 entirely.",
    },
    concept:
      "Subnetting questions are fastest to solve by block size rather than by writing out binary. Subtract the prefix from 32 to get the host bits, then the block size is 2 raised to that power — a /26 gives 6 host bits and a block size of 64, a /27 gives 32, a /28 gives 16. Blocks always start at zero and step by the block size in the octet the prefix lands in. Once you know the block containing your address, the network address is the first value, the broadcast is the last, and the usable host range is everything between. The same method scales to any prefix, and it turns a minute of binary arithmetic into about five seconds of counting.",
    trap: "The pull is toward .63 for anyone who computes the block size correctly but forgets to check which block the host actually sits in. Locate the address first, then read off the boundaries — determining the block size is only half the work.",
    refs: [
      { label: "RFC 4632 — Classless Inter-domain Routing (CIDR)", url: "https://www.rfc-editor.org/rfc/rfc4632" },
      { label: "RFC 1918 — Address Allocation for Private Internets", url: "https://www.rfc-editor.org/rfc/rfc1918" },
    ],
    visual: {
      kind: "formula",
      caption: "Drag the prefix — everything else falls out of it",
      expression: "block size = 2 ^ (32 − prefix)",
      inputs: [
        { key: "prefix", label: "Prefix length", min: 24, max: 30, step: 1, value: 26, prefix: "/" },
      ],
      outputs: [
        {
          label: "Host bits",
          term: { op: "sub", args: [{ value: 32 }, { ref: "prefix" }] },
          note: "What is left after the network part.",
        },
        {
          label: "Block size",
          headline: true,
          term: {
            op: "pow",
            args: [{ value: 2 }, { op: "sub", args: [{ value: 32 }, { ref: "prefix" }] }],
          },
          note: "Subnets start at 0 and step by this. Find the block containing your address, and its last value is the broadcast.",
        },
        {
          label: "Usable hosts",
          term: {
            op: "sub",
            args: [
              { op: "pow", args: [{ value: 2 }, { op: "sub", args: [{ value: 32 }, { ref: "prefix" }] }] },
              { value: 2 },
            ],
          },
          note: "Network and broadcast addresses are not assignable.",
        },
        {
          label: "Subnets per /24",
          term: {
            op: "div",
            args: [
              { value: 256 },
              { op: "pow", args: [{ value: 2 }, { op: "sub", args: [{ value: 32 }, { ref: "prefix" }] }] },
            ],
          },
        },
      ],
    },
  },

  "netplus-9": {
    why: "Reaching the host by IP proves that layers one through three are working end to end — the cable, the switch path, the routing, and the default gateway all have to be functional for the echo reply to come back. The only thing the hostname adds is a name-to-address lookup, so a failure that appears when the name is used and disappears when the address is used isolates the fault to DNS.",
    wrong: {
      A: "A misconfigured default gateway would break the IP ping as well, since the remote server is off the local subnet and every packet to it has to leave through the gateway.",
      C: "The near-miss in structure, and worth thinking through: if the server dropped ICMP, both pings would fail, because the ping by hostname resolves to the same address and sends the same ICMP echo. A control that blocks the protocol cannot distinguish how the destination was typed.",
      D: "A faulty cable would take down all traffic on the link, not just name-based traffic. Nothing that succeeds by IP can coexist with a broken physical layer.",
    },
    concept:
      "Structured troubleshooting works by finding the variable that changes between the working case and the failing case. Here two tests differ in exactly one respect — one supplies an address, the other supplies a name — so the fault has to lie in the step that only the second test performs. That is worth generalising: ping by IP tests connectivity, ping by name tests connectivity plus resolution, and the difference between them isolates DNS without touching anything else. Extend the same logic with nslookup or dig to confirm which resolver is answering and what it returns, and check whether the failure is the resolver being unreachable, returning NXDOMAIN, or returning a stale address. The layered model is what makes this reliable: a lower-layer fault cannot present as a selective upper-layer symptom.",
    trap: "Candidates who read quickly see 'cannot reach the server' and reach for the dramatic physical answers in A and D, which would both produce total failure rather than the selective failure described. Read what still works — the successful test constrains the answer far more than the failing one does.",
    refs: [
      { label: "RFC 1034 — Domain Names: Concepts and Facilities", url: "https://www.rfc-editor.org/rfc/rfc1034" },
      { label: "RFC 792 — Internet Control Message Protocol", url: "https://www.rfc-editor.org/rfc/rfc792" },
    ],
  },
};

