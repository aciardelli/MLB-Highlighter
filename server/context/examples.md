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

**Explanation:** Aaron Judge is our focus player and we want to search for times that he has hit a double against teams in the American League East (ALE) in the month of June. We must set hfOpponent to all ALE teams and hfMo to the month of May. 

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
