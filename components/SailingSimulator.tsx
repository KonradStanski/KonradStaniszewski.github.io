import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";

const Sketch = dynamic(() => import("react-p5"), { ssr: false });

// World constants
const WORLD_SIZE = 30000;
const WIND_GRID_SIZE = 150; // Size of each wind cell
const GRID_CELLS = Math.ceil(WORLD_SIZE / WIND_GRID_SIZE);

// Island data (scattered across the larger world)
const ISLANDS = [
  { x: 5000, y: 5000, radius: 300 },
  { x: 25000, y: 6000, radius: 450 },
  { x: 18000, y: 14000, radius: 250 },
  { x: 7000, y: 22000, radius: 400 },
  { x: 23000, y: 24000, radius: 350 },
  { x: 15000, y: 8000, radius: 200 },
  { x: 12000, y: 18000, radius: 500 },
  { x: 3000, y: 12000, radius: 280 },
  { x: 27000, y: 15000, radius: 320 },
  { x: 20000, y: 27000, radius: 380 },
  { x: 8000, y: 28000, radius: 260 },
];

export const SailingSimulator = (): JSX.Element => {
  const [showWindVectors, setShowWindVectors] = useState(true);
  const [showForceVectors, setShowForceVectors] = useState(true);
  const [showHelp, setShowHelp] = useState(true);

  // Use refs to persist state across renders
  const boatState = useRef({
    x: WORLD_SIZE / 2,
    y: WORLD_SIZE / 2,
    speed: 0.3,
    heading: 0, // cardinal direction in radians, 0 = east
    angularVel: 0,
    boomAngle: 90, // from 0 to 180, 90 being straight back
    boomAngularVel: 0,
  });

  const controlsRef = useRef({
    sailTrimSlider: null as any,
    rudderSlider: null as any,
    motorPower: null as any,
    windSlider: null as any,
    rudderActive: false,
  });

  // Wind field grid (generated once)
  const windField = useRef<{ x: number; y: number }[][]>([]);
  // Last computed vector magnitudes for UI readouts
  const vectorMetricsRef = useRef({
    trueWind: 0,
    apparentWind: 0,
    velocity: 0,
    sailForce: 0,
    forwardForce: 0,
  });

  // Physics constants
  const BOAT_MASS = 500;
  const RUDDER_EFFECTIVENESS = 0.003;
  const HULL_WATER_DRAG = 1.0;      // Drag from water on hull
  const ANGULAR_DRAG = 0.85;
  const MAX_SPEED = 8;
  const MIN_SPEED = 0.01;

  // Sail/boom physics
  const BOOM_INERTIA = 5;           // Moment of inertia of boom/sail
  const BOOM_DRAG_COEF = 2.0;        // Angular drag on boom rotation
  const SAIL_FORCE_COEF = 15;        // Force coefficient for sail
  const BOOM_LENGTH = 25;            // Length of boom (moment arm)

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

  // Get interpolated wind at a position using bilinear interpolation between grid nodes
  const getWindAt = (worldX: number, worldY: number, windAdjust: number = 0): { speed: number; direction: number } => {
    const field = windField.current;
    if (!field || field.length === 0) return { speed: 0, direction: 0 };

    // Normalized grid coordinates
    const gx = worldX / WIND_GRID_SIZE;
    const gy = worldY / WIND_GRID_SIZE;

    // Grid indices
    const i0 = Math.floor(gx);
    const j0 = Math.floor(gy);
    const i1 = i0 + 1;
    const j1 = j0 + 1;

    // Fractional part
    const sx = gx - i0;
    const sy = gy - j0;

    // Clamp indices to valid range
    const ii0 = Math.max(0, Math.min(GRID_CELLS, i0));
    const jj0 = Math.max(0, Math.min(GRID_CELLS, j0));
    const ii1 = Math.max(0, Math.min(GRID_CELLS, i1));
    const jj1 = Math.max(0, Math.min(GRID_CELLS, j1));

    // Fetch four surrounding node vectors (fallback to zero if missing)
    const v00 = field[ii0] && field[ii0][jj0] ? field[ii0][jj0] : { x: 0, y: 0 };
    const v10 = field[ii1] && field[ii1][jj0] ? field[ii1][jj0] : { x: 0, y: 0 };
    const v01 = field[ii0] && field[ii0][jj1] ? field[ii0][jj1] : { x: 0, y: 0 };
    const v11 = field[ii1] && field[ii1][jj1] ? field[ii1][jj1] : { x: 0, y: 0 };

    // Bilinear interpolate x and y components separately
    const ix0 = v00.x * (1 - sx) + v10.x * sx;
    const iy0 = v00.y * (1 - sx) + v10.y * sx;
    const ix1 = v01.x * (1 - sx) + v11.x * sx;
    const iy1 = v01.y * (1 - sx) + v11.y * sx;

    const windX = ix0 * (1 - sy) + ix1 * sy;
    const windY = iy0 * (1 - sy) + iy1 * sy;

    const windSpeed = Math.sqrt(windX * windX + windY * windY);
    const windDirection = Math.atan2(windY, windX);

    const adjustedWindSpeed = windSpeed + (windAdjust || 0) * 0.01;
    return { speed: adjustedWindSpeed, direction: windDirection };
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

    // Sheet length: 0 = tight (boom aft), 100 = loose (boom can swing perpendicular)
    controlsRef.current.sailTrimSlider = p5.createSlider(0, 100, 0, 1);
    controlsRef.current.sailTrimSlider.position(left + 10, top + 85);
    controlsRef.current.sailTrimSlider.style("width", "120px");

    controlsRef.current.rudderSlider = p5.createSlider(-45, 45, 0, 1);
    controlsRef.current.rudderSlider.position(left + 10, top + 115);
    controlsRef.current.rudderSlider.style("width", "120px");
    // Track when rudder is being actively adjusted
    controlsRef.current.rudderSlider.mousePressed(() => {
      controlsRef.current.rudderActive = true;
    });
    controlsRef.current.rudderSlider.mouseReleased(() => {
      controlsRef.current.rudderActive = false;
    });

    controlsRef.current.motorPower = p5.createSlider(0, 100, 0, 1);
    controlsRef.current.motorPower.position(left + 10, top + 145);
    controlsRef.current.motorPower.style("width", "120px");

    controlsRef.current.windSlider = p5.createSlider(40, 300, 50, 1);
    controlsRef.current.windSlider.position(left + 10, top + 175);
    controlsRef.current.windSlider.style("width", "120px");
  };

  const draw = (p5: any) => {
    p5.background(30, 90, 150);

    const sheetLength = (controlsRef.current.sailTrimSlider?.value() || 50) / 100; // 0-1
    let rudderAngle = controlsRef.current.rudderSlider?.value() || 0;
    const motorPower = controlsRef.current.motorPower.value() || 0;
    const windAdjust = (controlsRef.current.windSlider.value() || 50) - 50;

    // Return rudder to center when not being adjusted
    if (!controlsRef.current.rudderActive && controlsRef.current.rudderSlider) {
      const returnSpeed = 0.15;
      rudderAngle = rudderAngle * (1 - returnSpeed);
      if (Math.abs(rudderAngle) < 4) rudderAngle = 0;
      controlsRef.current.rudderSlider.value(rudderAngle);
    }

    updatePhysics(sheetLength, rudderAngle, motorPower, windAdjust);

    const boat = boatState.current;

    // Camera follows boat
    p5.push();
    p5.translate(p5.width / 2 - boat.x, p5.height / 2 - boat.y);

    // Draw world elements
    drawWindField(p5, windAdjust);
    drawIslands(p5);
    drawWorldBorder(p5);
    drawBoat(p5, rudderAngle);
    drawBoatVectors(p5, showWindVectors, showForceVectors, windAdjust);

    p5.pop();

    // Screen-space UI
    drawUI(p5, sheetLength, rudderAngle);
    drawMinimap(p5);
  };

  // ============================================================
  // PHYSICS UPDATE - Clear force pipeline
  // ============================================================
  const updatePhysics = (sheetLength: number, rudderAngle: number, motorPower: number, windAdjust: number) => {
    const boat = boatState.current;
    const dt = 1 / 60; // Assume 60fps

    // === GET WIND ===
    const wind = getWindAt(boat.x, boat.y, windAdjust);

    // Convert to cartesian for vector math
    const windVx = wind.speed * Math.cos(wind.direction);
    const windVy = wind.speed * Math.sin(wind.direction);

    // Boat velocity in cartesian
    const boatVx = boat.speed * Math.cos(boat.heading);
    const boatVy = boat.speed * Math.sin(boat.heading);

    // === APPARENT WIND (what the sail feels) ===
    const appWindVx = windVx - boatVx;
    const appWindVy = windVy - boatVy;

    // === SAIL/BOOM DYNAMICS ===
    // boomAngle: 0-180 degrees relative to boat, 90 = pointing aft
    // Convert to world angle:
    // - boomAngle 90 (aft) = heading + PI
    // - boomAngle 0 (starboard) = heading + PI/2
    // - boomAngle 180 (port) = heading - PI/2
    const boomLocalRad = (boat.boomAngle - 90) * Math.PI / 180;
    const boomWorldAngle = boat.heading + Math.PI + boomLocalRad;

    // Sail is along the boom direction
    const sailDirX = Math.cos(boomWorldAngle);
    const sailDirY = Math.sin(boomWorldAngle);

    // Project apparent wind onto sail direction to get parallel component
    const windAlongSail = appWindVx * sailDirX + appWindVy * sailDirY;

    // Perpendicular component of wind (what pushes the sail)
    const windPerpX = appWindVx - windAlongSail * sailDirX;
    const windPerpY = appWindVy - windAlongSail * sailDirY;
    const windPerpMag = Math.sqrt(windPerpX * windPerpX + windPerpY * windPerpY);

    // Force magnitude proportional to perpendicular wind squared
    const sailForceMag = windPerpMag * windPerpMag * SAIL_FORCE_COEF;

    // Force direction is the direction the wind pushes (normalized perpendicular component)
    let sailForceX = 0, sailForceY = 0;
    if (windPerpMag > 0.001) {
      sailForceX = (windPerpX / windPerpMag) * sailForceMag;
      sailForceY = (windPerpY / windPerpMag) * sailForceMag;
    }

    // === TORQUE ON BOOM ===
    // Tangent to boom rotation (perpendicular to boom direction)
    const tangentX = -sailDirY;
    const tangentY = sailDirX;

    // Tangential component of sail force creates torque
    const tangentialForce = sailForceX * tangentX + sailForceY * tangentY;
    const sailTorque = tangentialForce * BOOM_LENGTH * 0.5;

    // Angular drag on boom (resists flapping)
    const boomAngularDrag = -boat.boomAngularVel * BOOM_DRAG_COEF;

    // Update boom angular velocity
    boat.boomAngularVel += (sailTorque + boomAngularDrag) / BOOM_INERTIA * dt;

    // Update boom angle (rad/s to deg)
    boat.boomAngle += boat.boomAngularVel * (180 / Math.PI) * dt;

    // === MAINSHEET CONSTRAINT ===
    // sheetLength (0-1) limits how far boom can swing from centerline
    // sheetLength=0: boom locked at 90° (straight aft)
    // sheetLength=1: boom can swing 0-180° (perpendicular to boat on either side)
    const minBoomAngle = 90 - sheetLength * 90;
    const maxBoomAngle = 90 + sheetLength * 90;

    if (boat.boomAngle < minBoomAngle) {
      boat.boomAngle = minBoomAngle;
      // Bounce back slightly or stop
      boat.boomAngularVel = Math.max(0, boat.boomAngularVel * -0.3);
    }
    if (boat.boomAngle > maxBoomAngle) {
      boat.boomAngle = maxBoomAngle;
      boat.boomAngularVel = Math.min(0, boat.boomAngularVel * -0.3);
    }

    // === FORCE ON BOAT FROM SAIL ===
    // Project sail force onto boat heading (keel prevents lateral motion)
    const headingX = Math.cos(boat.heading);
    const headingY = Math.sin(boat.heading);
    const sailForwardForce = sailForceX * headingX + sailForceY * headingY;

    // === WATER DRAG ===
    // Proportional to v^2, opposes motion
    const waterDrag = -boat.speed * Math.abs(boat.speed) * HULL_WATER_DRAG;

    // === MOTOR ===
    const motorForce = motorPower * 0.1;

    // === UPDATE BOAT SPEED ===
    const totalForce = sailForwardForce + waterDrag + motorForce;
    boat.speed += totalForce / BOAT_MASS;

    // Clamp speed
    if (Math.abs(boat.speed) < MIN_SPEED) boat.speed = 0;
    boat.speed = Math.max(-MAX_SPEED * 0.3, Math.min(MAX_SPEED, boat.speed));

    // === RUDDER / TURNING ===
    // Rudder effectiveness scales with speed
    const rudderTorque = -rudderAngle * (Math.PI / 180) * Math.abs(boat.speed) * RUDDER_EFFECTIVENESS;
    boat.angularVel += rudderTorque;
    boat.angularVel *= ANGULAR_DRAG;
    boat.heading += boat.angularVel;

    // === UPDATE POSITION ===
    boat.x += boat.speed * Math.cos(boat.heading);
    boat.y += boat.speed * Math.sin(boat.heading);

    // Boundary collision
    boat.x = Math.max(20, Math.min(WORLD_SIZE - 20, boat.x));
    boat.y = Math.max(20, Math.min(WORLD_SIZE - 20, boat.y));
  };

  const drawWindField = (p5: any, windAdjust: number) => {
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

          // Draw arrow with adjusted wind strength
          const arrowLength = 20 + windAdjust * 0.4;
          // use p5 vector
          const windDir = Math.atan2(wind.y, wind.x);
          const endX = centerX + Math.cos(windDir) * arrowLength;
          const endY = centerY + Math.sin(windDir) * arrowLength;
          drawArrow(p5, centerX, centerY, endX, endY);
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

  const drawBoatVectors = (p5: any, showWind: boolean, showForces: boolean, windAdjust: number = 0) => {
    if (!showWind && !showForces) return;

    const boat = boatState.current;

    // Use same scale as drawBoat
    const s = 7.0;

    // Local coordinates used in drawBoat
    const localBowX = 0;
    const localBowY = -20 * s;
    const localMastX = 0;
    const localMastY = -5 * s;
    const localBoomLength = 25 * s;

    // Rotation used in drawBoat
    const canvasAngle = boat.heading + Math.PI / 2;

    // Transform local->world helper
    const localToWorld = (lx: number, ly: number) => {
      return {
        x: boat.x + (lx * Math.cos(canvasAngle) - ly * Math.sin(canvasAngle)),
        y: boat.y + (lx * Math.sin(canvasAngle) + ly * Math.cos(canvasAngle)),
      };
    };

    const bowWorld = localToWorld(localBowX, localBowY);
    const mastWorld = localToWorld(localMastX, localMastY);

    // Get wind at boat position (pass adjustment)
    const wind = getWindAt(boat.x, boat.y, windAdjust);

    // Scale for visibility
    const windScale = 60;
    const forceScale = 6.0; // visible scale

    // Apparent wind
    const appWindVx = wind.speed * Math.cos(wind.direction) - boat.speed * Math.cos(boat.heading);
    const appWindVy = wind.speed * Math.sin(wind.direction) - boat.speed * Math.sin(boat.heading);

    if (showWind) {
      // True wind (blue)
      const windVx = wind.speed * Math.cos(wind.direction) * windScale;
      const windVy = wind.speed * Math.sin(wind.direction) * windScale;
      p5.stroke(80, 120, 255);
      p5.strokeWeight(4);
      p5.fill(80, 120, 255);
      drawArrow(p5, bowWorld.x, bowWorld.y, bowWorld.x + windVx, bowWorld.y + windVy);

      // Boat velocity vector removed (red) — intentionally hidden

      // Apparent wind (green)
      p5.stroke(80, 255, 80);
      p5.strokeWeight(4);
      p5.fill(80, 255, 80);
      drawArrow(p5, bowWorld.x, bowWorld.y, bowWorld.x + appWindVx * windScale, bowWorld.y + appWindVy * windScale);
    }

    if (showForces) {
      // Compute sail angle and local boom end
      const sailAngle = (boat.boomAngle + 90) * (Math.PI / 180);
      const localBoomEndX = Math.sin(sailAngle) * localBoomLength;
      const localBoomEndY = localMastY - Math.cos(sailAngle) * localBoomLength;

      const sailTipWorld = localToWorld(localBoomEndX, localBoomEndY);

      // Debug markers
      p5.push();
      p5.noStroke();
      p5.fill(255, 0, 0, 200);
      p5.circle(sailTipWorld.x, sailTipWorld.y, 6);
      p5.fill(0, 150, 255, 200);
      p5.circle(bowWorld.x, bowWorld.y, 6);
      p5.pop();

      // Project apparent wind onto sail direction
      const boomWorldAngle = boat.heading + Math.PI + (boat.boomAngle - 90) * Math.PI / 180;
      const sailDirX = Math.cos(boomWorldAngle);
      const sailDirY = Math.sin(boomWorldAngle);

      const windAlongSail = appWindVx * sailDirX + appWindVy * sailDirY;
      const forceDirX = appWindVx - windAlongSail * sailDirX;
      const forceDirY = appWindVy - windAlongSail * sailDirY;

      const perpMag = Math.sqrt(forceDirX * forceDirX + forceDirY * forceDirY);
      const sailForceMag = perpMag * perpMag * SAIL_FORCE_COEF;

      let sailForceX = 0, sailForceY = 0;
      if (perpMag > 0.001) {
        sailForceX = (forceDirX / perpMag) * sailForceMag * forceScale;
        sailForceY = (forceDirY / perpMag) * sailForceMag * forceScale;
      }

      p5.stroke(255, 200, 50);
      p5.strokeWeight(4);
      p5.fill(255, 200, 50);
      drawArrow(p5, sailTipWorld.x, sailTipWorld.y, sailTipWorld.x + sailForceX, sailTipWorld.y + sailForceY);

      // Forward component
      const headingX = Math.cos(boat.heading);
      const headingY = Math.sin(boat.heading);
      const forwardForce = sailForceX * headingX + sailForceY * headingY;
      const fwdForceX = forwardForce * headingX;
      const fwdForceY = forwardForce * headingY;

      // Store metrics
      vectorMetricsRef.current.trueWind = wind.speed;
      vectorMetricsRef.current.apparentWind = Math.sqrt(appWindVx * appWindVx + appWindVy * appWindVy);
      vectorMetricsRef.current.sailForce = Math.sqrt(sailForceX * sailForceX + sailForceY * sailForceY);
      vectorMetricsRef.current.forwardForce = Math.abs(forwardForce);

      p5.stroke(255, 50, 255);
      p5.strokeWeight(4);
      p5.fill(255, 50, 255);
      // Draw forward component anchored at mast/base of boom
      drawArrow(p5, mastWorld.x, mastWorld.y, mastWorld.x + fwdForceX, mastWorld.y + fwdForceY);
    }
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

  const drawBoat = (p5: any, rudderAngle: number) => {
    const boat = boatState.current;

    p5.push();
    p5.translate(boat.x, boat.y);
    // Boat hull is drawn pointing up (-Y), so rotate by (heading + PI/2)
    // to make heading=0 point right (+X), standard math convention
    p5.rotate(boat.heading + Math.PI / 2);

    // Boat scale
    const s = 7.0;

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

    // Calculate sail angle for drawing
    // boomAngle: 0=starboard, 90=aft, 180=port (relative to boat)
    // The boom is drawn along -Y axis then rotated by sailAngle
    // So: sailAngle=0 → -Y (forward), PI/2 → +X (starboard), PI → +Y (aft)
    // Mapping: boomAngle 0 → PI/2, boomAngle 90 → PI, boomAngle 180 → 3*PI/2
    const sailAngle = (boat.boomAngle + 90) * (Math.PI / 180);

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
    const mapSize = 120;
    const mapX = p5.width - mapSize - 10;
    const mapY = p5.height - mapSize - 10;

    // Sliding minimap: show area around boat
    const viewRadius = 5000; // World units visible in minimap
    const scale = mapSize / (viewRadius * 2);

    const boat = boatState.current;

    // Background
    p5.fill(30, 60, 100, 200);
    p5.stroke(255);
    p5.strokeWeight(1);
    p5.rect(mapX, mapY, mapSize, mapSize);

    // Clip to minimap area
    p5.drawingContext.save();
    p5.drawingContext.beginPath();
    p5.drawingContext.rect(mapX, mapY, mapSize, mapSize);
    p5.drawingContext.clip();

    // World border indicator (shows where you are in the world)
    const worldLeft = mapX + mapSize / 2 + (0 - boat.x) * scale;
    const worldTop = mapY + mapSize / 2 + (0 - boat.y) * scale;
    const worldSize = WORLD_SIZE * scale;
    p5.noFill();
    p5.stroke(255, 100, 100, 150);
    p5.strokeWeight(2);
    p5.rect(worldLeft, worldTop, worldSize, worldSize);

    // Islands (relative to boat position)
    p5.fill(194, 178, 128);
    p5.noStroke();
    for (const island of ISLANDS) {
      const ix = mapX + mapSize / 2 + (island.x - boat.x) * scale;
      const iy = mapY + mapSize / 2 + (island.y - boat.y) * scale;
      const ir = Math.max(4, island.radius * scale);
      p5.ellipse(ix, iy, ir * 2, ir * 2);
    }

    p5.drawingContext.restore();

    // Boat always in center
    const bx = mapX + mapSize / 2;
    const by = mapY + mapSize / 2;
    p5.fill(255, 0, 0);
    p5.noStroke();
    p5.circle(bx, by, 8);

    // Boat heading indicator
    p5.stroke(255, 0, 0);
    p5.strokeWeight(2);
    const headLen = 12;
    p5.line(
      bx,
      by,
      bx + Math.cos(boat.heading) * headLen,
      by + Math.sin(boat.heading) * headLen
    );

    // Position text
    p5.fill(255);
    p5.noStroke();
    p5.textSize(9);
    p5.textAlign(p5.CENTER);
    p5.text(`(${Math.round(boat.x)}, ${Math.round(boat.y)})`, mapX + mapSize / 2, mapY + mapSize + 12);
  };

  const drawUI = (p5: any, sheetLength: number, rudderAngle: number) => {
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

    // Vector legend (if shown) with numeric readouts
    if (showWindVectors || showForceVectors) {
      p5.textSize(10);
      let legendX = 10;
      if (showWindVectors) {
        p5.fill(80, 120, 255);
        p5.text(`Blue: True Wind (${vectorMetricsRef.current.trueWind.toFixed(2)})`, legendX, 71);
        legendX += 150;
        p5.fill(80, 255, 80);
        p5.text(`Green: Apparent Wind (${vectorMetricsRef.current.apparentWind.toFixed(2)})`, legendX, 71);
        legendX += 170;
      }
      if (showForceVectors) {
        p5.fill(255, 200, 50);
        p5.text(`Yellow: Sail Force (${vectorMetricsRef.current.sailForce.toFixed(2)})`, legendX, 71);
        legendX += 160;
        p5.fill(255, 50, 255);
        p5.text(`Magenta: Forward Force (${vectorMetricsRef.current.forwardForce.toFixed(2)})`, legendX, 71);
      }
    }

    // Control labels (next to sliders at y=85 and y=115)
    p5.fill(0);
    p5.textSize(12);
    p5.text(`Sheet: ${(sheetLength * 100).toFixed(0)}%`, 140, 97);
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
          onClick={() => setShowWindVectors(!showWindVectors)}
          className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {showWindVectors ? "Hide" : "Show"} Wind
        </button>
        <button
          onClick={() => setShowForceVectors(!showForceVectors)}
          className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {showForceVectors ? "Hide" : "Show"} Forces
        </button>
      </div>
      <Sketch setup={setup} draw={draw} mousePressed={mousePressed} />
    </div>
  );
};

export default SailingSimulator;
