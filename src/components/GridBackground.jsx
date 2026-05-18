import { useEffect, useRef } from "react";
import "../styles/GridBackground.css";

function GridBackground() {
  const canvasRef = useRef();
  const mouse = useRef({ x: -9999, y: -9999 });
  const animRef = useRef();

  useEffect(() => {
    function onMouseMove(e) {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const SPACING = 40;
    const STRENGTH = 80;
    const RADIUS = 120;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    window.addEventListener("mousemove", onMouseMove);

    function draw() {
      const { width, height } = canvas;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "#0f1117";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(79, 255, 176, 0.25)";
      ctx.lineWidth = 0.7;

      for (let x = 0; x <= width + SPACING; x += SPACING) {
        ctx.beginPath();
        let started = false;

        for (let y = 0; y <= height + SPACING; y += 4) {
          const dx = x - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pull = Math.max(0, 1 - dist / RADIUS);
          const warpX = x - dx * pull * (STRENGTH / (dist + 1));
          const warpY = y - dy * pull * (STRENGTH / (dist + 1));

          if (!started) {
            ctx.moveTo(warpX, warpY);
            started = true;
          } else {
            ctx.lineTo(warpX, warpY);
          }
        }
        ctx.stroke();
      }

      for (let y = 0; y <= height + SPACING; y += SPACING) {
        ctx.beginPath();
        let started = false;

        for (let x = 0; x <= width + SPACING; x += 4) {
          const dx = x - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pull = Math.max(0, 1 - dist / RADIUS);
          const warpX = x - dx * pull * (STRENGTH / (dist + 1));
          const warpY = y - dy * pull * (STRENGTH / (dist + 1));

          if (!started) {
            ctx.moveTo(warpX, warpY);
            started = true;
          } else {
            ctx.lineTo(warpX, warpY);
          }
        }
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="grid-canvas" />
      <div className="custom-cursor" id="customCursor" />
    </>
  );
}

export default GridBackground;
