import { useState, useEffect, useRef, useCallback } from "react";

// ─── SEASON YEARS ─────────────────────────────────────────────────────────────
const START_YEAR = 2003; // College year label: "2003-04 Season"
const getNBAYear = (collegeYears) => {
  const entry = START_YEAR + collegeYears;
  return `${entry}-${String(entry+1).slice(2)} NBA Season`;
};

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
  "Minnesota Timberwolves","New Orleans Hornets","New York Knicks","Oklahoma City Thunder",
  "Orlando Magic","Philadelphia 76ers","Phoenix Suns","Portland Trail Blazers",
  "Sacramento Kings","San Antonio Spurs","Toronto Raptors","Utah Jazz","Washington Wizards",
  "Charlotte Bobcats","New Jersey Nets",
];

// Era-accurate team colors for 2003-04 jersey reveals
const NBA_TEAM_DATA = {
  "Atlanta Hawks":{p:"#E03A3E",s:"#C1D32F",abbr:"ATL",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Atlanta_Hawks_logo.svg"},
  "Boston Celtics":{p:"#007A33",s:"#FFFFFF",abbr:"BOS",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Boston_Celtics.svg"},
  "Chicago Bulls":{p:"#CE1141",s:"#000000",abbr:"CHI",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Chicago_Bulls_logo.svg"},
  "Cleveland Cavaliers":{p:"#860038",s:"#FDBB30",abbr:"CLE",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Cleveland_Cavaliers_logo.svg"},
  "Dallas Mavericks":{p:"#00538C",s:"#002B5E",abbr:"DAL",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Dallas_Mavericks_logo.svg"},
  "Denver Nuggets":{p:"#0E2240",s:"#FEC524",abbr:"DEN",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Denver_Nuggets.svg"},
  "Detroit Pistons":{p:"#C8102E",s:"#1D42BA",abbr:"DET",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Detroit_Pistons_logo.svg"},
  "Golden State Warriors":{p:"#1D428A",s:"#FFC72C",abbr:"GSW",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Golden_State_Warriors_logo.svg"},
  "Houston Rockets":{p:"#CE1141",s:"#000000",abbr:"HOU",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Houston_Rockets.svg"},
  "Indiana Pacers":{p:"#002D62",s:"#FDBB30",abbr:"IND",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Indiana_Pacers.svg"},
  "LA Clippers":{p:"#C8102E",s:"#1D428A",abbr:"LAC",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Los_Angeles_Clippers_(2024).svg"},
  "LA Lakers":{p:"#552583",s:"#FDB927",abbr:"LAL",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Los_Angeles_Lakers_logo.svg"},
  "Memphis Grizzlies":{p:"#5D76A9",s:"#12173F",abbr:"MEM",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Memphis_Grizzlies.svg"},
  "Miami Heat":{p:"#98002E",s:"#F9A01B",abbr:"MIA",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Miami_Heat_logo.svg"},
  "Milwaukee Bucks":{p:"#00471B",s:"#EEE1C6",abbr:"MIL",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Milwaukee_Bucks_logo.svg"},
  "Minnesota Timberwolves":{p:"#0C2340",s:"#236192",abbr:"MIN",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Minnesota_Timberwolves_logo.svg"},
  "New Orleans Hornets":{p:"#0F586C",s:"#B4975A",abbr:"NOH",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/New_Orleans_Hornets_logo.svg"},
  "New York Knicks":{p:"#006BB6",s:"#F58426",abbr:"NYK",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/New_York_Knicks_logo.svg"},
  "Oklahoma City Thunder":{p:"#007AC1",s:"#EF3B24",abbr:"OKC",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Oklahoma_City_Thunder.svg"},
  "Orlando Magic":{p:"#0077C0",s:"#000000",abbr:"ORL",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Orlando_Magic_logo.svg"},
  "Philadelphia 76ers":{p:"#006BB6",s:"#ED174C",abbr:"PHI",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Philadelphia_76ers_logo.svg"},
  "Phoenix Suns":{p:"#1D1160",s:"#E56020",abbr:"PHX",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Phoenix_Suns_logo.svg"},
  "Portland Trail Blazers":{p:"#E03A3E",s:"#000000",abbr:"POR",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Portland_Trail_Blazers_logo.svg"},
  "Sacramento Kings":{p:"#5A2D81",s:"#63727A",abbr:"SAC",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/SacramentoKings.svg"},
  "San Antonio Spurs":{p:"#000000",s:"#C4CED4",abbr:"SAS",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/San_Antonio_Spurs.svg"},
  "Toronto Raptors":{p:"#CE1141",s:"#000000",abbr:"TOR",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Toronto_Raptors_logo.svg"},
  "Utah Jazz":{p:"#002B5C",s:"#00471B",abbr:"UTA",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Utah_Jazz_logo_2022.svg"},
  "Washington Wizards":{p:"#002B5C",s:"#E31837",abbr:"WAS",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Washington_Wizards_logo.svg"},
  "Charlotte Bobcats":{p:"#1D1160",s:"#00788C",abbr:"CHA",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/Charlotte_Bobcats_logo.svg"},
  "New Jersey Nets":{p:"#002A60",s:"#C8102E",abbr:"NJN",logoUrl:"https://en.wikipedia.org/wiki/Special:FilePath/New_Jersey_Nets_logo.svg"},
};

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
  const d={threePoint:45,midRange:48,finishing:48,handles:45,playmaking:45,perimDefense:45,postDefense:42,rebounding:42};
  const b={
    PG:{handles:8,playmaking:10,threePoint:5},
    SG:{threePoint:8,handles:5,midRange:5},
    SF:{finishing:8,perimDefense:5,threePoint:3},
    PF:{rebounding:10,postDefense:5,finishing:5},
    C:{rebounding:15,postDefense:12,finishing:5,threePoint:-10,handles:-8},
  };
  const r={...d}; const bst=b[pos]||{};
  Object.keys(bst).forEach(k=>{r[k]=clamp(r[k]+bst[k],30,70);});
  return r;
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
  // Track whether the logo image successfully loaded. If it 404s or errors,
  // fall back to the stylized SVG below.
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = logoUrl && !imgFailed;
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
          src={logoUrl}
          alt={abbr}
          onError={()=>setImgFailed(true)}
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
        {[
          {x:22,top:38,bot:78,w:3.4},
          {x:28,top:36,bot:82,w:3.6},
          {x:42,top:34,bot:74,w:3.6},
          {x:58,top:34,bot:74,w:3.6},
          {x:72,top:36,bot:82,w:3.6},
          {x:78,top:38,bot:78,w:3.4},
        ].map((d,i)=>{
          const halfW = d.w/2;
          const tipW = halfW * 0.7;
          return(
            <g key={i}>
              <path d={`
                M ${d.x-halfW} ${d.top}
                L ${d.x-tipW} ${d.bot-1}
                Q ${d.x} ${d.bot+1.4} ${d.x+tipW} ${d.bot-1}
                L ${d.x+halfW} ${d.top}
                Z`}
                fill={i%2===0?hairMid:hairDark}/>
              {Array.from({length:Math.floor((d.bot-d.top)/4)}).map((_,j)=>{
                const segY = d.top + 3 + j*4;
                const wAt = halfW - (halfW-tipW)*((segY-d.top)/(d.bot-d.top));
                return(
                  <ellipse key={j}
                    cx={d.x} cy={segY}
                    rx={wAt-0.3} ry="0.7"
                    fill={hairDark} opacity="0.55"/>
                );
              })}
              <line x1={d.x} y1={d.top+1} x2={d.x} y2={d.bot-1}
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
        {/* Subtle gradient shadow over jaw + sparse dots */}
        <path d="M 32 60 Q 50 78 68 60 Q 65 70 50 73 Q 35 70 32 60" fill="rgba(0,0,0,0.13)"/>
        {[36,42,48,54,60,38,46,52,58].map((x,i)=>(
          <circle key={i} cx={x} cy={62+(i%3)*3} r="0.6" fill="rgba(0,0,0,0.4)"/>
        ))}
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
      <button onPointerDown={(e)=>{e.preventDefault();shoot();}} style={{...btnS,width:"auto",padding:"10px 40px",fontSize:15,touchAction:"none"}}>SHOOT</button>
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
    let offDir=1;
    // Was (1.8+rand(0,10)/10)*difficulty — way too fast. Cut roughly in half and damp difficulty.
    let offSpd=(0.55+rand(0,5)/10)*(0.85+difficulty*0.4);
    // Direction changes feel more deliberate with a small pause built into the bounce
    const step=(ts)=>{
      if(!lastRef.current) lastRef.current=ts;
      const dt=ts-lastRef.current; lastRef.current=ts;
      setOffX(prev=>{
        let nx=prev+offDir*offSpd*(dt/16);
        if(nx>88||nx<12){offDir*=-1;nx=clamp(nx,12,88);}
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
  const PASS_SPD=290*difficulty; // sped up significantly — needs sharper reactions

  const startPass=()=>{
    setPhase("steal");
    const w=clamp(Math.round(30/difficulty),12,40);
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
    const step=()=>{setMeterVal(p=>{const n=p+meterDir*3;if(n>=100||n<=0)setMeterDir(d=>-d);return clamp(n,0,100);});animRef.current=requestAnimationFrame(step);};
    animRef.current=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(animRef.current);
  },[phase,meterDir]);

  const holdDunk=()=>{
    if(phase!=="dunk") return;
    cancelAnimationFrame(animRef.current);
    const perfect=meterVal>=70&&meterVal<=90;
    const good=meterVal>=50&&meterVal<=95;
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
    const step=()=>{
      setMeter(m=>{
        const n=m+meterDir.current*(0.85+difficulty*0.2);
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

function SeasonGame({player, school, priorities, year, onEnd}){
  const difficulty=(school.difficulty||1.0)*(player.starTier?.difficulty||1.0);
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
    const devGains={};
    priorities.forEach((pid,i)=>{
      const w=[1.0,0.7,0.4][i];
      const sb=school.devStrengths.includes(pid)?1.5:0.8;
      const pb=school.playTime/100;
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
    const playTimePct=(school.playTime||80)/100;
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
  const seasonLabel=`${START_YEAR+year-1}-${String(START_YEAR+year).slice(2)} Season`;

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
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:prompt}]})});
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
    }
    // If model didn't give a usable score, fall back to heuristics on the actual answer
    if(scoreVal===null) scoreVal=heuristicScore(userText);
    // If we didn't get usable reply text (API failure on mobile, blank parse, etc.),
    // synthesize a content-aware scout reaction so the player never sees a generic
    // "Appreciate the answer" again.
    if(!replyText) replyText=heuristicReaction(userText,scoreVal);
    setScore(scoreVal);setLoading(false);
    setMsgs(prev=>[...prev,{role:"assistant",content:replyText}]);
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

// ─── DRAFT SCREEN ─────────────────────────────────────────────────────────────
function DraftScreen({player,school,starTier,agent,allYears,combineScore,interviewScore,setAgentAttention,toast}){
  // Reveal stages: black-out → "with the Xth pick" → team name → "selects..." → name + jersey
  const [stage,setStage]=useState("intro"); // intro → onClock → teamReveal → playerReveal → details
  const [pick,setPick]=useState(null);
  const [team,setTeam]=useState(null);
  // Jersey number from the player's chosen appearance (set on the setup screen)
  const jerseyNumber=player.appearance?.jerseyNumber??23;
  const ovr=calcOVR(player.skills||{},player.intangibles||[]);
  const yearsInCollege=allYears.length;
  const nbaYear=getNBAYear(yearsInCollege);

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
              <textPath href="#nameArc" startOffset="50%" textAnchor="middle">
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
          <div style={{fontSize:14,color:"#aaa",marginBottom:20,lineHeight:1.5}}>The phones never rang.<br/>{agent?.name} is on the line about alternatives.</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <button onClick={()=>toast("Overseas signing — Part 2 coming soon",PU)} style={btnS}>🌍 Sign Overseas</button>
            <button onClick={()=>toast("Summer League — Part 2 coming soon",BL)} style={ghostS}>📋 Summer League Tryout</button>
          </div>
          <div style={{background:"rgba(0,0,0,0.3)",borderRadius:12,padding:14,marginTop:18}}>
            <div style={{fontSize:13,color:OR,fontWeight:700,marginBottom:4}}>🏆 Part 1 Complete</div>
            <div style={{fontSize:12,color:"#888",lineHeight:1.5}}>The NBA journey starts in Part 2. Your build, stats, and undrafted status all carry over.</div>
          </div>
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
          <div style={{fontSize:11,letterSpacing:1.5,color:isSecondRound?PU:GR,fontWeight:700,marginBottom:3}}>{isSecondRound?"📋 G LEAGUE ASSIGNMENT":"🏀 NBA ROSTER LOCK"}</div>
          <div style={{fontSize:12,color:"#ccc",lineHeight:1.4}}>
            {isSecondRound
              ?`The ${team} drafted you but are sending you to their G League affiliate to start. Earn your way up.`
              :`You're on the ${team} 15-man roster. Training camp opens in October.`}
          </div>
        </div>

        {/* Shoe deals — only Lottery picks get the big-brand interest */}
        {pick<=14&&(
          <div style={{background:"rgba(255,215,0,0.07)",border:"1px solid rgba(255,215,0,0.22)",borderRadius:12,padding:14,marginBottom:14}}>
            <div style={{fontSize:10,color:GO,fontWeight:700,marginBottom:8,letterSpacing:3,textTransform:"uppercase"}}>Shoe Deal Offers</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {["Nike","Adidas","Reebok","Puma","Converse","And1"].map(b=>(
                <button key={b} onClick={()=>toast(b+" signed! 🔥",GO)} style={{padding:"7px 13px",background:"rgba(255,215,0,0.09)",border:"1px solid rgba(255,215,0,0.25)",borderRadius:8,color:GO,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>{b}</button>
              ))}
            </div>
          </div>
        )}

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

<div style={{background:"rgba(0,0,0,0.3)",borderRadius:12,padding:14}}>
          <div style={{fontSize:13,color:OR,fontWeight:700,marginBottom:4}}>🏆 Part 1 Complete!</div>
          <div style={{fontSize:12,color:"#888",lineHeight:1.5}}>The NBA journey starts in Part 2. Your build, draft slot, and {isSecondRound?"G League placement":"team"} carry over.</div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [screen,setScreen]=useState("loadscreen");
  const [player,setPlayer]=useState({name:"",position:"SG",height:76,weight:210,hometown:"",skills:{},intangibles:[],appearance:{skin:"#4A2912",hair:"Low Cut",beard:"Clean",headband:"Black",headbandColor:"Black",jerseyNumber:23}});
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
  // Background music using the Web Audio API. Far more reliable than <audio> for embedded
  // audio: it decodes the MP3 to raw PCM once, then plays from memory.
  const [musicOn,setMusicOn]=useState(true);
  // States: "loading" → decoding the audio. "ready" → decoded, waiting for user gesture.
  //         "playing" → currently audible. "paused" → toggled off. "error" → failed.
  const [audioState,setAudioState]=useState("loading");
  // Detailed error message for the debug overlay
  const [audioError,setAudioError]=useState("");
  const audioCtxRef=useRef(null);
  const audioBufferRef=useRef(null);
  const sourceNodeRef=useRef(null);
  const gainNodeRef=useRef(null);
  // Sustained silent BufferSource that loops from the moment of first user gesture
  // until the real music starts. Keeps iOS in "actively playing audio" mode during
  // the decode gap, otherwise iOS silently swallows the eventual source.start() call.
  const primeSrcRef=useRef(null);
  // Hidden <video> used to bypass iOS Safari's silent-switch mute (see effect below).
  const silentVideoRef=useRef(null);

  // STEP 1: Decode the embedded MP3 once on mount.
  useEffect(()=>{
    let cancelled=false;
    const decode=async()=>{
      try{
        const AudioCtx=window.AudioContext||window.webkitAudioContext;
        if(!AudioCtx){
          setAudioError("AudioContext API not supported in this browser");
          setAudioState("error");
          return;
        }
        const ctx=new AudioCtx();
        audioCtxRef.current=ctx;
        // EARLY UNLOCK + iOS SUSTAINED PRIME: install gesture listeners NOW, before
        // fetch/decode finishes. The user's first tap (e.g. "TAP TO START") must do
        // these SYNCHRONOUSLY inside the gesture handler:
        //   1. ctx.resume() — unlocks the AudioContext from "suspended" state
        //   2. Start a LOOPING silent BufferSource and keep it playing — iOS Safari
        //      requires the page to be actively producing audio for source.start()
        //      to work outside a gesture. A one-shot silent buffer ends in microseconds,
        //      and iOS "forgets" we're playing audio by the time the real MP3 finishes
        //      decoding (2-3 seconds later on mobile). A sustained loop bridges that gap.
        // The prime is stopped once the real music starts (see startPlayback below).
        const earlyUnlock=()=>{
          const c=audioCtxRef.current;
          if(!c) return;
          if(c.state==="suspended"){
            c.resume().catch(()=>{});
          }
          try{
            if(!primeSrcRef.current){
              // 2 seconds of silence at the context's native sample rate. createBuffer
              // returns a zero-filled buffer, so it's truly silent. loop=true keeps
              // iOS happy until we swap in the real music.
              const silentBuffer=c.createBuffer(1, Math.floor(c.sampleRate*2), c.sampleRate);
              const silentSrc=c.createBufferSource();
              silentSrc.buffer=silentBuffer;
              silentSrc.loop=true;
              silentSrc.connect(c.destination);
              silentSrc.start(0);
              primeSrcRef.current=silentSrc;
            }
          }catch(e){}
          window.removeEventListener("pointerdown",earlyUnlock);
          window.removeEventListener("keydown",earlyUnlock);
          window.removeEventListener("touchstart",earlyUnlock);
        };
        window.addEventListener("pointerdown",earlyUnlock);
        window.addEventListener("keydown",earlyUnlock);
        window.addEventListener("touchstart",earlyUnlock,{passive:true});
        // MUSIC_SRC is a URL to /public — fetch() the audio file, then decode.
        const resp = await fetch(MUSIC_SRC);
        if(!resp.ok) throw new Error(`Fetch failed: ${resp.status} ${resp.statusText}`);
        const arrayBuffer = await resp.arrayBuffer();
        if(cancelled) return;
        // decodeAudioData accepts an ArrayBuffer directly.
        const buffer = await new Promise((res,rej)=>{
          try{
            const p=ctx.decodeAudioData(arrayBuffer,res,rej);
            if(p&&p.then) p.then(res,rej);
          }catch(e){rej(e);}
        });
        if(cancelled) return;
        audioBufferRef.current=buffer;
        const gain=ctx.createGain();
        gain.gain.value=0.45;
        gain.connect(ctx.destination);
        gainNodeRef.current=gain;
        setAudioState(ctx.state==="running"?"ready":"blocked");
      }catch(err){
        console.error("[music] decode failed:",err);
        setAudioError(`Decode failed: ${err&&err.message||err}`);
        setAudioState("error");
      }
    };
    decode();
    return()=>{
      cancelled=true;
      try{if(sourceNodeRef.current) sourceNodeRef.current.stop();}catch(e){}
      try{if(primeSrcRef.current) primeSrcRef.current.stop();}catch(e){}
      try{if(audioCtxRef.current) audioCtxRef.current.close();}catch(e){}
    };
  },[]);

  // STEP 2: Start/stop playback. Re-run whenever musicOn changes or audio is decoded.
  useEffect(()=>{
    const ctx=audioCtxRef.current;
    const buffer=audioBufferRef.current;
    const gain=gainNodeRef.current;
    if(!ctx||!buffer||!gain) return;

    const startPlayback=async()=>{
      try{
        // Resume the AudioContext (browsers create it in "suspended" state until user gesture)
        if(ctx.state==="suspended"){
          await ctx.resume();
        }
        if(ctx.state!=="running"){
          // Still blocked — needs a user gesture
          setAudioState("blocked");
          return;
        }
        // BufferSourceNodes are one-shot. If we already have one playing, leave it alone.
        if(sourceNodeRef.current){
          setAudioState("playing");
          return;
        }
        const src=ctx.createBufferSource();
        src.buffer=buffer;
        src.loop=true;
        src.connect(gain);
        src.start(0);
        sourceNodeRef.current=src;
        // Real music is now playing — stop the sustained silent prime. Leaving it
        // running is harmless (it's silent) but pointless once real audio is going.
        if(primeSrcRef.current){
          try{primeSrcRef.current.stop();}catch(e){}
          try{primeSrcRef.current.disconnect();}catch(e){}
          primeSrcRef.current=null;
        }
        setAudioState("playing");
      }catch(err){
        console.warn("[music] start failed:",err);
        setAudioError(`Start failed: ${err&&err.message||err}`);
        setAudioState("blocked");
      }
    };

    const stopPlayback=async()=>{
      try{
        if(sourceNodeRef.current){
          sourceNodeRef.current.stop();
          sourceNodeRef.current=null;
        }
        if(ctx.state==="running"){
          await ctx.suspend();
        }
        setAudioState("paused");
      }catch(err){
        console.warn("[music] stop failed:",err);
      }
    };

    if(musicOn){
      startPlayback();
      // iOS Safari requires ctx.resume() to be called SYNCHRONOUSLY inside the
      // gesture handler — not after an await. So the unlock fires resume()
      // immediately (no async), then once the context is running it kicks
      // startPlayback() which can use awaits safely.
      const unlock=()=>{
        if(ctx.state==="suspended"){
          // Fire-and-forget — Safari only cares that resume() was CALLED inside
          // the gesture, not that it resolves. The promise resolves on next tick.
          ctx.resume().then(()=>{startPlayback();}).catch(()=>{});
        } else {
          startPlayback();
        }
      };
      window.addEventListener("pointerdown",unlock);
      window.addEventListener("keydown",unlock);
      window.addEventListener("touchstart",unlock,{passive:true});
      return()=>{
        window.removeEventListener("pointerdown",unlock);
        window.removeEventListener("keydown",unlock);
        window.removeEventListener("touchstart",unlock);
      };
    } else {
      stopPlayback();
    }
  },[musicOn,audioState==="ready"||audioState==="blocked"]);

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
      const tryPlay=()=>{v.play().catch(()=>{});};
      tryPlay();
      // Autoplay is usually blocked until a user gesture — retry on the same
      // gestures we use to unlock the AudioContext.
      window.addEventListener("pointerdown",tryPlay);
      window.addEventListener("keydown",tryPlay);
      window.addEventListener("touchstart",tryPlay,{passive:true});
      return()=>{
        window.removeEventListener("pointerdown",tryPlay);
        window.removeEventListener("keydown",tryPlay);
        window.removeEventListener("touchstart",tryPlay);
      };
    } else {
      try{v.pause();}catch(e){}
    }
  },[musicOn]);

  useEffect(()=>{
    if(player.position){
      const bs=baseSkills(player.position);
      // Round to nearest 5 so the +5/-5 stepping always lands on clean values
      const rounded=Object.fromEntries(Object.entries(bs).map(([k,v])=>[k,Math.round(v/5)*5]));
      setPlayer(p=>({...p,skills:rounded}));
    }
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
      <div onClick={()=>go("title")} style={{position:"fixed",inset:0,cursor:"pointer",background:"#000",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:999,overflow:"hidden"}}>
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

        <button onClick={()=>go("title")} style={btnS}>BACK TO HOME →</button>
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
      const menuItems=[
        {id:"new",   label:"PLAY NOW",         sub:"Start a new career",       action:()=>go("bio")},
        {id:"how",   label:"HOW TO PLAY",      sub:"Learn the flow",           action:()=>go("howto")},
        {id:"opts",  label:"OPTIONS",          sub:"Sound, settings",          action:()=>go("options")},
        {id:"about", label:"GOODEN 2003 EXTRAS",sub:"About Drew Gooden",       action:()=>go("extras")},
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
            {POSITIONS.map(pos=><button key={pos} onClick={()=>setPlayer(p=>({...p,position:pos}))} style={{flex:1,padding:"10px 0",background:player.position===pos?OR:"rgba(255,255,255,0.05)",border:`1px solid ${player.position===pos?OR:"rgba(255,255,255,0.1)"}`,borderRadius:8,color:player.position===pos?"#080c10":"#f0ede8",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"'Barlow Condensed',sans-serif"}}>{pos}</button>)}
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
        <MenuFrame sub={`Step 5 — ${START_YEAR}-${String(START_YEAR+1).slice(2)} Season`} title="WHERE DO YOU GO?">
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
            <div style={{margin:"0 auto 22px",animation:"signedPop 0.7s ease-out"}}>
              <TeamEmblem colors={colors} abbr={logo} name={school.name} size={200} logoUrl={school.logoUrl}/>
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
      const seasonLabel=`${START_YEAR+year-1}-${String(START_YEAR+year).slice(2)} Season`;
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
        <Hd sub={`${START_YEAR+year-1}-${String(START_YEAR+year).slice(2)} — Game Time`} title="SEASON"/>
        <SeasonGame player={player} school={school} priorities={priorities} year={year} onEnd={(res)=>{
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
      const seasonLabel=`${START_YEAR+year-1}-${String(START_YEAR+year).slice(2)}`;
      // Project the draft from current stat sheet (pre-combine)
      const proj=projectDraft({ovr,starTier,school,allYears});
      const tierColor=proj.tier==="top5"?GO:proj.tier==="lottery"?GR:proj.tier==="first"?OR:proj.tier==="early2nd"?BL:proj.tier==="late2nd"?PU:"#888";
      return(
        <MenuFrame sub={`${seasonLabel} Season Complete`} title="SEASON RECAP">
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
          <div style={{fontSize:11,color:"#aaa",marginBottom:8}}>Next: {getNBAYear(allYears.length)} if you declare now</div>
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
        <DraftScreen player={player} school={school} starTier={starTier} agent={agent} allYears={allYears} combineScore={combineScore} interviewScore={interviewScore} setAgentAttention={setAgentAttention} toast={toast}/>
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
          // Toggling on — also kick the AudioContext if needed
          setMusicOn(true);
          const ctx=audioCtxRef.current;
          if(ctx&&ctx.state==="suspended"){
            ctx.resume().catch(()=>{});
          }
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
      {screen!=="loadscreen"&&screen!=="title"&&(
        <div style={{position:"sticky",top:0,zIndex:10,background:"rgba(8,12,16,0.96)",backdropFilter:"blur(8px)",borderBottom:"1px solid rgba(232,135,58,0.1)",padding:"8px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div onClick={()=>go("title")} style={{cursor:"pointer"}}>
            <Logo size={42}/>
          </div>
          {player.name&&<div style={{display:"flex",alignItems:"center",gap:8}}><PlayerAvatar app={player.appearance} size={28}/><div style={{fontSize:11,color:"#888",textAlign:"right",lineHeight:1.3}}><div style={{color:"#f0ede8",fontWeight:700}}>{player.name}</div><div>{player.position} · {ovr} OVR</div></div></div>}
        </div>
      )}
      <div style={{maxWidth:430,margin:"0 auto",padding:screen==="loadscreen"?0:`${screen==="title"?0:16}px 16px 80px`}}>
        {views[screen]||<div style={{color:RE,padding:20}}>Unknown screen: {screen}</div>}
      </div>
    </div>
  );
}
