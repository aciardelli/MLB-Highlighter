from services.SavantMerger import SavantMerger
from services.SavantScraper import SavantScraper
from services.VideoMetadata import VideoMetadata
from services.JobStore import job_store
from models.job import JobStatus, VideoClipMetadata
import aiohttp
import logging

logger = logging.getLogger(__name__)

AIOHTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

async def scrape_and_stream_urls(url: str, job_id: str):
    try:
        job_store.update_status(job_id, JobStatus.PARSING_PAGE)

        connector = aiohttp.TCPConnector(limit=20, limit_per_host=10)
        async with aiohttp.ClientSession(connector=connector, headers=AIOHTTP_HEADERS) as session:
            ss = SavantScraper(url)
            await ss.parse_savant_page(session)

            if not ss.video_data_list:
                job_store.emit_complete(job_id, 0)
                return

            if len(ss.video_data_list) > 100:
                ss.video_data_list = ss.video_data_list[:100]

            job_store.update_status(job_id, JobStatus.STREAMING_URLS)

            async def on_url_resolved(video_data: VideoMetadata, index: int):
                metadata = VideoClipMetadata(
                    batter=video_data.batter,
                    pitcher=video_data.pitcher,
                    pitch_type=video_data.pitch_type,
                    pitch_velo=video_data.pitch_velo,
                    exit_velo=video_data.exit_velo,
                    distance=video_data.distance,
                    date=video_data.date,
                    matchup=video_data.matchup,
                    count=video_data.count,
                )
                job_store.emit_video_url(job_id, video_data.mp4_video_url, index, metadata)

            await ss.get_mp4_links_streaming(session, on_url_resolved)

            job_store.store_video_data(job_id, ss.video_data_list)
            job_store.emit_complete(job_id, len(ss.video_data_list))

    except Exception as e:
        logger.error(f"Streaming scrape failed: {e}")
        job_store.update_status(job_id, JobStatus.FAILED, error_message=e)

async def download_and_merge(video_data_list: list[VideoMetadata], output_path: str, job_id: str):
    try:
        job_store.update_status(job_id, JobStatus.DOWNLOADING_VIDEOS)

        connector = aiohttp.TCPConnector(limit=20, limit_per_host=10)
        async with aiohttp.ClientSession(connector=connector, headers=AIOHTTP_HEADERS) as session:
            sm = SavantMerger(video_data_list, output_path)
            await sm.download_videos(session)

            job_store.update_status(job_id, JobStatus.MERGING_VIDEOS)
            sm.merge_videos()

            job_store.update_status(job_id, JobStatus.COMPLETE, output_path)
    except Exception as e:
        logger.error(f"Download and merge failed: {e}")
        job_store.update_status(job_id, JobStatus.FAILED, error_message=e)

