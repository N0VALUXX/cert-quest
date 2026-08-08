import type { Enrichment } from "../../types";

export const batch1: Record<string, Enrichment> = {
  "secplus-4": {
    why: "A key derivation function such as bcrypt, scrypt, or Argon2 is deliberately slow and memory-hard, so each guess costs the attacker real time and hardware. The unique per-password salt means two users with the same password produce different stored values, which destroys the economics of a precomputed table — the attacker would have to build a fresh table for every single salt.",
    wrong: {
      A: "Encryption is reversible, so the system must hold a key to verify a login. That key sits on the same infrastructure as the database, and an attacker who took the database is usually in a position to take the key too, at which point every password is recovered in plaintext at once.",
      C: "A plain fast hash is the near-miss, and it is a real improvement over storing plaintext. Its weakness is speed: SHA-256 is designed to be fast, so commodity GPUs test billions of candidates per second. Without a salt the same password always yields the same digest, which is exactly the property rainbow tables exploit.",
      D: "Base64 is an encoding, not a security control. It is reversible by anyone who recognises it and involves no secret at all, so the stored value is functionally plaintext.",
    },
    concept:
      "Password storage is judged on two independent axes. The first is reversibility — hashes are one-way, encryption is not, and anything reversible means the plaintext exists somewhere behind a key you also have to protect. The second is cost per guess, which is where salts and work factors live. A salt is not secret and does not slow a single guess down; it defeats precomputation and prevents identical passwords from looking identical. The work factor is what slows each guess, and it is tunable upward as hardware improves. Modern guidance is a purpose-built KDF with a per-password salt and a calibrated work factor, plus a pepper held outside the database if you want defence against database-only compromise.",
    trap: "Option A pulls hardest because encryption sounds stronger than hashing and candidates reach for the biggest-sounding algorithm. Ask what the system needs to do with the value: verification only ever needs comparison, never recovery, so any design that can recover the password is solving a problem you do not have and creating one you do.",
    refs: [
      { label: "NIST SP 800-63B — Authentication and Lifecycle Management", url: "https://csrc.nist.gov/pubs/sp/800/63/b/upd2/final" },
      { label: "OWASP — Password Storage Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html" },
    ],
  },

  "secplus-5": {
    why: "Multifactor authentication requires credentials drawn from different categories, and this configuration uses two of them — a password is something you know and a fingerprint is something you are. Because the categories differ, an attacker has to defeat two unrelated kinds of attack to get in, which is the whole point of the requirement.",
    wrong: {
      B: "Where the credentials are entered has no bearing on how many factors are involved. Factor counting is about the category each credential belongs to, not the number of devices or terminals used to submit them.",
      C: "This is the near-miss, and the reasoning is the common misconception: two credentials is not the same as two factors. A password plus a security question is two separate credentials that are both something you know, so an attacker who has learned enough about the user defeats both with a single class of attack.",
      D: "A fingerprint is an inherence factor, not a possession factor. Something you have refers to a physical object under the user's control such as a hardware token, smart card, or registered phone.",
    },
    concept:
      "Authentication factors sort into categories, and only crossing a category boundary buys you real independence. Something you know covers passwords, PINs, and security questions. Something you have covers tokens, smart cards, and the phone holding an authenticator app. Something you are covers biometrics. Somewhere you are and something you do are recognised as supplementary attributes rather than standalone factors. The security value comes from an attacker needing unrelated capabilities: phishing a password does not lift a fingerprint, and stealing a token does not reveal a PIN. Note that not all second factors are equal — SMS one-time codes are a possession factor on paper but are vulnerable to SIM swapping and interception, which is why phishing-resistant options such as FIDO2 are preferred.",
    trap: "Option C is engineered to catch anyone who counts credentials instead of categories, and it is the single most common error in this family. Whenever a question lists two things, name the category of each before deciding — if both land in the same bucket, it is single-factor no matter how many prompts the user sees.",
    refs: [
      { label: "NIST SP 800-63B — Authentication and Lifecycle Management", url: "https://csrc.nist.gov/pubs/sp/800/63/b/upd2/final" },
      { label: "CISA — Multi-Factor Authentication", url: "https://www.cisa.gov/resources-tools/resources/multi-factor-authentication-mfa" },
    ],
  },

  "secplus-8": {
    why: "The recovery point objective defines how much data the business can afford to lose, measured backwards from the moment of failure. A four-hour figure attached to lost data means the most recent recoverable copy may be up to four hours old, which sets the backup or replication frequency required to meet it.",
    wrong: {
      A: "The near-miss, and the two are constantly confused because both are expressed in hours and both appear in the same continuity plan. Recovery time objective measures forward from the outage and answers how long the service may stay down. It is a statement about downtime, not about data loss.",
      C: "Mean time to repair is an observed average of how long fixes actually take. It is a reliability measurement derived from history, whereas an objective is a target the business sets in advance.",
      D: "Mean time between failures describes how often a component is expected to fail. It informs procurement and redundancy decisions and says nothing about acceptable data loss.",
    },
    concept:
      "Put the outage at the centre of a timeline and the whole metric family separates cleanly. Everything to the left of the event is data loss and is governed by the recovery point objective, which dictates backup frequency — an RPO of four hours means you cannot back up nightly. Everything to the right is downtime and is governed by the recovery time objective, which dictates the recovery capability you must buy, since a two-hour RTO cannot be met by restoring tapes from an off-site vault. MTBF and MTTR sit on a different footing entirely: they are measured averages describing how equipment behaves, while RPO and RTO are targets the business chooses based on what disruption costs it. The business impact analysis is where those targets come from.",
    trap: "RTO takes most of the wrong answers here because it is the more familiar acronym and candidates pattern-match on any figure quoted in hours. The discriminator is the noun the figure attaches to. Data lost points backwards to RPO; service unavailable points forwards to RTO.",
    refs: [
      { label: "NIST SP 800-34 Rev.1 — Contingency Planning", url: "https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final" },
      { label: "Ready.gov — Business Continuity Plan", url: "https://www.ready.gov/business-continuity-plan" },
    ],
    visual: {
      kind: "timeline",
      caption: "Put the outage in the middle — data loss to the left, downtime to the right",
      event: "Outage occurs",
      points: [
        { at: 8, label: "Last good backup", body: "The most recent recoverable copy. The gap between this point and the outage is the data you will lose, and shrinking it means backing up or replicating more often.", tone: "warn" },
        { at: 30, label: "RPO boundary", body: "The maximum tolerable data loss, set by the business. Everything between here and the outage must be recoverable, which is what sets your backup frequency. This is the four-hour figure in the question.", tone: "good" },
        { at: 68, label: "Service restored", body: "The point at which users can work again. The gap from the outage to here is actual downtime, and it is measured against the RTO rather than the RPO." },
        { at: 90, label: "RTO boundary", body: "The maximum tolerable downtime. Miss it and the business consequences the continuity plan was written to avoid start landing. Meeting a short RTO is about recovery capability, not backup frequency.", tone: "bad" },
      ],
    },
  },

  "secplus-9": {
    why: "A differential backup copies everything changed since the last full backup, so each successive run re-copies the previous day's changes plus the new ones. That cumulative behaviour is why the job grows a little larger every night until the next full backup resets the baseline.",
    wrong: {
      A: "The near-miss, and the distinction is precisely what the growth pattern reveals. An incremental backup copies what changed since the last backup of any kind, so each night captures only that day's changes and job size stays roughly flat rather than climbing. Incremental is faster to write and slower to restore, since recovery needs the full backup plus every increment in order.",
      C: "A snapshot captures the state of a volume at a point in time, typically using copy-on-write within the storage layer. It is near-instant and space-efficient but usually lives alongside the original data, so it protects against deletion and corruption rather than against loss of the underlying system.",
      D: "A full backup copies everything every run, so its size tracks the total data volume and does not grow night over night in the pattern described.",
    },
    concept:
      "Backup strategies trade backup window against restore complexity, and the reference point is what distinguishes them. Full copies everything: slowest to write, simplest to restore, needs one set. Incremental references the last backup of any kind: fastest to write, most complex to restore, needs the full plus every increment in sequence, and a single missing increment breaks the chain. Differential references the last full backup: write time grows through the cycle, but restore only ever needs two pieces, the full and the most recent differential. Choose by which window matters more — a tight backup window favours incremental, a tight recovery time objective favours differential. Layer the 3-2-1 rule on top: three copies, on two media types, with one off-site, and test restores rather than assuming they work.",
    trap: "Incremental and differential are the classic confusion pair and the question deliberately gives you the behavioural tell rather than the definition. Anchor on the reference point: growing jobs mean the reference is fixed, which is differential; flat jobs mean the reference moves, which is incremental.",
    refs: [
      { label: "NIST SP 800-34 Rev.1 — Contingency Planning", url: "https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final" },
      { label: "CISA — Data Backup Options", url: "https://www.cisa.gov/sites/default/files/publications/data_backup_options.pdf" },
    ],
    visual: {
      kind: "compare",
      caption: "What each type references, and what a restore costs",
      items: [
        { label: "Full", body: "Copies everything, every time. Longest backup window, simplest restore — one set and you are done. Usually the weekly or monthly baseline the others hang off." },
        { label: "Differential", body: "References the last full backup. Job size grows through the cycle because yesterday's changes are copied again. Restore needs exactly two pieces: the full plus the latest differential.", tone: "good" },
        { label: "Incremental", body: "References the last backup of any kind. Smallest and fastest nightly job, flat in size. Restore needs the full plus every increment in order, and one corrupt link breaks the chain.", tone: "warn" },
        { label: "Snapshot", body: "Point-in-time state of a volume, usually copy-on-write in the storage layer. Near-instant and cheap, but typically stored with the original data, so it is not a substitute for an off-site backup." },
      ],
    },
  },

  "secplus-15": {
    why: "Transference moves the financial consequence of a risk to another party while leaving the risk itself in place. Insurance is the canonical example — the ransomware event is no less likely and no less disruptive, but the monetary loss lands on the insurer under the terms of the policy.",
    wrong: {
      A: "Avoidance eliminates the risk by not doing the risky thing at all, such as decommissioning the exposed service or exiting the line of business. The organisation here is continuing to operate exactly as before.",
      B: "Acceptance is the near-miss, because buying insurance does involve consciously deciding to live with the underlying exposure. The distinction is that acceptance means absorbing the consequence yourself with no instrument in place, whereas here a third party has contractually taken on the loss. Note that the deductible and anything above the policy limit is genuinely accepted, so real decisions usually combine the two.",
      D: "Mitigation reduces likelihood or impact through controls — backups, segmentation, user training. Insurance changes who pays after the event rather than changing the event's probability or severity.",
    },
    concept:
      "There are four responses to an identified risk and they answer different questions. Avoidance removes the exposure by stopping the activity. Mitigation applies controls to reduce likelihood or impact and is where most of a security budget goes. Transference shifts the consequence to someone else, through insurance or by contracting the activity out, and it is worth remembering that reputational and regulatory consequences generally cannot be transferred even when financial ones can. Acceptance is the deliberate, documented decision to carry the residual exposure, and it requires an owner with the authority to make it. Residual risk is what remains after the chosen response, and every real programme ends up accepting some — the failure mode is accepting it by accident rather than on purpose.",
    trap: "Acceptance draws the votes because insurance feels like admitting you cannot stop the attack, which it partly is. Read for whether a second party has taken on the consequence. If a contract moves the loss to someone else it is transference; if the loss stays with you it is acceptance.",
    refs: [
      { label: "NIST SP 800-39 — Managing Information Security Risk", url: "https://csrc.nist.gov/pubs/sp/800/39/final" },
      { label: "NIST SP 800-30 Rev.1 — Guide for Conducting Risk Assessments", url: "https://csrc.nist.gov/pubs/sp/800/30/r1/final" },
    ],
  },
};
