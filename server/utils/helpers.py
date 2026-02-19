from pybaseball import playerid_lookup
import pandas as pd
import requests
import asyncio

def open_md_file(filename):
    with open(f'context/{filename}', 'r') as file:
        return file.read()

def convert_player_name_to_id(player_name):
    if ',' in player_name:
        last, first = player_name.split(',',1)
        player_df = playerid_lookup(last.strip(), first.strip(), fuzzy=True)
    else:
        player_df = playerid_lookup(player_name.strip(), fuzzy=True)

    if not player_df.empty:
        for index, row in player_df.iterrows():
            # TODO update this
            if str(int(row['mlb_played_last'])) == '2025':
                player_id = str(player_df.iloc[index]['key_mlbam'])
                return player_id

        player_id = str(player_df.iloc[0]['key_mlbam'])
        return player_id 

def get_player_position(player_id):
    url = f'https://statsapi.mlb.com/api/v1/people?personIds={player_id}&hydrate=currentTeam'
    response = requests.get(url).json()

    position = response['people'][0]['primaryPosition']['name']
    return position

def construct_url(params) -> str:
    params = params.model_dump()
    default_link = "https://baseballsavant.mlb.com/statcast_search?"

    for key, value in params.items():
        if key == 'batters_lookup' or key == 'pitchers_lookup':
            for player in value:
                default_link += key + '%5B%5D=' + player + '&'
        elif isinstance(value, str):
            default_link += key + '=' + value.replace(" ", "%5C.%5C.") + '&' 
        elif isinstance(value, list):
            for i in range(len(value)):
                value[i] = value[i].replace(" ", "%5C.%5C.")

            default_link += key + '=' + '%7C'.join(value) 
            if len(value) > 0:
                default_link += '%7C&'
            else:
                default_link += '&'
        else:
            return ""

    default_link = default_link[:-1]
    default_link += '#results'

    return default_link

