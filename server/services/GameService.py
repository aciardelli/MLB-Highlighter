import aiohttp
import logging

logger = logging.getLogger(__name__)

MLB_API_BASE = "https://statsapi.mlb.com"
SPORTY_VIDEO_BASE = "https://baseballsavant.mlb.com/sporty-videos"


async def fetch_schedule(session: aiohttp.ClientSession, team_id: int, start_date: str, end_date: str) -> list[dict]:
    """Fetch MLB schedule for a team over a date range."""
    url = f"{MLB_API_BASE}/api/v1/schedule?sportId=1&teamId={team_id}&startDate={start_date}&endDate={end_date}"

    async with session.get(url) as response:
        response.raise_for_status()
        data = await response.json()

    games = []
    for date_entry in reversed(data.get("dates", [])):
        game_date = date_entry.get("date")
        for game in date_entry.get("games", []):
            games.append({
                "game_pk": game["gamePk"],
                "date": game_date,
                "teams": {
                    "away": {
                        "id": game["teams"]["away"]["team"]["id"],
                        "name": game["teams"]["away"]["team"]["name"],
                        "score": game["teams"]["away"].get("score"),
                    },
                    "home": {
                        "id": game["teams"]["home"]["team"]["id"],
                        "name": game["teams"]["home"]["team"]["name"],
                        "score": game["teams"]["home"].get("score"),
                    },
                },
                "venue": game.get("venue", {}).get("name"),
                "status": game.get("status", {}).get("detailedState"),
            })

    return games


async def fetch_game_plays(session: aiohttp.ClientSession, game_pk: int) -> dict:
    """Fetch all plays from a game and parse into structured data."""
    url = f"{MLB_API_BASE}/api/v1.1/game/{game_pk}/feed/live"

    async with session.get(url) as response:
        response.raise_for_status()
        data = await response.json()

    game_data = data.get("gameData", {})
    teams = game_data.get("teams", {})
    away_team = {
        "id": teams.get("away", {}).get("id"),
        "name": teams.get("away", {}).get("name"),
    }
    home_team = {
        "id": teams.get("home", {}).get("id"),
        "name": teams.get("home", {}).get("name"),
    }

    all_plays = data.get("liveData", {}).get("plays", {}).get("allPlays", [])

    plays = []
    event_types = set()

    for at_bat in all_plays:
        result = at_bat.get("result", {})
        # Skip incomplete at-bats (no event means still in progress)
        if not result.get("event"):
            continue

        play_events = at_bat.get("playEvents", [])
        if not play_events:
            continue

        # The last playEvent has the result play's playId
        last_event = play_events[-1]
        play_id = last_event.get("playId")
        if not play_id:
            continue

        matchup = at_bat.get("matchup", {})
        about = at_bat.get("about", {})
        half_inning = about.get("halfInning", "")

        # Determine batting team from half inning
        batting_team_id = away_team["id"] if half_inning == "top" else home_team["id"]

        event_type = result.get("eventType", "")
        if event_type:
            event_types.add(event_type)

        plays.append({
            "inning": about.get("inning"),
            "half_inning": half_inning,
            "batter": {
                "name": matchup.get("batter", {}).get("fullName"),
                "id": matchup.get("batter", {}).get("id"),
            },
            "pitcher": {
                "name": matchup.get("pitcher", {}).get("fullName"),
                "id": matchup.get("pitcher", {}).get("id"),
            },
            "event": result.get("event"),
            "event_type": event_type,
            "description": result.get("description"),
            "play_id": play_id,
            "is_scoring_play": about.get("isScoringPlay", False),
            "batting_team_id": batting_team_id,
        })

    # Count unique innings
    inning_count = max((p["inning"] for p in plays), default=0)

    return {
        "game_pk": game_pk,
        "away_team": away_team,
        "home_team": home_team,
        "plays": plays,
        "event_types": sorted(event_types),
        "inning_count": inning_count,
        "total_plays": len(plays),
    }


def get_sporty_video_url(play_id: str) -> str:
    """Build sporty-videos URL from a play ID."""
    return f"{SPORTY_VIDEO_BASE}?playId={play_id}"
