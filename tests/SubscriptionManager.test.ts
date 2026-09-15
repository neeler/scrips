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

test('keeps delivering to remaining subscribers when one throws', () => {
    const manager = new SubscriptionManager<number>();

    const before = vi.fn();
    const failure = new Error('boom');
    const thrower = vi.fn(() => {
        throw failure;
    });
    const after = vi.fn();

    manager.subscribe(before);
    manager.subscribe(thrower);
    manager.subscribe(after);

    expect(() => manager.publish(1)).toThrow(failure);

    expect(before).toHaveBeenCalledWith(1);
    expect(after).toHaveBeenCalledWith(1);
});

test('rethrows multiple subscriber errors as an AggregateError', () => {
    const manager = new SubscriptionManager<number>();

    const first = new Error('first');
    const second = new Error('second');
    manager.subscribe(() => {
        throw first;
    });
    manager.subscribe(() => {
        throw second;
    });

    let caught: unknown;
    try {
        manager.publish(1);
    } catch (error) {
        caught = error;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    expect((caught as AggregateError).errors).toEqual([first, second]);
});

test('a subscriber added during publish receives only later events', () => {
    const manager = new SubscriptionManager<number>();

    const late = vi.fn();
    manager.subscribe(() => {
        manager.subscribe(late);
    });

    manager.publish(1);
    expect(late).not.toHaveBeenCalled();

    manager.publish(2);
    expect(late).toHaveBeenCalledTimes(1);
    expect(late).toHaveBeenCalledWith(2);
});

test('a subscriber removed during publish still receives the current event', () => {
    const manager = new SubscriptionManager<number>();

    const removed = vi.fn();
    manager.subscribe(() => {
        manager.unsubscribe(removed);
    });
    manager.subscribe(removed);

    manager.publish(1);
    expect(removed).toHaveBeenCalledWith(1);

    manager.publish(2);
    expect(removed).toHaveBeenCalledTimes(1);
});
