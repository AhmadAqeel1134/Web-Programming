export const PROBABILITIES = {
  aggressive: {
    wicket: 0.35,
    dot: 0.1,
    one: 0.1,
    two: 0.08,
    three: 0.07,
    four: 0.15,
    six: 0.15,
  },
  defensive: {
    wicket: 0.15,
    dot: 0.25,
    one: 0.25,
    two: 0.15,
    three: 0.08,
    four: 0.08,
    six: 0.04,
  },
}

export const RUN_VALUES = {
  wicket: null,
  dot: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  six: 6,
}

export const COMMENTARY = {
  wicket: [
    'Bowled him! The stumps are shattered!',
    'Caught at mid-on! What a terrible shot!',
    "He's gone! The ball clips the top of off-stump!",
    'OUT! That lazy drive costs him his wicket!',
  ],
  dot: [
    'Solid defensive block. No run.',
    'Beaten outside off stump. Dot ball.',
    'Safe as houses. Good over-rate management.',
  ],
  one: [
    'Nudged to square leg. Easy single.',
    'Quick running between the wickets! 1 run.',
    'Dropped into the gap. They scamper through.',
  ],
  two: [
    'Driven into the gap - two runs!',
    'Good placement, they turn for two!',
    'A well-timed push through covers. 2 runs!',
  ],
  three: [
    'Brilliant placement! Running hard - 3 runs!',
    'Good shot but the fielder cuts off the four - 3 only!',
    'Chips it over the infield, they run 3!',
  ],
  four: [
    'FOUR! Cuts it hard through point!',
    'Cracking drive down the ground - FOUR!',
    'Ramps it over the keeper - races away for FOUR!',
  ],
  six: [
    'SIX! That is gone into the stands!',
    'MAXIMUM! What a clean hit over long-on!',
    'BOOM! Over the ropes first bounce!',
    'That is the shot of the match! SIX!',
  ],
}

const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0)
console.assert(Math.abs(sum(PROBABILITIES.aggressive) - 1) < 1e-9, 'Aggressive probabilities must sum to 1')
console.assert(Math.abs(sum(PROBABILITIES.defensive) - 1) < 1e-9, 'Defensive probabilities must sum to 1')
