/* The MIT License (MIT)
 *
 * Copyright (c) 2016 Chaabane Jalal

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const ParGroup = require('../src/par-group');

module.exports = {
    testBasicParGroup(test) {
        const promise = ParGroup(
            (t) => t.value * 5,
            (t) => t.value * 6,
            (t) => t.value * 10
        )(5);

        promise.then((results) => {
            test.deepEqual(results, [25, 30, 50]);
            test.done();
        });
    },
    testParGroupWithAsyncFn(test) {
        const promise = ParGroup(
            (t) => {
                return new Promise((resolve) => resolve(t.value * 5));
            },
            (t) => {
                return new Promise((resolve) => {
                    setTimeout(() => resolve(t.value * 600), 25);
                });
            },
            (t) => {
                return new Promise((resolve) => resolve(t.value * 700));
            }
        )(10);

        promise.then((results) => {
            test.deepEqual(results, [50, 6000, 7000]);
            test.done();
        });
    },
    testParGroupShouldHandleError(test) {
        const promise = ParGroup(
            (t) => {
                return new Promise((resolve) => resolve(t.value * 5));
            },
            (t) => {
                return new Promise(() => {
                    throw new Error("OH NO")
                });
            },
            (t) => t.value * 4
        )(10);

        promise.catch((err) => {
            test.equal(err.message, "OH NO");
            test.done();
        });
    },
    testParGroupInParGroup(test) {
        const promise = ParGroup(
            ParGroup(
                (t) => t.value.value * 5,
                (t) => {
                    console.info(t);
                    return new Promise((resolve) => resolve(t.value.value * 5))
                }
            ),
            ParGroup(
                (t) => t.value.value * 6
            ),
            (t) => t.value * 5
        )(5);

        promise.then((results) => {
            test.deepEqual(results, [[25, 25], [30], 25]);
            test.done();
        });
    }
};