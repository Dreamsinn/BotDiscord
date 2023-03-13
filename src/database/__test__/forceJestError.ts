export function forceJestError(expected: any, received: any): Error {
    throw new Error(
        'expect(' +
            '\x1b[31m' +
            'received' +
            '\x1b[37m' +
            ').toBe(' +
            '\x1b[32m' +
            'expected' +
            '\x1b[37m' +
            ')\n\n' +
            'Expected: ' +
            '\x1b[32m' +
            `${expected}` +
            '\n\x1b[37m' +
            'Received: ' +
            '\x1b[31m' +
            `${received}`,
    );
}
