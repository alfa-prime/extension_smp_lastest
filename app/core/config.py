from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    GATEWAY_URL: str
    GATEWAY_API_KEY: str
    GATEWAY_REQUEST_ENDPOINT: str

    LOGS_LEVEL: str = "DEBUG"

    CORS_ALLOW_REGEX: str = r"^chrome-extension://[a-z]{32}$"

    REQUEST_TIMEOUT: float = 30.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()  # noqa
