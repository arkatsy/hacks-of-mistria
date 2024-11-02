/* eslint-disable */
// @ts-nocheck
import path from "path";
import fs from "fs";
import os from "os";
import { execFileSync } from "child_process";

// 1. load the paths of all the .sav files
// 2. sort them by the last modified date (newest should be first)
// 3. unpack the .sav files in the cache dir (limit the number of unpacked files to 4 or 5 and let the user paginate for faster loading)
// 4. extract loading screen info from the unpacked files

const root = import.meta.dirname;
const cachePath = path.resolve(root, "cache");
const homeDir = os.homedir();
const fomDir = path.join(homeDir, "AppData", "Local", "FieldsOfMistria");
const fomSavesDir = path.join(fomDir, "saves");
const vaultc = path.join(root, "vaultc.exe");
const backupDir = path.join(fomDir, "saves_backup");
let forceBackup = true;
let backupExists = fs.existsSync(backupDir);
// backup the original save files

// Implicit backup when running the script initially
if (!backupExists) {
  fs.mkdirSync(backupDir);
  fs.cpSync(fomSavesDir, backupDir, { recursive: true });
}

// For explicit backup
if (forceBackup) {
  if (backupExists) {
    fs.rmSync(backupDir, { recursive: true, force: true });
  }

  fs.cpSync(fomSavesDir, backupDir, { recursive: true });
}

// TODO: re-unpack only when there is a recent change in the original saves (last modified date)
fs.rmSync(cachePath, { recursive: true, force: true });

console.log("Unpacking save files... 📦");
const savePaths = fs
  .readdirSync(fomSavesDir)
  .filter((file) => file.endsWith(".sav")) // remove non-save files
  .map((file) => path.join(fomSavesDir, file)) // resolve the full path
  .sort((fileA, fileB) => fs.statSync(fileB).mtime.getTime() - fs.statSync(fileA).mtime.getTime()) // sort by last modified date
  .slice(0, 2); // limit the unpacked saves to recent 5

const unpackedPaths = savePaths.map((saveFile) => {
  const unpackPath = path.join(cachePath, path.basename(saveFile).split(".")[0]); // second argument is the save file name without the .sav extension
  execFileSync(vaultc, ["unpack", saveFile, unpackPath]);
  return unpackPath;
});
console.log("Save files unpacked! 📦");

console.log("Extracting save info... 📝");
const saveInfos = unpackedPaths.map((unpackedPath, i) => {
  // char name, farm name, playtime, gold, essence, clock time, in-game date, in-game year, renown level
  const headerPath = path.join(unpackedPath, "header.json");
  const gamedataPath = path.join(unpackedPath, "gamedata.json");
  const playerPath = path.join(unpackedPath, "player.json");

  // game_stats.json seems to be used for tracking history of the game (daily balance, cutscenes, gifts, etc.)
  const gamestatsPath = path.join(unpackedPath, "game_stats.json");

  const header = JSON.parse(fs.readFileSync(headerPath, "utf-8")) as HeaderJson;
  const characterName = header.name;
  const farmName = header.farm_name;
  const playtime = translatePlaytime(header.playtime);
  const gold = header.stats.gold;
  const essence = header.stats.essence;
  const clockTime = header.clock_time; // TODO: translate to proper time format
  const renown = header.stats.renown;
  // TODO: grab in-game date, in-game year probably from calendar_time

  return {
    meta: {
      saveId: i, // saveId is the index of the savePaths
      paths: {
        cachePath: unpackedPath,
        savePath: savePaths[i],
        headerPath,
        gamedataPath,
        playerPath,
        gamestatsPath,
      },
      isAutosave: path.basename(savePaths[i]).includes("autosave"),
    },
    characterName,
    farmName,
    playtime,
    gold,
    essence,
    clockTime,
    renown,
  };
});
console.log("Save info extracted! 📝");

function updateJsonFile(filePath: string, key: string, value: string | number) {
  // header.json  ~1kb
  // gamedata.json ~350kb
  // player.json ~73kb
  // game_stats.json ~1mb
  // TODO: probably shouldn't load the whole json files into memory
  const file = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const keys = key.split("."); // for non-nested keys, returns ['key']

  let current = file;

  // getting into the loop only when the keys are more than 1 (keys.length - 1 > 0)
  // ['name'] -> no
  // ['t2_world_facts', 'ari_name'] -> yes
  for (let i = 0; i < keys.length - 1; i++) {
    let key = keys[i];

    // This is for when the key doesn't exists.
    // Unsure whether all the save properties are already defined with some init value or
    // they are not defined at all until the first time they are set later in the game.
    // This check is for that case where the key is not defined at all.
    if (!current[key]) {
      current[key] = {};
    }

    // moving to the nested level
    current = current[key];
  }

  // - for non-nested keys, keys.length - 1 is 0, thus takes the only key: current['key'] = value
  // - for nested keys, the only difference is that the `current` points the last nested object
  //   and the keys[keys.length - 1] is the last key in the nested keys array
  //
  //   example: ['t2_world_facts', 'ari_name'] -> keys[keys.length - 1] is 'ari_name'
  //   current = current['t2_world_facts']
  //   current['ari_name'] = value
  current[keys[keys.length - 1]] = value;

  fs.writeFileSync(filePath, JSON.stringify(file, null, 2), "utf-8");
}

function getJsonPaths(saveId: number) {
  return saveInfos[saveId].meta.paths;
}

// =====================================================================
function updateCharacterName(saveId: number, newCharacterName: string) {
  console.log(`Updating character name ${newCharacterName}`);
  const { headerPath, gamedataPath, playerPath } = getJsonPaths(saveId);

  updateJsonFile(headerPath, "name", newCharacterName);
  updateJsonFile(gamedataPath, "t2_world_facts.ari_name", newCharacterName);
  updateJsonFile(playerPath, "name", newCharacterName);
}

function updateFarmName(saveId: number, newName: string) {
  console.log(`Updating farm name to ${newName}`);
  const { headerPath, playerPath } = getJsonPaths(saveId);

  updateJsonFile(headerPath, "farm_name", newName);
  updateJsonFile(playerPath, "farm_name", newName);
}

function updateGold(saveId: number, newGold: number) {
  console.log(`Updating gold to ${newGold}`);
  const { headerPath, playerPath } = getJsonPaths(saveId);

  updateJsonFile(headerPath, "stats.gold", newGold);
  updateJsonFile(playerPath, "stats.gold", newGold);

  // NOTE: `game_stats.json` keeps track of daily balance in an `end_of_day_balance` prop
}

function updateEssence(saveId: number, newEssence: number) {
  console.log(`Updating essence to ${newEssence}`);
  const { headerPath, playerPath } = getJsonPaths(saveId);

  updateJsonFile(headerPath, "stats.essence", newEssence);
  updateJsonFile(playerPath, "stats.essence", newEssence);
}

function updateFreeBaths(saveId: number, newFreeBaths: number) {
  // TODO: NOT WORKING
  console.log(`Updating free baths to ${newFreeBaths}`);
  const { playerPath, headerPath } = getJsonPaths(saveId);

  updateJsonFile(playerPath, "stats.free_baths", newFreeBaths);
  updateJsonFile(headerPath, "stats.free_baths", newFreeBaths);
}

type Pronouns =
  | "they_them"
  | "she_her"
  | "he_him"
  | "she_they"
  | "they_she"
  | "he_they"
  | "they_he"
  | "he_she"
  | "she_he"
  | "it_its"
  | "all"
  | "none";

function updatePronouns(saveId: number, newPronouns: Pronouns) {
  console.log(`Updating pronouns to ${newPronouns}`);
  const { playerPath } = getJsonPaths(saveId);

  updateJsonFile(playerPath, "pronoun_choice", newPronouns);
}

function updateBaseHealth(saveId: number, newBaseHealth: number) {
  console.log(`Updating base health to ${newBaseHealth}`);
  const { playerPath, headerPath } = getJsonPaths(saveId);

  // if the health_current is not updated it can lead to weird
  // cases where the player's health is higher than the base health
  updateJsonFile(playerPath, "stats.base_health", newBaseHealth);
  updateJsonFile(playerPath, "stats.health_current", newBaseHealth);

  updateJsonFile(headerPath, "stats.health_current", newBaseHealth);
  updateJsonFile(headerPath, "stats.base_health", newBaseHealth);
}

function updateBaseStamina(saveId: number, newBaseStamina: number) {
  console.log(`Updating base stamina to ${newBaseStamina}`);
  const { playerPath, headerPath } = getJsonPaths(saveId);

  // same with updateBaseHealth
  updateJsonFile(playerPath, "stats.base_stamina", newBaseStamina);
  updateJsonFile(playerPath, "stats.stamina_current", newBaseStamina);

  updateJsonFile(headerPath, "stats.base_stamina", newBaseStamina);
  updateJsonFile(headerPath, "stats.stamina_current", newBaseStamina);
}

function updateBaseMana(saveId: number, newBaseMana: number) {
  console.log(`Updating base mana to ${newBaseMana}`);
  const { playerPath, headerPath } = getJsonPaths(saveId);

  updateJsonFile(playerPath, "stats.mana_max", newBaseMana);
  updateJsonFile(playerPath, "stats.mana_current", newBaseMana);

  updateJsonFile(headerPath, "stats.mana_max", newBaseMana);
  updateJsonFile(headerPath, "stats.mana_current", newBaseMana);
}

function updateRenown(saveId: number, newRenown: number) {
  console.log(`Updating renown to ${newRenown}`);
  const { playerPath, headerPath } = getJsonPaths(saveId);

  updateJsonFile(playerPath, "stats.renown", newRenown);
  updateJsonFile(headerPath, "stats.renown", newRenown);
}

type Skill =
  | "combat"
  | "woodcrafting"
  | "cooking"
  | "blacksmithing"
  | "ranching"
  | "farming"
  | "fishing"
  | "mining"
  | "archaeology";

function updateSkillXP(saveId: number, skill: Skill, newXP: number) {
  console.log(`Updating ${skill} XP to ${newXP}`);
  const { playerPath } = getJsonPaths(saveId);

  updateJsonFile(playerPath, `skill_xp.${skill}`, newXP);
}

function addInventoryItem(saveId: number, item: MemberObj<"blacksmithing">) {
  const { playerPath } = getJsonPaths(saveId);
  const player = JSON.parse(fs.readFileSync(playerPath, "utf-8"));

  const inventory = player.inventory;
  const firstSlot = inventory.find((slot) => slot.members.length === 0);

  if (!firstSlot) {
    console.log("No empty slots found in the inventory, cannot add the member");
    return;
  }

  firstSlot.members.push(item);
  fs.writeFileSync(playerPath, JSON.stringify(player, null, 2), "utf-8");
}

function updateClockTime(saveId: number, newClockTime: number) {
  console.log(`Updating clock time to ${newClockTime}`);
  const { headerPath } = getJsonPaths(saveId);

  updateJsonFile(headerPath, "clock_time", newClockTime);
}

function updateCalendarTime(saveId: number, newCalendarTime: number) {
  console.log(`Updating calendar time to ${newCalendarTime}`);
  const { headerPath } = getJsonPaths(saveId);

  updateJsonFile(headerPath, "calendar_time", newCalendarTime);
}

const autosaveId = 0;

// Docs
// header.json seems to be read only on loading saves screen

// updates
console.log("Applying updates... 🪄");
updateGold(autosaveId, 9999999);
updateEssence(autosaveId, 100000);
updateCharacterName(autosaveId, "Argi");
updateFarmName(autosaveId, "Argi Farm");
updateBaseHealth(autosaveId, 300);
updateRenown(autosaveId, 100000);
updateBaseStamina(autosaveId, 300);
updatePronouns(autosaveId, "none");
updateBaseMana(autosaveId, 200);
// updateClockTime(autosaveId, 23000);
// 21600 -> 06:00 AM
// 22600 -> ?
// 23600 ->
updateCalendarTime(autosaveId, 7777000);
// 4 seasons - 28 days each season
// 7776000 -> 1st year - Winter 7
// 7776000 + 1000 ->

(
  [
    "combat",
    "woodcrafting",
    "cooking",
    "blacksmithing",
    "ranching",
    "farming",
    "fishing",
    "mining",
    "archaeology",
  ] as Skill[]
).forEach((skill) => {
  updateSkillXP(autosaveId, skill, 1000000);
});

addInventoryItem(autosaveId, {
  animal_cosmetic: null,
  gold_to_gain: null,
  inner_item: null,
  infusion: "fortified",
  auto_use: false,
  cosmetic: null,
  item_id: "silver_helmet",
});

// updateFreeBaths(autosaveId, 100); //
console.log("Updates applied! 🎉");

// TODO: update birthday

type Spells = "full_restore" | "growth" | "summon_rain";

type MemberObj<T extends "blacksmithing" | "cooking" | "woodcrafting" | "all"> = {
  animal_cosmetic: unknown | null;
  gold_to_gain: unknown | null;
  inner_item: null;
  infusion: T extends "blacksmithing"
    ? BlacksmithingInfusion
    : T extends "cooking"
    ? CookingInfusion
    : T extends "all"
    ? Infusion
    : WoodcraftingInfusion;
  auto_use: boolean;
  cosmetic: unknown | null;
  item_id: string;
};

type BlacksmithingInfusion = "sharp" | "lightweight" | "fortified" | "hasty" | "tireless" | "leeching";
type CookingInfusion = "likeable" | "loveable" | "speedy" | "restorative" | "fairy";
type WoodcraftingInfusion = "fairy";

type Infusion = BlacksmithingInfusion | CookingInfusion | WoodcraftingInfusion;

// Weapons - Tools
type SwordId = "sword_silver" | "sword_copper" | "sword_iron" | "sword_verdigris" | "sword_worn" | string;
type AxeId = "axe_silver" | "axe_iron" | "axe_worn" | string;
type RodId = "fishing_rod_silver" | "fishing_rod_iron" | "fishing_rod_worn" | string;
type HoeId = "hoe_silver" | "hoe_copper" | "hoe_iron" | "hoe_worn" | string;
type ShovelId = "shovel_silver" | "shovel_iron" | string;
type PickaxeId = "pick_axe_silver" | "pick_axe_copper" | "pick_axe_iron" | "pick_axe_worn" | string;
type WateringCanId = "watering_can_silver" | "watering_can_iron" | "watering_can_worn" | string;
type NetId = "net_silver" | "net_worn" | string;
type RingId = "silver_ring" | "iron_ring" | "scrap_metal_ring" | string;

// Armor types
type HelmetId = "silver_helmet" | "crystal_helmet" | "verdigris_helmet" | string;
type GreavesId = "silver_greaves" | "copper_greaves" | "iron_greaves" | string;
type ArmorId = "silver_armor" | "copper_armor" | "iron_armor" | string;
type LegPlatesId = "silver_legplates" | "iron_legplates" | string;
// TODO: add `verdigris_tassets`

// Materials - Resources - Foods
type BasicWoodId = "basic_wood"; // basic wood's in game name is "Wood"
type OreId =
  | "ore_silver"
  | "ore_copper"
  | "ore_emerald"
  | "ore_iron"
  | "ore_ruby"
  | "ore_sapphire"
  | "ore_stone"
  | string;
type ClayId = "clay";
type IngotId = "ingot_silver" | "copper_ingot" | string;
type CrystalId = "crystal";
type CrystalRoseId = "crystal_rose";
type DaffodilId = "daffodil";
type DaisyId = "daisy";
type DandelionId = "dandelion";
type FodOrchidId = "fod_orchid";
type Glass = "glass";
type GlowingMushroomId = "glowing_mushroom";
type GrassSeedId = "grass_seed";
type HardWoodId = "hard_wood";
type FiberId = "fiber";
type AcornId = "acorn";
type WheatId = "wheat";
type BreadId = "bread";
type AppleId = "apple";
type BasilId = "basil";
type AppleJuiceId = "apple_juice";
type BeetSoupId = "beet_soup";
type BerriesAndCreamId = "berries_and_cream";
type BerryBowlId = "berry_bowl";
type BlackberryId = "blackberry";
type BlueberryId = "blueberry";
type BroccoliId = "broccoli";
type BroccoliSaladId = "broccoli_salad";
type BucketBrewId = "bucket_brew";
type CabbageId = "cabbage";
type CatmintId = "catmint";
type CattailId = "cattail";
type ChestnutId = "chestnut";
type ChiliPepperId = "chili_pepper";
type CoconutId = "coconut";
type CoconutMilkId = "coconut_milk";
type CoffeeId = "coffee";
type CornId = "corn";
type CosmosId = "cosmos";
type CranberryId = "cranberry";
type CranberryJuiceId = "cranberry_juice";
type CranberryOrangeSconeId = "cranberry_orange_scone";
type CrystalBerriesId = "crystal_berries";
type CucumberId = "cucumber";
type EarthshroomId = "earthshroom";
type FennelId = "fennel";
type FiddleheadId = "fiddlehead";
type FishStewId = "fish_stew";
type FlourId = "flour";
type FriedRiceId = "fried_rice";
type GarlicId = "garlic";
type GazpachoId = "gazpacho";
type GreenTeaId = "green_tea";
type GrilledCheeseId = "grilled_cheese";
type GrilledCornId = "grilled_corn";
type HardBoiledEggId = "hard_boiled_egg";
type CowMilkId = "cow_milk";
type EggId = "egg";
type HarvestPlateId = "harvest_plate";
type HayId = "hay";
type HeartCrystalId = "heart_crystal";
type HeatherId = "heather";
type HeavyMistrianStewId = "heavy_mistrian_stew";
type HorseRadishId = "horse_radish" | "" | string;
type HotToddyId = "hot_toddy";
type HydrangeaId = "hydrangea";
type IrisId = "iris";
type BlueConchShellId = "blue_conch_shell";
type ClampId = "clamp";
type CoinLumpId = "coin_lump";
type CoralId = "coral";
type DragonPriestessFountainId =
  | "dragon_priestess_fountain_v1"
  | "dragon_priestess_fountain_v2"
  | "dragon_priestess_fountain_v3";
type ShinyBeadsId = "animal_currency";
type FreshwaterOysterId = "freshwater_oyster";
type KitchenId = "adept_kitchen" | "" | string;
type BreathOfSpringId = "breath_of_spring";
type ButterflyBedId =
  | "butterfly_bed_v1"
  | "butterfly_bed_v2"
  | "butterfly_bed_v3"
  | "butterfly_double_bed_v1"
  | "butterfly_double_bed_v2"
  | "butterfly_double_bed_v3";
type CoralChairId = "coral_chair_blue" | "coral_chair_purple";
type CoralStorageChestId = "coral_storage_chest_blue" | "coral_storage_chest_purple";
type FallCropSignScrollBundleId = "fall_crop_sign_scroll_bundle";
type LadybugtableId = "ladybug_table_v1" | "ladybug_table_v2" | "ladybug_table_v3";
type LargePavingStoneId = "large_paving_stone_v1" | "large_paving_stone_v2" | "large_paving_stone_v3";
type LatteId = "latte";
type LilacId = "lilac";
type LoadedBakedPotatoId = "loaded_baked_potato";
type ManaPotionId = "mana_potion";
type MarigoldId = "marigold";
type MinersCopperNodeId = "miners_copper_node";
type MinersCrateChairId = "miners_crate_chair_v1" | "miners_crate_chair_v2";
type MinersRubyRockId = "miners_ruby_rock";
type MinesMusselsId = "mines_mussels";
type MintGimletId = "mint_gimlet";
type MistriaHistoryBookId = "mistria_history_book_v1";
type MistriaWallMapId = "mistria_wall_map_v1";
type MixedFruitJuiceId = "mixed_fruit_juice";
type MochaId = "mocha";
type MonsterCoreId = "monster_core";
type MonsterFangId = "monster_fang";
type MonsterHornId = "monster_horn";
type MonsterMashId = "monster_mash";
type MonsterPowderId = "monster_powder";
type MonsterShellId = "monster_shell";
type MoonFruitId = "moon_fruit";
type MorelMushroomId = "morel_mushroom";
type NarrowsMossId = "narrows_moss";
type NettleId = "nettle";
type NightQueenId = "night_queen";
type OilId = "oil";
type OnionId = "onion";
type OrangeId = "orange";
type OrangeJuiceId = "orange_juice";
type OreganoId = "oregano";
type OrnateFlagstoneId = "ornate_flagstone_v1" | "ornate_flagstone_v2" | "ornate_flagstone_v3";
type PaperId = "paper";
type PeachId = "peach";
type PearId = "pear";
type PearlClamId = "pearl_clam";
type PeatId = "peat";
type PerfectOresId =
  | "perfect_copper_ore"
  | "perfect_emerald"
  | "perfect_iron_ore"
  | "perfect_ruby"
  | "perfect_sapphire";
type PicketFenceId = "picket_fence";
type PikeId = "pike";
type PineconeId = "pinecone";
type PinkScallopShellId = "pink_scallop_shell";
type PotatoId = "potato";
type PotatoSoupId = "potato_soup";
type PumpkinId = "pumpkin";
type PumpkinPieId = "pumpkin_pie";
type PumpkinStewId = "pumpkin_stew";
type PurseId = "purse";
type RecipeScroll = "recipe_scroll";
type RedSnapperId = "red_snapper";
type RedToadstoolId = "red_toadstool";
type RiceId = "rice";
type RiceballId = "riceball";
type RoastedRiceTeaId = "roasted_rice_tea";
type RosemaryId = "rosemary";
type SalmonId = "salmon";
type SapId = "sap";
type SapplingAppleId = "sapling_apple";
type SapplingOrangeId = "sapling_orange";
type ScentOfSpringId = "scent_of_spring";
type ScrapMetalRingId = "scrap_metal_ring";
type SeaGrapesId = "sea_grapes";
type SeaweedId = "seaweeds";
type SeedBasilId = "seed_basil";
type SeedBroccoliId = "seed_broccoli";
type SeedChiliPepperId = "seed_chili_pepper";
type SeedCornId = "seed_corn";
type SeedCranberryId = "seed_cranberry";
type SeedCucumberId = "seed_cucumber";
type SeedDaisyId = "seed_daisy";
type SeedHeatherId = "seed_heather";
type SeedLilacId = "seed_lilac";
type SeedOnionId = "seed_onion";
type SeedPotatoId = "seed_potato";
type SeedPumpkinId = "seed_pumpkin";
type SeedRiceId = "seed_rice";
type SeedSnowdropAnemoneId = "seed_snowdrop_anemone";
type SeedStrawberryId = "seed_strawberry";
type SeedSweetPotatoId = "seed_sweet_potato";
type SeedTomatoId = "seed_tomato";
type SeedTulipId = "seed_tulip";
type SeedWatermelonId = "seed_watermelon";
type SeedWheatId = "seed_wheat";
type ShadowFlowerId = "shadow_flower";
type ShardMassId = "shard_mass";
type ShardsId = "shards";
type SmallBarnBlackBlueprintId = "small_barn_black_blueprint";
type SmallBarnRedBlueprintId = "small_barn_red_blueprint";
type SmallCoopBlackBlueprintId = "small_coop_black_blueprint";
type SmallCoopRedBlueprintId = "small_coop_red_blueprint";
type SnowdropAnemoneId = "snowdrop_anemone";
type SodId = "sod";
type SoySauceId = "soy_sauce";
type SpicyWaterChestnutsId = "spicy_water_chestnuts";
type SpirulaShellId = "spirula_shell";
type SpookyHaybaleId = "spooky_haybale";
type SpringBedOrangeId = "spring_bed_orange";
type SpringBedPinkId = "spring_bed_pink";
type SpringBedPurpleId = "spring_bed_purple";
type SpringCropSignScrollBundleId = "spring_crop_sign_scroll_bundle";
type SpringDoubleBedOrangeId = "spring_double_bed_orange";
type SpringDoubleBedPinkId = "spring_double_bed_pink";
type SpringDoubleBedPurpleId = "spring_double_bed_purple";
type SpringFestivalBasketId = "spring_festival_basket";
type SpringFestivalPlanterId = "spring_festival_planter";
type SpringLampOrangeId = "spring_lamp_orange";
type SpringLampPinkId = "spring_lamp_pink";
type SpringLampPurpleId = "spring_lamp_purple";
type SpringRugOrangeId = "spring_rug_orange";
type SpringRugPinkId = "spring_rug_pink";
type SpringRugPurpleId = "spring_rug_purple";
type SpringSofaOrangeId = "spring_sofa_orange";
type SpringSofaPinkId = "spring_sofa_pink";
type SpringSofaPurpleId = "spring_sofa_purple";
type StaminaUpId = "stamina_up";
type StarterBirdHouseRedId = "starter_bird_house_red";
type StarterShippingBoxId = "starter_shipping_box";
type StarterStonePathId = "starter_stone_path";
type StarterStonePathDoubleId = "starter_stone_path_double";
type StarterWoodFenceId = "starter_wood_fence";
type SteamedBroccoliId = "steamed_broccoli";
type StoneBenchId = "stone_bench_v1" | "stone_bench_v2" | "stone_bench_v3";
type StoneDragonFigureId = "stone_dragon_figure_v1" | "stone_dragon_figure_v2" | "stone_dragon_figure_v3";
type StoneLampId = "stone_lamp_v1" | "stone_lamp_v2" | "stone_lamp_v3";
type StoneStorageChestId = "stone_storage_chest_v1" | "stone_storage_chest_v2" | "stone_storage_chest_v3";
type StoneTableId = "stone_table_v1" | "stone_table_v2" | "stone_table_v3";
type StoneShellId = "stone_shell";
type StrawberriesAndCreamId = "strawberries_and_cream";
type StrawberryId = "strawberry";
type StrawberryShortcakeId = "strawberry_shortcake";
type SugarId = "sugar";
type SummerCropSignScrollBundleId = "summer_crop_sign_scroll_bundle";
type SummerSaladId = "summer_salad";
type SweetPotatoId = "sweet_potato";
type SweetPotatoPieId = "sweet_potato_pie";
type SweetrootId = "sweetroot";
type TeaId = "tea";
type ThymeId = "thyme";
type TideLettuceId = "tide_lettuce";
type TideSaladId = "tide_salad";
type TideTouchedCavernWallId = "tide_touched_cavern_wall";
type TinLunchbox = "tin_lunchbox";
type TomatoId = "tomato";
type TrailMixId = "trail_mix";
type TrainingDummyClodId = "training_dummy_clod";
type TrainingDummyMushroomId = "training_dummy_mushroom";
type TrainingDummySaplingId = "training_dummy_sapling";
type TreasureBoxCopperId = "treasure_box_copper";
type TreasureBoxGoldId = "treasure_box_gold";
type TreasureBoxSilverId = "treasure_box_silver";
type TreasureBoxWoodId = "treasure_box_wood";
type TulipId = "tulip";
type TunaId = "tuna";
type TurnipId = "turnip";
type UnderseaweedId = "underseaweed";
type UnidentifiedArtifactId = "unidentified_artifact";
type UpperMinesMushroomId = "upper_mines_mushroom";
type VegetableSoupId = "vegetable_soup";
type ViolaId = "viola";
type WaterChestnutId = "water_chestnut";
type WaterSphereId = "water_sphere";
type WatermelonId = "watermelon";
type WeatherCrystalBallId = "weather_crystal_ball";
type WildBerriesId = "wild_berries";
type WildBerryJamId = "wild_berry_jam";
type WildGrapesId = "wild_grapes";
type WildLeekId = "wild_leek";
type WildMushroomId = "wild_mushroom";
type WildberryPieId = "wild_berry_pie";
type WildberrySconeId = "wild_berry_scone";
type WinterCropSignScrollBundleId = "winter_crop_sign_scroll_bundle";
type WornBedId = "worn_bed";
type WornGardenLampId = "worn_garden_lamp";
type WornWellId = "worn_well";

// Unsure
type CavernHewnRockTableId = "cavern_hewn_rock_table";
type CaveKelpId = "cave_kelp";
type ChessScrollBundleId = "chess_scroll_bundle";
type CopperBeetleId = "copper_beetle";
type CosmeticId = "cosmetic";
type CraftingScrollId = "crafting_scroll";

// Insects - Fish
type InsectId =
  | "amber_trapped_insect"
  | "ant"
  | "orchid_mantis"
  | "question_mark_butterfly"
  | "beach_hopper"
  | "waterbug"
  | "waterfly"
  | "leafhopper"
  | "petalhopper"
  | "strawhopper"
  | "sand_bug"
  | "river_snail"
  | "gem_shard_caterpillar"
  | "caterpillar"
  | "stone_loach"
  | "worm"
  | "rhinoceros_beetle"
  | "bumblebee"
  | "sea_scarab"
  | "magma_beetle"
  | "tunnel_millipede"
  | "walking_leaf"
  | "redhead_worm"
  | "hermit_crab"
  | "hermit_snail"
  | "tide_touched_cavern_wall"
  | "butterfly"
  | "jewel_beetle"
  | "monarch_butterfly"
  | "ladybug"
  | "surf_beetle"
  | "chillipede"
  | "chicada"
  | "hummingbird_hawk_moth"
  | "chicada_nymph"
  | "cricket"
  | "crystal_wing_moth"
  | "grasshopper"
  | "praying_mantis"
  | "puddle_spider"
  | "relic_crab"
  | "crystalline_cricket"
  | "pond_skater"
  | "snail"
  | "mine_cricket"
  | "firefly"
  | "deep_earthworm"
  | "fuzzy_moth"
  | "rock_roach"
  | "dragonfly"
  | "lantern_moth"
  | "inchworm";

type FishId =
  | "archerfish"
  | "goby"
  | "lobster"
  | "trout"
  | "sweetfish"
  | "transparent_jellyfish"
  | "sturgeon"
  | "water_balloon_fish"
  | "stingray"
  | "bluegill"
  | "grouper"
  | "pollock"
  | "walleye"
  | "sapphire_betta"
  | "shrimp"
  | "squid"
  | "bonito"
  | "loach"
  | "bream"
  | "rock_bass"
  | "minnow"
  | "carp"
  | "lake_chub"
  | "cave_shrimp"
  | "mini_whale_shark"
  | "puffer_fish"
  | "smallmouth_bass"
  | "char"
  | "sea_bream"
  | "chub"
  | "chum"
  | "cod"
  | "coral_mantis"
  | "crab"
  | "rockbiter"
  | "dart"
  | "gar"
  | "crayfish"
  | "earth_eel";

// Upgrades
type PouchId = "basic_pouch" | "large_pouch" | string;
type CupOfTeaId = "cup_of_tea";

// TODO: add all the item ids
type ItemId = SwordId | AxeId | string;

// "members" prop: if 60 wood is in one slot, the members array will contain
//                 60 objects of MemberObj with the item_id of "basic_wood"

// An inventory slot is present even if it's empty
type InventorySlot = {
  members: Array<MemberObj<"all">>;
  required_tags: Array<unknown>;
};

// player.json `inventory` prop
type Inventory = Array<InventorySlot>;

// ==========================================
// player.json `armor` prop
type Tags = "head" | "chest" | "legs" | "boots" | "accessory";

type EquipmentArmor = {
  members: Array<MemberObj<"all">>;
  required_tags: Array<Tags>;
};

// player.json structure
type PlayerJSON = {
  "inventory": Inventory;
  "armor": {
    [key in Tags]: EquipmentArmor;
  };
  "inbox": Inbox;
  "used_wishing_well": boolean;
  "annual_item_purchase_bans": AnnualItemPurchaseBans;
  "ate_soup": boolean;
  "items_acquired": Array<ItemId>;
};

type AnnualItemPurchaseBans = Array<"scent_of_spring" | string>;

type Inbox = Array<InboxItem>;

type InboxItem = {
  path: string; // TODO: add all quest names
  delay: unknown | null;
  read: boolean;
  items_taken: boolean;
};

// =====================================================================

// backup the original save files
// console.log(fomSavesDir)

// pack the unpacked files back to .sav
console.log("Packing save files... 📦");
unpackedPaths.forEach((unpackedPath) => {
  const dest = path.join(fomSavesDir, path.basename(unpackedPath) + ".sav");

  execFileSync(vaultc, ["pack", unpackedPath, dest]);
});
console.log("Save files packed! 📦");

// 1. Update Character Name
// 2. Update Farm Name
// 3. Update Gold
// 4. Update Essence

type HeaderJson = {
  farm_name: string;
  preset: {
    assets: { lut_index: number; name: string }[];
    eyes: number;
    skin_tone: number;
  };
  playtime: number;
  calendar_time: number;
  clock_time: number;
  stats: {
    status_effects: (null | unknown)[];
    end_of_day_status: "normal" | string;
    base_health: number;
    gold: number;
    base_stamina: number;
    mana_current: number;
    essence: number;
    mana_max: number;
    stamina_current: number;
    health_current: number;
    invulnerable_hits: number;
    renown: number;
    free_baths: number;
  };
  weather: {
    forecast: ("calm" | "heavy_inclement" | "special" | string)[];
  };
  name: string;
};

function translatePlaytime(time: number) {
  // 22229.607 -> 6:10:29
  // 1 -> 0:00:01
  // 61 -> 0:01:01
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  const pad = (num: number) => String(num).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
