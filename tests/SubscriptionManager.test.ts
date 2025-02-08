import { expect, test, vi } from 'vitest';
import { SubscriptionManager } from '../src';

test('constructs a SubscriptionManager', () => {
    const manager = new SubscriptionManager();
    expect(manager).toBeDefined();
});

test('subscribes and unsubscribes a callback', () => {
    const manager = new SubscriptionManager();

    const callback = () => {};

    manager.subscribe(callback);
    expect(manager.hasSubscriptions).toBe(true);

    manager.unsubscribe(callback);
    expect(manager.hasSubscriptions).toBe(false);
});

test('publishes events to all subscribers', () => {
    const manager = new SubscriptionManager<number>();

    expect(manager.hasSubscriptions).toBe(false);

    const callback1 = vi.fn();
    manager.subscribe(callback1);

    expect(manager.hasSubscriptions).toBe(true);

    const callback2 = vi.fn();
    manager.subscribe(callback2);

    expect(manager.hasSubscriptions).toBe(true);

    const firstValue = 6;

    manager.publish(firstValue);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenLastCalledWith(firstValue);

    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenLastCalledWith(firstValue);

    manager.unsubscribe(callback1);

    expect(manager.hasSubscriptions).toBe(true);

    const secondValue = 7;

    manager.publish(secondValue);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenLastCalledWith(firstValue);

    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenLastCalledWith(secondValue);

    manager.unsubscribe(callback2);

    expect(manager.hasSubscriptions).toBe(false);

    const thirdValue = 8;

    manager.publish(thirdValue);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenLastCalledWith(firstValue);

    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenLastCalledWith(secondValue);
});

test('can unsubscribe all at once', () => {
    const manager = new SubscriptionManager<number>();

    const callback1 = vi.fn();
    manager.subscribe(callback1);

    const callback2 = vi.fn();
    manager.subscribe(callback2);

    manager.unsubscribeAll();

    const value = 6;

    manager.publish(value);

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
});
