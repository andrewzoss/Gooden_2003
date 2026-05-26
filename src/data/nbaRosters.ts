// ─── NBA SEASON ROSTERS ──────────────────────────────────────────────────────
// Per-season rosters and W/L records. Keyed by SEASON-START year
// (2003 = the 2003-04 NBA season, 2004 = 2004-05, etc.).
//
// Team identities are FROZEN at the 2003-04 set across the whole 20-year
// window — we keep Seattle SuperSonics, New Jersey Nets, original Charlotte
// not-yet-Bobcats absent, etc. Only the rosters and records change year over
// year.
//
// Each value mirrors the original shape App.tsx expected:
//   { w, l, players: [[name, position, ovr, ppg], ...] }
//
// Years not yet populated will fall back via getNbaSeasonData() to the most
// recently populated year ≤ target. This lets us ship the refactor with only
// 2003 filled in and add more seasons over time without breaking the game.
 
export type RosterPlayer = [string, string, number, number]; // [name, position, ovr, ppg]
export type TeamSeason = { w: number; l: number; players: RosterPlayer[] };
export type SeasonData = Record<string, TeamSeason>;
 
export const NBA_ROSTERS_BY_YEAR: Record<number, SeasonData> = {
  // ─── 2003-04 ───────────────────────────────────────────────────────────────
  2003:
{
  "Atlanta Hawks": {w:28, l:54, players:[
    ["Stephen Jackson","SG",78,18.1],["Shareef Abdur-Rahim","PF",80,20.1],
    ["Theo Ratliff","C",73,13.3],["Boris Diaw","PG",70,4.5],
    ["Jason Terry","PG",77,16.8],["Predrag Drobnjak","C",68,8.0],
    ["Chris Crawford","SF",65,5.7],["Jason Collier","C",62,4.1],
    ["Tony Delk","PG",66,6.3]]},
  "Boston Celtics": {w:36, l:46, players:[
    ["Paul Pierce","SF",87,23.0],["Antoine Walker","PF",75,15.5],
    ["Mark Blount","C",72,10.3],["Ricky Davis","SG",76,16.0],
    ["Marcus Banks","PG",65,5.0],["Walter McCarty","SF",64,5.0],
    ["Raef LaFrentz","PF",71,9.4],["Jiri Welsch","SG",66,7.7],
    ["Chucky Atkins","PG",68,8.5]]},
  "Chicago Bulls": {w:23, l:59, players:[
    ["Jamal Crawford","SG",75,17.3],["Eddy Curry","C",73,14.7],
    ["Tyson Chandler","C",70,6.1],["Kirk Hinrich","PG",74,12.0],
    ["Scottie Pippen","SF",72,5.9],["Marcus Fizer","PF",68,9.2],
    ["Eddie Robinson","SF",65,5.6],["Linton Johnson","PF",60,3.8],
    ["Jerome Williams","PF",66,4.7]]},
  "Cleveland Cavaliers": {w:35, l:47, players:[
    ["LeBron James","SF",88,20.9],["Carlos Boozer","PF",78,15.5],
    ["Zydrunas Ilgauskas","C",80,15.3],["Ricky Davis","SG",76,15.3],
    ["Eric Snow","PG",70,7.6],["Dajuan Wagner","PG",65,4.5],
    ["Jeff McInnis","PG",72,9.8],["Ira Newble","SF",62,4.0],
    ["DeSagana Diop","C",60,1.8]]},
  "Dallas Mavericks": {w:52, l:30, players:[
    ["Dirk Nowitzki","PF",90,21.8],["Steve Nash","PG",84,14.5],
    ["Michael Finley","SG",79,18.6],["Antawn Jamison","SF",80,14.8],
    ["Antoine Walker","PF",75,14.0],["Josh Howard","SF",73,8.3],
    ["Marquis Daniels","SG",72,10.3],["Shawn Bradley","C",68,3.7],
    ["Jamison Brewer","PG",60,2.0]]},
  "Denver Nuggets": {w:43, l:39, players:[
    ["Carmelo Anthony","SF",82,21.0],["Andre Miller","PG",76,14.8],
    ["Marcus Camby","C",78,11.0],["Nene","PF",74,11.8],
    ["Voshon Lenard","SG",71,11.2],["Earl Boykins","PG",70,9.6],
    ["Jon Barry","SG",65,5.7],["Rodney White","SF",62,4.7],
    ["Kenny Satterfield","PG",58,2.5]]},
  "Detroit Pistons": {w:54, l:28, players:[
    ["Chauncey Billups","PG",83,16.9],["Richard Hamilton","SG",81,17.6],
    ["Ben Wallace","C",84,9.5],["Rasheed Wallace","PF",82,13.7],
    ["Tayshaun Prince","SF",77,10.3],["Corliss Williamson","PF",70,9.4],
    ["Mehmet Okur","C",72,9.6],["Lindsey Hunter","PG",65,5.3],
    ["Mike James","PG",67,5.4]]},
  "Golden State Warriors": {w:37, l:45, players:[
    ["Jason Richardson","SG",80,18.7],["Mike Dunleavy","SF",73,11.7],
    ["Erick Dampier","C",75,12.3],["Nick Van Exel","PG",75,12.5],
    ["Troy Murphy","PF",72,10.9],["Cliff Robinson","PF",70,9.9],
    ["Speedy Claxton","PG",68,9.2],["Calbert Cheaney","SG",62,4.7],
    ["Adonal Foyle","C",65,5.7]]},
  "Houston Rockets": {w:45, l:37, players:[
    ["Yao Ming","C",84,17.5],["Steve Francis","PG",82,16.6],
    ["Cuttino Mobley","SG",78,15.8],["Jim Jackson","SF",72,11.7],
    ["Maurice Taylor","PF",70,9.7],["Eric Piatkowski","SF",65,6.4],
    ["Bostjan Nachbar","SF",62,4.4],["Kelvin Cato","C",66,4.4],
    ["Mike Wilks","PG",58,2.5]]},
  "Indiana Pacers": {w:61, l:21, players:[
    ["Jermaine O'Neal","PF",87,20.1],["Ron Artest","SF",83,18.3],
    ["Reggie Miller","SG",76,10.0],["Jamaal Tinsley","PG",73,8.0],
    ["Al Harrington","PF",72,13.3],["Jeff Foster","C",68,5.3],
    ["Austin Croshere","PF",65,6.3],["Anthony Johnson","PG",66,5.5],
    ["Fred Jones","SG",64,4.1]]},
  "LA Clippers": {w:28, l:54, players:[
    ["Elton Brand","PF",82,20.0],["Corey Maggette","SF",78,20.7],
    ["Quentin Richardson","SG",76,17.2],["Marko Jaric","PG",70,8.6],
    ["Chris Kaman","C",70,6.1],["Bobby Simmons","SF",68,5.5],
    ["Lamond Murray","SF",65,6.4],["Eddie House","PG",65,6.4],
    ["Olden Polynice","C",60,2.4]]},
  "LA Lakers": {w:56, l:26, players:[
    ["Kobe Bryant","SG",91,24.0],["Shaquille O'Neal","C",92,21.5],
    ["Karl Malone","PF",80,13.2],["Gary Payton","PG",80,14.6],
    ["Devean George","SF",68,7.7],["Derek Fisher","PG",72,7.1],
    ["Rick Fox","SF",65,4.7],["Slava Medvedenko","PF",66,8.3],
    ["Brian Cook","PF",62,3.6]]},
  "Memphis Grizzlies": {w:50, l:32, players:[
    ["Pau Gasol","PF",83,17.7],["Mike Miller","SG",75,13.7],
    ["James Posey","SF",74,13.0],["Jason Williams","PG",75,11.0],
    ["Bonzi Wells","SG",73,11.7],["Stromile Swift","PF",70,9.6],
    ["Lorenzen Wright","C",68,5.3],["Earl Watson","PG",68,5.7],
    ["Shane Battier","SF",70,8.4]]},
  "Miami Heat": {w:42, l:40, players:[
    ["Dwyane Wade","SG",81,16.2],["Lamar Odom","PF",80,17.1],
    ["Eddie Jones","SG",75,12.7],["Caron Butler","SF",73,9.2],
    ["Brian Grant","PF",70,9.8],["Rafer Alston","PG",72,10.6],
    ["Udonis Haslem","PF",70,7.5],["Loren Woods","C",60,2.8],
    ["Samaki Walker","C",60,2.9]]},
  "Milwaukee Bucks": {w:41, l:41, players:[
    ["Michael Redd","SG",83,21.7],["T.J. Ford","PG",73,7.1],
    ["Desmond Mason","SG",75,15.3],["Joe Smith","PF",72,11.0],
    ["Brian Skinner","C",68,5.9],["Damon Jones","PG",70,10.1],
    ["Tim Thomas","SF",70,12.0],["Toni Kukoc","SF",68,8.0],
    ["Daniel Santiago","C",58,3.2]]},
  "Minnesota Timberwolves": {w:58, l:24, players:[
    ["Kevin Garnett","PF",92,24.2],["Sam Cassell","PG",81,19.8],
    ["Latrell Sprewell","SG",78,16.8],["Wally Szczerbiak","SF",75,12.0],
    ["Trenton Hassell","SF",70,7.4],["Michael Olowokandi","C",65,6.5],
    ["Ervin Johnson","C",62,2.6],["Fred Hoiberg","SG",68,5.4],
    ["Troy Hudson","PG",65,5.0]]},
  "New Jersey Nets": {w:47, l:35, players:[
    ["Jason Kidd","PG",87,15.5],["Richard Jefferson","SF",78,18.5],
    ["Kenyon Martin","PF",80,16.7],["Kerry Kittles","SG",73,10.3],
    ["Jason Collins","C",68,6.4],["Brian Scalabrine","PF",60,2.6],
    ["Rodney Rogers","PF",65,6.4],["Lucious Harris","SG",68,7.7],
    ["Aaron Williams","PF",62,5.0]]},
  "New Orleans Hornets": {w:41, l:41, players:[
    ["Baron Davis","PG",83,22.9],["Jamal Mashburn","SF",75,20.0],
    ["David Wesley","PG",73,12.5],["P.J. Brown","PF",72,9.0],
    ["Jamaal Magloire","C",75,13.6],["George Lynch","SF",65,4.6],
    ["Stacey Augmon","SF",62,3.3],["Robert Traylor","C",60,3.5],
    ["Darrell Armstrong","PG",66,6.5]]},
  "New York Knicks": {w:39, l:43, players:[
    ["Stephon Marbury","PG",82,19.8],["Allan Houston","SG",78,18.5],
    ["Keith Van Horn","PF",73,16.4],["Kurt Thomas","C",72,12.5],
    ["Dikembe Mutombo","C",70,5.6],["Penny Hardaway","SG",68,9.1],
    ["Tim Thomas","SF",70,12.3],["Frank Williams","PG",60,2.5],
    ["Othella Harrington","PF",62,5.3]]},
  "Orlando Magic": {w:21, l:61, players:[
    ["Tracy McGrady","SG",88,28.0],["Drew Gooden","PF",75,12.3],
    ["Tyronn Lue","PG",70,9.3],["Juwan Howard","PF",73,17.0],
    ["Andrew DeClercq","C",60,3.5],["Gordan Giricek","SG",68,10.7],
    ["Pat Garrity","SF",65,6.3],["Reece Gaines","PG",58,2.5],
    ["Steven Hunter","C",60,4.0]]},
  "Philadelphia 76ers": {w:33, l:49, players:[
    ["Allen Iverson","SG",87,26.4],["Glenn Robinson","SF",75,16.6],
    ["Eric Snow","PG",70,9.4],["Kenny Thomas","PF",72,12.5],
    ["Samuel Dalembert","C",70,7.6],["Aaron McKie","SG",68,8.7],
    ["Derrick Coleman","PF",65,7.4],["Marc Jackson","C",62,5.8],
    ["Willie Green","PG",65,5.8]]},
  "Phoenix Suns": {w:29, l:53, players:[
    ["Stephon Marbury","PG",82,20.8],["Shawn Marion","SF",84,19.0],
    ["Amar'e Stoudemire","PF",81,20.6],["Joe Johnson","SG",76,16.7],
    ["Bo Outlaw","SF",65,4.7],["Casey Jacobsen","SG",65,4.5],
    ["Tom Gugliotta","PF",65,4.1],["Howard Eisley","PG",62,3.4],
    ["Jake Voskuhl","C",60,3.4]]},
  "Portland Trail Blazers": {w:41, l:41, players:[
    ["Damon Stoudamire","PG",75,13.4],["Rasheed Wallace","PF",80,14.1],
    ["Bonzi Wells","SG",73,12.9],["Ruben Patterson","SF",72,12.6],
    ["Zach Randolph","PF",78,20.1],["Theo Ratliff","C",73,11.2],
    ["Derek Anderson","SG",70,11.0],["Travis Outlaw","SF",62,2.7],
    ["Dale Davis","PF",65,4.3]]},
  "Sacramento Kings": {w:55, l:27, players:[
    ["Peja Stojakovic","SF",85,24.2],["Chris Webber","PF",82,18.7],
    ["Mike Bibby","PG",80,18.4],["Brad Miller","C",78,14.1],
    ["Vlade Divac","C",73,9.9],["Doug Christie","SG",75,11.7],
    ["Bobby Jackson","PG",75,15.2],["Anthony Peeler","SG",65,5.9],
    ["Gerald Wallace","SF",70,7.2]]},
  "San Antonio Spurs": {w:57, l:25, players:[
    ["Tim Duncan","PF",89,22.3],["Tony Parker","PG",80,14.7],
    ["Manu Ginobili","SG",81,12.8],["Bruce Bowen","SF",73,6.6],
    ["Rasho Nesterovic","C",70,8.7],["Hedo Turkoglu","SF",73,9.2],
    ["Malik Rose","PF",70,8.0],["Devin Brown","SG",65,5.9],
    ["Robert Horry","PF",68,4.8]]},
  "Seattle SuperSonics": {w:37, l:45, players:[
    ["Ray Allen","SG",86,23.0],["Rashard Lewis","SF",80,17.8],
    ["Vladimir Radmanovic","PF",72,9.9],["Brent Barry","SG",73,10.4],
    ["Antonio Daniels","PG",70,9.6],["Nick Collison","PF",68,5.7],
    ["Reggie Evans","PF",65,4.4],["Calvin Booth","C",62,3.5],
    ["Luke Ridnour","PG",70,7.2]]},
  "Toronto Raptors": {w:33, l:49, players:[
    ["Vince Carter","SG",83,22.5],["Chris Bosh","PF",78,11.5],
    ["Jalen Rose","SF",76,15.3],["Alvin Williams","PG",70,9.7],
    ["Donyell Marshall","PF",72,11.8],["Morris Peterson","SF",70,11.9],
    ["Jerome Williams","PF",65,4.0],["Lonny Baxter","C",60,3.2],
    ["Milt Palacio","PG",60,3.0]]},
  "Utah Jazz": {w:42, l:40, players:[
    ["Andrei Kirilenko","SF",84,16.5],["Carlos Arroyo","PG",74,12.6],
    ["Matt Harpring","SF",72,13.5],["Greg Ostertag","C",65,4.0],
    ["DeShawn Stevenson","SG",70,11.5],["Raul Lopez","PG",65,5.3],
    ["Tom Gugliotta","PF",65,5.1],["Jarron Collins","C",62,3.5],
    ["Gordan Giricek","SG",68,10.2]]},
  "Washington Wizards": {w:25, l:57, players:[
    ["Gilbert Arenas","PG",81,19.6],["Larry Hughes","SG",78,18.8],
    ["Jerry Stackhouse","SG",76,15.0],["Kwame Brown","PF",70,10.9],
    ["Brendan Haywood","C",70,7.9],["Jared Jeffries","SF",65,6.0],
    ["Etan Thomas","C",65,4.0],["Christian Laettner","PF",65,7.9],
    ["Steve Blake","PG",62,3.6]]},
  "Charlotte Bobcats": {w:30, l:52, players:[
    ["Emeka Okafor","C",75,15.1],["Gerald Wallace","SF",74,11.1],
    ["Brevin Knight","PG",70,10.1],["Primoz Brezec","C",68,13.0],
    ["Jason Kapono","SF",65,7.4],["Melvin Ely","PF",62,5.8],
    ["Keith Bogans","SG",65,8.8],["Steve Smith","SG",65,6.5],
    ["Jahidi White","C",60,3.1]]},
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
