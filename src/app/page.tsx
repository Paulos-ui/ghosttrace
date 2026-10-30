'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, Archive, ArrowDownRight, ArrowLeft, ArrowRight, BookOpen, Check,
  ChevronDown, ChevronRight, CircleDot, Clock3, Code2, Database, Download,
  FileText, Ghost, GitBranch, Github, Info, Layers3, LockKeyhole, Menu,
  Network, RotateCcw, Search, Shield, ShieldAlert, ShieldCheck, Sparkles,
  Terminal, Upload, WandSparkles, X, Zap, Flame, HeartHandshake, ScrollText, Eye,
} from 'lucide-react';
import { archiveCases } from '@/lib/demo';
import { runOpenEvidenceLens, openEvidenceModel, type EvidenceHit } from '@/lib/open-evidence';
import { positionNodes, traceCascade } from '@/lib/engine';
import type { ArchiveCase, Reconstruction, TraceNode } from '@/lib/types';

const archiveKey = 'ghosttrace-saved-investigations-v1';
const vigilKey = 'ghosttrace-vigil-lanterns-v1';
type Tab = 'network' | 'chronology' | 'source';
type Section = 'lab' | 'archive' | 'vigil' | 'method';
type SavedCase = { id: string; name: string; report: string; reconstruction: Reconstruction; savedAt: string };

function saveText(filename: string, text: string, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime });
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

function scoreLabel(score: number) { return score >= 5 ? 'Critical' : score >= 4 ? 'High' : score === 3 ? 'Elevated' : 'Moderate'; }
function kindInitial(kind: string) {
  return ({ power:'P', water:'W', transport:'T', communications:'C', health:'H', other:'S' } as Record<string,string>)[kind] || 'S';
}

function NetworkView({ reconstruction, selected, onSelect, sealed, impacted }: {
  reconstruction: Reconstruction; selected: string; onSelect: (id: string) => void; sealed: string[]; impacted: string[];
}) {
  const nodes = useMemo(() => positionNodes(reconstruction.nodes), [reconstruction.nodes]);
  const positions = new Map(nodes.map(n => [n.id, n]));
  return <div className="network-wrap">
    <div className="map-grid" aria-hidden="true" />
    <div className="map-title"><span className="live-pin" /> RECONSTRUCTED NETWORK <span className="map-title-count">{nodes.length.toString().padStart(2,'0')} NODES · {reconstruction.links.length.toString().padStart(2,'0')} LINKS</span></div>
    <svg className="network-svg" viewBox="0 0 720 495" role="img" aria-label="Interactive reconstructed infrastructure dependency graph">
      <defs>
        <marker id="edgeArrow" markerWidth="7" markerHeight="7" refX="7" refY="3.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 L7 3.5 L0 7" fill="none" stroke="#84958e" strokeWidth="1.3" /></marker>
        <marker id="impactArrow" markerWidth="7" markerHeight="7" refX="7" refY="3.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 L7 3.5 L0 7" fill="none" stroke="#d99a79" strokeWidth="1.3" /></marker>
      </defs>
      <circle cx="360" cy="245" r="213" fill="none" stroke="#34403e" strokeDasharray="2 8" opacity=".55" />
      <circle cx="360" cy="245" r="126" fill="none" stroke="#34403e" strokeDasharray="2 9" opacity=".4" />
      {reconstruction.links.map((edge,index) => {
        const from = positions.get(edge.from); const to = positions.get(edge.to);
        if (!from || !to) return null;
        const moving = impacted.includes(edge.from) && impacted.includes(edge.to);
        const dx=to.x-from.x, dy=to.y-from.y, dist=Math.hypot(dx,dy)||1;
        const sx=from.x+dx/dist*37, sy=from.y+dy/dist*37;
        const ex=to.x-dx/dist*41, ey=to.y-dy/dist*41;
        return <g key={`${edge.from}-${edge.to}-${index}`}><path d={`M${sx},${sy} L${ex},${ey}`} fill="none" stroke={moving?'#dc9d7a':'#485d57'} strokeWidth={moving?2.2:1.5} strokeDasharray={moving?'none':'4 6'} markerEnd={moving?'url(#impactArrow)':'url(#edgeArrow)'} opacity={moving?'.9':'.7'}/>{moving&&<circle r="3" fill="#e4a17c"><animateMotion dur="3s" repeatCount="indefinite" path={`M${sx},${sy} L${ex},${ey}`} /></circle>}</g>;
      })}
      {nodes.map(n => {
        const isSelected = selected === n.id; const isOrigin=n.id===reconstruction.origin; const isAffected=impacted.includes(n.id);const isSealed=sealed.includes(n.id);
        return <g key={n.id} className="map-node" role="button" tabIndex={0} onClick={()=>onSelect(n.id)} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(n.id);}}} aria-label={`Inspect ${n.label}`}>
          {isSelected&&<circle cx={n.x} cy={n.y} r="45" fill="none" stroke="#e1b9a0" strokeWidth="1" strokeDasharray="3 6" className="node-halo" />}
          {isOrigin&&<circle cx={n.x} cy={n.y} r="37" fill="#da9970" opacity=".09" className="node-pulse"/>}
          <circle cx={n.x} cy={n.y} r="31" fill={isSealed?'#183e34':isAffected?'#513329':'#1d2d2a'} stroke={isSealed?'#8ebdaa':isAffected?'#dba079':isSelected?'#bedbd1':'#5b786f'} strokeWidth={isSelected?2.6:1.5} />
          <text x={n.x} y={n.y+5} fill={isSealed?'#b2e0cf':isAffected?'#ffccab':'#cee1d8'} fontWeight="700" fontSize="14" textAnchor="middle">{kindInitial(n.kind)}</text>
          <text x={n.x} y={n.y+52} fill="#dce5df" fontSize="10.5" letterSpacing=".25" textAnchor="middle">{n.label.length>22?n.label.slice(0,21)+'…':n.label}</text>
          {isOrigin&&<text x={n.x+33} y={n.y-30} fill="#eeb08f" fontSize="9" fontWeight="700">ORIGIN</text>}
          {isSealed&&<path d={`M${n.x+25} ${n.y-27} l5 0 l0 7 l-2.5 3 l-2.5 -3 Z`} fill="#b3dbc8"/>}
        </g>;
      })}
    </svg>
    <div className="map-legend"><span><i className="dot-danger"/> Impacted</span><span><i className="dot-safe"/> Contained</span><span><i className="dot-muted"/> Unaffected</span><span className="map-hint">SELECT A NODE TO INSPECT</span></div>
  </div>;
}

function Proof({ quote, verified }: { quote: string; verified: boolean }) {
  return <div className={`proof ${verified?'verified':'unverified'}`}><div className="proof-label">{verified?<><Check size={12}/> VERBATIM MATCH</>:<><Info size={12}/> NOT VERBATIM VERIFIED</>}</div><p>{quote ? `“${quote}”` : 'No source quotation supplied.'}</p></div>;
}

export default function HomePage() {
  const [section,setSection] = useState<Section>('lab');
  const [archive,setArchive] = useState<ArchiveCase>(archiveCases[0]);
  const [report,setReport] = useState(archiveCases[0].report);
  const [reconstruction,setReconstruction] = useState<Reconstruction>(archiveCases[0].reconstruction);
  const [selected,setSelected] = useState(archiveCases[0].reconstruction.origin);
  const [sealed,setSealed] = useState<string[]>([]);
  const [tab,setTab] = useState<Tab>('network');
  const [status,setStatus] = useState<{configured:boolean;model:string}|null>(null);
  const [working,setWorking] = useState(false);
  const [lensBusy,setLensBusy] = useState(false);
  const [lensResults,setLensResults] = useState<EvidenceHit[]>([]);
  const [lensForReport,setLensForReport] = useState('');
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [saved,setSaved] = useState<SavedCase[]>([]);
  const [litLanterns,setLitLanterns] = useState<string[]>([]);
  const [menuOpen,setMenuOpen] = useState(false);
  const [fileName,setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    fetch('/api/status', {cache:'no-store'}).then(r=>r.json()).then(j=>setStatus({configured:!!j.configured,model:String(j.model||'claude-sonnet-4-6')})).catch(()=>setStatus({configured:false,model:'claude-sonnet-4-6'}));
    try { const raw = JSON.parse(localStorage.getItem(archiveKey) || '[]'); if(Array.isArray(raw)) setSaved(raw.slice(0,12)); } catch {}
    try { const lit = JSON.parse(localStorage.getItem(vigilKey) || '[]'); if(Array.isArray(lit)) setLitLanterns(lit.filter((x: unknown): x is string => typeof x === 'string').slice(0,150)); } catch {}
  }, []);
  useEffect(()=>{ if(!notice) return;const id=setTimeout(()=>setNotice(''),5000);return()=>clearTimeout(id); },[notice]);
  const cascade = useMemo(()=>traceCascade(reconstruction.nodes,reconstruction.links,reconstruction.origin,sealed),[reconstruction,sealed]);
  const selectedNode:TraceNode = reconstruction.nodes.find(n=>n.id===selected) || reconstruction.nodes[0];
  const differences = Math.max(0, traceCascade(reconstruction.nodes,reconstruction.links,reconstruction.origin,[]).affected.length-cascade.affected.length);
  const graphReady = reconstruction.nodes.length > 0;

  const chooseArchive = useCallback((next:ArchiveCase) => {
    setArchive(next);setReport(next.report);setReconstruction(next.reconstruction);setSelected(next.reconstruction.origin);setSealed([]);setTab('network');setError('');setFileName('');setSection('lab');setMenuOpen(false);setLensResults([]);setLensForReport('');
  }, []);
  const scanOpenEvidence = async (currentReport: string) => {
    setLensBusy(true);
    try {
      const hits = await runOpenEvidenceLens(currentReport);
      setLensResults(hits);
      setLensForReport(currentReport);
      return hits;
    } catch (cause) {
      setLensResults([]);
      setLensForReport('');
      throw new Error(`The browser's open-weight evidence model could not start. Check your internet connection and allow downloads from huggingface.co. ${cause instanceof Error ? cause.message : ''}`);
    } finally { setLensBusy(false); }
  };
  const inspectLocally = async () => {
    if (working || lensBusy) return;
    if (report.length < 140) {setError('Enter at least 140 characters to run local evidence retrieval.');return;}
    setError('');
    try {const hits=await scanOpenEvidence(report);setNotice(`Open-weight evidence lens found ${hits.length} relevant passages locally. No report was sent to Claude.`);}
    catch (e) {setError(e instanceof Error ? e.message : 'Local evidence retrieval failed.');}
  };
  const analyze = async () => {
    if(working || lensBusy)return;
    if(report.length<140){setError('Please provide at least 140 characters of incident evidence.');return;}
    setError('');setWorking(true);
    try {
      // The open-weight model is an operational prerequisite, not a decorative label.
      const hits = lensForReport === report && lensResults.length ? lensResults : await scanOpenEvidence(report);
      const response = await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({report,evidenceContext:hits.map(h=>h.text)})});
      const payload: {error?:string;reconstruction?:Reconstruction} = await response.json();
      if(!response.ok||!payload.reconstruction) throw new Error(payload.error||'Claude reconstruction failed.');
      setReconstruction(payload.reconstruction);setSelected(payload.reconstruction.origin);setSealed([]);setTab('network');setSection('lab');
      setNotice('Open-weight evidence retrieval and Claude reconstruction complete. Inspect the source-matched quotes.');
    } catch (e) {setError(e instanceof Error?e.message:'The model request failed.');}
    finally{setWorking(false);}
  };
  const loadFile = async (file: File | undefined) => {
    if(!file)return;
    if(!/\.(txt|md|log)$/i.test(file.name) && !file.type.startsWith('text/')) {setError('Use a .txt, .md or .log file, or paste the text.');return;}
    if(file.size>45000){setError('File is too large; use up to 12,500 characters of evidence.');return;}
    const content=(await file.text()).slice(0,12500);setReport(content);setFileName(file.name);setError('');setTab('source');setLensResults([]);setLensForReport('');setNotice('Document loaded locally. Run the open-weight evidence lens, then reconstruct with Claude.');
  };
  const persist = () => {
    const item:SavedCase={id:`${Date.now()}-${Math.random().toString(36).slice(2,6)}`,name:reconstruction.title,report,reconstruction,savedAt:new Date().toISOString()};
    const next=[item,...saved].slice(0,12);setSaved(next);localStorage.setItem(archiveKey,JSON.stringify(next));setNotice('Investigation saved in this browser only.');
  };
  const restore = (item:SavedCase) => {setReport(item.report);setLensResults([]);setLensForReport('');setReconstruction(item.reconstruction);setSelected(item.reconstruction.origin);setSealed([]);setTab('network');setSection('lab');setMenuOpen(false);setNotice('Investigation restored from your browser archive.');};
  const reset = () => {setSealed([]);setSelected(reconstruction.origin);};
  const lanternId = (nodeId: string) => `${reconstruction.title}::${nodeId}`;
  const toggleLantern = (nodeId: string) => {
    const key = lanternId(nodeId);
    setLitLanterns(previous => {
      const next = previous.includes(key) ? previous.filter(item => item !== key) : [...previous, key].slice(-150);
      try {localStorage.setItem(vigilKey, JSON.stringify(next));} catch {setNotice('Local browser storage is full; export your dossier to preserve this record.');}
      return next;
    });
  };
  const downloadDossier = () => {
    const text = [
      `# ${reconstruction.title}`,`Generated: ${reconstruction.createdAt}`,`Mode: ${reconstruction.source==='ai'?`Claude reconstruction (${reconstruction.model}) + local open-weight evidence lens (${openEvidenceModel})`:'Illustrative sample only'}`,'',
      '## Reconstruction',reconstruction.summary,'', '## Systems',...reconstruction.nodes.map(n=>`- ${n.label}: ${n.role}. Evidence: ${n.evidence} [${n.evidenceVerified?'verbatim':'unverified'}]`),'',
      '## Directed dependencies',...reconstruction.links.map(l=>`- ${l.from} -> ${l.to}: ${l.relation}. Evidence: ${l.evidence} [${l.evidenceVerified?'verbatim':'unverified'}]`),'',
      '## Timeline',...reconstruction.timeline.map(t=>`- ${t.time}: ${t.event}. Evidence: ${t.evidence}`),'',
      '## Hypotheses',...reconstruction.hypotheses.map(h=>`- [${h.confidence}] ${h.claim}: ${h.reasoning}`),'',
      '## Open questions',...reconstruction.unresolved.map(q=>`- ${q}`),'',
      'Disclaimer: AI-based inferences are not verified facts. Graph propagation is hypothetical, not a real-world probability forecast.','',
      '## Remembered system traces (user-curated)',...reconstruction.nodes.filter(n=>litLanterns.includes(lanternId(n.id))).map(n=>`- ${n.label}: ${n.evidence} [${n.evidenceVerified?'found in source':'unverified'}]`),'',
      '## Original report',report,
    ].join('\n');
    saveText('ghosttrace-forensic-dossier.md',text,'text/markdown');
    setNotice('Forensic dossier downloaded.');
  };
  const unverified = [...reconstruction.nodes,...reconstruction.links,...reconstruction.timeline,...reconstruction.hypotheses].filter(x=>!x.evidenceVerified).length;
  const navItem = (item:Section, Icon:typeof Archive, label:string, subtitle?:string) => <button className={`nav-item ${section===item?'active':''}`} onClick={()=>{setSection(item);setMenuOpen(false);}}><Icon size={17} strokeWidth={1.7}/><span>{label}</span>{subtitle&&<span className="nav-count">{subtitle}</span>}</button>;

  return <div className="shell">
    <header className="mobile-header"><button className="icon-btn" onClick={()=>setMenuOpen(x=>!x)} aria-label="Toggle navigation"><Menu size={20}/></button><div className="mobile-brand"><Ghost size={18}/> GHOSTTRACE</div><span className="header-period">OCT 2026</span></header>
    {menuOpen&&<div className="mobile-overlay" onClick={()=>setMenuOpen(false)}/>}
    <aside className={`sidebar ${menuOpen?'open':''}`}>
      <div className="brand"><div className="brand-mark"><Ghost size={25} strokeWidth={1.55}/></div><div><div className="brand-main">GHOSTTRACE<span className="brand-dot">.</span></div><div className="brand-small">THE INFRASTRUCTURE AFTERLIFE</div></div></div>
      <div className="sidebar-topline"><span>FIELD NOTEBOOK</span><span>V / 01</span></div>
      <div className="nav-label">WORKSPACE</div>
      {navItem('lab',Activity,'Reconstruction lab')}
      {navItem('archive',Archive,'Saved investigations',String(saved.length).padStart(2,'0'))}
      {navItem('vigil',Flame,'The memory vigil')}
      {navItem('method',BookOpen,'Method & limitations')}
      <div className="side-divider"/>
      <div className="nav-label">INCIDENT FILES <span>02</span></div>
      {archiveCases.map(a=><button key={a.id} className={`case-nav ${archive.id===a.id?'chosen':''}`} onClick={()=>chooseArchive(a)}><span className="case-nav-icon"><FileText size={15}/></span><span><strong>{a.name}</strong><small>{a.eyebrow} · FICTIONAL</small></span><ChevronRight size={14}/></button>)}
      <div className="sidebar-flex"/>
      <div className="sidebar-bottom"><div className="bottom-top"><span className="breath"/> OPEN MODEL + CLAUDE</div><div className="bottom-model">MiniLM / Claude</div><p>Evidence first. Inferences labeled. Every thread traceable.</p><div className="sidebar-footer">© 2026 GHOSTTRACE <span>v1.0</span></div></div>
    </aside>
    <main className="main">
      <div className="topbar"><div className="breadcrumbs"><span className="breadcrumb-home">GT</span><ChevronRight size={13}/><span>Laboratory</span><ChevronRight size={13}/><strong>{section==='lab'?'Reconstruction':section==='archive'?'Archives':section==='vigil'?'Memory vigil':'Methodology'}</strong></div><div className="topbar-actions"><span className="topbar-date"><CircleDot size={13}/> OCTOBER 2026</span><a className="github-link" href="https://github.com/paulos-ui/ghosttrace" target="_blank" rel="noreferrer"><Github size={16}/> Source</a><button className="small-export" onClick={downloadDossier}><Download size={15}/> Export dossier</button></div></div>
      <div className="page-content">
      {section==='lab'&&<>
        <section className="hero"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line"/> FORENSIC INTELLIGENCE LABORATORY <span className="eyebrow-num">/ VOL. 01</span></div><h1>Every system<br/>leaves a <em>ghost.</em></h1><p>Reconstruct what failed. Follow the evidence. Discover the dependencies that survived only as traces.</p><div className="hero-tags"><span><Sparkles size={14}/> OPEN-WEIGHT EVIDENCE</span><span><ShieldCheck size={14}/> EVIDENCE-AWARE</span><span><GitBranch size={14}/> DIRECTED GRAPHS</span><span><Flame size={14}/> MEMORY VIGIL</span></div></div><div className="hero-art" aria-hidden="true"><div className="art-ring r1"/><div className="art-ring r2"/><div className="art-ring r3"/><div className="art-core"><Ghost size={51} strokeWidth={1.05}/></div><div className="art-marker m1"/><div className="art-marker m2"/><div className="art-marker m3"/><span className="art-label">SIGNAL RETURNED / 00:31</span></div></section>
        <section className="metrics" aria-label="Current investigation stats"><div className="metric"><span>RECOVERED SYSTEMS</span><div>{String(reconstruction.nodes.length).padStart(2,'0')}<Layers3 size={17}/></div><small>Identified network nodes</small></div><div className="metric"><span>DEPENDENCY THREADS</span><div>{String(reconstruction.links.length).padStart(2,'0')}<GitBranch size={17}/></div><small>Directed relationships</small></div><div className="metric"><span>PROPAGATION REACH</span><div>{String(cascade.affected.length).padStart(2,'0')}<Activity size={17}/></div><small>Hypothetically affected</small></div><div className="metric"><span>EXPLICIT GAPS</span><div>{String(unverified + reconstruction.unresolved.length).padStart(2,'0')}<ShieldAlert size={17}/></div><small>Unsupported or unresolved</small></div></section>
        <section className="workspace-heading"><div><div className="overline"><span className="glow-dot"/> INVESTIGATION / ACTIVE FILE</div><h2>{reconstruction.title}</h2><p>{archive.eyebrow} <span className="separator">/</span> {archive.district} <span className="separator">/</span> {archive.date}</p></div><div className="workspace-actions"><button onClick={reset} className="outline-button"><RotateCcw size={14}/> Reset trace</button><button onClick={persist} className="primary-soft"><Archive size={15}/> Save case</button></div></section>
        <section className="lab-layout"><div className="map-panel"><div className="panel-top"><div className="panel-top-title"><div className="badge-icon"><Network size={18}/></div><div><h3>System reconstruction</h3><p>Directed graph, inferred from the archive</p></div></div><span className={`mode-badge ${reconstruction.source==='ai'?'ai-mode':'demo-mode'}`}>{reconstruction.source==='ai'?'LIVE MODEL OUTPUT':'CURATED SAMPLE'}</span></div>
          <div className="tab-strip"><button className={tab==='network'?'selected':''} onClick={()=>setTab('network')}><GitBranch size={14}/> Network view</button><button className={tab==='chronology'?'selected':''} onClick={()=>setTab('chronology')}><Clock3 size={14}/> Incident timeline</button><button className={tab==='source'?'selected':''} onClick={()=>setTab('source')}><FileText size={14}/> Source evidence</button></div>
          {tab==='network' && (graphReady?<NetworkView reconstruction={reconstruction} selected={selected} onSelect={setSelected} sealed={sealed} impacted={cascade.affected}/>:<div className="empty-state">No reconstruction is available.</div>)}
          {tab==='chronology'&&<div className="timeline-wrap">{reconstruction.timeline.length?reconstruction.timeline.map((moment,i)=><div className="timeline-entry" key={i}><span className="time-node">{moment.time}</span><div><strong>{moment.event}</strong><Proof quote={moment.evidence} verified={moment.evidenceVerified}/></div></div>):<div className="empty-state">No dated events found in this report.</div>}</div>}
          {tab==='source'&&<div className="source-wrap"><div className="source-top"><span>PRIMARY DOCUMENT / EDITABLE INPUT</span><span>{report.length.toLocaleString()} CHARACTERS</span></div><textarea aria-label="Incident report text" spellCheck={false} value={report} onChange={e=>setReport(e.target.value.slice(0,12500))}/><p>Changing the source does not change the reconstruction until you run the AI again.</p></div>}
          <div className="map-panel-foot"><div><Shield size={15}/><span><b>{reconstruction.source==='ai'?'Model-assisted reconstruction':'Fictional sample reconstruction'}</b> · Inspect all claims against the source document.</span></div><div className="tiny-badge">CAUSALITY IS HYPOTHETICAL</div></div>
        </div>
        <div className="right-column"><div className="inspector panel"><div className="inspector-eyebrow"><span className="glow-dot"/> EVIDENCE INSPECTOR <span>SELECTED NODE</span></div><div className="inspector-title"><span className="inspector-symbol">{kindInitial(selectedNode.kind)}</span><div><h3>{selectedNode.label}</h3><p>{selectedNode.kind.toUpperCase()} / {scoreLabel(selectedNode.criticality).toUpperCase()} CRITICALITY</p></div></div><p className="inspector-role">{selectedNode.role}</p><Proof quote={selectedNode.evidence} verified={selectedNode.evidenceVerified}/><div className="inspector-footer"><span>{cascade.affected.includes(selectedNode.id)?'WITHIN PROPAGATION PATH':'OUTSIDE CURRENT CASCADE'}</span><button onClick={()=>setSealed(prev=>prev.includes(selectedNode.id)?prev.filter(x=>x!==selectedNode.id):[...prev,selectedNode.id])} disabled={selectedNode.id===reconstruction.origin} title={selectedNode.id===reconstruction.origin?'Cannot contain the initiating fault': 'Toggle hypothetical node containment'}><Shield size={14}/>{sealed.includes(selectedNode.id)?'Remove shield':'Contain node'}</button></div></div>
        <div className="analysis-panel panel"><div className="panel-top-title"><div className="badge-icon warm"><Zap size={18}/></div><div><h3>Cascade analysis</h3><p>Counterfactual containment simulator</p></div></div><div className="cascade-stats"><div><span>AFFECTED SYSTEMS</span><strong>{String(cascade.affected.length).padStart(2,'0')}<small> / {reconstruction.nodes.length}</small></strong></div><div><span>PROPAGATION WAVES</span><strong>{String(cascade.waves.length).padStart(2,'0')}</strong></div><div><span>BLOCKED IMPACTS</span><strong className="sage">{String(differences).padStart(2,'0')}</strong></div></div><div className="wave-trail">{cascade.waves.map((wave,i)=><div className="wave" key={i}><span>0{i+1}</span><div title={wave.map(id=>reconstruction.nodes.find(n=>n.id===id)?.label||id).join(', ')}>{wave.map(id=>reconstruction.nodes.find(n=>n.id===id)?.label||id).join(' · ')}</div></div>)}</div><p className="analysis-note"><Info size={13}/> Graph traversal shows possible pathways; it does not estimate real-world probabilities.</p></div>
        <div className="hypothesis panel"><div className="hypothesis-head"><span>OPEN QUESTIONS</span><span>{String(reconstruction.hypotheses.length).padStart(2,'0')} HYPOTHESES</span></div>{reconstruction.hypotheses.slice(0,2).map((h,i)=><div className="hypothesis-item" key={i}><span className={`confidence ${h.confidence}`}>{h.confidence.toUpperCase()} CONFIDENCE</span><p>{h.claim}</p><small>{h.reasoning}</small></div>)}{reconstruction.unresolved.length>0&&<div className="unresolved"><ShieldAlert size={15}/><span>{reconstruction.unresolved[0]}</span></div>}</div>
        </div></section>
        <section className="inference-panel">
          <div className="inference-intro"><div className="model-icon"><WandSparkles size={23}/></div><div>
            <div className="overline">OPEN-WEIGHT EVIDENCE + CLAUDE RECONSTRUCTION</div>
            <h2>Wake the machine.</h2>
            <p>First, an Apache-2.0 open-weight MiniLM model searches source passages locally in your browser. Then Claude converts the evidence into an inspectable graph and incident timeline. No invented testimony.</p>
          </div></div>
          <div className="inference-controls"><div className="inference-status"><span className={status?.configured?'online':'offline'}/>
            <span>{status===null?'CHECKING CLAUDE…':status.configured?'CLAUDE API READY':'CLAUDE KEY NOT CONFIGURED'}</span>
            <small>{status?.model||'claude-sonnet-4-6'} · MiniLM local</small>
          </div>
          <div className="inference-actions">
            <input ref={inputRef} type="file" accept=".txt,.md,.log,text/plain" className="sr-only" onChange={e=>void loadFile(e.target.files?.[0])}/>
            <button className="outline-button" onClick={()=>inputRef.current?.click()}><Upload size={15}/> {fileName||'Import .txt'}</button>
            <button className="outline-button" onClick={()=>void inspectLocally()} disabled={working||lensBusy}><Search size={15}/>{lensBusy?'Loading open model…':'Open evidence lens'}</button>
            <button className="primary-button" onClick={()=>void analyze()} disabled={working||lensBusy||!status?.configured}><Sparkles size={16}/>{working?'Reconstructing…':'Reconstruct with Claude'}<ArrowRight size={16}/></button>
          </div></div>
          <div className="input-bottom"><span><LockKeyhole size={13}/> MiniLM runs in this browser. Claude receives the report only when you choose to reconstruct. The local model downloads once on first use.</span><button onClick={()=>setTab('source')}>Edit evidence <ArrowRight size={13}/></button></div>
          {lensForReport===report&&lensResults.length>0&&<div className="open-lens-results" aria-live="polite">
            <div className="open-lens-heading"><span><ShieldCheck size={17}/> OPEN-WEIGHT EVIDENCE LENS / {openEvidenceModel}</span><small>{lensResults.length} retrieved passages · local inference</small></div>
            <p>These passages are ranked by semantic similarity, not certainty. They are supplied as context to Claude and remain visible for independent inspection.</p>
            <div className="open-lens-list">{lensResults.map((hit,i)=><div className="open-lens-hit" key={hit.order}><span>#{String(i+1).padStart(2,'0')} · SIMILARITY {hit.similarity.toFixed(2)}</span><p>{hit.text}</p></div>)}</div>
          </div>}
          {error&&<div role="alert" className="error-message"><ShieldAlert size={16}/>{error}</div>}
          {status&&!status.configured&&<div className="configure-message"><Terminal size={17}/><span>The open evidence lens works without an API key. To activate Claude reconstruction add <code>ANTHROPIC_API_KEY</code> to your Vercel project's server environment and redeploy.</span></div>}
        </section>
        <footer className="page-footer"><span>GHOSTTRACE / SAMPLE INCIDENTS ARE FICTIONAL</span><span>RECONSTRUCTION ≠ PROVEN CAUSALITY</span><span>OPEN-WEIGHT LENS + CLAUDE · 2026</span></footer>
      </>}
      {section==='archive'&&<section className="secondary-page"><div className="overline">FIELD NOTEBOOK / SAVED WORK</div><h1>Cases held in memory.</h1><p>Saved investigations are stored locally in this browser, not uploaded to a private database. Export what matters before clearing browser data.</p><div className="archive-toolbar"><span>{saved.length} SAVED CASES</span><button className="outline-button" onClick={()=>{if(confirm('Remove all browser-saved GHOSTTRACE cases?')){setSaved([]);localStorage.removeItem(archiveKey);}}}><X size={14}/> Clear archive</button></div>{saved.length? <div className="saved-grid">{saved.map(s=><button className="saved-card" key={s.id} onClick={()=>restore(s)}><div className="overline">SAVED INVESTIGATION</div><h3>{s.name}</h3><p>{s.reconstruction.summary.slice(0,150)}…</p><div><span>{new Date(s.savedAt).toLocaleDateString()}</span><ArrowRight size={17}/></div></button>)}</div>:<div className="empty-large"><Archive size={28}/><h3>No investigations archived.</h3><p>Return to the reconstruction laboratory and use Save case.</p><button className="primary-soft" onClick={()=>setSection('lab')}>Back to lab <ArrowRight size={14}/></button></div>}</section>}

      {section==='vigil'&&<section className="vigil-page secondary-page">
        <div className="vigil-hero">
          <div className="vigil-flame-art" aria-hidden="true"><span className="vigil-glow"/><Flame size={80} strokeWidth={0.9}/><span className="vigil-orbit first"/><span className="vigil-orbit second"/></div>
          <div className="overline"><Flame size={15}/> MEMORY VIGIL / AN ARCHIVE OF TRACES</div>
          <h1>Not everything lost<br/>should be <em>forgotten.</em></h1>
          <p>Every outage leaves a record: a warning, a dependency, a decision that someone made. Here, we preserve the fragments we can actually trace to the original report. A quiet space for remembering systems and lessons, inspired by the season of remembrance.</p>
          <div className="vigil-hero-bottom"><span><ScrollText size={15}/> Source-backed remembrance</span><span><ShieldCheck size={15}/> No invented testimony</span><span><Flame size={15}/> {litLanterns.filter(x=>x.startsWith(`${reconstruction.title}::`)).length} lanterns lit in this case</span></div>
        </div>
        <div className="vigil-heading"><div><div className="overline">CURRENT DOSSIER / {reconstruction.source==='ai'?'MODEL RECONSTRUCTION':'FICTIONAL SAMPLE'}</div><h2>The last known signals</h2><p>Select a lantern to preserve its trace in your local memory vigil. Each one is attached to a source excerpt, not a fictional human story.</p></div><button className="outline-button" onClick={downloadDossier}><Download size={15}/> Export remembrance</button></div>
        <div className="vigil-grid">
        {reconstruction.nodes.map((node,index)=>{
          const lit=litLanterns.includes(lanternId(node.id));
          return <article key={node.id} className={`lantern-card ${lit?'lit':''}`}>
            <div className="lantern-top"><span>TRACE {String(index+1).padStart(2,'0')}</span><span className={node.evidenceVerified?'source-verified':'source-unverified'}>{node.evidenceVerified?'SOURCE MATCHED':'UNVERIFIED'}</span></div>
            <div className="lantern-icon" aria-hidden="true"><Flame size={30} strokeWidth={1.15}/></div>
            <h3>{node.label}</h3><div className="lantern-kind">{node.kind.toUpperCase()} / {node.role}</div>
            <blockquote>{node.evidence?`“${node.evidence}”`:'No verifiable excerpt was returned for this system.'}</blockquote>
            <div className="lantern-bottom"><span><Eye size={14}/> {node.evidenceVerified?'Recorded in this report':'Treat as unverified'}</span><button onClick={()=>toggleLantern(node.id)} aria-pressed={lit}><Flame size={15}/>{lit?'Lantern lit':'Light a lantern'}</button></div>
          </article>;
        })}
        </div>
        <div className="vigil-ethics"><HeartHandshake size={23}/><div><h3>We remember the lessons. We do not invent the lives.</h3><p>This archive preserves technical evidence and memory of historical systems. Fictional demo records are explicitly fictional. Model-generated links remain hypotheses. The vigil is inspired by remembrance and does not impersonate victims or recreate anyone's personal memories.</p></div></div>
      </section>}
      {section==='method'&&<section className="secondary-page"><div className="overline">METHODOLOGY / AN OPEN NOTEBOOK</div><h1>What the ghosts can tell us.</h1><p>GHOSTTRACE is an exploratory evidence laboratory, not a real-world hazard forecast. The Memory Vigil preserves documented fragments and avoids inventing human memories.</p><div className="method-grid"><article><div className="method-icon"><Search size={20}/></div><h3>01 / Open-weight evidence retrieval</h3><p>Transformers.js runs Apache-2.0 MiniLM sentence embeddings directly in the browser. It ranks document passages by semantic relevance before Claude reconstructs a network. The open-weight evidence lens also works by itself without an API key.</p></article><article><div className="method-icon"><Sparkles size={20}/></div><h3>02 / Claude-assisted reconstruction</h3><p>Claude analyzes the supplied report plus locally retrieved context. It proposes a timeline, infrastructure nodes and directed dependencies, with uncertain claims labeled as hypotheses. Claude is proprietary; we do not describe it as open-source.</p></article><article><div className="method-icon"><GitBranch size={20}/></div><h3>03 / Verbatim grounding and counterfactuals</h3><p>Evidence quotations are checked against the original document. A deterministic graph traversal then explores hypothetical failure paths and alternative containment choices, not estimated real-world probabilities.</p></article><article><div className="method-icon"><LockKeyhole size={20}/></div><h3>04 / Data boundaries</h3><p>The open-weight retrieval model runs in your browser. Your report goes to Anthropic only if you explicitly request Claude reconstruction. Saved cases and vigil lanterns use browser-local storage. Never upload private incident reports or credentials.</p></article></div><div className="method-cta"><div><span>OPEN INNOVATION / INSPECTABLE LOCAL INTELLIGENCE</span><h3>The evidence lens belongs to everyone.</h3><p>MiniLM's Apache-2.0 weights can be inspected, downloaded and replaced. The app also makes clear which later inferences come from the closed Claude API.</p></div><button onClick={()=>setSection('lab')} className="primary-button">Open laboratory <ArrowRight size={15}/></button></div></section>}
      </div>
    </main>
    {notice&&<div className="toast" role="status"><Check size={16}/>{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss"><X size={14}/></button></div>}
  </div>;
}
