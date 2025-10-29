from cryptography.hazmat.primitives.asymmetric import x25519
from cryptography.hazmat.primitives import serialization
import base64
import secrets

# Generate X25519 key pair
private_key = x25519.X25519PrivateKey.generate()
public_key = private_key.public_key()

# Serialize to bytes
private_bytes = private_key.private_bytes(
    encoding=serialization.Encoding.Raw,
    format=serialization.PrivateFormat.Raw,
    encryption_algorithm=serialization.NoEncryption()
)
public_bytes = public_key.public_bytes(
    encoding=serialization.Encoding.Raw,
    format=serialization.PublicFormat.Raw
)

# Encode to URL-safe base64 (matching libsodium format)
server_key = base64.urlsafe_b64encode(private_bytes).decode('utf-8').rstrip('=')
vite_server_public_key = base64.urlsafe_b64encode(public_bytes).decode('utf-8').rstrip('=')

# Generate random API secret for JWT
api_secret_key = secrets.token_urlsafe(32)  # 32 bytes of random data, URL-safe

# Output for env files
print(f"SERVER_KEY={server_key}")
print(f"VITE_SERVER_PUBLIC_KEY={vite_server_public_key}")
print(f"API_SECRET_KEY={api_secret_key}")