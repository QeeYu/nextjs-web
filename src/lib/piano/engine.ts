// ====================================================================
// 音频引擎 v7：
// - 修复：onload 完成前不替换 sampler / 不播放（buffer 未加载崩溃）
// ====================================================================

import * as Tone from "tone";
import { TIMBRE_LIST } from "./constants";

class PianoEngine {
  private sampler: Tone.Sampler | null = null;
  private currentTimbre = "piano";
  private volumeNode: Tone.Volume | null = null;
  private _volume = 0.8;
  private started = false;
  private loadedTimbres = new Set<string>();
  private loadPromises = new Map<string, Promise<void>>();
  private _analyser: Tone.Analyser | null = null;

  private sustainOn = false;

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

  /** 加载指定音色（★ onload 后才连接+替换+标记） */
  private async loadTimbre(timbreId: string): Promise<void> {
    if (this.loadedTimbres.has(timbreId)) return;
    const existing = this.loadPromises.get(timbreId);
    if (existing) return existing;

    const info = TIMBRE_LIST.find((t) => t.id === timbreId);
    if (!info) return;

    const loadPromise = new Promise<void>((resolve) => {
      const urls: Record<string, string> = {};
      for (const [note, file] of Object.entries(info.sampleUrls)) {
        urls[note] = `${info.baseUrl}${file}`;
      }

      const sampler = new Tone.Sampler({
        urls,
        release: 1,
        onload: () => {
          this.loadedTimbres.add(timbreId);
          if (this.volumeNode) {
            sampler.connect(this.volumeNode);
          }
          if (this.sampler) {
            this.sampler.dispose();
          }
          this.sampler = sampler;
          resolve();
        },
      });
    });

    this.loadPromises.set(timbreId, loadPromise);
    return loadPromise;
  }

  /** 切换音色 */
  async setTimbre(timbreId: string) {
    this.currentTimbre = timbreId;
    if (!this.started || !this.volumeNode) return;
    await this.loadTimbre(timbreId);
  }

  /** 延音踏板 */
  setSustain(on: boolean) {
    this.sustainOn = on;
    if (!on && this.sampler) {
      try { this.sampler.releaseAll(); } catch {}
    }
  }

  get isSustained(): boolean {
    return this.sustainOn;
  }

  /** 播放（★ 守卫：未加载完静默跳过） */
  async play(freq: number) {
    if (!(await this.ensure())) return;

    if (!this.loadedTimbres.has(this.currentTimbre)) {
      await this.loadTimbre(this.currentTimbre);
    }

    if (!this.sampler || !this.loadedTimbres.has(this.currentTimbre)) {
      return;
    }

    const note = Tone.Frequency(freq, "hz").toNote();
    if (this.sustainOn) {
      this.sampler.triggerAttack(note);
    } else {
      this.sampler.triggerAttackRelease(note, "4n");
    }
  }

  isTimbreLoaded(timbreId: string): boolean {
    return this.loadedTimbres.has(timbreId);
  }

  get loadedTimbreList(): string[] {
    return Array.from(this.loadedTimbres);
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
    this.sampler?.dispose();
    this.volumeNode?.dispose();
    this._analyser?.dispose();
    this.sampler = null;
    this.volumeNode = null;
    this._analyser = null;
    this.loadedTimbres.clear();
    this.loadPromises.clear();
  }
}

export const engine = new PianoEngine();