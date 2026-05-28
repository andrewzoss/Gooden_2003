import { useState, useEffect, useRef, useCallback } from "react";
import { getNbaSeasonData } from "./data/nbaRosters";

// ─── SEASON & TIMELINE ────────────────────────────────────────────────────────
// Every player enters the NBA at the start of the 2004-05 season, regardless
// of how many years they spent in college / overseas. College time is shown
// as "Year 1 / 2 / 3 / 4" (no calendar anchor), and age is derived from how
// many years the player has spent in college and the NBA so far.
const NBA_START_YEAR = 2004;          // 2004 = 2004-05 NBA season
const NBA_DRAFT_LABEL = "2004";       // shown as "2004 NBA DRAFT"
const ROOKIE_BASE_AGE = 18;           // age at end of high school
// Formats a season as "2008-09" given the start year.
const formatSeasonLabel = (startYear) =>
  `${startYear}-${String(startYear+1).slice(2)}`;
// Player's current age = base 18 + every full college/pro year they've played.
const calcAge = (allYears, nbaSeasons) =>
  ROOKIE_BASE_AGE + (allYears?.length||0) + (nbaSeasons?.length||0);

// ─── DATA ─────────────────────────────────────────────────────────────────────
const POSITIONS = ["PG","SG","SF","PF","C"];

const SKILLS = [
  {id:"threePoint",label:"3PT Shot",icon:"🎯"},
  {id:"midRange",label:"Mid-Range",icon:"📐"},
  {id:"finishing",label:"Finishing",icon:"🏀"},
  {id:"handles",label:"Handles",icon:"🔄"},
  {id:"playmaking",label:"Playmaking",icon:"📡"},
  {id:"perimDefense",label:"Perimeter D",icon:"🛡️"},
  {id:"postDefense",label:"Post Defense",icon:"🧱"},
  {id:"rebounding",label:"Rebounding",icon:"💪"},
];

const INTANGIBLES = [
  {id:"highIQ",label:"High IQ",icon:"🧠",trait:"bbIQ"},
  {id:"lightningQuick",label:"Lightning Quick",icon:"⚡",trait:"speed"},
  {id:"speedDemon",label:"Speed Demon",icon:"🏎️",trait:"athleticism"},
  {id:"clutchGene",label:"Clutch Gene",icon:"🔥",trait:"clutch"},
  {id:"bulldozer",label:"Bulldozer",icon:"🏋️",trait:"strength"},
  {id:"bornLeader",label:"Born Leader",icon:"👑",trait:"leadership"},
  {id:"confident",label:"Confident",icon:"💎",trait:"confidence"},
];

const STAR_TIERS = [
  {stars:5,label:"5★ Elite",desc:"Top-5 national recruit. Every blue-blood calling. Hardest competition.",difficulty:1.5},
  {stars:4,label:"4★ High Major",desc:"Power conference caliber. Multiple top-25 offers. Tough minutes.",difficulty:1.2},
  {stars:3,label:"3★ Mid-Major",desc:"Solid prospect. Will compete for starting time. Fair competition.",difficulty:1.0},
  {stars:2,label:"2★ Sleeper",desc:"Under the radar. Chip on your shoulder. Easier to shine.",difficulty:0.75},
];

const SCHOOLS = [
  {id:"duke",name:"Duke",prestige:10,minStars:4,devStrengths:["finishing","midRange","playmaking"],playTime:55,exposure:95,conf:"ACC",difficulty:1.4,colors:{p:"#003087",s:"#FFFFFF",logoUrl:"https://commons.wikimedia.org/wiki/Special:FilePath/Duke_Blue_Devils_basketball_mark.svg"},logo:"D"},
  {id:"unc",name:"North Carolina",prestige:10,minStars:4,devStrengths:["finishing","handles","midRange"],playTime:55,exposure:96,conf:"ACC",difficulty:1.4,colors:{p:"#7BAFD4",s:"#FFFFFF",logoUrl:"https://commons.wikimedia.org/wiki/Special:FilePath/North_Carolina_Tar_Heels_logo.svg"},logo:"NC"},
  {id:"kentucky",name:"Kentucky",prestige:10,minStars:4,devStrengths:["finishing","perimDefense","rebounding"],playTime:45,exposure:98,conf:"SEC",difficulty:1.4,colors:{p:"#0033A0",s:"#FFFFFF",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Kentucky_Wildcats_logo.svg"},logo:"UK"},
  {id:"kansas",name:"Kansas",prestige:9,minStars:4,devStrengths:["playmaking","midRange","handles"],playTime:50,exposure:92,conf:"Big 12",difficulty:1.3,colors:{p:"#0051BA",s:"#E8000D",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Kansas_Jayhawks_logo.svg"},logo:"KU"},
  {id:"ucla",name:"UCLA",prestige:9,minStars:4,devStrengths:["midRange","handles","playmaking"],playTime:55,exposure:90,conf:"Pac-12",difficulty:1.3,colors:{p:"#2D68C4",s:"#F2A900",logoUrl:"https://commons.wikimedia.org/wiki/Special:FilePath/UCLA_Bruins_script.svg"},logo:"UCLA"},
  {id:"msu",name:"Michigan State",prestige:9,minStars:3,devStrengths:["postDefense","rebounding","playmaking"],playTime:58,exposure:88,conf:"Big Ten",difficulty:1.2,colors:{p:"#18453B",s:"#FFFFFF",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Michigan_State_Athletics_logo.svg"},logo:"MSU"},
  {id:"osu",name:"Ohio State",prestige:9,minStars:3,devStrengths:["midRange","perimDefense","finishing"],playTime:60,exposure:88,conf:"Big Ten",difficulty:1.2,colors:{p:"#BB0000",s:"#A7B1B7",logoUrl:"https://commons.wikimedia.org/wiki/Special:FilePath/Ohio_State_Buckeyes_logo.svg"},logo:"OSU"},
  {id:"arizona",name:"Arizona",prestige:9,minStars:3,devStrengths:["threePoint","handles","midRange"],playTime:62,exposure:85,conf:"Pac-12",difficulty:1.2,colors:{p:"#CC0033",s:"#003366",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Arizona_Wildcats_logo.svg"},logo:"AZ"},
  {id:"uconn",name:"UConn",prestige:9,minStars:3,devStrengths:["finishing","perimDefense","postDefense"],playTime:60,exposure:86,conf:"Big East",difficulty:1.2,colors:{p:"#000E2F",s:"#E4002B",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Connecticut_Huskies_logo.svg"},logo:"UC"},
  {id:"gonzaga",name:"Gonzaga",prestige:8,minStars:3,devStrengths:["playmaking","handles","threePoint"],playTime:70,exposure:80,conf:"WCC",difficulty:1.1,colors:{p:"#041E42",s:"#C8102E",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Gonzaga_Bulldogs_logo.svg"},logo:"GU"},
  {id:"houston",name:"Houston",prestige:8,minStars:3,devStrengths:["perimDefense","postDefense","rebounding"],playTime:65,exposure:78,conf:"Big 12",difficulty:1.1,colors:{p:"#C8102E",s:"#FFFFFF",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Houston_Cougars_logo.svg"},logo:"UH"},
  {id:"villanova",name:"Villanova",prestige:8,minStars:3,devStrengths:["threePoint","handles","playmaking"],playTime:60,exposure:75,conf:"Big East",difficulty:1.1,colors:{p:"#00205B",s:"#13B5EA",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Villanova_Wildcats_logo.svg"},logo:"V"},
  {id:"florida",name:"Florida",prestige:7,minStars:3,devStrengths:["perimDefense","rebounding","finishing"],playTime:60,exposure:72,conf:"SEC",difficulty:1.0,colors:{p:"#0021A5",s:"#FA4616",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Florida_Gators_logo.svg"},logo:"UF"},
  {id:"memphis",name:"Memphis",prestige:7,minStars:3,devStrengths:["finishing","perimDefense","handles"],playTime:62,exposure:68,conf:"AAC",difficulty:1.0,colors:{p:"#003087",s:"#7E96A3",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Memphis_Tigers_logo.svg"},logo:"M"},
  {id:"syracuse",name:"Syracuse",prestige:7,minStars:3,devStrengths:["perimDefense","threePoint","rebounding"],playTime:60,exposure:70,conf:"ACC",difficulty:1.0,colors:{p:"#F76900",s:"#000E54",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Syracuse_Athletics_logo.svg"},logo:"SU"},
  {id:"indiana",name:"Indiana",prestige:7,minStars:2,devStrengths:["midRange","threePoint","playmaking"],playTime:65,exposure:65,conf:"Big Ten",difficulty:0.95,colors:{p:"#990000",s:"#EEEDEB",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Indiana_Hoosiers_logo.svg"},logo:"IU"},
  {id:"dayton",name:"Dayton",prestige:6,minStars:2,devStrengths:["playmaking","threePoint","midRange"],playTime:80,exposure:55,conf:"A-10",difficulty:0.9,colors:{p:"#CE1126",s:"#004B8D",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Dayton_Flyers_logo.svg"},logo:"UD"},
  {id:"vcu",name:"VCU",prestige:5,minStars:2,devStrengths:["perimDefense","handles","rebounding"],playTime:90,exposure:45,conf:"A-10",difficulty:0.8,colors:{p:"#000000",s:"#F8B300",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/VCU_Rams_logo.svg"},logo:"VCU"},
  {id:"belmont",name:"Belmont",prestige:4,minStars:2,devStrengths:["threePoint","midRange","handles"],playTime:95,exposure:35,conf:"MVC",difficulty:0.7,colors:{p:"#002060",s:"#CC0000",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Belmont_Bruins_logo.svg"},logo:"BU"},
  {id:"siena",name:"Siena",prestige:4,minStars:2,devStrengths:["handles","playmaking","perimDefense"],playTime:92,exposure:32,conf:"MAAC",difficulty:0.7,colors:{p:"#006747",s:"#FFB81C",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Siena_Saints_logo.svg"},logo:"SC"},
];

const INTL_TEAMS = [
  {id:"madrid",name:"Real Madrid BC",country:"Spain 🇪🇸",prestige:8,devStrengths:["playmaking","midRange","handles"],playTime:50,exposure:60,conf:"Liga ACB",difficulty:1.2,colors:{p:"#FFFFFF",s:"#FEBE10",logoUrl:"https://commons.wikimedia.org/wiki/Special:FilePath/Real_Madrid_Baloncesto.svg"},logo:"RM"},
  {id:"olympiacos",name:"Olympiacos",country:"Greece 🇬🇷",prestige:6,devStrengths:["postDefense","rebounding","finishing"],playTime:65,exposure:45,conf:"EuroLeague",difficulty:1.0,colors:{p:"#C8102E",s:"#FFFFFF",logoUrl:"https://commons.wikimedia.org/wiki/Special:FilePath/Olympiacos_BC_logo.svg"},logo:"OLY"},
  {id:"maccabi",name:"Maccabi Tel Aviv",country:"Israel 🇮🇱",prestige:7,devStrengths:["threePoint","midRange","handles"],playTime:70,exposure:50,conf:"BSL",difficulty:1.0,colors:{p:"#FFD700",s:"#003F87",logoUrl:"https://commons.wikimedia.org/wiki/Special:FilePath/Maccabi_Tel_Aviv_BC_logo.svg"},logo:"MTA"},
  {id:"sydney",name:"Sydney Kings",country:"Australia 🇦🇺",prestige:6,devStrengths:["finishing","perimDefense","midRange"],playTime:80,exposure:55,conf:"NBL",difficulty:0.9,colors:{p:"#5C2D91",s:"#FFFFFF",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Sydney_Kings_logo.svg"},logo:"SK"},
  {id:"asvel",name:"ASVEL Lyon",country:"France 🇫🇷",prestige:6,devStrengths:["handles","playmaking","threePoint"],playTime:75,exposure:48,conf:"Pro A",difficulty:0.9,colors:{p:"#005FAF",s:"#FFFFFF",logoUrl:"https://commons.wikimedia.org/wiki/Special:FilePath/LDLC_ASVEL_logo.svg"},logo:"ASV"},
];

// Agents — tiered by reputation. Higher rep = better NBA player workout options + more team ties +
// stricter access (you need a high enough draft projection to even sign with them).
// `players` are real NBA players active in 2003-04. Each grants 1-3 +5 skill upgrades when you
// work out with them at signing, based on their tier.
// `requiredTier` is the minimum projected-draft tier the agent will sign (top5 > lottery > first > early2nd > late2nd > undrafted).
const AGENTS = [
  {
    id:"webb",name:"Marcus Webb",agency:"Webb Elite Sports",rep:10,
    desc:"Top-shelf representation. Reps the highest-profile prospects. Only takes blue-chip clients.",
    requiredTier:"lottery",
    teamTies:["LA Lakers","San Antonio Spurs","Dallas Mavericks","Sacramento Kings","Detroit Pistons","Minnesota Timberwolves","New Jersey Nets","Indiana Pacers","New Orleans Hornets","Miami Heat"],
    players:[
      {name:"Kobe Bryant",team:"LA Lakers",tier:"superstar",upgrades:3,focus:"midRange"},
      {name:"Tim Duncan",team:"San Antonio Spurs",tier:"superstar",upgrades:3,focus:"postDefense"},
      {name:"Jason Kidd",team:"New Jersey Nets",tier:"superstar",upgrades:3,focus:"playmaking"},
    ],
  },
  {
    id:"holloway",name:"Diane Holloway",agency:"Holloway Sports Group",rep:8,
    desc:"Established mid-major rep. Strong for first-round lottery and mid-1st clients.",
    requiredTier:"first",
    teamTies:["Houston Rockets","Memphis Grizzlies","Phoenix Suns","Milwaukee Bucks","Orlando Magic","Boston Celtics","Cleveland Cavaliers"],
    players:[
      {name:"Tracy McGrady",team:"Orlando Magic",tier:"allstar",upgrades:2,focus:"threePoint"},
      {name:"Paul Pierce",team:"Boston Celtics",tier:"allstar",upgrades:2,focus:"midRange"},
      {name:"Steve Francis",team:"Houston Rockets",tier:"allstar",upgrades:2,focus:"finishing"},
    ],
  },
  {
    id:"tanaka",name:"Yuki Tanaka",agency:"Global Hoops Agency",rep:7,
    desc:"International specialist. Strong overseas pipeline; takes most first-rounders.",
    requiredTier:"first",
    teamTies:["Sacramento Kings","Dallas Mavericks","Toronto Raptors","Houston Rockets","Utah Jazz","San Antonio Spurs"],
    players:[
      {name:"Peja Stojaković",team:"Sacramento Kings",tier:"allstar",upgrades:2,focus:"threePoint"},
      {name:"Dirk Nowitzki",team:"Dallas Mavericks",tier:"superstar",upgrades:3,focus:"midRange"},
      {name:"Vlade Divac",team:"Sacramento Kings",tier:"starter",upgrades:1,focus:"postDefense"},
    ],
  },
  {
    id:"collins",name:"Nia Collins",agency:"Collins Premier",rep:6,
    desc:"Boutique agency. Will work hard for mid-first to early-second clients.",
    requiredTier:"early2nd",
    teamTies:["Atlanta Hawks","Washington Wizards","Charlotte Bobcats","Golden State Warriors","Portland Trail Blazers"],
    players:[
      {name:"Antawn Jamison",team:"Dallas Mavericks",tier:"starter",upgrades:1,focus:"midRange"},
      {name:"Jamal Mashburn",team:"New Orleans Hornets",tier:"starter",upgrades:1,focus:"threePoint"},
      {name:"Bonzi Wells",team:"Portland Trail Blazers",tier:"starter",upgrades:1,focus:"finishing"},
    ],
  },
  {
    id:"pratt",name:"Kevin Pratt",agency:"Pratt Sports Mgmt",rep:4,
    desc:"Young and hungry. Will sign any prospect with a heartbeat. Limited connections.",
    requiredTier:"undrafted",
    teamTies:["Charlotte Bobcats","Atlanta Hawks"],
    players:[
      {name:"Tony Battie",team:"Orlando Magic",tier:"bench",upgrades:1,focus:"rebounding"},
      {name:"Mark Madsen",team:"Minnesota Timberwolves",tier:"bench",upgrades:1,focus:"rebounding"},
      {name:"Jumaine Jones",team:"Boston Celtics",tier:"bench",upgrades:1,focus:"perimDefense"},
    ],
  },
];

// Order tiers for comparison: higher tier = better projection
const TIER_RANK={undrafted:0,late2nd:1,early2nd:2,first:3,lottery:4,top5:5};

const NBA_TEAMS = [
  "Atlanta Hawks","Boston Celtics","Chicago Bulls","Cleveland Cavaliers","Dallas Mavericks",
  "Denver Nuggets","Detroit Pistons","Golden State Warriors","Houston Rockets","Indiana Pacers",
  "LA Clippers","LA Lakers","Memphis Grizzlies","Miami Heat","Milwaukee Bucks",
  "Minnesota Timberwolves","New Orleans Hornets","New York Knicks","Seattle SuperSonics",
  "Orlando Magic","Philadelphia 76ers","Phoenix Suns","Portland Trail Blazers",
  "Sacramento Kings","San Antonio Spurs","Toronto Raptors","Utah Jazz","Washington Wizards",
  "Charlotte Bobcats","New Jersey Nets",
];

// Era-accurate team colors for 2003-04 jersey reveals
const NBA_TEAM_DATA = {
  "Atlanta Hawks":{p:"#E03A3E",s:"#C1D32F",abbr:"ATL",logoUrl:"/logos/atl.svg"},
  "Boston Celtics":{p:"#007A33",s:"#FFFFFF",abbr:"BOS",logoUrl:"/logos/bos.svg"},
  "Chicago Bulls":{p:"#CE1141",s:"#000000",abbr:"CHI",logoUrl:"/logos/chi.svg"},
  "Cleveland Cavaliers":{p:"#860038",s:"#FDBB30",abbr:"CLE",logoUrl:"/logos/cle.svg"},
  "Dallas Mavericks":{p:"#00538C",s:"#002B5E",abbr:"DAL",logoUrl:"/logos/dal.svg"},
  "Denver Nuggets":{p:"#0E2240",s:"#FEC524",abbr:"DEN",logoUrl:"/logos/den.svg"},
  "Detroit Pistons":{p:"#C8102E",s:"#1D42BA",abbr:"DET",logoUrl:"/logos/det.svg"},
  "Golden State Warriors":{p:"#1D428A",s:"#FFC72C",abbr:"GSW",logoUrl:"/logos/gsw.svg"},
  "Houston Rockets":{p:"#CE1141",s:"#000000",abbr:"HOU",logoUrl:"/logos/hou.svg"},
  "Indiana Pacers":{p:"#002D62",s:"#FDBB30",abbr:"IND",logoUrl:"/logos/ind.svg"},
  "LA Clippers":{p:"#C8102E",s:"#1D428A",abbr:"LAC",logoUrl:"/logos/lac.svg"},
  "LA Lakers":{p:"#552583",s:"#FDB927",abbr:"LAL",logoUrl:"/logos/lal.svg"},
  "Memphis Grizzlies":{p:"#00B2A9",s:"#040204",abbr:"MEM",logoUrl:"/logos/mem.svg"},
  "Miami Heat":{p:"#98002E",s:"#F9A01B",abbr:"MIA",logoUrl:"/logos/mia.svg"},
  "Milwaukee Bucks":{p:"#6F263D",s:"#274E13",abbr:"MIL",logoUrl:"/logos/mil.svg"},
  "Minnesota Timberwolves":{p:"#0C2340",s:"#236192",abbr:"MIN",logoUrl:"/logos/min.svg"},
  "New Orleans Hornets":{p:"#0F586C",s:"#B4975A",abbr:"NOH",logoUrl:"/logos/noh.svg"},
  "New York Knicks":{p:"#006BB6",s:"#F58426",abbr:"NYK",logoUrl:"/logos/nyk.svg"},
  "Seattle SuperSonics":{p:"#00653A",s:"#FFC200",abbr:"SEA",logoUrl:"/logos/sea.svg"},
  "Orlando Magic":{p:"#0077C0",s:"#000000",abbr:"ORL",logoUrl:"/logos/orl.svg"},
  "Philadelphia 76ers":{p:"#006BB6",s:"#ED174C",abbr:"PHI",logoUrl:"/logos/phi.svg"},
  "Phoenix Suns":{p:"#1D1160",s:"#E56020",abbr:"PHX",logoUrl:"/logos/phx.svg"},
  "Portland Trail Blazers":{p:"#E03A3E",s:"#000000",abbr:"POR",logoUrl:"/logos/por.svg"},
  "Sacramento Kings":{p:"#5A2D81",s:"#63727A",abbr:"SAC",logoUrl:"/logos/sac.svg"},
  "San Antonio Spurs":{p:"#000000",s:"#C4CED4",abbr:"SAS",logoUrl:"/logos/sas.svg"},
  "Toronto Raptors":{p:"#753BBD",s:"#CE1141",abbr:"TOR",logoUrl:"/logos/tor.svg"},
  "Utah Jazz":{p:"#5C2D91",s:"#75B2DD",abbr:"UTA",logoUrl:"/logos/uta.svg"},
  "Washington Wizards":{p:"#002B5C",s:"#E31837",abbr:"WAS",logoUrl:"/logos/was.svg"},
  "Charlotte Bobcats":{p:"#F26532",s:"#053F61",abbr:"CHA",logoUrl:"/logos/cha.svg"},
  "New Jersey Nets":{p:"#002A60",s:"#C8102E",abbr:"NJN",logoUrl:"/logos/njn.svg"},
};

// ─── SHOE DEALS ────────────────────────────────────────────────────────────────
// 2003-era endorsement market. Each brand has a maxPick (their cutoff: a brand
// only signs prospects drafted at or above this slot), a signingBonus, and a
// skillBonus. Order in the array = display order in the offers box.
const SHOE_BRANDS = [
  {id:"nike",     name:"Nike",     maxPick:5,  bonus:2000000, skillBonus:5, color:"#FA5400", subtitle:"Top 5 picks only"},
  {id:"adidas",   name:"Adidas",   maxPick:10, bonus:2000000, skillBonus:5, color:"#FFFFFF", subtitle:"Top 10 picks only"},
  {id:"reebok",   name:"Reebok",   maxPick:14, bonus:1000000, skillBonus:5, color:"#DA1A32", subtitle:"Top 14 (lottery)"},
  {id:"puma",     name:"Puma",     maxPick:14, bonus:1000000, skillBonus:5, color:"#FFD500", subtitle:"Top 14 (lottery)"},
  {id:"converse", name:"Converse", maxPick:14, bonus: 500000, skillBonus:5, color:"#C8102E", subtitle:"Top 14 (lottery)"},
  {id:"and1",     name:"AND1",     maxPick:14, bonus:      0, skillBonus:5, color:"#000000", subtitle:"Top 14 (lottery)"},
];
// Format a dollar amount as "$2M", "$500K", or "$0" — used by the deals box.
function fmtMoney(n){
  if(n===0) return "$0";
  if(n>=1000000) return `$${(n/1000000).toFixed(n%1000000===0?0:1)}M`;
  if(n>=1000) return `$${Math.round(n/1000)}K`;
  return `$${n}`;
}

// ─── NBA ROSTER DATA ─────────────────────────────────────────────────────────
// Per-season rosters and records now live in `src/data/nbaRosters.ts`, keyed
// by season-start year (2003 = 2003-04 season, 2004 = 2004-05, etc.).
// Use `getNbaSeasonData(year)` to look up the active season — it falls back
// gracefully to the latest populated year if a year isn't filled in yet.

const IQ_QUESTIONS = [
  "What makes you different from every other prospect in this draft?",
];

const SKIN_TONES = ["#FDDBB4","#F0C08A","#C68642","#8D5524","#4A2912","#1C0A00"];
const HAIR_STYLES = ["Bald","Low Cut","Fade","Dreads","Afro","Braids"];
const BEARD_STYLES = ["Clean","Stubble","Goatee","Full Beard","Chinstrap"];
const HEADBAND_COLORS = ["None","White","Black","Red","Blue","Gold"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const clamp = (v,mn,mx) => Math.max(mn,Math.min(mx,v));
const rand = (mn,mx) => Math.floor(Math.random()*(mx-mn+1))+mn;

function baseSkills(pos) {
  // Baseline — what everybody starts with before position adjustments
  const d={threePoint:42,midRange:45,finishing:45,handles:42,playmaking:42,perimDefense:42,postDefense:42,rebounding:42};
  // Each position has clear strengths (+15 to +22) and weaknesses (-8 to -15)
  // so a freshly-built player feels like their archetype out of the box.
  // Clamped to [30, 70] below — a 5★ build can push these toward 70 in the
  // build screen with their 100 points; -15 weaknesses still bottom out at 30
  // unless the player actively spends to lift them.
  const b={
    PG:{handles:18, playmaking:20, threePoint:8,  rebounding:-8,  postDefense:-5},
    SG:{threePoint:18, midRange:15, handles:8,    rebounding:-5,  postDefense:-5},
    SF:{finishing:15, perimDefense:10, threePoint:8, midRange:5,  postDefense:-3},
    PF:{rebounding:18, postDefense:15, finishing:10, threePoint:-10, handles:-8, playmaking:-5},
    C: {rebounding:22, postDefense:20, finishing:13, threePoint:-15, handles:-15, playmaking:-10, midRange:-8},
  };
  const r={...d}; const bst=b[pos]||{};
  Object.keys(bst).forEach(k=>{r[k]=clamp(r[k]+bst[k],30,70);});
  return r;
}

// Position-based starting skill values, rounded to nearest 5 so the +5/-5
// stepping in the build screen always lands on clean values. This is the
// single source of truth for "what does a new PG/SG/SF/PF/C start with?" —
// used by the initial player state, the wipe-and-start-new reset, and the
// position-change useEffect in the build screen.
function defaultSkills(pos){
  const bs=baseSkills(pos);
  return Object.fromEntries(Object.entries(bs).map(([k,v])=>[k,Math.round(v/5)*5]));
}

function calcOVR(skills, intangibles=[]) {
  const sv=Object.values(skills).reduce((a,b)=>a+b,0)/Object.keys(skills).length;
  const iv=intangibles.length*3;
  return Math.round(sv+iv);
}

// Projected draft position (1-60+) based on overall, star tier, school exposure, and stats.
// Pre-combine version: optional combineScore/interviewScore params boost the projection
// once you've done those. Returns {pick, range, tier, label}.
function projectDraft({ovr, starTier, school, allYears, combineScore=null, interviewScore=null}){
  // Base off OVR. Calibrated to actual OVR range: starting ~58-62, peak after 4 years ~65-78.
  // OVR 75+ → top 5, 70+ → lottery, 66+ → first round mid, 62+ → late 1st, 58+ → early 2nd, 54+ → late 2nd.
  let basePick;
  if(ovr>=76) basePick=2;
  else if(ovr>=72) basePick=8;
  else if(ovr>=68) basePick=16;
  else if(ovr>=64) basePick=26;
  else if(ovr>=60) basePick=36;
  else if(ovr>=56) basePick=48;
  else basePick=62; // undrafted-ish
  // Star tier — centered on 3-star (no adjustment). 5-star moves you up 4, 1-star down 4.
  const starAdj=starTier?(3-starTier.stars)*2:0;
  // Exposure — centered on 60. ±5 swing.
  const exposureAdj=school?Math.round((60-school.exposure)/12):0;
  // Performance — centered on 14 PPG. Hot scorer moves up, dud moves down.
  const avgPpg=allYears.length?allYears.reduce((a,y)=>a+(y.stats?.ppg||0),0)/allYears.length:14;
  const perfAdj=Math.round((14-avgPpg)*0.7);
  // Combine and interview adjustments (post-pre-draft)
  const combineAdj=combineScore!==null?Math.round((60-combineScore)/7):0;
  const interviewAdj=interviewScore!==null?Math.round((6-interviewScore)*1.0):0;
  let pick=basePick+starAdj+exposureAdj+perfAdj+combineAdj+interviewAdj;
  pick=Math.max(1,Math.min(75,pick));
  // Range fuzziness — tighter when projection is high, wider for borderline
  const fuzz=pick<10?2:pick<25?4:pick<45?6:8;
  const lo=Math.max(1,pick-fuzz); const hi=Math.min(75,pick+fuzz);
  const tier=pick<=5?"top5":pick<=14?"lottery":pick<=30?"first":pick<=45?"early2nd":pick<=60?"late2nd":"undrafted";
  const label={top5:"Top 5 Pick",lottery:"Lottery Pick",first:"First Round",early2nd:"Early Second",late2nd:"Late Second",undrafted:"Undrafted Range"}[tier];
  return {pick,range:[lo,hi],tier,label};
}

// AC's Take — generates a scout-voice blurb about the player based on their build,
// skills, intangibles, and college/intl career. Used in the post-draft career profile.
function acTake({player, school, starTier, allYears}){
  const h=player.height||76;
  const heightStr=`${Math.floor(h/12)}'${h%12}"`;
  const w=player.weight||210;
  const pos=player.position||"SG";
  const posLabel={PG:"point guard",SG:"shooting guard",SF:"small forward",PF:"power forward",C:"center"}[pos]||"guard";
  const intangs=player.intangibles||[];
  const skills=player.skills||{};
  const avgPpg=allYears.length?(allYears.reduce((a,y)=>a+(y.stats?.ppg||0),0)/allYears.length):0;
  // Find the top 3 skills
  const sorted=Object.entries(skills).sort((a,b)=>b[1]-a[1]);
  const top=sorted.slice(0,3).map(([k])=>k);
  const has=(s)=>top.includes(s);
  // Play style identifier — looks at combinations of strengths
  let style;
  if(has("threePoint")&&has("midRange")) style="a knockdown shooter with NBA range and a smooth pull-up game";
  else if(has("finishing")&&has("handles")) style="a downhill scorer who attacks the rim with purpose";
  else if(has("playmaking")&&has("handles")) style="a heady floor general who controls tempo";
  else if(has("perimDefense")&&has("postDefense")) style="a switchable defender who can guard multiple spots";
  else if(has("rebounding")&&has("postDefense")) style="a true interior presence on both ends";
  else if(has("threePoint")) style="a perimeter sniper who'll punish help defense";
  else if(has("finishing")) style="an explosive finisher in transition and at the cup";
  else if(has("playmaking")) style="a distributor with high-end court vision";
  else if(has("perimDefense")) style="a tough on-ball defender who locks up at the point of attack";
  else if(has("postDefense")) style="a physical interior anchor";
  else if(has("rebounding")) style="a relentless rebounder who plays bigger than his size";
  else style="a balanced two-way contributor";
  // Intangible flavor — pick the most impactful one
  let trait;
  if(intangs.includes("clutchGene")) trait="He's got that clutch DNA — you want the rock in his hands late.";
  else if(intangs.includes("bornLeader")) trait="Carries himself like a leader, and the guys around him respond.";
  else if(intangs.includes("highIQ")) trait="The basketball IQ jumps off the tape — he's two steps ahead.";
  else if(intangs.includes("lightningQuick")) trait="That first step is lightning. Defenders can't stay in front.";
  else if(intangs.includes("speedDemon")) trait="Pure athletic ability. Plays above the rim and runs the floor.";
  else if(intangs.includes("bulldozer")) trait="He's a load to handle. Once he gets a step, forget about it.";
  else if(intangs.includes("confident")) trait="Quiet confidence, never gets rattled.";
  else if(intangs.includes("teamFirst")) trait="The ultimate teammate — does the little things that win games.";
  else if(intangs.includes("workhorse")) trait="First in, last out. The work ethic is real.";
  else trait="Plays the right way and stays within himself.";
  // School / international reference
  const yrs=allYears.length;
  const schoolNote=school?.isIntl
    ?`Coming out of ${school?.name||"his club"} overseas, he's got pro reps a lot of guys his age don't have, and averaged ${avgPpg.toFixed(1)} over there.`
    :`He logged ${yrs} ${yrs===1?"year":"years"} at ${school?.name||"college"} and averaged ${avgPpg.toFixed(1)} per game.`;
  // Physical / size note
  const sizeNote=h>=80?`At ${heightStr}, ${w} lbs, he's got prototype length for the ${posLabel} spot.`
    :h>=76?`${heightStr}, ${w} lbs — solid frame for an NBA ${posLabel}.`
    :`Listed at ${heightStr}, ${w} lbs. He'll need to lean on his quickness to overcome the size.`;
  return `${sizeNote} What jumps out on tape is ${style}. ${trait} ${schoolNote}`;
}

// ─── COLORS ───────────────────────────────────────────────────────────────────
const OR="#e8873a"; const PU="#a88aff"; const GR="#00dc64"; const BL="#4aa8ff"; const RE="#e84040"; const GO="#ffd700";
const SV="#c8ccd1"; const YE="#ffeb3b"; // silver chrome + arcade yellow for menu

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const inputS={width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"11px 13px",color:"#f0ede8",fontSize:15,outline:"none",fontFamily:"'Barlow Condensed',sans-serif",boxSizing:"border-box"};
const btnS={width:"100%",background:OR,border:"none",color:"#080c10",padding:"13px 16px",borderRadius:10,cursor:"pointer",fontWeight:900,fontSize:15,fontFamily:"'Barlow Condensed',sans-serif"};
const ghostS={...btnS,background:"transparent",border:"1px solid rgba(255,255,255,0.15)",color:"#f0ede8"};

function Hd({sub,title}){return(<div style={{marginBottom:18}}><div style={{fontSize:10,letterSpacing:4,textTransform:"uppercase",color:OR,marginBottom:3}}>{sub}</div><div style={{fontSize:26,fontWeight:900,lineHeight:1.1}}>{title}</div><div style={{height:1,background:"rgba(255,255,255,0.06)",marginTop:12}}/></div>);}
function Lbl({children,color}){return <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:color||"#666",marginBottom:6}}>{children}</div>;}
function CardBtn({children,selected,onClick,accent,style={}}){
  return(<button onClick={onClick} style={{width:"100%",textAlign:"left",background:selected?"rgba(232,135,58,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${selected?(accent||OR):"rgba(255,255,255,0.08)"}`,borderRadius:12,padding:"13px 14px",cursor:"pointer",color:"#f0ede8",marginBottom:8,fontFamily:"'Barlow Condensed',sans-serif",...style}}>{children}</button>);
}
function Tag({children}){return <span style={{fontSize:10,background:"rgba(0,220,100,0.1)",border:"1px solid rgba(0,220,100,0.22)",padding:"3px 7px",borderRadius:4,color:GR,display:"inline-block",marginRight:4,marginBottom:3}}>{children}</span>;}

// The cover-art emblem — chrome circle with AZ SPORTS / GOODEN / 2003
// Cover art for GOODEN 2003 — embedded so the file is self-contained
const COVER_ART_DATA_URL = "/cover-art.webp";

// Drew Gooden picture for the Extras screen
const GOODEN_PIC_DATA_URL = "/gooden.webp";

// Background music — points to the MP3 file that ships alongside this JSX.
// In a Vite/CRA/Next setup, place "nba_live_2003_soundtrack.mp3" in your /public folder.
// Override this constant if your file is hosted elsewhere.
const AC_CARR_DATA_URL = "/ac-carr.webp";
const MUSIC_SRC = "/soundtrack.mp3";
// Silent 1×1 MP4 with a (silent) audio track — used to flip iOS Safari out of
// silent-switch-mute mode so the actual music plays even when the ringer is off.
const SILENT_MP4_SRC = "/silent.mp4";


// TeamEmblem — generates a polished branded mark for any team/school.
// Picks a shape variant based on the team name hash so each team has a consistent
// unique look. Uses team primary/secondary colors throughout.
//
// LOGO IMAGE OVERRIDE:
//   Pass `logoUrl` to render an actual image instead of the stylized SVG.
//   This lets you (the user) host your own logo images and wire them in via
//   the school/team data structures. Example in COLLEGES or NBA_TEAM_DATA:
//     { name:"Ohio State", colors:{p:"#bb0000",s:"#666666"}, logoUrl:"https://yourhost.com/osu.png" }
//   When logoUrl is set, the SVG fallback is skipped entirely.
function TeamEmblem({colors, abbr, size=120, decorative=true, name="", logoUrl=null}){
  // Track which extension we're currently trying. When `logoUrl` ends in
  // a path without a known image extension (e.g. "/logos/atl"), we try
  // .svg → .png → .webp in order. The state is the *index* into the
  // candidate list; -1 means "give up, show fallback".
  const [extIdx, setExtIdx] = useState(0);
  const exts = [".svg", ".png", ".webp"];
  // Build the candidate URL. If the original URL already ends in an image
  // extension (with or without query string), we just use it as-is. If it's
  // bare (e.g. "/logos/atl"), we append the current candidate extension —
  // letting us fall back across formats so the user can save any of svg/png/webp.
  const resolveUrl=(url)=>{
    if(!url) return null;
    if(/\.(svg|png|webp|jpg|jpeg|gif)(\?|$)/i.test(url)){
      // Already has an extension — strip it so we can try alternatives
      const base=url.replace(/\.(svg|png|webp|jpg|jpeg|gif)(\?|$)/i,"$2");
      return base+exts[extIdx];
    }
    return url+exts[extIdx];
  };
  const resolvedUrl = resolveUrl(logoUrl);
  const showImg = resolvedUrl && extIdx>=0 && extIdx<exts.length;
  // If the current extension's URL 404s, advance to the next one. After
  // exhausting all extensions, hide the image and let the SVG fallback render.
  const handleError=()=>{
    if(extIdx+1<exts.length){
      setExtIdx(extIdx+1);
    } else {
      setExtIdx(-1);
    }
  };
  // If a logo image URL is provided AND it loads ok, render the image inside a
  // framed badge. Background is a soft light tint so logos with dark elements are visible.
  if(showImg){
    const p = colors?.p || "#222";
    const s = colors?.s || "#888";
    return(
      <div style={{
        width:size, height:size, borderRadius:"50%",
        background:`radial-gradient(circle at 30% 30%, #ffffff 0%, #ececec 70%, #c8c8c8 100%)`,
        display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden",
        border:`3px solid ${s}`,
        boxShadow:`0 0 0 2px ${p}, 0 6px 18px ${p}99, inset 0 -4px 12px rgba(0,0,0,0.2)`,
      }}>
        <img
          src={resolvedUrl}
          alt={abbr}
          onError={handleError}
          style={{width:"78%", height:"78%", objectFit:"contain", filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}}
        />
      </div>
    );
  }
  // No image — render the stylized SVG with an HTML text overlay (flexbox centers perfectly).
  const p=colors?.p||"#444"; const s=colors?.s||"#888";
  // Hash team name (or abbr if no name) to pick a consistent variant
  const hashSrc=(name||abbr||"")+"";
  let h=0; for(let i=0;i<hashSrc.length;i++){h=((h<<5)-h+hashSrc.charCodeAt(i))|0;}
  const variant=Math.abs(h)%5; // 0=circle+star, 1=shield, 2=hexagon, 3=diamond, 4=banner
  // Per-variant text offset accounts for shapes whose visual center differs from geometric center.
  const textOffsetY = {0:"0%", 1:"6%", 2:"0%", 3:"0%", 4:"0%"}[variant];
  // Compute label contrast: use light text on dark primary, dark text on light primary
  const pBright=parseInt(p.slice(1,3),16)+parseInt(p.slice(3,5),16)+parseInt(p.slice(5,7),16);
  const textColor=pBright<360?"#fff":"#000";
  // Abbr font size scales with length
  const aLen=(abbr||"").length;
  const aFont=aLen>=4?20:aLen>=3?26:32;
  // Unique gradient ids per render
  const gid=`em${Math.abs(h)}_${size}`;
  const svgEl=(
    <svg width={size} height={size} viewBox="0 0 120 120" style={{filter:`drop-shadow(0 6px 18px ${p}77)`,display:"block"}}>
      <defs>
        <radialGradient id={`${gid}g`} cx="0.35" cy="0.3">
          <stop offset="0" stopColor={s} stopOpacity="0.9"/>
          <stop offset="0.55" stopColor={p}/>
          <stop offset="1" stopColor="#0a0a0a"/>
        </radialGradient>
        <linearGradient id={`${gid}sh`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0.22)"/>
          <stop offset="0.5" stopColor="rgba(255,255,255,0)"/>
          <stop offset="1" stopColor="rgba(0,0,0,0.3)"/>
        </linearGradient>
      </defs>

      {/* Outer chrome ring on every variant */}
      {variant===0&&(<g>
        {/* CIRCLE with star — classic NBA roundel feel */}
        <circle cx="60" cy="60" r="56" fill={`url(#${gid}g)`} stroke={s} strokeWidth="3"/>
        <circle cx="60" cy="60" r="48" fill="none" stroke={s} strokeWidth="1" opacity="0.55"/>
        {decorative&&(<g opacity="0.32">
          {/* 5-point star background */}
          <path d="M 60 18 L 67.5 42 L 92 42 L 72.5 56 L 80 80 L 60 65.5 L 40 80 L 47.5 56 L 28 42 L 52.5 42 Z" fill={s}/>
        </g>)}
        <circle cx="60" cy="60" r="56" fill={`url(#${gid}sh)`} pointerEvents="none"/>
      </g>)}

      {variant===1&&(<g>
        {/* SHIELD — pro sports crest feel */}
        <path d="M 20 24 L 100 24 L 100 70 Q 100 96 60 110 Q 20 96 20 70 Z" fill={`url(#${gid}g)`} stroke={s} strokeWidth="3" strokeLinejoin="round"/>
        <path d="M 26 30 L 94 30 L 94 70 Q 94 90 60 102 Q 26 90 26 70 Z" fill="none" stroke={s} strokeWidth="1" opacity="0.5"/>
        {decorative&&(
          /* Horizontal banner across upper third */
          <g opacity="0.35">
            <rect x="20" y="38" width="80" height="8" fill={s}/>
            <rect x="20" y="80" width="80" height="3" fill={s}/>
          </g>
        )}
        <path d="M 20 24 L 100 24 L 100 70 Q 100 96 60 110 Q 20 96 20 70 Z" fill={`url(#${gid}sh)`} pointerEvents="none"/>
      </g>)}

      {variant===2&&(<g>
        {/* HEXAGON — modern, geometric */}
        <path d="M 60 8 L 108 35 L 108 85 L 60 112 L 12 85 L 12 35 Z" fill={`url(#${gid}g)`} stroke={s} strokeWidth="3" strokeLinejoin="round"/>
        <path d="M 60 16 L 100 39 L 100 81 L 60 104 L 20 81 L 20 39 Z" fill="none" stroke={s} strokeWidth="1" opacity="0.5"/>
        {decorative&&(<g opacity="0.3">
          {/* Diagonal stripe band */}
          <path d="M 12 50 L 108 50 M 12 70 L 108 70" stroke={s} strokeWidth="2"/>
        </g>)}
        <path d="M 60 8 L 108 35 L 108 85 L 60 112 L 12 85 L 12 35 Z" fill={`url(#${gid}sh)`} pointerEvents="none"/>
      </g>)}

      {variant===3&&(<g>
        {/* DIAMOND — sharp, athletic */}
        <path d="M 60 6 L 114 60 L 60 114 L 6 60 Z" fill={`url(#${gid}g)`} stroke={s} strokeWidth="3" strokeLinejoin="round"/>
        <path d="M 60 16 L 104 60 L 60 104 L 16 60 Z" fill="none" stroke={s} strokeWidth="1" opacity="0.5"/>
        {decorative&&(<g opacity="0.3">
          {/* Cross lines */}
          <line x1="14" y1="60" x2="106" y2="60" stroke={s} strokeWidth="1.5"/>
          <line x1="60" y1="14" x2="60" y2="106" stroke={s} strokeWidth="1.5"/>
        </g>)}
        <path d="M 60 6 L 114 60 L 60 114 L 6 60 Z" fill={`url(#${gid}sh)`} pointerEvents="none"/>
      </g>)}

      {variant===4&&(<g>
        {/* ROUNDED-RECT BADGE with banner */}
        <rect x="10" y="20" width="100" height="80" rx="12" fill={`url(#${gid}g)`} stroke={s} strokeWidth="3"/>
        <rect x="14" y="24" width="92" height="72" rx="9" fill="none" stroke={s} strokeWidth="1" opacity="0.45"/>
        {decorative&&(<g opacity="0.32">
          {/* Crest banner across middle */}
          <path d="M 4 56 L 116 56 L 110 64 L 4 64 Z" fill={s}/>
          <path d="M 4 56 L 8 52 L 12 56 Z" fill={s}/>
          <path d="M 116 56 L 112 52 L 108 56 Z" fill={s}/>
        </g>)}
        <rect x="10" y="20" width="100" height="80" rx="12" fill={`url(#${gid}sh)`} pointerEvents="none"/>
      </g>)}

    </svg>
  );
  // Compute font size scaled to the actual badge size (was 120 viewBox; scale up for bigger badges)
  const cssFont = aFont * (size / 120);
  return(
    <div style={{position:"relative", width:size, height:size, display:"inline-block"}}>
      {svgEl}
      <div style={{
        position:"absolute", inset:0,
        display:"flex", alignItems:"center", justifyContent:"center",
        transform:`translateY(${textOffsetY})`,
        pointerEvents:"none",
        fontFamily:"Impact, 'Arial Black', sans-serif",
        fontWeight:900,
        fontSize:cssFont,
        color:textColor,
        WebkitTextStroke:`1.2px ${textColor==="#fff"?"#000":s}`,
        letterSpacing:"1px",
        lineHeight:1,
        textShadow:textColor==="#fff"?"0 1px 3px rgba(0,0,0,0.4)":"none",
      }}>
        {abbr}
      </div>
    </div>
  );
}

function Logo({size=110}){
  return(
    <img src={COVER_ART_DATA_URL} alt="GOODEN 2003" style={{
      width:size,height:size,objectFit:"cover",objectPosition:"center",
      borderRadius:"50%",
      border:size>=60?"2px solid rgba(255,255,255,0.25)":"1px solid rgba(255,255,255,0.25)",
      boxShadow:size>=60?"0 4px 18px rgba(0,0,0,0.55)":"0 2px 6px rgba(0,0,0,0.4)",
      display:"block",flexShrink:0,
    }}/>
  );
}

// Wrap inner menus in the same NBA-Live-2003 aesthetic as the home screen — orange
// basketball gradient background, chrome arc on the left, content in a chrome-bordered
// panel with an orange left accent. Used for all the setup/menu screens between gameplay.
function MenuFrame({children,sub,title,hint,showLogo=false}){
  return(
    <div style={{position:"relative",minHeight:"calc(100vh - 60px)",margin:"-16px -16px 0",overflow:"hidden"}}>
      {/* Orange basketball gradient background */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 70% 35%, #b8682c 0%, #8d4a18 40%, #4a230a 75%, #1a0a04 100%)"}}/>
      {/* Faint repeating watermark across top */}
      <div style={{position:"absolute",top:8,left:0,right:0,fontSize:18,fontWeight:900,letterSpacing:5,color:"rgba(255,255,255,0.04)",whiteSpace:"nowrap",overflow:"hidden",textAlign:"center",pointerEvents:"none"}}>
        GOODEN&nbsp;2003 · GOODEN&nbsp;2003
      </div>
      {/* Chrome arc on the left (smaller than home menu) */}
      <svg width="100%" height="100%" viewBox="0 0 430 700" preserveAspectRatio="none" style={{position:"absolute",inset:0,pointerEvents:"none",opacity:0.65}}>
        <defs>
          <linearGradient id="mfChrome" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5a5d63"/>
            <stop offset="35%" stopColor="#d8dadd"/>
            <stop offset="55%" stopColor="#f5f6f7"/>
            <stop offset="75%" stopColor="#a1a4a9"/>
            <stop offset="100%" stopColor="#3d4046"/>
          </linearGradient>
        </defs>
        <path d="M -100 0 Q 40 350 -100 700 L -200 700 L -200 0 Z" fill="url(#mfChrome)"/>
        <path d="M -15 0 Q 70 350 -15 700" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
      </svg>

      {/* Optional logo top-right (used for important screens; home menu has its own treatment) */}
      {showLogo&&(
        <div style={{position:"absolute",top:18,right:18,zIndex:3}}>
          <Logo size={56}/>
        </div>
      )}

      {/* Content panel */}
      <div style={{position:"relative",zIndex:2,padding:"24px 18px 90px 22px"}}>
        {(sub||title)&&(
          <div style={{marginBottom:14,marginLeft:6}}>
            {sub&&<div style={{fontSize:10,letterSpacing:4,textTransform:"uppercase",color:YE,marginBottom:3,textShadow:"0 1px 2px rgba(0,0,0,0.6)"}}>{sub}</div>}
            {title&&<div style={{fontSize:26,fontWeight:900,lineHeight:1.05,color:"#fff",textShadow:"0 2px 4px rgba(0,0,0,0.7)",letterSpacing:0.5}}>{title}</div>}
          </div>
        )}
        <div style={{
          background:"linear-gradient(135deg, rgba(120,55,20,0.85) 0%, rgba(40,18,6,0.94) 100%)",
          border:"1px solid rgba(255,255,255,0.08)",
          borderLeft:"3px solid "+OR,
          borderRadius:"4px 18px 18px 4px",
          padding:"16px 14px 18px 12px",
          boxShadow:"0 6px 20px rgba(0,0,0,0.45)",
        }}>
          {children}
        </div>
        {hint&&<div style={{marginTop:14,paddingLeft:8,fontSize:10,color:"rgba(255,255,255,0.45)",letterSpacing:1,fontStyle:"italic"}}>{hint}</div>}
      </div>
    </div>
  );
}

function NotifBar({notif}){
  if(!notif) return null;
  const light=notif.color===GO||notif.color===OR||notif.color===GR;
  return <div style={{position:"fixed",top:56,left:"50%",transform:"translateX(-50%)",background:notif.color,color:light?"#080c10":"white",padding:"9px 20px",borderRadius:8,fontWeight:700,fontSize:13,zIndex:200,whiteSpace:"nowrap",boxShadow:"0 4px 16px rgba(0,0,0,0.5)",fontFamily:"'Barlow Condensed',sans-serif"}}>{notif.msg}</div>;
}

// ─── PLAYER AVATAR ────────────────────────────────────────────────────────────
function PlayerAvatar({app, size=80}){
  // If a photo was uploaded, show that instead of the SVG portrait
  if(app?.photo){
    return <img src={app.photo} alt="player" style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(232,135,58,0.4)",display:"block"}}/>;
  }
  const {skin="#C68642",hair="Low Cut",beard="Stubble",headband="None",headbandColor="Red",jersey="white",jerseyNumber=23}=app||{};
  const s=size; const hbColors={White:"#eee",Black:"#222",Red:"#c0392b",Blue:"#2980b9",Gold:"#f1c40f"};
  // Hair colors with shading
  const hairDark="#1a0a00"; const hairMid="#2a1505"; const hairLight="#3a2510";
  // unique gradient id per render to avoid collisions when multiple avatars share a page
  const gid=`av${Math.round(Math.random()*1e6)}`;
  return(
    <svg width={s} height={s} viewBox="0 0 100 100">
      <defs>
        <radialGradient id={`${gid}skin`} cx="0.4" cy="0.35">
          <stop offset="0" stopColor="rgba(255,255,255,0.18)"/>
          <stop offset="1" stopColor="rgba(0,0,0,0)"/>
        </radialGradient>
        <radialGradient id={`${gid}hair`} cx="0.4" cy="0.3">
          <stop offset="0" stopColor={hairLight}/>
          <stop offset="0.6" stopColor={hairMid}/>
          <stop offset="1" stopColor={hairDark}/>
        </radialGradient>
      </defs>
      {/* Body */}
      <ellipse cx="50" cy="88" rx="28" ry="16" fill={jersey==="white"?"#f0f0f0":"#1a3a6b"}/>
      {/* Neck */}
      <path d="M 44 62 L 44 76 Q 50 78 56 76 L 56 62 Z" fill={skin}/>
      <path d="M 44 70 Q 50 73 56 70 L 56 76 Q 50 78 44 76 Z" fill="rgba(0,0,0,0.18)"/>
      {/* DREADS — rope ropes drawn BEFORE the head so the head silhouette
          hides the center ropes; only the parts that extend past the head are
          visible from the front. Scalp cap is drawn later on top of the head. */}
      {hair==="Dreads"&&<g>
        {/* Each dread is a tapered rope with a top anchor inside the head's
            silhouette (hidden behind the head ellipse / scalp cap) and a
            bottom that hangs past the head. The outer dreads sweep diagonally
            outward so they appear to hang past the head's sides naturally,
            rather than being parallel bars next to the head. */}
        {[
          // {topX, topY, botX, botY, topW, botW} — top anchors are within head (x:28-72)
          {topX:34, topY:41, botX:23, botY:84, topW:3.4, botW:2.5}, // far left, sweeps left
          {topX:40, topY:36, botX:33, botY:90, topW:3.7, botW:2.8}, // mid-left
          {topX:46, topY:33, botX:44, botY:91, topW:3.8, botW:2.9}, // front-left
          {topX:54, topY:33, botX:56, botY:91, topW:3.8, botW:2.9}, // front-right
          {topX:60, topY:36, botX:67, botY:90, topW:3.7, botW:2.8}, // mid-right
          {topX:66, topY:41, botX:77, botY:84, topW:3.4, botW:2.5}, // far right, sweeps right
        ].map((d,i)=>{
          const topHalf=d.topW/2;
          const botHalf=d.botW/2;
          const tipW=botHalf*0.75;
          const length=d.botY-d.topY;
          const segCount=Math.floor(length/4);
          return(
            <g key={i}>
              <path d={`
                M ${d.topX-topHalf} ${d.topY}
                L ${d.botX-tipW} ${d.botY-1}
                Q ${d.botX} ${d.botY+1.4} ${d.botX+tipW} ${d.botY-1}
                L ${d.topX+topHalf} ${d.topY}
                Z`}
                fill={i%2===0?hairMid:hairDark}/>
              {/* Segment texture — interpolated along the rope */}
              {Array.from({length:segCount}).map((_,j)=>{
                const t=(3+j*4)/length;
                const segX=d.topX+(d.botX-d.topX)*t;
                const segY=d.topY+(d.botY-d.topY)*t;
                const halfAt=topHalf+(botHalf-topHalf)*t;
                return(
                  <ellipse key={j}
                    cx={segX} cy={segY}
                    rx={halfAt-0.3} ry="0.7"
                    fill={hairDark} opacity="0.55"/>
                );
              })}
              {/* Center highlight along rope */}
              <line x1={d.topX} y1={d.topY+1} x2={d.botX} y2={d.botY-1}
                    stroke={hairLight} strokeWidth="0.5" opacity="0.4"/>
            </g>
          );
        })}
      </g>}
      {/* Head */}
      <ellipse cx="50" cy="52" rx="22" ry="24" fill={skin}/>
      {/* Skin highlight */}
      <ellipse cx="50" cy="52" rx="22" ry="24" fill={`url(#${gid}skin)`}/>

      {/* Hair — drawn BEFORE the headband so headband sits on top.
          Each style takes care to: (a) match the head silhouette properly,
          (b) include internal texture detail, (c) feel like its real-world
          counterpart at small sizes. */}

      {hair==="Afro"&&<g>
        {/* AFRO — voluminous rounded silhouette extending past head ellipse.
            Built from a base mass + clustered texture spheres around the perimeter. */}
        {/* Base mass — taller and wider than the head */}
        <path d="M 22 38 Q 18 26 28 18 Q 36 8 50 8 Q 64 8 72 18 Q 82 26 78 38 Q 78 44 72 44 Q 50 38 28 44 Q 22 44 22 38 Z"
              fill={`url(#${gid}hair)`}/>
        {/* Texture cluster spheres — sit on top of the base, give the curly bunched look */}
        <circle cx="28" cy="24" r="6" fill={hairDark}/>
        <circle cx="34" cy="16" r="6.5" fill={hairMid}/>
        <circle cx="44" cy="12" r="7" fill={hairDark}/>
        <circle cx="56" cy="12" r="7" fill={hairMid}/>
        <circle cx="66" cy="16" r="6.5" fill={hairDark}/>
        <circle cx="72" cy="24" r="6" fill={hairMid}/>
        <circle cx="76" cy="34" r="4.5" fill={hairDark}/>
        <circle cx="24" cy="34" r="4.5" fill={hairDark}/>
        <circle cx="38" cy="22" r="4" fill={hairLight}/>
        <circle cx="52" cy="20" r="4" fill={hairLight}/>
        <circle cx="62" cy="22" r="4" fill={hairLight}/>
        {/* Top highlight */}
        <ellipse cx="46" cy="16" rx="11" ry="3" fill="rgba(255,255,255,0.14)"/>
      </g>}

      {hair==="Dreads"&&<g>
        {/* DREADS scalp cap — drawn ON TOP of the head so the dreads have a
            clear root. The hanging rope ropes themselves are drawn earlier
            (before the head ellipse) so the face stays unobstructed. */}
        <path d="M 28 40 Q 26 24 50 20 Q 74 24 72 40 L 68 41 Q 50 36 32 41 Z"
              fill={hairDark}/>
        {/* Top-of-head highlight */}
        <ellipse cx="50" cy="25" rx="14" ry="3" fill={hairMid} opacity="0.7"/>
      </g>}

      {hair==="Fade"&&<g>
        {/* FADE — sharp top section that's clearly visible hair, sides that
            taper to skin (no hair on sides). Distinct hairline. */}
        {/* Top hair mass — short on sides, taller in middle */}
        <path d="M 32 40 L 32 36 Q 30 24 38 20 Q 50 16 62 20 Q 70 24 68 36 L 68 40 Z"
              fill={`url(#${gid}hair)`}/>
        {/* Texture darkness on top */}
        <path d="M 34 38 Q 32 26 40 22 Q 50 18 60 22 Q 68 26 66 38 Q 60 34 50 34 Q 40 34 34 38 Z"
              fill={hairDark}/>
        {/* Subtle texture dots showing short-cropped hair */}
        {[
          [40,28],[46,24],[52,24],[58,28],[44,32],[50,30],[56,32],
        ].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="0.7" fill={hairLight} opacity="0.5"/>
        ))}
        {/* Hairline edge — sharp line across forehead */}
        <path d="M 32 40 Q 50 38 68 40"
              stroke={hairDark} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        {/* Side temple lineup — sharp angles */}
        <line x1="30" y1="40" x2="28" y2="46" stroke={hairDark} strokeWidth="0.8"/>
        <line x1="70" y1="40" x2="72" y2="46" stroke={hairDark} strokeWidth="0.8"/>
        {/* Faint shadow on the temple where the fade tapers */}
        <ellipse cx="30" cy="48" rx="3" ry="6" fill="rgba(0,0,0,0.12)"/>
        <ellipse cx="70" cy="48" rx="3" ry="6" fill="rgba(0,0,0,0.12)"/>
      </g>}

      {hair==="Low Cut"&&<g>
        {/* LOW CUT / CAESAR — even short coverage following head shape closely,
            with subtle texture suggesting short hair. Sharp clean hairline. */}
        {/* Hair cap following head curve */}
        <path d="M 28 42 Q 26 28 36 22 Q 50 18 64 22 Q 74 28 72 42 L 70 42 Q 60 38 50 38 Q 40 38 30 42 Z"
              fill={`url(#${gid}hair)`}/>
        {/* Even texture — subtle dots throughout */}
        {Array.from({length:18}).map((_,i)=>{
          const x=32+(i%6)*7;
          const y=28+Math.floor(i/6)*5;
          return <circle key={i} cx={x} cy={y} r="0.6" fill={hairDark} opacity="0.55"/>;
        })}
        {/* Hairline arc — distinct */}
        <path d="M 28 42 Q 50 39 72 42" stroke={hairDark} strokeWidth="1" fill="none"/>
        {/* Highlight band on the very top */}
        <path d="M 38 22 Q 50 19 62 22" stroke={hairLight} strokeWidth="0.7" fill="none" opacity="0.6"/>
      </g>}

      {hair==="Braids"&&<g>
        {/* CORNROWS / BRAIDS — distinct rows running front-to-back across the scalp.
            Each row has a series of "beads" suggesting the plaited segments.
            Tight to the head — no volume. */}
        {/* Dark scalp showing between rows */}
        <path d="M 28 42 Q 26 28 36 22 Q 50 18 64 22 Q 74 28 72 42 L 70 42 Q 60 38 50 38 Q 40 38 30 42 Z"
              fill={hairDark}/>
        {/* Braid rows — 7 narrow rows arching front-to-back */}
        {[
          {y:22,w:1.8},
          {y:24,w:2.0},
          {y:26,w:2.0},
          {y:28,w:2.1},
          {y:30,w:2.1},
          {y:32,w:2.0},
          {y:34,w:1.8},
        ].map((row,i)=>{
          // Position rows side-by-side across the scalp width
          const xPositions=[34,40,46,50,54,60,66];
          const xs=[xPositions[i]];
          return null; // disable per-row, use the grid approach below
        })}
        {/* Better approach: 6 braid rows running side-by-side. Each row is a curved
            line with bead marks down its length, suggesting plaited texture. */}
        {[33,41,49,57,65].map((x,rowIdx)=>{
          // Each braid is a sequence of small ovals from the hairline back over the crown
          return(
            <g key={rowIdx}>
              {/* The braid spine — a slight curve from forehead back */}
              <path d={`M ${x} 38 Q ${x+(rowIdx<2?-0.5:rowIdx>2?0.5:0)} 30 ${x} 22`}
                    stroke={hairMid} strokeWidth="2.6" fill="none" strokeLinecap="round"/>
              {/* Plait segment beads along the braid */}
              {[36,32,28,24].map((y,j)=>(
                <ellipse key={j} cx={x+(j%2===0?0.3:-0.3)} cy={y} rx="1.3" ry="1" fill={hairLight}/>
              ))}
            </g>
          );
        })}
        {/* Hairline edge */}
        <path d="M 28 42 Q 50 39 72 42" stroke={hairDark} strokeWidth="0.8" fill="none"/>
      </g>}

      {/* Headband (sits over hair) */}
      {headband!=="None"&&<g>
        <rect x="28" y="38" width="44" height="9" rx="3" fill={hbColors[headband]||"#c0392b"}/>
        <rect x="28" y="38" width="44" height="2.5" fill="rgba(255,255,255,0.25)"/>
        <rect x="28" y="44" width="44" height="2.5" fill="rgba(0,0,0,0.2)"/>
      </g>}

      {/* Ears */}
      <ellipse cx="28" cy="52" rx="3.5" ry="6" fill={skin}/>
      <ellipse cx="72" cy="52" rx="3.5" ry="6" fill={skin}/>
      <ellipse cx="28" cy="53" rx="1.5" ry="3" fill="rgba(0,0,0,0.2)"/>
      <ellipse cx="72" cy="53" rx="1.5" ry="3" fill="rgba(0,0,0,0.2)"/>

      {/* Eyebrows (under hair, above eyes) */}
      {hair!=="Bald"&&<g>
        <path d="M 38 47 Q 43 45 48 47" stroke={hairDark} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
        <path d="M 52 47 Q 57 45 62 47" stroke={hairDark} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      </g>}

      {/* Eyes */}
      <ellipse cx="43" cy="52" rx="3.5" ry="3" fill="white"/>
      <ellipse cx="57" cy="52" rx="3.5" ry="3" fill="white"/>
      <circle cx="44" cy="52" r="2" fill="#1a0a00"/>
      <circle cx="58" cy="52" r="2" fill="#1a0a00"/>
      <circle cx="44.5" cy="51.5" r="0.6" fill="white"/>
      <circle cx="58.5" cy="51.5" r="0.6" fill="white"/>

      {/* Nose */}
      <path d="M 50 55 Q 47 60 49 64 Q 50 65 51 64 Q 53 60 50 55" fill="rgba(0,0,0,0.12)"/>
      <ellipse cx="48.5" cy="63" rx="1" ry="0.7" fill="rgba(0,0,0,0.2)"/>
      <ellipse cx="51.5" cy="63" rx="1" ry="0.7" fill="rgba(0,0,0,0.2)"/>

      {/* Mouth */}
      <path d="M 44 68 Q 50 71 56 68" stroke="rgba(60,20,20,0.6)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* Beard — drawn AFTER face features */}
      {beard==="Stubble"&&<g>
        {/* Base shadow over the jaw — gives stubble its tone */}
        <path d="M 32 60 Q 50 78 68 60 Q 65 70 50 73 Q 35 70 32 60" fill="rgba(0,0,0,0.18)"/>
        {/* Faint mustache shadow above the lip */}
        <path d="M 41 65 Q 50 67 59 65 Q 56 67 50 67 Q 44 67 41 65" fill="rgba(0,0,0,0.15)"/>
        {/* Dense hex-packed stubble dots, masked to the jaw area and the
            mouth cut out. ~50-70 visible dots gives the look of actual stubble
            rather than the sparse "9 random dots" effect. */}
        {Array.from({length:9}).flatMap((_,row)=>
          Array.from({length:15}).map((_,col)=>{
            const y=60+row*1.5;
            const stagger=(row%2)*1.3;
            const x=31+col*2.6+stagger;
            // Mask: stay within the lower-face oval
            const dx=x-50, dy=y-67;
            if((dx*dx)/(19*19)+(dy*dy)/(7.5*7.5)>1) return null;
            // Cut out the mouth/lip area
            if(y<67 && Math.abs(dx)<7) return null;
            return <circle key={`${row}-${col}`} cx={x} cy={y} r="0.4" fill="rgba(0,0,0,0.55)"/>;
          }).filter(Boolean)
        )}
      </g>}

      {beard==="Goatee"&&<g>
        {/* Mustache */}
        <path d="M 42 66 Q 50 69 58 66 Q 55 68 50 68 Q 45 68 42 66" fill={hairDark}/>
        {/* Soul patch + chin beard */}
        <path d="M 47 70 Q 50 72 53 70 L 53 73 Q 50 74 47 73 Z" fill={hairDark}/>
        <path d="M 44 73 Q 50 78 56 73 Q 53 76 50 76 Q 47 76 44 73" fill={hairDark}/>
      </g>}

      {beard==="Full Beard"&&<g>
        {/* Beard wrapping the jaw */}
        <path d="M 30 58 Q 32 75 50 78 Q 68 75 70 58 Q 70 70 60 73 Q 50 76 40 73 Q 30 70 30 58" fill={`url(#${gid}hair)`}/>
        {/* Mustache */}
        <path d="M 40 65 Q 50 69 60 65 Q 55 67 50 67 Q 45 67 40 65" fill={hairDark}/>
        {/* Texture */}
        <path d="M 38 62 Q 40 70 42 73" stroke={hairMid} strokeWidth="0.4" fill="none"/>
        <path d="M 62 62 Q 60 70 58 73" stroke={hairMid} strokeWidth="0.4" fill="none"/>
        <path d="M 50 73 L 50 76" stroke={hairMid} strokeWidth="0.4" fill="none"/>
      </g>}

      {beard==="Chinstrap"&&<g>
        {/* Thin line tracing the jaw */}
        <path d="M 30 56 Q 32 73 50 76 Q 68 73 70 56" stroke={hairDark} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        {/* Slight thickening at chin */}
        <ellipse cx="50" cy="76" rx="4" ry="1.5" fill={hairDark}/>
      </g>}

      {/* Jersey neckline */}
      <path d="M 38 78 Q 50 84 62 78" stroke={jersey==="white"?"#ccc":"#0f2244"} strokeWidth="1" fill="none"/>
      {/* Jersey number */}
      <text x="50" y="94" textAnchor="middle" fontSize="8" fontWeight="900" fill={jersey==="white"?"#333":"#fff"} fontFamily="sans-serif">{jerseyNumber}</text>
    </svg>
  );
}

// ─── MINI GAMES ───────────────────────────────────────────────────────────────

// Game 1: Shot Meter — 3 attempts, tighter windows
function ShotMeterGame({player, difficulty, onResult}){
  const ACTIONS=[
    {id:"three",label:"Three Pointer",icon:"🎯",skill:"threePoint"},
    {id:"mid",label:"Mid-Range",icon:"📐",skill:"midRange"},
    {id:"finish",label:"Drive & Finish",icon:"🏀",skill:"finishing"},
  ];
  const TOTAL_SHOTS=3;
  const [shotsTaken,setShotsTaken]=useState(0);
  const [shotLog,setShotLog]=useState([]); // [{type:"three", made, perfect, pts}]
  const [phase,setPhase]=useState("pick"); // pick | time | res | done
  const [action,setAction]=useState(null);
  const [barX,setBarX]=useState(0);
  const [winX,setWinX]=useState(60);
  const [winW,setWinW]=useState(60);
  const [hitRes,setHitRes]=useState(null);
  // Refs that always reflect the latest values — avoid React render-lag for click handlers
  const barXRef=useRef(0);
  const winXRef=useRef(60);
  const winWRef=useRef(60);
  const animRef=useRef(); const t0=useRef(); const BAR=260;

  const pick=(act)=>{
    const sv=player.skills[act.skill]||50;
    const ww=clamp(Math.round((sv*0.45+10)/(difficulty*1.15)),16,62);
    const wx=rand(14,BAR-ww-14);
    setAction(act);setWinX(wx);setWinW(ww);setBarX(0);
    winXRef.current=wx; winWRef.current=ww; barXRef.current=0;
    setPhase("time");t0.current=null;
  };

  useEffect(()=>{
    if(phase!=="time") return;
    const spd=(170+rand(0,40))*difficulty;
    const step=(ts)=>{
      if(!t0.current)t0.current=ts;
      const pos=((ts-t0.current)*spd/1000)%(BAR+20);
      barXRef.current=pos; // ref updates synchronously — used by shoot()
      setBarX(pos);         // state for render
      animRef.current=requestAnimationFrame(step);
    };
    animRef.current=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(animRef.current);
  },[phase]);

  const shoot=()=>{
    if(phase!=="time") return;
    cancelAnimationFrame(animRef.current);
    // Read from refs, not state — state may be one frame behind the actual position
    const cur=barXRef.current; const wx=winXRef.current; const ww=winWRef.current;
    const inW=cur>=wx&&cur<=(wx+ww);
    const perf=Math.abs(cur-(wx+ww/2))<ww*0.18;
    // 3PT worth more, mid/finish similar
    const basePts=action.id==="three"?(perf?4:inW?3:0):(perf?3:inW?2:0);
    const entry={type:action.id,label:action.label,made:inW,perfect:perf,pts:basePts};
    setHitRes(entry);
    const newLog=[...shotLog,entry];
    setShotLog(newLog);
    setShotsTaken(s=>s+1);
    setPhase("res");
    setTimeout(()=>{
      if(newLog.length>=TOTAL_SHOTS){
        const total=newLog.reduce((a,b)=>a+b.pts,0);
        const madeCt=newLog.filter(x=>x.made).length;
        // Average it back into the 0-3 scoring scale the orchestrator expects
        const avgPts=Math.round((total/(TOTAL_SHOTS*3))*3);
        onResult({type:"shot",made:madeCt>=2,pts:clamp(avgPts,0,3),detail:newLog,madeCt,total});
      } else {
        setPhase("pick");setHitRes(null);setAction(null);
      }
    },1100);
  };

  const ProgressDots=()=>(
    <div style={{display:"flex",justifyContent:"center",gap:7,marginBottom:10}}>
      {Array.from({length:TOTAL_SHOTS}).map((_,i)=>{
        const s=shotLog[i];
        const bg=!s?"rgba(255,255,255,0.12)":s.made?(s.perfect?GO:GR):RE;
        return <div key={i} style={{width:22,height:6,borderRadius:3,background:bg}}/>;
      })}
    </div>
  );

  if(phase==="pick") return(
    <div>
      <ProgressDots/>
      <div style={{fontSize:11,color:"#888",marginBottom:10,textAlign:"center"}}>🏀 SHOT {shotsTaken+1} of {TOTAL_SHOTS} — Pick your shot</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {ACTIONS.map(a=>(
          <button key={a.id} onClick={()=>pick(a)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"12px 6px",color:"#f0ede8",cursor:"pointer",textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif"}}>
            <div style={{fontSize:22,marginBottom:3}}>{a.icon}</div>
            <div style={{fontSize:11,fontWeight:700}}>{a.label}</div>
            <div style={{fontSize:10,color:OR,marginTop:2}}>{player.skills[a.skill]||50}</div>
          </button>
        ))}
      </div>
    </div>
  );

  if(phase==="time") return(
    <div style={{textAlign:"center"}}>
      <ProgressDots/>
      <div style={{fontSize:12,fontWeight:700,color:OR,marginBottom:3}}>🏀 {action.label}</div>
      <div style={{fontSize:11,color:"#888",marginBottom:12}}>Tap SHOOT when bar hits green!</div>
      <div onPointerDown={(e)=>{e.preventDefault();shoot();}} style={{position:"relative",width:BAR,height:40,background:"rgba(255,255,255,0.06)",borderRadius:20,margin:"0 auto 12px",overflow:"hidden",cursor:"pointer",touchAction:"none"}}>
        <div style={{position:"absolute",left:winX,top:0,width:winW,height:"100%",background:"rgba(0,220,100,0.2)",borderLeft:"2px solid "+GR,borderRight:"2px solid "+GR}}/>
        <div style={{position:"absolute",left:winX+winW*0.4,top:0,width:winW*0.2,height:"100%",background:"rgba(255,215,0,0.45)"}}/>
        <div style={{position:"absolute",left:barX,top:6,width:9,height:28,background:"white",borderRadius:5,boxShadow:"0 0 10px white"}}/>
      </div>
      <button onPointerDown={(e)=>{e.preventDefault();e.stopPropagation();shoot();}} style={{...btnS,width:"auto",padding:"10px 40px",fontSize:15,touchAction:"none"}}>SHOOT</button>
    </div>
  );

  // phase === "res"
  return(
    <div style={{textAlign:"center",padding:"12px 0"}}>
      <ProgressDots/>
      <div style={{fontSize:44,marginBottom:4}}>{hitRes?.made?(hitRes.perfect?"🔥":"🏀"):"😤"}</div>
      <div style={{fontSize:20,fontWeight:900,color:hitRes?.made?GR:RE}}>
        {hitRes?.perfect?`SWISH! +${hitRes.pts}`:hitRes?.made?`GOOD! +${hitRes.pts}`:"MISSED"}
      </div>
      {shotLog.length>=TOTAL_SHOTS&&(
        <div style={{fontSize:12,color:"#888",marginTop:8}}>{shotLog.filter(x=>x.made).length}/{TOTAL_SHOTS} made · {shotLog.reduce((a,b)=>a+b.pts,0)} total pts</div>
      )}
    </div>
  );
}

// Game 2: Defense — stay between player and basket
function DefenseGame({player, difficulty, onResult}){
  const [phase,setPhase]=useState("intro");
  const [playerX,setPlayerX]=useState(50);
  const [offX,setOffX]=useState(50);
  const [timeLeft,setTimeLeft]=useState(0);
  const [score,setScore]=useState(0);
  const [success,setSuccess]=useState(false);
  const frameRef=useRef(); const lastRef=useRef();
  const DURATION=Math.round(4500/difficulty); // harder = longer hold time
  const TOLERANCE=22; // a touch more forgiving

  const start=()=>{
    setPhase("play");setPlayerX(50);setOffX(50);setScore(0);
    setTimeLeft(DURATION);lastRef.current=null;
  };

  useEffect(()=>{
    if(phase!=="play") return;
    // Random-direction ball movement. Instead of a deterministic side-to-side
    // bounce, the offensive player can change direction at any moment — like
    // a real ball-handler shifting direction with a hesitation or crossover.
    // We do this by tracking a velocity that drifts and occasionally flips
    // direction at random intervals (with a higher chance of changing when
    // the ball is far from the walls).
    let offVel=(rand(0,1)?1:-1)*(0.55+rand(0,5)/10)*(0.85+difficulty*0.4);
    let nextDirChangeAt=performance.now()+rand(250,900);
    const step=(ts)=>{
      if(!lastRef.current) lastRef.current=ts;
      const dt=ts-lastRef.current; lastRef.current=ts;
      // Time to randomly change direction? Speed and timing both reroll.
      if(ts>=nextDirChangeAt){
        // 70% chance of a direction flip, 30% chance of just a speed change
        // (so the ball can also speed up / slow down mid-motion).
        if(rand(0,10)<7) offVel=-offVel;
        // Speed varies between 50%-100% of the difficulty-scaled base.
        const baseSpd=(0.55+rand(0,5)/10)*(0.85+difficulty*0.4);
        offVel=(offVel>=0?1:-1)*baseSpd*(0.5+rand(0,5)/10);
        // Next direction change in 250-900ms — random rhythm makes it feel
        // less predictable than a metronome.
        nextDirChangeAt=ts+rand(250,900);
      }
      setOffX(prev=>{
        let nx=prev+offVel*(dt/16);
        // Bounce off the edges — and force a direction change schedule reset
        // so it doesn't just hug the wall after rebounding.
        if(nx>88||nx<12){
          offVel=-offVel;
          nx=clamp(nx,12,88);
          nextDirChangeAt=ts+rand(250,900);
        }
        return nx;
      });
      setTimeLeft(prev=>{
        const nt=prev-dt;
        if(nt<=0){setPhase("done");setSuccess(true);return 0;}
        return nt;
      });
      frameRef.current=requestAnimationFrame(step);
    };
    frameRef.current=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(frameRef.current);
  },[phase]);

  useEffect(()=>{
    if(phase!=="play") return;
    const dist=Math.abs(playerX-offX);
    if(dist<TOLERANCE) setScore(s=>Math.min(s+1,100));
    if(dist>42){setPhase("done");setSuccess(false);} // also more forgiving threshold
  },[offX,playerX]);

  useEffect(()=>{
    if(phase==="done"){
      const pts=success?3:score>50?1:0;
      setTimeout(()=>onResult({type:"defense",made:success||score>50,pts}),800);
    }
  },[phase]);

  const move=(dir)=>setPlayerX(p=>clamp(p+dir*12,5,95));

  if(phase==="intro") return(
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:11,color:"#888",marginBottom:8}}>🛡️ DEFENSE — Stay between the ball and the basket</div>
      <div style={{fontSize:12,color:"#aaa",marginBottom:4}}>The orange dot is your man. Keep the blue dot (you) between him and the basket.</div>
      <div style={{fontSize:11,color:"#555",marginBottom:14}}>Hold for {(DURATION/1000).toFixed(1)}s to stop the play</div>
      <button onClick={start} style={{...btnS,width:"auto",padding:"10px 32px"}}>START</button>
    </div>
  );

  if(phase==="play"){
    const pct=timeLeft/DURATION;
    return(
      <div>
        <div style={{fontSize:11,color:"#888",textAlign:"center",marginBottom:8}}>Stay on your man!</div>
        <div style={{position:"relative",height:100,background:"rgba(255,255,255,0.04)",borderRadius:10,marginBottom:10,overflow:"hidden"}}>
          {/* Basket indicator */}
          <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:30,height:8,background:"rgba(255,100,0,0.4)",borderRadius:"4px 4px 0 0"}}/>
          <div style={{fontSize:10,color:"#555",position:"absolute",bottom:2,left:"50%",transform:"translateX(-50%)"}}>BASKET</div>
          {/* Offensive player */}
          <div style={{position:"absolute",top:10,left:`${offX}%`,transform:"translateX(-50%)",width:28,height:28,borderRadius:"50%",background:OR,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🏀</div>
          {/* Defender (player) */}
          <div style={{position:"absolute",top:50,left:`${playerX}%`,transform:"translateX(-50%)",width:28,height:28,borderRadius:"50%",background:BL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🛡️</div>
        </div>
        {/* Timer bar */}
        <div style={{height:6,background:"rgba(255,255,255,0.08)",borderRadius:3,marginBottom:10}}>
          <div style={{width:`${pct*100}%`,height:"100%",background:pct>0.5?GR:pct>0.25?OR:RE,borderRadius:3,transition:"width 0.1s"}}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onPointerDown={()=>move(-1)} style={{flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",color:"white",padding:"16px 0",borderRadius:10,cursor:"pointer",fontSize:22,fontFamily:"'Barlow Condensed',sans-serif",userSelect:"none"}}>◀</button>
          <button onPointerDown={()=>move(1)} style={{flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",color:"white",padding:"16px 0",borderRadius:10,cursor:"pointer",fontSize:22,fontFamily:"'Barlow Condensed',sans-serif",userSelect:"none"}}>▶</button>
        </div>
      </div>
    );
  }

  return(<div style={{textAlign:"center",padding:"12px 0"}}><div style={{fontSize:44,marginBottom:4}}>{success?"🛡️":"💨"}</div><div style={{fontSize:20,fontWeight:900,color:success?GR:RE}}>{success?"LOCKED UP! +3":score>50?"HELD GROUND +1":"BEAT OFF DRIBBLE"}</div></div>);
}

// Game 3 (REMOVED): Sequence Memory — scrapped per design pass


// Game 4: Steal → Sprint → Dunk
function StealAndDunkGame({player, difficulty, onResult}){
  const [phase,setPhase]=useState("intro");
  const [passX,setPassX]=useState(50);
  const passDirRef=useRef(1); // ref so the animation closure always reads the latest direction
  const [taps,setTaps]=useState(0);
  const [meterVal,setMeterVal]=useState(0);
  const [meterDir,setMeterDir]=useState(1);
  const [meterHeld,setMeterHeld]=useState(false);
  const [result,setResult]=useState(null);
  const [stealWindow,setStealWindow]=useState({x:0,w:30});
  const animRef=useRef(); const t0=useRef();
  const TAP_TARGET=Math.max(5,Math.round(5*difficulty));
  // Pass speed and steal-window width — both eased from prior values. The
  // previous tuning (290 base, 30/difficulty width) made 5-star prospects
  // need near-superhuman reflexes; this keeps it challenging but reachable.
  const PASS_SPD=220*difficulty;

  const startPass=()=>{
    setPhase("steal");
    // Wider window: 38 base for 3-star, ~25 for 5-star. Capped 18-44 so neither
    // extreme is impossible nor trivial.
    const w=clamp(Math.round(38/difficulty),18,44);
    setStealWindow({x:rand(10,60),w});
    passDirRef.current=1;
    setPassX(15);
    t0.current=null;
  };

  useEffect(()=>{
    if(phase!=="steal") return;
    const step=(ts)=>{
      if(!t0.current)t0.current=ts;
      const dt=ts-t0.current;t0.current=ts;
      setPassX(p=>{
        let nx=p+passDirRef.current*dt*PASS_SPD/5000;
        if(nx>=90){passDirRef.current=-1;nx=90;}
        else if(nx<=10){passDirRef.current=1;nx=10;}
        return nx;
      });
      animRef.current=requestAnimationFrame(step);
    };
    animRef.current=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(animRef.current);
  },[phase]);

  const swipe=()=>{
    if(phase!=="steal") return;
    cancelAnimationFrame(animRef.current);
    const hit=passX>=stealWindow.x&&passX<=(stealWindow.x+stealWindow.w);
    if(hit){setPhase("sprint");setTaps(0);}
    else{setResult({made:false,pts:0});setPhase("done");setTimeout(()=>onResult({type:"steal",made:false,pts:0}),800);}
  };

  const tap=()=>{
    if(phase!=="sprint") return;
    const next=taps+1;setTaps(next);
    if(next>=TAP_TARGET){setPhase("dunk");setMeterVal(0);setMeterDir(1);}
  };

  useEffect(()=>{
    if(phase!=="dunk") return;
    // Meter speed scales with difficulty — higher star tiers get a faster
    // oscillating meter, making the sweet spot harder to time. Eased from
    // the previous (2 + difficulty*2.2) so 5-star isn't punishing.
    const meterSpeed=1.8+difficulty*1.5;
    const step=()=>{setMeterVal(p=>{const n=p+meterDir*meterSpeed;if(n>=100||n<=0)setMeterDir(d=>-d);return clamp(n,0,100);});animRef.current=requestAnimationFrame(step);};
    animRef.current=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(animRef.current);
  },[phase,meterDir]);

  const holdDunk=()=>{
    if(phase!=="dunk") return;
    cancelAnimationFrame(animRef.current);
    // Dunk sweet spot tightens with difficulty so 5-star prospects need
    // sharper timing, but kept generous enough to be fair: 3-star gets a
    // 24-unit perfect window centered on 80, 5-star gets ~16 units.
    const perfectHalf=Math.max(8,Math.round(12/difficulty));
    const goodHalf=Math.max(18,Math.round(26/difficulty));
    const perfect=meterVal>=(80-perfectHalf)&&meterVal<=(80+perfectHalf);
    const good=meterVal>=(80-goodHalf)&&meterVal<=(80+goodHalf);
    const pts=perfect?3:good?2:0;
    setResult({made:good,pts,perfect});
    setPhase("done");
    setTimeout(()=>onResult({type:"steal",made:good,pts}),800);
  };

  if(phase==="intro") return(
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:11,color:"#888",marginBottom:8}}>✋ STEAL & DUNK — Read the pass, sprint, finish</div>
      <div style={{fontSize:12,color:"#aaa",lineHeight:1.5,marginBottom:14}}>1. Swipe when the pass (🏀) enters the zone<br/>2. Tap fast to sprint down court<br/>3. Hold the dunk meter in the sweet spot</div>
      <button onClick={startPass} style={{...btnS,width:"auto",padding:"10px 32px"}}>READ THE PASS</button>
    </div>
  );

  if(phase==="steal") return(
    <div>
      <div style={{fontSize:11,color:"#888",textAlign:"center",marginBottom:8}}>✋ Swipe when 🏀 enters the blue zone!</div>
      <div style={{position:"relative",height:60,background:"rgba(255,255,255,0.04)",borderRadius:10,marginBottom:12,overflow:"hidden"}}>
        <div style={{position:"absolute",left:`${stealWindow.x}%`,top:0,width:`${stealWindow.w}%`,height:"100%",background:"rgba(74,168,255,0.2)",border:`2px solid ${BL}`}}/>
        <div style={{position:"absolute",top:"50%",left:`${passX}%`,transform:"translate(-50%,-50%)",fontSize:22}}>🏀</div>
      </div>
      <button onClick={swipe} style={{...btnS,background:BL,color:"#080c10",fontSize:17}}>SWIPE / STEAL</button>
    </div>
  );

  if(phase==="sprint") return(
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:11,color:"#888",marginBottom:8}}>💨 SPRINT — Tap as fast as you can!</div>
      <div style={{height:16,background:"rgba(255,255,255,0.08)",borderRadius:8,marginBottom:16}}>
        <div style={{width:`${(taps/TAP_TARGET)*100}%`,height:"100%",background:GR,borderRadius:8,transition:"width 0.05s"}}/>
      </div>
      <button onPointerDown={tap} style={{...btnS,padding:"24px 0",fontSize:20,background:GR,color:"#080c10",userSelect:"none"}}>TAP! ({taps}/{TAP_TARGET})</button>
    </div>
  );

  if(phase==="dunk") return(
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:11,color:"#888",marginBottom:8}}>🏀 DUNK — Hold when meter is in the zone!</div>
      <div style={{position:"relative",height:40,background:"rgba(255,255,255,0.06)",borderRadius:20,marginBottom:4,overflow:"hidden"}}>
        <div style={{position:"absolute",left:"70%",top:0,width:"20%",height:"100%",background:"rgba(0,220,100,0.25)",border:`2px solid ${GR}`}}/>
        <div style={{position:"absolute",top:"50%",left:`${meterVal}%`,transform:"translate(-50%,-50%)",width:16,height:16,borderRadius:"50%",background:"white",boxShadow:"0 0 8px white"}}/>
      </div>
      <div style={{fontSize:10,color:"#555",marginBottom:12}}>Sweet spot: 70-90%</div>
      <button onPointerDown={holdDunk} style={{...btnS,padding:"20px 0",fontSize:18,background:OR,userSelect:"none"}}>HOLD TO DUNK!</button>
    </div>
  );

  return(<div style={{textAlign:"center",padding:"12px 0"}}><div style={{fontSize:44,marginBottom:4}}>{result?.made?"🏆":"😤"}</div><div style={{fontSize:20,fontWeight:900,color:result?.made?GR:RE}}>{result?.perfect?"POSTER DUNK! +3":result?.made?"THREW IT DOWN! +2":"MISSED THE TIMING"}</div></div>);
}

// Game 5: Passing Decision
function PassingGame({player, difficulty, onResult}){
  const PLAYERS=[
    {id:0,label:"Corner Three",pos:{x:8,y:70},icon:"🎯"},
    {id:1,label:"Post Up",pos:{x:50,y:85},icon:"💪"},
    {id:2,label:"Cutter",pos:{x:85,y:40},icon:"🏃"},
    {id:3,label:"Pop Out",pos:{x:20,y:25},icon:"📐"},
  ];
  const [phase,setPhase]=useState("intro");
  const [open,setOpen]=useState(null);
  const [chosen,setChosen]=useState(null);
  const [timeLeft,setTimeLeft]=useState(0);
  const timerRef=useRef();
  const DECISION_TIME=Math.round(3000/difficulty);

  const startPlay=()=>{
    const openIdx=rand(0,3);
    setOpen(openIdx);setChosen(null);setTimeLeft(DECISION_TIME);
    setPhase("decide");
    timerRef.current=setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=100){clearInterval(timerRef.current);setPhase("done");setTimeout(()=>onResult({type:"pass",made:false,pts:0}),600);return 0;}
        return t-100;
      });
    },100);
  };

  const choose=(id)=>{
    clearInterval(timerRef.current);
    setChosen(id);
    const correct=id===open;
    setPhase("done");
    setTimeout(()=>onResult({type:"pass",made:correct,pts:correct?3:0}),700);
  };

  if(phase==="intro") return(
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:11,color:"#888",marginBottom:8}}>📡 PASSING — Find the open man</div>
      <div style={{fontSize:12,color:"#aaa",lineHeight:1.5,marginBottom:14}}>One player will be open. Read the defense and make the right pass before the shot clock runs down!</div>
      <button onClick={startPlay} style={{...btnS,width:"auto",padding:"10px 32px"}}>READ THE PLAY</button>
    </div>
  );

  if(phase==="decide"){
    const pct=timeLeft/DECISION_TIME;
    return(
      <div>
        <div style={{height:6,background:"rgba(255,255,255,0.08)",borderRadius:3,marginBottom:8}}>
          <div style={{width:`${pct*100}%`,height:"100%",background:pct>0.5?GR:pct>0.25?OR:RE,borderRadius:3}}/>
        </div>
        <div style={{position:"relative",height:140,background:"rgba(255,255,255,0.04)",borderRadius:10,marginBottom:10,overflow:"hidden"}}>
          <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:40,height:12,background:"rgba(255,100,0,0.3)",borderRadius:"4px 4px 0 0",fontSize:8,color:"#888",display:"flex",alignItems:"center",justifyContent:"center"}}>PAINT</div>
          {/* Ball handler (you) */}
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:28,height:28,borderRadius:"50%",background:BL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🏀</div>
          {PLAYERS.map(p=>{
            const isOpen=p.id===open;
            return(
              <div key={p.id} style={{position:"absolute",left:`${p.pos.x}%`,top:`${p.pos.y}%`,transform:"translate(-50%,-50%)",textAlign:"center"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:isOpen?"rgba(0,220,100,0.3)":"rgba(255,0,0,0.2)",border:`2px solid ${isOpen?GR:RE}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{p.icon}</div>
                {/* Defender dot */}
                {!isOpen&&<div style={{width:10,height:10,borderRadius:"50%",background:RE,position:"absolute",top:-4,right:-4}}/>}
              </div>
            );
          })}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {PLAYERS.map(p=>(
            <button key={p.id} onClick={()=>choose(p.id)} style={{padding:"10px 8px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#f0ede8",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const correct=chosen===open;
  return(<div style={{textAlign:"center",padding:"12px 0"}}><div style={{fontSize:44,marginBottom:4}}>{correct?"🎯":"🚫"}</div><div style={{fontSize:20,fontWeight:900,color:correct?GR:RE}}>{correct?"RIGHT PASS! +3":chosen===null?"SHOT CLOCK! NO PTS":"WRONG READ"}</div></div>);
}

// Game 6: Offensive Possession — pass to teammates, tap-hold the ball to shoot with a meter
function OffensivePossessionGame({player, difficulty, onResult}){
  // Court layout: you start at top-of-key, 4 teammates spaced around the half-court.
  const COURT=[
    {id:0,label:"You",pos:{x:50,y:25},icon:"🫵",skill:"playmaking"},
    {id:1,label:"Corner 3",pos:{x:12,y:78},icon:"🎯",skill:"threePoint"},
    {id:2,label:"Wing",pos:{x:85,y:55},icon:"📐",skill:"midRange"},
    {id:3,label:"Cutter",pos:{x:65,y:88},icon:"🏃",skill:"finishing"},
    {id:4,label:"Post",pos:{x:30,y:85},icon:"💪",skill:"finishing"},
  ];
  const SHOT_CLOCK_MS=Math.round(12000/Math.sqrt(difficulty)); // ~12s easy, ~9.8s hard
  const OPEN_ROTATION_MS=Math.round(1400/difficulty);          // open man swaps faster on harder difficulty
  const [phase,setPhase]=useState("intro"); // intro | play | shooting | result
  const [holderId,setHolderId]=useState(0);
  // holderStatus: "covered" (defender on you) | "open" (clean look — shoot quick!)
  // Visible after a pass lands and on the player starting at id=0.
  const [holderStatus,setHolderStatus]=useState("covered");
  const [clock,setClock]=useState(SHOT_CLOCK_MS);
  const [passing,setPassing]=useState(null); // {from, to, t}
  const [meter,setMeter]=useState(0);
  const meterDir=useRef(1);
  const meterValRef=useRef(0); // ref-based meter for click-handler accuracy (avoids React render lag)
  const [result,setResult]=useState(null);
  const [passCount,setPassCount]=useState(0);
  const tickRef=useRef(); const meterRef=useRef(); const closeTimerRef=useRef(); const passAnimRef=useRef();

  const start=()=>{
    setPhase("play");setHolderId(0);setHolderStatus("covered");
    setClock(SHOT_CLOCK_MS);setMeter(0);setResult(null);setPassCount(0);
    meterDir.current=1;
  };

  // Cleanup any defender-closes timer if the component unmounts mid-play
  useEffect(()=>()=>{if(closeTimerRef.current) clearTimeout(closeTimerRef.current);},[]);

  // Shot clock countdown
  useEffect(()=>{
    if(phase!=="play"&&phase!=="shooting") return;
    let last=performance.now();
    const step=()=>{
      const now=performance.now(); const dt=now-last; last=now;
      setClock(c=>{
        const nc=c-dt;
        if(nc<=0){
          cancelAnimationFrame(tickRef.current);
          setResult({made:false,pts:0,reason:"Shot clock violation"});
          setPhase("result");
          setTimeout(()=>onResult({type:"possession",made:false,pts:0}),900);
          return 0;
        }
        return nc;
      });
      tickRef.current=requestAnimationFrame(step);
    };
    tickRef.current=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(tickRef.current);
  },[phase]);

  // After each pass, briefly mark the new holder as "open" or "covered". The status
  // window shrinks defenders close in, so the player has to shoot quickly or pass again.
  // This effect is triggered from inside passTo() — no constant rotation here anymore.

  // Meter oscillation while shooting (only while finger is held down).
  // Writes meterValRef synchronously so releaseShot() reads the *actual* current
  // position, not a one-frame-stale state value.
  useEffect(()=>{
    if(phase!=="shooting") return;
    meterValRef.current=0;
    // Pass-count multiplier: each pass before the shot increases meter speed,
    // capped at 3 passes (60% boost). This rewards quick decisions — if you
    // pass the ball around hunting for an open look, the shot window shrinks.
    const passBoost=1+Math.min(passCount,3)*0.2;
    const step=()=>{
      setMeter(m=>{
        const n=m+meterDir.current*(0.85+difficulty*0.2)*passBoost;
        let next;
        if(n>=100){meterDir.current=-1;next=100;}
        else if(n<=0){meterDir.current=1;next=0;}
        else next=n;
        meterValRef.current=next; // <- the value releaseShot uses
        return next;
      });
      meterRef.current=requestAnimationFrame(step);
    };
    meterRef.current=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(meterRef.current);
  },[phase]);

  const passTo=(id)=>{
    if(phase!=="play"||id===holderId||passing) return;
    const from=COURT.find(p=>p.id===holderId); const to=COURT.find(p=>p.id===id);
    setPassing({from,to,t:0});
    setPassCount(c=>c+1);
    // Clear any "defender closing" timer from the previous holder
    if(closeTimerRef.current){clearTimeout(closeTimerRef.current);closeTimerRef.current=null;}
    // Animate pass over ~350ms — at the end, reveal whether the new holder is open
    const start=performance.now();
    const animate=()=>{
      const t=(performance.now()-start)/350;
      if(t>=1){
        setHolderId(id);
        setPassing(null);
        // Reveal open/covered status. Bias toward open so the game feels rewarding,
        // and slightly weight by the player's skill at their position (better players
        // find better looks).
        const toPlayer=COURT.find(p=>p.id===id);
        const skillVal=(player.skills&&player.skills[toPlayer.skill])||50;
        const openProb=0.55+(skillVal-50)*0.005; // 50% at skill 50, 60% at skill 70
        const open=Math.random()<openProb;
        setHolderStatus(open?"open":"covered");
        // If open, defenders close in after ~1.5s — status reverts to covered
        if(open){
          closeTimerRef.current=setTimeout(()=>{setHolderStatus("covered");},1500);
        }
        return;
      }
      setPassing({from,to,t});
      passAnimRef.current=requestAnimationFrame(animate);
    };
    passAnimRef.current=requestAnimationFrame(animate);
  };

  const startShot=()=>{
    if(phase!=="play"||passing) return;
    cancelAnimationFrame(passAnimRef.current);
    // Lock in the open/covered status — clear any pending defender-closes timer
    // so an open look stays green for the entire shot meter window.
    if(closeTimerRef.current){clearTimeout(closeTimerRef.current);closeTimerRef.current=null;}
    setMeter(0);meterDir.current=1;
    setPhase("shooting");
  };

  const releaseShot=()=>{
    if(phase!=="shooting") return;
    cancelAnimationFrame(meterRef.current);
    const holder=COURT.find(p=>p.id===holderId);
    const wasOpen=holderStatus==="open";
    const sv=player.skills[holder.skill]||50;
    // Read meter from REF, not state — state may be one frame stale on release
    const m=meterValRef.current;
    // Sweet spot 76-86 (perfect, 10 wide), good 65-95 (30 wide)
    const perfect=m>=76&&m<=86;
    const good=m>=65&&m<=95;
    // Open-vs-contested matters less than meter accuracy
    const openPen=wasOpen?1.0:0.78; // covered shots penalized more
    // Probabilities — perfect+open should feel ALMOST automatic. Hitting center
    // when the guy is wide open should not brick.
    let prob;
    if(perfect){
      // 50 skill = 0.96, 70 skill = 0.99, near-guarantee for perfect timing
      prob=0.96+(sv-50)/2000;
    } else if(good){
      // 50 skill = 0.78, 70 skill = 0.86
      prob=0.78+(sv-50)/250;
    } else {
      // miss range — bricked it
      prob=0.20+(sv-50)/300;
    }
    prob*=openPen;
    const made=Math.random()<clamp(prob,0.05,0.99);
    const isThree=holder.skill==="threePoint";
    const pts=made?(isThree?(perfect?3:3):(perfect?3:2)):0;
    const score=perfect&&made?3:made?(isThree?3:2):0;
    setResult({made,perfect,pts,holder,wasOpen,meter:m,isThree});
    setPhase("result");
    setTimeout(()=>onResult({type:"possession",made,pts:score}),1100);
  };

  // While shooting, listen for pointer release anywhere — if the user's finger slides
  // off the ball handler we still want to catch the release.
  useEffect(()=>{
    if(phase!=="shooting") return;
    const up=()=>releaseShot();
    document.addEventListener("pointerup",up);
    document.addEventListener("pointercancel",up);
    return()=>{
      document.removeEventListener("pointerup",up);
      document.removeEventListener("pointercancel",up);
    };
  },[phase,meter,holderId,holderStatus]);

  if(phase==="intro") return(
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:11,color:"#888",marginBottom:8}}>⚡ POSSESSION — Run a play</div>
      <div style={{fontSize:12,color:"#aaa",lineHeight:1.5,marginBottom:14}}>
        Tap a <span style={{color:GR}}>teammate</span> to pass — the open man is highlighted green.<br/>
        <strong>Press and hold</strong> the <span style={{color:BL}}>ball handler</span> to start your shot, then <strong>release</strong> when the meter is in the sweet spot.
      </div>
      <button onClick={start} style={{...btnS,width:"auto",padding:"10px 32px"}}>RUN THE PLAY</button>
    </div>
  );

  if(phase==="play"||phase==="shooting"){
    const pct=clock/SHOT_CLOCK_MS;
    const holder=COURT.find(p=>p.id===holderId);
    // Render ball position - either at holder or animating between from->to
    let ballX=holder.pos.x, ballY=holder.pos.y;
    if(passing){
      ballX=passing.from.pos.x+(passing.to.pos.x-passing.from.pos.x)*passing.t;
      ballY=passing.from.pos.y+(passing.to.pos.y-passing.from.pos.y)*passing.t;
    }
    return(
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{fontSize:11,color:"#888"}}>⏱ {(clock/1000).toFixed(1)}s</div>
          <div style={{fontSize:11,color:"#666"}}>Passes: {passCount}</div>
        </div>
        <div style={{height:6,background:"rgba(255,255,255,0.08)",borderRadius:3,marginBottom:10}}>
          <div style={{width:`${pct*100}%`,height:"100%",background:pct>0.5?GR:pct>0.25?OR:RE,borderRadius:3,transition:"width 0.05s"}}/>
        </div>
        {/* Court */}
        <div style={{position:"relative",height:230,background:"linear-gradient(180deg, rgba(232,135,58,0.04) 0%, rgba(255,255,255,0.04) 100%)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,marginBottom:10,overflow:"hidden"}}>
          {/* 3pt arc visual */}
          <div style={{position:"absolute",bottom:-60,left:"50%",transform:"translateX(-50%)",width:280,height:140,border:"2px solid rgba(255,255,255,0.07)",borderRadius:"50%",borderBottom:"none"}}/>
          {/* Hoop */}
          <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:38,height:10,background:"rgba(255,100,0,0.35)",borderRadius:"4px 4px 0 0"}}/>
          <div style={{fontSize:9,color:"#444",position:"absolute",bottom:1,left:"50%",transform:"translateX(-50%)"}}>HOOP</div>
          {/* Players — no pre-pass open indicator. Holder lights up green when open,
              red when covered, only AFTER they get the ball. */}
          {COURT.map(p=>{
            const isHolder=p.id===holderId&&!passing;
            const isYou=p.id===0;
            // Status ring color only on the current holder
            const statusColor=isHolder?(holderStatus==="open"?GR:RE):null;
            const bg=isHolder?(holderStatus==="open"?"rgba(0,220,100,0.35)":"rgba(232,64,64,0.25)"):"rgba(255,255,255,0.07)";
            const border=isHolder?statusColor:"rgba(255,255,255,0.18)";
            const clickable=(phase==="play"&&!passing);
            return(
              <button key={p.id}
                onPointerDown={isHolder&&clickable?(e)=>{e.preventDefault();startShot();}:undefined}
                onClick={(!isHolder&&clickable)?()=>passTo(p.id):undefined}
                style={{
                  position:"absolute",left:`${p.pos.x}%`,top:`${p.pos.y}%`,transform:"translate(-50%,-50%)",
                  width:46,height:46,borderRadius:"50%",background:bg,border:`2px solid ${border}`,
                  cursor:clickable?"pointer":"default",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                  fontFamily:"'Barlow Condensed',sans-serif",color:"#f0ede8",padding:0,
                  boxShadow:isHolder?`0 0 14px ${statusColor}`:"none",
                  transition:"box-shadow 0.2s, background 0.2s, border-color 0.2s",
                  touchAction:"none",userSelect:"none",
                  animation:isHolder&&holderStatus==="open"?"openPulse 0.8s ease-in-out infinite":"none",
                }}>
                <div style={{fontSize:16,lineHeight:1}}>{p.icon}</div>
                <div style={{fontSize:8,opacity:0.85,marginTop:1}}>{isYou?"YOU":p.label}</div>
              </button>
            );
          })}
          <style>{`@keyframes openPulse{0%,100%{box-shadow:0 0 14px ${GR}}50%{box-shadow:0 0 26px ${GR}}}`}</style>
          {/* Ball */}
          {(passing||true)&&(
            <div style={{position:"absolute",left:`${ballX}%`,top:`${ballY}%`,transform:"translate(-50%,-50%)",pointerEvents:"none",fontSize:18,filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.5))",transition:passing?"none":"left 0.2s, top 0.2s"}}>🏀</div>
          )}
        </div>
        {phase==="play"?(
          <div style={{fontSize:11,textAlign:"center",lineHeight:1.5}}>
            {holderStatus==="open"?(
              <span style={{color:GR,fontWeight:700}}>🔥 {holder.id===0?"YOU'RE":holder.label.toUpperCase()+" IS"} OPEN — HOLD TO SHOOT!</span>
            ):(
              <span style={{color:"#aaa"}}><span style={{color:RE,fontWeight:700}}>🚫 COVERED</span> — pass to a teammate</span>
            )}
          </div>
        ):(
          // Shooting phase — meter (release pointer anywhere to shoot)
          <div>
            <div style={{fontSize:11,color:"#888",marginBottom:6,textAlign:"center"}}>🏀 SHOOTING from {holder.label} — Release when meter is in the sweet spot</div>
            <div style={{position:"relative",height:42,background:"rgba(255,255,255,0.06)",borderRadius:21,marginBottom:8,overflow:"hidden",touchAction:"none"}}>
              <div style={{position:"absolute",left:"65%",top:0,width:"30%",height:"100%",background:"rgba(0,220,100,0.22)",border:`2px solid ${GR}`}}/>
              <div style={{position:"absolute",left:"76%",top:0,width:"10%",height:"100%",background:"rgba(255,215,0,0.5)"}}/>
              <div style={{position:"absolute",top:"50%",left:`${meter}%`,transform:"translate(-50%,-50%)",width:18,height:18,borderRadius:"50%",background:"white",boxShadow:"0 0 10px white"}}/>
            </div>
            <div style={{textAlign:"center",fontSize:13,color:OR,fontWeight:700,letterSpacing:1.5,padding:"10px 0"}}>LIFT FINGER TO SHOOT</div>
          </div>
        )}
      </div>
    );
  }

  // result
  if(!result) return null;
  const headline=result.reason?result.reason:result.made?(result.perfect?"BUCKETS! ":"AND ONE! "):"BRICK";
  const sub=result.made
    ?`+${result.pts} pts · ${result.holder.label}${result.wasOpen?" (open)":" (contested)"}`
    :result.reason?"":`Missed from ${result.holder.label}`;
  return(
    <div style={{textAlign:"center",padding:"12px 0"}}>
      <div style={{fontSize:44,marginBottom:4}}>{result.made?(result.perfect?"🔥":"🏀"):"😤"}</div>
      <div style={{fontSize:20,fontWeight:900,color:result.made?GR:RE}}>{headline}</div>
      <div style={{fontSize:12,color:"#888",marginTop:4}}>{sub}</div>
    </div>
  );
}

// ─── SEASON GAME ORCHESTRATOR ──────────────────────────────────────────────────
const MINI_GAMES=["shot","defense","possession","steal","pass"];

function SeasonGame({player, school, priorities, year, starTier, allYears=[], onEnd}){
  // Combined difficulty: school strength × star tier expectations.
  // starTier is now a real prop (was previously expected on player.starTier but
  // never passed there). Falls back to player.starTier for any legacy callers.
  const tier=starTier||player.starTier;
  const difficulty=(school.difficulty||1.0)*(tier?.difficulty||1.0);
  const [gameIdx,setGameIdx]=useState(0);
  const [results,setResults]=useState([]);
  const [phase,setPhase]=useState("intro");
  const allOpts=SKILLS;

  const handleResult=(r)=>{
    const next=[...results,r];
    setResults(next);
    if(next.length>=MINI_GAMES.length){finalize(next);}
    else{setGameIdx(next.length);}
  };

  const finalize=(all)=>{
    const totalPts=all.reduce((a,b)=>a+(b.pts||0),0);
    const made=all.filter(x=>x.made).length;
    // Star tier playing-time bonus — higher recruits get more minutes from day one.
    // 5★: +20%, 4★: +12%, 3★: +5%, 2★: 0%. Capped at 100% so we don't exceed reality.
    // This stacks on top of the school's baseline playTime.
    const starTierBonus=tier?Math.max(0,(tier.stars-2)*0.07):0;
    // Returning-player bonus — each prior season played AT THIS SAME SCHOOL
    // adds 6% playing time. So a sophomore returner gets +6%, a junior +12%,
    // a senior +18%. This represents earning trust with the coaching staff
    // and growing into the rotation. It does NOT carry across transfers —
    // moving schools means starting over from the bottom of the depth chart.
    // EXCEPTION: if the player transferred UP to a school they don't quite
    // qualify for (their star tier is below the school's minStars), this
    // bonus is wiped AND a small penalty applies — they're a project there.
    const priorYearsHere=allYears.filter(y=>y.school?.id===school.id).length;
    const playerStars=tier?.stars||3;
    const overReached=school.minStars && playerStars<school.minStars;
    const returnerBonus=overReached?-0.08:priorYearsHere*0.06;
    const totalPlayBonus=starTierBonus+returnerBonus;
    const devGains={};
    priorities.forEach((pid,i)=>{
      const w=[1.0,0.7,0.4][i];
      const sb=school.devStrengths.includes(pid)?1.5:0.8;
      const pb=Math.max(0.3,Math.min(1.0,school.playTime/100+totalPlayBonus));
      const perf=totalPts/(MINI_GAMES.length*3);
      devGains[pid]=Math.max(1,Math.round(w*sb*pb*perf*rand(3,9)));
    });

    // Shot-type bonuses: every shot type the player TOOK gets a small bump,
    // and shots they MADE get an extra bump on top of that. Stacked on whatever the
    // priority-based gains already gave them.
    const shotGame=all.find(r=>r.type==="shot");
    if(shotGame?.detail){
      const skillByShot={three:"threePoint",mid:"midRange",finish:"finishing"};
      shotGame.detail.forEach(s=>{
        const skillId=skillByShot[s.type];
        if(!skillId) return;
        // Each shot attempted: +1. Each shot made: +1 (so a made shot = +2 total).
        // Perfect shots = +3 total.
        const bonus=s.perfect?3:s.made?2:1;
        devGains[skillId]=(devGains[skillId]||0)+bonus;
      });
    }

    // Stats reflect POSITION, HEIGHT, and relevant SKILLS so a 7' center actually rebounds
    // like a 7' center, and a PG actually distributes the ball like a PG.
    const posMult={
      PG:{ppg:0.95,apg:1.8,rpg:0.55},
      SG:{ppg:1.05,apg:1.1,rpg:0.70},
      SF:{ppg:1.00,apg:0.9,rpg:1.05},
      PF:{ppg:0.95,apg:0.7,rpg:1.55},
      C: {ppg:0.90,apg:0.5,rpg:1.90},
    };
    const pm=posMult[player.position]||posMult.SG;
    // Same playing-time bonus applied to PPG/APG/RPG: higher-rated recruits
    // and returning players get more minutes, which means more counting stats.
    // Floor at 30% so overreached transfers still see some action.
    const playTimePct=Math.max(0.3,Math.min(1.0,(school.playTime||80)/100+totalPlayBonus));
    // Height in inches. League avg by position roughly: PG ~73, SG ~76, SF ~79, PF ~82, C ~83
    // A 7-footer (84") gets a meaningful rebound bonus.
    const heightBonus=Math.max(0,(player.height-74)*0.20);
    // Scoring factor — your skill at putting the ball in the basket
    const scoringSkill=((player.skills.threePoint||50)+(player.skills.midRange||50)+(player.skills.finishing||50))/3;
    const scoringMult=0.75+scoringSkill/200; // 0.75 at 0 skill, 1.25 at 100
    // PPG: blends mini-game performance, position role, and scoring skill
    const ppgRaw=totalPts*1.8*playTimePct*pm.ppg*scoringMult;
    const ppg=parseFloat(ppgRaw.toFixed(1));
    // APG: playmaking skill × position multiplier. PG with 70 playmaking ≈ 7.9 APG.
    const playmakingFactor=(player.skills.playmaking||50)/12;
    const apgRaw=playmakingFactor*playTimePct*pm.apg;
    const apg=parseFloat(apgRaw.toFixed(1));
    // RPG: rebounding skill × position multiplier + height bonus. 7' C with 70 reb ≈ 11 RPG.
    const reboundFactor=(player.skills.rebounding||50)/10;
    const rpgRaw=reboundFactor*playTimePct*pm.rpg+heightBonus*playTimePct;
    const rpg=parseFloat(rpgRaw.toFixed(1));
    // FG% reflects mini-game accuracy but gets a small skill nudge
    const fgBase=Math.round((made/all.length)*100);
    const fg=clamp(Math.round(fgBase*0.85+scoringSkill*0.15),28,72);
    onEnd({devGains,stats:{ppg,apg,rpg,fg},totalPts,gamesWon:made});
  };

  const gameType=MINI_GAMES[gameIdx];

  const renderGame=()=>{
    const props={player,difficulty,onResult:handleResult,key:gameIdx};
    if(gameType==="shot") return <ShotMeterGame {...props}/>;
    if(gameType==="defense") return <DefenseGame {...props}/>;
    if(gameType==="possession") return <OffensivePossessionGame {...props}/>;
    if(gameType==="steal") return <StealAndDunkGame {...props}/>;
    if(gameType==="pass") return <PassingGame {...props}/>;
  };

  const gameLabels=["🏀 Shooting","🛡️ Defense","⚡ Possession","✋ Steal & Dunk","📡 Passing"];
  const seasonLabel=`Year ${year}`;

  if(phase==="intro") return(
    <div style={{textAlign:"center",padding:"20px 0"}}>
      <div style={{fontSize:40,marginBottom:8}}>🏟️</div>
      <div style={{fontSize:22,fontWeight:900,marginBottom:2}}>{seasonLabel}</div>
      <div style={{fontSize:13,color:"#aaa",marginBottom:2}}>{school.name}</div>
      <div style={{fontSize:11,color:"#555",marginBottom:18}}>Difficulty: {difficulty.toFixed(1)}x</div>
      <div style={{marginBottom:18}}>
        {priorities.map((pid,i)=>{const item=allOpts.find(x=>x.id===pid);return <div key={pid} style={{fontSize:13,color:[OR,"#aaa","#444"][i],marginBottom:3}}>{["Primary","Secondary","Third"][i]}: {item?.icon} {item?.label}</div>;})}
      </div>
      <button onClick={()=>setPhase("play")} style={btnS}>PLAY THE SEASON →</button>
    </div>
  );

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:11,color:"#888"}}>{gameLabels[gameIdx]}</div>
        <div style={{fontSize:11,color:OR}}>{gameIdx+1}/{MINI_GAMES.length}</div>
      </div>
      <div style={{background:"rgba(232,135,58,0.05)",border:"1px solid rgba(232,135,58,0.15)",borderRadius:12,padding:16,marginBottom:10}}>
        {renderGame()}
      </div>
      <div style={{display:"flex",gap:3}}>
        {MINI_GAMES.map((_,i)=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<results.length?(results[i].made?GR:RE):i===gameIdx?OR:"rgba(255,255,255,0.08)"}}/>)}
      </div>
    </div>
  );
}


// ─── INTERVIEW ────────────────────────────────────────────────────────────────
function Interview({player,onComplete}){
  const QUESTION=IQ_QUESTIONS[0];
  const [msgs,setMsgs]=useState([{role:"assistant",content:`Good morning, ${player.name}. One question — be direct.\n\n"${QUESTION}"`}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [score,setScore]=useState(null);
  const bottomRef=useRef();

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,loading]);

  // Theme detectors used by both score and reaction so they stay in sync.
  // Order matters — these are checked first-to-last and the first 1-2 matches
  // are what the reaction will reference.
  const THEMES=[
    {id:"work",re:/\b(work|grind|practice|film|gym|reps|hours|every ?day|daily|study)\b/i,
     lines:["He talks about the grind — coach in there will eat that up.","Work-ethic angle. Standard, but the delivery landed.","Mentioning film study plays well with our staff.","Gym-rat vibe came through. We can check the hours."]},
    {id:"team",re:/\b(team|teammate|coach|brothers|chemistry|guys|locker)\b/i,
     lines:["Led with 'we' before 'me'. Quietly told us a lot.","Team-first language. Won't hurt his stock.","Locker-room answer. Could be real, could be coached — we'll find out."]},
    {id:"family",re:/\b(family|mom|dad|mama|papa|parents|sister|brother|grandma|grandpa|son|daughter|kids|hood|where i'?m from)\b/i,
     lines:["Brought up family without making a speech of it. Felt genuine.","Family-first answer plays in any market.","That landed different — sounded like he meant it."]},
    {id:"chip",re:/\b(doubt|haters|underrated|overlooked|chip|prove|count(ed)? out)\b/i,
     lines:["Doubter's-list answer. Coaches eat that up.","He's been told 'no' before. You can hear it.","Chip-on-the-shoulder mentality. Whether it's real or marketing — it sells."]},
    {id:"compete",re:/\b(win|winning|championship|ring|trophy|hate ?losing|kill|killer|compete)\b/i,
     lines:["Wants to win. Said it without flinching.","Killer-instinct answer. We'll see if the tape backs it up.","Got that hate-losing edge. Good sign."]},
    {id:"leader",re:/\b(lead|leader|leadership|captain|voice|example)\b/i,
     lines:["Sees himself as a leader already. Bold call — we'll see.","Leadership talk this early is risky, but he sold it."]},
    {id:"iq",re:/\b(iq|read|process|recognize|adjust|adapt|smart|see the ?game)\b/i,
     lines:["Talked about the mental side. Goes in the file.","IQ answer. Front-office types perked up."]},
    {id:"faith",re:/\b(god|blessed|faith|grateful|thankful|prayer)\b/i,
     lines:["Faith-first. Genuine — not a soundbite.","Led with gratitude. Doesn't move the needle, but it's honest."]},
    {id:"athletic",re:/\b(athletic|athleticism|quick|quickness|fast|speed|strong|strength|length|wingspan|jump|leap|explosive|bouncy)\b/i,
     lines:["Leaned on the physical tools. Honest self-read.","He knows what he is athletically — that's useful."]},
    {id:"shooting",re:/\b(shot|shoot|shooter|range|three|jumper|stroke)\b/i,
     lines:["Sold the jumper. Combine will verify.","Says he can shoot. We've got tape to check."]},
    {id:"playmaker",re:/\b(handle|handles|dribble|crossover|playmak|pass|passer|vision|court)\b/i,
     lines:["Court-vision answer. We'll cross-check with the film.","Calls himself a playmaker. We'll see."]},
    {id:"defense",re:/\b(defen|lock(?:ed)?|guard|stop|disrup|steal)\b/i,
     lines:["Defensive identity. Rare for a rookie to lead with that.","Mentioned guarding people without being prompted. Noted."]},
    {id:"humble",re:/\b(humble|learn|grow|improve|weakness|work on|gotta get better)\b/i,
     lines:["Self-aware. Acknowledged weaknesses without sounding fragile.","Talked about getting better — coaches like that energy."]},
    {id:"confident",re:/\b(best|elite|top|nobody|no one|dominat|cant ?stop|can'?t ?stop)\b/i,
     lines:["Confidence is loud. We'll see if the tape backs the talk.","He's not lacking belief. Sometimes that's enough."]},
  ];

  const detectThemes=(lc)=>THEMES.filter(t=>t.re.test(lc));
  const pick=(arr)=>arr[Math.floor(Math.random()*arr.length)];

  // Heuristic fallback — used when the API call fails OR returns nothing usable.
  // Scores spread across 3-9 based on detected themes, specificity, and structure.
  // No more anchoring at 7.
  const heuristicScore=(text)=>{
    const t=(text||"").trim();
    const lc=t.toLowerCase();
    if(!t) return 3;
    if(t.length<3) return 4;
    // Lazy/dismissive single-shot answers
    if(/^(idk|i don'?t know|whatever|nothing|dunno|nah|no|maybe|i guess|im not sure|i'?m not sure)\.?$/i.test(t)) return rand(3,4);
    if(/(don'?t care|hate it|stupid|dumb|fk|fuck|shit)\b/i.test(lc)) return rand(2,3);
    const themes=detectThemes(lc);
    // Variable baseline (not always 7) — 5 or 6 for a plain on-topic answer
    let s=rand(5,6);
    s+=Math.min(3,themes.length);            // up to +3 for themes
    if(themes.length>=2) s+=1;                 // synthesis bonus
    if(/\b[A-Z][a-z]{2,}\b/.test(t)) s+=1;     // proper noun → specificity
    if(/\d/.test(t)) s+=1;                     // a number → concrete detail
    const wc=lc.split(/\s+/).filter(Boolean).length;
    if(wc>=8&&/[.!?]/.test(t)) s+=1;           // full coherent sentence
    if(/^(i just|i'?m just|just trying|trying my best|give ?110|leave it all|110 ?%|100 ?%)/i.test(t)) s-=1; // cliché
    s+=rand(-1,1);                              // jitter so identical inputs vary
    return clamp(s,1,10);
  };

  // Heuristic reaction — generates a scout-voice line that references the
  // content of the answer. Used as the visible reply when the API can't be
  // reached (e.g. on mobile webviews where fetch is restricted) or returns
  // nothing usable.
  const heuristicReaction=(text,score)=>{
    const t=(text||"").trim();
    if(!t) return "Nothing? Alright. Moving on.";
    if(/^(idk|i don'?t know|whatever|nothing|dunno|nah|no|maybe|i guess)\.?$/i.test(t))
      return pick(["...okay. We'll move on.","That's all you got? Noted.","Body language matters in the room. We're writing this down."]);
    if(/(don'?t care|hate it|stupid|dumb)\b/i.test(t.toLowerCase()))
      return "That answer is going in the file. Not in a good way.";
    const themes=detectThemes(t.toLowerCase());
    if(themes.length===0){
      if(score>=8) return pick(["Punchy. Didn't oversell — and that's the sell.","Compact. Said what he needed to.","Less is more in there. He got it."]);
      if(score>=6) return pick(["Decent. Not memorable, but nothing alarming.","Middle of the road — we've heard versions of that all week.","Standard pre-draft answer. Moves on."]);
      if(score>=4) return pick(["Vague. Could've been any kid in any class.","Didn't really answer the question. We'll have to circle back.","Felt rehearsed without the rehearsal showing up."]);
      return pick(["That's not going to play with the room.","We needed more than that.","Tough listen."]);
    }
    if(themes.length===1) return pick(themes[0].lines);
    // Two+ themes — synthesize: a short framing line + one theme line
    const opener=pick(["Hit a couple of fronts.","Multi-layered answer.","Touched on more than one angle — refreshing."]);
    const body=pick(themes[0].lines).replace(/\.$/,"");
    return `${opener} ${body}.`;
  };

  const send=async()=>{
    if(!input.trim()||loading) return;
    const userText=input.trim();
    setMsgs(prev=>[...prev,{role:"user",content:userText}]);
    setInput("");setLoading(true);
    let scoreVal=null;let replyText="";
    try{
      const prompt=`You are an NBA front-office scout evaluating a prospect's interview answer. The prospect just answered: "${userText}"

QUESTION: "${QUESTION}"

Score 1-10 based on actual quality. USE THE FULL RANGE — do NOT anchor at 7:
- 1-3: Lazy, dismissive, hostile, off-topic ("idk", "whatever")
- 4-5: Vague, generic, clichéd, thin ("I just work hard", "I'm a winner")
- 6-7: Reasonable but forgettable — on-topic but no real specifics
- 8-9: Specific, personal, mature self-awareness, or memorable phrasing
- 10: Rare — genuinely standout answer

A bland "I work hard every day" is a 5, not a 7. A specific, personal answer with concrete detail is an 8-9.

Respond in EXACTLY this format (no extra text):
REACTION: <1-2 sentences in scout voice. MUST reference the specific content of the prospect's answer — what they actually said, not generic praise. Be warm but honest.>
SCORE: <integer 1-10>`;
      // Hard 6-second timeout so the request can't hang forever (which was
      // causing the "thinking..." spinner to never clear on Chrome mobile when
      // the cross-origin call to api.anthropic.com was being blocked without
      // a proper rejection). AbortController.signal triggers a fetch reject
      // we'll catch below.
      const controller=new AbortController();
      const timeoutId=setTimeout(()=>controller.abort(),6000);
      let res;
      try{
        res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:prompt}]}),signal:controller.signal});
      } finally {
        clearTimeout(timeoutId);
      }
      const data=await res.json();
      const raw=(data&&data.content&&data.content[0]&&data.content[0].text)||"";
      // Flexible score parsing — handles "SCORE: 7", "Score: 7/10", or just "7/10" at the end
      const sm=raw.match(/SCORE[:\s]*([0-9]{1,2})/i)||raw.match(/\b([0-9]|10)\s*\/\s*10\b/);
      if(sm){
        const v=parseInt(sm[1]);
        if(v>=1&&v<=10) scoreVal=v;
      }
      // Extract reaction — prefer line after REACTION:, else first non-SCORE line
      const rm=raw.match(/REACTION[:\s]*(.+?)(?:\n|SCORE|$)/is);
      if(rm){replyText=rm[1].trim();}
      else{
        replyText=raw.replace(/SCORE[:\s]*[0-9]{1,2}\/?[0-9]*/i,"").replace(/REACTION[:\s]*/i,"").trim();
      }
      if(!replyText) replyText=""; // mark unusable so the dynamic fallback kicks in below
    }catch(err){
      replyText=""; // dynamic fallback will fill this in based on the actual answer
    }finally{
      // ALWAYS clear the loading state — even if something above threw past
      // the catch (unlikely but bulletproof). This is what prevents the
      // permanent "thinking..." stuck state.
      // If model didn't give a usable score, fall back to heuristics on the actual answer
      if(scoreVal===null) scoreVal=heuristicScore(userText);
      // If we didn't get usable reply text (API failure on mobile, blank parse, etc.),
      // synthesize a content-aware scout reaction so the player never sees a generic
      // "Appreciate the answer" again.
      if(!replyText) replyText=heuristicReaction(userText,scoreVal);
      setScore(scoreVal);
      setLoading(false);
      setMsgs(prev=>[...prev,{role:"assistant",content:replyText}]);
    }
    // No auto-advance — user clicks End Interview when they've read the feedback
  };

  const endInterview=()=>{
    const avg=score??heuristicScore("");
    const gain=Math.max(1,Math.round(avg*0.8));
    onComplete({avg,gain});
  };

  const answered=msgs.length>1;
  const responded=answered&&!loading&&score!==null;

  // Tone for the verdict pill (shown after scout responds)
  const tone=responded
    ? (score>=8?{color:GR,verdict:"Strong impression"}
      :score>=6?{color:OR,verdict:"Decent showing"}
      :score>=4?{color:"#aaa",verdict:"Underwhelmed"}
      :{color:RE,verdict:"Concerns raised"})
    : null;

  return(
    <div>
      <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"#bbb",marginBottom:8}}>Interview</div>
      <div style={{height:250,overflowY:"auto",background:"rgba(0,0,0,0.3)",borderRadius:10,padding:12,marginBottom:10,display:"flex",flexDirection:"column",gap:8}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"85%",padding:"9px 12px",borderRadius:m.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px",background:m.role==="user"?"rgba(232,135,58,0.18)":"rgba(255,255,255,0.07)",fontSize:13,lineHeight:1.5,color:m.role==="user"?OR:"#e0dbd4",border:m.role==="user"?"1px solid rgba(232,135,58,0.3)":"1px solid rgba(255,255,255,0.07)",whiteSpace:"pre-wrap"}}>{m.content}</div>
          </div>
        ))}
        {loading&&<div style={{alignSelf:"flex-start",padding:"9px 12px",background:"rgba(255,255,255,0.06)",borderRadius:10,fontSize:12,color:"#888"}}>thinking...</div>}
        <div ref={bottomRef}/>
      </div>

      {/* Verdict panel — appears after scout responds and stays until End Interview */}
      {responded&&(
        <div style={{background:"rgba(0,0,0,0.35)",border:`1px solid ${tone.color}`,borderRadius:10,padding:"10px 12px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,color:tone.color,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase"}}>{tone.verdict}</div>
            <div style={{fontSize:11,color:"#aaa",marginTop:2}}>Scout rating: <span style={{color:tone.color,fontWeight:700}}>{score}/10</span></div>
          </div>
          <div style={{fontSize:24}}>{score>=8?"🌟":score>=6?"👍":score>=4?"😐":"😬"}</div>
        </div>
      )}

      {!responded?(
        <div style={{display:"flex",gap:8}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Your answer..." disabled={answered} style={{...inputS,flex:1,opacity:answered?0.5:1}}/>
          <button onClick={send} disabled={loading||answered} style={{background:OR,border:"none",color:"#080c10",padding:"0 16px",borderRadius:8,cursor:"pointer",fontWeight:900,fontSize:18,opacity:(loading||answered)?0.5:1}}>→</button>
        </div>
      ):(
        <button onClick={endInterview} style={btnS}>END INTERVIEW →</button>
      )}
    </div>
  );
}

// ─── COMBINE ──────────────────────────────────────────────────────────────────
// Categories now line up with the actual INTANGIBLES the player can pick during build.
// Each trait gets a base value, +bonus if the matching intangible was selected, plus boost pts you allocate.
function Combine({player,onComplete}){
  // Three-stage combine: sprint taps → bench-press timing → shooting from 3 distances
  const [stage,setStage]=useState("intro"); // intro → sprint → strength → shooting → done
  const [scores,setScores]=useState({sprint:null,strength:null,shooting:null});

  // Derived ratings: speed from lightningQuick intangible (base 50 + 15), strength from bulldozer
  const speedRating=50+((player.intangibles||[]).includes("lightningQuick")?15:0)+((player.intangibles||[]).includes("speedDemon")?10:0);
  const strengthRating=50+((player.intangibles||[]).includes("bulldozer")?20:0);

  const finishStage=(name,score)=>{
    setScores(s=>{
      const ns={...s,[name]:score};
      if(name==="sprint") setStage("strength");
      else if(name==="strength") setStage("shooting");
      else if(name==="shooting"){
        // Combine total: avg of three normalized to 0-100
        const final=Math.round((ns.sprint+ns.strength+ns.shooting)/3);
        setStage("done");
      }
      return ns;
    });
  };

  if(stage==="intro") return(
    <div>
      <div style={{fontSize:13,color:"#ccc",marginBottom:16,lineHeight:1.5}}>
        Three drills. Each is graded against your physical ratings.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr",gap:8,marginBottom:16}}>
        {[
          {n:"⚡",l:"Sprint Test",d:"Tap as fast as you can for 8s. Your speed rating multiplies your score.",val:speedRating,vlabel:"SPEED"},
          {n:"🏋️",l:"Bench Press Timing",d:"Tap when the bar reaches top and bottom. Strength widens the window.",val:strengthRating,vlabel:"STR"},
          {n:"🎯",l:"Spot Shooting",d:"3 shots each from the rim, mid-range, and 3-point. Your shooting ratings drive accuracy.",val:null},
        ].map((it,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 12px",display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:24}}>{it.n}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700}}>{it.l}</div>
              <div style={{fontSize:11,color:"#aaa",marginTop:2}}>{it.d}</div>
            </div>
            {it.val!==null&&(
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:8,color:"#888",letterSpacing:1}}>{it.vlabel}</div>
                <div style={{fontSize:18,fontWeight:900,color:BL}}>{it.val}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={()=>setStage("sprint")} style={{...btnS,background:BL,color:"#080c10"}}>BEGIN COMBINE →</button>
    </div>
  );

  if(stage==="sprint") return <CombineSprint speedRating={speedRating} onDone={(s)=>finishStage("sprint",s)}/>;
  if(stage==="strength") return <CombineStrength strengthRating={strengthRating} onDone={(s)=>finishStage("strength",s)}/>;
  if(stage==="shooting") return <CombineShooting player={player} onDone={(s)=>finishStage("shooting",s)}/>;

  // Done — show summary
  const final=Math.round((scores.sprint+scores.strength+scores.shooting)/3);
  return(
    <div>
      <div style={{textAlign:"center",marginBottom:18}}>
        <div style={{fontSize:52,fontWeight:900,color:BL,lineHeight:1}}>{final}</div>
        <div style={{fontSize:12,color:"#aaa"}}>Combine Score</div>
      </div>
      {[
        {l:"⚡ Sprint Test",v:scores.sprint},
        {l:"🏋️ Bench Press",v:scores.strength},
        {l:"🎯 Spot Shooting",v:scores.shooting},
      ].map(r=>(
        <div key={r.l} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <span style={{flex:1,fontSize:13}}>{r.l}</span>
          <div style={{width:90,height:4,background:"rgba(255,255,255,0.09)",borderRadius:2}}>
            <div style={{width:`${r.v}%`,height:"100%",background:BL,borderRadius:2}}/>
          </div>
          <span style={{fontSize:13,fontWeight:700,color:BL,width:30,textAlign:"right"}}>{r.v}</span>
        </div>
      ))}
      <button onClick={()=>onComplete(final)} style={{...btnS,marginTop:14}}>DONE →</button>
    </div>
  );
}

// Combine stage 1: Sprint — tap as many times as you can in 8 seconds. Score = taps × speed rating / scaler.
function CombineSprint({speedRating,onDone}){
  const DURATION_MS=8000;
  const [phase,setPhase]=useState("ready"); // ready → run → done
  const [taps,setTaps]=useState(0);
  const tapsRef=useRef(0); // ref so timer effect can read final count without depending on `taps`
  const [timeLeft,setTimeLeft]=useState(DURATION_MS);
  const startRef=useRef();
  const tickRef=useRef();
  const [result,setResult]=useState(null);

  useEffect(()=>{
    if(phase!=="run") return;
    startRef.current=performance.now();
    const step=()=>{
      const elapsed=performance.now()-startRef.current;
      const remaining=Math.max(0,DURATION_MS-elapsed);
      setTimeLeft(remaining);
      if(remaining<=0){
        // Finished — score blends taps (performance) and speed rating (build).
        // Tougher v3: 90+ requires elite taps AND a strong build.
        // Examples: 30 taps + 50 speed = 33. 40 taps + 65 speed = 57. 50 taps + 75 speed = 76. 60 taps + 85 speed = 96.
        const finalTaps=tapsRef.current;
        const tapComponent=finalTaps*1.1;
        const speedComponent=(speedRating-50)*0.85;
        const score=clamp(Math.round(tapComponent+speedComponent),10,100);
        setResult({taps:finalTaps,score});
        setPhase("done");
        return;
      }
      tickRef.current=requestAnimationFrame(step);
    };
    tickRef.current=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(tickRef.current);
  },[phase,speedRating]); // taps removed — timer now runs continuously through the 8 seconds

  if(phase==="ready") return(
    <div style={{textAlign:"center",padding:"10px 0"}}>
      <div style={{fontSize:11,color:"#aaa",letterSpacing:2,marginBottom:4}}>STAGE 1 / 3</div>
      <div style={{fontSize:18,fontWeight:900,marginBottom:4}}>⚡ Sprint Test</div>
      <div style={{fontSize:12,color:"#ccc",marginBottom:14,lineHeight:1.5}}>Tap as many times as you can in 8 seconds.<br/>Your taps × speed rating ({speedRating}) = score.</div>
      <button onClick={()=>{tapsRef.current=0;setTaps(0);setPhase("run");}} style={{...btnS,background:BL,color:"#080c10",width:"auto",padding:"10px 30px"}}>GO!</button>
    </div>
  );

  if(phase==="run") return(
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:11,color:"#aaa",marginBottom:6}}>⚡ TAP! {(timeLeft/1000).toFixed(1)}s left</div>
      <div style={{height:8,background:"rgba(255,255,255,0.08)",borderRadius:4,marginBottom:12}}>
        <div style={{width:`${(timeLeft/DURATION_MS)*100}%`,height:"100%",background:timeLeft<2000?RE:BL,borderRadius:4,transition:"width 0.05s"}}/>
      </div>
      <div style={{fontSize:48,fontWeight:900,color:BL,lineHeight:1,marginBottom:12}}>{taps}</div>
      <div style={{fontSize:11,color:"#888",marginBottom:14}}>taps</div>
      <button onPointerDown={(e)=>{e.preventDefault();tapsRef.current+=1;setTaps(tapsRef.current);}} style={{...btnS,padding:"32px 0",fontSize:24,background:BL,color:"#080c10",userSelect:"none",touchAction:"none"}}>TAP!</button>
    </div>
  );

  return(
    <div style={{textAlign:"center",padding:"20px 0"}}>
      <div style={{fontSize:11,color:"#aaa",letterSpacing:2,marginBottom:6}}>SPRINT COMPLETE</div>
      <div style={{fontSize:14,color:"#ccc",marginBottom:6}}>{result.taps} taps</div>
      <div style={{fontSize:52,fontWeight:900,color:BL,lineHeight:1,marginBottom:4}}>{result.score}</div>
      <div style={{fontSize:11,color:"#888",marginBottom:18}}>sprint score</div>
      <button onClick={()=>onDone(result.score)} style={btnS}>NEXT: STRENGTH →</button>
    </div>
  );
}

// Combine stage 2: Strength — tap when the barbell hits the top and bottom of its arc.
function CombineStrength({strengthRating,onDone}){
  const TOTAL_REPS=5;
  // Higher strength = wider window for accurate taps (easier)
  const WINDOW=clamp(8+Math.round(strengthRating*0.18),12,28); // % of arc that counts as "good"
  const PERIOD_MS=clamp(1600-strengthRating*5,900,1500); // slightly slower at higher strength too
  const [phase,setPhase]=useState("ready"); // ready → lift → done
  const [reps,setReps]=useState(0);
  const [taps,setTaps]=useState([]); // [{rep, half:"up"|"down", accuracy:0-1}]
  const [barY,setBarY]=useState(50); // 0=top, 100=bottom (visual position)
  const [feedback,setFeedback]=useState(null); // {type:"hit"|"miss", half:"up"|"down"|null}
  const lastTapHalfRef=useRef(null); // which half of the cycle was the last tap?
  const startRef=useRef();
  const rafRef=useRef();
  const feedbackTimerRef=useRef();

  useEffect(()=>{
    if(phase!=="lift") return;
    startRef.current=performance.now();
    const step=()=>{
      const t=(performance.now()-startRef.current)%PERIOD_MS;
      // cosine wave: 0 at start, 100 at half, 0 at end (top→bottom→top)
      const pos=50-50*Math.cos((t/PERIOD_MS)*Math.PI*2);
      setBarY(pos);
      rafRef.current=requestAnimationFrame(step);
    };
    rafRef.current=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(rafRef.current);
  },[phase,PERIOD_MS]);

  const flashFeedback=(fb)=>{
    setFeedback(fb);
    if(feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current=setTimeout(()=>setFeedback(null),350);
  };

  const handleTap=()=>{
    if(phase!=="lift") return;
    const nearTop=barY<WINDOW;
    const nearBottom=barY>(100-WINDOW);
    if(!nearTop&&!nearBottom){
      // Miss
      flashFeedback({type:"miss",half:null});
      setTaps(prev=>[...prev,{rep:reps,half:"miss",accuracy:0}]);
      return;
    }
    const half=nearTop?"up":"down";
    if(lastTapHalfRef.current===half){
      // Already tapped this half — duplicate tap, treat as miss
      flashFeedback({type:"miss",half});
      return;
    }
    const distFromTarget=nearTop?barY:(100-barY);
    const accuracy=clamp(1-(distFromTarget/WINDOW),0,1);
    flashFeedback({type:"hit",half,accuracy});
    setTaps(prev=>[...prev,{rep:reps,half,accuracy}]);
    lastTapHalfRef.current=half;
    if(half==="down"){
      const newReps=reps+1;
      setReps(newReps);
      lastTapHalfRef.current=null;
      if(newReps>=TOTAL_REPS) finish();
    }
  };

  const finishedRef=useRef(false);
  const finish=()=>{
    if(finishedRef.current) return;
    finishedRef.current=true;
    cancelAnimationFrame(rafRef.current);
    const hits=taps.filter(t=>t.half!=="miss");
    const avgAcc=hits.length?hits.reduce((a,b)=>a+b.accuracy,0)/hits.length:0;
    const score=clamp(Math.round(strengthRating*0.6+avgAcc*45+(hits.length/Math.max(1,taps.length))*10),20,100);
    setPhase("done");
    setTimeout(()=>onDone(score),900);
  };

  if(phase==="ready") return(
    <div style={{textAlign:"center",padding:"10px 0"}}>
      <div style={{fontSize:11,color:"#aaa",letterSpacing:2,marginBottom:4}}>STAGE 2 / 3</div>
      <div style={{fontSize:18,fontWeight:900,marginBottom:4}}>🏋️ Bench Press</div>
      <div style={{fontSize:12,color:"#ccc",marginBottom:14,lineHeight:1.5}}>Tap when the bar reaches the <span style={{color:GR}}>TOP</span>, then again when it reaches the <span style={{color:GR}}>BOTTOM</span>. Five reps.<br/>Higher strength ({strengthRating}) = wider timing window.</div>
      <button onClick={()=>{setReps(0);setTaps([]);finishedRef.current=false;setPhase("lift");}} style={{...btnS,background:BL,color:"#080c10",width:"auto",padding:"10px 30px"}}>START LIFTING</button>
    </div>
  );

  if(phase==="lift"){
    // Visual highlight color for zones based on feedback
    const topZoneBg=feedback?.type==="hit"&&feedback.half==="up"?"rgba(0,220,100,0.55)":feedback?.type==="miss"&&feedback.half==="up"?"rgba(232,64,64,0.4)":"rgba(0,220,100,0.18)";
    const bottomZoneBg=feedback?.type==="hit"&&feedback.half==="down"?"rgba(0,220,100,0.55)":feedback?.type==="miss"&&feedback.half==="down"?"rgba(232,64,64,0.4)":"rgba(0,220,100,0.18)";
    // Outer panel flashes red on a clean miss (no half)
    const panelBorder=feedback?.type==="miss"&&!feedback.half?`2px solid ${RE}`:"1px solid rgba(255,255,255,0.08)";
    const panelBg=feedback?.type==="miss"&&!feedback.half?"rgba(232,64,64,0.12)":"rgba(255,255,255,0.04)";
    return(
      <div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#aaa",marginBottom:8}}>
          <span>🏋️ Rep {reps+1}/{TOTAL_REPS}</span>
          <span>Window: ±{WINDOW}%</span>
        </div>
        <div style={{position:"relative",height:240,background:panelBg,border:panelBorder,borderRadius:10,marginBottom:12,overflow:"hidden",transition:"border-color 0.15s, background 0.15s"}}>
          {/* Top zone */}
          <div style={{position:"absolute",left:0,right:0,top:0,height:`${WINDOW}%`,background:topZoneBg,borderBottom:`1px dashed ${GR}`,transition:"background 0.12s"}}/>
          <div style={{position:"absolute",left:8,top:4,fontSize:9,color:GR,letterSpacing:1,fontWeight:700}}>TOP</div>
          {/* Bottom zone */}
          <div style={{position:"absolute",left:0,right:0,bottom:0,height:`${WINDOW}%`,background:bottomZoneBg,borderTop:`1px dashed ${GR}`,transition:"background 0.12s"}}/>
          <div style={{position:"absolute",left:8,bottom:4,fontSize:9,color:GR,letterSpacing:1,fontWeight:700}}>BOTTOM</div>
          {/* Barbell */}
          <div style={{position:"absolute",left:"50%",top:`${barY}%`,transform:"translate(-50%,-50%)",width:"80%",height:14,background:"linear-gradient(180deg, #d0d0d0 0%, #888 50%, #555 100%)",borderRadius:3,boxShadow:"0 2px 4px rgba(0,0,0,0.5)"}}>
            <div style={{position:"absolute",left:-8,top:-6,width:16,height:26,background:"#1a1a1a",borderRadius:3,border:"1px solid #444"}}/>
            <div style={{position:"absolute",right:-8,top:-6,width:16,height:26,background:"#1a1a1a",borderRadius:3,border:"1px solid #444"}}/>
          </div>
          {/* Feedback overlay text */}
          {feedback&&(
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
              <div style={{fontSize:38,fontWeight:900,color:feedback.type==="hit"?GR:RE,textShadow:`0 0 14px ${feedback.type==="hit"?GR:RE}, 0 2px 6px rgba(0,0,0,0.7)`,letterSpacing:2,opacity:0.95,transform:"scale(1)",animation:"pop 0.3s ease-out"}}>
                {feedback.type==="hit"?(feedback.accuracy>0.7?"PERFECT!":"GOOD!"):"MISS!"}
              </div>
            </div>
          )}
        </div>
        <button onPointerDown={(e)=>{e.preventDefault();handleTap();}} style={{...btnS,padding:"18px 0",fontSize:18,background:OR,userSelect:"none",touchAction:"none"}}>TAP</button>
        <div style={{display:"flex",gap:3,marginTop:8}}>
          {Array.from({length:TOTAL_REPS}).map((_,i)=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<reps?GR:"rgba(255,255,255,0.1)"}}/>)}
        </div>
        <style>{`@keyframes pop{0%{transform:scale(0.6);opacity:0}40%{transform:scale(1.15);opacity:1}100%{transform:scale(1);opacity:0.95}}`}</style>
      </div>
    );
  }

  return(
    <div style={{textAlign:"center",padding:"20px 0"}}>
      <div style={{fontSize:11,color:"#aaa",letterSpacing:2,marginBottom:6}}>STRENGTH COMPLETE</div>
      <div style={{fontSize:30,marginBottom:6}}>💪</div>
      <div style={{fontSize:11,color:"#888",marginBottom:14}}>Calculating score...</div>
    </div>
  );
}

// Combine stage 3: 3 shots from each of rim / mid / 3pt — difficulty scales inverse to your ratings
function CombineShooting({player,onDone}){
  const DISTANCES=[
    {id:"finishing",label:"At the Rim",icon:"🏀",threshold:3,barLen:170},
    {id:"midRange",label:"Mid-Range",icon:"📐",threshold:5,barLen:240},
    {id:"threePoint",label:"3-Point",icon:"🎯",threshold:7,barLen:300},
  ];
  const SHOTS_PER_DIST=3;
  const [distIdx,setDistIdx]=useState(0);
  const [shotIdx,setShotIdx]=useState(0);
  const [results,setResults]=useState([]); // [{dist,made,perfect}]
  const [barX,setBarX]=useState(0);
  const barXRef=useRef(0); // ref for click-handler accuracy
  const animRef=useRef(); const t0=useRef();

  const dist=DISTANCES[distIdx];
  const BAR=dist.barLen;
  const skillVal=player.skills[dist?.id]||50;
  const winW=clamp(Math.round(skillVal*0.5-dist?.threshold*2.5+20),12,55);
  const [winX,setWinX]=useState(rand(20,BAR-winW-20));
  const winXRef=useRef(0);
  const [phase,setPhase]=useState("active"); // active → showing → next

  useEffect(()=>{
    if(phase!=="active") return;
    const spd=150+(dist?.threshold||3)*22;
    const step=(ts)=>{
      if(!t0.current)t0.current=ts;
      const pos=((ts-t0.current)*spd/1000)%(BAR+20);
      barXRef.current=pos;
      setBarX(pos);
      animRef.current=requestAnimationFrame(step);
    };
    animRef.current=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(animRef.current);
  },[phase,distIdx,shotIdx]);

  useEffect(()=>{
    t0.current=null; setBarX(0); barXRef.current=0;
    const newWinX=rand(20,BAR-winW-20);
    setWinX(newWinX); winXRef.current=newWinX;
  },[shotIdx,distIdx,BAR,winW]);

  const shoot=()=>{
    if(phase!=="active") return;
    cancelAnimationFrame(animRef.current);
    // Read from refs to avoid React render lag
    const cur=barXRef.current; const wx=winXRef.current;
    const inW=cur>=wx&&cur<=(wx+winW);
    const perf=Math.abs(cur-(wx+winW/2))<winW*0.2;
    const made=inW;
    setResults(prev=>[...prev,{dist:dist.id,made,perfect:perf}]);
    setPhase("showing");
    setTimeout(()=>{
      const nextShot=shotIdx+1;
      if(nextShot<SHOTS_PER_DIST){
        setShotIdx(nextShot);
        setPhase("active");
      } else {
        const nextDist=distIdx+1;
        if(nextDist<DISTANCES.length){
          setDistIdx(nextDist);
          setShotIdx(0);
          setPhase("active");
        } else {
          // All done
          finish();
        }
      }
    },800);
  };

  const finish=()=>{
    const totalMade=results.filter(r=>r.made).length+(results[results.length-1]?.made?0:0); // results state is stale; recompute
    // We've already pushed the final shot, just count from state in the next frame.
    // Use the actual results array we have access to in the closure, which now includes all but the last.
    // To be safe, count again:
    setTimeout(()=>{
      setResults(curr=>{
        const made=curr.filter(r=>r.made).length;
        const perf=curr.filter(r=>r.perfect).length;
        // Score: 0-100 scaled to total shots (9). Each made = ~10 pts, perfect bonus.
        const score=clamp(Math.round((made*10)+(perf*2)+10),15,100);
        setPhase("done");
        setTimeout(()=>onDone(score),400);
        return curr;
      });
    },50);
  };

  if(phase==="done"){
    const made=results.filter(r=>r.made).length;
    return(
      <div style={{textAlign:"center",padding:"20px 0"}}>
        <div style={{fontSize:30,marginBottom:6}}>🎯</div>
        <div style={{fontSize:11,color:"#aaa",letterSpacing:2,marginBottom:4}}>SHOOTING COMPLETE</div>
        <div style={{fontSize:14,color:"#ccc"}}>{made}/{DISTANCES.length*SHOTS_PER_DIST} made</div>
      </div>
    );
  }

  const lastResult=results[results.length-1];

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#aaa",marginBottom:8}}>
        <span>{dist.icon} {dist.label}</span>
        <span>Shot {shotIdx+1}/{SHOTS_PER_DIST}</span>
      </div>
      <div style={{fontSize:10,color:"#888",marginBottom:8,textAlign:"center"}}>Distance {distIdx+1}/3 · Skill {skillVal}</div>
      {/* Progress dots */}
      <div style={{display:"flex",justifyContent:"center",gap:3,marginBottom:12}}>
        {DISTANCES.map((d,di)=>(
          <div key={d.id} style={{display:"flex",gap:2}}>
            {Array.from({length:SHOTS_PER_DIST}).map((_,si)=>{
              const idx=di*SHOTS_PER_DIST+si;
              const r=results[idx];
              const bg=!r?(idx===distIdx*SHOTS_PER_DIST+shotIdx?OR:"rgba(255,255,255,0.1)"):(r.made?(r.perfect?GO:GR):RE);
              return <div key={si} style={{width:14,height:5,borderRadius:2,background:bg}}/>;
            })}
          </div>
        ))}
      </div>
      <div onPointerDown={(e)=>{e.preventDefault();shoot();}} style={{position:"relative",width:BAR,maxWidth:"100%",height:40,background:"rgba(255,255,255,0.06)",borderRadius:20,margin:"0 auto 12px",overflow:"hidden",cursor:"pointer",touchAction:"none"}}>
        <div style={{position:"absolute",left:winX,top:0,width:winW,height:"100%",background:"rgba(0,220,100,0.2)",borderLeft:"2px solid "+GR,borderRight:"2px solid "+GR}}/>
        <div style={{position:"absolute",left:winX+winW*0.4,top:0,width:winW*0.2,height:"100%",background:"rgba(255,215,0,0.45)"}}/>
        <div style={{position:"absolute",left:barX,top:6,width:9,height:28,background:"white",borderRadius:5,boxShadow:"0 0 10px white"}}/>
      </div>
      {phase==="active"?(
        <button onPointerDown={(e)=>{e.preventDefault();shoot();}} style={{...btnS,background:OR,padding:"14px 0",fontSize:16,touchAction:"none"}}>SHOOT</button>
      ):(
        <div style={{textAlign:"center",fontSize:22,fontWeight:900,color:lastResult?.made?GR:RE,padding:"14px 0"}}>{lastResult?.perfect?"SWISH!":lastResult?.made?"GOOD!":"MISSED"}</div>
      )}
    </div>
  );
}

// ─── SIGNATURE PAD ─────────────────────────────────────────────────────────────
// Lightweight signature drawing surface — used when signing shoe deals so the
// player gets a tactile "make it official" beat instead of just tapping a brand.
// Captures pointer events (works for mouse + touch); the parent gets the path
// data and a hasInk boolean for the Confirm button.
function SignaturePad({onChange, height=140}){
  const canvasRef=useRef(null);
  const drawingRef=useRef(false);
  const lastPtRef=useRef(null);
  const [hasInk,setHasInk]=useState(false);

  // Resize the canvas to its rendered width on mount, and again on viewport
  // resize. We multiply by devicePixelRatio so the strokes stay crisp on
  // retina displays. The 2D context is scaled to match so logical coordinates
  // (CSS pixels) stay simple.
  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas) return;
    const resize=()=>{
      const rect=canvas.getBoundingClientRect();
      const dpr=window.devicePixelRatio||1;
      canvas.width=rect.width*dpr;
      canvas.height=rect.height*dpr;
      const ctx=canvas.getContext("2d");
      ctx.scale(dpr,dpr);
      ctx.strokeStyle="#1a1a1a";
      ctx.lineWidth=2.5;
      ctx.lineCap="round";
      ctx.lineJoin="round";
    };
    resize();
    window.addEventListener("resize",resize);
    return()=>window.removeEventListener("resize",resize);
  },[]);

  const ptFromEvent=(e)=>{
    const canvas=canvasRef.current;
    if(!canvas) return null;
    const rect=canvas.getBoundingClientRect();
    return {x:e.clientX-rect.left, y:e.clientY-rect.top};
  };

  const start=(e)=>{
    e.preventDefault();
    const pt=ptFromEvent(e);
    if(!pt) return;
    drawingRef.current=true;
    lastPtRef.current=pt;
  };
  const move=(e)=>{
    if(!drawingRef.current) return;
    e.preventDefault();
    const pt=ptFromEvent(e);
    if(!pt) return;
    const ctx=canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(lastPtRef.current.x,lastPtRef.current.y);
    ctx.lineTo(pt.x,pt.y);
    ctx.stroke();
    lastPtRef.current=pt;
    if(!hasInk){
      setHasInk(true);
      onChange&&onChange(true);
    }
  };
  const end=(e)=>{
    if(!drawingRef.current) return;
    e.preventDefault();
    drawingRef.current=false;
    lastPtRef.current=null;
  };
  const clearPad=()=>{
    const canvas=canvasRef.current;
    if(!canvas) return;
    const ctx=canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);
    setHasInk(false);
    onChange&&onChange(false);
  };

  return(
    <div>
      <div style={{position:"relative",height,background:"#fafaf6",borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",overflow:"hidden",boxShadow:"inset 0 2px 6px rgba(0,0,0,0.15)"}}>
        <canvas ref={canvasRef} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end} onPointerCancel={end}
          style={{width:"100%",height:"100%",display:"block",touchAction:"none",cursor:"crosshair"}}/>
        {!hasInk&&<div style={{position:"absolute",top:"50%",left:0,right:0,transform:"translateY(-50%)",textAlign:"center",fontSize:11,color:"#999",letterSpacing:2,pointerEvents:"none",textTransform:"uppercase"}}>Sign here ✍️</div>}
        {/* Signature line — the dotted underline you sign on top of */}
        <div style={{position:"absolute",left:16,right:16,bottom:24,borderBottom:"1px dashed #b0a8a0",pointerEvents:"none"}}/>
      </div>
      <button onClick={clearPad} style={{marginTop:8,padding:"4px 10px",fontSize:11,background:"transparent",color:"#888",border:"1px solid #444",borderRadius:6,cursor:"pointer",letterSpacing:1,fontFamily:"'Barlow Condensed',sans-serif"}}>
        CLEAR
      </button>
    </div>
  );
}

// ─── SHOE DEALS BLOCK ──────────────────────────────────────────────────────────
// Renders all 6 shoe brands as a grid. Brands the player doesn't qualify for
// (based on draft pick) are greyed out and show "Not available at this pick"
// in a toast when clicked. Otherwise, clicking opens a signature modal —
// after the player draws their signature and confirms, the deal is signed,
// signing bonus added to career money, skill points granted, and a "SIGNED!"
// confirmation flashes. After signing one brand, the others lock out.
function ShoeDealsBlock({pick, isLottery, onSign, signedBrand, toast}){
  const [pendingBrand,setPendingBrand]=useState(null); // brand being signed (modal open)
  const [hasInk,setHasInk]=useState(false);

  const tryClickBrand=(brand)=>{
    if(signedBrand) return; // already signed something — locked
    if(pick>brand.maxPick){
      toast&&toast(`${brand.name} not available at pick #${pick}`,"#888");
      return;
    }
    setPendingBrand(brand);
    setHasInk(false);
  };

  const confirmSign=()=>{
    if(!pendingBrand||!hasInk) return;
    onSign&&onSign(pendingBrand);
    setPendingBrand(null);
  };

  return(
    <div style={{background:"rgba(255,215,0,0.07)",border:"1px solid rgba(255,215,0,0.22)",borderRadius:12,padding:14,marginBottom:14}}>
      <div style={{fontSize:10,color:"#FFD700",fontWeight:700,marginBottom:10,letterSpacing:3,textTransform:"uppercase"}}>Shoe Deal Offers</div>

      {!isLottery&&!signedBrand&&(
        <div style={{fontSize:12,color:"#aaa",textAlign:"center",padding:"10px 0",fontStyle:"italic"}}>
          No offers yet — break into the rotation and put up numbers, the deals will come.
        </div>
      )}

      {(isLottery||signedBrand)&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {SHOE_BRANDS.map(b=>{
            const available=pick<=b.maxPick;
            const isSigned=signedBrand?.id===b.id;
            const isLocked=signedBrand&&!isSigned;
            const opacity=isLocked?0.25:available?1:0.4;
            return(
              <button key={b.id} onClick={()=>tryClickBrand(b)} disabled={isLocked||isSigned}
                style={{
                  padding:"10px 11px",
                  background:isSigned?"rgba(0,220,100,0.18)":available?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.02)",
                  border:isSigned?"1.5px solid #00DC64":`1px solid ${available?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.06)"}`,
                  borderRadius:8,
                  color:"#fff",
                  cursor:isLocked||isSigned?"default":"pointer",
                  textAlign:"left",
                  opacity,
                  transition:"all 0.2s",
                }}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:14,fontWeight:900,color:b.color==="#FFFFFF"?"#fff":b.color,letterSpacing:1,fontFamily:"'Barlow Condensed',sans-serif",textTransform:"uppercase",textShadow:b.color==="#000000"?"0 0 4px rgba(255,255,255,0.4)":"none"}}>{b.name}</span>
                  {isSigned&&<span style={{fontSize:9,fontWeight:700,color:"#00DC64",letterSpacing:1.5}}>✓ SIGNED</span>}
                </div>
                <div style={{fontSize:10,color:"#bbb",lineHeight:1.4}}>
                  {available?(
                    <>{fmtMoney(b.bonus)} bonus · +{b.skillBonus} SP</>
                  ):(
                    <span style={{color:"#888",fontStyle:"italic"}}>Not available at this pick</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Signature modal */}
      {pendingBrand&&(
        <div onClick={()=>setPendingBrand(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:18}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#1a1a1a",borderRadius:14,padding:20,maxWidth:380,width:"100%",border:"1px solid rgba(255,215,0,0.35)"}}>
            <div style={{textAlign:"center",marginBottom:14}}>
              <div style={{fontSize:9,letterSpacing:3,color:"#FFD700",textTransform:"uppercase",marginBottom:4}}>Endorsement Contract</div>
              <div style={{fontSize:24,fontWeight:900,color:pendingBrand.color==="#FFFFFF"?"#fff":pendingBrand.color,letterSpacing:1.5,fontFamily:"'Barlow Condensed',sans-serif",textTransform:"uppercase",textShadow:pendingBrand.color==="#000000"?"0 0 6px rgba(255,255,255,0.5)":"none"}}>{pendingBrand.name}</div>
              <div style={{fontSize:11,color:"#aaa",marginTop:4}}>{fmtMoney(pendingBrand.bonus)} signing bonus · +{pendingBrand.skillBonus} skill points</div>
            </div>
            <div style={{fontSize:11,color:"#ccc",lineHeight:1.5,marginBottom:10,padding:"10px 12px",background:"rgba(255,255,255,0.03)",borderRadius:8,border:"1px dashed rgba(255,255,255,0.1)"}}>
              I, the undersigned, hereby agree to wear <strong style={{color:"#fff"}}>{pendingBrand.name}</strong> footwear on the court and accept the terms of this endorsement contract.
            </div>
            <SignaturePad onChange={setHasInk}/>
            <div style={{display:"flex",gap:8,marginTop:14}}>
              <button onClick={()=>setPendingBrand(null)} style={{flex:1,padding:"10px 0",background:"transparent",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,color:"#888",cursor:"pointer",fontSize:12,fontWeight:700,letterSpacing:1,fontFamily:"'Barlow Condensed',sans-serif"}}>
                CANCEL
              </button>
              <button onClick={confirmSign} disabled={!hasInk} style={{flex:2,padding:"10px 0",background:hasInk?"#FFD700":"rgba(255,215,0,0.2)",border:"none",borderRadius:8,color:hasInk?"#000":"#666",cursor:hasInk?"pointer":"not-allowed",fontSize:13,fontWeight:900,letterSpacing:1.5,fontFamily:"'Barlow Condensed',sans-serif"}}>
                CONFIRM ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DRAFT SCREEN ─────────────────────────────────────────────────────────────
function DraftScreen({player,school,starTier,agent,allYears,combineScore,interviewScore,setAgentAttention,setPlayer,skillPoints,setSkillPoints,money,setMoney,signedShoeBrand,setSignedShoeBrand,setNbaTeam,go,toast}){
  // Reveal stages: black-out → "with the Xth pick" → team name → "selects..." → name + jersey
  const [stage,setStage]=useState("intro"); // intro → onClock → teamReveal → playerReveal → details
  const [pick,setPick]=useState(null);
  const [team,setTeam]=useState(null);
  // Jersey number from the player's chosen appearance (set on the setup screen)
  const jerseyNumber=player.appearance?.jerseyNumber??23;
  const ovr=calcOVR(player.skills||{},player.intangibles||[]);
  const yearsInCollege=allYears.length;
  const nbaYear=NBA_DRAFT_LABEL;
  const age=calcAge(allYears, []);

  // Compute pick + team once on mount
  useEffect(()=>{
    // Use the projectDraft helper for fairness (factors in combine + interview)
    const proj=projectDraft({ovr,starTier,school,allYears,combineScore,interviewScore});
    // Pick exact slot within the projected range, biased toward the projected pick
    let p=clamp(proj.pick+rand(-3,3),1,60);
    // Undrafted only if projection is way down
    if(proj.tier==="undrafted"&&Math.random()<0.55) p=0;
    setPick(p);
    setTeam(NBA_TEAMS[rand(0,NBA_TEAMS.length-1)]);
    // Update agent attention based on actual pick
    if(setAgentAttention&&agent){
      // attention = 100 if pick matches/beats agent's expected tier, drops as pick gets worse relative to agent's tier
      const expectedPick={top5:3,lottery:10,first:22,early2nd:38,late2nd:55,undrafted:62}[agent.requiredTier]||30;
      const delta=p===0?40:(p-expectedPick);
      const att=clamp(Math.round(100-delta*1.8),25,100);
      setAgentAttention(att);
    }
    // Stage timing — intro → onClock → teamReveal → playerReveal (player taps NEXT to advance)
    const t1=setTimeout(()=>setStage("onClock"),900);
    const t2=setTimeout(()=>setStage("teamReveal"),3600);
    const t3=setTimeout(()=>setStage("playerReveal"),6400);
    return()=>{[t1,t2,t3].forEach(clearTimeout);};
  },[]);

  if(pick===null) return <div style={{textAlign:"center",padding:"60px 0",color:"#aaa"}}>Loading draft...</div>;

  const teamData=team?NBA_TEAM_DATA[team]||{p:"#444",s:"#888",abbr:"???"}:{p:"#444",s:"#888",abbr:"???"};
  const isFirstRound=pick>=1&&pick<=30;
  const isSecondRound=pick>=31&&pick<=60;
  const isUndrafted=pick===0;
  const roundLabel=pick===0?"":pick<=14?"LOTTERY":pick<=30?"FIRST ROUND":"SECOND ROUND";

  // Intro / on-the-clock
  if(stage==="intro"||stage==="onClock"){
    return(
      <div style={{textAlign:"center",padding:"40px 16px",minHeight:380,display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <div style={{fontSize:10,letterSpacing:6,color:OR,marginBottom:6}}>{nbaYear} NBA DRAFT</div>
        {stage==="intro"?(
          <>
            <div style={{fontSize:48,marginBottom:14,display:"inline-block",animation:"draftSpin 1.4s linear infinite"}}>🏀</div>
            <div style={{fontSize:16,color:"#aaa",letterSpacing:2}}>ON THE CLOCK...</div>
          </>
        ):isUndrafted?(
          <>
            <div style={{fontSize:14,color:"#aaa",marginTop:24,letterSpacing:2}}>The draft is over.</div>
            <div style={{fontSize:13,color:"#888",marginTop:8}}>Your name was never called.</div>
          </>
        ):(
          <>
            <div style={{fontSize:14,color:"#aaa",marginBottom:14,letterSpacing:2}}>With the</div>
            <div style={{fontSize:78,fontWeight:900,color:OR,lineHeight:1,marginBottom:6,textShadow:`0 0 24px ${OR}88`}}>#{pick}</div>
            <div style={{fontSize:14,color:"#aaa",marginTop:8,letterSpacing:2}}>pick of the {roundLabel}...</div>
          </>
        )}
        <style>{`@keyframes draftSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // Team reveal — big team name with team colors
  if(stage==="teamReveal"&&!isUndrafted){
    return(
      <div style={{textAlign:"center",padding:"24px 16px",minHeight:380,display:"flex",flexDirection:"column",justifyContent:"center",background:`linear-gradient(135deg, ${teamData.p}66 0%, rgba(0,0,0,0.85) 80%)`,borderRadius:16,margin:"-4px -4px"}}>
        <div style={{fontSize:11,letterSpacing:5,color:"#fff",opacity:0.7,marginBottom:14}}>#{pick} · {roundLabel}</div>
        {/* Team emblem. Set NBA_TEAM_DATA[team].logoUrl to use your own hosted image. */}
        <div style={{margin:"0 auto 12px",animation:"emblemPop 0.5s ease-out"}}>
          <TeamEmblem colors={{p:teamData.p,s:teamData.s}} abbr={teamData.abbr} name={team} size={130} logoUrl={teamData.logoUrl}/>
        </div>
        <style>{`@keyframes emblemPop{0%{transform:scale(0);opacity:0}80%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}`}</style>
        <div style={{fontSize:13,color:"#ddd",letterSpacing:3,marginBottom:6}}>THE</div>
        <div style={{fontSize:30,fontWeight:900,color:"#fff",lineHeight:1,textShadow:"0 2px 8px rgba(0,0,0,0.6)"}}>{team.toUpperCase()}</div>
        <div style={{fontSize:14,color:"#ddd",marginTop:16,letterSpacing:2,fontStyle:"italic"}}>select...</div>
      </div>
    );
  }

  // Player reveal — jersey with NAME (curved across top) + NUMBER (large, center). Stays until tapped.
  if(stage==="playerReveal"&&!isUndrafted){
    const lastName=(player.name||"PLAYER").split(" ").slice(-1)[0].toUpperCase();
    const bodyColor=teamData.p;
    const accentColor=teamData.s;
    // Choose a contrasting number outline that pops against the accent. Use black on light
    // accents (like Lakers gold) and white-ish on dark accents (like Spurs silver).
    // Compute brightness of the accent color
    const accentBrightness=parseInt(accentColor.slice(1,3),16)+parseInt(accentColor.slice(3,5),16)+parseInt(accentColor.slice(5,7),16);
    const outlineColor=accentBrightness>500?"#000":"#000"; // always black outline for readability
    // Font sizing tuned for the v3 jersey proportions (260×320 viewBox).
    // Name follows a curved arc above the chest; number sits below at chest center.
    const nameLen=lastName.length;
    const nameFont=nameLen>=10?14:nameLen>=8?17:nameLen>=6?21:24;
    const numStr=String(jerseyNumber);
    const numFont=numStr.length===1?105:88;
    return(
      <div onClick={()=>setStage("details")} style={{textAlign:"center",padding:"24px 16px",minHeight:520,display:"flex",flexDirection:"column",justifyContent:"center",background:`linear-gradient(180deg, ${teamData.p} 0%, ${teamData.s}55 65%, #1a0a04 100%)`,borderRadius:16,margin:"-4px -4px",cursor:"pointer"}}>
        <div style={{fontSize:11,letterSpacing:5,color:"#fff",opacity:0.92,marginBottom:6,fontWeight:700,textShadow:"0 1px 3px rgba(0,0,0,0.6)"}}>{team.toUpperCase()}</div>
        <div style={{fontSize:11,color:"#fff",opacity:0.75,marginBottom:18,letterSpacing:2,textShadow:"0 1px 3px rgba(0,0,0,0.6)"}}>#{pick} OVERALL · {nbaYear}</div>

        {/* Jersey SVG — v4, proper sleeveless tank silhouette matching modern NBA jerseys.
            Reference: Paul George OKC jersey — straight shoulder straps, smooth armhole
            cutouts, rectangular body, sharp V-neck, rounded hem corners. */}
        <div style={{margin:"0 auto 14px",position:"relative",filter:"drop-shadow(0 10px 24px rgba(0,0,0,0.55))"}}>
          <svg width="260" height="320" viewBox="0 0 260 320" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="jBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.18)"/>
                <stop offset="30%" stopColor="rgba(255,255,255,0)"/>
                <stop offset="100%" stopColor="rgba(0,0,0,0.22)"/>
              </linearGradient>
              <radialGradient id="jChest" cx="0.5" cy="0.30" r="0.55">
                <stop offset="0" stopColor="rgba(255,255,255,0.12)"/>
                <stop offset="1" stopColor="rgba(255,255,255,0)"/>
              </radialGradient>
              {/* Arc the name follows — anchored just above the number area */}
              <path id="nameArc" d="M 78 132 Q 130 110 182 132" fill="none"/>
            </defs>

            {/* MAIN JERSEY SILHOUETTE — sleeveless tank top
                Anatomy traced clockwise from outer-left shoulder:
                  1. Outer left shoulder strap (angled up-inward)
                  2. Top of left strap
                  3. Inner left strap down to V-neck
                  4. V-neck (sharp V going down)
                  5. Inner right strap up
                  6. Top of right strap
                  7. Outer right shoulder strap
                  8. Right armhole curve into body
                  9. Right side seam straight down
                  10. Right hem rounded corner
                  11. Bottom hem
                  12. Left hem rounded corner
                  13. Left side seam straight up
                  14. Left armhole curve back to start
            */}
            <path d="
              M 52,55
              L 64,22
              L 90,22
              L 95,50
              L 130,82
              L 165,50
              L 170,22
              L 196,22
              L 208,55
              Q 220,90 220,128
              L 220,295
              Q 220,306 209,306
              L 51,306
              Q 40,306 40,295
              L 40,128
              Q 40,90 52,55
              Z"
              fill={bodyColor}
              stroke={outlineColor}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Body shading — top highlight + bottom shadow */}
            <path d="
              M 52,55 L 64,22 L 90,22 L 95,50 L 130,82 L 165,50 L 170,22 L 196,22 L 208,55
              Q 220,90 220,128 L 220,295 Q 220,306 209,306 L 51,306 Q 40,306 40,295
              L 40,128 Q 40,90 52,55 Z"
              fill="url(#jBody)" pointerEvents="none"/>
            {/* Chest highlight */}
            <path d="
              M 52,55 L 64,22 L 90,22 L 95,50 L 130,82 L 165,50 L 170,22 L 196,22 L 208,55
              Q 220,90 220,128 L 220,295 Q 220,306 209,306 L 51,306 Q 40,306 40,295
              L 40,128 Q 40,90 52,55 Z"
              fill="url(#jChest)" pointerEvents="none"/>

            {/* V-NECK INNER — dark inner shape suggesting the collar opening */}
            <path d="M 95,50 L 130,82 L 165,50 L 158,58 L 130,90 L 102,58 Z"
                  fill="rgba(0,0,0,0.45)"/>

            {/* V-NECK ACCENT PIPING — traces the V-neck shape with accent color */}
            <path d="M 95,50 L 130,82 L 165,50"
                  fill="none" stroke={accentColor} strokeWidth="3"
                  strokeLinejoin="round" strokeLinecap="round"/>

            {/* SHOULDER STRAP ACCENT TRIM — runs along strap edges */}
            {/* Left strap outer edge */}
            <path d="M 52,55 L 64,22 L 90,22"
                  fill="none" stroke={accentColor} strokeWidth="3"
                  strokeLinejoin="round" strokeLinecap="round"/>
            {/* Right strap outer edge */}
            <path d="M 170,22 L 196,22 L 208,55"
                  fill="none" stroke={accentColor} strokeWidth="3"
                  strokeLinejoin="round" strokeLinecap="round"/>

            {/* ARMHOLE INNER EDGE — subtle dark line showing the curve */}
            <path d="M 40,128 Q 42,95 52,60" fill="none"
                  stroke="rgba(0,0,0,0.35)" strokeWidth="1.2"/>
            <path d="M 220,128 Q 218,95 208,60" fill="none"
                  stroke="rgba(0,0,0,0.35)" strokeWidth="1.2"/>

            {/* SIDE SEAM PIPING — vertical accent line on each side */}
            <line x1="40" y1="128" x2="40" y2="295" stroke={accentColor}
                  strokeWidth="2.5" opacity="0.85"/>
            <line x1="220" y1="128" x2="220" y2="295" stroke={accentColor}
                  strokeWidth="2.5" opacity="0.85"/>

            {/* HEM PANEL — bottom band with accent stripe */}
            <rect x="40" y="288" width="180" height="18" fill={accentColor} opacity="0.12"/>
            <line x1="40" y1="288" x2="220" y2="288" stroke={accentColor} strokeWidth="2"/>
            <line x1="45" y1="306" x2="215" y2="306" stroke={accentColor}
                  strokeWidth="3" strokeLinecap="round"/>

            {/* LAST NAME — curved across upper chest along the arc */}
            <text fontSize={nameFont} fontWeight="900" fill={accentColor}
                  stroke={outlineColor} strokeWidth="1"
                  paintOrder="stroke fill"
                  fontFamily="Impact, 'Arial Black', 'Oswald', sans-serif"
                  letterSpacing="2.5">
              {/* xlinkHref is the SVG1 syntax that older mobile browsers
                  (notably some Android Chrome / older iOS versions) need to
                  render textPath. Newer browsers accept the SVG2 `href`. Setting
                  BOTH ensures the curved name shows up everywhere — without
                  this, the jersey would render with just the number on some
                  devices. */}
              <textPath href="#nameArc" xlinkHref="#nameArc" startOffset="50%" textAnchor="middle">
                {lastName}
              </textPath>
            </text>

            {/* JERSEY NUMBER — large, centered in chest area */}
            <text x="130" y="242"
                  textAnchor="middle"
                  fontSize={numFont}
                  fontWeight="900"
                  fill={accentColor}
                  stroke={outlineColor}
                  strokeWidth="2.5"
                  paintOrder="stroke fill"
                  fontFamily="Impact, 'Arial Black', 'Oswald', sans-serif"
                  letterSpacing="-2">
              {numStr}
            </text>
          </svg>
        </div>

        <div style={{fontSize:28,fontWeight:900,color:"#fff",lineHeight:1,textShadow:"0 2px 8px rgba(0,0,0,0.7)"}}>{player.name||"YOUR PLAYER"}</div>
        <div style={{fontSize:13,color:"#fff",opacity:0.85,marginTop:5,letterSpacing:1,textShadow:"0 1px 3px rgba(0,0,0,0.6)"}}>{player.position} · {school?.name}</div>

        <div style={{marginTop:28,fontSize:11,color:"#fff",opacity:0.6,letterSpacing:3,animation:"tapPulse 1.6s ease-in-out infinite"}}>TAP TO CONTINUE</div>
        <style>{`@keyframes tapPulse{0%,100%{opacity:0.4}50%{opacity:0.9}}`}</style>
      </div>
    );
  }

  // Details — full summary, shoe deals, and continue button
  if(stage==="details"){
    if(isUndrafted){
      return(
        <div style={{textAlign:"center",padding:"20px 0"}}>
          <div style={{fontSize:52,marginBottom:10}}>😤</div>
          <div style={{fontSize:28,fontWeight:900,color:RE,marginBottom:8}}>UNDRAFTED</div>
          <div style={{fontSize:13,color:"#aaa",marginBottom:14,lineHeight:1.5}}>The phones never rang. But {agent?.name} found teams willing to give you a Summer League invite.<br/><span style={{color:"#888",fontSize:12}}>Pick any team — minutes will be scarce.</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:6,marginBottom:14}}>
            {NBA_TEAMS.map(t=>{
              const td=NBA_TEAM_DATA[t]||{p:"#444",s:"#888",abbr:"???"};
              return(
                <button key={t} onClick={()=>{
                  setNbaTeam&&setNbaTeam(t);
                  setSkillPoints&&setSkillPoints(signedShoeBrand?.skillBonus||0);
                  setPlayer&&setPlayer(p=>({...p,draftPick:0,isUndrafted:true}));
                  go&&go("leagueHub");
                }} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 4px",background:`linear-gradient(135deg, ${td.p} 0%, #000 140%)`,border:`1px solid ${td.s}66`,borderRadius:8,color:"#fff",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif"}}>
                  <div style={{fontSize:14,fontWeight:900,letterSpacing:1}}>{td.abbr}</div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.85)",lineHeight:1.1,minHeight:22}}>{t}</div>
                </button>
              );
            })}
          </div>
          <div style={{background:"rgba(0,0,0,0.3)",borderRadius:10,padding:10,fontSize:11,color:"#888",lineHeight:1.4}}>Undrafted players sit at the end of the bench. Earn your minutes.</div>
        </div>
      );
    }
    // Pick ordinal — 1st, 2nd, 3rd, 21st, etc.
    const pickOrdinal=(()=>{
      const n=pick; const s=["th","st","nd","rd"];
      const v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]);
    })();
    return(
      <div>
        {/* PICK BANNER — prominent reveal of where the player was selected */}
        <div style={{
          background:`linear-gradient(135deg, ${teamData.p} 0%, ${teamData.s}66 60%, rgba(0,0,0,0.7) 100%)`,
          border:`1.5px solid ${teamData.s}`,
          borderRadius:14,
          padding:"18px 16px",
          marginBottom:14,
          textAlign:"center",
          boxShadow:`0 6px 20px ${teamData.p}55`,
        }}>
          <div style={{fontSize:10,letterSpacing:5,color:"rgba(255,255,255,0.75)",marginBottom:6,fontWeight:700}}>
            {nbaYear} NBA DRAFT
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:4}}>
            <div style={{fontSize:46,fontWeight:900,color:"#fff",lineHeight:1,textShadow:"0 3px 10px rgba(0,0,0,0.7)",fontFamily:"Impact, 'Arial Black', sans-serif"}}>
              #{pick}
            </div>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.8)",letterSpacing:2,lineHeight:1}}>{pickOrdinal.replace(/[0-9]+/,"").toUpperCase()}</div>
              <div style={{fontSize:13,fontWeight:900,color:"#fff",lineHeight:1.1,letterSpacing:1}}>OVERALL</div>
            </div>
          </div>
          <div style={{fontSize:11,letterSpacing:2,color:"rgba(255,255,255,0.7)",marginBottom:8}}>
            {roundLabel}
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,paddingTop:8,borderTop:"1px solid rgba(255,255,255,0.15)"}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:`radial-gradient(circle at 35% 30%, ${teamData.s} 0%, ${teamData.p} 65%, #000 100%)`,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(255,255,255,0.3)",fontSize:10,fontWeight:900,color:"#fff",flexShrink:0}}>{teamData.abbr}</div>
            <div style={{fontSize:17,fontWeight:900,color:"#fff",lineHeight:1}}>{team}</div>
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginTop:6,letterSpacing:1}}>
            Jersey #{jerseyNumber} · {player.position}
          </div>
        </div>

        {/* Roster status */}
        <div style={{background:isSecondRound?"rgba(168,138,255,0.12)":"rgba(0,220,100,0.12)",border:`1px solid ${isSecondRound?PU:GR}55`,borderRadius:10,padding:"10px 12px",marginBottom:14}}>
          <div style={{fontSize:11,letterSpacing:1.5,color:isSecondRound?PU:GR,fontWeight:700,marginBottom:3}}>{isSecondRound?"📋 NBA ROSTER · LIMITED ROLE":"🏀 NBA ROSTER LOCK"}</div>
          <div style={{fontSize:12,color:"#ccc",lineHeight:1.4}}>
            {isSecondRound
              ?`You're on the ${team} 15-man roster as a 2nd-round pick — expect limited minutes off the bench to start.`
              :`You're on the ${team} 15-man roster. Training camp opens in October.`}
          </div>
        </div>

        {/* Shoe deals — Lottery picks (top-14) see real brand offers. Below 14
            still see the box, but with a "No offers yet" message. Once signed,
            the chosen brand is locked in with a SIGNED badge. */}
        <ShoeDealsBlock
          pick={pick}
          isLottery={pick<=14}
          signedBrand={signedShoeBrand}
          toast={toast}
          onSign={(brand)=>{
            setSignedShoeBrand&&setSignedShoeBrand(brand);
            setMoney&&setMoney(m=>(m||0)+brand.bonus);
            setSkillPoints&&setSkillPoints(p=>(p||0)+brand.skillBonus);
            toast&&toast(`${brand.name} signed! ${fmtMoney(brand.bonus)} bonus + ${brand.skillBonus} SP`,"#FFD700");
          }}
        />

        {/* AC's Take — Austin Carr scout-voice blurb */}
        <div style={{background:"linear-gradient(135deg, rgba(232,135,58,0.12) 0%, rgba(0,0,0,0.4) 100%)",border:"1px solid rgba(232,135,58,0.35)",borderRadius:12,padding:14,marginBottom:14}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10}}>
            <img src={AC_CARR_DATA_URL} alt="Austin Carr" style={{width:64,height:64,borderRadius:"50%",objectFit:"cover",border:`2px solid ${OR}`,flexShrink:0}}/>
            <div>
              <div style={{fontSize:9,letterSpacing:2,color:OR,fontWeight:700,marginBottom:2}}>SCOUTING REPORT</div>
              <div style={{fontSize:18,fontWeight:900,color:"#fff",lineHeight:1.1}}>AC's Take</div>
              <div style={{fontSize:10,color:"#aaa",marginTop:2}}>Austin Carr · Cavaliers TV analyst</div>
            </div>
          </div>
          <div style={{fontSize:12,color:"#e0dbd4",lineHeight:1.6,fontStyle:"italic",borderLeft:`3px solid ${OR}`,paddingLeft:10}}>
            "{acTake({player,school,starTier,allYears})}"
          </div>
        </div>

        {/* Career profile */}
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:14,marginBottom:14}}>
          <Lbl color="#ddd">Career Profile</Lbl>
          {(()=>{
            const h=player.height||76;
            const heightStr=`${Math.floor(h/12)}'${h%12}"`;
            return [
              ["Age",age],
              ["Position",player.position||"SG"],
              ["Height",heightStr],
              ["Weight",`${player.weight||210} lbs`],
              ["Overall",ovr],
              ["Combine",combineScore||"--"],
              ["Interview",interviewScore?interviewScore+"/10":"--"],
              ["Agent",agent?.name||"—"],
            ].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:12,color:"#aaa"}}>{l}</span>
                <span style={{fontSize:13,fontWeight:700,color:OR}}>{v}</span>
              </div>
            ));
          })()}
        </div>

        {/* Year-by-year stats — every season at college / overseas */}
        {allYears.length>0&&(
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:14,marginBottom:14}}>
            <Lbl color="#ddd">College / Overseas Stats</Lbl>
            <div style={{display:"grid",gridTemplateColumns:"1.6fr 0.6fr 0.6fr 0.6fr 0.7fr",gap:4,fontSize:10,color:"#888",letterSpacing:1,marginBottom:6,paddingBottom:5,borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
              <div>SCHOOL</div><div style={{textAlign:"right"}}>PPG</div><div style={{textAlign:"right"}}>APG</div><div style={{textAlign:"right"}}>RPG</div><div style={{textAlign:"right"}}>FG%</div>
            </div>
            {allYears.map((y,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1.6fr 0.6fr 0.6fr 0.6fr 0.7fr",gap:4,fontSize:12,padding:"4px 0",borderBottom:i<allYears.length-1?"1px solid rgba(255,255,255,0.04)":"none",alignItems:"center"}}>
                <div style={{color:"#ddd"}}>
                  <div style={{fontWeight:700,lineHeight:1.1}}>{y.school?.name||"—"}</div>
                  <div style={{fontSize:9,color:"#666",marginTop:1}}>Year {y.year}</div>
                </div>
                <div style={{textAlign:"right",color:YE,fontWeight:700}}>{y.stats?.ppg||"—"}</div>
                <div style={{textAlign:"right",color:"#ddd",fontWeight:700}}>{y.stats?.apg||"—"}</div>
                <div style={{textAlign:"right",color:"#ddd",fontWeight:700}}>{y.stats?.rpg||"—"}</div>
                <div style={{textAlign:"right",color:"#ddd",fontWeight:700}}>{y.stats?.fg?y.stats.fg+"%":"—"}</div>
              </div>
            ))}
          </div>
        )}

        {/* Continue to the NBA hub — captures the team affiliation. */}
        <button onClick={()=>{
          setNbaTeam&&setNbaTeam(team);
          // Reset skill points to only the shoe-deal bonus (clears the 100-pt college pool).
          setSkillPoints&&setSkillPoints(signedShoeBrand?.skillBonus||0);
          // Persist draft status on the player so minutes/role logic can use it later.
          setPlayer&&setPlayer(p=>({...p,draftPick:pick,isUndrafted:false}));
          go&&go("leagueHub");
        }} style={{...btnS,fontSize:16,padding:14,marginTop:8}}>
          WELCOME TO THE LEAGUE →
        </button>
      </div>
    );
  }

  return null;
}

// ─── SAVE / LOAD ──────────────────────────────────────────────────────────────
// Persists the entire career to localStorage so the player can resume across
// app closes, browser restarts, and deploys. Saves are auto-written whenever
// any tracked state changes (no manual "save" button — modern game UX).
const SAVE_KEY = "gooden2003_save_v1";
// Bump this version if the save shape changes incompatibly. Old saves with a
// lower version will be ignored (treated as no save) rather than crashing.
const SAVE_VERSION = 1;
// Screens that are NOT part of the career flow — these are menu/info pages
// the user can visit at any time. We don't save them as the "resume to"
// destination, otherwise hitting "Resume Career" from the title would just
// return you to the title.
const MENU_SCREENS = new Set(["loadscreen","title","options","howto","extras","testing"]);

// Read a save from localStorage. Returns null if missing, malformed, or from
// an incompatible version.
function loadSave(){
  try{
    if(typeof localStorage==="undefined") return null;
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw) return null;
    const parsed=JSON.parse(raw);
    if(!parsed || parsed.version!==SAVE_VERSION) return null;
    if(!parsed.data || typeof parsed.data!=="object") return null;
    return parsed.data;
  }catch(e){
    return null;
  }
}

function writeSave(data){
  try{
    if(typeof localStorage==="undefined") return;
    localStorage.setItem(SAVE_KEY,JSON.stringify({version:SAVE_VERSION,savedAt:Date.now(),data}));
  }catch(e){
    // localStorage can throw on Safari private mode or quota exceeded — swallow
    // silently so the game continues to function without persistence.
  }
}

function clearSave(){
  try{
    if(typeof localStorage==="undefined") return;
    localStorage.removeItem(SAVE_KEY);
  }catch(e){}
}

// ─── NBA HELPERS ───────────────────────────────────────────────────────────────
// Look up the player's actual rotation slot on their team. Uses the player's
// position and OVR vs the existing roster's OVRs at that position. Returns the
// depth-chart index (0=starter, 1=first off bench, etc.) and starter status.
// `seasonData` is the per-team roster object for the current NBA season
// (the result of `getNbaSeasonData(year).data`).
function calcRotationSlot(player, teamName, seasonData, nbaSeasons){
  const data=seasonData?.[teamName];
  if(!data) return {slot:99, minutes:8, isStarter:false};
  const pos=player.position||"SG";
  const playerOvr=calcOVR(player.skills||{},player.intangibles||[]);
  // Players at the same position, sorted by OVR descending
  const samePos=data.players.filter(p=>p[1]===pos).sort((a,b)=>b[2]-a[2]);
  // Count how many existing players at this position are better
  const betterCount=samePos.filter(p=>p[2]>playerOvr).length;
  let slot=betterCount;
  // Rookie-year floor: 2nd-rounders sit at slot ≥ 2 (≤14 MPG), undrafted sit
  // at slot ≥ 3 (≤8 MPG). After year one, your OVR alone decides your role.
  const isRookie=!nbaSeasons||nbaSeasons.length===0;
  if(isRookie){
    if(player.isUndrafted) slot=Math.max(slot,3);
    else if(player.draftPick&&player.draftPick>=31) slot=Math.max(slot,2);
  }
  const isStarter=slot===0;
  // Minutes by depth: 0→34, 1→24, 2→14, 3→8, 4+→4
  const mpgBySlot=[34,24,14,8,4];
  const minutes=mpgBySlot[Math.min(slot,4)];
  return {slot, minutes, isStarter};
}

// Run-of-season stat generator. Given the player's profile, mini-game points,
// and minutes, produce per-game PPG/RPG/APG/FG% for THIS chunk of games.
function generateNbaGameStats(player, totalPts, made, minutes, mentor){
  const posMult={
    PG:{ppg:0.85,apg:1.6,rpg:0.55},
    SG:{ppg:1.00,apg:0.9,rpg:0.65},
    SF:{ppg:0.95,apg:0.7,rpg:0.95},
    PF:{ppg:0.90,apg:0.5,rpg:1.40},
    C: {ppg:0.85,apg:0.4,rpg:1.70},
  };
  const pm=posMult[player.position]||posMult.SG;
  // Minutes factor — 36 minutes is "full starter load"
  const minFactor=minutes/36;
  // Scoring skill influences PPG
  const scoringSkill=((player.skills?.threePoint||50)+(player.skills?.midRange||50)+(player.skills?.finishing||50))/3;
  const scoringMult=0.70+scoringSkill/200;
  // Height bonus for rebounds
  const heightBonus=Math.max(0,(player.height-74)*0.18);
  // Mentor bump: +5% across the board if they have a mentor
  const mentorMult=mentor?1.05:1.0;
  // Mini-game performance ratio (0.0-1.0 of max 15 pts across 5 games)
  const perf=Math.min(1,totalPts/15);
  // PPG calculation — blends position role × scoring skill × minutes × perf
  const ppg=parseFloat((perf*22*minFactor*pm.ppg*scoringMult*mentorMult).toFixed(1));
  // APG
  const playmaking=(player.skills?.playmaking||50)/10;
  const apg=parseFloat((playmaking*minFactor*pm.apg*mentorMult).toFixed(1));
  // RPG
  const rebounding=(player.skills?.rebounding||50)/9;
  const rpg=parseFloat((rebounding*minFactor*pm.rpg+heightBonus*minFactor).toFixed(1));
  // FG% — roughly 40-55% range based on shot accuracy
  const fgPct=Math.round(38+(perf*15)+(scoringSkill-50)*0.1);
  return {ppg, apg, rpg, fg:clamp(fgPct,30,60)};
}

// Returns a sorted-by-OVR-then-position depth chart array for display. The
// player is inserted at their proper slot. `seasonData` is the per-team roster
// object for the current NBA season.
function buildDepthChart(player, teamName, seasonData){
  const data=seasonData?.[teamName];
  if(!data) return [];
  const playerOvr=calcOVR(player.skills||{},player.intangibles||[]);
  const playerEntry={name:player.name||"You", position:player.position, ovr:playerOvr, isPlayer:true};
  // Convert roster array to objects
  const all=data.players.map(p=>({name:p[0], position:p[1], ovr:p[2], isPlayer:false}));
  all.push(playerEntry);
  // Group by position, sort each group by OVR desc
  const byPos={};
  ["PG","SG","SF","PF","C"].forEach(p=>{
    byPos[p]=all.filter(x=>x.position===p).sort((a,b)=>b.ovr-a.ovr);
  });
  return byPos;
}

// Build a Starting Five + Bench rotation view. Starters are slot-0 at each
// position (one PG, one SG, one SF, one PF, one C). Bench is everyone else,
// sorted by minutes per game descending — so the 6th man (slot 1 at any
// position, 24 MPG) leads, deep bench (slot 4+, 4 MPG) trails. The player gets
// the same rookie-year floor as calcRotationSlot, so 2nd-round and undrafted
// players are forced down the depth chart in year one.
function buildRotation(player, teamName, seasonData, nbaSeasons){
  const data=seasonData?.[teamName];
  if(!data) return {starters:[], bench:[]};
  const playerOvr=calcOVR(player.skills||{},player.intangibles||[]);
  const playerEntry={name:player.name||"You", position:player.position, ovr:playerOvr, isPlayer:true};
  const all=data.players.map(p=>({name:p[0], position:p[1], ovr:p[2], isPlayer:false}));
  all.push(playerEntry);
  const mpgBySlot=[34,24,14,8,4];
  const isRookie=!nbaSeasons||nbaSeasons.length===0;
  // For each position: sort by OVR, then nudge the player down to their floor.
  const byPos={};
  ["PG","SG","SF","PF","C"].forEach(pos=>{
    const list=all.filter(x=>x.position===pos).sort((a,b)=>b.ovr-a.ovr);
    if(isRookie){
      const i=list.findIndex(x=>x.isPlayer);
      if(i>=0){
        let floor=i;
        if(player.isUndrafted) floor=Math.max(i,3);
        else if(player.draftPick&&player.draftPick>=31) floor=Math.max(i,2);
        if(floor>i){
          const [me]=list.splice(i,1);
          list.splice(floor,0,me);
        }
      }
    }
    byPos[pos]=list;
  });
  // Now stamp each player with their slot + mpg
  const enriched=[];
  ["PG","SG","SF","PF","C"].forEach(pos=>{
    byPos[pos].forEach((p,slot)=>{
      enriched.push({...p, slot, mpg:mpgBySlot[Math.min(slot,4)]});
    });
  });
  const posOrder={PG:0,SG:1,SF:2,PF:3,C:4};
  const starters=enriched.filter(p=>p.slot===0).sort((a,b)=>posOrder[a.position]-posOrder[b.position]);
  // Bench: limit to 8 (so total roster shown = 13). Sort by MPG desc, then OVR desc.
  const bench=enriched.filter(p=>p.slot!==0).sort((a,b)=>b.mpg-a.mpg||b.ovr-a.ovr).slice(0,8);
  return {starters, bench};
}

// ─── NBA GAME RUNNER ───────────────────────────────────────────────────────────
// Reuses the same 5 mini-games but feeds results into NBA stat calculations.
// Each completed sequence = "41 games" of chunked simulation. The orchestrator
// reports {totalPts, made, gameDetails} on completion.
function NbaGameSequence({player, mentor, minutes, onComplete}){
  // The "difficulty" in the NBA is higher across the board — every defender
  // is a pro. We base it on the player's slot quality (lower slot = harder
  // matchups for them since better defenders guard the starters).
  const difficulty=1.3;
  // Results is the SOURCE OF TRUTH. gameIdx (which mini-game to show) is
  // derived from results.length, so they can never desynchronize.
  const [results,setResults]=useState([]);
  const [phase,setPhase]=useState("intro");
  // Guard rail: ensures onComplete fires exactly once even if a mini-game
  // accidentally calls onResult twice (e.g., event bubbling, stray setTimeout).
  const completedRef=useRef(false);

  // Finalize once we have all 5 results. Wrapped so handleResult and
  // skipRemaining share the logic. Deferred via setTimeout so onComplete
  // (which calls go("leagueHub")) never fires mid-render.
  const finalize=(all)=>{
    if(completedRef.current) return;
    completedRef.current=true;
    const totalPts=all.reduce((a,b)=>a+(b.pts||0),0);
    const made=all.filter(x=>x.made).length;
    setTimeout(()=>onComplete&&onComplete({totalPts,made,details:all}),0);
  };

  const handleResult=(r)=>{
    if(completedRef.current) return; // already finalized — ignore late fires
    setResults(prev=>{
      // Don't add more results once we've hit the cap — guards against
      // double-fire bugs (event bubbling, late setTimeout, strict mode).
      if(prev.length>=MINI_GAMES.length) return prev;
      const next=[...prev,r];
      if(next.length>=MINI_GAMES.length){
        finalize(next);
      }
      return next;
    });
  };

  // Escape hatch — auto-simulates any remaining mini-games as mediocre results
  // and finalizes the stretch. Saves the user if a single mini-game hits a bug.
  const skipRemaining=()=>{
    if(completedRef.current) return;
    setResults(prev=>{
      if(prev.length>=MINI_GAMES.length) return prev;
      const filler=[];
      for(let i=prev.length;i<MINI_GAMES.length;i++){
        filler.push({type:MINI_GAMES[i]||"sim",made:Math.random()<0.4,pts:rand(0,2),simmed:true});
      }
      const next=[...prev,...filler];
      finalize(next);
      return next;
    });
  };

  // gameIdx is derived — always equal to how many results we have, clamped
  // so we don't read past MINI_GAMES while waiting for onComplete to fire.
  const allDone=results.length>=MINI_GAMES.length;
  const gameIdx=Math.min(results.length,MINI_GAMES.length-1);
  const gameType=MINI_GAMES[gameIdx];

  // Auto-simulate the entire 5-game stretch. Randomized but biased by the
  // player's OVR — elite players get better simmed numbers, scrubs get worse.
  // Goes through the same finalize() flow so SP awards and stat application
  // are identical whether the user plays or sims.
  const simStretch=()=>{
    if(completedRef.current) return;
    setPhase("playing"); // jumps past the intro so the "Calculating…" view shows
    const ovr=calcOVR(player.skills||{},player.intangibles||[]);
    // skillFactor ranges roughly 0.45 (OVR 45) → 0.99 (OVR 99). Used to bias
    // both made% and pts so a 90-OVR sim doesn't roll like a 55-OVR sim.
    const skillFactor=Math.min(0.99,Math.max(0.45,ovr/100));
    setResults(prev=>{
      if(prev.length>=MINI_GAMES.length) return prev;
      const fake=[];
      for(let i=0;i<MINI_GAMES.length;i++){
        const made=Math.random()<(0.40+skillFactor*0.40); // 0.58 - 0.80 made-rate
        // pts distribution: 0 (miss) / 1 (made low) / 2 (made solid) / 3 (perfect)
        let pts=0;
        if(made){
          const roll=Math.random();
          if(roll<skillFactor*0.30) pts=3;
          else if(roll<0.5+skillFactor*0.20) pts=2;
          else pts=1;
        }
        fake.push({type:MINI_GAMES[i],made,pts,simmed:true});
      }
      finalize(fake);
      return fake;
    });
  };

  if(phase==="intro") return(
    <div style={{textAlign:"center",padding:"20px 0"}}>
      <div style={{fontSize:11,letterSpacing:3,color:OR,marginBottom:10,textTransform:"uppercase"}}>Game Stretch</div>
      <div style={{fontSize:13,color:"#aaa",marginBottom:6,lineHeight:1.5}}>You'll play 5 key situations representing 41 games of the season.</div>
      <div style={{fontSize:12,color:"#888",marginBottom:18}}>Your stat line will be based on minutes ({minutes}/game), performance, and skill.</div>
      <button onClick={()=>setPhase("playing")} style={{...btnS,width:"auto",padding:"12px 36px",marginBottom:10}}>BEGIN STRETCH →</button>
      <div>
        <button onClick={simStretch} style={{padding:"8px 18px",background:"transparent",border:"1px solid rgba(255,255,255,0.18)",borderRadius:8,color:"#aaa",cursor:"pointer",fontSize:11,letterSpacing:1.5,fontFamily:"'Barlow Condensed',sans-serif"}}>⚡ SIM STRETCH</button>
      </div>
      <div style={{fontSize:10,color:"#666",marginTop:6,lineHeight:1.5}}>Sim auto-rolls results based on your OVR.<br/>Stats and SP still apply.</div>
    </div>
  );
  // `key` MUST be a JSX attribute, not part of spread props, or React ignores it
  // and the mini-game retains stale state when the index advances.
  const childProps={player,difficulty,onResult:handleResult};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,fontSize:11,color:"#888"}}>
        <span>Game {Math.min(results.length+1,MINI_GAMES.length)}/{MINI_GAMES.length}</span>
        <span>{minutes} min/game · {mentor?`Mentor: ${mentor}`:"No mentor"}</span>
      </div>
      <div style={{display:"flex",gap:3,marginBottom:14}}>
        {MINI_GAMES.map((_,i)=>(
          <div key={i} style={{flex:1,height:4,borderRadius:2,background:i<results.length?(results[i].made?GR:RE):i===gameIdx?OR:"rgba(255,255,255,0.08)"}}/>
        ))}
      </div>
      {/* Once all 5 results are in, show a "calculating" placeholder until
          the deferred onComplete fires (next tick). Stops the last mini-game
          from briefly re-rendering before the screen transitions. */}
      {allDone?(
        <div style={{textAlign:"center",padding:"30px 0"}}>
          <div style={{fontSize:14,color:OR,fontWeight:700,letterSpacing:2,marginBottom:6}}>STRETCH COMPLETE</div>
          <div style={{fontSize:12,color:"#888"}}>Calculating stats…</div>
        </div>
      ):(
        <>
          {gameType==="shot"&&<ShotMeterGame key={gameIdx} {...childProps}/>}
          {gameType==="defense"&&<DefenseGame key={gameIdx} {...childProps}/>}
          {gameType==="possession"&&<OffensivePossessionGame key={gameIdx} {...childProps}/>}
          {gameType==="steal"&&<StealAndDunkGame key={gameIdx} {...childProps}/>}
          {gameType==="pass"&&<PassingGame key={gameIdx} {...childProps}/>}
          {/* Escape hatch — auto-sims the rest if a mini-game gets stuck. Tucked
              well below the game so it's hard to mistap. */}
          {results.length>0&&(
            <div style={{marginTop:28,textAlign:"center",opacity:0.5}}>
              <button onClick={skipRemaining} style={{padding:"6px 12px",background:"transparent",border:"1px solid rgba(255,255,255,0.15)",borderRadius:6,color:"#888",cursor:"pointer",fontSize:10,letterSpacing:1.5,fontFamily:"'Barlow Condensed',sans-serif"}}>↠ skip remaining ({MINI_GAMES.length-results.length})</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── LEAGUE HUB ────────────────────────────────────────────────────────────────
// The post-draft "home screen" — like the title menu, but with the team logo,
// current W-L record, and 5 menu options.
function LeagueHub({player, nbaTeam, nbaSeasons, nbaGamesPlayed, nbaSeasonTotals, playoffsDone, skillPoints, go}){
  const teamData=NBA_TEAM_DATA[nbaTeam]||{p:"#444",s:"#888",abbr:"???"};
  const seasonsPlayed=nbaSeasons.length;
  const currentYear=NBA_START_YEAR+seasonsPlayed;
  const season=getNbaSeasonData(currentYear).data[nbaTeam]||{w:0,l:0};
  // Current season's projected record proportional to games played
  const gp=nbaGamesPlayed;
  const projectedW=Math.round((season.w*gp)/82);
  const projectedL=gp-projectedW;
  const yearLabel=formatSeasonLabel(currentYear);
  // Player's overall rating — shown as a badge so they can see the impact of
  // skill-point spending at a glance.
  const ovr=calcOVR(player.skills||{},player.intangibles||[]);
  // Determine playoff eligibility — top 8 in each conference. With our data
  // ~50% of teams qualify. A team with ≥41 wins always makes it; below that,
  // we use the season record.
  const madePlayoffs=season.w>=41;
  // What does "Play" actually do right now?
  const regSeasonDone=gp>=82;
  const playoffsAvailable=regSeasonDone && madePlayoffs && !playoffsDone;
  let playLabel="PLAY";
  let playSub="";
  if(gp===0) playSub=`Start the ${yearLabel} season (41 games)`;
  else if(gp<82) playSub=`Continue season — ${gp}/82 played`;
  else if(playoffsAvailable) {playLabel="PLAYOFFS";playSub="Season over — playoff run begins";}
  else if(playoffsDone) {playLabel="OFFSEASON";playSub="Season complete — start next year";}
  else if(regSeasonDone && !madePlayoffs) {playLabel="OFFSEASON";playSub="Missed the playoffs — start next year";}
  // Live PPG/RPG/APG for the in-progress season — pulled from running totals.
  const liveGp=nbaSeasonTotals.games||0;
  const livePpg=liveGp>0?(nbaSeasonTotals.pts/liveGp).toFixed(1):null;
  const liveRpg=liveGp>0?(nbaSeasonTotals.reb/liveGp).toFixed(1):null;
  const liveApg=liveGp>0?(nbaSeasonTotals.ast/liveGp).toFixed(1):null;
  return(
    <div style={{padding:"4px 0 20px"}}>
      {/* Team / season banner — anchored by the team's primary color */}
      <div style={{
        background:`linear-gradient(135deg, ${teamData.p}55 0%, rgba(0,0,0,0.7) 80%)`,
        border:`1px solid ${teamData.p}88`,
        borderRadius:14, padding:"14px 16px", marginBottom:12,
        display:"flex", alignItems:"center", gap:14, position:"relative", overflow:"hidden"
      }}>
        {/* Faint diagonal team-color streak for visual interest */}
        <div style={{position:"absolute",top:-20,right:-30,width:120,height:140,background:`linear-gradient(135deg, ${teamData.s}22, transparent)`,transform:"rotate(15deg)",pointerEvents:"none"}}/>
        <TeamEmblem colors={{p:teamData.p,s:teamData.s}} abbr={teamData.abbr} name={nbaTeam} size={62} logoUrl={teamData.logoUrl}/>
        <div style={{flex:1,minWidth:0,position:"relative"}}>
          <div style={{fontSize:10,letterSpacing:2,color:"#ddd",textTransform:"uppercase",marginBottom:2,fontWeight:700}}>{yearLabel} Season</div>
          <div style={{fontSize:15,fontWeight:900,color:"#fff",lineHeight:1.1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{nbaTeam}</div>
          <div style={{fontSize:13,color:"#ddd",marginTop:4}}>
            <span style={{color:GR,fontWeight:700}}>{projectedW}</span><span style={{color:"#666",margin:"0 4px"}}>–</span><span style={{color:RE,fontWeight:700}}>{projectedL}</span>
            <span style={{color:"#888",marginLeft:8,fontSize:11}}>· {gp}/82</span>
          </div>
        </div>
        {/* OVR badge */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"6px 10px",background:"rgba(0,0,0,0.45)",borderRadius:10,border:`1px solid ${ovr>=85?GR:ovr>=75?OR:"#666"}55`}}>
          <div style={{fontSize:9,letterSpacing:1.5,color:"#888",fontWeight:700}}>OVR</div>
          <div style={{fontSize:22,fontWeight:900,color:ovr>=85?GR:ovr>=75?OR:"#ddd",lineHeight:1}}>{ovr}</div>
        </div>
      </div>

      {/* Quick stat strip — only shows mid-season when there's data to display */}
      {liveGp>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12,padding:"10px 8px",background:"rgba(255,255,255,0.03)",borderRadius:10,border:"1px solid rgba(255,255,255,0.06)"}}>
          {[["PPG",livePpg],["RPG",liveRpg],["APG",liveApg]].map(([l,v])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontSize:9,letterSpacing:1.5,color:"#666",fontWeight:700}}>{l}</div>
              <div style={{fontSize:18,fontWeight:900,color:OR,lineHeight:1.1}}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Menu options — PLAY hero card, then 5 menu rows */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {/* PLAY — primary action, bigger and brighter */}
        <button onClick={()=>go("nbaPlay")} style={{...btnS,padding:"15px 18px",textAlign:"left",position:"relative",fontSize:14,boxShadow:"0 2px 8px rgba(232,135,58,0.3)"}}>
          <div style={{fontSize:18,fontWeight:900,letterSpacing:2}}>▶ {playLabel}</div>
          {playSub&&<div style={{fontSize:11,fontWeight:600,color:"rgba(0,0,0,0.65)",marginTop:3,letterSpacing:0.5}}>{playSub}</div>}
        </button>

        {/* Skills — shows SP balance inline */}
        <button onClick={()=>go("nbaSkills")} style={{padding:"12px 14px",textAlign:"left",background:"rgba(255,255,255,0.04)",border:`1px solid ${skillPoints>0?YE+"55":"rgba(255,255,255,0.08)"}`,borderRadius:10,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",gap:12,fontFamily:"'Barlow Condensed',sans-serif"}}>
          <div style={{fontSize:22,width:34,textAlign:"center"}}>⚡</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:900,letterSpacing:2}}>SKILLS</div>
            <div style={{fontSize:11,fontWeight:400,color:"#888",marginTop:1}}>Train your player</div>
          </div>
          {skillPoints>0&&<div style={{padding:"3px 9px",background:YE,color:"#080c10",borderRadius:10,fontSize:11,fontWeight:900}}>{skillPoints} SP</div>}
        </button>

        {/* Team */}
        <button onClick={()=>go("nbaTeam")} style={{padding:"12px 14px",textAlign:"left",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",gap:12,fontFamily:"'Barlow Condensed',sans-serif"}}>
          <div style={{fontSize:22,width:34,textAlign:"center"}}>👥</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:900,letterSpacing:2}}>TEAM</div>
            <div style={{fontSize:11,fontWeight:400,color:"#888",marginTop:1}}>Roster, depth chart, mentor</div>
          </div>
        </button>

        {/* Agent — new screen for contract/trade requests */}
        <button onClick={()=>go("nbaAgent")} style={{padding:"12px 14px",textAlign:"left",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",gap:12,fontFamily:"'Barlow Condensed',sans-serif"}}>
          <div style={{fontSize:22,width:34,textAlign:"center"}}>📞</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:900,letterSpacing:2}}>AGENT</div>
            <div style={{fontSize:11,fontWeight:400,color:"#888",marginTop:1}}>Contracts & trade requests</div>
          </div>
        </button>

        {/* Spend (formerly Bank) */}
        <button onClick={()=>go("nbaSpend")} style={{padding:"12px 14px",textAlign:"left",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",gap:12,opacity:0.7,fontFamily:"'Barlow Condensed',sans-serif"}}>
          <div style={{fontSize:22,width:34,textAlign:"center"}}>💰</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:900,letterSpacing:2}}>SPEND</div>
            <div style={{fontSize:11,fontWeight:400,color:"#888",marginTop:1}}>Bankroll · coming soon</div>
          </div>
        </button>

        {/* Stats */}
        <button onClick={()=>go("nbaStats")} style={{padding:"12px 14px",textAlign:"left",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",gap:12,fontFamily:"'Barlow Condensed',sans-serif"}}>
          <div style={{fontSize:22,width:34,textAlign:"center"}}>📊</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:900,letterSpacing:2}}>STATS</div>
            <div style={{fontSize:11,fontWeight:400,color:"#888",marginTop:1}}>Career stats — college & pros</div>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── NBA PLAY (game stretch screen) ────────────────────────────────────────────
function NbaPlayScreen({player, nbaTeam, nbaGamesPlayed, setNbaGamesPlayed, nbaSeasonTotals, setNbaSeasonTotals, nbaSeasons, setNbaSeasons, nbaMentor, playoffsDone, setPlayoffsDone, skillPoints, setSkillPoints, go, toast}){
  const teamData=NBA_TEAM_DATA[nbaTeam]||{p:"#444",s:"#888",abbr:"???"};
  const seasonsPlayed=nbaSeasons.length;
  const currentYear=NBA_START_YEAR+seasonsPlayed;
  const seasonData=getNbaSeasonData(currentYear).data;
  const season=seasonData[nbaTeam]||{w:0,l:0};
  const {slot, minutes, isStarter}=calcRotationSlot(player,nbaTeam,seasonData,nbaSeasons);
  const gp=nbaGamesPlayed;
  const regSeasonDone=gp>=82;
  const madePlayoffs=season.w>=41;
  const isPlayoffRun=regSeasonDone && madePlayoffs && !playoffsDone;
  const yearLabel=formatSeasonLabel(currentYear);

  // Offseason path — finalize the season's stats into history, reset season totals,
  // and bounce back to the hub.
  if((regSeasonDone&&!madePlayoffs)||(regSeasonDone&&madePlayoffs&&playoffsDone)){
    return(
      <div style={{textAlign:"center",padding:"24px 0"}}>
        <div style={{fontSize:10,letterSpacing:3,color:"#aaa",marginBottom:6}}>{yearLabel} SEASON</div>
        <div style={{fontSize:24,fontWeight:900,color:OR,marginBottom:14}}>OFFSEASON</div>
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:12,padding:16,marginBottom:14,textAlign:"left"}}>
          <Lbl color="#ddd">Final {yearLabel} Stats</Lbl>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,textAlign:"center",marginTop:8}}>
            {[
              ["PPG",nbaSeasonTotals.games>0?(nbaSeasonTotals.pts/nbaSeasonTotals.games).toFixed(1):"--"],
              ["RPG",nbaSeasonTotals.games>0?(nbaSeasonTotals.reb/nbaSeasonTotals.games).toFixed(1):"--"],
              ["APG",nbaSeasonTotals.games>0?(nbaSeasonTotals.ast/nbaSeasonTotals.games).toFixed(1):"--"],
              ["GP",nbaSeasonTotals.games],
            ].map(([l,v])=>(
              <div key={l}>
                <div style={{fontSize:9,color:"#666",letterSpacing:1.5,marginBottom:2}}>{l}</div>
                <div style={{fontSize:18,fontWeight:900,color:OR}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid rgba(255,255,255,0.06)",fontSize:11,color:"#aaa"}}>
            Team record: <span style={{color:GR,fontWeight:700}}>{season.w}</span>-<span style={{color:RE,fontWeight:700}}>{season.l}</span> {madePlayoffs?"· Made playoffs ✓":"· Missed playoffs"}
          </div>
        </div>
        <button onClick={()=>{
          // Push this season into history, then reset for next year.
          const totals=nbaSeasonTotals;
          const seasonEntry={
            year:yearLabel, team:nbaTeam, teamRecord:`${season.w}-${season.l}`, madePlayoffs,
            gp:totals.games,
            ppg:totals.games>0?+(totals.pts/totals.games).toFixed(1):0,
            rpg:totals.games>0?+(totals.reb/totals.games).toFixed(1):0,
            apg:totals.games>0?+(totals.ast/totals.games).toFixed(1):0,
            fg:totals.fga>0?Math.round((totals.fgm/totals.fga)*100):0,
          };
          setNbaSeasons(prev=>[...prev,seasonEntry]);
          setNbaGamesPlayed(0);
          setNbaSeasonTotals({pts:0,reb:0,ast:0,games:0,fgm:0,fga:0});
          setPlayoffsDone(false);
          go("leagueHub");
        }} style={{...btnS,padding:"12px 32px"}}>NEXT SEASON →</button>
      </div>
    );
  }

  // Active game stretch (regular or playoff).
  const stretchSize=isPlayoffRun?16:41;
  return(
    <div>
      <div style={{textAlign:"center",marginBottom:14}}>
        <div style={{fontSize:10,letterSpacing:3,color:isPlayoffRun?YE:OR,marginBottom:4,textTransform:"uppercase"}}>
          {isPlayoffRun?"🏆 Playoff Run":(gp===0?`${yearLabel} Season — Games 1-41`:`Games 42-82`)}
        </div>
        <div style={{fontSize:13,color:"#aaa"}}>
          {isStarter?"STARTER":`Bench · slot ${slot+1}`} · ~{minutes} MPG
        </div>
      </div>
      <NbaGameSequence
        player={player}
        mentor={nbaMentor}
        minutes={minutes}
        onComplete={({totalPts,made})=>{
          // Generate stats for this stretch
          const stats=generateNbaGameStats(player,totalPts,made,minutes,nbaMentor);
          // Apply to season totals (each stretch = `stretchSize` games)
          setNbaSeasonTotals(prev=>({
            pts:prev.pts+stats.ppg*stretchSize,
            reb:prev.reb+stats.rpg*stretchSize,
            ast:prev.ast+stats.apg*stretchSize,
            games:prev.games+stretchSize,
            fgm:prev.fgm+Math.round(stats.fg*0.18*stretchSize),
            fga:prev.fga+Math.round(0.18*100*stretchSize),
          }));
          // Award SP based on stretch performance — totalPts maxes around 15
          // (5 mini-games × 3 max pts each), so the formula gives 1-8 SP per
          // stretch. Floors at 1 so showing up always earns something.
          const spEarned=Math.max(1,Math.round(totalPts/2));
          setSkillPoints&&setSkillPoints(p=>(p||0)+spEarned);
          if(isPlayoffRun){
            setPlayoffsDone(true);
            toast&&toast(`Playoffs done! ${stats.ppg} PPG · ${stats.rpg} RPG · ${stats.apg} APG · +${spEarned} SP`,YE);
          } else {
            setNbaGamesPlayed(g=>g+41);
            toast&&toast(`Stretch done! ${stats.ppg} PPG · ${stats.rpg} RPG · ${stats.apg} APG · +${spEarned} SP`,OR);
          }
          go("leagueHub");
        }}
      />
    </div>
  );
}

// ─── NBA SKILLS ────────────────────────────────────────────────────────────────
// Lets player spend skill points to improve attributes during the season.
function NbaSkillsScreen({player, setPlayer, skillPoints, setSkillPoints, go, toast}){
  const skills=player.skills||{};
  // Use the global SKILLS list so labels & icons match the rest of the game.
  const SKILL_LIST=SKILLS;
  // Intangibles the player picked during build/college — shown read-only on the
  // skills page so the player can see their full profile in one place.
  const playerIntangs=(player.intangibles||[]).map(id=>INTANGIBLES.find(t=>t.id===id)).filter(Boolean);
  const bumpSkill=(id)=>{
    if(skillPoints<=0) return toast&&toast("Out of skill points","#888");
    const cur=skills[id]||50;
    if(cur>=99) return toast&&toast(`${id} is maxed at 99`,"#888");
    // Spend up to 5 SP, but don't overshoot the 99 cap or your remaining SP balance.
    const spend=Math.min(5,skillPoints,99-cur);
    setPlayer(p=>({...p,skills:{...p.skills,[id]:(p.skills?.[id]||50)+spend}}));
    setSkillPoints(p=>p-spend);
  };
  return(
    <div>
      <div style={{textAlign:"center",marginBottom:14}}>
        <div style={{fontSize:10,letterSpacing:3,color:OR,marginBottom:4,textTransform:"uppercase"}}>Train</div>
        <div style={{fontSize:24,fontWeight:900,color:"#fff"}}>SKILLS</div>
        <div style={{fontSize:13,color:"#aaa",marginTop:4}}>Skill Points: <span style={{color:YE,fontWeight:900,fontSize:16}}>{skillPoints}</span></div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
        {SKILL_LIST.map(s=>{
          const v=skills[s.id]||50;
          return(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.04)",padding:"10px 12px",borderRadius:8}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{s.icon} {s.label}</div>
                <div style={{height:5,background:"rgba(255,255,255,0.08)",borderRadius:3,marginTop:5,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${v}%`,background:v>=80?GR:v>=65?OR:"#888"}}/>
                </div>
              </div>
              <div style={{fontSize:14,fontWeight:900,color:OR,minWidth:28,textAlign:"right"}}>{v}</div>
              <button onClick={()=>bumpSkill(s.id)} disabled={skillPoints<=0||v>=99} style={{padding:"6px 12px",background:skillPoints>0&&v<99?OR:"rgba(255,255,255,0.08)",border:"none",borderRadius:6,color:skillPoints>0&&v<99?"#080c10":"#666",fontWeight:900,cursor:skillPoints>0&&v<99?"pointer":"default",fontSize:13,fontFamily:"'Barlow Condensed',sans-serif"}}>+5</button>
            </div>
          );
        })}
      </div>

      {/* Intangibles — picked at build time / earned during college. Read-only
          on the skills page since they're won, not bought with SP. */}
      <div style={{fontSize:10,letterSpacing:3,color:GO,textTransform:"uppercase",fontWeight:700,marginBottom:8,marginTop:4}}>Intangibles</div>
      {playerIntangs.length===0?(
        <div style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"12px 14px",fontSize:11,color:"#888",fontStyle:"italic",marginBottom:14,lineHeight:1.5}}>
          No intangibles yet — earn them at the start of your career or through college breakthroughs.
        </div>
      ):(
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
          {playerIntangs.map(t=>(
            <div key={t.id} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 11px",background:"rgba(255,215,0,0.08)",border:"1px solid rgba(255,215,0,0.28)",borderRadius:20,fontSize:11,fontWeight:700,color:"#f0ede8"}}>
              <span style={{fontSize:14}}>{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      )}

      <button onClick={()=>go("leagueHub")} style={ghostS}>← Back to Hub</button>
    </div>
  );
}

// ─── NBA TEAM ──────────────────────────────────────────────────────────────────
// Roster view by position with depth chart. Mentor selection at the top.
function NbaTeamScreen({player, nbaTeam, nbaSeasons, nbaMentor, setNbaMentor, skillPoints, setSkillPoints, go, toast}){
  const teamData=NBA_TEAM_DATA[nbaTeam]||{p:"#444",s:"#888",abbr:"???"};
  const currentYear=NBA_START_YEAR+(nbaSeasons||[]).length;
  const seasonData=getNbaSeasonData(currentYear).data;
  const {starters, bench}=buildRotation(player,nbaTeam,seasonData,nbaSeasons);
  const {slot, minutes}=calcRotationSlot(player,nbaTeam,seasonData,nbaSeasons);
  // Role label by slot — gives the player a feel for where they fit beyond just MPG.
  const roleLabel=slot===0?"STARTER":slot===1?"6TH MAN":slot===2?"ROTATION":slot===3?"BENCH":"DEEP BENCH";
  const [showMentorPick,setShowMentorPick]=useState(false);

  const chooseMentor=(name)=>{
    if(nbaMentor){
      toast&&toast(`You already have a mentor: ${nbaMentor}`,"#888");
      return;
    }
    setNbaMentor(name);
    setSkillPoints(p=>p+5);
    toast&&toast(`${name} is now your mentor! +5 SP`,GR);
    setShowMentorPick(false);
  };

  // Eligible mentors = ALL teammates on the roster (NOT including the player).
  // The veteran-restriction (OVR >= 75) was removed — any teammate can be picked.
  const data=seasonData[nbaTeam];
  const mentorCandidates=data?data.players.map(p=>({name:p[0],pos:p[1],ovr:p[2]})):[];

  return(
    <div>
      <div style={{textAlign:"center",marginBottom:14}}>
        <div style={{fontSize:10,letterSpacing:3,color:OR,marginBottom:4,textTransform:"uppercase"}}>Roster</div>
        <div style={{fontSize:22,fontWeight:900,color:"#fff",lineHeight:1.1}}>{nbaTeam}</div>
        <div style={{fontSize:12,color:"#aaa",marginTop:4}}>
          You · <span style={{color:OR,fontWeight:900,letterSpacing:1}}>{roleLabel}</span> · <span style={{color:"#fff",fontWeight:700}}>{minutes}</span> MPG
        </div>
      </div>

      {/* Mentor block */}
      <div style={{background:"rgba(255,215,0,0.06)",border:`1px solid ${nbaMentor?GO:"rgba(255,215,0,0.18)"}55`,borderRadius:10,padding:12,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:10,letterSpacing:2,color:GO,textTransform:"uppercase",fontWeight:700}}>Mentor</div>
            <div style={{fontSize:15,fontWeight:900,color:"#fff",marginTop:2}}>{nbaMentor||"No mentor selected"}</div>
            <div style={{fontSize:10,color:"#aaa",marginTop:1}}>{nbaMentor?"+5% performance boost (active)":"Pick a vet for a one-time +5 SP"}</div>
          </div>
          {!nbaMentor&&mentorCandidates.length>0&&(
            <button onClick={()=>setShowMentorPick(s=>!s)} style={{padding:"7px 12px",background:GO,border:"none",borderRadius:6,color:"#080c10",fontWeight:900,cursor:"pointer",fontSize:11,letterSpacing:1,fontFamily:"'Barlow Condensed',sans-serif"}}>{showMentorPick?"CANCEL":"CHOOSE"}</button>
          )}
        </div>
        {showMentorPick&&(
          <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:5}}>
            {mentorCandidates.map(m=>(
              <button key={m.name} onClick={()=>chooseMentor(m.name)} style={{textAlign:"left",padding:"8px 11px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:6,color:"#fff",cursor:"pointer",fontSize:12,fontFamily:"'Barlow Condensed',sans-serif"}}>
                <span style={{fontWeight:700}}>{m.name}</span> <span style={{color:"#888"}}>· {m.pos} · {m.ovr} OVR</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* STARTING FIVE — one per position, in PG-SG-SF-PF-C order */}
      <div style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"10px 12px",marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
          <div style={{fontSize:10,letterSpacing:2,color:OR,textTransform:"uppercase",fontWeight:700}}>Starting Five</div>
          <div style={{fontSize:9,color:"#666",letterSpacing:1}}>POS · NAME · OVR · MPG</div>
        </div>
        {starters.map((p,i)=>(
          <div key={p.name+i} style={{
            display:"grid",gridTemplateColumns:"28px 1fr auto auto",alignItems:"center",gap:8,
            padding:"6px 8px",marginBottom:3,
            background:p.isPlayer?"rgba(232,135,58,0.18)":"transparent",
            border:p.isPlayer?`1px solid ${OR}66`:"1px solid transparent",
            borderRadius:5
          }}>
            <span style={{fontSize:10,color:"#888",fontWeight:700,letterSpacing:0.5}}>{p.position}</span>
            <span style={{fontSize:13,fontWeight:p.isPlayer?900:600,color:p.isPlayer?OR:"#ddd",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              {p.name}{p.isPlayer&&<span style={{fontSize:9,color:OR,marginLeft:6,letterSpacing:1}}>YOU</span>}
            </span>
            <span style={{fontSize:12,color:p.ovr>=85?GR:p.ovr>=75?OR:"#888",fontWeight:700,minWidth:24,textAlign:"right"}}>{p.ovr}</span>
            <span style={{fontSize:11,color:"#aaa",minWidth:36,textAlign:"right"}}>{p.mpg} MPG</span>
          </div>
        ))}
      </div>

      {/* BENCH — sorted by minutes per game descending (6th man first, deep bench last) */}
      <div style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"10px 12px",marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
          <div style={{fontSize:10,letterSpacing:2,color:"#aaa",textTransform:"uppercase",fontWeight:700}}>Bench · by minutes</div>
          <div style={{fontSize:9,color:"#666",letterSpacing:1}}>POS · NAME · OVR · MPG</div>
        </div>
        {bench.length===0&&<div style={{fontSize:11,color:"#666",fontStyle:"italic"}}>No bench data.</div>}
        {bench.map((p,i)=>(
          <div key={p.name+i} style={{
            display:"grid",gridTemplateColumns:"28px 1fr auto auto",alignItems:"center",gap:8,
            padding:"6px 8px",marginBottom:3,
            background:p.isPlayer?"rgba(232,135,58,0.18)":"transparent",
            border:p.isPlayer?`1px solid ${OR}66`:"1px solid transparent",
            borderRadius:5
          }}>
            <span style={{fontSize:10,color:"#888",fontWeight:700,letterSpacing:0.5}}>{p.position}</span>
            <span style={{fontSize:13,fontWeight:p.isPlayer?900:600,color:p.isPlayer?OR:"#ddd",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              {p.name}{p.isPlayer&&<span style={{fontSize:9,color:OR,marginLeft:6,letterSpacing:1}}>YOU</span>}
            </span>
            <span style={{fontSize:12,color:p.ovr>=85?GR:p.ovr>=75?OR:"#888",fontWeight:700,minWidth:24,textAlign:"right"}}>{p.ovr}</span>
            <span style={{fontSize:11,color:"#aaa",minWidth:36,textAlign:"right"}}>{p.mpg} MPG</span>
          </div>
        ))}
      </div>

      <button onClick={()=>go("leagueHub")} style={ghostS}>← Back to Hub</button>
    </div>
  );
}

// ─── NBA SPEND (coming soon) ───────────────────────────────────────────────────
function NbaSpendScreen({money, go}){
  return(
    <div style={{textAlign:"center",padding:"30px 0"}}>
      <div style={{fontSize:48,marginBottom:8}}>💰</div>
      <div style={{fontSize:22,fontWeight:900,color:"#fff",marginBottom:4}}>SPEND</div>
      <div style={{fontSize:13,color:"#aaa",marginBottom:6}}>Current balance</div>
      <div style={{fontSize:32,fontWeight:900,color:GR,marginBottom:24}}>{fmtMoney(money||0)}</div>
      <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:14,marginBottom:18,fontSize:12,color:"#888",lineHeight:1.6}}>
        Coming soon: contracts, endorsements, investments, charity, off-court spending.
      </div>
      <button onClick={()=>go("leagueHub")} style={ghostS}>← Back to Hub</button>
    </div>
  );
}

// ─── NBA AGENT ─────────────────────────────────────────────────────────────────
// Shows the player's signed agent and lets them request a contract extension
// (placeholder for now) or a trade. Trade requests are gated by season state
// and resolved with a chance based on player OVR × agent reputation.
function NbaAgentScreen({player, agent, nbaTeam, setNbaTeam, setNbaMentor, nbaGamesPlayed, nbaSeasons, go, toast}){
  const ovr=calcOVR(player.skills||{},player.intangibles||[]);
  const seasonsPlayed=(nbaSeasons||[]).length;
  const gp=nbaGamesPlayed||0;
  // "Mid-season" = between stretches (gp >= 41 but < 82). "Offseason" = at the
  // start of a year after at least one season has been played (gp == 0 and
  // seasonsPlayed >= 1). Both windows allow trade requests.
  const isMidSeason=gp>=41&&gp<82;
  const isOffseason=gp===0&&seasonsPlayed>=1;
  const tradeAvailable=isMidSeason||isOffseason;
  const tradeWindowLabel=isMidSeason?"Mid-season trade deadline":isOffseason?"Offseason":gp===0?"Pre-season (no trades until mid-year)":"In-game (no trades during a stretch)";
  const isElite=ovr>=90;

  // Up to 3 preferred destinations (elite players only). The user toggles
  // teams in/out; max 3 selected. Locked once they submit.
  const [picks,setPicks]=useState([]);
  // "result" cycles through pending → success/denied so the UI can render the
  // outcome card and lock the screen until the user backs out.
  const [result,setResult]=useState(null); // null | {success: boolean, newTeam?: string}

  const togglePick=(team)=>{
    setPicks(prev=>{
      if(prev.includes(team)) return prev.filter(t=>t!==team);
      if(prev.length>=3) return prev;
      return [...prev,team];
    });
  };

  // Compute the trade-success chance. Base scales by OVR tier; agent rep
  // (0-10) adds up to ~33 percentage points on top. Sub-65 OVR players are
  // effectively unmarketable.
  const baseChance=ovr>=90?0.90:ovr>=80?0.70:ovr>=70?0.40:ovr>=65?0.20:0.05;
  const agentBonus=(agent?.rep||5)/30;
  const successChance=Math.min(0.98,baseChance+agentBonus);

  const requestTrade=()=>{
    if(!tradeAvailable){toast&&toast("No trade window open right now","#888");return;}
    if(isElite&&picks.length===0){toast&&toast("Pick at least one preferred destination","#888");return;}
    if(Math.random()<successChance){
      const eligible=NBA_TEAMS.filter(t=>t!==nbaTeam);
      let newTeam;
      if(isElite&&picks.length>0){
        // Trade goes to a randomly chosen preferred destination (excluding current team).
        const validPicks=picks.filter(t=>t!==nbaTeam);
        newTeam=validPicks.length>0?validPicks[rand(0,validPicks.length-1)]:eligible[rand(0,eligible.length-1)];
      } else {
        newTeam=eligible[rand(0,eligible.length-1)];
      }
      setNbaTeam&&setNbaTeam(newTeam);
      // Trade = new team = new mentor relationship needed.
      setNbaMentor&&setNbaMentor(null);
      setResult({success:true,newTeam});
      toast&&toast(`Traded to ${newTeam}!`,GR);
    } else {
      setResult({success:false});
      toast&&toast("Trade request denied — no team made a serious offer","#888");
    }
  };

  if(!agent){
    return(
      <div style={{textAlign:"center",padding:"30px 0"}}>
        <div style={{fontSize:44,marginBottom:8}}>📞</div>
        <div style={{fontSize:18,fontWeight:900,color:"#fff",marginBottom:6}}>NO AGENT SIGNED</div>
        <div style={{fontSize:12,color:"#888",marginBottom:18,lineHeight:1.5}}>You don't have an agent on retainer.<br/>This screen unlocks once you sign with one.</div>
        <button onClick={()=>go("leagueHub")} style={ghostS}>← Back to Hub</button>
      </div>
    );
  }

  return(
    <div>
      <div style={{textAlign:"center",marginBottom:14}}>
        <div style={{fontSize:10,letterSpacing:3,color:OR,marginBottom:4,textTransform:"uppercase"}}>Representation</div>
        <div style={{fontSize:24,fontWeight:900,color:"#fff"}}>AGENT</div>
      </div>

      {/* Agent card — name, agency, rep badge */}
      <div style={{background:"rgba(255,215,0,0.06)",border:`1px solid ${GO}55`,borderRadius:12,padding:"14px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:50,height:50,borderRadius:"50%",background:`linear-gradient(135deg, ${GO}, #b08800)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>👔</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:16,fontWeight:900,color:"#fff",lineHeight:1.1}}>{agent.name}</div>
          <div style={{fontSize:11,color:"#aaa",marginTop:2}}>{agent.agency}</div>
        </div>
        <div style={{textAlign:"center",padding:"5px 9px",background:"rgba(0,0,0,0.4)",borderRadius:8,border:`1px solid ${agent.rep>=8?GR:agent.rep>=6?OR:"#666"}55`}}>
          <div style={{fontSize:8,letterSpacing:1.5,color:"#888",fontWeight:700}}>REP</div>
          <div style={{fontSize:18,fontWeight:900,color:agent.rep>=8?GR:agent.rep>=6?OR:"#ddd",lineHeight:1}}>{agent.rep}/10</div>
        </div>
      </div>

      {/* If we have a result, show it and stop here */}
      {result?(
        <div style={{background:result.success?"rgba(0,220,100,0.08)":"rgba(232,64,64,0.08)",border:`1px solid ${result.success?GR:RE}55`,borderRadius:10,padding:14,marginBottom:14,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:6}}>{result.success?"✅":"❌"}</div>
          <div style={{fontSize:16,fontWeight:900,color:result.success?GR:RE,marginBottom:4}}>{result.success?"TRADE APPROVED":"REQUEST DENIED"}</div>
          {result.success?(
            <div style={{fontSize:12,color:"#ddd",lineHeight:1.5}}>You've been traded to the <span style={{color:"#fff",fontWeight:900}}>{result.newTeam}</span>.<br/>Mentor cleared — pick a new vet on your team page.</div>
          ):(
            <div style={{fontSize:12,color:"#aaa",lineHeight:1.5}}>{agent.name} couldn't drum up a serious offer.{ovr<70?" Keep grinding your skills — higher OVR opens more doors.":" Maybe wait for the next window."}</div>
          )}
          <button onClick={()=>go("leagueHub")} style={{...btnS,marginTop:14,padding:"10px 24px"}}>← Back to Hub</button>
        </div>
      ):(
        <>
          {/* Two action options */}
          <div style={{fontSize:10,letterSpacing:3,color:"#aaa",textTransform:"uppercase",fontWeight:700,marginBottom:8}}>Requests</div>

          {/* Contract extension — placeholder */}
          <button onClick={()=>toast&&toast("Contract extensions coming soon","#888")} style={{display:"block",width:"100%",textAlign:"left",padding:"12px 14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,color:"#fff",cursor:"pointer",marginBottom:8,opacity:0.7,fontFamily:"'Barlow Condensed',sans-serif"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontSize:18,width:26,textAlign:"center"}}>📝</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:900,letterSpacing:1.5}}>REQUEST CONTRACT EXTENSION</div>
                <div style={{fontSize:11,color:"#888",marginTop:1}}>Coming soon</div>
              </div>
            </div>
          </button>

          {/* Trade request */}
          <button onClick={requestTrade} disabled={!tradeAvailable||(isElite&&picks.length===0)} style={{display:"block",width:"100%",textAlign:"left",padding:"12px 14px",background:tradeAvailable?"rgba(232,135,58,0.12)":"rgba(255,255,255,0.04)",border:`1px solid ${tradeAvailable?OR+"66":"rgba(255,255,255,0.08)"}`,borderRadius:10,color:"#fff",cursor:tradeAvailable?"pointer":"not-allowed",marginBottom:8,opacity:tradeAvailable?1:0.5,fontFamily:"'Barlow Condensed',sans-serif"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontSize:18,width:26,textAlign:"center"}}>🔄</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:900,letterSpacing:1.5,color:tradeAvailable?OR:"#ddd"}}>REQUEST TRADE</div>
                <div style={{fontSize:11,color:"#888",marginTop:1}}>{tradeWindowLabel}</div>
              </div>
              {tradeAvailable&&<div style={{fontSize:10,color:successChance>=0.7?GR:successChance>=0.4?OR:RE,fontWeight:900,letterSpacing:1}}>{Math.round(successChance*100)}%</div>}
            </div>
          </button>

          {/* Elite-only team picker */}
          {tradeAvailable&&isElite&&(
            <div style={{background:"rgba(255,215,0,0.04)",border:`1px solid ${GO}33`,borderRadius:10,padding:"10px 12px",marginTop:6}}>
              <div style={{fontSize:11,fontWeight:900,color:GO,letterSpacing:1.5,marginBottom:3}}>⭐ ELITE PERK · PREFERRED DESTINATIONS</div>
              <div style={{fontSize:11,color:"#aaa",marginBottom:8,lineHeight:1.5}}>You're a 90+ OVR superstar — pick up to 3 teams. If your trade goes through, you'll land on one of them.</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:4,marginBottom:6}}>
                {NBA_TEAMS.filter(t=>t!==nbaTeam).map(t=>{
                  const td=NBA_TEAM_DATA[t]||{p:"#444",s:"#888",abbr:"???"};
                  const selected=picks.includes(t);
                  return(
                    <button key={t} onClick={()=>togglePick(t)} style={{padding:"5px 2px",background:selected?`linear-gradient(135deg, ${td.p}, ${td.p}88)`:"rgba(0,0,0,0.3)",border:`1px solid ${selected?td.s+"99":"rgba(255,255,255,0.08)"}`,borderRadius:5,color:selected?"#fff":"#aaa",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:selected?900:600,fontSize:10,letterSpacing:0.5}}>
                      {td.abbr}
                    </button>
                  );
                })}
              </div>
              <div style={{fontSize:10,color:"#666"}}>{picks.length}/3 selected{picks.length===0&&" — pick at least one"}</div>
            </div>
          )}

          {/* Player overview — helps user understand their leverage */}
          <div style={{marginTop:14,padding:"10px 12px",background:"rgba(255,255,255,0.03)",borderRadius:10,fontSize:11,color:"#aaa",lineHeight:1.6}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span>Your OVR</span><span style={{color:ovr>=85?GR:ovr>=75?OR:"#ddd",fontWeight:700}}>{ovr}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span>Agent rep</span><span style={{color:"#ddd",fontWeight:700}}>{agent.rep}/10</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span>Trade chance</span><span style={{color:successChance>=0.7?GR:successChance>=0.4?OR:RE,fontWeight:700}}>{Math.round(successChance*100)}%</span>
            </div>
          </div>

          <button onClick={()=>go("leagueHub")} style={{...ghostS,marginTop:14}}>← Back to Hub</button>
        </>
      )}
    </div>
  );
}

// ─── NBA STATS ─────────────────────────────────────────────────────────────────
function NbaStatsScreen({player, allYears, nbaSeasons, nbaSeasonTotals, nbaGamesPlayed, nbaTeam, go}){
  const college=allYears||[];
  // Current season (in progress) as an active row
  const seasonsPlayed=nbaSeasons.length;
  const currentYearLabel=formatSeasonLabel(NBA_START_YEAR+seasonsPlayed);
  const age=calcAge(allYears, nbaSeasons);
  const liveSeason=nbaGamesPlayed>0?{
    year:currentYearLabel+" (live)",team:nbaTeam,
    gp:nbaSeasonTotals.games,
    ppg:nbaSeasonTotals.games>0?+(nbaSeasonTotals.pts/nbaSeasonTotals.games).toFixed(1):0,
    rpg:nbaSeasonTotals.games>0?+(nbaSeasonTotals.reb/nbaSeasonTotals.games).toFixed(1):0,
    apg:nbaSeasonTotals.games>0?+(nbaSeasonTotals.ast/nbaSeasonTotals.games).toFixed(1):0,
    fg:nbaSeasonTotals.fga>0?Math.round((nbaSeasonTotals.fgm/nbaSeasonTotals.fga)*100):0,
  }:null;
  const allNba=[...nbaSeasons,...(liveSeason?[liveSeason]:[])];

  return(
    <div>
      <div style={{textAlign:"center",marginBottom:14}}>
        <div style={{fontSize:10,letterSpacing:3,color:OR,marginBottom:4,textTransform:"uppercase"}}>Career</div>
        <div style={{fontSize:22,fontWeight:900,color:"#fff"}}>STATS</div>
        <div style={{fontSize:11,color:"#aaa",marginTop:4,letterSpacing:1}}>
          {player.name||"You"} · {player.position||"--"} · Age {age}
        </div>
      </div>

      {/* College / Overseas section */}
      <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:12,marginBottom:14}}>
        <Lbl color="#ddd">College / Overseas</Lbl>
        {college.length===0?(
          <div style={{fontSize:12,color:"#888",fontStyle:"italic",padding:"8px 0"}}>No college games played.</div>
        ):(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1.4fr 0.5fr 0.5fr 0.5fr 0.5fr",gap:4,fontSize:9,color:"#666",letterSpacing:1.5,marginBottom:4,paddingBottom:4,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
              <div>SCHOOL</div><div style={{textAlign:"right"}}>PPG</div><div style={{textAlign:"right"}}>RPG</div><div style={{textAlign:"right"}}>APG</div><div style={{textAlign:"right"}}>FG%</div>
            </div>
            {college.map((y,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1.4fr 0.5fr 0.5fr 0.5fr 0.5fr",gap:4,fontSize:12,padding:"5px 0",borderBottom:i<college.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
                <div style={{color:"#ddd",fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{y.school?.name||"—"}</div>
                <div style={{textAlign:"right",color:OR,fontWeight:700}}>{y.stats?.ppg||"—"}</div>
                <div style={{textAlign:"right",color:"#ddd"}}>{y.stats?.rpg||"—"}</div>
                <div style={{textAlign:"right",color:"#ddd"}}>{y.stats?.apg||"—"}</div>
                <div style={{textAlign:"right",color:"#ddd"}}>{y.stats?.fg?y.stats.fg+"%":"—"}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NBA section */}
      <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:12,marginBottom:14}}>
        <Lbl color="#ddd">NBA</Lbl>
        {allNba.length===0?(
          <div style={{fontSize:12,color:"#888",fontStyle:"italic",padding:"8px 0"}}>No NBA games played yet.</div>
        ):(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1.2fr 0.4fr 0.5fr 0.5fr 0.5fr 0.5fr",gap:4,fontSize:9,color:"#666",letterSpacing:1.5,marginBottom:4,paddingBottom:4,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
              <div>YEAR</div><div style={{textAlign:"right"}}>GP</div><div style={{textAlign:"right"}}>PPG</div><div style={{textAlign:"right"}}>RPG</div><div style={{textAlign:"right"}}>APG</div><div style={{textAlign:"right"}}>FG%</div>
            </div>
            {allNba.map((s,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1.2fr 0.4fr 0.5fr 0.5fr 0.5fr 0.5fr",gap:4,fontSize:12,padding:"5px 0",borderBottom:i<allNba.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
                <div style={{color:"#ddd",fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.year}</div>
                <div style={{textAlign:"right",color:"#aaa"}}>{s.gp}</div>
                <div style={{textAlign:"right",color:OR,fontWeight:700}}>{s.ppg}</div>
                <div style={{textAlign:"right",color:"#ddd"}}>{s.rpg}</div>
                <div style={{textAlign:"right",color:"#ddd"}}>{s.apg}</div>
                <div style={{textAlign:"right",color:"#ddd"}}>{s.fg}%</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={()=>go("leagueHub")} style={ghostS}>← Back to Hub</button>
    </div>
  );
}

// ─── TESTING MODE ─────────────────────────────────────────────────────────────
// Generic test player ("Mike Basketball") and presets that let the user drop
// into different career stages without playing through the whole flow. All
// state changes during testing skip the auto-save (see testingMode flag in App).
function buildMike(opts={}){
  const skills={
    threePoint:72, midRange:72, finishing:75, handles:70,
    playmaking:68, perimDefense:68, postDefense:60, rebounding:65,
  };
  // Bumped variant for the superstar / vet presets so they actually start.
  if(opts.elite){
    Object.keys(skills).forEach(k=>{skills[k]=Math.min(99,skills[k]+15);});
  }
  return {
    name:"Mike Basketball",
    position:opts.position||"SG",
    height:78,  // 6'6"
    weight:215,
    hometown:"Indianapolis, IN",
    skills,
    intangibles:["highIQ","confident"],
    draftPick:opts.draftPick,
    isUndrafted:opts.isUndrafted||false,
    appearance:{
      skin:"#4A2912",hair:"Low Cut",beard:"Clean",
      headband:"None",headbandColor:"Black",jerseyNumber:23,
    },
  };
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [screen,setScreen]=useState("loadscreen");
  const [player,setPlayer]=useState({name:"",position:"SG",height:76,weight:210,hometown:"",skills:defaultSkills("SG"),intangibles:[],appearance:{skin:"#4A2912",hair:"Low Cut",beard:"Clean",headband:"Black",headbandColor:"Black",jerseyNumber:23}});
  const [starTier,setStarTier]=useState(null);
  const [school,setSchool]=useState(null);
  const [priorities,setPriorities]=useState([]);
  const [year,setYear]=useState(1);
  const [allYears,setAllYears]=useState([]);
  const [agent,setAgent]=useState(null);
  const [workoutPlayer,setWorkoutPlayer]=useState(null); // the NBA player picked for skill workouts
  const [workoutDone,setWorkoutDone]=useState(false);
  const [agentAttention,setAgentAttention]=useState(100); // updates after draft based on pick
  const [interviewDone,setInterviewDone]=useState(false);
  const [combineDone,setCombineDone]=useState(false);
  const [combineScore,setCombineScore]=useState(null);
  const [interviewScore,setInterviewScore]=useState(null);
  const [notif,setNotif]=useState(null);
  const [seasonResult,setSeasonResult]=useState(null);
  const [xferSel,setXferSel]=useState(null);
  const [skillPoints,setSkillPoints]=useState(100);
  const [intangs,setIntangs]=useState([]);
  // Career money. Increased by shoe-deal signing bonuses, future contracts, etc.
  const [money,setMoney]=useState(0);
  // Which shoe brand the player signed with (full brand object or null).
  // Locked in once selected — players sign with at most one brand.
  const [signedShoeBrand,setSignedShoeBrand]=useState(null);
  // ─── NBA PHASE STATE ───────────────────────────────────────────────────────
  // The team the player was drafted by. Set once at the end of DraftScreen
  // (when they continue past the summary). Persists for the whole NBA career.
  const [nbaTeam,setNbaTeam]=useState(null);
  // Current season's game count. Each "Play" click runs 41 games. After 82
  // (full regular season), if the team makes the playoffs, one more click
  // simulates the playoff run.
  const [nbaGamesPlayed,setNbaGamesPlayed]=useState(0);
  // Cumulative season-in-progress totals — averaged into per-game stats at
  // the end-of-season recap and pushed into nbaSeasons history.
  const [nbaSeasonTotals,setNbaSeasonTotals]=useState({pts:0,reb:0,ast:0,games:0,fgm:0,fga:0});
  // Mentor: a veteran player on the team. Selected once per team affiliation
  // — gives a one-time +5 SP bonus. Resets if the player ever switches teams.
  // Stored as the player's name string (matched against the active year's roster).
  const [nbaMentor,setNbaMentor]=useState(null);
  // Per-season history. Each entry: {year, team, gp, ppg, rpg, apg, fg%, teamRecord, madePlayoffs, wonChamp}
  const [nbaSeasons,setNbaSeasons]=useState([]);
  // Tracks whether the current season's playoffs have been simulated.
  // Reset to false when a new season starts (after first "Play" of the next year).
  const [playoffsDone,setPlayoffsDone]=useState(false);
  // Whether a save exists in localStorage. Drives the "Resume Career" button
  // on the title screen. Refreshed when we save, clear, or load.
  const [hasSave,setHasSave]=useState(()=>loadSave()!==null);
  // Testing mode — when true, auto-save is disabled so jumping into a Mike
  // preset doesn't clobber a real career. Set by the testing screen, cleared
  // when the user exits testing back to the title.
  const [testingMode,setTestingMode]=useState(false);

  // Auto-save: write the entire career to localStorage whenever any tracked
  // state changes. Skipped when the player hasn't started (no name entered)
  // so we don't clutter localStorage with the default empty state. Also
  // skipped on the loadscreen so the initial mount doesn't write an empty save.
  useEffect(()=>{
    if(!player.name) return;
    if(screen==="loadscreen") return;
    if(testingMode) return; // never save while testing — preserve real career
    // When the user is on a menu screen (title, options, etc.) DON'T overwrite
    // the saved screen — otherwise "Resume Career" would just send them right
    // back to the menu. Read the previous save's screen and keep that as the
    // resume destination.
    let screenToSave=screen;
    if(MENU_SCREENS.has(screen)){
      const prev=loadSave();
      if(prev && prev.screen && !MENU_SCREENS.has(prev.screen)){
        screenToSave=prev.screen;
      } else {
        // First time saving and we're on a menu — skip the save entirely;
        // we'll write a proper one once the user gets to a career screen.
        return;
      }
    }
    writeSave({
      screen:screenToSave, player, starTier, school, priorities, year, allYears,
      agent, workoutPlayer, workoutDone, agentAttention,
      interviewDone, combineDone, combineScore, interviewScore,
      seasonResult, xferSel, skillPoints, intangs,
      money, signedShoeBrand,
      nbaTeam, nbaGamesPlayed, nbaSeasonTotals, nbaMentor, nbaSeasons, playoffsDone,
    });
    setHasSave(true);
  },[screen,player,starTier,school,priorities,year,allYears,agent,workoutPlayer,workoutDone,agentAttention,interviewDone,combineDone,combineScore,interviewScore,seasonResult,xferSel,skillPoints,intangs,money,signedShoeBrand,nbaTeam,nbaGamesPlayed,nbaSeasonTotals,nbaMentor,nbaSeasons,playoffsDone,testingMode]);

  // Restore a saved career into all the state slots, then navigate to the
  // screen they were on when they last played.
  const resumeCareer=()=>{
    const data=loadSave();
    if(!data) return;
    if(data.player){
      // Migrate older saves that predate the draftPick/isUndrafted flags
      // (added when the G League path was removed). If the player is in the
      // NBA but has no draft data, assume 1st-round (no rookie minutes floor).
      const migrated={...data.player};
      if(migrated.draftPick===undefined&&data.nbaTeam){
        migrated.draftPick=1;
        migrated.isUndrafted=false;
      }
      setPlayer(migrated);
    }
    if(data.starTier!==undefined) setStarTier(data.starTier);
    if(data.school!==undefined) setSchool(data.school);
    if(data.priorities) setPriorities(data.priorities);
    if(data.year!==undefined) setYear(data.year);
    if(data.allYears) setAllYears(data.allYears);
    if(data.agent!==undefined) setAgent(data.agent);
    if(data.workoutPlayer!==undefined) setWorkoutPlayer(data.workoutPlayer);
    if(data.workoutDone!==undefined) setWorkoutDone(data.workoutDone);
    if(data.agentAttention!==undefined) setAgentAttention(data.agentAttention);
    if(data.interviewDone!==undefined) setInterviewDone(data.interviewDone);
    if(data.combineDone!==undefined) setCombineDone(data.combineDone);
    if(data.combineScore!==undefined) setCombineScore(data.combineScore);
    if(data.interviewScore!==undefined) setInterviewScore(data.interviewScore);
    if(data.seasonResult!==undefined) setSeasonResult(data.seasonResult);
    if(data.xferSel!==undefined) setXferSel(data.xferSel);
    if(data.skillPoints!==undefined) setSkillPoints(data.skillPoints);
    if(data.intangs) setIntangs(data.intangs);
    if(data.money!==undefined) setMoney(data.money);
    if(data.signedShoeBrand!==undefined) setSignedShoeBrand(data.signedShoeBrand);
    if(data.nbaTeam!==undefined) setNbaTeam(data.nbaTeam);
    if(data.nbaGamesPlayed!==undefined) setNbaGamesPlayed(data.nbaGamesPlayed);
    if(data.nbaSeasonTotals!==undefined) setNbaSeasonTotals(data.nbaSeasonTotals);
    if(data.nbaMentor!==undefined) setNbaMentor(data.nbaMentor);
    if(data.nbaSeasons!==undefined) setNbaSeasons(data.nbaSeasons);
    if(data.playoffsDone!==undefined) setPlayoffsDone(data.playoffsDone);
    // Resuming a real career — drop out of testing mode if we were in it.
    setTestingMode(false);
    // Jump back to where they were. If the saved screen is a menu screen
    // (legacy saves from before the menu-screen guard was added), infer the
    // best resume point from the saved progress data — much better UX than
    // dumping them back at the very start.
    const saved=data.screen;
    if(saved && !MENU_SCREENS.has(saved)){
      setScreen(saved);
    } else {
      setScreen(inferCareerScreen(data));
    }
  };

  // ─── TESTING MODE JUMPS ────────────────────────────────────────────────────
  // Each preset wipes career state, builds a Mike player tailored to the
  // scenario, and drops the user into the right screen. testingMode prevents
  // auto-save from clobbering their real career while they poke around.
  const jumpToTesting=(preset)=>{
    setTestingMode(true);
    // Reset everything that's not preset-specific so leftover state from a
    // previous session can't bleed in.
    setStarTier(null); setSchool(null); setPriorities([]); setYear(1); setAllYears([]);
    setAgent(null); setWorkoutPlayer(null); setWorkoutDone(false); setAgentAttention(100);
    setInterviewDone(false); setCombineDone(false); setCombineScore(null); setInterviewScore(null);
    setSeasonResult(null); setXferSel(null); setIntangs([]);
    setNbaSeasonTotals({pts:0,reb:0,ast:0,games:0,fgm:0,fga:0});
    setNbaMentor(null); setPlayoffsDone(false); setNbaGamesPlayed(0);

    if(preset==="lottery"){
      // Top-5 pick with Nike shoe deal → +5 SP only, sits as starter
      const mike=buildMike({draftPick:3});
      setPlayer(mike); setNbaTeam("LA Lakers");
      setSignedShoeBrand({id:"nike",name:"Nike",maxPick:5,bonus:2000000,skillBonus:5,color:"#FA5400",subtitle:"Top 5 picks only"});
      setAgent(AGENTS[0]); // Marcus Webb — top-tier rep 10 (matches lottery pick)
      setMoney(2000000); setSkillPoints(5); setNbaSeasons([]);
      setScreen("leagueHub");
      toast("Mike — Lottery Rookie loaded","#FFD700");
    }
    else if(preset==="secondRound"){
      // 2nd-round pick, no shoe deal → 0 SP, rookie minutes floor at slot 2
      const mike=buildMike({draftPick:40});
      setPlayer(mike); setNbaTeam("Charlotte Bobcats");
      setSignedShoeBrand(null);
      setAgent(AGENTS[3]); // Nia Collins — boutique rep 6, fits early-2nd
      setMoney(0); setSkillPoints(0); setNbaSeasons([]);
      setScreen("leagueHub");
      toast("Mike — 2nd Round Rookie loaded","#a88aff");
    }
    else if(preset==="undrafted"){
      // Undrafted, no shoe deal → 0 SP, deepest rookie floor at slot 3
      const mike=buildMike({draftPick:0,isUndrafted:true});
      setPlayer(mike); setNbaTeam("Cleveland Cavaliers");
      setSignedShoeBrand(null);
      setAgent(AGENTS[4]); // Kevin Pratt — hungry rep 4, takes anyone
      setMoney(0); setSkillPoints(0); setNbaSeasons([]);
      setScreen("leagueHub");
      toast("Mike — Undrafted Rookie loaded","#ff5252");
    }
    else if(preset==="vet"){
      // Year 3 veteran — past the rookie floor, elite skills, two full seasons logged
      const mike=buildMike({draftPick:8,elite:true});
      setPlayer(mike); setNbaTeam("Sacramento Kings");
      setSignedShoeBrand({id:"adidas",name:"Adidas",maxPick:10,bonus:2000000,skillBonus:5,color:"#FFFFFF",subtitle:"Top 10 picks only"});
      setAgent(AGENTS[1]); // Diane Holloway — established rep 8
      setMoney(5000000); setSkillPoints(20);
      setNbaSeasons([
        {year:"2004-05",team:"Sacramento Kings",teamRecord:"50-32",madePlayoffs:true,gp:79,ppg:14.2,rpg:4.1,apg:3.5,fg:46},
        {year:"2005-06",team:"Sacramento Kings",teamRecord:"44-38",madePlayoffs:true,gp:81,ppg:18.6,rpg:5.0,apg:4.2,fg:48},
      ]);
      setScreen("leagueHub");
      toast("Mike — Year 3 Vet loaded","#00dc64");
    }
    else if(preset==="college"){
      // Freshman at Duke — no NBA state, start of college season flow
      const mike=buildMike();
      setPlayer(mike);
      setStarTier(STAR_TIERS[1]); // 4-star
      setSchool(SCHOOLS[0]); // Duke
      setPriorities(["finishing","midRange","threePoint"]);
      setYear(1); setAllYears([]);
      setNbaTeam(null); setSkillPoints(0);
      setScreen("season");
      toast("Mike — College Freshman at Duke loaded","#e8873a");
    }
  };

  const exitTesting=()=>{
    setTestingMode(false);
    // If there's a real career saved, resume it (overwrites Mike's state with
    // the real player). Otherwise just go home with empty state — auto-save
    // bails on empty player.name so the save is untouched either way.
    if(hasSave){
      resumeCareer();
      toast("Real career restored","#00dc64");
    } else {
      setPlayer({name:"",position:"SG",height:76,weight:210,hometown:"",skills:defaultSkills("SG"),intangibles:[],appearance:{skin:"#4A2912",hair:"Low Cut",beard:"Clean",headband:"Black",headbandColor:"Black",jerseyNumber:23}});
      setNbaTeam(null); setNbaSeasons([]); setNbaGamesPlayed(0);
      setScreen("title");
      toast("Exited testing mode","#888");
    }
  };

  // Determines the best resume point when the saved screen is missing or
  // points to a menu (legacy/corrupted save). Walks the career flow in
  // reverse order and picks the latest step the player has reached.
  function inferCareerScreen(data){
    if(!data) return "bio";
    // Made it to the NBA — leagueHub is the home base from here on.
    if(data.nbaTeam){
      return "leagueHub";
    }
    // Post-college: interview / combine / draft prep
    if(data.combineDone||data.combineScore!=null||data.interviewDone||data.interviewScore!=null){
      return "predraft";
    }
    // In-college: played a season already — drop them at the recap/decision
    // screen so they can choose to return, transfer, or declare.
    if(data.school&&data.allYears&&data.allYears.length>0){
      return "recap";
    }
    // School signed and priorities chosen — ready to play a season.
    if(data.school&&data.priorities&&data.priorities.length>=3){
      return "season";
    }
    // School signed but priorities not yet picked.
    if(data.school){
      return "priorities";
    }
    // Star tier and skill build done — time to pick a school.
    if(data.starTier&&data.player&&data.player.skills&&Object.keys(data.player.skills).length>0){
      return "school";
    }
    // Star tier picked, skills not allocated.
    if(data.starTier){
      return "build";
    }
    // Basic bio entered, no star tier yet.
    if(data.player&&data.player.position&&data.player.name){
      return "stars";
    }
    return "bio";
  }

  // Wipe the save and reset career state — used by "New Career" when a save
  // already exists.
  const wipeAndStartNew=()=>{
    clearSave();
    setHasSave(false);
    setPlayer({name:"",position:"SG",height:76,weight:210,hometown:"",skills:defaultSkills("SG"),intangibles:[],appearance:{skin:"#4A2912",hair:"Low Cut",beard:"Clean",headband:"Black",headbandColor:"Black",jerseyNumber:23}});
    setStarTier(null);setSchool(null);setPriorities([]);
    setYear(1);setAllYears([]);
    setAgent(null);setWorkoutPlayer(null);setWorkoutDone(false);
    setAgentAttention(100);setInterviewDone(false);setCombineDone(false);
    setCombineScore(null);setInterviewScore(null);
    setSeasonResult(null);setXferSel(null);
    setSkillPoints(100);setIntangs([]);
    setMoney(0);setSignedShoeBrand(null);
    setNbaTeam(null);setNbaGamesPlayed(0);setNbaSeasonTotals({pts:0,reb:0,ast:0,games:0,fgm:0,fga:0});
    setNbaMentor(null);setNbaSeasons([]);setPlayoffsDone(false);
    setScreen("bio");
  };
  // Background music using HTMLAudioElement — the same approach YouTube, Spotify Web,
  // etc. use for iOS reliability. Web Audio API was too finicky here: even after
  // priming, iOS would silently swallow source.start() calls outside a gesture.
  // <audio> elements handle the gesture/buffering dance themselves.
  const [musicOn,setMusicOn]=useState(true);
  // States: "loading" → audio element loading. "ready" → loaded, can play.
  //         "playing" → audible. "paused" → toggled off. "blocked" → autoplay denied.
  //         "error" → failed to load.
  const [audioState,setAudioState]=useState("loading");
  // Detailed error message for the debug overlay
  const [audioError,setAudioError]=useState("");
  const audioElRef=useRef(null);
  // Hidden <video> used to bypass iOS Safari's silent-switch mute (see effect below).
  const silentVideoRef=useRef(null);
  // Mirror of musicOn that's readable from non-React contexts (event handlers
  // captured at mount via [] effect deps would otherwise see stale values).
  const musicOnRef=useRef(true);
  musicOnRef.current=musicOn;
  // Tracks whether the user has done a "start gesture" yet — once true, we can
  // safely call .play() outside a gesture (iOS allows this after first unlock).
  const userHasInteractedRef=useRef(false);
  // Tracks the last self-heal retry timestamp to prevent infinite retry loops
  // if iOS keeps refusing playback for a structural reason.
  const lastRetryRef=useRef(0);

  // STEP 1: Create the HTMLAudioElement on mount. It loads in the background.
  useEffect(()=>{
    const a=new Audio();
    a.src=MUSIC_SRC;
    a.loop=true;
    a.preload="auto";
    a.volume=0.45;
    // playsInline keeps iOS from showing native player controls / going fullscreen
    a.setAttribute("playsinline","");
    a.setAttribute("webkit-playsinline","");
    audioElRef.current=a;

    const onCanPlay=()=>{ setAudioState(s=>s==="loading"?"ready":s); };
    const onPlaying=()=>{ setAudioState("playing"); };
    const onPause=()=>{
      setAudioState(s=>s==="playing"?"paused":s);
      // Self-heal: if iOS paused us against our wishes (musicOn is true, user
      // has interacted), try to resume. Throttle to once per 500ms to avoid
      // tight loops if iOS keeps refusing.
      if(userHasInteractedRef.current && musicOnRef.current){
        const now=Date.now();
        if(now-lastRetryRef.current<500) return;
        lastRetryRef.current=now;
        const a=audioElRef.current;
        if(a){
          const p=a.play();
          if(p && typeof p.then==="function") p.catch(()=>{});
        }
      }
    };
    const onError=()=>{
      const e=a.error;
      const code=e?e.code:"?";
      setAudioError(`Audio load error (code ${code})`);
      setAudioState("error");
    };
    a.addEventListener("canplaythrough",onCanPlay);
    a.addEventListener("canplay",onCanPlay);
    a.addEventListener("playing",onPlaying);
    a.addEventListener("pause",onPause);
    a.addEventListener("error",onError);

    // Kick off loading
    try{ a.load(); }catch(e){}

    return()=>{
      a.removeEventListener("canplaythrough",onCanPlay);
      a.removeEventListener("canplay",onCanPlay);
      a.removeEventListener("playing",onPlaying);
      a.removeEventListener("pause",onPause);
      a.removeEventListener("error",onError);
      try{a.pause();}catch(e){}
      a.src="";
      audioElRef.current=null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // STEP 2: Play/pause based on musicOn — but ONLY after the user has unlocked
  // audio via a click handler (see loadscreen onClick). We deliberately do NOT
  // attempt autoplay on mount or on canplay; on iOS that creates a race where
  // .play() resolves briefly then iOS fires "pause" right after, leaving us
  // stuck in a paused state. Instead we wait for an explicit user click.
  useEffect(()=>{
    const a=audioElRef.current;
    if(!a) return;
    if(!userHasInteractedRef.current) return; // wait for first click
    if(musicOn){
      const p=a.play();
      if(p && typeof p.then==="function"){
        p.catch(err=>{
          setAudioError(`Play failed: ${err&&err.message||err}`);
          setAudioState("blocked");
        });
      }
    } else {
      try{a.pause();}catch(e){}
    }
  },[musicOn,audioState==="ready"]);

  // STEP 2.5: Global click insurance. Any click anywhere in the app re-asserts
  // audio playback if iOS has stalled it. This is the safety net for the
  // self-healing onPause handler — if iOS pauses our audio when the user
  // navigates between views, the very next click will resume it.
  useEffect(()=>{
    const ensurePlaying=()=>{
      if(!userHasInteractedRef.current) return;
      if(!musicOnRef.current) return;
      const a=audioElRef.current;
      if(!a) return;
      if(!a.paused) return; // already playing, no-op
      const p=a.play();
      if(p && typeof p.then==="function") p.catch(()=>{});
      // Also kick the silent video in case its session was lost too.
      const v=silentVideoRef.current;
      if(v && v.paused){
        const vp=v.play();
        if(vp && typeof vp.then==="function") vp.catch(()=>{});
      }
    };
    document.addEventListener("click",ensurePlaying);
    document.addEventListener("touchend",ensurePlaying,{passive:true});
    return()=>{
      document.removeEventListener("click",ensurePlaying);
      document.removeEventListener("touchend",ensurePlaying);
    };
  },[]);

  // STEP 2.6: Media Session API — declares us as a real media player so iOS
  // gives our audio higher priority and won't pause it on incidental clicks
  // (this is the same API YouTube and Spotify Web use). Without this, iOS treats
  // our audio as a lower-priority "ambient" sound that can be interrupted.
  useEffect(()=>{
    if(typeof navigator==="undefined"||!("mediaSession" in navigator)) return;
    try{
      navigator.mediaSession.metadata=new window.MediaMetadata({
        title:"NBA Live 2003 Soundtrack",
        artist:"Gooden 2003",
        album:"Game Soundtrack",
      });
      // Wire the media session play/pause to our audio element so iOS controls
      // (lock screen, control center) work correctly — and so iOS recognizes
      // our element as the "active media".
      navigator.mediaSession.setActionHandler("play",()=>{
        const a=audioElRef.current;
        if(a){ setMusicOn(true); a.play().catch(()=>{}); }
      });
      navigator.mediaSession.setActionHandler("pause",()=>{
        const a=audioElRef.current;
        if(a){ setMusicOn(false); a.pause(); }
      });
    }catch(e){}
    return()=>{
      if(typeof navigator==="undefined"||!("mediaSession" in navigator)) return;
      try{
        navigator.mediaSession.metadata=null;
        navigator.mediaSession.setActionHandler("play",null);
        navigator.mediaSession.setActionHandler("pause",null);
      }catch(e){}
    };
  },[]);

  // Imperative starter — called from the TAP TO START click handler so .play()
  // runs SYNCHRONOUSLY inside the user gesture (the only way iOS reliably allows
  // it). Also flips userHasInteractedRef so the STEP 2 effect takes over for
  // subsequent musicOn toggles. Caller is responsible for deciding whether to
  // call this (i.e. only when they want playback to start).
  const startMusicFromGesture=()=>{
    userHasInteractedRef.current=true;
    // Kick the silent video FIRST inside this gesture — it puts iOS into the
    // "Playback" audio session category, which ignores the silent switch. Without
    // it, iOS pauses our music ~50ms after it starts when the phone is on silent.
    const v=silentVideoRef.current;
    if(v){
      const vp=v.play();
      if(vp && typeof vp.then==="function") vp.catch(()=>{});
    }
    const a=audioElRef.current;
    if(!a) return;
    const p=a.play();
    if(p && typeof p.then==="function"){
      p.catch(err=>{
        setAudioError(`Play failed: ${err&&err.message||err}`);
        setAudioState("blocked");
      });
    }
  };

  // ─── iOS SILENT-SWITCH BYPASS ─────────────────────────────────────────────
  // PROBLEM: iOS Safari plays Web Audio API output through the "Ambient" audio
  // session by default. That session category respects the hardware mute
  // switch, so when the phone is on silent, our music goes silent too.
  //
  // FIX: YouTube and Spotify Web get around this by getting Safari into the
  // "Playback" audio session, which ignores the mute switch. The trick that
  // reliably flips that switch from JS is to keep a <video> element playing
  // whose source has an audio track. Even at volume 0, the active video with
  // audio tells iOS "this page is doing media playback", and Safari moves the
  // entire page (including our Web Audio output) into Playback mode.
  //
  // The video itself is hidden 1×1 in the corner. It's a tiny silent MP4
  // loop (just a black frame + a silent AAC track). You need to drop a base64
  // data URL into SILENT_MP4_SRC — same pattern as MUSIC_SRC. To generate a
  // minimal one with ffmpeg:
  //   ffmpeg -f lavfi -i color=c=black:s=2x2:d=1 \
  //          -f lavfi -i anullsrc=cl=mono:r=8000 \
  //          -shortest -c:v libx264 -tune stillimage -pix_fmt yuv420p \
  //          -c:a aac -b:a 8k silent.mp4
  // Then: `base64 silent.mp4` and paste as `data:video/mp4;base64,...`
  //
  // The key requirement: the MP4 MUST contain an audio track (even silent).
  // A video-only MP4 won't flip the audio session category.
  useEffect(()=>{
    if(typeof SILENT_MP4_SRC==="undefined"||!SILENT_MP4_SRC) return;
    const v=document.createElement("video");
    v.src=SILENT_MP4_SRC;
    v.loop=true;
    // playsInline keeps iOS from forcing fullscreen playback
    v.playsInline=true;
    v.setAttribute("playsinline","");
    v.setAttribute("webkit-playsinline","");
    v.preload="auto";
    // volume 0 (NOT muted) — iOS only flips the audio session if the audio
    // track is "live". A muted track is treated as no audio.
    v.volume=0;
    v.style.cssText="position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1";
    document.body.appendChild(v);
    silentVideoRef.current=v;
    return()=>{
      try{v.pause();}catch(e){}
      if(v.parentNode) v.parentNode.removeChild(v);
      silentVideoRef.current=null;
    };
  },[]);

  // Drive silent-video play/pause off the same musicOn toggle as the actual
  // music. When the user mutes via the speaker button, we also pause the
  // silent video so we're not holding the audio session open needlessly.
  useEffect(()=>{
    const v=silentVideoRef.current;
    if(!v) return;
    if(musicOn){
      // Only call play() if actually paused. Calling play() on an already-playing
      // video in iOS Safari can briefly disrupt audio output (this was causing
      // the click-pause-resume stutter).
      const tryPlay=()=>{
        if(v.paused){ v.play().catch(()=>{}); }
      };
      tryPlay();
      // Listen for resume opportunities (in case iOS pauses the silent video).
      window.addEventListener("pointerdown",tryPlay);
      window.addEventListener("touchstart",tryPlay,{passive:true});
      return()=>{
        window.removeEventListener("pointerdown",tryPlay);
        window.removeEventListener("touchstart",tryPlay);
      };
    } else {
      try{v.pause();}catch(e){}
    }
  },[musicOn]);

  useEffect(()=>{
    if(!player.position) return;
    const current=player.skills||{};
    // Only auto-populate when skills are empty. This handles the "new player"
    // case without clobbering values from a loaded save or user adjustments.
    if(Object.keys(current).length>0) return;
    setPlayer(p=>({...p,skills:defaultSkills(player.position)}));
  },[player.position]);

  const toast=(msg,color=OR)=>{setNotif({msg,color});setTimeout(()=>setNotif(null),2200);};
  const go=(s)=>setScreen(s);
  const ovr=calcOVR(player.skills||{},player.intangibles||[]);
  const allSkills=SKILLS;
  const allOpts=SKILLS;

  // Skill allocation
  const totalSkillPts=()=>Object.values(player.skills||{}).reduce((a,b)=>a+b,0);
  // BASE_TOTAL must match the rounded baseSkills (we round to nearest 5 above), or pointsUsed drifts
  const BASE_TOTAL=()=>Object.values(baseSkills(player.position)).reduce((a,b)=>a+(Math.round(b/5)*5),0);
  const pointsUsed=()=>totalSkillPts()-BASE_TOTAL()+(intangs.length*20);
  const pointsLeft=()=>100-pointsUsed();

  const SKILL_STEP=5;
  const SKILL_FLOOR=25;
  const SKILL_CEIL=85;

  const adjSkill=(id,d)=>{
    const step=d*SKILL_STEP;
    const cur=(player.skills[id]||50);
    const nv=clamp(cur+step,SKILL_FLOOR,SKILL_CEIL);
    if(nv===cur) return; // would have been clamped — no-op
    if(d>0&&pointsLeft()<SKILL_STEP) return toast("Not enough points!",RE);
    setPlayer(p=>({...p,skills:{...p.skills,[id]:nv}}));
  };

  const toggleIntang=(item)=>{
    if(intangs.includes(item.id)){
      setIntangs(prev=>prev.filter(x=>x!==item.id));
      setPlayer(p=>({...p,intangibles:p.intangibles.filter(x=>x!==item.id)}));
    } else {
      if(pointsLeft()<20) return toast("Need 20 points for an Intangible!",RE);
      setIntangs(prev=>[...prev,item.id]);
      setPlayer(p=>({...p,intangibles:[...p.intangibles,item.id]}));
    }
  };

  const views={
    loadscreen:(
      <div onClick={()=>{startMusicFromGesture();go("title");}} style={{position:"fixed",inset:0,cursor:"pointer",background:"#000",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:999,overflow:"hidden"}}>
        <img src={"/loadscreen.png"} alt="Gooden 2003" style={{width:"100%",height:"100%",objectFit:"contain",objectPosition:"center",position:"absolute",inset:0}}/>
        <div style={{position:"absolute",bottom:50,left:0,right:0,textAlign:"center",animation:"pulse 1.5s ease-in-out infinite"}}>
          <div style={{fontSize:18,fontWeight:900,letterSpacing:5,textTransform:"uppercase",color:"white",textShadow:"0 2px 20px rgba(0,0,0,0.9)"}}>TAP TO START</div>
        </div>
        <style>{"@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}"}</style>
      </div>
    ),

    howto:(
      <MenuFrame sub="From Home" title="HOW TO PLAY">
        <button onClick={()=>go("title")} style={{...ghostS,marginBottom:14,width:"auto",padding:"7px 14px",fontSize:12}}>← Back to Home</button>
        <div style={{fontSize:13,color:"#ddd",lineHeight:1.55,marginBottom:14}}>
          Build your player from scratch, pick a school, grind through 4 college seasons, then declare for the NBA Draft. Each season you play 5 mini-games that decide your stats and development.
        </div>
        <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:OR,marginBottom:8}}>The Flow</div>
        <div style={{background:"rgba(232,135,58,0.06)",border:"1px solid rgba(232,135,58,0.18)",borderRadius:10,padding:"10px 12px",marginBottom:14,fontSize:12,color:"#ccc",lineHeight:1.55}}>
          Bio → Look → Star Rating → Build Skills → Pick School → Set Priorities → Play Season → Recap → Decide (return / transfer / declare) → Pre-Draft → Combine + Interview → Sign Agent → Workout → DRAFT NIGHT
        </div>

        <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:OR,marginBottom:8}}>The 5 Mini-Games</div>

        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 12px",marginBottom:8}}>
          <div style={{fontSize:14,fontWeight:700,color:OR,marginBottom:3}}>🏀 Shooting</div>
          <div style={{fontSize:12,color:"#ccc",lineHeight:1.5}}>Pick a shot (3pt / mid / rim). A puck moves across a bar — tap SHOOT when it's in the green zone. Yellow center = perfect. Higher skill = wider window. Each shot type you take and make boosts that skill at season end.</div>
        </div>

        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 12px",marginBottom:8}}>
          <div style={{fontSize:14,fontWeight:700,color:OR,marginBottom:3}}>🛡️ Defense</div>
          <div style={{fontSize:12,color:"#ccc",lineHeight:1.5}}>The offensive player drives — match their move. Tap LEFT, RIGHT, or BLOCK at the right moment. Better defensive skill slows their tells and widens your reaction window.</div>
        </div>

        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 12px",marginBottom:8}}>
          <div style={{fontSize:14,fontWeight:700,color:OR,marginBottom:3}}>⚡ Possession</div>
          <div style={{fontSize:12,color:"#ccc",lineHeight:1.5}}>You start at the top of the key with 4 teammates around the half-court. The <span style={{color:GR}}>open man</span> is highlighted green. Tap a teammate to pass; <strong>press and hold</strong> the ball handler to start your shot meter, then <strong>release</strong> when it's in the sweet spot.</div>
        </div>

        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 12px",marginBottom:8}}>
          <div style={{fontSize:14,fontWeight:700,color:OR,marginBottom:3}}>✋ Steal & Dunk</div>
          <div style={{fontSize:12,color:"#ccc",lineHeight:1.5}}>Time your tap to the swing of the meter to swipe the ball, then make 5 fast taps to finish at the rim. Defense skill helps the steal; finishing helps the dunk.</div>
        </div>

        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 12px",marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:700,color:OR,marginBottom:3}}>📡 Passing</div>
          <div style={{fontSize:12,color:"#ccc",lineHeight:1.5}}>Find the open teammate before the defense reads the play. Quick taps reward sharp playmaking.</div>
        </div>

        <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:OR,marginBottom:8}}>Pre-Draft</div>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 12px",marginBottom:14,fontSize:12,color:"#ccc",lineHeight:1.55}}>
          <strong>Combine</strong> = sprint taps + bench-press timing + 9 shots from 3 distances.<br/>
          <strong>Interview</strong> = answer one GM question in your own words. Be honest, specific, confident.<br/>
          <strong>Agent</strong> = signs you based on your projection. Top reps only take blue-chippers. Pick the workout partner with the most upgrades you can get.
        </div>

        <button onClick={()=>go("title")} style={btnS}>BACK TO HOME →</button>
      </MenuFrame>
    ),

    options:(
      <MenuFrame sub="Settings" title="OPTIONS">
        <button onClick={()=>go("title")} style={{...ghostS,marginBottom:14,width:"auto",padding:"7px 14px",fontSize:12}}>← Back to Home</button>

        <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:OR,marginBottom:8}}>Audio</div>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"12px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#f0ede8"}}>🎵 Background Music</div>
            <div style={{fontSize:11,color:"#888",marginTop:2}}>NBA Live 2003 soundtrack · loops continuously</div>
            <div style={{fontSize:10,color:audioState==="playing"?GR:audioState==="blocked"?OR:audioState==="error"?RE:"#888",marginTop:4,letterSpacing:1.5,fontWeight:700}}>
              Status: {audioState.toUpperCase()}
            </div>
            {audioError&&(
              <div style={{fontSize:9,color:RE,marginTop:2,lineHeight:1.4,maxWidth:240}}>
                {audioError}
              </div>
            )}
          </div>
          {/* Custom toggle switch */}
          <button onClick={()=>setMusicOn(v=>!v)} style={{
            width:54,height:30,borderRadius:15,border:"none",cursor:"pointer",padding:0,
            background:musicOn?GR:"rgba(255,255,255,0.15)",
            position:"relative",transition:"background 0.2s",
          }}>
            <div style={{
              position:"absolute",top:3,left:musicOn?27:3,
              width:24,height:24,borderRadius:"50%",background:"#fff",
              boxShadow:"0 2px 4px rgba(0,0,0,0.4)",transition:"left 0.2s",
            }}/>
          </button>
        </div>

        <div style={{fontSize:11,color:"#888",lineHeight:1.5,marginBottom:18}}>
          Toggle music on/off here at any time. Your choice stays in effect through the whole career.
        </div>

        <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:OR,marginBottom:8}}>Save Data</div>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:700,color:"#f0ede8"}}>💾 Career Save</div>
          <div style={{fontSize:11,color:"#888",marginTop:2,lineHeight:1.5}}>
            {hasSave
              ? "Your progress auto-saves on this device. Pick up where you left off any time."
              : "No save yet. Your progress will auto-save once you start a career."}
          </div>
          {hasSave && (
            <button onClick={()=>{
              const ok = typeof window!=="undefined" && window.confirm
                ? window.confirm("Delete your saved career? This can't be undone.")
                : true;
              if(!ok) return;
              clearSave();
              setHasSave(false);
              toast("Save deleted");
            }} style={{...ghostS,marginTop:10,width:"auto",padding:"7px 14px",fontSize:12,color:RE,borderColor:RE}}>
              Delete Save
            </button>
          )}
        </div>

        {/* Testing mode — jump in as a generic player at any stage. Auto-save
            is paused while in testing so the real career is preserved. */}
        <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:OR,marginBottom:8}}>Developer</div>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"12px 14px",marginBottom:18}}>
          <div style={{fontSize:14,fontWeight:700,color:"#f0ede8"}}>🧪 Testing Mode</div>
          <div style={{fontSize:11,color:"#888",marginTop:2,lineHeight:1.5}}>
            Jump in as Mike Basketball at any stage to verify the game works. Auto-save is paused — your real career is preserved.
          </div>
          <button onClick={()=>go("testing")} style={{...ghostS,marginTop:10,width:"auto",padding:"7px 14px",fontSize:12}}>
            Open Testing Mode →
          </button>
        </div>

        <button onClick={()=>go("title")} style={btnS}>BACK TO HOME →</button>
      </MenuFrame>
    ),

    // Testing mode — preset Mike Basketball at various career stages so the
    // user can verify each batch of changes without playing through.
    testing:(
      <MenuFrame sub="Mike Basketball Presets" title="TESTING MODE">
        <button onClick={()=>go("options")} style={{...ghostS,marginBottom:14,width:"auto",padding:"7px 14px",fontSize:12}}>← Back to Options</button>

        <div style={{background:"rgba(232,135,58,0.08)",border:`1px solid ${OR}55`,borderRadius:10,padding:"10px 12px",marginBottom:14}}>
          <div style={{fontSize:11,color:OR,fontWeight:700,letterSpacing:1.5,marginBottom:3}}>⚠ AUTO-SAVE IS PAUSED</div>
          <div style={{fontSize:11,color:"#aaa",lineHeight:1.5}}>Your real career save is untouched. Use "Exit Testing" on any screen — or return to the title — to come back.</div>
        </div>

        <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"#aaa",marginBottom:8}}>NBA Presets</div>

        <button onClick={()=>jumpToTesting("lottery")} style={{...btnS,textAlign:"left",padding:"12px 14px",marginBottom:8,display:"block"}}>
          <div style={{fontSize:14,fontWeight:900,color:"#080c10"}}>🏆 LOTTERY ROOKIE</div>
          <div style={{fontSize:10,color:"rgba(0,0,0,0.7)",marginTop:2,fontWeight:600,letterSpacing:0.5}}>#3 pick · Lakers · Nike deal (+5 SP) · Starter minutes</div>
        </button>

        <button onClick={()=>jumpToTesting("secondRound")} style={{textAlign:"left",padding:"12px 14px",marginBottom:8,display:"block",width:"100%",background:`linear-gradient(135deg, ${PU} 0%, #4a2e8a 100%)`,border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif"}}>
          <div style={{fontSize:14,fontWeight:900}}>📋 2ND ROUND ROOKIE</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.8)",marginTop:2,fontWeight:600,letterSpacing:0.5}}>#40 pick · Bobcats · No shoe deal · Limited minutes (≤14 MPG)</div>
        </button>

        <button onClick={()=>jumpToTesting("undrafted")} style={{textAlign:"left",padding:"12px 14px",marginBottom:8,display:"block",width:"100%",background:`linear-gradient(135deg, ${RE} 0%, #6b1818 100%)`,border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif"}}>
          <div style={{fontSize:14,fontWeight:900}}>😤 UNDRAFTED ROOKIE</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.8)",marginTop:2,fontWeight:600,letterSpacing:0.5}}>Cavaliers · No shoe deal · Deep bench (≤8 MPG)</div>
        </button>

        <button onClick={()=>jumpToTesting("vet")} style={{textAlign:"left",padding:"12px 14px",marginBottom:8,display:"block",width:"100%",background:`linear-gradient(135deg, ${GR} 0%, #006633 100%)`,border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif"}}>
          <div style={{fontSize:14,fontWeight:900}}>🌟 YEAR 3 VET</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.8)",marginTop:2,fontWeight:600,letterSpacing:0.5}}>Kings · Elite skills · 2 prior seasons · No rookie floor</div>
        </button>

        <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"#aaa",marginTop:14,marginBottom:8}}>Pre-NBA</div>

        <button onClick={()=>jumpToTesting("college")} style={{textAlign:"left",padding:"12px 14px",marginBottom:14,display:"block",width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${OR}55`,borderRadius:8,color:"#fff",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif"}}>
          <div style={{fontSize:14,fontWeight:900,color:OR}}>🎓 COLLEGE FRESHMAN</div>
          <div style={{fontSize:10,color:"#aaa",marginTop:2,fontWeight:600,letterSpacing:0.5}}>Duke · 4-star recruit · Year 1 · Skills 65-75</div>
        </button>

        <div style={{fontSize:11,color:"#888",lineHeight:1.5,padding:"10px 12px",background:"rgba(0,0,0,0.25)",borderRadius:8,marginBottom:14}}>
          Each preset wipes whatever career state is in memory and drops you in fresh. Your saved career on disk is preserved.
        </div>

        <button onClick={()=>go("title")} style={ghostS}>← Back to Home</button>
      </MenuFrame>
    ),

    extras:(
      <MenuFrame sub="GOODEN 2003 Extras" title="DREW GOODEN">
        <button onClick={()=>go("title")} style={{...ghostS,marginBottom:14,width:"auto",padding:"7px 14px",fontSize:12}}>← Back to Home</button>

        {/* Picture */}
        <div style={{margin:"0 0 14px",borderRadius:10,overflow:"hidden",border:"1px solid rgba(232,135,58,0.25)"}}>
          <img src={GOODEN_PIC_DATA_URL} alt="Drew Gooden" style={{width:"100%",height:"auto",display:"block"}}/>
        </div>

        <div style={{fontSize:13,color:"#ddd",lineHeight:1.55,marginBottom:14}}>
          Drew Gooden was the 4th overall pick of the 2002 NBA Draft (Memphis Grizzlies, out of Kansas). A 6'10" power forward, he spent 14 seasons in the league with eleven different teams — including a long stint with the Cleveland Cavaliers alongside LeBron James.
        </div>

        <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:OR,marginBottom:8}}>NBA Career Stats</div>
        <div style={{background:"rgba(232,135,58,0.08)",border:"1px solid rgba(232,135,58,0.22)",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,textAlign:"center",marginBottom:10}}>
            {[["11.0","PPG"],["6.9","RPG"],["1.1","APG"],["847","Games"]].map(([v,l])=>(
              <div key={l}>
                <div style={{fontSize:22,fontWeight:900,color:YE,lineHeight:1}}>{v}</div>
                <div style={{fontSize:10,color:"#bbb",marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:8,fontSize:12,color:"#ccc",lineHeight:1.6}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#aaa"}}>Career FG%</span><span style={{fontWeight:700,color:"#fff"}}>46.5%</span></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#aaa"}}>Career 3P%</span><span style={{fontWeight:700,color:"#fff"}}>33.0%</span></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#aaa"}}>Career FT%</span><span style={{fontWeight:700,color:"#fff"}}>71.4%</span></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#aaa"}}>Total Points</span><span style={{fontWeight:700,color:"#fff"}}>9,290</span></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#aaa"}}>Total Rebounds</span><span style={{fontWeight:700,color:"#fff"}}>5,855</span></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#aaa"}}>Seasons</span><span style={{fontWeight:700,color:"#fff"}}>14 (2002-2016)</span></div>
          </div>
        </div>

        <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:OR,marginBottom:8}}>Teams</div>
        <div style={{fontSize:12,color:"#ccc",lineHeight:1.7,marginBottom:14,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 14px"}}>
          Memphis Grizzlies · Orlando Magic · <strong style={{color:"#fff"}}>Cleveland Cavaliers</strong> · Chicago Bulls · Sacramento Kings · San Antonio Spurs · Dallas Mavericks · Washington Wizards · Milwaukee Bucks · LA Clippers · Cleveland Cavaliers (2nd stint)
        </div>

        <button onClick={()=>go("title")} style={btnS}>BACK TO HOME →</button>
      </MenuFrame>
    ),

    title:(()=>{
      // NBA Live 2003 inspired menu: chrome arc, orange basketball background, highlighted selection.
      // "PLAY NOW" becomes "RESUME CAREER" when a save exists, and starting a new
      // career when a save exists prompts a confirmation so the user doesn't
      // accidentally wipe progress.
      const startNewCareer=()=>{
        if(hasSave){
          // eslint-disable-next-line no-restricted-globals
          const ok = typeof window!=="undefined" && window.confirm
            ? window.confirm("Starting a new career will erase your saved progress. Continue?")
            : true;
          if(!ok) return;
          wipeAndStartNew();
        } else {
          go("bio");
        }
      };
      const menuItems=hasSave?[
        {id:"resume",label:"RESUME CAREER",   sub:"Pick up where you left off", action:resumeCareer},
        {id:"new",   label:"NEW CAREER",      sub:"Start over from scratch",    action:startNewCareer},
        {id:"how",   label:"HOW TO PLAY",     sub:"Learn the flow",             action:()=>go("howto")},
        {id:"opts",  label:"OPTIONS",         sub:"Sound, settings",            action:()=>go("options")},
        {id:"about", label:"GOODEN 2003 EXTRAS",sub:"About Drew Gooden",        action:()=>go("extras")},
      ]:[
        {id:"new",   label:"PLAY NOW",        sub:"Start a new career",         action:startNewCareer},
        {id:"how",   label:"HOW TO PLAY",     sub:"Learn the flow",             action:()=>go("howto")},
        {id:"opts",  label:"OPTIONS",         sub:"Sound, settings",            action:()=>go("options")},
        {id:"about", label:"GOODEN 2003 EXTRAS",sub:"About Drew Gooden",        action:()=>go("extras")},
      ];
      return(
        <div style={{position:"relative",minHeight:"calc(100vh - 60px)",margin:"-16px -16px 0",overflow:"hidden"}}>
          {/* Background: basketball texture + orange gradient */}
          <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 70% 40%, #e8873a 0%, #c25e1d 35%, #6b2f0d 75%, #1a0a04 100%)"}}/>
          {/* Faint repeating "GOODEN 2003" watermark text along the top, NBA Live 2003 style */}
          <div style={{position:"absolute",top:14,left:0,right:0,fontSize:22,fontWeight:900,letterSpacing:6,color:"rgba(255,255,255,0.05)",whiteSpace:"nowrap",overflow:"hidden",textAlign:"center",pointerEvents:"none"}}>
            GOODEN&nbsp;2003 · GOODEN&nbsp;2003 · GOODEN&nbsp;2003
          </div>
          {/* Chrome arc (left side) */}
          <svg width="100%" height="100%" viewBox="0 0 430 700" preserveAspectRatio="none" style={{position:"absolute",inset:0,pointerEvents:"none"}}>
            <defs>
              <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#5a5d63"/>
                <stop offset="35%" stopColor="#d8dadd"/>
                <stop offset="55%" stopColor="#f5f6f7"/>
                <stop offset="75%" stopColor="#a1a4a9"/>
                <stop offset="100%" stopColor="#3d4046"/>
              </linearGradient>
              <linearGradient id="chrome2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2a2c30"/>
                <stop offset="50%" stopColor="#9c9fa4"/>
                <stop offset="100%" stopColor="#2a2c30"/>
              </linearGradient>
            </defs>
            {/* Outer arc */}
            <path d="M -80 0 Q 80 350 -80 700 L -200 700 L -200 0 Z" fill="url(#chrome)" opacity="0.92"/>
            {/* Inner thin arc accent */}
            <path d="M 5 0 Q 105 350 5 700" fill="none" stroke="url(#chrome2)" strokeWidth="2" opacity="0.85"/>
            <path d="M 25 0 Q 125 350 25 700" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
          </svg>

          {/* Logo emblem — cover art top-left, smaller */}
          <div style={{position:"relative",zIndex:2,paddingTop:24,paddingLeft:14}}>
            <Logo size={88}/>
          </div>

          {/* Cover art player — large, decorative, right side */}
          <div style={{position:"absolute",right:-30,top:30,opacity:0.55,pointerEvents:"none",zIndex:1,width:260,height:260,filter:"contrast(1.1) saturate(0.9)"}}>
            <img src={COVER_ART_DATA_URL} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%",maskImage:"radial-gradient(circle, black 55%, transparent 75%)",WebkitMaskImage:"radial-gradient(circle, black 55%, transparent 75%)"}}/>
          </div>

          {/* Menu items */}
          <div style={{position:"relative",zIndex:3,padding:"30px 24px 80px 24px",marginTop:-8}}>
            <div style={{
              background:"linear-gradient(135deg, rgba(120,55,20,0.85) 0%, rgba(60,25,8,0.92) 100%)",
              border:"1px solid rgba(255,255,255,0.08)",
              borderLeft:"3px solid "+OR,
              borderRadius:"4px 24px 24px 4px",
              padding:"22px 18px 26px 14px",
              boxShadow:"0 8px 24px rgba(0,0,0,0.5)",
              marginLeft:14,
            }}>
              {menuItems.map((item,i)=>{
                const primary=i===0;
                return(
                  <button key={item.id} onClick={item.action} style={{
                    display:"flex",alignItems:"center",gap:12,width:"100%",
                    background:"transparent",border:"none",cursor:"pointer",
                    padding:"10px 6px",marginBottom:2,
                    fontFamily:"'Barlow Condensed',sans-serif",
                    textAlign:"left",
                  }}>
                    {/* "A button" indicator on primary */}
                    {primary?(
                      <div style={{
                        width:22,height:22,borderRadius:"50%",
                        background:"radial-gradient(circle at 35% 30%, #c8f0a8 0%, #4eaa20 70%, #1d4d09 100%)",
                        border:"1.5px solid rgba(255,255,255,0.4)",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:11,fontWeight:900,color:"#0d2a05",
                        boxShadow:"inset 0 -2px 4px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.5)",
                        flexShrink:0,
                      }}>A</div>
                    ):(
                      <div style={{width:22,flexShrink:0}}/>
                    )}
                    <div style={{flex:1}}>
                      <div style={{
                        fontSize:primary?22:18,fontWeight:900,letterSpacing:1.5,lineHeight:1.1,
                        color:primary?YE:"#f0ede8",
                        textShadow:primary?"0 2px 4px rgba(0,0,0,0.6), 0 0 12px rgba(255,235,59,0.3)":"0 1px 2px rgba(0,0,0,0.5)",
                      }}>{item.label}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.45)",letterSpacing:1,marginTop:1}}>{item.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom control hints */}
            <div style={{marginTop:24,paddingLeft:18,display:"flex",gap:18,flexWrap:"wrap",fontSize:10,color:"rgba(255,255,255,0.55)",letterSpacing:1}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:18,height:18,borderRadius:"50%",background:"radial-gradient(circle at 35% 30%, #c8f0a8 0%, #4eaa20 70%, #1d4d09 100%)",border:"1.5px solid rgba(255,255,255,0.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,color:"#0d2a05"}}>A</div>
                SELECT ITEM
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:18,height:18,borderRadius:4,background:"linear-gradient(180deg, #8a8d92 0%, #4a4d52 100%)",border:"1px solid rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#1a1a1a",fontWeight:900}}>▲</div>
                <div style={{width:18,height:18,borderRadius:4,background:"linear-gradient(180deg, #8a8d92 0%, #4a4d52 100%)",border:"1px solid rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#1a1a1a",fontWeight:900}}>▼</div>
                NEXT ITEM
              </div>
            </div>
          </div>
        </div>
      );
    })(),

    bio:(
      <MenuFrame sub="Step 1 — Identity" title="WHO ARE YOU?">
        <div style={{marginBottom:14}}><Lbl>Full Name</Lbl><input value={player.name} onChange={e=>setPlayer(p=>({...p,name:e.target.value}))} placeholder="Your name..." style={inputS}/></div>
        <div style={{marginBottom:14}}>
          <Lbl>Primary Position</Lbl>
          <div style={{display:"flex",gap:7}}>
            {POSITIONS.map(pos=><button key={pos} onClick={()=>setPlayer(p=>p.position===pos?p:({...p,position:pos,skills:defaultSkills(pos)}))} style={{flex:1,padding:"10px 0",background:player.position===pos?OR:"rgba(255,255,255,0.05)",border:`1px solid ${player.position===pos?OR:"rgba(255,255,255,0.1)"}`,borderRadius:8,color:player.position===pos?"#080c10":"#f0ede8",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"'Barlow Condensed',sans-serif"}}>{pos}</button>)}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
          <div><Lbl>Height: {Math.floor(player.height/12)}'{player.height%12}"</Lbl><input type="range" min={70} max={90} value={player.height} onChange={e=>setPlayer(p=>({...p,height:+e.target.value}))} style={{width:"100%"}}/></div>
          <div><Lbl>Weight: {player.weight}lb</Lbl><input type="range" min={170} max={290} value={player.weight} onChange={e=>setPlayer(p=>({...p,weight:+e.target.value}))} style={{width:"100%"}}/></div>
        </div>
        <div style={{marginBottom:14}}><Lbl>Hometown</Lbl><input value={player.hometown} onChange={e=>setPlayer(p=>({...p,hometown:e.target.value}))} placeholder="City, State" style={inputS}/></div>
        <div style={{display:"flex",gap:8,marginTop:20}}>
          <button onClick={()=>go("title")} style={{...ghostS,flex:1}}>Back</button>
          <button onClick={()=>{if(!player.name.trim())return toast("Enter your name!");go("appearance");}} style={{...btnS,flex:2}}>NEXT →</button>
        </div>
      </MenuFrame>
    ),

    appearance:(
      <MenuFrame sub="Step 2 — Look" title="CREATE YOUR LOOK">
        <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
          <PlayerAvatar app={player.appearance} size={120}/>
        </div>
        {/* Photo upload — overrides the SVG avatar */}
        <div style={{marginBottom:16}}>
          <Lbl>Upload Photo (optional)</Lbl>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <label style={{...ghostS,flex:1,textAlign:"center",cursor:"pointer",margin:0,display:"inline-block"}}>
              {player.appearance?.photo?"📷 Change Photo":"📷 Choose Photo"}
              <input type="file" accept="image/*" style={{display:"none"}} onChange={(e)=>{
                const file=e.target.files&&e.target.files[0];
                if(!file)return;
                if(file.size>5*1024*1024){toast("Image too large (max 5MB)",RE);return;}
                const reader=new FileReader();
                reader.onload=(ev)=>{
                  setPlayer(p=>({...p,appearance:{...p.appearance,photo:ev.target.result}}));
                  toast("Photo uploaded!",GR);
                };
                reader.readAsDataURL(file);
              }}/>
            </label>
            {player.appearance?.photo&&(
              <button onClick={()=>setPlayer(p=>({...p,appearance:{...p.appearance,photo:null}}))} style={{...ghostS,width:"auto",padding:"11px 14px",color:RE,borderColor:"rgba(232,64,64,0.3)"}}>Remove</button>
            )}
          </div>
          <div style={{fontSize:10,color:"#555",marginTop:6,lineHeight:1.4}}>
            Upload a photo to use instead of the SVG avatar. Leave empty to customize the avatar below.
          </div>
        </div>
        {!player.appearance?.photo&&(
          <>
            <div style={{marginBottom:14}}>
              <Lbl>Skin Tone</Lbl>
              <div style={{display:"flex",gap:8}}>
                {SKIN_TONES.map(s=><button key={s} onClick={()=>setPlayer(p=>({...p,appearance:{...p.appearance,skin:s}}))} style={{flex:1,height:32,borderRadius:6,background:s,border:`2px solid ${player.appearance?.skin===s?"white":"transparent"}`,cursor:"pointer"}}/>)}
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <Lbl>Hair</Lbl>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {HAIR_STYLES.map(h=><button key={h} onClick={()=>setPlayer(p=>({...p,appearance:{...p.appearance,hair:h}}))} style={{padding:"6px 12px",background:player.appearance?.hair===h?OR:"rgba(255,255,255,0.06)",border:`1px solid ${player.appearance?.hair===h?OR:"rgba(255,255,255,0.1)"}`,borderRadius:8,color:player.appearance?.hair===h?"#080c10":"#f0ede8",cursor:"pointer",fontSize:12,fontFamily:"'Barlow Condensed',sans-serif"}}>{h}</button>)}
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <Lbl>Facial Hair</Lbl>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {BEARD_STYLES.map(b=><button key={b} onClick={()=>setPlayer(p=>({...p,appearance:{...p.appearance,beard:b}}))} style={{padding:"6px 12px",background:player.appearance?.beard===b?OR:"rgba(255,255,255,0.06)",border:`1px solid ${player.appearance?.beard===b?OR:"rgba(255,255,255,0.1)"}`,borderRadius:8,color:player.appearance?.beard===b?"#080c10":"#f0ede8",cursor:"pointer",fontSize:12,fontFamily:"'Barlow Condensed',sans-serif"}}>{b}</button>)}
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <Lbl>Headband</Lbl>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {HEADBAND_COLORS.map(h=><button key={h} onClick={()=>setPlayer(p=>({...p,appearance:{...p.appearance,headband:h}}))} style={{padding:"6px 12px",background:player.appearance?.headband===h?OR:"rgba(255,255,255,0.06)",border:`1px solid ${player.appearance?.headband===h?OR:"rgba(255,255,255,0.1)"}`,borderRadius:8,color:player.appearance?.headband===h?"#080c10":"#f0ede8",cursor:"pointer",fontSize:12,fontFamily:"'Barlow Condensed',sans-serif"}}>{h}</button>)}
              </div>
            </div>
          </>
        )}
        {/* Jersey number picker — always visible (number shows on the jersey at draft regardless of photo vs SVG avatar) */}
        <div style={{marginBottom:14}}>
          <Lbl>Jersey Number</Lbl>
          <input
            type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2}
            value={String(player.appearance?.jerseyNumber ?? 23)}
            onChange={e=>{
              const digits=e.target.value.replace(/\D/g,"").slice(0,2);
              const v=digits===""?0:clamp(parseInt(digits,10),0,99);
              setPlayer(p=>({...p,appearance:{...p.appearance,jerseyNumber:v}}));
            }}
            style={{...inputS,fontSize:32,fontWeight:900,textAlign:"center",color:OR,padding:"14px 16px",letterSpacing:4}}
          />
          <div style={{fontSize:10,color:"#555",marginTop:5}}>Type a number 0-99. This shows on your jersey at draft night.</div>
        </div>
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <button onClick={()=>go("bio")} style={{...ghostS,flex:1}}>Back</button>
          <button onClick={()=>go("stars")} style={{...btnS,flex:2}}>NEXT →</button>
        </div>
      </MenuFrame>
    ),

    stars:(
      <MenuFrame sub="Step 3 — Recruiting Rank" title="WHAT STAR ARE YOU?">
        <div style={{fontSize:13,color:"#888",marginBottom:14,lineHeight:1.5}}>Higher stars = bigger schools and more exposure, but tougher competition and harder mini-games.</div>
        {STAR_TIERS.map(tier=>{
          const sel=starTier?.stars===tier.stars;
          return(
            <CardBtn key={tier.stars} selected={sel} onClick={()=>setStarTier(tier)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{display:"flex",gap:2,marginBottom:4}}>{Array.from({length:5}).map((_,i)=><span key={i} style={{fontSize:13,opacity:i<tier.stars?1:0.15}}>⭐</span>)}</div>
                  <div style={{fontSize:15,fontWeight:700,marginBottom:3}}>{tier.label}</div>
                  <div style={{fontSize:12,color:"#888"}}>{tier.desc}</div>
                </div>
                <div style={{textAlign:"right",minWidth:55}}>
                  <div style={{fontSize:9,color:"#555"}}>Difficulty</div>
                  <div style={{fontSize:18,fontWeight:900,color:tier.difficulty>1?RE:GR}}>{tier.difficulty}x</div>
                </div>
              </div>
            </CardBtn>
          );
        })}
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <button onClick={()=>go("appearance")} style={{...ghostS,flex:1}}>Back</button>
          <button onClick={()=>{if(!starTier)return toast("Pick your star rating!");go("build");}} style={{...btnS,flex:2}}>NEXT →</button>
        </div>
      </MenuFrame>
    ),

    build:(
      <MenuFrame sub="Step 4 — Build" title="BUILD YOUR GAME">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(232,135,58,0.08)",border:"1px solid rgba(232,135,58,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:16}}>
          <div><Lbl>Points Left</Lbl><div style={{fontSize:28,fontWeight:900,color:pointsLeft()<10?RE:OR,marginTop:-2}}>{pointsLeft()}</div></div>
          <div style={{textAlign:"right"}}><Lbl>Overall</Lbl><div style={{fontSize:28,fontWeight:900,marginTop:-2}}>{ovr}</div></div>
          <div style={{textAlign:"center"}}><PlayerAvatar app={player.appearance} size={50}/></div>
        </div>

        <Lbl color={PU}>Intangibles — 20pts each</Lbl>
        <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:16}}>
          {INTANGIBLES.map(item=>{
            const has=intangs.includes(item.id);
            return <button key={item.id} onClick={()=>toggleIntang(item)} style={{padding:"7px 11px",background:has?"rgba(168,138,255,0.25)":"rgba(255,255,255,0.05)",border:`1px solid ${has?PU:"rgba(255,255,255,0.1)"}`,borderRadius:8,color:has?PU:"#aaa",cursor:"pointer",fontSize:12,fontFamily:"'Barlow Condensed',sans-serif"}}>
              {item.icon} {item.label}
            </button>;
          })}
        </div>

        <Lbl color={OR}>Skills — 1pt each</Lbl>
        {allSkills.map(s=>{
          const val=player.skills[s.id]||50;
          const pct=(val/85)*100;
          return(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
              <span style={{width:18,fontSize:13}}>{s.icon}</span>
              <span style={{flex:1,fontSize:12,color:"#ccc"}}>{s.label}</span>
              <div style={{width:44,height:3,background:"rgba(255,255,255,0.08)",borderRadius:2,flexShrink:0}}><div style={{width:`${pct}%`,height:"100%",background:OR,borderRadius:2}}/></div>
              <button onClick={()=>adjSkill(s.id,-1)} style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",color:"#f0ede8",width:26,height:26,borderRadius:5,cursor:"pointer",fontSize:15,fontFamily:"'Barlow Condensed',sans-serif",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
              <span style={{fontSize:13,fontWeight:700,width:24,textAlign:"center",color:OR,flexShrink:0}}>{val}</span>
              <button onClick={()=>adjSkill(s.id,1)} style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",color:"#f0ede8",width:26,height:26,borderRadius:5,cursor:"pointer",fontSize:15,fontFamily:"'Barlow Condensed',sans-serif",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
            </div>
          );
        })}
        <div style={{display:"flex",gap:8,marginTop:18}}>
          <button onClick={()=>go("stars")} style={{...ghostS,flex:1}}>Back</button>
          <button onClick={()=>go("school")} style={{...btnS,flex:2}}>NEXT →</button>
        </div>
      </MenuFrame>
    ),

    school:(()=>{
      const avail=SCHOOLS.filter(s=>s.minStars<=(starTier?.stars||3));
      return(
        <MenuFrame sub="Step 5 — Pick Your School" title="WHERE DO YOU GO?">
          <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:OR,marginBottom:8}}>College Programs ({avail.length})</div>
          {avail.map(sc=>(
            <CardBtn key={sc.id} selected={school?.id===sc.id} onClick={()=>setSchool(sc)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1,marginRight:8}}>
                  <div style={{fontSize:15,fontWeight:700}}>{sc.name}</div>
                  <div style={{fontSize:11,color:"#555",marginBottom:5}}>{sc.conf} · Difficulty {sc.difficulty}x</div>
                  <div>{sc.devStrengths.map(ds=>{const item=SKILLS.find(x=>x.id===ds);return <Tag key={ds}>{item?.icon} {item?.label}</Tag>;})}</div>
                </div>
                <div style={{textAlign:"right",minWidth:55}}>
                  <div style={{fontSize:9,color:"#555"}}>PT</div>
                  <div style={{fontSize:17,fontWeight:900,color:sc.playTime>75?GR:sc.playTime>55?OR:RE}}>{sc.playTime}%</div>
                  <div style={{fontSize:9,color:"#555",marginTop:2}}>EXP</div>
                  <div style={{fontSize:13,fontWeight:700,color:"#666"}}>{sc.exposure}</div>
                </div>
              </div>
            </CardBtn>
          ))}
          <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:PU,marginBottom:8,marginTop:4}}>Overseas Options</div>
          {INTL_TEAMS.map(t=>(
            <CardBtn key={t.id} selected={school?.id===t.id} onClick={()=>setSchool({...t,conf:t.conf,isIntl:true})} accent={PU}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1,marginRight:8}}>
                  <div style={{fontSize:14,fontWeight:700}}>{t.name}</div>
                  <div style={{fontSize:11,color:PU,marginBottom:5}}>{t.country} · {t.conf}</div>
                  <div>{t.devStrengths.map(ds=>{const item=SKILLS.find(x=>x.id===ds);return <Tag key={ds}>{item?.icon} {item?.label}</Tag>;})}</div>
                </div>
                <div style={{textAlign:"right",minWidth:55}}>
                  <div style={{fontSize:9,color:"#555"}}>PT</div>
                  <div style={{fontSize:17,fontWeight:900,color:t.playTime>75?GR:OR}}>{t.playTime}%</div>
                </div>
              </div>
            </CardBtn>
          ))}
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button onClick={()=>go("build")} style={{...ghostS,flex:1}}>Back</button>
            <button onClick={()=>{if(!school)return toast("Pick a school!");setPriorities([]);go("signed");}} style={{...btnS,flex:2}}>LOCK IT IN →</button>
          </div>
        </MenuFrame>
      );
    })(),

    signed:(()=>{
      if(!school) return <div style={{padding:20,color:RE}}>No school selected.</div>;
      const colors=school.colors||{p:"#444",s:"#888"};
      const logo=school.logo||school.name.slice(0,2).toUpperCase();
      return(
        <MenuFrame sub={school.isIntl?"Overseas Signing":"College Commitment"} title="SIGNED">
          <div style={{padding:"20px 0 30px",textAlign:"center"}}>
            <div style={{fontSize:11,letterSpacing:4,color:"#aaa",marginBottom:18}}>{school.isIntl?"YOU'RE GOING OVERSEAS":"YOU COMMITTED TO"}</div>

            {/* School emblem — varied shape & design per school.
                Set school.logoUrl in COLLEGES data to use your own hosted image. */}
            <div style={{display:"flex",justifyContent:"center",margin:"0 auto 22px",animation:"signedPop 0.7s ease-out"}}>
              <TeamEmblem colors={colors} abbr={logo} name={school.name} size={200} logoUrl={school.logoUrl||school.colors?.logoUrl}/>
            </div>

            {/* SIGNED banner */}
            <div style={{fontSize:48,fontWeight:900,letterSpacing:8,color:OR,lineHeight:1,marginBottom:8,textShadow:`0 4px 16px ${OR}88, 0 2px 4px rgba(0,0,0,0.7)`,animation:"signedSlide 0.6s ease-out 0.3s both"}}>SIGNED</div>

            <div style={{fontSize:22,fontWeight:900,color:"#fff",marginBottom:4,animation:"signedSlide 0.6s ease-out 0.5s both"}}>{school.name}</div>
            <div style={{fontSize:12,color:"#aaa",marginBottom:24,animation:"signedSlide 0.6s ease-out 0.6s both"}}>{school.isIntl?`${school.country} · ${school.conf}`:`${school.conf} · Prestige ${school.prestige}/10`}</div>

            <button onClick={()=>go("priorities")} style={{...btnS,animation:"signedSlide 0.6s ease-out 0.8s both"}}>CONTINUE →</button>
            <style>{`
              @keyframes signedPop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
              @keyframes signedSlide{0%{transform:translateY(20px);opacity:0}100%{transform:translateY(0);opacity:1}}
            `}</style>
          </div>
        </MenuFrame>
      );
    })(),

    priorities:(()=>{
      const toggle=(id)=>{
        if(priorities.includes(id)) setPriorities(priorities.filter(p=>p!==id));
        else if(priorities.length<3) setPriorities([...priorities,id]);
        else toast("Max 3 priorities!");
      };
      const seasonLabel=`Year ${year}`;
      return(
        <MenuFrame sub={`${seasonLabel} — ${school?.name}`} title="DEVELOPMENT FOCUS">
          <div style={{fontSize:13,color:"#ccc",marginBottom:10,lineHeight:1.5}}>Pick your top 3 priorities. School strengths ⚡ amplify growth.</div>
          <div style={{background:"rgba(0,220,100,0.12)",border:"1px solid rgba(0,220,100,0.28)",borderRadius:8,padding:"8px 12px",marginBottom:14,fontSize:12,color:GR}}>
            {school?.name} strengths: {school?.devStrengths?.map(ds=>SKILLS.find(x=>x.id===ds)?.label).join(", ")}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:14}}>
            {allSkills.map(opt=>{
              const idx=priorities.indexOf(opt.id); const isStr=school?.devStrengths?.includes(opt.id);
              return <button key={opt.id} onClick={()=>toggle(opt.id)} style={{padding:"7px 10px",background:idx>=0?"rgba(232,135,58,0.22)":isStr?"rgba(0,220,100,0.09)":"rgba(255,255,255,0.05)",border:`1px solid ${idx>=0?OR:isStr?"rgba(0,220,100,0.32)":"rgba(255,255,255,0.08)"}`,borderRadius:8,color:idx>=0?OR:isStr?GR:"#ddd",cursor:"pointer",fontSize:12,fontFamily:"'Barlow Condensed',sans-serif"}}>
                {opt.icon} {opt.label}{isStr?" ⚡":""}
              </button>;
            })}
          </div>
          <div style={{minHeight:56,marginBottom:16}}>
            {priorities.map((pid,i)=>{const item=allSkills.find(x=>x.id===pid);return <div key={pid} style={{fontSize:13,color:[OR,"#bbb","#888"][i],marginBottom:3}}>{i+1}. {item?.icon} {item?.label}</div>;})}
            {priorities.length<3&&<div style={{fontSize:12,color:"#aaa"}}>Select {3-priorities.length} more...</div>}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>go("school")} style={{...ghostS,flex:1}}>Back</button>
            <button onClick={()=>{if(priorities.length<3)return toast("Pick 3 priorities!");go("season");}} style={{...btnS,flex:2}}>PLAY THE SEASON →</button>
          </div>
        </MenuFrame>
      );
    })(),

    season:(
      <div>
        <Hd sub={`Year ${year} — Game Time`} title="SEASON"/>
        <SeasonGame player={player} school={school} priorities={priorities} year={year} starTier={starTier} allYears={allYears} onEnd={(res)=>{
          setSeasonResult(res);
          setPlayer(p=>{
            const ns={...p.skills};
            Object.entries(res.devGains).forEach(([id,g])=>{
              if(ns[id]!==undefined) ns[id]=clamp(ns[id]+g,0,90);
            });
            return {...p,skills:ns};
          });
          setAllYears(prev=>[...prev,{school,stats:res.stats,devGains:res.devGains,year}]);
          go("recap");
        }}/>
      </div>
    ),

    recap:(()=>{
      if(!seasonResult) return <div/>;
      const {stats,devGains}=seasonResult;
      const seasonLabel=`Year ${year}`;
      // Project the draft from current stat sheet (pre-combine)
      const proj=projectDraft({ovr,starTier,school,allYears});
      const tierColor=proj.tier==="top5"?GO:proj.tier==="lottery"?GR:proj.tier==="first"?OR:proj.tier==="early2nd"?BL:proj.tier==="late2nd"?PU:"#888";
      return(
        <MenuFrame sub={`${seasonLabel} Complete`} title="SEASON RECAP">
          <div style={{background:"rgba(232,135,58,0.18)",border:"1px solid rgba(232,135,58,0.35)",borderRadius:12,padding:14,marginBottom:14}}>
            <Lbl color="#ddd">Stats at {school?.name}</Lbl>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,textAlign:"center",marginTop:4}}>
              {[["PPG",stats.ppg],["APG",stats.apg],["RPG",stats.rpg],["FG%",`${stats.fg}%`]].map(([l,v])=>(
                <div key={l}><div style={{fontSize:22,fontWeight:900,color:YE}}>{v}</div><div style={{fontSize:10,color:"#bbb"}}>{l}</div></div>
              ))}
            </div>
          </div>

          {/* Mock Draft Projection */}
          <div style={{background:`linear-gradient(135deg, rgba(0,0,0,0.45) 0%, rgba(${tierColor==="#888"?"60,60,60":"40,15,5"},0.6) 100%)`,border:`1px solid ${tierColor}`,borderRadius:12,padding:"12px 14px",marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <Lbl color={tierColor}>Mock Draft Projection</Lbl>
                <div style={{fontSize:20,fontWeight:900,color:tierColor,lineHeight:1.05,marginTop:2}}>{proj.label}</div>
                <div style={{fontSize:11,color:"#bbb",marginTop:3}}>Picks {proj.range[0]}–{proj.range[1]} · est. #{proj.pick}</div>
              </div>
              <div style={{fontSize:32}}>{proj.tier==="top5"?"💎":proj.tier==="lottery"?"⭐":proj.tier==="first"?"🏀":proj.tier==="early2nd"?"📈":proj.tier==="late2nd"?"🤞":"😬"}</div>
            </div>
            <div style={{fontSize:10,color:"#999",marginTop:6,lineHeight:1.4}}>Based on OVR {ovr}, {starTier?.label||"recruiting rank"}, and {school?.name} performance. Combine & interview can move you up or down.</div>
          </div>

          <div style={{marginBottom:14}}>
            <Lbl color="#ddd">Development Gains</Lbl>
            {Object.entries(devGains).map(([id,g])=>{const item=allSkills.find(x=>x.id===id);return <div key={id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span>{item?.icon}</span><span style={{flex:1,fontSize:13,color:"#eee"}}>{item?.label}</span><span style={{fontSize:13,fontWeight:700,color:GR}}>+{g}</span></div>;})}
          </div>
          <div style={{fontSize:11,color:"#aaa",marginBottom:8}}>Next: 2004-05 NBA Season if you declare now</div>
          {year>=4?(
            <>
              <div style={{background:"rgba(232,135,58,0.12)",border:"1px solid rgba(232,135,58,0.3)",borderRadius:10,padding:"10px 12px",marginBottom:10,fontSize:12,color:"#ddd",lineHeight:1.4}}>
                🎓 You've played your 4th year — eligibility is up. Time to declare for the draft.
              </div>
              <button onClick={()=>go("agentSelect")} style={btnS}>🏀 DECLARE FOR THE DRAFT</button>
            </>
          ):(
            <>
              <Lbl color="#ddd">What is your move?</Lbl>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:6}}>
                <button onClick={()=>go("agentSelect")} style={btnS}>🏀 DECLARE FOR THE DRAFT</button>
                <button onClick={()=>{setYear(y=>y+1);setPriorities([]);go("priorities");}} style={ghostS}>📚 RETURN TO {school?.name?.toUpperCase()}</button>
                <button onClick={()=>{setXferSel(null);go("transfer");}} style={{...ghostS,color:PU,border:`1px solid rgba(168,138,255,0.3)`}}>🔄 ENTER TRANSFER PORTAL</button>
              </div>
            </>
          )}
        </MenuFrame>
      );
    })(),

    transfer:(()=>{
      const lastStats=allYears[allYears.length-1]?.stats;
      const fromBig=(school?.prestige||5)>=7; const performed=(lastStats?.ppg||0)>12;
      const opts=fromBig?SCHOOLS.filter(s=>s.prestige<(school?.prestige||7)&&s.playTime>70):SCHOOLS.filter(s=>s.prestige>(school?.prestige||5)&&s.minStars<=(starTier?.stars||3));
      const options=opts.length?opts:SCHOOLS.slice(0,4);
      return(
        <MenuFrame sub="Transfer Portal" title="NEW CHAPTER">
          <div style={{fontSize:13,color:"#ccc",marginBottom:14,lineHeight:1.5}}>
            {fromBig&&!performed?`Limited minutes at ${school?.name} — smaller schools offering PT.`:!fromBig&&performed?`Breakout year — bigger programs are calling.`:"Here are your options."}
          </div>
          {options.map(sc=>(
            <CardBtn key={sc.id} selected={xferSel?.id===sc.id} onClick={()=>setXferSel(sc)}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div><div style={{fontSize:14,fontWeight:700}}>{sc.name}</div><div style={{fontSize:11,color:"#888"}}>{sc.conf}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:9,color:"#888"}}>PT</div><div style={{fontSize:18,fontWeight:900,color:sc.playTime>75?GR:OR}}>{sc.playTime}%</div></div>
              </div>
            </CardBtn>
          ))}
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button onClick={()=>go("recap")} style={{...ghostS,flex:1}}>Back</button>
            <button onClick={()=>{if(!xferSel)return toast("Pick a school!");setSchool(xferSel);setYear(y=>y+1);setPriorities([]);go("signed");}} style={{...btnS,flex:2}}>TRANSFER →</button>
          </div>
        </MenuFrame>
      );
    })(),

    agentSelect:(()=>{
      const proj=projectDraft({ovr,starTier,school,allYears});
      const tierColor=proj.tier==="top5"?GO:proj.tier==="lottery"?GR:proj.tier==="first"?OR:proj.tier==="early2nd"?BL:proj.tier==="late2nd"?PU:"#888";
      // Determine which agents are "naturally" unlocked
      const naturalUnlocks=AGENTS.filter(a=>TIER_RANK[proj.tier]>=TIER_RANK[a.requiredTier]);
      // If fewer than 2, force-unlock the next-most-accessible agents until we hit 2
      let forceUnlock=new Set(naturalUnlocks.map(a=>a.id));
      if(forceUnlock.size<2){
        // Sort all agents by requiredTier (most accessible first), add until we have 2
        const sorted=[...AGENTS].sort((a,b)=>TIER_RANK[a.requiredTier]-TIER_RANK[b.requiredTier]);
        for(const a of sorted){
          if(forceUnlock.size>=2) break;
          forceUnlock.add(a.id);
        }
      }
      return(
        <MenuFrame sub="Pre-Draft — Representation" title="SIGN AN AGENT">
          <div style={{background:`linear-gradient(135deg, rgba(0,0,0,0.45) 0%, rgba(40,15,5,0.6) 100%)`,border:`1px solid ${tierColor}`,borderRadius:10,padding:"10px 12px",marginBottom:14}}>
            <Lbl color={tierColor}>Current Projection</Lbl>
            <div style={{fontSize:17,fontWeight:900,color:tierColor,lineHeight:1.1,marginTop:2}}>{proj.label} (picks {proj.range[0]}–{proj.range[1]})</div>
            <div style={{fontSize:11,color:"#aaa",marginTop:4,lineHeight:1.4}}>Top-tier agents only sign blue-chip prospects. Bump your projection to unlock better representation.</div>
          </div>

          <div style={{fontSize:13,color:"#ccc",marginBottom:12,lineHeight:1.5}}>Your agent opens doors, runs workouts, and shapes how franchises see you.</div>
          {AGENTS.map(a=>{
            const locked=!forceUnlock.has(a.id);
            const requireLabel={top5:"Top 5 only",lottery:"Lottery+",first:"First-rounders",early2nd:"Early 2nd+",late2nd:"Late 2nd+",undrafted:"Any prospect"}[a.requiredTier];
            // Show team ties as abbreviations using NBA_TEAM_DATA
            const teamAbbrs=a.teamTies.map(t=>NBA_TEAM_DATA[t]?.abbr||t.slice(0,3).toUpperCase());
            return(
              <div key={a.id} style={{position:"relative",marginBottom:8}}>
                <CardBtn onClick={locked?undefined:()=>{setAgent(a);setWorkoutPlayer(null);setWorkoutDone(false);go("agentWorkout");}} style={{opacity:locked?0.5:1,cursor:locked?"not-allowed":"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div style={{flex:1,marginRight:8}}>
                      <div style={{fontSize:15,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
                        {a.name}{locked&&<span style={{fontSize:11,color:RE,fontWeight:700}}>🔒</span>}
                      </div>
                      <div style={{fontSize:11,color:OR,marginBottom:5}}>{a.agency}</div>
                      <div style={{fontSize:12,color:"#aaa",lineHeight:1.4}}>{a.desc}</div>
                    </div>
                    <div style={{textAlign:"right",minWidth:54}}>
                      <div style={{fontSize:9,color:"#888"}}>REP</div>
                      <div style={{fontSize:20,fontWeight:900,color:a.rep>=8?GO:a.rep>=6?OR:"#aaa"}}>{a.rep}/10</div>
                    </div>
                  </div>
                  {/* Roster of NBA workout players */}
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
                    {a.players.map(p=>{
                      const c=p.tier==="superstar"?GO:p.tier==="allstar"?OR:p.tier==="starter"?BL:"#888";
                      return <span key={p.name} style={{fontSize:10,background:"rgba(0,0,0,0.3)",border:`1px solid ${c}`,padding:"2px 7px",borderRadius:10,color:c,fontWeight:700}}>{p.name} (+{p.upgrades*5})</span>;
                    })}
                  </div>
                  {/* Team ties */}
                  <div style={{marginBottom:6}}>
                    <div style={{fontSize:9,letterSpacing:1.5,color:"#888",marginBottom:3}}>TEAM TIES ({teamAbbrs.length})</div>
                    <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                      {teamAbbrs.map((t,i)=>(
                        <span key={i} style={{fontSize:9,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",padding:"2px 5px",borderRadius:4,color:"#bbb",fontWeight:700,letterSpacing:0.5}}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{fontSize:10,color:"#888",letterSpacing:1}}>
                    Min: {requireLabel}
                  </div>
                  {locked&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.55)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                    <div style={{fontSize:11,letterSpacing:2,color:RE,fontWeight:900,textTransform:"uppercase",background:"rgba(20,5,5,0.85)",padding:"5px 10px",borderRadius:6,border:`1px solid ${RE}`}}>🔒 Needs {requireLabel}</div>
                  </div>}
                </CardBtn>
              </div>
            );
          })}
        </MenuFrame>
      );
    })(),

    agentWorkout:(()=>{
      if(!agent) return <div style={{padding:20,color:RE}}>No agent selected.</div>;
      if(!workoutPlayer){
        return(
          <MenuFrame sub={`Signed with ${agent.name}`} title="PICK A WORKOUT PARTNER">
            <div style={{fontSize:13,color:"#ccc",marginBottom:14,lineHeight:1.5}}>
              {agent.name} arranged a private workout with one of their clients. Choose carefully — the better the player, the bigger your gains.
            </div>
            {agent.players.map(p=>{
              const c=p.tier==="superstar"?GO:p.tier==="allstar"?OR:p.tier==="starter"?BL:"#888";
              const skillItem=SKILLS.find(s=>s.id===p.focus);
              const tierLabel={superstar:"SUPERSTAR",allstar:"ALL-STAR",starter:"STARTER",bench:"ROLE PLAYER"}[p.tier];
              return(
                <CardBtn key={p.name} onClick={()=>setWorkoutPlayer(p)} accent={c}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1,marginRight:8}}>
                      <div style={{fontSize:15,fontWeight:700,color:c}}>{p.name}</div>
                      <div style={{fontSize:11,color:"#aaa",marginBottom:3}}>{p.team} · <span style={{color:c}}>{tierLabel}</span></div>
                      <div style={{fontSize:12,color:"#ddd"}}>Specialty: {skillItem?.icon} {skillItem?.label}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:9,color:"#888"}}>GAINS</div>
                      <div style={{fontSize:18,fontWeight:900,color:c}}>{p.upgrades}× +5</div>
                    </div>
                  </div>
                </CardBtn>
              );
            })}
            <button onClick={()=>{setAgent(null);go("agentSelect");}} style={{...ghostS,marginTop:6}}>← Pick a different agent</button>
          </MenuFrame>
        );
      }
      // Allocate the +5 upgrades
      const upgrades=workoutPlayer.upgrades;
      const focusItem=SKILLS.find(s=>s.id===workoutPlayer.focus);
      return(
        <MenuFrame sub={`Working out with ${workoutPlayer.name}`} title="ALLOCATE GAINS">
          <div style={{fontSize:13,color:"#ccc",marginBottom:14,lineHeight:1.5}}>
            {workoutPlayer.name} ({workoutPlayer.team}) puts you through the wringer. Apply <span style={{color:GO,fontWeight:700}}>{upgrades} × +5 skill upgrades</span>. {focusItem?`Their specialty is ${focusItem.icon} ${focusItem.label} — you'll see the biggest gains there.`:""}
          </div>
          {(()=>{
            // For simplicity, auto-apply the upgrades: focus gets first, related skills get the rest
            const orderedTargets=[
              workoutPlayer.focus,
              // Related skills by position type
              ...(workoutPlayer.focus==="threePoint"?["midRange","handles"]:
                workoutPlayer.focus==="midRange"?["threePoint","finishing"]:
                workoutPlayer.focus==="finishing"?["midRange","rebounding"]:
                workoutPlayer.focus==="playmaking"?["handles","midRange"]:
                workoutPlayer.focus==="handles"?["playmaking","threePoint"]:
                workoutPlayer.focus==="perimDefense"?["postDefense","rebounding"]:
                workoutPlayer.focus==="postDefense"?["rebounding","perimDefense"]:
                workoutPlayer.focus==="rebounding"?["postDefense","finishing"]:["handles","midRange"]),
            ].slice(0,upgrades);
            const tally={};
            orderedTargets.forEach(t=>{tally[t]=(tally[t]||0)+5;});
            const list=Object.entries(tally).map(([id,g])=>{const it=SKILLS.find(s=>s.id===id);return {id,g,it};});
            return(
              <div style={{background:"rgba(0,220,100,0.08)",border:"1px solid rgba(0,220,100,0.25)",borderRadius:10,padding:12,marginBottom:14}}>
                {list.map(({id,g,it})=>(
                  <div key={id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <span style={{fontSize:14}}>{it?.icon}</span>
                    <span style={{flex:1,fontSize:13,color:"#eee"}}>{it?.label}</span>
                    <span style={{fontSize:14,fontWeight:900,color:GR}}>+{g}</span>
                  </div>
                ))}
              </div>
            );
          })()}
          <button onClick={()=>{
            const upgrades=workoutPlayer.upgrades;
            const ordered=[
              workoutPlayer.focus,
              ...(workoutPlayer.focus==="threePoint"?["midRange","handles"]:
                workoutPlayer.focus==="midRange"?["threePoint","finishing"]:
                workoutPlayer.focus==="finishing"?["midRange","rebounding"]:
                workoutPlayer.focus==="playmaking"?["handles","midRange"]:
                workoutPlayer.focus==="handles"?["playmaking","threePoint"]:
                workoutPlayer.focus==="perimDefense"?["postDefense","rebounding"]:
                workoutPlayer.focus==="postDefense"?["rebounding","perimDefense"]:
                workoutPlayer.focus==="rebounding"?["postDefense","finishing"]:["handles","midRange"]),
            ].slice(0,upgrades);
            setPlayer(p=>{
              const ns={...p.skills};
              ordered.forEach(id=>{ns[id]=clamp((ns[id]||50)+5,25,99);});
              return {...p,skills:ns};
            });
            setWorkoutDone(true);
            toast(`+${upgrades*5} skill points from ${workoutPlayer.name}!`,GR);
            go("predraft");
          }} style={btnS}>LOCK IT IN — TO THE COMBINE</button>
          <button onClick={()=>setWorkoutPlayer(null)} style={{...ghostS,marginTop:8}}>← Pick a different partner</button>
        </MenuFrame>
      );
    })(),

    predraft:(()=>{
      const allDone=interviewDone&&combineDone;
      return(
        <MenuFrame sub="Pre-Draft Process" title="THE GAUNTLET">
          <div style={{fontSize:12,color:"#aaa",marginBottom:14}}>Agent: {agent?.name} · {agent?.agency}</div>
          {[
            {label:"Team Interviews",sub:"Answer GM questions — AI powered",icon:"🎤",done:interviewDone,scr:"interview",color:OR},
            {label:"NBA Combine",sub:"Athletic testing — allocate boost points",icon:"🏋️",done:combineDone,scr:"combine",color:BL},
          ].map(item=>(
            <CardBtn key={item.label} selected={item.done} onClick={()=>go(item.scr)} accent={item.done?GR:item.color}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:28}}>{item.done?"✅":item.icon}</div>
                <div><div style={{fontSize:15,fontWeight:700,color:item.done?GR:item.color}}>{item.label}</div><div style={{fontSize:12,color:"#aaa"}}>{item.sub}</div></div>
              </div>
            </CardBtn>
          ))}
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"13px 14px",marginBottom:8,opacity:0.65}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:28}}>🤝</div>
              <div><div style={{fontSize:15,fontWeight:700,color:"#bbb"}}>Team Workouts</div><div style={{fontSize:12,color:"#888"}}>{agent?.name} arranged {Math.min(agent?.ties||3,5)} workouts — auto-simulated</div></div>
            </div>
          </div>
          {allDone?<button onClick={()=>go("draft")} style={{...btnS,fontSize:17,padding:15,marginTop:8}}>🏀 ENTER THE DRAFT</button>:<div style={{fontSize:12,color:"#888",textAlign:"center",marginTop:12}}>Complete interviews and combine to enter the draft</div>}
        </MenuFrame>
      );
    })(),

    interview:(
      <MenuFrame sub="Pre-Draft — GM Interview" title="INTERVIEW ROOM">
        <Interview player={player} onComplete={(res)=>{
          setInterviewScore(res.avg);setInterviewDone(true);
          go("predraft");
        }}/>
      </MenuFrame>
    ),

    combine:(
      <MenuFrame sub="Pre-Draft — Athletic Testing" title="NBA COMBINE">
        <Combine player={player} onComplete={(score)=>{setCombineScore(score);setCombineDone(true);go("predraft");}}/>
      </MenuFrame>
    ),

    draft:(
      <MenuFrame sub="Draft Night" title="THE CALL">
        <DraftScreen player={player} school={school} starTier={starTier} agent={agent} allYears={allYears} combineScore={combineScore} interviewScore={interviewScore} setAgentAttention={setAgentAttention} setPlayer={setPlayer} skillPoints={skillPoints} setSkillPoints={setSkillPoints} money={money} setMoney={setMoney} signedShoeBrand={signedShoeBrand} setSignedShoeBrand={setSignedShoeBrand} setNbaTeam={setNbaTeam} go={go} toast={toast}/>
      </MenuFrame>
    ),

    leagueHub:(
      <MenuFrame sub={`${player.position||"--"} · ${(nbaTeam||"FREE AGENT").toUpperCase()}`} title={(player.name||"PLAYER").toUpperCase()}>
        <LeagueHub player={player} nbaTeam={nbaTeam} nbaSeasons={nbaSeasons} nbaGamesPlayed={nbaGamesPlayed} nbaSeasonTotals={nbaSeasonTotals} playoffsDone={playoffsDone} skillPoints={skillPoints} go={go}/>
      </MenuFrame>
    ),
    nbaPlay:(
      <MenuFrame sub={`${nbaTeam||"Team"} · Season`} title="GAMETIME">
        <NbaPlayScreen player={player} nbaTeam={nbaTeam} nbaGamesPlayed={nbaGamesPlayed} setNbaGamesPlayed={setNbaGamesPlayed} nbaSeasonTotals={nbaSeasonTotals} setNbaSeasonTotals={setNbaSeasonTotals} nbaSeasons={nbaSeasons} setNbaSeasons={setNbaSeasons} nbaMentor={nbaMentor} playoffsDone={playoffsDone} setPlayoffsDone={setPlayoffsDone} skillPoints={skillPoints} setSkillPoints={setSkillPoints} go={go} toast={toast}/>
      </MenuFrame>
    ),
    nbaSkills:(
      <MenuFrame sub="Train" title="SKILLS">
        <NbaSkillsScreen player={player} setPlayer={setPlayer} skillPoints={skillPoints} setSkillPoints={setSkillPoints} go={go} toast={toast}/>
      </MenuFrame>
    ),
    nbaTeam:(
      <MenuFrame sub="Roster & Mentor" title="TEAM">
        <NbaTeamScreen player={player} nbaTeam={nbaTeam} nbaSeasons={nbaSeasons} nbaMentor={nbaMentor} setNbaMentor={setNbaMentor} skillPoints={skillPoints} setSkillPoints={setSkillPoints} go={go} toast={toast}/>
      </MenuFrame>
    ),
    nbaAgent:(
      <MenuFrame sub="Representation" title="AGENT">
        <NbaAgentScreen player={player} agent={agent} nbaTeam={nbaTeam} setNbaTeam={setNbaTeam} setNbaMentor={setNbaMentor} nbaGamesPlayed={nbaGamesPlayed} nbaSeasons={nbaSeasons} go={go} toast={toast}/>
      </MenuFrame>
    ),
    nbaSpend:(
      <MenuFrame sub="Coming Soon" title="SPEND">
        <NbaSpendScreen money={money} go={go}/>
      </MenuFrame>
    ),
    nbaStats:(
      <MenuFrame sub="College & NBA" title="CAREER STATS">
        <NbaStatsScreen player={player} allYears={allYears} nbaSeasons={nbaSeasons} nbaSeasonTotals={nbaSeasonTotals} nbaGamesPlayed={nbaGamesPlayed} nbaTeam={nbaTeam} go={go}/>
      </MenuFrame>
    ),
  };

  return(
    <div style={{minHeight:"100vh",background:"#080c10",color:"#f0ede8",fontFamily:"'Barlow Condensed',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        input,textarea,select,button{font-family:'Barlow Condensed',sans-serif}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(232,135,58,0.3);border-radius:2px}
        input[type=range]{-webkit-appearance:none;height:4px;border-radius:2px;background:rgba(255,255,255,0.1);outline:none;cursor:pointer}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#e8873a;cursor:pointer}
        button:active{opacity:0.82}
      `}</style>
      <NotifBar notif={notif}/>
      {/* Always-visible music toggle in the top-right corner. Persists across every screen.
          Tap to mute/unmute. Click on error shows details. */}
      <div onClick={()=>{
        if(audioState==="error"){
          // Show error in toast for visibility
          toast&&toast(audioError||"Music unavailable",RE);
          return;
        }
        if(musicOn){
          // Toggling off
          setMusicOn(false);
        } else {
          // Toggling on — call startMusicFromGesture so play() runs synchronously
          // inside this click event (required by iOS).
          setMusicOn(true);
          startMusicFromGesture();
        }
      }} style={{
        position:"fixed",top:12,right:12,zIndex:400,
        width:38,height:38,borderRadius:"50%",
        background:audioState==="error"?"rgba(232,64,64,0.92)":musicOn?(audioState==="playing"?"rgba(0,220,100,0.18)":"rgba(232,135,58,0.18)"):"rgba(255,255,255,0.06)",
        border:`1.5px solid ${audioState==="error"?RE:musicOn?(audioState==="playing"?GR:OR):"rgba(255,255,255,0.25)"}`,
        cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
        boxShadow:"0 2px 8px rgba(0,0,0,0.4)",
        backdropFilter:"blur(8px)",
        transition:"background 0.2s, border-color 0.2s",
        fontSize:16,
      }} title={audioState==="error"?"Music error — tap":(musicOn?"Mute":"Unmute")}>
        {audioState==="error"?"⚠️":musicOn?(audioState==="playing"?"🔊":"🔈"):"🔇"}
      </div>
      {/* Testing mode banner — always visible while in a Mike preset so the
          user has an obvious bail-out path no matter what screen they're on. */}
      {testingMode&&screen!=="testing"&&(
        <div style={{position:"sticky",top:0,zIndex:50,background:"linear-gradient(90deg, rgba(232,135,58,0.25), rgba(232,135,58,0.1))",borderBottom:`1px solid ${OR}88`,padding:"6px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",fontFamily:"'Barlow Condensed',sans-serif"}}>
          <div style={{fontSize:10,color:OR,letterSpacing:1.5,fontWeight:900}}>🧪 TESTING MODE · NOT SAVING</div>
          <button onClick={exitTesting} style={{padding:"4px 10px",background:OR,border:"none",borderRadius:5,color:"#080c10",fontWeight:900,fontSize:10,letterSpacing:1,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif"}}>EXIT</button>
        </div>
      )}
      {screen!=="loadscreen"&&screen!=="title"&&(
        <div style={{position:"sticky",top:0,zIndex:10,background:"rgba(8,12,16,0.96)",backdropFilter:"blur(8px)",borderBottom:"1px solid rgba(232,135,58,0.1)",padding:"8px 14px",display:"flex",alignItems:"center",minHeight:42}}>
          <div onClick={()=>go("title")} style={{cursor:"pointer"}}>
            <Logo size={42}/>
          </div>
          {player.name&&<div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%, -50%)",display:"flex",alignItems:"center",gap:8}}><PlayerAvatar app={player.appearance} size={28}/><div style={{fontSize:11,color:"#888",lineHeight:1.3}}><div style={{color:"#f0ede8",fontWeight:700}}>{player.name}</div><div>{player.position} · {ovr} OVR</div></div></div>}
        </div>
      )}
      <div style={{maxWidth:430,margin:"0 auto",padding:screen==="loadscreen"?0:`${screen==="title"?0:16}px 16px 80px`}}>
        {views[screen]||<div style={{color:RE,padding:20}}>Unknown screen: {screen}</div>}
      </div>
    </div>
  );
}
