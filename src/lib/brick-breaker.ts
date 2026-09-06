export const BALL_R = 30;
export const FREE_BALL_SPEED = 260;
export const PLAY_BALL_SPEED = 340;
export const FREE_PADDLE_W = 56;
export const FREE_PADDLE_H = 14;
export const PLAY_PADDLE_W = 110;
export const PLAY_PADDLE_H = 14;
export const PADDLE_Y_OFFSET = 48;
export const MAX_LIVES = 3;
export const MAX_BOUNCE_ANGLE = Math.PI / 3;
export const FLY_DURATION = 0.7;

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

export interface Paddle {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  points: number;
  alive: boolean;
  row: number;
  col: number;
  targetY: number;
  startY: number;
  delay: number;
  t: number;
  arrived: boolean;
}

export type GameMode = 'free' | 'play';
export type Phase = 'free' | 'flying' | 'ready' | 'active' | 'won' | 'lost';

export interface GameState {
  width: number;
  height: number;
  mode: GameMode;
  phase: Phase;
  ball: Ball;
  paddle: Paddle;
  bricks: Brick[];
  level: number;
  score: number;
  lives: number;
  time: number;
}

export interface BrickColorSpec {
  color: string;
  points: number;
}

export const BRICK_COLORS: Record<string, BrickColorSpec> = {
  R: { color: '#ef4444', points: 50 },
  O: { color: '#f97316', points: 60 },
  Y: { color: '#eab308', points: 70 },
  G: { color: '#22c55e', points: 80 },
  B: { color: '#3b82f6', points: 90 },
  P: { color: '#a855f7', points: 100 },
  C: { color: '#22d3ee', points: 110 },
  W: { color: '#f8fafc', points: 120 },
};

export const LEVEL_PATTERNS: string[][] = [
  [
    'RRRRRRRRRRRRRR',
    'RRRRRRRRRRRRRR',
    'OOOOOOOOOOOOOO',
    'OOOOOOOOOOOOOO',
    'YYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYY',
    'GGGGGGGGGGGGGG',
    'GGGGGGGGGGGGGG',
  ],
  [
    '......PP......',
    '.....PPPP.....',
    '....PPPPPP....',
    '...PPPPPPPP...',
    '..PPPPPPPPPP..',
    '.PPPPPPPPPPPP.',
  ],
  [
    '......PP......',
    '.....PPPP.....',
    '....PPPPPP....',
    '..PPBBBBBBPP..',
    '....PPPPPP....',
    '.....PPPP.....',
    '......PP......',
  ],
  [
    'G..B..Y..B..G.',
    'G..B..Y..B..G.',
    'G..B..Y..B..G.',
    'G..B..Y..B..G.',
    'G..B..Y..B..G.',
    'G..B..Y..B..G.',
    'G..B..Y..B..G.',
  ],
  [
    'G.G.G.G.G.G.G.',
    '.G.G.G.G.G.G.G',
    'G.G.G.G.G.G.G.',
    '.G.G.G.G.G.G.G',
    'B.B.B.B.B.B.B.',
    '.B.B.B.B.B.B.B',
  ],
  [
    '......PP......',
    '.....PCCC.....',
    '...PCCYYCCP...',
    '..PCCYYYYCCP..',
    '...PCCYYCCP...',
    '.....PCCC.....',
    '......PP......',
  ],
  [
    '..............',
    '.......P......',
    '......PPP.....',
    '.....PPPPP....',
    '....PPPPPPP...',
    '...PPPPPPPPP..',
    '..PPPPPPPPPPP.',
    '..............',
  ],
  [
    'WWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWW',
    'GGGGGGGGGGGGGG',
    'GGGGGGGGGGGGGG',
    'BBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBB',
  ],
];

export interface ParseOpts {
  brickW?: number;
  brickH?: number;
  topGap?: number;
}

export function parsePattern(
  rows: string[],
  width: number,
  height: number,
  opts: ParseOpts,
): Brick[] {
  const brickW = opts.brickW ?? Math.floor(width / 14);
  const brickH = opts.brickH ?? 22;
  const topGap = opts.topGap ?? 90;
  const bricks: Brick[] = [];

  rows.forEach((rowStr, row) => {
    for (let col = 0; col < rowStr.length; col++) {
      const ch = rowStr[col];
      if (ch === '.' || ch === ' ') continue;
      const spec = BRICK_COLORS[ch];
      if (!spec) continue;
      const targetY = topGap + row * brickH;
      bricks.push({
        x: col * brickW,
        y: targetY,
        w: brickW,
        h: brickH,
        color: spec.color,
        points: spec.points,
        alive: true,
        row,
        col,
        targetY,
        startY: targetY - height * 1.5,
        delay: row * 0.12 + col * 0.02,
        t: 0,
        arrived: false,
      });
    }
  });

  return bricks;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function easeOutCubic(p: number): number {
  return 1 - Math.pow(1 - p, 3);
}

export function createGame(width: number, height: number): GameState {
  const angle = Math.random() * Math.PI * 2;
  return {
    width,
    height,
    mode: 'free',
    phase: 'free',
    ball: {
      x: width / 2,
      y: height / 2,
      vx: Math.cos(angle) * FREE_BALL_SPEED,
      vy: Math.sin(angle) * FREE_BALL_SPEED,
      r: BALL_R,
    },
    paddle: {
      x: width / 2,
      y: height / 2,
      w: FREE_PADDLE_W,
      h: FREE_PADDLE_H,
    },
    bricks: [],
    level: 1,
    score: 0,
    lives: MAX_LIVES,
    time: 0,
  };
}

export function loadLevel(state: GameState, level: number): void {
  const pattern = LEVEL_PATTERNS[level - 1] ?? LEVEL_PATTERNS[0];
  state.bricks = parsePattern(pattern, state.width, state.height, {});
  state.paddle.w = PLAY_PADDLE_W;
  state.paddle.h = PLAY_PADDLE_H;
  state.paddle.y = state.height - PADDLE_Y_OFFSET;
  for (const brick of state.bricks) {
    brick.y = brick.startY;
  }
}

export function stickBall(state: GameState): void {
  state.ball.x = state.paddle.x;
  state.ball.y = state.paddle.y - state.ball.r;
  state.ball.vx = 0;
  state.ball.vy = 0;
}

export function startGame(state: GameState): void {
  state.mode = 'play';
  state.phase = 'flying';
  state.level = 1;
  state.score = 0;
  state.lives = MAX_LIVES;
  loadLevel(state, 1);
  stickBall(state);
}

export function launchBall(state: GameState): void {
  if (state.phase !== 'flying' && state.phase !== 'ready') return;
  state.phase = 'active';
  state.ball.vx = PLAY_BALL_SPEED * 0.3;
  state.ball.vy = -PLAY_BALL_SPEED;
}

export function setPointer(state: GameState, x: number, y: number): void {
  if (state.mode === 'free') {
    state.paddle.x = clamp(x, state.paddle.w / 2, state.width - state.paddle.w / 2);
    state.paddle.y = clamp(y, state.paddle.h / 2, state.height - state.paddle.h / 2);
    return;
  }
  state.paddle.x = clamp(x, state.paddle.w / 2, state.width - state.paddle.w / 2);
}

export function movePaddleBy(state: GameState, dx: number): void {
  state.paddle.x = clamp(
    state.paddle.x + dx,
    state.paddle.w / 2,
    state.width - state.paddle.w / 2,
  );
}

function circleRectHit(
  b: Ball,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
): boolean {
  const cx = clamp(b.x, rx, rx + rw);
  const cy = clamp(b.y, ry, ry + rh);
  const dx = b.x - cx;
  const dy = b.y - cy;
  return dx * dx + dy * dy <= b.r * b.r;
}

function bounceWalls(state: GameState, includeBottom: boolean): string[] {
  const events: string[] = [];
  const b = state.ball;

  if (b.x - b.r < 0) {
    b.x = b.r;
    b.vx = Math.abs(b.vx);
  }
  if (b.x + b.r > state.width) {
    b.x = state.width - b.r;
    b.vx = -Math.abs(b.vx);
  }
  if (b.y - b.r < 0) {
    b.y = b.r;
    b.vy = Math.abs(b.vy);
  }
  if (includeBottom && b.y + b.r > state.height) {
    b.y = state.height - b.r;
    b.vy = -Math.abs(b.vy);
  }

  return events;
}

function freePaddleBump(state: GameState): string[] {
  const events: string[] = [];
  const p = state.paddle;
  const b = state.ball;
  if (
    b.y < 0 ||
    b.y + b.r <= p.y - p.h / 2 ||
    b.y - b.r >= p.y + p.h / 2 ||
    b.x + b.r <= p.x - p.w / 2 ||
    b.x - b.r >= p.x + p.w / 2
  ) {
    return events;
  }

  const dx = b.x - p.x;
  const dy = b.y - p.y;
  const len = Math.hypot(dx, dy) || 1;
  b.vx = (dx / len) * FREE_BALL_SPEED;
  b.vy = (dy / len) * FREE_BALL_SPEED;
  events.push('bump');
  return events;
}

function settleBricks(state: GameState, dt: number): string[] {
  const events: string[] = [];
  let allArrived = true;

  for (const brick of state.bricks) {
    if (brick.arrived) continue;
    brick.t += dt;
    const progress = clamp((brick.t - brick.delay) / FLY_DURATION, 0, 1);
    brick.y = brick.targetY + (brick.startY - brick.targetY) * (1 - easeOutCubic(progress));
    if (progress >= 1) {
      brick.arrived = true;
      brick.y = brick.targetY;
    } else {
      allArrived = false;
    }
  }

  if (allArrived) {
    state.phase = 'ready';
    events.push('bricks-settled');
  }

  return events;
}

function paddleBounce(state: GameState): boolean {
  const p = state.paddle;
  const b = state.ball;

  if (
    b.vy <= 0 ||
    b.y + b.r < p.y ||
    b.y - b.r > p.y + p.h ||
    b.x + b.r < p.x - p.w / 2 ||
    b.x - b.r > p.x + p.w / 2
  ) {
    return false;
  }

  const offset = clamp((b.x - p.x) / (p.w / 2), -1, 1);
  const angle = offset * MAX_BOUNCE_ANGLE;
  const speed = PLAY_BALL_SPEED;
  b.vx = speed * Math.sin(angle);
  b.vy = -Math.abs(speed * Math.cos(angle));
  b.y = p.y - b.r;
  return true;
}

function collideBricks(state: GameState): string[] {
  const events: string[] = [];

  for (const brick of state.bricks) {
    if (!brick.alive) continue;
    if (!circleRectHit(state.ball, brick.x, brick.y, brick.w, brick.h)) continue;

    const b = state.ball;
    const overlapX =
      Math.min(b.x + b.r, brick.x + brick.w) - Math.max(b.x - b.r, brick.x);
    const overlapY =
      Math.min(b.y + b.r, brick.y + brick.h) - Math.max(b.y - b.r, brick.y);

    if (overlapX < overlapY) {
      b.vx = brick.x + brick.w / 2 < b.x ? Math.abs(b.vx) : -Math.abs(b.vx);
      b.x = brick.x + brick.w / 2 < b.x ? brick.x + brick.w + b.r : brick.x - b.r;
    } else {
      b.vy = brick.y + brick.h / 2 < b.y ? Math.abs(b.vy) : -Math.abs(b.vy);
      b.y = brick.y + brick.h / 2 < b.y ? brick.y + brick.h + b.r : brick.y - b.r;
    }

    brick.alive = false;
    state.score += brick.points;
    events.push('brick');
  }

  return events;
}

export function update(state: GameState, dt: number): string[] {
  const events: string[] = [];
  const clampedDt = Math.max(0, Math.min(dt, 0.1));

  if (state.mode === 'free') {
    state.ball.x += state.ball.vx * clampedDt;
    state.ball.y += state.ball.vy * clampedDt;
    events.push(...bounceWalls(state, true));
    events.push(...freePaddleBump(state));
    return events;
  }

  if (state.phase === 'flying') {
    events.push(...settleBricks(state, clampedDt));
  }
  if (state.phase === 'flying' || state.phase === 'ready') {
    stickBall(state);
    return events;
  }

  if (state.phase !== 'active') return events;

  state.ball.x += state.ball.vx * clampedDt;
  state.ball.y += state.ball.vy * clampedDt;
  events.push(...bounceWalls(state, false));
  paddleBounce(state);
  events.push(...collideBricks(state));

  const allDead = state.bricks.length > 0 && state.bricks.every((b) => !b.alive);
  if (allDead) {
    if (state.level >= LEVEL_PATTERNS.length) {
      state.phase = 'won';
      events.push('game-won');
    } else {
      state.level += 1;
      loadLevel(state, state.level);
      state.phase = 'flying';
      events.push('level-complete');
    }
    return events;
  }

  if (state.ball.y - state.ball.r > state.height) {
    state.lives -= 1;
    if (state.lives <= 0) {
      state.phase = 'lost';
      events.push('life-lost');
      events.push('game-over');
      return events;
    }
    state.phase = 'ready';
    stickBall(state);
    events.push('life-lost');
  }

  return events;
}

export function render(
  state: GameState,
  ctx: CanvasRenderingContext2D,
  ballImage?: CanvasImageSource | null,
): void {
  const w = state.width;
  const h = state.height;

  ctx.clearRect(0, 0, w, h);

  if (state.mode === 'play') {
    ctx.save();
    ctx.fillStyle = 'rgba(8, 11, 24, 0.55)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    ctx.save();
    for (const brick of state.bricks) {
      if (!brick.alive) continue;
      ctx.fillStyle = brick.color;
      ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(brick.x, brick.y, brick.w, 4);
    }
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText(`SCORE ${state.score}`, 16, 26);
    ctx.fillText(`LIVES ${Math.max(0, state.lives)}`, w / 2 - 40, 26);
    ctx.fillText(`LEVEL ${state.level}`, w - 90, 26);
    if (state.phase === 'flying') {
      ctx.fillText('READY', w / 2 - 20, h - 18);
    }
    if (state.phase === 'won') {
      ctx.save();
      ctx.fillStyle = 'rgba(8,11,24,0.8)';
      ctx.fillRect(0, h / 2 - 40, w, 80);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 28px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillText('YOU WIN!', w / 2 - 70, h / 2 + 8);
      ctx.restore();
    }
    if (state.phase === 'lost') {
      ctx.save();
      ctx.fillStyle = 'rgba(8,11,24,0.8)';
      ctx.fillRect(0, h / 2 - 40, w, 80);
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 28px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillText('GAME OVER', w / 2 - 80, h / 2 + 8);
      ctx.restore();
    }
    ctx.restore();
  }

  ctx.save();
  ctx.fillStyle = state.mode === 'play' ? '#38bdf8' : '#38bdf8';
  ctx.fillRect(
    state.paddle.x - state.paddle.w / 2,
    state.paddle.y - state.paddle.h / 2,
    state.paddle.w,
    state.paddle.h,
  );
  ctx.restore();

  ctx.save();
  const b = state.ball;
  if (ballImage) {
    const size = b.r * 2;
    let dw = size;
    let dh = size;
    const iw = (ballImage as CanvasImageSource & { width?: number }).width;
    const ih = (ballImage as CanvasImageSource & { height?: number }).height;
    if (iw && ih) {
      const aspect = iw / ih;
      if (aspect >= 1) {
        dh = size / aspect;
      } else {
        dw = size * aspect;
      }
    }
    ctx.drawImage(ballImage, b.x - dw / 2, b.y - dh / 2, dw, dh);
  } else {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
  }
  ctx.restore();
}

export class BrickBreaker {
  state: GameState;
  private ballImage: CanvasImageSource | null = null;

  constructor(width: number, height: number, opts?: { state?: GameState }) {
    this.state = opts?.state ?? createGame(width, height);
  }

  update(dt: number): string[] {
    return update(this.state, dt);
  }

  startGame(): void {
    startGame(this.state);
  }

  launch(): void {
    launchBall(this.state);
  }

  setPointer(x: number, y: number): void {
    setPointer(this.state, x, y);
  }

  movePaddleBy(dx: number): void {
    movePaddleBy(this.state, dx);
  }

  setBallImage(image: CanvasImageSource | null): void {
    this.ballImage = image;
  }

  get ballImageSrc(): CanvasImageSource | null {
    return this.ballImage;
  }

  render(ctx: CanvasRenderingContext2D): void {
    render(this.state, ctx, this.ballImage);
  }
}