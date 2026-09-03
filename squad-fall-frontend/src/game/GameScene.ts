// GameScene.ts — Phaser top-down tactical shooter — 30 phases (5 worlds) + procedural audio
import Phaser from "phaser";
import { useGameStore } from "@/store/useGameStore";

const TILE = 48;
const C_GRASS = 0x4a7c2e, C_SOLDIER = 0x33cc33;
const C_ENEMY = 0xcc3333, C_EXTRACTION = 0xffdd00, C_BULLET = 0xffff00;
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
}
const audio = new AudioFX();

interface PhaseData {
  name: string;
  world: number;
  timeTarget: number;
  enemyCount: number;
  extraction: { x: number; y: number };
  enemies: { x: number; y: number }[];
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
  // MUNDO 1: RECRUTA — "Boot Camp Tropical" (10 SQUAD/fase)
  1: { name: "Acorda, Soldado!", world: 1, timeTarget: 30, enemyCount: 0, extraction: {x:26,y:7}, enemies: [] },
  2: { name: "Tiro ao Alvo", world: 1, timeTarget: 45, enemyCount: 8, extraction: {x:28,y:17}, enemies: genEnemies(8, 11) },
  3: { name: "Floresta Silenciosa", world: 1, timeTarget: 60, enemyCount: 6, extraction: {x:27,y:18}, enemies: genEnemies(6, 23) },
  4: { name: "Nao Me Pise!", world: 1, timeTarget: 75, enemyCount: 5, extraction: {x:26,y:16}, enemies: genEnemies(5, 37) },
  5: { name: "Resgate na Selva", world: 1, timeTarget: 90, enemyCount: 8, extraction: {x:28,y:18}, enemies: genEnemies(8, 41) },
  6: { name: "General Gorila", world: 1, timeTarget: 120, enemyCount: 12, extraction: {x:27,y:17}, enemies: genEnemies(12, 53) },
  // MUNDO 2: CABO — "Tempestade no Deserto" (25 SQUAD/fase)
  7: { name: "Areias Ardentes", world: 2, timeTarget: 90, enemyCount: 10, extraction: {x:26,y:18}, enemies: genEnemies(10, 67) },
  8: { name: "Comboio Blindado", world: 2, timeTarget: 100, enemyCount: 12, extraction: {x:28,y:17}, enemies: genEnemies(12, 71) },
  9: { name: "Oasis Sangrento", world: 2, timeTarget: 80, enemyCount: 10, extraction: {x:27,y:16}, enemies: genEnemies(10, 83) },
  10: { name: "Torres Gemeas", world: 2, timeTarget: 110, enemyCount: 14, extraction: {x:28,y:18}, enemies: genEnemies(14, 97) },
  11: { name: "Campo Minado", world: 2, timeTarget: 120, enemyCount: 8, extraction: {x:26,y:17}, enemies: genEnemies(8, 103) },
  12: { name: "Sultao dos Misseis", world: 2, timeTarget: 150, enemyCount: 16, extraction: {x:27,y:18}, enemies: genEnemies(16, 113) },
  // MUNDO 3: SARGENTO — "Frente Gelada" (50 SQUAD/fase, staking 100)
  13: { name: "Nevasca", world: 3, timeTarget: 120, enemyCount: 14, extraction: {x:26,y:18}, enemies: genEnemies(14, 127) },
  14: { name: "Lagos Congelados", world: 3, timeTarget: 130, enemyCount: 12, extraction: {x:28,y:17}, enemies: genEnemies(12, 131) },
  15: { name: "Base Subterranea", world: 3, timeTarget: 140, enemyCount: 16, extraction: {x:27,y:16}, enemies: genEnemies(16, 137) },
  16: { name: "Avalanche", world: 3, timeTarget: 90, enemyCount: 14, extraction: {x:26,y:17}, enemies: genEnemies(14, 149) },
  17: { name: "Sinais de Fumaca", world: 3, timeTarget: 150, enemyCount: 12, extraction: {x:28,y:18}, enemies: genEnemies(12, 151) },
  18: { name: "O Colosso de Gelo", world: 3, timeTarget: 180, enemyCount: 18, extraction: {x:27,y:18}, enemies: genEnemies(18, 157) },
  // MUNDO 4: TENENTE — "Inferno Vulcanico" (100 SQUAD/fase, staking 250 acum)
  19: { name: "Rios de Lava", world: 4, timeTarget: 140, enemyCount: 16, extraction: {x:26,y:18}, enemies: genEnemies(16, 163) },
  20: { name: "Prisao da Montanha", world: 4, timeTarget: 150, enemyCount: 18, extraction: {x:28,y:17}, enemies: genEnemies(18, 167) },
  21: { name: "Emboscada no Desfiladeiro", world: 4, timeTarget: 160, enemyCount: 20, extraction: {x:27,y:16}, enemies: genEnemies(20, 173) },
  22: { name: "Arsenal Secreto", world: 4, timeTarget: 130, enemyCount: 16, extraction: {x:26,y:17}, enemies: genEnemies(16, 179) },
  23: { name: "A Horda", world: 4, timeTarget: 180, enemyCount: 24, extraction: {x:28,y:18}, enemies: genEnemies(24, 181) },
  24: { name: "General Magma", world: 4, timeTarget: 200, enemyCount: 22, extraction: {x:27,y:18}, enemies: genEnemies(22, 191) },
  // MUNDO 5: COMANDANTE — "A Fortaleza Final" (250 SQUAD/fase, staking 500)
  25: { name: "Muralhas do Inimigo", world: 5, timeTarget: 180, enemyCount: 20, extraction: {x:26,y:18}, enemies: genEnemies(20, 193) },
  26: { name: "Labirinto", world: 5, timeTarget: 200, enemyCount: 18, extraction: {x:28,y:17}, enemies: genEnemies(18, 197) },
  27: { name: "Traicao", world: 5, timeTarget: 150, enemyCount: 16, extraction: {x:27,y:16}, enemies: genEnemies(16, 199) },
  28: { name: "Carga Explosiva", world: 5, timeTarget: 120, enemyCount: 18, extraction: {x:26,y:17}, enemies: genEnemies(18, 211) },
  29: { name: "Ultima Resistencia", world: 5, timeTarget: 240, enemyCount: 28, extraction: {x:28,y:18}, enemies: genEnemies(28, 223) },
  30: { name: "O Alto Comando", world: 5, timeTarget: 300, enemyCount: 30, extraction: {x:27,y:18}, enemies: genEnemies(30, 227) },
};

const STAKING_REQ: Record<number, number> = { 1: 0, 2: 0, 3: 100, 4: 250, 5: 500 };
const BASE_REWARDS: Record<number, number> = { 1: 10, 2: 25, 3: 50, 4: 100, 5: 250 };
const WORLD_NAMES: Record<number, string> = { 1: "Recruta", 2: "Cabo", 3: "Sargento", 4: "Tenente", 5: "Comandante" };

export class GameScene extends Phaser.Scene {
  private squad: Phaser.GameObjects.Container[] = [];
  private enemies: Phaser.GameObjects.Sprite[] = [];
  private moveTarget: { x: number; y: number } | null = null;
  private extractionPos = { x: 0, y: 0 };
  private phaseId = 1;
  private phaseData!: PhaseData;
  private startTime = 0;
  private kills = 0;
  private enemiesKilled = 0;
  private gameOver = false;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private clockText!: Phaser.GameObjects.Text;
  private killText!: Phaser.GameObjects.Text;

  constructor() { super({ key: "GameScene" }); }

  init(data: { phaseId: number }) {
    this.phaseId = data.phaseId || 1;
    this.phaseData = PHASES[this.phaseId] || PHASES[1];
    this.squad = []; this.enemies = []; this.moveTarget = null;
    this.kills = 0; this.enemiesKilled = 0; this.gameOver = false;
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
    const ext = this.add.rectangle(ex, ey, TILE, TILE, C_EXTRACTION, 0.6);
    ext.setStrokeStyle(2, 0xffaa00);
    this.tweens.add({ targets: ext, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });
    this.add.text(ex, ey - 20, "EXTRAIR", { fontSize:"10px", color:"#ffdd00", fontFamily:"monospace", fontStyle:"bold" }).setOrigin(0.5);

    const titleText = this.add.text(cam.width/2, 20, `Mundo ${world}: ${WORLD_NAMES[world]} — ${this.phaseData.name}`, {
      fontSize:"14px", color:"#fff", fontFamily:"monospace", fontStyle:"bold"
    }).setOrigin(0.5).setDepth(50);
    titleText.setAlpha(0);
    this.tweens.add({ targets: titleText, alpha: 1, duration: 400, yoyo: true, holdTime: 1500, onComplete: () => titleText.setAlpha(0.7) });

    this.clockText = this.add.text(cam.width-12, 20, "0s", { fontSize:"14px", color:"#aaa", fontFamily:"monospace" }).setOrigin(1,0).setDepth(50);
    this.killText = this.add.text(12, 20, `Inimigos: 0/${this.phaseData.enemyCount}`, { fontSize:"14px", color:"#f66", fontFamily:"monospace" }).setDepth(50);

    if (STAKING_REQ[world] > 0) {
      this.add.text(cam.width/2, 40, `Staking: ${STAKING_REQ[world]} $SQUAD`, { fontSize:"11px", color:"#aa88ff", fontFamily:"monospace" }).setOrigin(0.5).setDepth(50);
    }

    for (let i = 0; i < 4; i++) {
      const sx = (2 + i % 2) * TILE + TILE/2, sy = (8 + Math.floor(i/2)) * TILE + TILE/2;
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      this.squad.push(this.createSoldier(sx, sy, name));
    }

    for (const e of this.phaseData.enemies) {
      const ex2 = e.x * TILE + TILE/2, ey2 = e.y * TILE + TILE/2;
      const enemy = this.add.sprite(ex2, ey2, "__WHITE");
      enemy.setDisplaySize(TILE-8, TILE-8);
      enemy.setTint(C_ENEMY);
      enemy.setData("health", 3);
      this.enemies.push(enemy);
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
    this.killText.setText(`Inimigos: ${this.enemiesKilled}/${this.phaseData.enemyCount}`);

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

    const leader = this.squad[0];
    if (leader && Phaser.Math.Distance.Between(leader.x, leader.y, this.extractionPos.x*TILE+TILE/2, this.extractionPos.y*TILE+TILE/2) < TILE) {
      this.phaseComplete();
    }
  }

  createSoldier(x: number, y: number, name: string) {
    const body = this.add.rectangle(0, 0, TILE-12, TILE-12, C_SOLDIER);
    body.setStrokeStyle(2, 0x000000, 0.3);
    const helmet = this.add.rectangle(0, -15, 18, 8, 0x2a2a2a);
    const gun = this.add.rectangle(16, 0, 14, 4, 0x555555);
    const tag = this.add.text(0, -26, name, { fontSize:"9px", color:"#cfc", fontFamily:"monospace" }).setOrigin(0.5);
    const s = this.add.container(x, y, [body, helmet, gun, tag]);
    s.setData("health", 3);
    return s;
  }

  moveSquad(tx: number, ty: number) {
    for (let i = 0; i < this.squad.length; i++) {
      const s = this.squad[i];
      const ox = (i % 2) * 12 - 6, oy = Math.floor(i/2) * 12 - 6;
      const a = Math.atan2(ty + oy - s.y, tx + ox - s.x);
      s.x += Math.cos(a) * 2.2; s.y += Math.sin(a) * 2.2;
      (s.getAt(2) as Phaser.GameObjects.Rectangle).setRotation(a);
    }
  }

  shoot(wx: number, wy: number) {
    const s = this.squad[0]; if (!s) return;
    const a = Math.atan2(wy - s.y, wx - s.x);
    const b = this.add.rectangle(s.x, s.y, 8, 3, C_BULLET);
    b.setRotation(a);
    const flash = this.add.circle(s.x + Math.cos(a)*16, s.y + Math.sin(a)*16, 6, 0xffaa00, 0.9);
    this.tweens.add({ targets: flash, alpha: 0, scaleX: 2, scaleY: 2, duration: 150, onComplete: () => flash.destroy() });
    audio.shoot();
    this.tweens.add({
      targets: b, x: s.x + Math.cos(a)*600, y: s.y + Math.sin(a)*600, duration: 350,
      onUpdate: () => {
        for (const e of this.enemies) {
          if (!e.active) continue;
          if (Phaser.Math.Distance.Between(b.x, b.y, e.x, e.y) < TILE/2) { this.hitEnemy(e); b.destroy(); return; }
        }
      },
      onComplete: () => { if (b.active) b.destroy(); },
    });
  }

  hitEnemy(e: Phaser.GameObjects.Sprite) {
    let hp = e.getData("health") - 1;
    if (hp <= 0) {
      this.enemiesKilled++; this.kills++;
      const px = e.x, py = e.y; e.destroy();
      audio.explosion();
      for (let i = 0; i < 6; i++) {
        const p = this.add.circle(px + (Math.random()-0.5)*20, py + (Math.random()-0.5)*20, 3+Math.random()*4, 0xff6600);
        this.tweens.add({ targets: p, alpha: 0, scaleX: 3, scaleY: 3, duration: 400, onComplete: () => p.destroy() });
      }
    } else {
      e.setData("health", hp); e.setTint(0xffffff);
      audio.hit();
      this.time.delayedCall(80, () => { if (e.active) e.setTint(C_ENEMY); });
    }
  }

  phaseComplete() {
    if (this.gameOver) return;
    this.gameOver = true;
    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    const alive = this.squad.filter(s => s.active).length;
    let stars = 1;
    if (elapsed <= this.phaseData.timeTarget) stars++;
    if (alive >= 3) stars++;

    const store = useGameStore.getState();
    const world = this.phaseData.world;
    const reward = (BASE_REWARDS[world] || 10) * stars;
    store.onPhaseComplete(stars, elapsed, this.kills, alive);
    store.addSquad(reward);
    audio.victory();

    const cx = this.cameras.main.width/2, cy = this.cameras.main.height/2;
    this.add.rectangle(cx, cy, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.75).setDepth(200);
    const isLastPhase = this.phaseId >= 30;
    const lines = [
      { t: isLastPhase ? "JOGO COMPLETO!" : "FASE CONCLUÍDA!", y: -110, sz: 24, c: isLastPhase ? "#00ff88" : "#ffdd00" },
      { t: "★".repeat(stars) + "☆".repeat(3-stars), y: -62, sz: 34, c: "#ffdd00" },
      { t: `+${reward} $SQUAD`, y: -16, sz: 22, c: "#33cc33" },
      { t: `Tempo: ${elapsed}s · Soldados: ${alive}/4 · Kills: ${this.kills}`, y: 28, sz: 13, c: "#ccc" },
      { t: isLastPhase ? "[M] Menu · [R] Recomeçar" : "[ENTER/N] Próxima · [M] Menu", y: 68, sz: 12, c: "#888" },
    ];
    for (const l of lines) this.add.text(cx, cy + l.y, l.t, { fontSize:`${l.sz}px`, color:l.c, fontFamily:"monospace", fontStyle:"bold" }).setOrigin(0.5).setDepth(201);

    this.input.keyboard!.once("keydown-ENTER", () => this.nextPhase());
    this.input.keyboard!.once("keydown-N", () => this.nextPhase());
    this.input.keyboard!.once("keydown-M", () => { store.setStatus("menu"); this.scene.stop(); });
    if (isLastPhase) {
      this.input.keyboard!.once("keydown-R", () => { store.startPhase(1, 1); this.scene.restart({ phaseId: 1 }); });
    }
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
