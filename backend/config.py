from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.6-flash"
    frontend_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        if not self.frontend_url:
            return ["*"]
        origins = [u.strip() for u in self.frontend_url.split(",") if u.strip()]
        if "http://localhost:5173" not in origins:
            origins.append("http://localhost:5173")
        return origins


settings = Settings()
