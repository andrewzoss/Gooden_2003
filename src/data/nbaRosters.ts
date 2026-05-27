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

  // ─── 2004-05 ───────────────────────────────────────────────────────────────
  2004:
{
  "Atlanta Hawks": {w:13, l:69, players:[
    ["Al Harrington","SF",76],["Josh Smith","PF",70],
    ["Josh Childress","SF",70],["Tyronn Lue","PG",68],
    ["Boris Diaw","PG",68],["Tony Delk","PG",66],
    ["Predrag Drobnjak","C",65],["Jason Collier","C",64],
    ["Kevin Willis","PF",64],["Chris Crawford","SF",62],
    ["Royal Ivey","PG",60],["Donta Smith","SG",60]]},
  "Boston Celtics": {w:45, l:37, players:[
    ["Paul Pierce","SF",84],["Ricky Davis","SG",76],
    ["Gary Payton","PG",76],["Antoine Walker","PF",74],
    ["Raef LaFrentz","PF",72],["Mark Blount","C",70],
    ["Tony Allen","SG",68],["Al Jefferson","PF",68],
    ["Delonte West","PG",68],["Kendrick Perkins","C",66],
    ["Marcus Banks","PG",65],["Justin Reed","SF",60]]},
  "Chicago Bulls": {w:47, l:35, players:[
    ["Kirk Hinrich","PG",76],["Ben Gordon","SG",76],
    ["Eddy Curry","C",75],["Andres Nocioni","SF",73],
    ["Tyson Chandler","C",72],["Luol Deng","SF",72],
    ["Antonio Davis","PF",68],["Chris Duhon","PG",68],
    ["Othella Harrington","PF",64],["Eric Piatkowski","SG",64],
    ["Adrian Griffin","SG",62],["Jannero Pargo","PG",62]]},
  "Cleveland Cavaliers": {w:42, l:40, players:[
    ["LeBron James","SF",90],["Zydrunas Ilgauskas","C",78],
    ["Drew Gooden","PF",75],["Eric Snow","PG",70],
    ["Jeff McInnis","PG",70],["Anderson Varejao","PF",66],
    ["Lucious Harris","SG",64],["Sasha Pavlovic","SF",64],
    ["Ira Newble","SF",62],["Robert Traylor","PF",62],
    ["DeSagana Diop","C",60],["Dajuan Wagner","PG",60]]},
  "Dallas Mavericks": {w:58, l:24, players:[
    ["Dirk Nowitzki","PF",89],["Michael Finley","SG",78],
    ["Jason Terry","PG",78],["Josh Howard","SF",76],
    ["Jerry Stackhouse","SG",76],["Erick Dampier","C",73],
    ["Marquis Daniels","SG",70],["Devin Harris","PG",68],
    ["Darrell Armstrong","PG",64],["Alan Henderson","PF",62],
    ["Pavel Podkolzin","C",60],["DJ Mbenga","C",60]]},
  "Denver Nuggets": {w:49, l:33, players:[
    ["Carmelo Anthony","SF",81],["Kenyon Martin","PF",78],
    ["Marcus Camby","C",76],["Andre Miller","PG",75],
    ["Earl Boykins","PG",72],["Voshon Lenard","SG",72],
    ["Nene","PF",70],["Greg Buckner","SG",66],
    ["Eduardo Najera","PF",66],["Wesley Person","SG",64],
    ["DerMarr Johnson","SF",62],["Bryon Russell","SF",62]]},
  "Detroit Pistons": {w:54, l:28, players:[
    ["Chauncey Billups","PG",82],["Richard Hamilton","SG",80],
    ["Rasheed Wallace","PF",80],["Ben Wallace","C",80],
    ["Tayshaun Prince","SF",76],["Antonio McDyess","PF",70],
    ["Lindsey Hunter","PG",65],["Elden Campbell","C",62],
    ["Darko Milicic","PF",62],["Carlos Delfino","SF",62],
    ["Darvin Ham","SF",60],["Ronald Dupree","SF",60]]},
  "Golden State Warriors": {w:34, l:48, players:[
    ["Jason Richardson","SG",80],["Baron Davis","PG",80],
    ["Troy Murphy","PF",74],["Mike Dunleavy","SF",72],
    ["Derek Fisher","PG",72],["Mickael Pietrus","SF",70],
    ["Adonal Foyle","C",65],["Dale Davis","PF",64],
    ["Andris Biedrins","C",62],["Calbert Cheaney","SG",62],
    ["Zarko Cabarkapa","PF",60],["Dean Oliver","PG",60]]},
  "Houston Rockets": {w:51, l:31, players:[
    ["Tracy McGrady","SG",87],["Yao Ming","C",84],
    ["Bob Sura","PG",72],["Juwan Howard","PF",72],
    ["David Wesley","PG",70],["Mike James","PG",68],
    ["Jon Barry","SG",68],["Dikembe Mutombo","C",66],
    ["Maurice Taylor","PF",66],["Scott Padgett","PF",60],
    ["Charlie Ward","PG",60],["Ryan Bowen","SF",60]]},
  "Indiana Pacers": {w:44, l:38, players:[
    ["Jermaine O'Neal","PF",84],["Ron Artest","SF",78],
    ["Reggie Miller","SG",76],["Stephen Jackson","SG",75],
    ["Jamaal Tinsley","PG",72],["Jeff Foster","C",68],
    ["Anthony Johnson","PG",68],["Austin Croshere","PF",66],
    ["Fred Jones","SG",66],["Scot Pollard","C",62],
    ["James Jones","SF",62],["David Harrison","C",60]]},
  "LA Clippers": {w:37, l:45, players:[
    ["Elton Brand","PF",82],["Bobby Simmons","SF",78],
    ["Corey Maggette","SF",76],["Chris Kaman","C",70],
    ["Marko Jaric","PG",70],["Kerry Kittles","SG",70],
    ["Shaun Livingston","PG",66],["Chris Wilcox","PF",66],
    ["Zeljko Rebraca","C",64],["Mikki Moore","C",62],
    ["Rick Brunson","PG",60],["Lionel Chalmers","PG",60]]},
  "LA Lakers": {w:34, l:48, players:[
    ["Kobe Bryant","SG",88],["Lamar Odom","PF",80],
    ["Caron Butler","SF",75],["Chris Mihm","C",70],
    ["Chucky Atkins","PG",70],["Vlade Divac","C",66],
    ["Brian Grant","PF",65],["Slava Medvedenko","PF",65],
    ["Devean George","SF",65],["Brian Cook","PF",64],
    ["Sasha Vujacic","SG",62],["Tierre Brown","PG",60]]},
  "Memphis Grizzlies": {w:45, l:37, players:[
    ["Pau Gasol","PF",81],["Mike Miller","SG",76],
    ["Jason Williams","PG",74],["James Posey","SF",73],
    ["Shane Battier","SF",73],["Stromile Swift","PF",70],
    ["Bonzi Wells","SG",70],["Lorenzen Wright","C",66],
    ["Earl Watson","PG",66],["Bo Outlaw","PF",62],
    ["Jake Tsakalidis","C",60],["Antonio Burks","PG",60]]},
  "Miami Heat": {w:59, l:23, players:[
    ["Shaquille O'Neal","C",90],["Dwyane Wade","SG",86],
    ["Eddie Jones","SG",74],["Udonis Haslem","PF",73],
    ["Damon Jones","PG",72],["Rasual Butler","SF",68],
    ["Keyon Dooling","PG",66],["Christian Laettner","PF",65],
    ["Shandon Anderson","SF",64],["Michael Doleac","C",62],
    ["Malik Allen","PF",62],["Dorell Wright","SF",60]]},
  "Milwaukee Bucks": {w:30, l:52, players:[
    ["Michael Redd","SG",82],["Desmond Mason","SG",74],
    ["Joe Smith","PF",72],["Mo Williams","PG",70],
    ["Toni Kukoc","SF",68],["T.J. Ford","PG",68],
    ["Erick Strickland","PG",64],["Zaza Pachulia","C",64],
    ["Marcus Fizer","PF",64],["Daniel Santiago","C",62],
    ["Calvin Booth","C",60],["Anthony Goldwire","PG",60]]},
  "Minnesota Timberwolves": {w:44, l:38, players:[
    ["Kevin Garnett","PF",90],["Sam Cassell","PG",76],
    ["Wally Szczerbiak","SF",75],["Latrell Sprewell","SG",73],
    ["Trenton Hassell","SF",68],["Fred Hoiberg","SG",68],
    ["Troy Hudson","PG",65],["Eddie Griffin","PF",65],
    ["Michael Olowokandi","C",64],["Anthony Carter","PG",62],
    ["Ervin Johnson","C",60],["Mark Madsen","PF",60]]},
  "New Jersey Nets": {w:42, l:40, players:[
    ["Vince Carter","SG",84],["Jason Kidd","PG",82],
    ["Richard Jefferson","SF",78],["Nenad Krstic","C",68],
    ["Cliff Robinson","PF",66],["Eric Williams","SF",66],
    ["Travis Best","PG",65],["Jason Collins","C",64],
    ["Brian Scalabrine","PF",62],["Jacque Vaughn","PG",60],
    ["Jabari Smith","PF",60],["Zoran Planinic","PG",60]]},
  "New Orleans Hornets": {w:18, l:64, players:[
    ["P.J. Brown","PF",72],["Jamaal Magloire","C",70],
    ["Speedy Claxton","PG",70],["David West","PF",68],
    ["J.R. Smith","SG",68],["Lee Nailon","SF",65],
    ["Dan Dickau","PG",64],["Rodney Rogers","PF",64],
    ["Bostjan Nachbar","SF",64],["Chris Andersen","PF",62],
    ["George Lynch","SF",62],["Junior Harrington","PG",60]]},
  "New York Knicks": {w:33, l:49, players:[
    ["Stephon Marbury","PG",80],["Jamal Crawford","SG",76],
    ["Allan Houston","SG",72],["Tim Thomas","SF",72],
    ["Kurt Thomas","PF",72],["Nazr Mohammed","C",70],
    ["Trevor Ariza","SF",65],["Anfernee Hardaway","SG",64],
    ["Mike Sweetney","PF",64],["Jerome Williams","PF",62],
    ["Vin Baker","PF",60],["Moochie Norris","PG",60]]},
  "Orlando Magic": {w:36, l:46, players:[
    ["Steve Francis","PG",80],["Grant Hill","SF",78],
    ["Hedo Turkoglu","SF",73],["Dwight Howard","C",72],
    ["Jameer Nelson","PG",68],["DeShawn Stevenson","SG",65],
    ["Tony Battie","C",65],["Pat Garrity","SF",65],
    ["Kelvin Cato","C",64],["Mario Kasun","C",60],
    ["Andrew DeClercq","C",60],["Britton Johnsen","SF",60]]},
  "Philadelphia 76ers": {w:43, l:39, players:[
    ["Allen Iverson","SG",88],["Andre Iguodala","SF",72],
    ["Samuel Dalembert","C",72],["Kyle Korver","SG",70],
    ["Kenny Thomas","PF",68],["Aaron McKie","SG",64],
    ["Marc Jackson","C",64],["John Salmons","SG",64],
    ["Willie Green","SG",64],["Brian Skinner","C",64],
    ["Corliss Williamson","PF",64],["Josh Davis","SF",60]]},
  "Phoenix Suns": {w:62, l:20, players:[
    ["Steve Nash","PG",88],["Amar'e Stoudemire","PF",87],
    ["Shawn Marion","SF",84],["Joe Johnson","SG",80],
    ["Quentin Richardson","SF",74],["Leandro Barbosa","PG",70],
    ["Jim Jackson","SG",68],["Steven Hunter","C",66],
    ["Walter McCarty","SF",64],["Jake Voskuhl","C",62],
    ["Casey Jacobsen","SG",62],["Yuta Tabuse","PG",60]]},
  "Portland Trail Blazers": {w:27, l:55, players:[
    ["Zach Randolph","PF",80],["Shareef Abdur-Rahim","PF",76],
    ["Damon Stoudamire","PG",73],["Darius Miles","SF",70],
    ["Theo Ratliff","C",70],["Ruben Patterson","SF",70],
    ["Nick Van Exel","PG",70],["Joel Przybilla","C",66],
    ["Derek Anderson","SG",65],["Sebastian Telfair","PG",64],
    ["Travis Outlaw","SF",64],["Viktor Khryapa","SF",60]]},
  "Sacramento Kings": {w:50, l:32, players:[
    ["Peja Stojakovic","SF",82],["Mike Bibby","PG",78],
    ["Chris Webber","PF",76],["Brad Miller","C",76],
    ["Cuttino Mobley","SG",74],["Doug Christie","SG",72],
    ["Bobby Jackson","PG",70],["Maurice Evans","SG",64],
    ["Greg Ostertag","C",64],["Darius Songaila","PF",64],
    ["Anthony Peeler","SG",62],["Erik Daniels","SF",60]]},
  "San Antonio Spurs": {w:59, l:23, players:[
    ["Tim Duncan","PF",89],["Manu Ginobili","SG",83],
    ["Tony Parker","PG",80],["Brent Barry","SG",72],
    ["Bruce Bowen","SF",72],["Rasho Nesterovic","C",68],
    ["Robert Horry","PF",68],["Devin Brown","SG",65],
    ["Beno Udrih","PG",65],["Malik Rose","PF",64],
    ["Tony Massenburg","PF",62],["Sean Marks","C",60]]},
  "Seattle SuperSonics": {w:52, l:30, players:[
    ["Ray Allen","SG",86],["Rashard Lewis","SF",80],
    ["Vladimir Radmanovic","PF",74],["Luke Ridnour","PG",72],
    ["Antonio Daniels","PG",72],["Ronald Murray","SG",68],
    ["Reggie Evans","PF",68],["Nick Collison","PF",68],
    ["Jerome James","C",66],["Damien Wilkins","SG",65],
    ["Danny Fortson","PF",65],["Vitaly Potapenko","C",60]]},
  "Toronto Raptors": {w:33, l:49, players:[
    ["Chris Bosh","PF",78],["Jalen Rose","SF",74],
    ["Donyell Marshall","PF",72],["Rafer Alston","PG",72],
    ["Morris Peterson","SG",70],["Matt Bonner","PF",65],
    ["Aaron Williams","PF",64],["Lamond Murray","SF",64],
    ["Rafael Araujo","C",62],["Loren Woods","C",60],
    ["Roger Mason Jr.","SG",60],["Pape Sow","PF",60]]},
  "Utah Jazz": {w:26, l:56, players:[
    ["Andrei Kirilenko","SF",82],["Carlos Boozer","PF",78],
    ["Mehmet Okur","C",73],["Matt Harpring","SF",72],
    ["Carlos Arroyo","PG",70],["Raja Bell","SG",70],
    ["Gordan Giricek","SG",68],["Kris Humphries","PF",64],
    ["Raul Lopez","PG",62],["Keith McLeod","PG",62],
    ["Kirk Snyder","SG",62],["Jarron Collins","C",60]]},
  "Washington Wizards": {w:45, l:37, players:[
    ["Gilbert Arenas","PG",84],["Antawn Jamison","PF",80],
    ["Larry Hughes","SG",80],["Brendan Haywood","C",70],
    ["Kwame Brown","PF",68],["Etan Thomas","C",65],
    ["Jared Jeffries","SF",65],["Juan Dixon","SG",65],
    ["Steve Blake","PG",64],["Michael Ruffin","PF",60],
    ["Samaki Walker","C",60],["Peter John Ramos","C",60]]},
  "Charlotte Bobcats": {w:18, l:64, players:[
    ["Emeka Okafor","C",78],["Gerald Wallace","SF",75],
    ["Primoz Brezec","C",70],["Brevin Knight","PG",70],
    ["Jason Kapono","SF",66],["Keith Bogans","SG",65],
    ["Jason Hart","PG",64],["Melvin Ely","PF",64],
    ["Kareem Rush","SG",62],["Steve Smith","SG",62],
    ["Tamar Slay","SF",60],["Theron Smith","SF",60]]},
  },

  // ─── 2005-06 ───────────────────────────────────────────────────────────────
  2005:
{
  "Atlanta Hawks": {w:26, l:56, players:[
    ["Joe Johnson","SG",82],["Al Harrington","SF",76],
    ["Josh Smith","PF",73],["Josh Childress","SF",70],
    ["Marvin Williams","SF",68],["Tyronn Lue","PG",66],
    ["Salim Stoudamire","SG",65],["Zaza Pachulia","C",65],
    ["Lorenzen Wright","C",65],["Royal Ivey","PG",60],
    ["Esteban Batista","C",60],["John Edwards","C",60]]},
  "Boston Celtics": {w:33, l:49, players:[
    ["Paul Pierce","SF",86],["Wally Szczerbiak","SG",76],
    ["Al Jefferson","PF",72],["Raef LaFrentz","PF",70],
    ["Delonte West","PG",70],["Tony Allen","SG",70],
    ["Kendrick Perkins","C",68],["Gerald Green","SF",66],
    ["Ryan Gomes","SF",64],["Dan Dickau","PG",62],
    ["Brian Scalabrine","PF",62],["Orien Greene","PG",60]]},
  "Chicago Bulls": {w:41, l:41, players:[
    ["Kirk Hinrich","PG",78],["Ben Gordon","SG",78],
    ["Luol Deng","SF",74],["Andres Nocioni","SF",72],
    ["Tyson Chandler","C",72],["Chris Duhon","PG",68],
    ["Mike Sweetney","PF",66],["Darius Songaila","PF",64],
    ["Othella Harrington","PF",62],["Eric Piatkowski","SG",60],
    ["Malik Allen","PF",60],["Jannero Pargo","PG",60]]},
  "Cleveland Cavaliers": {w:50, l:32, players:[
    ["LeBron James","SF",92],["Larry Hughes","SG",78],
    ["Zydrunas Ilgauskas","C",78],["Drew Gooden","PF",75],
    ["Donyell Marshall","PF",72],["Anderson Varejao","PF",70],
    ["Damon Jones","PG",70],["Eric Snow","PG",68],
    ["Sasha Pavlovic","SF",64],["Scot Pollard","C",62],
    ["Ira Newble","SF",62],["Luke Jackson","SG",60]]},
  "Dallas Mavericks": {w:60, l:22, players:[
    ["Dirk Nowitzki","PF",92],["Jason Terry","PG",80],
    ["Josh Howard","SF",78],["Jerry Stackhouse","SG",76],
    ["Erick Dampier","C",72],["Marquis Daniels","SG",70],
    ["Devin Harris","PG",70],["Keith Van Horn","PF",68],
    ["Doug Christie","SG",64],["Adrian Griffin","SG",64],
    ["Darrell Armstrong","PG",62],["DJ Mbenga","C",60]]},
  "Denver Nuggets": {w:44, l:38, players:[
    ["Carmelo Anthony","SF",83],["Marcus Camby","C",78],
    ["Kenyon Martin","PF",76],["Andre Miller","PG",75],
    ["Earl Boykins","PG",70],["Voshon Lenard","SG",70],
    ["Ruben Patterson","SF",68],["Reggie Evans","PF",66],
    ["Greg Buckner","SG",64],["DerMarr Johnson","SF",62],
    ["Linas Kleiza","SF",62],["Julius Hodge","SG",60]]},
  "Detroit Pistons": {w:64, l:18, players:[
    ["Chauncey Billups","PG",84],["Richard Hamilton","SG",80],
    ["Rasheed Wallace","PF",80],["Ben Wallace","C",80],
    ["Tayshaun Prince","SF",76],["Antonio McDyess","PF",70],
    ["Maurice Evans","SG",65],["Lindsey Hunter","PG",64],
    ["Carlos Delfino","SF",64],["Dale Davis","PF",62],
    ["Jason Maxiell","PF",60],["Kelvin Cato","C",60]]},
  "Golden State Warriors": {w:34, l:48, players:[
    ["Baron Davis","PG",80],["Jason Richardson","SG",78],
    ["Troy Murphy","PF",73],["Mike Dunleavy","SF",72],
    ["Mickael Pietrus","SF",70],["Eduardo Najera","PF",66],
    ["Ike Diogu","PF",65],["Adonal Foyle","C",65],
    ["Andris Biedrins","C",64],["Monta Ellis","SG",64],
    ["Zarko Cabarkapa","PF",60],["Derrick Zimmerman","PG",60]]},
  "Houston Rockets": {w:34, l:48, players:[
    ["Tracy McGrady","SG",85],["Yao Ming","C",84],
    ["Rafer Alston","PG",72],["Stromile Swift","PF",72],
    ["Juwan Howard","PF",70],["Bob Sura","PG",68],
    ["Dikembe Mutombo","C",66],["Derek Anderson","SG",65],
    ["Luther Head","SG",65],["Jon Barry","SG",64],
    ["Ryan Bowen","SF",60],["Lonny Baxter","PF",60]]},
  "Indiana Pacers": {w:41, l:41, players:[
    ["Jermaine O'Neal","PF",82],["Peja Stojakovic","SF",76],
    ["Stephen Jackson","SG",75],["Jamaal Tinsley","PG",72],
    ["Danny Granger","SF",70],["Jeff Foster","C",68],
    ["Anthony Johnson","PG",68],["Sarunas Jasikevicius","PG",65],
    ["Austin Croshere","PF",65],["Fred Jones","SG",65],
    ["David Harrison","C",62],["James Jones","SF",62]]},
  "LA Clippers": {w:47, l:35, players:[
    ["Elton Brand","PF",86],["Sam Cassell","PG",76],
    ["Cuttino Mobley","SG",76],["Corey Maggette","SF",74],
    ["Chris Kaman","C",72],["Vladimir Radmanovic","PF",72],
    ["Shaun Livingston","PG",68],["Walter McCarty","SF",62],
    ["Quinton Ross","SF",60],["Daniel Ewing","SG",60],
    ["Zeljko Rebraca","C",60],["James Singleton","PF",60]]},
  "LA Lakers": {w:45, l:37, players:[
    ["Kobe Bryant","SG",92],["Lamar Odom","PF",80],
    ["Kwame Brown","PF",68],["Smush Parker","PG",68],
    ["Chris Mihm","C",68],["Luke Walton","SF",66],
    ["Devean George","SF",64],["Brian Cook","PF",64],
    ["Andrew Bynum","C",62],["Sasha Vujacic","SG",62],
    ["Aaron McKie","SG",62],["Ronny Turiaf","PF",60]]},
  "Memphis Grizzlies": {w:49, l:33, players:[
    ["Pau Gasol","PF",82],["Mike Miller","SF",76],
    ["Shane Battier","SF",73],["Damon Stoudamire","PG",73],
    ["Eddie Jones","SG",72],["Bobby Jackson","PG",70],
    ["Hakim Warrick","PF",65],["Brian Cardinal","PF",64],
    ["Jake Tsakalidis","C",60],["Lawrence Roberts","PF",60],
    ["Antonio Burks","PG",60],["Bo Outlaw","PF",60]]},
  "Miami Heat": {w:52, l:30, players:[
    ["Dwyane Wade","SG",90],["Shaquille O'Neal","C",86],
    ["Antoine Walker","PF",74],["James Posey","SF",72],
    ["Jason Williams","PG",72],["Udonis Haslem","PF",72],
    ["Gary Payton","PG",70],["Alonzo Mourning","C",70],
    ["Shandon Anderson","SF",62],["Dorell Wright","SF",62],
    ["Michael Doleac","C",60],["Wayne Simien","PF",60]]},
  "Milwaukee Bucks": {w:40, l:42, players:[
    ["Michael Redd","SG",82],["Bobby Simmons","SF",74],
    ["Andrew Bogut","C",72],["T.J. Ford","PG",72],
    ["Mo Williams","PG",70],["Jamaal Magloire","C",70],
    ["Joe Smith","PF",70],["Dan Gadzuric","C",66],
    ["Toni Kukoc","SF",66],["Charlie Bell","SG",60],
    ["Reece Gaines","PG",60],["Erick Strickland","PG",60]]},
  "Minnesota Timberwolves": {w:33, l:49, players:[
    ["Kevin Garnett","PF",88],["Ricky Davis","SG",76],
    ["Marko Jaric","PG",70],["Mark Blount","C",70],
    ["Trenton Hassell","SF",68],["Eddie Griffin","PF",65],
    ["Rashad McCants","SG",65],["Anthony Carter","PG",62],
    ["Justin Reed","SF",60],["Mark Madsen","PF",60],
    ["Bracey Wright","SG",60],["Dwayne Jones","C",60]]},
  "New Jersey Nets": {w:49, l:33, players:[
    ["Vince Carter","SG",84],["Jason Kidd","PG",80],
    ["Richard Jefferson","SF",76],["Nenad Krstic","C",72],
    ["Jeff McInnis","PG",65],["Cliff Robinson","PF",64],
    ["Jason Collins","C",64],["Marc Jackson","C",62],
    ["Lamond Murray","SF",62],["Antoine Wright","SG",62],
    ["Jacque Vaughn","PG",60],["Scott Padgett","PF",60]]},
  "New Orleans Hornets": {w:38, l:44, players:[
    ["Chris Paul","PG",78],["David West","PF",75],
    ["Desmond Mason","SG",72],["P.J. Brown","PF",70],
    ["J.R. Smith","SG",66],["Rasual Butler","SF",65],
    ["Devin Brown","SG",64],["Kirk Snyder","SG",64],
    ["Aaron Williams","PF",62],["Bostjan Nachbar","SF",62],
    ["Brandon Bass","PF",60],["Moochie Norris","PG",60]]},
  "New York Knicks": {w:23, l:59, players:[
    ["Stephon Marbury","PG",80],["Steve Francis","PG",76],
    ["Eddy Curry","C",75],["Jamal Crawford","SG",74],
    ["Quentin Richardson","SG",70],["Channing Frye","PF",70],
    ["Jalen Rose","SF",70],["Nate Robinson","PG",65],
    ["David Lee","PF",65],["Malik Rose","PF",65],
    ["Maurice Taylor","PF",64],["Jerome James","C",60]]},
  "Orlando Magic": {w:36, l:46, players:[
    ["Dwight Howard","C",76],["Grant Hill","SF",75],
    ["Hedo Turkoglu","SF",74],["Jameer Nelson","PG",72],
    ["Trevor Ariza","SF",66],["Darko Milicic","PF",65],
    ["DeShawn Stevenson","SG",65],["Carlos Arroyo","PG",65],
    ["Pat Garrity","SF",64],["Mario Kasun","C",62],
    ["Travis Diener","PG",60],["Bo Outlaw","PF",60]]},
  "Philadelphia 76ers": {w:38, l:44, players:[
    ["Allen Iverson","SG",86],["Chris Webber","PF",76],
    ["Andre Iguodala","SF",74],["Samuel Dalembert","C",72],
    ["Kyle Korver","SG",72],["Kenny Thomas","PF",68],
    ["John Salmons","SG",66],["Steven Hunter","C",65],
    ["Corliss Williamson","PF",64],["Brian Skinner","C",62],
    ["Louis Williams","PG",62],["Kevin Ollie","PG",60]]},
  "Phoenix Suns": {w:54, l:28, players:[
    ["Steve Nash","PG",90],["Shawn Marion","SF",84],
    ["Amar'e Stoudemire","PF",80],["Boris Diaw","PF",76],
    ["Raja Bell","SG",74],["Leandro Barbosa","SG",72],
    ["Tim Thomas","SF",70],["Kurt Thomas","C",70],
    ["Eddie House","SG",65],["James Jones","SF",64],
    ["Brian Grant","PF",62],["Pat Burke","C",60]]},
  "Portland Trail Blazers": {w:21, l:61, players:[
    ["Zach Randolph","PF",78],["Darius Miles","SF",70],
    ["Theo Ratliff","C",68],["Joel Przybilla","C",66],
    ["Steve Blake","PG",64],["Voshon Lenard","SG",64],
    ["Sebastian Telfair","PG",64],["Travis Outlaw","SF",64],
    ["Jarrett Jack","PG",64],["Juan Dixon","SG",62],
    ["Martell Webster","SG",62],["Viktor Khryapa","SF",60]]},
  "Sacramento Kings": {w:44, l:38, players:[
    ["Ron Artest","SF",78],["Mike Bibby","PG",76],
    ["Shareef Abdur-Rahim","PF",75],["Brad Miller","C",74],
    ["Bonzi Wells","SG",72],["Kevin Martin","SG",70],
    ["Francisco Garcia","SF",64],["Jason Hart","PG",62],
    ["Ronnie Price","PG",60],["Jamal Sampson","C",60],
    ["Mike Wilks","PG",60],["Vitaly Potapenko","C",60]]},
  "San Antonio Spurs": {w:63, l:19, players:[
    ["Tim Duncan","PF",86],["Tony Parker","PG",82],
    ["Manu Ginobili","SG",82],["Bruce Bowen","SF",70],
    ["Michael Finley","SG",70],["Brent Barry","SG",70],
    ["Robert Horry","PF",68],["Nazr Mohammed","C",68],
    ["Beno Udrih","PG",65],["Rasho Nesterovic","C",64],
    ["Fabricio Oberto","PF",62],["Tony Massenburg","PF",60]]},
  "Seattle SuperSonics": {w:35, l:47, players:[
    ["Ray Allen","SG",84],["Rashard Lewis","SF",80],
    ["Luke Ridnour","PG",72],["Chris Wilcox","PF",70],
    ["Nick Collison","PF",70],["Damien Wilkins","SG",65],
    ["Vitaly Potapenko","C",62],["Johan Petro","C",62],
    ["Robert Swift","C",60],["Mateen Cleaves","PG",60],
    ["Mickael Gelabale","SF",60],["Reggie Evans","PF",60]]},
  "Toronto Raptors": {w:27, l:55, players:[
    ["Chris Bosh","PF",80],["Mike James","PG",76],
    ["Morris Peterson","SG",70],["Charlie Villanueva","PF",68],
    ["Matt Bonner","PF",66],["Antonio Davis","PF",65],
    ["Jose Calderon","PG",64],["Joey Graham","SF",62],
    ["Rafael Araujo","C",62],["Eric Williams","SF",60],
    ["Pape Sow","PF",60],["Loren Woods","C",60]]},
  "Utah Jazz": {w:41, l:41, players:[
    ["Andrei Kirilenko","SF",78],["Carlos Boozer","PF",76],
    ["Mehmet Okur","C",73],["Matt Harpring","SF",72],
    ["Deron Williams","PG",72],["Gordan Giricek","SG",68],
    ["Keith McLeod","PG",64],["Greg Ostertag","C",62],
    ["Kris Humphries","PF",62],["Jarron Collins","C",60],
    ["Milt Palacio","PG",60],["Robert Whaley","C",60]]},
  "Washington Wizards": {w:42, l:40, players:[
    ["Gilbert Arenas","PG",84],["Antawn Jamison","PF",78],
    ["Caron Butler","SF",76],["Brendan Haywood","C",70],
    ["Antonio Daniels","PG",70],["Jared Jeffries","SF",65],
    ["Etan Thomas","C",65],["Chucky Atkins","PG",64],
    ["Michael Ruffin","PF",60],["Calvin Booth","C",60],
    ["Andray Blatche","PF",60],["Donell Taylor","SG",60]]},
  "Charlotte Bobcats": {w:26, l:56, players:[
    ["Gerald Wallace","SF",76],["Emeka Okafor","C",76],
    ["Brevin Knight","PG",70],["Primoz Brezec","C",68],
    ["Raymond Felton","PG",68],["Sean May","PF",64],
    ["Melvin Ely","PF",62],["Keith Bogans","SG",62],
    ["Jumaine Jones","SF",60],["Bernard Robinson","SF",60],
    ["Kareem Rush","SG",60],["Jake Voskuhl","C",60]]},
  },

  // ─── 2006-07 ─── (to be added)
  // 2006: { ... },
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
