export type HeaderJson = {
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
