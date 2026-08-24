// ====================================================================
// 音频引擎 v6：
// - 9 种乐器，全部从 jsdelivr CDN 加载采样（无本地文件）
// - 惰性加载：切到某音色时才下载该音色的采样
// - FFT 分析器（波形柱状图可视化）
// - 延音踏板：踩下时音符持续振动，松开全部停止（同真钢琴）
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

  // 延音踏板状态
  private sustainOn = false;

  /** 确保 AudioContext 启动（必须在用户手势内） */
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

  /** FFT 分析器（可视化用） */
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

  /** 加载指定音色的采样（CDN，惰性） */
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
          resolve();
        },
      });

      if (this.volumeNode) {
        sampler.connect(this.volumeNode);
      }

      if (this.sampler) {
        this.sampler.dispose();
      }
      this.sampler = sampler;
    });

    this.loadPromises.set(timbreId, loadPromise);
    return loadPromise;
  }

  /** 切换音色（惰性加载 CDN 采样） */
  async setTimbre(timbreId: string) {
    this.currentTimbre = timbreId;

    if (!this.started || !this.volumeNode) {
      return;
    }

    await this.loadTimbre(timbreId);
  }

  /** 设置延音踏板（true = 踩下） */
  setSustain(on: boolean) {
    this.sustainOn = on;
    // 松开踏板 → 立即释放所有正在延音的音符（同真钢琴）
    if (!on && this.sampler) {
      try {
        this.sampler.releaseAll();
      } catch {
        // 兼容：部分版本无 releaseAll
      }
    }
  }

  /** 当前延音踏板是否踩下 */
  get isSustained(): boolean {
    return this.sustainOn;
  }

  /** 播放音符（延音模式下不自动释放） */
  async play(freq: number) {
    if (!(await this.ensure())) return;

    // 懒加载当前音色
    if (!this.loadedTimbres.has(this.currentTimbre)) {
      await this.loadTimbre(this.currentTimbre);
    }

    if (this.sampler) {
      const note = Tone.Frequency(freq, "hz").toNote();
      if (this.sustainOn) {
        // 踩下踏板 → 只 attack 不 release（琴弦持续振动）
        this.sampler.triggerAttack(note);
      } else {
        // 未踩踏板 → 正常 attack + release
        this.sampler.triggerAttackRelease(note, "4n");
      }
    }
  }

  /** 当前音色是否已加载 */
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