/**
 * AXIOM v5 — Neurosymbolic EOT Intelligence Platform
 * "Every decision. Every reason. Every clause."
 *
 * FIDIC 2017 Conditions of Contract for Construction
 * Architecture: LLM parse → KG enrichment → 40-rule Symbolic Engine → XAI trace
 *
 * v5: Complete UI overhaul — Precision Intelligence design system
 *   - Vertical sidebar navigation with icon+label layout
 *   - New geometric AXIOM logo mark
 *   - Fixed dark/light mode switching
 *   - New Dashboard home with analytics overview
 *   - AI Chat Assistant panel (FIDIC-aware)
 *   - Modern glassmorphism + gradient accents
 *   - All v4 engine logic preserved intact
 */

import { useState, useRef, useMemo, useCallback, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   FIDIC 2017 KNOWLEDGE BASE
═══════════════════════════════════════════════════════════════════════════ */
const FIDIC_KB = {
  nodes: [
    { id:"C_8_4",    type:"CLAUSE", label:"§8.4",    props:{ title:"Extension of Time for Completion",       notice_days:28,  critical:true  } },
    { id:"C_20_2_1", type:"CLAUSE", label:"§20.2.1", props:{ title:"Notice of Claim",                        notice_days:28,  critical:true  } },
    { id:"C_20_2_4", type:"CLAUSE", label:"§20.2.4", props:{ title:"Fully Detailed Claim",                   notice_days:84,  critical:true  } },
    { id:"C_20_2_8", type:"CLAUSE", label:"§20.2.8", props:{ title:"Non-Compliance Consequences",            notice_days:null,critical:true  } },
    { id:"C_20_2_6", type:"CLAUSE", label:"§20.2.6", props:{ title:"Engineer's Response to Claim",           notice_days:28,  critical:false } },
    { id:"C_3_7",    type:"CLAUSE", label:"§3.7",    props:{ title:"Agreement or Determination",             notice_days:42,  critical:false } },
    { id:"C_8_3",    type:"CLAUSE", label:"§8.3",    props:{ title:"Programme",                              notice_days:28,  critical:false } },
    { id:"C_1_9",    type:"CLAUSE", label:"§1.9",    props:{ title:"Delayed Drawings or Instructions",       notice_days:null,critical:false } },
    { id:"C_2_1",    type:"CLAUSE", label:"§2.1",    props:{ title:"Right of Access to Site",                notice_days:28,  critical:false } },
    { id:"C_8_5",    type:"CLAUSE", label:"§8.5",    props:{ title:"Delays Caused by Authorities",           notice_days:28,  critical:false } },
    { id:"C_8_9",    type:"CLAUSE", label:"§8.9",    props:{ title:"Consequences of Suspension",             notice_days:28,  critical:false } },
    { id:"C_13_3",   type:"CLAUSE", label:"§13.3",   props:{ title:"Variation Procedure",                    notice_days:28,  critical:false } },
    { id:"C_18_2",   type:"CLAUSE", label:"§18.2",   props:{ title:"Notice of Exceptional Event",            notice_days:14,  critical:false } },
    { id:"C_18_4",   type:"CLAUSE", label:"§18.4",   props:{ title:"Consequences of Exceptional Events",     notice_days:14,  critical:false } },
    { id:"C_20_2_2", type:"CLAUSE", label:"§20.2.2", props:{ title:"Contemporary Records",                   notice_days:null,critical:false } },
    { id:"G_8_4_A",  type:"GROUND", label:"§8.4(a)", props:{ title:"Variation",               risk:"employer", cost:true  } },
    { id:"G_8_4_B",  type:"GROUND", label:"§8.4(b)", props:{ title:"Other Entitlement Clauses",risk:"varies",  cost:true  } },
    { id:"G_8_4_C",  type:"GROUND", label:"§8.4(c)", props:{ title:"Adverse Climate",         risk:"shared",   cost:false } },
    { id:"G_8_4_D",  type:"GROUND", label:"§8.4(d)", props:{ title:"Unforeseeable Shortage",  risk:"shared",   cost:false } },
    { id:"G_8_4_E",  type:"GROUND", label:"§8.4(e)", props:{ title:"Employer Impediment",     risk:"employer", cost:true  } },
    { id:"OB_N28",   type:"OBLIGATION", label:"28d Notice",         props:{ days:28,  consequence:"time_bar"   } },
    { id:"OB_D84",   type:"OBLIGATION", label:"84d Detailed Claim", props:{ days:84,  consequence:"time_bar"   } },
    { id:"OB_P28",   type:"OBLIGATION", label:"Programme (28d)",    props:{ days:28,  consequence:"evidential" } },
    { id:"OB_CR",    type:"OBLIGATION", label:"Contemp. Records",   props:{ days:null,consequence:"evidential" } },
    { id:"RA_EMPL",  type:"RISK",    label:"Employer Risk",   props:{ eot:true,  cost:true,  profit:true  } },
    { id:"RA_SHAR",  type:"RISK",    label:"Shared Risk",     props:{ eot:true,  cost:false, profit:false } },
    { id:"RA_CONT",  type:"RISK",    label:"Contractor Risk", props:{ eot:false, cost:false, profit:false } },
    { id:"PA_CONT",  type:"PARTY",   label:"Contractor",      props:{} },
    { id:"PA_EMPL",  type:"PARTY",   label:"Employer",        props:{} },
    { id:"PA_ENG",   type:"PARTY",   label:"The Engineer",    props:{} },
    { id:"OUT_ELI",  type:"OUTCOME", label:"Eligible",        props:{ favorable:true,  base_conf:0.85 } },
    { id:"OUT_PAR",  type:"OUTCOME", label:"Partial",         props:{ favorable:true,  base_conf:0.65 } },
    { id:"OUT_NO",   type:"OUTCOME", label:"Not Eligible",    props:{ favorable:false, base_conf:0.80 } },
    { id:"OUT_TB",   type:"OUTCOME", label:"Time Barred",     props:{ favorable:false, base_conf:0.97 } },
    { id:"OUT_INF",  type:"OUTCOME", label:"Insufficient",    props:{ favorable:null,  base_conf:0.50 } },
  ],
  edges: [
    { from:"C_8_4",    to:"OB_N28",   rel:"REQUIRES",         w:1.0 },
    { from:"C_20_2_1", to:"OB_N28",   rel:"DEFINES",          w:1.0 },
    { from:"C_20_2_4", to:"OB_D84",   rel:"DEFINES",          w:1.0 },
    { from:"C_8_3",    to:"OB_P28",   rel:"REQUIRES",         w:0.8 },
    { from:"C_20_2_2", to:"OB_CR",    rel:"REQUIRES",         w:0.9 },
    { from:"OB_N28",   to:"OUT_ELI",  rel:"ENABLES_IF_MET",   w:0.90 },
    { from:"OB_D84",   to:"OUT_ELI",  rel:"ENABLES_IF_MET",   w:0.90 },
    { from:"OB_N28",   to:"OUT_TB",   rel:"TRIGGERS_IF_LATE", w:0.95 },
    { from:"OB_D84",   to:"OUT_TB",   rel:"TRIGGERS_IF_LATE", w:0.95 },
    { from:"C_8_4",    to:"G_8_4_A",  rel:"INCLUDES_GROUND",  w:1.0 },
    { from:"C_8_4",    to:"G_8_4_B",  rel:"INCLUDES_GROUND",  w:1.0 },
    { from:"C_8_4",    to:"G_8_4_C",  rel:"INCLUDES_GROUND",  w:1.0 },
    { from:"C_8_4",    to:"G_8_4_D",  rel:"INCLUDES_GROUND",  w:1.0 },
    { from:"C_8_4",    to:"G_8_4_E",  rel:"INCLUDES_GROUND",  w:1.0 },
    { from:"C_8_4",    to:"C_20_2_1", rel:"GOVERNED_BY",      w:1.0 },
    { from:"G_8_4_A",  to:"C_13_3",   rel:"GOVERNED_BY",      w:1.0 },
    { from:"G_8_4_B",  to:"C_1_9",    rel:"INCLUDES",         w:1.0 },
    { from:"G_8_4_B",  to:"C_2_1",    rel:"INCLUDES",         w:0.9 },
    { from:"G_8_4_B",  to:"C_8_5",    rel:"INCLUDES",         w:1.0 },
    { from:"G_8_4_B",  to:"C_8_9",    rel:"INCLUDES",         w:1.0 },
    { from:"G_8_4_B",  to:"C_18_4",   rel:"INCLUDES",         w:1.0 },
    { from:"G_8_4_A",  to:"OUT_ELI",  rel:"SUPPORTS",         w:0.90 },
    { from:"G_8_4_B",  to:"OUT_ELI",  rel:"SUPPORTS",         w:0.80 },
    { from:"G_8_4_C",  to:"OUT_ELI",  rel:"SUPPORTS",         w:0.75 },
    { from:"G_8_4_D",  to:"OUT_ELI",  rel:"SUPPORTS",         w:0.75 },
    { from:"G_8_4_E",  to:"OUT_ELI",  rel:"SUPPORTS",         w:0.85 },
    { from:"G_8_4_A",  to:"RA_EMPL",  rel:"FALLS_UNDER",      w:1.0 },
    { from:"G_8_4_B",  to:"RA_EMPL",  rel:"FALLS_UNDER",      w:0.8 },
    { from:"G_8_4_C",  to:"RA_SHAR",  rel:"FALLS_UNDER",      w:1.0 },
    { from:"G_8_4_D",  to:"RA_SHAR",  rel:"FALLS_UNDER",      w:1.0 },
    { from:"G_8_4_E",  to:"RA_EMPL",  rel:"FALLS_UNDER",      w:1.0 },
    { from:"C_18_4",   to:"RA_SHAR",  rel:"FALLS_UNDER",      w:0.9 },
    { from:"C_20_2_8", to:"OUT_TB",   rel:"RESULTS_IN",       w:1.0 },
    { from:"C_3_7",    to:"OUT_ELI",  rel:"FORMALIZES",       w:0.8 },
    { from:"C_20_2_6", to:"C_3_7",    rel:"LEADS_TO",         w:1.0 },
    { from:"PA_CONT",  to:"OB_N28",   rel:"MUST_FULFILL",     w:1.0 },
    { from:"PA_CONT",  to:"OB_D84",   rel:"MUST_FULFILL",     w:1.0 },
    { from:"PA_CONT",  to:"OB_P28",   rel:"MUST_FULFILL",     w:0.8 },
    { from:"PA_ENG",   to:"C_3_7",    rel:"MUST_ISSUE",       w:1.0 },
    { from:"PA_ENG",   to:"C_20_2_6", rel:"MUST_ISSUE",       w:1.0 },
    { from:"PA_EMPL",  to:"RA_EMPL",  rel:"BEARS",            w:1.0 },
  ]
};

/* ═══════════════════════════════════════════════════════════════════════════
   KNOWLEDGE GRAPH ENGINE
═══════════════════════════════════════════════════════════════════════════ */
class KnowledgeGraph {
  constructor() { this.nodes=new Map();this.edges=[];this.adjOut=new Map();this.adjIn=new Map();this._trav=0;this._hits=0; }
  load(kb) {
    kb.nodes.forEach(n=>{this.nodes.set(n.id,{...n});this.adjOut.set(n.id,[]);this.adjIn.set(n.id,[]);});
    kb.edges.forEach((e,i)=>{const edge={...e,id:i};this.edges.push(edge);this.adjOut.get(e.from)?.push({to:e.to,rel:e.rel,w:e.w,eid:i});this.adjIn.get(e.to)?.push({from:e.from,rel:e.rel,w:e.w});});
    return this;
  }
  node(id){return this.nodes.get(id)??null;}
  outEdges(id,rel){this._hits++;const a=this.adjOut.get(id)??[];return rel?a.filter(e=>e.rel===rel):a;}
  inEdges(id,rel){this._hits++;const a=this.adjIn.get(id)??[];return rel?a.filter(e=>e.rel===rel):a;}
  clausesForCause(cause){
    const m={employer_delay:["C_8_4","G_8_4_E","C_20_2_1","RA_EMPL"],employer_instruction:["C_8_4","G_8_4_E","C_20_2_1","RA_EMPL"],late_drawings:["C_8_4","G_8_4_E","C_1_9","C_20_2_1","RA_EMPL"],site_access:["C_8_4","G_8_4_E","C_2_1","C_20_2_1","RA_EMPL"],variation:["C_8_4","G_8_4_A","C_13_3","C_20_2_1","RA_EMPL"],scope_change:["C_8_4","G_8_4_A","C_13_3","C_20_2_1","RA_EMPL"],additional_works:["C_8_4","G_8_4_A","C_13_3","C_20_2_1","RA_EMPL"],force_majeure:["C_8_4","G_8_4_B","C_18_2","C_18_4","C_20_2_1","RA_SHAR"],authority_delay:["C_8_4","G_8_4_B","C_8_5","C_20_2_1","RA_EMPL"],suspension:["C_8_4","G_8_4_B","C_8_9","C_20_2_1","RA_EMPL"],adverse_climate:["C_8_4","G_8_4_C","C_20_2_1","RA_SHAR"],epidemic_shortage:["C_8_4","G_8_4_D","C_20_2_1","RA_SHAR"]};
    return(m[cause]??["C_8_4","C_20_2_1"]).map(id=>this.node(id)).filter(Boolean);
  }
  riskForCause(cause){const emp=["employer_delay","employer_instruction","late_drawings","site_access","variation","scope_change","additional_works","authority_delay","suspension"];const sha=["force_majeure","adverse_climate","epidemic_shortage"];return emp.includes(cause)?this.node("RA_EMPL"):sha.includes(cause)?this.node("RA_SHAR"):this.node("RA_CONT");}
  byType(type){return[...this.nodes.values()].filter(n=>n.type===type);}
  stats(){return{total_nodes:this.nodes.size,total_edges:this.edges.length,traversals:this._trav,edge_hits:this._hits,node_types:[...new Set([...this.nodes.values()].map(n=>n.type))],edge_types:[...new Set(this.edges.map(e=>e.rel))]};}
  resetMetrics(){this._trav=0;this._hits=0;}
}

/* ═══════════════════════════════════════════════════════════════════════════
   SYMBOLIC RULE ENGINE — 40 FIDIC 2017 RULES
═══════════════════════════════════════════════════════════════════════════ */
const RULES = [
  {id:"R001",p:10,cat:"procedural",cl:"20.2.1",name:"No Notice of Claim Submitted",cond:s=>s.notice_submitted===false,csq:()=>({out:"not_eligible",cd:-0.95,block:true}),exp:()=>"⛔ BLOCKING: No Notice of Claim submitted. Sub-Clause 20.2.1 requires notice ≤28 days after awareness. Sub-Clause 20.2.8: Employer discharged from all liability. Contractor loses ALL EOT and cost entitlement."},
  {id:"R002",p:10,cat:"procedural",cl:"20.2.1",name:"Notice of Claim — Time-Barred (>28d)",cond:s=>s.notice_submitted&&s.notice_days!=null&&s.notice_days>28,csq:s=>({out:"time_barred",cd:-0.93,block:true,days_late:s.notice_days-28}),exp:s=>`⛔ TIME-BARRED: Notice submitted ${s.notice_days}d after awareness — ${s.notice_days-28}d late. Sub-Clause 20.2.8: all EOT and cost entitlement extinguished.`},
  {id:"R003",p:10,cat:"procedural",cl:"20.2.1",name:"Notice of Claim — Compliant",cond:s=>s.notice_submitted&&s.notice_days!=null&&s.notice_days<=28,csq:()=>({out:null,cd:+0.22,block:false}),exp:s=>`✓ Notice of Claim compliant: submitted ${s.notice_days}d after awareness (limit 28d). Sub-Clause 20.2.1 satisfied.`},
  {id:"R004",p:10,cat:"procedural",cl:"20.2.1",name:"Notice Date Unknown",cond:s=>s.notice_submitted&&s.notice_days==null,csq:()=>({out:null,cd:-0.10,block:false}),exp:()=>"⚠ Notice submitted but date not provided. Cannot verify 28-day compliance. Confidence reduced."},
  {id:"R005",p:9,cat:"procedural",cl:"20.2.4",name:"No Fully Detailed Claim Submitted",cond:s=>s.notice_submitted&&s.detailed_claim_submitted===false,csq:()=>({out:"not_eligible",cd:-0.88,block:true}),exp:()=>"⛔ BLOCKING: Fully Detailed Claim not submitted. §20.2.4 requires: (a) event description, (b) contractual basis, (c) contemporary records, (d) quantum particulars — within 84 days."},
  {id:"R006",p:9,cat:"procedural",cl:"20.2.4",name:"Detailed Claim — Time-Barred (>84d)",cond:s=>s.detailed_claim_submitted&&s.detailed_days!=null&&s.detailed_days>84,csq:s=>({out:"time_barred",cd:-0.85,block:true}),exp:s=>`⛔ TIME-BARRED: Fully Detailed Claim submitted ${s.detailed_days}d after awareness. Exceeds 84-day limit by ${s.detailed_days-84}d. §20.2.8 consequences apply.`},
  {id:"R007",p:9,cat:"procedural",cl:"20.2.4",name:"Detailed Claim — Compliant",cond:s=>s.detailed_claim_submitted&&s.detailed_days!=null&&s.detailed_days<=84,csq:()=>({out:null,cd:+0.18,block:false}),exp:s=>`✓ Fully Detailed Claim compliant: submitted ${s.detailed_days}d after awareness (limit 84d). Sub-Clause 20.2.4 satisfied.`},
  {id:"R008",p:9,cat:"procedural",cl:"18.2",name:"§18.2 — Force Majeure 14-Day Notice",cond:s=>s.cause==="force_majeure",csq:s=>s.force_majeure_notice_given===false?({out:null,cd:-0.18,block:false}):s.force_majeure_notice_given===true?({out:null,cd:+0.12,block:false}):({out:null,cd:-0.05,block:false}),exp:s=>s.force_majeure_notice_given===false?"⛔ §18.2 Notice NOT given: Contractor must notify within 14 days of the Exceptional Event. Failure jeopardises cost entitlement.":s.force_majeure_notice_given===true?"✓ §18.2 Exceptional Event notice confirmed within 14 days. Cost entitlement preserved for §18.1(i)–(iv) events.":"⚠ §18.2 notice status unconfirmed. Force Majeure requires a separate 14-day notice under §18.2."},
  {id:"R010",p:8,cat:"entitlement",cl:"8.4",name:"§8.4(e) — Employer Impediment",cond:s=>["employer_delay","late_drawings","site_access","employer_instruction"].includes(s.cause),csq:()=>({out:"eligible",cd:+0.38,block:false,ground:"8.4(e)",cost:true}),exp:s=>`§8.4(e) GROUND ESTABLISHED: Delay/impediment attributable to Employer or Employer's Personnel. Cause: "${s.cause_description||s.cause}". Entitlement: EOT + Cost + Profit (Employer risk event).`},
  {id:"R011",p:8,cat:"entitlement",cl:"8.4",name:"§8.4(a) — Variation",cond:s=>["variation","scope_change","additional_works"].includes(s.cause),csq:()=>({out:"eligible",cd:+0.42,block:false,ground:"8.4(a)",cost:true}),exp:()=>"§8.4(a) GROUND ESTABLISHED: Variation instructed under §13.1. Entitlement: EOT + valuation under §13.3."},
  {id:"R012",p:8,cat:"entitlement",cl:"8.4",name:"§8.4(c) — Adverse Climate",cond:s=>s.cause==="adverse_climate",csq:()=>({out:"eligible",cd:+0.28,block:false,ground:"8.4(c)",cost:false}),exp:()=>"§8.4(c) GROUND: Exceptionally Adverse Climatic Conditions unforeseeable at Base Date. EOT only — no additional Cost."},
  {id:"R013",p:8,cat:"entitlement",cl:"8.4",name:"§8.4(d) — Epidemic/Government Shortage",cond:s=>s.cause==="epidemic_shortage",csq:()=>({out:"eligible",cd:+0.30,block:false,ground:"8.4(d)",cost:false}),exp:()=>"§8.4(d) GROUND: Unforeseeable shortage caused by epidemic or governmental actions. EOT only. Shared risk."},
  {id:"R014",p:8,cat:"entitlement",cl:"18.4",name:"§18.4 — Force Majeure",cond:s=>s.cause==="force_majeure",csq:()=>({out:"eligible",cd:+0.32,block:false,ground:"18.4 via 8.4(b)",cost:"conditional"}),exp:()=>"§18.4 EXCEPTIONAL EVENT: EOT under §8.4(b). Cost entitlement conditional on §18.1(i)–(iv) classification. Two notices required: §18.2 (14d) AND §20.2.1 (28d)."},
  {id:"R015",p:8,cat:"entitlement",cl:"8.5",name:"§8.5 — Authority Delay",cond:s=>s.cause==="authority_delay",csq:()=>({out:"eligible",cd:+0.27,block:false,ground:"8.5 via 8.4(b)",cost:true}),exp:()=>"§8.5 APPLIES: Delay by legally constituted public authority. Conditions: (a) Contractor diligently followed procedures; (b) delay was Unforeseeable. Employer risk — EOT + Cost."},
  {id:"R016",p:8,cat:"entitlement",cl:"8.9",name:"§8.9 — Engineer-Ordered Suspension",cond:s=>s.cause==="suspension",csq:()=>({out:"eligible",cd:+0.33,block:false,ground:"8.9 via 8.4(b)",cost:true}),exp:()=>"§8.9 SUSPENSION: Engineer-ordered suspension entitles EOT + Cost (+ Profit if Employer's risk). Employer risk."},
  {id:"R017",p:7,cat:"entitlement",cl:"8.4",name:"No §8.4 Ground Established",cond:s=>!["employer_delay","employer_instruction","late_drawings","site_access","variation","scope_change","additional_works","adverse_climate","epidemic_shortage","force_majeure","authority_delay","suspension"].includes(s.cause),csq:()=>({out:"not_eligible",cd:-0.55,block:false}),exp:s=>`No §8.4 entitlement ground recognised for: "${s.cause_description||s.cause}". EOT entitlement cannot be established without a recognised FIDIC 2017 cause.`},
  {id:"R018",p:7,cat:"entitlement",cl:"1.9",name:"§1.9/§2.1 — Prior Notice to Engineer",cond:s=>["late_drawings","site_access"].includes(s.cause),csq:s=>s.prior_notice_given===false?({out:null,cd:-0.14,block:false}):s.prior_notice_given===true?({out:null,cd:+0.10,block:false}):({out:null,cd:-0.04,block:false}),exp:s=>s.prior_notice_given===false?`⚠ §1.9/§2.1 Prior Notice absent: For a "${s.cause}" claim, Contractor should have notified Engineer in advance. Without prior notice, §8.4(e) entitlement chain is weakened.`:s.prior_notice_given===true?`✓ §1.9/§2.1 Prior Notice confirmed: Contractor notified Engineer. Strengthens §8.4(e) entitlement chain.`:`⚠ §1.9/§2.1 prior notice status unconfirmed. Verify advance notification to Engineer.`},
  {id:"R020",p:6,cat:"programme",cl:"8.3",name:"Programme Not Submitted",cond:s=>s.programme_submitted===false,csq:()=>({out:null,cd:-0.10,block:false}),exp:()=>"⚠ Baseline programme not submitted within 28 days (§8.3). Without baseline, critical path delay cannot be demonstrated. Significantly weakens quantum."},
  {id:"R021",p:6,cat:"programme",cl:"8.3",name:"Programme Not Updated After Delay",cond:s=>s.programme_submitted&&s.programme_updated_after_delay===false,csq:()=>({out:null,cd:-0.08,block:false}),exp:()=>"⚠ Programme not revised following delay event. §8.3 requires Contractor to show revised completion and recovery measures."},
  {id:"R022",p:6,cat:"programme",cl:"8.3",name:"Programme Compliant — Submitted & Updated",cond:s=>s.programme_submitted&&s.programme_updated_after_delay===true,csq:()=>({out:null,cd:+0.12,block:false}),exp:()=>"✓ Baseline programme submitted and updated after delay event (§8.3). Critical path impact properly demonstrated."},
  {id:"R024",p:6,cat:"programme",cl:"8.3",name:"§8.3 — No Critical Path Recovery in Update",cond:s=>s.programme_submitted&&s.programme_updated_after_delay===true&&s.critical_path_shown===false,csq:()=>({out:null,cd:-0.06,block:false}),exp:()=>"⚠ Programme updated but critical path recovery not demonstrated. §8.3 requires identifying revised completion and mitigation measures."},
  {id:"R030",p:5,cat:"quantum",cl:"8.4",name:"Concurrent Contractor Delay",cond:s=>(s.concurrent_contractor_delay??0)>0,csq:s=>({out:null,cd:-0.14,block:false,deduction:s.concurrent_contractor_delay}),exp:s=>`Concurrent contractor-responsible delay: ${s.concurrent_contractor_delay}d. FIDIC 2017 requires dominant-cause apportionment — not formulaic deduction. Indicative deduction applied: ${s.concurrent_contractor_delay}d.`},
  {id:"R031",p:5,cat:"quantum",cl:"8.4",name:"Critical Path Impact Demonstrated",cond:s=>s.critical_path_shown===true,csq:()=>({out:null,cd:+0.13,block:false}),exp:()=>"✓ Delay demonstrated on critical path (§8.4): completion 'is or will be delayed'. Critical path analysis supports EOT quantum."},
  {id:"R032",p:5,cat:"quantum",cl:"8.4",name:"Critical Path Impact Not Demonstrated",cond:s=>s.critical_path_shown===false,csq:()=>({out:null,cd:-0.13,block:false}),exp:()=>"⚠ Critical path impact not demonstrated. §8.4 entitles EOT only 'to the extent that completion is or will be delayed'. Float consumption does not entitle EOT."},
  {id:"R033",p:5,cat:"quantum",cl:"8.4",name:"Quantum Exceeds Calculated by >30%",cond:s=>s.requested_eot>0&&s.calculated_eot>0&&s.requested_eot>s.calculated_eot*1.30,csq:()=>({out:null,cd:-0.14,block:false}),exp:s=>`Requested EOT (${s.requested_eot}d) exceeds calculated impact (${s.calculated_eot}d) by ${Math.round(((s.requested_eot/s.calculated_eot)-1)*100)}%. Engineer will likely reduce to calculated amount.`},
  {id:"R034",p:5,cat:"quantum",cl:"8.4",name:"Quantum Within Defensible Range",cond:s=>s.requested_eot>0&&s.calculated_eot>0&&s.requested_eot<=s.calculated_eot*1.15&&s.requested_eot>=s.calculated_eot*0.75,csq:()=>({out:null,cd:+0.10,block:false}),exp:s=>`✓ Requested EOT (${s.requested_eot}d) within defensible range of calculated impact (${s.calculated_eot}d). Quantum proportionate.`},
  {id:"R035",p:5,cat:"quantum",cl:"8.4",name:"No EOT Quantum Quantified",cond:s=>!s.requested_eot||s.requested_eot===0,csq:()=>({out:null,cd:-0.20,block:false}),exp:()=>"⚠ No EOT days quantified. §20.2.4(d) requires detailed supporting particulars including the EOT period."},
  {id:"R037",p:5,cat:"quantum",cl:"8.4",name:"Claim Potentially Undervalued",cond:s=>s.requested_eot>0&&s.calculated_eot>0&&s.requested_eot<s.calculated_eot*0.70,csq:()=>({out:null,cd:0,block:false}),exp:s=>`⚠ Requested EOT (${s.requested_eot}d) is significantly below calculated impact (${s.calculated_eot}d) — only ${Math.round((s.requested_eot/s.calculated_eot)*100)}% of calculated delay. Contractor may be undervaluing entitlement.`},
  {id:"R040",p:4,cat:"evidence",cl:"20.2.2",name:"Contemporary Records — Strong (≥4)",cond:s=>(s.contemporary_records??0)>=4,csq:()=>({out:null,cd:+0.12,block:false}),exp:s=>`✓ ${s.contemporary_records} contemporary record items (§20.2.2). Strong evidential base.`},
  {id:"R041",p:4,cat:"evidence",cl:"20.2.2",name:"Contemporary Records — Adequate (2–3)",cond:s=>(s.contemporary_records??0)>=2&&(s.contemporary_records??0)<4,csq:()=>({out:null,cd:+0.05,block:false}),exp:s=>`${s.contemporary_records} contemporary record items. Adequate — Engineer may request additional under §20.2.3.`},
  {id:"R042",p:4,cat:"evidence",cl:"20.2.2",name:"Contemporary Records — Insufficient (<2)",cond:s=>(s.contemporary_records??0)<2,csq:()=>({out:null,cd:-0.14,block:false}),exp:()=>"⚠ Insufficient contemporary records. §20.2.2 obliges Contractor to keep daily records. Engineer may disallow or reduce claim."},
  {id:"R043",p:4,cat:"evidence",cl:"20.2.4",name:"Contractual Basis Clearly Stated",cond:s=>s.contractual_basis_stated===true,csq:()=>({out:null,cd:+0.08,block:false}),exp:()=>"✓ Contractual basis clearly stated in detailed claim (§20.2.4(b)). FIDIC clause references properly identified."},
  {id:"R044",p:4,cat:"evidence",cl:"20.2.4",name:"Contractual Basis Not Stated",cond:s=>s.contractual_basis_stated===false,csq:()=>({out:null,cd:-0.10,block:false}),exp:()=>"⚠ Contractual basis not stated. §20.2.4(b) requires clause references. Engineer may request further information under §20.2.6."},
  {id:"R046",p:4,cat:"evidence",cl:"20.2.4",name:"Contemporary Records Not Attached",cond:s=>(s.contemporary_records??0)>=2&&s.records_attached_to_claim===false,csq:()=>({out:null,cd:-0.08,block:false}),exp:()=>"⚠ Contemporary records exist but NOT formally attached. §20.2.4(c) requires records submitted with claim as annexures."},
  {id:"R050",p:3,cat:"determination",cl:"3.7",name:"§3.7 Agreement Period Exceeded (>42d)",cond:s=>(s.days_since_detailed_claim??0)>42,csq:()=>({out:null,cd:0,block:false}),exp:s=>`${s.days_since_detailed_claim}d since Detailed Claim. §3.7.3: 42-day agreement period expired — Engineer must issue formal Determination. DAAB referral available under §21.4.`},
  {id:"R051",p:3,cat:"determination",cl:"3.7",name:"§3.7 Within Agreement Period (≤42d)",cond:s=>(s.days_since_detailed_claim??0)>0&&(s.days_since_detailed_claim??0)<=42,csq:()=>({out:null,cd:+0.04,block:false}),exp:s=>`Within 42-day agreement period (§3.7.3). ${42-(s.days_since_detailed_claim??0)} days remaining before formal Determination required.`},
  {id:"R060",p:2,cat:"mitigation",cl:"8.4",name:"Mitigation Evidence Available",cond:s=>s.mitigation_evidence===true,csq:()=>({out:null,cd:+0.07,block:false}),exp:()=>"✓ Evidence of mitigation measures available. Contractor demonstrated reasonable steps to minimise delay. Strengthens EOT case."},
  {id:"R061",p:2,cat:"mitigation",cl:"8.4",name:"No Mitigation Evidence",cond:s=>s.mitigation_evidence===false,csq:()=>({out:null,cd:-0.07,block:false}),exp:()=>"⚠ No mitigation evidence documented. Engineer may reduce EOT quantum if Contractor failed to take reasonable steps."},
  {id:"R070",p:1,cat:"aggregation",cl:"8.4",name:"Multi-Cause Compound Claim",cond:s=>Array.isArray(s.all_causes)&&s.all_causes.length>1,csq:s=>({out:null,cd:+0.03,block:false}),exp:s=>`Multiple delay causes (${s.all_causes.length}): [${s.all_causes.join(", ")}]. Each requires separate notice and particulars.`},
  {id:"R071",p:1,cat:"aggregation",cl:"8.4",name:"Single-Cause Assessment",cond:s=>!Array.isArray(s.all_causes)||s.all_causes.length<=1,csq:()=>({out:null,cd:+0.02,block:false}),exp:()=>"Single delay cause — straightforward §8.4 assessment. No concurrent cause complexity."},
];

class SymbolicRuleEngine {
  constructor(kg){this.kg=kg;this.sorted=[...RULES].sort((a,b)=>b.p-a.p);}
  evaluate(state){
    const t0=performance.now();const fired=[],chain=[];let conf=0.50,blocked=false,blockBy=null;const votes={};
    const kgCl=this.kg.clausesForCause(state.cause);const kgRisk=this.kg.riskForCause(state.cause);
    const s={...state,kg_clauses:kgCl,kg_risk:kgRisk};
    for(const rule of this.sorted){
      let fires=false;try{fires=rule.cond(s);}catch(_){}
      if(fires){
        let csq={};try{csq=rule.csq(s);}catch(_){}let exp="";try{exp=rule.exp(s);}catch(_){}
        conf=Math.min(0.99,Math.max(0.01,conf+(csq.cd??0)));
        if(csq.out)votes[csq.out]=(votes[csq.out]??0)+Math.abs(csq.cd??0);
        if(csq.block){blocked=true;blockBy=rule;}
        fired.push({id:rule.id,name:rule.name,cl:rule.cl,cat:rule.cat,p:rule.p,csq,exp,conf_after:+conf.toFixed(3)});
        chain.push({step:chain.length+1,rule_id:rule.id,cl:rule.cl,cat:rule.cat,exp,conf_after:+conf.toFixed(3),delta:csq.cd??0});
      }
    }
    let outcome="insufficient_info";
    if(blocked&&blockBy){try{outcome=blockBy.csq(s).out??"not_eligible";}catch(_){outcome="not_eligible";}}
    else{const top=Object.entries(votes).sort((a,b)=>b[1]-a[1])[0];if(top)outcome=top[0];}
    const quantum=this._quantum(s,fired);
    return{outcome,confidence:Math.round(conf*100),confidence_raw:conf,fired_rules:fired,reasoning_chain:chain,rules_evaluated:this.sorted.length,rules_fired:fired.length,blocked,blocking_rule:blockBy?.id??null,quantum,outcome_votes:votes,processing_ms:+(performance.now()-t0).toFixed(2),kg_risk:kgRisk,kg_clauses:kgCl};
  }
  _quantum(s,fired){
    let days=s.requested_eot||0;const ded=[];
    if((s.concurrent_contractor_delay??0)>0){ded.push({reason:"Concurrent contractor delay — indicative apportionment (§8.4)",days:s.concurrent_contractor_delay});days=Math.max(0,days-s.concurrent_contractor_delay);}
    if(s.programme_updated_after_delay===false&&days>0){const u=Math.round(days*0.10);ded.push({reason:"Programme not updated — 10% uncertainty adjustment (§8.3)",days:u});days=Math.max(0,days-u);}
    if(s.critical_path_shown===false&&days>0){const r=Math.round(days*0.15);ded.push({reason:"Critical path impact undemonstrated — 15% conservative reduction",days:r});days=Math.max(0,days-r);}
    return{requested:s.requested_eot||0,recommended:Math.round(days),deductions:ded};
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   PIPELINE FUNCTIONS
═══════════════════════════════════════════════════════════════════════════ */
function heuristicExtract(input){
  const t=((input.narrative||"")+(input.delay_event||"")).toLowerCase();
  const cause=t.includes("variation")||t.includes("scope change")?"variation":t.includes("additional work")?"additional_works":t.includes("drawing")||t.includes("instruction")?"late_drawings":t.includes("site access")||t.includes("possession")?"site_access":t.includes("employer instruction")?"employer_instruction":t.includes("force majeure")||t.includes("exceptional")?"force_majeure":t.includes("suspension")?"suspension":t.includes("authority")||t.includes("government")?"authority_delay":t.includes("climate")||t.includes("weather")||t.includes("flood")?"adverse_climate":t.includes("epidemic")||t.includes("covid")||t.includes("pandemic")?"epidemic_shortage":input.cause||"employer_delay";
  return{cause,cause_description:input.delay_event||input.narrative?.slice(0,120)||"",notice_submitted:input.notice_submitted??true,notice_days:input.notice_days??null,detailed_claim_submitted:input.detailed_claim_submitted??true,detailed_days:input.detailed_days??null,programme_submitted:input.programme_submitted??true,programme_updated_after_delay:input.programme_updated_after_delay??false,critical_path_shown:input.critical_path_shown??false,concurrent_contractor_delay:input.concurrent_contractor_delay??0,contemporary_records:input.contemporary_records??2,contractual_basis_stated:input.contractual_basis_stated??true,mitigation_evidence:input.mitigation_evidence??false,records_attached_to_claim:input.records_attached_to_claim??true,force_majeure_notice_given:input.force_majeure_notice_given??null,prior_notice_given:input.prior_notice_given??null,requested_eot:input.requested_eot??0,calculated_eot:input.calculated_eot??input.requested_eot??0,days_since_detailed_claim:input.days_since_detailed_claim??0,all_causes:[cause],extraction_confidence:0.65,method:"heuristic"};
}

async function neuralExtract(input,files,setMsg){
  if(input._forceHeuristic)return heuristicExtract(input);
  try{
    setMsg?.("Stage 1/4: LLM extracting structured claim state…");
    const sys=`You are a FIDIC 2017 EOT claim parser. Return ONLY valid JSON — no markdown, no text outside JSON.\nKeys: {"cause":"employer_delay|employer_instruction|late_drawings|site_access|variation|scope_change|additional_works|force_majeure|suspension|authority_delay|adverse_climate|epidemic_shortage","cause_description":"string","notice_submitted":bool,"notice_days":int|null,"detailed_claim_submitted":bool,"detailed_days":int|null,"programme_submitted":bool,"programme_updated_after_delay":bool,"critical_path_shown":bool,"concurrent_contractor_delay":int,"contemporary_records":int,"contractual_basis_stated":bool,"mitigation_evidence":bool,"records_attached_to_claim":bool,"force_majeure_notice_given":bool|null,"prior_notice_given":bool|null,"requested_eot":int,"calculated_eot":int,"days_since_detailed_claim":int,"all_causes":["string"],"extraction_confidence":0.0-1.0}`;
    const content=[];
    for(const f of(files||[])){if(!f?.base64)continue;if(f.type==="application/pdf")content.push({type:"document",source:{type:"base64",media_type:"application/pdf",data:f.base64}});else if(f.type?.startsWith("image/"))content.push({type:"image",source:{type:"base64",media_type:f.type,data:f.base64}});}
    content.push({type:"text",text:`Extract EOT claim facts:\n${input.narrative||JSON.stringify(input)}`});
    const res=await fetch("https://axiom-proxy.axiomeot.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:sys,messages:[{role:"user",content}]})});
    const data=await res.json();const raw=data.content?.map(b=>b.text||"").join("")||"";
    const si=raw.indexOf("{"),ei=raw.lastIndexOf("}");
    if(si>=0&&ei>si){const p=JSON.parse(raw.slice(si,ei+1));return{...heuristicExtract(input),...p,method:"llm"};}
  }catch(_){}
  return heuristicExtract(input);
}

function generateTrace(extraction,ruleResult,kgStats,inputMeta){
  const steps=[];
  steps.push({stage:1,type:"neural",icon:"⬡",color:"#A78BFA",label:"Neural Extraction (LLM)",sub:`Method: ${extraction.method==="llm"?"Claude LLM":"Heuristic fallback"} · Confidence: ${Math.round((extraction.extraction_confidence??0.65)*100)}%`,items:[`Cause identified: ${extraction.cause}`,`Description: ${extraction.cause_description?.slice(0,90)||"—"}`,`Notice submitted: ${extraction.notice_submitted}`,`Requested EOT: ${extraction.requested_eot}d`,`Documents parsed: ${inputMeta?.file_count??0}`],confidence:extraction.extraction_confidence??0.65});
  const clauseLabels=(ruleResult.kg_clauses||[]).map(c=>c?.label).filter(Boolean);
  steps.push({stage:2,type:"symbolic",icon:"◈",color:"#38BDF8",label:"Knowledge Graph Enrichment",sub:`${kgStats.total_nodes} nodes · ${kgStats.total_edges} edges · ${kgStats.traversals} traversals`,items:[`Cause → Ground: ${ruleResult.kg_risk?.label??"unknown"}`,`Activated clauses: ${clauseLabels.join(", ")||"none"}`,`Risk allocation: ${ruleResult.kg_risk?.label||"—"}`,`Cost entitlement: ${ruleResult.kg_risk?.props?.cost?"Yes":"No"}`,`KG edge hits: ${kgStats.edge_hits??0}`],confidence:1.0});
  ruleResult.reasoning_chain.forEach(step=>{const fr=ruleResult.fired_rules.find(r=>r.id===step.rule_id);steps.push({stage:3,type:"symbolic",icon:"§",color:"#34D399",label:`Rule ${step.rule_id}`,sub:`§${step.cl} · ${step.cat} · Δconf ${step.delta>=0?"+":""}${step.delta}`,items:[step.exp],confidence:step.conf_after,is_rule:true,blocking:fr?.csq?.block});});
  const q=ruleResult.quantum;
  steps.push({stage:4,type:"symbolic",icon:"⊙",color:"#F59E0B",label:"EOT Quantum Calculation",sub:`${q.requested}d requested → ${q.recommended}d recommended`,items:[`Requested: ${q.requested} calendar days`,...q.deductions.map(d=>`Deduction: −${d.days}d — ${d.reason}`),`RECOMMENDED GRANT: ${q.recommended} calendar days`],confidence:ruleResult.confidence_raw});
  steps.push({stage:5,type:"decision",icon:"⊛",color:"#E8A020",label:"Final Determination",sub:`${ruleResult.outcome.toUpperCase()} | ${ruleResult.confidence}% confidence`,items:[`Outcome: ${ruleResult.outcome}`,`Rules evaluated: ${ruleResult.rules_evaluated}`,`Rules fired: ${ruleResult.rules_fired}`,`Blocking rule: ${ruleResult.blocking_rule??"none"}`,`Confidence: ${ruleResult.confidence}%`,`Recommended EOT: ${q.recommended}d`],confidence:ruleResult.confidence_raw,is_final:true});
  return{steps,summary:{final_outcome:ruleResult.outcome,final_conf:ruleResult.confidence,recommended_eot:q.recommended,risk_bearer:ruleResult.kg_risk?.label||"—",cost_entitled:ruleResult.kg_risk?.props?.cost??false}};
}

async function runPipeline(input,files,setMsg){
  const kg=new KnowledgeGraph().load(FIDIC_KB);const engine=new SymbolicRuleEngine(kg);kg.resetMetrics();
  const t0=performance.now();
  const extraction=await neuralExtract(input,files,setMsg);const t1=performance.now();
  setMsg?.("Stage 2/4: Knowledge Graph traversal…");const kgStats=kg.stats();const t2=performance.now();
  setMsg?.("Stage 3/4: Symbolic rule evaluation…");const ruleResult=engine.evaluate(extraction);const t3=performance.now();
  setMsg?.("Stage 4/4: Building explainability trace…");const inputMeta={file_count:(files||[]).length};
  const trace=generateTrace(extraction,ruleResult,kgStats,inputMeta);const t4=performance.now();
  setMsg?.(null);const llmCalls=extraction.method==="llm"?1:0;
  return{extraction,kgStats,ruleResult,trace,inputMeta,metrics:{total_ms:+(t4-t0).toFixed(1),neural_ms:+(t1-t0).toFixed(1),kg_ms:+(t2-t1).toFixed(1),rule_ms:+(t3-t2).toFixed(1),explain_ms:+(t4-t3).toFixed(1),llm_calls:llmCalls,rules_evaluated:ruleResult.rules_evaluated,rules_fired:ruleResult.rules_fired,kg_traversals:kgStats.traversals,kg_edge_hits:kgStats.edge_hits,kg_nodes:kgStats.total_nodes,kg_edges:kgStats.total_edges,symbolic_ratio:+(ruleResult.rules_evaluated/(ruleResult.rules_evaluated+llmCalls)).toFixed(3),files_processed:(files||[]).length}};
}

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN SYSTEM v5 — "Axiom Precision"
   Typography: DM Sans (UI) + JetBrains Mono (data)
   Palette: Deep Void dark / Pure Parchment light
   Accent: Amber #E8A020 primary · Sky Cyan #38BDF8 secondary
   Layout: Sidebar-first, glass cards, gradient borders
═══════════════════════════════════════════════════════════════════════════ */

const T = {
  dark: {
    isDark: true,
    bg:           "#060A12",
    bgDeep:       "#030608",
    surface:      "#0B1120",
    surface2:     "#0F1828",
    surface3:     "#141F32",
    surface4:     "#1A2840",
    surfaceHover: "#1E2E48",
    border:       "#1C2D44",
    borderHi:     "#263D5E",
    borderFocus:  "#3B5C8C",
    glass:        "rgba(11,17,32,0.85)",
    amber:        "#E8A020",
    amberBright:  "#F5C840",
    amberGlow:    "rgba(232,160,32,0.18)",
    amberDim:     "rgba(232,160,32,0.08)",
    amberBorder:  "rgba(232,160,32,0.25)",
    cyan:         "#38BDF8",
    cyanGlow:     "rgba(56,189,248,0.14)",
    cyanDim:      "rgba(56,189,248,0.07)",
    emerald:      "#34D399",
    emeraldGlow:  "rgba(52,211,153,0.14)",
    rose:         "#FB7185",
    roseGlow:     "rgba(251,113,133,0.14)",
    violet:       "#A78BFA",
    violetGlow:   "rgba(167,139,250,0.14)",
    orange:       "#FB923C",
    orangeGlow:   "rgba(251,146,60,0.14)",
    text:         "#E4EBF5",
    textSub:      "#8FA3BE",
    textMuted:    "#4E6480",
    textGhost:    "#1E3050",
    shadow:       "0 12px 40px rgba(0,0,0,0.7)",
    shadowSm:     "0 3px 14px rgba(0,0,0,0.5)",
    shadowCard:   "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)",
    gridLine:     "rgba(255,255,255,0.025)",
  },
  light: {
    isDark: false,
    bg:           "#F4F1EC",
    bgDeep:       "#E8E4DC",
    surface:      "#FFFFFF",
    surface2:     "#F0EDE6",
    surface3:     "#E4DFD6",
    surface4:     "#D6D0C6",
    surfaceHover: "#EBE7DF",
    border:       "#D0C8BC",
    borderHi:     "#A89E8E",
    borderFocus:  "#8C7B62",
    glass:        "rgba(255,255,255,0.90)",
    amber:        "#B56800",
    amberBright:  "#8F5200",
    amberGlow:    "rgba(181,104,0,0.14)",
    amberDim:     "rgba(181,104,0,0.07)",
    amberBorder:  "rgba(181,104,0,0.25)",
    cyan:         "#0369A1",
    cyanGlow:     "rgba(3,105,161,0.12)",
    cyanDim:      "rgba(3,105,161,0.06)",
    emerald:      "#059669",
    emeraldGlow:  "rgba(5,150,105,0.12)",
    rose:         "#E11D48",
    roseGlow:     "rgba(225,29,72,0.12)",
    violet:       "#7C3AED",
    violetGlow:   "rgba(124,58,237,0.12)",
    orange:       "#C2410C",
    orangeGlow:   "rgba(194,65,12,0.12)",
    text:         "#0F1923",
    textSub:      "#374151",
    textMuted:    "#6B7280",
    textGhost:    "#C0C8D0",
    shadow:       "0 6px 24px rgba(0,0,0,0.12)",
    shadowSm:     "0 2px 10px rgba(0,0,0,0.08)",
    shadowCard:   "0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)",
    gridLine:     "rgba(0,0,0,0.05)",
  }
};

const catColors = (t) => ({
  procedural:   t.rose,
  entitlement:  t.emerald,
  programme:    t.amber,
  quantum:      t.orange,
  evidence:     t.cyan,
  determination:t.violet,
  mitigation:   t.textSub,
  aggregation:  t.textMuted,
});

const outcomeConfig = {
  eligible:          { label:"ELIGIBLE",        emoji:"✓", shade:"emerald" },
  not_eligible:      { label:"NOT ELIGIBLE",    emoji:"✕", shade:"rose"    },
  time_barred:       { label:"TIME BARRED",     emoji:"⛔", shade:"rose"  },
  partial:           { label:"PARTIAL",         emoji:"◑", shade:"amber"  },
  insufficient_info: { label:"INSUFF. INFO",    emoji:"?", shade:"sub"    },
};

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════════════════════ */
function GlobalStyles({ t }) {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,300;1,9..40,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { font-size: 16px; -webkit-font-smoothing: antialiased; scroll-behavior: smooth; }
      body { background: ${t.bg}; color: ${t.text}; font-family: 'DM Sans', system-ui, sans-serif; line-height: 1.5; }
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { background: ${t.borderHi}; }
      select option { background: ${t.surface2}; color: ${t.text}; }
      input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
      input[type=checkbox] { accent-color: ${t.amber}; width: 14px; height: 14px; cursor: pointer; }
      input[type=radio] { accent-color: ${t.amber}; cursor: pointer; }
      ::placeholder { color: ${t.textGhost} !important; opacity: 1; }
      button { font-family: 'DM Sans', system-ui, sans-serif; }

      @keyframes fadeUp   { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
      @keyframes spin     { to { transform: rotate(360deg); } }
      @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
      @keyframes shimmer  { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      @keyframes scaleIn  { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } }
      @keyframes slideRight { from { width:0; } to { width:100%; } }
      @keyframes slideIn  { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
      @keyframes glow     { 0%,100% { opacity:0.7; } 50% { opacity:1; } }

      .card-anim { animation: fadeUp 0.22s ease; }
      .shimmer-bar {
        background: linear-gradient(90deg, transparent 0%, ${t.borderHi} 50%, transparent 100%);
        background-size: 200% 100%;
        animation: shimmer 1.6s infinite;
      }
      .hoverable { transition: background 0.12s, border-color 0.12s; }
      .hoverable:hover { background: ${t.surface3} !important; border-color: ${t.borderHi} !important; }

      .grid-bg {
        background-image: radial-gradient(circle at 1px 1px, ${t.gridLine} 1px, transparent 0);
        background-size: 28px 28px;
      }

      .outcome-chip-emerald { background: ${t.emeraldGlow}; color: ${t.emerald}; border: 1px solid ${t.emerald}30; }
      .outcome-chip-rose    { background: ${t.roseGlow}; color: ${t.rose}; border: 1px solid ${t.rose}30; }
      .outcome-chip-amber   { background: ${t.amberGlow}; color: ${t.amber}; border: 1px solid ${t.amberBorder}; }
      .outcome-chip-sub     { background: ${t.surface3}; color: ${t.textSub}; border: 1px solid ${t.border}; }

      /* Sidebar transitions */
      .sidebar-nav-item { transition: background 0.12s, color 0.12s, border-color 0.12s; }
      .sidebar-nav-item:hover { background: ${t.surface3} !important; color: ${t.text} !important; }
    `}</style>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRIMITIVE COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

// Mono label
const ML = ({ children, t, color, size=9, mb=6 }) => (
  <div style={{ fontSize:size, fontFamily:"'JetBrains Mono',monospace", color: color||t.textMuted, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:mb, fontWeight:700 }}>
    {children}
  </div>
);

// Card
const Card = ({ children, style={}, className="card-anim", glow, t, noPad }) => (
  <div className={className} style={{ background: t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding: noPad ? 0 : 18, boxShadow: glow ? `0 0 0 1px ${t.amberBorder}, ${t.shadowSm}` : t.shadowCard, ...style }}>
    {children}
  </div>
);

// Badge
const Badge = ({ children, t, color, sm, glow }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:3, padding: sm ? "1px 6px" : "2px 8px", background: (color||t.amber)+"16", border:`1px solid ${(color||t.amber)}28`, borderRadius:4, color: color||t.amber, fontSize: sm ? 9 : 10, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", boxShadow: glow ? `0 0 10px ${(color||t.amber)}33` : "none" }}>
    {children}
  </span>
);

// Outcome chip
const OutcomeChip = ({ outcome, t, lg }) => {
  const cfg = outcomeConfig[outcome] || outcomeConfig.insufficient_info;
  const shadeMap = { emerald: t.emerald, rose: t.rose, amber: t.amber, sub: t.textSub };
  const c = shadeMap[cfg.shade] || t.textSub;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding: lg ? "6px 14px" : "3px 10px", background: c+"18", border:`1px solid ${c}30`, borderRadius:6, color:c, fontSize: lg ? 14 : 10, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:"0.08em" }}>
      <span>{cfg.emoji}</span> {cfg.label}
    </span>
  );
};

// Progress bar
const ProgressBar = ({ value, max=100, color, t, height=5, animated }) => {
  const pct = Math.min(100, Math.round((value/max)*100));
  const c = color || (pct >= 70 ? t.emerald : pct >= 40 ? t.amber : t.rose);
  return (
    <div style={{ height, background: t.surface3, borderRadius:height, overflow:"hidden" }}>
      <div style={{ width:`${pct}%`, height, background:`linear-gradient(90deg, ${c}CC, ${c})`, borderRadius:height, transition: animated ? "width 0.8s cubic-bezier(0.34,1.56,0.64,1)" : "none", boxShadow:`0 0 6px ${c}44` }} />
    </div>
  );
};

// Confidence arc (SVG gauge)
const ConfidenceArc = ({ pct, t, size=88 }) => {
  const c = pct>=70 ? t.emerald : pct>=50 ? t.amber : t.rose;
  const r = 32; const circ = 2*Math.PI*r;
  const arcLen = (pct/100)*circ*0.75;
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.surface3} strokeWidth="5" strokeDasharray={`${circ*0.75} ${circ}`} strokeLinecap="round" transform={`rotate(135 ${size/2} ${size/2})`} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth="5" strokeDasharray={`${arcLen} ${circ}`} strokeLinecap="round" transform={`rotate(135 ${size/2} ${size/2})`} style={{ filter:`drop-shadow(0 0 5px ${c}88)`, transition:"stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", paddingTop:4 }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:17, fontWeight:700, color:c, lineHeight:1 }}>{pct}</div>
        <div style={{ fontSize:8, color:t.textMuted, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.1em" }}>CONF%</div>
      </div>
    </div>
  );
};

// Toggle / switch
const Toggle = ({ checked, onChange, label, note, t }) => (
  <label style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:10, cursor:"pointer", userSelect:"none" }}>
    <div style={{ position:"relative", width:36, height:19, flexShrink:0, marginTop:2 }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity:0, width:0, height:0, position:"absolute" }} />
      <div onClick={onChange} style={{ position:"absolute", inset:0, background:checked?`linear-gradient(135deg, ${t.amber}, ${t.amberBright})`:t.surface3, borderRadius:10, border:`1px solid ${checked?t.amber:t.border}`, transition:"all 0.18s", boxShadow:checked?`0 0 8px ${t.amberGlow}`:t.shadowCard }}>
        <div style={{ position:"absolute", top:2, left:checked?16:2, width:13, height:13, background:checked?(t.isDark?"#0A0800":"#fff"):t.isDark?"#fff":"#9CA3AF", borderRadius:"50%", transition:"left 0.18s, background 0.18s", boxShadow:"0 1px 3px rgba(0,0,0,0.3)" }} />
      </div>
    </div>
    <div>
      <div style={{ fontSize:12, color:t.text, fontWeight:500 }}>{label}</div>
      {note && <div style={{ fontSize:10, color:t.textMuted, marginTop:1 }}>{note}</div>}
    </div>
  </label>
);

// Input field
const Inp = ({ label, value, onChange, type="text", placeholder, note, t, right }) => (
  <div style={{ marginBottom:13 }}>
    {label && (
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <ML t={t} mb={0}>{label}</ML>
        {right && <span style={{ fontSize:9, color:t.textSub, fontFamily:"'JetBrains Mono',monospace" }}>{right}</span>}
      </div>
    )}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ width:"100%", background:t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:"8px 12px", color:t.text, fontFamily:"'DM Sans',sans-serif", fontSize:13, outline:"none", transition:"border-color 0.15s, box-shadow 0.15s" }}
      onFocus={e=>{e.target.style.borderColor=t.borderFocus;e.target.style.boxShadow=`0 0 0 3px ${t.amberDim}`;}}
      onBlur={e=>{e.target.style.borderColor=t.border;e.target.style.boxShadow="none";}} />
    {note && <div style={{ fontSize:10, color:t.textMuted, marginTop:3 }}>{note}</div>}
  </div>
);

// Select
const Sel = ({ label, value, onChange, options, t }) => (
  <div style={{ marginBottom:13 }}>
    {label && <ML t={t}>{label}</ML>}
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ width:"100%", background:t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:"8px 12px", color:t.text, fontFamily:"'DM Sans',sans-serif", fontSize:13, outline:"none", cursor:"pointer" }}
      onFocus={e=>{e.target.style.borderColor=t.borderFocus;}}
      onBlur={e=>{e.target.style.borderColor=t.border;}}>
      {options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>
);

// Textarea
const Txt = ({ label, value, onChange, rows=4, placeholder, t }) => (
  <div style={{ marginBottom:13 }}>
    {label && <ML t={t}>{label}</ML>}
    <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows} placeholder={placeholder}
      style={{ width:"100%", background:t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:"8px 12px", color:t.text, fontFamily:"'DM Sans',sans-serif", fontSize:13, outline:"none", resize:"vertical", lineHeight:1.65, transition:"border-color 0.15s, box-shadow 0.15s" }}
      onFocus={e=>{e.target.style.borderColor=t.borderFocus;e.target.style.boxShadow=`0 0 0 3px ${t.amberDim}`;}}
      onBlur={e=>{e.target.style.borderColor=t.border;e.target.style.boxShadow="none";}} />
  </div>
);

// Button
const Btn = ({ children, onClick, variant="primary", sm, disabled, loading, full, t, icon, title }) => {
  const styles = {
    primary:   { bg:`linear-gradient(135deg, ${t.amber}, ${t.amberBright})`, color: t.isDark?"#0A0800":"#fff", border:"none", shadow:`0 3px 14px ${t.amberGlow}` },
    secondary: { bg:"transparent", color:t.textSub, border:`1px solid ${t.border}`, shadow:"none" },
    ghost:     { bg:t.surface2, color:t.text, border:`1px solid ${t.border}`, shadow:t.shadowCard },
    danger:    { bg:t.roseGlow, color:t.rose, border:`1px solid ${t.rose}28`, shadow:"none" },
    cyan:      { bg:t.cyanDim, color:t.cyan, border:`1px solid ${t.cyan}28`, shadow:"none" },
  };
  const s = styles[variant] || styles.primary;
  return (
    <button onClick={onClick} disabled={disabled||loading} title={title}
      style={{ background:s.bg, color:s.color, border:s.border||"none", borderRadius:8, padding:sm?"4px 11px":"8px 16px", fontSize:sm?10:12, fontFamily:"'DM Sans',sans-serif", fontWeight:600, cursor:disabled||loading?"not-allowed":"pointer", opacity:disabled?0.45:1, letterSpacing:"0.02em", width:full?"100%":"auto", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:5, boxShadow:disabled?"none":s.shadow, transition:"all 0.14s ease" }}
      onMouseEnter={e=>{if(!disabled&&!loading){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.filter="brightness(1.06)";}}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.filter="none";}}>
      {loading ? <><span style={{ animation:"spin 0.8s linear infinite", display:"inline-block", fontSize:12 }}>◌</span> Processing…</> : <>{icon&&<span style={{ fontSize:sm?11:13 }}>{icon}</span>}{children}</>}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   AXIOM LOGO MARK
═══════════════════════════════════════════════════════════════════════════ */
function AxiomLogo({ t, size=32, showText=true, collapsed=false }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap: collapsed ? 0 : 10 }}>
      {/* Geometric hex mark */}
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer hexagon */}
        <path d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z" stroke={t.amber} strokeWidth="1.5" fill="none" opacity="0.6"/>
        {/* Inner diamond */}
        <path d="M16 8 L23 16 L16 24 L9 16 Z" stroke={t.amber} strokeWidth="1.5" fill={t.amberDim} />
        {/* Center dot */}
        <circle cx="16" cy="16" r="2.5" fill={t.amber} />
        {/* Cross lines */}
        <line x1="16" y1="10" x2="16" y2="13" stroke={t.amber} strokeWidth="1" opacity="0.5"/>
        <line x1="16" y1="19" x2="16" y2="22" stroke={t.amber} strokeWidth="1" opacity="0.5"/>
        <line x1="10" y1="16" x2="13" y2="16" stroke={t.amber} strokeWidth="1" opacity="0.5"/>
        <line x1="19" y1="16" x2="22" y2="16" stroke={t.amber} strokeWidth="1" opacity="0.5"/>
      </svg>
      {showText && !collapsed && (
        <div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, fontWeight:800, color:t.amber, letterSpacing:"0.14em", lineHeight:1, textShadow:`0 0 18px ${t.amberGlow}` }}>AXIOM</div>
          <div style={{ fontSize:8, color:t.textMuted, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.16em", textTransform:"uppercase", marginTop:1 }}>v5 · FIDIC 2017</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SIDEBAR NAVIGATION
═══════════════════════════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { id:"dashboard", label:"Dashboard",   icon:"⊞", desc:"Overview & stats" },
  { id:"analyse",   label:"Analyse",     icon:"◈", desc:"EOT claim analysis" },
  { id:"results",   label:"Results",     icon:"§", desc:"Reasoning trace" },
  { id:"metrics",   label:"Metrics",     icon:"⊙", desc:"Pipeline benchmarks" },
  { id:"determine", label:"Determine",   icon:"⊛", desc:"§3.7.3 letter" },
  { id:"kg",        label:"KG Explorer", icon:"◉", desc:"Knowledge graph" },
  { id:"about",     label:"About",       icon:"◎", desc:"Architecture" },
];

function Sidebar({ view, setView, t, collapsed, onToggle, result }) {
  const SIDEBAR_W = collapsed ? 60 : 220;
  return (
    <div style={{ width:SIDEBAR_W, flexShrink:0, height:"100vh", background:t.surface, borderRight:`1px solid ${t.border}`, display:"flex", flexDirection:"column", transition:"width 0.2s ease", overflow:"hidden", position:"sticky", top:0 }}>
      {/* Logo area */}
      <div style={{ padding: collapsed ? "18px 14px" : "18px 20px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent: collapsed ? "center" : "space-between" }}>
        <AxiomLogo t={t} size={28} collapsed={collapsed} />
        {!collapsed && (
          <button onClick={onToggle} style={{ background:"none", border:"none", cursor:"pointer", color:t.textMuted, fontSize:14, padding:4, display:"flex", alignItems:"center", lineHeight:1 }}
            onMouseEnter={e=>{e.currentTarget.style.color=t.text;}} onMouseLeave={e=>{e.currentTarget.style.color=t.textMuted;}}>
            ◁
          </button>
        )}
        {collapsed && (
          <button onClick={onToggle} style={{ position:"absolute", top:20, right:8, background:"none", border:"none", cursor:"pointer", color:t.textMuted, fontSize:12, padding:2, lineHeight:1 }}
            onMouseEnter={e=>{e.currentTarget.style.color=t.text;}} onMouseLeave={e=>{e.currentTarget.style.color=t.textMuted;}}>
            ▷
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex:1, padding:"10px 8px", overflowY:"auto" }}>
        {NAV_ITEMS.map(item => {
          const active = view === item.id;
          return (
            <button key={item.id} onClick={() => setView(item.id)} className="sidebar-nav-item"
              style={{ display:"flex", alignItems:"center", gap: collapsed ? 0 : 10, width:"100%", padding: collapsed ? "10px 0" : "9px 12px", marginBottom:2, background: active ? t.amberDim : "transparent", border:`1px solid ${active ? t.amberBorder : "transparent"}`, borderRadius:8, color: active ? t.amber : t.textSub, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight: active ? 600 : 400, cursor:"pointer", textAlign:"left", justifyContent: collapsed ? "center" : "flex-start", letterSpacing:"0.01em", position:"relative" }}>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:collapsed ? 16 : 13, lineHeight:1, flexShrink:0 }} title={collapsed ? item.label : ""}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {/* Active indicator dot */}
              {active && !collapsed && (
                <span style={{ marginLeft:"auto", width:5, height:5, borderRadius:"50%", background:t.amber, boxShadow:`0 0 6px ${t.amber}88` }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom status */}
      {!collapsed && result && (
        <div style={{ padding:"10px 12px", borderTop:`1px solid ${t.border}`, margin:"0 8px 8px" }}>
          <div style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:t.textMuted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:5 }}>Last Analysis</div>
          <OutcomeChip outcome={result.ruleResult.outcome} t={t} />
          <div style={{ fontSize:10, color:t.textMuted, marginTop:4, fontFamily:"'JetBrains Mono',monospace" }}>{result.ruleResult.quantum.recommended}d · {result.ruleResult.confidence}%</div>
        </div>
      )}

      {/* Pipeline badge */}
      {!collapsed && (
        <div style={{ padding:"8px 12px 12px", borderTop:`1px solid ${t.border}`, display:"flex", gap:3, flexWrap:"wrap" }}>
          {[{label:"Neural",c:t.violet},{label:"KG",c:t.cyan},{label:"40R",c:t.emerald},{label:"XAI",c:t.amber}].map(({label,c})=>(
            <span key={label} style={{ padding:"1px 5px", background:c+"14", border:`1px solid ${c}28`, borderRadius:3, fontSize:8, fontFamily:"'JetBrains Mono',monospace", color:c, fontWeight:700 }}>{label}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HEADER BAR
═══════════════════════════════════════════════════════════════════════════ */
function Header({ view, t, isDark, setIsDark, onOpenChat, result }) {
  const pageInfo = {
    dashboard: { title:"Dashboard", sub:"System overview & recent analyses" },
    analyse:   { title:"EOT Claim Analysis", sub:"FIDIC 2017 · Neurosymbolic pipeline" },
    results:   { title:"Analysis Results", sub:"Full XAI reasoning trace" },
    metrics:   { title:"Pipeline Metrics", sub:"Research-grade performance benchmarks" },
    determine: { title:"§3.7.3 Determination", sub:"Engineer's formal determination letter" },
    kg:        { title:"Knowledge Graph Explorer", sub:"FIDIC 2017 typed property graph" },
    about:     { title:"About AXIOM", sub:"Architecture · FIDIC 2017 coverage · Deployment" },
  };
  const page = pageInfo[view] || pageInfo.dashboard;

  return (
    <header style={{ height:52, borderBottom:`1px solid ${t.border}`, background:t.glass, backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", display:"flex", alignItems:"center", padding:"0 20px", gap:16, position:"sticky", top:0, zIndex:50 }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:15, fontWeight:700, color:t.text, lineHeight:1 }}>{page.title}</div>
        <div style={{ fontSize:10, color:t.textMuted, marginTop:2 }}>{page.sub}</div>
      </div>

      {/* Pipeline flow (compact) */}
      <div style={{ display:"flex", alignItems:"center", gap:4, marginRight:8 }}>
        {[{b:"Neural",c:t.violet},{b:"KG",c:t.cyan},{b:"Symbolic",c:t.emerald},{b:"XAI",c:t.amber}].map(({b,c},i,arr)=>(
          <span key={b} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ padding:"2px 7px", background:c+"14", border:`1px solid ${c}28`, borderRadius:4, fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:c, fontWeight:700 }}>{b}</span>
            {i<arr.length-1 && <span style={{ color:t.textGhost, fontSize:9 }}>→</span>}
          </span>
        ))}
      </div>

      {/* AI Chat button */}
      <button onClick={onOpenChat}
        style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 11px", background:t.violetGlow, border:`1px solid ${t.violet}30`, borderRadius:8, color:t.violet, fontSize:11, fontFamily:"'DM Sans',sans-serif", fontWeight:600, cursor:"pointer" }}
        onMouseEnter={e=>{e.currentTarget.style.background=t.violet+"25";}} onMouseLeave={e=>{e.currentTarget.style.background=t.violetGlow;}}>
        <span>⬡</span> AI Assistant
      </button>

      {/* Theme toggle */}
      <button onClick={() => setIsDark(d => !d)}
        style={{ width:34, height:34, borderRadius:8, background:t.surface2, border:`1px solid ${t.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, color:t.textSub, flexShrink:0 }}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=t.amber;e.currentTarget.style.color=t.amber;}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.color=t.textSub;}}>
        {isDark ? "☀" : "◑"}
      </button>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   AI CHAT ASSISTANT PANEL
═══════════════════════════════════════════════════════════════════════════ */
function ChatPanel({ t, onClose, result }) {
  const [msgs, setMsgs] = useState([
    { role:"assistant", text:"Hello! I'm your AXIOM AI assistant. I can help you:\n\n• Understand FIDIC 2017 clauses\n• Explain EOT analysis parameters\n• Guide you through the claim form\n• Interpret analysis results\n\nWhat would you like to know?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs]);

  async function send() {
    if(!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMsgs(m => [...m, { role:"user", text:userMsg }]);
    setLoading(true);

    const contextInfo = result ? `
Current analysis context:
- Outcome: ${result.ruleResult.outcome}
- Confidence: ${result.ruleResult.confidence}%
- Recommended EOT: ${result.ruleResult.quantum.recommended} days
- Cause: ${result.extraction.cause}
- Blocking rule: ${result.ruleResult.blocking_rule || "none"}
- Risk bearer: ${result.ruleResult.kg_risk?.label || "unknown"}
` : "No analysis has been run yet.";

    try {
      const sys = `You are an expert FIDIC 2017 EOT (Extension of Time) claim analyst assistant integrated into the AXIOM platform. 
You have deep knowledge of:
- FIDIC 2017 Conditions of Contract for Construction (Red Book)
- Sub-Clauses 8.4, 20.2.1, 20.2.4, 20.2.8, 3.7, 8.3, 18.2, 18.4, and all related clauses
- EOT entitlement grounds, procedural requirements, and time bars
- Neurosymbolic AI pipeline architecture

${contextInfo}

Be concise, professional, and helpful. Use clause references (e.g., §20.2.1) where relevant. Keep responses under 300 words unless detail is truly needed.`;

      const history = msgs.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
      const res = await fetch("https://axiom-proxy.axiomeot.workers.dev", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:600, system:sys, messages:[...history, {role:"user", content:userMsg}] })
      });
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("") || "Sorry, I couldn't generate a response.";
      setMsgs(m => [...m, { role:"assistant", text }]);
    } catch(_) {
      setMsgs(m => [...m, { role:"assistant", text:"Connection unavailable. Please check your API access." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:t.surface, borderLeft:`1px solid ${t.border}` }}>
      {/* Header */}
      <div style={{ padding:"14px 16px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:t.surface2 }}>
        <div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:t.violet, fontWeight:700, letterSpacing:"0.1em" }}>⬡ AI ASSISTANT</div>
          <div style={{ fontSize:10, color:t.textMuted, marginTop:1 }}>FIDIC 2017 · Contextual guidance</div>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:t.textMuted, fontSize:18, lineHeight:1, padding:2 }}
          onMouseEnter={e=>{e.currentTarget.style.color=t.text;}} onMouseLeave={e=>{e.currentTarget.style.color=t.textMuted;}}>✕</button>
      </div>

      {/* Quick prompts */}
      <div style={{ padding:"10px 12px", borderBottom:`1px solid ${t.border}`, display:"flex", gap:4, flexWrap:"wrap" }}>
        {["What is §20.2.1?","Explain time bars","How is EOT calculated?","What is KG?"].map(q=>(
          <button key={q} onClick={()=>setInput(q)}
            style={{ padding:"3px 8px", background:t.surface3, border:`1px solid ${t.border}`, borderRadius:12, fontSize:9, color:t.textSub, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=t.violet+"44";e.currentTarget.style.color=t.violet;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.color=t.textSub;}}>
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>
        {msgs.map((m,i)=>(
          <div key={i} style={{ display:"flex", justifyContent: m.role==="user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth:"88%", padding:"9px 12px", borderRadius: m.role==="user" ? "12px 12px 4px 12px" : "4px 12px 12px 12px", background: m.role==="user" ? `linear-gradient(135deg, ${t.amber}CC, ${t.amberBright}AA)` : t.surface2, color: m.role==="user" ? (t.isDark?"#0A0800":"#fff") : t.text, fontSize:12, lineHeight:1.65, border: m.role==="user" ? "none" : `1px solid ${t.border}` }}>
              <pre style={{ fontFamily:"'DM Sans',sans-serif", whiteSpace:"pre-wrap", margin:0 }}>{m.text}</pre>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", justifyContent:"flex-start" }}>
            <div style={{ padding:"9px 14px", background:t.surface2, borderRadius:"4px 12px 12px 12px", border:`1px solid ${t.border}` }}>
              <span style={{ animation:"pulse 1.2s infinite", display:"inline-block", color:t.violet, fontSize:14 }}>◌◌◌</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding:"10px 12px", borderTop:`1px solid ${t.border}`, display:"flex", gap:8 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
          placeholder="Ask about FIDIC 2017, EOT, clauses…"
          style={{ flex:1, background:t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:"7px 11px", color:t.text, fontFamily:"'DM Sans',sans-serif", fontSize:12, outline:"none" }}
          onFocus={e=>{e.target.style.borderColor=t.violet+"66";}} onBlur={e=>{e.target.style.borderColor=t.border;}} />
        <button onClick={send} disabled={!input.trim()||loading}
          style={{ padding:"7px 12px", background:`linear-gradient(135deg, ${t.violet}, ${t.violet}CC)`, border:"none", borderRadius:8, color:"#fff", cursor:!input.trim()||loading?"not-allowed":"pointer", opacity:!input.trim()||loading?0.4:1, fontSize:13 }}>
          →
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANALYSIS LOADING OVERLAY
═══════════════════════════════════════════════════════════════════════════ */
function AnalysisOverlay({ stage, t }) {
  const stages = [
    { n:1, label:"Neural Extraction",  sub:"Claude LLM parsing documents",  icon:"⬡", color:t.violet },
    { n:2, label:"Knowledge Graph",    sub:"35N · 41E traversal",             icon:"◈", color:t.cyan   },
    { n:3, label:"Rule Evaluation",    sub:"40 FIDIC 2017 rules",             icon:"§", color:t.emerald },
    { n:4, label:"XAI Trace Build",    sub:"Explainability chain",            icon:"⊙", color:t.amber  },
  ];
  const current = parseInt(stage?.replace(/[^0-9]/g,"")) || 1;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(3,6,8,0.94)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:1000, backdropFilter:"blur(10px)", animation:"fadeIn 0.2s" }}>
      <div style={{ width:380, animation:"scaleIn 0.3s ease" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <AxiomLogo t={t} size={36} />
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:20, fontWeight:700, color:t.text, letterSpacing:"-0.02em", marginTop:14 }}>Analysing Claim…</div>
          <div style={{ fontSize:11, color:t.textMuted, marginTop:4 }}>Neurosymbolic pipeline running</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {stages.map(s => {
            const done = s.n < current;
            const active = s.n === current;
            return (
              <div key={s.n} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", background:active?s.color+"14":done?t.surface2:t.surface, borderRadius:10, border:`1px solid ${active?s.color+"44":done?t.border+"88":t.border+"44"}`, transition:"all 0.25s" }}>
                <div style={{ width:32, height:32, borderRadius:8, background:active?s.color+"20":done?t.surface3:t.surface2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:active?s.color:done?t.textSub:t.textMuted, flexShrink:0, border:`1px solid ${active?s.color+"44":t.border}` }}>
                  {done ? <span style={{ color:t.emerald }}>✓</span> : active ? <span style={{ animation:"spin 1s linear infinite", display:"inline-block", fontSize:12, color:s.color }}>◌</span> : <span>{s.icon}</span>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:active?s.color:done?t.text:t.textMuted }}>{s.label}</div>
                  <div style={{ fontSize:10, color:t.textMuted, marginTop:1 }}>{s.sub}</div>
                </div>
                {active && <div style={{ width:44 }}><ProgressBar value={60} t={t} color={s.color} animated /></div>}
                {done && <Badge t={t} color={t.emerald} sm>✓</Badge>}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop:20, height:2, background:t.surface3, borderRadius:2, overflow:"hidden" }}>
          <div className="shimmer-bar" style={{ height:"100%" }} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPLIANCE TIMELINE
═══════════════════════════════════════════════════════════════════════════ */
function ComplianceTimeline({ noticeDays, detailDays, t }) {
  const MAX = 90;
  const nd = parseInt(noticeDays) || null;
  const dd = parseInt(detailDays) || null;

  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <ML t={t} mb={0}>Deadline Timeline</ML>
        <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:t.textMuted }}>Days from awareness (0–90)</span>
      </div>
      <div style={{ position:"relative", height:28, marginBottom:20 }}>
        {/* Track */}
        <div style={{ position:"absolute", top:"50%", left:0, right:0, height:6, background:t.surface3, borderRadius:3, transform:"translateY(-50%)" }} />
        {/* 28-day zone */}
        <div style={{ position:"absolute", top:"50%", left:0, width:`${(28/MAX)*100}%`, height:6, background:`linear-gradient(90deg, ${t.emerald}33, ${t.emerald}66)`, borderRadius:"3px 0 0 3px", transform:"translateY(-50%)" }} />
        {/* 28–84 zone */}
        <div style={{ position:"absolute", top:"50%", left:`${(28/MAX)*100}%`, width:`${((84-28)/MAX)*100}%`, height:6, background:`linear-gradient(90deg, ${t.amber}44, ${t.amber}22)`, transform:"translateY(-50%)" }} />
        {/* 28d marker */}
        <div style={{ position:"absolute", left:`${(28/MAX)*100}%`, top:0, bottom:0, display:"flex", flexDirection:"column", alignItems:"center", transform:"translateX(-50%)" }}>
          <div style={{ width:1, height:"100%", borderLeft:`1px dashed ${t.emerald}66` }} />
          <div style={{ position:"absolute", bottom:-16, fontSize:8, fontFamily:"'JetBrains Mono',monospace", color:t.emerald, whiteSpace:"nowrap", fontWeight:600 }}>§20.2.1 Notice (28d)</div>
        </div>
        {/* 84d marker */}
        <div style={{ position:"absolute", left:`${(84/MAX)*100}%`, top:0, bottom:0, display:"flex", flexDirection:"column", alignItems:"center", transform:"translateX(-50%)" }}>
          <div style={{ width:1, height:"100%", borderLeft:`1px dashed ${t.amber}66` }} />
          <div style={{ position:"absolute", bottom:-16, fontSize:8, fontFamily:"'JetBrains Mono',monospace", color:t.amber, whiteSpace:"nowrap", fontWeight:600 }}>§20.2.4 Claim (84d)</div>
        </div>
        {/* Notice dot */}
        {nd !== null && (
          <div style={{ position:"absolute", top:"50%", left:`${Math.min((nd/MAX)*100,100)}%`, transform:"translate(-50%,-50%)", width:11, height:11, borderRadius:"50%", background:nd<=28?t.emerald:t.rose, border:`2px solid ${t.surface}`, boxShadow:`0 0 8px ${nd<=28?t.emerald:t.rose}88`, zIndex:2 }} title={`Notice: ${nd}d`} />
        )}
        {/* Detail dot */}
        {dd !== null && (
          <div style={{ position:"absolute", top:"50%", left:`${Math.min((dd/MAX)*100,100)}%`, transform:"translate(-50%,-50%)", width:11, height:11, borderRadius:"50%", background:dd<=84?t.amber:t.rose, border:`2px solid ${t.surface}`, boxShadow:`0 0 8px ${dd<=84?t.amber:t.rose}88`, zIndex:2 }} title={`Detailed Claim: ${dd}d`} />
        )}
      </div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {nd !== null && (
          <div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20, background:nd<=28?t.emeraldGlow:t.roseGlow, border:`1px solid ${nd<=28?t.emerald:t.rose}33`, fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:nd<=28?t.emerald:t.rose, fontWeight:600 }}>
            {nd<=28?"✓":"⛔"} Notice: {nd}d {nd<=28?`(${28-nd}d remaining)`:`(${nd-28}d OVERDUE)`}
          </div>
        )}
        {dd !== null && (
          <div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20, background:dd<=84?t.amberGlow:t.roseGlow, border:`1px solid ${dd<=84?t.amber:t.rose}33`, fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:dd<=84?t.amber:t.rose, fontWeight:600 }}>
            {dd<=84?"✓":"⛔"} Claim: {dd}d {dd<=84?`(${84-dd}d remaining)`:`(${dd-84}d OVERDUE)`}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD VIEW
═══════════════════════════════════════════════════════════════════════════ */
function DashboardView({ result, history, t, onNavigate }) {
  const kg = useMemo(() => new KnowledgeGraph().load(FIDIC_KB), []);
  const kgStats = useMemo(() => kg.stats(), [kg]);

  const StatCard = ({ label, value, sub, color, icon }) => (
    <Card t={t} style={{ padding:18 }} className="card-anim">
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ width:36, height:36, borderRadius:8, background:(color||t.amber)+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:color||t.amber, border:`1px solid ${(color||t.amber)}28` }}>{icon}</div>
        {sub && <span style={{ fontSize:9, color:t.textMuted, fontFamily:"'JetBrains Mono',monospace" }}>{sub}</span>}
      </div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:26, fontWeight:700, color:color||t.amber, lineHeight:1, marginBottom:4 }}>{value}</div>
      <div style={{ fontSize:11, color:t.textMuted, letterSpacing:"0.02em" }}>{label}</div>
    </Card>
  );

  return (
    <div style={{ animation:"fadeUp 0.22s ease" }}>
      {/* Hero */}
      <div style={{ marginBottom:24, padding:"24px 28px", background:`linear-gradient(135deg, ${t.surface} 0%, ${t.surface2} 100%)`, borderRadius:14, border:`1px solid ${t.border}`, position:"relative", overflow:"hidden", boxShadow:t.shadowCard }}>
        <div style={{ position:"absolute", top:-60, right:-60, width:200, height:200, borderRadius:"50%", background:t.amberDim, filter:"blur(80px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-40, left:"30%", width:140, height:140, borderRadius:"50%", background:t.cyanDim, filter:"blur(60px)", pointerEvents:"none" }} />
        <div style={{ position:"relative" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
            <div>
              <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
                <Badge t={t} color={t.amber}>FIDIC 2017 Red Book</Badge>
                <Badge t={t} color={t.emerald}>40 Symbolic Rules</Badge>
                <Badge t={t} color={t.cyan}>Neurosymbolic AI</Badge>
              </div>
              <h1 style={{ fontSize:28, fontWeight:800, color:t.text, letterSpacing:"-0.03em", lineHeight:1.1, marginBottom:6 }}>Neurosymbolic<br/>EOT Intelligence Platform</h1>
              <p style={{ fontSize:13, color:t.textSub, fontStyle:"italic" }}>"Every decision. Every reason. Every clause."</p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn onClick={() => onNavigate("analyse")} t={t} icon="◈">Start Analysis</Btn>
              <Btn variant="ghost" onClick={() => onNavigate("kg")} t={t} icon="◉">KG Explorer</Btn>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        <StatCard label="FIDIC 2017 Rules" value="40" sub="Symbolic" color={t.emerald} icon="§" />
        <StatCard label="KG Nodes" value={kgStats.total_nodes} sub="Typed property graph" color={t.cyan} icon="◉" />
        <StatCard label="KG Edges" value={kgStats.total_edges} sub="Relation types" color={t.violet} icon="→" />
        <StatCard label="Rule Tiers" value="8" sub="Priority ordered" color={t.amber} icon="⊞" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        {/* Latest result */}
        <Card t={t}>
          <ML t={t}>Latest Analysis</ML>
          {result ? (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                <ConfidenceArc pct={result.ruleResult.confidence} t={t} size={72} />
                <div>
                  <OutcomeChip outcome={result.ruleResult.outcome} t={t} lg />
                  <div style={{ marginTop:8, display:"flex", gap:6, flexWrap:"wrap" }}>
                    <Badge t={t} color={t.amber} sm>{result.ruleResult.quantum.recommended}d EOT</Badge>
                    <Badge t={t} color={result.ruleResult.kg_risk?.id==="RA_EMPL"?t.rose:result.ruleResult.kg_risk?.id==="RA_SHAR"?t.amber:t.textMuted} sm>{result.ruleResult.kg_risk?.label||"—"}</Badge>
                  </div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[
                  ["Rules Fired", `${result.ruleResult.rules_fired}/${result.ruleResult.rules_evaluated}`, t.cyan],
                  ["Pipeline", `${result.metrics.total_ms}ms`, t.textSub],
                  ["Blocking", result.ruleResult.blocking_rule||"None", result.ruleResult.blocking_rule?t.rose:t.emerald],
                  ["Symbolic", `${Math.round((result.metrics.symbolic_ratio||0)*100)}%`, t.emerald],
                ].map(([k,v,c])=>(
                  <div key={k} style={{ padding:"8px 10px", background:t.surface2, borderRadius:6, border:`1px solid ${t.border}` }}>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700, color:c }}>{v}</div>
                    <div style={{ fontSize:9, color:t.textMuted, marginTop:2, fontFamily:"'JetBrains Mono',monospace", textTransform:"uppercase", letterSpacing:"0.06em" }}>{k}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:10, display:"flex", gap:6 }}>
                <Btn sm variant="ghost" t={t} onClick={() => onNavigate("results")} icon="§">View Trace</Btn>
                <Btn sm t={t} onClick={() => onNavigate("analyse")} icon="◈">New Analysis</Btn>
              </div>
            </div>
          ) : (
            <div style={{ textAlign:"center", padding:"28px 16px" }}>
              <div style={{ fontSize:36, marginBottom:10, opacity:0.2 }}>◈</div>
              <div style={{ fontSize:13, color:t.textMuted, marginBottom:14 }}>No analysis run yet</div>
              <Btn onClick={() => onNavigate("analyse")} t={t} icon="◈">Run First Analysis</Btn>
            </div>
          )}
        </Card>

        {/* Pipeline architecture */}
        <Card t={t}>
          <ML t={t}>Neurosymbolic Pipeline</ML>
          {[
            { icon:"⬡", color:t.violet, label:"Neural Extraction", desc:"Claude LLM parses narrative & documents → structured claim state" },
            { icon:"◈", color:t.cyan,   label:"KG Enrichment",     desc:"35-node knowledge graph activates relevant FIDIC clauses" },
            { icon:"§", color:t.emerald,label:"Symbolic Rules",     desc:"40 FIDIC 2017 rules evaluate entitlement, blocking conditions" },
            { icon:"⊙", color:t.amber,  label:"XAI Trace",         desc:"Full reasoning chain — auditable by arbitrators & courts" },
          ].map((s,i,arr)=>(
            <div key={s.label} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom: i<arr.length-1 ? `1px solid ${t.border}` : "none", alignItems:"flex-start" }}>
              <div style={{ width:30, height:30, borderRadius:6, background:s.color+"16", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:s.color, flexShrink:0, border:`1px solid ${s.color}28`, marginTop:2 }}>{s.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:600, color:t.text }}>{s.label}</div>
                <div style={{ fontSize:10, color:t.textMuted, marginTop:2, lineHeight:1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* FIDIC clause coverage */}
      <Card t={t}>
        <ML t={t}>FIDIC 2017 Coverage — Critical Clauses</ML>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:8 }}>
          {[
            {cl:"§20.2.1", title:"Notice of Claim", critical:true, rule:"R001–R004"},
            {cl:"§20.2.4", title:"Fully Detailed Claim", critical:true, rule:"R005–R007"},
            {cl:"§20.2.8", title:"Time-Bar Consequences", critical:true, rule:"R001–R002"},
            {cl:"§8.4(a)", title:"Variation Ground", critical:false, rule:"R011"},
            {cl:"§8.4(c)", title:"Adverse Climate", critical:false, rule:"R012"},
            {cl:"§8.4(d)", title:"Epidemic Shortage", critical:false, rule:"R013"},
            {cl:"§8.4(e)", title:"Employer Impediment", critical:false, rule:"R010"},
            {cl:"§18.2", title:"Force Majeure Notice", critical:false, rule:"R008"},
            {cl:"§8.3", title:"Programme Compliance", critical:false, rule:"R020–R024"},
            {cl:"§3.7", title:"Determination", critical:false, rule:"R050–R051"},
            {cl:"§20.2.2", title:"Contemporary Records", critical:false, rule:"R040–R046"},
            {cl:"§1.9", title:"Late Drawings", critical:false, rule:"R018"},
          ].map(r=>(
            <div key={r.cl} style={{ padding:"8px 10px", background:t.surface2, borderRadius:8, border:`1px solid ${r.critical?t.rose+"44":t.border}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:r.critical?t.rose:t.amber, fontWeight:700 }}>{r.cl}</span>
                <div style={{ fontSize:10, color:t.textSub, marginTop:2 }}>{r.title}</div>
              </div>
              <span style={{ fontSize:8, fontFamily:"'JetBrains Mono',monospace", color:t.textMuted }}>{r.rule}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANALYSE VIEW (CLAIM FORM)
═══════════════════════════════════════════════════════════════════════════ */
const FORM_DEFAULTS = {
  narrative:"", delay_event:"", cause:"employer_delay",
  notice_submitted:true, notice_days:"", detailed_claim_submitted:true, detailed_days:"",
  programme_submitted:true, programme_updated_after_delay:false, critical_path_shown:false,
  concurrent_contractor_delay:"", contemporary_records:"", contractual_basis_stated:true,
  mitigation_evidence:false, records_attached_to_claim:true,
  force_majeure_notice_given:null, prior_notice_given:null,
  requested_eot:"", calculated_eot:"", days_since_detailed_claim:"",
  project:"", contractor:"", engineer:"", _forceHeuristic:false
};

function AnalyseView({ onResult, t }) {
  const [form, setF] = useState(FORM_DEFAULTS);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stageMsg, setStageMsg] = useState(null);
  const fileRef = useRef();
  const upd = (k,v) => setF(p=>({...p,[k]:v}));

  async function handleFiles(e) {
    const fs = Array.from(e.target.files);
    const out = [];
    for(const f of fs) {
      const b64 = await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(f);});
      out.push({ name:f.name, type:f.type, base64:b64 });
    }
    setFiles(p=>[...p,...out]);
    e.target.value="";
  }

  async function run() {
    setLoading(true);
    try {
      const input = { ...form, notice_days:form.notice_days?parseInt(form.notice_days):null, detailed_days:form.detailed_days?parseInt(form.detailed_days):null, requested_eot:parseInt(form.requested_eot)||0, calculated_eot:parseInt(form.calculated_eot)||parseInt(form.requested_eot)||0, concurrent_contractor_delay:parseInt(form.concurrent_contractor_delay)||0, contemporary_records:parseInt(form.contemporary_records)||0, days_since_detailed_claim:form.days_since_detailed_claim?parseInt(form.days_since_detailed_claim):0 };
      const result = await runPipeline(input, files, setStageMsg);
      onResult(result);
    } finally { setLoading(false); setStageMsg(null); }
  }

  const showFMNotice = form.cause === "force_majeure";
  const showPriorNotice = ["late_drawings","site_access"].includes(form.cause);

  return (
    <>
      {loading && <AnalysisOverlay stage={stageMsg} t={t} />}
      <div style={{ animation:"fadeUp 0.22s ease" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, alignItems:"start" }}>
          {/* LEFT COLUMN */}
          <div>
            {/* Project info */}
            <Card t={t} style={{ marginBottom:14 }}>
              <ML t={t}>Project Information</ML>
              <Inp label="Project Name" value={form.project} onChange={v=>upd("project",v)} t={t} placeholder="e.g. Northgate Interchange — Package D2" />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <Inp label="Contractor" value={form.contractor} onChange={v=>upd("contractor",v)} t={t} placeholder="e.g. Apex Infrastructure Ltd." />
                <Inp label="The Engineer" value={form.engineer} onChange={v=>upd("engineer",v)} t={t} placeholder="e.g. Meridian Advisory Engineers" />
              </div>
            </Card>

            {/* Delay event */}
            <Card t={t} style={{ marginBottom:14 }}>
              <ML t={t}>Delay Event</ML>
              <Inp label="Short Event Label" value={form.delay_event} onChange={v=>upd("delay_event",v)} t={t} placeholder="e.g. Late issuance of revised piling drawings — Blocks C–F" />
              <Sel label="FIDIC §8.4 Cause Category" value={form.cause} onChange={v=>upd("cause",v)} t={t} options={[
                {v:"employer_delay",       l:"§8.4(e) — Employer Delay / Impediment"},
                {v:"employer_instruction", l:"§8.4(e) — Employer Instruction (Disruption)"},
                {v:"late_drawings",        l:"§8.4(e) + §1.9 — Late Drawings / Instructions"},
                {v:"site_access",          l:"§8.4(e) + §2.1 — Site Access / Possession"},
                {v:"variation",            l:"§8.4(a) + §13.3 — Variation / Change Order"},
                {v:"scope_change",         l:"§8.4(a) — Scope Change"},
                {v:"additional_works",     l:"§8.4(a) — Additional Works"},
                {v:"force_majeure",        l:"§18.4 + §8.4(b) — Force Majeure / Exceptional Event"},
                {v:"authority_delay",      l:"§8.5 + §8.4(b) — Delays by Authorities"},
                {v:"suspension",           l:"§8.9 + §8.4(b) — Suspension by Engineer"},
                {v:"adverse_climate",      l:"§8.4(c) — Exceptionally Adverse Climatic Conditions"},
                {v:"epidemic_shortage",    l:"§8.4(d) — Epidemic / Government Action Shortage"},
              ]} />
              <Txt label="Delay Narrative" value={form.narrative} onChange={v=>upd("narrative",v)} rows={4} t={t} placeholder="Describe the delay event, cause, timeline, and impact on completion. The LLM will extract structured facts from this text." />

              {/* File upload */}
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <ML t={t} mb={0}>Documents (PDF / Images)</ML>
                  {files.length>0 && <span style={{ fontSize:10, color:t.emerald, fontFamily:"'JetBrains Mono',monospace" }}>{files.length} attached</span>}
                </div>
                <input ref={fileRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={handleFiles} style={{ display:"none" }} />
                <div onClick={()=>fileRef.current.click()}
                  style={{ border:`2px dashed ${t.border}`, borderRadius:8, padding:"12px 16px", cursor:"pointer", textAlign:"center", background:t.surface2, transition:"all 0.14s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=t.borderFocus;e.currentTarget.style.background=t.surface3;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.background=t.surface2;}}>
                  <div style={{ fontSize:12, color:t.textSub }}>⊕  Click to attach PDF or image files</div>
                  <div style={{ fontSize:10, color:t.textMuted, marginTop:2 }}>LLM will extract EOT facts from uploaded documents</div>
                </div>
                {files.length>0 && (
                  <div style={{ marginTop:7, display:"flex", flexWrap:"wrap", gap:4 }}>
                    {files.map((f,i)=>(
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 8px 3px 9px", background:t.surface3, border:`1px solid ${t.border}`, borderRadius:16, fontSize:10, color:t.textSub }}>
                        📄 {f.name.slice(0,18)}
                        <span onClick={()=>setFiles(p=>p.filter((_,j)=>j!==i))} style={{ cursor:"pointer", color:t.rose, marginLeft:2, fontSize:11 }}>✕</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Conditional: Force Majeure */}
            {showFMNotice && (
              <Card t={t} style={{ marginBottom:14, border:`1px solid ${t.violet}44`, background:t.violetGlow }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <Badge t={t} color={t.violet} sm>§18.2 Required</Badge>
                  <ML t={t} color={t.violet} mb={0}>Force Majeure — Dual Notice Requirement</ML>
                </div>
                <p style={{ fontSize:11, color:t.textSub, lineHeight:1.65, marginBottom:10 }}>Force Majeure requires <strong style={{ color:t.text }}>two separate notices</strong>: the §18.2 Exceptional Event Notice (14 days) AND the §20.2.1 EOT Notice (28 days).</p>
                {[{v:true,l:"§18.2 Notice given within 14 days"},{v:false,l:"§18.2 Notice NOT given (or unknown)"}].map(opt=>(
                  <label key={String(opt.v)} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, cursor:"pointer" }}>
                    <input type="radio" name="fm_notice" checked={form.force_majeure_notice_given===opt.v} onChange={()=>upd("force_majeure_notice_given",opt.v)} />
                    <span style={{ fontSize:12, color:opt.v===false?t.rose:t.text }}>{opt.l}</span>
                  </label>
                ))}
              </Card>
            )}

            {/* Conditional: Prior Notice */}
            {showPriorNotice && (
              <Card t={t} style={{ marginBottom:14, border:`1px solid ${t.amberBorder}`, background:t.amberDim }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <Badge t={t} color={t.amber} sm>§1.9/§2.1</Badge>
                  <ML t={t} color={t.amber} mb={0}>Prior Notice to Engineer</ML>
                </div>
                <p style={{ fontSize:11, color:t.textSub, lineHeight:1.65, marginBottom:10 }}>§1.9/§2.1 requires the Contractor to notify the Engineer in advance that drawings or site access are required by a specific date.</p>
                {[{v:true,l:"Prior notice given — Engineer was notified in advance"},{v:false,l:"Prior notice NOT given / not documented"}].map(opt=>(
                  <label key={String(opt.v)} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, cursor:"pointer" }}>
                    <input type="radio" name="prior_notice" checked={form.prior_notice_given===opt.v} onChange={()=>upd("prior_notice_given",opt.v)} />
                    <span style={{ fontSize:12, color:opt.v===false?t.orange:t.text }}>{opt.l}</span>
                  </label>
                ))}
              </Card>
            )}

            {/* Extraction mode */}
            <Card t={t}>
              <ML t={t}>Extraction Mode</ML>
              <Toggle checked={!form._forceHeuristic} onChange={()=>setF(p=>({...p,_forceHeuristic:!p._forceHeuristic}))} t={t}
                label="LLM Extraction (Claude)" note="Recommended — Claude parses narrative & documents into structured claim data" />
              {form._forceHeuristic && <div style={{ marginTop:6, padding:"6px 10px", background:t.surface3, borderRadius:6, fontSize:10, color:t.orange, fontFamily:"'JetBrains Mono',monospace" }}>Heuristic mode: keyword-based parsing · 100% symbolic · No API call</div>}
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {/* Compliance timeline */}
            <Card t={t} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <ML t={t} mb={0}>Notice Compliance — FIDIC Time Bars</ML>
                <Badge t={t} color={t.rose} sm>§20.2.8</Badge>
              </div>
              <ComplianceTimeline noticeDays={form.notice_days} detailDays={form.detailed_days} t={t} />

              <Toggle checked={form.notice_submitted} onChange={()=>setF(p=>({...p,notice_submitted:!p.notice_submitted}))} t={t}
                label="Notice of Claim submitted (§20.2.1)" note="Uncheck if no notice was given — triggers blocking Rule R001" />
              {form.notice_submitted && (
                <Inp label="Days from awareness to Notice" type="number" value={form.notice_days} onChange={v=>upd("notice_days",v)} t={t} placeholder="e.g. 21" note="Leave blank if date unknown" right="28-day limit" />
              )}

              <Toggle checked={form.detailed_claim_submitted} onChange={()=>setF(p=>({...p,detailed_claim_submitted:!p.detailed_claim_submitted}))} t={t}
                label="Fully Detailed Claim submitted (§20.2.4)" note="Uncheck if detailed claim not yet submitted" />
              {form.detailed_claim_submitted && (
                <Inp label="Days from awareness to Detailed Claim" type="number" value={form.detailed_days} onChange={v=>upd("detailed_days",v)} t={t} placeholder="e.g. 68" note="Leave blank if date unknown" right="84-day limit" />
              )}

              <Inp label="Days since Detailed Claim (§3.7)" type="number" value={form.days_since_detailed_claim} onChange={v=>upd("days_since_detailed_claim",v)} t={t} placeholder="e.g. 30" note="42-day agreement period tracking" />
            </Card>

            {/* EOT Quantum */}
            <Card t={t} style={{ marginBottom:14 }}>
              <ML t={t}>EOT Quantum</ML>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <Inp label="EOT Requested (days)" type="number" value={form.requested_eot} onChange={v=>upd("requested_eot",v)} t={t} placeholder="e.g. 90" />
                <Inp label="EOT Calculated (days)" type="number" value={form.calculated_eot} onChange={v=>upd("calculated_eot",v)} t={t} placeholder="e.g. 85" note="Blank = same as requested" />
                <Inp label="Concurrent Contractor Delay" type="number" value={form.concurrent_contractor_delay} onChange={v=>upd("concurrent_contractor_delay",v)} t={t} placeholder="0" note="Days of contractor-caused delay" />
                <Inp label="Contemporary Records Count" type="number" value={form.contemporary_records} onChange={v=>upd("contemporary_records",v)} t={t} placeholder="e.g. 3" note="Site diaries, photos, letters" />
              </div>
            </Card>

            {/* Evidence & Programme Checklist */}
            <Card t={t} style={{ marginBottom:14 }}>
              <ML t={t}>Evidence & Programme Checklist</ML>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" }}>
                <Toggle checked={form.programme_submitted} onChange={()=>setF(p=>({...p,programme_submitted:!p.programme_submitted}))} t={t} label="Baseline programme submitted" note="§8.3 — within 28 days" />
                <Toggle checked={form.programme_updated_after_delay} onChange={()=>setF(p=>({...p,programme_updated_after_delay:!p.programme_updated_after_delay}))} t={t} label="Programme updated after delay" note="Shows revised completion" />
                <Toggle checked={form.critical_path_shown} onChange={()=>setF(p=>({...p,critical_path_shown:!p.critical_path_shown}))} t={t} label="Critical path impact shown" note="Delay affects completion date" />
                <Toggle checked={form.contractual_basis_stated} onChange={()=>setF(p=>({...p,contractual_basis_stated:!p.contractual_basis_stated}))} t={t} label="Contractual basis stated" note="§20.2.4(b) — clause refs" />
                <Toggle checked={form.records_attached_to_claim} onChange={()=>setF(p=>({...p,records_attached_to_claim:!p.records_attached_to_claim}))} t={t} label="Records attached to claim" note="§20.2.4(c) — as annexures" />
                <Toggle checked={form.mitigation_evidence} onChange={()=>setF(p=>({...p,mitigation_evidence:!p.mitigation_evidence}))} t={t} label="Mitigation evidence available" note="Steps taken to minimise delay" />
              </div>
            </Card>

            {/* Run button */}
            <Btn full onClick={run} loading={loading} disabled={!form.delay_event && !form.narrative} t={t} icon="◈">
              Run Neurosymbolic Analysis
            </Btn>
            <p style={{ textAlign:"center", fontSize:10, color:t.textMuted, marginTop:7, fontFamily:"'JetBrains Mono',monospace" }}>
              Narrative → LLM → KG (35N/41E) → 40 rules → XAI trace → Decision
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   RESULTS VIEW
═══════════════════════════════════════════════════════════════════════════ */
function ResultsView({ result, onNewAnalysis, t }) {
  const [tab, setTab] = useState("trace");

  if(!result) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400, gap:16, animation:"fadeUp 0.22s ease" }}>
      <div style={{ width:72, height:72, borderRadius:18, background:t.surface2, border:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, color:t.border }}>◈</div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:16, fontWeight:700, color:t.text, marginBottom:6 }}>No analysis yet</div>
        <div style={{ fontSize:13, color:t.textSub, marginBottom:16 }}>Run an EOT analysis from the Analyse tab to see the full reasoning trace.</div>
        <Btn t={t} icon="◈" onClick={onNewAnalysis}>Start Analysis</Btn>
      </div>
    </div>
  );

  const { extraction, ruleResult, trace } = result;
  const cats = catColors(t);
  const riskId = ruleResult.kg_risk?.id;

  return (
    <div style={{ animation:"fadeUp 0.22s ease" }}>
      {/* Hero result card */}
      <div style={{ background:`linear-gradient(135deg, ${t.surface} 0%, ${t.surface2} 100%)`, border:`1px solid ${t.border}`, borderRadius:14, padding:22, marginBottom:18, boxShadow:t.shadowCard, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-50, right:-50, width:160, height:160, borderRadius:"50%", background:t.amberDim, filter:"blur(60px)", pointerEvents:"none" }} />
        <div style={{ position:"relative", display:"grid", gridTemplateColumns:"auto 1fr auto", gap:20, alignItems:"center" }}>
          {/* Confidence + outcome */}
          <div style={{ display:"flex", gap:16, alignItems:"center" }}>
            <ConfidenceArc pct={ruleResult.confidence} t={t} size={88} />
            <div>
              <div style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:t.textMuted, letterSpacing:"0.12em", marginBottom:6 }}>DETERMINATION OUTCOME</div>
              <OutcomeChip outcome={ruleResult.outcome} t={t} lg />
              <div style={{ marginTop:8, display:"flex", gap:5, flexWrap:"wrap" }}>
                {ruleResult.blocked && <Badge t={t} color={t.rose} sm>Time-Barred</Badge>}
                <Badge t={t} color={ruleResult.kg_risk?.id==="RA_EMPL"?t.rose:ruleResult.kg_risk?.id==="RA_SHAR"?t.amber:t.textMuted} sm>{ruleResult.kg_risk?.label||"—"}</Badge>
                <Badge t={t} color={ruleResult.kg_risk?.props?.cost?t.emerald:t.textMuted} sm>Cost: {ruleResult.kg_risk?.props?.cost?"✓ Yes":"✕ No"}</Badge>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
            {[
              { l:"Recommended EOT", v:`${ruleResult.quantum.recommended}d`, c:t.amber },
              { l:"Rules Fired", v:`${ruleResult.rules_fired}/${ruleResult.rules_evaluated}`, c:t.cyan },
              { l:"Blocking Rule", v:ruleResult.blocking_rule||"None", c:ruleResult.blocking_rule?t.rose:t.emerald },
            ].map(m=>(
              <div key={m.l} style={{ padding:"11px 13px", background:t.surface3, borderRadius:8, border:`1px solid ${t.border}` }}>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, fontWeight:700, color:m.c }}>{m.v}</div>
                <div style={{ fontSize:9, color:t.textMuted, marginTop:3, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.08em", textTransform:"uppercase" }}>{m.l}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display:"flex", flexDirection:"column", gap:7, alignItems:"flex-end" }}>
            <Btn variant="ghost" onClick={onNewAnalysis} t={t} sm icon="↺">New Analysis</Btn>
            <Btn variant="primary" onClick={() => generateAnalysisReport(result)} t={t} sm icon="⎙">Export PDF</Btn>
          </div>
        </div>

        {/* Quantum deductions */}
        {ruleResult.quantum.deductions.length > 0 && (
          <div style={{ marginTop:14, padding:"9px 13px", background:t.surface3, borderRadius:8, border:`1px solid ${t.border}`, display:"flex", gap:14, alignItems:"center", flexWrap:"wrap" }}>
            <span style={{ fontSize:11, color:t.textSub }}>Requested: <strong style={{ color:t.text }}>{ruleResult.quantum.requested}d</strong></span>
            {ruleResult.quantum.deductions.map((d,i)=>(
              <span key={i} style={{ fontSize:10, color:t.rose }}>— {d.days}d ({d.reason.split("—")[0].trim()})</span>
            ))}
            <span style={{ fontSize:11, color:t.amber, fontWeight:700, marginLeft:"auto" }}>= {ruleResult.quantum.recommended}d recommended</span>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div style={{ display:"flex", background:t.surface, border:`1px solid ${t.border}`, borderRadius:10, overflow:"hidden", marginBottom:14, boxShadow:t.shadowCard }}>
        {[["trace","§ Reasoning Trace"],["rules","◈ Rules Fired"],["quantum","⊙ Quantum"],["risk","⊛ Risk Map"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{ flex:1, padding:"9px 12px", background:tab===id?t.amberDim:"transparent", border:"none", borderRight:`1px solid ${t.border}`, color:tab===id?t.amber:t.textMuted, fontFamily:"'JetBrains Mono',monospace", fontSize:10, cursor:"pointer", letterSpacing:"0.06em", fontWeight:tab===id?700:400, transition:"background 0.12s, color 0.12s" }}>
            {lbl}
          </button>
        ))}
      </div>

      {tab==="trace" && (
        <div>
          {trace.steps.map((step,i)=>(
            <div key={i} style={{ marginBottom:8, padding:13, background:step.is_final?t.amberDim:step.type==="neural"?t.violetGlow:t.surface, border:`1px solid ${step.is_final?t.amberBorder:step.blocking?t.rose+"44":t.border}`, borderRadius:10, borderLeft:`3px solid ${step.color}`, animation:`fadeUp 0.18s ease ${i*0.035}s both` }}>
              <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:7 }}>
                <div style={{ width:32, height:32, borderRadius:7, background:step.color+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:step.color, flexShrink:0, border:`1px solid ${step.color}33` }}>{step.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:5, alignItems:"center", flexWrap:"wrap" }}>
                    <span style={{ fontSize:12, fontWeight:600, color:t.text }}>{step.label}</span>
                    <Badge t={t} color={step.type==="neural"?t.violet:step.type==="decision"?t.amber:t.cyan} sm>{step.type}</Badge>
                    {step.blocking && <Badge t={t} color={t.rose} sm glow>BLOCKING</Badge>}
                  </div>
                  <div style={{ fontSize:10, color:t.textMuted, marginTop:2 }}>{step.sub}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:700, color:step.confidence>=0.7?t.emerald:step.confidence>=0.5?t.amber:t.rose }}>{Math.round(step.confidence*100)}%</div>
                  <div style={{ fontSize:8, color:t.textMuted, fontFamily:"'JetBrains Mono',monospace" }}>CONF</div>
                </div>
              </div>
              {step.items.map((item,j)=>(
                <div key={j} style={{ fontSize:11, color:item.startsWith("✓")?t.emerald:item.startsWith("⛔")?t.rose:item.startsWith("⚠")?t.amber:t.textSub, marginBottom:3, paddingLeft:8, lineHeight:1.65 }}>{item}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab==="rules" && (
        <div>
          <div style={{ marginBottom:10, display:"flex", gap:6, flexWrap:"wrap" }}>
            {Object.entries(catColors(t)).map(([cat,c])=>(
              <span key={cat} style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 7px", background:c+"14", border:`1px solid ${c}28`, borderRadius:4, fontSize:9, color:c, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase" }}>
                <span style={{ width:5,height:5,borderRadius:"50%",background:c,display:"inline-block" }}/> {cat} ({ruleResult.fired_rules.filter(r=>r.cat===cat).length})
              </span>
            ))}
          </div>
          {ruleResult.fired_rules.map((r,i)=>(
            <div key={i} style={{ marginBottom:7, padding:11, background:t.surface, border:`1px solid ${r.csq?.block?t.rose+"44":t.border}`, borderRadius:8, borderLeft:`3px solid ${cats[r.cat]||t.border}`, animation:`fadeUp 0.14s ease ${i*0.025}s both` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:5 }}>
                <div style={{ display:"flex", gap:5, alignItems:"center", flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:t.amber, fontWeight:700 }}>{r.id}</span>
                  <Badge t={t} color={cats[r.cat]||t.textMuted} sm>{r.cat}</Badge>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:t.textMuted }}>§{r.cl}</span>
                  {r.csq?.block && <Badge t={t} color={t.rose} sm glow>BLOCKING</Badge>}
                </div>
                <div style={{ display:"flex", gap:7, alignItems:"center" }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:(r.csq?.cd??0)>=0?t.emerald:t.rose, fontWeight:700 }}>{(r.csq?.cd??0)>=0?"+":""}{r.csq?.cd}</span>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:r.conf_after>=0.7?t.emerald:r.conf_after>=0.5?t.amber:t.rose, fontWeight:700 }}>{Math.round(r.conf_after*100)}%</span>
                </div>
              </div>
              <div style={{ fontSize:12, color:t.text, fontWeight:600, marginBottom:3 }}>{r.name}</div>
              <div style={{ fontSize:11, color:r.exp?.startsWith("✓")?t.emerald:r.exp?.startsWith("⛔")?t.rose:r.exp?.startsWith("⚠")?t.amber:t.textSub, lineHeight:1.65 }}>{r.exp}</div>
            </div>
          ))}
          {ruleResult.rules_fired===0 && <div style={{ textAlign:"center", padding:40, color:t.textMuted }}>No rules fired for this input.</div>}
        </div>
      )}

      {tab==="quantum" && (
        <Card t={t}>
          <ML t={t}>EOT Quantum — Symbolic Deduction Ledger</ML>
          <div style={{ padding:14, background:t.surface2, borderRadius:10, marginBottom:12, border:`1px solid ${t.border}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:`1px solid ${t.border}` }}>
              <span style={{ fontSize:13, color:t.textSub }}>Requested EOT</span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:t.text, fontWeight:600 }}>{ruleResult.quantum.requested} days</span>
            </div>
            {ruleResult.quantum.deductions.map((d,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:`1px solid ${t.border}` }}>
                <span style={{ fontSize:11, color:t.textSub }}>− {d.reason}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:t.rose, fontWeight:600 }}>−{d.days} days</span>
              </div>
            ))}
            {ruleResult.quantum.deductions.length===0 && <div style={{ padding:"7px 0", fontSize:11, color:t.textMuted }}>No deductions applied</div>}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0 2px", marginTop:3 }}>
              <span style={{ fontSize:14, fontWeight:700, color:t.text }}>Recommended EOT Grant</span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:24, fontWeight:800, color:t.amber, textShadow:`0 0 16px ${t.amberGlow}` }}>{ruleResult.quantum.recommended} days</span>
            </div>
          </div>
          <div style={{ padding:"9px 12px", background:t.surface2, borderRadius:8, fontSize:10, color:t.textMuted, fontFamily:"'JetBrains Mono',monospace", lineHeight:1.8 }}>
            Deduction methodology (FIDIC 2017):<br/>
            · Concurrent contractor delay → indicative apportionment (actual requires TIA)<br/>
            · Programme not updated → 10% uncertainty reduction (§8.3)<br/>
            · Critical path undemonstrated → 15% conservative reduction (§8.4)<br/>
            <span style={{ color:t.orange }}>⚠ Indicative only. Formal Time Impact Analysis (TIA) required for binding determination.</span>
          </div>
        </Card>
      )}

      {tab==="risk" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <Card t={t}>
            <ML t={t}>Risk Allocation — FIDIC 2017</ML>
            {[
              { label:"Employer Risk", sub:"§8.4(a), §8.4(e)", desc:"EOT + Cost + Profit. Employer bears all consequences.", id:"RA_EMPL", c:t.rose },
              { label:"Shared Risk",   sub:"§8.4(c), §8.4(d), §18.4", desc:"EOT only — no additional Cost.", id:"RA_SHAR", c:t.amber },
              { label:"Contractor Risk",sub:"Default", desc:"No EOT. Contractor bears all consequences.", id:"RA_CONT", c:t.textMuted },
            ].map(r=>(
              <div key={r.id} style={{ display:"flex", gap:10, padding:11, marginBottom:7, background:riskId===r.id?r.c+"10":t.surface2, border:`1px solid ${riskId===r.id?r.c+"44":t.border}`, borderRadius:8, alignItems:"flex-start", transition:"all 0.18s" }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:riskId===r.id?r.c:t.border, marginTop:4, flexShrink:0, boxShadow:riskId===r.id?`0 0 6px ${r.c}88`:"none" }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:riskId===r.id?r.c:t.textSub }}>{r.label} <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", fontWeight:400, color:t.textMuted }}>{r.sub}</span></div>
                  <div style={{ fontSize:11, color:t.textMuted, marginTop:2 }}>{r.desc}</div>
                </div>
                {riskId===r.id && <Badge t={t} color={r.c} sm>Active</Badge>}
              </div>
            ))}
          </Card>
          <Card t={t}>
            <ML t={t}>KG-Activated Clauses for "{extraction.cause}"</ML>
            {(ruleResult.kg_clauses||[]).map((c,i)=>c&&(
              <div key={i} style={{ display:"flex", gap:9, padding:"6px 0", borderBottom:`1px solid ${t.border}`, alignItems:"center" }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:t.amber, width:60, flexShrink:0, fontWeight:700 }}>{c.label}</span>
                <span style={{ fontSize:11, color:t.text, flex:1 }}>{c.props?.title||c.type}</span>
                <Badge t={t} color={t.textMuted} sm>{c.type}</Badge>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   METRICS VIEW
═══════════════════════════════════════════════════════════════════════════ */
function MetricsView({ result, t }) {
  if(!result) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400, gap:12, animation:"fadeUp 0.22s ease" }}>
      <div style={{ fontSize:36, opacity:0.2 }}>⊙</div>
      <div style={{ fontSize:13, color:t.textSub }}>Run an analysis to see research-grade pipeline metrics.</div>
    </div>
  );

  const { metrics, ruleResult } = result;
  const symPct = Math.round((metrics.symbolic_ratio||0)*100);
  const catCounts = {};
  ruleResult.fired_rules.forEach(r=>{ catCounts[r.cat]=(catCounts[r.cat]||0)+1; });

  return (
    <div style={{ animation:"fadeUp 0.22s ease" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
        {[
          { l:"Total Latency",  v:`${metrics.total_ms}ms`,  c:t.cyan,   sub:"End-to-end",      icon:"⏱" },
          { l:"Symbolic Ratio", v:`${symPct}%`,             c:t.emerald,sub:"Rules vs LLM",     icon:"◈" },
          { l:"Rules Fired",    v:`${metrics.rules_fired}/${metrics.rules_evaluated}`, c:t.amber, sub:"Activation rate", icon:"§" },
          { l:"KG Coverage",    v:`${metrics.kg_nodes}N·${metrics.kg_edges}E`, c:t.violet, sub:"Graph", icon:"◉" },
        ].map(m=>(
          <Card key={m.l} t={t} style={{ padding:16, textAlign:"center" }}>
            <div style={{ fontSize:18, marginBottom:8, color:m.c }}>{m.icon}</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:20, fontWeight:800, color:m.c, lineHeight:1, marginBottom:4 }}>{m.v}</div>
            <div style={{ fontSize:9, color:t.textMuted, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>{m.l}</div>
            <div style={{ fontSize:10, color:t.textMuted, marginTop:2 }}>{m.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Card t={t}>
          <ML t={t}>Pipeline Stage Timing</ML>
          {[
            { l:"Neural Extraction (LLM)",   v:metrics.neural_ms, c:t.violet },
            { l:"KG Enrichment (Symbolic)",   v:metrics.kg_ms, c:t.cyan },
            { l:"Rule Evaluation (Symbolic)", v:metrics.rule_ms, c:t.emerald },
            { l:"XAI Trace Generation",       v:metrics.explain_ms, c:t.amber },
          ].map(s=>(
            <div key={s.l} style={{ marginBottom:11 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ fontSize:11, color:t.textSub }}>{s.l}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:s.c, fontWeight:600 }}>{s.v}ms</span>
              </div>
              <ProgressBar value={s.v} max={Math.max(metrics.total_ms,1)} color={s.c} t={t} height={4} />
            </div>
          ))}
          <div style={{ marginTop:14, padding:"10px 12px", background:t.surface2, borderRadius:8 }}>
            <ML t={t} mb={5}>Symbolic/Neural Composition</ML>
            <div style={{ display:"flex", height:18, borderRadius:5, overflow:"hidden", gap:2 }}>
              <div style={{ flex:symPct, background:`linear-gradient(90deg, ${t.emerald}CC, ${t.emerald})`, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:symPct>10?"5px 0 0 5px":0 }}>
                <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:"#0A1A0E", fontWeight:800 }}>{symPct>15?`${symPct}%`:""}</span>
              </div>
              <div style={{ flex:100-symPct, background:`linear-gradient(90deg, ${t.violet}CC, ${t.violet})`, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:100-symPct>10?"0 5px 5px 0":0 }}>
                <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:"#0A081A", fontWeight:800 }}>{100-symPct>5?`${100-symPct}%`:""}</span>
              </div>
            </div>
            <div style={{ fontSize:9, color:t.textMuted, marginTop:5, fontFamily:"'JetBrains Mono',monospace" }}>Target: ≥97% symbolic for legal decisions</div>
          </div>
        </Card>

        <div>
          <Card t={t} style={{ marginBottom:12 }}>
            <ML t={t}>Rule Category Distribution</ML>
            {Object.entries(catCounts).sort((a,b)=>b[1]-a[1]).map(([cat,count])=>(
              <div key={cat} style={{ marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:catColors(t)[cat]||t.textMuted, textTransform:"uppercase", letterSpacing:"0.05em" }}>{cat}</span>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:t.textMuted }}>{count}</span>
                </div>
                <ProgressBar value={count} max={Math.max(ruleResult.rules_fired,1)} color={catColors(t)[cat]} t={t} height={4} />
              </div>
            ))}
          </Card>
          <Card t={t}>
            <ML t={t}>System Parameters</ML>
            {[
              ["Architecture","Neurosymbolic AI"],
              ["Standard","FIDIC 2017 Red Book"],
              ["KG Nodes",metrics.kg_nodes],["KG Edges",metrics.kg_edges],
              ["Rule Count",metrics.rules_evaluated],["Rules Fired",metrics.rules_fired],
              ["Symbolic Ratio",`${symPct}%`],["LLM Calls",metrics.llm_calls],
              ["Confidence",`${result.ruleResult.confidence}%`],
              ["Outcome",result.ruleResult.outcome],
              ["Rec. EOT",`${result.ruleResult.quantum.recommended} days`],
              ["Processing",`${metrics.total_ms}ms`],
            ].map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:`1px solid ${t.border}`, fontSize:10 }}>
                <span style={{ color:t.textMuted, fontFamily:"'JetBrains Mono',monospace" }}>{k}</span>
                <span style={{ color:t.text, fontFamily:"'JetBrains Mono',monospace", fontWeight:500 }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DETERMINATION VIEW
═══════════════════════════════════════════════════════════════════════════ */
function DetermineView({ result, t }) {
  const [det, setDet] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if(!result) return;
    setLoading(true);
    const { ruleResult, extraction } = result;
    const q = ruleResult.quantum;
    const sys = `You are The Engineer issuing a formal EOT Determination under Sub-Clause 3.7.3 of the FIDIC 2017 Conditions of Contract for Construction (Red Book, 2nd Edition). Write a complete, professional, clause-anchored determination letter. Include all sections: 1. PROJECT DETAILS, 2. BACKGROUND & CLAIM SUMMARY, 3. NOTICE COMPLIANCE ANALYSIS (§20.2.1, §20.2.4, §20.2.8), 4. ENTITLEMENT ANALYSIS (§8.4 grounds), 5. PROGRAMME & DELAY ANALYSIS, 6. CONCURRENT DELAY, 7. QUANTUM ASSESSMENT, 8. DETERMINATION, 9. COST & PAYMENT, 10. CONDITIONS & RIGHTS OF REVIEW. Be formal, precise, reference specific sub-clauses. Use placeholders like [Project Name], [Contractor].`;
    const prompt = `Generate the §3.7.3 Determination:\nCause: ${extraction.cause_description||extraction.cause}\nOutcome (symbolic): ${ruleResult.outcome}\nConfidence: ${ruleResult.confidence}%\nEOT requested: ${q.requested}d | Symbolic recommendation: ${q.recommended}d\nNotice days (§20.2.1): ${extraction.notice_days??'not provided'}\nDetailed claim days (§20.2.4): ${extraction.detailed_days??'not provided'}\nBlocking rule: ${ruleResult.blocking_rule??'none'}\nRisk bearer: ${ruleResult.kg_risk?.label??'unknown'}\nCost entitlement: ${ruleResult.kg_risk?.props?.cost?'Yes':'No'}\nDeductions: ${q.deductions.map(d=>`${d.days}d — ${d.reason}`).join('; ')||'none'}\n\nKey rule findings:\n${ruleResult.reasoning_chain.slice(0,8).map(r=>`[${r.rule_id}] §${r.cl}: ${r.exp.slice(0,150)}`).join('\n')}`;
    try {
      const res = await fetch("https://axiom-proxy.axiomeot.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2500,system:sys,messages:[{role:"user",content:prompt}]})});
      const data = await res.json();
      setDet(data.content?.map(b=>b.text||"").join("")||"Generation failed — check API connectivity.");
    } catch(_) {
      setDet(`[LLM unavailable — Symbolic Summary]\n\nENGINEER'S DETERMINATION\nSub-Clause 3.7.3 — FIDIC 2017\n${"─".repeat(50)}\n\nOUTCOME: ${ruleResult.outcome.toUpperCase()}\nCONFIDENCE: ${ruleResult.confidence}%\nRECOMMENDED EOT GRANT: ${q.recommended} days\nRISK BEARER: ${ruleResult.kg_risk?.label||"—"}\nCOST ENTITLEMENT: ${ruleResult.kg_risk?.props?.cost?"Yes":"No"}\n\nKEY FINDINGS:\n${ruleResult.reasoning_chain.slice(0,6).map(r=>r.exp).join("\n\n")}`);
    }
    setLoading(false);
  }

  async function copy() { try { await navigator.clipboard.writeText(det); setCopied(true); setTimeout(()=>setCopied(false),2000); } catch(_) {} }

  return (
    <div style={{ animation:"fadeUp 0.22s ease" }}>
      <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:18 }}>
        <div>
          <Card t={t} style={{ marginBottom:12 }}>
            <ML t={t}>Determination Generator</ML>
            <div style={{ fontSize:12, color:t.textSub, lineHeight:1.7, marginBottom:12 }}>
              The <strong style={{ color:t.emerald }}>outcome, quantum, and clause findings</strong> come entirely from the 40-rule symbolic engine. The LLM only formats the formal letter narrative.
            </div>
            {result ? (
              <div style={{ padding:"9px 11px", background:t.surface2, borderRadius:8, border:`1px solid ${t.border}`, marginBottom:12 }}>
                <div style={{ display:"flex", gap:7, alignItems:"center", marginBottom:5 }}>
                  <OutcomeChip outcome={result.ruleResult.outcome} t={t} />
                  <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:t.textMuted }}>{result.ruleResult.confidence}% · {result.ruleResult.quantum.recommended}d</span>
                </div>
                <div style={{ fontSize:10, color:t.textMuted }}>Symbolic decision locked — LLM will narrate only</div>
              </div>
            ) : (
              <div style={{ padding:"9px 11px", background:t.orange+"10", border:`1px solid ${t.orange}28`, borderRadius:8, marginBottom:12, fontSize:11, color:t.orange }}>⚠ Run an analysis first from the Analyse tab.</div>
            )}
            <Btn full onClick={generate} loading={loading} disabled={!result} t={t}>Generate §3.7.3 Letter</Btn>
          </Card>

          <Card t={t}>
            <ML t={t}>Hybrid Architecture</ML>
            {[
              { icon:"§",  c:t.emerald, label:"Symbolic Decision", desc:"40 rules decide outcome, quantum, risk. Fully deterministic." },
              { icon:"◈",  c:t.cyan,    label:"KG Clause Activation", desc:"Clauses activated by graph traversal — not LLM memory." },
              { icon:"⬡",  c:t.violet,  label:"LLM Narration Only", desc:"LLM formats formal text. Makes zero entitlement decisions." },
            ].map((a,i)=>(
              <div key={i} style={{ display:"flex", gap:10, padding:"9px 0", borderBottom:`1px solid ${t.border}` }}>
                <div style={{ width:30, height:30, borderRadius:7, background:a.c+"14", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:a.c, flexShrink:0, border:`1px solid ${a.c}28` }}>{a.icon}</div>
                <div><div style={{ fontSize:12, fontWeight:600, color:t.text }}>{a.label}</div><div style={{ fontSize:10, color:t.textMuted, marginTop:2 }}>{a.desc}</div></div>
              </div>
            ))}
          </Card>
        </div>

        <div>
          {loading && (
            <Card t={t} style={{ textAlign:"center", padding:50 }}>
              <div style={{ fontSize:20, color:t.amber, animation:"pulse 1.5s ease-in-out infinite", marginBottom:10 }}>◌</div>
              <div style={{ fontSize:14, fontWeight:600, color:t.text }}>Drafting formal determination…</div>
              <div style={{ fontSize:11, color:t.textMuted, marginTop:5 }}>LLM narrating symbolic decision · max 2500 tokens</div>
            </Card>
          )}
          {det && !loading && (
            <Card t={t} noPad>
              <div style={{ padding:"11px 14px", borderBottom:`1px solid ${t.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:t.surface2, borderRadius:"12px 12px 0 0" }}>
                <div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:t.amber, fontWeight:700 }}>§3.7.3 ENGINEER'S DETERMINATION</div>
                  <div style={{ fontSize:9, color:t.textMuted, marginTop:1 }}>Symbolic decision · LLM-narrated letter</div>
                </div>
                <div style={{ display:"flex", gap:7 }}>
                  <Badge t={t} color={t.emerald} sm>Symbolic Decision</Badge>
                  <Btn variant="ghost" sm onClick={copy} t={t}>{copied?"✓ Copied":"⎘ Copy"}</Btn>
                </div>
              </div>
              <div style={{ padding:18, maxHeight:580, overflowY:"auto" }}>
                <pre style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:t.textSub, lineHeight:1.85, whiteSpace:"pre-wrap", margin:0 }}>{det}</pre>
              </div>
            </Card>
          )}
          {!det && !loading && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:280, gap:10, background:t.surface, border:`1px solid ${t.border}`, borderRadius:12 }}>
              <div style={{ fontSize:28, color:t.border }}>⊛</div>
              <div style={{ fontSize:12, color:t.textMuted }}>Click Generate to produce the formal §3.7.3 determination letter</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   KG EXPLORER VIEW
═══════════════════════════════════════════════════════════════════════════ */
function KGView({ t }) {
  const kg = useMemo(() => new KnowledgeGraph().load(FIDIC_KB), []);
  const [selType, setSelType] = useState("ALL");
  const [selNode, setSelNode] = useState(null);
  const types = useMemo(() => ["ALL", ...new Set(FIDIC_KB.nodes.map(n => n.type))], []);
  const vis = selType === "ALL" ? FIDIC_KB.nodes : FIDIC_KB.nodes.filter(n => n.type === selType);
  const typeColor = { CLAUSE:t.cyan, GROUND:t.amber, OBLIGATION:t.orange, RISK:t.rose, PARTY:t.violet, OUTCOME:t.emerald };
  const stats = useMemo(() => kg.stats(), [kg]);
  const nodeInfo = selNode ? kg.node(selNode) : null;
  const nodeEdges = selNode ? FIDIC_KB.edges.filter(e => e.from === selNode || e.to === selNode) : [];

  return (
    <div style={{ animation:"fadeUp 0.22s ease" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16 }}>
        {[{l:"Nodes",v:stats.total_nodes,c:t.cyan,icon:"◉"},{l:"Edges",v:stats.total_edges,c:t.amber,icon:"→"},{l:"Node Types",v:stats.node_types.length,c:t.emerald,icon:"⬡"},{l:"Edge Relations",v:stats.edge_types.length,c:t.violet,icon:"↔"}].map(m=>(
          <Card key={m.l} t={t} style={{ padding:14, textAlign:"center" }}>
            <div style={{ fontSize:18, color:m.c, marginBottom:2 }}>{m.icon}</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:22, fontWeight:700, color:m.c, lineHeight:1 }}>{m.v}</div>
            <div style={{ fontSize:9, color:t.textMuted, marginTop:3, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.1em", textTransform:"uppercase" }}>{m.l}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"190px 1fr", gap:14 }}>
        {/* Filter sidebar */}
        <div>
          <Card t={t} style={{ marginBottom:10, padding:12 }}>
            <ML t={t}>Filter by Type</ML>
            {types.map(tp=>(
              <button key={tp} onClick={()=>setSelType(tp)} className="hoverable"
                style={{ display:"block", width:"100%", padding:"7px 9px", marginBottom:3, background:selType===tp?(typeColor[tp]||t.amber)+"16":t.surface2, border:`1px solid ${selType===tp?(typeColor[tp]||t.amber)+"44":t.border}`, color:selType===tp?(typeColor[tp]||t.amber):t.textSub, borderRadius:6, textAlign:"left", cursor:"pointer", fontSize:11, fontFamily:"'JetBrains Mono',monospace", fontWeight:selType===tp?700:400 }}>
                {tp} <span style={{ color:t.textMuted, fontSize:9 }}>({FIDIC_KB.nodes.filter(n=>tp==="ALL"||n.type===tp).length})</span>
              </button>
            ))}
          </Card>

          {nodeInfo && (
            <Card t={t} style={{ padding:12, border:`1px solid ${(typeColor[nodeInfo.type]||t.amber)+"44"}` }}>
              <ML t={t} color={typeColor[nodeInfo.type]||t.amber}>Selected Node</ML>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, color:typeColor[nodeInfo.type]||t.amber, fontWeight:700, marginBottom:4 }}>{nodeInfo.label}</div>
              <Badge t={t} color={typeColor[nodeInfo.type]||t.amber} sm>{nodeInfo.type}</Badge>
              <div style={{ marginTop:9 }}>
                {Object.entries(nodeInfo.props||{}).map(([k,v])=>(
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:`1px solid ${t.border}`, fontSize:10 }}>
                    <span style={{ color:t.textMuted }}>{k}</span>
                    <span style={{ color:t.text, fontFamily:"'JetBrains Mono',monospace" }}>{String(v)}</span>
                  </div>
                ))}
              </div>
              {nodeEdges.length>0 && (
                <div style={{ marginTop:9 }}>
                  <ML t={t} mb={4}>Connections ({nodeEdges.length})</ML>
                  {nodeEdges.slice(0,8).map((e,i)=>(
                    <div key={i} style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:t.textMuted, marginBottom:3, lineHeight:1.5 }}>
                      <span style={{ color:e.from===selNode?t.cyan:t.textSub }}>{e.from}</span>
                      <span style={{ color:t.amber }}> —{e.rel}→ </span>
                      <span style={{ color:e.to===selNode?t.violet:t.textSub }}>{e.to}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Main graph area */}
        <Card t={t} style={{ padding:14 }}>
          <div style={{ marginBottom:12 }}>
            <ML t={t}>{vis.length} nodes shown — click to inspect</ML>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {Object.entries(typeColor).map(([tp,c])=>(
                <span key={tp} style={{ display:"inline-flex", alignItems:"center", gap:3, fontSize:9, color:t.textMuted }}>
                  <span style={{ width:7,height:7,borderRadius:2,background:c,display:"inline-block" }}/>{tp}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:16 }}>
            {vis.map(n=>(
              <div key={n.id} onClick={()=>setSelNode(n.id===selNode?null:n.id)}
                style={{ padding:"5px 10px", borderRadius:7, border:`1px solid ${selNode===n.id?typeColor[n.type]||t.amber:t.border}`, background:selNode===n.id?(typeColor[n.type]||t.amber)+"16":t.surface2, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", minWidth:70, transition:"all 0.13s", boxShadow:selNode===n.id?`0 0 10px ${(typeColor[n.type]||t.amber)+"44"}`:"none" }}
                onMouseEnter={e=>{if(n.id!==selNode){e.currentTarget.style.borderColor=typeColor[n.type]||t.borderHi;e.currentTarget.style.transform="translateY(-1px)";}}}
                onMouseLeave={e=>{if(n.id!==selNode){e.currentTarget.style.borderColor=t.border;e.currentTarget.style.transform="translateY(0)";}}}>
                <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:typeColor[n.type]||t.textSub }}>{n.label}</span>
                <span style={{ fontSize:7, color:t.textMuted, marginTop:1 }}>{n.type}</span>
              </div>
            ))}
          </div>

          {/* Relation types */}
          <div style={{ padding:"10px 12px", background:t.surface2, borderRadius:8, marginBottom:12 }}>
            <ML t={t} mb={5}>Relation Types ({[...new Set(FIDIC_KB.edges.map(e=>e.rel))].length})</ML>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:4 }}>
              {[...new Set(FIDIC_KB.edges.map(e=>e.rel))].map(rel=>(
                <div key={rel} style={{ padding:"4px 6px", background:t.surface3, borderRadius:4, fontSize:8, fontFamily:"'JetBrains Mono',monospace", color:t.textSub }}>
                  {rel} <span style={{ color:t.textMuted }}>({FIDIC_KB.edges.filter(e=>e.rel===rel).length})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Critical path */}
          <div>
            <ML t={t} mb={5}>Critical Reasoning Path</ML>
            <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
              {["Delay Event","§8.4 Ground","Obligation","§20.2.1 Notice","Risk Allocation","40 Rules","EOT Decision"].map((s,i,arr)=>(
                <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
                  <span style={{ padding:"4px 9px", background:i===arr.length-1?t.amberDim:t.surface2, border:`1px solid ${i===arr.length-1?t.amberBorder:t.border}`, borderRadius:5, fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:i===arr.length-1?t.amber:i===0?t.textMuted:t.textSub, fontWeight:i===arr.length-1?700:400 }}>{s}</span>
                  {i<arr.length-1 && <span style={{ color:t.textMuted, fontSize:10 }}>→</span>}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ABOUT VIEW
═══════════════════════════════════════════════════════════════════════════ */
function AboutView({ t }) {
  return (
    <div style={{ animation:"fadeUp 0.22s ease" }}>
      {/* Hero */}
      <div style={{ marginBottom:20, padding:"24px 28px", background:`linear-gradient(135deg, ${t.surface} 0%, ${t.surface2} 100%)`, borderRadius:14, border:`1px solid ${t.border}`, position:"relative", overflow:"hidden", boxShadow:t.shadowCard }}>
        <div style={{ position:"absolute", top:-50, right:-50, width:200, height:200, borderRadius:"50%", background:t.amberDim, filter:"blur(80px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-30, left:"40%", width:120, height:120, borderRadius:"50%", background:t.cyanDim, filter:"blur(60px)", pointerEvents:"none" }} />
        <div style={{ position:"relative" }}>
          <AxiomLogo t={t} size={44} />
          <div style={{ marginTop:14 }}>
            <h1 style={{ fontSize:26, fontWeight:800, color:t.text, letterSpacing:"-0.03em", marginBottom:6, lineHeight:1.1 }}>Neurosymbolic EOT<br/>Intelligence Platform</h1>
            <p style={{ fontSize:14, color:t.textSub, fontStyle:"italic", marginBottom:14 }}>"Every decision. Every reason. Every clause."</p>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
              <Badge t={t} color={t.amber}>FIDIC 2017 Red Book</Badge>
              <Badge t={t} color={t.emerald}>40 Symbolic Rules</Badge>
              <Badge t={t} color={t.cyan}>35 KG Nodes · 41 Edges</Badge>
              <Badge t={t} color={t.violet}>Neurosymbolic AI</Badge>
              <Badge t={t} color={t.rose}>v5 · 2025</Badge>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div>
          <Card t={t} style={{ marginBottom:12 }}>
            <ML t={t}>Architecture</ML>
            {[
              { title:"Symbolic Rule Engine", c:t.emerald, desc:"40 FIDIC 2017 rules across 8 priority tiers: procedural → entitlement → programme → quantum → evidence → determination → mitigation → aggregation. Blocking rules enforce time-bars. Confidence accumulation model." },
              { title:"Knowledge Graph (35N/41E)", c:t.cyan, desc:"RDF-style typed property graph. CLAUSE, GROUND, OBLIGATION, RISK, PARTY, OUTCOME nodes. 10 edge relation types including REQUIRES, SUPPORTS, FALLS_UNDER, TRIGGERS_IF_LATE." },
              { title:"Neurosymbolic Pipeline", c:t.violet, desc:"LLM extraction → KG enrichment → 40-rule evaluation → XAI trace. LLM called once for parsing. All legal reasoning is symbolic, deterministic, and auditable." },
              { title:"AI Chat Assistant", c:t.orange, desc:"Contextual FIDIC guidance. Understands current analysis state. Helps users understand parameters, interpret results, and navigate FIDIC 2017 clauses." },
            ].map(p=>(
              <div key={p.title} style={{ padding:"10px 0", borderBottom:`1px solid ${t.border}` }}>
                <div style={{ fontSize:12, fontWeight:700, color:p.c, marginBottom:3 }}>{p.title}</div>
                <div style={{ fontSize:11, color:t.textSub, lineHeight:1.65 }}>{p.desc}</div>
              </div>
            ))}
          </Card>

          <Card t={t}>
            <ML t={t}>Deployment</ML>
            {[
              {k:"Frontend",   v:"React + Vite → GitHub Pages / Cloudflare Pages", c:t.cyan},
              {k:"API Proxy",  v:"Cloudflare Workers (100k req/day free tier)",     c:t.orange},
              {k:"AI Engine",  v:"Anthropic Claude Sonnet (parsing + narration)",    c:t.violet},
              {k:"Decisions",  v:"Fully symbolic — no AI for legal conclusions",     c:t.emerald},
              {k:"Infra Cost", v:"$0/month + Anthropic API usage only",             c:t.amber},
            ].map(d=>(
              <div key={d.k} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${t.border}`, fontSize:11 }}>
                <span style={{ color:t.textMuted, fontFamily:"'JetBrains Mono',monospace" }}>{d.k}</span>
                <span style={{ color:d.c, fontSize:10 }}>{d.v}</span>
              </div>
            ))}
          </Card>
        </div>

        <div>
          <Card t={t} style={{ marginBottom:12 }}>
            <ML t={t}>FIDIC 2017 Coverage</ML>
            {[
              {cl:"§20.2.1",title:"Notice of Claim",rule:"R001–R004",critical:true},
              {cl:"§20.2.4",title:"Fully Detailed Claim",rule:"R005–R007",critical:true},
              {cl:"§20.2.8",title:"Time-Bar Consequences",rule:"R001–R002",critical:true},
              {cl:"§18.2",title:"Exceptional Event Notice",rule:"R008",critical:false},
              {cl:"§8.4(a)",title:"Variation",rule:"R011",critical:false},
              {cl:"§8.4(c)",title:"Adverse Climate",rule:"R012",critical:false},
              {cl:"§8.4(d)",title:"Epidemic Shortage",rule:"R013",critical:false},
              {cl:"§8.4(e)",title:"Employer Impediment",rule:"R010",critical:false},
              {cl:"§8.3",title:"Programme Compliance",rule:"R020–R024",critical:false},
              {cl:"§3.7",title:"Agreement or Determination",rule:"R050–R051",critical:false},
              {cl:"§20.2.2",title:"Contemporary Records",rule:"R040–R046",critical:false},
              {cl:"§1.9/§2.1",title:"Late Drawings / Site Access",rule:"R018",critical:false},
            ].map(r=>(
              <div key={r.cl} style={{ display:"flex", gap:9, padding:"5px 0", borderBottom:`1px solid ${t.border}`, alignItems:"center" }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:r.critical?t.rose:t.amber, width:64, flexShrink:0, fontWeight:700 }}>{r.cl}</span>
                <span style={{ fontSize:11, color:t.text, flex:1 }}>{r.title}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:t.textMuted }}>{r.rule}</span>
              </div>
            ))}
          </Card>

          <Card t={t}>
            <ML t={t}>v5 New Features</ML>
            {["Vertical sidebar navigation with icon+label layout","New geometric AXIOM logo mark","Completely redesigned UI with improved hierarchy","Fixed dark/light mode switching (persists correctly)","New Dashboard home with KG stats and analysis overview","AI Chat Assistant panel (FIDIC-aware contextual guidance)","Better card design with gradient borders and depth","Improved typography (DM Sans + JetBrains Mono)","Responsive layout with collapsible sidebar","All v4 features preserved and improved"].map((c,i)=>(
              <div key={i} style={{ display:"flex", gap:9, padding:"6px 0", borderBottom:`1px solid ${t.border}` }}>
                <span style={{ color:t.amber, flexShrink:0, fontSize:11 }}>◈</span>
                <span style={{ fontSize:11, color:t.textSub, lineHeight:1.6 }}>{c}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PDF REPORT GENERATOR (preserved from v4)
═══════════════════════════════════════════════════════════════════════════ */
function generateAnalysisReport(result) {
  const { extraction, ruleResult, trace, metrics } = result;
  const q = ruleResult.quantum;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day:"2-digit", month:"long", year:"numeric" });
  const timeStr = now.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" });

  const outcomeColors = {
    eligible:         { bg:"#d1fae5", text:"#065f46", border:"#6ee7b7" },
    not_eligible:     { bg:"#fee2e2", text:"#991b1b", border:"#fca5a5" },
    time_barred:      { bg:"#fee2e2", text:"#7f1d1d", border:"#f87171" },
    partial:          { bg:"#fef3c7", text:"#78350f", border:"#fcd34d" },
    insufficient_info:{ bg:"#f3f4f6", text:"#374151", border:"#d1d5db" },
  };
  const oc = outcomeColors[ruleResult.outcome] || outcomeColors.insufficient_info;
  const outcomeLabel = ruleResult.outcome.replace(/_/g," ").toUpperCase();

  const catBadgeColors = { procedural:"#dc2626", entitlement:"#059669", programme:"#d97706", quantum:"#ea580c", evidence:"#0284c7", determination:"#7c3aed", mitigation:"#4b5563", aggregation:"#6b7280" };

  const ruleRows = ruleResult.fired_rules.map(r => `
    <tr>
      <td style="padding:7px 10px; font-family:monospace; font-size:11px; color:#374151; border-bottom:1px solid #e5e7eb;">${r.id}</td>
      <td style="padding:7px 10px; font-size:11px; border-bottom:1px solid #e5e7eb;"><span style="padding:1px 6px; border-radius:3px; font-size:9px; font-weight:700; text-transform:uppercase; background:${catBadgeColors[r.cat]||"#6b7280"}22; color:${catBadgeColors[r.cat]||"#6b7280"}; border:1px solid ${catBadgeColors[r.cat]||"#6b7280"}44; font-family:monospace;">${r.cat}</span></td>
      <td style="padding:7px 10px; font-family:monospace; font-size:10px; color:#4b5563; border-bottom:1px solid #e5e7eb;">§${r.cl}</td>
      <td style="padding:7px 10px; font-size:11px; color:#111827; border-bottom:1px solid #e5e7eb;">${r.name}</td>
      <td style="padding:7px 10px; font-size:10px; border-bottom:1px solid #e5e7eb; max-width:280px; color:${r.exp?.startsWith("✓")?"#065f46":r.exp?.startsWith("⛔")?"#991b1b":r.exp?.startsWith("⚠")?"#78350f":"#374151"}">${r.exp||""}</td>
      <td style="padding:7px 10px; font-family:monospace; font-size:11px; text-align:center; border-bottom:1px solid #e5e7eb; color:${r.csq?.block?"#991b1b":"#374151"}; font-weight:${r.csq?.block?700:400};">${r.csq?.block?"BLOCKING":"—"}</td>
      <td style="padding:7px 10px; font-family:monospace; font-size:11px; text-align:center; border-bottom:1px solid #e5e7eb; color:${(r.csq?.cd||0)>0?"#065f46":"#991b1b"};">${(r.csq?.cd||0)>=0?"+":""}${r.csq?.cd||0}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>AXIOM v5 EOT Analysis Report — ${dateStr}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'DM Sans',sans-serif; color:#111827; background:#fff; font-size:12px; line-height:1.6; }
  @page { size:A4; margin:15mm 14mm; }
  @media print { .no-print { display:none !important; } body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } .page-break { page-break-before:always; } .avoid-break { page-break-inside:avoid; } }
  .report-page { max-width:780px; margin:0 auto; padding:10px; }
  .report-header { display:flex; justify-content:space-between; align-items:flex-start; padding:20px 24px; background:linear-gradient(135deg, #060A12 0%, #0B1120 50%, #141F32 100%); border-radius:12px; margin-bottom:22px; color:#fff; }
  .axiom-wordmark { font-size:26px; font-weight:800; color:#E8A020; letter-spacing:0.14em; font-family:'JetBrains Mono',monospace; }
  .section { margin-bottom:18px; }
  .section-title { font-family:'JetBrains Mono',monospace; font-size:10px; font-weight:700; color:#6b7280; letter-spacing:0.14em; text-transform:uppercase; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid #e5e7eb; }
  .outcome-banner { padding:14px 18px; background:${oc.bg}; border:2px solid ${oc.border}; border-radius:10px; margin-bottom:18px; display:flex; justify-content:space-between; align-items:center; }
  .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:14px; }
  .stat-card { padding:11px 13px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; }
  .rules-table { width:100%; border-collapse:collapse; font-size:11px; }
  .rules-table th { padding:8px 10px; background:#1f2937; color:#e5e7eb; font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; text-align:left; }
  .print-btn { position:fixed; top:20px; right:20px; padding:10px 20px; background:#E8A020; color:#0A0800; border:none; border-radius:8px; font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700; cursor:pointer; z-index:100; letter-spacing:0.04em; }
</style>
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">⎙ Print / Save PDF</button>
<div class="report-page">
  <div class="report-header avoid-break">
    <div>
      <div class="axiom-wordmark">AXIOM</div>
      <div style="font-size:9px; color:#6B82A0; font-family:'JetBrains Mono',monospace; letter-spacing:0.16em; text-transform:uppercase; margin-top:3px;">Neurosymbolic · FIDIC 2017 · v5</div>
      <div style="margin-top:10px; display:flex; gap:6px; flex-wrap:wrap;">
        <span style="padding:2px 7px; background:rgba(232,160,32,0.2); color:#E8A020; border:1px solid rgba(232,160,32,0.3); border-radius:4px; font-size:9px; font-family:'JetBrains Mono',monospace; font-weight:700;">FIDIC 2017 Red Book</span>
        <span style="padding:2px 7px; background:rgba(52,211,153,0.2); color:#34D399; border:1px solid rgba(52,211,153,0.3); border-radius:4px; font-size:9px; font-family:'JetBrains Mono',monospace; font-weight:700;">40 Symbolic Rules</span>
        <span style="padding:2px 7px; background:rgba(56,189,248,0.2); color:#38BDF8; border:1px solid rgba(56,189,248,0.3); border-radius:4px; font-size:9px; font-family:'JetBrains Mono',monospace; font-weight:700;">35N · 41E Graph</span>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px; color:#E2EAF4; font-weight:600; letter-spacing:0.04em;">EOT CLAIM ANALYSIS REPORT</div>
      <div style="font-size:10px; color:#6B82A0; font-family:'JetBrains Mono',monospace; margin-top:4px;">${dateStr} · ${timeStr}</div>
      <div style="font-size:9px; color:#344C6A; font-family:'JetBrains Mono',monospace; margin-top:2px;">REF: AXM-${Date.now().toString(36).toUpperCase()}</div>
    </div>
  </div>

  <div class="section avoid-break">
    <div class="section-title">1. Executive Summary — Determination Outcome</div>
    <div class="outcome-banner">
      <div>
        <div style="font-size:20px; font-weight:800; color:${oc.text}; font-family:'JetBrains Mono',monospace; letter-spacing:0.06em;">${outcomeLabel}</div>
        <div style="margin-top:8px; font-size:11px; color:${oc.text};">Risk Bearer: ${ruleResult.kg_risk?.label||"—"} · Cost: ${ruleResult.kg_risk?.props?.cost?"✓ Entitled":"✕ Not Entitled"}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-family:'JetBrains Mono',monospace; font-size:22px; font-weight:800; color:${oc.text};">${ruleResult.confidence}%</div>
        <div style="font-size:9px; color:${oc.text}; font-family:'JetBrains Mono',monospace; text-transform:uppercase;">Confidence</div>
        <div style="margin-top:8px; font-family:'JetBrains Mono',monospace; font-size:20px; font-weight:800; color:${oc.text};">${q.recommended}d</div>
        <div style="font-size:9px; color:${oc.text}; font-family:'JetBrains Mono',monospace; text-transform:uppercase;">Recommended EOT</div>
      </div>
    </div>
    <div class="stats-grid">
      ${[["Rules Evaluated",ruleResult.rules_evaluated,"#1f2937"],["Rules Fired",ruleResult.rules_fired,"#0284c7"],["Blocking Rule",ruleResult.blocking_rule||"None",ruleResult.blocking_rule?"#991b1b":"#059669"],["Processing Time",`${metrics.total_ms}ms`,"#78350f"]].map(([k,v,c])=>`<div class="stat-card"><div style="font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:700; color:${c};">${v}</div><div style="font-size:9px; color:#6b7280; font-family:'JetBrains Mono',monospace; text-transform:uppercase; letter-spacing:0.08em; margin-top:3px;">${k}</div></div>`).join("")}
    </div>
  </div>

  <div class="section page-break">
    <div class="section-title">2. Symbolic Rules Fired (${ruleResult.rules_fired} of ${ruleResult.rules_evaluated})</div>
    <table class="rules-table">
      <thead><tr><th>Rule ID</th><th>Category</th><th>Clause</th><th>Rule Name</th><th>Explanation</th><th>Blocking</th><th>Δ Conf</th></tr></thead>
      <tbody>${ruleRows}</tbody>
    </table>
  </div>

  <div style="margin-top:28px; padding:10px 0; border-top:2px solid #e5e7eb; display:flex; justify-content:space-between; font-size:9px; color:#9ca3af; font-family:'JetBrains Mono',monospace;">
    <span>AXIOM v5 · Neurosymbolic EOT Intelligence · FIDIC 2017 Conditions of Contract for Construction</span>
    <span>Generated: ${dateStr} ${timeStr} · Not legal advice — indicative recommendations only</span>
  </div>
</div>
</body>
</html>`;

  const w = window.open("", "_blank");
  if(w) { w.document.write(html); w.document.close(); }
}

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST NOTIFICATION
═══════════════════════════════════════════════════════════════════════════ */
function Toast({ toast, t }) {
  if(!toast) return null;
  return (
    <div style={{ position:"fixed", top:64, right:22, zIndex:999, padding:"10px 15px", background:toast.type==="error"?t.roseGlow:t.emeraldGlow, border:`1px solid ${toast.type==="error"?t.rose:t.emerald}44`, borderRadius:10, fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:toast.type==="error"?t.rose:t.emerald, boxShadow:t.shadow, animation:"slideIn 0.2s ease", maxWidth:420, backdropFilter:"blur(12px)" }}>
      {toast.type==="error"?"⛔":"✓"} {toast.msg}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [isDark, setIsDark]       = useState(true);
  const [view, setView]           = useState("dashboard");
  const [result, setResult]       = useState(null);
  const [toast, setToast]         = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatOpen, setChatOpen]   = useState(false);

  // Theme object — recomputed whenever isDark changes
  const t = isDark ? T.dark : T.light;

  const showToast = useCallback((msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleResult = useCallback((r) => {
    setResult(r);
    setView("results");
    showToast(`${r.ruleResult.outcome.replace(/_/g," ").toUpperCase()} · ${r.ruleResult.quantum.recommended}d recommended · ${r.ruleResult.confidence}% confidence`);
  }, [showToast]);

  return (
    <div style={{ display:"flex", height:"100vh", background:t.bg, color:t.text, overflow:"hidden", fontFamily:"'DM Sans',sans-serif" }}>
      <GlobalStyles t={t} />

      {/* Sidebar */}
      <Sidebar view={view} setView={setView} t={t} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} result={result} />

      {/* Main area */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        <Header view={view} t={t} isDark={isDark} setIsDark={setIsDark} onOpenChat={() => setChatOpen(o => !o)} result={result} />

        {/* Content */}
        <main style={{ flex:1, overflowY:"auto", padding:"22px 24px 48px" }}>
          <div style={{ maxWidth:1280, margin:"0 auto" }}>
            {view === "dashboard" && <DashboardView result={result} t={t} onNavigate={setView} />}
            {view === "analyse"   && <AnalyseView onResult={handleResult} t={t} />}
            {view === "results"   && <ResultsView result={result} onNewAnalysis={() => setView("analyse")} t={t} />}
            {view === "metrics"   && <MetricsView result={result} t={t} />}
            {view === "determine" && <DetermineView result={result} t={t} />}
            {view === "kg"        && <KGView t={t} />}
            {view === "about"     && <AboutView t={t} />}
          </div>
        </main>

        {/* Footer */}
        <footer style={{ borderTop:`1px solid ${t.border}`, padding:"8px 22px", background:t.surface, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:t.textMuted }}>AXIOM v5 · FIDIC 2017 · 40 rules · 35N/41E · Symbolic decisions only</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:t.textMuted }}>Not legal advice — indicative recommendations only</span>
        </footer>
      </div>

      {/* AI Chat panel (slides from right) */}
      {chatOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:100 }} onClick={(e) => { if(e.target===e.currentTarget) setChatOpen(false); }}>
          <div style={{ position:"absolute", right:0, top:0, bottom:0, width:380, background:t.surface, boxShadow:t.shadow, animation:"slideIn 0.25s ease", display:"flex", flexDirection:"column" }}>
            <ChatPanel t={t} onClose={() => setChatOpen(false)} result={result} />
          </div>
        </div>
      )}

      <Toast toast={toast} t={t} />
    </div>
  );
}
