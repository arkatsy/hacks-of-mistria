const readline = require("node:readline")
const { stdin: input, stdout: output } = require("node:process")
const path = require("node:path")
const os = require("node:os")
const fs = require("node:fs")
const { execFileSync } = require("node:child_process")

function timestamp() {
  return Math.floor(Date.now() / 1000)
}

const rl = readline.createInterface({ input, output })

rl.question(`How many saves you want to measure? (enter a number) `, (answer) => {
  const amount = +answer
  if (!(typeof amount === "number" && !Number.isNaN(amount) && amount > 0)) {
    console.log(`Invalid input`)
    process.exit(1)
  }

  const vaultc = path.join(__dirname, "vaultc.exe")

  if (!fs.existsSync(vaultc)) {
    console.log(
      `Couldn't find vaultc.exe.\m The script needs to be in the same directory with the vaultc tool`
    )
    process.exit(1)
  }

  const testingDir = path.join(__dirname, `testing-${timestamp()}`)
  const fomSavesPath = path.join(os.homedir(), "AppData", "Local", "FieldsOfMistria", "saves")

  const testSavePath = path.join(
    fomSavesPath,
    fs.readdirSync(fomSavesPath).filter((file) => file.endsWith(".sav"))[0]
  )
  const saveBasename = path.basename(testSavePath).replace(".sav", "")

  fs.mkdirSync(testingDir)

  for (let i = 1; i <= amount; i++) {
    fs.cpSync(testSavePath, path.join(testingDir, `${saveBasename}-${i}.sav`))
  }

  console.log(`Starting measurements...`)

  console.time(`Unpacking Time`)
  const savesToUnpack = fs.readdirSync(testingDir).map((file) => path.join(testingDir, file))

  for (const savePath of savesToUnpack) {
    const unpackDir = path.join(testingDir, path.basename(savePath).replace(".sav", ""))
    execFileSync(vaultc, ["unpack", savePath, unpackDir])
  }
  console.timeEnd(`Unpacking Time`)

  fs.rmSync(testingDir, { recursive: true })
  process.exit(0)
})
