#!/usr/bin/env node

const fs = require('fs');
const _roundOf64 = require('./data/round_of_64.json');

function deepClone(data) {
  return JSON.parse(JSON.stringify(data));
}

function winOrLose() {
  return Math.floor(Math.random() * 2);
}

function getWinners(i, games, nextRound) {
  const firstPair = games[i];
  const secondPair = games[i + 1];
  const idx = winOrLose();
  const idx2 = winOrLose();
  const winner = deepClone(firstPair[idx]);
  const winner2 = deepClone(secondPair[idx2]);
  winner.round_of = nextRound;
  winner2.round_of = nextRound;
  return [winner, winner2];
}

function generateBracket(roundOf64) {
  let retval = deepClone(roundOf64);
  const regions = retval.regions;
  let finalFour = retval.finalfour[0];

  for (let region = 0; region < 4; region += 1 ) {
    for (let round = 64; round > 4; round = round / 2) {
      const gamesThisRound = regions[region].filter((el) => el.find((el2) => el2.round_of === round));
      const nextRound = round / 2;
      const newGames = [];
      for (let i = 0, len = gamesThisRound.length; i < len; i += 2) {
        if (i < len - 1) {
          const winners = getWinners(i, gamesThisRound, nextRound);
          newGames.push(winners);
        } else {
          const firstPair = gamesThisRound[i];
          const idx = winOrLose();
          const winner = deepClone(firstPair[idx]);
          winner.round_of = nextRound;
          const myregion = region <= 1 ? 0 : 1;
          if (finalFour[myregion] == null) {
            finalFour.push([winner]);
          } else {
            finalFour[myregion].push(winner);
          }
        }
      }
      regions[region] = regions[region].concat(newGames);
    }
  }

  // console.log('>>> final four', finalFour);

  const nextRound = 2;
  for (let i = 0, len = finalFour.length - 1; i < len; i += 2) {
    const winners = getWinners(i, finalFour, nextRound);
    retval.finalfour.push(winners);
  }

  return retval;
}

async function main() {
  try {
    const data = generateBracket(_roundOf64);
    console.log(JSON.stringify(data, null, 3));

    fs.writeFileSync('data/2021_bracket.json', JSON.stringify(data));
    console.log('Done.');
    return;
  } catch (err) {
    console.log(err);
    return null;
  }
}

main();
