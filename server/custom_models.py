from pydantic import BaseModel, field_validator, Field, model_validator
from typing import Literal
from datetime import datetime, date
from utils.helpers import player_name_to_id, player_position
    
class SavantFilters(BaseModel):
    hfPT: list[str] = Field(default_factory=lambda: [])                 # Pitch type
    hfPR: list[str] = Field(default_factory=lambda: [])                 # Pitch result
    hfBBL: list[str] = Field(default_factory=lambda: [])                # Batted ball location
    hfC: list[str] = Field(default_factory=lambda: [])                  # Count
    player_type: Literal[
    'pitcher', 'batter', 'fielder_2', 'fielder_3', 'fielder_4',
    'fielder_5', 'fielder_6', 'fielder_7', 'fielder_8', 'fielder_9' 
    ] = 'pitcher'                                                       # Player type
    pitcher_throws: str = ''                                            # Pitcher handedness
    game_date_gt: str = '' # date | None = None                                    # Game date greater than
    hfTeam: list[str] = Field(default_factory=lambda: [])               # Team
    position: str = ''                                                  # Position
    hfInn: list[str] = Field(default_factory=lambda: [])                # Inning
    hfFlag: list[str] = Field(default_factory=lambda: [])               # Flag

    hfAB: list[str] = Field(default_factory=lambda: [])                 # At-bat result
    hfZ: list[str] = Field(default_factory=lambda: [])                  # Zone
    hfNewZones: list[str] = Field(default_factory=lambda: [])           # New zones
    hfSea: list[str] = ['2025']                                         # Season
    hfOuts: list[str] = Field(default_factory=lambda: [])               # Outs
    batter_stands: str = ''                                             # Batter stance
    home_road: str = ''                                                 # Home/road
    game_date_lt: str = '' #date | None = None                                    # Game date less than
    hfInfield: list[str] = Field(default_factory=lambda: [])            # Infield alignment
    hfBBT: list[str] = Field(default_factory=lambda: [])                # Batted ball type

    hfGT: list[str] = ['R']                                             # Game type
    hfStadium: str = ''                                                 # Stadium
    hfPull: list[str] = Field(default_factory=lambda: [])               # Pull direction
    hfSit: list[str] = Field(default_factory=lambda: [])                # Situation
    hfOpponent: list[str] = Field(default_factory=lambda: [])           # Opponent
    hfSA: str = ''                                                      # Swing/take
    hfMo: list[str] = Field(default_factory=lambda: [])                 # Month
    hfRO: list[str] = Field(default_factory=lambda: [])                 # Runner on base
    hfOutfield: list[str] = Field(default_factory=lambda: [])           # Outfield alignment

    players_lookup: list[str] = Field(default_factory=lambda: [], description="player names; formatted last,first if possible")
    batters_lookup: list[str] = Field(default_factory=lambda: [])
    pitchers_lookup: list[str] = Field(default_factory=lambda: [])

    metric_1: str = ''                                                  # Metric 1
    group_by: str = 'name'                                              # Group by
    min_pas: str = '0'                                                  # Minimum plate appearances
    min_pitches: str = '0'                                              # Minimum pitches
    sort_col: str = 'pitches'                                           # Sort column
    min_results: str = '0'                                              # Minimum results
    player_event_sort: str = 'api_p_release_speed'                      # Player event sort
    sort_order: str = 'desc'                                            # Sort order
    
    @field_validator("hfSea", mode="before")
    @classmethod
    def validate_season(cls, v):
        print("validating season")
        if not v or v == []:
            return ['2025']

        current_year = datetime.now().year
        for season in v:
            try:
                year = int(season)
                if year < 2008 or year > current_year:
                    raise ValueError(f'Season {season} is not valid. Please enter a valid season')
            except (ValueError,TypeError):
                raise ValueError() 
        print("season success") 
        return v

    @field_validator("players_lookup", mode="after")
    @classmethod
    def names_to_ids(cls, player_names):
        print(f"checking names: {player_names}")
        player_ids = []
        for player in player_names:
            player_ids.append(player_name_to_id(player))
        print("player id success")
        return player_ids

    @field_validator("batters_lookup", "pitchers_lookup", mode="after")
    @classmethod
    def organize_players(cls, v, values):
        print("organizing players by position")

        player_ids = values.data.get('players_lookup', [])

        print(f"player ids: {player_ids}")

        if not player_ids:
            return []

        current_field = values.field_name
        organized_players = []

        for player_id in player_ids:
            try:
                position = player_position(player_id)
                if current_field == 'pitchers_lookup' and position == 'Pitcher':
                    organized_players.append(player_id)
                if current_field == 'batters_lookup' and position != 'Pitcher':
                    organized_players.append(player_id)
            except Exception as e:
                print(f"There was an error getting a player position: {e}")
                continue

        print(f"organized {len(organized_players)} players into {current_field}")
        return organized_players

    @model_validator(mode='after')
    def organize_all_players(self):
        if self.players_lookup and not self.batters_lookup and not self.pitchers_lookup:
            # set focus player
            if first_player_id := self.players_lookup[0]:
                try:
                    first_player_position = player_position(first_player_id)
                    self.player_type = 'pitcher' if first_player_position == 'Pitcher' else 'batter'
                except Exception as e:
                    print(f"Error getting position for first player {first_player_id}: {e}")

            # organize positions
            for player_id in self.players_lookup:
                position = player_position(player_id)
                if position == 'Pitcher':
                    self.pitchers_lookup.append(player_id)
                else:
                    self.batters_lookup.append(player_id)
        
        return self

class Query(BaseModel):
    query: str

class QueryResponse(BaseModel):
    filters: SavantFilters
    url: str

