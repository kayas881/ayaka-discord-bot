const { SlashCommandBuilder } = require("discord.js");
const bossesData = require("./../genshinJsons/bosses.json");
const User = require("./../schemas/currencySchema");
const weaponData = require("./../Wishjsons/weapons.json");
const characterData = require("./../Wishjsons/characters.json");
const { sleep } = require("./battleUtils.js");

async function simulatePvPBattle(user1, user2, turnCallback) {
  const totalStatsUser1 = { ...user1.toObject() };
  const totalStatsUser2 = { ...user2.toObject() };



  let isUser1Turn = true;
  let firstHitDone = false;


  let battleLog = "Battle Start!\n"; // Initialize battleLog here
  let battleResult;

  const maxTurns = 12; // Limit the number of turns to prevent infinite battles
  let turnCount = 0;

  while (
    totalStatsUser1.totalHP > 0 &&
    totalStatsUser1.totalHP > 0 &&
    turnCount < maxTurns
  ) {
    if (!firstHitDone) {
      // Randomly determine the first hit
      isUser1Turn = Math.random() < 0.5;
      firstHitDone = true;
    } else {
      // Normal turn alternation
      isUser1Turn = !isUser1Turn;
    }

    const attacker = isUser1Turn ? totalStatsUser1 : totalStatsUser2;
    const defender = isUser1Turn ? totalStatsUser2 : totalStatsUser1;

    const isCriticalHit = Math.random() < attacker.totalCritRate / 100;
    const damage = calculateDamage(attacker, defender, isCriticalHit);

    // Apply damage to the defender
    defender.totalHP = Math.max(0, defender.totalHP - damage);



    battleLog += `${attacker.username} dealt ${damage} damage to ${defender.username} (${defender.totalHP} HP remaining)\n`;

    if (turnCallback) await turnCallback(battleLog);

    // Check if the battle should end
    if (defender.totalHP <= 0) {
      battleResult = attacker.username;
      break;
    }

    // Switch turns
    turnCount++;

    await sleep(800); // Add a delay for better pacing
  }
  // Check the winner based on HP after the maximum number of turns
  if (totalStatsUser1.totalHP > totalStatsUser2.totalHP) {
    battleResult = user1;
  } else if (totalStatsUser1.totalHP < totalStatsUser2.totalHP) {
    battleResult = user2;
  } else {
    // It's a draw if both have the same HP
    battleResult = null;
  }


  battleLog += "PvP Battle concluded!\n";

  return { battleLog, battleResult };
}

function calculateDamage(attacker, defender, isCriticalHit) {
  // Simplified damage calculation
  const baseDamage = Math.floor(
    Math.random() * (attacker.totalATK * 0.5 - attacker.totalATK * 0.3 + 1) +
      attacker.totalATK * 0.4
  );

  const critMultiplier = isCriticalHit ? 1 + attacker.totalCritDmg / 100 : 1;

  const rawDamage = Math.max(
    0,
    Math.floor(baseDamage * critMultiplier - defender.totalDef)
  );

  // Introduce a damage reduction based on defense
  const finalDamage = Math.max(
    1,
    Math.floor(rawDamage * (1 - defender.totalDef / (defender.totalDef + 300)))
  );

  return finalDamage;
}

module.exports = {
  simulatePvPBattle,
};
