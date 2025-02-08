type Callback<P = void> = (props: P) => void;

export class SubscriptionManager<P = unknown> {
    private readonly subscriptions: Set<Callback<P>>;

    constructor() {
        this.subscriptions = new Set<Callback<P>>();
    }

    get hasSubscriptions(): boolean {
        return this.subscriptions.size > 0;
    }

    subscribe(callback: Callback<P>): void {
        this.subscriptions.add(callback);
    }

    unsubscribe(callback: Callback<P>): void {
        this.subscriptions.delete(callback);
    }

    unsubscribeAll(): void {
        this.subscriptions.clear();
    }

    publish(props: P): void {
        this.subscriptions.forEach((callback: Callback<P>) => {
            callback(props);
        });
    }
}
