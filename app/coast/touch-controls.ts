type TouchGesture = 'journey' | 'look' | 'pinch';

type TouchPoint = {
  x: number;
  y: number;
  startX: number;
  startY: number;
  startedAt: number;
  maxDistance: number;
};

type TouchControlsOptions = {
  element: HTMLElement;
  getProgress: () => number;
  setProgress: (progress: number) => void;
  addLookDelta: (deltaX: number, deltaY: number) => void;
  activateAt: (clientX: number, clientY: number) => void;
  onInteraction: () => void;
  shouldIgnoreTarget: (target: EventTarget | null) => boolean;
};

const ROOM_LOOK_THRESHOLD = 0.9;
const TAP_SLOP = 13;
const TAP_DURATION = 620;

function distanceBetween(first: TouchPoint, second: TouchPoint) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

export function createTouchControls(options: TouchControlsOptions) {
  const touches = new Map<number, TouchPoint>();
  let gesture: TouchGesture | null = null;
  let pinchDistance = 0;
  let usedMultipleTouches = false;
  let suppressClicksUntil = 0;

  const selectSingleTouchGesture = () => (
    options.getProgress() >= ROOM_LOOK_THRESHOLD ? 'look' : 'journey'
  ) satisfies TouchGesture;

  const beginPinch = () => {
    const [first, second] = Array.from(touches.values());
    if (!first || !second) return;
    gesture = 'pinch';
    usedMultipleTouches = true;
    pinchDistance = distanceBetween(first, second);
  };

  const onPointerDown = (event: PointerEvent) => {
    if ((event.pointerType !== 'touch' && event.pointerType !== 'pen') || options.shouldIgnoreTarget(event.target)) return;
    event.preventDefault();
    options.onInteraction();
    suppressClicksUntil = performance.now() + 850;

    if (touches.size === 0) usedMultipleTouches = false;
    touches.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      startedAt: performance.now(),
      maxDistance: 0,
    });
    options.element.setPointerCapture(event.pointerId);

    if (touches.size >= 2) beginPinch();
    else gesture = selectSingleTouchGesture();
  };

  const onPointerMove = (event: PointerEvent) => {
    const point = touches.get(event.pointerId);
    if (!point) return;
    event.preventDefault();

    const deltaX = event.clientX - point.x;
    const deltaY = event.clientY - point.y;
    point.x = event.clientX;
    point.y = event.clientY;
    point.maxDistance = Math.max(
      point.maxDistance,
      Math.hypot(event.clientX - point.startX, event.clientY - point.startY),
    );

    if (touches.size >= 2) {
      const [first, second] = Array.from(touches.values());
      if (!first || !second) return;
      if (gesture !== 'pinch') beginPinch();
      const nextDistance = distanceBetween(first, second);
      const travel = nextDistance - pinchDistance;
      const referenceSize = Math.max(Math.min(options.element.clientWidth, options.element.clientHeight), 320);
      options.setProgress(options.getProgress() + travel / referenceSize * 0.78);
      pinchDistance = nextDistance;
      return;
    }

    if (gesture === 'look') {
      options.addLookDelta(deltaX, deltaY);
      return;
    }
    options.setProgress(options.getProgress() - deltaY / Math.max(options.element.clientHeight * 0.78, 1));
  };

  const finishPointer = (event: PointerEvent, allowTap: boolean) => {
    const point = touches.get(event.pointerId);
    if (!point) return;
    event.preventDefault();
    point.maxDistance = Math.max(
      point.maxDistance,
      Math.hypot(event.clientX - point.startX, event.clientY - point.startY),
    );
    const isTap = allowTap
      && !usedMultipleTouches
      && touches.size === 1
      && point.maxDistance <= TAP_SLOP
      && performance.now() - point.startedAt <= TAP_DURATION;

    touches.delete(event.pointerId);
    if (options.element.hasPointerCapture(event.pointerId)) options.element.releasePointerCapture(event.pointerId);
    if (isTap) options.activateAt(event.clientX, event.clientY);

    if (touches.size >= 2) {
      beginPinch();
    } else if (touches.size === 1) {
      const remaining = touches.values().next().value as TouchPoint;
      remaining.startX = remaining.x;
      remaining.startY = remaining.y;
      remaining.startedAt = performance.now();
      remaining.maxDistance = TAP_SLOP + 1;
      gesture = selectSingleTouchGesture();
    } else {
      gesture = null;
    }
  };

  const onPointerUp = (event: PointerEvent) => finishPointer(event, true);
  const onPointerCancel = (event: PointerEvent) => finishPointer(event, false);

  options.element.addEventListener('pointerdown', onPointerDown);
  options.element.addEventListener('pointermove', onPointerMove);
  options.element.addEventListener('pointerup', onPointerUp);
  options.element.addEventListener('pointercancel', onPointerCancel);

  return {
    shouldSuppressClick() {
      return performance.now() < suppressClicksUntil;
    },
    dispose() {
      options.element.removeEventListener('pointerdown', onPointerDown);
      options.element.removeEventListener('pointermove', onPointerMove);
      options.element.removeEventListener('pointerup', onPointerUp);
      options.element.removeEventListener('pointercancel', onPointerCancel);
      touches.clear();
    },
  };
}
