// GameScene.ts — Phaser top-down tactical shooter — Vertical slice 1-5 + hostages + mines + cover + 30 phase configs
import Phaser from "phaser";
import { useGameStore } from "@/store/useGameStore";

const TILE = 48;
const C_GRASS = 0x4a7c2e, C_SOLDIER = 0x33cc33;
const C_ENEMY = 0xcc3333, C_EXTRACTION = 0xffdd00, C_BULLET = 0xffff00;
const C_TARGET = 0xffffff;
const NAMES = ["Razor","Ghost","Tank","Hawk","Wolf","Ace","Blade","Storm","Fox","Bear","Snake","Eagle","Reaper","Viper","Phoenix","Cobra"];

// ============================================================
// AUDIO — Procedural Web Audio (no binary assets needed)
// ============================================================
class AudioFX {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  enabled = true;

  private ensure() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.3;
        this.master.connect(this.ctx.destination);
      } catch { this.enabled = false; }
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  shoot() {
    const ctx = this.ensure(); if (!ctx || !this.master || !this.enabled) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "square"; o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    o.connect(g).connect(this.master); o.start(); o.stop(ctx.currentTime + 0.1);
  }

  hit() {
    const ctx = this.ensure(); if (!ctx || !this.master || !this.enabled) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sawtooth"; o.frequency.setValueAtTime(200, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.08);
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    o.connect(g).connect(this.master); o.start(); o.stop(ctx.currentTime + 0.08);
  }

  explosion() {
    const ctx = this.ensure(); if (!ctx || !this.master || !this.enabled) return;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const g = ctx.createGain(); g.gain.value = 0.4;
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 800;
    src.connect(f).connect(g).connect(this.master); src.start();
  }

  victory() {
    const ctx = this.ensure(); if (!ctx || !this.master || !this.enabled) return;
    [523, 659, 784, 1047].forEach((freq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "triangle"; o.frequency.value = freq;
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.12 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
      o.connect(g).connect(this.master!); o.start(ctx.currentTime + i * 0.12); o.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  }

  soldierHit() {
    const ctx = this.ensure(); if (!ctx || !this.master || !this.enabled) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(440, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    o.connect(g).connect(this.master); o.start(); o.stop(ctx.currentTime + 0.15);
  }

  soldierDeath() {
    const ctx = this.ensure(); if (!ctx || !this.master || !this.enabled) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sawtooth"; o.frequency.setValueAtTime(300, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o.connect(g).connect(this.master); o.start(); o.stop(ctx.currentTime + 0.5);
  }
}
const audio = new AudioFX();

// ============================================================
// PHASE DATA
// ============================================================
type ObjectiveType = "extract" | "kill_all" | "kill_then_extract";

interface PhaseData {
  name: string;
  world: number;
  timeTarget: number;
  enemyCount: number;
  extraction: { x: number; y: number };
  enemies: { x: number; y: number }[];
  objective: ObjectiveType;
  enemyType: "target" | "soldier" | "elite";
  mines?: { x: number; y: number }[];
  hostages?: { x: number; y: number }[];
}

function genEnemies(count: number, seed: number): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 9301 + 49297) % 233280;
    const x = 4 + Math.floor((s / 233280) * 22);
    s = (s * 9301 + 49297) % 233280;
    const y = 3 + Math.floor((s / 233280) * 14);
    out.push({ x, y });
  }
  return out;
}

const PHASES: Record<number, PhaseData> = {
  1: { name: "Acorda, Soldado!", world: 1, timeTarget: 30, enemyCount: 0, extraction: {x:26,y:7}, enemies: [], objective: "extract", enemyType: "target" },
  2: { name: "Tiro ao Alvo", world: 1, timeTarget: 45, enemyCount: 8, extraction: {x:28,y:17}, enemies: genEnemies(8, 11), objective: "kill_then_extract", enemyType: "target" },
  3: { name: "Floresta Silenciosa", world: 1, timeTarget: 60, enemyCount: 6, extraction: {x:27,y:18}, enemies: genEnemies(6, 23), objective: "kill_then_extract", enemyType: "soldier" },
  4: { name: "Nao Me Pise!", world: 1, timeTarget: 75, enemyCount: 5, extraction: {x:26,y:16}, enemies: genEnemies(5, 37), objective: "kill_then_extract", enemyType: "soldier", mines: [{x:8,y:8},{x:14,y:5},{x:18,y:12},{x:10,y:14},{x:20,y:6},{x:6,y:12},{x:22,y:10}] },
  5: { name: "Resgate na Selva", world: 1, timeTarget: 90, enemyCount: 8, extraction: {x:28,y:18}, enemies: genEnemies(8, 41), objective: "kill_then_extract", enemyType: "soldier", hostages: [{x:14,y:6},{x:20,y:10},{x:8,y:14}] },
  6: { name: "General Gorila", world: 1, timeTarget: 120, enemyCount: 12, extraction: {x:27,y:17}, enemies: genEnemies(12, 53), objective: "kill_then_extract", enemyType: "soldier" },
  7: { name: "Areias Ardentes", world: 2, timeTarget: 90, enemyCount: 10, extraction: {x:26,y:18}, enemies: genEnemies(10, 67), objective: "kill_then_extract", enemyType: "soldier" },
  8: { name: "Comboio Blindado", world: 2, timeTarget: 100, enemyCount: 12, extraction: {x:28,y:17}, enemies: genEnemies(12, 71), objective: "kill_then_extract", enemyType: "soldier" },
  9: { name: "Oasis Sangrento", world: 2, timeTarget: 80, enemyCount: 10, extraction: {x:27,y:16}, enemies: genEnemies(10, 83), objective: "kill_then_extract", enemyType: "soldier" },
  10: { name: "Torres Gemeas", world: 2, timeTarget: 110, enemyCount: 14, extraction: {x:28,y:18}, enemies: genEnemies(14, 97), objective: "kill_then_extract", enemyType: "soldier" },
  11: { name: "Campo Minado", world: 2, timeTarget: 120, enemyCount: 8, extraction: {x:26,y:17}, enemies: genEnemies(8, 103), objective: "kill_then_extract", enemyType: "soldier" },
  12: { name: "Sultao dos Misseis", world: 2, timeTarget: 150, enemyCount: 16, extraction: {x:27,y:18}, enemies: genEnemies(16, 113), objective: "kill_then_extract", enemyType: "soldier" },
  13: { name: "Nevasca", world: 3, timeTarget: 120, enemyCount: 14, extraction: {x:26,y:18}, enemies: genEnemies(14, 127), objective: "kill_then_extract", enemyType: "elite" },
  14: { name: "Lagos Congelados", world: 3, timeTarget: 130, enemyCount: 12, extraction: {x:28,y:17}, enemies: genEnemies(12, 131), objective: "kill_then_extract", enemyType: "elite" },
  15: { name: "Base Subterranea", world: 3, timeTarget: 140, enemyCount: 16, extraction: {x:27,y:16}, enemies: genEnemies(16, 137), objective: "kill_then_extract", enemyType: "elite" },
  16: { name: "Avalanche", world: 3, timeTarget: 90, enemyCount: 14, extraction: {x:26,y:17}, enemies: genEnemies(14, 149), objective: "kill_then_extract", enemyType: "elite" },
  17: { name: "Sinais de Fumaca", world: 3, timeTarget: 150, enemyCount: 12, extraction: {x:28,y:18}, enemies: genEnemies(12, 151), objective: "kill_then_extract", enemyType: "elite" },
  18: { name: "O Colosso de Gelo", world: 3, timeTarget: 180, enemyCount: 18, extraction: {x:27,y:18}, enemies: genEnemies(18, 157), objective: "kill_then_extract", enemyType: "elite" },
  19: { name: "Rios de Lava", world: 4, timeTarget: 140, enemyCount: 16, extraction: {x:26,y:18}, enemies: genEnemies(16, 163), objective: "kill_then_extract", enemyType: "elite" },
  20: { name: "Prisao da Montanha", world: 4, timeTarget: 150, enemyCount: 18, extraction: {x:28,y:17}, enemies: genEnemies(18, 167), objective: "kill_then_extract", enemyType: "elite" },
  21: { name: "Emboscada no Desfiladeiro", world: 4, timeTarget: 160, enemyCount: 20, extraction: {x:27,y:16}, enemies: genEnemies(20, 173), objective: "kill_then_extract", enemyType: "elite" },
  22: { name: "Arsenal Secreto", world: 4, timeTarget: 130, enemyCount: 16, extraction: {x:26,y:17}, enemies: genEnemies(16, 179), objective: "kill_then_extract", enemyType: "elite" },
  23: { name: "A Horda", world: 4, timeTarget: 180, enemyCount: 24, extraction: {x:28,y:18}, enemies: genEnemies(24, 181), objective: "kill_then_extract", enemyType: "elite" },
  24: { name: "General Magma", world: 4, timeTarget: 200, enemyCount: 22, extraction: {x:27,y:18}, enemies: genEnemies(22, 191), objective: "kill_then_extract", enemyType: "elite" },
  25: { name: "Muralhas do Inimigo", world: 5, timeTarget: 180, enemyCount: 20, extraction: {x:26,y:18}, enemies: genEnemies(20, 193), objective: "kill_then_extract", enemyType: "elite" },
  26: { name: "Labirinto", world: 5, timeTarget: 200, enemyCount: 18, extraction: {x:28,y:17}, enemies: genEnemies(18, 197), objective: "kill_then_extract", enemyType: "elite" },
  27: { name: "Traicao", world: 5, timeTarget: 150, enemyCount: 16, extraction: {x:27,y:16}, enemies: genEnemies(16, 199), objective: "kill_then_extract", enemyType: "elite" },
  28: { name: "Carga Explosiva", world: 5, timeTarget: 120, enemyCount: 18, extraction: {x:26,y:17}, enemies: genEnemies(18, 211), objective: "kill_then_extract", enemyType: "elite" },
  29: { name: "Ultima Resistencia", world: 5, timeTarget: 240, enemyCount: 28, extraction: {x:28,y:18}, enemies: genEnemies(28, 223), objective: "kill_then_extract", enemyType: "elite" },
  30: { name: "O Alto Comando", world: 5, timeTarget: 300, enemyCount: 30, extraction: {x:27,y:18}, enemies: genEnemies(30, 227), objective: "kill_then_extract", enemyType: "elite" },
};

const STAKING_REQ: Record<number, number> = { 1: 0, 2: 0, 3: 100, 4: 250, 5: 500 };
const BASE_REWARDS: Record<number, number> = { 1: 10, 2: 25, 3: 50, 4: 100, 5: 250 };
const WORLD_NAMES: Record<number, string> = { 1: "Recruta", 2: "Cabo", 3: "Sargento", 4: "Tenente", 5: "Comandante" };
const SOLDIER_MAX_HP = 5;

export class GameScene extends Phaser.Scene {
  private squad: Phaser.GameObjects.Container[] = [];
  private enemies: Phaser.GameObjects.Container[] = [];
  private enemyHealthBars: Phaser.GameObjects.Rectangle[] = [];
  private soldierHealthBars: Phaser.GameObjects.Rectangle[] = [];
  private moveTarget: { x: number; y: number } | null = null;
  private extractionPos = { x: 0, y: 0 };
  private phaseId = 1;
  private phaseData!: PhaseData;
  private startTime = 0;
  private kills = 0;
  private enemiesKilled = 0;
  private gameOver = false;
  private objectiveComplete = false;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private clockText!: Phaser.GameObjects.Text;
  private objectiveText!: Phaser.GameObjects.Text;
  private extractionActive = false;
  private mineObjects: Phaser.GameObjects.Container[] = [];
  private hostageObjects: Phaser.GameObjects.Container[] = [];
  private hostagesRescued = 0;
  private hostagesTotal = 0;

  constructor() { super({ key: "GameScene" }); }

  init(data: { phaseId: number }) {
    this.phaseId = data.phaseId || 1;
    this.phaseData = PHASES[this.phaseId] || PHASES[1];
    this.squad = []; this.enemies = []; this.enemyHealthBars = []; this.soldierHealthBars = [];
    this.moveTarget = null;
    this.kills = 0; this.enemiesKilled = 0; this.gameOver = false;
    this.objectiveComplete = false; this.extractionActive = false;
    this.mineObjects = [];
    this.hostageObjects = [];
    this.hostagesRescued = 0;
    this.hostagesTotal = 0;
  }

  create() {
    this.startTime = this.time.now;
    const cam = this.cameras.main;
    const W = 30, H = 20;
    const world = this.phaseData.world;

    const wallColor = world === 1 ? 0x2d5016 : world === 2 ? 0x8b7355 : world === 3 ? 0x4a6890 : world === 4 ? 0x6b2d2d : 0x1a1a2e;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const isWall = this.isWall(x, y);
        const rect = this.add.rectangle(x * TILE + TILE/2, y * TILE + TILE/2, TILE-2, TILE-2, isWall ? wallColor : C_GRASS);
        rect.setStrokeStyle(1, 0x000000, 0.15);
      }
    }

    this.extractionPos = this.phaseData.extraction;
    const ex = this.extractionPos.x * TILE + TILE/2, ey = this.extractionPos.y * TILE + TILE/2;
    const ext = this.add.rectangle(ex, ey, TILE, TILE, C_EXTRACTION, 0.25);
    ext.setStrokeStyle(2, this.phaseData.objective === "extract" ? 0xffaa00 : 0x554400);
    this.tweens.add({ targets: ext, alpha: 0.15, duration: 800, yoyo: true, repeat: -1 });
    const extLabel = this.add.text(ex, ey - 20, "EXTRAIR", { fontSize:"10px", color:"#ffdd00", fontFamily:"monospace", fontStyle:"bold" }).setOrigin(0.5);
    extLabel.setAlpha(0.4);

    const titleText = this.add.text(cam.width/2, 20, `Mundo ${world}: ${WORLD_NAMES[world]} — ${this.phaseData.name}`, {
      fontSize:"14px", color:"#fff", fontFamily:"monospace", fontStyle:"bold"
    }).setOrigin(0.5).setDepth(50);
    titleText.setAlpha(0);
    this.tweens.add({ targets: titleText, alpha: 1, duration: 400, yoyo: true, holdTime: 1500, onComplete: () => titleText.setAlpha(0.7) });

    this.clockText = this.add.text(cam.width-12, 20, "0s", { fontSize:"14px", color:"#aaa", fontFamily:"monospace" }).setOrigin(1,0).setDepth(50);
    const objLabel = this.phaseData.objective === "extract" ? "Objetivo: Alcançar extração" : `Objetivo: Eliminar alvos (0/${this.phaseData.enemyCount})`;
    this.objectiveText = this.add.text(12, 20, objLabel, { fontSize:"13px", color:"#ffdd00", fontFamily:"monospace", fontStyle:"bold" }).setDepth(50);

    if (STAKING_REQ[world] > 0) {
      this.add.text(cam.width/2, 40, `Staking: ${STAKING_REQ[world]} $SQUAD`, { fontSize:"11px", color:"#aa88ff", fontFamily:"monospace" }).setOrigin(0.5).setDepth(50);
    }

    for (let i = 0; i < 4; i++) {
      const sx = (2 + i % 2) * TILE + TILE/2, sy = (8 + Math.floor(i/2)) * TILE + TILE/2;
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const soldier = this.createSoldier(sx, sy, name);
      this.squad.push(soldier);
      const hpBar = this.add.rectangle(sx, sy - 30, 30, 4, 0x00ff00).setDepth(51);
      hpBar.setData("soldierIndex", i);
      this.soldierHealthBars.push(hpBar);
    }

    for (const e of this.phaseData.enemies) {
      const ex2 = e.x * TILE + TILE/2, ey2 = e.y * TILE + TILE/2;
      const enemy = this.createEnemy(ex2, ey2, this.phaseData.enemyType);
      this.enemies.push(enemy);
      if (this.phaseData.enemyType !== "target") {
        const eBar = this.add.rectangle(ex2, ey2 - 28, 24, 3, 0xff3333).setDepth(51);
        eBar.setData("enemyIndex", this.enemies.length - 1);
        this.enemyHealthBars.push(eBar);
      }
    }

    if (this.phaseData.mines) {
      for (const m of this.phaseData.mines) {
        const mx = m.x * TILE + TILE/2, my = m.y * TILE + TILE/2;
        const mound = this.add.circle(0, 0, TILE/3, 0x6b4226);
        mound.setStrokeStyle(2, 0x3a2010, 0.5);
        const light = this.add.circle(0, -4, 4, 0xff0000, 0.9);
        this.tweens.add({ targets: light, alpha: 0.2, duration: 400, yoyo: true, repeat: -1 });
        const mine = this.add.container(mx, my, [mound, light]);
        mine.setData("armed", true);
        mine.setData("tileX", m.x);
        mine.setData("tileY", m.y);
        this.mineObjects.push(mine);
      }
    }

    if (this.phaseData.hostages) {
      this.hostagesTotal = this.phaseData.hostages.length;
      for (const h of this.phaseData.hostages) {
        const hx = h.x * TILE + TILE/2, hy = h.y * TILE + TILE/2;
        const body = this.add.rectangle(0, 0, TILE-16, TILE-16, 0x4488ff);
        body.setStrokeStyle(2, 0x000000, 0.4);
        const head = this.add.circle(0, -12, 7, 0x88bbff);
        const tag = this.add.text(0, -26, "REFÉM", { fontSize:"8px", color:"#bbddff", fontFamily:"monospace", fontStyle:"bold" }).setOrigin(0.5);
        const hostage = this.add.container(hx, hy, [body, head, tag]);
        hostage.setData("rescued", false);
        hostage.setData("followIndex", -1);
        this.hostageObjects.push(hostage);
      }
    }

    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (this.gameOver) return;
      if (p.leftButtonDown()) this.moveTarget = { x: p.worldX, y: p.worldY };
      else if (p.rightButtonDown()) this.shoot(p.worldX, p.worldY);
    });
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.input.mouse!.disableContextMenu();

    const hint = this.add.text(cam.width/2, cam.height-16, "WASD = Mover · Clique = Mover · Clique Direito = Atirar", { fontSize:"10px", color:"#666", fontFamily:"monospace" }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: hint, alpha: 0, delay: 6000, duration: 1000 });

    if (this.phaseData.objective === "extract") {
      this.extractionActive = true;
      ext.setFillStyle(C_EXTRACTION, 0.6);
      ext.setStrokeStyle(2, 0xffaa00);
      extLabel.setAlpha(1);
    }
  }

  createSoldier(x: number, y: number, name: string): Phaser.GameObjects.Container {
    const body = this.add.rectangle(0, 0, TILE-14, TILE-14, C_SOLDIER);
    body.setStrokeStyle(2, 0x000000, 0.4);
    const helmet = this.add.rectangle(0, -14, 16, 7, 0x1a3a1a);
    const gun = this.add.rectangle(15, 0, 13, 4, 0x444444);
    const tag = this.add.text(0, -26, name, { fontSize:"9px", color:"#cfc", fontFamily:"monospace", fontStyle:"bold" }).setOrigin(0.5);
    const s = this.add.container(x, y, [body, helmet, gun, tag]);
    s.setData("health", SOLDIER_MAX_HP);
    s.setData("maxHealth", SOLDIER_MAX_HP);
    s.setData("name", name);
    s.setData("alive", true);
    return s;
  }

  createEnemy(x: number, y: number, type: "target" | "soldier" | "elite"): Phaser.GameObjects.Container {
    let hp = type === "target" ? 2 : type === "soldier" ? 3 : 4;
    const color = type === "target" ? C_TARGET : type === "soldier" ? C_ENEMY : 0x882222;
    const accentColor = type === "target" ? 0xcc0000 : 0x440000;

    if (type === "target") {
      const outer = this.add.circle(0, 0, TILE/2 - 4, 0xffffff);
      outer.setStrokeStyle(2, 0x000000, 0.3);
      const mid = this.add.circle(0, 0, TILE/3, 0xcc0000);
      const inner = this.add.circle(0, 0, TILE/6, 0xffffff);
      const dot = this.add.circle(0, 0, 4, 0xcc0000);
      const c = this.add.container(x, y, [outer, mid, inner, dot]);
      c.setData("health", hp); c.setData("maxHealth", hp); c.setData("type", "target");
      return c;
    } else {
      const body = this.add.rectangle(0, 0, TILE-14, TILE-14, color);
      body.setStrokeStyle(2, 0x000000, 0.4);
      const helmet = this.add.rectangle(0, -14, 16, 7, accentColor);
      const gun = this.add.rectangle(-15, 0, 12, 4, 0x333333);
      const tag = this.add.text(0, -26, type === "elite" ? "ELITE" : "INIM", { fontSize:"8px", color:"#fcc", fontFamily:"monospace" }).setOrigin(0.5);
      const c = this.add.container(x, y, [body, helmet, gun, tag]);
      c.setData("health", hp); c.setData("maxHealth", hp); c.setData("type", type);
      return c;
    }
  }

  isWall(x: number, y: number): boolean {
    const w = this.phaseData.world;
    const pid = this.phaseId;
    if (w === 1) {
      if (pid === 1) return (y === 3 || y === 6) && x >= 4 && x <= 9;
      if (pid === 4) return (y === 5 || y === 10 || y === 15) && (x === 8 || x === 16);
      return false;
    }
    if (w === 2) {
      if (pid === 8) return (x === 5 && y >= 4 && y <= 12) || (x === 20 && y >= 4 && y <= 12);
      if (pid === 10) return ((x === 10 && y <= 8) || (x === 18 && y <= 8)) && y >= 2;
      return false;
    }
    if (w === 3) {
      if (pid === 15) return (x === 6 || x === 12 || x === 18 || x === 24) && (y >= 4 && y <= 16);
      if (pid === 14) return (y === 8 && x >= 8 && x <= 22);
      return false;
    }
    if (w === 4) {
      if (pid === 19) return (y === 6 && x >= 6 && x <= 24) || (y === 12 && x >= 6 && x <= 24);
      if (pid === 21) return (x === 14 && y >= 4 && y <= 16);
      return false;
    }
    if (w === 5) {
      if (pid === 25) return (x === 4 || x === 26) && (y === 4 || y === 8 || y === 12 || y === 16);
      if (pid === 26) return (x === 8 && y === 8) || (x === 16 && y === 4) || (x === 20 && y === 14) || (x === 12 && y === 16);
      return false;
    }
    return false;
  }

  update() {
    if (!this.squad.length || this.gameOver) return;
    if (useGameStore.getState().status !== "playing") return;

    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    this.clockText.setText(`${elapsed}s`);

    if (this.phaseData.objective !== "extract") {
      this.objectiveText.setText(`Objetivo: Eliminar alvos (${this.enemiesKilled}/${this.phaseData.enemyCount})`);
    }

    for (let i = 0; i < this.soldierHealthBars.length; i++) {
      const bar = this.soldierHealthBars[i];
      const soldier = this.squad[i];
      if (!soldier || !soldier.active) { bar.setVisible(false); continue; }
      bar.setPosition(soldier.x, soldier.y - 30);
      const hp = soldier.getData("health") as number;
      const maxHp = soldier.getData("maxHealth") as number;
      const ratio = Math.max(0, hp / maxHp);
      bar.setScale(ratio, 1);
      bar.setFillStyle(ratio > 0.5 ? 0x00ff00 : ratio > 0.25 ? 0xffaa00 : 0xff0000);
    }

    for (let i = 0; i < this.enemyHealthBars.length; i++) {
      const bar = this.enemyHealthBars[i];
      const enemyIdx = bar.getData("enemyIndex") as number;
      const enemy = this.enemies[enemyIdx];
      if (!enemy || !enemy.active) { bar.setVisible(false); continue; }
      bar.setPosition(enemy.x, enemy.y - 28);
      const hp = enemy.getData("health") as number;
      const maxHp = enemy.getData("maxHealth") as number;
      const ratio = Math.max(0, hp / maxHp);
      bar.setScale(ratio, 1);
    }

    let dx = 0, dy = 0;
    if (this.wasd.W.isDown) dy--; if (this.wasd.S.isDown) dy++;
    if (this.wasd.A.isDown) dx--; if (this.wasd.D.isDown) dx++;
    if (dx || dy) {
      const len = Math.sqrt(dx*dx + dy*dy);
      this.moveTarget = null;
      this.moveSquad(this.squad[0].x + (dx/len)*3, this.squad[0].y + (dy/len)*3);
    }

    if (this.moveTarget) {
      const l = this.squad[0];
      if (Phaser.Math.Distance.Between(l.x, l.y, this.moveTarget.x, this.moveTarget.y) < 8) this.moveTarget = null;
      else this.moveSquad(this.moveTarget.x, this.moveTarget.y);
    }

    // Enemy fire
    for (const e of this.enemies) {
      if (!e.active) continue;
      const eType = e.getData("type") as string;
      if (eType === "target") continue;
      const lastShot = (e.getData("lastShot") as number) || 0;
      const fireRate = eType === "elite" ? 1800 : 2500;
      if (this.time.now - lastShot < fireRate) continue;
      let target: Phaser.GameObjects.Container | null = null;
      let minDist = Infinity;
      for (const s of this.squad) {
        if (!s.active || !s.getData("alive")) continue;
        const d = Phaser.Math.Distance.Between(e.x, e.y, s.x, s.y);
        if (d < minDist) { minDist = d; target = s; }
      }
      if (target && minDist < TILE * 10) {
        e.setData("lastShot", this.time.now);
        this.enemyShoot(e.x, e.y, target.x, target.y);
      }
    }

    if (!this.objectiveComplete && this.phaseData.objective !== "extract") {
      const aliveEnemies = this.enemies.filter(e => e.active).length;
      if (aliveEnemies === 0 && this.phaseData.enemyCount > 0) {
        this.objectiveComplete = true;
        this.onObjectiveComplete();
      }
    }

    if (this.extractionActive) {
      const leader = this.squad[0];
      if (leader && leader.active && Phaser.Math.Distance.Between(leader.x, leader.y, this.extractionPos.x*TILE+TILE/2, this.extractionPos.y*TILE+TILE/2) < TILE) {
        this.phaseComplete();
      }
    }

    // Hostage rescue and follow logic
    for (const hostage of this.hostageObjects) {
      if (!hostage.active) continue;
      const rescued = hostage.getData("rescued") as boolean;
      if (!rescued) {
        const hx = hostage.x, hy = hostage.y;
        for (const s of this.squad) {
          if (!s.active || !s.getData("alive")) continue;
          if (Phaser.Math.Distance.Between(s.x, s.y, hx, hy) < TILE * 0.8) {
            hostage.setData("rescued", true);
            this.hostagesRescued++;
            audio.victory();
            const body = hostage.getAt(0) as Phaser.GameObjects.Shape;
            if (body && body.setFillStyle) body.setFillStyle(0x33cc33, 1);
            const tag = hostage.getAt(2) as Phaser.GameObjects.Text;
            if (tag) tag.setText("SALVO");
            for (let i = 0; i < 6; i++) {
              const p = this.add.circle(hx + (Math.random()-0.5)*20, hy + (Math.random()-0.5)*20, 2+Math.random()*3, 0x33ff33);
              this.tweens.add({ targets: p, alpha: 0, scaleX: 3, scaleY: 3, duration: 500, onComplete: () => p.destroy() });
            }
            break;
          }
        }
      } else {
        const leader = this.squad.find(s => s.active && s.getData("alive"));
        if (leader) {
          const dist = Phaser.Math.Distance.Between(hostage.x, hostage.y, leader.x, leader.y);
          if (dist > TILE * 1.5) {
            const a = Math.atan2(leader.y - hostage.y, leader.x - hostage.x);
            hostage.x += Math.cos(a) * 1.8;
            hostage.y += Math.sin(a) * 1.8;
          }
        }
      }
    }

    // Mine detection
    for (const mine of this.mineObjects) {
      if (!mine.active || !mine.getData("armed")) continue;
      const mineX = mine.x, mineY = mine.y;
      for (const s of this.squad) {
        if (!s.active || !s.getData("alive")) continue;
        if (Phaser.Math.Distance.Between(s.x, s.y, mineX, mineY) < TILE * 0.4) {
          mine.setData("armed", false);
          mine.setVisible(false);
          audio.explosion();
          for (let i = 0; i < 10; i++) {
            const p = this.add.circle(mineX + (Math.random()-0.5)*30, mineY + (Math.random()-0.5)*30, 3+Math.random()*6, 0xff4400);
            this.tweens.add({ targets: p, alpha: 0, scaleX: 3, scaleY: 3, duration: 500, onComplete: () => p.destroy() });
          }
          this.damageSoldier(s, 3);
          break;
        }
      }
    }

    const aliveSoldiers = this.squad.filter(s => s.active && s.getData("alive")).length;
    if (aliveSoldiers === 0 && !this.gameOver) {
      this.phaseFailed();
    }
  }

  onObjectiveComplete() {
    const cam = this.cameras.main;
    this.extractionActive = true;
    const ex = this.extractionPos.x * TILE + TILE/2, ey = this.extractionPos.y * TILE + TILE/2;
    this.children.list.forEach(obj => {
      if (obj instanceof Phaser.GameObjects.Rectangle && Math.abs(obj.x - ex) < 5 && Math.abs(obj.y - ey) < 5) {
        obj.setFillStyle(C_EXTRACTION, 0.7);
        obj.setStrokeStyle(3, 0xffaa00);
      }
    });
    this.children.list.forEach(obj => {
      if (obj instanceof Phaser.GameObjects.Text && obj.text === "EXTRAIR") obj.setAlpha(1);
    });

    const msg = this.add.text(cam.width/2, cam.height/2 - 60, "OBJETIVO CONCLUÍDO! → VÁ PARA A EXTRAÇÃO", {
      fontSize: "16px", color: "#00ff88", fontFamily:"monospace", fontStyle:"bold"
    }).setOrigin(0.5).setDepth(100);
    this.tweens.add({ targets: msg, alpha: 0, delay: 2500, duration: 800, onComplete: () => msg.destroy() });

    this.objectiveText.setColor("#00ff88");
    this.objectiveText.setText("Objetivo: CONCLUÍDO → Extração");
  }

  moveSquad(tx: number, ty: number) {
    for (let i = 0; i < this.squad.length; i++) {
      const s = this.squad[i];
      if (!s.active || !s.getData("alive")) continue;
      const ox = (i % 2) * 12 - 6, oy = Math.floor(i/2) * 12 - 6;
      const a = Math.atan2(ty + oy - s.y, tx + ox - s.x);
      const nx = s.x + Math.cos(a) * 2.2;
      const ny = s.y + Math.sin(a) * 2.2;
      const tx2 = Math.floor(nx / TILE), ty2 = Math.floor(ny / TILE);
      const cx = Math.floor(s.x / TILE), cy = Math.floor(s.y / TILE);
      if (this.isWall(tx2, ty2)) {
        if (!this.isWall(tx2, cy)) { s.x = nx; }
        else if (!this.isWall(cx, ty2)) { s.y = ny; }
      } else {
        s.x = nx; s.y = ny;
      }
      (s.getAt(2) as Phaser.GameObjects.Rectangle).setRotation(a);
    }
  }

  shoot(wx: number, wy: number) {
    const shooter = this.squad.find(s => s.active && s.getData("alive"));
    if (!shooter) return;
    const a = Math.atan2(wy - shooter.y, wx - shooter.x);
    const frontX = Math.floor((shooter.x + Math.cos(a) * 24) / TILE);
    const frontY = Math.floor((shooter.y + Math.sin(a) * 24) / TILE);
    if (this.isWall(frontX, frontY)) return;
    const b = this.add.rectangle(shooter.x, shooter.y, 8, 3, C_BULLET);
    b.setRotation(a);
    const flash = this.add.circle(shooter.x + Math.cos(a)*16, shooter.y + Math.sin(a)*16, 6, 0xffaa00, 0.9);
    this.tweens.add({ targets: flash, alpha: 0, scaleX: 2, scaleY: 2, duration: 150, onComplete: () => flash.destroy() });
    audio.shoot();
    this.tweens.add({
      targets: b, x: shooter.x + Math.cos(a)*600, y: shooter.y + Math.sin(a)*600, duration: 350,
      onUpdate: () => {
        for (const e of this.enemies) {
          if (!e.active) continue;
          if (Phaser.Math.Distance.Between(b.x, b.y, e.x, e.y) < TILE/2) { this.hitEnemy(e); b.destroy(); return; }
        }
      },
      onComplete: () => { if (b.active) b.destroy(); },
    });
  }

  hitEnemy(e: Phaser.GameObjects.Container) {
    let hp = (e.getData("health") as number) - 1;
    if (hp <= 0) {
      this.enemiesKilled++; this.kills++;
      const px = e.x, py = e.y;
      const eType = e.getData("type") as string;
      e.destroy();
      audio.explosion();
      for (let i = 0; i < 8; i++) {
        const p = this.add.circle(px + (Math.random()-0.5)*24, py + (Math.random()-0.5)*24, 3+Math.random()*5, eType === "target" ? 0xffffff : 0xff6600);
        this.tweens.add({ targets: p, alpha: 0, scaleX: 3, scaleY: 3, duration: 400, onComplete: () => p.destroy() });
      }
      if (eType === "target") {
        const ring = this.add.circle(px, py, 8, 0xffffff, 0);
        ring.setStrokeStyle(3, 0xffffff, 0.8);
        this.tweens.add({ targets: ring, radius: 40, alpha: 0, duration: 300, onComplete: () => ring.destroy() });
      }
    } else {
      e.setData("health", hp);
      const body = e.getAt(0) as Phaser.GameObjects.Shape;
      if (body) {
        body.setAlpha(0.45);
        this.time.delayedCall(80, () => { if (e.active && body.active) body.setAlpha(1); });
      }
      audio.hit();
    }
  }

  enemyShoot(fx: number, fy: number, tx: number, ty: number) {
    const a = Math.atan2(ty - fy, tx - fx);
    const frontX = Math.floor((fx + Math.cos(a) * 24) / TILE);
    const frontY = Math.floor((fy + Math.sin(a) * 24) / TILE);
    if (this.isWall(frontX, frontY)) return;
    const b = this.add.rectangle(fx, fy, 7, 3, 0xff4444);
    b.setRotation(a);
    const flash = this.add.circle(fx + Math.cos(a)*14, fy + Math.sin(a)*14, 5, 0xff6666, 0.8);
    this.tweens.add({ targets: flash, alpha: 0, scaleX: 2, scaleY: 2, duration: 120, onComplete: () => flash.destroy() });
    audio.shoot();
    this.tweens.add({
      targets: b, x: fx + Math.cos(a)*500, y: fy + Math.sin(a)*500, duration: 400,
      onUpdate: () => {
        for (const s of this.squad) {
          if (!s.active || !s.getData("alive")) continue;
          if (Phaser.Math.Distance.Between(b.x, b.y, s.x, s.y) < TILE/2) { this.damageSoldier(s, 1); b.destroy(); return; }
        }
      },
      onComplete: () => { if (b.active) b.destroy(); },
    });
  }

  damageSoldier(s: Phaser.GameObjects.Container, dmg: number) {
    if (!s.active || !s.getData("alive")) return;
    let hp = (s.getData("health") as number) - dmg;
    s.setData("health", hp);
    const body = s.getAt(0) as Phaser.GameObjects.Shape;
    if (hp <= 0) {
      s.setData("alive", false);
      const px = s.x, py = s.y;
      const name = s.getData("name") as string;
      audio.soldierDeath();
      for (let i = 0; i < 3; i++) {
        (s.getAt(i) as Phaser.GameObjects.GameObject & { setVisible: (visible: boolean) => void }).setVisible(false);
      }
      const stone = this.add.rectangle(px, py, 20, 24, 0x666666);
      stone.setStrokeStyle(2, 0x333333);
      const cross = this.add.text(px, py, "+", { fontSize:"16px", color:"#fff", fontFamily:"monospace", fontStyle:"bold" }).setOrigin(0.5);
      const ripName = this.add.text(px, py + 18, name, { fontSize:"8px", color:"#aaa", fontFamily:"monospace" }).setOrigin(0.5);
      for (let i = 0; i < 5; i++) {
        const blood = this.add.circle(px + (Math.random()-0.5)*30, py + (Math.random()-0.5)*30, 2+Math.random()*3, 0x8b0000);
        this.tweens.add({ targets: blood, alpha: 0.3, duration: 2000 });
      }
    } else {
      audio.soldierHit();
      if (body) {
        body.setAlpha(0.45);
        this.time.delayedCall(120, () => { if (s.active && body.active) body.setAlpha(1); });
      }
    }
  }

  phaseComplete() {
    if (this.gameOver) return;
    this.gameOver = true;
    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    const alive = this.squad.filter(s => s.active && s.getData("alive")).length;
    let stars = 1;
    if (elapsed <= this.phaseData.timeTarget) stars++;
    if (alive >= 3) stars++;
    if (this.phaseData.objective !== "extract" && this.enemiesKilled >= this.phaseData.enemyCount) stars = Math.min(stars + 1, 3);

    const store = useGameStore.getState();
    const world = this.phaseData.world;
    const reward = (BASE_REWARDS[world] || 10) * stars;
    store.onPhaseComplete(stars, elapsed, this.kills, alive);
    store.addSquad(reward);
    audio.victory();

    const cx = this.cameras.main.width/2, cy = this.cameras.main.height/2;
    this.add.rectangle(cx, cy, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8).setDepth(200);
    const isLastPhase = this.phaseId >= 30;
    const lines = [
      { t: isLastPhase ? "JOGO COMPLETO!" : "FASE CONCLUÍDA!", y: -120, sz: 24, c: isLastPhase ? "#00ff88" : "#ffdd00" },
      { t: "★".repeat(stars) + "☆".repeat(3-stars), y: -72, sz: 34, c: "#ffdd00" },
      { t: `+${reward} $SQUAD`, y: -24, sz: 22, c: "#33cc33" },
      { t: `Tempo: ${elapsed}s`, y: 14, sz: 14, c: "#ccc" },
      { t: `Soldados vivos: ${alive}/4`, y: 36, sz: 14, c: alive >= 3 ? "#33ff33" : "#ff6666" },
      { t: `Alvos eliminados: ${this.enemiesKilled}/${this.phaseData.enemyCount}`, y: 58, sz: 14, c: this.enemiesKilled >= this.phaseData.enemyCount ? "#33ff33" : "#ffaa00" },
      { t: isLastPhase ? "[M] Menu · [R] Recomeçar" : "[ENTER/N] Próxima Fase · [M] Menu", y: 100, sz: 13, c: "#888" },
    ];
    for (const l of lines) this.add.text(cx, cy + l.y, l.t, { fontSize:`${l.sz}px`, color:l.c, fontFamily:"monospace", fontStyle:"bold" }).setOrigin(0.5).setDepth(201);

    this.input.keyboard!.once("keydown-ENTER", () => this.nextPhase());
    this.input.keyboard!.once("keydown-N", () => this.nextPhase());
    this.input.keyboard!.once("keydown-M", () => { store.setStatus("menu"); this.scene.stop(); });
    if (isLastPhase) {
      this.input.keyboard!.once("keydown-R", () => { store.startPhase(1, 1); this.scene.restart({ phaseId: 1 }); });
    }
  }

  phaseFailed() {
    if (this.gameOver) return;
    this.gameOver = true;
    audio.soldierDeath();
    const store = useGameStore.getState();
    store.setStatus("defeat");

    const cx = this.cameras.main.width/2, cy = this.cameras.main.height/2;
    this.add.rectangle(cx, cy, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8).setDepth(200);
    const lines = [
      { t: "ESQUADRÃO ELIMINADO", y: -60, sz: 22, c: "#ff3333" },
      { t: "Todos os soldados caíram", y: -20, sz: 14, c: "#ccc" },
      { t: "[R] Tentar novamente · [M] Menu", y: 30, sz: 13, c: "#888" },
    ];
    for (const l of lines) this.add.text(cx, cy + l.y, l.t, { fontSize:`${l.sz}px`, color:l.c, fontFamily:"monospace", fontStyle:"bold" }).setOrigin(0.5).setDepth(201);

    this.input.keyboard!.once("keydown-R", () => { store.startPhase(this.phaseData.world, this.phaseId); this.scene.restart({ phaseId: this.phaseId }); });
    this.input.keyboard!.once("keydown-M", () => { store.setStatus("menu"); this.scene.stop(); });
  }

  nextPhase() {
    const store = useGameStore.getState();
    const np = this.phaseId + 1;
    if (PHASES[np]) {
      const nextWorld = PHASES[np].world;
      store.startPhase(nextWorld, np);
      this.scene.restart({ phaseId: np });
    } else {
      store.setStatus("menu");
      this.scene.stop();
    }
  }
}
