import os
import shutil
import subprocess
from typing import Optional, List
import logging
import asyncio
import aiofiles
import aiohttp

from services.VideoMetadata import VideoMetadata

logger = logging.getLogger(__name__)

# constants
DEFAULT_OUTPUT = 'merged.mp4'


class SavantMerger:
    def __init__(self, video_data_list: List[VideoMetadata], output_path: str):
        self.output_path = output_path
        self.output_temp_path = os.path.splitext(self.output_path)[0]
        self.video_data_list = video_data_list
        self.temp_files = []

        if not os.path.exists(self.output_temp_path):
            os.makedirs(self.output_temp_path, exist_ok=True)

    # download videos from mp4 links
    async def download_videos(self, session: aiohttp.ClientSession) -> None:
        async def download_video(session: aiohttp.ClientSession, i: int, video_data: VideoMetadata) -> Optional[str]:
            temp_filename = f"temp_video_{i}.mp4"
            try:
                async with session.get(video_data.mp4_video_url) as response:
                    response.raise_for_status()
                    temp_filename_path = os.path.join(self.output_temp_path, temp_filename)
                    async with aiofiles.open(temp_filename_path, 'wb') as f:
                        async for chunk in response.content.iter_chunked(262144):
                            await f.write(chunk)

                return temp_filename
            except Exception as e:
                logger.error(f"Failed to download {video_data.mp4_video_url}: {e}")
                return None

        logger.info(f"Downloading {len(self.video_data_list)} videos...")
        tasks = [download_video(session, i, video_data) for i, video_data in enumerate(self.video_data_list)]
        self.temp_files = await asyncio.gather(*tasks)

        self.temp_files = [f for f in self.temp_files if f is not None]

        if not self.temp_files:
            raise RuntimeError("All video downloads failed — no files to merge")

    # merge downloaded videos
    def merge_videos(self) -> None:
        logger.info("Merging videos...")
        try:
            filelist = 'filelist.txt'
            filelist_path = os.path.join(self.output_temp_path, filelist)
            with open(filelist_path, 'w') as f:
                for temp_file in self.temp_files:
                    f.write(f'file {temp_file}\n')

            cmd = [
                'ffmpeg',
                '-f', 'concat',
                '-safe', '0',
                '-i', filelist_path,
                '-c', 'copy',
                self.output_path,
                '-y',
            ]

            subprocess.run(cmd, check=True, cwd=self.output_temp_path)
            logger.info(f"Merged video saved as: {self.output_path}")

        except Exception as e:
            logger.error(f"FFmpeg merge failed: {e}")
            raise
        finally:
            if os.path.exists(self.output_temp_path):
                try:
                    shutil.rmtree(self.output_temp_path)
                except OSError as e:
                    logger.error(f"Unable to remove {self.output_temp_path} directory.")
