// GameScene.ts — Phaser top-down tactical shooter
import * as Phaser from "phaser";
import { useGameStore } from "@/store/useGameStore";

const TILE = 48;
const C_GRASS = 0x4a7c2e, C_WALL = 0x5c4033, C_SOLDIER = 0x33cc33;
const C_ENEMY = 0xcc3333, C_EXTRACTION = 0xffdd00, C_BULLET = 0xffff00;
const NAMES = ["Razor","Ghost","Tank","Hawk","Wolf","Ace","Blade","Storm","Fox","Bear"];

const PHASES: Record<number, { name: string; world: number; timeTarget: number; enemyCount: number; extraction: {x:number;y:number}; enemies: {x:number;y:number}[] }> = {
  1: { name: "Acorda, Soldado!", world: 1, timeTarget: 30, enemyCount: 0, extraction: {x:26,y:7}, enemies: [] },
  2: { name: "Tiro ao Alvo", world: 1, timeTarget: 45, enemyCount: 8, extraction: {x:28,y:17},
    enemies: [{x:8,y:5},{x:12,y:5},{x:16,y:8},{x:8,y:12},{x:20,y:10},{x:24,y:6},{x:5,y:15},{x:22,y:15}] },
  3: { name: "Floresta Silenciosa", world: 1, timeTarget: 60, enemyCount: 6, extraction: {x:27,y:18},
    enemies: [{x:10,y:6},{x:14,y:10},{x:18,y:4},{x:22,y:14},{x:6,y:16},{x:24,y:8}] },
};

export class GameScene extends Phaser.Scene {
  private squad: Phaser.GameObjects.Container[] = [];
  private enemies: Phaser.GameObjects.Sprite[] = [];
  private moveTarget: { x: number; y: number } | null = null;
  private extractionPos = { x: 0, y: 0 };
  private phaseId = 1;
  private phaseData: any;
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

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const isWall = (this.phaseId === 1 && (y === 3 || y === 6) && x >= 4 && x <= 9);
        const rect = this.add.rectangle(x * TILE + TILE/2, y * TILE + TILE/2, TILE-2, TILE-2, isWall ? C_WALL : C_GRASS);
        rect.setStrokeStyle(1, 0x000000, 0.15);
      }
    }

    this.extractionPos = this.phaseData.extraction;
    const ex = this.extractionPos.x * TILE + TILE/2, ey = this.extractionPos.y * TILE + TILE/2;
    const ext = this.add.rectangle(ex, ey, TILE, TILE, C_EXTRACTION, 0.6);
    ext.setStrokeStyle(2, 0xffaa00);
    this.tweens.add({ targets: ext, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });
    this.add.text(ex, ey - 20, "EXTRAIR", { fontSize:"10px", color:"#ffdd00", fontFamily:"monospace", fontStyle:"bold" }).setOrigin(0.5);

    this.add.text(cam.width/2, 20, this.phaseData.name, { fontSize:"16px", color:"#fff", fontFamily:"monospace", fontStyle:"bold" }).setOrigin(0.5).setDepth(50);
    this.clockText = this.add.text(cam.width-12, 20, "0s", { fontSize:"14px", color:"#aaa", fontFamily:"monospace" }).setOrigin(1,0).setDepth(50);
    this.killText = this.add.text(12, 20, `Inimigos: 0/${this.phaseData.enemyCount}`, { fontSize:"14px", color:"#f66", fontFamily:"monospace" }).setDepth(50);

    for (let i = 0; i < 4; i++) {
      const sx = (2 + i % 2) * TILE + TILE/2, sy = (8 + Math.floor(i/2)) * TILE + TILE/2;
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const body = this.add.rectangle(0, 0, TILE-12, TILE-12, C_SOLDIER);
      body.setStrokeStyle(2, 0x000000, 0.3);
      const helmet = this.add.rectangle(0, -15, 18, 8, 0x2a2a2a);
      const gun = this.add.rectangle(16, 0, 14, 4, 0x555555);
      const tag = this.add.text(0, -26, name, { fontSize:"9px", color:"#cfc", fontFamily:"monospace" }).setOrigin(0.5);
      const s = this.add.container(sx, sy, [body, helmet, gun, tag]);
      s.setData("health", 3);
      this.squad.push(s);
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
      for (let i = 0; i < 6; i++) {
        const p = this.add.circle(px + (Math.random()-0.5)*20, py + (Math.random()-0.5)*20, 3+Math.random()*4, 0xff6600);
        this.tweens.add({ targets: p, alpha: 0, scaleX: 3, scaleY: 3, duration: 400, onComplete: () => p.destroy() });
      }
    } else {
      e.setData("health", hp); e.setTint(0xffffff);
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
    const rewards: Record<number, number> = { 1: 10, 2: 25, 3: 50, 4: 100, 5: 250 };
    const reward = (rewards[this.phaseData.world] || 10) * stars;
    store.onPhaseComplete(stars, elapsed, this.kills, alive);
    store.addSquad(reward);

    const cx = this.cameras.main.width/2, cy = this.cameras.main.height/2;
    this.add.rectangle(cx, cy, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.75).setDepth(200);
    const lines = [
      { t: "FASE CONCLUÍDA!", y: -100, sz: 24, c: "#ffdd00" },
      { t: "★".repeat(stars) + "☆".repeat(3-stars), y: -52, sz: 34, c: "#ffdd00" },
      { t: `+${reward} $SQUAD`, y: -8, sz: 22, c: "#33cc33" },
      { t: `Tempo: ${elapsed}s · Soldados: ${alive}/4`, y: 32, sz: 13, c: "#ccc" },
      { t: "[ENTER] Próxima · [M] Menu", y: 72, sz: 12, c: "#888" },
    ];
    for (const l of lines) this.add.text(cx, cy + l.y, l.t, { fontSize:`${l.sz}px`, color:l.c, fontFamily:"monospace", fontStyle:"bold" }).setOrigin(0.5).setDepth(201);

    this.input.keyboard!.once("keydown-ENTER", () => this.nextPhase());
    this.input.keyboard!.once("keydown-M", () => { store.setStatus("menu"); this.scene.stop(); });
  }

  nextPhase() {
    const store = useGameStore.getState();
    const np = this.phaseId + 1;
    if (PHASES[np]) { store.startPhase(store.world, np); this.scene.restart({ phaseId: np }); }
    else { store.setStatus("menu"); this.scene.stop(); }
  }
}
