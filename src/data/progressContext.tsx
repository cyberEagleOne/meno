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

import {
  localDayKey,
  withCompletion,
  withReadingDay,
  type LastRead,
  type ProgressState,
} from "../domain/progress";
import { initProgressDb, loadProgress, markCompleted, saveLastRead, unmarkCompleted } from "./db";
import { setSqlDriver } from "./sqlDriver";
import { createExpoSqliteDriver } from "./sqliteDriver";

export type ProgressStatus = "loading" | "ready" | "error";

interface ProgressValue extends ProgressState {
  status: ProgressStatus;
  /** Updates last-read only; opening a chapter never marks it completed. */
  openChapter: (bookId: string, chapter: number) => void;
  /** Debounced scroll persistence; ignored if last-read has since changed. */
  saveScroll: (bookId: string, chapter: number, scrollY: number) => void;
  /** Explicit, idempotent completion toggle (per chapter, per local date). */
  setCompleted: (bookId: string, chapter: number, done: boolean) => Promise<void>;
  retry: () => void;
}

const EMPTY: ProgressState = { lastRead: null, completed: {}, readingDays: [] };

const ProgressContext = createContext<ProgressValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(EMPTY);
  const [status, setStatus] = useState<ProgressStatus>("loading");
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  const bootstrapped = useRef(false);
  const completionWrites = useRef(new Set<string>());

  const runLoad = useCallback(() => {
    (async () => {
      if (!bootstrapped.current) {
        setSqlDriver(await createExpoSqliteDriver());
        await initProgressDb();
        bootstrapped.current = true;
      }
      return loadProgress();
    })()
      .then((next) => {
        if (!mounted.current) return;
        setState(next);
        setStatus("ready");
      })
      .catch(() => {
        if (mounted.current) setStatus("error");
      });
  }, []);

  const retry = useCallback(() => {
    setStatus("loading");
    runLoad();
  }, [runLoad]);

  useEffect(() => {
    mounted.current = true;
    // Status already starts as "loading"; async results arrive later.
    runLoad();
    return () => {
      mounted.current = false;
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, [runLoad]);

  const openChapter = useCallback((bookId: string, chapter: number) => {
    setState((s) => {
      const same = s.lastRead?.bookId === bookId && s.lastRead.chapter === chapter;
      const next: LastRead = {
        bookId,
        chapter,
        scrollY: same ? s.lastRead!.scrollY : 0,
        openedAt: new Date().toISOString(),
      };
      saveLastRead(next).catch(() => {
        /* persistence failure must not block reading */
      });
      return { ...s, lastRead: next };
    });
  }, []);

  const saveScroll = useCallback((bookId: string, chapter: number, scrollY: number) => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      setState((s) => {
        if (!s.lastRead || s.lastRead.bookId !== bookId || s.lastRead.chapter !== chapter) return s;
        const next: LastRead = { ...s.lastRead, scrollY };
        saveLastRead(next).catch(() => {});
        return { ...s, lastRead: next };
      });
    }, 500);
  }, []);

  const setCompleted = useCallback(async (bookId: string, chapter: number, done: boolean) => {
    const key = `${bookId}:${chapter}`;
    if (completionWrites.current.has(key)) {
      throw new Error("A completion update is already in progress");
    }
    completionWrites.current.add(key);
    try {
      const now = new Date();
      const day = localDayKey(now);
      if (done) {
        await markCompleted(bookId, chapter, now.toISOString(), day);
      } else {
        await unmarkCompleted(bookId, chapter);
      }
      if (!mounted.current) return;
      setState((s) => ({
        ...s,
        completed: withCompletion(s.completed, bookId, chapter, done, now),
        // Reading days are historical: undo never removes an earned day.
        readingDays: done ? withReadingDay(s.readingDays, day) : s.readingDays,
      }));
    } finally {
      completionWrites.current.delete(key);
    }
  }, []);

  const value = useMemo<ProgressValue>(
    () => ({ ...state, status, openChapter, saveScroll, setCompleted, retry }),
    [state, status, openChapter, saveScroll, setCompleted, retry],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used within ProgressProvider");
  }
  return ctx;
}
