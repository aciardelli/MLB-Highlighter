# Baseball Query Examples

## Example 1
**Prompt:** "Junior Caminero home runs against sliders"

**Fields:**
- hfAB: ["home run"]
- hfPT: ["SL"]
- players_lookup: ['Caminero,Junior']
- group_by: "name"
- sort_col: "pitches"
- sort_order: "desc"

**Explanation:** We want to find all instances of the player Junior Caminero hitting home runs against sliders.

## Example 2
**Prompt:** "Cody Bellinger hits against changeups"

**Fields:**
- hfAB: ["single", "double", "triple", "home run"]
- hfPT: ["CH"]
- players_lookup: ['Bellinger,Cody']
- group_by: "name"
- sort_col: "pitches"
- sort_order: "desc"

**Explanation:** We want to find all instances of the player Cody Bellinger getting a hit which includes singles, doubles, triples, and home runs, against changeups.

## Example 3
**Prompt:** "Tampa Bay Rays home runs in July"

**Fields:**
- player_type: "batter"
- hfAB: ["home run"]
- hfMo: ["7"]
- hfTeam: ["139"]
- group_by: "name"
- sort_col: "pitches"
- sort_order: "desc"

**Explanation:** We want to find all instances of the Rays as a team hitting home runs in the month of July.

## Example 4
**Prompt:** "Diamondbacks pitchers striking out batters in August"

**Fields:**
- player_type: "pitcher"
- hfAB: ["strikeout"]
- hfMo: ["8"]
- hfTeam: ["109"]
- group_by: "name"
- sort_col: "pitches"
- sort_order: "desc"

**Explanation:** We want to find all instances of the Diamondbacks as a team striking out batters in August.

## Example 5
**Prompt:** "Hunter Brown strikeouts against the Athletics"

**Fields:**
- hfAB: ["strikeout"]
- players_lookup: ['Brown,Hunter']
- hfOpponent: ["133"]
- group_by: "name"
- sort_col: "pitches"
- sort_order: "desc"

**Explanation:** Hunter Brown is our focus player and we want to search for times that he has struck out Athletics players. In this case, he is playing against the Athletics, so we have to set them as the opponent.

## Example 6
**Prompt:** "Tarik Skubal striking out the ALC"

**Fields:**
- hfAB: ["strikeout"]
- players_lookup: ['Skubal,Tarik']
- hfOpponent: ["114", "118", "116", "142", "145"]
- group_by: "name"
- sort_col: "pitches"
- sort_order: "desc"

**Explanation:** Tarik Skubal is our focus player and we want to search for times that he has struck out American League Central (ALC) players. We must set hfOpponent to all of the teams in the ALC.

## Example 7
**Prompt:** "Aaron Judge doubles against the ALE in June"

**Fields:**
- hfAB: ["double"]
- players_lookup: ['Judge,Aaron']
- hfOpponent: ["141", "110", "139", "111", "147"]
- hfMo: ["6"]
- group_by: "name"
- sort_col: "pitches"
- sort_order: "desc"

**Explanation:** Aaron Judge is our focus player and we want to search for times that he has hit a double against teams in the American League East (ALE) in the month of June. We must set hfOpponent to all ALE teams and hfMo to the month of June. 

## Example 8
**Prompt:** "aaron judge strikeouts against garrett crochet"

**Fields:**
- hfAB: ["strikeout"]
- players_lookup: ['Judge,Aaron', 'Crochet,Garrett']
- group_by: "name"
- sort_col: "pitches"
- sort_order: "desc"

**Explanation:** We want to find all instances of Aaron Judge striking out against Garrett Crochet. Aaron Judge is set as our focus player here because the person is looking for a query centered around Aaron Judge striking out.

## Example 9
**Prompt:** "trey yesavage striking out brandon lowe"

**Fields:**
- hfAB: ["strikeout"]
- players_lookup: ['Yesavage,Trey', 'Lowe,Brandon']
- group_by: "name"
- sort_col: "pitches"
- sort_order: "desc"

**Explanation:** We want to find all instances of Trey Yesavage striking out Brandon Lowe. Trey Yesavage is set as our focus player here because the person is looking for a query centered around Trey Yesavage striking out a player.

## Example 10
**Prompt** "yoshinobu yamamoto vs fernando tatis jr"

**Fields:**
- players_lookup: ['Yamamoto, Yoshinobu', 'Tatis Jr., Fernando']
- group_by: "name"
- sort_col: "pitches"
- sort_order: "desc"

**Explanation:** A vague prompt like this should be pretty basic. The user never specifies any type of event happening, so we can assume they just want to see Yoshinobu Yamamoto pitching against Fernando Tatis Jr. Since Yoshinobu Yamamoto is mentioned first, he is likely the person our query is centered around, making him the focus player.

## Example 11
**Prompt:** "playoff home runs"

**Fields:**
- hfAB: ["home run"]
- hfGT: ["PO"]
- hfSea: ["2025"]
- group_by: "name"
- sort_col: "pitches"
- sort_order: "desc"

**Explanation:** The user wants to see postseason home runs. Since they did not specify a season, we default to the most recently completed postseason season (2025) rather than the current season, because the current season's postseason likely hasn't occurred yet.

## Example 12
**Prompt:** "left handed batters hitting home runs against the Yankees"

**Fields:**
- hfAB: ["home run"]
- batter_stands: "L"
- hfOpponent: ["147"]
- player_type: "batter"
- group_by: "name"
- sort_col: "pitches"
- sort_order: "desc"

**Explanation:** We want to find all home runs hit by left-handed batters against the Yankees. We set batter_stands to "L" to filter for lefties and hfOpponent to the Yankees since the batters are hitting against them.

## Example 13
**Prompt:** "swinging strikes on Dylan Cease's slider"

**Fields:**
- hfPR: ["swinging strike", "swinging strike blocked"]
- hfPT: ["SL"]
- players_lookup: ['Cease,Dylan']
- group_by: "name"
- sort_col: "pitches"
- sort_order: "desc"

**Explanation:** We want to find all swinging strikes generated by Dylan Cease's slider. We use hfPR (pitch result) rather than hfAB (plate appearance result) because a swinging strike is an individual pitch outcome, not an at-bat outcome. We include both "swinging strike" and "swinging strike blocked" to capture all swings and misses.

## Example 14
**Prompt:** "called strikes on Kyle Tucker"

**Fields:**
- hfPR: ["called strike"]
- players_lookup: ['Tucker,Kyle']
- player_type: "batter"
- group_by: "name"
- sort_col: "pitches"
- sort_order: "desc"

**Explanation:** We want to find all called strikes against Kyle Tucker. We use hfPR (pitch result) because a called strike is an individual pitch outcome. Since the query is centered around Tucker as a batter watching pitches go by, we set player_type to "batter".
