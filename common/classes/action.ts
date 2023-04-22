import { NOT_FOUND } from '@common/utils/constants';

export class Action<T> {
    private funcs: ((arg: T) => void)[] = [];

    add(func: (arg: T) => void): void {
        this.funcs.push(func);
    }

    remove(func: (arg: T) => void): void {
        const index = this.funcs.indexOf(func);
        if (index !== NOT_FOUND) {
            this.funcs.splice(index, 1);
        }
    }

    clear(): void {
        this.funcs = [];
    }

    invoke(arg: T): void {
        this.funcs.forEach((func) => func(arg));
    }
}
