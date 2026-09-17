from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    convai_api_key: str = ""
    convai_character_id: str = ""
    frontend_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
