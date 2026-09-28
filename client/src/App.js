import { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  // const [score, setScore] = useState(0);

  // Game state ref to avoid closure issues
  const gameState = useRef({
    animationId: null,
    ball: null,
    gravity: 2,
    friction: 0.98,
    mouse: { x: null, y: null, isDown: false, lastX: null, lastY: null },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * .8;
      canvas.height = window.innerHeight * .8;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize ball
    gameState.current.ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 25,
      color: "#00bcd4",
      vx: 0,
      vy: 0,
      bounceX: false,
      bounceY: false
    };

    // Mouse events
    const startDrag = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gameState.current.mouse = {
        x,
        y,
        lastX: x,
        lastY: y,
        isDown: true,
      };
    };

    const drag = (e) => {
      if (!gameState.current.mouse.isDown) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dx = x - gameState.current.mouse.lastX;
      const dy = y - gameState.current.mouse.lastY;

      gameState.current.ball.vx += dx * 0.5;
      gameState.current.ball.vy += dy * 0.5;

      gameState.current.mouse.lastX = x;
      gameState.current.mouse.lastY = y;
    };

    const endDrag = () => {
      gameState.current.mouse.isDown = false;
    };

    canvas.addEventListener("mousedown", startDrag);
    canvas.addEventListener("mousemove", drag);
    canvas.addEventListener("mouseup", endDrag);
    canvas.addEventListener("mouseleave", endDrag);

    // Touch support
    canvas.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      startDrag({ clientX: touch.clientX, clientY: touch.clientY });
    });

    canvas.addEventListener("touchmove", (e) => {
      e.preventDefault(); // Prevent scrolling
      const touch = e.touches[0];
      drag({ clientX: touch.clientX, clientY: touch.clientY });
    }, { passive: false });

    canvas.addEventListener("touchend", endDrag);

    // Game loop
    const gameLoop = async () => {
      // await setTimeout(function() {}, 500)
      const { width, height } = canvas;
      const ball = gameState.current.ball;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply gravity
      ball.vy += gameState.current.gravity;

      // Update position
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Apply friction
      ball.vx *= gameState.current.friction;
      ball.vy *= gameState.current.friction;
      
      // Bounce on walls
      if (width - ball.x <= ball.radius) { // Bottom
        ball.x = width - ball.radius;
        ball.vx *= -1;
        ball.bounceX = true;
        // setScore((prev) => prev + 1);
      } else if (ball.x - ball.radius < 0) { // Top
        ball.x = ball.radius;
        ball.vx *= -1;
        ball.bounceX = true;
        // setScore((prev) => prev + 1);
      } else {
        ball.bounceX = false;
      }

      if (height - ball.y <= ball.radius) { // Bottom
        ball.y = height - ball.radius;
        ball.vy *= -1;
        ball.bounceY = true;
      } else if (ball.y - ball.radius < 0) { // Top
        ball.y = ball.radius;
        ball.vy *= -1;
        ball.bounceY = true;
      } else {
        ball.bounceY = false;
      }


      let KineticEnergyLoss = 0.20

      let min = Math.min(Math.round(Math.abs(ball.vy)*1000)/1000, Math.round(Math.abs(ball.vx)*1000)/1000);
      let max = Math.max(Math.round(Math.abs(ball.vy)*1000)/1000, Math.round(Math.abs(ball.vx)*1000)/1000);

      let eqMin = (KineticEnergyLoss * (min / max));
      let eqMax = (KineticEnergyLoss * Math.abs(1 - (min / max)));
      if (ball.bounceX) {
        if (Math.abs(ball.vx) > Math.abs(ball.vy)) {
          ball.vx -= ball.vx*eqMax;
          ball.vy -= ball.vy*eqMin;
        } else {
          ball.vx -= ball.vx*eqMin;
          ball.vy -= ball.vy*eqMax;
        }
      } else if (ball.bounceY) {
        if (Math.abs(ball.vy) > Math.abs(ball.vx)) {
          ball.vy -= ball.vy*eqMax;
          ball.vx -= ball.vx*eqMin;
        } else {
          ball.vy -= ball.vy*eqMin;
          ball.vx -= ball.vx*eqMax;
        }
      }

      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = ball.color;
      ctx.fill();
      ctx.closePath();

      gameState.current.animationId = requestAnimationFrame(gameLoop);
    };

    gameState.current.animationId = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousedown", startDrag);
      canvas.removeEventListener("mousemove", drag);
      canvas.removeEventListener("mouseup", endDrag);
      canvas.removeEventListener("mouseleave", endDrag);
      canvas.removeEventListener("touchstart", startDrag);
      canvas.removeEventListener("touchmove", drag);
      canvas.removeEventListener("touchend", endDrag);
      cancelAnimationFrame(gameState.current.animationId);
    };
  }, []);
  //min-h-screen
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
      {/* <h1 className="text-3xl font-bold mb-4">🟢 Bouncy Ball Physics</h1>
      <p className="mb-6 text-lg">Click and flick to give it velocity!</p> */}
      <canvas
        ref={canvasRef}
        className="border border-gray-700 rounded shadow-lg bg-black"
      // width={window.innerWidth}
      // height={window.innerHeight}
      />
      {/* <div className="mt-4"> */}
      {/* <p className="text-xl">Bounces: <strong>{Math.floor(score)}</strong></p> */}
      {/* </div> */}
    </div>
  );
}