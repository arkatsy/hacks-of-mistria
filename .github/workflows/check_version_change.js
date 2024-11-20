const { execSync } = require("child_process")
const fs = require("fs")

// Fetch the previous version from the last commit
const previousVersion = execSync("git show HEAD~1:package.json", { encoding: "utf-8" })
const previousPackageJson = JSON.parse(previousVersion)
const previousPackageVersion = previousPackageJson.version

// Fetch the current version from package.json
const currentPackageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"))
const currentPackageVersion = currentPackageJson.version

// Compare the versions
if (previousPackageVersion !== currentPackageVersion) {
  console.log(`Version has changed from ${previousPackageVersion} to ${currentPackageVersion}`)
  process.exit(0)
} else {
  console.log("Version has not changed")
  process.exit(1)
}
