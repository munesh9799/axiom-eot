/**
 * AXIOM v3 — Neurosymbolic EOT Intelligence Platform
 * "Every decision. Every reason. Every clause."
 *
 * FIDIC 2017 Conditions of Contract for Construction
 * Architecture: LLM parse → KG enrichment → 40-rule Symbolic Engine → XAI trace
 *
 * v3: Complete UX overhaul
 *  - Precision Intelligence design system (dark + light mode)
 *  - Sora + JetBrains Mono typography
 *  - Animated compliance timeline, confidence arc gauge
 *  - Full-screen analysis loading overlay with stage progress
 *  - Glassmorphism cards, gradient accents, ambient backgrounds
 *  - All v2 logic preserved (40 rules, 35N/41E KG, no sensitive data)
 */

import { useState, useRef, useMemo, useCallback, useEffect } from "react";

/* ═══ FIDIC 2017 KNOWLEDGE BASE ════════════════════════════════════════════ */
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

/* ═══ KNOWLEDGE GRAPH ENGINE ════════════════════════════════════════════════ */
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

/* ═══ SYMBOLIC RULE ENGINE — 40 FIDIC 2017 RULES ═══════════════════════════ */
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

/* ═══ PIPELINE HELPERS ══════════════════════════════════════════════════════ */
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
    const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:sys,messages:[{role:"user",content}]})});
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
  steps.push({stage:2,type:"symbolic",icon:"◈",color:"#38BDF8",label:"Knowledge Graph Enrichment",sub:`${kgStats.total_nodes} nodes · ${kgStats.total_edges} edges · ${kgStats.traversals} traversals`,items:[`Cause → Ground: ${ruleResult.kg_risk?.label??"unknown"}`,`Activated clauses: ${clauseLabels.join(", ")||"none"}`,`Risk allocation: ${ruleResult.kg_risk?.label??"—"}`,`Cost entitlement: ${ruleResult.kg_risk?.props?.cost?"Yes":"No"}`,`KG edge hits: ${kgStats.edge_hits??0}`],confidence:1.0});
  ruleResult.reasoning_chain.forEach(step=>{const fr=ruleResult.fired_rules.find(r=>r.id===step.rule_id);steps.push({stage:3,type:"symbolic",icon:"§",color:"#34D399",label:`Rule ${step.rule_id}`,sub:`§${step.cl} · ${step.cat} · Δconf ${step.delta>=0?"+":""}${step.delta}`,items:[step.exp],confidence:step.conf_after,is_rule:true,blocking:fr?.csq?.block});});
  const q=ruleResult.quantum;
  steps.push({stage:4,type:"symbolic",icon:"⊙",color:"#F59E0B",label:"EOT Quantum Calculation",sub:`${q.requested}d requested → ${q.recommended}d recommended`,items:[`Requested: ${q.requested} calendar days`,...q.deductions.map(d=>`Deduction: −${d.days}d — ${d.reason}`),`RECOMMENDED GRANT: ${q.recommended} calendar days`],confidence:ruleResult.confidence_raw});
  steps.push({stage:5,type:"decision",icon:"⊛",color:"#E8A020",label:"Final Determination",sub:`${ruleResult.outcome.toUpperCase()} | ${ruleResult.confidence}% confidence`,items:[`Outcome: ${ruleResult.outcome}`,`Rules evaluated: ${ruleResult.rules_evaluated}`,`Rules fired: ${ruleResult.rules_fired}`,`Blocking rule: ${ruleResult.blocking_rule??"none"}`,`Confidence: ${ruleResult.confidence}%`,`Recommended EOT: ${q.recommended}d`],confidence:ruleResult.confidence_raw,is_final:true});
  return{steps,summary:{final_outcome:ruleResult.outcome,final_conf:ruleResult.confidence,recommended_eot:q.recommended,risk_bearer:ruleResult.kg_risk?.label??"—",cost_entitled:ruleResult.kg_risk?.props?.cost??false}};
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
   DESIGN SYSTEM v3 — "Precision Intelligence"
   Typography: Sora (UI) + JetBrains Mono (data)
   Palette: Deep Indigo dark / Warm Parchment light
   Accent: Warm Amber (#E8A020) primary · Sky Cyan (#38BDF8) secondary
═══════════════════════════════════════════════════════════════════════════ */

const THEMES = {
  dark: {
    isDark: true,
    bg:          "#080C14",
    bgDeep:      "#050810",
    surface:     "#0D1321",
    surface2:    "#111927",
    surface3:    "#16202E",
    surface4:    "#1B2840",
    border:      "#1E2C42",
    borderHi:    "#28405E",
    borderFocus: "#3A5A8A",
    glass:       "rgba(13,19,33,0.8)",
    amber:       "#E8A020",
    amberSoft:   "#F5C842",
    amberGlow:   "rgba(232,160,32,0.15)",
    amberDim:    "rgba(232,160,32,0.08)",
    cyan:        "#38BDF8",
    cyanSoft:    "#7DD3FC",
    cyanGlow:    "rgba(56,189,248,0.12)",
    emerald:     "#34D399",
    emeraldGlow: "rgba(52,211,153,0.12)",
    rose:        "#FB7185",
    roseGlow:    "rgba(251,113,133,0.12)",
    violet:      "#A78BFA",
    violetGlow:  "rgba(167,139,250,0.12)",
    orange:      "#FB923C",
    text:        "#E2EAF4",
    textSub:     "#E2EAF4",
    textMuted:   "#99aabe",
    textGhost:   "#1A2C42",
    shadow:      "0 8px 32px rgba(0,0,0,0.6)",
    shadowSm:    "0 2px 12px rgba(0,0,0,0.5)",
    gridLine:    "rgba(255,255,255,0.025)",
  },
  light: {
    isDark: false,
    bg:          "#F5F3EE",
    bgDeep:      "#EBE8E0",
    surface:     "#FFFFFF",
    surface2:    "#F0EDE7",
    surface3:    "#E5E1D8",
    surface4:    "#D8D2C6",
    border:      "#C8C2B4",
    borderHi:    "#A89E8E",
    borderFocus: "#8C7B62",
    glass:       "rgba(255,255,255,0.92)",
    amber:       "#B36A00",
    amberSoft:   "#8F5500",
    amberGlow:   "rgba(179,106,0,0.14)",
    amberDim:    "rgba(179,106,0,0.07)",
    cyan:        "#025F8A",
    cyanSoft:    "#0276A8",
    cyanGlow:    "rgba(2,95,138,0.10)",
    emerald:     "#046B4D",
    emeraldGlow: "rgba(4,107,77,0.10)",
    rose:        "#C01138",
    roseGlow:    "rgba(192,17,56,0.10)",
    violet:      "#5B1FA8",
    violetGlow:  "rgba(91,31,168,0.10)",
    orange:      "#C44A00",
    text:        "#0D1117",
    textSub:     "#374151",
    textMuted:   "#5C6470",
    textGhost:   "#8C95A0",
    shadow:      "0 4px 20px rgba(0,0,0,0.12)",
    shadowSm:    "0 2px 8px rgba(0,0,0,0.09)",
    gridLine:    "rgba(0,0,0,0.05)",
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
  eligible:         { label:"ELIGIBLE",       emoji:"✓", shade:"emerald" },
  not_eligible:     { label:"NOT ELIGIBLE",   emoji:"✕", shade:"rose"    },
  time_barred:      { label:"TIME BARRED",    emoji:"⛔", shade:"rose"   },
  partial:          { label:"PARTIAL",        emoji:"◑", shade:"amber"   },
  insufficient_info:{ label:"INSUFF. INFO",   emoji:"?", shade:"sub"     },
};

/* ═══ GLOBAL STYLES INJECT ══════════════════════════════════════════════════ */
function GlobalStyles({ t, isDark }) {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { font-size: 16px; -webkit-font-smoothing: antialiased; }
      body { background: ${t.bg}; color: ${t.text}; font-family: 'Sora', sans-serif; }
      ::-webkit-scrollbar { width: 5px; height: 5px; }
      ::-webkit-scrollbar-track { background: ${t.surface}; }
      ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { background: ${t.borderHi}; }
      select option { background: ${t.surface2}; color: ${t.text}; }
      input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
      input[type=checkbox] { accent-color: ${t.amber}; width: 14px; height: 14px; cursor: pointer; }
      input[type=radio] { accent-color: ${t.amber}; cursor: pointer; }
      ::placeholder { color: ${t.textGhost} !important; opacity: 1; }

      @keyframes fadeUp   { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
      @keyframes spin     { to { transform: rotate(360deg); } }
      @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
      @keyframes shimmer  { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      @keyframes scaleIn  { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
      @keyframes slideRight { from { width:0; } to { width:100%; } }
      @keyframes glow     { 0%,100% { box-shadow: 0 0 8px ${t.amberGlow}; } 50% { box-shadow: 0 0 20px ${t.amberGlow}, 0 0 40px ${t.amberDim}; } }

      .card { animation: fadeUp 0.25s ease; }
      .hoverable:hover { background: ${t.surface2} !important; border-color: ${t.borderHi} !important; transition: all 0.15s ease; }
      .tab-btn { transition: all 0.15s ease; }
      .tab-btn:hover { color: ${t.text} !important; background: ${t.surface3} !important; }
      .nav-btn { transition: all 0.15s ease; }
      .nav-btn:hover { color: ${t.text} !important; background: ${t.surface2} !important; }
      .chip-emerald { background: rgba(52,211,153,0.12); color: #34D399; border: 1px solid rgba(52,211,153,0.25); }
      .chip-rose    { background: rgba(251,113,133,0.12); color: #FB7185; border: 1px solid rgba(251,113,133,0.25); }
      .chip-amber   { background: ${t.amberGlow}; color: ${t.amber}; border: 1px solid rgba(232,160,32,0.25); }
      .chip-sub     { background: rgba(107,130,160,0.12); color: #4B5D72; border: 1px solid rgba(107,130,160,0.2); }
      ${!isDark ? `
        .chip-emerald { background: rgba(4,107,77,0.11); color: #046B4D; border-color: rgba(4,107,77,0.22); }
        .chip-rose    { background: rgba(192,17,56,0.10); color: #C01138; border-color: rgba(192,17,56,0.22); }
        .chip-amber   { background: rgba(179,106,0,0.11); color: #B36A00; border-color: rgba(179,106,0,0.22); }
        .chip-sub     { background: rgba(55,65,81,0.08); color: #374151; border-color: rgba(55,65,81,0.18); }
      ` : ''}

      .grid-bg {
        background-image: linear-gradient(${t.gridLine} 1px, transparent 1px),
                          linear-gradient(90deg, ${t.gridLine} 1px, transparent 1px);
        background-size: 40px 40px;
      }
      .shimmer-bar {
        background: linear-gradient(90deg, transparent 0%, ${t.borderHi} 50%, transparent 100%);
        background-size: 200% 100%;
        animation: shimmer 1.8s infinite;
      }
    `}</style>
  );
}

/* ═══ PRIMITIVE COMPONENTS ══════════════════════════════════════════════════ */
const Card = ({ children, style={}, className="card", glow, t }) => (
  <div className={className} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, boxShadow: glow ? `0 0 0 1px ${t.amberGlow}, ${t.shadowSm}` : t.shadowSm, ...style }}>
    {children}
  </div>
);

const SLabel = ({ children, t, color, size=9.5 }) => (
  <div style={{ fontSize: size, fontFamily: "'JetBrains Mono', monospace", color: color || t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7, fontWeight: 700 }}>
    {children}
  </div>
);

const Badge = ({ children, t, color, sm, glow }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: sm ? "1px 6px" : "3px 8px", background: (color || t.amber) + "18", border: `1px solid ${(color || t.amber)}30`, borderRadius: 4, color: color || t.amber, fontSize: sm ? 9 : 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", boxShadow: glow ? `0 0 12px ${(color||t.amber)}33` : "none" }}>
    {children}
  </span>
);

const OutcomeChip = ({ outcome, t, lg }) => {
  const cfg = outcomeConfig[outcome] || outcomeConfig.insufficient_info;
  const shadeMap = { emerald: t.emerald, rose: t.rose, amber: t.amber, sub: t.textSub };
  const c = shadeMap[cfg.shade] || t.textSub;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: lg ? "6px 14px" : "3px 10px", background: c + "18", border: `1px solid ${c}30`, borderRadius: 6, color: c, fontSize: lg ? 14 : 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: "0.08em" }}>
      <span>{cfg.emoji}</span> {cfg.label}
    </span>
  );
};

const ProgressBar = ({ value, max=100, color, t, height=6, animated }) => {
  const pct = Math.min(100, Math.round((value/max)*100));
  const c = color || (pct >= 70 ? t.emerald : pct >= 40 ? t.amber : t.rose);
  return (
    <div style={{ height, background: t.surface3, borderRadius: height, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height, background: `linear-gradient(90deg, ${c}, ${c}DD)`, borderRadius: height, transition: animated ? "width 0.8s cubic-bezier(0.34,1.56,0.64,1)" : "none", boxShadow: `0 0 8px ${c}44` }} />
    </div>
  );
};

const ConfidenceArc = ({ pct, t, size=90 }) => {
  const c = pct>=70 ? t.emerald : pct>=50 ? t.amber : t.rose;
  const r = 34; const circ = 2*Math.PI*r;
  const arcLen = (pct/100)*circ*0.75; // 270° arc
  const dash = `${arcLen} ${circ}`;
  const rotate = 135; // start from bottom-left
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(0deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.surface3} strokeWidth="6" strokeDasharray={`${circ*0.75} ${circ}`} strokeDashoffset={0} strokeLinecap="round" transform={`rotate(135 ${size/2} ${size/2})`} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth="6" strokeDasharray={dash} strokeDashoffset={0} strokeLinecap="round" transform={`rotate(135 ${size/2} ${size/2})`} style={{ filter:`drop-shadow(0 0 6px ${c}88)`, transition:"stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", paddingTop:4 }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, fontWeight:700, color:c, lineHeight:1 }}>{pct}</div>
        <div style={{ fontSize:8, color:t.textMuted, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.1em" }}>CONF%</div>
      </div>
    </div>
  );
};

const Inp = ({ label, value, onChange, type="text", placeholder, note, t, right }) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <SLabel t={t}>{label}</SLabel>
        {right && <span style={{ fontSize:9, color:t.textSub }}>{right}</span>}
      </div>
    )}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ width:"100%", background: t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:"9px 13px", color:t.text, fontFamily:"'Sora',sans-serif", fontSize:13, outline:"none", transition:"border-color 0.15s, box-shadow 0.15s" }}
      onFocus={e=>{e.target.style.borderColor=t.borderFocus;e.target.style.boxShadow=`0 0 0 3px ${t.amberDim}`;}}
      onBlur={e=>{e.target.style.borderColor=t.border;e.target.style.boxShadow="none";}} />
    {note && <div style={{ fontSize:10, color:t.textMuted, marginTop:4 }}>{note}</div>}
  </div>
);

const Sel = ({ label, value, onChange, options, t }) => (
  <div style={{ marginBottom:14 }}>
    {label && <SLabel t={t}>{label}</SLabel>}
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ width:"100%", background:t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:"9px 13px", color:t.text, fontFamily:"'Sora',sans-serif", fontSize:13, outline:"none", cursor:"pointer" }}
      onFocus={e=>{e.target.style.borderColor=t.borderFocus;}}
      onBlur={e=>{e.target.style.borderColor=t.border;}}>
      {options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>
);

const Txt = ({ label, value, onChange, rows=4, placeholder, t }) => (
  <div style={{ marginBottom:14 }}>
    {label && <SLabel t={t}>{label}</SLabel>}
    <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows} placeholder={placeholder}
      style={{ width:"100%", background:t.surface2, border:`1px solid ${t.border}`, borderRadius:8, padding:"9px 13px", color:t.text, fontFamily:"'Sora',sans-serif", fontSize:13, outline:"none", resize:"vertical", lineHeight:1.65, transition:"border-color 0.15s, box-shadow 0.15s" }}
      onFocus={e=>{e.target.style.borderColor=t.borderFocus;e.target.style.boxShadow=`0 0 0 3px ${t.amberDim}`;}}
      onBlur={e=>{e.target.style.borderColor=t.border;e.target.style.boxShadow="none";}} />
  </div>
);

const Btn = ({ children, onClick, variant="primary", sm, disabled, loading, full, t, icon, danger }) => {
  const styles = {
    primary: { bg:`linear-gradient(135deg, ${t.amber}, ${t.amberSoft})`, color: t.isDark ? "#0A0800" : "#FFFFFF", border:"none", shadow:`0 4px 16px ${t.amberGlow}` },
    secondary: { bg:"transparent", color:t.textSub, border:`1px solid ${t.border}`, shadow:"none" },
    ghost: { bg:t.surface2, color:t.text, border:`1px solid ${t.border}`, shadow:t.shadowSm },
    danger: { bg:t.roseGlow, color:t.rose, border:`1px solid ${t.rose}30`, shadow:"none" },
  };
  const s = styles[variant] || styles.primary;
  return (
    <button onClick={onClick} disabled={disabled||loading}
      style={{ background:s.bg, color:s.color, border:s.border||"none", borderRadius:8, padding:sm?"5px 12px":"9px 18px", fontSize:sm?10:12, fontFamily:"'Sora',sans-serif", fontWeight:700, cursor:disabled||loading?"not-allowed":"pointer", opacity:disabled?0.45:1, letterSpacing:"0.04em", width:full?"100%":"auto", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:disabled?"none":s.shadow, transition:"all 0.15s ease" }}
      onMouseEnter={e=>{if(!disabled&&!loading)e.currentTarget.style.transform="translateY(-1px)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)"; }}>
      {loading ? <><span style={{ animation:"spin 0.8s linear infinite", display:"inline-block", fontSize:13 }}>◌</span> Processing…</> : <>{icon&&<span style={{ fontSize:sm?11:13 }}>{icon}</span>}{children}</>}
    </button>
  );
};

const ToggleCheck = ({ checked, onChange, label, note, t }) => (
  <label style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:10, cursor:"pointer", userSelect:"none" }}>
    <div style={{ position:"relative", width:38, height:20, flexShrink:0, marginTop:1 }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity:0, width:0, height:0, position:"absolute" }} />
      <div style={{ position:"absolute", inset:0, background:checked?`linear-gradient(135deg, ${t.amber}, ${t.amberSoft})`:t.surface3, borderRadius:10, border:`1px solid ${checked?t.amber:t.border}`, transition:"all 0.2s", boxShadow:checked?`0 0 8px ${t.amberGlow}`:"none" }}
        onClick={onChange}>
        <div style={{ position:"absolute", top:2, left:checked?18:2, width:14, height:14, background:checked?(t.isDark?"#0A0800":"#FFFFFF"):t.isDark?"#fff":"#6b7280", borderRadius:"50%", transition:"left 0.2s, background 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }} />
      </div>
    </div>
    <div>
      <div style={{ fontSize:12, color:t.text, fontWeight:500 }}>{label}</div>
      {note && <div style={{ fontSize:10, color:t.textMuted, marginTop:2 }}>{note}</div>}
    </div>
  </label>
);

/* ═══ COMPLIANCE TIMELINE ════════════════════════════════════════════════════ */
function ComplianceTimeline({ noticeDays, detailDays, t }) {
  const MAX = 90;
  const nd = parseInt(noticeDays) || null;
  const dd = parseInt(detailDays) || null;

  const Marker = ({ day, color, label }) => (
    <div style={{ position:"absolute", left:`${(day/MAX)*100}%`, top:0, bottom:0, display:"flex", flexDirection:"column", alignItems:"center", transform:"translateX(-50%)" }}>
      <div style={{ width:1, height:"100%", background:color, opacity:0.6, borderLeft:`1px dashed ${color}` }} />
      <div style={{ position:"absolute", bottom:-18, fontSize:8, fontFamily:"'JetBrains Mono',monospace", color, whiteSpace:"nowrap", fontWeight:600 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <SLabel t={t}>Deadline Timeline</SLabel>
        <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:t.textMuted }}>0 — 90 days from awareness</span>
      </div>
      <div style={{ position:"relative", height:28, marginBottom:24 }}>
        {/* Track */}
        <div style={{ position:"absolute", top:"50%", left:0, right:0, height:6, background:t.surface3, borderRadius:3, transform:"translateY(-50%)" }} />
        {/* 28-day zone */}
        <div style={{ position:"absolute", top:"50%", left:0, width:`${(28/MAX)*100}%`, height:6, background:`linear-gradient(90deg, ${t.emerald}33, ${t.emerald}88)`, borderRadius:"3px 0 0 3px", transform:"translateY(-50%)" }} />
        {/* 28–84 zone */}
        <div style={{ position:"absolute", top:"50%", left:`${(28/MAX)*100}%`, width:`${((84-28)/MAX)*100}%`, height:6, background:`linear-gradient(90deg, ${t.amber}55, ${t.amber}22)`, transform:"translateY(-50%)" }} />
        {/* Deadline markers */}
        <Marker day={28} color={t.emerald} label="§20.2.1 Notice (28d)" />
        <Marker day={84} color={t.amber} label="§20.2.4 Claim (84d)" />
        {/* Notice dot */}
        {nd !== null && (
          <div style={{ position:"absolute", top:"50%", left:`${Math.min((nd/MAX)*100,100)}%`, transform:"translate(-50%,-50%)", width:12, height:12, borderRadius:"50%", background:nd<=28?t.emerald:t.rose, border:`2px solid ${t.surface}`, boxShadow:`0 0 8px ${nd<=28?t.emerald:t.rose}88`, zIndex:2, transition:"all 0.3s" }}
            title={`Notice: ${nd}d`} />
        )}
        {/* Detail dot */}
        {dd !== null && (
          <div style={{ position:"absolute", top:"50%", left:`${Math.min((dd/MAX)*100,100)}%`, transform:"translate(-50%,-50%)", width:12, height:12, borderRadius:"50%", background:dd<=84?t.amber:t.rose, border:`2px solid ${t.surface}`, boxShadow:`0 0 8px ${dd<=84?t.amber:t.rose}88`, zIndex:2, transition:"all 0.3s" }}
            title={`Detailed Claim: ${dd}d`} />
        )}
      </div>
      {/* Status pills */}
      <div style={{ display:"flex", gap:8 }}>
        {nd !== null && (
          <div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20, background:nd<=28?t.emeraldGlow:t.roseGlow, border:`1px solid ${nd<=28?t.emerald:t.rose}33`, fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:nd<=28?t.emerald:t.rose, fontWeight:600 }}>
            <span>{nd<=28?"✓":"⛔"}</span> Notice: {nd}d {nd<=28?`(OK, ${28-nd}d remaining)`:`(${nd-28}d OVERDUE)`}
          </div>
        )}
        {dd !== null && (
          <div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20, background:dd<=84?t.amberGlow:t.roseGlow, border:`1px solid ${dd<=84?t.amber:t.rose}33`, fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:dd<=84?t.amber:t.rose, fontWeight:600 }}>
            <span>{dd<=84?"✓":"⛔"}</span> Claim: {dd}d {dd<=84?`(OK, ${84-dd}d remaining)`:`(${dd-84}d OVERDUE)`}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ ANALYSIS LOADING OVERLAY ═══════════════════════════════════════════════ */
function AnalysisOverlay({ stage, t }) {
  const stages = [
    { n:1, label:"Neural Extraction", sub:"Claude LLM parsing documents", icon:"⬡", color:t.violet },
    { n:2, label:"Knowledge Graph",   sub:"35N · 41E traversal",           icon:"◈", color:t.cyan  },
    { n:3, label:"Rule Evaluation",   sub:"40 FIDIC 2017 rules",           icon:"§", color:t.emerald},
    { n:4, label:"XAI Trace Build",   sub:"Explainability chain",          icon:"⊙", color:t.amber },
  ];
  const current = parseInt(stage?.replace(/[^0-9]/g,"")) || 1;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(5,8,16,0.92)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:1000, backdropFilter:"blur(8px)", animation:"fadeIn 0.2s" }}>
      <div style={{ width:400, animation:"scaleIn 0.3s ease" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:t.amber, letterSpacing:"0.2em", marginBottom:8, fontWeight:700 }}>AXIOM · NEUROSYMBOLIC PIPELINE</div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, color:t.text, letterSpacing:"-0.02em" }}>Analysing Claim…</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {stages.map(s => {
            const done = s.n < current;
            const active = s.n === current;
            return (
              <div key={s.n} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 16px", background:active?s.color+"15":done?t.surface2:t.surface, borderRadius:10, border:`1px solid ${active?s.color+"44":done?t.border+"88":t.border+"44"}`, transition:"all 0.3s" }}>
                <div style={{ width:36, height:36, borderRadius:8, background:active?s.color+"22":done?t.surface3:t.surface2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:active?s.color:done?t.textSub:t.textMuted, flexShrink:0, border:`1px solid ${active?s.color+"44":t.border}` }}>
                  {done ? <span style={{ color:t.emerald }}>✓</span> : active ? <span style={{ animation:"spin 1s linear infinite", display:"inline-block", fontSize:14, color:s.color }}>◌</span> : <span>{s.icon}</span>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:active?s.color:done?t.text:t.textMuted }}>{s.label}</div>
                  <div style={{ fontSize:10, color:t.textMuted, marginTop:1 }}>{s.sub}</div>
                </div>
                {active && <div style={{ width:50 }}><ProgressBar value={60} t={t} color={s.color} animated /></div>}
                {done && <Badge t={t} color={t.emerald} sm>Done</Badge>}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop:24, height:2, background:t.surface3, borderRadius:2, overflow:"hidden" }}>
          <div className="shimmer-bar" style={{ height:"100%", width:"100%" }} />
        </div>
      </div>
    </div>
  );
}

/* ═══ ANALYSE VIEW ══════════════════════════════════════════════════════════ */
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
    for (const f of fs) {
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
      <div>
        {/* Page header */}
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:22, fontWeight:800, color:t.text, letterSpacing:"-0.02em", marginBottom:4 }}>EOT Claim Analysis</h1>
          <p style={{ fontSize:13, color:t.textSub }}>Enter claim parameters below. The LLM extracts structured facts; 40 FIDIC 2017 rules then make all legal decisions.</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, alignItems:"start" }}>
          {/* LEFT */}
          <div>
            {/* Project details */}
            <Card t={t} style={{ marginBottom:16 }}>
              <SLabel t={t}>Project Information</SLabel>
              <Inp label="Project Name" value={form.project} onChange={v=>upd("project",v)} t={t} placeholder="e.g. Northgate Interchange — Package D2" />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Inp label="Contractor" value={form.contractor} onChange={v=>upd("contractor",v)} t={t} placeholder="e.g. Apex Infrastructure Ltd." />
                <Inp label="The Engineer" value={form.engineer} onChange={v=>upd("engineer",v)} t={t} placeholder="e.g. Meridian Advisory Engineers" />
              </div>
            </Card>

            {/* Delay event */}
            <Card t={t} style={{ marginBottom:16 }}>
              <SLabel t={t}>Delay Event</SLabel>
              <Inp label="Short Event Label" value={form.delay_event} onChange={v=>upd("delay_event",v)} t={t} placeholder="e.g. Late issuance of revised piling drawings — Blocks C–F" />
              <Sel label="FIDIC §8.4 Cause Category" value={form.cause} onChange={v=>upd("cause",v)} t={t} options={[
                {v:"employer_delay",      l:"§8.4(e) — Employer Delay / Impediment"},
                {v:"employer_instruction",l:"§8.4(e) — Employer Instruction (Disruption)"},
                {v:"late_drawings",       l:"§8.4(e) + §1.9 — Late Drawings / Instructions"},
                {v:"site_access",         l:"§8.4(e) + §2.1 — Site Access / Possession"},
                {v:"variation",           l:"§8.4(a) + §13.3 — Variation / Change Order"},
                {v:"scope_change",        l:"§8.4(a) — Scope Change"},
                {v:"additional_works",    l:"§8.4(a) — Additional Works"},
                {v:"force_majeure",       l:"§18.4 + §8.4(b) — Force Majeure / Exceptional Event"},
                {v:"authority_delay",     l:"§8.5 + §8.4(b) — Delays by Authorities"},
                {v:"suspension",          l:"§8.9 + §8.4(b) — Suspension by Engineer"},
                {v:"adverse_climate",     l:"§8.4(c) — Exceptionally Adverse Climatic Conditions"},
                {v:"epidemic_shortage",   l:"§8.4(d) — Epidemic / Government Action Shortage"},
              ]} />
              <Txt label="Delay Narrative" value={form.narrative} onChange={v=>upd("narrative",v)} rows={4} t={t} placeholder="Describe the delay event, cause, timeline, and impact on completion. The LLM will extract structured facts from this text." />
              
              {/* File upload */}
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <SLabel t={t}>Documents (PDF / Images)</SLabel>
                  {files.length>0 && <span style={{ fontSize:10, color:t.emerald, fontFamily:"'JetBrains Mono',monospace" }}>{files.length} attached</span>}
                </div>
                <input ref={fileRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={handleFiles} style={{ display:"none" }} />
                <div onClick={()=>fileRef.current.click()} style={{ border:`2px dashed ${t.border}`, borderRadius:8, padding:"12px 16px", cursor:"pointer", textAlign:"center", background:t.surface2, transition:"all 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=t.borderFocus;e.currentTarget.style.background=t.surface3;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.background=t.surface2;}}>
                  <div style={{ fontSize:11, color:t.textSub }}>⊕ Click to attach PDF or image files</div>
                  <div style={{ fontSize:10, color:t.textMuted, marginTop:2 }}>LLM will extract EOT facts from uploaded documents</div>
                </div>
                {files.length>0 && (
                  <div style={{ marginTop:8, display:"flex", flexWrap:"wrap", gap:5 }}>
                    {files.map((f,i)=>(
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:5, padding:"3px 8px 3px 10px", background:t.surface3, border:`1px solid ${t.border}`, borderRadius:20, fontSize:10, color:t.textSub }}>
                        <span>📄</span> {f.name.slice(0,20)}
                        <span onClick={()=>setFiles(p=>p.filter((_,j)=>j!==i))} style={{ cursor:"pointer", color:t.rose, fontSize:11, marginLeft:2 }}>✕</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Cause-conditional special notices */}
            {showFMNotice && (
              <Card t={t} style={{ marginBottom:16, border:`1px solid ${t.violet}44`, background:t.violetGlow }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <Badge t={t} color={t.violet} sm>§18.2 Required</Badge>
                  <SLabel t={t} color={t.violet}>Force Majeure — Dual Notice Requirement</SLabel>
                </div>
                <p style={{ fontSize:11, color:t.textSub, lineHeight:1.6, marginBottom:10 }}>Force Majeure requires <strong style={{ color:t.text }}>two separate notices</strong>: the §18.2 Exceptional Event Notice (within 14 days) AND the §20.2.1 EOT Notice (within 28 days).</p>
                {[{v:true,l:"§18.2 Notice given within 14 days of the Exceptional Event"},{v:false,l:"§18.2 Notice NOT given (or unknown)"}].map(opt=>(
                  <label key={String(opt.v)} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, cursor:"pointer" }}>
                    <input type="radio" name="fm_notice" checked={form.force_majeure_notice_given===opt.v} onChange={()=>upd("force_majeure_notice_given",opt.v)} />
                    <span style={{ fontSize:12, color:opt.v===false?t.rose:t.text }}>{opt.l}</span>
                  </label>
                ))}
              </Card>
            )}

            {showPriorNotice && (
              <Card t={t} style={{ marginBottom:16, border:`1px solid ${t.amber}33`, background:t.amberDim }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <Badge t={t} color={t.amber} sm>§1.9/§2.1</Badge>
                  <SLabel t={t} color={t.amberSoft}>Prior Notice to Engineer</SLabel>
                </div>
                <p style={{ fontSize:11, color:t.textSub, lineHeight:1.6, marginBottom:10 }}>§1.9/§2.1 requires the Contractor to notify the Engineer in advance that drawings or site access are required by a specific date.</p>
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
              <SLabel t={t}>Extraction Mode</SLabel>
              <ToggleCheck checked={!form._forceHeuristic} onChange={()=>setF(p=>({...p,_forceHeuristic:!p._forceHeuristic}))} t={t}
                label="LLM Extraction (Claude)" note="Recommended — Claude parses narrative and documents into structured claim data" />
              {form._forceHeuristic && <div style={{ marginTop:6, padding:"6px 10px", background:t.surface3, borderRadius:6, fontSize:10, color:t.orange, fontFamily:"'JetBrains Mono',monospace" }}>Heuristic mode: keyword-based parsing · 100% symbolic · No API call</div>}
            </Card>
          </div>

          {/* RIGHT */}
          <div>
            {/* Compliance timeline */}
            <Card t={t} style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <SLabel t={t}>Notice Compliance — FIDIC Time Bars</SLabel>
                <Badge t={t} color={t.rose} sm>§20.2.8 Time Bar</Badge>
              </div>

              <ComplianceTimeline noticeDays={form.notice_days} detailDays={form.detailed_days} t={t} />

              <ToggleCheck checked={form.notice_submitted} onChange={()=>setF(p=>({...p,notice_submitted:!p.notice_submitted}))} t={t}
                label="Notice of Claim submitted (§20.2.1)" note="Uncheck if no notice was given — triggers blocking Rule R001" />
              {form.notice_submitted && (
                <Inp label="Days from awareness to Notice" type="number" value={form.notice_days} onChange={v=>upd("notice_days",v)} t={t}
                  placeholder="e.g. 21" note="Leave blank if date unknown" right="28-day limit" />
              )}

              <ToggleCheck checked={form.detailed_claim_submitted} onChange={()=>setF(p=>({...p,detailed_claim_submitted:!p.detailed_claim_submitted}))} t={t}
                label="Fully Detailed Claim submitted (§20.2.4)" note="Uncheck if detailed claim not yet submitted" />
              {form.detailed_claim_submitted && (
                <Inp label="Days from awareness to Detailed Claim" type="number" value={form.detailed_days} onChange={v=>upd("detailed_days",v)} t={t}
                  placeholder="e.g. 68" note="Leave blank if date unknown" right="84-day limit" />
              )}

              <Inp label="Days since Detailed Claim (§3.7)" type="number" value={form.days_since_detailed_claim} onChange={v=>upd("days_since_detailed_claim",v)} t={t}
                placeholder="e.g. 30" note="42-day agreement period tracking — enter 0 if not yet submitted" />
            </Card>

            {/* Quantum */}
            <Card t={t} style={{ marginBottom:16 }}>
              <SLabel t={t}>EOT Quantum</SLabel>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Inp label="EOT Requested (days)" type="number" value={form.requested_eot} onChange={v=>upd("requested_eot",v)} t={t} placeholder="e.g. 90" />
                <Inp label="EOT Calculated (days)" type="number" value={form.calculated_eot} onChange={v=>upd("calculated_eot",v)} t={t} placeholder="e.g. 85" note="Blank = same as requested" />
                <Inp label="Concurrent Contractor Delay" type="number" value={form.concurrent_contractor_delay} onChange={v=>upd("concurrent_contractor_delay",v)} t={t} placeholder="0" note="Days of contractor-caused delay" />
                <Inp label="Contemporary Records Count" type="number" value={form.contemporary_records} onChange={v=>upd("contemporary_records",v)} t={t} placeholder="e.g. 3" note="Site diaries, photos, correspondence" />
              </div>
            </Card>

            {/* Checklist */}
            <Card t={t} style={{ marginBottom:16 }}>
              <SLabel t={t}>Evidence & Programme Checklist</SLabel>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
                <ToggleCheck checked={form.programme_submitted} onChange={()=>setF(p=>({...p,programme_submitted:!p.programme_submitted}))} t={t} label="Baseline programme submitted" note="§8.3 — within 28 days of commencement" />
                <ToggleCheck checked={form.programme_updated_after_delay} onChange={()=>setF(p=>({...p,programme_updated_after_delay:!p.programme_updated_after_delay}))} t={t} label="Programme updated after delay" note="Shows revised completion & recovery" />
                <ToggleCheck checked={form.critical_path_shown} onChange={()=>setF(p=>({...p,critical_path_shown:!p.critical_path_shown}))} t={t} label="Critical path impact shown" note="Delay affects completion date" />
                <ToggleCheck checked={form.contractual_basis_stated} onChange={()=>setF(p=>({...p,contractual_basis_stated:!p.contractual_basis_stated}))} t={t} label="Contractual basis stated" note="§20.2.4(b) — clause references in claim" />
                <ToggleCheck checked={form.records_attached_to_claim} onChange={()=>setF(p=>({...p,records_attached_to_claim:!p.records_attached_to_claim}))} t={t} label="Records attached to claim" note="§20.2.4(c) — as formal annexures" />
                <ToggleCheck checked={form.mitigation_evidence} onChange={()=>setF(p=>({...p,mitigation_evidence:!p.mitigation_evidence}))} t={t} label="Mitigation evidence available" note="Steps taken to minimise delay" />
              </div>
            </Card>

            {/* Run button */}
            <Btn full onClick={run} loading={loading} disabled={!form.delay_event && !form.narrative} t={t} icon="◈">
              Run Neurosymbolic Analysis
            </Btn>
            <p style={{ textAlign:"center", fontSize:10, color:t.textMuted, marginTop:8 }}>
              Narrative → LLM extract → KG (35N/41E) → 40 rules → XAI trace → Decision
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══ KG EXPLORER ═══════════════════════════════════════════════════════════ */
function KGView({ t }) {
  const kg = useMemo(()=>new KnowledgeGraph().load(FIDIC_KB),[]);
  const [selType, setSelType] = useState("ALL");
  const [selNode, setSelNode] = useState(null);
  const types = useMemo(()=>["ALL",...new Set(FIDIC_KB.nodes.map(n=>n.type))],[]);
  const vis = selType==="ALL"?FIDIC_KB.nodes:FIDIC_KB.nodes.filter(n=>n.type===selType);
  const typeColor = { CLAUSE:t.cyan, GROUND:t.amber, OBLIGATION:t.orange, RISK:t.rose, PARTY:t.violet, OUTCOME:t.emerald };
  const stats = useMemo(()=>kg.stats(),[kg]);
  const nodeInfo = selNode?kg.node(selNode):null;
  const nodeEdges = selNode?FIDIC_KB.edges.filter(e=>e.from===selNode||e.to===selNode):[];

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:t.text, letterSpacing:"-0.02em", marginBottom:4 }}>Knowledge Graph Explorer</h1>
        <p style={{ fontSize:13, color:t.textSub }}>Browse the FIDIC 2017 typed property graph. Click any node to inspect its properties and connections.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[{l:"Nodes",v:stats.total_nodes,c:t.cyan,icon:"◉"},{l:"Edges",v:stats.total_edges,c:t.amber,icon:"→"},{l:"Node Types",v:stats.node_types.length,c:t.emerald,icon:"⬡"},{l:"Edge Relations",v:stats.edge_types.length,c:t.violet,icon:"↔"}].map(m=>(
          <Card key={m.l} t={t} style={{ padding:16, textAlign:"center" }}>
            <div style={{ fontSize:22, color:m.c, marginBottom:2 }}>{m.icon}</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:26, fontWeight:700, color:m.c, lineHeight:1 }}>{m.v}</div>
            <div style={{ fontSize:10, color:t.textMuted, marginTop:4, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.1em", textTransform:"uppercase" }}>{m.l}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:16 }}>
        {/* Sidebar */}
        <div>
          <Card t={t} style={{ marginBottom:12, padding:12 }}>
            <SLabel t={t}>Filter by Type</SLabel>
            {types.map(tp=>(
              <button key={tp} onClick={()=>setSelType(tp)} className="hoverable"
                style={{ display:"block", width:"100%", padding:"7px 10px", marginBottom:3, background:selType===tp?(typeColor[tp]||t.amber)+"18":t.surface2, border:`1px solid ${selType===tp?(typeColor[tp]||t.amber)+"55":t.border}`, color:selType===tp?(typeColor[tp]||t.amber):t.textSub, borderRadius:6, textAlign:"left", cursor:"pointer", fontSize:11, fontFamily:"'JetBrains Mono',monospace", fontWeight:selType===tp?700:400 }}>
                <span>{tp}</span> <span style={{ color:t.textMuted, fontSize:9 }}>({FIDIC_KB.nodes.filter(n=>tp==="ALL"||n.type===tp).length})</span>
              </button>
            ))}
          </Card>
          {nodeInfo && (
            <Card t={t} style={{ padding:12, border:`1px solid ${(typeColor[nodeInfo.type]||t.amber)}44` }}>
              <SLabel t={t} color={typeColor[nodeInfo.type]||t.amber}>Selected Node</SLabel>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:15, color:typeColor[nodeInfo.type]||t.amber, fontWeight:700, marginBottom:4 }}>{nodeInfo.label}</div>
              <Badge t={t} color={typeColor[nodeInfo.type]||t.amber} sm>{nodeInfo.type}</Badge>
              <div style={{ marginTop:10 }}>
                {Object.entries(nodeInfo.props||{}).map(([k,v])=>(
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:`1px solid ${t.border}`, fontSize:10 }}>
                    <span style={{ color:t.textMuted }}>{k}</span>
                    <span style={{ color:t.text, fontFamily:"'JetBrains Mono',monospace" }}>{String(v)}</span>
                  </div>
                ))}
              </div>
              {nodeEdges.length>0 && (
                <div style={{ marginTop:10 }}>
                  <SLabel t={t}>Connections ({nodeEdges.length})</SLabel>
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
        <Card t={t} style={{ padding:16 }}>
          <div style={{ marginBottom:14 }}>
            <SLabel t={t}>FIDIC 2017 Knowledge Graph — {vis.length} nodes shown</SLabel>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {Object.entries(typeColor).map(([tp,c])=>(
                <span key={tp} style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:9, color:t.textMuted }}>
                  <span style={{ width:8, height:8, borderRadius:2, background:c, display:"inline-block" }}/>{tp}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:20 }}>
            {vis.map(n=>(
              <div key={n.id} onClick={()=>setSelNode(n.id===selNode?null:n.id)}
                style={{ padding:"6px 11px", borderRadius:8, border:`1px solid ${selNode===n.id?typeColor[n.type]||t.amber:t.border}`, background:selNode===n.id?(typeColor[n.type]||t.amber)+"18":t.surface2, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", minWidth:76, transition:"all 0.15s", boxShadow:selNode===n.id?`0 0 12px ${(typeColor[n.type]||t.amber)}44`:"none" }}
                onMouseEnter={e=>{if(n.id!==selNode){e.currentTarget.style.borderColor=typeColor[n.type]||t.borderHi;e.currentTarget.style.transform="translateY(-1px)";}}}
                onMouseLeave={e=>{if(n.id!==selNode){e.currentTarget.style.borderColor=t.border;e.currentTarget.style.transform="translateY(0)";}}} >
                <span style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:typeColor[n.type]||t.textSub }}>{n.label}</span>
                <span style={{ fontSize:8, color:t.textMuted, marginTop:1 }}>{n.type}</span>
              </div>
            ))}
          </div>

          {/* Edge relations */}
          <div style={{ padding:"12px 14px", background:t.surface2, borderRadius:8, marginBottom:14 }}>
            <SLabel t={t}>Relation Types ({[...new Set(FIDIC_KB.edges.map(e=>e.rel))].length})</SLabel>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:5 }}>
              {[...new Set(FIDIC_KB.edges.map(e=>e.rel))].map(rel=>(
                <div key={rel} style={{ padding:"4px 7px", background:t.surface3, borderRadius:4, fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:t.textSub }}>
                  {rel} <span style={{ color:t.textMuted }}>({FIDIC_KB.edges.filter(e=>e.rel===rel).length})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Critical path */}
          <div>
            <SLabel t={t}>Critical Reasoning Path</SLabel>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
              {["Delay Event","§8.4 Ground","Obligation","§20.2.1 Notice","Risk Allocation","40 Rules","EOT Decision"].map((s,i,arr)=>(
                <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
                  <span style={{ padding:"5px 10px", background:i===arr.length-1?t.amberDim:t.surface2, border:`1px solid ${i===arr.length-1?t.amber+"44":t.border}`, borderRadius:6, fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:i===arr.length-1?t.amber:i===0?t.textMuted:t.textSub, fontWeight:i===arr.length-1?700:400 }}>{s}</span>
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

/* ═══ PDF REPORT GENERATOR ═════════════════════════════════════════════════ */
function generateAnalysisReport(result) {
  const { extraction, ruleResult, trace, metrics } = result;
  const q = ruleResult.quantum;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day:"2-digit", month:"long", year:"numeric" });
  const timeStr = now.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" });

  const outcomeColors = {
    eligible: { bg:"#d1fae5", text:"#065f46", border:"#6ee7b7" },
    not_eligible: { bg:"#fee2e2", text:"#991b1b", border:"#fca5a5" },
    time_barred: { bg:"#fee2e2", text:"#7f1d1d", border:"#f87171" },
    partial: { bg:"#fef3c7", text:"#78350f", border:"#fcd34d" },
    insufficient_info: { bg:"#f3f4f6", text:"#374151", border:"#d1d5db" },
  };
  const oc = outcomeColors[ruleResult.outcome] || outcomeColors.insufficient_info;
  const outcomeLabel = ruleResult.outcome.replace(/_/g," ").toUpperCase();

  const catBadgeColors = {
    procedural:"#dc2626", entitlement:"#059669", programme:"#d97706",
    quantum:"#ea580c", evidence:"#0284c7", determination:"#7c3aed",
    mitigation:"#4b5563", aggregation:"#6b7280"
  };

  const ruleRows = ruleResult.fired_rules.map(r => `
    <tr>
      <td style="padding:7px 10px; font-family:monospace; font-size:11px; color:#374151; border-bottom:1px solid #e5e7eb; white-space:nowrap;">${r.id}</td>
      <td style="padding:7px 10px; font-size:11px; border-bottom:1px solid #e5e7eb;">
        <span style="display:inline-block; padding:1px 6px; border-radius:3px; font-size:9px; font-weight:700; text-transform:uppercase; background:${catBadgeColors[r.cat]||"#6b7280"}22; color:${catBadgeColors[r.cat]||"#6b7280"}; border:1px solid ${catBadgeColors[r.cat]||"#6b7280"}44; font-family:monospace;">${r.cat}</span>
      </td>
      <td style="padding:7px 10px; font-family:monospace; font-size:10px; color:#4b5563; border-bottom:1px solid #e5e7eb;">§${r.cl}</td>
      <td style="padding:7px 10px; font-size:11px; color:#111827; border-bottom:1px solid #e5e7eb;">${r.name}</td>
      <td style="padding:7px 10px; font-size:10px; border-bottom:1px solid #e5e7eb; max-width:280px;">
        <span style="color:${r.exp?.startsWith("✓")?"#065f46":r.exp?.startsWith("⛔")?"#991b1b":r.exp?.startsWith("⚠")?"#78350f":"#374151"}">${r.exp||""}</span>
      </td>
      <td style="padding:7px 10px; font-family:monospace; font-size:11px; text-align:center; border-bottom:1px solid #e5e7eb; color:${r.csq?.block?"#991b1b":"#374151"}; font-weight:${r.csq?.block?700:400};">${r.csq?.block?"BLOCKING":"—"}</td>
      <td style="padding:7px 10px; font-family:monospace; font-size:11px; text-align:center; border-bottom:1px solid #e5e7eb; color:${(r.csq?.cd||0)>0?"#065f46":"#991b1b"};">${(r.csq?.cd||0)>=0?"+":""}${r.csq?.cd||0}</td>
    </tr>`).join("");

  const traceRows = trace.steps.map((step,i) => `
    <div style="margin-bottom:12px; padding:12px 14px; border-left:3px solid ${step.color}; background:${step.is_final?"#fef9ec":step.type==="neural"?"#f5f3ff":"#f9fafb"}; border-radius:0 6px 6px 0; border:1px solid #e5e7eb; border-left:3px solid ${step.color};">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
        <span style="font-family:monospace; font-size:16px; color:${step.color};">${step.icon}</span>
        <div>
          <strong style="font-size:12px; color:#111827;">${step.label}</strong>
          <span style="display:inline-block; margin-left:8px; padding:1px 6px; background:${step.color}18; border:1px solid ${step.color}44; border-radius:3px; font-size:9px; font-family:monospace; color:${step.color}; font-weight:700; text-transform:uppercase;">${step.type}</span>
          ${step.blocking?`<span style="display:inline-block; margin-left:4px; padding:1px 6px; background:#fee2e2; border:1px solid #fca5a5; border-radius:3px; font-size:9px; font-family:monospace; color:#991b1b; font-weight:700;">BLOCKING</span>`:""}
        </div>
        <span style="margin-left:auto; font-family:monospace; font-size:13px; font-weight:700; color:${step.confidence>=0.7?"#065f46":step.confidence>=0.5?"#78350f":"#991b1b"};">${Math.round(step.confidence*100)}%</span>
      </div>
      <div style="font-size:10px; color:#6b7280; margin-bottom:6px; font-family:monospace;">${step.sub||""}</div>
      ${step.items.map(item=>`<div style="font-size:11px; color:${item.startsWith("✓")?"#065f46":item.startsWith("⛔")?"#991b1b":item.startsWith("⚠")?"#78350f":"#374151"}; padding:2px 0 2px 10px; line-height:1.6;">${item}</div>`).join("")}
    </div>`).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AXIOM EOT Analysis Report — ${dateStr}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Sora',sans-serif; color:#111827; background:#fff; font-size:12px; line-height:1.6; }
  @page { size:A4; margin:15mm 14mm; }
  @media print {
    .no-print { display:none !important; }
    body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .page-break { page-break-before:always; }
    .avoid-break { page-break-inside:avoid; }
  }
  .report-page { max-width:780px; margin:0 auto; padding:10px; }

  /* Header */
  .report-header { display:flex; justify-content:space-between; align-items:flex-start; padding:20px 24px; background:linear-gradient(135deg, #0D1321 0%, #111927 50%, #16202E 100%); border-radius:12px; margin-bottom:24px; color:#fff; }
  .axiom-logo { font-family:'JetBrains Mono',monospace; }
  .axiom-wordmark { font-size:28px; font-weight:800; color:#E8A020; letter-spacing:0.1em; text-shadow:0 0 20px rgba(232,160,32,0.4); }
  .axiom-tagline { font-size:9px; color:#6B82A0; letter-spacing:0.18em; text-transform:uppercase; margin-top:2px; }
  .axiom-version { font-size:9px; color:#6B82A0; font-family:'JetBrains Mono',monospace; margin-top:6px; }
  .report-meta { text-align:right; }
  .report-title-text { font-size:11px; color:#E2EAF4; font-weight:600; letter-spacing:0.04em; }
  .report-date { font-size:10px; color:#6B82A0; font-family:'JetBrains Mono',monospace; margin-top:4px; }
  .report-id { font-size:9px; color:#344C6A; font-family:'JetBrains Mono',monospace; margin-top:2px; }

  /* Pipeline badges */
  .pipeline-bar { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; align-items:center; padding:10px 14px; background:#f9fafb; border-radius:8px; border:1px solid #e5e7eb; }
  .pipe-badge { display:inline-flex; align-items:center; gap:5px; font-size:10px; }
  .badge { display:inline-block; padding:2px 7px; border-radius:4px; font-size:9px; font-family:'JetBrains Mono',monospace; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; }

  /* Sections */
  .section { margin-bottom:20px; }
  .section-title { font-family:'JetBrains Mono',monospace; font-size:10px; font-weight:700; color:#6b7280; letter-spacing:0.14em; text-transform:uppercase; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid #e5e7eb; }

  /* Outcome banner */
  .outcome-banner { padding:16px 20px; background:${oc.bg}; border:2px solid ${oc.border}; border-radius:10px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; }
  .outcome-label { font-family:'JetBrains Mono',monospace; font-size:20px; font-weight:800; color:${oc.text}; letter-spacing:0.06em; }
  .outcome-meta { text-align:right; }
  .outcome-conf { font-family:'JetBrains Mono',monospace; font-size:24px; font-weight:800; color:${oc.text}; }
  .outcome-conf-label { font-size:9px; color:${oc.text}; opacity:0.7; font-family:'JetBrains Mono',monospace; text-transform:uppercase; letter-spacing:0.1em; }

  /* Stats grid */
  .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:16px; }
  .stat-card { padding:12px 14px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; }
  .stat-value { font-family:'JetBrains Mono',monospace; font-size:18px; font-weight:700; color:#111827; }
  .stat-label { font-size:9px; color:#6b7280; font-family:'JetBrains Mono',monospace; text-transform:uppercase; letter-spacing:0.08em; margin-top:3px; }

  /* Info grid */
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .info-card { padding:12px 14px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; }
  .info-row { display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #f3f4f6; font-size:11px; }
  .info-key { color:#6b7280; font-family:'JetBrains Mono',monospace; }
  .info-val { color:#111827; font-weight:500; }

  /* Rules table */
  .rules-table { width:100%; border-collapse:collapse; font-size:11px; }
  .rules-table th { padding:8px 10px; background:#1f2937; color:#e5e7eb; font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; text-align:left; }

  /* Quantum */
  .quantum-bar { display:flex; align-items:center; gap:12px; padding:14px 16px; background:#fffbeb; border:1px solid #fcd34d; border-radius:8px; margin-bottom:10px; flex-wrap:wrap; }
  .q-item { font-size:11px; }
  .q-arrow { color:#9ca3af; font-size:14px; }

  /* Footer */
  .report-footer { margin-top:32px; padding:12px 0; border-top:2px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; font-size:9px; color:#9ca3af; font-family:'JetBrains Mono',monospace; }

  /* Print button */
  .print-btn { position:fixed; top:20px; right:20px; padding:10px 20px; background:#E8A020; color:#0A0800; border:none; border-radius:8px; font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700; cursor:pointer; box-shadow:0 4px 16px rgba(232,160,32,0.4); z-index:100; letter-spacing:0.04em; }
  .print-btn:hover { background:#F5C842; }
</style>
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">⎙ Print / Save PDF</button>

<div class="report-page">

  <!-- HEADER -->
  <div class="report-header avoid-break">
    <div class="axiom-logo">
      <div class="axiom-wordmark">AXIOM</div>
      <div class="axiom-tagline">Neurosymbolic · FIDIC 2017</div>
      <div class="axiom-version">EOT Intelligence Platform · v4.0</div>
      <div style="margin-top:10px; display:flex; gap:6px; flex-wrap:wrap;">
        <span class="badge" style="background:rgba(232,160,32,0.2); color:#E8A020; border:1px solid rgba(232,160,32,0.3);">FIDIC 2017 Red Book</span>
        <span class="badge" style="background:rgba(52,211,153,0.2); color:#34D399; border:1px solid rgba(52,211,153,0.3);">40 Symbolic Rules</span>
        <span class="badge" style="background:rgba(56,189,248,0.2); color:#38BDF8; border:1px solid rgba(56,189,248,0.3);">35N · 41E Graph</span>
      </div>
    </div>
    <div class="report-meta">
      <div class="report-title-text">EOT CLAIM ANALYSIS REPORT</div>
      <div class="report-date">${dateStr} · ${timeStr}</div>
      <div class="report-id">REF: AXM-${Date.now().toString(36).toUpperCase()}</div>
      <div style="margin-top:10px; font-size:9px; color:#E2EAF4; font-family:'JetBrains Mono',monospace; line-height:1.8;">
        <div>Project: <strong style="color:#E8A020;">${extraction.cause_description?.slice(0,50)||"—"}</strong></div>
        <div>Cause: <strong>${(extraction.cause||"—").replace(/_/g," ")}</strong></div>
      </div>
    </div>
  </div>

  <!-- PIPELINE INFO -->
  <div class="pipeline-bar avoid-break">
    <span style="font-size:9px; font-family:'JetBrains Mono',monospace; color:#6b7280; font-weight:700; margin-right:4px;">PIPELINE:</span>
    <span class="pipe-badge"><span class="badge" style="background:#a78bfa22; color:#7c3aed; border:1px solid #a78bfa44;">Neural</span> <span style="font-size:9px; color:#6b7280;">LLM Extraction (${extraction.method==="llm"?"Claude":"Heuristic"})</span></span>
    <span style="color:#d1d5db; font-size:12px;">→</span>
    <span class="pipe-badge"><span class="badge" style="background:#38bdf822; color:#0284c7; border:1px solid #38bdf844;">KG</span> <span style="font-size:9px; color:#6b7280;">35N · 41E Enrichment</span></span>
    <span style="color:#d1d5db; font-size:12px;">→</span>
    <span class="pipe-badge"><span class="badge" style="background:#34d39922; color:#059669; border:1px solid #34d39944;">Symbolic</span> <span style="font-size:9px; color:#6b7280;">40-Rule Engine</span></span>
    <span style="color:#d1d5db; font-size:12px;">→</span>
    <span class="pipe-badge"><span class="badge" style="background:#e8a02022; color:#b45309; border:1px solid #e8a02044;">XAI</span> <span style="font-size:9px; color:#6b7280;">Explainability Trace</span></span>
    <span style="margin-left:auto; font-size:9px; color:#9ca3af; font-family:'JetBrains Mono',monospace;">${metrics.total_ms}ms total · ${Math.round((metrics.symbolic_ratio||0)*100)}% symbolic</span>
  </div>

  <!-- SECTION 1: EXECUTIVE SUMMARY -->
  <div class="section avoid-break">
    <div class="section-title">1. Executive Summary — Determination Outcome</div>
    <div class="outcome-banner">
      <div>
        <div style="font-size:9px; font-family:'JetBrains Mono',monospace; color:${oc.text}; opacity:0.7; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:6px;">FIDIC 2017 · §8.4 EOT Entitlement</div>
        <div class="outcome-label">${outcomeLabel}</div>
        <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
          ${ruleResult.blocked?`<span class="badge" style="background:#fee2e2; color:#991b1b; border:1px solid #fca5a5;">⛔ Time-Barred</span>`:""}
          <span class="badge" style="background:${ruleResult.kg_risk?.id==="RA_EMPL"?"#fee2e2":ruleResult.kg_risk?.id==="RA_SHAR"?"#fef3c7":"#f3f4f6"}; color:${ruleResult.kg_risk?.id==="RA_EMPL"?"#991b1b":ruleResult.kg_risk?.id==="RA_SHAR"?"#78350f":"#374151"}; border:1px solid ${ruleResult.kg_risk?.id==="RA_EMPL"?"#fca5a5":ruleResult.kg_risk?.id==="RA_SHAR"?"#fcd34d":"#d1d5db"};">${ruleResult.kg_risk?.label||"—"}</span>
          <span class="badge" style="background:${ruleResult.kg_risk?.props?.cost?"#d1fae5":"#f3f4f6"}; color:${ruleResult.kg_risk?.props?.cost?"#065f46":"#6b7280"}; border:1px solid ${ruleResult.kg_risk?.props?.cost?"#6ee7b7":"#d1d5db"};">Cost: ${ruleResult.kg_risk?.props?.cost?"✓ Entitled":"✕ Not Entitled"}</span>
        </div>
      </div>
      <div class="outcome-meta">
        <div class="outcome-conf">${ruleResult.confidence}%</div>
        <div class="outcome-conf-label">Confidence</div>
        <div style="margin-top:10px; font-family:'JetBrains Mono',monospace; font-size:22px; font-weight:800; color:${oc.text};">${q.recommended}d</div>
        <div style="font-size:9px; color:${oc.text}; opacity:0.7; font-family:'JetBrains Mono',monospace; text-transform:uppercase; letter-spacing:0.08em;">Recommended EOT</div>
      </div>
    </div>

    <div class="stats-grid">
      ${[
        {l:"Rules Evaluated", v:`${ruleResult.rules_evaluated}`, c:"#1f2937"},
        {l:"Rules Fired", v:`${ruleResult.rules_fired}`, c:"#0284c7"},
        {l:"Blocking Rule", v:ruleResult.blocking_rule||"None", c:ruleResult.blocking_rule?"#991b1b":"#059669"},
        {l:"Processing Time", v:`${metrics.total_ms}ms`, c:"#78350f"},
      ].map(m=>`<div class="stat-card"><div class="stat-value" style="color:${m.c};">${m.v}</div><div class="stat-label">${m.l}</div></div>`).join("")}
    </div>
  </div>

  <!-- SECTION 2: PROJECT & CLAIM DETAILS -->
  <div class="section avoid-break">
    <div class="section-title">2. Claim Details</div>
    <div class="info-grid">
      <div class="info-card">
        <div style="font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px;">Delay Event</div>
        ${[
          ["Cause Category", (extraction.cause||"—").replace(/_/g," ")],
          ["Description", extraction.cause_description?.slice(0,100)||"—"],
          ["Extraction Method", extraction.method==="llm"?"Claude LLM":"Heuristic Fallback"],
          ["Extraction Confidence", `${Math.round((extraction.extraction_confidence||0.65)*100)}%`],
          ["Requested EOT", `${q.requested} calendar days`],
          ["Recommended EOT", `${q.recommended} calendar days`],
        ].map(([k,v])=>`<div class="info-row"><span class="info-key">${k}</span><span class="info-val">${v}</span></div>`).join("")}
      </div>
      <div class="info-card">
        <div style="font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px;">Procedural Compliance</div>
        ${[
          ["Notice Submitted (§20.2.1)", extraction.notice_submitted?"✓ Yes":"✕ No"],
          ["Notice Days", extraction.notice_days!=null?`${extraction.notice_days}d (limit: 28d)`:"Not provided"],
          ["Detailed Claim (§20.2.4)", extraction.detailed_claim_submitted?"✓ Yes":"✕ No"],
          ["Detailed Claim Days", extraction.detailed_days!=null?`${extraction.detailed_days}d (limit: 84d)`:"Not provided"],
          ["Contemporary Records", `${extraction.contemporary_records||0} items`],
          ["Programme Submitted (§8.3)", extraction.programme_submitted?"✓ Yes":"✕ No"],
        ].map(([k,v])=>`<div class="info-row"><span class="info-key">${k}</span><span class="info-val" style="color:${v.startsWith("✓")?"#065f46":v.startsWith("✕")?"#991b1b":"#111827"}">${v}</span></div>`).join("")}
      </div>
    </div>
  </div>

  <!-- SECTION 3: QUANTUM ASSESSMENT -->
  <div class="section avoid-break">
    <div class="section-title">3. EOT Quantum Assessment</div>
    <div class="quantum-bar">
      <div class="q-item"><span style="color:#6b7280;">Requested:</span> <strong style="font-family:'JetBrains Mono',monospace; font-size:14px;">${q.requested}d</strong></div>
      ${q.deductions.map(d=>`<span class="q-arrow">→</span><div class="q-item"><span style="color:#991b1b; font-family:'JetBrains Mono',monospace;">−${d.days}d</span> <span style="color:#6b7280; font-size:10px;">${d.reason.split("—")[0].trim()}</span></div>`).join("")}
      <span class="q-arrow" style="margin-left:auto;">→</span>
      <div class="q-item"><span style="color:#6b7280;">Recommended:</span> <strong style="font-family:'JetBrains Mono',monospace; font-size:18px; color:#b45309;">${q.recommended}d</strong></div>
    </div>
    ${q.deductions.length>0?`
    <div style="padding:10px 14px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px;">
      <div style="font-size:9px; font-family:'JetBrains Mono',monospace; color:#6b7280; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px; font-weight:700;">Deduction Breakdown</div>
      ${q.deductions.map((d,i)=>`<div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #f3f4f6; font-size:11px;"><span style="color:#374151;">${d.reason}</span><span style="font-family:'JetBrains Mono',monospace; color:#991b1b; font-weight:700;">−${d.days}d</span></div>`).join("")}
    </div>`:"<div style='font-size:11px; color:#059669; padding:8px 12px; background:#d1fae5; border-radius:6px; border:1px solid #6ee7b7;'>✓ No deductions applied — quantum is fully supported</div>"}
  </div>

  <!-- SECTION 4: KNOWLEDGE GRAPH & RISK ALLOCATION -->
  <div class="section avoid-break">
    <div class="section-title">4. Knowledge Graph Analysis & Risk Allocation</div>
    <div class="info-grid">
      <div class="info-card">
        <div style="font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px;">Risk Allocation</div>
        ${[
          ["Risk Bearer", ruleResult.kg_risk?.label||"—"],
          ["EOT Entitlement", ruleResult.kg_risk?.props?.eot?"Yes":"No"],
          ["Cost Entitlement", ruleResult.kg_risk?.props?.cost?"Yes":"No"],
          ["Profit Entitlement", ruleResult.kg_risk?.props?.profit?"Yes":"No"],
        ].map(([k,v])=>`<div class="info-row"><span class="info-key">${k}</span><span class="info-val" style="color:${v==="Yes"?"#065f46":v==="No"?"#991b1b":"#111827"}">${v}</span></div>`).join("")}
      </div>
      <div class="info-card">
        <div style="font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px;">KG Statistics</div>
        ${[
          ["Total Nodes", result.kgStats?.total_nodes||35],
          ["Total Edges", result.kgStats?.total_edges||41],
          ["Edge Hits", result.kgStats?.edge_hits||"—"],
          ["Activated Clauses", (ruleResult.kg_clauses||[]).map(c=>c?.label).filter(Boolean).join(", ")||"—"],
        ].map(([k,v])=>`<div class="info-row"><span class="info-key">${k}</span><span class="info-val">${v}</span></div>`).join("")}
      </div>
    </div>
  </div>

  <!-- SECTION 5: FULL REASONING TRACE -->
  <div class="section page-break">
    <div class="section-title">5. Full XAI Reasoning Trace</div>
    ${traceRows}
  </div>

  <!-- SECTION 6: RULES FIRED TABLE -->
  <div class="section page-break">
    <div class="section-title">6. Symbolic Rules Fired (${ruleResult.rules_fired} of ${ruleResult.rules_evaluated})</div>
    <table class="rules-table">
      <thead><tr>
        <th>Rule ID</th><th>Category</th><th>Clause</th><th>Rule Name</th><th>Explanation</th><th>Blocking</th><th>Δ Conf</th>
      </tr></thead>
      <tbody>${ruleRows}</tbody>
    </table>
  </div>

  <!-- SECTION 7: SYSTEM METRICS -->
  <div class="section avoid-break">
    <div class="section-title">7. System & Performance Metrics</div>
    <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px;">
      ${[
        ["Total Time", `${metrics.total_ms}ms`],
        ["Neural Time", `${metrics.neural_ms}ms`],
        ["Rule Time", `${metrics.rule_ms}ms`],
        ["XAI Time", `${metrics.explain_ms}ms`],
        ["Symbolic Ratio", `${Math.round((metrics.symbolic_ratio||0)*100)}%`],
        ["LLM Calls", metrics.llm_calls],
        ["KG Nodes", metrics.kg_nodes],
        ["KG Edges", metrics.kg_edges],
      ].map(([k,v])=>`<div style="padding:8px 10px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px;"><div style="font-family:'JetBrains Mono',monospace; font-size:14px; font-weight:700; color:#111827;">${v}</div><div style="font-size:9px; color:#6b7280; font-family:'JetBrains Mono',monospace; text-transform:uppercase; letter-spacing:0.06em; margin-top:2px;">${k}</div></div>`).join("")}
    </div>
  </div>

  <!-- FOOTER -->
  <div class="report-footer">
    <span>AXIOM v4 · Neurosymbolic EOT Intelligence · FIDIC 2017 Conditions of Contract for Construction (Red Book, 2nd Edition)</span>
    <span>Generated: ${dateStr} ${timeStr} · Not legal advice — indicative recommendations only</span>
  </div>

</div>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

/* ═══ RESULTS VIEW ══════════════════════════════════════════════════════════ */
function ResultsView({ result, onNewAnalysis, t }) {
  const [tab, setTab] = useState("trace");

  if (!result) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400, gap:16 }}>
      <div style={{ width:80, height:80, borderRadius:20, background:t.surface2, border:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, color:t.border }}>◈</div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:16, fontWeight:700, color:t.text, marginBottom:6 }}>No analysis yet</div>
        <div style={{ fontSize:13, color:t.textSub }}>Run an EOT analysis from the Analyse tab to see the full reasoning trace.</div>
      </div>
    </div>
  );

  const { extraction, ruleResult, trace } = result;
  const cats = catColors(t);
  const riskId = ruleResult.kg_risk?.id;

  return (
    <div>
      {/* Hero summary */}
      <div style={{ background:`linear-gradient(135deg, ${t.surface} 0%, ${t.surface2} 100%)`, border:`1px solid ${t.border}`, borderRadius:16, padding:24, marginBottom:20, boxShadow:t.shadow, animation:"scaleIn 0.3s ease" }}>
        <div style={{ display:"grid", gridTemplateColumns:"auto 1fr auto", gap:24, alignItems:"center" }}>
          {/* Outcome + confidence arc */}
          <div style={{ display:"flex", gap:20, alignItems:"center" }}>
            <ConfidenceArc pct={ruleResult.confidence} t={t} size={90} />
            <div>
              <div style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:t.textMuted, letterSpacing:"0.12em", marginBottom:6 }}>DETERMINATION OUTCOME</div>
              <OutcomeChip outcome={ruleResult.outcome} t={t} lg />
              <div style={{ marginTop:8, display:"flex", gap:6 }}>
                {ruleResult.blocked && <Badge t={t} color={t.rose} sm>Time-Barred</Badge>}
                <Badge t={t} color={ruleResult.kg_risk?.id==="RA_EMPL"?t.rose:ruleResult.kg_risk?.id==="RA_SHAR"?t.amber:t.textSub} sm>
                  {ruleResult.kg_risk?.label||"—"}
                </Badge>
                <Badge t={t} color={ruleResult.kg_risk?.props?.cost?t.emerald:t.textMuted} sm>
                  Cost: {ruleResult.kg_risk?.props?.cost?"✓ Yes":"✕ No"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {[
              { l:"Recommended EOT", v:`${ruleResult.quantum.recommended}d`, c:t.amber },
              { l:"Rules Fired", v:`${ruleResult.rules_fired}/${ruleResult.rules_evaluated}`, c:t.cyan },
              { l:"Blocking Rule", v:ruleResult.blocking_rule||"None", c:ruleResult.blocking_rule?t.rose:t.emerald },
            ].map(m=>(
              <div key={m.l} style={{ padding:"12px 14px", background:t.surface3, borderRadius:8, border:`1px solid ${t.border}` }}>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:20, fontWeight:700, color:m.c }}>{m.v}</div>
                <div style={{ fontSize:9, color:t.textMuted, marginTop:4, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.1em", textTransform:"uppercase" }}>{m.l}</div>
              </div>
            ))}
          </div>

          {/* Action */}
          <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end" }}>
            <Btn variant="ghost" onClick={onNewAnalysis} t={t} sm icon="↺">New Analysis</Btn>
            <Btn variant="primary" onClick={()=>generateAnalysisReport(result)} t={t} sm icon="⎙">Export PDF Report</Btn>
          </div>
        </div>

        {/* Quantum deductions mini-view */}
        {ruleResult.quantum.deductions.length > 0 && (
          <div style={{ marginTop:16, padding:"10px 14px", background:t.surface3, borderRadius:8, border:`1px solid ${t.border}` }}>
            <div style={{ display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
              <span style={{ fontSize:11, color:t.textSub }}>Requested: <strong style={{ color:t.text }}>{ruleResult.quantum.requested}d</strong></span>
              {ruleResult.quantum.deductions.map((d,i)=>(
                <span key={i} style={{ fontSize:10, color:t.rose }}>— {d.days}d ({d.reason.split("—")[0].trim()})</span>
              ))}
              <span style={{ fontSize:11, color:t.amber, fontWeight:700, marginLeft:"auto" }}>= {ruleResult.quantum.recommended}d recommended</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", background:t.surface, border:`1px solid ${t.border}`, borderRadius:10, overflow:"hidden", marginBottom:16, boxShadow:t.shadowSm }}>
        {[["trace","§ Reasoning Trace"],["rules","◈ Rules Fired"],["quantum","⊙ Quantum"],["risk","⊛ Risk Map"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} className="tab-btn"
            style={{ flex:1, padding:"10px 12px", background:tab===id?t.amberDim:"transparent", border:"none", borderRight:`1px solid ${t.border}`, color:tab===id?t.amber:t.textMuted, fontFamily:"'JetBrains Mono',monospace", fontSize:10, cursor:"pointer", letterSpacing:"0.08em", fontWeight:tab===id?700:400 }}>
            {lbl}
          </button>
        ))}
      </div>

      {tab==="trace" && (
        <div>
          {trace.steps.map((step,i)=>(
            <div key={i} style={{ marginBottom:10, padding:14, background:step.is_final?t.amberDim:step.type==="neural"?t.violetGlow:t.surface, border:`1px solid ${step.is_final?t.amber+"44":step.blocking?t.rose+"44":t.border}`, borderRadius:10, borderLeft:`3px solid ${step.color}`, animation:`fadeUp 0.2s ease ${i*0.04}s both` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <div style={{ width:34, height:34, borderRadius:8, background:step.color+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:step.color, flexShrink:0, border:`1px solid ${step.color}33` }}>{step.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                    <span style={{ fontSize:12, fontWeight:700, color:t.text }}>{step.label}</span>
                    <Badge t={t} color={step.type==="neural"?t.violet:step.type==="decision"?t.amber:t.cyan} sm>{step.type}</Badge>
                    {step.blocking && <Badge t={t} color={t.rose} sm glow>BLOCKING</Badge>}
                  </div>
                  <div style={{ fontSize:10, color:t.textMuted, marginTop:2 }}>{step.sub}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700, color:step.confidence>=0.7?t.emerald:step.confidence>=0.5?t.amber:t.rose }}>{Math.round(step.confidence*100)}%</div>
                  <div style={{ fontSize:8, color:t.textMuted, fontFamily:"'JetBrains Mono',monospace" }}>CONF</div>
                </div>
              </div>
              {step.items.map((item,j)=>(
                <div key={j} style={{ fontSize:11, color:item.startsWith("✓")?t.emerald:item.startsWith("⛔")?t.rose:item.startsWith("⚠")?t.amber:t.textSub, marginBottom:3, paddingLeft:10, lineHeight:1.65, fontFamily:item.startsWith("§")?("'JetBrains Mono',monospace"):"'Sora',sans-serif" }}>{item}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab==="rules" && (
        <div>
          <div style={{ marginBottom:12, display:"flex", gap:8, flexWrap:"wrap" }}>
            {Object.entries(catColors(t)).map(([cat,c])=>(
              <span key={cat} style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px", background:c+"15", border:`1px solid ${c}33`, borderRadius:4, fontSize:9, color:c, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:c, display:"inline-block" }}/> {cat} ({ruleResult.fired_rules.filter(r=>r.cat===cat).length})
              </span>
            ))}
          </div>
          {ruleResult.fired_rules.map((r,i)=>(
            <div key={i} style={{ marginBottom:8, padding:12, background:t.surface, border:`1px solid ${r.csq?.block?t.rose+"44":t.border}`, borderRadius:8, borderLeft:`3px solid ${cats[r.cat]||t.border}`, animation:`fadeUp 0.15s ease ${i*0.03}s both`, transition:"box-shadow 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow=t.shadowSm;}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:t.amber, fontWeight:700 }}>{r.id}</span>
                  <Badge t={t} color={cats[r.cat]||t.textMuted} sm>{r.cat}</Badge>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:t.textMuted }}>§{r.cl}</span>
                  {r.csq?.block && <Badge t={t} color={t.rose} sm glow>BLOCKING</Badge>}
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:(r.csq?.cd??0)>=0?t.emerald:t.rose, fontWeight:700 }}>{(r.csq?.cd??0)>=0?"+":""}{r.csq?.cd}</span>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:r.conf_after>=0.7?t.emerald:r.conf_after>=0.5?t.amber:t.rose, fontWeight:700 }}>{Math.round(r.conf_after*100)}%</div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize:12, color:t.text, fontWeight:600, marginBottom:4 }}>{r.name}</div>
              <div style={{ fontSize:11, color:r.exp?.startsWith("✓")?t.emerald:r.exp?.startsWith("⛔")?t.rose:r.exp?.startsWith("⚠")?t.amber:t.textSub, lineHeight:1.6 }}>{r.exp}</div>
            </div>
          ))}
          {ruleResult.rules_fired===0&&<div style={{ textAlign:"center", padding:40, color:t.textMuted }}>No rules fired for this input.</div>}
        </div>
      )}

      {tab==="quantum" && (
        <Card t={t}>
          <SLabel t={t}>EOT Quantum — Symbolic Deduction Ledger</SLabel>
          <div style={{ padding:16, background:t.surface2, borderRadius:10, marginBottom:14, border:`1px solid ${t.border}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${t.border}` }}>
              <span style={{ fontSize:13, color:t.textSub }}>Requested EOT</span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, color:t.text, fontWeight:600 }}>{ruleResult.quantum.requested} days</span>
            </div>
            {ruleResult.quantum.deductions.map((d,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${t.border}` }}>
                <span style={{ fontSize:11, color:t.textSub }}>− {d.reason}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:t.rose, fontWeight:600 }}>−{d.days} days</span>
              </div>
            ))}
            {ruleResult.quantum.deductions.length===0&&<div style={{ padding:"8px 0", fontSize:11, color:t.textMuted }}>No deductions applied</div>}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0 2px", marginTop:4 }}>
              <span style={{ fontSize:14, fontWeight:700, color:t.text }}>Recommended EOT Grant</span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:26, fontWeight:800, color:t.amber, textShadow:`0 0 20px ${t.amberGlow}` }}>{ruleResult.quantum.recommended} days</span>
            </div>
          </div>
          <div style={{ padding:"10px 12px", background:t.surface2, borderRadius:8, fontSize:10, color:t.textMuted, fontFamily:"'JetBrains Mono',monospace", lineHeight:1.9 }}>
            Deduction methodology (FIDIC 2017 principles):<br/>
            · Concurrent contractor delay → indicative apportionment (actual requires TIA)<br/>
            · Programme not updated → 10% uncertainty reduction (§8.3)<br/>
            · Critical path undemonstrated → 15% conservative reduction (§8.4)<br/>
            <span style={{ color:t.orange }}>⚠ Indicative only. A formal Time Impact Analysis (TIA) is required for binding determination.</span>
          </div>
        </Card>
      )}

      {tab==="risk" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Card t={t}>
            <SLabel t={t}>Risk Allocation — FIDIC 2017</SLabel>
            {[
              { label:"Employer Risk", sub:"§8.4(a), §8.4(e)", desc:"EOT + Cost + Profit. Employer bears all consequences.", id:"RA_EMPL", c:t.rose },
              { label:"Shared Risk",   sub:"§8.4(c), §8.4(d), §18.4", desc:"EOT only — no additional Cost.", id:"RA_SHAR", c:t.amber },
              { label:"Contractor Risk",sub:"Default", desc:"No EOT. Contractor bears all consequences.", id:"RA_CONT", c:t.textMuted },
            ].map(r=>(
              <div key={r.id} style={{ display:"flex", gap:12, padding:12, marginBottom:8, background:riskId===r.id?r.c+"10":t.surface2, border:`1px solid ${riskId===r.id?r.c+"44":t.border}`, borderRadius:8, alignItems:"flex-start", transition:"all 0.2s" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:riskId===r.id?r.c:t.border, marginTop:4, flexShrink:0, boxShadow:riskId===r.id?`0 0 8px ${r.c}88`:"none" }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:riskId===r.id?r.c:t.textSub }}>{r.label} <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", fontWeight:400, color:t.textMuted }}>{r.sub}</span></div>
                  <div style={{ fontSize:11, color:t.textMuted, marginTop:2 }}>{r.desc}</div>
                </div>
                {riskId===r.id && <Badge t={t} color={r.c} sm>Active</Badge>}
              </div>
            ))}
          </Card>
          <Card t={t}>
            <SLabel t={t}>KG-Activated Clauses for "{extraction.cause}"</SLabel>
            {(ruleResult.kg_clauses||[]).map((c,i)=>c&&(
              <div key={i} style={{ display:"flex", gap:10, padding:"7px 0", borderBottom:`1px solid ${t.border}`, alignItems:"center" }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:t.amber, width:64, flexShrink:0, fontWeight:700 }}>{c.label}</span>
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

/* ═══ METRICS VIEW ══════════════════════════════════════════════════════════ */
function MetricsView({ result, t }) {
  if (!result) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400, gap:12 }}>
      <div style={{ fontSize:13, color:t.textSub }}>Run an analysis to see research-grade pipeline metrics.</div>
    </div>
  );
  const { metrics, ruleResult } = result;
  const symPct = Math.round((metrics.symbolic_ratio||0)*100);
  const catCounts = {};
  ruleResult.fired_rules.forEach(r=>{ catCounts[r.cat]=(catCounts[r.cat]||0)+1; });

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:t.text, letterSpacing:"-0.02em", marginBottom:4 }}>Pipeline Metrics</h1>
        <p style={{ fontSize:13, color:t.textSub }}>Research-grade performance benchmarks for the neurosymbolic analysis pipeline.</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[
          { l:"Total Latency",  v:`${metrics.total_ms}ms`,  c:t.cyan,  sub:"End-to-end pipeline",   icon:"⏱" },
          { l:"Symbolic Ratio", v:`${symPct}%`,             c:t.emerald,sub:"Rules vs LLM decisions",icon:"◈" },
          { l:"Rules Fired",    v:`${metrics.rules_fired}/${metrics.rules_evaluated}`, c:t.amber, sub:"Activation rate", icon:"§" },
          { l:"KG Coverage",    v:`${metrics.kg_nodes}N·${metrics.kg_edges}E`, c:t.violet, sub:"Graph nodes & edges", icon:"◉" },
        ].map(m=>(
          <Card key={m.l} t={t} style={{ padding:18, textAlign:"center" }}>
            <div style={{ fontSize:20, marginBottom:6 }}>{m.icon}</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:22, fontWeight:800, color:m.c, lineHeight:1, marginBottom:6 }}>{m.v}</div>
            <div style={{ fontSize:9, color:t.textMuted, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>{m.l}</div>
            <div style={{ fontSize:10, color:t.textMuted, marginTop:2 }}>{m.sub}</div>
          </Card>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card t={t}>
          <SLabel t={t}>Pipeline Stage Timing</SLabel>
          {[
            { l:"Neural Extraction (LLM)",   v:metrics.neural_ms, c:t.violet },
            { l:"KG Enrichment (Symbolic)",   v:metrics.kg_ms, c:t.cyan },
            { l:"Rule Evaluation (Symbolic)", v:metrics.rule_ms, c:t.emerald },
            { l:"XAI Trace Generation",       v:metrics.explain_ms, c:t.amber },
          ].map(s=>(
            <div key={s.l} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:11, color:t.textSub }}>{s.l}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:s.c, fontWeight:600 }}>{s.v}ms</span>
              </div>
              <ProgressBar value={s.v} max={Math.max(metrics.total_ms,1)} color={s.c} t={t} height={5} />
            </div>
          ))}
          <div style={{ marginTop:16, padding:"10px 12px", background:t.surface2, borderRadius:8 }}>
            <SLabel t={t}>Symbolic/Neural Composition</SLabel>
            <div style={{ display:"flex", height:20, borderRadius:6, overflow:"hidden", gap:2 }}>
              <div style={{ flex:symPct, background:`linear-gradient(90deg, ${t.emerald}, ${t.emerald}CC)`, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:symPct>10?"6px 0 0 6px":0 }}>
                <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:"#0A1A0E", fontWeight:800 }}>{symPct>15?`${symPct}% Symbolic`:""}</span>
              </div>
              <div style={{ flex:100-symPct, background:`linear-gradient(90deg, ${t.violet}CC, ${t.violet})`, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:100-symPct>10?"0 6px 6px 0":0 }}>
                <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:"#0A081A", fontWeight:800 }}>{100-symPct>5?`${100-symPct}%`:""}</span>
              </div>
            </div>
            <div style={{ fontSize:9, color:t.textMuted, marginTop:6, fontFamily:"'JetBrains Mono',monospace" }}>Target: ≥97% symbolic for legal decisions; LLM for parsing only</div>
          </div>
        </Card>
        <div>
          <Card t={t} style={{ marginBottom:12 }}>
            <SLabel t={t}>Rule Category Distribution</SLabel>
            {Object.entries(catCounts).sort((a,b)=>b[1]-a[1]).map(([cat,count])=>(
              <div key={cat} style={{ marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:catColors(t)[cat]||t.textMuted, textTransform:"uppercase", letterSpacing:"0.06em" }}>{cat}</span>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:t.textMuted }}>{count}</span>
                </div>
                <ProgressBar value={count} max={Math.max(ruleResult.rules_fired,1)} color={catColors(t)[cat]} t={t} height={4} />
              </div>
            ))}
          </Card>
          <Card t={t}>
            <SLabel t={t}>System Parameters</SLabel>
            {[
              ["Architecture","Neurosymbolic AI (Neural + Symbolic)"],
              ["Standard","FIDIC 2017 Construction Contract"],
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

/* ═══ DETERMINATION VIEW ════════════════════════════════════════════════════ */
function DetermineView({ result, t }) {
  const [det, setDet] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!result) return;
    setLoading(true);
    const { ruleResult, extraction } = result;
    const q = ruleResult.quantum;
    const sys = `You are The Engineer issuing a formal EOT Determination under Sub-Clause 3.7.3 of the FIDIC 2017 Conditions of Contract for Construction (Red Book, 2nd Edition). Write a complete, professional, clause-anchored determination letter. Include all of these sections:\n1. PROJECT DETAILS (project, contractor, engineer, contract reference)\n2. BACKGROUND & CLAIM SUMMARY\n3. NOTICE COMPLIANCE ANALYSIS (§20.2.1: 28-day notice; §20.2.4: 84-day detailed claim; §20.2.8 consequences if applicable)\n4. ENTITLEMENT ANALYSIS (§8.4 applicable grounds; risk allocation)\n5. PROGRAMME & DELAY ANALYSIS (§8.3 compliance; critical path; §20.2.2 records)\n6. CONCURRENT DELAY ANALYSIS (if applicable)\n7. QUANTUM ASSESSMENT\n8. DETERMINATION (precise EOT days granted; new Completion Date)\n9. COST & ADDITIONAL PAYMENT (if applicable)\n10. CONDITIONS & RIGHTS OF REVIEW (§3.7.4; DAAB §21.4; 28-day NOD)\nBe formal, precise, and reference specific FIDIC 2017 sub-clauses throughout. Use placeholders like [Project Name], [Contractor] etc.`;
    const prompt = `Generate the §3.7.3 Determination:\nCause: ${extraction.cause_description||extraction.cause}\nOutcome (symbolic): ${ruleResult.outcome}\nConfidence: ${ruleResult.confidence}%\nEOT requested: ${q.requested}d | Symbolic recommendation: ${q.recommended}d\nNotice days (§20.2.1): ${extraction.notice_days??'not provided'}\nDetailed claim days (§20.2.4): ${extraction.detailed_days??'not provided'}\nBlocking rule: ${ruleResult.blocking_rule??'none'}\nRisk bearer: ${ruleResult.kg_risk?.label??'unknown'}\nCost entitlement: ${ruleResult.kg_risk?.props?.cost?'Yes':'No'}\nDeductions: ${q.deductions.map(d=>`${d.days}d — ${d.reason}`).join('; ')||'none'}\n\nKey rule findings:\n${ruleResult.reasoning_chain.slice(0,8).map(r=>`[${r.rule_id}] §${r.cl}: ${r.exp.slice(0,150)}`).join('\n')}`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2500,system:sys,messages:[{role:"user",content:prompt}]})});
      const data = await res.json();
      setDet(data.content?.map(b=>b.text||"").join("")||"Generation failed — check API connectivity.");
    } catch(_) {
      setDet(`[LLM unavailable — Symbolic Summary]\n\nENGINEER'S DETERMINATION\nSub-Clause 3.7.3 — FIDIC 2017\n${"─".repeat(50)}\n\nOUTCOME: ${ruleResult.outcome.toUpperCase()}\nCONFIDENCE: ${ruleResult.confidence}%\nRECOMMENDED EOT GRANT: ${q.recommended} days\nRISK BEARER: ${ruleResult.kg_risk?.label||"—"}\nCOST ENTITLEMENT: ${ruleResult.kg_risk?.props?.cost?"Yes":"No"}\n\nKEY FINDINGS:\n${ruleResult.reasoning_chain.slice(0,6).map(r=>r.exp).join("\n\n")}`);
    }
    setLoading(false);
  }

  async function copy() { try { await navigator.clipboard.writeText(det); setCopied(true); setTimeout(()=>setCopied(false),2000); } catch(_) {} }

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:t.text, letterSpacing:"-0.02em", marginBottom:4 }}>§3.7.3 Determination Letter</h1>
        <p style={{ fontSize:13, color:t.textSub }}>Generate a formal Engineer's Determination. All legal decisions come from the symbolic engine — the LLM only drafts the formal narrative.</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"360px 1fr", gap:20 }}>
        <div>
          <Card t={t} style={{ marginBottom:14 }}>
            <SLabel t={t}>Determination Generator</SLabel>
            <div style={{ fontSize:12, color:t.textSub, lineHeight:1.7, marginBottom:14 }}>
              The <strong style={{ color:t.emerald }}>outcome, quantum, and clause findings</strong> come entirely from the 40-rule symbolic engine. The LLM only formats the formal letter narrative.
            </div>
            {result ? (
              <div style={{ padding:"10px 12px", background:t.surface2, borderRadius:8, border:`1px solid ${t.border}`, marginBottom:14 }}>
                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6 }}>
                  <OutcomeChip outcome={result.ruleResult.outcome} t={t} />
                  <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:t.textMuted }}>{result.ruleResult.confidence}% · {result.ruleResult.quantum.recommended}d</span>
                </div>
                <div style={{ fontSize:10, color:t.textMuted }}>Symbolic decision locked — LLM will narrate only</div>
              </div>
            ) : (
              <div style={{ padding:"10px 12px", background:t.orange+"12", border:`1px solid ${t.orange}33`, borderRadius:8, marginBottom:14, fontSize:11, color:t.orange }}>⚠ Run an analysis first from the Analyse tab.</div>
            )}
            <Btn full onClick={generate} loading={loading} disabled={!result} t={t}>Generate §3.7.3 Letter</Btn>
          </Card>
          <Card t={t}>
            <SLabel t={t}>Hybrid Architecture</SLabel>
            {[
              { icon:"§",  c:t.emerald, label:"Symbolic Decision", desc:"40 rules decide outcome, quantum, risk. Fully deterministic." },
              { icon:"◈",  c:t.cyan,    label:"KG Clause Activation", desc:"Clauses activated by graph traversal — not LLM memory." },
              { icon:"⬡",  c:t.violet,  label:"LLM Narration Only", desc:"LLM formats formal text. Makes zero entitlement decisions." },
            ].map((a,i)=>(
              <div key={i} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:`1px solid ${t.border}` }}>
                <div style={{ width:32, height:32, borderRadius:8, background:a.c+"15", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:a.c, flexShrink:0 }}>{a.icon}</div>
                <div><div style={{ fontSize:12, fontWeight:700, color:t.text }}>{a.label}</div><div style={{ fontSize:10, color:t.textMuted, marginTop:2 }}>{a.desc}</div></div>
              </div>
            ))}
          </Card>
        </div>
        <div>
          {loading && (
            <Card t={t} style={{ textAlign:"center", padding:50 }}>
              <div style={{ fontSize:22, color:t.amber, animation:"pulse 1.5s ease-in-out infinite", marginBottom:10 }}>◌</div>
              <div style={{ fontSize:14, fontWeight:600, color:t.text }}>Drafting formal determination…</div>
              <div style={{ fontSize:11, color:t.textMuted, marginTop:6 }}>LLM narrating symbolic decision · max 2500 tokens</div>
            </Card>
          )}
          {det && !loading && (
            <Card t={t} style={{ padding:0, overflow:"hidden" }}>
              <div style={{ padding:"12px 16px", borderBottom:`1px solid ${t.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:t.surface2 }}>
                <div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:t.amber, fontWeight:700 }}>§3.7.3 ENGINEER'S DETERMINATION</div>
                  <div style={{ fontSize:9, color:t.textMuted, marginTop:1 }}>Symbolic decision · LLM-narrated letter</div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <Badge t={t} color={t.emerald} sm>Symbolic Decision</Badge>
                  <Btn variant="ghost" sm onClick={copy} t={t}>{copied?"✓ Copied":"⎘ Copy"}</Btn>
                </div>
              </div>
              <div style={{ padding:20, maxHeight:600, overflowY:"auto" }}>
                <pre style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:t.textSub, lineHeight:1.85, whiteSpace:"pre-wrap", margin:0 }}>{det}</pre>
              </div>
            </Card>
          )}
          {!det && !loading && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:300, gap:10, background:t.surface, border:`1px solid ${t.border}`, borderRadius:12 }}>
              <div style={{ fontSize:32, color:t.border }}>⊛</div>
              <div style={{ fontSize:13, color:t.textMuted }}>Click Generate to produce the formal §3.7.3 determination letter</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══ ABOUT VIEW ════════════════════════════════════════════════════════════ */
function AboutView({ t }) {
  return (
    <div>
      <div style={{ marginBottom:28, padding:28, background:`linear-gradient(135deg, ${t.surface} 0%, ${t.surface2} 100%)`, borderRadius:16, border:`1px solid ${t.border}`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:t.amberDim, filter:"blur(60px)", pointerEvents:"none" }} />
        <div style={{ position:"relative" }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:t.amber, letterSpacing:"0.2em", marginBottom:8, fontWeight:700 }}>AXIOM · VERSION 4.0</div>
          <h1 style={{ fontSize:30, fontWeight:800, color:t.text, letterSpacing:"-0.03em", marginBottom:6, lineHeight:1.1 }}>Neurosymbolic EOT<br/>Intelligence Platform</h1>
          <p style={{ fontSize:14, color:t.textSub, fontStyle:"italic", marginBottom:14 }}>"Every decision. Every reason. Every clause."</p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <Badge t={t} color={t.amber}>FIDIC 2017 Red Book</Badge>
            <Badge t={t} color={t.emerald}>40 Symbolic Rules</Badge>
            <Badge t={t} color={t.cyan}>35 KG Nodes · 41 Edges</Badge>
            <Badge t={t} color={t.violet}>Neurosymbolic AI</Badge>
          </div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div>
          <Card t={t} style={{ marginBottom:14 }}>
            <SLabel t={t}>Novel Contributions (v3)</SLabel>
            {["40 deterministic FIDIC 2017 rules across 8 priority tiers — every EOT decision fully traceable to a specific clause","Knowledge graph: 35 nodes, 41 typed edges — clauses, grounds, obligations, risk allocations, parties, outcomes","New rules: §18.2 Force Majeure notice, §1.9 prior drawing notice, §8.3 recovery plan, undervalued claim detection","Full XAI trace: step-by-step reasoning chain auditable by arbitrators and courts","Hybrid determination: symbolic engine decides; LLM narrates formal letter only","Research metrics: symbolic ratio ≥97%, KG coverage, rule activation, pipeline latency"].map((c,i)=>(
              <div key={i} style={{ display:"flex", gap:10, padding:"7px 0", borderBottom:`1px solid ${t.border}` }}>
                <span style={{ color:t.amber, flexShrink:0, marginTop:1, fontSize:12 }}>◈</span>
                <span style={{ fontSize:11, color:t.textSub, lineHeight:1.6 }}>{c}</span>
              </div>
            ))}
          </Card>
          <Card t={t}>
            <SLabel t={t}>Architecture</SLabel>
            {[
              { title:"Symbolic Rule Engine", c:t.emerald, desc:"40 FIDIC 2017 rules, 8 priority tiers: procedural → entitlement → programme → quantum → evidence → determination → mitigation → aggregation. Blocking rules enforce time-bars. Confidence accumulation." },
              { title:"Knowledge Graph (35N/41E)", c:t.cyan, desc:"RDF-style typed property graph. CLAUSE, GROUND, OBLIGATION, RISK, PARTY, OUTCOME nodes. 10 edge relation types including REQUIRES, SUPPORTS, FALLS_UNDER, TRIGGERS_IF_LATE." },
              { title:"Neurosymbolic Pipeline", c:t.violet, desc:"LLM extraction → KG enrichment → 40-rule evaluation → XAI trace. LLM called once for parsing. All legal reasoning is symbolic, deterministic, auditable." },
            ].map(p=>(
              <div key={p.title} style={{ padding:"10px 0", borderBottom:`1px solid ${t.border}` }}>
                <div style={{ fontSize:12, fontWeight:700, color:p.c, marginBottom:4 }}>{p.title}</div>
                <div style={{ fontSize:11, color:t.textSub, lineHeight:1.6 }}>{p.desc}</div>
              </div>
            ))}
          </Card>
        </div>
        <div>
          <Card t={t} style={{ marginBottom:14 }}>
            <SLabel t={t}>FIDIC 2017 Coverage</SLabel>
            {[
              {cl:"§20.2.1",title:"Notice of Claim",rule:"R001–R004",critical:true},
              {cl:"§20.2.4",title:"Fully Detailed Claim",rule:"R005–R007",critical:true},
              {cl:"§20.2.8",title:"Time-Bar Consequences",rule:"R001–R002",critical:true},
              {cl:"§18.2",title:"Exceptional Event Notice",rule:"R008",critical:false,new:true},
              {cl:"§8.4(a)",title:"Variation",rule:"R011",critical:false},
              {cl:"§8.4(b)",title:"Other Entitlement Grounds",rule:"R014–R016",critical:false},
              {cl:"§8.4(c)",title:"Adverse Climate",rule:"R012",critical:false},
              {cl:"§8.4(d)",title:"Epidemic Shortage",rule:"R013",critical:false},
              {cl:"§8.4(e)",title:"Employer Impediment",rule:"R010",critical:false},
              {cl:"§1.9",title:"Late Drawings Prior Notice",rule:"R018",critical:false,new:true},
              {cl:"§8.3",title:"Programme Compliance",rule:"R020–R024",critical:false},
              {cl:"§3.7",title:"Agreement or Determination",rule:"R050–R051",critical:false},
              {cl:"§20.2.2",title:"Contemporary Records",rule:"R040–R046",critical:false},
            ].map(r=>(
              <div key={r.cl} style={{ display:"flex", gap:10, padding:"5px 0", borderBottom:`1px solid ${t.border}`, alignItems:"center" }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:r.critical?t.rose:t.amber, width:60, flexShrink:0, fontWeight:700 }}>{r.cl}</span>
                <span style={{ fontSize:11, color:t.text, flex:1 }}>{r.title} {r.new&&<Badge t={t} color={t.emerald} sm>NEW</Badge>}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:t.textMuted }}>{r.rule}</span>
              </div>
            ))}
          </Card>
          <Card t={t}>
            <SLabel t={t}>Deployment</SLabel>
            {[
              {k:"Frontend",   v:"React + Vite → GitHub Pages / Cloudflare Pages", c:t.cyan},
              {k:"API Proxy",  v:"Cloudflare Workers (100k req/day free tier)",     c:t.orange},
              {k:"Database",   v:"Supabase — Postgres + Auth (free tier)",           c:t.emerald},
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
      </div>
    </div>
  );
}

/* ═══ ROOT APP ══════════════════════════════════════════════════════════════ */
export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [view, setView]     = useState("analyse");
  const [result, setResult] = useState(null);
  const [toast, setToast]   = useState(null);
  const t = isDark ? THEMES.dark : THEMES.light;

  const showToast = useCallback((msg, type="success") => {
    setToast({ msg, type });
    setTimeout(()=>setToast(null), 3500);
  }, []);

  const handleResult = useCallback((r) => {
    setResult(r);
    setView("results");
    showToast(`${r.ruleResult.outcome.replace(/_/g," ").toUpperCase()} · ${r.ruleResult.quantum.recommended}d recommended · ${r.ruleResult.confidence}% confidence`);
  }, [showToast]);

  const navItems = [
    { id:"analyse",     label:"Analyse",    icon:"◈" },
    { id:"kg",          label:"KG Explorer",icon:"◉" },
    { id:"results",     label:"Results",    icon:"§"  },
    { id:"metrics",     label:"Metrics",    icon:"⊙"  },
    { id:"determinate", label:"Determine",  icon:"⊛"  },
    { id:"about",       label:"About",      icon:"◎"  },
  ];

  return (
    <div style={{ minHeight:"100vh", background:t.bg, color:t.text, fontFamily:"'Sora',sans-serif" }}>
      <GlobalStyles t={t} isDark={isDark} />

      {/* Header */}
      <header style={{ borderBottom:`1px solid ${t.border}`, background:t.glass, backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", position:"sticky", top:0, zIndex:100, padding:"0 28px" }}>
        <div style={{ maxWidth:1440, margin:"0 auto", display:"flex", alignItems:"center", height:56, gap:24 }}>
          {/* Wordmark */}
          <div style={{ flexShrink:0 }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:20, fontWeight:800, color:t.amber, letterSpacing:"0.1em", lineHeight:1, textShadow:`0 0 20px ${t.amberGlow}` }}>AXIOM</div>
            <div style={{ fontSize:8, color:t.textMuted, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.18em", textTransform:"uppercase", marginTop:1 }}>v4 · Neurosymbolic · FIDIC 2017</div>
          </div>

          <div style={{ width:1, height:32, background:t.border, flexShrink:0 }} />

          {/* Nav */}
          <nav style={{ display:"flex", gap:2, flex:1, overflowX:"auto" }}>
            {navItems.map(n=>(
              <button key={n.id} onClick={()=>setView(n.id)} className="nav-btn"
                style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 13px", background:view===n.id?t.amberDim:"transparent", border:`1px solid ${view===n.id?t.amber+"44":"transparent"}`, borderRadius:6, color:view===n.id?t.amber:t.textMuted, fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:view===n.id?600:400, cursor:"pointer", letterSpacing:"0.02em", whiteSpace:"nowrap" }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10 }}>{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>

          {/* Status pill */}
          {result && (
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 14px", background:t.surface2, borderRadius:20, border:`1px solid ${t.border}`, flexShrink:0 }}>
              <OutcomeChip outcome={result.ruleResult.outcome} t={t} />
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:t.textMuted }}>{result.ruleResult.quantum.recommended}d · {result.ruleResult.confidence}%</span>
            </div>
          )}

          {/* Theme toggle */}
          <button onClick={()=>setIsDark(d=>!d)}
            style={{ width:36, height:36, borderRadius:8, background:t.surface2, border:`1px solid ${t.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:t.textSub, flexShrink:0, transition:"all 0.15s" }}
            title={isDark?"Switch to light mode":"Switch to dark mode"}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=t.amber;e.currentTarget.style.color=t.amber;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.color=t.textSub;}}>
            {isDark ? "☀" : "◑"}
          </button>
        </div>
      </header>

      {/* Pipeline sub-bar */}
      <div style={{ borderBottom:`1px solid ${t.border}`, background:t.surface, padding:"0 28px" }}>
        <div style={{ maxWidth:1440, margin:"0 auto", display:"flex", alignItems:"center", height:34, gap:14, overflowX:"auto" }}>
          {[
            { badge:"Neural",   c:t.violet,  label:"LLM Extraction" },
            { badge:"KG",       c:t.cyan,    label:"35N · 41E Enrichment" },
            { badge:"Symbolic", c:t.emerald, label:"40-Rule Engine" },
            { badge:"XAI",      c:t.amber,   label:"Explainability Trace" },
          ].map(({badge,c,label},i,arr)=>(
            <span key={badge} style={{ display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
              <Badge t={t} color={c} sm>{badge}</Badge>
              <span style={{ fontSize:9, color:t.textMuted, fontFamily:"'JetBrains Mono',monospace" }}>{label}</span>
              {i<arr.length-1 && <span style={{ color:t.textGhost, fontSize:11 }}>→</span>}
            </span>
          ))}
          {result && (
            <span style={{ marginLeft:"auto", fontSize:9, color:t.textMuted, fontFamily:"'JetBrains Mono',monospace", whiteSpace:"nowrap" }}>
              Last run: {result.metrics.total_ms}ms · {Math.round((result.metrics.symbolic_ratio||0)*100)}% symbolic · {result.ruleResult.rules_fired} rules fired
            </span>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:72, right:24, zIndex:999, padding:"10px 16px", background:toast.type==="error"?t.roseGlow:t.emeraldGlow, border:`1px solid ${toast.type==="error"?t.rose:t.emerald}44`, borderRadius:10, fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:toast.type==="error"?t.rose:t.emerald, boxShadow:t.shadow, animation:"slideRight 0.25s ease", maxWidth:420, backdropFilter:"blur(12px)" }}>
          {toast.type==="error"?"⛔":"✓"} {toast.msg}
        </div>
      )}

      {/* Main content */}
      <main style={{ padding:"28px 28px 60px", maxWidth:1440, margin:"0 auto" }}>
        {view==="analyse"     && <AnalyseView onResult={handleResult} t={t} />}
        {view==="kg"          && <KGView t={t} />}
        {view==="results"     && <ResultsView result={result} onNewAnalysis={()=>setView("analyse")} t={t} />}
        {view==="metrics"     && <MetricsView result={result} t={t} />}
        {view==="determinate" && <DetermineView result={result} t={t} />}
        {view==="about"       && <AboutView t={t} />}
      </main>

      {/* Footer */}
      <footer style={{ borderTop:`1px solid ${t.border}`, padding:"12px 28px", background:t.surface, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:t.textMuted }}>AXIOM v4 · FIDIC 2017 Conditions of Contract · 40 rules · 35N / 41E · Symbolic decisions only</span>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:t.textMuted }}>Not legal advice — indicative recommendations only</span>
      </footer>
    </div>
  );
}
