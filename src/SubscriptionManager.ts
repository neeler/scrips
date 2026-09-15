export type SubscriptionCallback<P = void> = (props: P) => void;

export class SubscriptionManager<P = unknown> {
    private readonly subscriptions: Set<SubscriptionCallback<P>>;

    constructor() {
        this.subscriptions = new Set<SubscriptionCallback<P>>();
    }

    get hasSubscriptions(): boolean {
        return this.subscriptions.size > 0;
    }

    /**
     * Registers `callback` to receive published events.
     *
     * Subscribing the same function more than once registers it once.
     *
     * @returns A function that unsubscribes `callback`. Calling it more than
     * once is harmless.
     */
    subscribe(callback: SubscriptionCallback<P>): () => void {
        this.subscriptions.add(callback);
        return () => {
            this.unsubscribe(callback);
        };
    }

    unsubscribe(callback: SubscriptionCallback<P>): void {
        this.subscriptions.delete(callback);
    }

    unsubscribeAll(): void {
        this.subscriptions.clear();
    }

    /**
     * Synchronously delivers `props` to every subscriber, in subscription order.
     *
     * The subscriber list is snapshotted before delivery, so subscribing or
     * unsubscribing from within a callback takes effect on the next publish.
     *
     * If a callback throws, the remaining callbacks still receive the event.
     * Once delivery is complete the error is rethrown; if more than one
     * callback threw, they are rethrown together as an `AggregateError`.
     */
    publish(props: P): void {
        const errors: unknown[] = [];

        for (const callback of Array.from(this.subscriptions)) {
            try {
                callback(props);
            } catch (error) {
                errors.push(error);
            }
        }

        if (errors.length === 1) {
            throw errors[0];
        }

        if (errors.length > 1) {
            throw new AggregateError(
                errors,
                `${errors.length} subscribers threw during publish`,
            );
        }
    }
}
