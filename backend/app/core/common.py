
import datetime


def base64url_to_base64(s: str) -> str:
    s = s.replace('-', '+').replace('_', '/')
    padding = '=' * (-len(s) % 4)
    return s + padding

def base64url_decode(s: str) -> bytes:
    import base64
    return base64.urlsafe_b64decode(s + '=' * (-len(s) % 4))

def base64url_encode(b: bytes) -> str:
    import base64
    return base64.urlsafe_b64encode(b).decode('utf-8').rstrip('=')

def base64_encode(b: bytes) -> str:
    import base64
    return base64.b64encode(b).decode('utf-8')

def base64_decode(s: str) -> bytes:
    import base64
    return base64.b64decode(s)

def serialize_datetime(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d %H:%M:%S")

def deserialize_datetime(date_string: str) -> datetime:
    return datetime.strptime(date_string, "%Y-%m-%d %H:%M:%S")