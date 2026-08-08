import type { Enrichment } from "../../types";

export const batch1: Record<string, Enrichment> = {
  "cysa-2": {
    why: "A CVSS base score describes the intrinsic characteristics of a vulnerability and is deliberately environment-free — it is the same number whether the affected software runs on a domain controller or on a disconnected lab box. Priority is a business decision, so it has to fold in what the base score omits: whether the asset is reachable, what it is worth, whether an exploit exists in the wild, and what compensating controls already stand in the way.",
    wrong: {
      A: "The near-miss, and it is the default behaviour of most scanner reports, which is precisely why it is worth arguing with. Sorting by base score alone produces a queue that ignores reachability and asset value, so a 9.8 on an isolated decommissioned host outranks a 7.5 on an internet-facing payment system. That inverts the actual risk.",
      C: "Report order is an artefact of how the scanner enumerated hosts. It carries no information about severity or exposure and using it as a priority signal is arbitrary.",
      D: "CVE age says nothing about risk on its own. An old CVE may be actively exploited and unpatched, while a recent one may have no working exploit — the identifier's date is not a proxy for either.",
    },
    concept:
      "CVSS is built in three layers and most people only ever use the first. Base captures intrinsic properties — attack vector, complexity, privileges required, and the impact on confidentiality, integrity, and availability. Temporal adjusts for the current state of the world, chiefly exploit maturity and remediation availability. Environmental re-weights the base for your specific deployment, letting you raise or lower impact according to what the asset is worth and modify the attack vector for network position. Real prioritisation multiplies severity by exposure by asset criticality, then subtracts compensating controls, which is why exploit-prediction data and known-exploited catalogues have become the practical inputs. The habit to build is treating the scanner's ranking as raw material rather than as the answer.",
    trap: "Option A pulls because 9.8 is a large, alarming number and because severity and priority feel like synonyms. They are not: severity is a property of the vulnerability, priority is a property of your situation. The stem hands you two contextual facts — decommissioned and no connectivity — and those exist to be used.",
    refs: [
      { label: "FIRST — Common Vulnerability Scoring System", url: "https://www.first.org/cvss/" },
      { label: "CISA — Known Exploited Vulnerabilities Catalog", url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog" },
    ],
  },

  "cysa-9": {
    why: "Volatile data disappears when the machine loses power or state changes, and RAM plus active connections is the most volatile material of forensic value — it holds running processes, injected code that never touched disk, decryption keys, and the sockets showing where the host is currently talking. Anything still on the disk will still be there in an hour; the memory image will not.",
    wrong: {
      A: "Archived backups are the least volatile source in the list. They sit on separate media, are unaffected by the state of the compromised host, and can be collected at any point without loss.",
      C: "The near-miss, and the instinctive answer because disk imaging is the classic forensic act. Disk contents are non-volatile, so collecting them first is safe from a preservation standpoint but wastes the window in which memory is still recoverable — and pulling the plug to image cleanly destroys the memory outright, along with any malware that only ever lived there.",
      D: "Printed documentation does not change and can be gathered whenever convenient. It is at the far end of the volatility scale.",
    },
    concept:
      "The order of volatility governs evidence collection: CPU registers and cache, then RAM and running state, then network connections and routing tables, then temporary file systems, then disk, then remote logging and monitoring data, then physical configuration and topology, then archival media. Collect from the most volatile downward, because each acquisition costs time during which the volatile sources are still decaying. Two consequences are worth carrying. First, memory-resident and fileless malware is invisible to a disk image, so skipping RAM can mean never finding the intrusion at all. Second, preservation duties run alongside ordering — hash the acquisition, record who held the evidence and when as a chain of custody, and work on copies. Speed and rigour are not in tension here; the ordering exists so that both are achievable.",
    trap: "Disk imaging pulls hardest because it is what forensics looks like in popular imagination and because it feels the most thorough. Ask which source will still exist later — the answer to that question is the ordering, and disk always survives longer than memory.",
    refs: [
      { label: "RFC 3227 — Guidelines for Evidence Collection and Archiving", url: "https://www.rfc-editor.org/rfc/rfc3227" },
      { label: "NIST SP 800-86 — Integrating Forensic Techniques into Incident Response", url: "https://csrc.nist.gov/pubs/sp/800/86/final" },
    ],
    visual: {
      kind: "ladder",
      caption: "Order of volatility — collect from the top down",
      rungs: [
        { label: "CPU registers and cache", body: "Gone in nanoseconds and rarely collectable in practice. Listed because it anchors the top of the scale." },
        { label: "RAM and running processes", body: "Lost on power-off. Holds injected code, decryption keys, and fileless malware that never touches disk. The answer to this question." },
        { label: "Network connections and ARP cache", body: "Shows who the host is talking to right now. Sessions close and caches age out within minutes, so this decays while you work." },
        { label: "Temporary file systems", body: "Swap, temp directories, and RAM disks. Often cleared on reboot and overwritten during normal operation." },
        { label: "Disk contents", body: "Non-volatile and the traditional focus of forensic imaging. Still there in an hour, which is exactly why it does not go first." },
        { label: "Remote logs and monitoring data", body: "Already off the host and protected from local tampering. Bounded by retention policy rather than by volatility." },
        { label: "Archival media and printed material", body: "Effectively static. Collect at leisure without any risk of loss." },
      ],
    },
  },
};
