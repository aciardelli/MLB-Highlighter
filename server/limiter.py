from slowapi import Limiter 
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=["1/minute"])

ai_limit = limiter.shared_limit("100/day", scope="ai_routes")
