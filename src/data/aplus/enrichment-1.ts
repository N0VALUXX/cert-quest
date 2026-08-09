import type { Enrichment } from "../../content-model";

export const batch1: Record<string, Enrichment> = {
  "aplus-7": {
    why: "Quarantine comes immediately after identification because malware that is still connected can spread laterally, reach mapped shares, or receive new instructions from an operator. Disconnecting the machine from the network stops the damage from growing while you work, and it preserves the state you are about to investigate.",
    wrong: {
      A: "User education is the final step, not an early one. It closes the loop so the same infection route is not reopened, but doing it before the machine is contained leaves the threat live while you deliver a briefing.",
      C: "System Restore should be disabled rather than enabled at this stage. Restore points can hold a copy of the malware, so leaving the feature on gives the infection somewhere to survive a clean-up and return from.",
      D: "The near-miss, and the one most people pick. Updating definitions is genuinely part of the remediation step and must happen before scanning — but it requires network access, which is precisely what quarantine removes. The order matters: contain first, then reconnect under control or use offline definitions to update and scan.",
    },
    concept:
      "The malware removal procedure is a fixed sequence and the exam tests the order rather than the individual actions. Identify and research the symptoms, quarantine the system, disable System Restore, remediate by updating definitions and scanning with appropriate tools, schedule scans and run updates, re-enable System Restore and create a fresh restore point, then educate the end user. The logic underneath is that each step protects the one after it — containment protects the investigation, disabling restore prevents reinfection from a snapshot, and education prevents recurrence. When a question asks what comes next, locate the current step in the sequence rather than reasoning about which action sounds most urgent.",
    trap: "Option D attracts anyone thinking about what the technician will actually do at the keyboard, since updating and scanning is the visible work. The trap is that it needs the network connection that step two takes away, which is the clue that it cannot come first.",
    refs: [
      { label: "NIST SP 800-83 Rev.1 — Malware Incident Prevention and Handling", url: "https://csrc.nist.gov/pubs/sp/800/83/r1/final" },
      { label: "NIST SP 800-61 Rev.2 — Computer Security Incident Handling Guide", url: "https://csrc.nist.gov/pubs/sp/800/61/r2/final" },
    ],
    visual: {
      kind: "steps",
      caption: "Malware removal, in the order the exam expects",
      steps: [
        { label: "Identify and research symptoms", body: "Confirm it is actually malware and find out what this specific family does. Research tells you what else to check and whether credentials need rotating." },
        { label: "Quarantine the system", body: "Disconnect from the network — wired, wireless, and any mapped storage. Stops lateral movement and cuts the channel to the operator while you work. This is the step the question is asking about." },
        { label: "Disable System Restore", body: "Restore points can contain the malware. Leaving the feature enabled gives the infection a place to hide and a route back after a clean-up." },
        { label: "Remediate: update, scan, remove", body: "Update definitions, then scan with appropriate tools. Requires connectivity, so use offline updates or a controlled connection rather than simply undoing the quarantine." },
        { label: "Schedule scans and updates", body: "Make the protection ongoing rather than a one-off so the next attempt is caught automatically." },
        { label: "Re-enable System Restore", body: "Turn it back on and create a fresh, clean restore point so the machine has a known-good state to fall back to." },
        { label: "Educate the end user", body: "Close the loop on how the infection arrived. Skipping this reopens the same route and the technician sees the same machine again." },
      ],
    },
  },

  "aplus-11": {
    why: "A theory is a claim about what is wrong, and it has no value until it has been checked against the machine. Testing it either confirms the cause and lets you plan a fix, or eliminates it and sends you back to form a new theory — which is why the methodology loops here rather than moving forward.",
    wrong: {
      A: "Documentation is the last step. Recording findings before you have confirmed a cause captures a guess rather than a resolution, and leaves the next technician following a false trail.",
      C: "The near-miss, and the reason people miss this: planning the fix is what you naturally want to do once you have a promising theory. It comes one step later. Building a plan around an untested theory risks a change that does not address the fault and may introduce a second one.",
      D: "Verifying full functionality happens after the fix has been applied. There is nothing to verify at this point, since no change has been made.",
    },
    concept:
      "The six-step methodology is identify the problem, establish a theory of probable cause, test the theory, establish a plan of action and implement the solution, verify full system functionality and apply preventive measures, then document findings, actions, and outcomes. Two features matter more than the wording. First, testing sits between theorising and acting, and if the test fails you return to establish a new theory rather than pressing on — this is the loop that stops technicians from replacing parts speculatively. Second, questioning the obvious and considering multiple approaches belongs inside the early steps, which is where escalation also lives if the fault exceeds your scope. Exam questions almost always give you one step and ask for the next, so the reliable technique is to locate the step you were given in the sequence.",
    trap: "Option C is the trap for anyone reasoning about efficiency rather than reciting the sequence, because in practice a confident technician does jump to planning. The methodology deliberately inserts a verification gate to prevent exactly that, and the exam tests the gate.",
    refs: [
      { label: "NIST SP 800-61 Rev.2 — Computer Security Incident Handling Guide", url: "https://csrc.nist.gov/pubs/sp/800/61/r2/final" },
      { label: "CompTIA — A+ Certification", url: "https://www.comptia.org/en-us/certifications/a/" },
    ],
  },
};

