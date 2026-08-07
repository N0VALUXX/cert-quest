import type { Enrichment } from "../../types";

export const batch1: Record<string, Enrichment> = {
  "cissp-1": {
    why: "A BIA inventories the tangible things a business process needs in order to run. Off-site supplies at a remote facility are owned by the organization, have a location, and would have to be replaced or relocated after a disruption — that is exactly what a physical asset is.",
    wrong: {
      A: "Staff personal belongings are not organizational assets. The company neither owns them nor depends on them to deliver a process, so they never appear in a BIA inventory.",
      B: "Revenues are a financial line item, not a physical asset. DR revenue figures might feed the impact calculation, but the question asks what counts as a physical asset.",
      C: "Cloud-based applications are intangible, and the underlying hardware belongs to the provider. They are assets, but logical ones — the distinction the question is testing.",
    },
    concept:
      "A BIA identifies critical processes, then works backwards to everything those processes depend on: people, physical assets, logical assets, and third parties. Physical means tangible and owned — buildings, equipment, inventory, supplies. Ownership plus tangibility is the test, not location.",
    trap: "Cloud applications feel like the modern, sophisticated answer, and exam-takers reach for it because it sounds current. But the qualifier is 'physical'. When a question narrows the category with an adjective, that adjective is the whole question.",
    refs: [
      { label: "NIST SP 800-34 Rev.1 — Contingency Planning", url: "https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final" },
      { label: "Ready.gov — Business Impact Analysis", url: "https://www.ready.gov/business-impact-analysis" },
    ],
  },

  "cissp-2": {
    why: "An audit trail that does not capture enough detail is worthless no matter how well it is stored, monitored, or investigated. If the records cannot answer who did what, to which object, when, and from where, every downstream process built on them fails. Sufficiency of content is therefore the first thing to assess.",
    wrong: {
      A: "Investigation procedures matter, but they operate on the audit data. You cannot write a useful procedure against records that lack the necessary fields.",
      C: "Storage capacity is a real concern and causes log loss, but it is a availability problem layered on top of content. Plenty of storage full of useless entries assesses out as a failed audit capability.",
      D: "Audit failure response is a contingency control. It handles the exception case, not the routine adequacy of the capability being assessed.",
    },
    concept:
      "Audit capability is assessed in a rough dependency order: content sufficiency, then protection and integrity of the records, then retention and capacity, then review and response. Each later item presumes the earlier one. NIST's AU control family is organised along the same lines — AU-3 (content of audit records) precedes AU-4 (storage capacity) and AU-5 (response to audit processing failures).",
    trap: "All four options are genuinely part of a mature audit programme, so the question is really about ordering, not membership. When every option is defensible, find the one the others depend on.",
    refs: [
      { label: "NIST SP 800-53 Rev.5 — AU control family", url: "https://csrc.nist.gov/projects/risk-management/sp800-53-controls/release-search#!/controls?version=5.1&family=AU" },
      { label: "NIST SP 800-92 — Log Management", url: "https://csrc.nist.gov/pubs/sp/800/92/final" },
    ],
    visual: {
      kind: "ladder",
      caption: "Assessing an audit capability, in dependency order",
      rungs: [
        { label: "Content sufficiency (AU-3)", body: "Does each record capture what happened, when, where, the source, the outcome, and the identity involved? Everything else depends on this." },
        { label: "Integrity and protection (AU-9)", body: "Can the records be altered or deleted by the people they would incriminate? Unprotected logs are not evidence." },
        { label: "Storage capacity (AU-4)", body: "Is there enough space, and what happens when it fills? This is where silent log loss usually begins." },
        { label: "Failure response (AU-5)", body: "When audit logging breaks, does the system alert, shut down, or carry on blind? This is the contingency case." },
        { label: "Review and reporting (AU-6)", body: "Someone or something has to actually read the records and act on them, or the whole chain was theatre." },
      ],
    },
  },

  "cissp-3": {
    why: "RBAC assigns permissions to roles, then assigns users to roles. When many people share the same job responsibilities, you define the role once and every new hire in that job inherits the whole permission set by being placed in it. That is precisely the simplification the question describes.",
    wrong: {
      B: "DAC lets each resource owner grant access at their own discretion. That is the opposite of simplification — permissions sprawl per-object and per-owner, and nothing is reusable across users.",
      C: "Content-dependent access control decides based on what is inside the data, such as hiding a salary column. It filters within a resource; it does not organise permissions across a workforce.",
      D: "Rule-based access control applies global conditions like time-of-day or source address to everyone. Useful, but the rules are not tied to job responsibility, so it does not solve 'many users with similar jobs'.",
    },
    concept:
      "Access control models differ by what the access decision is bound to. DAC binds to owner discretion, MAC binds to clearance and classification labels, RBAC binds to job function, rule-based binds to environmental conditions, and ABAC binds to arbitrary attributes of subject, object, and context. Match the phrase in the stem to the binding.",
    trap: "Rule-based and role-based abbreviate similarly and are deliberately placed together. Read for the word 'job responsibilities' — that phrase maps to role every time.",
    refs: [
      { label: "NIST — Role Based Access Control", url: "https://csrc.nist.gov/projects/role-based-access-control" },
      { label: "NIST SP 800-162 — ABAC Guide", url: "https://csrc.nist.gov/pubs/sp/800/162/upd2/final" },
    ],
    visual: {
      kind: "compare",
      caption: "What the access decision is bound to",
      items: [
        { label: "RBAC", body: "Bound to job function. Permissions attach to a role; users inherit by holding the role. Scales cleanly when many people share a job.", tone: "good" },
        { label: "DAC", body: "Bound to owner discretion. Whoever owns the object decides who gets in. Flexible, but permissions sprawl and are hard to audit." },
        { label: "MAC", body: "Bound to labels. The system compares subject clearance against object classification and the user cannot override it. Used where secrecy is mandatory." },
        { label: "Rule-based", body: "Bound to conditions. Time of day, source IP, device posture — applied uniformly regardless of who you are." },
        { label: "ABAC", body: "Bound to attributes. Combines subject, object, action, and environment attributes in a policy expression. The most expressive and the most complex." },
      ],
    },
  },

  "cissp-4": {
    why: "Criminal law is territorial. A single cybercrime routinely involves an attacker in one country, infrastructure in several more, and victims worldwide, so it is genuinely unclear which state's law applies and which court can hear it. That ambiguity precedes and causes the other enforcement problems.",
    wrong: {
      B: "Staffing shortages are real and slow investigations down, but they are a resourcing constraint. Give an agency unlimited staff and the jurisdictional question is still unresolved.",
      C: "Extradition treaties are enforced. The harder problem is that extradition requires agreeing whose law was broken and where — a jurisdictional question again — and many treaties require dual criminality.",
      D: "Language barriers are a friction in international cooperation, not the primary legal obstacle. Translation is a solvable operational problem.",
    },
    concept:
      "Jurisdiction has three strands you should be able to separate: personal jurisdiction (authority over the person), subject-matter jurisdiction (authority over the type of case), and territorial jurisdiction (authority over the place). Cybercrime stresses all three at once because the act, the actor, the instrument, and the harm can each sit in a different country.",
    trap: "The distractors are all true statements about cybercrime enforcement. PRIMARY is the operative word — it asks for the root cause, and every other option is downstream of, or minor compared to, jurisdiction.",
    refs: [
      { label: "Council of Europe — Budapest Convention on Cybercrime", url: "https://www.coe.int/en/web/cybercrime/the-budapest-convention" },
      { label: "US DOJ — Computer Crime and Intellectual Property Section", url: "https://www.justice.gov/criminal/criminal-ccips" },
    ],
  },

  "cissp-5": {
    why: "WPA2-Enterprise uses 802.1X with EAP to authenticate each user against a RADIUS server before granting network access, and EAP methods such as EAP-TLS or PEAP establish the per-user keying material. That per-user authentication and keying is the higher assurance the question refers to.",
    wrong: {
      B: "IPsec secures IP-layer traffic between endpoints or gateways. It can run over a wireless link but is not part of the WPA2 standard.",
      C: "SSL (and its successor TLS) secures application sessions. TLS appears inside some EAP methods, but SSL itself is not the protocol WPA2 uses for network access control.",
      D: "SSH secures remote administrative sessions. It has no role in wireless association or key establishment.",
    },
    concept:
      "WPA2 has two modes. Personal (PSK) shares one passphrase across everyone, so any holder can derive keys and there is no individual accountability. Enterprise uses 802.1X/EAP so each user authenticates separately, gets unique keys, and can be revoked individually. WPA2 also replaced TKIP with CCMP/AES for confidentiality and integrity.",
    trap: "All four options are legitimate security protocols, which makes them feel interchangeable. Anchor on the layer and purpose: the question is about wireless network access, and EAP is the only option that operates there.",
    refs: [
      { label: "Wi-Fi Alliance — Security", url: "https://www.wi-fi.org/discover-wi-fi/security" },
      { label: "RFC 3748 — Extensible Authentication Protocol", url: "https://www.rfc-editor.org/rfc/rfc3748" },
    ],
  },

  "cissp-6": {
    why: "The security kernel is the concrete implementation — the hardware, firmware, and software elements of the TCB that actually sit between the hardware, the OS, and everything else, mediating every access. It is the part that provides the interfaces the question describes.",
    wrong: {
      A: "The reference monitor is the abstract concept: the rule that all access must be mediated, tamper-proof, and verifiable. It is a design requirement, not a part of an OS.",
      B: "The TCB is the total set of protection mechanisms in the system. It is broader than the component being described — the security kernel is the subset of the TCB that enforces the reference monitor.",
      C: "Time separation is one isolation technique, where processes share a resource at different times. It is a method, not a structural part of the OS.",
    },
    concept:
      "Hold three terms apart. The reference monitor is the abstract requirement. The security kernel is the implementation of that requirement. The TCB is everything in the system trusted to enforce policy, which includes the security kernel plus other protected components. Concept, implementation, scope.",
    trap: "Reference monitor is the most familiar phrase and reads like the obvious answer. The stem asks which 'part of an operating system' — a part is a real component, and an abstract concept is not a part.",
    refs: [
      { label: "NIST CSRC Glossary — Security Kernel", url: "https://csrc.nist.gov/glossary/term/security_kernel" },
      { label: "NIST CSRC Glossary — Trusted Computing Base", url: "https://csrc.nist.gov/glossary/term/trusted_computing_base" },
    ],
    visual: {
      kind: "nested",
      caption: "Concept, implementation, scope — indented by containment",
      layers: [
        { label: "Reference monitor (abstract concept)", body: "The requirement that every access by a subject to an object is mediated. It must be always invoked, tamper-proof, and small enough to be verified. This is a specification, not code." },
        { label: "Trusted Computing Base (total scope)", body: "Everything in the system — hardware, firmware, software — trusted to enforce the security policy. Break anything in the TCB and the policy fails." },
        { label: "Security kernel (the implementation)", body: "The subset of the TCB that actually implements the reference monitor concept, sitting between hardware, OS, and the rest of the system. This is the answer." },
      ],
    },
  },

  "cissp-7": {
    why: "Risk management is the whole lifecycle — framing, assessing, responding, and monitoring — and the response stage is where cost of controls is deliberately weighed against mission benefit. Balancing protection cost against capability gain is a management decision, not an analytical one.",
    wrong: {
      A: "Performance testing measures whether a system meets throughput and responsiveness targets. It has nothing to do with weighing control costs.",
      B: "Risk assessment identifies and analyses risk to produce a ranked picture. It informs the trade-off but does not make it — assessment tells you the magnitude, management decides what to spend.",
      C: "A security audit checks conformity against a standard or policy at a point in time. It reports gaps rather than balancing investment.",
    },
    concept:
      "Risk assessment is a phase inside risk management. Assessment answers 'how bad and how likely'. Management adds the decision layer: accept, mitigate, transfer, or avoid — and that is where cost-versus-benefit lives. Any question about deciding, balancing, or choosing points to management.",
    trap: "Risk assessment is the tempting near-miss because the words appear together constantly. The verb in the stem is 'facilitates the balance', which is deciding, not measuring.",
    refs: [
      { label: "NIST SP 800-39 — Managing Information Security Risk", url: "https://csrc.nist.gov/pubs/sp/800/39/final" },
      { label: "NIST SP 800-30 Rev.1 — Guide for Conducting Risk Assessments", url: "https://csrc.nist.gov/pubs/sp/800/30/r1/final" },
    ],
    visual: {
      kind: "steps",
      caption: "Risk management lifecycle — assessment is one phase of four",
      steps: [
        { label: "Frame", body: "Establish the context: risk tolerance, assumptions, constraints, and priorities. This sets the boundaries every later decision operates within." },
        { label: "Assess", body: "Identify threats, vulnerabilities, likelihood, and impact to produce a ranked picture of risk. This is risk assessment — it measures, it does not decide." },
        { label: "Respond", body: "Choose and implement a response: accept, mitigate, transfer, or avoid. This is where cost of controls is balanced against mission capability. The question lands here." },
        { label: "Monitor", body: "Track control effectiveness and changes in the environment, then feed findings back into framing and assessment." },
      ],
    },
  },

  "cissp-8": {
    why: "In federated identity the organization that holds the employment relationship authenticates its own users and asserts their identity to others. The clothing retailer employs the staff, so it is the identity provider; the partner businesses consume that assertion as service providers and grant access to their own resources.",
    wrong: {
      A: "User Self Service is a password-reset and profile-management function, not a federation role. The rest of the flow is right, which is what makes this the strongest distractor.",
      C: "This reverses the roles. The retailer would be relying on partners to authenticate its own employees, which inverts who holds the authoritative identity record.",
      D: "Access Control Provider is not a role in any federation standard, and the option describes confirming 'access' rather than identity — the IdP asserts who you are, not what you may do.",
    },
    concept:
      "Federation splits authentication from authorization across trust boundaries. The IdP holds the authoritative account, authenticates the user, and issues a signed assertion. The SP trusts that assertion and makes its own authorization decision. SAML, OIDC, and WS-Federation all implement this same split.",
    trap: "Three options share nearly identical wording and differ only in the role names, so skimming guarantees an error. Find who employs the user — that organization is always the IdP.",
    refs: [
      { label: "OASIS SAML 2.0 Technical Overview", url: "https://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html" },
      { label: "NIST SP 800-63C — Federation and Assertions", url: "https://pages.nist.gov/800-63-3/sp800-63c.html" },
    ],
    visual: {
      kind: "steps",
      caption: "Federated access — who does what",
      steps: [
        { label: "User requests", body: "An employee of the clothing retailer tries to reach an application hosted by a partner business." },
        { label: "SP redirects", body: "The partner (service provider) does not hold this user's account, so it redirects the browser to the user's home identity provider." },
        { label: "IdP authenticates", body: "The clothing retailer — the identity provider — authenticates its own employee against its own directory. This is the role the question is asking for." },
        { label: "Assertion issued", body: "The IdP issues a signed assertion stating who the user is, using an industry standard such as SAML or OIDC." },
        { label: "SP authorizes", body: "The partner validates the signature, trusts the identity, and applies its own authorization rules to decide what the user may do." },
      ],
    },
  },

  "cissp-9": {
    why: "Least privilege means every entity gets only the access required for its function and nothing more. A network segment that has no business reason to reach the internet should not be able to, so keeping it private is least privilege applied to network reachability.",
    wrong: {
      A: "Concentrating core functions in a single administrator account is the opposite of least privilege — it is a maximum-privilege account, and it also destroys separation of duties.",
      B: "Inspecting all traffic in both directions is monitoring and detection. It observes activity without restricting what any entity is permitted to do.",
      C: "Keeping routing tables current is a network availability and correctness concern. It ensures reachability rather than restricting it.",
    },
    concept:
      "Least privilege applies to more than user accounts. It governs service accounts, API scopes, container capabilities, security-group rules, and network reachability. In cloud environments the network expression of it is default-deny egress and segmentation, so resources can only reach what they demonstrably need.",
    trap: "Option A names an administrator and sounds like restriction because it says 'a single' account. Restricting the number of privileged people is not the same as restricting the privileges held — read for what the entity can do, not how many entities there are.",
    refs: [
      { label: "NIST CSRC Glossary — Least Privilege", url: "https://csrc.nist.gov/glossary/term/least_privilege" },
      { label: "NIST SP 800-207 — Zero Trust Architecture", url: "https://csrc.nist.gov/pubs/sp/800/207/final" },
    ],
  },

  "cissp-10": {
    why: "Deduplication finds identical blocks or files and stores a single copy with pointers to it. The problem stated is specifically redundant data, so removing the duplication addresses the cause directly and reclaims the most space.",
    wrong: {
      A: "Compression shrinks data by re-encoding it, which helps, but it still stores every redundant copy — just in smaller form. It treats the symptom rather than the redundancy.",
      B: "Caching keeps hot data on faster media to improve performance. It consumes additional capacity rather than freeing it.",
      C: "Replication deliberately creates more copies for availability. Applied to this problem it would accelerate the exhaustion.",
    },
    concept:
      "Storage efficiency techniques answer different problems: deduplication removes redundant copies, compression reduces the encoded size of what remains, thin provisioning defers allocation, and tiering moves cold data to cheaper media. Match the technique to the stated cause, and note that dedup and compression are complementary rather than competing.",
    trap: "Compression is the reflexive answer for any 'running out of space' question and is genuinely useful, so it feels safe. The stem specifies redundant data, which names the cause and therefore names the technique.",
    refs: [
      { label: "SNIA — Data Deduplication", url: "https://www.snia.org/education/what-is-data-deduplication" },
      { label: "NIST CSRC Glossary — Data Deduplication", url: "https://csrc.nist.gov/glossary/term/data_deduplication" },
    ],
  },

  "cissp-11": {
    why: "MPLS attaches a label at the ingress router, and that label determines the pre-established label-switched path through the network. Downstream routers forward on the label alone without performing their own route lookup, which is exactly the behaviour described.",
    wrong: {
      A: "SONET is a physical-layer optical transport standard using synchronous time-division multiplexing. It carries traffic over fibre rings and makes no packet forwarding decisions.",
      C: "FCoE encapsulates Fibre Channel storage traffic inside Ethernet frames within a data centre. It is a storage transport, not a WAN path-selection technology.",
      D: "SIP is an application-layer signalling protocol that sets up and tears down voice and video sessions. It negotiates calls, not network paths.",
    },
    concept:
      "MPLS operates between layer 2 and layer 3, which is why it is often called layer 2.5. The ingress Label Edge Router classifies the packet into a Forwarding Equivalence Class and pushes a label; Label Switch Routers swap labels along a predetermined path; the egress router pops the label and delivers. The benefit is deterministic paths and traffic engineering, not encryption — MPLS provides no confidentiality on its own.",
    trap: "It is easy to assume MPLS is secure because it is called a private WAN. Separation is logical, not cryptographic, so sensitive traffic over MPLS still needs its own encryption.",
    refs: [
      { label: "RFC 3031 — Multiprotocol Label Switching Architecture", url: "https://www.rfc-editor.org/rfc/rfc3031" },
      { label: "Cloudflare — What is MPLS?", url: "https://www.cloudflare.com/learning/network-layer/what-is-mpls/" },
    ],
  },

  "cissp-12": {
    why: "A file integrity checker hashes files in a known-good state and re-hashes them later, comparing results. Any modification changes the hash, so it detects changes to content itself — including changes an attacker made no log entry for.",
    wrong: {
      B: "A SIEM aggregates and correlates events from many sources. It can alert on a reported change, but it depends on something else noticing and reporting that change first.",
      C: "Audit logs record actions that the system chose to log. An attacker with sufficient privilege can modify content and clear or forge the log, leaving no trace of the change.",
      D: "An IDS inspects network traffic or host activity for attack patterns. It looks for the intrusion rather than verifying whether stored content still matches its baseline.",
    },
    concept:
      "Integrity verification is a distinct control from detection and logging. It works by comparing a current cryptographic hash against a trusted baseline, which means it can prove content has not changed rather than merely reporting that nobody was seen changing it. Tripwire, AIDE, and OSSEC are the classic implementations.",
    trap: "Audit logs sound authoritative and are the intuitive answer for 'unauthorized changes'. The weakness is that logs are testimony about events, while a hash comparison is evidence about the object — and the stem stresses unauthorized, meaning the attacker actively avoids leaving testimony.",
    refs: [
      { label: "NIST SP 800-92 — Log Management", url: "https://csrc.nist.gov/pubs/sp/800/92/final" },
      { label: "NIST CSRC Glossary — Integrity", url: "https://csrc.nist.gov/glossary/term/integrity" },
    ],
  },

  "cissp-13": {
    why: "UAT before implementation is a formal gate in change management: the change is validated against business requirements in a controlled environment, and approval to proceed depends on the result. It sits inside the change process and controls whether the change advances.",
    wrong: {
      A: "The review is inverted. A business owner performs business acceptance; technical review is performed by technical staff. The role and the activity do not match.",
      C: "A cost-benefit analysis belongs before the change is approved, so it can inform the decision. Performing it after implementation cannot influence an outcome that already happened.",
      D: "Business continuity testing exercises recovery capability. It is its own discipline running on its own schedule, not a step within a change request.",
    },
    concept:
      "A change management flow runs: request, impact and risk assessment, approval, testing including UAT, implementation with a rollback plan, verification, and closure with documentation. Distinguish it from configuration management, which tracks and baselines what the components actually are, and from release management, which packages and deploys.",
    trap: "Option A pairs a plausible activity with the wrong actor, which is a common construction. Read the subject of the sentence as carefully as the verb — swapping who performs an activity is enough to make an option wrong.",
    refs: [
      { label: "NIST SP 800-128 — Security-Focused Configuration Management", url: "https://csrc.nist.gov/pubs/sp/800/128/upd1/final" },
      { label: "ITIL — Change Enablement overview (Axelos)", url: "https://www.axelos.com/certifications/itil-service-management" },
    ],
  },

  "cissp-14": {
    why: "A single-pass overwrite renders data unrecoverable on modern drives while leaving the drive fully functional, so the vendor pays the higher working-drive price. It satisfies both constraints in the stem at once.",
    wrong: {
      A: "Pinning is not a data sanitization method. It refers to fixing something in place, such as certificate pinning, and has no role here.",
      C: "Multi-pass wipes are also secure and preserve function, but they provide no additional protection over a single pass on modern drives while taking far longer. Given two options that both work, the excess passes are unjustified cost.",
      D: "Degaussing destroys the servo tracks and permanently disables the drive, so the vendor would pay the lower non-functional price. It also does nothing at all to SSDs, which have no magnetic domains.",
    },
    concept:
      "NIST SP 800-88 defines three levels. Clear overwrites with logical techniques and keeps the media usable. Purge applies stronger methods such as cryptographic erase or block erase and usually keeps the media usable. Destroy physically ruins the media. Reuse questions want Clear or Purge; disposal questions want Destroy. The old multi-pass folklore comes from 1990s drive densities and no longer applies.",
    trap: "Multi-pass feels more secure because more sounds safer, and degaussing feels most thorough. Both ignore the second requirement in the stem — the vendor pays more for a working drive, so any method that destroys the drive loses money for no security gain.",
    refs: [
      { label: "NIST SP 800-88 Rev.1 — Guidelines for Media Sanitization", url: "https://csrc.nist.gov/pubs/sp/800/88/r1/final" },
    ],
    visual: {
      kind: "compare",
      caption: "NIST SP 800-88 sanitization levels against drive resale value",
      items: [
        { label: "Clear — single pass", body: "Logical overwrite of all addressable locations. Data is unrecoverable by standard tools, drive still works, vendor pays full price. Meets both requirements in the question.", tone: "good" },
        { label: "Purge — crypto erase", body: "Destroys the encryption key so ciphertext is unrecoverable, or uses ATA Secure Erase. Fast, thorough, and the drive remains functional. Also a strong answer where offered.", tone: "good" },
        { label: "Multi-pass overwrite", body: "Repeated overwrites. No measurable benefit over a single pass on drives made this century, and it takes many times longer. Secure, but wasteful.", tone: "warn" },
        { label: "Degauss", body: "Magnetic field wipes the platters and the factory servo tracks with them. The drive is permanently dead — and it has no effect whatsoever on SSDs.", tone: "bad" },
        { label: "Destroy — shred or incinerate", body: "Physical destruction. The most certain option and the correct one for disposal, but the drive has no resale value at all.", tone: "bad" },
      ],
    },
  },

  "cissp-15": {
    why: "SOC 2 covers the Trust Services Criteria, which include security, availability, processing integrity, confidentiality, and privacy — the right subject matter for a vendor handling company data. Type 2 tests whether those controls actually operated effectively across a period, typically six to twelve months, rather than merely existing on one day.",
    wrong: {
      A: "SOC 1 addresses controls relevant to a client's internal control over financial reporting. Correct format, wrong subject — it does not speak to data handling.",
      B: "SOC 2 Type 1 has the right subject matter but only attests to the design of controls at a single point in time. It cannot tell you whether the controls worked.",
      D: "SOC 3 covers the same criteria as SOC 2 but is a short public marketing summary without the detailed testing results. It is designed for general distribution, not vendor assessment.",
    },
    concept:
      "Read a SOC report as two independent axes. The number is subject matter: 1 is financial reporting controls, 2 is Trust Services Criteria, 3 is a public summary of 2. The type is rigour: Type 1 is design at a point in time, Type 2 is operating effectiveness over a period. For any due diligence question, you want 2 and you want Type 2.",
    trap: "Type 1 and Type 2 look like version numbers, so people assume higher means newer rather than more rigorous. They are different tests, and Type 1 is a snapshot that a vendor can pass by having good documentation on one lucky day.",
    refs: [
      { label: "AICPA — SOC 2 Report", url: "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2" },
      { label: "AICPA — SOC for Service Organizations", url: "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-for-service-organizations" },
    ],
    visual: {
      kind: "matrix",
      caption: "Pick a cell — subject matter across the top, rigour down the side",
      cols: ["SOC 1", "SOC 2", "SOC 3"],
      rows: ["Type 1", "Type 2"],
      cells: {
        "Type 1|SOC 1": { title: "Financial, snapshot", body: "Design of controls over financial reporting, at a single point in time. Wrong subject matter for data handling and the weaker rigour.", tone: "bad" },
        "Type 1|SOC 2": { title: "Trust criteria, snapshot", body: "Right subject matter — security, availability, processing integrity, confidentiality, privacy — but only attests that controls were designed suitably on one date.", tone: "warn" },
        "Type 1|SOC 3": { title: "Public summary", body: "A general-use summary. No detailed testing, no control descriptions you can assess. Marketing collateral.", tone: "bad" },
        "Type 2|SOC 1": { title: "Financial, over time", body: "Operating effectiveness of financial reporting controls across a period. Rigorous, but still the wrong subject matter for a data-handling vendor.", tone: "warn" },
        "Type 2|SOC 2": { title: "Trust criteria, over time", body: "Right subject matter and right rigour: controls tested for operating effectiveness across six to twelve months. This is the answer, and the report you should ask any vendor for.", tone: "good" },
        "Type 2|SOC 3": { title: "Public summary", body: "SOC 3 has no meaningful Type distinction in practice — it is a distilled public version of the SOC 2 result with the testing detail stripped out.", tone: "bad" },
      },
    },
  },

  "cissp-16": {
    why: "P2P file sharing pulls executable content from untrusted anonymous peers, bypasses perimeter inspection through encryption and port hopping, and users deliberately run what they download. That combination makes it the classic high-risk malware vector on a corporate network.",
    wrong: {
      A: "Instant messaging carries real risk, particularly through links and file transfer, but volume and content originate from known contacts far more often than from anonymous strangers.",
      C: "Email is the most common initial access vector in the real world, which makes this a strong distractor. It is also universally deployed and heavily filtered rather than being classed as a high-risk application to be blocked outright.",
      D: "End-to-end applications is not a recognised application risk category. The phrase describes encryption topology, not an application type.",
    },
    concept:
      "Application risk assessment weighs the trustworthiness of the content source, whether the content executes, how well the traffic can be inspected, and whether the application evades controls. P2P scores badly on all four, which is why acceptable use policies almost always prohibit it outright rather than filtering it.",
    trap: "Email is defensible and many people pick it, since phishing dominates breach statistics. The stem asks which application type is considered high risk as a category — email is a required business function that gets filtered, whereas P2P is normally banned.",
    refs: [
      { label: "CISA — Risks of File-Sharing Technology", url: "https://www.cisa.gov/news-events/news/risks-file-sharing-technology" },
    ],
  },

  "cissp-17": {
    why: "The keyed answer follows a reference architecture in which tier 1 is the device or asset layer where individual endpoints, including mobile devices, are enumerated and tracked.",
    wrong: {
      A: "Tier 0 in most tiered reference models denotes the highest-trust control plane rather than a general asset inventory layer.",
      C: "Tier 2 typically aggregates or manages, sitting above the level where individual devices are recorded.",
      D: "Tier 3 sits further up still, at the business or mission layer, well away from device-level tracking.",
    },
    concept:
      "Tiered reference architectures organise assets by layer of abstraction, from physical devices at the bottom through management and aggregation to business processes at the top. Asset management questions usually want the layer where the individual thing is enumerated.",
    trap: "This question is poorly anchored — it never names which reference architecture it means, and the tier numbering differs between NIST, Purdue, and vendor models. Note the answer and move on rather than trying to derive it.",
    refs: [
      { label: "NIST IR 8011 Vol.2 — Automation Support for Hardware Asset Management", url: "https://csrc.nist.gov/pubs/ir/8011/v2/final" },
    ],
    disputed: {
      claimed: "D",
      argument:
        "A substantial share of test-takers argue for tier 3, and the community vote splits roughly 42/29 between B and D. Because the stem never identifies which reference architecture it refers to, neither answer can be derived from first principles. This is a weak question — learn the keyed answer for the exam, but do not build any mental model on it.",
    },
  },

  "cissp-18": {
    why: "Monitoring and enforcing adherence to policy is the only option that governs all the others. Policy determines which data is protected, which controls apply, and who may access it, and enforcement is what makes any technical control actually hold over time.",
    wrong: {
      A: "Encryption is a strong and necessary control, but it protects a subset of exposure paths. It does nothing against an authorised user misusing legitimate access, and unenforced key management undermines it.",
      C: "MFA and separation of duties are excellent access controls, again covering one category of risk. They do not address data classification, retention, or handling.",
      D: "A DMZ with proxies and bastion hosts is a perimeter architecture. It defends one boundary and does nothing for insider activity, cloud data, or endpoints.",
    },
    concept:
      "BEST questions that offer one governance option against several technical options are usually testing whether you understand that administrative controls direct technical ones. Policy defines the requirement, technical controls implement it, and monitoring plus enforcement closes the loop. Without the loop, controls drift.",
    trap: "The technical options are concrete and satisfying, and encryption in particular feels like the strongest possible answer. Concreteness is the trap — each technical control covers one slice, while the governance option covers the whole estate.",
    refs: [
      { label: "NIST SP 800-53 Rev.5 — Security and Privacy Controls", url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final" },
      { label: "ISO/IEC 27001 — Information Security Management", url: "https://www.iso.org/standard/27001" },
    ],
  },

  "cissp-19": {
    why: "HR owns the authoritative record of the employment lifecycle. HR knows first when someone is hired, changes role, or leaves, so HR events should be what triggers provisioning and deprovisioning — IT then executes on that trigger.",
    wrong: {
      A: "Training delivers onboarding education. It has no authoritative knowledge of employment status changes.",
      B: "Internal audit independently verifies that provisioning worked correctly. Having audit initiate the changes it later reviews would destroy that independence.",
      D: "IT performs the technical account work, but it does not know that someone resigned until it is told. Making IT the initiator means accounts linger after departure — the classic orphaned-account finding.",
    },
    concept:
      "Separate initiation from execution. HR is the authoritative source and the trigger; IT is the executor; audit is the independent verifier. Mature identity programmes automate this by driving the IAM system directly from the HR system of record, so a termination in HR immediately disables access.",
    trap: "IT is the intuitive answer because IT visibly creates the accounts. The verb is 'initiate', not 'perform' — and the entire orphaned-account problem exists precisely because organisations let IT wait to be told.",
    refs: [
      { label: "NIST SP 800-63B — Authentication and Lifecycle Management", url: "https://pages.nist.gov/800-63-3/sp800-63b.html" },
      { label: "NIST SP 800-53 Rev.5 — AC-2 Account Management", url: "https://csrc.nist.gov/projects/risk-management/sp800-53-controls/release-search#!/control?version=5.1&number=AC-2" },
    ],
  },

  "cissp-20": {
    why: "A mantrap is a two-door vestibule where the second door cannot open until the first has closed and the single occupant has authenticated. Allowing exactly one authenticated person through at a time is what defeats piggybacking and tailgating.",
    wrong: {
      A: "Controlling traffic flow is a side effect of any access-controlled entry point, not the reason a mantrap specifically is chosen over a simple badge reader.",
      B: "Air flow control describes an airlock or a cleanroom vestibule. Similar physical construction, entirely different purpose.",
      D: "Preventing rapid movement is a consequence of the design rather than its objective. A turnstile also slows people down without stopping tailgating.",
    },
    concept:
      "Physical access controls map to specific defeat techniques. Mantraps stop tailgating and piggybacking, turnstiles slow and channel flow, bollards stop vehicles, and guards handle judgement calls. Note the distinction the exam sometimes draws: piggybacking implies the authorised person knowingly lets someone follow, tailgating implies they do not know.",
    trap: "All four options describe something a mantrap genuinely does. PRIMARY purpose asks for the design intent — the reason you would pay for a mantrap instead of a cheaper control that also achieves the side effects.",
    refs: [
      { label: "NIST CSRC Glossary — Mantrap", url: "https://csrc.nist.gov/glossary/term/mantrap" },
      { label: "CISA — Physical Security Performance Goals", url: "https://www.cisa.gov/topics/physical-security" },
    ],
  },
};
