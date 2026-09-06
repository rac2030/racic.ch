import { describe, test, expect, jest } from '@jest/globals';
import {
  BrickBreaker,
  BRICK_COLORS,
  LEVEL_PATTERNS,
  parsePattern,
  type Brick,
  type GameState,
} from '../../src/lib/brick-breaker';

function steps(state: GameState, seconds: number, dt = 0.05): string[] {
  const events: string[] = [];
  let remaining = seconds;
  while (remaining > 0) {
    events.push(...new BrickBreaker(state.width, state.height, { state: state as any }).update(Math.min(dt, remaining)));
    remaining -= Math.min(dt, remaining);
  }
  return events;
}

describe('parsePattern', () => {
  test('creates one brick per non-empty cell with correct position and size', () => {
    const rows = ['YY.P', '.O.R'];
    const bricks = parsePattern(rows, 640, 480, { brickW: 100, brickH: 20, topGap: 60 });

    const first = bricks.find((b: Brick) => b.row === 0 && b.col === 0);
    expect(first).toBeDefined();
    expect(first!.x).toBe(0);
    expect(first!.y).toBe(60);
    expect(first!.w).toBe(100);
    expect(first!.h).toBe(20);
    expect(first!.color).toBe(BRICK_COLORS.Y.color);
    expect(first!.points).toBe(BRICK_COLORS.Y.points);
    expect(first!.alive).toBe(true);

    const p = bricks.find((b: Brick) => b.row === 0 && b.col === 3);
    expect(p).toBeDefined();
    expect(p!.x).toBe(300);
    expect(p!.y).toBe(60);
    expect(p!.color).toBe(BRICK_COLORS.P.color);

    const row1Col1 = bricks.find((b: Brick) => b.row === 1 && b.col === 1);
    expect(row1Col1).toBeDefined();
    expect(row1Col1!.x).toBe(100);
    expect(row1Col1!.y).toBe(80);
  });

  test('assigns distinct colors and points per brick character', () => {
    const bricks = parsePattern(['ROYGBC'], 700, 500, {});
    const colors = bricks.map((b: Brick) => b.color);
    expect(colors[0]).toBe(BRICK_COLORS.R.color);
    expect(colors[1]).toBe(BRICK_COLORS.O.color);
    expect(colors[2]).toBe(BRICK_COLORS.Y.color);
    expect(colors[3]).toBe(BRICK_COLORS.G.color);
    expect(colors[4]).toBe(BRICK_COLORS.B.color);
    expect(colors[5]).toBe(BRICK_COLORS.C.color);

    for (const b of bricks) {
      expect(b.points).toBeGreaterThan(0);
    }
  });

  test('rebuilds bricks into grid layout with fly-in offsets', () => {
    const bricks = parsePattern(['YY', 'PP'], 640, 480, { brickW: 50, brickH: 20, topGap: 80 });
    expect(bricks[0].row).toBe(0);
    expect(bricks[0].col).toBe(0);
    expect(bricks[1].row).toBe(0);
    expect(bricks[1].col).toBe(1);
    expect(bricks[2].row).toBe(1);
    expect(bricks[2].col).toBe(0);
    expect(bricks[2].targetY).toBe(100);
  });
});

describe('createGame', () => {
  test('starts in free mode with bouncy ball and free-roam paddle', () => {
    const game = new BrickBreaker(640, 480);

    expect(game.state.mode).toBe('free');
    expect(game.state.phase).toBe('free');
    expect(game.state.bricks).toHaveLength(0);
    expect(game.state.level).toBe(1);
    expect(game.state.score).toBe(0);
    expect(game.state.lives).toBe(3);
    expect(game.state.width).toBe(640);
    expect(game.state.height).toBe(480);

    const b = game.state.ball;
    expect(b.x).toBeGreaterThan(0);
    expect(b.x).toBeLessThan(640);
    expect(b.y).toBeGreaterThan(0);
    expect(b.y).toBeLessThan(480);

    const p = game.state.paddle;
    expect(p.w).toBeGreaterThan(0);
    expect(p.h).toBeGreaterThan(0);
  });

  test('ball stays inside the viewport while free-bouncing', () => {
    const game = new BrickBreaker(400, 400);
    for (let i = 0; i < 300; i++) {
      game.update(0.05);
    }
    const b = game.state.ball;
    expect(b.x).toBeGreaterThanOrEqual(b.r - 0.001);
    expect(b.x).toBeLessThanOrEqual(400 - b.r + 0.001);
    expect(b.y).toBeGreaterThanOrEqual(b.r - 0.001);
    expect(b.y).toBeLessThanOrEqual(400 - b.r + 0.001);
  });
});

describe('free mode', () => {
  test('ball bounces off the left and top walls', () => {
    const game = new BrickBreaker(640, 480);
    const s = game.state;
    s.ball.x = 30;
    s.ball.y = 300;
    s.ball.vx = -120;
    s.ball.vy = 0;
    game.update(0.5);
    const b = game.state.ball;
    expect(b.vx).toBeGreaterThan(0);
    expect(b.x).toBeGreaterThanOrEqual(b.r - 0.001);

    s.ball.x = 200;
    s.ball.y = 30;
    s.ball.vx = 0;
    s.ball.vy = -120;
    game.update(0.5);
    expect(game.state.ball.vy).toBeGreaterThan(0);
    expect(game.state.ball.y).toBeGreaterThanOrEqual(b.r - 0.001);
  });

  test('free-roam paddle bump sends the icon away from the paddle', () => {
    const game = new BrickBreaker(640, 480);
    const s = game.state;
    s.ball.x = 124;
    s.ball.y = 110;
    s.ball.vx = 0;
    s.ball.vy = 0;
    s.paddle.x = 120;
    s.paddle.y = 115;

    const events = game.update(0.05);
    expect(events).toContain('bump');

    const b = game.state.ball;
    expect(b.vx).not.toBe(0);
    expect(b.vy).not.toBe(0);
    const yAfterBump = b.y;
    game.update(0.05);
    expect(game.state.ball.y).toBeLessThan(yAfterBump);
  });
});

describe('startGame and level launch', () => {
  test('startGame switches to play mode with a full brick wall', () => {
    const game = new BrickBreaker(640, 480);
    game.startGame();

    expect(game.state.mode).toBe('play');
    expect(game.state.phase).toBe('flying');
    expect(game.state.bricks.length).toBeGreaterThan(0);
    expect(game.state.level).toBe(1);
  });

  test('bricks fly in from the top and settle in place', () => {
    const game = new BrickBreaker(640, 480);
    game.startGame();

    const s0 = game.state;
    const yBefore = s0.bricks[0].y;
    const target = s0.bricks[0].targetY;
    expect(yBefore).toBeLessThan(target);

    const events = steps(s0, 4);
    expect(events).toContain('bricks-settled');
    expect(game.state.phase).toBe('ready');

    for (const brick of game.state.bricks) {
      expect(brick.y).toBe(brick.targetY);
      expect(brick.alive).toBe(true);
    }
  });

  test('launch sends the ball up while stuck-to-paddle stays horizontal', () => {
    const game = new BrickBreaker(640, 480);
    game.startGame();
    steps(game.state, 4);

    expect(game.state.phase).toBe('ready');
    game.launch();
    expect(game.state.phase).toBe('active');
    expect(game.state.ball.vy).toBeLessThan(0);
    expect(Math.abs(game.state.ball.vx)).toBeLessThan(Math.abs(game.state.ball.vy));
  });
});

describe('paddle physics', () => {
  test('paddle deflects the ball with an angle based on hit offset', () => {
    const game = new BrickBreaker(640, 480);
    const s = game.state;
    s.mode = 'play';
    s.phase = 'active';
    s.paddle.x = 300;
    s.paddle.y = 440;
    s.paddle.w = 110;
    s.ball.x = 330;
    s.ball.y = 416;
    s.ball.vx = 0;
    s.ball.vy = 180;

    game.update(0.01);
    const b = game.state.ball;
    expect(b.vy).toBeLessThan(0);
    expect(b.vx).toBeGreaterThan(0);
    expect(b.y).toBeLessThanOrEqual(s.paddle.y - b.r + 0.001);
  });

  test('ball passes through beside the paddle without deflection', () => {
    const game = new BrickBreaker(640, 480);
    const s = game.state;
    s.mode = 'play';
    s.phase = 'active';
    s.paddle.x = 300;
    s.paddle.y = 440;
    s.paddle.w = 110;
    s.ball.x = 60;
    s.ball.y = 416;
    s.ball.vx = 0;
    s.ball.vy = 180;

    game.update(0.01);
    expect(game.state.ball.vy).toBeGreaterThan(0);
  });

  test('movePaddleBy clamps the paddle inside the viewport', () => {
    const game = new BrickBreaker(600, 800);
    const s = game.state;
    s.mode = 'play';
    s.paddle.x = 300;
    s.paddle.w = 110;

    game.movePaddleBy(10000);
    expect(s.paddle.x).toBeLessThanOrEqual(600 - s.paddle.w / 2);

    game.movePaddleBy(-100000);
    expect(s.paddle.x).toBeGreaterThanOrEqual(s.paddle.w / 2);
  });
});

describe('brick collisions and scoring', () => {
  function playState(): GameState {
    const game = new BrickBreaker(640, 480);
    const s = game.state;
    s.mode = 'play';
    s.phase = 'active';
    s.paddle.x = 300;
    s.paddle.y = 440;
    s.paddle.w = 110;
    s.ball.x = 320;
    s.ball.y = 400;
    s.ball.vx = 0;
    s.ball.vy = 0;
    s.bricks = parsePattern(['YY', 'PP'], 640, 480, { brickW: 60, brickH: 20, topGap: 100 });
    return s;
  }

  test('hitting a brick kills it, scores points and reflects the ball upward', () => {
    const s = playState();
    s.bricks = [
      { x: 100, y: 100, w: 60, h: 20, color: '#ef4444', points: 50, alive: true, row: 0, col: 0, targetY: 100, startY: -100, delay: 0, t: 0, arrived: true },
      { x: 400, y: 100, w: 60, h: 20, color: '#ef4444', points: 50, alive: true, row: 0, col: 1, targetY: 100, startY: -100, delay: 0, t: 0, arrived: true },
    ];
    s.ball.x = 130;
    s.ball.y = 130;
    s.ball.vx = 0;
    s.ball.vy = -80;

    s.score = 0;
    new BrickBreaker(s.width, s.height, { state: s as any }).update(0.05);

    expect(s.bricks[0].alive).toBe(false);
    expect(s.bricks[1].alive).toBe(true);
    expect(s.score).toBeGreaterThan(0);
    expect(s.ball.vy).toBeGreaterThan(0);
  });

  test('clearing all bricks completes the level and flies in the next one', () => {
    const s = playState();
    const levelBefore = s.level;
    steps(s, 2);
    for (const b of s.bricks) b.alive = false;

    const events = steps(s, 0.05);
    expect(events).toContain('level-complete');
    expect(s.level).toBe(levelBefore + 1);
    expect(s.phase).toBe('flying');
    expect(s.bricks.every((b: Brick) => b.alive)).toBe(true);
  });

  test('clearing the last level wins the game', () => {
    const s = playState();
    s.level = LEVEL_PATTERNS.length;
    s.bricks = parsePattern(LEVEL_PATTERNS[s.level - 1], 640, 480, {});
    steps(s, 2);
    for (const b of s.bricks) b.alive = false;

    const events = steps(s, 0.05);
    expect(events).toContain('game-won');
    expect(s.phase).toBe('won');
  });
});

describe('lives and game over', () => {
  test('dropping the ball below the bottom costs a life and resets to the paddle', () => {
    const game = new BrickBreaker(640, 480);
    const s = game.state;
    s.mode = 'play';
    s.phase = 'active';
    s.ball.x = 320;
    s.ball.y = 600;
    s.ball.vx = 0;
    s.ball.vy = -120;
    s.lives = 2;

    const events = steps(s, 0.1);
    expect(events).toContain('life-lost');
    expect(s.lives).toBe(1);
    expect(s.phase).toBe('ready');
    expect(s.ball.y).toBeLessThan(s.paddle.y);
  });

  test('losing the last life ends the game', () => {
    const game = new BrickBreaker(640, 480);
    const s = game.state;
    s.mode = 'play';
    s.phase = 'active';
    s.ball.x = 320;
    s.ball.y = 600;
    s.lives = 1;

    const events = steps(s, 0.1);
    expect(events).toContain('game-over');
    expect(s.phase).toBe('lost');
  });
});

describe('input', () => {
  test('setPointer in play mode only affects paddle x (horizontal)', () => {
    const game = new BrickBreaker(600, 800);
    const s = game.state;
    s.mode = 'play';
    const yBefore = s.paddle.y;

    game.setPointer(500, 10);
    expect(s.paddle.x).toBe(500);
    expect(s.paddle.y).toBe(yBefore);

    game.setPointer(-999, 0);
    expect(s.paddle.x).toBeGreaterThanOrEqual(s.paddle.w / 2);

    game.setPointer(9999, 0);
    expect(s.paddle.x).toBeLessThanOrEqual(600 - s.paddle.w / 2);
  });

  test('setPointer in free mode moves the paddle freely in 2D', () => {
    const game = new BrickBreaker(600, 800);
    const s = game.state;
    game.setPointer(100, 200);
    expect(s.paddle.x).toBe(100);
    expect(s.paddle.y).toBe(200);
  });
});

describe('render', () => {
  function mockCtx() {
    const ctx: Record<string, jest.Mock> = {};
    const methods = [
      'fillRect', 'fillText', 'beginPath', 'arc', 'fill', 'closePath',
      'save', 'restore', 'translate', 'rotate', 'scale', 'drawImage',
      'moveTo', 'lineTo', 'stroke', 'setTransform', 'clearRect',
    ];
    for (const m of methods) ctx[m] = jest.fn();
    ctx.canvas = { width: 640, height: 480 };
    return ctx as unknown as CanvasRenderingContext2D;
  }

  test('renders a free-mode frame without throwing', () => {
    const game = new BrickBreaker(640, 480);
    const ctx = mockCtx();
    expect(() => game.render(ctx)).not.toThrow();
    expect(ctx.arc).toHaveBeenCalled();
  });

  test('renders a play-mode frame with bricks, paddle and HUD', () => {
    const game = new BrickBreaker(640, 480);
    game.startGame();
    steps(game.state, 4);
    game.launch();
    const ctx = mockCtx();
    expect(() => game.render(ctx)).not.toThrow();
    expect(ctx.fillRect).toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalled();
  });

  test('draws the ball image when provided, else falls back to a circle', () => {
    const game = new BrickBreaker(640, 480);
    const img = {} as CanvasImageSource;
    const ctx = mockCtx();

    game.render(ctx);
    expect(ctx.drawImage).not.toHaveBeenCalled();

    game.setBallImage(img);
    game.render(ctx);
    expect(ctx.drawImage).toHaveBeenCalled();
  });

  test('preserves the ball image aspect ratio instead of squashing it into a square', () => {
    const game = new BrickBreaker(640, 480);
    const ctx = mockCtx();
    game.setBallImage({ width: 320, height: 64 } as CanvasImageSource);

    game.render(ctx);
    const [, dx, dy, dw, dh] = ctx.drawImage.mock.calls[0];
    const size = game.state.ball.r * 2;
    expect(dw).toBe(size);
    expect(dh).toBeCloseTo(size / 5);
    expect(dx).toBeCloseTo(game.state.ball.x - size / 2);
    expect(dy).toBeCloseTo(game.state.ball.y - dh / 2);
  });

  test('renders won and lost overlays', () => {
    const game = new BrickBreaker(640, 480);
    game.startGame();
    game.state.phase = 'won';
    game.render(mockCtx());

    game.state.phase = 'lost';
    game.render(mockCtx());
  });

  test('renders a ready/launch hint while bricks are flying in', () => {
    const game = new BrickBreaker(640, 480);
    game.startGame();
    game.state.phase = 'flying';
    const ctx = mockCtx();
    game.render(ctx);
    expect(ctx.fillText).toHaveBeenCalledWith(
      'READY',
      expect.any(Number),
      expect.any(Number),
    );
  });
});