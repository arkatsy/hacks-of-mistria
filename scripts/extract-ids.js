const fs = require("fs")
const path = require("path")
const { execFileSync } = require("child_process")

console.log(
  `For this script to work, make sure you have a .sav file in the same directory as this script.`
)

const vaultc = path.join(__dirname, "../", "vaultc.exe")

const savFile = fs.readdirSync(__dirname).find((file) => file.endsWith(".sav"))
const savFilePath = path.join(__dirname, savFile)
const savFileName = path.basename(savFilePath)
const unpackedDir = path.join(__dirname, savFileName.replace(".sav", ""))

if (!savFile) {
  console.error("No .sav file found in this directory.")
  process.exit(1)
}

execFileSync(vaultc, ["unpack", savFilePath, unpackedDir])

const files = fs
  .readdirSync(unpackedDir)
  .filter((file) => file.endsWith(".json"))
  .map((file) => path.join(unpackedDir, file))

const playerJson = files.find((file) => file.endsWith("player.json"))

const playerData = JSON.parse(fs.readFileSync(playerJson, "utf-8"))

const idsJson = JSON.stringify(
  {
    items_acquired: playerData.items_acquired,
    perks: playerData.perks,
    unlocks: {
      cosmetics: {
        animals: {
          chicken: playerData.animal_cosmetic_unlocks.chicken,
          sheep: playerData.animal_cosmetic_unlocks.sheep,
          pig: playerData.animal_cosmetic_unlocks.horse,
          horse: playerData.animal_cosmetic_unlocks.horse,
          rabbit: playerData.animal_cosmetic_unlocks.rabbit,
          alpaca: playerData.animal_cosmetic_unlocks.alpaca,
          capybara: playerData.animal_cosmetic_unlocks.capybara,
          duck: playerData.animal_cosmetic_unlocks.duck,
          cow: playerData.animal_cosmetic_unlocks.cow
        },
        player: {
          seen: playerData.seen_cosmetics,
          unlocks: playerData.cosmetic_unlocks
        }
      },
      recipes: playerData.recipe_unlocks
    }
  },
  null,
  2
)

fs.writeFileSync(path.join(__dirname, "ids.json"), idsJson)
fs.rmSync(unpackedDir, { recursive: true })
console.log(`Ids extracted and written to ids.json`)
