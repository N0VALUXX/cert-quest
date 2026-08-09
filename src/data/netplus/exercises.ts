import type { Exercise, Visual } from "../../types";

/**
 * Hand-authored exercises. These are data, not components — adding one never
 * requires touching React.
 *
 * The diagram used as an answer surface is the same `Visual` data structure the
 * explainers use, so its parts are addressable by index. That is what lets
 * validation be semantic ("the learner picked the network layer") rather than a
 * comparison of pixel coordinates.
 */

const OSI: Visual = {
  kind: "nested",
  caption: "OSI model — layer 7 outermost",
  layers: [
    { label: "7 — Application", body: "What the user's software speaks: HTTP, DNS, SMTP." },
    { label: "6 — Presentation", body: "Encoding, encryption, and compression of the payload." },
    { label: "5 — Session", body: "Establishes, manages, and tears down conversations." },
    { label: "4 — Transport", body: "End-to-end delivery, ports, and reliability. TCP and UDP." },
    { label: "3 — Network", body: "Logical addressing and routing between networks. IP and routers." },
    { label: "2 — Data link", body: "Delivery across one link using physical addresses. MAC and switches." },
    { label: "1 — Physical", body: "Voltages, light, and radio on the medium itself." },
  ],
};

const meta = { packId: "netplus", domain: "Networking Concepts" };

export const netplusExercises: Exercise[] = [
  {
    id: "netplus-x-hotspot-router",
    type: "hotspot",
    title: "Find the routing layer",
    instructions: "Click the layer on the diagram. There is no list to choose from.",
    difficulty: "practice",
    learningObjective: "Locate a function on the OSI model rather than recite the list.",
    hints: ["Routers make decisions using logical addresses, not physical ones."],
    explanation:
      "Routers forward using IP addresses, which are logical addresses assigned by configuration rather than burned into hardware. That is layer 3. Switches, which forward on MAC addresses, sit one layer below at layer 2.",
    metadata: meta,
    content: {
      figure: OSI,
      prompt: "A router decides where to forward a packet using its destination IP address. Click the layer where that decision is made.",
    },
    solution: { targets: [4] },
  },
  {
    id: "netplus-x-hotspot-encryption",
    type: "hotspot",
    title: "Find where payload encoding happens",
    instructions: "Click the layer responsible for this.",
    difficulty: "mastery",
    learningObjective: "Separate the upper layers, which are the easiest to confuse.",
    hints: [],
    explanation:
      "Encoding, compression, and encryption of the payload belong to the presentation layer. It is the layer people most often skip when reciting the model, and the one most often confused with application.",
    metadata: meta,
    content: {
      figure: OSI,
      prompt: "Click the layer that translates, compresses, and encrypts the payload so the receiving application can read it.",
    },
    solution: { targets: [1] },
  },
  {
    id: "netplus-x-label-osi",
    type: "label-diagram",
    title: "Label the middle of the stack",
    instructions:
      "Three layers have been blanked. Pick a label from the word bank, then click the slot it belongs to. One label in the bank does not belong anywhere.",
    difficulty: "learn",
    learningObjective: "Attach layer numbers to layer functions in both directions.",
    hints: [
      "Read the description in each slot — it names the addresses or units that layer works with.",
      "Ports and reliability mean transport. MAC addresses mean data link.",
    ],
    explanation:
      "Layer 4 handles end-to-end delivery and ports, layer 3 handles logical addressing between networks, and layer 2 handles delivery across a single link. The bank's extra entry pairs the wrong number with the wrong name, which is the mistake this exercise is looking for.",
    metadata: meta,
    content: {
      figure: OSI,
      slots: [
        { id: "s4", elementIndex: 3 },
        { id: "s3", elementIndex: 4 },
        { id: "s2", elementIndex: 5 },
      ],
      bank: [
        { id: "b-transport", label: "4 — Transport" },
        { id: "b-network", label: "3 — Network" },
        { id: "b-datalink", label: "2 — Data link" },
        { id: "b-decoy", label: "5 — Network" },
      ],
    },
    solution: { placements: { s4: "b-transport", s3: "b-network", s2: "b-datalink" } },
  },
  {
    id: "netplus-x-mc-switch",
    type: "multiple-choice",
    title: "Forwarding decisions",
    instructions: "Choose the best answer.",
    difficulty: "practice",
    learningObjective: "Map a device to the layer it operates at and the unit it handles.",
    hints: ["Ask what address the device reads before it forwards."],
    explanation:
      "A switch reads the destination MAC address, which is a physical address valid only on the local link, so it operates at layer 2 and the unit it handles is the frame. A router reads IP and works at layer 3 on packets.",
    metadata: meta,
    content: {
      prompt: "An unmanaged switch receives traffic and forwards it based on the destination MAC address. Which layer is it operating at, and what is the unit of data called there?",
      options: [
        { id: "A", label: "Layer 1 — bits" },
        { id: "B", label: "Layer 2 — frames" },
        { id: "C", label: "Layer 3 — packets" },
        { id: "D", label: "Layer 4 — segments" },
      ],
      figure: OSI,
    },
    solution: { correct: "B" },
  },
  {
    id: "netplus-x-multiselect-l3",
    type: "multi-select",
    title: "What lives at layer 3",
    instructions: "Select every item that belongs to the network layer. Wrong picks and missed items both cost you.",
    difficulty: "practice",
    learningObjective: "Hold a whole layer's contents in mind at once, not just one example.",
    hints: ["Anything that crosses between networks is a candidate; anything link-local is not."],
    explanation:
      "IP addressing, routing, and ICMP all operate at layer 3. MAC addresses and switching are layer 2, and port numbers belong to layer 4 — those are the three most common misplacements.",
    metadata: meta,
    content: {
      prompt: "Which of these operate at the network layer?",
      options: [
        { id: "ip", label: "IP addressing" },
        { id: "routing", label: "Routing between networks" },
        { id: "icmp", label: "ICMP" },
        { id: "mac", label: "MAC addressing" },
        { id: "ports", label: "Port numbers" },
      ],
    },
    solution: { correct: ["ip", "routing", "icmp"] },
  },
];
