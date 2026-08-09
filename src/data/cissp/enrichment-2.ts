import type { Enrichment } from "../../types";

export const batch2: Record<string, Enrichment> = {
  "cissp-21": {
    why: "Do is the implementation phase. Having established the policy and objectives in Plan, the Do phase puts the business continuity policy, controls, processes, and procedures into operation — which is precisely what the correct option states.",
    wrong: {
      A: "Maintaining and improving the system through corrective action based on management review is the Act phase. Act closes the loop by feeding findings back in.",
      B: "Monitoring and reviewing performance against policy and reporting results to management is the Check phase. Check measures what Do produced.",
      D: "Establishing the policy, objectives, targets, controls, processes and procedures is the Plan phase. Note the verb — establishing is planning, implementing is doing.",
    },
    concept:
      "PDCA drives ISO management systems including ISO 22301 for continuity and ISO 27001 for information security. Plan establishes, Do implements, Check measures and reports, Act corrects and improves. The phase is almost always identifiable from the verb alone.",
    trap: "Plan and Do are separated by a single word: establish versus implement. Option D describes creating the same artefacts that option C deploys, so reading only the nouns will land you on the wrong phase.",
    refs: [
      { label: "ISO 22301 — Business Continuity Management", url: "https://www.iso.org/standard/75106.html" },
      { label: "ISO/IEC 27001 — Information Security Management", url: "https://www.iso.org/standard/27001" },
    ],
    visual: {
      kind: "cycle",
      caption: "Plan-Do-Check-Act — identify the phase by its verb, and note it never ends",
      stages: [
        { label: "Plan — establish", body: "Set the business continuity policy, objectives, targets, controls, processes, and procedures. Nothing is running yet; this is design. Option D lives here." },
        { label: "Do — implement", body: "Put the policy, controls, processes, and procedures into operation. The verb is implement. This is the answer to this question." },
        { label: "Check — monitor and report", body: "Measure performance against the policy and objectives, report results to management, and authorize remediation. Option B lives here." },
        { label: "Act — correct and improve", body: "Take corrective and preventive action based on management review, then feed it back into Plan. Option A lives here." },
      ],
    },
  },

  "cissp-22": {
    why: "The keyed answer is SOC 2 Type 1, which reports on the design of controls against the Trust Services Criteria at a point in time. As a baseline reference describing what controls exist before an assessment begins, the design-level description is what the question is pointing at.",
    wrong: {
      A: "SOC 1 Type 2 covers financial reporting controls tested over a period. Wrong subject matter for data security and business operations.",
      B: "SOC 1 Type 1 is financial reporting controls at a point in time. Again the wrong subject matter.",
      C: "SOC 2 Type 2 has the right subject matter and tests operating effectiveness over a period, which is genuinely the stronger report — see the dispute note below.",
    },
    concept:
      "The two axes stay the same as in question 15: the number is subject matter (1 financial, 2 Trust Services Criteria, 3 public summary) and the type is rigour (1 design at a point in time, 2 operating effectiveness over a period). For vendor due diligence you want SOC 2 Type 2.",
    trap: "This question and question 15 look almost identical but are keyed differently, which is a real inconsistency in the source material rather than a subtlety you are missing.",
    refs: [
      { label: "AICPA — SOC for Service Organizations", url: "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-for-service-organizations" },
      { label: "AICPA — Trust Services Criteria", url: "https://www.aicpa-cima.com/resources/download/2017-trust-services-criteria-with-revised-points-of-focus-2022" },
    ],
    disputed: {
      claimed: "C",
      argument:
        "Most practitioners would answer SOC 2 Type 2, and question 15 in this same bank keys Type 2 for a nearly identical scenario. The defence of Type 1 is that a 'baseline reference' describes the control environment rather than testing it. Learn both: if the stem stresses assessing or relying on a vendor, choose Type 2; only consider Type 1 if it explicitly asks for a point-in-time description of design.",
    },
  },

  "cissp-23": {
    why: "Losing control of network devices gives the attacker the infrastructure itself. From the routers and switches they can reroute, intercept, disable, or persist across the entire network, so every other listed outcome becomes achievable at will. It is the greatest loss of control and therefore the highest risk.",
    wrong: {
      B: "Flooding the network is a denial of service. It costs availability, which is serious, but it is noisy, temporary, and does not give the attacker any lasting control.",
      C: "Disruption of network management communications is damaging because it blinds defenders, but it is a subset of what device compromise achieves.",
      D: "Topology information is reconnaissance. It enables a future attack rather than constituting the damage itself.",
    },
    concept:
      "Rank risk by the loss of capability it represents, not by how dramatic it sounds. Compromise of control-plane infrastructure is consistently the worst case because it converts into confidentiality, integrity, and availability loss simultaneously and enables persistence.",
    trap: "Flooding sounds like the most aggressive attack and topology theft sounds like the most secret one. HIGHEST risk asks about consequence and reach — ask which option contains the others.",
    refs: [
      { label: "CISA — Securing Network Infrastructure Devices", url: "https://www.cisa.gov/news-events/news/securing-network-infrastructure-devices" },
      { label: "NSA — Network Infrastructure Security Guidance", url: "https://media.defense.gov/2022/Jun/15/2003018261/-1/-1/0/CTR_NSA_NETWORK_INFRASTRUCTURE_SECURITY_GUIDANCE_20220615.PDF" },
    ],
  },

  "cissp-24": {
    why: "SOC 1 is defined precisely by the wording in the stem: the service organization describes its system and defines control objectives and controls relevant to user entities' internal control over financial reporting. That phrase is lifted from the SOC 1 definition itself.",
    wrong: {
      A: "SAS 70 was the predecessor standard and was superseded by SSAE 16, then SSAE 18, with SOC 1 as the report name. It is obsolete rather than wrong in spirit.",
      C: "SOC 2 reports against the Trust Services Criteria — security, availability, processing integrity, confidentiality, privacy — not financial reporting.",
      D: "SOC 3 is a public general-use summary of a SOC 2, without detailed control descriptions or test results.",
    },
    concept:
      "SOC 1 exists because a service organization's controls can affect its clients' financial statements — a payroll processor is the classic example. The client's own auditor needs assurance about those controls, so SOC 1 is written for auditors. SOC 2 is written for management, security, and procurement teams.",
    trap: "SAS 70 is the historical distractor and still appears in older material and vendor marketing. If a question offers SAS 70 alongside SOC reports, SAS 70 is almost always the obsolete-term trap.",
    refs: [
      { label: "AICPA — SOC 1 Report", url: "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-1" },
      { label: "AICPA — SOC for Service Organizations", url: "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-for-service-organizations" },
    ],
  },

  "cissp-25": {
    why: "Automated tools testing against current vulnerability signatures give repeatable, broad, consistent coverage of injection and overflow patterns. Both vulnerability classes have well-characterised signatures, which is exactly the case automated scanning handles best.",
    wrong: {
      A: "Scheduled peer review catches design and logic flaws that tools miss, but it is inconsistent, slow, and depends on reviewer attention. It complements automation rather than validating against known patterns.",
      B: "Reusing production code from similar applications propagates whatever vulnerabilities that code already contains. It is a risk, not a validation technique.",
      D: "Updating code editing tools may surface warnings while typing, but an updated IDE is not a validation activity and proves nothing about the finished application.",
    },
    concept:
      "Application security testing splits into SAST which analyses source without running it, DAST which tests the running application from outside, IAST which instruments the running application, and SCA which examines third-party dependencies. Injection and overflow patterns are detectable by SAST and DAST; the word 'validate' points to testing rather than review.",
    trap: "Manual code review is often the right answer for logic and business flaws, so it feels like the more rigorous choice. Here the stem names two specific pattern-based vulnerability classes, and pattern matching is what automation does better than humans.",
    refs: [
      { label: "OWASP Top Ten", url: "https://owasp.org/www-project-top-ten/" },
      { label: "OWASP Web Security Testing Guide", url: "https://owasp.org/www-project-web-security-testing-guide/" },
      { label: "NIST SP 800-218 — Secure Software Development Framework", url: "https://csrc.nist.gov/pubs/sp/800/218/final" },
    ],
  },

  "cissp-26": {
    why: "The (ISC)² Code of Ethics canons are explicitly ordered, and that order resolves conflicts. Public safety and the common good come first, then duties to principals such as employers and clients, then duties to individuals, then duties to the profession.",
    wrong: {
      A: "This places duties to individuals ahead of duties to principals, inverting the second and third positions.",
      B: "This puts duties to the profession third and individuals last, which reverses the bottom two.",
      D: "This elevates duties to the profession to second place, above both principals and individuals.",
    },
    concept:
      "The four canons in order are: protect society, the common good, necessary public trust and confidence, and the infrastructure; act honourably, honestly, justly, responsibly, and legally; provide diligent and competent service to principals; and advance and protect the profession. The ordering is not decorative — when two duties conflict, the higher canon wins.",
    trap: "All four options begin with public safety, so the entire question is decided by positions two through four. Memorise the ordering as a sequence rather than as a set, because every distractor is a permutation of the same items.",
    refs: [
      { label: "(ISC)² Code of Professional Ethics", url: "https://www.isc2.org/Ethics" },
    ],
    visual: {
      kind: "ladder",
      caption: "The four canons — a strict priority order, highest first",
      rungs: [
        { label: "Protect society and the infrastructure", body: "Society, the common good, necessary public trust and confidence, and the infrastructure. When public safety conflicts with anything else, public safety wins outright." },
        { label: "Act honourably and legally", body: "Act honourably, honestly, justly, responsibly, and legally. Note that in the ordering question the exam collapses this into the general framing and focuses on the duty targets." },
        { label: "Duties to principals", body: "Provide diligent and competent service to principals — your employer and your clients. This sits above duties to individuals in the conflict ordering." },
        { label: "Duties to the profession", body: "Advance and protect the profession. Genuinely important, but it is last: you never harm the public to protect the profession's reputation." },
      ],
    },
  },

  "cissp-27": {
    why: "ITIL is the framework of service management processes and is what the question means by a service management process delivering cost reduction, risk mitigation, and improved customer service. It supplies the specific practices rather than the general discipline.",
    wrong: {
      A: "Kanban is a work-visualisation and flow-limiting method drawn from lean manufacturing. It manages work in progress, not IT services end to end.",
      B: "Lean Six Sigma is a process improvement methodology focused on waste and variation. It is applicable to IT but is not an IT service management framework.",
      C: "ITSM is the discipline itself rather than a process or framework, which makes this the strongest distractor — see the note below.",
    },
    concept:
      "ITSM names the discipline of managing IT as a set of services to customers. ITIL is the best-known framework that implements that discipline, with practices covering incident, problem, change, configuration, and service level management. COBIT sits alongside as a governance framework.",
    trap: "ITSM and ITIL are close enough that many people pick ITSM, reasoning that the stem says 'process'. The exam consistently treats ITIL as the answer when it wants the named framework — recognise that this pair will keep reappearing.",
    refs: [
      { label: "Axelos — ITIL", url: "https://www.axelos.com/certifications/itil-service-management" },
      { label: "ISACA — COBIT", url: "https://www.isaca.org/resources/cobit" },
    ],
  },

  "cissp-28": {
    why: "IDaaS is chosen when the organization lacks the staff, skills, or budget to build and run identity infrastructure itself. Shifting operational burden to a provider with dedicated expertise is the legitimate business driver.",
    wrong: {
      B: "Third-party solutions are not inherently more secure. A provider may have more expertise, but the claim as stated is an unjustified assumption and a poor basis for an architecture decision.",
      C: "You can transfer some operational responsibility, but accountability for protecting your data always remains with you. This is one of the most heavily tested points in the cloud domain.",
      D: "In-house development does provide more control, which is an argument against choosing IDaaS. It cannot be the reason for choosing it.",
    },
    concept:
      "Cloud decisions trade control for capability. You can outsource operation but never accountability — the data controller remains answerable to regulators and customers regardless of who runs the servers. Expect at least one question that hinges on this exact distinction.",
    trap: "Option C is designed to catch anyone who half-remembers 'transfer the risk'. Risk transfer through insurance or contract shifts financial consequence; it does not shift legal accountability or reputational damage.",
    refs: [
      { label: "Cloud Security Alliance — Security Guidance v4", url: "https://cloudsecurityalliance.org/research/guidance" },
      { label: "NIST SP 800-144 — Guidelines on Security and Privacy in Public Cloud", url: "https://csrc.nist.gov/pubs/sp/800/144/final" },
    ],
  },

  "cissp-29": {
    why: "The user's browser executed a script served by a compromised site and that script read session cookie data. Script execution in the victim's browser context, stealing data the browser holds, is the definition of cross-site scripting.",
    wrong: {
      A: "SQL injection manipulates database queries on the server. It can extract stored data but does not execute anything in the victim's browser.",
      B: "XXE abuses an XML parser on the server to read local files or reach internal systems. It is also server-side.",
      D: "CSRF makes the victim's browser send an unwanted authenticated request. It rides the session to perform an action but cannot read the response or steal the cookie.",
    },
    concept:
      "The dividing line is where the code runs and what the attacker gains. XSS runs attacker script in the victim's browser and can read what the browser can read, including cookies without HttpOnly and DOM contents. CSRF causes a request the user did not intend but returns nothing to the attacker. Server-side injection classes run on the server against an interpreter.",
    trap: "XSS and CSRF are the most frequently confused pair in the domain. Read for the outcome: information stolen means XSS, action performed means CSRF.",
    refs: [
      { label: "OWASP — Cross Site Scripting (XSS)", url: "https://owasp.org/www-community/attacks/xss/" },
      { label: "OWASP Top Ten", url: "https://owasp.org/www-project-top-ten/" },
    ],
    visual: {
      kind: "compare",
      caption: "The pair you must be able to split instantly",
      items: [
        { label: "XSS — steals", body: "Attacker script executes in the victim's browser under the site's origin. It can read cookies, tokens, and page content, then send them to the attacker. Outcome: information disclosure. Defence: output encoding, Content Security Policy, HttpOnly cookies.", tone: "bad" },
        { label: "CSRF — acts", body: "A crafted link or form makes the victim's browser send an authenticated request the user never intended. The attacker cannot read the response — they only cause the action. Outcome: unwanted state change. Defence: anti-CSRF tokens, SameSite cookies, re-authentication.", tone: "warn" },
        { label: "SQL injection", body: "Untrusted input alters a database query on the server. Runs server-side against the database, not in the browser. Defence: parameterised queries.", tone: "info" },
        { label: "XXE", body: "A crafted XML document makes a server-side parser resolve external entities, reading local files or reaching internal hosts. Also server-side. Defence: disable external entity resolution.", tone: "info" },
      ],
    },
  },

  "cissp-30": {
    why: "A malicious link delivered by social engineering that exploits the victim's existing authenticated session is textbook CSRF. The browser automatically attaches the session cookie to the attacker-crafted request, so the application executes it as the legitimate user.",
    wrong: {
      A: "Clickjacking overlays an invisible frame so the victim clicks something other than what they see. It relies on visual deception on a page rather than a crafted URL exploiting a session.",
      C: "XSS would inject and execute script in the victim's browser to steal data. Here the attack rides the session to perform an action, and nothing is described as being read back.",
      D: "Injection attacks target a server-side interpreter with untrusted input. That is not what a session-riding link does.",
    },
    concept:
      "CSRF works because browsers attach cookies to requests based on destination, not on who initiated them. That ambient authority is the whole vulnerability. The defences accordingly break the automatic attachment or prove intent: SameSite cookie attributes, anti-CSRF tokens, and re-authentication for sensitive actions.",
    trap: "This question and the previous one are a deliberate matched pair testing the same distinction from opposite sides. Anchor on the phrase 'take advantage of a victim's existing session' — riding a session is CSRF.",
    refs: [
      { label: "OWASP — Cross-Site Request Forgery (CSRF)", url: "https://owasp.org/www-community/attacks/csrf" },
      { label: "OWASP — CSRF Prevention Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },

  "cissp-31": {
    why: "Cipher Feedback mode turns a block cipher into a self-synchronising stream cipher. It encrypts the previous ciphertext and XORs the result with plaintext, so data can be processed in units smaller than the block size — stream behaviour from a block primitive.",
    wrong: {
      A: "CBC chains blocks by XORing plaintext with the previous ciphertext block, but it still operates on full blocks and requires padding. It does not produce a stream.",
      B: "ECB encrypts each block independently with no chaining, which is why identical plaintext blocks produce identical ciphertext and structure leaks through. It is the weakest mode and is not a stream cipher.",
      D: "A Feistel cipher is a construction for building block ciphers, used by DES. It is a design pattern, not a mode of operation.",
    },
    concept:
      "Modes of operation determine how a block cipher handles data longer than one block. ECB and CBC are block modes. CFB, OFB, and CTR all produce keystreams and therefore behave as stream ciphers, needing no padding. GCM adds authentication to counter mode and is the modern default.",
    trap: "ECB is so heavily drilled as the wrong-answer mode that people select it reflexively whenever it appears. Here the question is asking a neutral factual question about stream behaviour, and ECB is simply not the answer to it.",
    refs: [
      { label: "NIST SP 800-38A — Block Cipher Modes of Operation", url: "https://csrc.nist.gov/pubs/sp/800/38/a/final" },
      { label: "NIST SP 800-38D — GCM and GMAC", url: "https://csrc.nist.gov/pubs/sp/800/38/d/final" },
    ],
    visual: {
      kind: "compare",
      caption: "Block cipher modes — which ones behave as a stream",
      items: [
        { label: "ECB — block", body: "Each block encrypted independently with the same key. Identical plaintext blocks give identical ciphertext, so patterns survive encryption. Never use it for real data.", tone: "bad" },
        { label: "CBC — block", body: "Each plaintext block is XORed with the previous ciphertext block before encryption. Requires an IV and padding. Errors propagate to the next block.", tone: "info" },
        { label: "CFB — stream", body: "Encrypts the previous ciphertext and XORs with plaintext, producing a self-synchronising stream cipher. Works on units smaller than a block, no padding needed. This is the answer.", tone: "good" },
        { label: "OFB — stream", body: "Generates a keystream independently of the plaintext by repeatedly encrypting the IV. Also stream behaviour; bit errors do not propagate.", tone: "good" },
        { label: "CTR — stream", body: "Encrypts an incrementing counter to produce a keystream. Parallelisable and random-access. GCM builds authentication on top of it.", tone: "good" },
      ],
    },
  },

  "cissp-32": {
    why: "Crisis management is anticipatory. It looks ahead at what could develop, prepares for scenarios that have not yet occurred, and makes decisions under uncertainty before events force them — which is what distinguishes it from the procedural execution of a recovery plan.",
    wrong: {
      A: "Process describes disaster recovery, which follows documented, repeatable procedures. Crisis management is precisely what you need when the process does not cover the situation.",
      C: "Strategic is a plausible-sounding descriptor, but crisis management operates in compressed time on an unfolding event. Strategy sits above it in continuity planning.",
      D: "Wide focus is wrong in the intended contrast — crisis management narrows onto the incident at hand, while business continuity holds the wide organisational view.",
    },
    concept:
      "The continuity family divides by scope and posture. Business continuity keeps critical functions running and takes the wide, long view. Disaster recovery restores technology through defined procedures. Crisis management handles the unfolding event, including decision-making and communications, and its defining trait is anticipation rather than procedure.",
    trap: "Strategic is the seductive option because crisis management is a senior-leadership activity, and seniority feels strategic. The question is contrasting traits against DR's procedural nature, and the intended contrast is anticipate versus process.",
    refs: [
      { label: "NIST SP 800-34 Rev.1 — Contingency Planning Guide", url: "https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final" },
      { label: "ISO 22301 — Business Continuity Management", url: "https://www.iso.org/standard/75106.html" },
    ],
  },

  "cissp-33": {
    why: "The reference monitor's purpose is to validate every access request against the organization's rules before permitting it. Expressed in the vocabulary of the options, it enforces policies that validate organization rules.",
    wrong: {
      A: "Operational security to keep unit members safe describes OPSEC in a military sense. It is unrelated to access mediation in a system.",
      C: "Cyber hygiene covers patching, configuration, and general maintenance practices. It keeps systems healthy but does not mediate access decisions.",
      D: "Quality by design is a software engineering principle about building quality in rather than testing it in. Different discipline entirely.",
    },
    concept:
      "The reference monitor must satisfy three properties, worth memorising as a triad: it is always invoked so no access bypasses it, it is tamper-proof so it cannot be modified, and it is small enough to be completely analysed and verified. The security kernel implements it — the same distinction tested in question 6.",
    trap: "The options here are unusually vague and none of them uses the standard vocabulary, so the question feels harder than the concept is. Work by elimination: three options describe entirely different disciplines, leaving only the one about validating rules.",
    refs: [
      { label: "NIST CSRC Glossary — Reference Monitor", url: "https://csrc.nist.gov/glossary/term/reference_monitor" },
      { label: "NIST SP 800-53 Rev.5 — AC-3 Access Enforcement", url: "https://csrc.nist.gov/projects/risk-management/sp800-53-controls/release-search#!/control?version=5.1&number=AC-3" },
    ],
  },

  "cissp-34": {
    why: "Volatility means how likely something is to change. Applied to a security control, it is the likelihood that the control will change over time, which drives how often it needs to be reassessed.",
    wrong: {
      A: "Impact is what the control affects or how severe a failure would be. That is a different property entirely.",
      C: "Unpredictability is close but not the same. Something can change frequently and predictably — a control on a monthly patch cycle is volatile yet entirely foreseeable.",
      D: "Stability is the inverse of volatility. A stable control is one that does not change, so this option states the opposite.",
    },
    concept:
      "Control volatility drives continuous monitoring frequency. Volatile controls — those tied to rapidly changing configurations, personnel, or threat conditions — need frequent reassessment, while stable controls can be assessed less often. This is how risk-based monitoring strategies allocate limited assessment effort.",
    trap: "Options C and D are both near-misses built from adjacent concepts, and D is the exact opposite of the answer. When an option states the inverse of the term being defined, it is usually there to catch fast readers.",
    refs: [
      { label: "NIST SP 800-137 — Information Security Continuous Monitoring", url: "https://csrc.nist.gov/pubs/sp/800/137/final" },
      { label: "NIST SP 800-53A Rev.5 — Assessing Security Controls", url: "https://csrc.nist.gov/pubs/sp/800/53/a/r5/final" },
    ],
  },

  "cissp-35": {
    why: "Planning is a high-level phase of an audit. Every audit methodology begins by defining scope, objectives, criteria, and resources before any fieldwork happens, and that holds whether the subject is an SDLC or anything else.",
    wrong: {
      B: "Risk assessment is an activity performed within the planning phase to direct audit effort. It is a step, not one of the high-level phases.",
      C: "Due diligence is a general standard of care applied throughout, not a discrete audit phase.",
      D: "Requirements is a phase of the SDLC being audited, not a phase of the audit itself. This is the key distinction the question is testing.",
    },
    concept:
      "Keep the two lifecycles separate. Audit phases run planning, fieldwork and evidence gathering, reporting, and follow-up. SDLC phases run requirements, design, development, testing, deployment, and maintenance. When a question audits an SDLC, both vocabularies are in play and you must answer from the correct one.",
    trap: "Requirements is the trap, and it works by sitting in the wrong lifecycle. The stem says 'audit phases', so any option naming an SDLC phase is disqualified regardless of how well it fits the subject matter.",
    refs: [
      { label: "ISACA — IT Audit Framework (ITAF)", url: "https://www.isaca.org/resources/itaf" },
      { label: "NIST SP 800-218 — Secure Software Development Framework", url: "https://csrc.nist.gov/pubs/sp/800/218/final" },
    ],
  },

  "cissp-36": {
    why: "Data sovereignty is the principle that data is subject to the laws of the country in which it is physically stored. The term names the geographic location question directly.",
    wrong: {
      A: "Data privacy rights are the entitlements individuals hold over their personal information. Related to the consequences of location, but not a term for location itself.",
      C: "A data warehouse is a system for consolidating data for analysis. It describes a purpose and architecture, not a jurisdiction.",
      D: "Data subject rights are the specific rights a person has under regulations such as GDPR — access, rectification, erasure. Again a rights concept, not a location one.",
    },
    concept:
      "Three related terms get confused. Data sovereignty is about which nation's laws apply because of where data sits. Data residency is the business or policy requirement to keep data in a particular place. Data localisation is a legal mandate that data must stay within national borders. Sovereignty is the legal consequence; residency is the choice; localisation is the compulsion.",
    trap: "Two of the four options contain the word 'rights', which pulls attention toward privacy regulation. The stem asks for the term defining where data is geographically stored, so the answer must be a location concept.",
    refs: [
      { label: "Cloud Security Alliance — Security Guidance v4", url: "https://cloudsecurityalliance.org/research/guidance" },
      { label: "European Commission — Data Protection (GDPR)", url: "https://commission.europa.eu/law/law-topic/data-protection_en" },
    ],
  },

  "cissp-37": {
    why: "The security design phase is where security controls, objectives, and goals are established at the outset so that security is built into the system rather than added afterwards. The word 'initiated' matches the design phase's role of setting these up.",
    wrong: {
      B: "System test belongs to the testing phase, not design. Mixing a testing activity into a design-phase answer makes it wrong.",
      C: "Fault mitigation is conducted during development and testing, and the option says 'conducted' rather than initiated — design establishes rather than executes.",
      D: "Validation is a testing and verification activity performed later against the design. Design produces the thing to be validated.",
    },
    concept:
      "Security in the SDLC follows security by design: requirements capture security needs, design establishes controls and architecture, development implements them, testing validates them, and operations maintains them. Retrofitting security after design is consistently more expensive and less effective, which is the principle behind every question in this family.",
    trap: "All four options are built from the same pool of security nouns rearranged, with one item swapped in from a different phase. Scan each option for the outlier activity rather than trying to evaluate the whole phrase at once.",
    refs: [
      { label: "NIST SP 800-160 Vol.1 Rev.1 — Engineering Trustworthy Secure Systems", url: "https://csrc.nist.gov/pubs/sp/800/160/v1/r1/final" },
      { label: "NIST SP 800-218 — Secure Software Development Framework", url: "https://csrc.nist.gov/pubs/sp/800/218/final" },
    ],
  },

  "cissp-38": {
    why: "Controls must be tailored to the organization's actual risk, and exercising due diligence over all risk management information is what makes that tailoring defensible. It uses the organization's own risk picture rather than importing someone else's assumptions.",
    wrong: {
      A: "Industry best practices are a starting baseline, but adopting them unmodified ignores the organization's specific threats, systems, and risk tolerance.",
      C: "Choosing the most stringent standard by location wastes resources on controls that do not address real risk and may still miss risks no standard anticipated. Most stringent is not most appropriate.",
      D: "This is close and genuinely tempting — a risk assessment is the right instinct. But it stops at choosing a standard to fill gaps, whereas the correct answer tailors controls to the full risk picture.",
    },
    concept:
      "The control selection sequence is: categorise the system, select a baseline, then tailor it by adding, removing, or adjusting controls based on assessed risk and compensating factors. Tailoring is the step that turns a generic catalogue into a defensible control set, and it is what separates the right answer from option D here.",
    trap: "Option D contains the phrase 'risk assessment' and will attract anyone pattern-matching on that phrase. Read what each option does with the assessment — D selects a pre-made standard, while B tailors controls to the organization.",
    refs: [
      { label: "NIST SP 800-53 Rev.5 — Security and Privacy Controls", url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final" },
      { label: "NIST SP 800-37 Rev.2 — Risk Management Framework", url: "https://csrc.nist.gov/pubs/sp/800/37/r2/final" },
    ],
  },

  "cissp-39": {
    why: "RPO is defined in time, backwards from the moment of failure: it is the maximum period for which losing data is tolerable. An RPO of four hours means you can accept losing up to four hours of work, which in turn sets your backup or replication frequency.",
    wrong: {
      A: "RPO is not a minimum quantity of data. It is expressed as a duration, and 'minimum amount to recover' inverts the meaning.",
      B: "Time taken to recover is RTO, not RPO. This option describes the wrong metric entirely.",
      C: "A targeted percentage of data is not how RPO is expressed. Percentages of data recovered are not a standard continuity metric.",
    },
    concept:
      "Fix the metrics on a timeline around the incident. RPO looks backwards and sets how much data you can lose, driving backup frequency. RTO looks forwards and sets how long restoration may take. MTD or MTPD is the absolute outer limit the business can survive, and RTO plus WRT must fit inside it.",
    trap: "RPO and RTO are the single most confused pair in the operations domain, and both are measured in time, so the units give you no help. Anchor them directionally: RPO is behind the incident, RTO is ahead of it.",
    refs: [
      { label: "NIST SP 800-34 Rev.1 — Contingency Planning Guide", url: "https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final" },
      { label: "Ready.gov — Business Continuity Plan", url: "https://www.ready.gov/business-continuity-plan" },
    ],
    visual: {
      kind: "timeline",
      caption: "Click each marker — the incident is the red line in the middle",
      event: "Incident",
      points: [
        { at: 18, label: "RPO", body: "Recovery Point Objective. Looks BACKWARD from the incident. The maximum period for which data loss is acceptable — if your RPO is four hours, you must back up or replicate at least every four hours. This is the answer to this question.", tone: "good" },
        { at: 50, label: "Failure", body: "The moment of disruption. Everything between your last good recovery point and this instant is data you lose.", tone: "bad" },
        { at: 72, label: "RTO", body: "Recovery Time Objective. Looks FORWARD from the incident. The maximum acceptable time to restore the system to service. Measured in the same units as RPO, which is exactly why the two get confused.", tone: "warn" },
        { at: 84, label: "WRT", body: "Work Recovery Time. After the system is technically restored, the time needed to verify data, reconcile transactions, and return to normal business operation.", tone: "info" },
        { at: 95, label: "MTD", body: "Maximum Tolerable Downtime. The absolute outer limit before the disruption threatens the survival of the business. RTO plus WRT must fit inside MTD, which is why MTD is derived first in the BIA.", tone: "bad" },
      ],
    },
  },

  "cissp-40": {
    why: "In SDN the controller holds the entire control plane and programs the flow tables of every switch beneath it. Compromising the controller through its management interface — brute forcing SSH — hands the attacker the whole network, which is the complete control the question describes.",
    wrong: {
      B: "Injecting flow messages from a compromised host can open one unauthorised path. Damaging, but it exploits a single flow rather than granting control of the architecture.",
      C: "A RADIUS replay attack targets authentication and could yield network access. It does not reach the SDN control plane.",
      D: "Sniffing traffic from a compromised host is passive reconnaissance limited to what that host can observe. It gains information, not control.",
    },
    concept:
      "SDN separates the control plane from the data plane and centralises the former. That centralisation is the architecture's chief benefit and its chief risk — the controller is a single point of total compromise. Securing it means hardening the northbound and southbound interfaces, using strong authentication on management access, and isolating the control network.",
    trap: "The SDN-specific option B looks like the answer because it uses SDN vocabulary, and exam-takers assume the technology-specific attack must be the technology-specific answer. Ask what each attack yields — only controller compromise yields complete control.",
    refs: [
      { label: "Open Networking Foundation — SDN Resources", url: "https://opennetworking.org/sdn-definition/" },
      { label: "NIST SP 800-125B — Secure Virtual Network Configuration", url: "https://csrc.nist.gov/pubs/sp/800/125/b/final" },
    ],
  },
};
