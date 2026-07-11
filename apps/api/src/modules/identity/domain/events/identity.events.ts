export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly referredBy?: string,
  ) {}
}

export class UserProfileUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly changedFields: string[],
  ) {}
}

export class TierUpgradedEvent {
  constructor(
    public readonly userId: string,
    public readonly oldTier: string,
    public readonly newTier: string,
  ) {}
}
