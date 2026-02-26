type StepFn = (v: unknown) => unknown;
export class Pipeline<T> {
  private steps: StepFn[] = [];
  pipe<U>(fn: (val: T) => U): Pipeline<U> {
