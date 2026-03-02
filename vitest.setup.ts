import '@testing-library/jest-dom';
import { Canvas } from 'canvas';

// Setup canvas for tests
global.HTMLCanvasElement.prototype.getContext = function (contextType: string) {
  if (contextType === '2d') {
    const canvas = new Canvas(this.width || 300, this.height || 150);
    return canvas.getContext('2d');
  }
  return null;
} as any;
