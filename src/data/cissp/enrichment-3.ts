import type { Enrichment } from "../../content-model";

export const batch3: Record<string, Enrichment> = {
  "cissp-41": {
    why: "The network attack surface is the set of points an attacker can reach across the network. Every listening port with a service behind it is one of those points, so closing the port and stopping the service removes reachability outright — the attacker can no longer speak to the code at all, whether or not it is vulnerable.",
    wrong: {
      B: "Group accounts destroy individual accountability and make credential revocation impossible, but the account model does not change what is listening on the wire. An attacker reaching a service still reaches it.",
      C: "This is the near-miss, and it is genuinely a reduction — uninstalling a package that happens to listen also closes its port. The gap is that most default software never opens a socket, so uninstalling is a broad hygiene measure that only incidentally touches the network. Disabling ports and services targets the reachable surface directly and covers services belonging to software you must keep.",
      D: "Removing unnecessary accounts shrinks the credential surface, which matters once an attacker is already talking to an authentication prompt. It does nothing about services that never ask for credentials.",
    },
    concept:
      "Attack surface decomposes by channel: network (what is reachable remotely), software or local (what code runs on the host), human (what people can be talked into), and physical (what can be touched). A question that names one channel is asking you to score the options against that channel only, not against total risk. For the network channel the measure is simple — enumerate listeners, then justify each one. This is the same idea NIST expresses as least functionality in CM-7: configure the system to provide only essential capabilities.",
    trap: "Uninstalling in option C feels more thorough than merely disabling, and thoroughness reads as the better security answer. The qualifier 'network' is doing all the work in this stem — three of the four options reduce some attack surface, and only one reduces the one named.",
    refs: [
      { label: "NIST SP 800-123 — Guide to General Server Security", url: "https://csrc.nist.gov/pubs/sp/800/123/final" },
      { label: "OWASP — Attack Surface Analysis Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Attack_Surface_Analysis_Cheat_Sheet.html" },
    ],
  },

  "cissp-42": {
    why: "A TPM generates the key pair inside a tamper-resistant chip and can mark the private key non-exportable, so the key never exists in plaintext outside that boundary. Signing requests go into the chip and signatures come out. Compromising the operating system therefore does not yield the CA key, which is the property a certificate authority needs above all others.",
    wrong: {
      A: "A physically secured storage device defends the medium against theft. Once an authorised process reads the key it is plaintext in host memory, and nothing about the safe or the locked cabinet constrains what happens next or detects a copy being made.",
      C: "The closest of the three, because the key is at least ciphertext at rest. The protection collapses to the strength and handling of the passphrase, and the key must be decrypted into the memory of a general-purpose host every time it is used. Removable media also invites exactly the copying a CA key must never permit.",
      D: "PKI is the trust framework the certificate authority operates within — policies, certificates, revocation, and hierarchy. It is the system asking the question, not a place to put a key, so this option is a category error rather than a weak option.",
    },
    concept:
      "Rank key storage by one question: where can the private key exist in plaintext, and who can reach that place? Software file, encrypted file, OS keystore, TPM, and HSM form a ladder in which each rung shrinks that region. Above the OS keystore the model inverts — instead of bringing the key to the operation, you send the operation to the key, and the key never leaves. In production a certificate authority key belongs in a FIPS 140-3 validated HSM under multi-person control; a TPM is the same architectural idea bound to one machine. Note that no storage choice substitutes for the surrounding controls: an offline root, split knowledge for activation, and audited key ceremonies.",
    trap: "Option D collects votes because PKI is the vocabulary word already in the stem, and matching a term from the question feels like confirmation. Option C pulls the more careful reader who is thinking about encryption at rest but not about the moment of use — the question is where the key lives while it is working, not while it is idle.",
    refs: [
      { label: "NIST SP 800-57 Part 1 Rev.5 — Key Management", url: "https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final" },
      { label: "FIPS 140-3 — Security Requirements for Cryptographic Modules", url: "https://csrc.nist.gov/pubs/fips/140-3/final" },
    ],
    visual: {
      kind: "ladder",
      caption: "Where can the private key exist in plaintext?",
      rungs: [
        { label: "HSM, FIPS 140-3 validated", body: "Key is generated and used inside a certified tamper-responsive boundary and is never exportable. Operations travel to the key. What a production CA actually uses — and the reason this question feels incomplete, since it is not offered." },
        { label: "TPM", body: "Same principle, bound to one machine and cheaper. The key is created on-chip, marked non-exportable, and signing happens inside. An OS compromise yields use of the key while the host runs, but not the key itself." },
        { label: "OS keystore or smart card", body: "The key sits behind an API with access control, and on a smart card it is hardware-held. Better than a file, but a privileged process on the host can often use or extract it." },
        { label: "Encrypted flash drive", body: "Ciphertext at rest, plaintext in host RAM at every use. Security reduces to the passphrase, and the medium is removable and trivially cloned while mounted." },
        { label: "Physically secured storage device", body: "Controls who can pick the object up. Says nothing about what happens after an authorised read, and provides no cryptographic binding at all." },
      ],
    },
  },

  "cissp-43": {
    why: "The list deliberately spans different control functions and different control types at once — barriers prevent, cameras and alarms detect, guards deter and respond, card and PIN readers authenticate and authorise. No single one of them is being described; the property being named is that they are layered so defeating any one control still leaves an attacker facing the others.",
    wrong: {
      A: "Access control names only part of the list. The card and PIN system is an access control, but a camera does not control access — it records what happened after the fact, and an alarm signals rather than restricts.",
      B: "SIEM aggregates and correlates event data from log sources to support detection and investigation. Nothing in the list is a log platform, and physical barriers produce no telemetry to correlate.",
      D: "The strongest distractor. A security perimeter is a real concept and the barriers do form one, but a perimeter is a boundary — a single line at the edge of a protected area. The list describes controls at multiple depths and of different natures, which is precisely what distinguishes layering from a perimeter. A perimeter is one layer of defence in depth, not a synonym for it.",
    },
    concept:
      "Classify every control on two independent axes and this whole family of questions becomes mechanical. The type axis is administrative, technical, and physical — what the control is made of. The function axis is deterrent, preventive, detective, corrective, recovery, and compensating — what the control does. Defence in depth means holding cells across both axes rather than stacking more of one kind, because controls that fail the same way are not really layers. When a stem enumerates a deliberately heterogeneous list, it is asking you to name the property of the whole set; when it describes one mechanism, it wants the specific control name.",
    trap: "The word 'barriers' appears first and evokes perimeter, so option D wins on association with a single item in the list. The reading habit that causes it is matching the answer to the most vivid element rather than asking what all five elements have in common. Whenever a stem lists items that clearly do different jobs, the variety is the point.",
    refs: [
      { label: "NIST SP 800-12 Rev.1 — An Introduction to Information Security", url: "https://csrc.nist.gov/pubs/sp/800/12/r1/final" },
      { label: "NIST SP 800-53 Rev.5 — Security and Privacy Controls", url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final" },
    ],
    visual: {
      kind: "matrix",
      caption: "Control type against control function — the items in the stem land in six different cells",
      rows: ["Administrative", "Technical", "Physical"],
      cols: ["Deterrent", "Preventive", "Detective"],
      cells: {
        "Administrative|Deterrent": { title: "Policy and sanctions", body: "Published consequences for misuse. Changes the calculation of an insider considering it, without physically stopping anyone." },
        "Administrative|Preventive": { title: "Screening, training, separation of duties", body: "Keeps the wrong person out of the role in the first place, and ensures no single role can complete a sensitive action alone." },
        "Administrative|Detective": { title: "Access reviews and investigation", body: "Periodic review of who holds what, and the procedures that turn an alert into a finding. Latency is the review period." },
        "Technical|Deterrent": { title: "Warning banners", body: "Asserts monitoring and removes any expectation of privacy. Legally useful, and it discourages the casual prober." },
        "Technical|Preventive": { title: "Card and PIN access system", body: "In the stem. Authenticates two factors and authorises before the lock releases. This is the only item in the list that decides who gets in.", tone: "info" },
        "Technical|Detective": { title: "Cameras and alarms", body: "In the stem. Cameras record for later reconstruction, alarms signal in real time. Neither stops entry — they ensure entry is not silent.", tone: "info" },
        "Physical|Deterrent": { title: "Lighting and signage", body: "Raises the perceived probability of being seen. Cheap, and it works on opportunists rather than determined attackers." },
        "Physical|Preventive": { title: "Barriers, fences, mantraps", body: "In the stem. Physically obstructs movement and defeats tailgating. Buys the time that detective controls need to matter.", tone: "info" },
        "Physical|Detective": { title: "Security guards", body: "In the stem. The most flexible control in the list — a guard deters by presence, detects by observation, and responds by intervening, which is why guards resist single-cell classification.", tone: "info" },
      },
    },
  },

  "cissp-44": {
    why: "Individual participation is the principle that grants a data subject the right to obtain confirmation that an organisation holds data about them and to have that data communicated in an intelligible form within a reasonable time. A patient asking a portal for their own medical records is exercising exactly that right, and the portal exists to satisfy it.",
    wrong: {
      A: "Purpose specification obliges the organisation to state why data is being collected, no later than the moment of collection. It governs what the hospital must announce up front, and the records in question were collected long before this request.",
      B: "Collection limitation constrains how much data is gathered and by what means. It operates at intake; by the time a patient asks for a copy, the data already exists and the collection question is settled.",
      C: "The near-miss, because handing over records is literally a use of them. Use limitation restricts the organisation from disclosing or using data for purposes other than those specified — it is a constraint the organisation applies to its own onward use, typically toward third parties. Access by the person the data is about is a separate enumerated right, not an exception carved out of use limitation.",
    },
    concept:
      "The eight OECD principles that underpin the Code of Fair Information Practices sort cleanly if you ask who is acting and on what. The organisation constrains its own intake (collection limitation), states its reason (purpose specification), confines onward use to that reason (use limitation), keeps the data accurate and current (data quality), and protects it (security safeguards). The organisation faces outward with openness about its practices, and answers for all of it under accountability. Exactly one principle is triggered by the data subject rather than the organisation: individual participation. Identifying who initiates the action resolves most questions in this family in a single step.",
    trap: "Use limitation attracts the reader who is thinking about the disclosure itself, since releasing records is plainly a use of data. The discriminator is direction — when the subject initiates and the subject is the recipient, the principle is individual participation regardless of what the organisation has to do to comply.",
    refs: [
      { label: "OECD Privacy Guidelines (OECD/LEGAL/0188)", url: "https://legalinstruments.oecd.org/en/instruments/OECD-LEGAL-0188" },
      { label: "NIST Privacy Framework", url: "https://www.nist.gov/privacy-framework" },
    ],
    visual: {
      kind: "compare",
      caption: "The eight principles, sorted by who acts and on what",
      items: [
        { label: "Individual participation", body: "The subject acts. Right to know whether data about you is held, to obtain it in an intelligible form, and to challenge it and have it corrected or erased. The only principle the data subject triggers.", tone: "good" },
        { label: "Collection limitation", body: "Constrains intake. Data should be obtained by lawful and fair means, limited in amount, and where appropriate with the subject's knowledge or consent." },
        { label: "Purpose specification", body: "Constrains the reason. The purpose must be stated no later than collection, and later use confined to it or to purposes not incompatible with it." },
        { label: "Use limitation", body: "Constrains onward use. No disclosure or use beyond the specified purpose except with consent or under legal authority. The common near-miss for subject-access questions." },
        { label: "Data quality", body: "Constrains the state of the data. Relevant to its purpose, and accurate, complete, and kept up to date." },
        { label: "Security safeguards", body: "Constrains exposure. Reasonable protection against loss, unauthorised access, destruction, use, modification, or disclosure." },
        { label: "Openness", body: "Faces outward. General transparency about practices, policies, and the identity and location of the data controller. Transparency about the programme, not about one record." },
        { label: "Accountability", body: "Governs the rest. The data controller is answerable for complying with measures that give effect to all the other principles." },
      ],
    },
  },

  "cissp-45": {
    why: "The requester has no current relationship with the organisation, and the security professional is not the owner of the policy and therefore has no authority to decide its distribution. Routing the request through official channels puts the decision with the accountable owner, creates a record that the request was made, and protects the professional from having personally authorised a disclosure.",
    wrong: {
      A: "Letting someone read the screen is a disclosure. The control attaches to the information, not to the transport — an unauthorised person who has read the confidential content has received it just as completely as if it had been emailed, and now there is no record that it happened.",
      B: "Prior employment conferred access while the relationship lasted; it does not survive termination. Familiarity with a document is not authorisation to hold a copy of it, and the leaver has no continuing need to know.",
      C: "This is the near-miss, and it appeals to security-minded readers because silence does prevent the disclosure. What it fails is the professional obligation: a former employee asking for a confidential document is a plausible social-engineering or reconnaissance attempt, and ignoring it means nobody in the organisation learns that the approach was made. Preventing the bad outcome in this instance is not the same as discharging the duty, and it leaves the next colleague to face the same request cold.",
    },
    concept:
      "Any disclosure request resolves against two questions asked in order: is the requester authorised, and am I the person authorised to make that determination? Even when the first answer is obviously no, the professional's action is to escalate to the information owner rather than adjudicate personally, because personal adjudication scales badly and leaves no audit trail. This family of questions consistently rewards the option that routes to the accountable party and reports the event, and consistently punishes both unilateral helpfulness and unilateral silence. The ethical dimension is the same one the (ISC)² code expresses as acting honourably and protecting the profession — which includes reporting attempts against it.",
    trap: "Option C is the trap for candidates who have learned that the safe answer is to refuse. Refusing and reporting are different acts, and the exam separates them deliberately. The reading habit to correct is treating 'did no harm' as equivalent to 'did the right thing' — the stem asks for the BEST response, and a response that leaves the organisation blind to a possible attack is not it.",
    refs: [
      { label: "NIST SP 800-53 Rev.5 — Security and Privacy Controls", url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final" },
      { label: "CISA — Insider Threat Mitigation", url: "https://www.cisa.gov/topics/physical-security/insider-threat-mitigation" },
    ],
  },

  "cissp-46": {
    why: "Black box testing exercises a system from the outside with no knowledge of its internals, which means it needs something complete enough to run and to expose its real external interfaces. Once the source is final the build reflects what will actually ship, so findings describe the delivered product rather than code paths that are still being rewritten.",
    wrong: {
      A: "Non-functional characteristics such as performance and resilience can be observed from outside, so this is not absurd. Compliance in particular is usually assessed against design documentation, configuration, and evidence of process — material a black box tester is by definition denied. This option also describes what you are checking, not when to check it.",
      B: "Enumerating known vulnerabilities across an infrastructure estate is vulnerability scanning: broad, signature-driven, and continuous. The stem is scoped to a single new software product, and an audit of that product answers a different question from a sweep of the environment it will live in.",
      D: "Testing after an incident is reactive, and the activity it describes is incident response and forensic analysis. A pre-release assurance audit that only ever happens after something has already gone wrong has failed at its purpose.",
    },
    concept:
      "Two axes govern every software testing question. The first is tester knowledge: black box sees only external interfaces and reproduces an attacker's view, white box has full source and design and can reason about paths no external input will easily reach, grey box sits between. The second is lifecycle position: static analysis and code review run continuously during development because they need code and not a running system, while dynamic and black box testing need a complete deployable build and therefore cluster before release. Knowledge determines what a technique can find; lifecycle position determines what it costs to fix what it finds. A design flaw discovered by black box testing at the end is the most expensive defect in software engineering, which is why black box testing complements earlier techniques rather than replacing them.",
    trap: "Three of the four options are true statements about testing, so the question feels like it has several defensible answers. Look at the grammar: the stem asks WHEN, and options A, B, and D all answer why or what. An option that answers a different question than the one asked is wrong no matter how accurate it is, and spotting that mismatch is faster than weighing the security content.",
    refs: [
      { label: "NIST SP 800-115 — Technical Guide to Information Security Testing", url: "https://csrc.nist.gov/pubs/sp/800/115/final" },
      { label: "OWASP Application Security Verification Standard", url: "https://owasp.org/www-project-application-security-verification-standard/" },
    ],
  },

  "cissp-47": {
    why: "A code signature makes an assertion to a relying party about who published the software, and the certificate must therefore be bound to an identity that party can meaningfully trust and hold responsible. That is the legal entity producing the software: it persists across staff changes, it carries the contractual and legal accountability, and it is the name a user sees in the publisher field.",
    wrong: {
      B: "Quality control verifies that a build meets its requirements and signs off internally. That sign-off is a gate in the process, not a cryptographic assertion to the outside world, and a QA group has no standing as the publisher of record.",
      C: "The near-miss, and what many teams do informally. Binding the signing key to a person makes the trust anchor a career: the individual leaves, the certificate is revoked, and every artefact signed with it is called into question unless timestamping was handled correctly. It also tells the relying party nothing useful, since they have no basis to trust one named engineer. Signing belongs to a controlled release process, not to whoever compiled the binary.",
      D: "The data owner is accountable for classifying information and deciding who may access it. That role has no relationship to producing executables or attesting to their provenance, so this option applies a governance term from a different domain.",
    },
    concept:
      "Code signing delivers two properties and it is worth keeping them separate. Integrity comes from the hash — the artefact has not changed since signing. Authenticity and non-repudiation come from the private key being bound, through a certificate, to an identity — this specific publisher produced it. The second property is only as valuable as the durability and accountability of that identity, which is why it is the organisation rather than a person. Practically this means the signing key lives in an HSM, signing happens in the release pipeline rather than on developer machines, the operation is logged and requires more than one person, and signatures are timestamped so they survive certificate expiry. Signing is an attestation about origin; it makes no claim that the code is free of defects.",
    trap: "Option C pulls because developers write the code, so signing it feels like a natural extension of authorship. Separate writing from publishing. The signature answers the relying party's question — who stands behind this — and no individual contributor is the answer to that.",
    refs: [
      { label: "NIST SP 800-218 — Secure Software Development Framework", url: "https://csrc.nist.gov/pubs/sp/800/218/final" },
      { label: "NIST SP 800-57 Part 1 Rev.5 — Key Management", url: "https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final" },
    ],
  },

  "cissp-48": {
    why: "RASP instruments the application runtime, so it observes the operation the application is actually about to perform — the SQL statement about to reach the driver, the object about to be deserialised, the path about to be opened. Because it sits inside the process with that context, it can block the specific call in flight rather than guessing from the shape of the request, which is both the monitoring and the dynamic response the stem asks for.",
    wrong: {
      A: "Field-level tokenisation substitutes sensitive values with surrogates so that a breach of the application store yields tokens rather than data. It is a static, preventive data-protection measure that behaves identically whether or not an attack is under way — no observation, no response.",
      B: "The near-miss, and the word 'dynamic' is exactly why. A scanner does actively probe a running application, but it operates out of band on its own schedule and reports findings to a human afterwards. It has no position in the request path and therefore no ability to interrupt anything. Detection without response is precisely half of what the stem requires.",
      D: "SAML is an XML assertion format for conveying authentication and authorisation statements between an identity provider and a service provider. It carries identity claims; it has no visibility into application behaviour and no enforcement role against attacks.",
    },
    concept:
      "Place web application defences on two axes: where they sit relative to the request, and whether they can act. At the edge a WAF sees HTTP only and must infer intent from patterns, which makes it deployable in front of anything but prone to false positives and to bypass by encoding. Inside the process RASP sees the interpreter's actual action, which yields far higher precision at the cost of language-specific instrumentation and runtime overhead. Out of band, SAST reads code and DAST probes a deployment; both find weaknesses and neither stops attacks. In the code itself, parameterised queries and output encoding remove the vulnerability rather than defending it. The exam distinguishes finding a weakness from stopping an attack — 'respond', 'block', and 'in real time' point to controls in the request path.",
    trap: "Option B collects votes because scanners feel active and because DAST is literally called dynamic analysis. The pull is a vocabulary collision rather than a conceptual one. Anchor on the verb 'respond': a report is not a response, and only a control sitting in the path of the request can be one.",
    refs: [
      { label: "OWASP Top 10", url: "https://owasp.org/Top10/" },
      { label: "NIST SP 800-115 — Technical Guide to Information Security Testing", url: "https://csrc.nist.gov/pubs/sp/800/115/final" },
    ],
    visual: {
      kind: "compare",
      caption: "Web application defences by position and by whether they can act",
      items: [
        { label: "RASP", body: "Inside the runtime. Sees the actual operation with full application context and can block that call in-process. Highest precision, needs language support and costs some performance.", tone: "good" },
        { label: "WAF", body: "At the network edge. Sees HTTP requests and infers intent from signatures and anomaly rules. Protects anything without code changes, but lacks context and can be evaded by encoding tricks." },
        { label: "DAST scanner", body: "Out of band against a running deployment. Probes for weaknesses and reports them. Genuinely dynamic, genuinely useful, and completely unable to interrupt a live attack.", tone: "warn" },
        { label: "SAST and code review", body: "Against source, before deployment. Finds flaws with full visibility of paths that are hard to reach from outside. No runtime presence at all." },
        { label: "Tokenisation", body: "In the data layer. Replaces sensitive values with surrogates so a compromise yields nothing useful. Preventive and static — it reduces the value of a breach rather than detecting one." },
      ],
    },
  },

  "cissp-49": {
    why: "A buffer overflow only becomes an exploit when the attacker can redirect execution to an address they chose — injected shellcode, or a useful fragment of existing code. ASLR randomises the base addresses of the stack, heap, and loaded libraries at each execution, so those addresses are not knowable in advance. The memory corruption may still occur, but the attacker cannot reliably aim it, and the exploit degrades into a crash. It is applied by the operating system to every process without touching source code, which is the efficiency the stem asks about.",
    wrong: {
      A: "Access control decides which subjects may reach which objects. An overflow happens inside a process that is already running with rights the user legitimately holds, so no access control boundary is crossed and none is consulted — the attacker gains control of a program that was already permitted to do what it does.",
      B: "The near-miss and the most defensible alternative, because process isolation is genuinely part of this defence stack and does bound the damage by preventing one process from reading or writing another's memory. It engages after the exploit has already succeeded within the vulnerable process, which is exactly where control is seized. Containing the consequence is not preventing the attack.",
      D: "Processor states — supervisor versus problem state — enforce which instructions may execute at which privilege level, underpinning the ring model and the user/kernel split. Overwriting a return address on a userland stack breaks no such rule, since every instruction involved is one the process was entitled to run.",
    },
    concept:
      "Anti-exploitation controls form a chain, and knowing where each one engages tells you which one a question is really about. Bounds checking and memory-safe languages prevent the overflow. Stack canaries detect corruption before the function returns. NX and DEP make data pages non-executable, which stops injected shellcode and forces the attacker to reuse existing code. ASLR hides where that existing code is, which is why it and DEP are complementary — DEP forces code reuse, ASLR denies the addresses reuse needs. Control-flow integrity validates indirect transfers against legitimate targets. Process isolation and sandboxing contain whatever still succeeds. The genuinely preventive answer is bounds checking, and its absence from the options is why the stem says MOST efficient: among what is offered, ASLR is the systemwide mitigation that requires no change to the vulnerable program.",
    trap: "Process isolation pulls because it is the memory-protection term taught alongside overflows in the same chapter, and both concern memory. Ask what the attacker needs in order to succeed rather than what sounds related — the requirement is a predictable address, and only one option removes it. Note also that this question is filed under identity and access management in the source bank, which is a mislabel; treat it as architecture and engineering.",
    refs: [
      { label: "CWE-787 — Out-of-bounds Write", url: "https://cwe.mitre.org/data/definitions/787.html" },
      { label: "NIST SP 800-53 Rev.5 — Security and Privacy Controls", url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final" },
    ],
    visual: {
      kind: "ladder",
      caption: "Where each control engages, from before the overflow to after the compromise",
      rungs: [
        { label: "Bounds checking and memory-safe languages", body: "Prevents the overflow entirely by refusing the out-of-range write. The only true fix, and the one not offered in this question — which is what the qualifier MOST efficient is quietly signalling." },
        { label: "Stack canaries", body: "Detects. A known value is placed before the saved return address and checked on return; if it changed, the process aborts. Defeated by overwrites that skip the canary or corrupt other structures." },
        { label: "NX / DEP", body: "Denies execution of data pages, so injected shellcode will not run. Forces the attacker to reuse code already marked executable, which is what gave rise to return-oriented programming." },
        { label: "ASLR", body: "Denies knowledge of where anything is. Randomises stack, heap, and library base addresses per execution so reused code cannot be located. Pairs with DEP: one forces reuse, the other hides the targets." },
        { label: "Control-flow integrity", body: "Validates that indirect calls and returns land on legitimate targets, cutting off the chaining that ROP depends on even when addresses leak." },
        { label: "Process isolation and sandboxing", body: "Contains. Accepts that the process may fall and limits what the attacker inherits. Last in the chain and the reason it is the wrong answer here." },
      ],
    },
  },

  "cissp-50": {
    why: "The account existed for almost a full quarter before anyone noticed, so the defect is detection latency rather than a missing rule or a missing record. An alert tied to a high-risk event — creation of a privileged account — fires within minutes of that event and collapses the exposure window from roughly ninety days to the time it takes someone to read a notification. Making it risk-based is what keeps the alert readable, since alerting on every account change reproduces the original problem in a different form.",
    wrong: {
      A: "Bi-annual review runs twice a year against the current quarterly cadence, so this lengthens the maximum exposure window from about ninety days to about a hundred and eighty. It moves the metric the stem is complaining about in the wrong direction.",
      B: "Policy states who may create privileged accounts and under what approval. It is a necessary administrative foundation and it may well already exist here — the account was created in violation of something. Writing the rule down does not tell anyone that the rule was broken, and the gap in this scenario is detection.",
      D: "The near-miss, and the most tempting option for a security-minded reader. The creation event was almost certainly recorded already, since the reviewers could tell the account was made one hour after the previous review. Raising verbosity adds volume to a record nobody was watching; it improves the evidence available after discovery without making discovery any faster. A log with no trigger attached to it is not a detective control.",
    },
    concept:
      "When a question describes something found late, decide first whether the failure was prevention, detection, or response, then choose the control that shortens the specific interval described. Periodic reviews are detective controls whose latency equals the review period, so their worst case is always the full cycle. Continuous monitoring with event-driven alerting drives latency toward real time, and risk-based tuning is what makes that sustainable — alert on the small set of events that would matter regardless of context, and review the rest in batch. Logging is a prerequisite for both and is not itself detection: recording, detecting, and responding are three separate capabilities, and questions in this family usually turn on the reader collapsing the first two.",
    trap: "Option D is the pull, because logging is the reflexive answer to any question about missed activity and the scenario is plainly log-adjacent. The distinction the question is built on is between recording an event and being told about it. Option A catches anyone who reads bi-annual as more frequent than quarterly rather than less.",
    refs: [
      { label: "NIST SP 800-137 — Information Security Continuous Monitoring", url: "https://csrc.nist.gov/pubs/sp/800/137/final" },
      { label: "NIST SP 800-53 Rev.5 — Security and Privacy Controls", url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final" },
    ],
    visual: {
      kind: "timeline",
      caption: "Controls positioned by when they engage relative to the event",
      event: "Privileged account created",
      points: [
        { at: 10, label: "Access policy", body: "Before the event, and administrative. Defines who may create privileged accounts. Shapes intent and establishes that a violation occurred, but generates no signal and stops nobody who ignores it.", tone: "warn" },
        { at: 30, label: "Approval workflow", body: "Before the event, and preventive. Requires a second party to authorise creation so the account cannot exist without a record. Not among the options, but this is the control that would remove the event rather than shorten the window.", tone: "neutral" },
        { at: 60, label: "Risk-based alert", body: "Minutes after. Privileged account creation is a high-risk trigger, so someone is notified while the account is hours old. This is the option that attacks the interval the stem describes.", tone: "good" },
        { at: 78, label: "Raised logging level", body: "No fixed latency, because it adds no trigger. The event was already recorded — that is how the reviewers reconstructed the timing. More verbosity means more to search once you already know to look.", tone: "warn" },
        { at: 96, label: "Quarterly review", body: "Up to ninety days after. The control that failed, and it failed by design rather than by malfunction: its latency is a full quarter. Moving to bi-annual doubles that to a hundred and eighty days.", tone: "bad" },
      ],
    },
  },

  "cissp-51": {
    why: "Discovery is the phase where each side must locate and produce records relevant to the case. Without a destruction policy the organisation has two problems at once: it must search and produce whatever it happened to retain, which may be years of data it had no business reason to keep, and it cannot demonstrate that anything now missing was destroyed under a routine, consistently applied schedule rather than to frustrate the proceeding.",
    wrong: {
      A: "Sentencing follows a determination of guilt and concerns the penalty. Records practices might colour a court's view of the organisation at the margins, but the exposure created by the missing policy has already fully materialised by then.",
      B: "The near-miss. Evidence is presented and its admissibility argued at trial, and a spoliation dispute can certainly surface there — but it surfaces as a consequence of what did or did not happen during discovery. By the time a matter reaches trial the documentary record is largely fixed, so the policy's impact is felt earlier.",
      D: "Arraignment is the formal reading of charges and the entry of a plea. It is procedural, brief, and involves no exchange or examination of documents at all.",
    },
    concept:
      "A retention and destruction policy does two distinct jobs, and both are cashed in at discovery. It limits how much you must search and produce, because data destroyed on schedule is data you do not have to review. And it gives you a defensible, routine explanation for absence, because destruction that follows a consistently applied policy is ordinary business practice rather than evidence of concealment. The essential companion is the legal hold: once litigation is reasonably anticipated, routine destruction must stop for anything potentially relevant, and failing to suspend it converts a good policy into spoliation. A policy that is written but not followed is worse than none, because inconsistency is exactly what an opposing party will point to.",
    trap: "Trial is what people picture when they hear 'legal proceeding', so option B takes most of the votes that do not go to the key. The question is testing whether you know the phases and what happens in each. Discovery is where documents actually move, and any question about records, retention, or e-discovery obligations lands there.",
    refs: [
      { label: "United States Courts — Criminal Cases", url: "https://www.uscourts.gov/about-federal-courts/types-cases/criminal-cases" },
      { label: "NIST SP 800-88 Rev.1 — Guidelines for Media Sanitization", url: "https://csrc.nist.gov/pubs/sp/800/88/r1/final" },
    ],
    visual: {
      kind: "steps",
      caption: "Phases of a criminal proceeding, and where records practice bites",
      steps: [
        { label: "Charging and arrest", body: "The state initiates. Nothing is demanded of the organisation's records yet, but the duty to preserve attaches as soon as litigation is reasonably anticipated — which can be earlier than this." },
        { label: "Arraignment", body: "Charges are read and a plea entered. Procedural and short. No documents are exchanged, which is why it cannot be the answer here." },
        { label: "Discovery", body: "Each side identifies, preserves, collects, and produces relevant records. Absence of a destruction policy costs you twice: an unbounded volume to search, and no defensible account of what is missing and why." },
        { label: "Trial", body: "Evidence is presented and contested. Spoliation arguments and adverse inference instructions surface here, but they are consequences of discovery failures rather than fresh ones." },
        { label: "Sentencing", body: "Penalty is determined after guilt is established. Conduct during discovery can influence the court's view, by which point the records exposure is long since realised." },
      ],
    },
  },

  "cissp-52": {
    why: "Access is granted because some business function cannot be performed without it. A stated business need is the only justification that can be evaluated by someone inside the organisation, documented, scoped to particular systems, bounded in time, and revoked when the need ends. Every subsequent control over that third party's access derives its boundaries from it.",
    wrong: {
      A: "A contract records the terms under which access is exercised — permitted use, security obligations, liability, right to audit. It is the vehicle that formalises a decision already made, and a signed contract granting access that nothing requires is still unjustified access.",
      B: "The near-miss, since a supplier request does start the conversation in practice. Treating the request as the justification inverts the control: the party that benefits from the access would be defining whether the access is warranted. A request is an input to the decision, never the basis for it.",
      D: "A vendor demonstration establishes that the product works and that the supplier is competent. Capability is not need — a service can perform flawlessly and still be something the organisation has no requirement to connect to its network.",
    },
    concept:
      "Authorisation decisions run in a fixed chain: articulated business need, then least privilege scoped to that need, then defined duration, then monitoring, then review, then revocation. The first link has to be owned by someone inside the organisation, because every later link takes its boundaries from it — you cannot apply least privilege without knowing what the access is for, and you cannot know when to revoke without knowing what would end the need. Third-party access adds obligations on top: the need should be tied to a named service in the contract, the connection should be monitored and separately identifiable, and termination should be tested rather than assumed. The ordering does not change, and the exam tests the ordering.",
    trap: "Contract negotiation pulls because third-party risk questions frequently key to contractual controls, and it reads as the governance-literate answer. The stem asks for the explanation that justifies granting access, not the instrument that records it. Distinguish the reason from the paperwork that follows the reason.",
    refs: [
      { label: "NIST SP 800-161 Rev.1 — C-SCRM Practices", url: "https://csrc.nist.gov/pubs/sp/800/161/r1/final" },
      { label: "NIST SP 800-53 Rev.5 — Security and Privacy Controls", url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final" },
    ],
  },

  "cissp-53": {
    why: "The collection limitation principle has two clauses. It limits the amount of personal data collected, and it requires that whatever is collected be obtained by lawful and fair means and, where appropriate, with the knowledge or consent of the data subject. The stem quotes the second clause almost word for word, so it is testing recognition of the principle that governs the manner of acquisition.",
    wrong: {
      B: "Openness requires a general policy of transparency about developments, practices, and policies concerning personal data, including who the controller is and how to reach them. It concerns what the organisation publishes about itself, not how any particular record was acquired.",
      C: "The near-miss, because purpose specification also attaches to the moment of collection — the purpose must be stated no later than that point. The difference is what each constrains: purpose specification governs why the data is being collected and what it may later be used for, while the stem describes how it was obtained. Adjacency in time is not sameness of subject.",
      D: "Data quality requires personal data to be relevant to the purpose for which it is used, and accurate, complete, and kept up to date. It describes the condition the data must be in, which is a property of the record rather than of the act of acquiring it.",
    },
    concept:
      "For every one of the eight principles, ask what it constrains, and the family becomes mechanical. Collection limitation constrains the manner and the amount of intake. Purpose specification constrains the stated reason and fixes it in time. Use limitation constrains disclosure and onward use against that reason. Data quality constrains the state of the record. Security safeguards constrain exposure. Openness constrains what must be published about practices. Individual participation is the subject's right of access and correction. Accountability places responsibility for all of it on the controller. The distinguishing word in this stem is 'means' — a question about how data was obtained is always collection limitation, and a question about why it was obtained is always purpose specification.",
    trap: "Purpose specification collects the votes because both principles live at the collection moment and candidates remember them as a pair. Read for the noun the stem is qualifying: 'means' is method, and method belongs to collection limitation's second clause. Question 44 in this bank tests a different principle from the same eight, so learn the set rather than any single member.",
    refs: [
      { label: "OECD Privacy Guidelines (OECD/LEGAL/0188)", url: "https://legalinstruments.oecd.org/en/instruments/OECD-LEGAL-0188" },
      { label: "NIST SP 800-122 — Guide to Protecting the Confidentiality of PII", url: "https://csrc.nist.gov/pubs/sp/800/122/final" },
    ],
  },

  "cissp-54": {
    why: "A labelling procedure has to specify how a label is applied and how it survives handling, and that differs entirely by medium — a tape cartridge takes an adhesive label and a header record, a disk image takes metadata, a document takes a header and footer, a removable drive takes an etched or printed marking. Categorising the media in use is the prerequisite that makes a labelling procedure specifiable at all, because until you know what you are marking you cannot write the instruction for marking it.",
    wrong: {
      B: "The near-miss, and a genuinely valuable control. A media inventory tracks what exists and where it is, which is how you detect loss. It consumes labels rather than defining them: the inventory presupposes that media are already identifiable, so it sits downstream of the procedure the stem is asking about.",
      C: "Reviewing off-site storage access controls protects media once it has been classified, labelled, and shipped. It is a handling and storage control, one stage further along the lifecycle, and it says nothing about how the labels themselves are determined.",
      D: "Reviewing audit trails of logging records is a detective control over the integrity of the log, two removes from the question — it checks the records of activity rather than the marking of the assets that activity concerns.",
    },
    concept:
      "The asset security lifecycle runs identify, classify, label or mark, handle, store, retain, and destroy, and each stage presumes the one before it. Classification is the decision about sensitivity and it is made once per information set. Labelling is the expression of that decision on a specific carrier, and because carriers differ the expression has to be defined per media type. Handling rules then key off the label, which is why an unlabelled or inconsistently labelled asset silently escapes every downstream control. Marking for humans and labelling for systems are worth distinguishing: a system enforces on the machine-readable label, while a person acts on the visible marking, and both need to be specified.",
    trap: "Option B attracts readers who look for the most concrete and auditable-sounding control, and inventory logging is taught in the same section. The stem is scoped to the labelling procedure specifically, so the answer must be the thing that procedure depends on rather than a neighbouring control of similar quality.",
    refs: [
      { label: "NIST SP 800-53 Rev.5 — Media Protection (MP) family", url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final" },
      { label: "FIPS 199 — Standards for Security Categorization", url: "https://csrc.nist.gov/pubs/fips/199/final" },
    ],
    disputed: {
      claimed: "B",
      argument:
        "This question is weakly constructed. It asks for the MOST appropriate control for a procedure, which conflates a control with an input to writing one, and none of the four options is straightforwardly a control over labelling. Option B is defensible on the reading that inventory logging is the control most directly applied to labelled media. The keyed answer only holds if you read the stem as asking what a labelling procedure must establish first. Learn the keyed answer, and do not treat this item as evidence about how NIST or ISO structure media controls.",
    },
  },

  "cissp-55": {
    why: "Randomising replaces real values with generated ones that preserve the format and rough statistical shape the test environment needs while having no derivable relationship to the originals. There is no key, no lookup table, and no transformation to invert, so there is nothing an attacker who obtains the test database can do to recover a person. The link between record and individual is severed rather than protected.",
    wrong: {
      A: "The most instructive distractor. Shuffling values between records keeps every original value present in the dataset and merely reattaches it to a different row, so the complete set of real names, real salaries, and real diagnoses is still sitting there. Rows can often be re-linked by correlating unshuffled fields or by matching against outside data, and even without re-linking, the presence of true values about real people can itself be disclosive. This is de-linking, not anonymising.",
      C: "Encoding changes representation without any secret at all — Base64 and hexadecimal are reversible by anyone who recognises them. It offers no protection whatsoever and appears in this family of questions to catch candidates who conflate looking unreadable with being protected.",
      D: "Reversible by design, which is the whole point of encryption. The data remains personal data protected only as strongly as the key, and the key now has to be managed inside a test environment that by definition has weaker controls and broader developer access than production. The obligation follows the data rather than being discharged by the ciphertext.",
    },
    concept:
      "Sort de-identification techniques by who can reverse them and with what. Encoding is reversible by anyone. Encryption and tokenisation are reversible by whoever holds the key or the vault, which makes them pseudonymisation — the data stays personal data and stays in regulatory scope. Masking, shuffling, and generalisation reduce identifiability without necessarily eliminating it, and their weakness is always re-identification by combining quasi-identifiers with external sources. Randomisation and synthetic generation sever the link, which is what anonymisation means and what takes the data out of scope. The operative test is never how unreadable a value looks; it is whether an adversary holding this dataset plus plausible outside knowledge can get back to a person.",
    trap: "Encryption is the reflexive answer to any stem containing the word protect, and it is genuinely the right answer to a different question. Read the goal word: anonymising and securing are opposite intents, since encryption deliberately preserves the ability to recover the original while anonymisation deliberately destroys it. Option A catches the more sophisticated reader who knows shuffling is a recognised technique but has not asked what remains in the dataset afterwards.",
    refs: [
      { label: "NIST SP 800-188 — De-Identifying Government Datasets", url: "https://csrc.nist.gov/pubs/sp/800/188/final" },
      { label: "NISTIR 8053 — De-Identification of Personal Information", url: "https://csrc.nist.gov/pubs/ir/8053/final" },
    ],
  },

  "cissp-56": {
    why: "The event that creates, changes, or ends an identity is an employment event — a hire, a transfer, a promotion, a termination — and human resources owns the authoritative record of those events. The request originates there because that is where the organisation first knows a person exists in a role, and every downstream approval and provisioning action is triggered by that record changing.",
    wrong: {
      A: "Operations runs systems day to day and is a consumer of provisioned access rather than a source of authority over it. It has no authoritative knowledge of who has been hired or of what role they were hired into.",
      B: "Security defines the policy that governs provisioning and audits the results. If security also initiated requests it would be requesting, approving, and reviewing its own work, which collapses the separation the process exists to maintain.",
      D: "The near-miss, and the reason most people miss this. IT performs the provisioning — it creates the account and grants the entitlements — but executing the last step is not initiating the process. IT must act on an authorised request rather than being the origin of that authorisation, or there is no separation of duties and no record of why access was granted.",
    },
    concept:
      "Identity lifecycle management is driven by an authoritative source, normally the HR system, feeding an IAM platform that provisions and deprovisions in target systems. Keep the four roles distinct: HR is the authoritative source of the employment event, the manager or data owner approves the specific entitlements, IT or the IAM system provisions, and security audits the outcome. The joiner, mover, and leaver events differ in difficulty — joiners are easy because someone is motivated to chase them, movers are the usual source of privilege accumulation because old access is rarely removed when someone changes role, and leavers are the highest risk because nothing in the business chases a departed employee's account. HR-driven automated deprovisioning exists precisely because the leaver signal is the one that most often fails to arrive.",
    trap: "Option D pulls because provisioning is visibly IT's work and the stem lists provisioning among the steps. The operative verb is 'initiates'. Trace the chain back to the event that authorises everything downstream rather than stopping at the team that performs the most visible action.",
    refs: [
      { label: "NIST SP 800-53 Rev.5 — Account Management (AC-2) and Personnel Security (PS)", url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final" },
      { label: "NIST SP 800-63-3 — Digital Identity Guidelines", url: "https://csrc.nist.gov/pubs/sp/800/63/3/final" },
    ],
  },

  "cissp-57": {
    why: "A security management programme has to direct finite effort at what the organisation is actually trying to achieve, and it needs a basis for saying one thing matters more than another. Starting from business processes supplies that basis: each process has an owner, a tolerance for disruption, and a measurable impact if it stops, so every control traced back to a process inherits a defensible priority and a budget argument expressed in terms executives already accept.",
    wrong: {
      A: "A controls-driven assessment measures conformance against a catalogue. It is efficient, highly repeatable, and exactly right for an audit — and it can certify a programme as fully compliant while the controls sit on systems that do not matter and the crown jewels go unaddressed. Conformance is not the same as protection, and at programme-scoping time you have no catalogue-independent way to know which controls deserve emphasis.",
      C: "The strongest alternative and genuinely rigorous, which is what makes it the near-miss. Its weakness for designing a programme is that an inventory carries no inherent priority — without process context there is no way to say which server matters, so asset-driven work tends to rank by technical attributes such as exposure or patch level and treat business significance as an afterthought. It is the right method one level down, inside a scope that has already been set.",
      D: "Narrower again, and valuable for privacy, classification, and data protection work specifically. Scoping a whole programme to one asset class omits the process dependencies that are not data at all — people with irreplaceable knowledge, facilities, suppliers, and the sequencing between processes.",
    },
    concept:
      "Risk assessments differ by what you enumerate first, and that starting point determines what you are structurally unable to see. Threat-driven starts from adversaries and capabilities. Asset-driven starts from what you own. Control-driven starts from a framework. Process or business-driven starts from what the organisation does. Only the last produces priority as a by-product, because impact is defined in business terms from the outset. Match the method to the altitude of the question: programme scoping and strategy call for the business view, while a specific system authorisation or a technical assessment is better served by asset and threat views. NIST expresses the same hierarchy as three tiers — organisation, mission and business process, and information system — with direction set at the upper tiers and detail supplied at the lower.",
    trap: "Asset-driven pulls hard because most training material presents it as the standard method, and it is not wrong — it is at the wrong altitude for this stem. The context words are 'scope' and 'Security Management Program', both of which signal programme design rather than an individual assessment. When a question sets the scene at organisational level, prefer the option framed in business terms.",
    refs: [
      { label: "NIST SP 800-39 — Managing Information Security Risk", url: "https://csrc.nist.gov/pubs/sp/800/39/final" },
      { label: "NIST SP 800-30 Rev.1 — Guide for Conducting Risk Assessments", url: "https://csrc.nist.gov/pubs/sp/800/30/r1/final" },
    ],
  },

  "cissp-58": {
    why: "Threat modelling is performed at design time against a representation of the system rather than a running instance, which is what allows it to be done by designers on something that does not exist yet. The team decomposes the design, draws trust boundaries, and enumerates what could go wrong at each element and each crossing — producing the security concerns rather than checking a system against concerns already known.",
    wrong: {
      B: "The near-miss, and deliberately worded broadly enough to sound as though it covers design review. A review evaluates an artefact that already exists against expectations someone brought to it, which makes it a verification activity dependent on the reviewer already knowing what to look for. Threat modelling is what generates that list in the first place, and the two are complementary rather than interchangeable.",
      C: "Source code review requires code, so by definition it happens after the design decisions are settled. It is effective at finding implementation defects and structurally incapable of finding design flaws — a flawed trust boundary survives a perfect line-by-line review because every line correctly implements the flawed design.",
      D: "Penetration testing needs a running system and takes an attacker's outside view, which places it late in the lifecycle. Its findings are real and its timing is the problem: a design flaw surfaced by a penetration test arrives at the point where remediation is most expensive and most likely to be deferred.",
    },
    concept:
      "Security activities map onto lifecycle phases, and only the early ones can catch design flaws. Requirements and abuse cases, then threat modelling and secure design, then secure coding and static analysis, then code review, then dynamic testing, then penetration testing, then production monitoring. Threat modelling answers four questions in order: what are we building, what can go wrong, what are we going to do about it, and did we do a good job — with structured enumerations such as STRIDE supplying the second. The distinction the exam returns to repeatedly is flaw versus bug. A bug is an implementation error in code and is found by review and testing. A flaw is an error in the design itself, it cannot be found by examining code that faithfully implements it, and roughly half of real-world security defects are of this kind. Threat modelling is the activity aimed at flaws.",
    trap: "Option B is the pull precisely because 'manual inspections and reviews' is vague enough that a candidate can talk themselves into it covering design walkthroughs. Two words in the stem settle it: 'designers' and 'potential'. Both point to something that has not been built, and you cannot inspect what does not yet exist.",
    refs: [
      { label: "OWASP — Threat Modeling", url: "https://owasp.org/www-community/Threat_Modeling" },
      { label: "NIST SP 800-218 — Secure Software Development Framework", url: "https://csrc.nist.gov/pubs/sp/800/218/final" },
    ],
  },

  "cissp-59": {
    why: "Commercial off-the-shelf software arrives configured for successful installation rather than for secure operation — sample content, default accounts and passwords, every optional feature enabled, verbose error output, permissive file permissions. The buying organisation cannot change the code, so configuration is the one part of the product it fully controls, and hardening it removes that inherited exposure before the application is ever reachable.",
    wrong: {
      A: "The strongest alternative and a genuine part of any COTS deployment, which is what makes it the near-miss. Segmentation is a containment control: it accepts that the application is exposed and works to bound the consequences of its compromise. It leaves the default accounts and unnecessary services exactly as the vendor shipped them, so the thing most likely to be exploited is untouched.",
      B: "Application denylisting enumerates known-bad executables and blocks them, which is a host control over what may run rather than anything about the deployed product's own configuration. Denylists also fail against anything not already enumerated, which is most of what matters.",
      C: "Allowlisting is the substantially stronger of the two listing approaches and does limit what an attacker can execute after gaining a foothold. It still governs the host's execution policy rather than the product's attack surface — the COTS application is on the allowlist by design, so it runs, defaults and all, and the control never engages against the path the attacker actually uses.",
    },
    concept:
      "With third-party software you lose the ability to fix the code, so your control set shifts to everything surrounding and configuring it. Order those controls by how directly each reduces the product's own attack surface: hardening removes exposure that exists by default, patching closes disclosed holes on the vendor's schedule, least privilege for the service account limits what a compromise yields, segmentation limits where it spreads, and monitoring shortens how long it goes unnoticed. Add the supply-chain layer — vendor assessment, integrity verification of the package, and a plan for what happens when support ends. When a stem attributes the risk specifically to the software being off-the-shelf, it is pointing at the property that it was configured by someone whose priority was making it install cleanly.",
    trap: "Options A and C both pull, segmentation because it is the reflexive architectural answer and allowlisting because it is well regarded and recently emphasised. Both are real controls and both would appear in a good deployment. Neither addresses the specific attribute of COTS that the stem names, which is that it arrives carrying somebody else's configuration decisions.",
    refs: [
      { label: "NIST SP 800-70 Rev.4 — National Checklist Program", url: "https://csrc.nist.gov/pubs/sp/800/70/r4/final" },
      { label: "NIST SP 800-53 Rev.5 — Configuration Management (CM-6, CM-7)", url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final" },
    ],
  },

  "cissp-60": {
    why: "Centralisation means a single authority issues and holds identifiers and credentials for a trust domain, and every relying service defers to it instead of maintaining its own store. A service provider that depends on a trusted third party for both the identifier and the credential has given up local identity management entirely, which is the defining structural feature the question is after.",
    wrong: {
      A: "A service provider acting as its own identity and credential provider is the decentralised or siloed model — each application holds its own user store. It is the arrangement centralisation exists to replace, and it produces duplicate accounts, inconsistent password policy, and orphaned access at termination.",
      B: "Identifying an entity by behaviour analysis rather than a presented factor describes behavioural biometrics or continuous authentication. That is a technique for deciding whether someone is who they claim, operating inside whatever architecture is in place, and it answers a different question from where identity is administered.",
      C: "The best distractor. Agreeing to integrate identity recognition across organisational boundaries is federation, and it resembles centralisation because a relying party accepts an assertion produced elsewhere. The difference is that federation distributes trust across multiple authorities in separate organisations that agree to honour each other's assertions, with no single authority over the whole arrangement. Centralisation has exactly one authority within one trust domain.",
    },
    concept:
      "Three architectures sit on an axis defined by where authority lives. Decentralised or siloed puts an authority in every application: simplest to build, worst for the user, and the reason deprovisioning fails. Centralised puts one authority over a trust domain: consistent policy, one place to disable an account, and a single point of failure and of attack that has to be defended accordingly. Federated puts several authorities in different domains into mutual trust relationships, carrying assertions over SAML or OpenID Connect, which enables cross-organisation access without anyone surrendering their user store. Keep single sign-on separate from all three — it is an experience the user has, delivered by a centralised or federated architecture, and not an architecture in itself. The phrase 'across organizational boundaries' means federation every time it appears.",
    trap: "Option C pulls because federation is the more modern and more discussed idea, and both options involve trusting an identity assertion produced by someone else. The discriminator is the number of authorities and whether they sit inside one organisation. Read for boundary language: crossing organisations is federation, and one trusted third party serving relying services within a domain is centralisation.",
    refs: [
      { label: "NIST SP 800-63-3 — Digital Identity Guidelines", url: "https://csrc.nist.gov/pubs/sp/800/63/3/final" },
      { label: "NIST SP 800-63C — Federation and Assertions", url: "https://csrc.nist.gov/pubs/sp/800/63/c/upd2/final" },
    ],
    visual: {
      kind: "compare",
      caption: "Where does identity authority live?",
      items: [
        { label: "Decentralised / siloed", body: "Every application is its own authority with its own user store. Nothing to integrate and nothing to coordinate, at the cost of duplicate accounts, inconsistent policy, and leavers who keep access nobody remembers." },
        { label: "Centralised", body: "One authority for the whole trust domain issues identifiers and credentials; services defer to it. Consistent policy and one place to disable an account — and one place whose compromise reaches everything.", tone: "good" },
        { label: "Federated", body: "Several authorities in separate organisations agree to trust each other's assertions, carried by SAML or OIDC. Enables cross-organisation access without sharing a user store. Trust is mutual and distributed, not singular." },
        { label: "Single sign-on", body: "Not an architecture. An experience — authenticate once, reach many services — delivered on top of a centralised or federated design. Listing it alongside the other three is a common way to muddle this family of questions." },
      ],
    },
  },
};

