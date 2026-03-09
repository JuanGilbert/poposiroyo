// client/src/config/loader.js

let configData = null
export async function loadConfig() {

  if (configData) {
    return configData
  }

  try {

    const res = await fetch("/game-config.json")

    if (!res.ok) {
      throw new Error("Failed to load config")
    }

    const data = await res.json()

    configData = data.config

    console.log("Game config loaded:", configData)

    return configData

  } catch (err) {

    console.error("Error loading game config:", err)

    return null
  }
}

export function getConfig() {
  return configData
}