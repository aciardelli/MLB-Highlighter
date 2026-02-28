from bs4 import BeautifulSoup
from bs4.element import Tag
from typing import Optional
from dataclasses import dataclass


@dataclass
class VideoMetadata:
    video_page_url: str
    mp4_video_url: Optional[str] = None

    description: Optional[str] = None
    count: Optional[str] = None
    batter: Optional[str] = None
    pitcher: Optional[str] = None # pitcher name
    balls: Optional[str] = None # balls in count
    strikes: Optional[str] = None # strikes in count
    pitch_type: Optional[str] = None # pitch type
    pitch_velo: Optional[str] = None # pitch velo
    exit_velo: Optional[str] = None # exit velo
    distance: Optional[str] = None # hit distance
    num_parks: Optional[str] = None # homer in x/30 parks
    matchup: Optional[str] = None # team matchup
    date: Optional[str] = None # date

    # const
    DESCRIPTION_MAP = {
        'Batter:': 'batter',
        'Pitcher:': 'pitcher',
        'Count:': 'count',
        'Pitch Type:': 'pitch_type',
        'Velocity:': 'pitch_velo',
        'Exit Velocity:': 'exit_velo',
        'Hit Distance:': 'distance',
        'HR:': 'num_parks',
        'Matchup:': 'matchup',
        'Date:': 'date'
    }

    def get_video_data(self, soup: BeautifulSoup) -> None:
        data_list = soup.find('div', class_='mod')
        if data_list:
            data_list_items = data_list.find_all('li')
            for data_list_item in data_list_items:
                self.parse_data_list(data_list_item)

    def parse_data_list(self, data_list_item: Tag) -> None:
        strong_element = data_list_item.find('strong')
        if strong_element:
            description = strong_element.get_text(strip=True)
            full_text = data_list_item.get_text(strip=True)
            other_text = full_text.replace(description, '').strip()

            if description in self.DESCRIPTION_MAP:
                field_name = self.DESCRIPTION_MAP[description]
                setattr(self, field_name, other_text)
