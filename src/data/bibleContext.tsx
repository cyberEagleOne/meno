import type * as SQLite from "expo-sqlite";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { Chapter } from "../domain/types";
import type { DailyVerse } from "../domain/dailyVerse";
import { logger } from "../services/logger";
import { loadBibleMetadata, loadChapter, loadDailyVerse, openBibleDatabase, type LoadedBible } from "./bibleRepository";

export type BibleStatus = "loading" | "ready" | "error";

interface BibleValue {
  bible: LoadedBible | null;
  status: BibleStatus;
  error: string | null;
  retry: () => void;
  getChapter: (bookId: string, chapterNumber: number) => Promise<Chapter | null>;
  getDailyVerse: (localDateKey: string) => Promise<DailyVerse | null>;
}

const BibleContext = createContext<BibleValue | null>(null);

export function BibleProvider({ children }: { children: ReactNode }) {
  const [bible, setBible] = useState<LoadedBible | null>(null);
  const [status, setStatus] = useState<BibleStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const dbRef = useRef<SQLite.SQLiteDatabase | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let cancelled = false;

    (async () => {
      setStatus("loading");
      setError(null);
      try {
        const db = await openBibleDatabase();
        if (cancelled || !mounted.current) {
          await db.closeAsync();
          return;
        }
        dbRef.current = db;
        const loaded = await loadBibleMetadata(db);
        if (cancelled || !mounted.current) return;
        setBible(loaded);
        setStatus("ready");
      } catch (err: unknown) {
        logger.error("BIBLE", "database_bootstrap_failed", err);
        if (cancelled || !mounted.current) return;
        setError(err instanceof Error ? err.message : "Buku Kitab Suci belum bisa dimuat.");
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      mounted.current = false;
    };
  }, [attempt]);

  useEffect(() => {
    return () => {
      const db = dbRef.current;
      dbRef.current = null;
      if (db) db.closeAsync().catch(() => {});
    };
  }, []);

  const retry = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);

  const getChapter = useCallback(async (bookId: string, chapterNumber: number) => {
    const db = dbRef.current;
    if (!db) throw new Error("Bible database is not ready.");
    return loadChapter(db, bookId, chapterNumber);
  }, []);

  const getDailyVerse = useCallback(async (localDateKey: string) => {
    const db = dbRef.current;
    if (!db) throw new Error("Bible database is not ready.");
    return loadDailyVerse(db, localDateKey);
  }, []);

  const value = useMemo<BibleValue>(
    () => ({ bible, status, error, retry, getChapter, getDailyVerse }),
    [bible, status, error, retry, getChapter, getDailyVerse],
  );

  return <BibleContext.Provider value={value}>{children}</BibleContext.Provider>;
}

export function useBible(): BibleValue {
  const ctx = useContext(BibleContext);
  if (!ctx) {
    throw new Error("useBible must be used within BibleProvider");
  }
  return ctx;
}

/** For screens rendered behind BibleGate, where metadata is guaranteed ready. */
export function useBibleData(): LoadedBible {
  const { bible } = useBible();
  if (!bible) {
    throw new Error("Bible metadata is not ready.");
  }
  return bible;
}
