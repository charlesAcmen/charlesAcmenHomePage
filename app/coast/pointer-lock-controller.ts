export type PointerLockMode = 'free' | 'locked' | 'display';

type PointerLockState = {
  locked: boolean;
  mode: PointerLockMode;
};

type PointerLockControllerOptions = {
  element: HTMLElement;
  onChange: (state: PointerLockState) => void;
};

const REARM_DELAY_MS = 1400;

export function createPointerLockController(options: PointerLockControllerOptions) {
  let mode: PointerLockMode = 'free';
  let pending = false;
  let displayExitPending = false;
  let lastExitAt = Number.NEGATIVE_INFINITY;

  const publish = () => options.onChange({
    locked: document.pointerLockElement === options.element,
    mode,
  });

  const onPointerLockChange = () => {
    pending = false;
    if (document.pointerLockElement === options.element) {
      mode = 'locked';
      displayExitPending = false;
    } else {
      if (mode === 'locked' || displayExitPending) lastExitAt = performance.now();
      mode = displayExitPending ? 'display' : 'free';
      displayExitPending = false;
    }
    publish();
  };

  const onPointerLockError = () => {
    pending = false;
    if (mode !== 'display') mode = 'free';
    publish();
  };

  const request = () => {
    if (mode !== 'free' || pending || document.pointerLockElement === options.element) return false;
    if (performance.now() - lastExitAt < REARM_DELAY_MS) return false;

    pending = true;
    try {
      const result = options.element.requestPointerLock();
      void Promise.resolve(result).catch(() => {
        pending = false;
      });
      return true;
    } catch {
      pending = false;
      return false;
    }
  };

  document.addEventListener('pointerlockchange', onPointerLockChange);
  document.addEventListener('pointerlockerror', onPointerLockError);

  return {
    request,
    isDisplayMode() {
      return mode === 'display' || displayExitPending;
    },
    enterDisplayMode() {
      if (document.pointerLockElement === options.element) {
        displayExitPending = true;
        document.exitPointerLock();
        return;
      }
      mode = 'display';
      publish();
    },
    leaveDisplayModeAndRequest() {
      if (mode !== 'display') return request();
      if (performance.now() - lastExitAt < REARM_DELAY_MS) return false;
      mode = 'free';
      publish();
      return request();
    },
    dispose() {
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('pointerlockerror', onPointerLockError);
      if (document.pointerLockElement === options.element) document.exitPointerLock();
    },
  };
}
