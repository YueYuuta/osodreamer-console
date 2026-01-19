export const STYLES = `
:root {
  --odc-primary: #3b82f6; 
  --odc-bg: rgba(22, 22, 24, 0.95);
  --odc-trigger-bg: rgba(22, 22, 24, 0.85);
  --odc-text: #d4d4d8;
  --odc-border: rgba(255, 255, 255, 0.1);
}

.odc { font-family: -apple-system, BlinkMacSystemFont, "JetBrains Mono", monospace; font-size: 11px; line-height: 1.4; text-align:left; }
.odc * { box-sizing: border-box; }

/* Trigger Button */
.odc__trigger { 
    position: fixed; width: 48px; height: 48px; 
    background: var(--odc-trigger-bg); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 14px; 
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); 
    display: flex; align-items: center; justify-content: center; 
    z-index: 2147483647; cursor: pointer; transition: transform 0.1s;
    touch-action: none;
    color: #fff; font-weight: bold; font-size: 10px; overflow: hidden;
}
.odc__trigger:active { transform: scale(0.95); }
.odc__dot { width: 10px; height: 10px; background: var(--odc-primary); border-radius: 50%; box-shadow: 0 0 10px var(--odc-primary); }

/* Panel */
.odc__panel { 
    display: none; position: fixed; bottom: 0; left: 0; width: 100%; height: 60vh; max-height: 80vh;
    background: var(--odc-bg); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid var(--odc-border); border-top-left-radius: 18px; border-top-right-radius: 18px;
    flex-direction: column; z-index: 2147483646; color: var(--odc-text); box-shadow: 0 -10px 40px rgba(0,0,0,0.3);
    overflow: hidden; /* Fixes square corners on children */
}

/* Tabs */
.odc__header { 
    display: flex; padding: 6px 10px; border-bottom: 1px solid rgba(255,255,255,0.06); align-items: center; user-select: none; gap: 8px; 
}
.odc__tabs-scroll {
    display: flex; gap: 8px; overflow-x: auto; -ms-overflow-style: none; scrollbar-width: none;
}
.odc__tabs-scroll::-webkit-scrollbar { display: none; }

.odc__tab { flex: 0 0 auto; padding: 8px 12px; text-align: center; color: #71717a; cursor: pointer; border-radius: 8px; font-weight: 500; transition: 0.2s; white-space: nowrap; }
.odc__tab--active { color: #fff; background: rgba(255,255,255,0.08); }
.odc__section-title { color: var(--odc-primary); font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; margin: 20px 0 8px 0; border-bottom: 1px solid #3f3f46; padding-bottom: 4px; }
.odc__spacer { flex: 1; min-width: 10px; }
.odc__search { display: none; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 4px 8px; color: #fff; outline: none; width: 140px; font-size: 10px; flex-shrink: 0; }

.odc__close { 
    width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; color: #ef4444; font-weight: bold; cursor: pointer; flex-shrink: 0; 
    border-radius: 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); /* Container style */
}
.odc__close:active { background: rgba(239, 68, 68, 0.2); }

/* Content */
.odc__content { flex: 1; overflow-y: auto; padding: 0; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }

/* Rows */
.odc__row { padding: 6px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; gap: 8px; }
.odc__row--warn { background: rgba(251, 191, 36, 0.08); border-left: 2px solid #f59e0b; }
.odc__row--error { background: rgba(239, 68, 68, 0.08); border-left: 2px solid #ef4444; }
.odc__time { color: #52525b; min-width: 45px; font-size: 10px; margin-top: 1px; }

/* Network */
.odc__net { display: grid; grid-template-columns: 40px 35px 1fr 45px; gap: 10px; padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); align-items: center; cursor: pointer; }
.odc__net:active { background: rgba(255,255,255,0.03); }
.odc__method { font-weight: 700; color: #e4e4e7; font-size: 10px; }
.odc__status--ok { color: #34d399; } .odc__status--err { color: #f87171; }
.odc__url { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #a1a1aa; }

/* Overlay */
.odc__overlay { 
    position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
    background-color: #18181b; /* Solid base */
    background-image: linear-gradient(var(--odc-bg), var(--odc-bg)); /* Tint on top */
    z-index: 20; display: none; flex-direction: column; 
    animation: odc-slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes odc-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }

.odc__ov-head { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); }
.odc__ov-body { flex: 1; padding: 15px; overflow-y: auto; }

/* Utils */
.odc__section { color: var(--odc-primary); font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; margin: 20px 0 8px 0; border-bottom: 1px solid #3f3f46; padding-bottom: 4px; }
.odc__kv { display: flex; margin-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 2px; }
.odc__k { color: #a1a1aa; min-width: 90px; font-weight: 600; } .odc__v { color: #e4e4e7; word-break: break-all; }
.odc__input-box { border-top: 1px solid rgba(255,255,255,0.1); padding: 8px; background: #000; }
.odc__input { width: 100%; background: transparent; border: none; color: #fff; font-family: monospace; outline: none; }

/* JSON Viewer */
details > summary { list-style: none; cursor: pointer; color: #71717a; outline: none; }
details[open] > summary { color: #fff; margin-bottom: 4px; }
.od-null { color: #f472b6; } .od-num { color: #60a5fa; } .od-str { color: #a78bfa; } .od-key { color: #94a3b8; margin-right: 5px; }

/* Mobile Optimizations */
@media (max-width: 600px) {
  .odc__panel { height: 80vh; }
  .odc__tab { padding: 8px 12px; font-size: 10px; }
  
  .odc__header { 
    display: grid; grid-template-columns: 1fr auto; gap: 8px 4px; flex-wrap: wrap; 
  }
  .odc__tabs-scroll { grid-column: 1; width: 100%; }
  .odc__close { grid-column: 2; }
  .odc__spacer { display: none; }
  .odc__search { 
    grid-column: 1 / -1; width: 100%; order: 10; margin-top: 0; 
    font-size: 11px; padding: 6px 8px; /* Easier to tap */
  } 
}
`;
