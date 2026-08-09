// Hand-authored starter bank written against the published CompTIA A+
// 220-1201 / 220-1202 exam objectives. Not OCR-derived — safe to edit directly.
import type { Question } from "../../content-model";

export const aplusQuestions: Question[] = [
{id:"aplus-1",num:1,domain:"Hardware",stem:"A technician needs to configure four drives so that the array survives the loss of any single drive while still using the majority of the raw capacity. Which RAID level meets this requirement?",options:[{l:"A",t:"RAID 0"}, {l:"B",t:"RAID 1"}, {l:"C",t:"RAID 5"}, {l:"D",t:"JBOD"}],answer:"C"},
{id:"aplus-2",num:2,domain:"Hardware",stem:"A workstation powers on, the fans spin, but there is no video output and the system emits a repeating beep code. What should the technician check FIRST?",options:[{l:"A",t:"Reseat the RAM modules"}, {l:"B",t:"Replace the power supply"}, {l:"C",t:"Reinstall the operating system"}, {l:"D",t:"Replace the motherboard"}],answer:"A"},
{id:"aplus-3",num:3,domain:"Hardware",stem:"Which storage interface is required to take full advantage of the speed of a modern NVMe solid state drive?",options:[{l:"A",t:"SATA III"}, {l:"B",t:"PCIe"}, {l:"C",t:"USB 2.0"}, {l:"D",t:"IDE"}],answer:"B"},
{id:"aplus-4",num:4,domain:"Hardware",stem:"A technician is about to install a memory module. Which practice BEST protects the component from electrostatic discharge?",options:[{l:"A",t:"Wearing an anti-static wrist strap connected to the chassis"}, {l:"B",t:"Working on a carpeted floor to ground the charge"}, {l:"C",t:"Handling the module by its gold contacts"}, {l:"D",t:"Leaving the system plugged in and powered on"}],answer:"A"},
{id:"aplus-5",num:5,domain:"Operating Systems",stem:"A user reports that a Windows workstation is running slowly and an unfamiliar process is consuming CPU. Which tool shows running processes and resource usage?",options:[{l:"A",t:"Task Manager"}, {l:"B",t:"Disk Cleanup"}, {l:"C",t:"Device Manager"}, {l:"D",t:"Event Viewer"}],answer:"A"},
{id:"aplus-6",num:6,domain:"Operating Systems",stem:"Which Windows utility is used to modify which programs and services start automatically at boot?",options:[{l:"A",t:"regedit"}, {l:"B",t:"msconfig"}, {l:"C",t:"chkdsk"}, {l:"D",t:"sfc"}],answer:"B"},
{id:"aplus-7",num:7,domain:"Security",stem:"Following the best practice procedure for malware removal, what should a technician do immediately after identifying malware symptoms?",options:[{l:"A",t:"Educate the end user"}, {l:"B",t:"Quarantine the infected system"}, {l:"C",t:"Enable System Restore"}, {l:"D",t:"Update the anti-malware definitions"}],answer:"B"},
{id:"aplus-8",num:8,domain:"Security",stem:"A company is disposing of hard drives that contained sensitive data and will not be reused. Which method provides the MOST reliable assurance the data cannot be recovered?",options:[{l:"A",t:"Quick format of each drive"}, {l:"B",t:"Deleting all partitions"}, {l:"C",t:"Physical destruction such as shredding"}, {l:"D",t:"Moving the files to the recycle bin and emptying it"}],answer:"C"},
{id:"aplus-9",num:9,domain:"Mobile Devices",stem:"A laptop display is very dim but an image is faintly visible when a bright light is shone on the screen. Which component has MOST likely failed?",options:[{l:"A",t:"The inverter or backlight"}, {l:"B",t:"The graphics processor"}, {l:"C",t:"The display cable"}, {l:"D",t:"The system RAM"}],answer:"A"},
{id:"aplus-10",num:10,domain:"Operating Systems",stem:"Which requirement must a host system meet to run multiple virtual machines effectively?",options:[{l:"A",t:"Hardware virtualization support enabled in firmware, with sufficient RAM and CPU cores"}, {l:"B",t:"A dedicated physical network card for every virtual machine"}, {l:"C",t:"An identical operating system on the host and every guest"}, {l:"D",t:"A separate physical hard drive for every virtual machine"}],answer:"A"},
{id:"aplus-11",num:11,domain:"Troubleshooting",stem:"According to the standard troubleshooting methodology, what should a technician do immediately after establishing a theory of probable cause?",options:[{l:"A",t:"Document the findings and outcomes"}, {l:"B",t:"Test the theory to determine the cause"}, {l:"C",t:"Establish a plan of action"}, {l:"D",t:"Verify full system functionality"}],answer:"B"},
{id:"aplus-12",num:12,domain:"Hardware",stem:"Users report that documents from a laser printer smudge when touched. Which component is MOST likely at fault?",options:[{l:"A",t:"The fuser assembly"}, {l:"B",t:"The transfer roller"}, {l:"C",t:"The pickup roller"}, {l:"D",t:"The toner cartridge"}],answer:"A"},

// Visual question. The calculator gives raw capacity; knowing what RAID 5
// spends on parity is the part it deliberately does not tell you.
{id:"aplus-13",num:13,domain:"Hardware",stem:"Use the array calculator. Four 4 TB drives are configured as a single RAID 5 array. How much of that raw capacity is usable for data?",options:[{l:"A",t:"4 TB"}, {l:"B",t:"8 TB"}, {l:"C",t:"12 TB"}, {l:"D",t:"16 TB"}],answer:"C",
  figure:{kind:"formula",caption:"Raw capacity only — what a RAID level spends is not shown",expression:"raw capacity = drives × drive size",
    inputs:[{key:"drives",label:"Drives in the array",min:2,max:8,step:1,value:4},
            {key:"size",label:"Capacity per drive",min:1,max:8,step:1,value:4,unit:"TB"}],
    outputs:[{label:"Total raw capacity",headline:true,term:{op:"mul",args:[{ref:"drives"},{ref:"size"}]},unit:"TB",
              note:"Before any mirroring or parity is accounted for."}]}},
];

