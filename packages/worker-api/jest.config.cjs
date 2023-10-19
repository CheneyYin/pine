/** @type {import('ts-jest').JestConfigWithTsJest} */

const sharedConfig = require('../../jest.config.cjs');

module.exports = {
    ...sharedConfig,
    preset: 'ts-jest',
    testEnvironment: 'node',
};
