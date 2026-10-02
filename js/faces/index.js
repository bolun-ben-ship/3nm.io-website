// LENS — the six faces, in rail order (front → back). CONTRACT §5.6, §6.
// Every face goes through wrapFace(): 2048 × 1280 logical space, glass tint, cached kit, day = static.
import { wrapFace } from './kit.js';
import face1 from './face-1.js';
import face2 from './face-2.js';
import face3 from './face-3.js';
import face4 from './face-4.js';
import face5 from './face-5.js';
import face6 from './face-6.js';

export default [face1, face2, face3, face4, face5, face6].map(wrapFace);
