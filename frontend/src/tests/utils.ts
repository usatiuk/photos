export function flushPromises(): Promise<unknown> {
    return new Promise(setImmediate);
}
