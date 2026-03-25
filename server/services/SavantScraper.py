from bs4 import BeautifulSoup
from bs4.element import ResultSet
from typing import Optional, List
from dataclasses import dataclass
import logging
import asyncio
import aiohttp

from services.VideoMetadata import VideoMetadata

logger = logging.getLogger(__name__)

# constants
BASE_URL = 'https://baseballsavant.mlb.com'


# Savant Search Section
@dataclass
class SearchSection:
    player_id: Optional[str] = None
    month: Optional[str] = None
    year: Optional[str] = None
    game_date: Optional[str] = None
    game_pk: Optional[str] = None
    pitch_type: Optional[str] = None
    play_id: Optional[str] = None
    group_by: Optional[str] = None


class SavantScraper:
    def __init__(self, url: str):
        self.url = url
        self.search_section_list = [] # all search sections loaded
        self.video_data_list = [] # video metadata

    async def load_page(self, session: aiohttp.ClientSession, url: str) -> Optional[BeautifulSoup]:
        """helper function to asyncly load pages"""
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                response.raise_for_status()
                html_content = await response.text()
                soup = BeautifulSoup(html_content, 'html.parser')
                return soup
        except aiohttp.ClientError as e:
            logger.error(f"Failed to load page {url}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error loading {url}: {e}")
            return None

    # parses all search section rows
    def parse_search_rows(self, rows: ResultSet) -> None:
        for row in rows:
            player_id = row.get('data-player-id')
            month = row.get('data-month')
            year = row.get('data-year')
            game_date = row.get('data-game-date')
            game_pk = row.get('data-game-pk')
            pitch_type = row.get('data-pitch-type')
            play_id = row.get('data-play-id')
            group_by = row.get('data-group-by')
            search_section = SearchSection(player_id, month, year, game_date, game_pk, pitch_type, play_id, group_by)
            self.search_section_list.append(search_section)

    # compile url
    def compile_url(self, url: str, savant_section: SearchSection) -> Optional[str]:
        video_details_url = url[:-8] + '&type=details'
        GROUP_BY_PARAMS = {
            ('name', 'team', 'venue'): f'&player_id={savant_section.player_id}',
            ('name-date', 'team-date'): f'&player_id={savant_section.player_id}&ep_game_date={savant_section.game_date}&ep_game_pk={savant_section.game_pk}',
            ('name-month', 'team-month'): f'&player_id={savant_section.player_id}&ep_game_month={savant_section.month}',
            ('name-year', 'team-year'): f'&player_id={savant_section.player_id}&ep_game_year={savant_section.year}',
            ('name-month-year', 'team-month-year'): f'&player_id={savant_section.player_id}&ep_game_month={savant_section.month}&ep_game_year={savant_section.year}',
            ('name-event', 'team-event'): f'&player_id={savant_section.player_id}&play_guid={savant_section.play_id}',
            ('pitch-type', 'team-pitch-type'): f'&player_id={savant_section.player_id}&ep_pitch_type={savant_section.pitch_type}'
        }

        for group_types, params in GROUP_BY_PARAMS.items():
            if savant_section.group_by in group_types:
                return video_details_url + params

        return None

    # get url of each individual video page - mp4 needs to be grabbed from this url
    async def get_video_page_urls(self, session: aiohttp.ClientSession) -> None:
        search_section_video_urls = [self.compile_url(self.url, s) for s in self.search_section_list]
        search_section_video_urls = [u for u in search_section_video_urls if u]

        async def fetch_links(url: str) -> List[str]:
            soup = await self.load_page(session, url)
            if soup is None:
                return []
            return [BASE_URL + link.get('href') for link in soup.find_all('a', href=True) if link.get('href')]


        results = await asyncio.gather(*[fetch_links(url) for url in search_section_video_urls])
        for video_urls in results:
            for url in video_urls:
                self.video_data_list.append(VideoMetadata(video_page_url=url))

    # get all search sections on savant page and their individual video page urls
    async def parse_savant_page(self, session: aiohttp.ClientSession) -> None:
        logger.info("Loading BaseballSavant query...")
        soup = await self.load_page(session, self.url)
        if soup is None:
            raise RuntimeError(f"Failed to load main Baseball Savant page: {self.url}")

        table_rows = soup.find_all('tr', class_='search_row default-table-row')
        if not table_rows:
            logger.warning("No search result rows found")
            return

        self.parse_search_rows(table_rows)
        if not self.search_section_list:
            logger.warning("No valid search sections parsed")
            return

        logger.info(f"Parsed {len(self.search_section_list)} search sections")

        await self.get_video_page_urls(session)
        if not self.video_data_list:
            logger.warning(f"No video URLs found")
            return

        logger.info(f"Found {len(self.video_data_list)} video URLs")

    async def get_mp4_links_streaming(self, session: aiohttp.ClientSession, callback, reverse: bool = True) -> None:
        """Resolve mp4 links one at a time with limited concurrency, calling callback for each valid URL."""
        semaphore = asyncio.Semaphore(3)

        ordered_list = list(reversed(self.video_data_list)) if reverse else self.video_data_list

        async def fetch_and_emit(video_data: VideoMetadata, index: int):
            async with semaphore:
                try:
                    soup = await self.load_page(session, video_data.video_page_url)
                    if soup is None:
                        logger.warning(f"Failed to load video page: {video_data.video_page_url}")
                        return

                    video_data.get_video_data(soup)

                    video_element = soup.find('video')
                    if not video_element:
                        logger.warning(f"No video element found on page: {video_data.video_page_url}")
                        return

                    source_element = video_element.find('source')
                    if not source_element:
                        logger.warning(f"No source element found on page: {video_data.video_page_url}")
                        return

                    mp4_link = source_element.get('src')
                    if not mp4_link:
                        logger.warning(f"No mp4 link found on page: {video_data.video_page_url}")
                        return

                    video_data.mp4_video_url = str(mp4_link)
                    await callback(video_data, index)
                except Exception as e:
                    logger.error(f"Error processing video: {video_data.video_page_url}: {e}")

        tasks = [fetch_and_emit(vd, i) for i, vd in enumerate(ordered_list)]
        await asyncio.gather(*tasks)

        # Update video_data_list with valid results in chronological order
        self.video_data_list = [vd for vd in ordered_list if vd.mp4_video_url]
        logger.info(f"{len(self.video_data_list)} videos streamed successfully")


def valid_url(url: str) -> bool:
    if url.startswith('https://baseballsavant.mlb.com/statcast_search'):
        return True
    return False
