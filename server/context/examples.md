# Baseball Query Examples

## Example 1
**Prompt:** "Show me the pitchers who have thrown the most cutters this season"

**Fields:**
- hfPT: ["FC"]
- player_type: "pitcher"
- hfSea: ["2025"]
- group_by: "name"
- sort_col: "pitches"
- sort_order: "desc"

**Explanation:** We query for pitchers who throw cutters this season, and we want to group by name, sort by descending amount of pitches thrown

---

## Example 2
**Prompt:** "Show me the pitchers who have thrown the least changeups this season"

**Fields:**
- hfPT: ["CH"]
- player_type: "pitcher"
- hfSea: ["2025"]
- group_by: "name"
- sort_col: "pitches"
- sort_order: "asc"

**Explanation:** We query for pitchers who throw changeups this season, and we want to group by name, sort by ascending amount of pitches thrown

---

## Example 3
**Prompt:** "Shortstops that have seen the most curveballs"

**Fields:**
- hfPT: ["CU", "KC", "CS"]
- player_type: "batter"
- position: "6"
- group_by: "name"
- sort_col: "pitches"
- sort_order: "desc"

**Explanation:** Since this is talking about a batter, we want to look for batters that play shortstop that have faced the different curveballs. We want to group by name, and sort by descending amount of pitches thrown

---

## Example 4
**Prompt:** "Third basemen that have watched the most sliders thrown from the field"

**Fields:**
- hfPT: ["SL"]
- player_type: "fielder_5"
- group_by: "name"
- sort_col: "pitches"
- sort_order: "desc"

**Explanation:** Since they specify watching from the field we want to look for third basement that have seen sliders. We want to group by name and sort by descending amount of pitches

---

## Example 5
**Prompt:** "Pitchers with the most home runs given up on the Rays"

**Fields:**
- player_type: "pitcher"
- hfTeam: ["139"]
- hfAB: ["home run"]
- group_by: "name"
- sort_col: "pitches"
- sort_order: "desc"

**Explanation:** We want to look for pitchers on the Rays that have ended their at bats in home runs. We want to group by name and sort by descending amount of pitches

## Example 6
**Prompt:** "aaron judge strikeouts against garrett crochet"

**Fields:**
- player_type: "batter"
- hfAB: ["strikeout"]
- players_lookup: ['Judge,Aaron', 'Crochet,Garrett']
- group_by: "name"
- sort_col: "pitches"
- sort_order: "desc"

**Explanation:** We want to find all instances of Aaron Judge striking out against Garrett Crochet. Aaron Judge is set as our focus player here because the person is looking for a query centered around Aaron Judge striking out.

## Example 7
**Prompt:** "trey yesavage striking out brandon lowe"

**Fields:**
- player_type: "pitcher"
- hfAB: ["strikeout"]
- players_lookup: ['Yesavage,Trey', 'Lowe,Brandon']
- group_by: "name"
- sort_col: "pitches"
- sort_order: "desc"

**Explanation:** We want to find all instances of Trey Yesavage striking out Brandon Lowe. Trey Yesavage is set as our focus player here because the person is looking for a query centered around Trey Yesavage striking out a player.
