// Hand-authored starter bank written against the published CompTIA Network+
// N10-009 exam objectives. Not OCR-derived — safe to edit directly.
import type { Question } from "../../types";

export const netplusQuestions: Question[] = [
{id:"netplus-1",num:1,domain:"Networking Concepts",stem:"At which layer of the OSI model does a router make its forwarding decisions?",options:[{l:"A",t:"Layer 2, the data link layer"}, {l:"B",t:"Layer 3, the network layer"}, {l:"C",t:"Layer 4, the transport layer"}, {l:"D",t:"Layer 7, the application layer"}],answer:"B"},
{id:"netplus-2",num:2,domain:"Networking Concepts",stem:"A host is configured with the address 192.168.10.75/26. What is the broadcast address of its subnet?",options:[{l:"A",t:"192.168.10.63"}, {l:"B",t:"192.168.10.127"}, {l:"C",t:"192.168.10.128"}, {l:"D",t:"192.168.10.255"}],answer:"B"},
{id:"netplus-3",num:3,domain:"Networking Concepts",stem:"Which sequence correctly describes the DHCP address assignment process?",options:[{l:"A",t:"Discover, Offer, Request, Acknowledge"}, {l:"B",t:"Request, Discover, Acknowledge, Offer"}, {l:"C",t:"Offer, Discover, Request, Acknowledge"}, {l:"D",t:"Discover, Request, Offer, Acknowledge"}],answer:"A"},
{id:"netplus-4",num:4,domain:"Networking Concepts",stem:"An administrator needs to direct mail for a domain to a specific mail server. Which DNS record type should be created?",options:[{l:"A",t:"A record"}, {l:"B",t:"CNAME record"}, {l:"C",t:"MX record"}, {l:"D",t:"TXT record"}],answer:"C"},
{id:"netplus-5",num:5,domain:"Network Implementation",stem:"A single switch port must carry traffic for several VLANs to another switch. How should the port be configured?",options:[{l:"A",t:"As an access port assigned to the native VLAN"}, {l:"B",t:"As a trunk port using 802.1Q tagging"}, {l:"C",t:"As a mirrored port forwarding all traffic"}, {l:"D",t:"As a routed port with an IP address"}],answer:"B"},
{id:"netplus-6",num:6,domain:"Networking Concepts",stem:"An application requires low latency and can tolerate occasional lost packets, such as live voice traffic. Which transport protocol is the better fit?",options:[{l:"A",t:"TCP, because it guarantees delivery"}, {l:"B",t:"UDP, because it avoids retransmission and handshake overhead"}, {l:"C",t:"ICMP, because it is lightweight"}, {l:"D",t:"ARP, because it operates at layer 2"}],answer:"B"},
{id:"netplus-7",num:7,domain:"Network Implementation",stem:"A company needs to run a 10 Gbps link between two buildings roughly 800 metres apart. Which cabling choice is MOST appropriate?",options:[{l:"A",t:"Cat 6 unshielded twisted pair"}, {l:"B",t:"Cat 6a shielded twisted pair"}, {l:"C",t:"Single-mode fiber"}, {l:"D",t:"RG-6 coaxial"}],answer:"C"},
{id:"netplus-8",num:8,domain:"Network Implementation",stem:"Multiple internal hosts using private addresses share one public IP address when reaching the internet, with the router tracking sessions by port. Which technology is in use?",options:[{l:"A",t:"Port address translation (PAT)"}, {l:"B",t:"Static NAT"}, {l:"C",t:"Proxy ARP"}, {l:"D",t:"Split-horizon DNS"}],answer:"A"},
{id:"netplus-9",num:9,domain:"Network Troubleshooting",stem:"A user cannot reach a remote server. Pings to the server's IP address succeed, but pings to its hostname fail. What is the MOST likely cause?",options:[{l:"A",t:"The default gateway is misconfigured"}, {l:"B",t:"Name resolution is failing"}, {l:"C",t:"The server's firewall is dropping ICMP"}, {l:"D",t:"The network cable is faulty"}],answer:"B"},
{id:"netplus-10",num:10,domain:"Network Troubleshooting",stem:"Which utility shows each router hop along the path to a destination along with the latency at each hop?",options:[{l:"A",t:"ping"}, {l:"B",t:"traceroute"}, {l:"C",t:"netstat"}, {l:"D",t:"arp"}],answer:"B"},
{id:"netplus-11",num:11,domain:"Network Operations",stem:"A monitoring platform polls network devices for interface counters and receives unsolicited alerts when a link fails. Which protocol provides this?",options:[{l:"A",t:"SNMP"}, {l:"B",t:"SMTP"}, {l:"C",t:"NTP"}, {l:"D",t:"LDAP"}],answer:"A"},
{id:"netplus-12",num:12,domain:"Network Security",stem:"Two switches are connected by redundant links, and the network experiences broadcast storms until a protocol blocks one of the paths. Which protocol prevents this condition?",options:[{l:"A",t:"Spanning Tree Protocol (STP)"}, {l:"B",t:"Border Gateway Protocol (BGP)"}, {l:"C",t:"Link Aggregation Control Protocol (LACP)"}, {l:"D",t:"Hot Standby Router Protocol (HSRP)"}],answer:"A"},

// Visual questions: the exhibit is part of the prompt. The figure supplies
// structure or a tool; the answer still has to be reasoned out.
{id:"netplus-13",num:13,domain:"Networking Concepts",stem:"Refer to the stack. A switch receives a frame and forwards it based on the destination MAC address. Which layer is it operating at, and what is the unit of data called there?",options:[{l:"A",t:"Layer 1 — bits"}, {l:"B",t:"Layer 2 — frames"}, {l:"C",t:"Layer 3 — packets"}, {l:"D",t:"Layer 4 — segments"}],answer:"B",
  figure:{kind:"nested",caption:"OSI model, layer 7 outermost",layers:[
    {label:"7 — Application",body:"What the user's software speaks: HTTP, DNS, SMTP. Closest to the person, furthest from the wire."},
    {label:"6 — Presentation",body:"Encoding, encryption, and compression. TLS is usually placed here or straddling 5 and 6."},
    {label:"5 — Session",body:"Establishes, manages, and tears down conversations between applications."},
    {label:"4 — Transport",body:"End-to-end delivery. TCP and UDP live here, and the unit is a segment (TCP) or datagram (UDP)."},
    {label:"3 — Network",body:"Logical addressing and routing between networks. IP addresses, routers, and packets."},
    {label:"2 — Data link",body:"Delivery across a single link using physical addresses. MAC addresses, switches, and frames."},
    {label:"1 — Physical",body:"Voltages, light, and radio on the medium itself. The unit is the bit."}]}},
{id:"netplus-14",num:14,domain:"Networking Concepts",stem:"Use the subnet calculator. A /27 mask is applied to a Class C network. How many usable host addresses does each resulting subnet provide?",options:[{l:"A",t:"14"}, {l:"B",t:"30"}, {l:"C",t:"32"}, {l:"D",t:"62"}],answer:"B",
  figure:{kind:"formula",caption:"Drag the prefix to see what it produces",expression:"block size = 2 ^ (32 − prefix)",
    inputs:[{key:"prefix",label:"Prefix length",min:24,max:30,step:1,value:27,prefix:"/"}],
    outputs:[
      {label:"Host bits",term:{op:"sub",args:[{value:32},{ref:"prefix"}]}},
      {label:"Addresses per subnet",term:{op:"pow",args:[{value:2},{op:"sub",args:[{value:32},{ref:"prefix"}]}]}},
      {label:"Subnets per /24",term:{op:"div",args:[{value:256},{op:"pow",args:[{value:2},{op:"sub",args:[{value:32},{ref:"prefix"}]}]}]}}]}},
];
