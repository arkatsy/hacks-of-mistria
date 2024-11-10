// Util types for the json types
export type Weather = 'calm' | 'inclement' | 'heavy_inclement' | 'special' | string

// Types for the json files
export type HeaderJson = {
  farm_name: string
  preset: {
    assets: { lut_index: number; name: string }[]
    eyes: number
    skin_tone: number
  }
  playtime: number
  calendar_time: number
  clock_time: number
  stats: {
    status_effects: (null | unknown)[]
    end_of_day_status: 'normal' | string
    base_health: number
    gold: number
    base_stamina: number
    mana_current: number
    essence: number
    mana_max: number
    stamina_current: number
    health_current: number
    invulnerable_hits: number
    renown: number
    free_baths: number
  }
  weather: {
    forecast: Weather[]
  }
  name: string
}

export type InfoJson = {
  last_played: number
  creation_version: {
    patch: number
    pre: null | number
    major: number
    minor: number
  }
  version: {
    patch: number
    pre: null | number
    major: number
    minor: number
  }
}

export type PlayerJson = {
  progression: string[]
  farm_name: string
  spells_learned: unknown[]
  wallpaper: string
  armor: Array<{
    members: Array<{
      gold_to_gain: null
      inner_item: null
      infusion: null
      cosmetic: null
      animal_cosmetic: null
      item_id: string
    }>
    required_tags: string[]
  }>
  wallpaper_infusion: null
  items_sold: {
    [itemId: string]: number
  }
  annual_item_purchase_bans: unknown[]
  ate_soup: boolean
  renown_reward_inventory: Array<{
    members: Array<{
      gold_to_gain: null
      inner_item: null
      infusion: null
      cosmetic: string
      animal_cosmetic: null
      item_id: string
    }>
    required_tags: string[]
  }>
  flooring: string
  flooring_infusion: null
  size_upgrade: number
  festival_results: {
    spring: unknown[]
    beach_day: unknown[]
    animal: unknown[]
    cooking_contest: unknown[]
    crop: unknown[]
    gift: unknown[]
    halloween: unknown[]
    harvest: unknown[]
    shooting_star: unknown[]
    new_years: unknown[]
  }
  position: number[]
  pinned_spell: null
  stats: {
    mana_current: number
    renown: number
    mana_max: number
    base_stamina: number
    essence: number
    health_current: number
    invulnerable_hits: number
    free_baths: number
    stamina_current: number
    gold: number
    end_of_day_status: string
    base_health: number
    status_effects: Array<null>
  }
  pronoun_choice: 'they_them' | 'she_her' | 'he_him' | 'she_they' | 'he_they' | 'all' | 'none'
  birthday: number
  animal_cosmetic_unlocks: {
    alpaca: unknown[]
    cow: unknown[]
    chicken: unknown[]
    horse: unknown[]
    sheep: unknown[]
    rabbit: unknown[]
    capybara: unknown[]
    duck: unknown[]
  }
  legendary_fish_caught: unknown[]
  skill_xp: {
    combat: number
    mining: number
    woodcrafting: number
    blacksmithing: number
    cooking: number
    archaelogy: number
    fishing: number
    ranching: number
    farming: number
  }
  pending_renown_entries: unknown[]
  used_wishing_well: boolean
  world_fountains: unknown[]
  seen_cosmetics: string[]
  recipe_unlocks: string[]
  animal_variant_unlocks: {
    alpaca: string[]
    cow: string[]
    chicken: string[]
    horse: string[]
    sheep: string[]
    rabbit: string[]
    capybara: string[]
    duck: string[]
  }
  preset_index_selected: number
  perks: string[]
  inventory: Array<{
    members: Array<{
      gold_to_gain: null
      inner_item: null
      infusion: null
      cosmetic: null
      animal_cosmetic: null
      item_id: string
    }>
    required_tags: string[]
  }>
  tutorials_seen: string[]
  name: string
  presets: Array<{
    assets: Array<{
      lut_index: number
      name: string
    }>
    skin_tone: number
    eyes: number
  }>
  inbox: Array<{
    items_taken: boolean
    delay: null
    path: string
    read: boolean
  }>
  cosmetic_unlocks: string[]
  items_acquired: string[]
}

export type ChecksumsJson = {
  water_seal: number
  player: number
  fire_seal: number
  summit: number
  gamedata: number
  npcs: number
  beach: number
  header: number
  player_home: number
  game_stats: number
  eastern_road: number
  narrows: number
  earth_seal: number
  farm: number
  quests: number
  deep_woods: number
  info: number
  town: number
  haydens_farm: number
  western_ruins: number
}
