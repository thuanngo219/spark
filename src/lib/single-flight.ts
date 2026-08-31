export class SingleFlight {
  private key: string | null = null;
  private promise: Promise<void> | null = null;

  run(key: string, operation: () => Promise<void>): Promise<void> {
    if (this.promise && this.key === key) return this.promise;

    const promise = Promise.resolve().then(operation);
    const tracked = promise.finally(() => {
      if (this.promise === tracked) {
        this.promise = null;
        this.key = null;
      }
    });
    this.key = key;
    this.promise = tracked;
    return tracked;
  }

  isRunning(key?: string) {
    return Boolean(this.promise && (key === undefined || this.key === key));
  }
}
