from pydantic import BaseModel
from datetime import date, timedelta

MLB_TEAMS: dict[str, int] = {
    "Arizona Diamondbacks": 109,
    "Atlanta Braves": 144,
    "Baltimore Orioles": 110,
    "Boston Red Sox": 111,
    "Chicago Cubs": 112,
    "Chicago White Sox": 145,
    "Cincinnati Reds": 113,
    "Cleveland Guardians": 114,
    "Colorado Rockies": 115,
    "Detroit Tigers": 116,
    "Houston Astros": 117,
    "Kansas City Royals": 118,
    "Los Angeles Angels": 108,
    "Los Angeles Dodgers": 119,
    "Miami Marlins": 146,
    "Milwaukee Brewers": 158,
    "Minnesota Twins": 142,
    "New York Mets": 121,
    "New York Yankees": 147,
    "Oakland Athletics": 133,
    "Philadelphia Phillies": 143,
    "Pittsburgh Pirates": 134,
    "San Diego Padres": 135,
    "San Francisco Giants": 137,
    "Seattle Mariners": 136,
    "St. Louis Cardinals": 138,
    "Tampa Bay Rays": 139,
    "Texas Rangers": 140,
    "Toronto Blue Jays": 141,
    "Washington Nationals": 120,
}

def get_team_id(team_name: str) -> int:
    """Resolve a team name to its MLB Stats API team ID."""
    tid = MLB_TEAMS.get(team_name)
    if tid is None:
        raise ValueError(f"Unknown team: '{team_name}'")
    return tid


class ScheduleRequest(BaseModel):
    team_name: str
    start_date: date | None = None
    end_date: date | None = None

    def get_date_range(self) -> tuple[date, date]:
        """Return (start, end) dates, defaulting to the last 7 days."""
        end = self.end_date or date.today()
        start = self.start_date or (end - timedelta(days=7))
        return start, end


class GamePlaysRequest(BaseModel):
    game_pk: int


class GameHighlightsRequest(BaseModel):
    game_pk: int
    play_ids: list[str] | None = None
