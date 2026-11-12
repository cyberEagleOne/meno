import { logger, LogEntry } from "../logger";

describe("Runtime Logging System", () => {
  beforeEach(() => {
    logger.clearLogs();
    logger.setEnvironment(false, "DEBUG");
  });

  it("records application lifecycle startup logs", () => {
    const entry = logger.info("APP_LIFECYCLE", "app_startup", {
      platform: "android",
      version: "1.0.0",
    });

    expect(entry.level).toBe("INFO");
    expect(entry.category).toBe("APP_LIFECYCLE");
    expect(entry.event).toBe("app_startup");
    expect(entry.metadata?.platform).toBe("android");
    expect(entry.timestamp).toBeDefined();

    const recent = logger.getRecentLogs();
    expect(recent.length).toBe(1);
    expect(recent[0].event).toBe("app_startup");
  });

  it("records successful business operations", () => {
    const entry = logger.info("DATABASE", "chapter_completed", {
      bookId: "kejadian",
      chapter: 1,
      totalCompleted: 1,
    });

    expect(entry.level).toBe("INFO");
    expect(entry.category).toBe("DATABASE");
    expect(entry.event).toBe("chapter_completed");
    expect(entry.metadata?.bookId).toBe("kejadian");
  });

  it("records error logs with error details in controlled test scenario", () => {
    const testError = new Error("Simulated network timeout");
    (testError as any).status = 504;

    const entry = logger.error(
      "API_INTEGRATION",
      "daily_verse_fetch_failed",
      testError,
      { endpoint: "https://bible-api.com/john+3:16" },
      "Server unreachable",
    );

    expect(entry.level).toBe("ERROR");
    expect(entry.category).toBe("API_INTEGRATION");
    expect(entry.event).toBe("daily_verse_fetch_failed");
    expect(entry.message).toBe("Server unreachable");
    expect(entry.error?.name).toBe("Error");
    expect(entry.error?.message).toBe("Simulated network timeout");
    expect(entry.error?.status).toBe(504);
  });

  it("redacts sensitive keys (passwords, tokens, pins, secrets)", () => {
    const entry = logger.info("SECURITY_AUTH", "auth_attempt", {
      username: "user123",
      password: "SuperSecretPassword123",
      token: "jwt.secret.token",
      apiKey: "secret-api-key-999",
      pin: "1234",
    });

    expect(entry.metadata?.username).toBe("user123");
    expect(entry.metadata?.password).toBe("[REDACTED]");
    expect(entry.metadata?.token).toBe("[REDACTED]");
    expect(entry.metadata?.apiKey).toBe("[REDACTED]");
    expect(entry.metadata?.pin).toBe("[REDACTED]");
  });

  it("masks personal reflection notes to noteLength", () => {
    const entry = logger.info("FORM_VALIDATION", "reading_goal_submitted", {
      target: 3,
      note: "Saya ingin berkomitmen membaca firman Tuhan setiap pagi.",
      reflectionNote: "Refleksi pribadi yang sangat rahasia",
    });

    expect(entry.metadata?.target).toBe(3);
    expect((entry.metadata as any)?.note).toBeUndefined();
    expect((entry.metadata as any)?.reflectionNote).toBeUndefined();
    expect(entry.metadata?.noteLength).toBe(56);
    expect(entry.metadata?.reflectionNoteLength).toBe(36);
  });

  it("respects log level priority filtering", () => {
    logger.setMinLevel("WARN");

    logger.debug("GENERAL", "debug_message");
    logger.info("GENERAL", "info_message");
    expect(logger.getRecentLogs().length).toBe(0);

    logger.warn("GENERAL", "warn_message");
    expect(logger.getRecentLogs().length).toBe(1);

    logger.error("GENERAL", "error_message");
    expect(logger.getRecentLogs().length).toBe(2);
  });

  it("omits stack traces in production environment mode", () => {
    logger.setEnvironment(true, "INFO");
    const testErr = new Error("Production error");

    const entry = logger.error("DATABASE", "sqlite_error", testErr);

    expect(entry.error?.message).toBe("Production error");
    expect(entry.error?.stack).toBeUndefined();
  });
});

