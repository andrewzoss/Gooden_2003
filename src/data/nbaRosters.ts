// ─── NBA SEASON ROSTERS ──────────────────────────────────────────────────────
// Per-season rosters and W/L records. Keyed by SEASON-START year
// (2003 = the 2003-04 NBA season, 2004 = 2004-05, etc.).
//
// Team identities are FROZEN at the 2003-04 set across the whole 20-year
// window — we keep Seattle SuperSonics, New Jersey Nets, original Charlotte
// not-yet-Bobcats absent, etc. Only the rosters and records change year over
// year.
//
// Each player tuple is [name, position, OVR]:
//   { w, l, players: [["LeBron James", "SF", 92], ...] }
//
// OVR is a 60-99 scout-style rating of the player's quality that year.
// Used by App.tsx to determine the player's rotation slot, depth chart
// ordering, and any other "how good is this teammate" logic. PPG was
// previously tracked here too but was dropped — no display surface in the
// game uses it, and it was making roster data entry far more tedious.
//
// Years not yet populated will fall back via getNbaSeasonData() to the most
// recently populated year ≤ target. This lets us ship with only some
// seasons filled in and add more over time without breaking the game.

export type RosterPlayer = [string, string, number]; // [name, position, ovr]
export type TeamSeason = { w: number; l: number; players: RosterPlayer[] };
export type SeasonData = Record<string, TeamSeason>;

export const NBA_ROSTERS_BY_YEAR: Record<number, SeasonData> = {
  // ─── 2003-04 ───────────────────────────────────────────────────────────────
  2003:
{
  "Atlanta Hawks": {w:28, l:54, players:[
    ["Stephen Jackson","SG",78],["Shareef Abdur-Rahim","PF",80],
    ["Theo Ratliff","C",73],["Boris Diaw","PG",70],
    ["Jason Terry","PG",77],["Predrag Drobnjak","C",68],
    ["Chris Crawford","SF",65],["Jason Collier","C",62],
    ["Tony Delk","PG",66]]},
  "Boston Celtics": {w:36, l:46, players:[
    ["Paul Pierce","SF",87],["Antoine Walker","PF",75],
    ["Mark Blount","C",72],["Ricky Davis","SG",76],
    ["Marcus Banks","PG",65],["Walter McCarty","SF",64],
    ["Raef LaFrentz","PF",71],["Jiri Welsch","SG",66],
    ["Chucky Atkins","PG",68]]},
  "Chicago Bulls": {w:23, l:59, players:[
    ["Jamal Crawford","SG",75],["Eddy Curry","C",73],
    ["Tyson Chandler","C",70],["Kirk Hinrich","PG",74],
    ["Scottie Pippen","SF",72],["Marcus Fizer","PF",68],
    ["Eddie Robinson","SF",65],["Linton Johnson","PF",60],
    ["Jerome Williams","PF",66]]},
  "Cleveland Cavaliers": {w:35, l:47, players:[
    ["LeBron James","SF",88],["Carlos Boozer","PF",78],
    ["Zydrunas Ilgauskas","C",80],["Ricky Davis","SG",76],
    ["Eric Snow","PG",70],["Dajuan Wagner","PG",65],
    ["Jeff McInnis","PG",72],["Ira Newble","SF",62],
    ["DeSagana Diop","C",60]]},
  "Dallas Mavericks": {w:52, l:30, players:[
    ["Dirk Nowitzki","PF",90],["Steve Nash","PG",84],
    ["Michael Finley","SG",79],["Antawn Jamison","SF",80],
    ["Antoine Walker","PF",75],["Josh Howard","SF",73],
    ["Marquis Daniels","SG",72],["Shawn Bradley","C",68],
    ["Jamison Brewer","PG",60]]},
  "Denver Nuggets": {w:43, l:39, players:[
    ["Carmelo Anthony","SF",82],["Andre Miller","PG",76],
    ["Marcus Camby","C",78],["Nene","PF",74],
    ["Voshon Lenard","SG",71],["Earl Boykins","PG",70],
    ["Jon Barry","SG",65],["Rodney White","SF",62],
    ["Kenny Satterfield","PG",58]]},
  "Detroit Pistons": {w:54, l:28, players:[
    ["Chauncey Billups","PG",83],["Richard Hamilton","SG",81],
    ["Ben Wallace","C",84],["Rasheed Wallace","PF",82],
    ["Tayshaun Prince","SF",77],["Corliss Williamson","PF",70],
    ["Mehmet Okur","C",72],["Lindsey Hunter","PG",65],
    ["Mike James","PG",67]]},
  "Golden State Warriors": {w:37, l:45, players:[
    ["Jason Richardson","SG",80],["Mike Dunleavy","SF",73],
    ["Erick Dampier","C",75],["Nick Van Exel","PG",75],
    ["Troy Murphy","PF",72],["Cliff Robinson","PF",70],
    ["Speedy Claxton","PG",68],["Calbert Cheaney","SG",62],
    ["Adonal Foyle","C",65]]},
  "Houston Rockets": {w:45, l:37, players:[
    ["Yao Ming","C",84],["Steve Francis","PG",82],
    ["Cuttino Mobley","SG",78],["Jim Jackson","SF",72],
    ["Maurice Taylor","PF",70],["Eric Piatkowski","SF",65],
    ["Bostjan Nachbar","SF",62],["Kelvin Cato","C",66],
    ["Mike Wilks","PG",58]]},
  "Indiana Pacers": {w:61, l:21, players:[
    ["Jermaine O'Neal","PF",87],["Ron Artest","SF",83],
    ["Reggie Miller","SG",76],["Jamaal Tinsley","PG",73],
    ["Al Harrington","PF",72],["Jeff Foster","C",68],
    ["Austin Croshere","PF",65],["Anthony Johnson","PG",66],
    ["Fred Jones","SG",64]]},
  "LA Clippers": {w:28, l:54, players:[
    ["Elton Brand","PF",82],["Corey Maggette","SF",78],
    ["Quentin Richardson","SG",76],["Marko Jaric","PG",70],
    ["Chris Kaman","C",70],["Bobby Simmons","SF",68],
    ["Lamond Murray","SF",65],["Eddie House","PG",65],
    ["Olden Polynice","C",60]]},
  "LA Lakers": {w:56, l:26, players:[
    ["Kobe Bryant","SG",91],["Shaquille O'Neal","C",92],
    ["Karl Malone","PF",80],["Gary Payton","PG",80],
    ["Devean George","SF",68],["Derek Fisher","PG",72],
    ["Rick Fox","SF",65],["Slava Medvedenko","PF",66],
    ["Brian Cook","PF",62]]},
  "Memphis Grizzlies": {w:50, l:32, players:[
    ["Pau Gasol","PF",83],["Mike Miller","SG",75],
    ["James Posey","SF",74],["Jason Williams","PG",75],
    ["Bonzi Wells","SG",73],["Stromile Swift","PF",70],
    ["Lorenzen Wright","C",68],["Earl Watson","PG",68],
    ["Shane Battier","SF",70]]},
  "Miami Heat": {w:42, l:40, players:[
    ["Dwyane Wade","SG",81],["Lamar Odom","PF",80],
    ["Eddie Jones","SG",75],["Caron Butler","SF",73],
    ["Brian Grant","PF",70],["Rafer Alston","PG",72],
    ["Udonis Haslem","PF",70],["Loren Woods","C",60],
    ["Samaki Walker","C",60]]},
  "Milwaukee Bucks": {w:41, l:41, players:[
    ["Michael Redd","SG",83],["T.J. Ford","PG",73],
    ["Desmond Mason","SG",75],["Joe Smith","PF",72],
    ["Brian Skinner","C",68],["Damon Jones","PG",70],
    ["Tim Thomas","SF",70],["Toni Kukoc","SF",68],
    ["Daniel Santiago","C",58]]},
  "Minnesota Timberwolves": {w:58, l:24, players:[
    ["Kevin Garnett","PF",92],["Sam Cassell","PG",81],
    ["Latrell Sprewell","SG",78],["Wally Szczerbiak","SF",75],
    ["Trenton Hassell","SF",70],["Michael Olowokandi","C",65],
    ["Ervin Johnson","C",62],["Fred Hoiberg","SG",68],
    ["Troy Hudson","PG",65]]},
  "New Jersey Nets": {w:47, l:35, players:[
    ["Jason Kidd","PG",87],["Richard Jefferson","SF",78],
    ["Kenyon Martin","PF",80],["Kerry Kittles","SG",73],
    ["Jason Collins","C",68],["Brian Scalabrine","PF",60],
    ["Rodney Rogers","PF",65],["Lucious Harris","SG",68],
    ["Aaron Williams","PF",62]]},
  "New Orleans Hornets": {w:41, l:41, players:[
    ["Baron Davis","PG",83],["Jamal Mashburn","SF",75],
    ["David Wesley","PG",73],["P.J. Brown","PF",72],
    ["Jamaal Magloire","C",75],["George Lynch","SF",65],
    ["Stacey Augmon","SF",62],["Robert Traylor","C",60],
    ["Darrell Armstrong","PG",66]]},
  "New York Knicks": {w:39, l:43, players:[
    ["Stephon Marbury","PG",82],["Allan Houston","SG",78],
    ["Keith Van Horn","PF",73],["Kurt Thomas","C",72],
    ["Dikembe Mutombo","C",70],["Penny Hardaway","SG",68],
    ["Tim Thomas","SF",70],["Frank Williams","PG",60],
    ["Othella Harrington","PF",62]]},
  "Orlando Magic": {w:21, l:61, players:[
    ["Tracy McGrady","SG",88],["Drew Gooden","PF",75],
    ["Tyronn Lue","PG",70],["Juwan Howard","PF",73],
    ["Andrew DeClercq","C",60],["Gordan Giricek","SG",68],
    ["Pat Garrity","SF",65],["Reece Gaines","PG",58],
    ["Steven Hunter","C",60]]},
  "Philadelphia 76ers": {w:33, l:49, players:[
    ["Allen Iverson","SG",87],["Glenn Robinson","SF",75],
    ["Eric Snow","PG",70],["Kenny Thomas","PF",72],
    ["Samuel Dalembert","C",70],["Aaron McKie","SG",68],
    ["Derrick Coleman","PF",65],["Marc Jackson","C",62],
    ["Willie Green","PG",65]]},
  "Phoenix Suns": {w:29, l:53, players:[
    ["Stephon Marbury","PG",82],["Shawn Marion","SF",84],
    ["Amar'e Stoudemire","PF",81],["Joe Johnson","SG",76],
    ["Bo Outlaw","SF",65],["Casey Jacobsen","SG",65],
    ["Tom Gugliotta","PF",65],["Howard Eisley","PG",62],
    ["Jake Voskuhl","C",60]]},
  "Portland Trail Blazers": {w:41, l:41, players:[
    ["Damon Stoudamire","PG",75],["Rasheed Wallace","PF",80],
    ["Bonzi Wells","SG",73],["Ruben Patterson","SF",72],
    ["Zach Randolph","PF",78],["Theo Ratliff","C",73],
    ["Derek Anderson","SG",70],["Travis Outlaw","SF",62],
    ["Dale Davis","PF",65]]},
  "Sacramento Kings": {w:55, l:27, players:[
    ["Peja Stojakovic","SF",85],["Chris Webber","PF",82],
    ["Mike Bibby","PG",80],["Brad Miller","C",78],
    ["Vlade Divac","C",73],["Doug Christie","SG",75],
    ["Bobby Jackson","PG",75],["Anthony Peeler","SG",65],
    ["Gerald Wallace","SF",70]]},
  "San Antonio Spurs": {w:57, l:25, players:[
    ["Tim Duncan","PF",89],["Tony Parker","PG",80],
    ["Manu Ginobili","SG",81],["Bruce Bowen","SF",73],
    ["Rasho Nesterovic","C",70],["Hedo Turkoglu","SF",73],
    ["Malik Rose","PF",70],["Devin Brown","SG",65],
    ["Robert Horry","PF",68]]},
  "Seattle SuperSonics": {w:37, l:45, players:[
    ["Ray Allen","SG",86],["Rashard Lewis","SF",80],
    ["Vladimir Radmanovic","PF",72],["Brent Barry","SG",73],
    ["Antonio Daniels","PG",70],["Nick Collison","PF",68],
    ["Reggie Evans","PF",65],["Calvin Booth","C",62],
    ["Luke Ridnour","PG",70]]},
  "Toronto Raptors": {w:33, l:49, players:[
    ["Vince Carter","SG",83],["Chris Bosh","PF",78],
    ["Jalen Rose","SF",76],["Alvin Williams","PG",70],
    ["Donyell Marshall","PF",72],["Morris Peterson","SF",70],
    ["Jerome Williams","PF",65],["Lonny Baxter","C",60],
    ["Milt Palacio","PG",60]]},
  "Utah Jazz": {w:42, l:40, players:[
    ["Andrei Kirilenko","SF",84],["Carlos Arroyo","PG",74],
    ["Matt Harpring","SF",72],["Greg Ostertag","C",65],
    ["DeShawn Stevenson","SG",70],["Raul Lopez","PG",65],
    ["Tom Gugliotta","PF",65],["Jarron Collins","C",62],
    ["Gordan Giricek","SG",68]]},
  "Washington Wizards": {w:25, l:57, players:[
    ["Gilbert Arenas","PG",81],["Larry Hughes","SG",78],
    ["Jerry Stackhouse","SG",76],["Kwame Brown","PF",70],
    ["Brendan Haywood","C",70],["Jared Jeffries","SF",65],
    ["Etan Thomas","C",65],["Christian Laettner","PF",65],
    ["Steve Blake","PG",62]]},
  "Charlotte Bobcats": {w:30, l:52, players:[
    ["Emeka Okafor","C",75],["Gerald Wallace","SF",74],
    ["Brevin Knight","PG",70],["Primoz Brezec","C",68],
    ["Jason Kapono","SF",65],["Melvin Ely","PF",62],
    ["Keith Bogans","SG",65],["Steve Smith","SG",65],
    ["Jahidi White","C",60]]},
  },

  // ─── 2004-05 ─── (to be added)
  // 2004: { ... },

  // ─── 2005-06 ─── (to be added)
  // 2005: { ... },
};

// Look up roster data for a given season-start year. If the requested year
// isn't populated yet, falls back to the most recent populated year ≤ target
// (or the earliest available year if target predates all data). Returns the
// effective year alongside the data so callers can flag fallbacks if they want.
export function getNbaSeasonData(year: number): { year: number; data: SeasonData } {
  if (NBA_ROSTERS_BY_YEAR[year]) return { year, data: NBA_ROSTERS_BY_YEAR[year] };
  const years = Object.keys(NBA_ROSTERS_BY_YEAR).map(Number).sort((a, b) => a - b);
  if (years.length === 0) return { year, data: {} };
  const olderOrEqual = years.filter(y => y <= year);
  const fallbackYear = olderOrEqual.length > 0 ? olderOrEqual[olderOrEqual.length - 1] : years[0];
  return { year: fallbackYear, data: NBA_ROSTERS_BY_YEAR[fallbackYear] };
}
