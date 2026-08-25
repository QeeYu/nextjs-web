// ====================================================================
// 音频引擎 v14：
// - ★ 超时后清除 loadPromises 记录 → 允许重新点击重试
// - onload 回调驱动（可靠发请求）
// - 每音色独立 sampler（Map 管理）
// - 状态机：idle / loading / ready / timeout
// - 过渡期 play 降级到已就绪音色
// ====================================================================

import * as Tone from "tone";
import { TIMBRE_LIST } from "./constants";

type LoadState = "idle" | "loading" | "ready" | "timeout";

class PianoEngine {
  private samplers = new Map<string, Tone.Sampler>();
  private currentTimbre = "piano";
  private volumeNode: Tone.Volume | null = null;
  private _volume = 0.8;
  private started = false;
  private loadPromises = new Map<string, Promise<void>>();
  private _analyser: Tone.Analyser | null = null;

  private loadStates = new Map<string, LoadState>();

  private sustainOn = false;
  private sustainedNotes = new Set<string>();

  /** 查询音色加载状态 */
  getTimbreState(timbreId: string): LoadState {
    if (this.samplers.has(timbreId)) return "ready";
    return this.loadStates.get(timbreId) ?? "idle";
  }

  /** 确保 AudioContext 启动 */
  private async ensure(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    if (!this.started) {
      try {
        await Tone.start();
        this.started = true;
      } catch {
        return false;
      }
    }
    if (Tone.getContext().state !== "running") {
      try { await Tone.getContext().resume(); } catch {}
    }

    if (!this.volumeNode) {
      this.volumeNode = new Tone.Volume(this._volume * 24 - 24).toDestination();
    }
    return true;
  }

  /** FFT 分析器 */
  getAnalyser(): Tone.Analyser | null {
    if (!this._analyser && this.volumeNode) {
      this._analyser = new Tone.Analyser("fft", 256);
      this.volumeNode.connect(this._analyser);
    }
    return this._analyser;
  }

  getFFTData(): Float32Array | null {
    const analyser = this.getAnalyser();
    if (!analyser) return null;
    return analyser.getValue() as Float32Array;
  }

  /** 加载音色（★ 超时清记录，可重试） */
  private async loadTimbre(timbreId: string): Promise<void> {
    const existing = this.loadPromises.get(timbreId);
    if (existing) return existing;
    if (this.samplers.has(timbreId)) return;

    if (!TIMBRE_LIST || !Array.isArray(TIMBRE_LIST)) {
      console.error("[engine] ❌ TIMBRE_LIST 导入异常");
      return;
    }
    const info = TIMBRE_LIST.find((t) => t.id === timbreId);
    if (!info) {
      console.error("[engine] ❌ 找不到音色:", timbreId);
      this.loadStates.set(timbreId, "timeout");
      return;
    }

    this.loadStates.set(timbreId, "loading");
    console.log(`[engine] 开始加载 ${timbreId} | ${info.baseUrl} | ${Object.keys(info.sampleUrls).length} 个采样`);

    const loadPromise = new Promise<void>((resolve) => {
      const urls: Record<string, string> = {};
      for (const [note, file] of Object.entries(info.sampleUrls)) {
        urls[note] = `${info.baseUrl}${file}`;
      }

      let settled = false;
      const finish = (state: LoadState) => {
        if (settled) return;
        settled = true;
        this.loadStates.set(timbreId, state);
        // ★ 关键：超时/失败时清除记录 → 允许下次重新加载
        if (state === "timeout") {
          this.loadPromises.delete(timbreId);
        }
        resolve();
      };

      // 45s 超时兜底（清除记录，可重试）
      const timeout = setTimeout(() => {
        console.warn(`[engine] ⏰ ${timbreId} 45s 超时（可重试）`);
        finish("timeout");
      }, 45000);

      const sampler = new Tone.Sampler({
        urls,
        release: 1,
        onload: () => {
          clearTimeout(timeout);
          if (this.volumeNode) {
            try { sampler.connect(this.volumeNode); } catch {}
          }
          this.samplers.set(timbreId, sampler);
          console.log(`[engine] ✓ ${timbreId} 就绪`);
          finish("ready");
        },
      });
    });

    this.loadPromises.set(timbreId, loadPromise);
    return loadPromise;
  }

  /** 切换音色（无条件发起加载） */
  async setTimbre(timbreId: string): Promise<void> {
    this.currentTimbre = timbreId;
    this.sustainedNotes.clear();

    if (!this.samplers.has(timbreId) && !this.loadPromises.has(timbreId)) {
      void this.loadTimbre(timbreId);
    }
  }

  /** 延音踏板 */
  setSustain(on: boolean) {
    this.sustainOn = on;
    if (!on) {
      this.sustainedNotes.forEach((note) => {
        this.samplers.forEach((s) => {
          try { s.triggerRelease(note); } catch {}
        });
      });
      this.sustainedNotes.clear();
    }
  }

  get isSustained(): boolean {
    return this.sustainOn;
  }

  /** 播放（过渡期降级） */
  async play(freq: number) {
    if (!(await this.ensure())) return;

    if (this.volumeNode) {
      this.samplers.forEach((s) => {
        try { s.connect(this.volumeNode!); } catch {}
      });
    }

    if (!this.samplers.has(this.currentTimbre) && !this.loadPromises.has(this.currentTimbre)) {
      void this.loadTimbre(this.currentTimbre);
    }

    const target = this.samplers.get(this.currentTimbre);
    const sampler = target ?? this.anyReadySampler();
    if (!sampler) return;

    const note = Tone.Frequency(freq, "hz").toNote();
    if (this.sustainOn) {
      sampler.triggerAttack(note);
      this.sustainedNotes.add(note);
    } else {
      sampler.triggerAttackRelease(note, "4n");
    }
  }

  private anyReadySampler(): Tone.Sampler | null {
    for (const s of this.samplers.values()) return s;
    return null;
  }

  isTimbreLoaded(timbreId: string): boolean {
    return this.samplers.has(timbreId);
  }

  get loadedTimbreList(): string[] {
    return Array.from(this.samplers.keys());
  }

  get timbre(): string {
    return this.currentTimbre;
  }

  setVolume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.volumeNode) {
      this.volumeNode.volume.value = this._volume * 24 - 24;
    }
  }

  get volume(): number {
    return this._volume;
  }

  dispose() {
    this.samplers.forEach((s) => s.dispose());
    this.samplers.clear();
    this.volumeNode?.dispose();
    this._analyser?.dispose();
    this.volumeNode = null;
    this._analyser = null;
    this.loadPromises.clear();
    this.loadStates.clear();
    this.sustainedNotes.clear();
  }
}

export const engine = new PianoEngine();