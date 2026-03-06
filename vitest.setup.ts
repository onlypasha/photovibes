import '@testing-library/jest-dom';
import { Canvas } from 'canvas';

// Setup canvas for tests
const patchedGetContext = function (
  this: HTMLCanvasElement,
  contextType: string
): ReturnType<typeof HTMLCanvasElement.prototype.getContext> {
  if (contextType === '2d') {
    const canvas = new Canvas(this.width || 300, this.height || 150);
    return canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
  }
  return null;
};

global.HTMLCanvasElement.prototype.getContext =
  patchedGetContext as typeof HTMLCanvasElement.prototype.getContext;
