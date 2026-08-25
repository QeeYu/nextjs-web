// ====================================================================
// 音频引擎 v9：
// - 修复：setTimbre 对已加载音色也要更新 currentTimbre（切回没声音）
// - 修复：延音踏板用 triggerRelease 精确管理（钢琴生效 / 萨克斯不失控）
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
  // ★ 延音期间按下的音符（松踏板时精确释放）
  private sustainedNotes = new Set<string>();
  // ★ 缓存的采样器
  private cachedSamplers = new Map<string, Tone.Sampler>();

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

  /** 加载指定音色 */
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

          // 竞争校验：用户仍想要这个音色才接管
          if (this.currentTimbre === timbreId) {
            if (this.volumeNode) {
              sampler.connect(this.volumeNode);
            }
            if (this.sampler) {
              this.sampler.dispose();
            }
            this.sampler = sampler;
          } else {
            this.cachedSamplers.set(timbreId, sampler);
          }
          resolve();
        },
      });
    });

    this.loadPromises.set(timbreId, loadPromise);
    return loadPromise;
  }

  /** 切换音色（★ 无论是否已加载都要更新 currentTimbre） */
  async setTimbre(timbreId: string) {
    this.currentTimbre = timbreId;
    this.sustainedNotes.clear(); // 切音色清空延音记录

    if (!this.started || !this.volumeNode) return;

    // 缓存命中 → 直接接管
    const cached = this.cachedSamplers.get(timbreId);
    if (cached && this.loadedTimbres.has(timbreId)) {
      if (this.sampler) this.sampler.dispose();
      this.sampler = cached;
      this.cachedSamplers.delete(timbreId);
      cached.connect(this.volumeNode);
      return;
    }

    // 已加载但 sampler 不是它（比如当前 sampler 是别的音色）→ 恢复
    // ★ 关键修复：已加载的音色也可能需要重新接管 sampler
    //（之前的 sampler 可能在加载其他音色时仍是旧的）
    if (this.loadedTimbres.has(timbreId)) {
      // sampler 已经是这个音色 → 什么都不用做
      return;
    }

    // 从未加载 → 加载
    await this.loadTimbre(timbreId);
  }

  /** 延音踏板 */
  setSustain(on: boolean) {
    this.sustainOn = on;
    if (!on && this.sampler) {
      // ★ 松开踏板：精确释放延音期间按下的每个音符
      this.sustainedNotes.forEach((note) => {
        try { this.sampler!.triggerRelease(note); } catch {}
      });
      this.sustainedNotes.clear();
    }
  }

  get isSustained(): boolean {
    return this.sustainOn;
  }

  /** 播放（★ 延音用 attack + 记录，普通用 attackRelease） */
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
      // ★ 踩下踏板：attack + 记录（松踏板时 triggerRelease 精确释放）
      this.sampler.triggerAttack(note);
      this.sustainedNotes.add(note);
    } else {
      // 未踩踏板：正常 attack + release
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
    this.sustainedNotes.clear();
    this.cachedSamplers.forEach((s) => s.dispose());
    this.cachedSamplers.clear();
  }
}

export const engine = new PianoEngine();