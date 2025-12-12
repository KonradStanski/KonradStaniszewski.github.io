import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";

const Sketch = dynamic(() => import("react-p5"), { ssr: false });

// World constants
const WORLD_SIZE = 3000;
const WIND_GRID_SIZE = 150; // Size of each wind cell
const GRID_CELLS = Math.ceil(WORLD_SIZE / WIND_GRID_SIZE);

// Island data
const ISLANDS = [
  { x: 500, y: 500, radius: 80 },
  { x: 2500, y: 600, radius: 120 },
  { x: 1800, y: 1400, radius: 60 },
  { x: 700, y: 2200, radius: 100 },
  { x: 2300, y: 2400, radius: 90 },
  { x: 1500, y: 800, radius: 50 },
];

export const SailingSimulator = (): JSX.Element => {
  const [showVectors, setShowVectors] = useState(true);
  const [showHelp, setShowHelp] = useState(true);

  // Use refs to persist state across renders
  const boatState = useRef({
    x: WORLD_SIZE / 2,
    y: WORLD_SIZE / 2,
    speed: 0,
    heading: 0, // cardinal direction in radians, 0 = east
    angularVel: 0,
    boomAngle: 90, // from 0 to 180, 90 being straight back
    boomAngularVel: 0,
  });

  const controlsRef = useRef({
    sailTrimSlider: null as any,
    rudderSlider: null as any,
    motorPower: null as any,
  });

  // Wind field grid (generated once)
  const windField = useRef<{ x: number; y: number }[][]>([]);

  // Physics constants
  const BOAT_MASS = 100;
  const HULL_WATER_DRAG = 0.08;      // Drag from water on hull
  const HULL_WIND_COEF = 0.02;       // Wind force on hull (small)
  const RUDDER_EFFECTIVENESS = 0.02;
  const SAIL_AREA = 20;
  const SAIL_LIFT_COEF = 0.5;
  const SAIL_DRAG_COEF = 0.1;
  const MAX_SPEED = 3;
  const MIN_SPEED = 0.001;
  const ANGULAR_DRAG = 0.92;

  // Generate smooth wind field using sine/cosine combinations
  const generateWindField = () => {
    const field: { x: number; y: number }[][] = [];

    for (let i = 0; i <= GRID_CELLS; i++) {
      field[i] = [];
      for (let j = 0; j <= GRID_CELLS; j++) {
        // Use multiple overlapping sine waves for natural flow
        const worldX = i * WIND_GRID_SIZE;
        const worldY = j * WIND_GRID_SIZE;

        // Base wind direction (generally blowing south-east)
        let windX = 0.3;
        let windY = 0.5;

        // Add large-scale swirls
        const swirl1 = Math.sin(worldX * 0.002 + worldY * 0.001) * 0.4;
        const swirl2 = Math.cos(worldY * 0.0015 - worldX * 0.001) * 0.3;

        // Add medium-scale variations
        const med1 = Math.sin(worldX * 0.005) * 0.2;
        const med2 = Math.cos(worldY * 0.004) * 0.2;

        windX += swirl1 + med1;
        windY += swirl2 + med2;

        // Normalize and scale to reasonable wind speed
        const mag = Math.sqrt(windX * windX + windY * windY);
        const targetMag = 0.8 + Math.sin(worldX * 0.003 + worldY * 0.002) * 0.3;
        windX = (windX / mag) * targetMag;
        windY = (windY / mag) * targetMag;

        field[i][j] = { x: windX, y: windY };
      }
    }

    return field;
  };

  // Get interpolated wind at a position using 9-cell weighted average
  const getWindAt = (worldX: number, worldY: number): { speed: number; direction: number } => {
    /*
      Bilinear interpolation of wind vector at (worldX, worldY)
      return a speed and direction vector
    */
    const field = windField.current;
    if (!field || field.length === 0) {
      return { speed: 0, direction: 0 };
    }

    // Find the grid cell
    const gridX = worldX / WIND_GRID_SIZE;
    const gridY = worldY / WIND_GRID_SIZE;
    const cellX = Math.floor(gridX);
    const cellY = Math.floor(gridY);

    let totalWeight = 0;
    let windX = 0;
    let windY = 0;

    // Sample the 9 surrounding cells
    for (let di = -1; di <= 1; di++) {
      for (let dj = -1; dj <= 1; dj++) {
        const i = cellX + di;
        const j = cellY + dj;

        // Bounds check
        if (i < 0 || i > GRID_CELLS || j < 0 || j > GRID_CELLS) continue;

        // Calculate distance to cell center
        const cellCenterX = (i + 0.5) * WIND_GRID_SIZE;
        const cellCenterY = (j + 0.5) * WIND_GRID_SIZE;
        const dx = worldX - cellCenterX;
        const dy = worldY - cellCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Weight by inverse distance (closer cells have more influence)
        const weight = 1 / (distance + WIND_GRID_SIZE * 0.1);
        totalWeight += weight;

        windX += field[i][j].x * weight;
        windY += field[i][j].y * weight;
      }
    }

    if (totalWeight > 0) {
      windX /= totalWeight;
      windY /= totalWeight;
    }

    const windSpeed = Math.sqrt(windX * windX + windY * windY);
    const windDirection = Math.atan2(windY, windX); // Radians

    return { speed: windSpeed, direction: windDirection };
  };

  const setup = (p5: any, canvasParentRef: Element) => {
    const width = canvasParentRef.getBoundingClientRect().width;
    const height = Math.min(600, width * 0.75);
    p5.createCanvas(width, height).parent(canvasParentRef);

    // Initialize boat in center of world
    boatState.current.x = WORLD_SIZE / 2;
    boatState.current.y = WORLD_SIZE / 2;

    // Generate wind field
    windField.current = generateWindField();

    // Create sliders - positioned in bottom left next to labels
    const rect = canvasParentRef.firstElementChild?.getBoundingClientRect();
    const top = rect?.top || 0;
    const left = rect?.left || 0;

    controlsRef.current.sailTrimSlider = p5.createSlider(0, 90, 45, 1);
    controlsRef.current.sailTrimSlider.position(left + 10, top + 85);
    controlsRef.current.sailTrimSlider.style("width", "120px");

    controlsRef.current.rudderSlider = p5.createSlider(-45, 45, 0, 1);
    controlsRef.current.rudderSlider.position(left + 10, top + 115);
    controlsRef.current.rudderSlider.style("width", "120px");

    controlsRef.current.motorPower = p5.createSlider(0, 100, 0, 1);
    controlsRef.current.motorPower.position(left + 10, top + 145);
    controlsRef.current.motorPower.style("width", "120px");
  };

  const draw = (p5: any) => {
    p5.background(30, 90, 150); // Ocean blue

    const sailTrim = controlsRef.current.sailTrimSlider?.value() || 45;
    const rudderAngle = controlsRef.current.rudderSlider?.value() || 0;
    const motorPower = controlsRef.current.motorPower.value() || 0;

    updatePhysics(sailTrim, rudderAngle, motorPower);

    const boat = boatState.current;

    // Camera follows boat
    p5.push();
    p5.translate(p5.width / 2 - boat.x, p5.height / 2 - boat.y);

    // Draw world elements
    drawWindField(p5);
    drawIslands(p5);
    drawWorldBorder(p5);
    if (showVectors) {
      drawBoatVectors(p5);
    }
    drawBoat(p5, sailTrim, rudderAngle);

    p5.pop();

    // Screen-space UI
    drawUI(p5, sailTrim, rudderAngle);
    drawMinimap(p5);
  };

  // ============================================================
  // PHYSICS UPDATE - Clear force pipeline
  // ============================================================
  const updatePhysics = (sheetSetting: number, rudderAngle: number, motorPower: number) => {
    const boat = boatState.current;
    const wind = getWindAt(boat.x, boat.y);
    // get wind strength and direction

    // We want to calculate 
  };

  const drawWindField = (p5: any) => {
    const boat = boatState.current;
    const cameraX = boat.x - p5.width / 2;
    const cameraY = boat.y - p5.height / 2;

    // Only draw visible wind arrows
    const startI = Math.max(0, Math.floor(cameraX / WIND_GRID_SIZE) - 1);
    const endI = Math.min(GRID_CELLS, Math.ceil((cameraX + p5.width) / WIND_GRID_SIZE) + 1);
    const startJ = Math.max(0, Math.floor(cameraY / WIND_GRID_SIZE) - 1);
    const endJ = Math.min(GRID_CELLS, Math.ceil((cameraY + p5.height) / WIND_GRID_SIZE) + 1);

    p5.stroke(100, 150, 200, 150);
    p5.strokeWeight(1);
    p5.fill(100, 150, 200, 150);

    for (let i = startI; i <= endI; i++) {
      for (let j = startJ; j <= endJ; j++) {
        if (windField.current[i] && windField.current[i][j]) {
          const wind = windField.current[i][j];
          const centerX = (i + 0.5) * WIND_GRID_SIZE;
          const centerY = (j + 0.5) * WIND_GRID_SIZE;

          // Draw small arrow
          const mag = Math.sqrt(wind.x * wind.x + wind.y * wind.y);
          const arrowLen = 20 * mag;
          const endX = centerX + (wind.x / mag) * arrowLen;
          const endY = centerY + (wind.y / mag) * arrowLen;

          p5.line(centerX, centerY, endX, endY);

          // Arrow head
          const angle = Math.atan2(wind.y, wind.x);
          p5.push();
          p5.translate(endX, endY);
          p5.rotate(angle);
          p5.triangle(-6, -3, -6, 3, 0, 0);
          p5.pop();
        }
      }
    }
  };

  const drawIslands = (p5: any) => {
    for (const island of ISLANDS) {
      // Island base (sand)
      p5.fill(194, 178, 128);
      p5.stroke(160, 145, 100);
      p5.strokeWeight(2);
      p5.ellipse(island.x, island.y, island.radius * 2, island.radius * 1.8);

      // Some greenery
      p5.fill(34, 139, 34);
      p5.noStroke();
      const treeCount = Math.floor(island.radius / 20);
      for (let t = 0; t < treeCount; t++) {
        const angle = (t / treeCount) * Math.PI * 2 + island.x * 0.01;
        const dist = island.radius * 0.4;
        const treeX = island.x + Math.cos(angle) * dist;
        const treeY = island.y + Math.sin(angle) * dist * 0.9;
        p5.ellipse(treeX, treeY, 25, 25);
      }
      // Central tree cluster
      p5.ellipse(island.x, island.y, 30, 30);
    }
  };

  const drawWorldBorder = (p5: any) => {
    p5.noFill();
    p5.stroke(255, 100, 100);
    p5.strokeWeight(4);
    p5.rect(0, 0, WORLD_SIZE, WORLD_SIZE);

    // Corner markers
    p5.fill(255, 100, 100);
    p5.noStroke();
    p5.textSize(16);
    p5.text("World Border", 20, 30);
  };

  const drawBoatVectors = (p5: any) => {
  };

  const drawArrow = (p5: any, x1: number, y1: number, x2: number, y2: number) => {
    p5.line(x1, y1, x2, y2);
    p5.push();
    const angle = Math.atan2(y2 - y1, x2 - x1);
    p5.translate(x2, y2);
    p5.rotate(angle);
    p5.triangle(-6, -3, -6, 3, 0, 0);
    p5.pop();
  };

  const drawBoat = (p5: any, sailTrim: number, rudderAngle: number) => {
    const boat = boatState.current;

    p5.push();
    p5.translate(boat.x, boat.y);
    p5.rotate(boat.heading);

    // Boat scale
    const s = 4.0;

    // Hull
    p5.fill(139, 69, 19);
    p5.stroke(0);
    p5.strokeWeight(2);
    p5.beginShape();
    p5.vertex(0, -20 * s);      // bow
    p5.vertex(-8 * s, -5 * s);
    p5.vertex(-8 * s, 15 * s);
    p5.vertex(0, 20 * s);       // stern
    p5.vertex(8 * s, 15 * s);
    p5.vertex(8 * s, -5 * s);
    p5.endShape(p5.CLOSE);

    // Deck detail
    p5.fill(160, 90, 40);
    p5.noStroke();
    p5.ellipse(0, 0, 10 * s, 20 * s);

    // Keel (underwater, shown as darker)
    p5.fill(60, 60, 80);
    p5.stroke(40, 40, 60);
    p5.strokeWeight(1);
    p5.rect(-2 * s, 15 * s, 4 * s, 10 * s);

    // Mast position
    const mastX = 0;
    const mastY = -5 * s;

    // Mast
    p5.stroke(80, 50, 20);
    p5.strokeWeight(4);
    p5.line(mastX, mastY, mastX, mastY - 30 * s);

    // Calculate sail angle for drawing (based on wind and sheet setting)
    const sailAngle = boat.boomAngle * (Math.PI / 180) + 90;

    // Boom and sail
    const boomLength = 25 * s;
    const sailWidth = 6 * s;
    const boomEndX = mastX + Math.sin(sailAngle) * boomLength;
    const boomEndY = mastY - Math.cos(sailAngle) * boomLength;

    // Sail (rectangle on the boom)
    p5.push();
    p5.translate(mastX, mastY);
    p5.rotate(sailAngle);

    // Sail cloth
    p5.fill(255, 255, 250, 240);
    p5.stroke(200, 200, 200);
    p5.strokeWeight(1);
    p5.rect(-sailWidth / 2, -boomLength, sailWidth, boomLength);

    // Boom (horizontal spar at bottom of sail)
    p5.stroke(100, 70, 30);
    p5.strokeWeight(3);
    p5.line(0, 0, 0, -boomLength);

    p5.pop();

    // Mainsheet rope - from boom end to cleat near stern
    const cleatX = 0;
    const cleatY = 10 * s;
    p5.stroke(120, 80, 40);
    p5.strokeWeight(2);
    p5.line(boomEndX, boomEndY, cleatX, cleatY);

    // Cleat
    p5.fill(60, 60, 60);
    p5.noStroke();
    p5.rect(cleatX - 3, cleatY - 2, 6, 4);

    // Rudder
    p5.push();
    p5.translate(0, 20 * s);
    p5.rotate((rudderAngle * Math.PI) / 180);
    p5.fill(80, 80, 100);
    p5.stroke(40, 40, 60);
    p5.strokeWeight(1);
    p5.rect(-2 * s, 0, 4 * s, 10 * s);
    p5.pop();

    p5.pop();
  };

  const drawMinimap = (p5: any) => {
    const mapSize = 100;
    const mapX = p5.width - mapSize - 10;
    const mapY = p5.height - mapSize - 10;
    const scale = mapSize / WORLD_SIZE;

    // Background
    p5.fill(30, 60, 100, 200);
    p5.stroke(255);
    p5.strokeWeight(1);
    p5.rect(mapX, mapY, mapSize, mapSize);

    // Islands
    p5.fill(194, 178, 128);
    p5.noStroke();
    for (const island of ISLANDS) {
      const ix = mapX + island.x * scale;
      const iy = mapY + island.y * scale;
      const ir = Math.max(3, island.radius * scale);
      p5.ellipse(ix, iy, ir * 2, ir * 2);
    }

    // Boat position
    const boat = boatState.current;
    const bx = mapX + boat.x * scale;
    const by = mapY + boat.y * scale;
    p5.fill(255, 0, 0);
    p5.noStroke();
    p5.circle(bx, by, 6);

    // Boat heading indicator
    p5.stroke(255, 0, 0);
    p5.strokeWeight(1);
    const headLen = 8;
    p5.line(
      bx,
      by,
      bx + Math.sin(boat.heading) * headLen,
      by - Math.cos(boat.heading) * headLen
    );
  };

  const drawUI = (p5: any, sailTrim: number, rudderAngle: number) => {
    const boat = boatState.current;

    p5.fill(0);
    p5.noStroke();
    p5.textSize(13);
    p5.textAlign(p5.LEFT);

    // Stats display
    const speed = boat.speed;
    p5.text(`Speed: ${speed.toFixed(2)}`, 10, 20);

    const headingDeg = ((boat.heading * 180) / Math.PI + 360) % 360;
    p5.text(`Heading: ${headingDeg.toFixed(0)}°`, 10, 37);

    p5.text(`Position: (${boat.x.toFixed(0)}, ${boat.y.toFixed(0)})`, 10, 54);

    // Vector legend (if shown)
    if (showVectors) {
      p5.textSize(11);
      p5.fill(0, 200, 0);
      p5.text("Green: Apparent Wind", 10, 71);
      p5.fill(100, 100, 255);
      p5.text("Blue: True Wind", 120, 71);
      p5.fill(255, 0, 0);
      p5.text("Red: Velocity", 210, 71);
    }

    // Control labels (next to sliders at y=85 and y=115)
    p5.fill(0);
    p5.textSize(12);
    p5.text(`Sheet: ${sailTrim}°`, 140, 97);
    p5.text(`Rudder: ${rudderAngle}°`, 140, 127);
    p5.text(`Motor: ${controlsRef.current.motorPower.value()}%`, 140, 157);

    if (showHelp) {
      p5.fill(0, 0, 0, 200);
      p5.rect(p5.width / 2 - 180, p5.height / 2 - 90, 360, 180);
      p5.fill(255);
      p5.textAlign(p5.CENTER);
      p5.textSize(14);
      p5.text("Sailing Simulator", p5.width / 2, p5.height / 2 - 65);
      p5.textSize(11);
      p5.text("Use sliders to control sheet and rudder", p5.width / 2, p5.height / 2 - 40);
      p5.text("Navigate around the islands using wind vectors", p5.width / 2, p5.height / 2 - 20);
      p5.text("Wind varies across the map - use the minimap", p5.width / 2, p5.height / 2);
      p5.text("to track your position", p5.width / 2, p5.height / 2 + 15);
      p5.text("Click to dismiss", p5.width / 2, p5.height / 2 + 50);
    }
  };

  const mousePressed = () => {
    if (showHelp) {
      setShowHelp(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex gap-4">
        <button
          onClick={() => setShowVectors(!showVectors)}
          className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {showVectors ? "Hide" : "Show"} Vectors
        </button>
      </div>
      <Sketch setup={setup} draw={draw} mousePressed={mousePressed} />
    </div>
  );
};

export default SailingSimulator;
