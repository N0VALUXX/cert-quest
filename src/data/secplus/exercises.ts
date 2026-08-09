import type { Exercise } from "../../types";

const meta = { packId: "secplus", domain: "General Security Concepts" };

export const secplusExercises: Exercise[] = [
  {
    id: "secplus-x-cat-controls",
    type: "categorization",
    title: "Sort the controls by what they do",
    instructions:
      "Pick a card, then click the group it belongs to. Click a placed card to take it back.",
    difficulty: "learn",
    learningObjective:
      "Classify a control by its function, which is the axis most exam questions turn on.",
    hints: [
      "Ask what the control does at the moment an incident happens: stop it, notice it, or fix it.",
      "A control that only makes an attacker think twice is deterrent, not preventive.",
    ],
    explanation:
      "Preventive controls stop the event, detective controls notice it, corrective controls put things back afterwards, and deterrent controls change the attacker's calculation without physically stopping anything. The same technology can appear in more than one category depending on how it is used, which is why questions name the function rather than the product.",
    metadata: { ...meta, domain: "Security Architecture" },
    content: {
      categories: [
        { id: "preventive", label: "Preventive", hint: "Stops it happening" },
        { id: "detective", label: "Detective", hint: "Notices it happened" },
        { id: "corrective", label: "Corrective", hint: "Puts it right afterwards" },
      ],
      items: [
        { id: "acl", label: "Access control list", detail: "Refuses the request before it reaches the resource." },
        { id: "mantrap", label: "Mantrap", detail: "Physically prevents tailgating into a secure area." },
        { id: "siem", label: "SIEM alerting", detail: "Correlates events and raises a signal after the fact." },
        { id: "cctv", label: "Security camera", detail: "Records what happened for later reconstruction." },
        { id: "backup", label: "Restore from backup", detail: "Returns the system to a known-good state after damage." },
        { id: "patch", label: "Emergency patch", detail: "Removes the weakness once it has been exploited or disclosed." },
      ],
    },
    solution: {
      assignments: {
        acl: "preventive",
        mantrap: "preventive",
        siem: "detective",
        cctv: "detective",
        backup: "corrective",
        patch: "corrective",
      },
    },
  },
  {
    id: "secplus-x-cat-factors",
    type: "categorization",
    title: "Which authentication factor is which",
    instructions: "Place each credential into its factor category. One card belongs nowhere.",
    difficulty: "practice",
    learningObjective:
      "Count factor categories rather than credentials — the single most common MFA error.",
    hints: ["Two credentials from the same category is still single-factor."],
    explanation:
      "Something you know covers passwords, PINs and security questions. Something you have covers tokens, smart cards and the registered phone. Something you are covers biometrics. A username is not a factor at all — it is an identifier, and it is claimed rather than proven, which is why it sits outside all three.",
    metadata: { ...meta, domain: "General Security Concepts" },
    content: {
      categories: [
        { id: "know", label: "Something you know" },
        { id: "have", label: "Something you have" },
        { id: "are", label: "Something you are" },
      ],
      items: [
        { id: "pw", label: "Password", detail: "Knowledge, and phishable precisely because it can be spoken." },
        { id: "pin", label: "PIN", detail: "Knowledge. Shorter than a password, same category." },
        { id: "token", label: "Hardware token", detail: "Possession. Must be physically present." },
        { id: "phone", label: "Registered phone", detail: "Possession — though SMS codes weaken it via SIM swapping." },
        { id: "fp", label: "Fingerprint", detail: "Inherence. Cannot be changed once compromised." },
        { id: "username", label: "Username", detail: "Not a factor. It is an identifier — a claim, not proof." },
      ],
    },
    solution: {
      assignments: {
        pw: "know",
        pin: "know",
        token: "have",
        phone: "have",
        fp: "are",
        username: null,
      },
    },
  },
  {
    id: "secplus-x-tf-salt",
    type: "true-false",
    title: "Salts and secrecy",
    instructions: "Decide whether the statement holds.",
    difficulty: "practice",
    learningObjective: "Know what a salt actually defends against, and what it does not.",
    hints: ["Ask what breaks if the salt is published alongside the hash."],
    explanation:
      "False. A salt is not a secret and is normally stored in plain sight next to the hash. Its job is to make precomputation useless — every password needs its own table — and to stop two users with the same password producing the same stored value. What slows a single guess down is the work factor of the key derivation function, not the salt.",
    metadata: { ...meta, domain: "General Security Concepts" },
    content: {
      statement:
        "A password salt must be kept secret, because an attacker who learns the salt can reverse the hash.",
    },
    solution: { correct: false },
  },
];
