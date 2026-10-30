import type { ArchiveCase, Reconstruction } from './types';

const bellReport = `BELLWETHER MUNICIPAL ARCHIVE — INCIDENT 031
Date: 31 October, 1998. Case classification: fictional training record.

18:42 — The north switching house reported unstable voltage following an electrical fire in the cable gallery.
18:46 — Power was lost at the north switching house. A shared feeder to the municipal pump station also went offline.
18:49 — Without feeder power, the municipal pump station stopped supplying pressure to the hill reservoir.
18:54 — Hospital East reported low water pressure after the hill reservoir supply dropped below the emergency threshold.
19:02 — The tram depot lost its departure signal when the signal relay cabinet failed during the same power disturbance.
19:08 — The emergency radio repeater continued on battery backup, but dispatch staff reported intermittent communication.
19:23 — Temporary power was restored to the pump station. Water pressure began recovering at Hospital East.

Archive editor's note: the incident log never established whether the radio outage shared the same feeder or was an independent fault. A water-pressure alarm at Hospital East was documented, but no medical harm was recorded. This is an invented training case, not a real disaster report.`;

const bellReconstruction: Reconstruction = {
  title: 'The Bellwether Blackout',
  summary: 'An electrical disturbance moved through a feeder-dependent water system. The rail signal relay was affected during the same disturbance, while the radio fault remains unresolved.',
  origin: 'switch-house', source: 'illustrative-sample', model: 'Curated sample · not AI-generated', createdAt: '2026-10-29T14:00:00.000Z',
  nodes: [
    { id: 'switch-house', label: 'North switching house', kind: 'power', role: 'Initial source of electrical disruption', criticality: 5, evidence: 'Power was lost at the north switching house.', evidenceVerified: true },
    { id: 'pump', label: 'Municipal pump station', kind: 'water', role: 'Shared feeder consumer', criticality: 4, evidence: 'A shared feeder to the municipal pump station also went offline.', evidenceVerified: true },
    { id: 'reservoir', label: 'Hill reservoir', kind: 'water', role: 'Water pressure supply', criticality: 4, evidence: 'the municipal pump station stopped supplying pressure to the hill reservoir.', evidenceVerified: true },
    { id: 'hospital', label: 'Hospital East', kind: 'health', role: 'Downstream water demand', criticality: 5, evidence: 'Hospital East reported low water pressure', evidenceVerified: true },
    { id: 'relay', label: 'Tram signal relay', kind: 'transport', role: 'Affected railway signal cabinet', criticality: 3, evidence: 'the signal relay cabinet failed during the same power disturbance.', evidenceVerified: true },
    { id: 'radio', label: 'Emergency repeater', kind: 'communications', role: 'Unresolved radio reliability concern', criticality: 3, evidence: 'dispatch staff reported intermittent communication.', evidenceVerified: true },
  ],
  links: [
    {from:'switch-house',to:'pump',relation:'shared feeder power',strength:5,evidence:'A shared feeder to the municipal pump station also went offline.',evidenceVerified:true},
    {from:'pump',to:'reservoir',relation:'maintains pressure',strength:4,evidence:'the municipal pump station stopped supplying pressure to the hill reservoir.',evidenceVerified:true},
    {from:'reservoir',to:'hospital',relation:'supplies emergency pressure',strength:4,evidence:'Hospital East reported low water pressure after the hill reservoir supply dropped below the emergency threshold.',evidenceVerified:true},
    {from:'switch-house',to:'relay',relation:'same power disturbance (association)',strength:3,evidence:'the signal relay cabinet failed during the same power disturbance.',evidenceVerified:true},
  ],
  timeline: [
    {time:'18:42',event:'Cable gallery fire and unstable voltage reported',evidence:'The north switching house reported unstable voltage following an electrical fire in the cable gallery.',evidenceVerified:true},
    {time:'18:46',event:'Switching house and feeder lose power',evidence:'A shared feeder to the municipal pump station also went offline.',evidenceVerified:true},
    {time:'18:49',event:'Pump station stops pressurizing reservoir',evidence:'the municipal pump station stopped supplying pressure to the hill reservoir.',evidenceVerified:true},
    {time:'18:54',event:'Hospital reports low water pressure',evidence:'Hospital East reported low water pressure after the hill reservoir supply dropped below the emergency threshold.',evidenceVerified:true},
    {time:'19:23',event:'Temporary pump power restores pressure',evidence:'Temporary power was restored to the pump station.',evidenceVerified:true},
  ],
  hypotheses: [
    {claim:'The shared feeder was a direct pathway into the water network',confidence:'high',reasoning:'The report explicitly ties loss of feeder power to the pump stopping and reservoir pressure dropping.',evidence:'A shared feeder to the municipal pump station also went offline.',evidenceVerified:true},
    {claim:'The radio fault was part of the same cascade',confidence:'low',reasoning:'Temporal overlap is not proof of shared electrical dependency.',evidence:'the incident log never established whether the radio outage shared the same feeder or was an independent fault.',evidenceVerified:true},
  ],
  unresolved:['No verified common cause for the radio repeater fault.','The report does not establish restoration time for tram signals.'],
};
const ashReport = `ASHFIELD SIGNAL ARCHIVE — INCIDENT 009
Date: 28 October, 2004. Fictional training record.
00:12 — A storm damaged the tower microwave link supplying the valley emergency dispatch office.
00:16 — The valley dispatch office lost its primary communication line; operators switched to short-range backup radio.
00:19 — A relay gateway stopped forwarding dispatch signals to the eastern rail crossing.
00:22 — The eastern rail crossing entered its fail-safe closed position. A night maintenance convoy stopped at the barrier.
00:29 — The clinic notification terminal could not receive dispatch updates because it depended on the same relay gateway.
00:41 — Technicians restored the tower microwave link and the relay gateway restarted.

Investigators could not establish whether a separate battery fault caused the gateway reboot delay. No injuries or collisions were reported. This is an invented training case.`;
const ashReconstruction: Reconstruction = {
  title:'Ashfield Signal 009',summary:'A broken microwave link interrupted dispatch and related relay-dependent services. An unexplained gateway delay remains open.',origin:'tower',source:'illustrative-sample',model:'Curated sample · not AI-generated',createdAt:'2026-10-29T14:00:00.000Z',
  nodes:[
    {id:'tower',label:'Microwave tower',kind:'communications',role:'Damaged upstream link',evidence:'A storm damaged the tower microwave link',evidenceVerified:true,criticality:5},
    {id:'dispatch',label:'Valley dispatch',kind:'communications',role:'Primary communication terminal',evidence:'The valley dispatch office lost its primary communication line',evidenceVerified:true,criticality:5},
    {id:'gateway',label:'Relay gateway',kind:'communications',role:'Forwards dispatch notifications',evidence:'A relay gateway stopped forwarding dispatch signals',evidenceVerified:true,criticality:4},
    {id:'rail',label:'Eastern rail crossing',kind:'transport',role:'Fail-safe control endpoint',evidence:'The eastern rail crossing entered its fail-safe closed position.',evidenceVerified:true,criticality:4},
    {id:'clinic',label:'Clinic notification',kind:'health',role:'Dispatch notification consumer',evidence:'The clinic notification terminal could not receive dispatch updates',evidenceVerified:true,criticality:3},
  ],
  links:[
    {from:'tower',to:'dispatch',relation:'primary link',evidence:'the tower microwave link supplying the valley emergency dispatch office.',evidenceVerified:true,strength:5},
    {from:'dispatch',to:'gateway',relation:'dispatch signal path (inferred)',evidence:'A relay gateway stopped forwarding dispatch signals',evidenceVerified:true,strength:3},
    {from:'gateway',to:'rail',relation:'relay notification',evidence:'A relay gateway stopped forwarding dispatch signals to the eastern rail crossing.',evidenceVerified:true,strength:4},
    {from:'gateway',to:'clinic',relation:'shared gateway',evidence:'it depended on the same relay gateway.',evidenceVerified:true,strength:4},
  ],
  timeline:[
    {time:'00:12',event:'Storm damage interrupts microwave tower',evidence:'A storm damaged the tower microwave link',evidenceVerified:true},
    {time:'00:19',event:'Relay stops forwarding rail signals',evidence:'A relay gateway stopped forwarding dispatch signals',evidenceVerified:true},
    {time:'00:22',event:'Rail crossing enters safe state',evidence:'The eastern rail crossing entered its fail-safe closed position.',evidenceVerified:true},
    {time:'00:41',event:'Tower link restored',evidence:'Technicians restored the tower microwave link',evidenceVerified:true},
  ],
  hypotheses:[{claim:'Loss of link preceded dispatch and relay failures',confidence:'medium',reasoning:'Chronology supports an association but cannot rule out a separate gateway fault.',evidence:'A relay gateway stopped forwarding dispatch signals',evidenceVerified:true}],
  unresolved:['Separate battery fault remained unconfirmed.'],
};
export const archiveCases: ArchiveCase[] = [
  {id:'bell',name:'Bellwether Blackout',eyebrow:'ARCHIVE 031',district:'Bellwether / East borough',date:'31 OCT 1998',report:bellReport,reconstruction:bellReconstruction},
  {id:'ash',name:'Ashfield Signal',eyebrow:'ARCHIVE 009',district:'Ashfield / Valley',date:'28 OCT 2004',report:ashReport,reconstruction:ashReconstruction},
];
