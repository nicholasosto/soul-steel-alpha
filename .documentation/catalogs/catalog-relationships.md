
``` erDiagram

    DOMAIN ||--o{ CLASS_DOMAIN_FLAVOR : "flavors"
    CLASS  ||--o{ CLASS_DOMAIN_FLAVOR : "is flavored by"
    CLASS  ||--o{ CLASS_CORE_ABILITY  : "core abilities"
    CLASS  ||--o{ CLASS_UNLOCK_ABILITY: "unlock abilities"
    CLASS  ||--o{ CLASS_ATTRIBUTE_AFFINITY : "affinity weights"
    ABILITY ||--o{ ABILITY_ATTRIBUTE_SCALING : "scales with"
    ABILITY ||--o{ ABILITY_RESOURCE_COST    : "costs"
    DOMAIN  }o--o{ DOMAIN_COUNTER : "counters / is-countered-by"

    DOMAIN {
      string key PK
      string name
      string color_palette
      string icon_asset
      string mechanical_focus    "e.g., control, sustain, burst"
      string flavor_notes
    }

    DOMAIN_COUNTER {
      string source_domain FK
      string target_domain FK
      float  multiplier          "e.g., 1.15 means +15% vs target"
      string rule_notes
    }

    CLASS {
      string key PK
      string name
      string archetype           "Warrior, Rogue, Magus..."
      string playstyle_tags      "comma-separated"
      int    base_slot_count     "gems/skills/etc."
      string progression_rules   "JSON/DSL"
    }

    CLASS_DOMAIN_FLAVOR {
      string class_key  FK
      string domain_key FK
      string flavor_name         "e.g., Void Warrior"
      string flavor_notes
      string visual_theme        "palette/FX bundle"
      string unlock_condition    "level, quest, token, etc."
    }

    ABILITY {
      string key PK
      string name
      string category            "attack, support, mobility"
      string delivery            "melee, ranged, aoe, cone"
      string targeting           "self, unit, ground, cone"
      float  base_power
      float  base_cooldown_s
      string gcd_tag             "for global cooldown grouping"
      string animation_asset
      string vfx_asset
      string sfx_asset
      string domain_tag          "optional: inherent domain"
      string tier                "starter/core/advanced/elite"
      string rules               "JSON/DSL for special effects"
    }

    ATTRIBUTE {
      string key PK
      string name
      string category            "offense, defense, utility"
      string display_unit        "flat, %, rating"
      string icon_asset
      string calc_role           "e.g., dmg, mitigation, crit"
    }

    CLASS_ATTRIBUTE_AFFINITY {
      string class_key    FK
      string attribute_key FK
      float  weight       "0..1 or multiplier"
      string notes
    }

    ABILITY_ATTRIBUTE_SCALING {
      string ability_key   FK
      string attribute_key FK
      float  coefficient   "e.g., 0.6 * STR"
      string curve         "linear, diminishing, step"
      string notes
    }

    RESOURCE {
      string key PK
      string name
      string regen_rule        "per sec / on hit / on kill"
      string cap_rule          "max pool calc"
      string ui_color
      string icon_asset
    }

    ABILITY_RESOURCE_COST {
      string ability_key  FK
      string resource_key FK
      float  amount
      string cost_type        "flat, %, channel, drain"
      string notes
    }

    CLASS_CORE_ABILITY {
      string class_key  FK
      string ability_key FK
      int    slot_index       "ordering/slot mapping"
    }

    CLASS_UNLOCK_ABILITY {
      string class_key  FK
      string ability_key FK
      string unlock_condition "level, quest, talent"
      string notes
    }

```
