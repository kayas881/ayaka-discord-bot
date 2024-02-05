const { SlashCommandBuilder } = require("discord.js");
const bossesData = require("./../genshinJsons/bosses.json");
const User = require("./../schemas/currencySchema");
const weaponData = require("./../Wishjsons/weapons.json");
const characterData = require("./../Wishjsons/characters.json");

async function simulateBattle(user, boss, turnCallback) {
  // Check if the user has an equipped character and weapon
  if (!user.equippedCharacter || !user.equippedWeapon) {
    return "Please equip a character and a weapon before starting a battle.";
  }

  const equippedCharacter = user.equippedCharacter[0];
  const equippedWeapon = user.equippedWeapon[0];

  if (!equippedCharacter || !equippedWeapon) {
    return "Invalid equipped character or weapon. Please check your equipment.";
  }

  const totalStats = {
    hp: user.totalHP,
    atk: user.totalATK,
    def: user.totalDef,
    critRate: user.totalCritRate,
    critDmg: user.totalCritDmg,
  };

  let bossStats = {
    hp: boss.hp,
    atk: boss.atk,
    def: boss.def || 0, // Add 'def' property to bosses.json or use a default value
  };

  let isUserTurn = true;


  let battleLog = "Battle Start!\n"; // Initialize battleLog here
  let battleResult;
  while (bossStats.hp > 0 && totalStats.hp > 0) {
    if (isUserTurn) {
      const isCriticalHit = Math.random() < totalStats.critRate;
      const damage = calculateDamage(
        totalStats.atk,
        bossStats.def,
        isCriticalHit ? totalStats.critRate : 0,
        isCriticalHit ? totalStats.critDmg : 0
      );

      // Apply damage to the boss
      bossStats.hp = Math.max(0, bossStats.hp - damage);

      // Append user's damage to the battle log
      battleLog += `User dealt ${damage} damage to the boss (${bossStats.hp} HP remaining)\n`;
      // Call the callback function with the updated battle log
      if (turnCallback) await turnCallback(battleLog);

      // Check if the boss is defeated
      if (bossStats.hp <= 0) {
    
        battleResult = "victory";
        break;
      }
    } else {
      // Boss's turn - simulate boss's attack
      const bossDamage = calculateDamage(bossStats.atk, totalStats.def, 0, 0); // Boss doesn't crit for simplicity

      // Apply damage to the user
      totalStats.hp = Math.max(0, totalStats.hp - bossDamage); // Ensure HP doesn't go negative


      // Append boss's damage to the battle log
      battleLog += `Boss dealt ${bossDamage} damage to you (${totalStats.hp} HP remaining)\n`;
      // Call the callback function with the updated battle log
      if (turnCallback) await turnCallback(battleLog);
      // Check if the user is defeated
      if (totalStats.hp <= 0) {

        battleResult = "defeat";
        break;
      }
    }

    // Introduce random events
    if (Math.random() < 0.1) {
  
      battleLog += `Random Event: Boss Enrages!\n`;
      if (turnCallback) await turnCallback(battleLog);
      bossStats.atk *= 1.5; // Boss deals increased damage
    }

    // Switch turns
    isUserTurn = !isUserTurn;

    // Add a delay for cooldowns
    await sleep(1000); // Sleep for 1 second, adjust as needed
  }


  battleLog += "Battle concluded!\n";

  return { battleLog, battleResult };
}

function calculateDamage(attack, targetDef, critRate, critDmg) {
  const baseDamage = Math.floor(
    Math.random() * (attack * 0.8 - attack * 0.6 + 1) + attack * 0.6
  );
  const isCrit = Math.random() < critRate;
  const critMultiplier = isCrit ? 1 + critDmg : 1;

  return Math.max(0, Math.floor(baseDamage * critMultiplier - targetDef));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  simulateBattle,
  sleep,
};
