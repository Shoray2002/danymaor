const FRONT = {
  offsetFactor: {
    x: 0,
    y: 0,
    z: 1.1,
  },
  axisAngle: {
    x: 0,
    y: 0,
    z: 0,
  },
};

const BACK = {
  offsetFactor: {
    x: 0,
    y: 0,
    z: -1,
  },
  axisAngle: {
    x: -Math.PI / 2,
    y: 0,
    z: 0,
  },
};

const BOTTOM = {
  offsetFactor: {
    x: 0,
    y: -1,
    z: 0,
  },
  axisAngle: {
    x: Math.PI / 2,
    y: 0,
    z: 0,
  },
};

const TOP = {
  offsetFactor: {
    x: 0,
    y: 1,
    z: 0,
  },
  axisAngle: {
    x: -(Math.PI / 2),
    y: 0,
    z: 0,
  },
};

const LEFT = {
  offsetFactor: {
    x: -1,
    y: 0,
    z: 0,
  },
  axisAngle: {
    x: 0,
    y: -(Math.PI / 2),
    z: 0,
  },
};

const RIGHT = {
  offsetFactor: {
    x: 1,
    y: 0,
    z: 0,
  },
  axisAngle: {
    x: 0,
    y: Math.PI / 2,
    z: 0,
  },
};

export { TOP, BOTTOM, FRONT, BACK, LEFT, RIGHT };
