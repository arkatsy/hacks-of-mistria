class Member {
  constructor({
    auto_use = false,
    cosmetic = null,
    gold_to_gain = null,
    animal_cosmetic = null,
    item_id = null,
    inner_item = null,
    infusion = null
  }) {
    if (!item_id) {
      throw new Error(`Cannot create member without at least an item_id`)
    }

    this.auto_use = auto_use
    this.cosmetic = cosmetic
    this.animal_cosmetic = animal_cosmetic
    this.gold_to_gain = gold_to_gain
    this.item_id = item_id
    this.inner_item = inner_item
    this.infusion = infusion
  }
}

class Slot {
  constructor({ members = [], required_tags = [] }) {
    this.required_tags = required_tags
    this.members = []
    for (let i = 0; i < members.length; i++) {
      this.members.push(new Member(members[i]))
    }
  }

  isFree() {
    return this.members.length === 0
  }

  setMember(partial) {
    const prevProps = this.getMemberProps()
    const member = new Member(Object.assign({}, prevProps, partial))
    this.members = [member]
  }

  getMemberProps() {
    return this.members[0] || {}
  }

  replaceMember(partial) {
    const quantity = this.members.length
    const prevProps = this.getMemberProps()
    this.setMember(Object.assign({}, prevProps, partial))
    this.setMemberQuantity(quantity)
  }

  setMemberQuantity(quantity) {
    if (this.isFree()) {
      throw new Error(`Cannot update quantity when there are no members`)
    }
    const item = this.members[0]

    if (this.members.length < quantity) {
      while (this.members.length < quantity) {
        this.members.push(new Member(item))
      }
    } else if (this.members.length > quantity) {
      while (this.members.length > quantity) {
        this.members.pop(new Member(item))
      }
    }
  }

  free() {
    this.required_tags = []
    this.members = []
  }

  // ===
  getItemId() {
    return this.members[0]?.item_id || ""
  }

  getItemQuantity() {
    return this.members.length
  }

  getItemInfusion() {
    return this.members[0]?.infusion || ""
  }
}

export class Inventory {
  constructor(inventory) {
    this.totalSlots = inventory.length
    this.inventory = []
    this.slots = {}

    const _inventory = JSON.parse(JSON.stringify(inventory))
    for (let i = 0; i < this.totalSlots; i++) {
      const slot = new Slot(_inventory.shift())
      this.inventory.push(slot)
      this.slots[i] = { id: i, slot }
    }
  }

  getInventory() {
    return this.inventory
  }

  getSlots() {
    return this.slots
  }

  getSlot(slotId) {
    return this.inventory[slotId]
  }

  getFreeSlot() {
    for (let i = 0; i < this.inventory.length; i++) {
      const slot = this.inventory[i]
      if (slot.isFree()) {
        return slot
      }
    }

    return null
  }

  freeSlot(slotId) {
    const slot = this.getSlot(slotId)
    slot.free()
  }

  setSlotItem(slotId, partial) {
    let partialProps = typeof partial === "string" ? { item_id: partial } : partial

    const slot = this.getSlot(slotId)
    slot.setMember(partialProps)
  }

  updateSlotItem(slotId, partial) {
    let partialProps = typeof partial === "string" ? { item_id: partial } : partial

    const slot = this.getSlot(slotId)
    slot.replaceMember(partialProps)
  }

  updateItemQuantity(slotId, quantity) {
    const slot = this.getSlot(slotId)
    slot.setMemberQuantity(quantity)
  }
}
