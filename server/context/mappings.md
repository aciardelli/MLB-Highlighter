# Baseball Search Mappings

## hfPT - Pitch Types
**Meta Information:**
- Name: pitch types
- Context: Matchup Descriptor
- Default value: None
- Multiple selections: true

**Mappings:**
- FF: fastball (aliases: four-seam)
- SI: sinker
- FC: cutter (aliases: cut fastball)
- CH: changeup
- FS: split-finger
- FO: forkball
- SC: screwball
- CU: curveball
- KC: knuckle curve
- CS: slow curve
- SL: slider
- ST: sweeper
- SV: slurve
- KN: knuckleball
- EP: eephus
- FA: other
- IN: intentional ball
- PO: pitchout

**Groups:**
- fastballs: FF, SI, FC
- offspeed: CH, FS, FO, SC
- breaking: CU, KC, CS, SL, ST, SV, KN
- other pitches: EP, FA, IN, PO

## hfAB - Plate Appearance Result
**Meta Information:**
- Name: plate appearance result
- Context: Matchup Descriptor
- Default value: None
- Multiple selections: true

**Mappings:**
- single: single
- double: double
- triple: triple
- home run: home run (aliases: homer, dinger)
- field out: field out
- strikeout: strikeout (aliases: k)
- double play: double play (aliases: dp)
- fielders choice: fielders choice

**Groups:**
- base hits: single, double, triple, home run
- outs: field out, strikeout, double play, fielders choice

## hfPR - Pitch Result
**Meta Information:**
- Name: pitch result
- Context: Pitch Descriptor
- Default value: None
- Multiple selections: true

**Mappings:**
- bunt foul tip: foul tip bunt
- missed bunt: missed bunt
- foul tip: foul tip
- swinging strike: swinging strike
- swinging strike blocked: swinging strike (blocked)
- foul: foul
- foul bunt: foul bunt
- foul pitchout: foul pitchout
- hit into play: in play
- ball: ball
- ball in dirt: ball in dirt
- called strike: called strike
- pitchout: pitchout
- hit by pitch: hit by pitch
- intentional ball: intentional ball
- swinging pitchout: swinging pitchout

**Groups:**
- swing and miss: bunt foul tip, missed bunt, foul tip, swinging strike, swinging strike blocked
- all swings: foul, foul bunt, bunt foul tip, foul pitchout, hit into play, missed bunt, foul tip, swinging strike, swinging strike blocked
- balls: ball, ball in dirt, intentional ball
- called: called strike
- other: pitchout, hit by pitch, swinging pitchout

## player_type - Player Type
**Meta Information:**
- Name: player type
- Context: Matchup Descriptor
- Default value: pitcher
- Multiple selections: false

**Mappings:**
- pitcher: pitcher
- batter: batter
- fielder_2: catcher
- fielder_3: first base (aliases: 1B)
- fielder_4: second base (aliases: 2B)
- fielder_5: third base (aliases: 3B)
- fielder_6: shortstop (aliases: SS)
- fielder_7: left field (aliases: LF)
- fielder_8: center field (aliases: CF)
- fielder_9: right field (aliases: RF)

**Groups:**
- fielders: fielder_2, fielder_3, fielder_4, fielder_5, fielder_6, fielder_7, fielder_8, fielder_9
- pitchers: pitcher
- batters: batter

## position - Position
**Meta Information:**
- Name: position
- Context: Matchup Descriptor
- Default value: None
- Multiple selections: false

**Mappings:**
- 1: pitcher
- 2: catcher
- 3: first base (aliases: 1B)
- 4: second base (aliases: 2B)
- 5: third base (aliases: 3B)
- 6: shortstop (aliases: SS)
- 7: left field (aliases: LF)
- 8: center field (aliases: CF)
- 9: right field (aliases: RF)
- 10: designated hitter (aliases: DH)
- IF: infield
- OF: outfield

**Groups:**
- infield: 1, 2, 3, 4, 5, 6, IF
- outfield: 7, 8, 9, OF
- other: 10

## batter_stands - Batter Stands
**Meta Information:**
- Name: batter stands
- Context: if the batter stands in as a left handed hitter or right handed hitter
- Default value: None
- Multiple selections: false

**Mappings:**
- R: Right
- L: Left

## hfTeam - Team
**Meta Information:**
- Name: team
- Context: the team associated with the play
- Default value: None
- Multiple selections: false

**Mappings:**
- 141: Blue Jays
- 110: Orioles
- 139: Rays
- 111: Red Sox
- 147: Yankees
- 114: Guardians
- 118: Royals
- 116: Tigers
- 142: Twins
- 145: White Sox
- 108: Angels
- 117: Astros
- 133: Athletics
- 136: Mariners
- 140: Rangers
- 144: Braves
- 146: Marlins
- 121: Mets
- 120: Nationals
- 143: Phillies
- 158: Brewers
- 138: Cardinals
- 112: Cubs
- 134: Pirates
- 113: Reds
- 109: Diamondbacks
- 119: Dodgers
- 137: Giants
- 135: Padres
- 115: Rockies

**Groups:**
- American League East: 141, 110, 139, 111, 147
- American League Central: 114, 118, 116, 142, 145
- American League West: 108, 117, 133, 136, 140
- National League East: 144, 146, 121, 120, 143
- National League Central: 158, 138, 112, 134, 113
- National League West: 109, 119, 137, 135, 115
- American League: 141, 110, 139, 111, 147, 114, 118, 116, 142, 145, 108, 117, 133, 136, 140
- National League: 144, 146, 121, 120, 143, 158, 138, 112, 134, 113, 109, 119, 137, 135, 115

## players_lookup - Players
**Meta Information:**
- Name: players
- Context: specific players (batters or pitchers)
- Default value: None
- Multiple selections: true

**Mappings:** (empty)

## hfGT - Game Type
**Meta Information:**
- Name: game type
- Context: Time Descriptor
- Default value: R
- Multiple selections: true

**Mappings:**
- R: regular season
- PO: postseason (aliases: playoffs)

## hfMO - Month
**Meta Information:**
- Name: month
- Context: specific month or months
- Default value: None
- Multiple selections: true

**Mappings:**
- 4: March/April
- 5: May
- 6: June
- 7: July
- 8: August
- 9: September/October

## hfSea - Season
**Meta Information:**
- Name: season
- Context: Time Descriptor
- Default value: 2025
- Multiple selections: true

**Mappings:**
- 2025: 2025
- 2024: 2024
- 2023: 2023
