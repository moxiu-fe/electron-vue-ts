import { remote } from 'electron';

export function getCurrentScreen() {
  const currentWindow = remote.getCurrentWindow();
  const { x, y, width, height } = currentWindow.getBounds();
  const currScreen = remote.screen.getAllDisplays().filter(({ bounds }) => (bounds.x === x && bounds.y === y && bounds.width === width && bounds.height === height))[0];
  return currScreen;
}

export function isCursorInCurrentWindow() {
  const currentWindow = remote.getCurrentWindow();
  const { x, y } = remote.screen.getCursorScreenPoint();
  const { x: screenX, y: screenY, width, height } = currentWindow.getBounds();
  return x >= screenX && x <= (screenX + width) && y >= screenY && y <= (screenY + height);
}
